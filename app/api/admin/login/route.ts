import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const SECRET = process.env.ADMIN_JWT_SECRET || "psb-simple-pesantren-secret-2024";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("admin_psb")
      .select("*")
      .eq("username", username)
      .single();
    if (error || !data) return NextResponse.json({ ok: false, error: "Username tidak ditemukan." });

    const valid = await bcrypt.compare(password, data.password_hash);
    if (!valid) return NextResponse.json({ ok: false, error: "Password salah." });

    const token = jwt.sign({ id: data.id, username: data.username, nama: data.nama }, SECRET, { expiresIn: "8h" });
    return NextResponse.json({ ok: true, token, nama: data.nama });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ ok: false, error: msg });
  }
}
