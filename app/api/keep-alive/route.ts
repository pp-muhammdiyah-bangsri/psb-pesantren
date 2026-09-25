import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();
  try {
    const admin = createAdminClient();
    // Query ringan ke tabel pengaturan_psb agar Supabase mencatat interaksi database aktif
    const { data, error } = await admin
      .from("pengaturan_psb")
      .select("key")
      .limit(1);

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          error: error.message,
          timestamp: new Date().toISOString(),
          duration_ms: Date.now() - startTime,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Supabase database is active and queried successfully",
      records_checked: data?.length ?? 0,
      duration_ms: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      {
        ok: false,
        error: message,
        timestamp: new Date().toISOString(),
        duration_ms: Date.now() - startTime,
      },
      { status: 500 }
    );
  }
}