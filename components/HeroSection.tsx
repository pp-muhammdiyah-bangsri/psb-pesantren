"use client";
import { useState, useEffect } from "react";
import { Calendar, Users, BookOpen, Sparkles, Pause, Play } from "lucide-react";
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
  const [activeJargon, setActiveJargon] = useState(0);
  const [jargonPaused, setJargonPaused] = useState(false);

  const theme = buildPsbTheme(config);
  const nama = config.nama_pesantren || "Pondok Pesantren";
  const tagline = config.tagline || "Pinter Ngaji, Akhlak Terpuji, Berprestasi";
  const jargonItems = tagline
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const isMultiJargon = jargonItems.length > 1;

  useEffect(() => {
    if (!isMultiJargon || jargonPaused) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const timer = window.setInterval(() => {
      setActiveJargon((prev) => (prev + 1) % jargonItems.length);
    }, 2200);
    return () => window.clearInterval(timer);
  }, [isMultiJargon, jargonPaused, jargonItems.length]);
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

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-24 sm:pt-5 sm:pb-24 lg:py-8 xl:py-10 flex-1 flex flex-col justify-between lg:flex-none">
        <div className="flex-1 flex flex-col justify-between gap-2.5 lg:grid lg:grid-cols-12 lg:grid-rows-[1fr_auto] lg:gap-x-10 lg:gap-y-6 lg:min-h-[465px] xl:min-h-[530px]">
          {/* 1. Status + Headline + Animated Jargon */}
          <div className="lg:col-span-6 lg:self-start flex flex-col items-center lg:items-start text-center lg:text-left space-y-2.5 sm:space-y-3.5 lg:pt-1">
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

            <h1 className="font-display text-[1.9rem] sm:text-5xl lg:text-[3rem] xl:text-[3.35rem] font-bold leading-[1.1] tracking-tight text-white">
              {nama}
            </h1>

            {/* Jargon Pondok Beranimasi */}
            {isMultiJargon ? (
              <div
                className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-0.5"
                aria-label={`Jargon pesantren: ${tagline}`}
              >
                {jargonItems.map((item, idx) => {
                  const isHighlighted = activeJargon % jargonItems.length === idx;
                  return (
                    <button
                      key={`${item}-${idx}`}
                      type="button"
                      onClick={() => setActiveJargon(idx)}
                      style={{
                        animationDelay: `${idx * 130}ms`,
                        borderColor: isHighlighted ? theme.accent : "rgba(255,255,255,0.22)",
                        backgroundColor: isHighlighted
                          ? "rgba(255,255,255,0.16)"
                          : "rgba(255,255,255,0.06)",
                      }}
                      className={`psb-jargon-item inline-flex items-center gap-1.5 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full border text-xs sm:text-sm lg:text-[15px] font-semibold cursor-pointer motion-safe:transition-[transform,opacity,background-color,border-color] motion-safe:duration-500 ${
                        isHighlighted
                          ? "text-white scale-[1.03] -translate-y-0.5 shadow-md"
                          : "text-white/80 hover:text-white"
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className="w-1.5 h-1.5 rounded-full shrink-0 motion-safe:transition-transform motion-safe:duration-500"
                        style={{
                          backgroundColor: theme.accentLight,
                          transform: isHighlighted ? "scale(1.35)" : "scale(1)",
                        }}
                      />
                      <span>{item}</span>
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setJargonPaused((p) => !p)}
                  aria-label={jargonPaused ? "Putar animasi jargon" : "Jeda animasi jargon"}
                  className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-white/15 bg-white/[0.06] text-white/75 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
                >
                  {jargonPaused ? (
                    <Play size={11} className="fill-current translate-x-[0.5px]" aria-hidden="true" />
                  ) : (
                    <Pause size={11} aria-hidden="true" />
                  )}
                </button>
              </div>
            ) : (
              <p className="psb-jargon-item text-sm sm:text-lg lg:text-xl text-white/90 max-w-2xl leading-relaxed">
                {tagline}
              </p>
            )}
          </div>

          {/* 2. Dua Kartu Foto Berbentuk Huruf V (Seperti Kartu Poker Dipegang Tangan) */}
          <div className="lg:col-span-6 lg:row-span-2 lg:col-start-7 lg:row-start-1 lg:self-center flex justify-center items-center my-auto lg:my-0">
            <div
              className="relative w-[350px] sm:w-[420px] lg:w-[530px] xl:w-[610px] h-[300px] sm:h-[345px] lg:h-[455px] xl:h-[520px]"
              aria-label={`Galeri foto utama ${nama}`}
            >
              {/* Kartu Kiri (Miring ke kiri membentuk sisi kiri huruf V) */}
              <button
                type="button"
                onClick={() => setFrontSide("left")}
                aria-label="Tampilkan kartu foto pertama ke depan"
                className={`group absolute left-1/2 bottom-2 w-[212px] sm:w-[244px] lg:w-[300px] xl:w-[340px] aspect-[3/4] lg:aspect-[3/3.8] xl:aspect-[3/3.85] origin-bottom rounded-2xl p-1.5 sm:p-2 bg-white/95 border shadow-2xl cursor-pointer text-left -translate-x-[61%] -rotate-[8deg] lg:-translate-x-[63%] lg:-rotate-[9deg] motion-safe:transition-all motion-safe:duration-300 motion-safe:hover:-rotate-[11deg] motion-safe:hover:-translate-y-1.5 ${
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
                className={`group absolute left-1/2 bottom-2 w-[212px] sm:w-[244px] lg:w-[300px] xl:w-[340px] aspect-[3/4] lg:aspect-[3/3.8] xl:aspect-[3/3.85] origin-bottom rounded-2xl p-1.5 sm:p-2 bg-white/95 border shadow-2xl cursor-pointer text-left -translate-x-[39%] rotate-[8deg] lg:-translate-x-[37%] lg:rotate-[9deg] motion-safe:transition-all motion-safe:duration-300 motion-safe:hover:rotate-[11deg] motion-safe:hover:-translate-y-1.5 ${
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
          <div className="w-full lg:col-span-6 lg:self-end lg:pb-1 xl:pb-2">
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
