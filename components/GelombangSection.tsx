import Link from "next/link";
import { Calendar, Users, Banknote, ArrowRight, CheckCircle2, Clock } from "lucide-react";
import { buildPsbTheme } from "@/lib/themeUtils";

interface GelombangSectionProps {
  gelombang: Array<Record<string, unknown>>;
  config: Record<string, string>;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function formatRupiah(num: number): string {
  if (!num || num === 0) return "Gratis";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(num);
}

function getStatus(g: Record<string, unknown>) {
  const today = new Date().toISOString().split("T")[0];
  const buka = String(g.tanggal_buka || "");
  const tutup = String(g.tanggal_tutup || "");
  if (today < buka) return "upcoming";
  if (today > tutup) return "closed";
  return "open";
}

export default function GelombangSection({ gelombang, config }: GelombangSectionProps) {
  const theme = buildPsbTheme(config);

  return (
    <section id="gelombang" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#f3efe6] border-y border-stone-200/80">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header Editorial */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6 text-center md:text-left">
          <div className="max-w-2xl mx-auto md:mx-0 space-y-2.5">
            <p
              className="text-xs font-bold uppercase tracking-[0.18em]"
              style={{ color: theme.accentTextOnLight }}
            >
              {config.gelombang_badge || "Jadwal Pendaftaran"}
            </p>
            <h2
              className="font-display text-3xl sm:text-4xl font-bold leading-tight"
              style={{ color: theme.primary }}
            >
              {config.gelombang_judul || "Gelombang Penerimaan Santri Baru"}
            </h2>
          </div>
          <p className="text-stone-600 max-w-md mx-auto md:mx-0 text-sm sm:text-base leading-relaxed">
            {config.gelombang_deskripsi ||
              "Pilih gelombang pendaftaran yang sedang berlangsung untuk memulai pengisian formulir santri baru."}
          </p>
        </div>

        {gelombang.length === 0 ? (
          <div className="bg-white rounded-3xl border border-stone-200 py-14 px-6 text-center text-stone-500">
            <Calendar size={40} className="mx-auto mb-3 opacity-40" aria-hidden="true" />
            <p className="font-medium">Informasi gelombang pendaftaran akan segera diumumkan.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gelombang.map((g) => {
              const status = getStatus(g);
              const isOpen = status === "open";

              return (
                <article
                  key={String(g.id)}
                  className="bg-white rounded-3xl overflow-hidden border flex flex-col justify-between transition-transform duration-200 hover:-translate-y-0.5"
                  style={{
                    borderColor: isOpen ? theme.accent : "#e7e5e4",
                    boxShadow: isOpen ? `0 12px 28px -12px ${theme.primary}25` : "0 1px 3px rgba(0,0,0,0.04)",
                  }}
                >
                  <div>
                    <div
                      className="p-6 pb-5 border-b border-stone-100 flex items-start justify-between gap-3"
                      style={{
                        backgroundColor: isOpen ? theme.primaryDark : "#faf8f4",
                        color: isOpen ? "#ffffff" : theme.primary,
                      }}
                    >
                      <div className="min-w-0">
                        <h3 className="font-bold text-lg leading-snug">
                          {String(g.nama)}
                        </h3>
                        {!!g.keterangan && (
                          <p
                            className={`text-xs mt-1 leading-relaxed ${
                              isOpen ? "text-white/75" : "text-stone-600"
                            }`}
                          >
                            {String(g.keterangan)}
                          </p>
                        )}
                      </div>

                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0"
                        style={{
                          backgroundColor:
                            status === "open"
                              ? "#dcfce7"
                              : status === "upcoming"
                              ? "#fef3c7"
                              : "#fee2e2",
                          color:
                            status === "open"
                              ? "#166534"
                              : status === "upcoming"
                              ? "#92400e"
                              : "#991b1b",
                        }}
                      >
                        {status === "open" ? (
                          <CheckCircle2 size={12} aria-hidden="true" />
                        ) : (
                          <Clock size={12} aria-hidden="true" />
                        )}
                        <span>
                          {status === "open" ? "Dibuka" : status === "upcoming" ? "Segera" : "Ditutup"}
                        </span>
                      </span>
                    </div>

                    <dl className="p-6 space-y-3.5 text-sm">
                      <div className="flex items-start gap-3">
                        <Calendar
                          size={16}
                          className="mt-0.5 shrink-0"
                          style={{ color: theme.accentTextOnLight }}
                          aria-hidden="true"
                        />
                        <div>
                          <dt className="text-[11px] uppercase tracking-wider font-semibold text-stone-500">
                            Periode Pendaftaran
                          </dt>
                          <dd className="font-semibold text-stone-800 tabular-nums mt-0.5">
                            {formatDate(String(g.tanggal_buka))} — {formatDate(String(g.tanggal_tutup))}
                          </dd>
                        </div>
                      </div>

                      {!!g.kuota && (
                        <div className="flex items-start gap-3">
                          <Users
                            size={16}
                            className="mt-0.5 shrink-0"
                            style={{ color: theme.accentTextOnLight }}
                            aria-hidden="true"
                          />
                          <div>
                            <dt className="text-[11px] uppercase tracking-wider font-semibold text-stone-500">
                              Kuota Penerimaan
                            </dt>
                            <dd className="font-semibold text-stone-800 tabular-nums mt-0.5">
                              {String(g.kuota)} Santri
                            </dd>
                          </div>
                        </div>
                      )}

                      <div className="flex items-start gap-3">
                        <Banknote
                          size={16}
                          className="mt-0.5 shrink-0"
                          style={{ color: theme.accentTextOnLight }}
                          aria-hidden="true"
                        />
                        <div>
                          <dt className="text-[11px] uppercase tracking-wider font-semibold text-stone-500">
                            Biaya Pendaftaran
                          </dt>
                          <dd className="font-semibold text-stone-800 tabular-nums mt-0.5">
                            {formatRupiah(Number(g.biaya_pendaftaran))}
                          </dd>
                        </div>
                      </div>
                    </dl>
                  </div>

                  {isOpen && (
                    <div className="px-6 pb-6">
                      <Link
                        href={`/daftar?gelombang=${g.id}`}
                        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm transition-opacity hover:opacity-95"
                        style={{ backgroundColor: theme.accent, color: theme.onAccent }}
                      >
                        <span>Daftar Gelombang Ini</span>
                        <ArrowRight size={15} aria-hidden="true" />
                      </Link>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}

        {/* Callout Banner Editorial Split */}
        <div
          className="rounded-3xl p-7 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 text-white text-center md:text-left"
          style={{ backgroundColor: theme.primaryDark }}
        >
          <div className="space-y-2 max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: theme.accentLight }}>
              {config.gelombang_cta_badge || "Pendaftaran Daring 24 Jam"}
            </p>
            <h3 className="font-display text-2xl sm:text-3xl font-bold">
              {config.gelombang_cta_judul ||
                "Siap Menjadi Bagian dari Keluarga Besar Pesantren?"}
            </h3>
            <p className="text-white/80 text-sm sm:text-base">
              {config.gelombang_cta_deskripsi ||
                "Lengkapi formulir pendaftaran dalam 4 langkah mudah dan dapatkan nomor registrasi secara instan."}
            </p>
          </div>
          <Link
            href="/daftar"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full font-bold text-sm sm:text-base shrink-0 transition-transform duration-200 hover:-translate-y-0.5 shadow-lg"
            style={{ backgroundColor: theme.accent, color: theme.onAccent }}
          >
            <span>{config.gelombang_cta_tombol || "Mulai Pendaftaran"}</span>
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
