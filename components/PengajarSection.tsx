"use client";
import { useState } from "react";
import { X, GraduationCap, BookOpen, Award } from "lucide-react";
import { toDirectImageUrl } from "@/lib/mediaUtils";

interface Pengajar {
  id: number;
  nama: string;
  jabatan: string;
  gelar?: string;
  bidang_studi?: string;
  keterangan?: string;
  foto_url?: string;
  is_pimpinan?: boolean;
  urutan: number;
}

interface PengajarSectionProps {
  pengajar: Pengajar[];
  config: Record<string, string>;
}

function PengajarCard({ p, accent, primary, onClick }: {
  p: Pengajar;
  accent: string;
  primary: string;
  onClick: () => void;
}) {
  const fotoUrl = p.foto_url ? toDirectImageUrl(p.foto_url) : null;
  const initials = p.nama.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();

  return (
    <button
      onClick={onClick}
      className="group w-full text-left bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 hover:border-transparent transition-all duration-300 overflow-hidden hover:-translate-y-1.5"
      style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
    >
      {/* Accent Bar */}
      <div
        className="h-1.5 w-full"
        style={{ background: p.is_pimpinan ? `linear-gradient(90deg, ${accent}, #f0d080)` : `linear-gradient(90deg, ${primary}40, ${primary}20)` }}
      />
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Foto / Inisial */}
          <div className="shrink-0">
            {fotoUrl ? (
              <img
                src={fotoUrl}
                alt={p.nama}
                className="w-16 h-16 rounded-xl object-cover border-2 group-hover:border-opacity-60 transition-all shadow-sm"
                style={{ borderColor: p.is_pimpinan ? accent : `${primary}30` }}
              />
            ) : (
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center text-white text-xl font-extrabold shadow-sm"
                style={{ background: p.is_pimpinan ? `linear-gradient(135deg, ${accent}, #d4922a)` : `linear-gradient(135deg, ${primary}, #1a6b2b)` }}
              >
                {initials}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            {p.is_pimpinan && (
              <span
                className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-1.5"
                style={{ background: `${accent}20`, color: "#8a6b1e" }}
              >
                <Award size={10} /> Pimpinan
              </span>
            )}
            <h3 className="font-extrabold text-sm text-gray-900 leading-tight line-clamp-2">
              {p.gelar ? `${p.gelar} ${p.nama}` : p.nama}
            </h3>
            <p className="text-xs font-semibold mt-0.5 line-clamp-1" style={{ color: primary }}>
              {p.jabatan}
            </p>
            {p.bidang_studi && (
              <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1 line-clamp-1">
                <BookOpen size={11} className="shrink-0" />
                {p.bidang_studi}
              </p>
            )}
          </div>
        </div>
        <div
          className="mt-3 text-[11px] font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
          style={{ color: primary }}
        >
          <GraduationCap size={12} />
          <span>Lihat Profil Lengkap</span>
        </div>
      </div>
    </button>
  );
}

function PengajarModal({ p, accent, primary, onClose }: {
  p: Pengajar;
  accent: string;
  primary: string;
  onClose: () => void;
}) {
  const fotoUrl = p.foto_url ? toDirectImageUrl(p.foto_url) : null;
  const initials = p.nama.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Gradient */}
        <div className="relative h-28 w-full" style={{ background: p.is_pimpinan ? `linear-gradient(135deg, ${accent}80, ${primary})` : `linear-gradient(135deg, ${primary}, #0a3315)` }}>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
          >
            <X size={16} />
          </button>
          {/* Foto */}
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
            {fotoUrl ? (
              <img
                src={fotoUrl}
                alt={p.nama}
                className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-xl"
              />
            ) : (
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-extrabold border-4 border-white shadow-xl"
                style={{ background: p.is_pimpinan ? `linear-gradient(135deg, ${accent}, #d4922a)` : `linear-gradient(135deg, ${primary}, #1a6b2b)` }}
              >
                {initials}
              </div>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="pt-14 pb-7 px-6 text-center">
          {p.is_pimpinan && (
            <span
              className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-2"
              style={{ background: `${accent}20`, color: "#8a6b1e" }}
            >
              <Award size={11} /> Pimpinan Pondok
            </span>
          )}
          <h2 className="text-lg font-extrabold text-gray-900 leading-tight">
            {p.gelar ? `${p.gelar} ${p.nama}` : p.nama}
          </h2>
          <p className="text-sm font-bold mt-0.5" style={{ color: primary }}>{p.jabatan}</p>

          {p.bidang_studi && (
            <div
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: `${primary}10`, color: primary }}
            >
              <BookOpen size={12} />
              {p.bidang_studi}
            </div>
          )}

          {p.keterangan && (
            <p className="mt-4 text-sm text-gray-600 leading-relaxed text-left bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100">
              {p.keterangan}
            </p>
          )}

          <button
            onClick={onClose}
            className="mt-5 w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: `linear-gradient(135deg, ${primary}, #1a6b2b)` }}
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}


