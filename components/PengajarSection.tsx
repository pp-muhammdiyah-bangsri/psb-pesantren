"use client";
import { useState } from "react";
import { X, GraduationCap, BookOpen, Award, ArrowRight, UserCheck } from "lucide-react";
import { toDirectImageUrl } from "@/lib/mediaUtils";

export interface Pengajar {
  id: number;
  nama: string;
  jabatan: string;
  gelar?: string;
  gelar_depan?: string;
  gelar_belakang?: string;
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

export function formatNamaGelar(p: {
  nama: string;
  gelar_depan?: string;
  gelar_belakang?: string;
  gelar?: string;
}): string {
  let depan = (p.gelar_depan || "").trim();
  let belakang = (p.gelar_belakang || "").trim();

  // Jika data lama hanya mengisi field `gelar`
  if (!depan && !belakang && p.gelar) {
    const g = p.gelar.trim();
    const isPrefix = /^(kh|k\.h\.|kyai|dr|dr\.|drs|drs\.|dra|dra\.|prof|prof\.|ir|ir\.|ust|ust\.|ustadz|usth|usth\.|habib|gus|ning|tgk|buya)\b/i.test(g);
    if (isPrefix) {
      depan = g;
    } else {
      belakang = g;
    }
  }

  let hasil = p.nama.trim();
  if (depan) {
    hasil = `${depan} ${hasil}`;
  }
  if (belakang) {
    const cleanBelakang = belakang.replace(/^,\s*/, "");
    hasil = `${hasil}, ${cleanBelakang}`;
  }
  return hasil;
}

const DEFAULT_PENGAJAR: Pengajar[] = [
  {
    id: 1,
    nama: "Abdullah Maksum",
    jabatan: "Pengasuh & Pimpinan Pondok Pesantren",
    gelar_depan: "KH.",
    gelar_belakang: "M.Ag",
    bidang_studi: "Tafsir & Ulumul Qur'an",
    keterangan: "Pengasuh pondok dengan pengalaman lebih dari 25 tahun membina santri, mendalami keilmuan Islam klasik di pesantren salaf dan menyelesaikan pascasarjana di UIN Sunan Kalijaga.",
    foto_url: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=600",
    is_pimpinan: true,
    urutan: 1,
  },
  {
    id: 2,
    nama: "Muhammad Fauzan",
    jabatan: "Direktur Pendidikan & Kurikulum",
    gelar_depan: "Dr. H.",
    gelar_belakang: "Lc., M.A.",
    bidang_studi: "Bahasa Arab & Dirasah Islamiyah",
    keterangan: "Lulusan Fakultas Ushuluddin Universitas Al-Azhar Kairo, Mesir. Berdedikasi mengintegrasikan kurikulum agama klasik dan kurikulum formal modern.",
    foto_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600",
    is_pimpinan: true,
    urutan: 2,
  },
  {
    id: 3,
    nama: "Ridhwan",
    jabatan: "Kepala Halaqah Tahfidz Al-Qur'an",
    gelar_depan: "Ust.",
    gelar_belakang: "Al-Hafizh",
    bidang_studi: "Tahfidz 30 Juz & Qira'at",
    keterangan: "Hafizh Al-Qur'an 30 Juz bersanad muttashil ke Rasulullah SAW. Mengampu halaqah intensif tahfidz dan karantina qur'ani.",
    foto_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600",
    is_pimpinan: false,
    urutan: 3,
  },
  {
    id: 4,
    nama: "Maryam Nur Fadhilah",
    jabatan: "Pengasuh Asrama Putri & Bahasa",
    gelar_depan: "Usth.",
    gelar_belakang: "S.Pd.I",
    bidang_studi: "Bahasa Arab & Akhlaq",
    keterangan: "Alumnus PBA UIN, berfokus pada pembinaan karakter islami, adab harian santriwati, dan pembiasaan bi'ah lughawiyyah.",
    foto_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600",
    is_pimpinan: false,
    urutan: 4,
  },
  {
    id: 5,
    nama: "Fathurrahman",
    jabatan: "Koordinator Sains & IT Santri",
    gelar_depan: "Ust.",
    gelar_belakang: "S.Si",
    bidang_studi: "Matematika & Literasi Digital",
    keterangan: "Pembimbing olimpiade sains santri dan inisiator program literasi teknologi cerdas untuk santri modern.",
    foto_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=600",
    is_pimpinan: false,
    urutan: 5,
  },
  {
    id: 6,
    nama: "Syihabuddin",
    jabatan: "Pengajar Fiqih & Ibadah Praktis",
    gelar_depan: "Ust.",
    gelar_belakang: "S.H.I",
    bidang_studi: "Fiqih Madzhab Syafi'i",
    keterangan: "Mengampu kajian kitab fiqih dasar hingga menengah serta membimbing praktek ibadah harian santri secara mendalam.",
    foto_url: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=600",
    is_pimpinan: false,
    urutan: 6,
  },
];

function PengajarCard({ p, accent, primary, onClick }: {
  p: Pengajar;
  accent: string;
  primary: string;
  onClick: () => void;
}) {
  const [imgError, setImgError] = useState(false);
  const rawUrl = p.foto_url ? toDirectImageUrl(p.foto_url) : null;
  const showFoto = rawUrl && !imgError;
  const initials = p.nama.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
  const namaFormatted = formatNamaGelar(p);

  return (
    <div
      onClick={onClick}
      className="group relative bg-white rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl flex flex-col justify-between border"
      style={{
        borderColor: p.is_pimpinan ? `${accent}50` : "#f0f2f5",
        boxShadow: p.is_pimpinan
          ? `0 10px 30px ${accent}25`
          : "0 4px 20px rgba(0,0,0,0.06)",
      }}
    >
      {/* Frame Foto Potret */}
      <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-gradient-to-b from-gray-100 to-gray-200">
        {showFoto ? (
          <img
            src={rawUrl}
            alt={p.nama}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className="w-full h-full flex flex-col items-center justify-center p-6 text-white relative overflow-hidden"
            style={{
              background: p.is_pimpinan
                ? `linear-gradient(135deg, ${accent}, #a16207)`
                : `linear-gradient(135deg, ${primary}, #064e3b)`,
            }}
          >
            {/* Background geometric decorative circles */}
            <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-white/10 blur-xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-36 h-36 rounded-full bg-white/10 blur-xl pointer-events-none" />
            
            <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-3xl font-black bg-white/20 border-2 border-white/40 shadow-xl mb-2 backdrop-blur-sm">
              {initials}
            </div>
            <span className="text-xs font-semibold text-white/80 uppercase tracking-widest mt-1">
              Profil Asatidz
            </span>
          </div>
        )}

        {/* Floating Badge (Pimpinan / Pengajar) */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
          {p.is_pimpinan ? (
            <span
              className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-lg backdrop-blur-md"
              style={{
                background: "rgba(255, 255, 255, 0.95)",
                color: "#854d0e",
                border: `1.5px solid ${accent}`,
              }}
            >
              <Award size={13} className="text-amber-500 fill-amber-500" />
              Pimpinan Pondok
            </span>
          ) : (
            <span
              className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md backdrop-blur-md bg-white/90 text-gray-700"
            >
              <UserCheck size={12} style={{ color: primary }} />
              Tenaga Pendidik
            </span>
          )}
        </div>

        {/* Gradient shadow overlay at bottom of photo */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
      </div>

      {/* Card Content Body */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
        <div>
          {/* Jabatan Tag */}
          <p
            className="text-xs font-bold uppercase tracking-wide mb-1"
            style={{ color: p.is_pimpinan ? "#b45309" : primary }}
          >
            {p.jabatan}
          </p>

          {/* Nama Lengkap & Gelar */}
          <h3 className="font-extrabold text-base sm:text-lg text-gray-900 leading-snug group-hover:text-emerald-800 transition-colors line-clamp-2">
            {namaFormatted}
          </h3>

          {/* Bidang Studi */}
          {p.bidang_studi && (
            <div
              className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
              style={{
                background: p.is_pimpinan ? `${accent}15` : `${primary}10`,
                color: p.is_pimpinan ? "#854d0e" : primary,
              }}
            >
              <BookOpen size={12} className="shrink-0" />
              <span className="line-clamp-1">{p.bidang_studi}</span>
            </div>
          )}

          {/* Biografi Cuplikan */}
          {p.keterangan && (
            <p className="text-xs text-gray-500 mt-3 line-clamp-2 leading-relaxed">
              {p.keterangan}
            </p>
          )}
        </div>

        {/* Action Button Strip */}
        <div className="mt-5 pt-3.5 border-t border-gray-100 flex items-center justify-between text-xs font-bold transition-all" style={{ color: primary }}>
          <span>Lihat Profil Lengkap</span>
          <ArrowRight size={14} className="transform group-hover:translate-x-1.5 transition-transform" />
        </div>
      </div>
    </div>
  );
}

function PengajarModal({ p, accent, primary, onClose }: {
  p: Pengajar;
  accent: string;
  primary: string;
  onClose: () => void;
}) {
  const [imgError, setImgError] = useState(false);
  const rawUrl = p.foto_url ? toDirectImageUrl(p.foto_url) : null;
  const showFoto = rawUrl && !imgError;
  const initials = p.nama.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
  const namaFormatted = formatNamaGelar(p);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header with Photo / Banner */}
        <div className="relative h-60 w-full bg-gray-900">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors backdrop-blur-sm"
          >
            <X size={18} />
          </button>

          {showFoto ? (
            <img
              src={rawUrl}
              alt={p.nama}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover object-center"
            />
          ) : (
            <div
              className="w-full h-full flex flex-col items-center justify-center text-white p-6"
              style={{
                background: p.is_pimpinan
                  ? `linear-gradient(135deg, ${accent}, #a16207)`
                  : `linear-gradient(135deg, ${primary}, #064e3b)`,
              }}
            >
              <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-3xl font-black bg-white/20 border-2 border-white/40 shadow-xl mb-1">
                {initials}
              </div>
            </div>
          )}

          {/* Floating Badge in Modal */}
          {p.is_pimpinan && (
            <div className="absolute top-3 left-3 z-10">
              <span
                className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase px-3 py-1.5 rounded-full shadow-lg backdrop-blur-md"
                style={{ background: "#ffffff", color: "#854d0e", border: `1.5px solid ${accent}` }}
              >
                <Award size={14} className="text-amber-500 fill-amber-500" />
                Pimpinan Pondok
              </span>
            </div>
          )}

          {/* Vignette */}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />
          
          <div className="absolute bottom-3 left-5 right-5 text-white z-10">
            <p className="text-xs font-semibold text-white/80 uppercase tracking-wider">{p.jabatan}</p>
            <h2 className="text-xl font-black leading-tight drop-shadow-md">{namaFormatted}</h2>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {p.bidang_studi && (
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold"
              style={{ background: `${primary}12`, color: primary }}
            >
              <BookOpen size={14} />
              <span>Bidang Keahlian: {p.bidang_studi}</span>
            </div>
          )}

          {p.keterangan ? (
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Biografi & Riwayat Pendidikan
              </h4>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {p.keterangan}
              </p>
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic">Belum ada rincian biografi yang ditambahkan.</p>
          )}

          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-95 shadow-md"
            style={{ background: `linear-gradient(135deg, ${primary}, #1a6b2b)` }}
          >
            Tutup Profil
          </button>
        </div>
      </div>
    </div>
  );
}

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
      <section id="pengajar" className="py-24 px-4 sm:px-6 lg:px-8" style={{ background: "#f8fafb" }}>
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-16">
            <p className="text-xs sm:text-sm font-bold uppercase tracking-widest mb-2" style={{ color: accent }}>
              {config.pengajar_badge || "Dewan Asatidz & Pimpinan"}
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-3" style={{ color: primary }}>
              {config.pengajar_judul || "Diasuh oleh Tenaga Pendidik Berpengalaman & Bersanad"}
            </h2>
            <div className="w-20 h-1.5 mx-auto rounded-full mb-4" style={{ background: `linear-gradient(90deg, ${accent}, #f0d080)` }} />
            <p className="text-sm sm:text-base text-gray-500 max-w-2xl mx-auto leading-relaxed">
              {config.pengajar_deskripsi || "Mendidik dengan keteladanan, membimbing dengan keikhlasan. Menjamin mutu pendidikan akademik dan ketakwaan spiritual ananda."}
            </p>
          </div>

          {/* Baris Pimpinan Pondok */}
          {pimpinan.length > 0 && (
            <div className="mb-14">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-200 to-transparent" />
                <span
                  className="text-xs font-black uppercase tracking-widest px-4 py-1 rounded-full shadow-sm"
                  style={{ background: `${accent}20`, color: "#854d0e" }}
                >
                  Pimpinan Pondok Pesantren
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-200 to-transparent" />
              </div>

              <div className={`grid gap-6 ${
                pimpinan.length === 1
                  ? "max-w-sm mx-auto"
                  : pimpinan.length === 2
                  ? "grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto"
                  : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto"
              }`}>
                {pimpinan.map(p => (
                  <PengajarCard key={p.id} p={p} accent={accent} primary={primary} onClick={() => setSelected(p)} />
                ))}
              </div>
            </div>
          )}

          {/* Baris Tim Pengajar / Asatidz */}
          {pengajarBiasa.length > 0 && (
            <div>
              {pimpinan.length > 0 && (
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
                  <span className="text-xs font-bold uppercase tracking-widest px-4 py-1 rounded-full bg-gray-100 text-gray-600">
                    Tim Pengajar & Asatidz
                  </span>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {pengajarBiasa.map(p => (
                  <PengajarCard key={p.id} p={p} accent={accent} primary={primary} onClick={() => setSelected(p)} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Modal Detail Pop-up */}
      {selected && (
        <PengajarModal p={selected} accent={accent} primary={primary} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
