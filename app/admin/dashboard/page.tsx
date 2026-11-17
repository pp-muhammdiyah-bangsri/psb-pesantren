"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Search,
  LogOut,
  Eye,
  X,
  Palette,
  Calendar,
  Image as ImageIcon,
  ExternalLink,
  Trash2,
  BookOpen,
  Award,
  FileText,
  ArrowUpRight,
} from "lucide-react";
import ModalDialog from "@/components/ModalDialog";
import KustomisasiTab from "@/components/admin/KustomisasiTab";
import {
  GelombangTab,
  GaleriTab,
  ProgramTab,
  type GelombangItem,
  type GaleriItem,
  type ProgramItem,
} from "@/components/admin/AdminCrudTabs";

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
  penghasilan_orang_tua?: string;
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

type DashboardTab = "pendaftar" | "kustomisasi" | "gelombang" | "galeri" | "program";

function formatDateIndo(val?: string) {
  if (!val) return "-";
  const dt = new Date(val);
  if (Number.isNaN(dt.getTime())) return val;
  return dt.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

function formatGajiRp(val?: string) {
  if (!val || val === "-") return "-";
  const clean = val.trim();
  if (/^rp/i.test(clean) || /[a-z]/i.test(clean)) return clean;
  return `Rp ${clean}`;
}

function getJalurAndJenjang(p: Pendaftar) {
  const isLksa =
    (p.jalur_pendaftaran || (p.catatan_admin?.includes("LKSA") ? "lksa" : "reguler")).toLowerCase() ===
    "lksa";
  const jenjang =
    p.jenjang_tujuan || p.catatan_admin?.match(/\[Jenjang:\s*(\w+)\]/i)?.[1] || "SMP";
  const gaji =
    p.penghasilan_orang_tua || p.catatan_admin?.match(/\[Gaji:\s*([^\]]+)\]/i)?.[1] || "-";
  return { isLksa, jenjang, gaji };
}

const STATUS_BADGE_MAP: Record<
  string,
  { bg: string; text: string; border: string; label: string }
> = {
  menunggu: {
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-200",
    label: "Menunggu",
  },
  diterima: {
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    border: "border-emerald-200",
    label: "Diterima",
  },
  ditolak: {
    bg: "bg-red-50",
    text: "text-red-800",
    border: "border-red-200",
    label: "Ditolak",
  },
  imported: {
    bg: "bg-blue-50",
    text: "text-blue-800",
    border: "border-blue-200",
    label: "Imported",
  },
};

function AdminDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get("tab") || "pendaftar";
  const initialTab: DashboardTab = ["pendaftar", "kustomisasi", "gelombang", "galeri", "program"].includes(
    rawTab
  )
    ? (rawTab as DashboardTab)
    : "pendaftar";

  const [activeTab, setActiveTab] = useState<DashboardTab>(initialTab);
  const [token, setToken] = useState<string | null>(null);
  const [adminNama, setAdminNama] = useState("Admin");

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
  const [pendaftarError, setPendaftarError] = useState("");

  // Kustomisasi Web State
  const [config, setConfig] = useState<Record<string, string>>({});
  const [savingConfig, setSavingConfig] = useState(false);
  const [configMsg, setConfigMsg] = useState("");

  // Gelombang, Galeri, Program State
  const [gelombangList, setGelombangList] = useState<GelombangItem[]>([]);
  const [galeriList, setGaleriList] = useState<GaleriItem[]>([]);
  const [programList, setProgramList] = useState<ProgramItem[]>([]);
  const [loadingProgram, setLoadingProgram] = useState(false);

  // Sync auth safely on client mount (prevents SSR hydration mismatch)
  useEffect(() => {
    const t = localStorage.getItem("psb_admin_token");
    if (!t) {
      router.push("/admin/login");
      return;
    }
    setToken(t);
    setAdminNama(localStorage.getItem("psb_admin_nama") || "Admin");
  }, [router]);

  const fetchPendaftar = useCallback(async () => {
    if (!token) return;
    setLoadingPendaftar(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus !== "semua") params.set("status", filterStatus);
      const res = await fetch(`/api/admin/pendaftar?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await res.json();
      if (d.ok) setPendaftarList(d.data || []);
    } catch (e) {
      console.error("Gagal load pendaftar:", e);
    } finally {
      setLoadingPendaftar(false);
    }
  }, [token, filterStatus]);

  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch("/api/config");
      const d = await res.json();
      if (d.ok) setConfig(d.data || {});
    } catch (e) {
      console.error("Gagal load config:", e);
    }
  }, []);

  const fetchGelombang = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/gelombang?all=1", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await res.json();
      if (d.ok) setGelombangList(d.data || []);
    } catch (e) {
      console.error("Gagal load gelombang:", e);
    }
  }, [token]);

  const fetchGaleri = useCallback(async () => {
    try {
      const res = await fetch("/api/galeri");
      const d = await res.json();
      if (d.ok) setGaleriList(d.data || []);
    } catch (e) {
      console.error("Gagal load galeri:", e);
    }
  }, []);

  const fetchPrograms = useCallback(async () => {
    setLoadingProgram(true);
    try {
      const res = await fetch("/api/program");
      const d = await res.json();
      if (d.ok) setProgramList(d.data || []);
    } finally {
      setLoadingProgram(false);
    }
  }, []);

  useEffect(() => {
    if (!token) return;
    fetchPendaftar();
    fetchConfig();
    fetchGelombang();
    fetchGaleri();
    fetchPrograms();
  }, [token, fetchPendaftar, fetchConfig, fetchGelombang, fetchGaleri, fetchPrograms]);

  const logout = () => {
    localStorage.removeItem("psb_admin_token");
    localStorage.removeItem("psb_admin_nama");
    router.push("/admin/login");
  };

  const deletePendaftar = async (id: number, nama: string) => {
    if (!token || !confirm(`Hapus permanen data pendaftar "${nama}"?`)) return;
    setPendaftarError("");
    try {
      const res = await fetch(`/api/admin/pendaftar?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await res.json();
      if (d.ok) {
        setPendaftarList((prev) => prev.filter((p) => p.id !== id));
        if (selectedPendaftar?.id === id) setSelectedPendaftar(null);
      } else {
        setPendaftarError(d.error || "Gagal menghapus data pendaftar.");
      }
    } catch {
      setPendaftarError("Terjadi kesalahan jaringan saat menghapus data.");
    }
  };

  const updateStatus = async (id: number, status: string) => {
    if (!token) return;
    setUpdatingStatus(true);
    try {
      await fetch("/api/admin/pendaftar", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id, status, catatan_admin: catatanVerifikasi }),
      });
      await fetchPendaftar();
      setSelectedPendaftar(null);
    } finally {
      setUpdatingStatus(false);
    }
  };

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
        body: JSON.stringify(config),
      });
      const d = await res.json();
      if (d.ok) {
        setConfigMsg("Pengaturan tampilan web berhasil disimpan dan langsung aktif di landing page.");
      } else {
        setConfigMsg("Gagal menyimpan: " + (d.error || "Terjadi kesalahan."));
      }
    } catch (err: unknown) {
      setConfigMsg("Error: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSavingConfig(false);
    }
  };

  const filteredPendaftar = pendaftarList.filter((d) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      (d.nama_lengkap && d.nama_lengkap.toLowerCase().includes(q)) ||
      (d.nomor_registrasi && d.nomor_registrasi.toLowerCase().includes(q)) ||
      (d.asal_sekolah && d.asal_sekolah.toLowerCase().includes(q)) ||
      (d.no_hp_wali && d.no_hp_wali.includes(searchQuery));
    if (!matchSearch) return false;

    const { isLksa, jenjang } = getJalurAndJenjang(d);
    if (filterJenjang !== "semua" && jenjang.toUpperCase() !== filterJenjang.toUpperCase()) {
      return false;
    }
    if (filterJalur !== "semua" && (isLksa ? "lksa" : "reguler") !== filterJalur.toLowerCase()) {
      return false;
    }
    return true;
  });

  const exportCSV = () => {
    const headers = [
      "No Registrasi",
      "Nama Lengkap",
      "JK",
      "Jalur Pendaftaran",
      "Jenjang Tujuan",
      "Penghasilan Ortu",
      "No HP Wali",
      "Asal Sekolah",
      "Peminatan",
      "Status",
      "Tanggal Daftar",
    ];
    const rows = filteredPendaftar.map((d) => {
      const { isLksa, jenjang, gaji } = getJalurAndJenjang(d);
      return [
        d.nomor_registrasi || `PSB-${d.id}`,
        d.nama_lengkap,
        d.jenis_kelamin === "P" ? "Perempuan" : "Laki-laki",
        isLksa ? "LKSA (Gratis)" : "Reguler (MBS)",
        jenjang,
        gaji,
        d.no_hp_wali,
        d.asal_sekolah,
        d.jurusan || "-",
        d.status,
        new Date(d.created_at).toLocaleDateString("id-ID"),
      ];
    });
    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${c || ""}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pendaftar_psb_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const stats = {
    total: pendaftarList.length,
    menunggu: pendaftarList.filter((d) => d.status === "menunggu").length,
    diterima: pendaftarList.filter((d) => d.status === "diterima").length,
    ditolak: pendaftarList.filter((d) => d.status === "ditolak").length,
  };

  const primaryColor = config.warna_primer || "#0f4c1e";

  const handleSelectTab = (tab: DashboardTab, btn: HTMLButtonElement) => {
    setActiveTab(tab);
    btn.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
  };

  const selectedMeta = selectedPendaftar ? getJalurAndJenjang(selectedPendaftar) : null;

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* ─── Top Admin Bar (Tanpa overflow mobile & tanpa duplikasi link) ─── */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-40 px-4 sm:px-6 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-bold text-xs sm:text-sm text-white shadow-xs shrink-0"
              style={{ background: `linear-gradient(135deg, ${primaryColor}, #1a6b2b)` }}
            >
              PSB
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 min-w-0">
                <h1
                  className="font-bold text-sm sm:text-base leading-tight truncate"
                  style={{ color: primaryColor }}
                >
                  {config.nama_singkat || config.nama_pesantren || "Panel Admin PSB"}
                </h1>
                <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 shrink-0">
                  ONLINE
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-stone-500 truncate">
                Pusat Kendali Pendaftaran &amp; CMS Website
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/"
              target="_blank"
              aria-label="Lihat Website Publik di tab baru"
              className="inline-flex items-center gap-1.5 min-h-9 px-3 py-1.5 rounded-xl text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors"
            >
              <ExternalLink size={14} aria-hidden="true" />
              <span className="hidden sm:inline">Lihat Web</span>
            </Link>

            <div className="hidden md:block text-right px-2 border-l border-stone-200">
              <span className="block text-xs font-semibold text-stone-800">{adminNama}</span>
              <span className="block text-[11px] text-stone-500">Panitia PSB</span>
            </div>

            <button
              type="button"
              onClick={logout}
              aria-label="Keluar dari Panel Admin"
              className="inline-flex items-center gap-1.5 min-h-9 px-3 py-1.5 rounded-xl text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
            >
              <LogOut size={14} aria-hidden="true" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* ─── Unified Admin Tab Navigation ─── */}
      <nav
        aria-label="Navigasi Modul Admin"
        className="bg-white border-b border-stone-200 shadow-xs"
      >
        <div
          role="tablist"
          aria-label="Bagian Dashboard Admin"
          className="max-w-7xl mx-auto px-3 sm:px-6 flex items-center gap-1 overflow-x-auto"
        >
          {[
            { id: "pendaftar" as DashboardTab, label: "Data Pendaftar", icon: Users, badge: stats.total },
            { id: "kustomisasi" as DashboardTab, label: "Kustomisasi Web", icon: Palette },
            { id: "gelombang" as DashboardTab, label: "Gelombang PSB", icon: Calendar },
            { id: "galeri" as DashboardTab, label: "Galeri Foto", icon: ImageIcon },
            { id: "program" as DashboardTab, label: "Program Unggulan", icon: BookOpen },
          ].map(({ id, label, icon: Icon, badge }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={(e) => handleSelectTab(id, e.currentTarget)}
                className={`relative flex items-center gap-2 py-3.5 px-3.5 font-semibold text-xs sm:text-sm whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  active
                    ? "text-emerald-900 bg-emerald-50/60"
                    : "text-stone-600 hover:text-stone-900 hover:bg-stone-50"
                }`}
              >
                <Icon size={16} aria-hidden="true" />
                <span>{label}</span>
                {badge !== undefined && badge > 0 && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold tabular-nums">
                    {badge}
                  </span>
                )}
                {active && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-[3px]"
                    style={{ backgroundColor: primaryColor }}
                  />
                )}
              </button>
            );
          })}

          <Link
            href="/admin/pengajar"
            className="flex items-center gap-2 py-3.5 px-3.5 font-semibold text-xs sm:text-sm whitespace-nowrap shrink-0 text-stone-600 hover:text-emerald-800 hover:bg-emerald-50/50 transition-colors"
          >
            <Award size={16} aria-hidden="true" />
            <span>Pengajar &amp; Pimpinan</span>
          </Link>
        </div>
      </nav>

      {/* ─── Main Content ─── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full flex-1">
        {/* TAB 1: DATA PENDAFTAR */}
        {activeTab === "pendaftar" && (
          <div className="space-y-5">
            {pendaftarError && (
              <div
                role="alert"
                className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center justify-between"
              >
                <span>{pendaftarError}</span>
                <button
                  type="button"
                  onClick={() => setPendaftarError("")}
                  aria-label="Tutup pesan error"
                  className="cursor-pointer"
                >
                  <X size={15} aria-hidden="true" />
                </button>
              </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {[
                { label: "Total Pendaftar", value: stats.total, icon: Users, color: primaryColor, bg: "#dcfce7" },
                { label: "Menunggu Verifikasi", value: stats.menunggu, icon: Clock, color: "#a16207", bg: "#fef9c3" },
                { label: "Lulus / Diterima", value: stats.diterima, icon: CheckCircle, color: "#15803d", bg: "#bbf7d0" },
                { label: "Tidak Diterima", value: stats.ditolak, icon: XCircle, color: "#b91c1c", bg: "#fee2e2" },
              ].map(({ label, value, icon: Icon, color, bg }) => (
                <div
                  key={label}
                  className="bg-white rounded-2xl p-4 shadow-xs border border-stone-200 flex items-center gap-3"
                >
                  <div
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: bg }}
                  >
                    <Icon size={20} style={{ color }} aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xl sm:text-2xl font-black leading-tight tabular-nums" style={{ color }}>
                      {value}
                    </p>
                    <p className="text-[11px] sm:text-xs text-stone-600 font-medium truncate">{label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Filter & Search Bar */}
            <search className="bg-white rounded-2xl shadow-xs border border-stone-200 p-4 flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
              <div className="relative flex-1">
                <label htmlFor="cari-pendaftar" className="sr-only">
                  Cari nama santri, nomor registrasi, atau asal sekolah
                </label>
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  id="cari-pendaftar"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama santri, no registrasi, asal sekolah..."
                  className="w-full min-h-10 border border-stone-300 rounded-xl pl-10 pr-4 py-2 text-sm text-stone-900 placeholder:text-stone-400 bg-stone-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <select
                  aria-label="Filter Jalur Pendaftaran"
                  value={filterJalur}
                  onChange={(e) => setFilterJalur(e.target.value)}
                  className="min-h-10 border border-stone-300 rounded-xl px-3 py-1.5 text-xs font-semibold bg-white text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="semua">Semua Jalur</option>
                  <option value="reguler">Reguler (MBS)</option>
                  <option value="lksa">Santri LKSA (Gratis)</option>
                </select>

                <select
                  aria-label="Filter Jenjang Tujuan"
                  value={filterJenjang}
                  onChange={(e) => setFilterJenjang(e.target.value)}
                  className="min-h-10 border border-stone-300 rounded-xl px-3 py-1.5 text-xs font-semibold bg-white text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="semua">Semua Jenjang</option>
                  <option value="SMP">SMP</option>
                  <option value="SMA">SMA</option>
                  <option value="SMK">SMK</option>
                </select>

                <div className="flex bg-stone-100 p-1 rounded-xl overflow-x-auto">
                  {["semua", "menunggu", "diterima", "ditolak"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setFilterStatus(s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize whitespace-nowrap cursor-pointer transition-colors ${
                        filterStatus === s
                          ? "bg-white text-stone-900 shadow-xs"
                          : "text-stone-600 hover:text-stone-900"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={exportCSV}
                  className="inline-flex items-center gap-2 min-h-10 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs hover:opacity-95 cursor-pointer"
                  style={{ background: primaryColor }}
                >
                  <Download size={15} aria-hidden="true" />
                  <span>Export CSV</span>
                </button>
              </div>
            </search>

            {/* List / Table Container */}
            <div className="bg-white rounded-2xl shadow-xs border border-stone-200 overflow-hidden">
              {loadingPendaftar ? (
                <div className="p-16 text-center text-stone-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-800 mx-auto mb-3" />
                  <span className="text-sm">Memuat data pendaftar...</span>
                </div>
              ) : filteredPendaftar.length === 0 ? (
                <div className="p-16 text-center text-stone-500">
                  <Users size={38} className="mx-auto text-stone-300 mb-2" aria-hidden="true" />
                  <p className="font-semibold text-stone-700">Tidak ada data pendaftar ditemukan.</p>
                  <p className="text-xs text-stone-500 mt-1">
                    Ubah filter pencarian atau tunggu calon santri mendaftar via website.
                  </p>
                </div>
              ) : (
                <>
                  {/* Mobile Card List (< md) — tanpa horizontal clipping */}
                  <div className="md:hidden divide-y divide-stone-100">
                    {filteredPendaftar.map((p) => {
                      const badge = STATUS_BADGE_MAP[p.status] || {
                        bg: "bg-stone-100",
                        text: "text-stone-700",
                        border: "border-stone-200",
                        label: p.status,
                      };
                      const { isLksa, jenjang } = getJalurAndJenjang(p);
                      return (
                        <div key={p.id} className="p-4 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="font-mono text-[11px] font-bold text-stone-500">
                                {p.nomor_registrasi || `PSB-${p.id}`}
                              </p>
                              <h3 className="font-bold text-sm text-stone-900">{p.nama_lengkap}</h3>
                              <p className="text-xs text-stone-500 mt-0.5">
                                {p.jenis_kelamin === "P" ? "Perempuan" : "Laki-laki"} ·{" "}
                                {p.asal_sekolah || "-"}
                              </p>
                            </div>
                            <span
                              className={`shrink-0 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badge.bg} ${badge.text} ${badge.border}`}
                            >
                              {badge.label}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                            <span
                              className={`px-2 py-0.5 rounded font-bold border ${
                                isLksa
                                  ? "bg-amber-100 text-amber-900 border-amber-300"
                                  : "bg-emerald-50 text-emerald-800 border-emerald-200"
                              }`}
                            >
                              {isLksa ? "LKSA (Gratis)" : "Reguler (MBS)"}
                            </span>
                            <span className="px-2 py-0.5 rounded font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              Tujuan: {jenjang}
                            </span>
                            <span className="text-stone-600 ml-auto font-mono">
                              WA: {p.no_hp_wali || "-"}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedPendaftar(p);
                                setCatatanVerifikasi(p.catatan_admin || "");
                              }}
                              className="flex-1 min-h-10 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white cursor-pointer"
                              style={{ background: primaryColor }}
                            >
                              <Eye size={14} aria-hidden="true" />
                              <span>Verifikasi Berkas</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => deletePendaftar(p.id, p.nama_lengkap)}
                              aria-label={`Hapus data ${p.nama_lengkap}`}
                              className="min-h-10 min-w-10 inline-flex items-center justify-center rounded-xl text-red-600 bg-red-50 hover:bg-red-100 cursor-pointer"
                            >
                              <Trash2 size={16} aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Desktop Data Table (>= md) */}
                  <div
                    tabIndex={0}
                    role="region"
                    aria-label="Tabel Data Calon Santri Pendaftar"
                    className="hidden md:block overflow-x-auto"
                  >
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="bg-stone-50 border-b border-stone-200 text-xs text-stone-600 font-bold uppercase tracking-wider">
                          <th scope="col" className="px-5 py-3.5">No. Registrasi</th>
                          <th scope="col" className="px-5 py-3.5">Nama Calon Santri</th>
                          <th scope="col" className="px-5 py-3.5">Jalur &amp; Jenjang</th>
                          <th scope="col" className="px-5 py-3.5">Pendidikan Asal</th>
                          <th scope="col" className="px-5 py-3.5">Wali &amp; WhatsApp</th>
                          <th scope="col" className="px-5 py-3.5 text-center">Status</th>
                          <th scope="col" className="px-5 py-3.5 text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {filteredPendaftar.map((p) => {
                          const badge = STATUS_BADGE_MAP[p.status] || {
                            bg: "bg-stone-100",
                            text: "text-stone-700",
                            border: "border-stone-200",
                            label: p.status,
                          };
                          const { isLksa, jenjang } = getJalurAndJenjang(p);

                          return (
                            <tr key={p.id} className="hover:bg-stone-50/70 transition-colors">
                              <td className="px-5 py-3.5 font-mono text-xs font-bold text-stone-700 whitespace-nowrap">
                                {p.nomor_registrasi || `PSB-${p.id}`}
                              </td>
                              <th scope="row" className="px-5 py-3.5 font-normal">
                                <span className="font-bold text-stone-900 block">{p.nama_lengkap}</span>
                                <span className="text-xs text-stone-500">
                                  {p.jenis_kelamin === "P" ? "Perempuan" : "Laki-laki"}
                                  {p.tempat_lahir ? ` · ${p.tempat_lahir}` : ""}
                                  {p.tanggal_lahir ? ` · ${formatDateIndo(p.tanggal_lahir)}` : ""}
                                </span>
                              </th>
                              <td className="px-5 py-3.5">
                                <div className="flex flex-col gap-1 items-start">
                                  <span
                                    className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border ${
                                      isLksa
                                        ? "bg-amber-100 text-amber-900 border-amber-300"
                                        : "bg-emerald-50 text-emerald-800 border-emerald-200"
                                    }`}
                                  >
                                    {isLksa ? "LKSA (Gratis)" : "Reguler (MBS)"}
                                  </span>
                                  <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                    Tujuan: {jenjang}
                                  </span>
                                </div>
                              </td>
                              <td className="px-5 py-3.5">
                                <span className="block text-stone-800 font-medium">{p.asal_sekolah || "-"}</span>
                                <span className="text-xs text-stone-500">{p.jurusan || "Umum"}</span>
                              </td>
                              <td className="px-5 py-3.5">
                                <span className="block font-medium text-stone-800">
                                  {p.nama_ayah || p.nama_ibu || "-"}
                                </span>
                                <span className="text-xs text-stone-500 font-mono tabular-nums">
                                  {p.no_hp_wali || "-"}
                                </span>
                              </td>
                              <td className="px-5 py-3.5 text-center">
                                <span
                                  className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold border ${badge.bg} ${badge.text} ${badge.border}`}
                                >
                                  {badge.label}
                                </span>
                              </td>
                              <td className="px-5 py-3.5 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedPendaftar(p);
                                      setCatatanVerifikasi(p.catatan_admin || "");
                                    }}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-xs hover:opacity-95 cursor-pointer"
                                    style={{ background: primaryColor }}
                                  >
                                    <Eye size={13} aria-hidden="true" />
                                    <span>Verifikasi</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => deletePendaftar(p.id, p.nama_lengkap)}
                                    aria-label={`Hapus data ${p.nama_lengkap}`}
                                    className="p-2 rounded-xl text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                  >
                                    <Trash2 size={15} aria-hidden="true" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: KUSTOMISASI TAMPILAN WEB */}
        {activeTab === "kustomisasi" && (
          <KustomisasiTab
            config={config}
            onChange={handleConfigChange}
            onSave={saveConfig}
            saving={savingConfig}
            msg={configMsg}
            onClearMsg={() => setConfigMsg("")}
          />
        )}

        {/* TAB 3: GELOMBANG PSB */}
        {activeTab === "gelombang" && (
          <GelombangTab
            token={token}
            primaryColor={primaryColor}
            items={gelombangList}
            onRefresh={fetchGelombang}
          />
        )}

        {/* TAB 4: GALERI FOTO */}
        {activeTab === "galeri" && (
          <GaleriTab
            token={token}
            primaryColor={primaryColor}
            items={galeriList}
            onRefresh={fetchGaleri}
          />
        )}

        {/* TAB 5: PROGRAM UNGGULAN */}
        {activeTab === "program" && (
          <ProgramTab
            token={token}
            primaryColor={primaryColor}
            items={programList}
            loading={loadingProgram}
            onSetItems={setProgramList}
          />
        )}
      </main>

      {/* ─── Modal Verifikasi Berkas Pendaftar (Native <dialog> Top Layer + Sticky Footer) ─── */}
      <ModalDialog
        open={Boolean(selectedPendaftar)}
        onClose={() => setSelectedPendaftar(null)}
        labelledBy="modal-verifikasi-title"
        className="w-full max-w-xl"
      >
        {selectedPendaftar && selectedMeta && (
          <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 flex flex-col max-h-[90dvh] overflow-hidden">
            {/* Modal Sticky Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 shrink-0">
              <h2 id="modal-verifikasi-title" className="font-bold text-base text-stone-900">
                Verifikasi Berkas Calon Santri
              </h2>
              <button
                type="button"
                onClick={() => setSelectedPendaftar(null)}
                aria-label="Tutup modal verifikasi"
                className="w-9 h-9 rounded-xl flex items-center justify-center text-stone-500 hover:text-stone-900 hover:bg-stone-100 cursor-pointer"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200/80 space-y-1.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="font-mono text-xs font-bold text-emerald-900">
                    {selectedPendaftar.nomor_registrasi || `PSB-${selectedPendaftar.id}`}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                        selectedMeta.isLksa
                          ? "bg-amber-100 text-amber-900 border-amber-300"
                          : "bg-emerald-50 text-emerald-800 border-emerald-200"
                      }`}
                    >
                      {selectedMeta.isLksa ? "Jalur LKSA (Gratis)" : "Jalur Reguler (MBS)"}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      Tujuan: {selectedMeta.jenjang}
                    </span>
                  </div>
                </div>

                <div className="text-sm font-bold text-stone-900 pt-1">
                  {selectedPendaftar.nama_lengkap}
                </div>
                <div>
                  <strong>Jenis Kelamin:</strong>{" "}
                  {selectedPendaftar.jenis_kelamin === "P" ? "Perempuan" : "Laki-laki"}
                </div>
                <div>
                  <strong>TTL:</strong> {selectedPendaftar.tempat_lahir || "-"},{" "}
                  {formatDateIndo(selectedPendaftar.tanggal_lahir)}
                </div>
                <div>
                  <strong>Asal Sekolah:</strong> {selectedPendaftar.asal_sekolah || "-"}
                </div>
                <div>
                  <strong>Peminatan/Jurusan:</strong> {selectedPendaftar.jurusan || "Umum"}
                </div>
                <div>
                  <strong>Orang Tua / Wali:</strong>{" "}
                  {selectedPendaftar.nama_ayah || selectedPendaftar.nama_ibu || "-"}
                </div>
                <div>
                  <strong>Penghasilan Ortu:</strong>{" "}
                  <span className="font-semibold text-emerald-800">
                    {formatGajiRp(selectedMeta.gaji)}
                  </span>
                </div>
                <div>
                  <strong>WhatsApp:</strong> {selectedPendaftar.no_hp_wali || "-"}
                </div>
                <div>
                  <strong>Alamat:</strong> {selectedPendaftar.alamat || "-"}
                </div>
              </div>

              <div className="border border-stone-200 rounded-xl p-3.5 bg-white space-y-2.5">
                <h3 className="font-bold text-stone-800 text-xs">Berkas Dokumen yang Diunggah</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { label: "Pas Foto (3x4)", url: selectedPendaftar.foto_url, highlight: false },
                    { label: "Kartu Keluarga", url: selectedPendaftar.kk_url, highlight: false },
                    {
                      label: "Akta Kelahiran",
                      url: selectedPendaftar.akta_url || selectedPendaftar.ijazah_url,
                      highlight: false,
                    },
                    {
                      label: "SKTM (LKSA)",
                      url: selectedPendaftar.sktm_url,
                      highlight: selectedMeta.isLksa,
                    },
                  ].map((doc) => (
                    <div
                      key={doc.label}
                      className={`p-2.5 rounded-lg border text-xs flex items-center justify-between gap-2 ${
                        doc.highlight
                          ? "bg-amber-50/70 border-amber-300"
                          : "bg-stone-50 border-stone-200"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <FileText size={14} className="text-stone-500 shrink-0" aria-hidden="true" />
                        <span className="truncate font-medium text-stone-800">{doc.label}</span>
                      </div>
                      {doc.url ? (
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-0.5 text-blue-700 hover:underline font-bold shrink-0"
                        >
                          <span>Lihat</span>
                          <ArrowUpRight size={12} aria-hidden="true" />
                        </a>
                      ) : (
                        <span className="text-stone-400 shrink-0">Kosong</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="catatan-verifikasi" className="block font-bold text-stone-700 mb-1.5">
                  Catatan Verifikasi Panitia
                </label>
                <textarea
                  id="catatan-verifikasi"
                  rows={2}
                  value={catatanVerifikasi}
                  onChange={(e) => setCatatanVerifikasi(e.target.value)}
                  placeholder="Catatan hasil seleksi berkas, jadwal wawancara..."
                  className="w-full border border-stone-300 rounded-xl p-3 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            {/* Modal Sticky Footer */}
            <div className="px-5 py-3.5 border-t border-stone-200 bg-stone-50 flex flex-wrap items-center justify-between gap-2 shrink-0">
              <button
                type="button"
                onClick={() => deletePendaftar(selectedPendaftar.id, selectedPendaftar.nama_lengkap)}
                className="min-h-9 px-3 py-1.5 rounded-xl text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 size={14} aria-hidden="true" />
                <span>Hapus</span>
              </button>

              <div className="flex flex-wrap items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => setSelectedPendaftar(null)}
                  className="min-h-9 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-stone-700 bg-white border border-stone-300 hover:bg-stone-100 cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  disabled={updatingStatus}
                  onClick={() => updateStatus(selectedPendaftar.id, "ditolak")}
                  className="min-h-9 px-3.5 py-1.5 rounded-xl text-xs font-bold text-red-700 bg-red-100 hover:bg-red-200 disabled:opacity-60 cursor-pointer"
                >
                  Tolak
                </button>
                <button
                  type="button"
                  disabled={updatingStatus}
                  onClick={() => updateStatus(selectedPendaftar.id, "diterima")}
                  className="min-h-9 px-4 py-1.5 rounded-xl text-xs font-bold text-white shadow-xs hover:opacity-95 disabled:opacity-60 cursor-pointer"
                  style={{ background: "#15803d" }}
                >
                  Terima Santri
                </button>
              </div>
            </div>
          </div>
        )}
      </ModalDialog>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-stone-50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-800" />
        </div>
      }
    >
      <AdminDashboardContent />
    </Suspense>
  );
}
