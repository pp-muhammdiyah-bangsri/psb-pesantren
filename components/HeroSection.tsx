"use client";
import { useState, useEffect, useRef, type PointerEvent as ReactPointerEvent } from "react";
import { Calendar, Users, BookOpen, Sparkles } from "lucide-react";
import { toDirectImageUrl, parseMediaUrl } from "@/lib/mediaUtils";
import { buildPsbTheme } from "@/lib/themeUtils";

const MOBILE_ZOOM_DURATION_MS = 5000;

function getHeroCardClasses(
  side: "left" | "right",
  zoomedSide: "left" | "right" | null,
  isFront: boolean
): string {
  const base =
    "group absolute left-1/2 bottom-1.5 w-[216px] sm:w-[248px] lg:w-[280px] xl:w-[310px] aspect-[3/4.25] lg:aspect-[3/3.72] xl:aspect-[3/3.78] origin-[50%_62%] rounded-2xl p-[3px] sm:p-1 bg-white/95 border cursor-pointer text-left transition-all duration-300 ease-out";

  if (zoomedSide === side) {
    return `${base} z-30 -translate-x-1/2 rotate-0 scale-[1.12] sm:scale-[1.14] lg:scale-[1.13] xl:scale-[1.14] shadow-[0_24px_60px_rgba(0,0,0,0.48)]`;
  }

  const restingPose =
    side === "left"
      ? "-translate-x-[61%] -rotate-[8deg] lg:-translate-x-[63%] lg:-rotate-[9deg]"
      : "-translate-x-[39%] rotate-[8deg] lg:-translate-x-[37%] lg:rotate-[9deg]";

  if (zoomedSide !== null) {
    return `${base} ${restingPose} z-10 scale-95 opacity-75 shadow-xl`;
  }

  return `${base} ${restingPose} shadow-2xl ${isFront ? "z-20 scale-[1.03]" : "z-10 opacity-95"}`;
}

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

function HeroCardCaption({ text }: { text: string }) {
  return (
    <>
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/75 via-black/30 to-transparent"
      />
      <div className="absolute bottom-2 left-2.5 right-2.5 flex justify-start">
        <span className="inline-block max-w-full px-2.5 py-1 rounded-full bg-black/55 border border-white/20 text-[10px] sm:text-xs font-semibold leading-snug text-left text-white line-clamp-1">
          {text}
        </span>
      </div>
    </>
  );
}

