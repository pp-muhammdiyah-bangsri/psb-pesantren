"use client";
import { useState, useRef, useCallback } from "react";
import {
  LazyMotion,
  AnimatePresence,
  m,
  useMotionValue,
  useTransform,
  useReducedMotion,
  type PanInfo,
} from "framer-motion";
import {
  X,
  BookOpen,
  Award,
  ArrowUpRight,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  MoveHorizontal,
} from "lucide-react";
import { toDirectImageUrl } from "@/lib/mediaUtils";
import { buildPsbTheme, type PsbTheme } from "@/lib/themeUtils";
import ModalDialog from "@/components/ModalDialog";

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
    keterangan:
      "Pengasuh pondok dengan pengalaman lebih dari 25 tahun membina santri, mendalami keilmuan Islam klasik di pesantren salaf dan menyelesaikan pascasarjana di UIN Sunan Kalijaga.",
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
    keterangan:
      "Lulusan Fakultas Ushuluddin Universitas Al-Azhar Kairo, Mesir. Berdedikasi mengintegrasikan kurikulum agama klasik dan kurikulum formal modern.",
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
    keterangan:
      "Hafizh Al-Qur'an 30 Juz bersanad muttashil. Mengampu halaqah intensif tahfidz dan karantina qur'ani.",
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
    keterangan:
      "Alumnus PBA UIN, berfokus pada pembinaan karakter islami, adab harian santriwati, dan pembiasaan bi'ah lughawiyyah.",
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
    keterangan:
      "Pembimbing olimpiade sains santri dan inisiator program literasi teknologi cerdas untuk santri modern.",
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
    keterangan:
      "Mengampu kajian kitab fiqih dasar hingga menengah serta membimbing praktek ibadah harian santri secara mendalam.",
    is_pimpinan: false,
    urutan: 6,
  },
];

const loadMotionFeatures = () => import("framer-motion").then((mod) => mod.domMax);

function getInitials(nama: string): string {
  return nama
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function PengajarAvatarFallback({
  nama,
  isPimpinan,
  theme,
}: {
  nama: string;
  isPimpinan?: boolean;
  theme: PsbTheme;
}) {
  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center p-6 relative overflow-hidden"
      style={{
        background: isPimpinan
          ? `linear-gradient(145deg, ${theme.primaryDark}, ${theme.primary})`
          : `linear-gradient(145deg, ${theme.primary}, ${theme.primaryMid})`,
      }}
    >
      <div
        aria-hidden="true"
        className="w-24 h-24 rounded-2xl flex items-center justify-center text-3xl font-extrabold tracking-tight border border-white/25 bg-white/15 text-white mb-2.5"
      >
        {getInitials(nama)}
      </div>
      <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/75">
        {isPimpinan ? "Pimpinan Pondok" : "Dewan Asatidz"}
      </span>
    </div>
  );
}

