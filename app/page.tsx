import { createAdminClient } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import TentangSection from "@/components/TentangSection";
import ProgramSection from "@/components/ProgramSection";
import GelombangSection from "@/components/GelombangSection";
import GaleriSection from "@/components/GaleriSection";
import WhatsAppButton from "@/components/WhatsAppButton";
import Footer from "@/components/Footer";

// Selalu fetch data terbaru dari Supabase - tidak pakai cache
export const revalidate = 0;
export const dynamic = "force-dynamic";

async function getConfig() {
  try {
    const admin = createAdminClient();
    const { data } = await admin.from("pengaturan_psb").select("key, value");
    return Object.fromEntries((data ?? []).map((r: { key: string; value: string }) => [r.key, r.value]));
  } catch {
    return {
      nama_pesantren: "Pesantren Anda",
      tagline: "Mencetak Generasi Rabbani yang Unggul dan Berakhlak Mulia",
      warna_primer: "#0f4c1e",
      warna_aksen: "#c8a84b",
      no_wa_admin: "6281234567890",
      tahun_berdiri: "1985",
      jumlah_santri: "1000+",
      program_pendidikan: "Tahfidz, Madrasah, Kitab Kuning",
    };
  }
}

async function getPrograms() {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("program_unggulan")
      .select("*")
      .order("urutan");
    return data ?? [];
  } catch {
    return [];
  }
}

async function getGelombang() {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("gelombang_psb")
      .select("*")
      .eq("is_aktif", true)
      .order("tanggal_buka");
    return data ?? [];
  } catch {
    return [];
  }
}

async function getGaleri() {
  try {
    const admin = createAdminClient();
    const { data } = await admin.from("galeri").select("*").order("urutan").limit(9);
    return data ?? [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [config, programs, gelombang, galeri] = await Promise.all([
    getConfig(), getPrograms(), getGelombang(), getGaleri()
  ]);

  return (
    <main>
      <Navbar config={config} />
      <HeroSection config={config} gelombang={gelombang} />
      <TentangSection config={config} />
      <ProgramSection programs={programs} config={config} />
      <GelombangSection gelombang={gelombang} config={config} />
      <GaleriSection galeri={galeri} config={config} />
      <WhatsAppButton noWa={config.no_wa_admin} />
      <Footer config={config} />
    </main>
  );
}