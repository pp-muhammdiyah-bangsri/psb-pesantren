import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import jwt from "jsonwebtoken";

const SECRET = process.env.ADMIN_JWT_SECRET || "psb-simple-pesantren-secret-2024";

function verifyToken(req: Request) {
  const auth = req.headers.get("Authorization");
  if (!auth) throw new Error("Unauthorized");
  const token = auth.replace("Bearer ", "");
  return jwt.verify(token, SECRET);
}

export async function GET(req: Request) {
  try {
    verifyToken(req);
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const gelombang = searchParams.get("gelombang");
    const admin = createAdminClient();

    let query = admin.from("pendaftar").select("*, gelombang_psb(nama)").order("created_at", { ascending: false });
    if (status && status !== "semua") query = query.eq("status", status);
    if (gelombang) query = query.eq("gelombang_id", gelombang);

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ ok: true, data });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ ok: false, error: msg }, { status: 401 });
  }
}

export async function PUT(req: Request) {
  try {
    verifyToken(req);
    const { id, status, catatan_admin } = await req.json();
    const admin = createAdminClient();
    const { error } = await admin.from("pendaftar").update({ status, catatan_admin }).eq("id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ ok: false, error: msg });
  }
}
