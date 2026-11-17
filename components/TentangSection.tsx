"use client";
import { useState } from "react";
import { Play } from "lucide-react";
import { parseMediaUrl } from "@/lib/mediaUtils";
import { buildPsbTheme } from "@/lib/themeUtils";

interface TentangSectionProps {
  config: Record<string, string>;
}

export default function TentangSection({ config }: TentangSectionProps) {
  const [playVideo, setPlayVideo] = useState(false);

  const theme = buildPsbTheme(config);
  const nama = config.nama_pesantren || "Pondok Pesantren";
  const deskripsi = config.deskripsi || "";
  const videoMedia = config.video_profil_url ? parseMediaUrl(config.video_profil_url) : null;

  if (!deskripsi && !videoMedia?.embedUrl) {
    return null;
  }

  return (
    <section id="tentang" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#faf8f4]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Kolom Kiri: Editorial Heading & Deskripsi */}
          <div
            className={`${
              videoMedia?.embedUrl ? "lg:col-span-6" : "lg:col-span-10 lg:col-start-2"
            } space-y-6`}
          >
            <div className="space-y-3 text-center lg:text-left">
              <p
                className="text-xs font-bold uppercase tracking-[0.18em]"
                style={{ color: theme.accentTextOnLight }}
              >
                {config.tentang_badge || "Profil & Visi Pesantren"}
              </p>
              <h2
                className="font-display text-3xl sm:text-4xl font-bold leading-tight"
                style={{ color: theme.primary }}
              >
                {config.tentang_judul || `Tentang ${nama}`}
              </h2>
            </div>

            {deskripsi && (
              <p
                className="text-stone-700 leading-relaxed text-base sm:text-lg text-center lg:text-left lg:pl-4 lg:border-l-2"
                style={{ borderColor: theme.accent }}
              >
                {deskripsi}
              </p>
            )}
          </div>

          {/* Kolom Kanan: Lite YouTube Facade (iframe baru dimuat saat diklik) */}
          {videoMedia && videoMedia.embedUrl && (
            <div className="lg:col-span-6">
              <div className="rounded-3xl overflow-hidden border border-stone-200 bg-stone-950 shadow-lg aspect-video relative">
                {playVideo || videoMedia.type !== "youtube" ? (
                  <iframe
                    src={
                      playVideo
                        ? videoMedia.embedUrl
                        : videoMedia.embedUrl.replace("autoplay=1", "autoplay=0")
                    }
                    title={`Video Profil ${nama}`}
                    loading="lazy"
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setPlayVideo(true)}
                    aria-label={`Putar Video Profil Resmi ${nama}`}
                    className="group relative w-full h-full block text-left cursor-pointer"
                  >
                    <img
                      src={videoMedia.thumbnailUrl}
                      alt={`Cuplikan Video Profil ${nama}`}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/10"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span
                        className="w-16 h-16 rounded-full flex items-center justify-center shadow-xl transition-transform duration-200 group-hover:scale-110"
                        style={{ backgroundColor: theme.accent, color: theme.onAccent }}
                      >
                        <Play size={24} className="fill-current translate-x-[2px]" aria-hidden="true" />
                      </span>
                    </div>
                    <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between text-white">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-white/80">
                          {config.tentang_video_label || "Video Profil Resmi"}
                        </p>
                        <p className="text-sm sm:text-base font-bold">{nama}</p>
                      </div>
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/15 border border-white/25">
                        Putar Video
                      </span>
                    </div>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
