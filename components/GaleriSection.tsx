"use client";
import { useState } from "react";
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
 * Konversi berbagai format Google Drive URL menjadi URL gambar langsung.
 * Format yang didukung:
 *   - https://drive.google.com/file/d/FILE_ID/view?...
 *   - https://drive.google.com/open?id=FILE_ID
 *   - https://drive.google.com/uc?id=FILE_ID
 *   - https://lh3.googleusercontent.com/d/FILE_ID  (sudah benar)
 */
function toDirectImageUrl(url: string): string {
  if (!url) return url;

  // Sudah format langsung
  if (url.includes("lh3.googleusercontent.com")) return url;

  // Format: /file/d/FILE_ID/
  const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) {
    return `https://lh3.googleusercontent.com/d/${fileMatch[1]}`;
  }

  // Format: ?id=FILE_ID atau &id=FILE_ID
  const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch) {
    return `https://lh3.googleusercontent.com/d/${idMatch[1]}`;
  }

  // Bukan Google Drive, kembalikan apa adanya
  return url;
}

export default function GaleriSection({ galeri, config }: GaleriSectionProps) {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const primary = config.warna_primer || "#0f4c1e";
  const accent = config.warna_aksen || "#c8a84b";

  const close = () => setLightbox(null);
  const prev = () => setLightbox((i) => (i !== null ? (i - 1 + galeri.length) % galeri.length : null));
  const next = () => setLightbox((i) => (i !== null ? (i + 1) % galeri.length : null));

  if (galeri.length === 0) return null;

  return (
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

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {galeri.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => setLightbox(idx)}
              className="relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer group"
              style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.12)" }}
            >
              <img
                src={toDirectImageUrl(item.foto_url)}
                alt={item.judul || "Galeri"}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                onError={(e) => {
                  // Fallback jika gambar gagal load
                  (e.target as HTMLImageElement).src = `https://placehold.co/400x300/${primary.replace("#","")}/${accent.replace("#","")}?text=Galeri`;
                }}
              />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3"
                style={{ background: `linear-gradient(to top, ${primary}cc, transparent)` }}>
                {item.judul && (
                  <p className="text-white font-semibold text-sm leading-tight">{item.judul}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox */}
        {lightbox !== null && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
            onClick={close}
          >
            <button onClick={close} className="absolute top-4 right-4 text-white/70 hover:text-white">
              <X size={32} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-4 text-white/70 hover:text-white p-2">
              <ChevronLeft size={36} />
            </button>
            <div className="max-w-4xl max-h-[85vh] mx-16" onClick={(e) => e.stopPropagation()}>
              <img
                src={toDirectImageUrl(galeri[lightbox].foto_url)}
                alt={galeri[lightbox].judul || ""}
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
              />
              {galeri[lightbox].judul && (
                <p className="text-white text-center mt-3 font-medium">{galeri[lightbox].judul}</p>
              )}
            </div>
            <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-4 text-white/70 hover:text-white p-2">
              <ChevronRight size={36} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}