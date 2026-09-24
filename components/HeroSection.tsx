"use client";
import Link from "next/link";
import { Calendar, Users, BookOpen, ArrowRight, ChevronDown } from "lucide-react";

interface HeroProps {
  config: Record<string, string>;
  gelombang: Array<Record<string, unknown>>;
}

const ARABIC_PATTERN = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cpath d='M60 10 L110 85 L10 85 Z' fill='none' stroke='%23c8a84b' stroke-width='0.5' opacity='0.15'/%3E%3Ccircle cx='60' cy='60' r='40' fill='none' stroke='%23c8a84b' stroke-width='0.5' opacity='0.1'/%3E%3C/svg%3E`;

export default function HeroSection({ config, gelombang }: HeroProps) {
  const primary = config.warna_primer || "#0f4c1e";
  const accent = config.warna_aksen || "#c8a84b";
  const nama = config.nama_pesantren || "Pesantren Anda";
  const tagline = config.tagline || "Mencetak Generasi Rabbani yang Unggul";

  const today = new Date().toISOString().split("T")[0];
  const activeGelombang = gelombang.find(
    (g: Record<string, unknown>) => g.tanggal_buka && g.tanggal_tutup &&
      String(g.tanggal_buka) <= today && today <= String(g.tanggal_tutup)
  );
  const nextGelombang = !activeGelombang
    ? gelombang.find((g: Record<string, unknown>) => g.tanggal_buka && String(g.tanggal_buka) > today)
    : null;

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16"
      style={{
        background: `linear-gradient(160deg, ${primary} 0%, #0a3315 40%, #061f0d 100%)`,
      }}
    >
      {/* Islamic geometric background pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("${ARABIC_PATTERN}")`,
          backgroundSize: "120px 120px",
        }}
      />

      {/* Radial glow */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: accent }}
      />

      {/* Gold arc top border */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Badge */}
        {activeGelombang ? (
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-6 animate-pulse"
            style={{ background: `${accent}20`, border: `1px solid ${accent}60`, color: accent }}
          >
            <span className="w-2 h-2 rounded-full bg-green-400 animate-ping" />
            Pendaftaran Sedang Dibuka — {String(activeGelombang.nama)}
          </div>
        ) : nextGelombang ? (
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-6"
            style={{ background: `${accent}15`, border: `1px solid ${accent}40`, color: accent }}
          >
            <Calendar size={14} />
            Gelombang Berikutnya: {String(nextGelombang.nama)}
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-6"
            style={{ background: `${accent}15`, border: `1px solid ${accent}40`, color: accent }}>
            <BookOpen size={14} />
            Penerimaan Santri Baru
          </div>
        )}

        {/* Pesantren Name */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight mb-4">
          {nama}
        </h1>

        {/* Tagline */}
        <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
          {tagline}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link
            href="/daftar"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-base transition-all hover:scale-105 hover:shadow-2xl"
            style={{
              background: `linear-gradient(135deg, ${accent}, #f0d080)`,
              color: primary,
              boxShadow: `0 6px 30px ${accent}50`,
            }}
          >
            Daftar Sekarang <ArrowRight size={18} />
          </Link>
          <a
            href="#gelombang"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-base border-2 text-white transition-all hover:bg-white/10"
            style={{ borderColor: `${accent}60` }}
          >
            Info Pendaftaran
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
          {[
            { icon: Calendar, label: "Tahun Berdiri", value: config.tahun_berdiri || "1985" },
            { icon: Users, label: "Santri", value: config.jumlah_santri || "1000+" },
            { icon: BookOpen, label: "Program", value: "Unggulan" },
          ].map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="flex flex-col items-center p-3 rounded-xl"
              style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${accent}25` }}
            >
              <Icon size={20} style={{ color: accent }} className="mb-1" />
              <span className="text-white font-bold text-lg leading-tight">{value}</span>
              <span className="text-white/50 text-xs">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <a
        href="#gelombang"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40 hover:text-white/70 transition-colors animate-bounce"
      >
        <ChevronDown size={28} />
      </a>
    </section>
  );
}