export default function HeroSection({ config, gelombang, galeri = [] }: HeroProps) {
  const [leftImgError, setLeftImgError] = useState(false);
  const [rightImgError, setRightImgError] = useState(false);
  const [frontSide, setFrontSide] = useState<"right" | "left">("right");
  const [hoveredSide, setHoveredSide] = useState<"left" | "right" | null>(null);
  const [timedZoomSide, setTimedZoomSide] = useState<"left" | "right" | null>(null);
  const typedTextRef = useRef<HTMLSpanElement>(null);
  const lastPointerTypeRef = useRef<string>("mouse");
  const hoverEnterRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const zoomTimerRef = useRef<number | null>(null);
  const leftCardRef = useRef<HTMLButtonElement>(null);
  const rightCardRef = useRef<HTMLButtonElement>(null);

  const zoomedSide = hoveredSide ?? timedZoomSide;

  useEffect(() => {
    return () => {
      if (zoomTimerRef.current !== null) {
        window.clearTimeout(zoomTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!hoveredSide) return;
    const cardEl = hoveredSide === "left" ? leftCardRef.current : rightCardRef.current;
    if (!cardEl) return;

    const handleWindowPointerMove = (ev: globalThis.PointerEvent) => {
      if (ev.pointerType !== "mouse") return;
      const enter = hoverEnterRef.current;
      if (enter && performance.now() - enter.time < 380) return;

      const rect = cardEl.getBoundingClientRect();
      if (
        ev.clientX < rect.left ||
        ev.clientX > rect.right ||
        ev.clientY < rect.top ||
        ev.clientY > rect.bottom
      ) {
        setHoveredSide(null);
      }
    };

    window.addEventListener("pointermove", handleWindowPointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", handleWindowPointerMove);
  }, [hoveredSide]);

  const clearTimedZoom = () => {
    if (zoomTimerRef.current !== null) {
      window.clearTimeout(zoomTimerRef.current);
      zoomTimerRef.current = null;
    }
  };

  const handleCardPointerDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    lastPointerTypeRef.current = e.pointerType || "mouse";
  };

  const handleCardPointerEnter = (
    side: "left" | "right",
    e: ReactPointerEvent<HTMLButtonElement>
  ) => {
    if (e.pointerType !== "mouse") return;
    clearTimedZoom();
    setTimedZoomSide(null);
    hoverEnterRef.current = {
      x: e.clientX,
      y: e.clientY,
      time: performance.now(),
    };
    setHoveredSide(side);
  };

  const handleCardPointerLeave = (
    side: "left" | "right",
    e: ReactPointerEvent<HTMLButtonElement>
  ) => {
    if (e.pointerType !== "mouse") return;
    const enter = hoverEnterRef.current;
    if (enter) {
      const dt = performance.now() - enter.time;
      const dist = Math.hypot(e.clientX - enter.x, e.clientY - enter.y);
      // Cegah flick jika kartu bergeser menjauhi kursor diam selama animasi pelurusan 300ms
      if (dt < 380 && dist < 10) return;
    }
    setHoveredSide((prev) => (prev === side ? null : prev));
  };

  const handleCardClick = (side: "left" | "right") => {
    setFrontSide(side);

    const isHoverCapableMouse =
      lastPointerTypeRef.current === "mouse" &&
      typeof window !== "undefined" &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    if (isHoverCapableMouse) return;

    clearTimedZoom();
    setHoveredSide(null);
    if (timedZoomSide === side) {
      setTimedZoomSide(null);
      return;
    }

    setTimedZoomSide(side);
    zoomTimerRef.current = window.setTimeout(() => {
      setTimedZoomSide(null);
      zoomTimerRef.current = null;
    }, MOBILE_ZOOM_DURATION_MS);
  };

  const theme = buildPsbTheme(config);
  const nama = config.nama_pesantren || "Pondok Pesantren";
  const tagline = config.tagline || "Pinter Ngaji, Akhlak Terpuji, Berprestasi";

  useEffect(() => {
    const el = typedTextRef.current;
    if (!el || tagline.length === 0) return;

    const typeMsPerChar = 88;
    const holdFullMs = 2500;
    const eraseMsPerChar = 38;
    const holdEmptyMs = 450;

    const typeDuration = tagline.length * typeMsPerChar;
    const eraseDuration = tagline.length * eraseMsPerChar;
    const cycleMs = typeDuration + holdFullMs + eraseDuration + holdEmptyMs;

    let rafId = 0;
    let startTs: number | null = null;
    let lastCount = -1;

    const tick = (now: number) => {
      if (startTs === null) startTs = now;
      const elapsed = (now - startTs) % cycleMs;

      let nextCount = 0;
      if (elapsed < typeDuration) {
        nextCount = Math.floor(elapsed / typeMsPerChar);
      } else if (elapsed < typeDuration + holdFullMs) {
        nextCount = tagline.length;
      } else if (elapsed < typeDuration + holdFullMs + eraseDuration) {
        const eraseElapsed = elapsed - typeDuration - holdFullMs;
        nextCount = Math.max(0, tagline.length - Math.floor(eraseElapsed / eraseMsPerChar));
      } else {
        nextCount = 0;
      }

      if (nextCount !== lastCount) {
        lastCount = nextCount;
        el.textContent = tagline.slice(0, nextCount);
      }

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [tagline]);
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

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2.5 pb-[86px] sm:pt-5 sm:pb-24 lg:pt-4 lg:pb-10 xl:pt-5 xl:pb-12 flex-1 flex flex-col justify-between lg:flex-none">
        <div className="flex-1 flex flex-col justify-between gap-2 lg:grid lg:grid-cols-12 lg:gap-x-10 lg:gap-y-11 xl:gap-y-14 lg:content-center lg:items-center">
          {/* 1. Status + Headline + Typewriter Tagline */}
          <div className="lg:col-span-6 lg:col-start-1 lg:row-start-1 lg:self-end flex flex-col items-center lg:items-start text-center lg:text-left space-y-2 sm:space-y-3 lg:space-y-3.5">
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

            {/* Animasi Ketik 60 FPS Loop Halus Tanpa Re-render (CLS = 0) */}
            <p className="relative text-sm sm:text-base lg:text-lg xl:text-xl font-medium text-white/95 max-w-2xl leading-relaxed">
              <span className="sr-only">{tagline}</span>
              <span aria-hidden="true" className="invisible select-none">
                {tagline}
                <span className="inline-block w-[3px] ml-0.5" />
              </span>
              <span aria-hidden="true" className="absolute inset-0">
                <span ref={typedTextRef} />
                <span
                  className="psb-jargon-caret inline-block w-[2px] h-[1.05em] align-[-0.14em] ml-0.5 rounded-full"
                  style={{ backgroundColor: theme.accentLight }}
                />
              </span>
            </p>
          </div>

          {/* 2. Dua Kartu Foto Berbentuk Huruf V (Seperti Kartu Poker Dipegang Tangan) */}
          <div className="lg:col-span-6 lg:row-span-2 lg:col-start-7 lg:row-start-1 lg:self-center xl:pr-4 flex justify-center items-center my-auto lg:my-0">
            <div
              className="relative w-[350px] sm:w-[420px] lg:w-[490px] xl:w-[555px] h-[324px] sm:h-[365px] lg:h-[362px] xl:h-[404px]"
              aria-label={`Galeri foto utama ${nama}`}
            >
              {/* Kartu Kiri (Miring ke kiri membentuk sisi kiri huruf V) */}
              <button
                ref={leftCardRef}
                type="button"
                onPointerDown={handleCardPointerDown}
                onPointerEnter={(e) => handleCardPointerEnter("left", e)}
                onPointerLeave={(e) => handleCardPointerLeave("left", e)}
                onClick={() => handleCardClick("left")}
                aria-label="Tampilkan kartu foto pertama ke depan"
                className={getHeroCardClasses("left", zoomedSide, !isRightFront)}
                style={{
                  borderColor:
                    zoomedSide === "left" || (zoomedSide === null && !isRightFront)
                      ? theme.accent
                      : "rgba(255,255,255,0.75)",
                }}
              >
                <div className="relative w-full h-full rounded-[13px] overflow-hidden bg-stone-900">
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
                    <HeroCardCaption text={config.hero_foto_caption_2} />
                  )}
                </div>
              </button>

              {/* Kartu Kanan (Miring ke kanan membentuk sisi kanan huruf V) */}
              <button
                ref={rightCardRef}
                type="button"
                onPointerDown={handleCardPointerDown}
                onPointerEnter={(e) => handleCardPointerEnter("right", e)}
                onPointerLeave={(e) => handleCardPointerLeave("right", e)}
                onClick={() => handleCardClick("right")}
                aria-label="Tampilkan kartu foto utama ke depan"
                className={getHeroCardClasses("right", zoomedSide, isRightFront)}
                style={{
                  borderColor:
                    zoomedSide === "right" || (zoomedSide === null && isRightFront)
                      ? theme.accent
                      : "rgba(255,255,255,0.75)",
                }}
              >
                <div className="relative w-full h-full rounded-[13px] overflow-hidden bg-stone-900">
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
                  <HeroCardCaption text={config.hero_foto_caption || "Suasana Pondok Pesantren"} />
                </div>
              </button>
            </div>
          </div>

          {/* 3. Unified Glass Stats Strip */}
          <div className="w-full lg:col-span-6 lg:col-start-1 lg:row-start-2 lg:self-start">
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