function FrameCardContent({
  p,
  index,
  total,
  isFront,
  theme,
  onOpenModal,
}: {
  p: Pengajar;
  index: number;
  total: number;
  isFront: boolean;
  theme: PsbTheme;
  onOpenModal?: () => void;
}) {
  const [imgError, setImgError] = useState(false);
  const rawUrl = p.foto_url ? toDirectImageUrl(p.foto_url) : null;
  const showFoto = Boolean(rawUrl && !imgError);
  const namaFormatted = formatNamaGelar(p);

  return (
    <div
      className="h-full rounded-[1.75rem] p-2.5 sm:p-3 bg-white border"
      style={{
        borderColor: isFront ? theme.accent : "#e5e0d5",
        boxShadow: isFront
          ? `0 24px 48px -20px ${theme.primary}45, 0 0 0 1px ${theme.accent}55`
          : "0 10px 24px -12px rgba(0, 0, 0, 0.14)",
      }}
    >
      <div className="h-full rounded-[1.25rem] overflow-hidden border border-stone-200/90 bg-[#faf8f4] flex flex-col justify-between">
        <div className="flex-1 flex flex-col">
          <div className="p-2.5 pb-0">
            <div className="relative aspect-[4/3.8] w-full rounded-xl overflow-hidden bg-stone-100 border border-stone-200/70">
              {showFoto && rawUrl ? (
                <img
                  src={rawUrl}
                  alt={`Foto ${namaFormatted}`}
                  loading={isFront ? "eager" : "lazy"}
                  decoding="async"
                  draggable={false}
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover object-top pointer-events-none"
                />
              ) : (
                <PengajarAvatarFallback nama={p.nama} isPimpinan={p.is_pimpinan} theme={theme} />
              )}

              <div className="absolute top-2.5 left-2.5 z-10">
                {p.is_pimpinan ? (
                  <span
                    className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/95 shadow-sm border"
                    style={{ color: theme.accentTextOnLight, borderColor: `${theme.accent}80` }}
                  >
                    <Award size={11} aria-hidden="true" />
                    <span>Pimpinan Pondok</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/95 text-stone-700 shadow-sm">
                    <UserCheck size={11} style={{ color: theme.primary }} aria-hidden="true" />
                    <span>Tenaga Pendidik</span>
                  </span>
                )}
              </div>

              <span className="absolute bottom-2.5 right-2.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-black/65 text-white tabular-nums">
                {index + 1} / {total}
              </span>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center p-4 sm:p-5 space-y-2 text-center">
            <p
              className="text-[11px] font-bold uppercase tracking-[0.14em] line-clamp-2"
              style={{ color: p.is_pimpinan ? theme.accentTextOnLight : theme.primary }}
            >
              {p.jabatan}
            </p>

            <h3 className="font-display font-bold text-xl text-stone-900 leading-snug line-clamp-2">
              {namaFormatted}
            </h3>

            {p.bidang_studi && (
              <div
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold max-w-full mx-auto"
                style={{
                  backgroundColor: p.is_pimpinan ? `${theme.accent}22` : theme.primarySoft,
                  color: p.is_pimpinan ? theme.accentTextOnLight : theme.primary,
                }}
              >
                <BookOpen size={12} className="shrink-0" aria-hidden="true" />
                <span className="line-clamp-1">{p.bidang_studi}</span>
              </div>
            )}

            {p.keterangan && (
              <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed pt-0.5">
                {p.keterangan}
              </p>
            )}
          </div>
        </div>

        <div className="border-t border-stone-200/70 bg-white shrink-0">
          <button
            type="button"
            tabIndex={isFront ? 0 : -1}
            onPointerDownCapture={(e) => e.stopPropagation()}
            onClick={onOpenModal}
            className="w-full px-5 py-3 flex items-center justify-center gap-1.5 text-xs font-bold hover:bg-stone-50 transition-colors cursor-pointer"
            style={{ color: theme.primary }}
          >
            <span>Lihat Profil Lengkap</span>
            <ArrowUpRight size={14} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}

const FRONT_CARD_VARIANTS = {
  enter: ({ dir, reduced }: { dir: number; reduced: boolean }) =>
    reduced
      ? { x: dir >= 0 ? 48 : -48, y: 0, scale: 1, rotate: 0, opacity: 0 }
      : dir >= 0
      ? { x: 0, y: 12, scale: 0.955, rotate: 2.1, opacity: 0.86 }
      : { x: -340, y: 0, scale: 0.95, rotate: -10, opacity: 0 },
  center: ({ reduced }: { dir: number; reduced: boolean }) => ({
    x: 0,
    y: 0,
    scale: 1,
    rotate: 0,
    opacity: 1,
    transition: reduced
      ? { duration: 0.36, ease: [0.22, 1, 0.36, 1] as const }
      : { type: "spring" as const, stiffness: 150, damping: 22, mass: 1.05 },
  }),
  exit: ({ dir, reduced }: { dir: number; reduced: boolean }) =>
    reduced
      ? {
          x: dir >= 0 ? -56 : 56,
          opacity: 0,
          transition: { duration: 0.34, ease: [0.22, 1, 0.36, 1] as const },
        }
      : {
          x: dir >= 0 ? -360 : 360,
          rotate: dir >= 0 ? -12 : 12,
          opacity: 0,
          scale: 0.94,
          transition: { duration: 0.52, ease: [0.22, 1, 0.36, 1] as const },
        },
};

function FrontStackCard({
  p,
  index,
  total,
  theme,
  swipeDir,
  reducedMotion,
  onSwipe,
  onOpenModal,
}: {
  p: Pengajar;
  index: number;
  total: number;
  theme: PsbTheme;
  swipeDir: 1 | -1;
  reducedMotion: boolean;
  onSwipe: (direction: 1 | -1) => void;
  onOpenModal: () => void;
}) {
  const dragX = useMotionValue(0);
  const dragRotate = useTransform(dragX, [-220, 0, 220], reducedMotion ? [0, 0, 0] : [-9, 0, 9]);
  const wasDraggedRef = useRef(false);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipedFarEnough = Math.abs(info.offset.x) > 65;
    const swipedFastEnough = Math.abs(info.velocity.x) > 360;

    if (swipedFarEnough || swipedFastEnough) {
      const direction: 1 | -1 = info.offset.x < 0 || info.velocity.x < 0 ? 1 : -1;
      onSwipe(direction);
    }
    window.setTimeout(() => {
      wasDraggedRef.current = false;
    }, 60);
  };

  return (
    <m.div
      role="group"
      aria-roledescription="slide"
      aria-label={`${index + 1} dari ${total}: ${formatNamaGelar(p)}`}
      style={{
        zIndex: 30,
        x: dragX,
        rotate: dragRotate,
        touchAction: "pan-y",
      }}
      custom={{ dir: swipeDir, reduced: reducedMotion }}
      variants={FRONT_CARD_VARIANTS}
      initial="enter"
      animate="center"
      exit="exit"
      drag={total > 1 ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.48}
      dragTransition={{ bounceStiffness: 170, bounceDamping: 22 }}
      whileDrag={reducedMotion ? { cursor: "grabbing" } : { scale: 1.02, cursor: "grabbing" }}
      onDragStart={() => {
        wasDraggedRef.current = true;
      }}
      onDragEnd={handleDragEnd}
      className={`absolute inset-0 select-none ${total > 1 ? "cursor-grab" : ""}`}
    >
      <FrameCardContent
        p={p}
        index={index}
        total={total}
        isFront
        theme={theme}
        onOpenModal={() => {
          if (!wasDraggedRef.current) onOpenModal();
        }}
      />
    </m.div>
  );
}

