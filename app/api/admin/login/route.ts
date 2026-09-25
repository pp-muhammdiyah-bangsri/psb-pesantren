import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

function checkRateLimit(ip: string): { allowed: boolean; retryAfterMs?: number } {
  const now = Date.now();
  const record = loginAttempts.get(ip);
  if (!record || now > record.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true };
  }
  if (record.count >= MAX_ATTEMPTS) {
    return { allowed: false, retryAfterMs: record.resetAt - now };
  }
  record.count += 1;
  return { allowed: true };
}

function resetRateLimit(ip: string) {
  loginAttempts.delete(ip);
}

export async function POST(req: NextRequest) {
  if (!process.env.ADMIN_JWT_SECRET) {
    console.error("ADMIN_JWT_SECRET tidak dikonfigurasi!");
    return NextResponse.json({ ok: false, error: "Konfigurasi server tidak lengkap." }, { status: 500 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim()
    || req.headers.get("x-real-ip")
    || "unknown";
  const rateCheck = checkRateLimit(ip);

  if (!rateCheck.allowed) {
    const retryMinutes = Math.ceil((rateCheck.retryAfterMs || WINDOW_MS) / 60000);
    return NextResponse.json(
      { ok: false, error: `Terlalu banyak percobaan login. Coba lagi dalam ${retryMinutes} menit.` },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rateCheck.retryAfterMs || WINDOW_MS) / 1000)) } }
    );
  }

  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ ok: false, error: "Username dan password wajib diisi." }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data, error } = await admin
      .from("admin_psb")
      .select("*")
      .eq("username", username)
      .single();

    if (error || !data) {
      return NextResponse.json({ ok: false, error: "Username tidak ditemukan." }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, data.password_hash);
    if (!valid) {
      return NextResponse.json({ ok: false, error: "Password salah." }, { status: 401 });
    }

    resetRateLimit(ip);

    const token = jwt.sign(
      { id: data.id, username: data.username, nama: data.nama },
      process.env.ADMIN_JWT_SECRET,
      { expiresIn: "8h" }
    );
    return NextResponse.json({ ok: true, token, nama: data.nama });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