const DEFAULT_PENGAJAR: Pengajar[] = [
  {
    id: 1,
    nama: "KH. Ahmad Dahlan Maksum, M.Ag",
    jabatan: "Pengasuh & Pimpinan Pondok Pesantren",
    gelar: "K.H.",
    bidang_studi: "Tafsir & Ulumul Qur'an",
    keterangan: "Pengasuh pondok dengan pengalaman lebih dari 25 tahun membina santri, mendalami keilmuan Islam klasik di pesantren salaf dan menyelesaikan pascasarjana di UIN.",
    is_pimpinan: true,
    urutan: 1,
  },
  {
    id: 2,
    nama: "Dr. H. Muhammad Fauzan, Lc., M.A.",
    jabatan: "Direktur Pendidikan & Kurikulum",
    gelar: "Dr.",
    bidang_studi: "Bahasa Arab & Hadits",
    keterangan: "Lulusan Universitas Al-Azhar Kairo, Mesir. Berdedikasi mengintegrasikan kurikulum agama dan kurikulum formal modern.",
    is_pimpinan: true,
    urutan: 2,
  },
  {
    id: 3,
    nama: "Ust. Ridhwan Al-Hafizh",
    jabatan: "Kepala Halaqah Tahfidz Al-Qur'an",
    gelar: "Ust.",
    bidang_studi: "Tahfidz 30 Juz & Qira'at",
    keterangan: "Hafizh Al-Qur'an 30 Juz bersanad muttashil. Membimbing langsung santri dalam program tahfidz intensif dan mutqin.",
    is_pimpinan: false,
    urutan: 3,
  },
  {
    id: 4,
    nama: "Usth. Maryam Nur Fadhilah, S.Pd.I",
    jabatan: "Pengasuh Asrama Putri & Bahasa",
    gelar: "Usth.",
    bidang_studi: "Bahasa Arab & Akhlaq",
    keterangan: "Alumnus PBA UIN, berfokus pada pembinaan karakter islami, adab harian santriwati, dan pembiasaan bi'ah lughawiyyah.",
    is_pimpinan: false,
    urutan: 4,
  },
  {
    id: 5,
    nama: "Ust. Fathurrahman, S.Si",
    jabatan: "Koordinator Sains & IT Santri",
    gelar: "Ust.",
    bidang_studi: "Matematika & Literasi Digital",
    keterangan: "Pembimbing olimpiade sains santri dan inisiator program literasi teknologi cerdas untuk santri modern.",
    is_pimpinan: false,
    urutan: 5,
  },
  {
    id: 6,
    nama: "Ust. Syihabuddin, S.H.I",
    jabatan: "Pengajar Fiqih & Ibadah Praktis",
    gelar: "Ust.",
    bidang_studi: "Fiqih Madzhab Syafi'i",
    keterangan: "Mengampu kajian kitab fiqih dasar hingga menengah serta membimbing praktek ibadah harian santri secara mendalam.",
    is_pimpinan: false,
    urutan: 6,
  },
];

export default function PengajarSection({ pengajar, config }: PengajarSectionProps) {
  const [selected, setSelected] = useState<Pengajar | null>(null);
  const primary = config.warna_primer || "#0f4c1e";
  const accent = config.warna_aksen || "#c8a84b";

  if (config.tampilkan_pengajar === "false") return null;

  const displayList = pengajar && pengajar.length > 0 ? pengajar : DEFAULT_PENGAJAR;
  const pimpinan = displayList.filter(p => p.is_pimpinan);
  const pengajarBiasa = displayList.filter(p => !p.is_pimpinan);

  return (
    <>
      <section id="pengajar" className="py-20 px-4" style={{ background: "#f8fafb" }}>
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <p className="text-xs sm:text-sm font-bold uppercase tracking-widest mb-2" style={{ color: accent }}>
              {config.pengajar_badge || "Tim Pengajar & Pimpinan"}
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-3" style={{ color: primary }}>
              {config.pengajar_judul || "Diasuh oleh Tenaga Pendidik Terpercaya"}
            </h2>
            <div className="w-16 h-1 mx-auto rounded-full mb-4" style={{ background: `linear-gradient(90deg, ${accent}, #f0d080)` }} />
            {config.pengajar_deskripsi && (
              <p className="text-sm text-gray-500 max-w-2xl mx-auto leading-relaxed">{config.pengajar_deskripsi}</p>
            )}
          </div>

          {/* Pimpinan Pondok */}
          {pimpinan.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
                <span className="text-xs font-bold uppercase tracking-widest px-3" style={{ color: accent }}>
                  Pimpinan Pondok
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
              </div>
              <div className={`grid gap-4 ${pimpinan.length === 1 ? "max-w-xs mx-auto" : pimpinan.length === 2 ? "grid-cols-1 sm:grid-cols-2 max-w-xl mx-auto" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"}`}>
                {pimpinan.map(p => (
                  <PengajarCard key={p.id} p={p} accent={accent} primary={primary} onClick={() => setSelected(p)} />
                ))}
              </div>
            </div>
          )}

          {/* Tim Pengajar */}
          {pengajarBiasa.length > 0 && (
            <div>
              {pimpinan.length > 0 && (
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
                  <span className="text-xs font-bold uppercase tracking-widest px-3" style={{ color: accent }}>
                    Tim Pengajar
                  </span>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {pengajarBiasa.map(p => (
                  <PengajarCard key={p.id} p={p} accent={accent} primary={primary} onClick={() => setSelected(p)} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Modal Detail */}
      {selected && (
        <PengajarModal p={selected} accent={accent} primary={primary} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
