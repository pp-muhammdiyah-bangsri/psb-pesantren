import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase";

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("program_unggulan")
      .select("*")
      .order("urutan");
    if (error) throw error;
    return NextResponse.json({ ok: true, data: data ?? [] });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ ok: false, error: msg });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("program_unggulan")
      .insert({
        nama: body.nama,
        deskripsi: body.deskripsi || "",
        icon: body.icon || "⭐",
        warna: body.warna || "#0f4c1e",
        urutan: body.urutan || 99,
        is_aktif: body.is_aktif !== false,
      })
      .select()
      .single();
    if (error) throw error;
    revalidatePath("/");
    return NextResponse.json({ ok: true, data });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ ok: false, error: msg });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const admin = createAdminClient();
    const { id, ...fields } = body;
    const { data, error } = await admin
      .from("program_unggulan")
      .update(fields)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    revalidatePath("/");
    return NextResponse.json({ ok: true, data });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ ok: false, error: msg });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    const admin = createAdminClient();
    const { error } = await admin.from("program_unggulan").delete().eq("id", id);
    if (error) throw error;
    revalidatePath("/");
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ ok: false, error: msg });
  }
}