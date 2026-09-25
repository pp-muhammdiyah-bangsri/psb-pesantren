"use client";
import { useState } from "react";
import Link from "next/link";
import { Calendar, Users, BookOpen, ArrowRight, ChevronDown, Play, X } from "lucide-react";
import { toDirectImageUrl, parseMediaUrl } from "@/lib/mediaUtils";

interface HeroProps {
  config: Record<string, string>;
  gelombang: Array<Record<string, unknown>>;
}

const ARABIC_PATTERN = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cpath d='M60 10 L110 85 L10 85 Z' fill='none' stroke='%23c8a84b' stroke-width='0.5' opacity='0.15'/%3E%3Ccircle cx='60' cy='60' r='40' fill='none' stroke='%23c8a84b' stroke-width='0.5' opacity='0.1'/%3E%3C/svg%3E`;

export default function HeroSection({ config, gelombang }: HeroProps) {
  const [videoOpen, setVideoOpen] = useState(false);

  const primary = config.warna_primer || "#0f4c1e";
  const accent = config.warna_aksen || "#c8a84b";
  const nama = config.nama_pesantren || "Pesantren Anda";
  const tagline = config.tagline || "Mencetak Generasi Rabbani yang Unggul";

  // Parse hero background image dari Google Drive atau direct URL
  const heroBg = config.hero_bg_url ? toDirectImageUrl(config.hero_bg_url) : null;

  // Parse video profil URL jika ada
  const videoMedia = config.video_profil_url ? parseMediaUrl(config.video_profil_url) : null;

  // Parse program pendidikan menjadi tags/badges
  const programTags = config.program_pendidikan
    ? config.program_pendidikan.split(",").map((p) => p.trim()).filter(Boolean)
    : [];

  const today = new Date().toISOString().split("T")[0];
  const activeGelombang = gelombang.find(
    (g: Record<string, unknown>) =>
      g.tanggal_buka &&
      g.tanggal_tutup &&
      String(g.tanggal_buka) <= today &&
      today <= String(g.tanggal_tutup)
  );
  const nextGelombang = !activeGelombang
    ? gelombang.find(
        (g: Record<string, unknown>) => g.tanggal_buka && String(g.tanggal_buka) > today
      )
    : null;

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-24 pb-16"
      style={{
        background: `linear-gradient(160deg, ${primary} 0%, #0a3315 40%, #061f0d 100%)`,
      }}
    >
      {/* Hero Banner Background Image */}
      {heroBg && (
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-700 pointer-events-none"
          style={{
            backgroundImage: `url("${heroBg}")`,
          }}
        />
      )}

      {/* Dark overlay gradient agar teks kontras dan terbaca jelas */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: heroBg
            ? `linear-gradient(180deg, ${primary}ea 0%, ${primary}db 45%, #061f0df0 100%)`
            : `linear-gradient(160deg, ${primary} 0%, #0a3315 40%, #061f0d 100%)`,
        }}
      />

      {/* Islamic geometric background pattern */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `url("${ARABIC_PATTERN}")`,
          backgroundSize: "120px 120px",
        }}
      />

      {/* Radial glow */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{ background: accent }}
      />

      {/* Gold arc top border */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Badge Gelombang */}
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
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-6"
            style={{ background: `${accent}15`, border: `1px solid ${accent}40`, color: accent }}
          >
            <BookOpen size={14} />
            {config.hero_badge || "Penerimaan Santri Baru"}
          </div>
        )}

        {/* Pesantren Name */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight mb-4 drop-shadow-md">
          {nama}
        </h1>

        {/* Tagline */}
        <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto mb-6 leading-relaxed">
          {tagline}
        </p>

        {/* Program Pendidikan Badges */}
        {programTags.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8 max-w-2xl mx-auto">
            {programTags.map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md transition-all hover:scale-105"
                style={{
                  background: "rgba(255, 255, 255, 0.12)",
                  border: `1px solid ${accent}60`,
                  color: "#ffffff",
                }}
              >
                <span style={{ color: accent }}>✦</span>
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* CTA Buttons */}
        <div className="flex flex-wrap gap-4 justify-center items-center mb-14">
          <Link
            href="/daftar"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-base transition-all hover:scale-105 hover:shadow-2xl"
            style={{
              background: `linear-gradient(135deg, ${accent}, #f0d080)`,
              color: primary,
              boxShadow: `0 6px 30px ${accent}50`,
            }}
          >
            {config.hero_cta_daftar || "Daftar Sekarang"} <ArrowRight size={18} />
          </Link>

          {videoMedia && videoMedia.embedUrl ? (
            <button
              onClick={() => setVideoOpen(true)}
              className="inline-flex items-center gap-2.5 px-7 py-4 rounded-full font-semibold text-base text-white transition-all hover:bg-white/15 hover:scale-105"
              style={{
                background: "rgba(255, 255, 255, 0.12)",
                border: `1.5px solid ${accent}70`,
              }}
            >
              <div
                className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center text-white"
                style={{ boxShadow: "0 0 12px rgba(239, 68, 68, 0.6)" }}
              >
                <Play size={12} className="fill-white translate-x-0.5" />
              </div>
              <span>{config.hero_cta_video || "Tonton Video Profil"}</span>
            </button>
          ) : (
            <a
              href="#gelombang"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-base border-2 text-white transition-all hover:bg-white/10"
              style={{ borderColor: `${accent}60` }}
            >
              {config.hero_cta_info || "Info Pendaftaran"}
            </a>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-lg mx-auto">
          {[
            { icon: Calendar, label: "Tahun Berdiri", value: config.tahun_berdiri || "1985" },
            { icon: Users, label: "Santri Aktif", value: config.jumlah_santri || "1000+" },
            {
              icon: BookOpen,
              label: "Program Pendidikan",
              value: programTags.length ? `${programTags.length} Program` : "Unggulan",
            },
          ].map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="flex flex-col items-center p-3 sm:p-4 rounded-xl backdrop-blur-sm"
              style={{ background: "rgba(255,255,255,0.07)", border: `1px solid ${accent}30` }}
            >
              <Icon size={20} style={{ color: accent }} className="mb-1" />
              <span className="text-white font-bold text-base sm:text-lg leading-tight">{value}</span>
              <span className="text-white/60 text-[11px] sm:text-xs mt-0.5">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Video Modal Popup */}
      {videoOpen && videoMedia && videoMedia.embedUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setVideoOpen(false)}
        >
          <div
            className="relative max-w-4xl w-full aspect-video rounded-2xl overflow-hidden shadow-2xl bg-black border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setVideoOpen(false)}
              className="absolute top-4 right-4 text-white/80 hover:text-white z-20 p-2 rounded-full bg-black/60 hover:bg-black/80 transition-colors"
              aria-label="Tutup Video"
            >
              <X size={24} />
            </button>
            <iframe
              src={videoMedia.embedUrl}
              title="Video Profil Pesantren"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* Scroll indicator */}
      <a
        href="#tentang"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/40 hover:text-white/80 transition-colors animate-bounce"
        aria-label="Scroll ke profil"
      >
        <ChevronDown size={28} />
      </a>
    </section>
  );
}
