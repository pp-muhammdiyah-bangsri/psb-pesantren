import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

export async function GET() {
  try {
    const admin = createAdminClient();
    const today = new Date().toISOString().split("T")[0];
    const { data, error } = await admin
      .from("gelombang_psb")
      .select("*")
      .eq("is_aktif", true)
      .order("tanggal_buka", { ascending: true });
    if (error) throw error;
    return NextResponse.json({ ok: true, data, today });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ ok: false, error: msg });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const admin = createAdminClient();
    const { data, error } = await admin.from("gelombang_psb").insert(body).select().single();
    if (error) throw error;
    return NextResponse.json({ ok: true, data });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ ok: false, error: msg });
  }
}
