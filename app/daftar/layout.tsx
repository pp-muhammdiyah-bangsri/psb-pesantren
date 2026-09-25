import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Formulir Pendaftaran Santri Baru",
  description:
    "Pendaftaran Online Santri Baru (MBS & Beasiswa LKSA). Pilihan Jenjang SMP, SMA, SMK. Isi formulir pendaftaran dan unggah berkas secara mudah.",
  openGraph: {
    title: "Formulir Pendaftaran Santri Baru Online",
    description:
      "Daftar sekarang sebagai calon santri baru (SMP, SMA, SMK - Jalur Reguler MBS & Beasiswa LKSA).",
    url: "https://psb-ppmuhbangsri.vercel.app/daftar",
  },
};

export default function DaftarLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
