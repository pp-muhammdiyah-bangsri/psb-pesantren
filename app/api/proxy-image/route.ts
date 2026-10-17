import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const imageUrl = searchParams.get("url");

    if (!imageUrl) {
      return new NextResponse("Parameter URL gambar wajib diisi", { status: 400 });
    }

    // Validasi format URL
    let parsed: URL;
    try {
      parsed = new URL(imageUrl);
    } catch {
      return new NextResponse("Format URL tidak valid", { status: 400 });
    }

    if (!["http:", "https:"].includes(parsed.protocol)) {
      return new NextResponse("Protokol harus http atau https", { status: 400 });
    }

    // Ambil gambar dari server asal
    const upstreamRes = await fetch(imageUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!upstreamRes.ok) {
      return new NextResponse(`Gagal mengambil gambar dari sumber: ${upstreamRes.statusText}`, {
        status: upstreamRes.status,
      });
    }

    const contentType = upstreamRes.headers.get("content-type") || "image/jpeg";
    const arrayBuffer = await upstreamRes.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      headers: {
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Terjadi kesalahan saat memproses proxy gambar";
    return new NextResponse(msg, { status: 500 });
  }
}
