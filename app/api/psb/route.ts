import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

function generateNomorRegistrasi(id: number): string {
  const year = new Date().getFullYear();
  return `PSB-${year}-${String(id).padStart(4, "0")}`;
}

// [S-3] Validasi format di server
function validatePhone(phone: string): boolean {
  return /^(\+62|62|0)[0-9]{8,13}$/.test(phone.replace(/[\s\-]/g, ""));
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateYear(year: string): boolean {
  const y = parseInt(year);
  return !isNaN(y) && y >= 1990 && y <= new Date().getFullYear() + 1;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const admin = createAdminClient();

    const { nama_lengkap, no_hp_wali, gelombang_id, email_wali, tahun_lulus, jenis_kelamin } = body;

    // [S-3] Validasi field wajib
    if (!nama_lengkap || typeof nama_lengkap !== "string" || nama_lengkap.trim().length < 2) {
      return NextResponse.json({ ok: false, error: "Nama lengkap tidak valid (minimal 2 karakter)." }, { status: 400 });
    }
    if (!no_hp_wali || !validatePhone(no_hp_wali)) {
      return NextResponse.json({ ok: false, error: "Nomor HP wali tidak valid. Gunakan format: 08xxxxxxxxxx." }, { status: 400 });
    }

    // Validasi field opsional jika diisi
    if (email_wali && !validateEmail(email_wali)) {
      return NextResponse.json({ ok: false, error: "Format email wali tidak valid." }, { status: 400 });
    }
    if (tahun_lulus && !validateYear(String(tahun_lulus))) {
      return NextResponse.json({ ok: false, error: "Tahun lulus tidak valid." }, { status: 400 });
    }
    if (jenis_kelamin && !["L", "P"].includes(jenis_kelamin)) {
      return NextResponse.json({ ok: false, error: "Jenis kelamin tidak valid." }, { status: 400 });
    }

    // Sanitasi nama (hapus karakter berbahaya)
    const sanitizedBody = {
      ...body,
      nama_lengkap: nama_lengkap.trim(),
      nama_panggilan: body.nama_panggilan ? String(body.nama_panggilan).trim() : undefined,
      status: "menunggu", // Paksa status awal
    };

    // Insert pendaftar
    const { data, error } = await admin
      .from("pendaftar")
      .insert(sanitizedBody)
      .select()
      .single();
    if (error) throw error;

    // Update nomor registrasi
    const nomorReg = generateNomorRegistrasi(data.id);
    await admin
      .from("pendaftar")
      .update({ nomor_registrasi: nomorReg })
      .eq("id", data.id);

    return NextResponse.json({
      ok: true,
      data: { ...data, nomor_registrasi: nomorReg },
      nomor_registrasi: nomorReg,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Terjadi kesalahan.";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const nomor = searchParams.get("nomor");
  if (!nomor || nomor.trim().length < 5) {
    return NextResponse.json({ ok: false, error: "Nomor registrasi tidak valid." }, { status: 400 });
  }

  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("pendaftar")
      .select("nomor_registrasi, nama_lengkap, status, created_at, gelombang_id")
      .eq("nomor_registrasi", nomor.trim())
      .single();
    if (error || !data) {
      return NextResponse.json({ ok: false, error: "Data tidak ditemukan." }, { status: 404 });
    }
    return NextResponse.json({ ok: true, data });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
