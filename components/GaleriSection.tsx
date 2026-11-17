"use client";
import { useState, useCallback, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Play, ImageOff } from "lucide-react";
import { parseMediaUrl } from "@/lib/mediaUtils";
import { buildPsbTheme } from "@/lib/themeUtils";
import ModalDialog from "@/components/ModalDialog";

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

const MADING_ROTATIONS = [
  "-rotate-2",
  "rotate-2",
  "-rotate-1",
  "rotate-3",
  "-rotate-3",
  "rotate-1",
  "-rotate-2",
  "rotate-2",
  "-rotate-1",
];

const MADING_OFFSETS = [
  "sm:translate-y-0",
  "sm:translate-y-6",
  "sm:-translate-y-1",
  "sm:translate-y-5",
  "sm:translate-y-1",
  "sm:translate-y-7",
  "sm:translate-y-0",
  "sm:translate-y-5",
  "sm:-translate-y-1",
];

const TAPE_ROTATIONS = ["-rotate-3", "rotate-3", "-rotate-2", "rotate-2"];

export default function GaleriSection({ galeri, config }: GaleriSectionProps) {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [failedIds, setFailedIds] = useState<Record<number, boolean>>({});
  const theme = buildPsbTheme(config);

  const close = useCallback(() => setLightbox(null), []);
  const prev = useCallback(
    () => setLightbox((i) => (i !== null ? (i - 1 + galeri.length) % galeri.length : null)),
    [galeri.length]
  );
  const next = useCallback(
    () => setLightbox((i) => (i !== null ? (i + 1) % galeri.length : null)),
    [galeri.length]
  );

  useEffect(() => {
    if (lightbox === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightbox, prev, next]);

  if (galeri.length === 0) return null;

  const activeItem = lightbox !== null ? galeri[lightbox] : null;
  const currentMedia = activeItem ? parseMediaUrl(activeItem.foto_url) : null;

  const gridColsClass =
    galeri.length === 1
      ? "grid-cols-1 max-w-md mx-auto"
      : galeri.length === 2 || galeri.length === 4
      ? "grid-cols-1 sm:grid-cols-2 max-w-4xl mx-auto"
      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <section id="galeri" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header Editorial */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6 text-center md:text-left">
          <div className="max-w-2xl mx-auto md:mx-0 space-y-2.5">
            <p
              className="text-xs font-bold uppercase tracking-[0.18em]"
              style={{ color: theme.accentTextOnLight }}
            >
              {config.galeri_badge || "Galeri Kegiatan"}
            </p>
            <h2
              className="font-display text-3xl sm:text-4xl font-bold leading-tight"
              style={{ color: theme.primary }}
            >
              {config.galeri_judul || "Kehidupan di Pesantren"}
            </h2>
          </div>
          {config.galeri_deskripsi && (
            <p className="text-stone-600 max-w-md mx-auto md:mx-0 text-sm sm:text-base leading-relaxed">
              {config.galeri_deskripsi}
            </p>
          )}
        </div>

        {/* Papan Majalah Dinding (Mading) */}
        <div
          className="relative rounded-[2rem] border-2 border-stone-200/90 px-5 pt-8 pb-12 sm:px-10 sm:pt-12 sm:pb-16 overflow-clip shadow-inner"
          style={{
            backgroundColor: "#f5f0e4",
            backgroundImage:
              "radial-gradient(rgba(120, 98, 66, 0.16) 1px, transparent 1px)",
            backgroundSize: "18px 18px",
          }}
        >
          {/* Paku sudut papan mading (dekoratif) */}
          <span
            aria-hidden="true"
            className="hidden sm:block absolute top-4 left-4 w-3 h-3 rounded-full bg-stone-400/70 ring-2 ring-white/80 shadow-xs"
          />
          <span
            aria-hidden="true"
            className="hidden sm:block absolute top-4 right-4 w-3 h-3 rounded-full bg-stone-400/70 ring-2 ring-white/80 shadow-xs"
          />
          <span
            aria-hidden="true"
            className="hidden sm:block absolute bottom-4 left-4 w-3 h-3 rounded-full bg-stone-400/70 ring-2 ring-white/80 shadow-xs"
          />
          <span
            aria-hidden="true"
            className="hidden sm:block absolute bottom-4 right-4 w-3 h-3 rounded-full bg-stone-400/70 ring-2 ring-white/80 shadow-xs"
          />

          <div className={`grid gap-9 sm:gap-11 items-start ${gridColsClass}`}>
            {galeri.map((item, idx) => {
              const media = parseMediaUrl(item.foto_url);
              const hasFailed = Boolean(failedIds[item.id]);
              const rotateCls = MADING_ROTATIONS[idx % MADING_ROTATIONS.length];
              const offsetCls = MADING_OFFSETS[idx % MADING_OFFSETS.length];
              const tapeRotateCls = TAPE_ROTATIONS[idx % TAPE_ROTATIONS.length];
              const usePushPin = idx % 2 === 1;

              return (
                <div key={item.id} className={`px-1.5 sm:px-0 ${offsetCls}`}>
                  <button
                    type="button"
                    onClick={() => setLightbox(idx)}
                    aria-label={
                      item.judul ? `Buka galeri: ${item.judul}` : `Buka foto galeri ${idx + 1}`
                    }
                    className={`group relative w-full text-left bg-white p-2.5 pb-4 sm:p-3 sm:pb-5 rounded-sm border border-stone-200/90 cursor-pointer ${rotateCls} motion-safe:transition-transform motion-safe:duration-300 motion-safe:hover:rotate-0 motion-safe:hover:-translate-y-1.5 motion-safe:hover:scale-[1.02] hover:z-20 focus-visible:rotate-0 focus-visible:z-20`}
                    style={{
                      boxShadow: "0 14px 28px -12px rgba(28, 22, 12, 0.24)",
                    }}
                  >
                    {/* Selotip / Paku Mading di bagian atas bingkai */}
                    {usePushPin ? (
                      <span
                        aria-hidden="true"
                        className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none"
                      >
                        <span
                          className="w-5 h-5 rounded-full shadow-md ring-2 ring-white flex items-center justify-center"
                          style={{ backgroundColor: theme.primary }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-white/75" />
                        </span>
                      </span>
                    ) : (
                      <span
                        aria-hidden="true"
                        className={`absolute -top-2.5 left-1/2 -translate-x-1/2 z-20 w-20 h-5 bg-amber-200/80 border-x border-amber-300/60 shadow-xs pointer-events-none ${tapeRotateCls}`}
                      />
                    )}

                    {/* Foto / Thumbnail Video */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100 border border-stone-200/70">
                      {!hasFailed && media.thumbnailUrl ? (
                        <img
                          src={media.thumbnailUrl}
                          alt={item.judul || `Kegiatan pesantren ${idx + 1}`}
                          loading="lazy"
                          decoding="async"
                          referrerPolicy="no-referrer"
                          onError={() =>
                            setFailedIds((prevMap) => ({ ...prevMap, [item.id]: true }))
                          }
                          className="w-full h-full object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-stone-400 p-4">
                          <ImageOff size={24} aria-hidden="true" />
                          <span className="text-xs font-medium text-center">
                            {item.judul || "Dokumentasi Pesantren"}
                          </span>
                        </div>
                      )}

                      {media.type === "youtube" && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <span className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-red-600/95 text-white flex items-center justify-center shadow-lg motion-safe:transition-transform motion-safe:duration-200 motion-safe:group-hover:scale-110">
                            <Play size={22} className="fill-white translate-x-[1px]" aria-hidden="true" />
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Catatan Teks Polaroid di Bawah Foto */}
                    {(item.judul || item.deskripsi) && (
                      <div className="pt-3.5 px-1 space-y-1 text-center sm:text-left">
                        {item.judul && (
                          <p
                            className="font-display font-bold text-base sm:text-[17px] leading-snug line-clamp-1"
                            style={{ color: theme.primary }}
                          >
                            {item.judul}
                          </p>
                        )}
                        {item.deskripsi && (
                          <p className="text-xs text-stone-600 leading-relaxed line-clamp-2">
                            {item.deskripsi}
                          </p>
                        )}
                      </div>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Accessible Lightbox Modal */}
      <ModalDialog
        open={lightbox !== null && currentMedia !== null}
        onClose={close}
        ariaLabel={activeItem?.judul || "Tampilan Galeri"}
        backdropDark
        className="w-full max-w-5xl"
      >
        {activeItem && currentMedia && (
          <div className="relative flex flex-col items-center justify-center px-2 sm:px-14 py-4">
            <button
              type="button"
              onClick={close}
              aria-label="Tutup galeri"
              className="fixed top-4 right-4 z-30 min-w-11 min-h-11 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={22} aria-hidden="true" />
            </button>

            {galeri.length > 1 && (
              <button
                type="button"
                onClick={prev}
                aria-label="Foto sebelumnya"
                className="fixed left-3 sm:left-5 top-1/2 -translate-y-1/2 z-30 min-w-11 min-h-11 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronLeft size={24} aria-hidden="true" />
              </button>
            )}

            <div className="w-full max-w-4xl flex flex-col items-center">
              {currentMedia.type === "youtube" ? (
                <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-2xl bg-black border border-white/15">
                  <iframe
                    src={currentMedia.embedUrl}
                    title={activeItem.judul || "Video Pesantren"}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              ) : failedIds[activeItem.id] ? (
                <div className="w-full max-w-lg aspect-[4/3] rounded-2xl bg-stone-900 text-stone-300 flex flex-col items-center justify-center gap-2 border border-white/15">
                  <ImageOff size={32} aria-hidden="true" />
                  <p className="text-sm">Gambar tidak dapat dimuat</p>
                </div>
              ) : (
                <img
                  src={currentMedia.originalUrl}
                  alt={activeItem.judul || "Galeri Pesantren"}
                  referrerPolicy="no-referrer"
                  className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl"
                />
              )}

              {(activeItem.judul || activeItem.deskripsi) && (
                <div className="text-center mt-4 max-w-xl px-4">
                  {activeItem.judul && (
                    <p className="text-white font-semibold text-base sm:text-lg">
                      {activeItem.judul}
                    </p>
                  )}
                  {activeItem.deskripsi && (
                    <p className="text-white/80 text-xs sm:text-sm mt-1">
                      {activeItem.deskripsi}
                    </p>
                  )}
                </div>
              )}
            </div>

            {galeri.length > 1 && (
              <button
                type="button"
                onClick={next}
                aria-label="Foto berikutnya"
                className="fixed right-3 sm:right-5 top-1/2 -translate-y-1/2 z-30 min-w-11 min-h-11 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronRight size={24} aria-hidden="true" />
              </button>
            )}
          </div>
        )}
      </ModalDialog>
    </section>
  );
}
