import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

function generateNomorRegistrasi(id: number): string {
  const year = new Date().getFullYear();
  return `PSB-${year}-${String(id).padStart(4, "0")}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const admin = createAdminClient();

    const { nama_lengkap, no_hp_wali, gelombang_id } = body;
    if (!nama_lengkap || !no_hp_wali) {
      return NextResponse.json({ ok: false, error: "Nama dan no HP wali wajib diisi." });
    }

    // Insert pendaftar
    const { data, error } = await admin
      .from("pendaftar")
      .insert({ ...body, status: "menunggu" })
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

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const nomor = searchParams.get("nomor");
  if (!nomor) return NextResponse.json({ ok: false, error: "Nomor registrasi diperlukan." });

  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("pendaftar")
      .select("nomor_registrasi, nama_lengkap, status, created_at, gelombang_id")
      .eq("nomor_registrasi", nomor)
      .single();
    if (error || !data) return NextResponse.json({ ok: false, error: "Data tidak ditemukan." });
    return NextResponse.json({ ok: true, data });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ ok: false, error: msg });
  }
}
