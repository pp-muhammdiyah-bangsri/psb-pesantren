import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import jwt from "jsonwebtoken";

const SECRET = process.env.ADMIN_JWT_SECRET || "psb-simple-pesantren-secret-2024";
function verifyToken(req: NextRequest) {
  const auth = req.headers.get("Authorization");
  if (!auth) throw new Error("Unauthorized");
  jwt.verify(auth.replace("Bearer ", ""), SECRET);
}

export async function POST(req: NextRequest) {
  try {
    verifyToken(req);
    const body = await req.json();
    const admin = createAdminClient();
    const { data, error } = await admin.from("galeri").insert(body).select().single();
    if (error) throw error;
    return NextResponse.json({ ok: true, data });
  } catch (e: unknown) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Error" });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    verifyToken(req);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const admin = createAdminClient();
    await admin.from("galeri").delete().eq("id", Number(id));
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Error" });
  }
}
