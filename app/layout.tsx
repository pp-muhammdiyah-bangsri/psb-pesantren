import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const font = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
});

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://psb-ppmuhbangsri.vercel.app";

  try {
    const { createAdminClient } = await import("@/lib/supabase");
    const { toDirectImageUrl } = await import("@/lib/mediaUtils");
    const admin = createAdminClient();
    const { data } = await admin
      .from("pengaturan_psb")
      .select("key, value")
      .in("key", ["nama_pesantren", "tagline", "logo_url", "hero_bg_url", "alamat", "no_wa_admin"]);
    const cfg = Object.fromEntries((data ?? []).map((r: { key: string; value: string }) => [r.key, r.value]));

    const nama = cfg.nama_pesantren || "Pondok Pesantren Muhammadiyah Bangsri";
    const tagline = cfg.tagline || "Mencetak Generasi Rabbani yang Unggul dan Berakhlak Mulia";
    const logoUrl = cfg.logo_url ? toDirectImageUrl(cfg.logo_url) : "/logo.jpg";
    const bannerUrl = cfg.hero_bg_url ? toDirectImageUrl(cfg.hero_bg_url) : logoUrl;

    const titleText = `PSB Online | ${nama}`;
    const descriptionText = `${tagline}. Pendaftaran Santri Baru Online - Pilihan Jenjang SMP, SMA, SMK (Jalur Reguler MBS & Beasiswa LKSA).`;

    return {
      metadataBase: new URL(siteUrl),
      title: {
        default: titleText,
        template: `%s | ${nama}`,
      },
      description: descriptionText,
      keywords: [
        "PSB Pesantren",
        "Penerimaan Santri Baru",
        nama,
        "PP Muhammadiyah Bangsri",
        "MBS Bangsri",
        "SMP Muhammadiyah",
        "SMA Muhammadiyah",
        "SMK Muhammadiyah",
        "Pesantren Jepara",
        "Beasiswa Santri LKSA",
        "Pendaftaran Santri Online",
      ],
      authors: [{ name: nama }],
      creator: nama,
      publisher: nama,
      formatDetection: {
        telephone: true,
        date: true,
        address: true,
        email: true,
      },
      openGraph: {
        type: "website",
        locale: "id_ID",
        url: siteUrl,
        siteName: `PSB ${nama}`,
        title: `Penerimaan Santri Baru (PSB Online) - ${nama}`,
        description: descriptionText,
        images: [
          {
            url: bannerUrl,
            width: 1200,
            height: 630,
            alt: `PSB Online ${nama}`,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `Penerimaan Santri Baru (PSB Online) - ${nama}`,
        description: descriptionText,
        images: [bannerUrl],
      },
      icons: {
        icon: [
          { url: logoUrl },
          { url: "/favicon.ico" }
        ],
        shortcut: [logoUrl],
        apple: [logoUrl],
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
        },
      },
    };
  } catch {
    return {
      metadataBase: new URL(siteUrl),
      title: "PSB Online | Penerimaan Santri Baru",
      description: "Pendaftaran Santri Baru Online Pondok Pesantren",
      openGraph: {
        type: "website",
        locale: "id_ID",
        url: siteUrl,
        title: "PSB Online | Penerimaan Santri Baru",
        description: "Pendaftaran Santri Baru Online Pondok Pesantren",
      },
      twitter: {
        card: "summary_large_image",
        title: "PSB Online | Penerimaan Santri Baru",
        description: "Pendaftaran Santri Baru Online Pondok Pesantren",
      },
      icons: {
        icon: "/favicon.ico",
        shortcut: "/favicon.ico",
        apple: "/favicon.ico",
      },
    };
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={font.variable}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
      </head>
      <body className={`${font.variable} antialiased`}>{children}</body>
    </html>
  );
}
