import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

// Tipe file yang diizinkan di-upload
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "application/pdf",
];
const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "pdf"];
const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB per file untuk menghemat penyimpanan

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const folder = (form.get("folder") as string) || "misc";

    if (!file) {
      return NextResponse.json({ ok: false, error: "File tidak ditemukan." }, { status: 400 });
    }

    // Validasi ukuran file (maksimal 1MB)
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({
        ok: false,
        error: `Ukuran file terlalu besar (${(file.size / 1024 / 1024).toFixed(2)}MB). Maksimal 1MB per file. Silakan kompres foto/dokumen terlebih dahulu.`,
      }, { status: 400 });
    }

    // Validasi MIME type di backend
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({
        ok: false,
        error: "Tipe file tidak diizinkan. Hanya JPG, PNG, WebP, dan PDF yang diterima.",
      }, { status: 400 });
    }

    // Validasi ekstensi file
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json({ ok: false, error: "Ekstensi file tidak valid." }, { status: 400 });
    }

    // Batasi folder yang diizinkan
    const ALLOWED_FOLDERS = ["pengajar", "foto", "kk", "akta", "sktm", "ijazah", "galeri", "logo", "misc"];
    const safeFolder = ALLOWED_FOLDERS.includes(folder) ? folder : "misc";

    // File publik (pengajar, galeri, logo) diunggah ke bucket 'psb-galeri' yang bersifat public: true
    const isPublicBucket = ["pengajar", "galeri", "logo"].includes(safeFolder);
    const targetBucket = isPublicBucket ? "psb-galeri" : "psb-documents";

    const filename = `${safeFolder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const bytes = await file.arrayBuffer();

    const admin = createAdminClient();

    // Pastikan bucket ada
    try {
      await admin.storage.createBucket(targetBucket, { public: isPublicBucket });
    } catch (_) {
      // Abaikan jika bucket sudah ada
    }

    let { error } = await admin.storage
      .from(targetBucket)
      .upload(filename, Buffer.from(bytes), { contentType: file.type, upsert: true });

    // Jika bucket target bermasalah, coba bucket fallback
    let usedBucket = targetBucket;
    if (error && targetBucket === "psb-galeri") {
      const fallback = await admin.storage
        .from("psb-documents")
        .upload(filename, Buffer.from(bytes), { contentType: file.type, upsert: true });
      if (!fallback.error) {
        error = null;
        usedBucket = "psb-documents";
      }
    }

    if (error) throw error;

    const { data } = admin.storage.from(usedBucket).getPublicUrl(filename);
    return NextResponse.json({ ok: true, url: data.publicUrl, filename });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Upload gagal.";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
