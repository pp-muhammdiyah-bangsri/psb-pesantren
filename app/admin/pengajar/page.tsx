"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Plus, Trash2, Save, User, Edit2, Award, ToggleLeft, ToggleRight, X, Upload, Sparkles, Crop
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
  const token = typeof window !== "undefined" ? localStorage.getItem("psb_admin_token") : null;

  const [list, setList] = useState<Pengajar[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Pengajar>(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [editId, setEditId] = useState<number | null>(null);

  // State untuk Crop Modal Ala Media Sosial
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string>("");
  const [quickCropTeacher, setQuickCropTeacher] = useState<Pengajar | null>(null);

  useEffect(() => {
    if (!token) { router.push("/admin/login"); return; }
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/pengajar", { headers: { Authorization: `Bearer ${token}` } });
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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4 flex items-center gap-4" style={{ borderColor: "#e0e0e0" }}>
        <Link href="/admin/dashboard" className="text-gray-400 hover:text-gray-600"><ArrowLeft size={20} /></Link>
        <div className="flex-1">
          <h1 className="font-extrabold text-lg" style={{ color: primary }}>Manajemen Pengajar & Pimpinan</h1>
          <p className="text-xs text-gray-400">Kelola data pengajar dan pimpinan yang tampil di website</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm(INITIAL_FORM); setMsg(""); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-bold shadow-sm hover:opacity-90"
          style={{ background: `linear-gradient(135deg, ${primary}, #1a6b2b)` }}
        >
          <Plus size={16} /> Tambah Pengajar
        </button>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {msg && (
          <div className={`text-sm rounded-xl px-4 py-3 mb-4 ${msg.includes("berhasil") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-600 border border-red-200"}`}>{msg}</div>
        )}

        {/* Form Modal / Box */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6" style={{ borderColor: "#f0f0f0" }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-base text-gray-900">{editId ? "Edit Data Pengajar" : "Tambah Pengajar Baru"}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
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
                  <div className="mt-4 pt-4 border-t border-emerald-200/80 flex items-center justify-between flex-wrap gap-3 bg-white p-3.5 rounded-xl border border-gray-100 shadow-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={form.foto_url}
                        alt="Preview"
                        className="w-16 h-20 rounded-xl object-cover object-center border-2 border-emerald-500 shadow-sm shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://placehold.co/150x200?text=Foto+Error";
                        }}
                      />
                      <div className="min-w-0">
                        <span className="font-bold text-xs text-emerald-900 flex items-center gap-1">
                          ✓ Foto Terpasang & Siap Tampil
                        </span>
                        <span className="text-[11px] text-gray-400 truncate block max-w-xs sm:max-w-md">
                          {form.foto_url}
                        </span>
                        <span className="text-[10px] text-emerald-600 font-medium">
                          Tampil rapi dan presisi di kartu landing page.
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleOpenCropForCurrent}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors shadow-xs shrink-0"
                    >
                      <Crop size={14} className="text-emerald-700" />
                      Atur Ulang / Crop Foto Ini
                    </button>
                  </div>
                )}
              </div>

              {/* Urutan */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-700">Urutan Tampil</label>
                <input
                  type="number"
                  min={1}
                  value={form.urutan}
                  onChange={e => setF("urutan", Number(e.target.value))}
                  className="border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  style={{ borderColor: "#e5e7eb" }}
                />
              </div>

              {/* Checkboxes */}
              <div className="sm:col-span-3 flex flex-wrap items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
                  <input type="checkbox" checked={form.is_pimpinan} onChange={e => setF("is_pimpinan", e.target.checked)} className="w-4 h-4 rounded" />
                  <Award size={15} style={{ color: accent }} /> Tandai sebagai Pimpinan Pondok
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
                  <input type="checkbox" checked={form.is_aktif} onChange={e => setF("is_aktif", e.target.checked)} className="w-4 h-4 rounded" />
                  Tampilkan di website
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-5 pt-4 border-t" style={{ borderColor: "#f0f0f0" }}>
              <button
                onClick={save}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-bold shadow-sm hover:opacity-90 disabled:opacity-60"
                style={{ background: `linear-gradient(135deg, ${primary}, #1a6b2b)` }}
              >
                <Save size={15} /> {saving ? "Menyimpan..." : (editId ? "Update Data" : "Simpan")}
              </button>
              <button onClick={() => setShowForm(false)} className="px-4 py-2.5 rounded-xl border text-sm font-medium text-gray-600 hover:bg-gray-50" style={{ borderColor: "#e5e7eb" }}>Batal</button>
            </div>
          </div>
        )}

        {/* Daftar Pengajar */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">Memuat data...</div>
        ) : list.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border p-12 text-center" style={{ borderColor: "#f0f0f0" }}>
            <User size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">Belum ada data pengajar.</p>
            <p className="text-sm text-gray-400 mt-1">Klik tombol "Tambah Pengajar" untuk menambahkan data pertama.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {list.map(p => {
              const formattedName = formatNamaGelar(p);
              return (
                <div key={p.id} className="bg-white rounded-2xl shadow-sm border p-4 flex items-center gap-4" style={{ borderColor: "#f0f0f0" }}>
                  {p.foto_url ? (
                    <img src={p.foto_url} alt={p.nama} className="w-12 h-12 rounded-xl object-cover object-center border border-gray-200 shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ background: `linear-gradient(135deg, ${primary}, #1a6b2b)` }}>
                      {p.nama.split(" ").slice(0, 2).map((w: string) => w[0]).join("").toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-sm text-gray-900 truncate">{formattedName}</p>
                      {p.is_pimpinan && <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: `${accent}20`, color: "#8a6b1e" }}>Pimpinan</span>}
                      {!p.is_aktif && <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-gray-100 text-gray-500">Tersembunyi</span>}
                    </div>
                    <p className="text-xs text-gray-500 truncate">{p.jabatan}{p.bidang_studi ? ` · ${p.bidang_studi}` : ""}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {p.foto_url && (
                      <button
                        onClick={() => handleQuickCropFromList(p)}
                        title="Atur Ulang / Crop Foto Pengajar Ini"
                        className="p-1.5 rounded-lg text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors border border-emerald-200"
                      >
                        <Crop size={16} />
                      </button>
                    )}
                    <button onClick={() => toggleAktif(p)} title="Toggle tampil" className="text-gray-400 hover:text-green-600">
                      {p.is_aktif ? <ToggleRight size={22} className="text-green-500" /> : <ToggleLeft size={22} />}
                    </button>
                    <button onClick={() => startEdit(p)} className="text-gray-400 hover:text-blue-600"><Edit2 size={16} /></button>
                    <button onClick={() => hapus(p.id!)} className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

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
