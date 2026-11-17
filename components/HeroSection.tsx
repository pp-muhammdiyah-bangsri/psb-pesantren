"use client";
import { useState } from "react";
import { Calendar, Users, BookOpen, Sparkles } from "lucide-react";
import { toDirectImageUrl, parseMediaUrl } from "@/lib/mediaUtils";
import { buildPsbTheme } from "@/lib/themeUtils";

interface HeroGaleriItem {
  id: number;
  judul?: string | null;
  foto_url: string;
}

interface HeroProps {
  config: Record<string, string>;
  gelombang: Array<Record<string, unknown>>;
  galeri?: HeroGaleriItem[];
}

export default function HeroSection({ config, gelombang, galeri = [] }: HeroProps) {
  const [leftImgError, setLeftImgError] = useState(false);
  const [rightImgError, setRightImgError] = useState(false);
  const [frontSide, setFrontSide] = useState<"right" | "left">("right");

  const theme = buildPsbTheme(config);
  const nama = config.nama_pesantren || "Pondok Pesantren";
  const tagline = config.tagline || "Mencetak Generasi Rabbani yang Unggul dan Berakhlak Mulia";
  const videoMedia = config.video_profil_url ? parseMediaUrl(config.video_profil_url) : null;

  // Resolve 2 foto berbeda untuk kartu kiri & kartu kanan berbentuk V
  const galeriPhotos = galeri
    .map((item) => ({
      url: parseMediaUrl(item.foto_url).thumbnailUrl,
      alt: item.judul || `Kegiatan ${nama}`,
    }))
    .filter((p) => Boolean(p.url));

  const primaryUrl = config.hero_bg_url ? toDirectImageUrl(config.hero_bg_url) : "";
  const secondaryConfigUrl = config.hero_bg_2_url ? toDirectImageUrl(config.hero_bg_2_url) : "";

  const rightCardPhoto = !rightImgError
    ? primaryUrl || galeriPhotos[0]?.url || videoMedia?.thumbnailUrl || null
    : null;

  const altFromGaleri = galeriPhotos.find((g) => g.url !== rightCardPhoto);
  const leftCardPhoto = !leftImgError
    ? (secondaryConfigUrl && secondaryConfigUrl !== rightCardPhoto ? secondaryConfigUrl : null) ||
      altFromGaleri?.url ||
      (videoMedia?.thumbnailUrl && videoMedia.thumbnailUrl !== rightCardPhoto
        ? videoMedia.thumbnailUrl
        : null)
    : null;

  const programTags = config.program_pendidikan
    ? config.program_pendidikan.split(",").map((p) => p.trim()).filter(Boolean)
    : [];

  const today = new Date().toISOString().split("T")[0];
  const activeGelombang = gelombang.find(
    (g) =>
      g.tanggal_buka &&
      g.tanggal_tutup &&
      String(g.tanggal_buka) <= today &&
      today <= String(g.tanggal_tutup)
  );
  const nextGelombang = !activeGelombang
    ? gelombang.find((g) => g.tanggal_buka && String(g.tanggal_buka) > today)
    : null;

  const stats = [
    { icon: Calendar, label: "Tahun Berdiri", value: config.tahun_berdiri || "1985" },
    { icon: Users, label: "Santri Aktif", value: config.jumlah_santri || "1000+" },
    {
      icon: BookOpen,
      label: "Program Studi",
      value: programTags.length ? `${programTags.length} Fokus` : "Terpadu",
    },
  ];

  const isRightFront = frontSide === "right";

  return (
    <section
      className="relative overflow-hidden text-white min-h-[calc(100svh-4rem)] sm:min-h-[calc(100svh-4.5rem)] flex flex-col justify-center"
      style={{
        background: `linear-gradient(155deg, ${theme.primaryDark} 0%, ${theme.primary} 55%, ${theme.primaryDark} 100%)`,
      }}
    >
      {/* Pola geometris SVG halus */}
      <svg
        aria-hidden="true"
        className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="psb-lattice" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M40 0L80 40L40 80L0 40Z" fill="none" stroke="currentColor" strokeWidth="1" />
            <circle cx="40" cy="40" r="14" fill="none" stroke="currentColor" strokeWidth="0.75" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#psb-lattice)" />
      </svg>

      {/* Garis aksen tipis di top bar */}
      <div
        aria-hidden="true"
        className="absolute top-0 inset-x-0 h-0.5"
        style={{ background: `linear-gradient(90deg, transparent, ${theme.accent}, transparent)` }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-x-10 lg:gap-y-5 items-start">
          {/* 1. Status + Headline + Tagline */}
          <div className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left space-y-3 sm:space-y-4 lg:pt-4">
            {activeGelombang ? (
              <div
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-wide"
                style={{ color: theme.accentLight }}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" aria-hidden="true" />
                <span>Pendaftaran Dibuka — {String(activeGelombang.nama)}</span>
              </div>
            ) : nextGelombang ? (
              <div
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-wide"
                style={{ color: theme.accentLight }}
              >
                <Calendar size={14} aria-hidden="true" />
                <span>Gelombang Berikutnya: {String(nextGelombang.nama)}</span>
              </div>
            ) : (
              <div
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-wide"
                style={{ color: theme.accentLight }}
              >
                <Sparkles size={14} aria-hidden="true" />
                <span>{config.hero_badge || "Penerimaan Santri Baru"}</span>
              </div>
            )}

            <h1 className="font-display text-[1.9rem] sm:text-5xl lg:text-[2.9rem] xl:text-[3.25rem] font-bold leading-[1.12] tracking-tight text-white">
              {nama}
            </h1>
            <p className="text-sm sm:text-lg lg:text-xl text-white/85 max-w-2xl leading-relaxed">
              {tagline}
            </p>
          </div>

          {/* 2. Dua Kartu Foto Berbentuk Huruf V (Seperti Kartu Poker Dipegang Tangan) */}
          <div className="lg:col-span-6 lg:row-span-2 lg:col-start-7 lg:row-start-1 lg:self-start lg:-mt-2 flex justify-center">
            <div
              className="relative w-[305px] sm:w-[375px] lg:w-[490px] xl:w-[560px] h-[220px] sm:h-[275px] lg:h-[370px] xl:h-[420px]"
              aria-label={`Galeri foto utama ${nama}`}
            >
              {/* Kartu Kiri (Miring ke kiri membentuk sisi kiri huruf V) */}
              <button
                type="button"
                onClick={() => setFrontSide("left")}
                aria-label="Tampilkan kartu foto pertama ke depan"
                className={`group absolute left-1/2 bottom-2 w-[166px] sm:w-[208px] lg:w-[270px] xl:w-[305px] aspect-[3/3.45] origin-bottom rounded-2xl p-1.5 sm:p-2 bg-white/95 border shadow-2xl cursor-pointer text-left -translate-x-[68%] -rotate-[10deg] motion-safe:transition-all motion-safe:duration-300 motion-safe:hover:-rotate-[12deg] motion-safe:hover:-translate-y-1.5 ${
                  !isRightFront ? "z-20 scale-[1.03]" : "z-10 opacity-95"
                }`}
                style={{
                  borderColor: !isRightFront ? theme.accent : "rgba(255,255,255,0.75)",
                }}
              >
                <div className="relative w-full h-full rounded-xl overflow-hidden bg-stone-900">
                  {leftCardPhoto ? (
                    <img
                      src={leftCardPhoto}
                      alt={altFromGaleri?.alt || `Aktivitas santri ${nama}`}
                      decoding="async"
                      referrerPolicy="no-referrer"
                      onError={() => setLeftImgError(true)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-full p-4 flex flex-col justify-between text-white"
                      style={{
                        background: `linear-gradient(155deg, ${theme.primaryDark}, ${theme.primary})`,
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className="text-[10px] font-bold uppercase tracking-widest"
                          style={{ color: theme.accentLight }}
                        >
                          PSB Online
                        </span>
                        <BookOpen size={15} style={{ color: theme.accentLight }} aria-hidden="true" />
                      </div>
                      <div>
                        <p className="font-display text-base sm:text-lg font-bold leading-snug">
                          Generasi Qur&apos;ani &amp; Berakhlak Mulia
                        </p>
                        {activeGelombang && (
                          <p className="text-[11px] text-white/75 mt-1.5 tabular-nums">
                            {String(activeGelombang.nama)}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  {config.hero_foto_caption_2 && (
                    <>
                      <div
                        aria-hidden="true"
                        className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/60 to-transparent"
                      />
                      <span className="absolute bottom-2.5 left-3 right-3 text-[11px] font-semibold text-white/95 line-clamp-1">
                        {config.hero_foto_caption_2}
                      </span>
                    </>
                  )}
                </div>
              </button>

              {/* Kartu Kanan (Miring ke kanan membentuk sisi kanan huruf V) */}
              <button
                type="button"
                onClick={() => setFrontSide("right")}
                aria-label="Tampilkan kartu foto utama ke depan"
                className={`group absolute left-1/2 bottom-2 w-[166px] sm:w-[208px] lg:w-[270px] xl:w-[305px] aspect-[3/3.45] origin-bottom rounded-2xl p-1.5 sm:p-2 bg-white/95 border shadow-2xl cursor-pointer text-left -translate-x-[32%] rotate-[10deg] motion-safe:transition-all motion-safe:duration-300 motion-safe:hover:rotate-[12deg] motion-safe:hover:-translate-y-1.5 ${
                  isRightFront ? "z-20 scale-[1.03]" : "z-10 opacity-95"
                }`}
                style={{
                  borderColor: isRightFront ? theme.accent : "rgba(255,255,255,0.75)",
                }}
              >
                <div className="relative w-full h-full rounded-xl overflow-hidden bg-stone-900">
                  {rightCardPhoto ? (
                    <img
                      src={rightCardPhoto}
                      alt={`Suasana lingkungan ${nama}`}
                      fetchPriority="high"
                      decoding="sync"
                      referrerPolicy="no-referrer"
                      onError={() => setRightImgError(true)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-full p-4 flex flex-col justify-between text-white"
                      style={{
                        background: `linear-gradient(155deg, ${theme.primary}, ${theme.primaryDark})`,
                      }}
                    >
                      <Sparkles size={18} style={{ color: theme.accentLight }} aria-hidden="true" />
                      <div>
                        <p className="font-display text-base sm:text-lg font-bold leading-snug">
                          {nama}
                        </p>
                        <p className="text-[11px] text-white/75 mt-1">
                          Penerimaan Santri Baru
                        </p>
                      </div>
                    </div>
                  )}
                  <div
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/75 via-black/30 to-transparent"
                  />
                  <div className="absolute bottom-2 left-2 right-2 flex justify-center sm:justify-start">
                    <span className="inline-block max-w-full px-2.5 py-1 rounded-xl sm:rounded-full bg-black/55 border border-white/20 text-[10px] sm:text-xs font-semibold leading-snug text-center sm:text-left text-white line-clamp-2">
                      {config.hero_foto_caption || "Suasana Pondok Pesantren"}
                    </span>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* 3. Unified Glass Stats Strip */}
          <div className="lg:col-span-6">
            <div className="grid grid-cols-3 divide-x divide-white/15 rounded-xl bg-white/[0.06] border border-white/15 py-2 sm:py-2.5 max-w-[420px] mx-auto lg:mx-0">
              {stats.map(({ icon: Icon, label, value }) => (
                <div key={label} className="px-2.5 sm:px-4 text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start gap-1.5 mb-0.5">
                    <Icon size={12} style={{ color: theme.accentLight }} className="shrink-0" aria-hidden="true" />
                    <span className="font-bold text-xs sm:text-sm text-white tabular-nums truncate">
                      {value}
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-white/75 leading-tight">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