function PengajarModal({
  p,
  theme,
  onClose,
}: {
  p: Pengajar | null;
  theme: PsbTheme;
  onClose: () => void;
}) {
  const [imgError, setImgError] = useState(false);

  if (!p) {
    return (
      <ModalDialog open={false} onClose={onClose} ariaLabel="Profil Pengajar">
        {null}
      </ModalDialog>
    );
  }

  const rawUrl = p.foto_url ? toDirectImageUrl(p.foto_url) : null;
  const showFoto = Boolean(rawUrl && !imgError);
  const namaFormatted = formatNamaGelar(p);

  return (
    <ModalDialog
      open={Boolean(p)}
      onClose={onClose}
      labelledBy="pengajar-modal-title"
      className="w-full max-w-md"
    >
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200">
        <div className="relative h-72 w-full bg-stone-900">
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup profil pengajar"
            className="absolute top-3 right-3 z-20 min-w-10 min-h-10 rounded-full bg-black/55 hover:bg-black/75 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X size={18} aria-hidden="true" />
          </button>

          {showFoto && rawUrl ? (
            <img
              src={rawUrl}
              alt={`Foto ${namaFormatted}`}
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="w-full h-full object-cover object-[50%_20%]"
            />
          ) : (
            <PengajarAvatarFallback nama={p.nama} isPimpinan={p.is_pimpinan} theme={theme} />
          )}

          {p.is_pimpinan && (
            <div className="absolute top-3 left-3 z-10">
              <span
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase px-3 py-1 rounded-full bg-white shadow-sm border"
                style={{ color: theme.accentTextOnLight, borderColor: theme.accent }}
              >
                <Award size={13} aria-hidden="true" />
                <span>Pimpinan Pondok</span>
              </span>
            </div>
          )}

          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/85 via-black/45 to-transparent"
          />

          <div className="absolute bottom-3.5 left-5 right-5 text-white z-10">
            <p className="text-xs font-semibold text-white/80 uppercase tracking-wider">
              {p.jabatan}
            </p>
            <h3 id="pengajar-modal-title" className="text-xl font-bold leading-tight mt-0.5">
              {namaFormatted}
            </h3>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {p.bidang_studi && (
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold"
              style={{ backgroundColor: theme.primarySoft, color: theme.primary }}
            >
              <BookOpen size={14} aria-hidden="true" />
              <span>Bidang Keahlian: {p.bidang_studi}</span>
            </div>
          )}

          {p.keterangan ? (
            <div className="bg-[#faf8f4] rounded-2xl p-4 border border-stone-200/80">
              <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                Biografi &amp; Riwayat
              </h4>
              <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-line">
                {p.keterangan}
              </p>
            </div>
          ) : (
            <p className="text-xs text-stone-500 italic">
              Belum ada rincian biografi yang ditambahkan.
            </p>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-95 cursor-pointer"
            style={{ backgroundColor: theme.primary }}
          >
            Tutup Profil
          </button>
        </div>
      </div>
    </ModalDialog>
  );
}

export default function PengajarSection({ pengajar, config }: PengajarSectionProps) {
  const [selected, setSelected] = useState<Pengajar | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [swipeDir, setSwipeDir] = useState<1 | -1>(1);
  const [statusMessage, setStatusMessage] = useState("");
  const reducedMotion = Boolean(useReducedMotion());

  const theme = buildPsbTheme(config);

  const rawList = pengajar && pengajar.length > 0 ? pengajar : DEFAULT_PENGAJAR;
  const orderedList = [
    ...rawList.filter((p) => p.is_pimpinan),
    ...rawList.filter((p) => !p.is_pimpinan),
  ];
  const total = orderedList.length;

  const goToIndex = useCallback(
    (nextIdx: number, direction: 1 | -1) => {
      if (total <= 1) return;
      const wrapped = ((nextIdx % total) + total) % total;
      setSwipeDir(direction);
      setActiveIndex(wrapped);
      if (orderedList[wrapped]) {
        setStatusMessage(
          `Menampilkan bingkai ${wrapped + 1} dari ${total}: ${formatNamaGelar(orderedList[wrapped])}`
        );
      }
    },
    [orderedList, total]
  );

  const handleStep = useCallback(
    (direction: 1 | -1) => {
      goToIndex(activeIndex + direction, direction);
    },
    [activeIndex, goToIndex]
  );

  if (config.tampilkan_pengajar === "false" || total === 0) return null;

  const frontItem = orderedList[activeIndex];
  const backCount = Math.min(3, Math.max(0, total - 1));
  const backStack = Array.from({ length: backCount }, (_, i) => {
    const offset = i + 1;
    const idx = (activeIndex + offset) % total;
    return { item: orderedList[idx], index: idx, offset };
  });

  return (
    <LazyMotion features={loadMotionFeatures}>
      <section
          id="pengajar"
          aria-roledescription="carousel"
          aria-label="Tumpukan Bingkai Dewan Asatidz dan Pimpinan"
          className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#faf8f4] overflow-hidden"
        >
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              {/* Kolom Kiri: Editorial Info */}
              <div className="lg:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-left space-y-5">
                <div className="space-y-3">
                  <p
                    className="text-xs font-bold uppercase tracking-[0.18em]"
                    style={{ color: theme.accentTextOnLight }}
                  >
                    {config.pengajar_badge || "Dewan Asatidz & Pimpinan"}
                  </p>
                  <h2
                    className="font-display text-3xl sm:text-4xl font-bold leading-tight"
                    style={{ color: theme.primary }}
                  >
                    {config.pengajar_judul ||
                      "Diasuh oleh Tenaga Pendidik Berpengalaman & Bersanad"}
                  </h2>
                  <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
                    {config.pengajar_deskripsi ||
                      "Geser tumpukan bingkai ke kiri atau kanan untuk mengenal profil pimpinan dan asatidz pengajar."}
                  </p>
                </div>

                {total > 1 && (
                  <p className="inline-flex items-center gap-2 text-xs text-stone-600 font-medium px-3.5 py-2 rounded-full bg-white border border-stone-200/80">
                    <MoveHorizontal size={15} style={{ color: theme.primary }} aria-hidden="true" />
                    <span>Tarik bingkai atau klik panah di sisi kartu ({activeIndex + 1}/{total})</span>
                  </p>
                )}
              </div>

              {/* Kolom Kanan: Tumpukan Bingkai Kartu + Panah Kiri/Kanan + Titik di Bawah */}
              <div className="lg:col-span-7 flex flex-col items-center">
                <div className="relative w-full max-w-[355px] sm:max-w-[395px] mx-auto">
                  {total > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleStep(-1)}
                        aria-label="Bingkai pengajar sebelumnya"
                        className="absolute -left-2.5 sm:-left-16 top-[165px] sm:top-1/2 -translate-y-1/2 z-40 min-w-11 min-h-11 rounded-full bg-white/95 border border-stone-300 text-stone-800 flex items-center justify-center shadow-md transition-all hover:bg-white hover:border-stone-400 active:scale-95 cursor-pointer"
                      >
                        <ChevronLeft size={20} aria-hidden="true" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStep(1)}
                        aria-label="Bingkai pengajar berikutnya"
                        className="absolute -right-2.5 sm:-right-16 top-[165px] sm:top-1/2 -translate-y-1/2 z-40 min-w-11 min-h-11 rounded-full text-white flex items-center justify-center shadow-md transition-all hover:opacity-95 active:scale-95 cursor-pointer border border-black/10"
                        style={{ backgroundColor: theme.primary }}
                      >
                        <ChevronRight size={20} aria-hidden="true" />
                      </button>
                    </>
                  )}

                  <div
                    role="region"
                    aria-label="Tumpukan kartu profil pengajar"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowLeft") {
                        e.preventDefault();
                        handleStep(-1);
                      } else if (e.key === "ArrowRight") {
                        e.preventDefault();
                        handleStep(1);
                      }
                    }}
                    className="relative w-full h-[505px] sm:h-[535px]"
                  >
                    {/* Lapisan kartu di belakang tumpukan */}
                    {backStack.map(({ item, index, offset }) => {
                      const targetY = offset * 12;
                      const targetX = offset % 2 === 1 ? offset * 8 : -offset * 6;
                      const targetScale = 1 - offset * 0.045;
                      const targetRotate = offset % 2 === 1 ? offset * 2.1 : -offset * 2.1;
                      const targetOpacity = Math.max(0.55, 1 - offset * 0.16);

                      return (
                        <m.div
                          key={`bg-${item.id}`}
                          aria-hidden="true"
                          style={{ zIndex: 20 - offset }}
                          initial={false}
                          animate={{
                            x: targetX,
                            y: targetY,
                            scale: targetScale,
                            rotate: targetRotate,
                            opacity: targetOpacity,
                          }}
                          transition={
                            reducedMotion
                              ? { duration: 0.34, ease: [0.22, 1, 0.36, 1] }
                              : { type: "spring", stiffness: 140, damping: 22, mass: 1.05 }
                          }
                          className="absolute inset-0 pointer-events-none select-none"
                        >
                          <FrameCardContent
                            p={item}
                            index={index}
                            total={total}
                            isFront={false}
                            theme={theme}
                          />
                        </m.div>
                      );
                    })}

                    {/* Kartu paling depan yang bisa di-drag / swipe */}
                    <AnimatePresence initial={false} custom={{ dir: swipeDir, reduced: reducedMotion }}>
                      <FrontStackCard
                        key={frontItem.id}
                        p={frontItem}
                        index={activeIndex}
                        total={total}
                        theme={theme}
                        swipeDir={swipeDir}
                        reducedMotion={reducedMotion}
                        onSwipe={handleStep}
                        onOpenModal={() => setSelected(frontItem)}
                      />
                    </AnimatePresence>
                  </div>
                </div>

                {/* Marker Dots di bawah card foto */}
                {total > 1 && (
                  <nav aria-label="Pilih bingkai pengajar" className="mt-11 max-w-full">
                    <ul className="flex items-center justify-center gap-0.5 flex-wrap">
                      {orderedList.map((p, idx) => {
                        const isActive = idx === activeIndex;
                        return (
                          <li key={p.id}>
                            <button
                              type="button"
                              onClick={() => goToIndex(idx, idx > activeIndex ? 1 : -1)}
                              aria-label={`Bingkai ${idx + 1}: ${formatNamaGelar(p)}`}
                              aria-current={isActive ? "true" : undefined}
                              className="min-w-5 min-h-6 px-0.5 py-2 flex items-center justify-center cursor-pointer"
                            >
                              <span
                                aria-hidden="true"
                                className="block h-2 rounded-full transition-all duration-200"
                                style={{
                                  width: isActive ? "1.35rem" : "0.45rem",
                                  backgroundColor: isActive ? theme.primary : "#d6d3d1",
                                  border: isActive
                                    ? `1px solid ${theme.primaryDark}`
                                    : "1px solid transparent",
                                }}
                              />
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </nav>
                )}
              </div>
            </div>
          </div>

          <p className="visually-hidden" role="status" aria-live="polite">
            {statusMessage}
          </p>
        </section>

        <PengajarModal p={selected} theme={theme} onClose={() => setSelected(null)} />
    </LazyMotion>
  );
}
