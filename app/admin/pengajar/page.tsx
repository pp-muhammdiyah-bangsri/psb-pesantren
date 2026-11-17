"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Plus, Trash2, Save, User, Edit2, Award, ToggleLeft, ToggleRight, X, Upload, Sparkles, Crop, Search, ImageOff
} from "lucide-react";
import Link from "next/link";
import { formatNamaGelar } from "@/components/PengajarSection";
import PhotoCropModal from "@/components/PhotoCropModal";

interface Pengajar {
  id?: number;
  nama: string;
  jabatan: string;
  gelar?: string;
  gelar_depan?: string;
  gelar_belakang?: string;
  bidang_studi: string;
  keterangan: string;
  foto_url: string;
  is_pimpinan: boolean;
  is_aktif: boolean;
  urutan: number;
}

const INITIAL_FORM: Pengajar = {
  nama: "",
  jabatan: "",
  gelar: "",
  gelar_depan: "",
  gelar_belakang: "",
  bidang_studi: "",
  keterangan: "",
  foto_url: "",
  is_pimpinan: false,
  is_aktif: true,
  urutan: 1,
};

export default function AdminPengajar() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);

  const [list, setList] = useState<Pengajar[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Pengajar>(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [filterKategori, setFilterKategori] = useState<"semua" | "pimpinan" | "pengajar">("semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [previewErr, setPreviewErr] = useState(false);

  // State untuk Crop Modal Ala Media Sosial
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string>("");
  const [quickCropTeacher, setQuickCropTeacher] = useState<Pengajar | null>(null);

  useEffect(() => {
    const t = localStorage.getItem("psb_admin_token");
    if (!t) {
      router.push("/admin/login");
      return;
    }
    setToken(t);
    fetchData(t);
  }, [router]);

  const fetchData = async (authToken?: string) => {
    const t = authToken || token;
    if (!t) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/pengajar", { headers: { Authorization: `Bearer ${t}` } });
      const d = await res.json();
      if (d.ok) setList(d.data || []);
    } finally { setLoading(false); }
  };

  const setF = (key: string, val: string | boolean | number) => setForm(prev => ({ ...prev, [key]: val }));

  // Handler memilih file untuk diedit di Crop Modal
  const handleFileSelectForCrop = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setQuickCropTeacher(null);
        setCropImageSrc(reader.result);
        setCropModalOpen(true);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Buka editor crop untuk foto yang sudah ada di form
  const handleOpenCropForCurrent = () => {
    if (!form.foto_url) return;
    setQuickCropTeacher(null);
    setCropImageSrc(form.foto_url);
    setCropModalOpen(true);
  };

  // Quick crop langsung dari daftar pengajar
  const handleQuickCropFromList = (p: Pengajar) => {
    if (!p.foto_url) return;
    setQuickCropTeacher(p);
    setCropImageSrc(p.foto_url);
    setCropModalOpen(true);
  };

  // Handler saat crop berhasil disimpan dan diunggah
  const handleCropSaved = async (newUrl: string) => {
    if (quickCropTeacher && quickCropTeacher.id) {
      try {
        const res = await fetch("/api/admin/pengajar", {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ id: quickCropTeacher.id, foto_url: newUrl }),
        });
        const d = await res.json();
        if (d.ok) {
          setMsg(`Foto untuk ${quickCropTeacher.nama} berhasil diperbarui!`);
          fetchData();
        } else {
          setMsg(d.error || "Gagal memperbarui foto pengajar.");
        }
      } catch (err) {
        setMsg(err instanceof Error ? err.message : "Gagal memperbarui foto.");
      } finally {
        setQuickCropTeacher(null);
      }
    } else {
      setF("foto_url", newUrl);
      setMsg("Foto profil berhasil disesuaikan dan diunggah!");
    }
    setCropModalOpen(false);
  };

  // Ganti file gambar di dalam modal crop
  const handleChangeImageInModal = (newFile: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setCropImageSrc(reader.result);
      }
    };
    reader.readAsDataURL(newFile);
  };

  const save = async () => {
    if (!form.nama || !form.jabatan) { setMsg("Nama dan Jabatan wajib diisi."); return; }
    setSaving(true); setMsg("");
    try {
      const method = editId ? "PUT" : "POST";
      const payload = {
        ...form,
        // Pastikan kompatibel dengan field `gelar` lama
        gelar: form.gelar_belakang || form.gelar || form.gelar_depan || "",
        id: editId || undefined,
      };
      const res = await fetch("/api/admin/pengajar", {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const d = await res.json();
      if (!d.ok) throw new Error(d.error);
      setMsg(editId ? "Data berhasil diperbarui!" : "Pengajar berhasil ditambahkan!");
      setShowForm(false); setEditId(null); setForm(INITIAL_FORM);
      fetchData();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Gagal menyimpan.");
    } finally { setSaving(false); }
  };

  const toggleAktif = async (p: Pengajar) => {
    await fetch("/api/admin/pengajar", {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id: p.id, is_aktif: !p.is_aktif }),
    });
    fetchData();
  };

  const hapus = async (id: number) => {
    if (!confirm("Hapus data pengajar ini?")) return;
    await fetch(`/api/admin/pengajar?id=${id}`, {
      method: "DELETE", headers: { Authorization: `Bearer ${token}` }
    });
    fetchData();
  };

  const startEdit = (p: Pengajar) => {
    let gDepan = p.gelar_depan || "";
    let gBelakang = p.gelar_belakang || "";
    // Pisahkan otomatis jika data lama hanya terisi di `gelar`
    if (!gDepan && !gBelakang && p.gelar) {
      const g = p.gelar.trim();
      const isPrefix = /^(kh|k\.h\.|kyai|dr|dr\.|drs|drs\.|dra|dra\.|prof|prof\.|ir|ir\.|ust|ust\.|ustadz|usth|usth\.|habib|gus|ning|tgk|buya)\b/i.test(g);
      if (isPrefix) gDepan = g;
      else gBelakang = g;
    }
    setForm({
      ...p,
      gelar_depan: gDepan,
      gelar_belakang: gBelakang,
    });
    setEditId(p.id || null);
    setShowForm(true);
    setMsg("");
  };

  const primary = "#0f4c1e";
  const accent = "#c8a84b";

  const filteredList = list.filter((p) => {
    if (filterKategori === "pimpinan" && !p.is_pimpinan) return false;
    if (filterKategori === "pengajar" && p.is_pimpinan) return false;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      formatNamaGelar(p).toLowerCase().includes(q) ||
      (p.jabatan && p.jabatan.toLowerCase().includes(q)) ||
      (p.bidang_studi && p.bidang_studi.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-200 sticky top-0 z-30 px-4 sm:px-6 py-3.5 shadow-xs">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Link
              href="/admin/dashboard"
              aria-label="Kembali ke Dashboard Admin"
              className="w-10 h-10 rounded-xl border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-100 hover:text-stone-900 shrink-0 transition-colors"
            >
              <ArrowLeft size={18} aria-hidden="true" />
            </Link>
            <div className="min-w-0">
              <h1 className="font-bold text-base sm:text-lg truncate" style={{ color: primary }}>
                Dewan Pengajar &amp; Pimpinan
              </h1>
              <p className="text-[11px] sm:text-xs text-stone-500 truncate">
                {list.length} profil terdaftar · Kelola tampilan kartu website
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setShowForm(true);
              setEditId(null);
              setPreviewErr(false);
              setForm({ ...INITIAL_FORM, urutan: list.length + 1 });
              setMsg("");
            }}
            className="inline-flex items-center gap-1.5 min-h-10 px-3.5 sm:px-4 py-2 rounded-xl text-white text-xs sm:text-sm font-bold shadow-xs hover:opacity-95 shrink-0 cursor-pointer"
            style={{ background: `linear-gradient(135deg, ${primary}, #1a6b2b)` }}
          >
            <Plus size={16} aria-hidden="true" />
            <span>Tambah</span>
            <span className="hidden sm:inline">Pengajar</span>
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 sm:py-8">
        {msg && (
          <div
            role="status"
            className={`text-sm font-medium rounded-xl px-4 py-3 mb-4 flex items-center justify-between border ${
              msg.includes("berhasil")
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-red-50 text-red-700 border-red-200"
            }`}
          >
            <span>{msg}</span>
            <button type="button" onClick={() => setMsg("")} aria-label="Tutup pesan" className="cursor-pointer">
              <X size={15} aria-hidden="true" />
            </button>
          </div>
        )}

        {/* Filter & Pencarian Pengajar */}
        {!showForm && list.length > 0 && (
          <search className="bg-white rounded-2xl border border-stone-200 p-3.5 mb-5 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between shadow-xs">
            <div className="relative flex-1">
              <label htmlFor="cari-pengajar" className="sr-only">
                Cari nama, jabatan, atau bidang studi pengajar
              </label>
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" aria-hidden="true" />
              <input
                id="cari-pengajar"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama asatidz, jabatan, atau bidang..."
                className="w-full min-h-10 border border-stone-300 rounded-xl pl-9 pr-4 py-2 text-sm text-stone-900 bg-stone-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
            <div className="flex bg-stone-100 p-1 rounded-xl shrink-0">
              {[
                { id: "semua" as const, label: "Semua" },
                { id: "pimpinan" as const, label: "Pimpinan" },
                { id: "pengajar" as const, label: "Asatidz" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFilterKategori(item.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                    filterKategori === item.id
                      ? "bg-white text-stone-900 shadow-xs"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </search>
        )}

        {/* Form Modal / Box */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-xs border border-stone-200 p-5 sm:p-6 mb-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-base text-stone-900">
                {editId ? "Edit Data Pengajar" : "Tambah Pengajar Baru"}
              </h2>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                aria-label="Tutup form pengajar"
                className="w-9 h-9 rounded-xl flex items-center justify-center text-stone-500 hover:text-stone-900 hover:bg-stone-100 cursor-pointer"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Gelar Depan */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-700">
                  Gelar Depan <span className="text-[11px] font-normal text-gray-400">(Awalan)</span>
                </label>
                <input
                  type="text"
                  value={form.gelar_depan || ""}
                  onChange={e => setF("gelar_depan", e.target.value)}
                  placeholder="Contoh: KH. / Dr. / Ust."
                  className="border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  style={{ borderColor: "#e5e7eb" }}
                />
              </div>

              {/* Nama Lengkap */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-700">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.nama}
                  onChange={e => setF("nama", e.target.value)}
                  placeholder="Contoh: Ahmad Maulana"
                  className="border rounded-xl px-3 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-green-400"
                  style={{ borderColor: "#e5e7eb" }}
                />
              </div>

              {/* Gelar Belakang / Akademik */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-700">
                  Gelar Belakang <span className="text-[11px] font-normal text-gray-400">(Akademik)</span>
                </label>
                <input
                  type="text"
                  value={form.gelar_belakang || ""}
                  onChange={e => setF("gelar_belakang", e.target.value)}
                  placeholder="Contoh: S.Pt / S.Pd / M.Ag / Lc."
                  className="border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  style={{ borderColor: "#e5e7eb" }}
                />
              </div>

              {/* Live Preview Box Nama */}
              <div className="sm:col-span-3 p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                    Preview Nama Tampil di Website:
                  </span>
                  <span className="text-base font-extrabold text-emerald-950">
                    {formatNamaGelar(form) || "(Silakan isi nama)"}
                  </span>
                </div>
                {form.is_pimpinan && (
                  <span className="text-xs bg-amber-100 text-amber-800 border border-amber-300 font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Award size={12} /> Pimpinan Pondok
                  </span>
                )}
              </div>

              {/* Jabatan */}
              <div className="sm:col-span-1 flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-700">Jabatan / Posisi <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.jabatan}
                  onChange={e => setF("jabatan", e.target.value)}
                  placeholder="Mudir Pondok / Guru Tahfidz"
                  className="border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  style={{ borderColor: "#e5e7eb" }}
                />
              </div>

              {/* Bidang Studi */}
              <div className="sm:col-span-2 flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-700">Bidang Studi / Keahlian</label>
                <input
                  type="text"
                  value={form.bidang_studi}
                  onChange={e => setF("bidang_studi", e.target.value)}
                  placeholder="Tahfidz Al-Qur'an, Fiqih, Bahasa Arab"
                  className="border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  style={{ borderColor: "#e5e7eb" }}
                />
              </div>

              {/* Biografi */}
              <div className="sm:col-span-3 flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-700">Biografi / Riwayat Singkat</label>
                <textarea
                  rows={3}
                  value={form.keterangan}
                  onChange={e => setF("keterangan", e.target.value)}
                  placeholder="Alumnus Pondok Pesantren Gontor, menyelesaikan S2 di IAIN..."
                  className="border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 leading-relaxed"
                  style={{ borderColor: "#e5e7eb" }}
                />
              </div>

              {/* Foto Profil dengan Mekanisme Editor Crop Ala Media Sosial */}
              <div className="sm:col-span-3 bg-gradient-to-br from-emerald-50/70 via-gray-50 to-emerald-50/30 p-5 rounded-2xl border border-emerald-200 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <label className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                      <Sparkles size={14} className="text-emerald-600" />
                      Foto Profil Pengajar (Dilengkapi Editor Zoom, Geser & Crop)
                    </label>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Unggah foto langsung dari HP/Laptop dan sesuaikan bingkainya layaknya media sosial (Instagram/WhatsApp).
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                  <div>
                    <label className="text-[11px] font-bold text-emerald-900 block mb-1.5">
                      Opsi 1: Upload & Atur Foto (Rekomendasi)
                    </label>
                    <label className="flex flex-col items-center justify-center gap-1.5 px-4 py-3.5 rounded-2xl border-2 border-dashed border-emerald-300 bg-white/80 text-xs font-bold text-emerald-800 cursor-pointer hover:bg-emerald-50 hover:border-emerald-500 transition-all text-center group shadow-xs">
                      <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 group-hover:scale-110 transition-transform">
                        <Upload size={18} />
                      </div>
                      <span>Pilih Foto dari HP / Komputer</span>
                      <span className="text-[10px] font-normal text-gray-500">
                        Otomatis membuka editor: bisa zoom, geser, rotasi & crop
                      </span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleFileSelectForCrop} />
                    </label>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-gray-600 block mb-1.5">
                      Opsi 2: Atau Tempel URL Foto / Link Google Drive
                    </label>
                    <input
                      type="text"
                      value={form.foto_url || ""}
                      onChange={e => setF("foto_url", e.target.value)}
                      placeholder="https://... atau link Google Drive foto"
                      className="w-full border rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
                      style={{ borderColor: "#e5e7eb" }}
                    />
                    {form.foto_url && (
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          type="button"
                          onClick={handleOpenCropForCurrent}
                          className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-2.5 py-1 rounded-lg transition-colors"
                        >
                          <Crop size={12} /> Buka di Editor Crop
                        </button>
                        <button
                          type="button"
                          onClick={() => setF("foto_url", "")}
                          className="text-red-500 hover:text-red-700 text-[11px] font-semibold hover:underline"
                        >
                          ✕ Hapus Foto
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Pratinjau Foto Terpasang */}
                {form.foto_url && (
                  <div className="mt-4 pt-4 border-t border-emerald-200/80 flex items-center justify-between flex-wrap gap-3 bg-white p-3.5 rounded-xl border border-stone-200 shadow-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      {!previewErr ? (
                        <img
                          src={form.foto_url}
                          alt="Preview"
                          className="w-16 h-20 rounded-xl object-cover object-center border-2 border-emerald-500 shadow-sm shrink-0"
                          onError={() => setPreviewErr(true)}
                        />
                      ) : (
                        <div className="w-16 h-20 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-400 shrink-0">
                          <ImageOff size={20} aria-hidden="true" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <span className="font-bold text-xs text-emerald-900 block">
                          {previewErr ? "Foto tidak dapat dimuat" : "Foto Terpasang & Siap Tampil"}
                        </span>
                        <span className="text-[11px] text-stone-400 truncate block max-w-xs sm:max-w-md">
                          {form.foto_url}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleOpenCropForCurrent}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors shadow-xs shrink-0 cursor-pointer"
                    >
                      <Crop size={14} className="text-emerald-700" aria-hidden="true" />
                      <span>Atur Ulang / Crop</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Urutan */}
              <div className="flex flex-col gap-1">
                <label htmlFor="pengajar-urutan" className="text-xs font-bold text-stone-700">
                  Urutan Tampil
                </label>
                <input
                  id="pengajar-urutan"
                  type="number"
                  min={1}
                  max={999}
                  value={form.urutan}
                  onChange={e => setF("urutan", Math.max(1, Number(e.target.value) || 1))}
                  className="border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  style={{ borderColor: "#e5e7eb" }}
                />
              </div>

              {/* Checkboxes */}
              <div className="sm:col-span-3 flex flex-wrap items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-stone-700">
                  <input type="checkbox" checked={form.is_pimpinan} onChange={e => setF("is_pimpinan", e.target.checked)} className="w-4 h-4 accent-emerald-700 rounded" />
                  <Award size={15} style={{ color: accent }} aria-hidden="true" /> Tandai sebagai Pimpinan Pondok
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-stone-700">
                  <input type="checkbox" checked={form.is_aktif} onChange={e => setF("is_aktif", e.target.checked)} className="w-4 h-4 accent-emerald-700 rounded" />
                  Tampilkan di website
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-5 pt-4 border-t border-stone-100">
              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-bold shadow-xs hover:opacity-95 disabled:opacity-60 cursor-pointer"
                style={{ background: `linear-gradient(135deg, ${primary}, #1a6b2b)` }}
              >
                <Save size={15} aria-hidden="true" /> {saving ? "Menyimpan..." : (editId ? "Update Data" : "Simpan")}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2.5 rounded-xl border border-stone-200 text-sm font-medium text-stone-700 hover:bg-stone-50 cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        )}

        {/* Daftar Pengajar */}
        {loading ? (
          <div className="text-center py-16 text-stone-500">Memuat data pengajar...</div>
        ) : filteredList.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xs border border-stone-200 p-12 text-center">
            <User size={40} className="mx-auto text-stone-300 mb-3" aria-hidden="true" />
            <p className="text-stone-700 font-semibold">
              {list.length === 0 ? "Belum ada data pengajar." : "Tidak ada pengajar yang cocok dengan pencarian."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredList.map(p => {
              const formattedName = formatNamaGelar(p);
              return (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl shadow-xs border border-stone-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5"
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    {p.foto_url ? (
                      <img src={p.foto_url} alt={formattedName} className="w-12 h-12 rounded-xl object-cover object-center border border-stone-200 shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ background: `linear-gradient(135deg, ${primary}, #1a6b2b)` }}>
                        {p.nama.split(" ").slice(0, 2).map((w: string) => w[0]).join("").toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-sm text-stone-900">{formattedName}</p>
                        {p.is_pimpinan && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0" style={{ background: `${accent}24`, color: "#785c15" }}>
                            Pimpinan
                          </span>
                        )}
                        {!p.is_aktif && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-stone-100 text-stone-600 shrink-0">
                            Tersembunyi
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-600 mt-0.5">
                        {p.jabatan}{p.bidang_studi ? ` · ${p.bidang_studi}` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2.5 sm:pt-0 border-t sm:border-t-0 border-stone-100 shrink-0">
                    {p.foto_url && (
                      <button
                        type="button"
                        onClick={() => handleQuickCropFromList(p)}
                        aria-label={`Atur ulang crop foto ${formattedName}`}
                        className="p-2 rounded-xl text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors cursor-pointer"
                      >
                        <Crop size={15} aria-hidden="true" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => toggleAktif(p)}
                      aria-label={p.is_aktif ? `Sembunyikan ${formattedName}` : `Tampilkan ${formattedName}`}
                      className="p-1.5 rounded-xl text-stone-500 hover:text-emerald-700 hover:bg-stone-100 cursor-pointer"
                    >
                      {p.is_aktif ? <ToggleRight size={22} className="text-emerald-700" aria-hidden="true" /> : <ToggleLeft size={22} aria-hidden="true" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => startEdit(p)}
                      aria-label={`Edit data ${formattedName}`}
                      className="p-2 rounded-xl text-stone-700 bg-stone-100 hover:bg-stone-200 cursor-pointer"
                    >
                      <Edit2 size={15} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => hapus(p.id!)}
                      aria-label={`Hapus ${formattedName}`}
                      className="p-2 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 cursor-pointer"
                    >
                      <Trash2 size={15} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal Editor Foto Gaya Media Sosial */}
      <PhotoCropModal
        isOpen={cropModalOpen}
        onClose={() => {
          setCropModalOpen(false);
          setQuickCropTeacher(null);
        }}
        imageSrc={cropImageSrc}
        namaPengajar={quickCropTeacher ? formatNamaGelar(quickCropTeacher) : formatNamaGelar(form)}
        jabatanPengajar={quickCropTeacher ? quickCropTeacher.jabatan : form.jabatan}
        isPimpinan={quickCropTeacher ? quickCropTeacher.is_pimpinan : form.is_pimpinan}
        onSave={handleCropSaved}
        onChangeImage={handleChangeImageInModal}
      />
    </div>
  );
}
