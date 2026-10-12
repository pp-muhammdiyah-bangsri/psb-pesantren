"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Plus, Trash2, Save, User, Edit2, Award, ToggleLeft, ToggleRight, X, Upload, Sparkles
} from "lucide-react";
import Link from "next/link";
import { formatNamaGelar } from "@/components/PengajarSection";

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
  const [uploadingFoto, setUploadingFoto] = useState(false);

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

  const handleFotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1 * 1024 * 1024) { setMsg("Foto terlalu besar. Maksimal 1MB."); return; }
    setUploadingFoto(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "foto");
      const res = await fetch("/api/psb/upload", { method: "POST", body: formData });
      const d = await res.json();
      if (d.ok) setF("foto_url", d.url);
      else setMsg(d.error || "Gagal upload foto");
    } finally { setUploadingFoto(false); }
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

              {/* Foto Profil */}
              <div className="sm:col-span-2 flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-700">Foto Profil (Maks. 1MB)</label>
                <div className="flex items-center gap-3">
                  {form.foto_url && <img src={form.foto_url} alt="Preview" className="w-12 h-12 rounded-lg object-cover border" />}
                  <label className="flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-50" style={{ borderColor: "#e5e7eb" }}>
                    <Upload size={14} />
                    {uploadingFoto ? "Mengupload..." : "Pilih Foto"}
                    <input type="file" accept="image/*" className="hidden" onChange={handleFotoUpload} disabled={uploadingFoto} />
                  </label>
                  {form.foto_url && <button onClick={() => setF("foto_url", "")} className="text-red-400 hover:text-red-600 text-xs">Hapus</button>}
                </div>
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
                    <img src={p.foto_url} alt={p.nama} className="w-12 h-12 rounded-xl object-cover border border-gray-200 shrink-0" />
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
    </div>
  );
}
