import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const font = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
});

export async function generateMetadata(): Promise<Metadata> {
  try {
    const { createAdminClient } = await import("@/lib/supabase");
    const admin = createAdminClient();
    const { data } = await admin
      .from("pengaturan_psb")
      .select("key, value")
      .in("key", ["nama_pesantren", "tagline"]);
    const cfg = Object.fromEntries((data ?? []).map((r: { key: string; value: string }) => [r.key, r.value]));
    return {
      title: `PSB ${cfg.nama_pesantren || "Pesantren"} | Pendaftaran Santri Baru`,
      description: cfg.tagline || "Pendaftaran Santri Baru Online",
    };
  } catch {
    return {
      title: "PSB Pesantren | Pendaftaran Santri Baru",
      description: "Pendaftaran Santri Baru Online",
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
