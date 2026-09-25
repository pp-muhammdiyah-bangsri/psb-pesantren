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

export async function PUT(req: NextRequest) {
  try {
    verifyToken(req);
    const body = await req.json();
    const admin = createAdminClient();
    const updates = Object.entries(body).map(([key, value]) => ({ key, value: String(value) }));
    for (const { key, value } of updates) {
      await admin.from("pengaturan_psb").upsert({ key, value });
    }
    revalidatePath("/");
    revalidatePath("/galeri");
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    const status = msg.includes("Unauthorized") ? 401 : 500;
    return NextResponse.json({ ok: false, error: msg }, { status });
  }
}
