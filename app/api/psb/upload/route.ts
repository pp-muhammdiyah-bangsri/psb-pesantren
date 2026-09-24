import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const folder = (form.get("folder") as string) || "misc";
    if (!file) return NextResponse.json({ ok: false, error: "File tidak ditemukan." });
    if (file.size > 5 * 1024 * 1024) return NextResponse.json({ ok: false, error: "File terlalu besar (maks 5MB)." });

    const ext = file.name.split(".").pop();
    const filename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const bytes = await file.arrayBuffer();

    const admin = createAdminClient();
    const { error } = await admin.storage
      .from("psb-documents")
      .upload(filename, Buffer.from(bytes), { contentType: file.type, upsert: false });
    if (error) throw error;

    const { data } = admin.storage.from("psb-documents").getPublicUrl(filename);
    return NextResponse.json({ ok: true, url: data.publicUrl, filename });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Upload gagal.";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
