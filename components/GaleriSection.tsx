"use client";
import { useState, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { parseMediaUrl } from "@/lib/mediaUtils";

interface GaleriItem {
  id: number;
  judul: string | null;
  foto_url: string;
  deskripsi: string | null;
}

interface GaleriSectionProps {
  galeri: GaleriItem[];
  config: Record<string, string>;
}

export default function GaleriSection({ galeri, config }: GaleriSectionProps) {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const primary = config.warna_primer || "#0f4c1e";
  const accent = config.warna_aksen || "#c8a84b";

  const close = useCallback(() => setLightbox(null), []);
  const prev = useCallback(
    () => setLightbox((i) => (i !== null ? (i - 1 + galeri.length) % galeri.length : null)),
    [galeri.length]
  );
  const next = useCallback(
    () => setLightbox((i) => (i !== null ? (i + 1) % galeri.length : null)),
    [galeri.length]
  );

  if (galeri.length === 0) return null;

  const currentMedia = lightbox !== null ? parseMediaUrl(galeri[lightbox].foto_url) : null;

  return (
    <section id="galeri" className="py-20 px-4" style={{ background: "white" }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: accent }}>
            {config.galeri_badge || "Galeri"}
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-3" style={{ color: primary }}>
            {config.galeri_judul || "Kehidupan di Pesantren"}
          </h2>
          {config.galeri_deskripsi && (
            <p className="text-gray-500 max-w-xl mx-auto text-base mt-2">
              {config.galeri_deskripsi}
            </p>
          )}
          <div className="w-16 h-1 mx-auto rounded-full mt-3" style={{ background: `linear-gradient(90deg, ${accent}, #f0d080)` }} />
        </div>

        {/* Grid Foto & Video */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {galeri.map((item, idx) => {
            const media = parseMediaUrl(item.foto_url);
            return (
              <div
                key={item.id}
                onClick={() => setLightbox(idx)}
                className="relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer group bg-gray-100"
                style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.12)" }}
              >
                <img
                  src={media.thumbnailUrl}
                  alt={item.judul || "Galeri"}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://placehold.co/600x450/${primary.replace("#", "")}/${accent.replace("#", "")}?text=Galeri`;
                  }}
                />

                {/* Video Play Badge jika YouTube */}
                {media.type === "youtube" && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-115">
                      <Play size={24} className="fill-white translate-x-0.5" />
                    </div>
                  </div>
                )}

                {/* Overlay Text */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 pointer-events-none"
                  style={{ background: `linear-gradient(to top, ${primary}e6, transparent)` }}
                >
                  {item.judul && (
                    <p className="text-white font-semibold text-sm leading-tight drop-shadow-sm">{item.judul}</p>
                  )}
                  {item.deskripsi && (
                    <p className="text-white/80 text-xs mt-0.5 line-clamp-1">{item.deskripsi}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Lightbox Modal */}
        {lightbox !== null && currentMedia && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
            onClick={close}
          >
            <button
              onClick={close}
              className="absolute top-4 right-4 text-white/80 hover:text-white z-20 p-2 rounded-full bg-black/40 hover:bg-black/70 transition-colors"
              aria-label="Tutup"
            >
              <X size={28} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              className="absolute left-2 sm:left-6 text-white/80 hover:text-white p-2.5 rounded-full bg-black/40 hover:bg-black/70 transition-colors z-20"
              aria-label="Sebelumnya"
            >
              <ChevronLeft size={32} />
            </button>

            <div
              className="max-w-4xl w-full max-h-[90vh] mx-10 sm:mx-16 flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              {currentMedia.type === "youtube" ? (
                <div className="w-full aspect-video rounded-xl overflow-hidden shadow-2xl bg-black">
                  <iframe
                    src={currentMedia.embedUrl}
                    title={galeri[lightbox].judul || "Video Pesantren"}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              ) : (
                <img
                  src={currentMedia.originalUrl}
                  alt={galeri[lightbox].judul || "Galeri"}
                  referrerPolicy="no-referrer"
                  className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://placehold.co/800x600/${primary.replace("#", "")}/${accent.replace("#", "")}?text=Gambar+Galeri`;
                  }}
                />
              )}

              {galeri[lightbox].judul && (
                <div className="text-center mt-3 max-w-xl">
                  <p className="text-white font-semibold text-base sm:text-lg">{galeri[lightbox].judul}</p>
                  {galeri[lightbox].deskripsi && (
                    <p className="text-white/70 text-xs sm:text-sm mt-1">{galeri[lightbox].deskripsi}</p>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              className="absolute right-2 sm:right-6 text-white/80 hover:text-white p-2.5 rounded-full bg-black/40 hover:bg-black/70 transition-colors z-20"
              aria-label="Berikutnya"
            >
              <ChevronRight size={32} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
