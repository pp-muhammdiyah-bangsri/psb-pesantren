import Link from "next/link";
import { Calendar, Users, Banknote, Clock, CheckCircle, AlertCircle } from "lucide-react";

interface GelombangSectionProps {
  gelombang: Array<Record<string, unknown>>;
  config: Record<string, string>;
}

function formatDate(dateStr: string) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

function formatRupiah(num: number) {
  if (!num || num === 0) return "Gratis";
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num);
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
  const primary = config.warna_primer || "#0f4c1e";
  const accent = config.warna_aksen || "#c8a84b";

  return (
    <section id="gelombang" className="py-20 px-4" style={{ background: "#f8f9fa" }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: accent }}>
            Jadwal Pendaftaran
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-3" style={{ color: primary }}>
            Gelombang Penerimaan Santri Baru
          </h2>
          <div className="w-16 h-1 mx-auto rounded-full" style={{ background: `linear-gradient(90deg, ${accent}, #f0d080)` }} />
        </div>

        {gelombang.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Calendar size={48} className="mx-auto mb-3 opacity-30" />
            <p>Informasi gelombang pendaftaran akan segera diumumkan.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {gelombang.map((g) => {
              const status = getStatus(g);
              return (
                <div
                  key={String(g.id)}
                  className="relative rounded-2xl overflow-hidden transition-all hover:-translate-y-1"
                  style={{
                    background: "white",
                    boxShadow: status === "open"
                      ? `0 8px 30px ${accent}25, 0 0 0 2px ${accent}`
                      : "0 4px 20px rgba(0,0,0,0.08)",
                  }}
                >
                  {/* Status Badge */}
                  <div
                    className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                    style={{
                      background: status === "open" ? "#dcfce7" : status === "upcoming" ? "#fef9c3" : "#fee2e2",
                      color: status === "open" ? "#15803d" : status === "upcoming" ? "#a16207" : "#b91c1c",
                    }}
                  >
                    {status === "open" ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                    {status === "open" ? "Dibuka" : status === "upcoming" ? "Akan Datang" : "Ditutup"}
                  </div>

                  {/* Header */}
                  <div className="p-5 pb-4" style={{ background: `linear-gradient(135deg, ${primary}, ${primary}dd)` }}>
                    <h3 className="font-bold text-lg text-white leading-tight">{String(g.nama)}</h3>
                    {!!g.keterangan && (
                      <p className="text-white/60 text-xs mt-1">{String(g.keterangan)}</p>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar size={15} style={{ color: accent }} />
                      <span>
                        {formatDate(String(g.tanggal_buka))} — {formatDate(String(g.tanggal_tutup))}
                      </span>
                    </div>
                    {!!g.kuota && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users size={15} style={{ color: accent }} />
                        <span>Kuota: {String(g.kuota)} santri</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Banknote size={15} style={{ color: accent }} />
                      <span>Biaya: {formatRupiah(Number(g.biaya_pendaftaran))}</span>
                    </div>
                  </div>

                  {/* CTA */}
                  {status === "open" && (
                    <div className="px-5 pb-5">
                      <Link
                        href={`/daftar?gelombang=${g.id}`}
                        className="block text-center py-2.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90"
                        style={{ background: `linear-gradient(135deg, ${accent}, #f0d080)`, color: primary }}
                      >
                        Daftar Gelombang Ini
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* CTA Banner */}
        <div
          className="rounded-2xl p-8 text-center"
          style={{ background: `linear-gradient(135deg, ${primary}, #1a6b2b)` }}
        >
          <h3 className="text-2xl font-bold text-white mb-2">Siap Mendaftar?</h3>
          <p className="text-white/70 mb-6">Isi formulir pendaftaran online sekarang dan jadilah bagian dari keluarga besar pesantren kami.</p>
          <Link
            href="/daftar"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full font-bold text-sm"
            style={{ background: `linear-gradient(135deg, ${accent}, #f0d080)`, color: primary }}
          >
            Mulai Pendaftaran <Clock size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
