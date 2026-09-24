import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase";

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from("pengaturan_psb").select("key, value");
    if (error) throw error;
    const cfg = Object.fromEntries(data.map((r: { key: string; value: string }) => [r.key, r.value]));
    return NextResponse.json({ ok: true, data: cfg });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ ok: false, error: msg });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const admin = createAdminClient();
    const updates = Object.entries(body).map(([key, value]) => ({ key, value: String(value) }));
    for (const { key, value } of updates) {
      await admin.from("pengaturan_psb").upsert({ key, value });
    }
    // Invalidate halaman utama agar perubahan langsung tampil
    revalidatePath("/");
    revalidatePath("/galeri");
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ ok: false, error: msg });
  }
}