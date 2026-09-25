"use client";
import { Award } from "lucide-react";
import { parseMediaUrl } from "@/lib/mediaUtils";

interface TentangSectionProps {
  config: Record<string, string>;
}

export default function TentangSection({ config }: TentangSectionProps) {
  const primary = config.warna_primer || "#0f4c1e";
  const accent = config.warna_aksen || "#c8a84b";
  const nama = config.nama_pesantren || "Pondok Pesantren";
  const deskripsi = config.deskripsi || "";
  const programPendidikan = config.program_pendidikan
    ? config.program_pendidikan.split(",").map((p) => p.trim()).filter(Boolean)
    : [];

  const videoMedia = config.video_profil_url ? parseMediaUrl(config.video_profil_url) : null;

  // Jika tidak ada deskripsi dan tidak ada video, tidak perlu render section kosong
  if (!deskripsi && !videoMedia?.embedUrl && programPendidikan.length === 0) {
    return null;
  }

  return (
    <section id="tentang" className="py-20 px-4 bg-white relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-14">
          <p className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: accent }}>
            {config.tentang_badge || "Profil & Visi"}
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-3" style={{ color: primary }}>
            {config.tentang_judul || `Tentang ${nama}`}
          </h2>
          <div
            className="w-16 h-1 mx-auto rounded-full"
            style={{ background: `linear-gradient(90deg, ${accent}, #f0d080)` }}
          />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Deskripsi & Program */}
          <div className={`${videoMedia && videoMedia.embedUrl ? "lg:col-span-6" : "lg:col-span-12 max-w-3xl mx-auto"} space-y-6`}>
            {deskripsi && (
              <p className="text-gray-700 leading-relaxed text-base sm:text-lg">
                {deskripsi}
              </p>
            )}

            {/* Program Pendidikan List */}
            {programPendidikan.length > 0 && (
              <div className="p-6 rounded-2xl border" style={{ borderColor: "#e5e7eb", background: "#fcfdfc" }}>
                <div className="flex items-center gap-2 mb-3 font-bold text-sm" style={{ color: primary }}>
                  <Award size={18} style={{ color: accent }} />
                  <span>{config.tentang_program_label || "Program Pendidikan yang Diselenggarakan:"}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {programPendidikan.map((prog, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-gray-100 shadow-sm"
                    >
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                        style={{ background: primary }}
                      >
                        {idx + 1}
                      </span>
                      <span className="text-sm font-semibold text-gray-800">{prog}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Video Player Box */}
          {videoMedia && videoMedia.embedUrl && (
            <div className="lg:col-span-6">
              <div
                className="relative rounded-2xl overflow-hidden shadow-2xl border bg-black aspect-video group"
                style={{ borderColor: "#e5e7eb" }}
              >
                <iframe
                  src={videoMedia.embedUrl.replace("autoplay=1", "autoplay=0")}
                  title={`Video Profil ${nama}`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
              <p className="text-center text-xs text-gray-400 mt-2.5 font-medium">
                Video Profil Resmi {nama}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}