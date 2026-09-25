"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { toDirectImageUrl, parseMediaUrl } from "@/lib/mediaUtils";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Users, CheckCircle, XCircle, Clock, Download,
  Search, Filter, LogOut, Eye, X, ChevronDown,
  Palette, Calendar, Image as ImageIcon, ExternalLink,
  Save, Plus, Trash2, ToggleLeft, ToggleRight, Phone,
  Mail, MapPin, Sparkles, RefreshCw, BookOpen, Layers, FileText, FileCheck
} from "lucide-react";
import Link from "next/link";

interface Pendaftar {
  id: number;
  nomor_registrasi: string;
  nama_lengkap: string;
  nama_panggilan?: string;
  jenis_kelamin: string;
  tempat_lahir?: string;
  tanggal_lahir?: string;
  no_hp_wali: string;
  nama_ayah?: string;
  nama_ibu?: string;
  alamat?: string;
  asal_sekolah: string;
  jurusan?: string;
  jenjang_tujuan?: string;
  jalur_pendaftaran?: string;
  akta_url?: string;
  sktm_url?: string;
  kk_url?: string;
  ijazah_url?: string;
  status: "menunggu" | "diterima" | "ditolak" | "imported";
  created_at: string;
  catatan_admin?: string;
  foto_url?: string;
  gelombang_psb?: { nama: string };
}

interface Gelombang {
  id: number;
  nama: string;
  tanggal_buka: string;
  tanggal_tutup: string;
  kuota: number | null;
  biaya_pendaftaran: number;
  keterangan: string | null;
  is_aktif: boolean;
}

interface GaleriItem {
  id: number;
  judul: string;
  deskripsi?: string;
  foto_url: string;
  urutan: number;
}

const COLOR_PRESETS_PRIMARY = [
  { name: "Hijau Emerald", hex: "#0f4c1e" },
  { name: "Biru Navy", hex: "#1e3a8a" },
  { name: "Hijau Forest", hex: "#14532d" },
  { name: "Merah Marun", hex: "#831843" },
  { name: "Coklat Klasik", hex: "#78350f" },
  { name: "Hitam Elegan", hex: "#18181b" },
];

const COLOR_PRESETS_ACCENT = [
  { name: "Emas Islami", hex: "#c8a84b" },
  { name: "Kuning Amber", hex: "#d97706" },
  { name: "Emas Muda", hex: "#eab308" },
  { name: "Cyan Teal", hex: "#0d9488" },
  { name: "Oranye Hangat", hex: "#ea580c" },
];

function AdminDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "pendaftar";

  const [activeTab, setActiveTab] = useState<"pendaftar" | "kustomisasi" | "gelombang" | "galeri" | "program">(initialTab as any);

  // Auth
  const token = typeof window !== "undefined" ? localStorage.getItem("psb_admin_token") : null;
  const adminNama = typeof window !== "undefined" ? localStorage.getItem("psb_admin_nama") : "Admin";

  // Data Pendaftar State
  const [pendaftarList, setPendaftarList] = useState<Pendaftar[]>([]);
  const [filterStatus, setFilterStatus] = useState("semua");
  const [filterJenjang, setFilterJenjang] = useState("semua");
  const [filterJalur, setFilterJalur] = useState("semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingPendaftar, setLoadingPendaftar] = useState(true);
  const [selectedPendaftar, setSelectedPendaftar] = useState<Pendaftar | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [catatanVerifikasi, setCatatanVerifikasi] = useState("");

  // Kustomisasi Web State
  const [config, setConfig] = useState<Record<string, string>>({});
  const [savingConfig, setSavingConfig] = useState(false);
  const [configMsg, setConfigMsg] = useState("");

  // Gelombang State
  const [gelombangList, setGelombangList] = useState<Gelombang[]>([]);
  const [loadingGelombang, setLoadingGelombang] = useState(false);
  const [showGelombangForm, setShowGelombangForm] = useState(false);
  const [gelombangForm, setGelombangForm] = useState({
    nama: "",
    tanggal_buka: "",
    tanggal_tutup: "",
    kuota: "",
    biaya_pendaftaran: "250000",
    keterangan: ""
  });

  // Galeri State
  const [galeriList, setGaleriList] = useState<GaleriItem[]>([]);
  const [loadingGaleri, setLoadingGaleri] = useState(false);
  const [showGaleriForm, setShowGaleriForm] = useState(false);
  const [galeriForm, setGaleriForm] = useState({
    judul: "",
    deskripsi: "",
    foto_url: "",
    urutan: "1"
  });

  // Program Unggulan State
  interface ProgramItem { id: number; nama: string; deskripsi: string; icon: string; warna: string; urutan: number; is_aktif: boolean; }
  const [programList, setProgramList] = useState<ProgramItem[]>([]);
  const [loadingProgram, setLoadingProgram] = useState(false);
  const [showProgramForm, setShowProgramForm] = useState(false);
  const [programForm, setProgramForm] = useState({ nama: "", deskripsi: "", icon: "⭐", warna: "#0f4c1e", urutan: "1" });
  const ICON_PRESETS = ["⭐","📖","🕌","🏫","🎓","💻","🌍","⚽","🎨","🔬","🤝","🌿","📿","🏆","💡","🎵"];

  // Auth Guard
  useEffect(() => {
    if (!token) {
      router.push("/admin/login");
    }
  }, [token, router]);

  // Load Pendaftar
  const fetchPendaftar = useCallback(async () => {
    if (!token) return;
    setLoadingPendaftar(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus !== "semua") params.set("status", filterStatus);
      const res = await fetch(`/api/admin/pendaftar?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const d = await res.json();
      if (d.ok) setPendaftarList(d.data || []);
    } catch (e) {
      console.error("Gagal load pendaftar:", e);
    } finally {
      setLoadingPendaftar(false);
    }
  }, [token, filterStatus]);

  // Load Config
  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch("/api/config");
      const d = await res.json();
      if (d.ok) setConfig(d.data || {});
    } catch (e) {
      console.error("Gagal load config:", e);
    }
  }, []);

  // Load Gelombang
  const fetchGelombang = useCallback(async () => {
    setLoadingGelombang(true);
    try {
      const res = await fetch("/api/gelombang");
      const d = await res.json();
      if (d.ok) setGelombangList(d.data || []);
    } catch (e) {
      console.error("Gagal load gelombang:", e);
    } finally {
      setLoadingGelombang(false);
    }
  }, []);

  // Load Galeri
  const fetchGaleri = useCallback(async () => {
    setLoadingGaleri(true);
    try {
      const res = await fetch("/api/galeri");
      const d = await res.json();
      if (d.ok) setGaleriList(d.data || []);
    } catch (e) {
      console.error("Gagal load galeri:", e);
    } finally {
      setLoadingGaleri(false);
    }
  }, []);

  // Initial Load
  useEffect(() => {
    fetchPendaftar();
    fetchConfig();
    fetchGelombang();
    fetchGaleri();
  }, [fetchPendaftar, fetchConfig, fetchGelombang, fetchGaleri]);

  const logout = () => {
    localStorage.removeItem("psb_admin_token");
    localStorage.removeItem("psb_admin_nama");
    router.push("/admin/login");
  };

  // Pendaftar Actions
  const updateStatus = async (id: number, status: string) => {
    if (!token) return;
    setUpdatingStatus(true);
    try {
      await fetch("/api/admin/pendaftar", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id, status, catatan_admin: catatanVerifikasi })
      });
      await fetchPendaftar();
      setSelectedPendaftar(null);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const exportCSV = () => {
    const headers = ["No Registrasi", "Nama Lengkap", "JK", "Jalur Pendaftaran", "Jenjang Tujuan", "No HP Wali", "Asal Sekolah", "Peminatan", "Status", "Tanggal Daftar"];
    const rows = filteredPendaftar.map((d) => [
      d.nomor_registrasi || `PSB-${d.id}`,
      d.nama_lengkap,
      d.jenis_kelamin === "P" ? "Perempuan" : "Laki-laki",
      (d.jalur_pendaftaran || (d.catatan_admin?.includes("LKSA") ? "lksa" : "reguler")) === "lksa" ? "LKSA (Gratis)" : "Reguler (MBS)",
      d.jenjang_tujuan || (d.catatan_admin?.match(/\[Jenjang:\s*(\w+)\]/i)?.[1]) || "SMP",
      d.no_hp_wali,
      d.asal_sekolah,
      d.jurusan || "-",
      d.status,
      new Date(d.created_at).toLocaleDateString("id-ID")
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c || ""}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pendaftar_psb_${Date.now()}.csv`;
    a.click();
  };

  // Config Actions
  const handleConfigChange = (key: string, val: string) => {
    setConfig((prev) => ({ ...prev, [key]: val }));
  };

  const saveConfig = async () => {
    if (!token) return;
    setSavingConfig(true);
    setConfigMsg("");
    try {
      const res = await fetch("/api/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(config)
      });
      const d = await res.json();
      if (d.ok) {
        setConfigMsg("Pengaturan tampilan web berhasil disimpan! Perubahan langsung aktif di halaman depan.");
      } else {
        setConfigMsg("Gagal menyimpan: " + (d.error || "Terjadi kesalahan"));
      }
    } catch (err: unknown) {
      setConfigMsg("Error: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSavingConfig(false);
    }
  };

  // Gelombang Actions
  const saveGelombang = async () => {
    if (!token || !gelombangForm.nama || !gelombangForm.tanggal_buka || !gelombangForm.tanggal_tutup) return;
    try {
      await fetch("/api/gelombang", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...gelombangForm,
          kuota: gelombangForm.kuota ? Number(gelombangForm.kuota) : null,
          biaya_pendaftaran: Number(gelombangForm.biaya_pendaftaran)
        })
      });
      setGelombangForm({ nama: "", tanggal_buka: "", tanggal_tutup: "", kuota: "", biaya_pendaftaran: "250000", keterangan: "" });
      setShowGelombangForm(false);
      await fetchGelombang();
    } catch (e) {
      console.error(e);
    }
  };

  const toggleGelombang = async (id: number, currentStatus: boolean) => {
    if (!token) return;
    try {
      await fetch(`/api/admin/gelombang/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ is_aktif: !currentStatus })
      });
      await fetchGelombang();
    } catch (e) {
      console.error(e);
    }
  };

  // Galeri Actions
  const saveGaleri = async () => {
    if (!token || !galeriForm.judul || !galeriForm.foto_url) return;
    try {
      await fetch("/api/admin/galeri", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...galeriForm,
          urutan: Number(galeriForm.urutan)
        })
      });
      setGaleriForm({ judul: "", deskripsi: "", foto_url: "", urutan: "1" });
      setShowGaleriForm(false);
      await fetchGaleri();
    } catch (e) {
      console.error(e);
    }
  };

  const deleteGaleri = async (id: number) => {
    if (!token || !confirm("Hapus foto ini dari galeri?")) return;
    try {
      await fetch(`/api/admin/galeri?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchGaleri();
    } catch (e) {
      console.error(e);
    }
  };

  // Filtered Pendaftar
  const filteredPendaftar = pendaftarList.filter((d) => {
    const matchSearch =
      (d.nama_lengkap && d.nama_lengkap.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (d.nomor_registrasi && d.nomor_registrasi.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (d.asal_sekolah && d.asal_sekolah.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (d.no_hp_wali && d.no_hp_wali.includes(searchQuery));
    if (!matchSearch) return false;

    if (filterJenjang !== "semua") {
      const jenjang = (d.jenjang_tujuan || (d.catatan_admin?.match(/\[Jenjang:\s*(\w+)\]/i)?.[1]) || "SMP").toUpperCase();
      if (jenjang !== filterJenjang.toUpperCase()) return false;
    }

    if (filterJalur !== "semua") {
      const jalur = (d.jalur_pendaftaran || (d.catatan_admin?.includes("LKSA") ? "lksa" : "reguler")).toLowerCase();
      if (jalur !== filterJalur.toLowerCase()) return false;
    }

    return true;
  });

  const stats = {
    total: pendaftarList.length,
    menunggu: pendaftarList.filter((d) => d.status === "menunggu").length,
    diterima: pendaftarList.filter((d) => d.status === "diterima").length,
    ditolak: pendaftarList.filter((d) => d.status === "ditolak").length
  };

  const primaryColor = config.warna_primer || "#0f4c1e";
  const accentColor = config.warna_aksen || "#c8a84b";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ─── Top Admin Bar ─── */}
      <header className="bg-white border-b sticky top-0 z-40 px-6 py-3.5 shadow-sm" style={{ borderColor: "#e5e7eb" }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-md" style={{ background: `linear-gradient(135deg, ${primaryColor}, #1a6b2b)` }}>
              PSB
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base leading-tight" style={{ color: primaryColor }}>
                  {config.nama_pesantren || "Panel Admin PSB"}
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                  ONLINE
                </span>
              </div>
              <p className="text-xs text-gray-500">Pusat Kendali Pendaftaran & Kustomisasi Web</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <ExternalLink size={14} />
              <span>Lihat Website Publik</span>
            </Link>

            <div className="h-6 w-px bg-gray-200" />

            <div className="text-right hidden sm:block">
              <span className="block text-xs font-semibold text-gray-800">{adminNama}</span>
              <span className="block text-[11px] text-gray-400">Panitia PSB</span>
            </div>

            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
              title="Keluar dari Panel Admin"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* ─── Main Tabs Navigation ─── */}
      <div className="bg-white border-b shadow-sm" style={{ borderColor: "#e5e7eb" }}>
        <div className="max-w-7xl mx-auto px-6 flex gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("pendaftar")}
            className={`flex items-center gap-2 py-3.5 px-4 font-semibold text-sm border-b-2 transition-all ${
              activeTab === "pendaftar"
                ? "border-green-700 text-green-800 bg-green-50/50"
                : "border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50"
            }`}
          >
            <Users size={17} />
            <span>Data Pendaftar</span>
            {stats.total > 0 && (
              <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 font-bold">
                {stats.total}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("kustomisasi")}
            className={`flex items-center gap-2 py-3.5 px-4 font-semibold text-sm border-b-2 transition-all ${
              activeTab === "kustomisasi"
                ? "border-green-700 text-green-800 bg-green-50/50"
                : "border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50"
            }`}
          >
            <Palette size={17} />
            <span>🎨 Kustomisasi Tampilan Web</span>
          </button>

          <button
            onClick={() => setActiveTab("gelombang")}
            className={`flex items-center gap-2 py-3.5 px-4 font-semibold text-sm border-b-2 transition-all ${
              activeTab === "gelombang"
                ? "border-green-700 text-green-800 bg-green-50/50"
                : "border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50"
            }`}
          >
            <Calendar size={17} />
            <span>Gelombang PSB</span>
          </button>

          <button
            onClick={() => setActiveTab("galeri")}
            className={`flex items-center gap-2 py-3.5 px-4 font-semibold text-sm border-b-2 transition-all ${
              activeTab === "galeri"
                ? "border-green-700 text-green-800 bg-green-50/50"
                : "border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50"
            }`}
          >
            <ImageIcon size={17} />
            <span>Galeri Foto</span>
          </button>

          <button
            onClick={() => { setActiveTab("program"); if (programList.length === 0) { setLoadingProgram(true); fetch("/api/program").then(r=>r.json()).then(d=>{ if(d.ok) setProgramList(d.data||[]); setLoadingProgram(false); }); } }}
            className={`flex items-center gap-2 py-3.5 px-4 font-semibold text-sm border-b-2 transition-all ${
              activeTab === "program"
                ? "border-green-700 text-green-800 bg-green-50/50"
                : "border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50"
            }`}
          >
            <BookOpen size={17} />
            <span>Program Unggulan</span>
          </button>
        </div>
      </div>

      {/* ─── Main Content Container ─── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full flex-1">

        {/* ═══════════════════════════════════════════════════════════════════
            TAB 1: DATA PENDAFTAR
           ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === "pendaftar" && (
          <div>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: "Total Pendaftar", value: stats.total, icon: Users, color: primaryColor, bg: "#dcfce7" },
                { label: "Menunggu Verifikasi", value: stats.menunggu, icon: Clock, color: "#a16207", bg: "#fef9c3" },
                { label: "Lulus / Diterima", value: stats.diterima, icon: CheckCircle, color: "#15803d", bg: "#bbf7d0" },
                { label: "Tidak Diterima", value: stats.ditolak, icon: XCircle, color: "#b91c1c", bg: "#fecaca" },
              ].map(({ label, value, icon: Icon, color, bg }) => (
                <div key={label} className="bg-white rounded-2xl p-4 shadow-sm border flex items-center gap-3" style={{ borderColor: "#f0f0f0" }}>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm" style={{ background: bg }}>
                    <Icon size={22} style={{ color }} />
                  </div>
                  <div>
                    <p className="text-2xl font-black leading-tight" style={{ color }}>{value}</p>
                    <p className="text-xs text-gray-500 font-medium">{label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Toolbar: Search, Filter, Export */}
            <div className="bg-white rounded-2xl shadow-sm border p-4 mb-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between" style={{ borderColor: "#f0f0f0" }}>
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama santri, no registrasi, asal sekolah..."
                  className="w-full border rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50/50"
                  style={{ borderColor: "#e5e7eb" }}
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={filterJalur}
                  onChange={(e) => setFilterJalur(e.target.value)}
                  className="border rounded-xl px-3 py-1.5 text-xs font-semibold bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
                  style={{ borderColor: "#e5e7eb" }}
                >
                  <option value="semua">Semua Jalur</option>
                  <option value="reguler">Reguler (MBS)</option>
                  <option value="lksa">Santri LKSA (Gratis)</option>
                </select>

                <select
                  value={filterJenjang}
                  onChange={(e) => setFilterJenjang(e.target.value)}
                  className="border rounded-xl px-3 py-1.5 text-xs font-semibold bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
                  style={{ borderColor: "#e5e7eb" }}
                >
                  <option value="semua">Semua Jenjang</option>
                  <option value="SMP">SMP</option>
                  <option value="SMA">SMA</option>
                  <option value="SMK">SMK</option>
                </select>

                <div className="flex bg-gray-100 p-1 rounded-xl">
                  {["semua", "menunggu", "diterima", "ditolak"].map((s) => (
                    <button
                      key={s}
                      onClick={() => setFilterStatus(s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                        filterStatus === s
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-500 hover:text-gray-800"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                <button
                  onClick={exportCSV}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-sm hover:opacity-95 transition-all"
                  style={{ background: primaryColor }}
                >
                  <Download size={16} />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden" style={{ borderColor: "#f0f0f0" }}>
              {loadingPendaftar ? (
                <div className="p-16 text-center text-gray-400">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-800 mx-auto mb-3" />
                  <span>Memuat data pendaftar...</span>
                </div>
              ) : filteredPendaftar.length === 0 ? (
                <div className="p-16 text-center text-gray-400">
                  <Users size={40} className="mx-auto text-gray-300 mb-2" />
                  <p className="font-semibold text-gray-600">Tidak ada data pendaftar ditemukan.</p>
                  <p className="text-xs text-gray-400">Calon santri yang mendaftar via web akan muncul di sini secara real-time.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-gray-50/80 border-b text-xs text-gray-500 font-bold uppercase tracking-wider" style={{ borderColor: "#f0f0f0" }}>
                        <th className="px-5 py-3.5">No. Registrasi</th>
                        <th className="px-5 py-3.5">Nama Calon Santri</th>
                        <th className="px-5 py-3.5">Jalur & Jenjang</th>
                        <th className="px-5 py-3.5">Pendidikan Asal</th>
                        <th className="px-5 py-3.5">Wali & WhatsApp</th>
                        <th className="px-5 py-3.5 text-center">Status</th>
                        <th className="px-5 py-3.5 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredPendaftar.map((p) => {
                        const statusBadge = {
                          menunggu: { bg: "bg-yellow-50", text: "text-yellow-800", border: "border-yellow-200", label: "Menunggu" },
                          diterima: { bg: "bg-green-50", text: "text-green-800", border: "border-green-200", label: "Diterima" },
                          ditolak: { bg: "bg-red-50", text: "text-red-800", border: "border-red-200", label: "Ditolak" },
                          imported: { bg: "bg-blue-50", text: "text-blue-800", border: "border-blue-200", label: "Imported" },
                        }[p.status] || { bg: "bg-gray-50", text: "text-gray-800", border: "border-gray-200", label: p.status };

                        return (
                          <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                            <td className="px-5 py-3.5 font-mono text-xs font-bold text-gray-700">
                              {p.nomor_registrasi || `PSB-${p.id}`}
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="font-bold text-gray-900 block">{p.nama_lengkap}</span>
                              <span className="text-xs text-gray-400">
                                {p.jenis_kelamin === "P" ? "Perempuan" : "Laki-laki"} {p.tempat_lahir ? `• ${p.tempat_lahir}` : ""} {p.tanggal_lahir ? `• ${p.tanggal_lahir}` : ""}
                              </span>
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="flex flex-col gap-1 items-start">
                                {(p.jalur_pendaftaran || (p.catatan_admin?.includes("LKSA") ? "lksa" : "reguler")) === "lksa" ? (
                                  <span className="inline-block px-2 py-0.5 rounded text-[11px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                                    ★ LKSA (Gratis)
                                  </span>
                                ) : (
                                  <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                    Reguler (MBS)
                                  </span>
                                )}
                                <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                  Tujuan: {p.jenjang_tujuan || (p.catatan_admin?.match(/\[Jenjang:\s*(\w+)\]/i)?.[1]) || "SMP"}
                                </span>
                              </div>
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="block text-gray-800 font-medium">{p.asal_sekolah || "-"}</span>
                              <span className="text-xs text-gray-400">{p.jurusan || "Umum"}</span>
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="block font-medium text-gray-800">{p.nama_ayah || p.nama_ibu || "-"}</span>
                              <span className="text-xs text-gray-500 font-mono">{p.no_hp_wali || "-"}</span>
                            </td>
                            <td className="px-5 py-3.5 text-center">
                              <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}>
                                {statusBadge.label}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-center">
                              <button
                                onClick={() => {
                                  setSelectedPendaftar(p);
                                  setCatatanVerifikasi(p.catatan_admin || "");
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white transition-all shadow-sm"
                                style={{ background: primaryColor }}
                              >
                                <Eye size={13} />
                                <span>Verifikasi</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            TAB 2: KUSTOMISASI TAMPILAN WEB (LENGKAP)
           ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === "kustomisasi" && (
          <div className="space-y-6">
            {/* Status Message */}
            {configMsg && (
              <div className={`p-4 rounded-2xl text-sm font-semibold flex items-center justify-between border shadow-sm ${
                configMsg.includes("berhasil")
                  ? "bg-green-50 text-green-800 border-green-200"
                  : "bg-red-50 text-red-800 border-red-200"
              }`}>
                <span>{configMsg}</span>
                <button onClick={() => setConfigMsg("")} className="text-gray-400 hover:text-gray-600">
                  <X size={16} />
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form Kolom Kiri & Tengah */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* 1. Identitas Pesantren */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border" style={{ borderColor: "#f0f0f0" }}>
                  <div className="flex items-center gap-2.5 mb-4 pb-3 border-b" style={{ borderColor: "#f0f0f0" }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ background: primaryColor }}>
                      <BookOpen size={16} />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-gray-900">1. Identitas Pondok Pesantren</h2>
                      <p className="text-xs text-gray-500">Nama, moto, dan informasi umum yang tampil di landing page</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">Nama Lengkap Pesantren *</label>
                      <input
                        type="text"
                        value={config.nama_pesantren || ""}
                        onChange={(e) => handleConfigChange("nama_pesantren", e.target.value)}
                        placeholder="Contoh: Pondok Pesantren Muhammadiyah Bangsri"
                        className="w-full border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50/50"
                        style={{ borderColor: "#e5e7eb" }}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">Nama Singkat / Panggilan</label>
                      <input
                        type="text"
                        value={config.nama_singkat || ""}
                        onChange={(e) => handleConfigChange("nama_singkat", e.target.value)}
                        placeholder="Contoh: PP Muhammadiyah Bangsri"
                        className="w-full border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50/50"
                        style={{ borderColor: "#e5e7eb" }}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">Tahun Berdiri</label>
                      <input
                        type="text"
                        value={config.tahun_berdiri || ""}
                        onChange={(e) => handleConfigChange("tahun_berdiri", e.target.value)}
                        placeholder="Contoh: 1985"
                        className="w-full border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50/50"
                        style={{ borderColor: "#e5e7eb" }}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">Tagline / Moto Pesantren</label>
                      <input
                        type="text"
                        value={config.tagline || ""}
                        onChange={(e) => handleConfigChange("tagline", e.target.value)}
                        placeholder="Contoh: Mencetak Generasi Qur'ani, Berakhlak Mulia & Berwawasan Global"
                        className="w-full border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50/50"
                        style={{ borderColor: "#e5e7eb" }}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">Deskripsi Profil Singkat</label>
                      <textarea
                        rows={3}
                        value={config.deskripsi || ""}
                        onChange={(e) => handleConfigChange("deskripsi", e.target.value)}
                        placeholder="Deskripsi singkat mengenai keunggulan, visi, dan misi pondok pesantren..."
                        className="w-full border rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50/50"
                        style={{ borderColor: "#e5e7eb" }}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">Jumlah Santri Aktif (Display)</label>
                      <input
                        type="text"
                        value={config.jumlah_santri || ""}
                        onChange={(e) => handleConfigChange("jumlah_santri", e.target.value)}
                        placeholder="Contoh: 1200+"
                        className="w-full border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50/50"
                        style={{ borderColor: "#e5e7eb" }}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">Program Pendidikan (Pisah koma)</label>
                      <input
                        type="text"
                        value={config.program_pendidikan || ""}
                        onChange={(e) => handleConfigChange("program_pendidikan", e.target.value)}
                        placeholder="Contoh: Tahfidz 30 Juz, MTs, MA, Kitab Kuning"
                        className="w-full border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50/50"
                        style={{ borderColor: "#e5e7eb" }}
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Tema & Branding Warna */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border" style={{ borderColor: "#f0f0f0" }}>
                  <div className="flex items-center gap-2.5 mb-4 pb-3 border-b" style={{ borderColor: "#f0f0f0" }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ background: primaryColor }}>
                      <Palette size={16} />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-gray-900">2. Tema Warna & Branding</h2>
                      <p className="text-xs text-gray-500">Sesuaikan palet warna agar identik dengan logo & seragam pesantren</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Warna Primer */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2">Warna Primer (Warna Utama)</label>
                      <div className="flex items-center gap-3 mb-3">
                        <input
                          type="color"
                          value={config.warna_primer || "#0f4c1e"}
                          onChange={(e) => handleConfigChange("warna_primer", e.target.value)}
                          className="w-12 h-12 rounded-xl cursor-pointer border p-1"
                          style={{ borderColor: "#e5e7eb" }}
                        />
                        <div>
                          <input
                            type="text"
                            value={config.warna_primer || "#0f4c1e"}
                            onChange={(e) => handleConfigChange("warna_primer", e.target.value)}
                            className="font-mono text-xs font-bold border rounded-lg px-2.5 py-1.5 w-28 uppercase"
                            style={{ borderColor: "#e5e7eb" }}
                          />
                          <span className="block text-[11px] text-gray-400 mt-1">Header, tombol, navbar</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {COLOR_PRESETS_PRIMARY.map((p) => (
                          <button
                            key={p.hex}
                            type="button"
                            onClick={() => handleConfigChange("warna_primer", p.hex)}
                            className="text-[11px] px-2 py-1 rounded-md border flex items-center gap-1.5 hover:bg-gray-50"
                            style={{ borderColor: "#e5e7eb" }}
                          >
                            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: p.hex }} />
                            <span>{p.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Warna Aksen */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2">Warna Aksen (Highlight & Badge)</label>
                      <div className="flex items-center gap-3 mb-3">
                        <input
                          type="color"
                          value={config.warna_aksen || "#c8a84b"}
                          onChange={(e) => handleConfigChange("warna_aksen", e.target.value)}
                          className="w-12 h-12 rounded-xl cursor-pointer border p-1"
                          style={{ borderColor: "#e5e7eb" }}
                        />
                        <div>
                          <input
                            type="text"
                            value={config.warna_aksen || "#c8a84b"}
                            onChange={(e) => handleConfigChange("warna_aksen", e.target.value)}
                            className="font-mono text-xs font-bold border rounded-lg px-2.5 py-1.5 w-28 uppercase"
                            style={{ borderColor: "#e5e7eb" }}
                          />
                          <span className="block text-[11px] text-gray-400 mt-1">Badge, bintang, highlight</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {COLOR_PRESETS_ACCENT.map((p) => (
                          <button
                            key={p.hex}
                            type="button"
                            onClick={() => handleConfigChange("warna_aksen", p.hex)}
                            className="text-[11px] px-2 py-1 rounded-md border flex items-center gap-1.5 hover:bg-gray-50"
                            style={{ borderColor: "#e5e7eb" }}
                          >
                            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: p.hex }} />
                            <span>{p.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* URL Logo & Hero Banner */}
                    <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t" style={{ borderColor: "#f0f0f0" }}>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">URL Logo Pesantren</label>
                        <input
                          type="text"
                          value={config.logo_url || ""}
                          onChange={(e) => handleConfigChange("logo_url", e.target.value)}
                          placeholder="https://... atau /logo.png"
                          className="w-full border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50/50"
                          style={{ borderColor: "#e5e7eb" }}
                        />
                        <span className="text-[11px] text-gray-400 block mt-1">Mendukung link Google Drive, Supabase, atau URL gambar</span>
                        {config.logo_url && (
                          <div className="mt-2 flex items-center gap-2 p-2 bg-gray-50 rounded-xl border border-gray-100">
                            <img
                              src={toDirectImageUrl(config.logo_url)}
                              alt="Preview Logo"
                              referrerPolicy="no-referrer"
                              className="w-8 h-8 object-contain rounded border bg-white p-0.5"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://placehold.co/100x100?text=Error";
                              }}
                            />
                            <span className="text-xs text-gray-500 font-medium">Preview Logo Berhasil Dimuat</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">URL Foto Hero Banner</label>
                        <input
                          type="text"
                          value={config.hero_bg_url || ""}
                          onChange={(e) => handleConfigChange("hero_bg_url", e.target.value)}
                          placeholder="https://.../banner-pesantren.jpg"
                          className="w-full border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50/50"
                          style={{ borderColor: "#e5e7eb" }}
                        />
                        <span className="text-[11px] text-gray-400 block mt-1">Foto pemandangan pesantren untuk background hero (bisa Google Drive)</span>
                        {config.hero_bg_url && (
                          <div className="mt-2 flex items-center gap-2.5 p-2 bg-gray-50 rounded-xl border border-gray-100">
                            <img
                              src={toDirectImageUrl(config.hero_bg_url)}
                              alt="Preview Hero Banner"
                              referrerPolicy="no-referrer"
                              className="w-16 h-9 object-cover rounded-lg border bg-white"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://placehold.co/160x90?text=Error";
                              }}
                            />
                            <span className="text-xs text-gray-500 font-medium">Preview Banner Hero</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Kontak & Media Sosial */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border" style={{ borderColor: "#f0f0f0" }}>
                  <div className="flex items-center gap-2.5 mb-4 pb-3 border-b" style={{ borderColor: "#f0f0f0" }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ background: primaryColor }}>
                      <Phone size={16} />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-gray-900">3. Kontak Panitia & Lokasi</h2>
                      <p className="text-xs text-gray-500">Nomor WhatsApp konsultasi pendaftaran dan lokasi pesantren</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">Nomor WhatsApp Panitia PSB *</label>
                      <div className="relative">
                        <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={config.no_wa_admin || ""}
                          onChange={(e) => handleConfigChange("no_wa_admin", e.target.value)}
                          placeholder="Contoh: 081234567890 atau 6281234567890"
                          className="w-full border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50/50"
                          style={{ borderColor: "#e5e7eb" }}
                        />
                      </div>
                      <span className="text-[11px] text-gray-400 block mt-1">Tombol WA melayang di web akan langsung chat ke nomor ini</span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">Email Resmi PSB</label>
                      <div className="relative">
                        <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="email"
                          value={config.email || ""}
                          onChange={(e) => handleConfigChange("email", e.target.value)}
                          placeholder="psb@pesantren.sch.id"
                          className="w-full border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50/50"
                          style={{ borderColor: "#e5e7eb" }}
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">Alamat Lengkap Pesantren</label>
                      <div className="relative">
                        <MapPin size={15} className="absolute left-3.5 top-3 text-gray-400" />
                        <textarea
                          rows={2}
                          value={config.alamat || ""}
                          onChange={(e) => handleConfigChange("alamat", e.target.value)}
                          placeholder="Jl. Raya Pesantren No. 1, Desa/Kelurahan, Kecamatan, Kabupaten/Kota, Provinsi"
                          className="w-full border rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50/50"
                          style={{ borderColor: "#e5e7eb" }}
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">Link Embed Google Maps (Peta Lokasi Pesantren)</label>
                      <input
                        type="text"
                        value={config.maps_embed_url || ""}
                        onChange={(e) => {
                          let val = e.target.value;
                          if (val.includes("<iframe")) {
                            const m = val.match(/src=["']([^"']+)["']/i);
                            if (m && m[1]) val = m[1];
                          }
                          handleConfigChange("maps_embed_url", val);
                        }}
                        placeholder="Contoh: https://maps.google.com/maps?q=... atau salin kode <iframe> dari Google Maps"
                        className="w-full border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50/50"
                        style={{ borderColor: "#e5e7eb" }}
                      />
                      <span className="text-[11px] text-gray-400 block mt-1">
                        Bisa paste link embed atau kode &lt;iframe&gt; dari Google Maps. Jika dikosongkan, sistem otomatis menampilkan peta lokasi berdasarkan nama & alamat pesantren.
                      </span>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">Link Video Profil YouTube (Opsional)</label>
                      <input
                        type="text"
                        value={config.video_profil_url || ""}
                        onChange={(e) => handleConfigChange("video_profil_url", e.target.value)}
                        placeholder="Contoh: https://www.youtube.com/watch?v=..."
                        className="w-full border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50/50"
                        style={{ borderColor: "#e5e7eb" }}
                      />
                      <span className="text-[11px] text-gray-400 block mt-1">Mendukung link YouTube biasa, youtu.be, atau kode embed iframe</span>
                      {config.video_profil_url && (
                        <div className="mt-2 flex items-center gap-2.5 p-2 bg-gray-50 rounded-xl border border-gray-100">
                          {parseMediaUrl(config.video_profil_url).thumbnailUrl ? (
                            <img
                              src={parseMediaUrl(config.video_profil_url).thumbnailUrl}
                              alt="Preview Video"
                              referrerPolicy="no-referrer"
                              className="w-16 h-9 object-cover rounded-lg border bg-white"
                            />
                          ) : null}
                          <span className="text-xs text-gray-500 font-medium">Video YouTube Berhasil Dikenali</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 4. Kustomisasi Teks & Judul Tiap Bagian */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border" style={{ borderColor: "#f0f0f0" }}>
                  <div className="flex items-center gap-2.5 mb-4 pb-3 border-b" style={{ borderColor: "#f0f0f0" }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ background: primaryColor }}>
                      <Palette size={16} />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-gray-900">4. Teks, Judul & Kalimat Penjelas Bagian Web</h2>
                      <p className="text-xs text-gray-500">Sesuaikan judul, badge, dan kalimat penjelas di setiap bagian website</p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    {/* A. Bagian Program Unggulan */}
                    <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/40 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ background: accentColor }} />
                        <h3 className="font-bold text-xs uppercase tracking-wider text-gray-700">Bagian Program Unggulan</h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 mb-1">Badge Atas</label>
                          <input
                            type="text"
                            value={config.program_badge || ""}
                            onChange={(e) => handleConfigChange("program_badge", e.target.value)}
                            placeholder="Default: Keunggulan Kami"
                            className="w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 mb-1">Judul Utama</label>
                          <input
                            type="text"
                            value={config.program_judul || ""}
                            onChange={(e) => handleConfigChange("program_judul", e.target.value)}
                            placeholder="Default: Program Unggulan"
                            className="w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-bold text-gray-600 mb-1">Penjelasan / Deskripsi di Bawah Judul</label>
                          <textarea
                            rows={2}
                            value={config.program_deskripsi || ""}
                            onChange={(e) => handleConfigChange("program_deskripsi", e.target.value)}
                            placeholder="Default: Kami menyediakan program terbaik untuk membentuk generasi yang berilmu, berakhlak, dan berdaya saing global."
                            className="w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
                          />
                          <span className="text-[10px] text-gray-400 block mt-0.5">Penjelasan visi keunggulan yang tampil tepat di bawah tulisan Program Unggulan</span>
                        </div>
                      </div>
                    </div>

                    {/* B. Bagian Profil / Tentang Pesantren */}
                    <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/40 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ background: accentColor }} />
                        <h3 className="font-bold text-xs uppercase tracking-wider text-gray-700">Bagian Profil & Tentang Pesantren</h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 mb-1">Badge Atas</label>
                          <input
                            type="text"
                            value={config.tentang_badge || ""}
                            onChange={(e) => handleConfigChange("tentang_badge", e.target.value)}
                            placeholder="Default: Profil & Visi"
                            className="w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 mb-1">Judul Bagian</label>
                          <input
                            type="text"
                            value={config.tentang_judul || ""}
                            onChange={(e) => handleConfigChange("tentang_judul", e.target.value)}
                            placeholder="Default: Tentang {Nama Pesantren}"
                            className="w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-bold text-gray-600 mb-1">Label Daftar Program</label>
                          <input
                            type="text"
                            value={config.tentang_program_label || ""}
                            onChange={(e) => handleConfigChange("tentang_program_label", e.target.value)}
                            placeholder="Default: Program Pendidikan yang Diselenggarakan:"
                            className="w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* C. Bagian Galeri */}
                    <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/40 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ background: accentColor }} />
                        <h3 className="font-bold text-xs uppercase tracking-wider text-gray-700">Bagian Galeri Santri</h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 mb-1">Badge Atas</label>
                          <input
                            type="text"
                            value={config.galeri_badge || ""}
                            onChange={(e) => handleConfigChange("galeri_badge", e.target.value)}
                            placeholder="Default: Galeri"
                            className="w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 mb-1">Judul Utama</label>
                          <input
                            type="text"
                            value={config.galeri_judul || ""}
                            onChange={(e) => handleConfigChange("galeri_judul", e.target.value)}
                            placeholder="Default: Kehidupan di Pesantren"
                            className="w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-bold text-gray-600 mb-1">Keterangan / Sub-judul (Opsional)</label>
                          <input
                            type="text"
                            value={config.galeri_deskripsi || ""}
                            onChange={(e) => handleConfigChange("galeri_deskripsi", e.target.value)}
                            placeholder="Contoh: Dokumentasi sarana, fasilitas, dan kegiatan santri sehari-hari"
                            className="w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* D. Bagian Gelombang PSB & Tombol */}
                    <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/40 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ background: accentColor }} />
                        <h3 className="font-bold text-xs uppercase tracking-wider text-gray-700">Bagian Gelombang PSB & Tombol Aksi</h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 mb-1">Badge Gelombang</label>
                          <input
                            type="text"
                            value={config.gelombang_badge || ""}
                            onChange={(e) => handleConfigChange("gelombang_badge", e.target.value)}
                            placeholder="Default: Jadwal Pendaftaran"
                            className="w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 mb-1">Judul Gelombang</label>
                          <input
                            type="text"
                            value={config.gelombang_judul || ""}
                            onChange={(e) => handleConfigChange("gelombang_judul", e.target.value)}
                            placeholder="Default: Gelombang Penerimaan Santri Baru"
                            className="w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 mb-1">Teks Tombol Daftar (Hero)</label>
                          <input
                            type="text"
                            value={config.hero_cta_daftar || ""}
                            onChange={(e) => handleConfigChange("hero_cta_daftar", e.target.value)}
                            placeholder="Default: Daftar Sekarang"
                            className="w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 mb-1">Teks Tombol Video (Hero)</label>
                          <input
                            type="text"
                            value={config.hero_cta_video || ""}
                            onChange={(e) => handleConfigChange("hero_cta_video", e.target.value)}
                            placeholder="Default: Tonton Video Profil"
                            className="w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5. Syarat & Ketentuan Formulir PSB */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border" style={{ borderColor: "#f0f0f0" }}>
                  <div className="flex items-center gap-2.5 mb-4 pb-3 border-b" style={{ borderColor: "#f0f0f0" }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ background: primaryColor }}>
                      <FileCheck size={16} />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-gray-900">5. Syarat & Ketentuan Formulir PSB</h2>
                      <p className="text-xs text-gray-500">Ketentuan resmi pendaftaran yang tampil dan wajib disetujui calon santri / wali di form pendaftaran</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Poin-poin Persyaratan & Ketentuan (Tulis satu poin per baris)
                    </label>
                    <textarea
                      rows={8}
                      value={config.syarat_ketentuan || ""}
                      onChange={(e) => handleConfigChange("syarat_ketentuan", e.target.value)}
                      placeholder="Contoh:&#10;1. Calon santri beragama Islam dan berakhlak mulia.&#10;2. Berijazah / lulus jenjang sebelumnya (SD/MI untuk SMP, SMP/MTs untuk SMA/SMK).&#10;3. Mengisi data formulir pendaftaran dengan benar dan jujur.&#10;4. Melampirkan berkas Pas Foto, Kartu Keluarga, dan Akta Kelahiran (format JPG/PNG/PDF maks 1MB).&#10;5. Khusus pendaftar santri LKSA (Gratis), wajib melampirkan Surat Keterangan Tidak Mampu (SKTM).&#10;6. Bersedia mentaati seluruh tata tertib pesantren dan sekolah."
                      className="w-full border rounded-xl p-3.5 text-xs focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50/50 font-mono leading-relaxed"
                      style={{ borderColor: "#e5e7eb" }}
                    />
                    <p className="text-[11px] text-gray-400 mt-1.5">
                      💡 <strong>Tips:</strong> Jika dikosongkan, form pendaftaran akan otomatis menggunakan 8 butir syarat standar sistem. Anda dapat merinci syarat khusus pesantren Anda di sini.
                    </p>
                  </div>
                </div>

                {/* Save Button Bar */}
                <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur p-4 rounded-2xl shadow-lg border flex items-center justify-between gap-4" style={{ borderColor: "#e5e7eb" }}>
                  <div className="text-xs text-gray-500 hidden sm:block">
                    Perubahan akan langsung terlihat di landing page web PSB setelah disimpan.
                  </div>
                  <button
                    type="button"
                    onClick={saveConfig}
                    disabled={savingConfig}
                    className="w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-sm text-white shadow-md transition-all flex items-center justify-center gap-2 hover:scale-[1.02] disabled:opacity-50"
                    style={{ background: `linear-gradient(135deg, ${primaryColor}, #1a6b2b)` }}
                  >
                    <Save size={17} />
                    <span>{savingConfig ? "Menyimpan..." : "💾 Simpan Kustomisasi Web"}</span>
                  </button>
                </div>
              </div>

              {/* Kolom Kanan: Live Preview Card */}
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-5 shadow-sm border sticky top-24" style={{ borderColor: "#f0f0f0" }}>
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b" style={{ borderColor: "#f0f0f0" }}>
                    <Sparkles size={16} style={{ color: accentColor }} />
                    <h3 className="font-bold text-sm text-gray-900">Simulasi Tampilan Landing Page</h3>
                  </div>

                  {/* Mock Navbar Preview */}
                  <div className="rounded-xl overflow-hidden border shadow-sm" style={{ borderColor: "#e5e7eb" }}>
                    <div className="p-3 text-white flex items-center justify-between" style={{ background: primaryColor }}>
                      <div className="flex items-center gap-2">
                        {config.logo_url ? (
                          <img src={toDirectImageUrl(config.logo_url)} alt="Logo" referrerPolicy="no-referrer" className="w-6 h-6 object-contain rounded bg-white/20" onError={(e) => { (e.target as HTMLElement).style.display = "none"; }} />
                        ) : (
                          <div className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold" style={{ background: accentColor, color: primaryColor }}>
                            P
                          </div>
                        )}
                        <span className="font-extrabold text-xs truncate max-w-[150px]">
                          {config.nama_singkat || config.nama_pesantren || "Pesantren Anda"}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: accentColor, color: primaryColor }}>
                        Daftar
                      </span>
                    </div>

                    {/* Mock Hero Preview */}
                    <div className="p-4 text-center text-white relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${primaryColor}ee, #083310)` }}>
                      <span className="inline-block text-[9px] font-bold px-2 py-0.5 rounded-full mb-2 border" style={{ borderColor: `${accentColor}80`, color: accentColor }}>
                        PSB TA 2026/2027
                      </span>
                      <h4 className="font-black text-sm mb-1 leading-snug">
                        {config.nama_pesantren || "Pondok Pesantren Al-Ikhlas"}
                      </h4>
                      <p className="text-[11px] text-white/80 line-clamp-2 mb-3">
                        {config.tagline || "Mencetak Generasi Qur'ani, Berakhlak Mulia & Mandiri"}
                      </p>

                      <div className="flex justify-center gap-2">
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold shadow-sm" style={{ background: accentColor, color: primaryColor }}>
                          Daftar Sekarang
                        </span>
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-white/20 text-white">
                          Cek Status
                        </span>
                      </div>
                    </div>

                    {/* Mock Info Bar */}
                    <div className="p-3 bg-gray-50 text-[11px] space-y-1.5 text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <Phone size={11} className="text-green-600 shrink-0" />
                        <span className="truncate">{config.no_wa_admin || "081234567890"}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin size={11} className="text-red-500 shrink-0" />
                        <span className="truncate">{config.alamat || "Indonesia"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11.5px] text-amber-800 leading-relaxed">
                    💡 <strong>Tips:</strong> Setelah menekan tombol <em>"Simpan Kustomisasi Web"</em>, buka tombol <strong>"Lihat Website Publik"</strong> di pojok kanan atas untuk melihat hasil tampilan di internet secara langsung!
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            TAB 3: GELOMBANG PENDAFTARAN
           ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === "gelombang" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border flex items-center justify-between flex-wrap gap-4" style={{ borderColor: "#f0f0f0" }}>
              <div>
                <h2 className="text-base font-bold text-gray-900">Jadwal & Gelombang Penerimaan Santri Baru</h2>
                <p className="text-xs text-gray-500">Atur tanggal buka, tutup, kuota santri, dan biaya pendaftaran per gelombang</p>
              </div>
              <button
                onClick={() => setShowGelombangForm(!showGelombangForm)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-sm"
                style={{ background: primaryColor }}
              >
                <Plus size={16} />
                <span>{showGelombangForm ? "Tutup Form" : "Tambah Gelombang Baru"}</span>
              </button>
            </div>

            {/* Form Tambah Gelombang */}
            {showGelombangForm && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-200" style={{ borderColor: "#bbf7d0" }}>
                <h3 className="font-bold text-sm text-gray-900 mb-4 pb-2 border-b">Form Tambah Gelombang PSB</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1">Nama Gelombang *</label>
                    <input
                      type="text"
                      value={gelombangForm.nama}
                      onChange={(e) => setGelombangForm({ ...gelombangForm, nama: e.target.value })}
                      placeholder="Contoh: Gelombang 2 - Jalur Reguler"
                      className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Kuota Santri</label>
                    <input
                      type="number"
                      value={gelombangForm.kuota}
                      onChange={(e) => setGelombangForm({ ...gelombangForm, kuota: e.target.value })}
                      placeholder="Contoh: 150"
                      className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Tanggal Buka *</label>
                    <input
                      type="date"
                      value={gelombangForm.tanggal_buka}
                      onChange={(e) => setGelombangForm({ ...gelombangForm, tanggal_buka: e.target.value })}
                      className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Tanggal Tutup *</label>
                    <input
                      type="date"
                      value={gelombangForm.tanggal_tutup}
                      onChange={(e) => setGelombangForm({ ...gelombangForm, tanggal_tutup: e.target.value })}
                      className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Biaya Pendaftaran (Rp)</label>
                    <input
                      type="number"
                      value={gelombangForm.biaya_pendaftaran}
                      onChange={(e) => setGelombangForm({ ...gelombangForm, biaya_pendaftaran: e.target.value })}
                      className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                  </div>
                  <div className="sm:col-span-2 md:col-span-3">
                    <label className="block text-xs font-bold text-gray-700 mb-1">Keterangan / Persyaratan Khusus</label>
                    <input
                      type="text"
                      value={gelombangForm.keterangan}
                      onChange={(e) => setGelombangForm({ ...gelombangForm, keterangan: e.target.value })}
                      placeholder="Contoh: Termasuk seragam, modul, dan tes seleksi"
                      className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-4 pt-3 border-t">
                  <button
                    onClick={() => setShowGelombangForm(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200"
                  >
                    Batal
                  </button>
                  <button
                    onClick={saveGelombang}
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white shadow-sm"
                    style={{ background: primaryColor }}
                  >
                    Simpan Gelombang
                  </button>
                </div>
              </div>
            )}

            {/* List Gelombang */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {gelombangList.map((g) => (
                <div key={g.id} className="bg-white rounded-2xl p-5 shadow-sm border flex flex-col justify-between" style={{ borderColor: "#f0f0f0" }}>
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="font-bold text-base text-gray-900">{g.nama}</h3>
                      <button
                        onClick={() => toggleGelombang(g.id, g.is_aktif)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                          g.is_aktif
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {g.is_aktif ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                        <span>{g.is_aktif ? "Aktif (Buka)" : "Tutup"}</span>
                      </button>
                    </div>

                    <div className="space-y-1.5 text-xs text-gray-600 mb-3">
                      <div><strong>Jadwal:</strong> {g.tanggal_buka} s/d {g.tanggal_tutup}</div>
                      <div><strong>Kuota:</strong> {g.kuota ? `${g.kuota} Santri` : "Tidak Dibatasi"}</div>
                      <div><strong>Biaya:</strong> Rp {Number(g.biaya_pendaftaran || 0).toLocaleString("id-ID")}</div>
                      {g.keterangan && <div className="text-gray-400 italic mt-1">{g.keterangan}</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            TAB 4: GALERI FOTO PESANTREN
           ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === "galeri" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border flex items-center justify-between flex-wrap gap-4" style={{ borderColor: "#f0f0f0" }}>
              <div>
                <h2 className="text-base font-bold text-gray-900">Kelola Foto Galeri Pesantren</h2>
                <p className="text-xs text-gray-500">Foto sarana, asrama, masjid, dan kegiatan santri yang tampil di halaman utama</p>
              </div>
              <button
                onClick={() => setShowGaleriForm(!showGaleriForm)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-sm"
                style={{ background: primaryColor }}
              >
                <Plus size={16} />
                <span>{showGaleriForm ? "Tutup Form" : "Tambah Foto Baru"}</span>
              </button>
            </div>

            {/* Form Tambah Galeri */}
            {showGaleriForm && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-200">
                <h3 className="font-bold text-sm text-gray-900 mb-4 pb-2 border-b">Upload / Tambah Foto Galeri</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Judul Foto *</label>
                    <input
                      type="text"
                      value={galeriForm.judul}
                      onChange={(e) => setGaleriForm({ ...galeriForm, judul: e.target.value })}
                      placeholder="Contoh: Gedung Asrama Santri Putra"
                      className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Nomor Urutan Tampil</label>
                    <input
                      type="number"
                      value={galeriForm.urutan}
                      onChange={(e) => setGaleriForm({ ...galeriForm, urutan: e.target.value })}
                      className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1">URL Foto *</label>
                    <input
                      type="text"
                      value={galeriForm.foto_url}
                      onChange={(e) => setGaleriForm({ ...galeriForm, foto_url: e.target.value })}
                      placeholder="https://images.unsplash.com/... atau URL foto hosting"
                      className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1">Deskripsi Singkat</label>
                    <input
                      type="text"
                      value={galeriForm.deskripsi}
                      onChange={(e) => setGaleriForm({ ...galeriForm, deskripsi: e.target.value })}
                      placeholder="Keterangan foto kegiatan atau sarana..."
                      className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-4 pt-3 border-t">
                  <button
                    onClick={() => setShowGaleriForm(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200"
                  >
                    Batal
                  </button>
                  <button
                    onClick={saveGaleri}
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white shadow-sm"
                    style={{ background: primaryColor }}
                  >
                    Simpan Foto
                  </button>
                </div>
              </div>
            )}

            {/* Grid Galeri */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {galeriList.map((g) => {
                const media = parseMediaUrl(g.foto_url);
                return (
                  <div key={g.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border flex flex-col justify-between" style={{ borderColor: "#f0f0f0" }}>
                    <div className="h-44 bg-gray-100 relative group overflow-hidden">
                      <img
                        src={media.thumbnailUrl}
                        alt={g.judul || "Foto Galeri"}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://placehold.co/400x300/e2e8f0/64748b?text=Galeri";
                        }}
                      />
                      {media.type === "youtube" && (
                        <div className="absolute top-2 left-2 bg-red-600 text-white text-[11px] font-bold px-2 py-0.5 rounded flex items-center gap-1 shadow">
                          <span>▶ YouTube</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-sm text-gray-900 leading-tight truncate">{g.judul || "(Tanpa Judul)"}</h4>
                        {g.deskripsi && <p className="text-xs text-gray-400 mt-1 line-clamp-1">{g.deskripsi}</p>}
                      </div>
                      <button
                        onClick={() => deleteGaleri(g.id)}
                        className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors shrink-0"
                        title="Hapus Foto / Video"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══ TAB 5: PROGRAM UNGGULAN ═══ */}
        {activeTab === "program" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border flex items-center justify-between flex-wrap gap-4" style={{ borderColor: "#f0f0f0" }}>
              <div>
                <h2 className="text-base font-bold text-gray-900">Kelola Program Unggulan</h2>
                <p className="text-xs text-gray-500">Program yang tampil di halaman utama website — bisa diaktifkan/nonaktifkan kapan saja</p>
              </div>
              <button onClick={() => setShowProgramForm(!showProgramForm)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-sm"
                style={{ background: primaryColor }}>
                <Plus size={16} />
                <span>{showProgramForm ? "Tutup Form" : "Tambah Program Baru"}</span>
              </button>
            </div>

            {showProgramForm && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-200">
                <h3 className="font-bold text-sm text-gray-900 mb-4 pb-2 border-b">Tambah Program Unggulan Baru</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Nama Program *</label>
                    <input type="text" value={programForm.nama} onChange={(e) => setProgramForm({...programForm, nama: e.target.value})}
                      placeholder="Contoh: Tahfidz Al-Quran" className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Nomor Urutan Tampil</label>
                    <input type="number" value={programForm.urutan} onChange={(e) => setProgramForm({...programForm, urutan: e.target.value})}
                      className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1">Deskripsi Singkat</label>
                    <textarea rows={2} value={programForm.deskripsi} onChange={(e) => setProgramForm({...programForm, deskripsi: e.target.value})}
                      placeholder="Jelaskan keunggulan program ini secara singkat..."
                      className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">Pilih Ikon Emoji</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {ICON_PRESETS.map(ic => (
                        <button key={ic} onClick={() => setProgramForm({...programForm, icon: ic})}
                          className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center border-2 transition-all ${programForm.icon === ic ? "border-green-600 bg-green-50 scale-110" : "border-gray-200 hover:border-gray-400"}`}>{ic}</button>
                      ))}
                    </div>
                    <input type="text" value={programForm.icon} onChange={(e) => setProgramForm({...programForm, icon: e.target.value})}
                      placeholder="Atau ketik emoji sendiri..." className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Warna Kartu</label>
                    <div className="flex items-center gap-3">
                      <input type="color" value={programForm.warna} onChange={(e) => setProgramForm({...programForm, warna: e.target.value})}
                        className="w-10 h-10 rounded-lg border cursor-pointer" />
                      <div className="flex flex-wrap gap-2">
                        {["#0f4c1e","#1e3a8a","#7c3aed","#b91c1c","#c8a84b","#0891b2"].map(c => (
                          <button key={c} onClick={() => setProgramForm({...programForm, warna: c})}
                            className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
                            style={{ background: c, borderColor: programForm.warna === c ? "#111" : "transparent" }} />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{programForm.warna}</p>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4 pt-3 border-t">
                  <button onClick={() => setShowProgramForm(false)} className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200">Batal</button>
                  <button onClick={async () => {
                    if (!programForm.nama.trim()) return alert("Nama program wajib diisi!");
                    const r = await fetch("/api/program", { method: "POST", headers: {"Content-Type":"application/json", "Authorization": `Bearer ${token}`}, body: JSON.stringify({...programForm, urutan: parseInt(programForm.urutan)||99}) });
                    const d = await r.json();
                    if (d.ok) { setProgramList(prev => [...prev, d.data].sort((a,b)=>a.urutan-b.urutan)); setProgramForm({nama:"",deskripsi:"",icon:"⭐",warna:"#0f4c1e",urutan:"1"}); setShowProgramForm(false); }
                    else alert("Gagal: " + d.error);
                  }} className="px-5 py-2 rounded-xl text-xs font-bold text-white shadow-sm" style={{ background: primaryColor }}>
                    Simpan Program
                  </button>
                </div>
              </div>
            )}

            {loadingProgram ? (
              <div className="text-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" style={{ borderColor: primaryColor }} /></div>
            ) : programList.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border" style={{ borderColor: "#f0f0f0" }}>
                <div className="text-5xl mb-3">📚</div>
                <p className="font-bold text-gray-700">Belum ada program unggulan</p>
                <p className="text-sm text-gray-400 mt-1">Klik tombol di atas untuk menambah program</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {programList.map((prog) => (
                  <div key={prog.id}
                    className={`bg-white rounded-2xl p-5 shadow-sm border flex flex-col gap-3 ${prog.is_aktif ? "" : "opacity-60"}`}
                    style={{ borderColor: "#f0f0f0", borderLeft: `4px solid ${prog.warna}` }}>
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl shrink-0" style={{ background: `${prog.warna}15` }}>{prog.icon}</div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-gray-900 leading-tight truncate">{prog.nama}</h4>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${prog.is_aktif ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                          {prog.is_aktif ? "✓ Aktif" : "Nonaktif"}
                        </span>
                      </div>
                    </div>
                    {prog.deskripsi && <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{prog.deskripsi}</p>}
                    <div className="flex gap-2 pt-2 border-t">
                      <button onClick={async () => {
                        const r = await fetch("/api/program", { method: "PUT", headers:{"Content-Type":"application/json", "Authorization": `Bearer ${token}`}, body: JSON.stringify({id: prog.id, is_aktif: !prog.is_aktif}) });
                        const d = await r.json();
                        if (d.ok) setProgramList(prev => prev.map(p => p.id === prog.id ? {...p, is_aktif: !p.is_aktif} : p));
                      }} className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                      style={{ background: prog.is_aktif ? "#fef9c3" : "#dcfce7", color: prog.is_aktif ? "#a16207" : "#15803d" }}>
                        {prog.is_aktif ? "Nonaktifkan" : "Aktifkan"}
                      </button>
                      <button onClick={async () => {
                        if (!confirm(`Hapus program "${prog.nama}"?`)) return;
                        const r = await fetch("/api/program", { method: "DELETE", headers:{"Content-Type":"application/json", "Authorization": `Bearer ${token}`}, body: JSON.stringify({id: prog.id}) });
                        const d = await r.json();
                        if (d.ok) setProgramList(prev => prev.filter(p => p.id !== prog.id));
                      }} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      {/* ─── Modal Verifikasi Pendaftar ─── */}
      {selectedPendaftar && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b mb-4">
              <h3 className="font-extrabold text-base text-gray-900">Verifikasi Berkas Calon Santri</h3>
              <button onClick={() => setSelectedPendaftar(null)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-gray-50 p-4 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="font-mono text-xs font-bold text-green-800">
                    {selectedPendaftar.nomor_registrasi || `PSB-${selectedPendaftar.id}`}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {((selectedPendaftar.jalur_pendaftaran || (selectedPendaftar.catatan_admin?.includes("LKSA") ? "lksa" : "reguler")) === "lksa") ? (
                      <span className="px-2 py-0.5 rounded text-[11px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                        ★ Jalur LKSA (Gratis)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        Jalur Reguler (MBS)
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      Tujuan: {selectedPendaftar.jenjang_tujuan || (selectedPendaftar.catatan_admin?.match(/\[Jenjang:\s*(\w+)\]/i)?.[1]) || "SMP"}
                    </span>
                  </div>
                </div>

                <div className="text-sm font-black text-gray-900 pt-1">{selectedPendaftar.nama_lengkap}</div>
                <div><strong>Jenis Kelamin:</strong> {selectedPendaftar.jenis_kelamin === "P" ? "Perempuan" : "Laki-laki"}</div>
                <div><strong>TTL:</strong> {selectedPendaftar.tempat_lahir || "-"}, {selectedPendaftar.tanggal_lahir || "-"}</div>
                <div><strong>Asal Sekolah:</strong> {selectedPendaftar.asal_sekolah || "-"}</div>
                <div><strong>Peminatan/Jurusan:</strong> {selectedPendaftar.jurusan || "Umum"}</div>
                <div><strong>Orang Tua / Wali:</strong> {selectedPendaftar.nama_ayah || selectedPendaftar.nama_ibu || "-"}</div>
                <div><strong>WhatsApp:</strong> {selectedPendaftar.no_hp_wali || "-"}</div>
                <div><strong>Alamat:</strong> {selectedPendaftar.alamat || "-"}</div>
              </div>

              {/* Berkas Dokumen yang Diunggah */}
              <div className="border rounded-xl p-3.5 bg-white space-y-2" style={{ borderColor: "#e5e7eb" }}>
                <h4 className="font-bold text-gray-800 text-xs">Berkas Dokumen yang Diunggah:</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded-lg bg-gray-50 border text-xs flex items-center justify-between">
                    <div className="flex items-center gap-1.5 truncate">
                      <FileText size={14} className="text-gray-500 shrink-0" />
                      <span className="truncate">Pas Foto (3x4)</span>
                    </div>
                    {selectedPendaftar.foto_url ? (
                      <a href={selectedPendaftar.foto_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-bold shrink-0 ml-1">
                        Lihat ↗
                      </a>
                    ) : <span className="text-gray-400 shrink-0 ml-1">Kosong</span>}
                  </div>

                  <div className="p-2 rounded-lg bg-gray-50 border text-xs flex items-center justify-between">
                    <div className="flex items-center gap-1.5 truncate">
                      <FileText size={14} className="text-gray-500 shrink-0" />
                      <span className="truncate">Kartu Keluarga</span>
                    </div>
                    {selectedPendaftar.kk_url ? (
                      <a href={selectedPendaftar.kk_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-bold shrink-0 ml-1">
                        Lihat ↗
                      </a>
                    ) : <span className="text-gray-400 shrink-0 ml-1">Kosong</span>}
                  </div>

                  <div className="p-2 rounded-lg bg-gray-50 border text-xs flex items-center justify-between">
                    <div className="flex items-center gap-1.5 truncate">
                      <FileText size={14} className="text-gray-500 shrink-0" />
                      <span className="truncate">Akta Kelahiran</span>
                    </div>
                    {(selectedPendaftar.akta_url || selectedPendaftar.ijazah_url) ? (
                      <a href={selectedPendaftar.akta_url || selectedPendaftar.ijazah_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-bold shrink-0 ml-1">
                        Lihat ↗
                      </a>
                    ) : <span className="text-gray-400 shrink-0 ml-1">Kosong</span>}
                  </div>

                  <div className={`p-2 rounded-lg border text-xs flex items-center justify-between ${
                    (selectedPendaftar.jalur_pendaftaran === "lksa" || selectedPendaftar.catatan_admin?.includes("LKSA"))
                      ? "bg-amber-50/70 border-amber-300"
                      : "bg-gray-50"
                  }`}>
                    <div className="flex items-center gap-1.5 truncate">
                      <FileText size={14} className={(selectedPendaftar.jalur_pendaftaran === "lksa" || selectedPendaftar.catatan_admin?.includes("LKSA")) ? "text-amber-700 shrink-0" : "text-gray-500 shrink-0"} />
                      <span className="truncate font-semibold">SKTM (LKSA)</span>
                    </div>
                    {selectedPendaftar.sktm_url ? (
                      <a href={selectedPendaftar.sktm_url} target="_blank" rel="noopener noreferrer" className="text-amber-900 font-extrabold hover:underline shrink-0 ml-1 bg-amber-100 px-1.5 py-0.5 rounded">
                        Lihat SKTM ↗
                      </a>
                    ) : (
                      <span className="text-gray-400 shrink-0 ml-1">
                        {(selectedPendaftar.jalur_pendaftaran === "lksa" || selectedPendaftar.catatan_admin?.includes("LKSA")) ? "Belum upload" : "-"}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Catatan Verifikasi Panitia</label>
                <textarea
                  rows={2}
                  value={catatanVerifikasi}
                  onChange={(e) => setCatatanVerifikasi(e.target.value)}
                  placeholder="Catatan hasil seleksi berkas, jadwal tes wawancara, dsb..."
                  className="w-full border rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>

              <div className="pt-3 border-t flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPendaftar(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  disabled={updatingStatus}
                  onClick={() => updateStatus(selectedPendaftar.id, "ditolak")}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-red-700 bg-red-100 hover:bg-red-200"
                >
                  Tolak Pendaftaran
                </button>
                <button
                  type="button"
                  disabled={updatingStatus}
                  onClick={() => updateStatus(selectedPendaftar.id, "diterima")}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white shadow-sm hover:opacity-95"
                  style={{ background: "#15803d" }}
                >
                  ✓ Terima Santri Ini
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


export default function AdminDashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-800" /></div>}>
      <AdminDashboardContent />
    </Suspense>
  );
}
