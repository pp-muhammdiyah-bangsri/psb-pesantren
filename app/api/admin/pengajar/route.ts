import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase";
import jwt from "jsonwebtoken";

if (!process.env.ADMIN_JWT_SECRET) throw new Error("ADMIN_JWT_SECRET is not set.");
const SECRET = process.env.ADMIN_JWT_SECRET;
function verifyToken(req: NextRequest) {
  const auth = req.headers.get("Authorization");
  if (!auth) throw new Error("Unauthorized");
  jwt.verify(auth.replace("Bearer ", ""), SECRET);
}

export async function GET(req: NextRequest) {
  try {
    verifyToken(req);
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("pengajar")
      .select("*")
      .order("urutan", { ascending: true });
    if (error) throw error;
    return NextResponse.json({ ok: true, data });
  } catch (e: unknown) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Error" });
  }
}

export async function POST(req: NextRequest) {
  try {
    verifyToken(req);
    const body = await req.json();
    const admin = createAdminClient();
    let res = await admin.from("pengajar").insert(body).select().single();
    if (res.error && res.error.message && res.error.message.includes("column")) {
      // Fallback jika database belum ada kolom gelar_depan/gelar_belakang
      const { gelar_depan, gelar_belakang, ...fallbackBody } = body;
      res = await admin.from("pengajar").insert(fallbackBody).select().single();
    }
    if (res.error) throw res.error;
    revalidatePath("/");
    return NextResponse.json({ ok: true, data: res.data });
  } catch (e: unknown) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Error" });
  }
}

export async function PUT(req: NextRequest) {
  try {
    verifyToken(req);
    const body = await req.json();
    const { id, ...updates } = body;
    const admin = createAdminClient();
    let res = await admin.from("pengajar").update(updates).eq("id", id).select().single();
    if (res.error && res.error.message && res.error.message.includes("column")) {
      // Fallback jika database belum ada kolom gelar_depan/gelar_belakang
      const { gelar_depan, gelar_belakang, ...fallbackUpdates } = updates;
      res = await admin.from("pengajar").update(fallbackUpdates).eq("id", id).select().single();
    }
    if (res.error) throw res.error;
    revalidatePath("/");
    return NextResponse.json({ ok: true, data: res.data });
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
    await admin.from("pengajar").delete().eq("id", Number(id));
    revalidatePath("/");
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Error" });
  }
}
