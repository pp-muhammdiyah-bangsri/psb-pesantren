import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase";
import jwt from "jsonwebtoken";

function verifyToken(req: NextRequest) {
  if (!process.env.ADMIN_JWT_SECRET) throw new Error("ADMIN_JWT_SECRET is not set.");
  const auth = req.headers.get("Authorization");
  if (!auth) throw new Error("Unauthorized: missing token.");
  jwt.verify(auth.replace("Bearer ", ""), process.env.ADMIN_JWT_SECRET);
}

// GET tetap publik — digunakan landing page
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

export async function POST(req: NextRequest) {
  try {
    verifyToken(req);
    const body = await req.json();
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("program_unggulan")
      .insert({
        nama: body.nama,
        deskripsi: body.deskripsi || "",
        icon: body.icon || "?",
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
    const status = msg.includes("Unauthorized") ? 401 : 500;
    return NextResponse.json({ ok: false, error: msg }, { status });
  }
}

export async function PUT(req: NextRequest) {
  try {
    verifyToken(req);
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
    const status = msg.includes("Unauthorized") ? 401 : 500;
    return NextResponse.json({ ok: false, error: msg }, { status });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    verifyToken(req);
    const { id } = await req.json();
    const admin = createAdminClient();
    const { error } = await admin.from("program_unggulan").delete().eq("id", id);
    if (error) throw error;
    revalidatePath("/");
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    const status = msg.includes("Unauthorized") ? 401 : 500;
    return NextResponse.json({ ok: false, error: msg }, { status });
  }
}
