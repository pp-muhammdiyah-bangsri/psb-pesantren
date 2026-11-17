import Link from "next/link";
import {
  BookOpen,
  GraduationCap,
  Globe,
  Cpu,
  Landmark,
  Award,
  Sparkles,
  HeartHandshake,
  Compass,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { buildPsbTheme } from "@/lib/themeUtils";

interface ProgramItem {
  id: number;
  nama: string;
  deskripsi: string;
  icon: string;
  warna: string;
  urutan: number;
  is_aktif: boolean;
}

interface ProgramSectionProps {
  programs: ProgramItem[];
  config: Record<string, string>;
}

function resolveProgramIcon(iconRaw: string, nama: string): LucideIcon {
  const text = `${iconRaw || ""} ${nama || ""}`.toLowerCase();
  if (/tahfidz|tahfiz|quran|qur'an|hafidz|📖|📕/.test(text)) return BookOpen;
  if (/bahasa|arab|inggris|global|🌍|🌐|🗣️/.test(text)) return Globe;
  if (/it|digital|komputer|sains|teknologi|💻|🔬/.test(text)) return Cpu;
  if (/kitab|fiqih|aqidah|akhlak|adab|ibadah|🕌|📿/.test(text)) return Landmark;
  if (/beasiswa|lksa|sosial|karakter|🤝|💛/.test(text)) return HeartHandshake;
  if (/prestasi|olimpiade|juara|unggulan|🏆|🥇/.test(text)) return Award;
  if (/sekolah|madrasah|smp|sma|smk|akademik|formal|🎓/.test(text)) return GraduationCap;
  if (/ekstra|minat|bakat|pramuka|olahraga|🧭/.test(text)) return Compass;
  return Sparkles;
}

export default function ProgramSection({ programs, config }: ProgramSectionProps) {
  const theme = buildPsbTheme(config);
  const aktif = programs.filter((p) => p.is_aktif);

  if (aktif.length === 0) return null;

  const isOddMulti = aktif.length >= 3 && aktif.length % 2 === 1;

  return (
    <section
      id="program"
      className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white border-y border-stone-200/70"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Kolom Kiri: Editorial Sticky Anchor */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
            <div className="space-y-3 text-center lg:text-left">
              <p
                className="text-xs font-bold uppercase tracking-[0.18em]"
                style={{ color: theme.accentTextOnLight }}
              >
                {config.program_badge || "Keunggulan Kurikulum"}
              </p>
              <h2
                className="font-display text-3xl sm:text-4xl font-bold leading-tight"
                style={{ color: theme.primary }}
              >
                {config.program_judul || "Program Unggulan"}
              </h2>
              <p className="text-stone-600 text-sm sm:text-base leading-relaxed max-w-xl mx-auto lg:mx-0">
                {config.program_deskripsi ||
                  "Sinergi pendidikan kepesantrenan, tahfidzul Qur'an, dan penguasaan ilmu pengetahuan modern."}
              </p>
            </div>

            {/* Kartu Highlight Kurikulum */}
            <div
              className="rounded-3xl p-6 sm:p-7 text-white relative overflow-clip shadow-lg"
              style={{
                background: `linear-gradient(155deg, ${theme.primaryDark} 0%, ${theme.primary} 100%)`,
              }}
            >
              <svg
                aria-hidden="true"
                className="absolute -right-8 -bottom-8 w-36 h-36 opacity-10 pointer-events-none"
                viewBox="0 0 120 120"
                fill="none"
              >
                <circle cx="60" cy="60" r="48" stroke="currentColor" strokeWidth="1.5" />
                <path d="M60 12L108 60L60 108L12 60Z" stroke="currentColor" strokeWidth="1.5" />
              </svg>

              <div className="relative z-10 space-y-4 flex flex-col items-center lg:items-start text-center lg:text-left">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-white/10 border border-white/15"
                    style={{ color: theme.accentLight }}
                  >
                    {config.program_highlight_badge || `${aktif.length} Pilar Pendidikan`}
                  </span>
                </div>

                <p className="font-display text-xl sm:text-2xl font-bold leading-snug">
                  {config.program_highlight_judul ||
                    "Membentuk Santri Berilmu, Beradab, & Siap Masa Depan."}
                </p>
                <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                  {config.program_highlight_deskripsi ||
                    "Seluruh program dibina secara terpadu dalam lingkungan asrama yang kondusif."}
                </p>

                <Link
                  href="/daftar"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-xs sm:text-sm transition-transform duration-200 hover:-translate-y-0.5 shadow-sm"
                  style={{ backgroundColor: theme.accent, color: theme.onAccent }}
                >
                  <span>{config.program_highlight_cta || "Daftar Sekarang"}</span>
                  <ArrowRight size={15} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Bento Grid Program (Selalu seimbang tanpa slot kosong) */}
          <div className="lg:col-span-8">
            <div
              className={`grid gap-5 auto-rows-fr ${
                aktif.length === 1 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"
              }`}
            >
              {aktif.map((prog, idx) => {
                const Icon = resolveProgramIcon(prog.icon, prog.nama);
                const cardAccent = prog.warna || theme.primary;
                const isWideHeroCard = isOddMulti && idx === 0;
                const numLabel = String(idx + 1).padStart(2, "0");

                return (
                  <article
                    key={prog.id}
                    className={`group relative rounded-3xl bg-[#faf8f4] border border-stone-200/90 overflow-clip transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-stone-300 flex flex-col justify-between ${
                      isWideHeroCard ? "sm:col-span-2" : ""
                    }`}
                  >
                    {/* Garis aksen atas berwarna per program */}
                    <div
                      aria-hidden="true"
                      className="h-1 w-full"
                      style={{
                        background: `linear-gradient(90deg, ${cardAccent}, ${theme.accent})`,
                      }}
                    />

                    {/* Watermark ikon tipis di sudut kanan bawah */}
                    <Icon
                      aria-hidden="true"
                      size={112}
                      strokeWidth={1.25}
                      className="pointer-events-none absolute -right-4 -bottom-4 opacity-[0.045] transition-transform duration-300 group-hover:scale-105"
                      style={{ color: cardAccent }}
                    />

                    <div
                      className={`relative z-10 p-6 sm:p-7 flex-1 flex flex-col justify-between gap-5 ${
                        isWideHeroCard ? "sm:flex-row sm:items-center sm:gap-8" : ""
                      }`}
                    >
                      <div className={isWideHeroCard ? "sm:flex-1 space-y-4" : "space-y-4"}>
                        <div className="flex items-center justify-center sm:justify-between gap-4">
                          <div
                            className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs transition-transform duration-200 group-hover:scale-105"
                            style={{
                              backgroundColor: `${cardAccent}18`,
                              color: cardAccent,
                              border: `1px solid ${cardAccent}35`,
                            }}
                          >
                            <Icon size={22} aria-hidden="true" />
                          </div>

                          <span
                            className="hidden sm:inline font-display italic text-2xl font-bold tabular-nums opacity-35 select-none"
                            style={{ color: theme.primary }}
                          >
                            {numLabel}
                          </span>
                        </div>

                        <div className="space-y-2 text-center sm:text-left">
                          <h3
                            className="text-lg sm:text-xl font-bold leading-snug"
                            style={{ color: theme.primary }}
                          >
                            {prog.nama}
                          </h3>
                          <p className="text-stone-600 text-sm leading-relaxed">
                            {prog.deskripsi}
                          </p>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
