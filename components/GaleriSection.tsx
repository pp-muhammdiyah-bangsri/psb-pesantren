"use client";
import { useState, useCallback } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

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

/**
 * Konversi Google Drive URL ke URL gambar langsung.
 * Tambahkan =w600 untuk resize otomatis (hemat bandwidth ~70%).
 */
function toDirectImageUrl(url: string, width = 600): string {
  if (!url) return url;
  if (url.includes("lh3.googleusercontent.com")) {
    // Sudah format langsung — tambah ukuran jika belum ada
    return url.replace(/=w\d+$/, "") + `=w${width}`;
  }
  const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) return `https://lh3.googleusercontent.com/d/${fileMatch[1]}=w${width}`;
  const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch) return `https://lh3.googleusercontent.com/d/${idMatch[1]}=w${width}`;
  return url;
}

// Placeholder SVG blur — ditampilkan saat gambar belum selesai load
const PLACEHOLDER = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='3'%3E%3Crect width='4' height='3' fill='%23d1d5db'/%3E%3C/svg%3E`;

function LazyImage({ src, alt, className, style, onClick }: {
  src: string; alt: string; className?: string; style?: React.CSSProperties; onClick?: () => void;
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className={className} style={{ ...style, position: "relative", overflow: "hidden", background: "#e5e7eb" }} onClick={onClick}>
      {/* Skeleton shimmer saat loading */}
      {!loaded && !error && (
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.4s ease-in-out infinite",
        }} />
      )}
      <img
        src={error ? PLACEHOLDER : src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => { setError(true); setLoaded(true); }}
        style={{
          width: "100%", height: "100%", objectFit: "cover",
          opacity: loaded ? 1 : 0,
          transition: "opacity 0.4s ease",
          display: "block",
        }}
      />
    </div>
  );
}

export default function GaleriSection({ galeri, config }: GaleriSectionProps) {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const primary = config.warna_primer || "#0f4c1e";
  const accent = config.warna_aksen || "#c8a84b";

  const close = useCallback(() => setLightbox(null), []);
  const prev = useCallback(() => setLightbox((i) => (i !== null ? (i - 1 + galeri.length) % galeri.length : null)), [galeri.length]);
  const next = useCallback(() => setLightbox((i) => (i !== null ? (i + 1) % galeri.length : null)), [galeri.length]);

  if (galeri.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>

      <section id="galeri" className="py-20 px-4" style={{ background: "white" }}>
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <p className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: accent }}>
              Galeri
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-3" style={{ color: primary }}>
              Kehidupan di Pesantren
            </h2>
            <div className="w-16 h-1 mx-auto rounded-full" style={{ background: `linear-gradient(90deg, ${accent}, #f0d080)` }} />
          </div>

          {/* Grid — lazy load semua gambar */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            {galeri.map((item, idx) => (
              <div
                key={item.id}
                className="relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer group"
                style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.12)" }}
              >
                <LazyImage
                  src={toDirectImageUrl(item.foto_url, 600)}
                  alt={item.judul || "Galeri"}
                  style={{ width: "100%", height: "100%", transition: "transform 0.5s ease" }}
                  className="group-hover:scale-110"
                  onClick={() => setLightbox(idx)}
                />
                {/* Overlay */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 pointer-events-none"
                  style={{ background: `linear-gradient(to top, ${primary}cc, transparent)` }}
                >
                  {item.judul && (
                    <p className="text-white font-semibold text-sm leading-tight">{item.judul}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Lightbox — gambar hi-res hanya dimuat saat diklik */}
          {lightbox !== null && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
              onClick={close}
            >
              <button onClick={close} className="absolute top-4 right-4 text-white/70 hover:text-white z-10">
                <X size={32} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-4 text-white/70 hover:text-white p-2 z-10"
              >
                <ChevronLeft size={36} />
              </button>
              <div className="max-w-4xl max-h-[85vh] mx-16" onClick={(e) => e.stopPropagation()}>
                {/* Lightbox load gambar full-size (1200px) */}
                <img
                  src={toDirectImageUrl(galeri[lightbox].foto_url, 1200)}
                  alt={galeri[lightbox].judul || ""}
                  className="max-w-full max-h-[80vh] object-contain rounded-lg"
                  loading="eager"
                />
                {galeri[lightbox].judul && (
                  <p className="text-white text-center mt-3 font-medium">{galeri[lightbox].judul}</p>
                )}
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-4 text-white/70 hover:text-white p-2 z-10"
              >
                <ChevronRight size={36} />
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}