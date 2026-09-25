import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import jwt from "jsonwebtoken";

function verifyToken(req: NextRequest) {
  if (!process.env.ADMIN_JWT_SECRET) throw new Error("ADMIN_JWT_SECRET is not set.");
  const auth = req.headers.get("Authorization");
  if (!auth) throw new Error("Unauthorized: missing token.");
  jwt.verify(auth.replace("Bearer ", ""), process.env.ADMIN_JWT_SECRET);
}

// GET tetap publik — dibutuhkan form pendaftaran untuk menampilkan daftar gelombang
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

// POST hanya untuk admin yang terautentikasi
export async function POST(req: NextRequest) {
  try {
    verifyToken(req);
    const body = await req.json();
    const admin = createAdminClient();
    const { data, error } = await admin.from("gelombang_psb").insert(body).select().single();
    if (error) throw error;
    return NextResponse.json({ ok: true, data });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    const status = msg.includes("Unauthorized") ? 401 : 500;
    return NextResponse.json({ ok: false, error: msg }, { status });
  }
}
