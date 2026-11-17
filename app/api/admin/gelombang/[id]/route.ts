import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase";
import jwt from "jsonwebtoken";

if (!process.env.ADMIN_JWT_SECRET) throw new Error("ADMIN_JWT_SECRET is not set.");
const SECRET = process.env.ADMIN_JWT_SECRET;

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = req.headers.get("Authorization");
    if (!auth) throw new Error("Unauthorized");
    jwt.verify(auth.replace("Bearer ", ""), SECRET);
    const body = await req.json();
    const { id } = await params;
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("gelombang_psb")
      .update(body)
      .eq("id", Number(id))
      .select()
      .single();
    if (error) throw error;
    revalidatePath("/");
    return NextResponse.json({ ok: true, data });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ ok: false, error: msg });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = req.headers.get("Authorization");
    if (!auth) throw new Error("Unauthorized");
    jwt.verify(auth.replace("Bearer ", ""), SECRET);
    const { id } = await params;
    const admin = createAdminClient();
    const { error } = await admin.from("gelombang_psb").delete().eq("id", Number(id));
    if (error) throw error;
    revalidatePath("/");
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ ok: false, error: msg });
  }
}