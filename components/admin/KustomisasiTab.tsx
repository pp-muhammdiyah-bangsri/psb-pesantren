"use client";
import { useState } from "react";
import {
  BookOpen,
  Palette,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  Save,
  Upload,
  ImageOff,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  FileCheck,
  Users,
  Calendar,
  LayoutTemplate,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";
import { toDirectImageUrl, parseMediaUrl } from "@/lib/mediaUtils";
import { parseGoogleMapsEmbedUrl, getMapsInputStatus } from "@/lib/mapsHelper";
import { buildPsbTheme } from "@/lib/themeUtils";

const THEME_PRESETS = [
  { name: "Pesantren Emerald", primer: "#0f4c1e", aksen: "#c8a84b", desc: "Hijau Islami & Emas" },
  { name: "Bahari Nusantara", primer: "#1e3a8a", aksen: "#eab308", desc: "Biru Navy & Emas" },
  { name: "Kubah Nabawi", primer: "#0f766e", aksen: "#d97706", desc: "Toska & Amber" },
  { name: "Marun Andalusia", primer: "#831843", aksen: "#d4a373", desc: "Marun & Rose Gold" },
  { name: "Hutan Rabbani", primer: "#14532d", aksen: "#f59e0b", desc: "Forest & Amber" },
  { name: "Royal Kesultanan", primer: "#1d4ed8", aksen: "#c8a84b", desc: "Biru Safir & Emas" },
  { name: "Pesantren Salaf", primer: "#5c3d2e", aksen: "#c8a84b", desc: "Coklat Kayu & Emas" },
  { name: "Zaitun Earthy", primer: "#2d503d", aksen: "#ea580c", desc: "Sage & Terracotta" },
  { name: "Kasturi Royal", primer: "#581c87", aksen: "#eab308", desc: "Ungu & Emas" },
  { name: "Modern Charcoal", primer: "#334155", aksen: "#0d9488", desc: "Slate & Cyan" },
  { name: "Midnight Onyx", primer: "#18181b", aksen: "#eab308", desc: "Hitam & Gold" },
  { name: "Crimson Al-Aqsa", primer: "#991b1b", aksen: "#fbbf24", desc: "Crimson & Emas" },
];

const COLOR_PRESETS_PRIMARY = [
  { name: "Hijau Emerald", hex: "#0f4c1e" },
  { name: "Hijau Forest", hex: "#14532d" },
  { name: "Hijau Sage", hex: "#2d503d" },
  { name: "Toska Nabawi", hex: "#0f766e" },
  { name: "Biru Navy", hex: "#1e3a8a" },
  { name: "Biru Safir", hex: "#1d4ed8" },
  { name: "Biru Ocean", hex: "#0369a1" },
  { name: "Merah Marun", hex: "#831843" },
  { name: "Merah Burgundy", hex: "#991b1b" },
  { name: "Coklat Moka", hex: "#5c3d2e" },
  { name: "Ungu Royal", hex: "#581c87" },
  { name: "Slate Charcoal", hex: "#334155" },
];

const COLOR_PRESETS_ACCENT = [
  { name: "Emas Islami", hex: "#c8a84b" },
  { name: "Emas Cerah", hex: "#eab308" },
  { name: "Amber", hex: "#d97706" },
  { name: "Oranye", hex: "#ea580c" },
  { name: "Rose Gold", hex: "#d4a373" },
  { name: "Cyan Teal", hex: "#0d9488" },
  { name: "Emerald Mint", hex: "#10b981" },
  { name: "Sky Blue", hex: "#0284c7" },
];

type SubSection = "hero" | "warna" | "profil" | "bagian" | "syarat";

interface KustomisasiTabProps {
  config: Record<string, string>;
  onChange: (key: string, val: string) => void;
  onSave: () => Promise<void>;
  saving: boolean;
  msg: string;
  onClearMsg: () => void;
}

const INPUT_CLS =
  "w-full min-h-10 border border-stone-300 rounded-xl px-3.5 py-2 text-sm text-stone-900 placeholder:text-stone-400 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600";

function PhotoFieldWithUpload({
  id,
  label,
  helper,
  value,
  placeholder,
  folder,
  onChange,
}: {
  id: string;
  label: string;
  helper: string;
  value: string;
  placeholder: string;
  folder: "hero" | "logo";
  onChange: (val: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [previewErr, setPreviewErr] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError("");
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("folder", folder);
      const res = await fetch("/api/psb/upload", { method: "POST", body: form });
      const d = await res.json();
      if (!d.ok) {
        setUploadError(d.error || "Upload gagal.");
        return;
      }
      setPreviewErr(false);
      onChange(d.url);
    } catch {
      setUploadError("Gagal mengunggah foto ke server.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const directUrl = value ? toDirectImageUrl(value) : "";

  return (
    <div className="rounded-2xl border border-stone-200 bg-stone-50/60 p-4 space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <label htmlFor={id} className="text-xs font-bold text-stone-800">
          {label}
        </label>
        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 cursor-pointer transition-colors">
          <Upload size={13} aria-hidden="true" />
          <span>{uploading ? "Mengunggah..." : "Upload Foto"}</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFile}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => {
          setPreviewErr(false);
          onChange(e.target.value);
        }}
        placeholder={placeholder}
        className={INPUT_CLS}
      />

      <p className="text-[11px] text-stone-500 leading-relaxed">{helper}</p>

      {uploadError && (
        <p role="alert" className="text-xs font-medium text-red-600">
          {uploadError}
        </p>
      )}

      {value && (
        <div className="flex items-center gap-3 p-2.5 bg-white rounded-xl border border-stone-200">
          <div className="w-16 h-12 rounded-lg overflow-hidden bg-stone-100 border border-stone-200 shrink-0 flex items-center justify-center">
            {!previewErr && directUrl ? (
              <img
                src={directUrl}
                alt={`Pratinjau ${label}`}
                referrerPolicy="no-referrer"
                onError={() => setPreviewErr(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <ImageOff size={16} className="text-stone-400" aria-hidden="true" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold text-stone-800 truncate">{value}</p>
            <p className="text-[11px] text-stone-500">
              {previewErr ? "Gambar gagal dimuat — periksa kembali URL." : "Siap ditampilkan di website."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label={`Hapus ${label}`}
            className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <X size={15} aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function KustomisasiTab({
  config,
  onChange,
  onSave,
  saving,
  msg,
  onClearMsg,
}: KustomisasiTabProps) {
  const [subTab, setSubTab] = useState<SubSection>("hero");
  const [showManualColors, setShowManualColors] = useState(false);

  const theme = buildPsbTheme(config);
  const primaryColor = theme.primary;
  const accentColor = theme.accent;

  const subTabs: { id: SubSection; label: string; icon: typeof LayoutTemplate }[] = [
    { id: "hero", label: "Hero & 2 Foto", icon: LayoutTemplate },
    { id: "warna", label: "Tema Warna", icon: Palette },
    { id: "profil", label: "Profil, Program & Asatidz", icon: BookOpen },
    { id: "bagian", label: "Galeri, Jadwal, Lokasi & Footer", icon: MapPin },
    { id: "syarat", label: "Syarat PSB", icon: FileCheck },
  ];

  const heroRightPreview = config.hero_bg_url ? toDirectImageUrl(config.hero_bg_url) : "";
  const heroLeftPreview = config.hero_bg_2_url ? toDirectImageUrl(config.hero_bg_2_url) : "";

  return (
    <div className="space-y-5">
      {/* Banner Feedback */}
      {msg && (
        <div
          role="status"
          className={`p-4 rounded-2xl text-sm font-semibold flex items-center justify-between gap-3 border shadow-xs ${
            msg.includes("berhasil")
              ? "bg-emerald-50 text-emerald-900 border-emerald-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          <span>{msg}</span>
          <button
            type="button"
            onClick={onClearMsg}
            aria-label="Tutup notifikasi"
            className="text-stone-500 hover:text-stone-800 p-1 rounded-lg cursor-pointer"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Sub-navigation + Top Save CTA */}
      <div className="bg-white rounded-2xl border border-stone-200 p-3 sm:p-4 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div
          role="tablist"
          aria-label="Kategori Kustomisasi Landing Page"
          className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0"
        >
          {subTabs.map(({ id, label, icon: Icon }) => {
            const active = subTab === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSubTab(id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  active
                    ? "text-white shadow-xs"
                    : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                }`}
                style={active ? { backgroundColor: primaryColor } : undefined}
              >
                <Icon size={14} aria-hidden="true" />
                <span>{label}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 min-h-10 px-5 py-2 rounded-xl text-xs font-bold text-white shadow-sm hover:opacity-95 disabled:opacity-60 shrink-0 cursor-pointer"
          style={{ backgroundColor: primaryColor }}
        >
          <Save size={15} aria-hidden="true" />
          <span>{saving ? "Menyimpan..." : "Simpan Perubahan"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form Area (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* ═════════ SUBTAB 1: HERO, IDENTITAS & 2 FOTO POKER HAND ═════════ */}
          {subTab === "hero" && (
            <>
              <section className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-stone-200 space-y-5">
                <div className="pb-3 border-b border-stone-100">
                  <h2 className="text-base font-bold text-stone-900">1. Identitas &amp; Navbar Pesantren</h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Mengatur nama pondok, logo di navbar/footer, dan subjudul bagian atas halaman.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label htmlFor="cfg-nama-pesantren" className="block text-xs font-bold text-stone-700 mb-1.5">
                      Nama Lengkap Pesantren *
                    </label>
                    <input
                      id="cfg-nama-pesantren"
                      type="text"
                      value={config.nama_pesantren || ""}
                      onChange={(e) => onChange("nama_pesantren", e.target.value)}
                      placeholder="Contoh: Pondok Pesantren Muhammadiyah Bangsri"
                      className={INPUT_CLS}
                    />
                  </div>

                  <div>
                    <label htmlFor="cfg-nama-singkat" className="block text-xs font-bold text-stone-700 mb-1.5">
                      Nama Singkat (Navbar)
                    </label>
                    <input
                      id="cfg-nama-singkat"
                      type="text"
                      value={config.nama_singkat || ""}
                      onChange={(e) => onChange("nama_singkat", e.target.value)}
                      placeholder="Contoh: PP Muhammadiyah Bangsri"
                      className={INPUT_CLS}
                    />
                  </div>

                  <div>
                    <label htmlFor="cfg-navbar-sub" className="block text-xs font-bold text-stone-700 mb-1.5">
                      Subjudul Navbar
                    </label>
                    <input
                      id="cfg-navbar-sub"
                      type="text"
                      value={config.navbar_sub || ""}
                      onChange={(e) => onChange("navbar_sub", e.target.value)}
                      placeholder="Default: Penerimaan Santri Baru"
                      className={INPUT_CLS}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <PhotoFieldWithUpload
                      id="cfg-logo-url"
                      label="Logo Pesantren (Navbar & Footer)"
                      helper="Upload file PNG/JPG (maks 1MB) atau tempel URL / link Google Drive logo."
                      value={config.logo_url || ""}
                      placeholder="https://.../logo-pesantren.png"
                      folder="logo"
                      onChange={(val) => onChange("logo_url", val)}
                    />
                  </div>
                </div>
              </section>

              <section className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-stone-200 space-y-5">
                <div className="pb-3 border-b border-stone-100">
                  <h2 className="text-base font-bold text-stone-900">
                    2. Dua Kartu Foto Hero (Model Kartu Poker Huruf V)
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Kedua foto ini tampil berdampingan miring membentuk huruf V di bagian paling atas landing page. Pengunjung bisa mengklik kartu mana saja untuk membawanya ke depan.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Kartu Kanan / Depan */}
                  <div className="space-y-3">
                    <PhotoFieldWithUpload
                      id="cfg-hero-bg-1"
                      label="Foto Hero #1 — Kartu Depan / Kanan *"
                      helper="Foto utama pondok (gedung/masjid/suasana). Bisa upload langsung atau pakai link Google Drive."
                      value={config.hero_bg_url || ""}
                      placeholder="https://.../foto-utama-hero.jpg"
                      folder="hero"
                      onChange={(val) => onChange("hero_bg_url", val)}
                    />
                    <div>
                      <label htmlFor="cfg-hero-caption-1" className="block text-xs font-bold text-stone-700 mb-1.5">
                        Keterangan Foto Hero #1 (1 label custom di kartu depan)
                      </label>
                      <input
                        id="cfg-hero-caption-1"
                        type="text"
                        value={config.hero_foto_caption || ""}
                        onChange={(e) => onChange("hero_foto_caption", e.target.value)}
                        placeholder="Default: Suasana Pondok Pesantren"
                        className={INPUT_CLS}
                      />
                    </div>
                  </div>

                  {/* Kartu Kiri / Pendamping */}
                  <div className="pt-4 border-t border-stone-100 space-y-3">
                    <PhotoFieldWithUpload
                      id="cfg-hero-bg-2"
                      label="Foto Hero #2 — Kartu Kiri (Pendamping)"
                      helper="Jika dikosongkan, sistem otomatis mengambil 1 foto dari Galeri atau cuplikan Video Profil."
                      value={config.hero_bg_2_url || ""}
                      placeholder="https://.../foto-pendamping-hero.jpg"
                      folder="hero"
                      onChange={(val) => onChange("hero_bg_2_url", val)}
                    />
                    <div>
                      <label htmlFor="cfg-hero-caption-2" className="block text-xs font-bold text-stone-700 mb-1.5">
                        Keterangan Foto Hero #2 (Opsional)
                      </label>
                      <input
                        id="cfg-hero-caption-2"
                        type="text"
                        value={config.hero_foto_caption_2 || ""}
                        onChange={(e) => onChange("hero_foto_caption_2", e.target.value)}
                        placeholder="Contoh: Kajian Kitab & Tahfidz Al-Qur'an (kosongkan jika tidak perlu)"
                        className={INPUT_CLS}
                      />
                    </div>
                  </div>
                </div>
              </section>

              <section className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-stone-200 space-y-5">
                <div className="pb-3 border-b border-stone-100">
                  <h2 className="text-base font-bold text-stone-900">3. Teks Utama &amp; Statistik Hero</h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Mengatur judul slogan, badge status, dan 3 statistik ringkas Hero.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label htmlFor="cfg-tagline" className="block text-xs font-bold text-stone-700 mb-1.5">
                      Tagline / Moto di Bawah Judul
                    </label>
                    <input
                      id="cfg-tagline"
                      type="text"
                      value={config.tagline || ""}
                      onChange={(e) => onChange("tagline", e.target.value)}
                      placeholder="Contoh: Pinter Ngaji, Akhlak Terpuji, Berprestasi"
                      className={INPUT_CLS}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="cfg-hero-badge" className="block text-xs font-bold text-stone-700 mb-1.5">
                      Badge Atas Hero (Saat belum ada gelombang aktif)
                    </label>
                    <input
                      id="cfg-hero-badge"
                      type="text"
                      value={config.hero_badge || ""}
                      onChange={(e) => onChange("hero_badge", e.target.value)}
                      placeholder="Default: Penerimaan Santri Baru"
                      className={INPUT_CLS}
                    />
                  </div>

                  <div>
                    <label htmlFor="cfg-tahun-berdiri" className="block text-xs font-bold text-stone-700 mb-1.5">
                      Statistik 1: Tahun Berdiri
                    </label>
                    <input
                      id="cfg-tahun-berdiri"
                      type="text"
                      value={config.tahun_berdiri || ""}
                      onChange={(e) => onChange("tahun_berdiri", e.target.value)}
                      placeholder="Contoh: 2020"
                      className={INPUT_CLS}
                    />
                  </div>

                  <div>
                    <label htmlFor="cfg-jumlah-santri" className="block text-xs font-bold text-stone-700 mb-1.5">
                      Statistik 2: Santri Aktif
                    </label>
                    <input
                      id="cfg-jumlah-santri"
                      type="text"
                      value={config.jumlah_santri || ""}
                      onChange={(e) => onChange("jumlah_santri", e.target.value)}
                      placeholder="Contoh: 100+"
                      className={INPUT_CLS}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="cfg-program-pendidikan" className="block text-xs font-bold text-stone-700 mb-1.5">
                      Statistik 3: Fokus Program Studi (pisah dengan koma)
                    </label>
                    <input
                      id="cfg-program-pendidikan"
                      type="text"
                      value={config.program_pendidikan || ""}
                      onChange={(e) => onChange("program_pendidikan", e.target.value)}
                      placeholder="Contoh: Program Kaderisasi Ulama, Tahfidz al-Qur'an, Qiratu al-Kutub"
                      className={INPUT_CLS}
                    />
                    <span className="text-[11px] text-stone-500 block mt-1">
                      Jumlah item yang dipisah koma otomatis tampil sebagai &ldquo;X Fokus Program Studi&rdquo; di kotak statistik Hero.
                    </span>
                  </div>
                </div>
              </section>
            </>
          )}

          {/* ═════════ SUBTAB 2: TEMA WARNA ═════════ */}
          {subTab === "warna" && (
            <section className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-stone-200 space-y-6">
              <div className="pb-3 border-b border-stone-100">
                <h2 className="text-base font-bold text-stone-900">Palet Tema Warna Website</h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Pilih tema siap pakai 1-klik yang otomatis kontras aman di tombol &amp; banner.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {THEME_PRESETS.map((t) => {
                  const isSelected =
                    config.warna_primer === t.primer && config.warna_aksen === t.aksen;
                  return (
                    <button
                      key={t.name}
                      type="button"
                      onClick={() => {
                        onChange("warna_primer", t.primer);
                        onChange("warna_aksen", t.aksen);
                      }}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? "bg-white border-emerald-700 ring-2 ring-emerald-600/25 shadow-sm"
                          : "bg-stone-50/70 border-stone-200 hover:bg-white hover:border-stone-300"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-2">
                        <span
                          className="w-5 h-5 rounded-full border border-black/15 shrink-0"
                          style={{ background: t.primer }}
                        />
                        <span
                          className="w-4 h-4 rounded-full border border-black/15 shrink-0"
                          style={{ background: t.aksen }}
                        />
                      </div>
                      <p className="text-xs font-bold text-stone-900 truncate">{t.name}</p>
                      <p className="text-[11px] text-stone-500 truncate mt-0.5">{t.desc}</p>
                    </button>
                  );
                })}
              </div>

              {/* Disclosure untuk warna manual */}
              <div className="border border-stone-200 rounded-2xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowManualColors((v) => !v)}
                  aria-expanded={showManualColors}
                  className="w-full px-4 py-3 bg-stone-50 hover:bg-stone-100 flex items-center justify-between text-xs font-bold text-stone-800 cursor-pointer"
                >
                  <span>Kustomisasi Warna Manual (Hex / Swatch)</span>
                  {showManualColors ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {showManualColors && (
                  <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-6 bg-white">
                    <div className="space-y-3">
                      <label htmlFor="cfg-primer-hex" className="block text-xs font-bold text-stone-700">
                        Warna Primer
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          aria-label="Pilih warna primer"
                          value={config.warna_primer || "#0f4c1e"}
                          onChange={(e) => onChange("warna_primer", e.target.value)}
                          className="w-11 h-11 rounded-xl cursor-pointer border border-stone-300 p-1 shrink-0"
                        />
                        <input
                          id="cfg-primer-hex"
                          type="text"
                          value={config.warna_primer || "#0f4c1e"}
                          onChange={(e) => onChange("warna_primer", e.target.value)}
                          className="w-28 min-h-10 font-mono text-xs font-bold border border-stone-300 rounded-xl px-3 uppercase"
                        />
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {COLOR_PRESETS_PRIMARY.map((p) => (
                          <button
                            key={p.hex}
                            type="button"
                            onClick={() => onChange("warna_primer", p.hex)}
                            className="text-[11px] px-2.5 py-1 rounded-lg border border-stone-200 flex items-center gap-1.5 hover:bg-stone-50 cursor-pointer"
                          >
                            <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.hex }} />
                            <span>{p.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label htmlFor="cfg-aksen-hex" className="block text-xs font-bold text-stone-700">
                        Warna Aksen (Highlight &amp; Tombol CTA)
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          aria-label="Pilih warna aksen"
                          value={config.warna_aksen || "#c8a84b"}
                          onChange={(e) => onChange("warna_aksen", e.target.value)}
                          className="w-11 h-11 rounded-xl cursor-pointer border border-stone-300 p-1 shrink-0"
                        />
                        <input
                          id="cfg-aksen-hex"
                          type="text"
                          value={config.warna_aksen || "#c8a84b"}
                          onChange={(e) => onChange("warna_aksen", e.target.value)}
                          className="w-28 min-h-10 font-mono text-xs font-bold border border-stone-300 rounded-xl px-3 uppercase"
                        />
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {COLOR_PRESETS_ACCENT.map((p) => (
                          <button
                            key={p.hex}
                            type="button"
                            onClick={() => onChange("warna_aksen", p.hex)}
                            className="text-[11px] px-2.5 py-1 rounded-lg border border-stone-200 flex items-center gap-1.5 hover:bg-stone-50 cursor-pointer"
                          >
                            <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.hex }} />
                            <span>{p.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* ═════════ SUBTAB 3: PROFIL, PROGRAM & ASATIDZ ═════════ */}
          {subTab === "profil" && (
            <>
              {/* A. Tentang & Video Profil */}
              <section className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-stone-200 space-y-4">
                <div className="pb-3 border-b border-stone-100">
                  <h2 className="text-base font-bold text-stone-900">Bagian Profil, Visi &amp; Video Profil</h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Mengatur teks pengenalan pondok pesantren dan video profil YouTube.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="cfg-tentang-badge" className="block text-xs font-bold text-stone-700 mb-1.5">
                      Badge Atas
                    </label>
                    <input
                      id="cfg-tentang-badge"
                      type="text"
                      value={config.tentang_badge || ""}
                      onChange={(e) => onChange("tentang_badge", e.target.value)}
                      placeholder="Default: Profil & Visi Pesantren"
                      className={INPUT_CLS}
                    />
                  </div>
                  <div>
                    <label htmlFor="cfg-tentang-judul" className="block text-xs font-bold text-stone-700 mb-1.5">
                      Judul Bagian
                    </label>
                    <input
                      id="cfg-tentang-judul"
                      type="text"
                      value={config.tentang_judul || ""}
                      onChange={(e) => onChange("tentang_judul", e.target.value)}
                      placeholder="Default: Tentang {Nama Pesantren}"
                      className={INPUT_CLS}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="cfg-deskripsi" className="block text-xs font-bold text-stone-700 mb-1.5">
                      Paragraf Profil &amp; Visi Misi
                    </label>
                    <textarea
                      id="cfg-deskripsi"
                      rows={4}
                      value={config.deskripsi || ""}
                      onChange={(e) => onChange("deskripsi", e.target.value)}
                      placeholder="Tuliskan deskripsi profil, visi, dan misi pondok pesantren..."
                      className="w-full border border-stone-300 rounded-xl p-3.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                  <div>
                    <label htmlFor="cfg-video-url" className="block text-xs font-bold text-stone-700 mb-1.5">
                      Link Video Profil YouTube
                    </label>
                    <input
                      id="cfg-video-url"
                      type="text"
                      value={config.video_profil_url || ""}
                      onChange={(e) => onChange("video_profil_url", e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className={INPUT_CLS}
                    />
                  </div>
                  <div>
                    <label htmlFor="cfg-video-label" className="block text-xs font-bold text-stone-700 mb-1.5">
                      Label Overlays Video
                    </label>
                    <input
                      id="cfg-video-label"
                      type="text"
                      value={config.tentang_video_label || ""}
                      onChange={(e) => onChange("tentang_video_label", e.target.value)}
                      placeholder="Default: Video Profil Resmi"
                      className={INPUT_CLS}
                    />
                  </div>
                </div>
              </section>

              {/* B. Program Unggulan Section Texts */}
              <section className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-stone-200 space-y-4">
                <div className="pb-3 border-b border-stone-100">
                  <h2 className="text-base font-bold text-stone-900">Bagian Program Unggulan &amp; Kartu Highlight</h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Teks header dan kartu ajakan daftar di kolom kiri Program Unggulan. Daftar butir program dikelola di tab Program Unggulan.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="cfg-prog-badge" className="block text-xs font-bold text-stone-700 mb-1.5">
                      Badge Atas
                    </label>
                    <input
                      id="cfg-prog-badge"
                      type="text"
                      value={config.program_badge || ""}
                      onChange={(e) => onChange("program_badge", e.target.value)}
                      placeholder="Default: Keunggulan Kami"
                      className={INPUT_CLS}
                    />
                  </div>
                  <div>
                    <label htmlFor="cfg-prog-judul" className="block text-xs font-bold text-stone-700 mb-1.5">
                      Judul Utama
                    </label>
                    <input
                      id="cfg-prog-judul"
                      type="text"
                      value={config.program_judul || ""}
                      onChange={(e) => onChange("program_judul", e.target.value)}
                      placeholder="Default: Program Unggulan"
                      className={INPUT_CLS}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="cfg-prog-desc" className="block text-xs font-bold text-stone-700 mb-1.5">
                      Penjelasan Bagian Program
                    </label>
                    <textarea
                      id="cfg-prog-desc"
                      rows={2}
                      value={config.program_deskripsi || ""}
                      onChange={(e) => onChange("program_deskripsi", e.target.value)}
                      placeholder="Default: Kami menyediakan program terbaik untuk membentuk generasi yang berilmu, berakhlak, dan berdaya saing global."
                      className="w-full border border-stone-300 rounded-xl p-3 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>

                  <div>
                    <label htmlFor="cfg-prog-hl-badge" className="block text-xs font-bold text-stone-700 mb-1.5">
                      Badge Kartu Highlight Kiri
                    </label>
                    <input
                      id="cfg-prog-hl-badge"
                      type="text"
                      value={config.program_highlight_badge || ""}
                      onChange={(e) => onChange("program_highlight_badge", e.target.value)}
                      placeholder="Default otomatis: {Jumlah} Pilar Pendidikan"
                      className={INPUT_CLS}
                    />
                  </div>
                  <div>
                    <label htmlFor="cfg-prog-hl-cta" className="block text-xs font-bold text-stone-700 mb-1.5">
                      Tombol Kartu Highlight
                    </label>
                    <input
                      id="cfg-prog-hl-cta"
                      type="text"
                      value={config.program_highlight_cta || ""}
                      onChange={(e) => onChange("program_highlight_cta", e.target.value)}
                      placeholder="Default: Daftar Sekarang"
                      className={INPUT_CLS}
                    />
                  </div>
                  <div>
                    <label htmlFor="cfg-prog-hl-judul" className="block text-xs font-bold text-stone-700 mb-1.5">
                      Judul Kartu Highlight
                    </label>
                    <input
                      id="cfg-prog-hl-judul"
                      type="text"
                      value={config.program_highlight_judul || ""}
                      onChange={(e) => onChange("program_highlight_judul", e.target.value)}
                      placeholder="Default: Membentuk Santri Berilmu, Beradab, & Siap Masa Depan."
                      className={INPUT_CLS}
                    />
                  </div>
                  <div>
                    <label htmlFor="cfg-prog-hl-desc" className="block text-xs font-bold text-stone-700 mb-1.5">
                      Keterangan Kartu Highlight
                    </label>
                    <input
                      id="cfg-prog-hl-desc"
                      type="text"
                      value={config.program_highlight_deskripsi || ""}
                      onChange={(e) => onChange("program_highlight_deskripsi", e.target.value)}
                      placeholder="Default: Seluruh program dibina secara terpadu..."
                      className={INPUT_CLS}
                    />
                  </div>
                </div>
              </section>

              {/* C. Dewan Asatidz & Pimpinan */}
              <section className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-stone-200 space-y-4">
                <div className="flex items-start justify-between gap-4 pb-3 border-b border-stone-100 flex-wrap">
                  <div>
                    <h2 className="text-base font-bold text-stone-900">Bagian Dewan Asatidz &amp; Pimpinan</h2>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Atur judul bagian dan tampil/sembunyinya kartu tumpukan pengajar.
                    </p>
                  </div>
                  <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 cursor-pointer text-xs font-bold text-stone-800">
                    <input
                      type="checkbox"
                      checked={config.tampilkan_pengajar !== "false"}
                      onChange={(e) =>
                        onChange("tampilkan_pengajar", e.target.checked ? "true" : "false")
                      }
                      className="w-4 h-4 accent-emerald-700"
                    />
                    <span>Tampilkan di Landing Page</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="cfg-pengajar-badge" className="block text-xs font-bold text-stone-700 mb-1.5">
                      Badge Atas
                    </label>
                    <input
                      id="cfg-pengajar-badge"
                      type="text"
                      value={config.pengajar_badge || ""}
                      onChange={(e) => onChange("pengajar_badge", e.target.value)}
                      placeholder="Default: Dewan Asatidz & Pimpinan"
                      className={INPUT_CLS}
                    />
                  </div>
                  <div>
                    <label htmlFor="cfg-pengajar-judul" className="block text-xs font-bold text-stone-700 mb-1.5">
                      Judul Utama
                    </label>
                    <input
                      id="cfg-pengajar-judul"
                      type="text"
                      value={config.pengajar_judul || ""}
                      onChange={(e) => onChange("pengajar_judul", e.target.value)}
                      placeholder="Default: Diasuh oleh Tenaga Pendidik Berpengalaman & Bersanad"
                      className={INPUT_CLS}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="cfg-pengajar-desc" className="block text-xs font-bold text-stone-700 mb-1.5">
                      Penjelasan Bagian Asatidz
                    </label>
                    <textarea
                      id="cfg-pengajar-desc"
                      rows={2}
                      value={config.pengajar_deskripsi || ""}
                      onChange={(e) => onChange("pengajar_deskripsi", e.target.value)}
                      placeholder="Default: Geser tumpukan bingkai ke kiri atau kanan untuk mengenal profil pimpinan dan asatidz pengajar."
                      className="w-full border border-stone-300 rounded-xl p-3 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>
              </section>
            </>
          )}

          {/* ═════════ SUBTAB 4: GALERI, JADWAL, LOKASI & FOOTER ═════════ */}
          {subTab === "bagian" && (
            <>
              {/* Gelombang & Banner CTA */}
              <section className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-stone-200 space-y-4">
                <div className="pb-3 border-b border-stone-100">
                  <h2 className="text-base font-bold text-stone-900">Bagian Gelombang PSB &amp; Banner Ajakan Daftar</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="cfg-gel-badge" className="block text-xs font-bold text-stone-700 mb-1.5">
                      Badge Gelombang
                    </label>
                    <input
                      id="cfg-gel-badge"
                      type="text"
                      value={config.gelombang_badge || ""}
                      onChange={(e) => onChange("gelombang_badge", e.target.value)}
                      placeholder="Default: Jadwal Pendaftaran"
                      className={INPUT_CLS}
                    />
                  </div>
                  <div>
                    <label htmlFor="cfg-gel-judul" className="block text-xs font-bold text-stone-700 mb-1.5">
                      Judul Gelombang
                    </label>
                    <input
                      id="cfg-gel-judul"
                      type="text"
                      value={config.gelombang_judul || ""}
                      onChange={(e) => onChange("gelombang_judul", e.target.value)}
                      placeholder="Default: Gelombang Penerimaan Santri Baru"
                      className={INPUT_CLS}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="cfg-gel-desc" className="block text-xs font-bold text-stone-700 mb-1.5">
                      Keterangan Bagian Gelombang
                    </label>
                    <input
                      id="cfg-gel-desc"
                      type="text"
                      value={config.gelombang_deskripsi || ""}
                      onChange={(e) => onChange("gelombang_deskripsi", e.target.value)}
                      placeholder="Default: Pendaftaran dibuka secara bertahap. Segera daftar sebelum kuota terpenuhi."
                      className={INPUT_CLS}
                    />
                  </div>

                  <div>
                    <label htmlFor="cfg-gel-cta-badge" className="block text-xs font-bold text-stone-700 mb-1.5">
                      Badge Banner Ajakan Daftar (Bawah)
                    </label>
                    <input
                      id="cfg-gel-cta-badge"
                      type="text"
                      value={config.gelombang_cta_badge || ""}
                      onChange={(e) => onChange("gelombang_cta_badge", e.target.value)}
                      placeholder="Default: Pendaftaran Daring 24 Jam"
                      className={INPUT_CLS}
                    />
                  </div>
                  <div>
                    <label htmlFor="cfg-gel-cta-tombol" className="block text-xs font-bold text-stone-700 mb-1.5">
                      Teks Tombol Banner Ajakan
                    </label>
                    <input
                      id="cfg-gel-cta-tombol"
                      type="text"
                      value={config.gelombang_cta_tombol || ""}
                      onChange={(e) => onChange("gelombang_cta_tombol", e.target.value)}
                      placeholder="Default: Mulai Pendaftaran"
                      className={INPUT_CLS}
                    />
                  </div>
                  <div>
                    <label htmlFor="cfg-gel-cta-judul" className="block text-xs font-bold text-stone-700 mb-1.5">
                      Judul Banner Ajakan
                    </label>
                    <input
                      id="cfg-gel-cta-judul"
                      type="text"
                      value={config.gelombang_cta_judul || ""}
                      onChange={(e) => onChange("gelombang_cta_judul", e.target.value)}
                      placeholder="Default: Siap Menjadi Bagian dari Keluarga Besar Pesantren?"
                      className={INPUT_CLS}
                    />
                  </div>
                  <div>
                    <label htmlFor="cfg-gel-cta-desc" className="block text-xs font-bold text-stone-700 mb-1.5">
                      Subjudul Banner Ajakan
                    </label>
                    <input
                      id="cfg-gel-cta-desc"
                      type="text"
                      value={config.gelombang_cta_deskripsi || ""}
                      onChange={(e) => onChange("gelombang_cta_deskripsi", e.target.value)}
                      placeholder="Default: Lengkapi formulir pendaftaran dalam 4 langkah mudah..."
                      className={INPUT_CLS}
                    />
                  </div>
                </div>
              </section>

              {/* Galeri Mading */}
              <section className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-stone-200 space-y-4">
                <div className="pb-3 border-b border-stone-100">
                  <h2 className="text-base font-bold text-stone-900">Bagian Galeri Mading Pesantren</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="cfg-galeri-badge" className="block text-xs font-bold text-stone-700 mb-1.5">
                      Badge Atas
                    </label>
                    <input
                      id="cfg-galeri-badge"
                      type="text"
                      value={config.galeri_badge || ""}
                      onChange={(e) => onChange("galeri_badge", e.target.value)}
                      placeholder="Default: Galeri Kegiatan"
                      className={INPUT_CLS}
                    />
                  </div>
                  <div>
                    <label htmlFor="cfg-galeri-judul" className="block text-xs font-bold text-stone-700 mb-1.5">
                      Judul Utama
                    </label>
                    <input
                      id="cfg-galeri-judul"
                      type="text"
                      value={config.galeri_judul || ""}
                      onChange={(e) => onChange("galeri_judul", e.target.value)}
                      placeholder="Default: Kehidupan di Pesantren"
                      className={INPUT_CLS}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="cfg-galeri-desc" className="block text-xs font-bold text-stone-700 mb-1.5">
                      Subjudul Galeri (Opsional)
                    </label>
                    <input
                      id="cfg-galeri-desc"
                      type="text"
                      value={config.galeri_deskripsi || ""}
                      onChange={(e) => onChange("galeri_deskripsi", e.target.value)}
                      placeholder="Contoh: Dokumentasi sarana, asrama, dan aktivitas santri"
                      className={INPUT_CLS}
                    />
                  </div>
                </div>
              </section>

              {/* Kontak, Lokasi & Peta */}
              <section className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-stone-200 space-y-4">
                <div className="pb-3 border-b border-stone-100">
                  <h2 className="text-base font-bold text-stone-900">Kontak Panitia, Lokasi &amp; Google Maps</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="cfg-wa-admin" className="block text-xs font-bold text-stone-700 mb-1.5">
                      Nomor WhatsApp Panitia *
                    </label>
                    <input
                      id="cfg-wa-admin"
                      type="tel"
                      value={config.no_wa_admin || ""}
                      onChange={(e) => onChange("no_wa_admin", e.target.value)}
                      placeholder="6281234567890"
                      className={INPUT_CLS}
                    />
                  </div>
                  <div>
                    <label htmlFor="cfg-email" className="block text-xs font-bold text-stone-700 mb-1.5">
                      Email Resmi PSB
                    </label>
                    <input
                      id="cfg-email"
                      type="email"
                      value={config.email || ""}
                      onChange={(e) => onChange("email", e.target.value)}
                      placeholder="psb@pesantren.sch.id"
                      className={INPUT_CLS}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="cfg-alamat" className="block text-xs font-bold text-stone-700 mb-1.5">
                      Alamat Lengkap Pesantren
                    </label>
                    <textarea
                      id="cfg-alamat"
                      rows={2}
                      value={config.alamat || ""}
                      onChange={(e) => onChange("alamat", e.target.value)}
                      placeholder="Jl. Raya Bangsri, Kab. Jepara, Jawa Tengah"
                      className="w-full border border-stone-300 rounded-xl p-3 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                  <div>
                    <label htmlFor="cfg-lokasi-badge" className="block text-xs font-bold text-stone-700 mb-1.5">
                      Badge Lokasi
                    </label>
                    <input
                      id="cfg-lokasi-badge"
                      type="text"
                      value={config.lokasi_badge || ""}
                      onChange={(e) => onChange("lokasi_badge", e.target.value)}
                      placeholder="Default: Lokasi & Kunjungan"
                      className={INPUT_CLS}
                    />
                  </div>
                  <div>
                    <label htmlFor="cfg-lokasi-judul" className="block text-xs font-bold text-stone-700 mb-1.5">
                      Judul Lokasi
                    </label>
                    <input
                      id="cfg-lokasi-judul"
                      type="text"
                      value={config.lokasi_judul || ""}
                      onChange={(e) => onChange("lokasi_judul", e.target.value)}
                      placeholder="Default: Lokasi Pondok Pesantren"
                      className={INPUT_CLS}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="cfg-lokasi-desc" className="block text-xs font-bold text-stone-700 mb-1.5">
                      Deskripsi Lokasi
                    </label>
                    <textarea
                      id="cfg-lokasi-desc"
                      rows={2}
                      value={config.lokasi_deskripsi || ""}
                      onChange={(e) => onChange("lokasi_deskripsi", e.target.value)}
                      placeholder="Default: Silakan berkunjung langsung ke sekretariat PSB..."
                      className="w-full border border-stone-300 rounded-xl p-3 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                  <div>
                    <label htmlFor="cfg-lokasi-card" className="block text-xs font-bold text-stone-700 mb-1.5">
                      Badge Kartu Sekretariat
                    </label>
                    <input
                      id="cfg-lokasi-card"
                      type="text"
                      value={config.lokasi_card_badge || ""}
                      onChange={(e) => onChange("lokasi_card_badge", e.target.value)}
                      placeholder="Default: Sekretariat PSB"
                      className={INPUT_CLS}
                    />
                  </div>
                  <div>
                    <label htmlFor="cfg-jam-layanan" className="block text-xs font-bold text-stone-700 mb-1.5">
                      Jam Pelayanan
                    </label>
                    <input
                      id="cfg-jam-layanan"
                      type="text"
                      value={config.jam_layanan || ""}
                      onChange={(e) => onChange("jam_layanan", e.target.value)}
                      placeholder="Senin - Sabtu: 08.00 - 15.00 WIB"
                      className={INPUT_CLS}
                    />
                  </div>
                  <div>
                    <label htmlFor="cfg-jam-ket" className="block text-xs font-bold text-stone-700 mb-1.5">
                      Keterangan Hari Libur
                    </label>
                    <input
                      id="cfg-jam-ket"
                      type="text"
                      value={config.lokasi_jam_keterangan || ""}
                      onChange={(e) => onChange("lokasi_jam_keterangan", e.target.value)}
                      placeholder="Ahad & Hari Libur: Dengan Konfirmasi"
                      className={INPUT_CLS}
                    />
                  </div>
                  <div>
                    <label htmlFor="cfg-lokasi-cta" className="block text-xs font-bold text-stone-700 mb-1.5">
                      Tombol Petunjuk Arah
                    </label>
                    <input
                      id="cfg-lokasi-cta"
                      type="text"
                      value={config.lokasi_cta_arah || ""}
                      onChange={(e) => onChange("lokasi_cta_arah", e.target.value)}
                      placeholder="Default: Petunjuk Arah Google Maps"
                      className={INPUT_CLS}
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-2.5">
                    <label htmlFor="cfg-maps-embed" className="block text-xs font-bold text-stone-700">
                      Kode &lt;iframe&gt; / Link Embed Google Maps
                    </label>
                    <textarea
                      id="cfg-maps-embed"
                      rows={3}
                      value={config.maps_embed_url || ""}
                      onChange={(e) => onChange("maps_embed_url", e.target.value)}
                      placeholder={'Tempel kode HTML <iframe> dari Google Maps -> Bagikan -> Sematkan peta'}
                      className="w-full border border-stone-300 rounded-xl p-3 text-xs font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                    {(() => {
                      const status = getMapsInputStatus(config.maps_embed_url);
                      if (status.type === "iframe" || status.type === "embed_url") {
                        return (
                          <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
                            <CheckCircle2 size={15} className="shrink-0" aria-hidden="true" />
                            <span>Peta Embed Google Maps valid dan siap ditampilkan.</span>
                          </div>
                        );
                      }
                      if (status.type === "shortlink") {
                        return (
                          <div className="flex items-start gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                            <AlertTriangle size={15} className="shrink-0 mt-0.5" aria-hidden="true" />
                            <span>
                              Link pendek <code>maps.app.goo.gl</code> diblokir browser di iframe. Gunakan menu{" "}
                              <strong>Bagikan &gt; Sematkan peta &gt; Salin HTML</strong>.
                            </span>
                          </div>
                        );
                      }
                      return (
                        <p className="text-[11px] text-stone-500 flex items-center gap-1.5">
                          <HelpCircle size={13} aria-hidden="true" />
                          <span>Kosongkan untuk pencarian peta otomatis dari Nama &amp; Alamat Pesantren.</span>
                        </p>
                      );
                    })()}
                    <div className="w-full h-44 rounded-xl overflow-hidden border border-stone-200 bg-stone-100">
                      <iframe
                        src={parseGoogleMapsEmbedUrl(
                          config.maps_embed_url,
                          `${config.nama_pesantren || "Pondok Pesantren"}, ${config.alamat || "Indonesia"}`
                        )}
                        className="w-full h-full border-0"
                        loading="lazy"
                        title="Pratinjau Peta Lokasi Pesantren"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* WhatsApp Floating & Footer */}
              <section className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-stone-200 space-y-4">
                <div className="pb-3 border-b border-stone-100">
                  <h2 className="text-base font-bold text-stone-900">Tombol WhatsApp Melayang &amp; Footer</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="cfg-wa-label" className="block text-xs font-bold text-stone-700 mb-1.5">
                      Teks Tombol WhatsApp Melayang
                    </label>
                    <input
                      id="cfg-wa-label"
                      type="text"
                      value={config.wa_tombol_teks || ""}
                      onChange={(e) => onChange("wa_tombol_teks", e.target.value)}
                      placeholder="Default: Konsultasi PSB"
                      className={INPUT_CLS}
                    />
                  </div>
                  <div>
                    <label htmlFor="cfg-footer-copy" className="block text-xs font-bold text-stone-700 mb-1.5">
                      Teks Hak Cipta Footer
                    </label>
                    <input
                      id="cfg-footer-copy"
                      type="text"
                      value={config.footer_hak_cipta || ""}
                      onChange={(e) => onChange("footer_hak_cipta", e.target.value)}
                      placeholder="Otomatis: © Tahun {Nama Pesantren}"
                      className={INPUT_CLS}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="cfg-wa-pesan" className="block text-xs font-bold text-stone-700 mb-1.5">
                      Pesan Otomatis WhatsApp Pembuka
                    </label>
                    <input
                      id="cfg-wa-pesan"
                      type="text"
                      value={config.wa_pesan_default || ""}
                      onChange={(e) => onChange("wa_pesan_default", e.target.value)}
                      placeholder="Default: Assalamualaikum, saya ingin mengetahui informasi Penerimaan Santri Baru."
                      className={INPUT_CLS}
                    />
                  </div>
                </div>
              </section>
            </>
          )}

          {/* ═════════ SUBTAB 5: SYARAT & KETENTUAN ═════════ */}
          {subTab === "syarat" && (
            <section className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-stone-200 space-y-4">
              <div className="pb-3 border-b border-stone-100">
                <h2 className="text-base font-bold text-stone-900">Syarat &amp; Ketentuan Formulir PSB</h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Tulis 1 poin persyaratan per baris. Tampil sebagai akad persetujuan di langkah akhir pendaftaran.
                </p>
              </div>
              <div>
                <label htmlFor="cfg-syarat" className="block text-xs font-bold text-stone-700 mb-1.5">
                  Daftar Poin Persyaratan
                </label>
                <textarea
                  id="cfg-syarat"
                  rows={10}
                  value={config.syarat_ketentuan || ""}
                  onChange={(e) => onChange("syarat_ketentuan", e.target.value)}
                  placeholder={
                    "1. Calon santri beragama Islam dan berakhlak mulia.\n2. Berijazah/lulus jenjang sebelumnya.\n3. Mengisi formulir dengan data yang benar.\n4. Melampirkan Pas Foto, KK, dan Akta Kelahiran."
                  }
                  className="w-full border border-stone-300 rounded-xl p-3.5 text-sm font-mono text-stone-900 leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
                <p className="text-[11px] text-stone-500 mt-2">
                  Jika dikosongkan, halaman pendaftaran menampilkan 8 butir persyaratan standar pesantren.
                </p>
              </div>
            </section>
          )}

          {/* Grounded Footer Save CTA (tidak melayang menimpa field) */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-stone-600">
              Simpan perubahan agar langsung aktif di halaman depan publik.
            </p>
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="w-full sm:w-auto min-h-11 px-6 py-2.5 rounded-xl font-bold text-sm text-white shadow-sm inline-flex items-center justify-center gap-2 hover:opacity-95 disabled:opacity-60 cursor-pointer"
              style={{ backgroundColor: primaryColor }}
            >
              <Save size={16} aria-hidden="true" />
              <span>{saving ? "Menyimpan..." : "Simpan Kustomisasi Web"}</span>
            </button>
          </div>
        </div>

        {/* Sticky Live Preview Column (4 Cols) */}
        <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-xs border border-stone-200">
            <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-stone-100">
              <Sparkles size={16} style={{ color: theme.accentTextOnLight }} aria-hidden="true" />
              <h3 className="font-bold text-sm text-stone-900">Simulasi Live Landing Page</h3>
            </div>

            <div className="rounded-xl overflow-hidden border border-stone-200 shadow-xs">
              {/* Mock Navbar */}
              <div
                className="px-3 py-2.5 text-white flex items-center justify-between gap-2"
                style={{ background: theme.primaryDark }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {config.logo_url ? (
                    <img
                      src={toDirectImageUrl(config.logo_url)}
                      alt=""
                      referrerPolicy="no-referrer"
                      className="w-6 h-6 rounded-full object-cover bg-white/15 shrink-0"
                    />
                  ) : (
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                      style={{ background: accentColor, color: theme.onAccent }}
                    >
                      P
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-bold text-xs truncate">
                      {config.nama_singkat || config.nama_pesantren || "Pesantren"}
                    </p>
                    <p className="text-[9px] truncate" style={{ color: theme.accentLight }}>
                      {config.navbar_sub || "Penerimaan Santri Baru"}
                    </p>
                  </div>
                </div>
                <span
                  className="text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0"
                  style={{ background: accentColor, color: theme.onAccent }}
                >
                  Daftar
                </span>
              </div>

              {/* Mock Hero + V-Fan Poker Preview */}
              <div
                className="p-4 text-white space-y-3"
                style={{
                  background: `linear-gradient(155deg, ${theme.primaryDark}, ${primaryColor})`,
                }}
              >
                <div className="text-center space-y-1">
                  <p className="text-[10px] font-semibold" style={{ color: theme.accentLight }}>
                    {config.hero_badge || "Penerimaan Santri Baru"}
                  </p>
                  <h4 className="font-display font-bold text-sm leading-snug line-clamp-2">
                    {config.nama_pesantren || "Pondok Pesantren"}
                  </h4>
                  <p className="text-[11px] text-white/80 line-clamp-2">
                    {config.tagline || "Pinter Ngaji, Akhlak Terpuji, Berprestasi"}
                  </p>
                </div>

                {/* Mini 2 Poker Card V-Fan Preview */}
                <div className="relative h-28 flex items-end justify-center pt-1">
                  <div
                    className="w-20 aspect-[3/3.4] rounded-lg p-1 bg-white/95 shadow-lg -rotate-[10deg] translate-x-2 overflow-hidden"
                    title="Foto Hero #2 (Kiri)"
                  >
                    {heroLeftPreview ? (
                      <img
                        src={heroLeftPreview}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <div
                        className="w-full h-full rounded flex items-center justify-center text-[9px] font-bold text-white/90 text-center p-1"
                        style={{ backgroundColor: theme.primaryDark }}
                      >
                        Foto #2 (Galeri)
                      </div>
                    )}
                  </div>
                  <div
                    className="relative z-10 w-20 aspect-[3/3.4] rounded-lg p-1 bg-white shadow-xl rotate-[10deg] -translate-x-2 overflow-hidden border"
                    style={{ borderColor: accentColor }}
                    title="Foto Hero #1 (Kanan/Utama)"
                  >
                    {heroRightPreview ? (
                      <img
                        src={heroRightPreview}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <div
                        className="w-full h-full rounded flex items-center justify-center text-[9px] font-bold text-white text-center p-1"
                        style={{ backgroundColor: primaryColor }}
                      >
                        Foto #1 Utama
                      </div>
                    )}
                    <span className="absolute bottom-1.5 inset-x-1.5 text-[7px] font-semibold bg-black/55 text-white px-1 py-0.5 rounded truncate text-center">
                      {config.hero_foto_caption || "Suasana Pondok"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Mock Info Footer */}
              <div className="p-3 bg-stone-50 text-[11px] space-y-1 text-stone-600">
                <div className="flex items-center gap-1.5">
                  <Phone size={11} className="text-emerald-700 shrink-0" aria-hidden="true" />
                  <span className="truncate">{config.no_wa_admin || "-"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Mail size={11} className="text-stone-500 shrink-0" aria-hidden="true" />
                  <span className="truncate">{config.email || "-"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin size={11} className="text-red-500 shrink-0" aria-hidden="true" />
                  <span className="truncate">{config.alamat || "-"}</span>
                </div>
                <div className="flex items-center gap-3 pt-1 border-t border-stone-200/70 text-[10px] text-stone-500">
                  <span className="inline-flex items-center gap-1">
                    <Calendar size={10} aria-hidden="true" /> {config.tahun_berdiri || "1985"}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Users size={10} aria-hidden="true" /> {config.jumlah_santri || "100+"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
