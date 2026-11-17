"use client";
import { useState } from "react";
import {
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Edit2,
  Upload,
  ImageOff,
  Play,
  Calendar,
  BookOpen,
  X,
} from "lucide-react";
import { parseMediaUrl } from "@/lib/mediaUtils";

export interface GelombangItem {
  id: number;
  nama: string;
  tanggal_buka: string;
  tanggal_tutup: string;
  kuota: number | null;
  biaya_pendaftaran: number;
  keterangan: string | null;
  is_aktif: boolean;
}

export interface GaleriItem {
  id: number;
  judul: string;
  deskripsi?: string;
  foto_url: string;
  urutan: number;
}

export interface ProgramItem {
  id: number;
  nama: string;
  deskripsi: string;
  icon: string;
  warna: string;
  urutan: number;
  is_aktif: boolean;
}

const INPUT_CLS =
  "w-full min-h-10 border border-stone-300 rounded-xl px-3.5 py-2 text-sm text-stone-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600";

function formatIdDate(val?: string) {
  if (!val) return "-";
  const dt = new Date(val);
  if (Number.isNaN(dt.getTime())) return val;
  return dt.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

/* ─────────────────────────── GELOMBANG TAB ─────────────────────────── */
export function GelombangTab({
  token,
  primaryColor,
  items,
  onRefresh,
}: {
  token: string | null;
  primaryColor: string;
  items: GelombangItem[];
  onRefresh: () => Promise<void>;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [form, setForm] = useState({
    nama: "",
    tanggal_buka: "",
    tanggal_tutup: "",
    kuota: "",
    biaya_pendaftaran: "0",
    keterangan: "",
  });

  const resetForm = () => {
    setForm({
      nama: "",
      tanggal_buka: "",
      tanggal_tutup: "",
      kuota: "",
      biaya_pendaftaran: "0",
      keterangan: "",
    });
    setEditId(null);
    setShowForm(false);
  };

  const handleEdit = (g: GelombangItem) => {
    setEditId(g.id);
    setForm({
      nama: g.nama || "",
      tanggal_buka: g.tanggal_buka ? String(g.tanggal_buka).slice(0, 10) : "",
      tanggal_tutup: g.tanggal_tutup ? String(g.tanggal_tutup).slice(0, 10) : "",
      kuota: g.kuota !== null && g.kuota !== undefined ? String(g.kuota) : "",
      biaya_pendaftaran: String(g.biaya_pendaftaran ?? 0),
      keterangan: g.keterangan || "",
    });
    setShowForm(true);
    setStatusMsg("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !form.nama || !form.tanggal_buka || !form.tanggal_tutup) return;
    setSaving(true);
    setStatusMsg("");
    try {
      const payload = {
        nama: form.nama.trim(),
        tanggal_buka: form.tanggal_buka,
        tanggal_tutup: form.tanggal_tutup,
        kuota: form.kuota ? Number(form.kuota) : null,
        biaya_pendaftaran: Number(form.biaya_pendaftaran || 0),
        keterangan: form.keterangan.trim() || null,
      };
      const url = editId ? `/api/admin/gelombang/${editId}` : "/api/gelombang";
      const method = editId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const d = await res.json();
      if (!d.ok) throw new Error(d.error || "Gagal menyimpan gelombang.");
      setStatusMsg(editId ? "Gelombang berhasil diperbarui." : "Gelombang baru berhasil ditambahkan.");
      resetForm();
      await onRefresh();
    } catch (err) {
      setStatusMsg(err instanceof Error ? err.message : "Gagal menyimpan data.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (g: GelombangItem) => {
    if (!token) return;
    await fetch(`/api/admin/gelombang/${g.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ is_aktif: !g.is_aktif }),
    });
    await onRefresh();
  };

  const handleDelete = async (g: GelombangItem) => {
    if (!token || !confirm(`Hapus gelombang "${g.nama}"?`)) return;
    const res = await fetch(`/api/admin/gelombang/${g.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const d = await res.json();
    if (d.ok) {
      setStatusMsg(`Gelombang "${g.nama}" berhasil dihapus.`);
      await onRefresh();
    } else {
      setStatusMsg(d.error || "Gagal menghapus gelombang.");
    }
  };

  return (
    <div className="space-y-5">
      {statusMsg && (
        <div
          role="status"
          className={`p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between border ${
            statusMsg.includes("berhasil")
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-700 border-red-200"
          }`}
        >
          <span>{statusMsg}</span>
          <button type="button" onClick={() => setStatusMsg("")} aria-label="Tutup pesan" className="cursor-pointer">
            <X size={15} aria-hidden="true" />
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl p-5 shadow-xs border border-stone-200 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-base font-bold text-stone-900">Jadwal &amp; Gelombang Penerimaan Santri</h2>
          <p className="text-xs text-stone-500">Kelola tanggal buka/tutup, kuota, dan biaya pendaftaran per gelombang</p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (showForm) resetForm();
            else {
              resetForm();
              setShowForm(true);
            }
          }}
          className="inline-flex items-center gap-2 min-h-10 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs cursor-pointer"
          style={{ background: primaryColor }}
        >
          <Plus size={15} aria-hidden="true" />
          <span>{showForm ? "Tutup Form" : "Tambah Gelombang"}</span>
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-emerald-200 space-y-4">
          <h3 className="font-bold text-sm text-stone-900 pb-2 border-b border-stone-100">
            {editId ? "Edit Gelombang PSB" : "Tambah Gelombang PSB Baru"}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label htmlFor="gel-nama" className="block text-xs font-bold text-stone-700 mb-1.5">
                Nama Gelombang *
              </label>
              <input
                id="gel-nama"
                type="text"
                required
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
                placeholder="Contoh: Gelombang 1 - 2026/2027"
                className={INPUT_CLS}
              />
            </div>
            <div>
              <label htmlFor="gel-kuota" className="block text-xs font-bold text-stone-700 mb-1.5">
                Kuota Santri
              </label>
              <input
                id="gel-kuota"
                type="number"
                value={form.kuota}
                onChange={(e) => setForm({ ...form, kuota: e.target.value })}
                placeholder="Kosong = tidak terbatas"
                className={INPUT_CLS}
              />
            </div>
            <div>
              <label htmlFor="gel-buka" className="block text-xs font-bold text-stone-700 mb-1.5">
                Tanggal Buka *
              </label>
              <input
                id="gel-buka"
                type="date"
                required
                value={form.tanggal_buka}
                onChange={(e) => setForm({ ...form, tanggal_buka: e.target.value })}
                className={INPUT_CLS}
              />
            </div>
            <div>
              <label htmlFor="gel-tutup" className="block text-xs font-bold text-stone-700 mb-1.5">
                Tanggal Tutup *
              </label>
              <input
                id="gel-tutup"
                type="date"
                required
                value={form.tanggal_tutup}
                onChange={(e) => setForm({ ...form, tanggal_tutup: e.target.value })}
                className={INPUT_CLS}
              />
            </div>
            <div>
              <label htmlFor="gel-biaya" className="block text-xs font-bold text-stone-700 mb-1.5">
                Biaya Pendaftaran (Rp)
              </label>
              <input
                id="gel-biaya"
                type="number"
                min={0}
                value={form.biaya_pendaftaran}
                onChange={(e) => setForm({ ...form, biaya_pendaftaran: e.target.value })}
                className={INPUT_CLS}
              />
            </div>
            <div className="sm:col-span-2 md:col-span-3">
              <label htmlFor="gel-ket" className="block text-xs font-bold text-stone-700 mb-1.5">
                Keterangan / Persyaratan Khusus
              </label>
              <input
                id="gel-ket"
                type="text"
                value={form.keterangan}
                onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
                placeholder="Contoh: Gratis biaya formulir / termasuk seragam"
                className={INPUT_CLS}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={resetForm}
              className="min-h-10 px-4 py-2 rounded-xl text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="min-h-10 px-5 py-2 rounded-xl text-xs font-bold text-white shadow-xs cursor-pointer disabled:opacity-60"
              style={{ background: primaryColor }}
            >
              {saving ? "Menyimpan..." : editId ? "Perbarui Gelombang" : "Simpan Gelombang"}
            </button>
          </div>
        </form>
      )}

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-stone-200 text-stone-500">
          <Calendar size={32} className="mx-auto mb-2 text-stone-300" aria-hidden="true" />
          <p className="font-semibold text-sm">Belum ada gelombang PSB terdaftar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((g) => (
            <div
              key={g.id}
              className={`bg-white rounded-2xl p-5 shadow-xs border border-stone-200 flex flex-col justify-between gap-4 ${
                g.is_aktif ? "" : "opacity-75"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-bold text-base text-stone-900">{g.nama}</h3>
                  <button
                    type="button"
                    onClick={() => handleToggle(g)}
                    aria-label={g.is_aktif ? `Nonaktifkan ${g.nama}` : `Aktifkan ${g.nama}`}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold cursor-pointer shrink-0 ${
                      g.is_aktif
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-stone-100 text-stone-600"
                    }`}
                  >
                    {g.is_aktif ? <ToggleRight size={16} aria-hidden="true" /> : <ToggleLeft size={16} aria-hidden="true" />}
                    <span>{g.is_aktif ? "Aktif" : "Tutup"}</span>
                  </button>
                </div>

                <div className="space-y-1.5 text-xs text-stone-600 tabular-nums">
                  <div>
                    <strong>Jadwal:</strong> {formatIdDate(g.tanggal_buka)} – {formatIdDate(g.tanggal_tutup)}
                  </div>
                  <div>
                    <strong>Kuota:</strong> {g.kuota ? `${g.kuota} Santri` : "Tidak dibatasi"}
                  </div>
                  <div>
                    <strong>Biaya:</strong>{" "}
                    {Number(g.biaya_pendaftaran || 0) === 0
                      ? "Gratis"
                      : `Rp ${Number(g.biaya_pendaftaran).toLocaleString("id-ID")}`}
                  </div>
                  {g.keterangan && <p className="text-stone-500 italic pt-1">{g.keterangan}</p>}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => handleEdit(g)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 cursor-pointer"
                >
                  <Edit2 size={13} aria-hidden="true" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(g)}
                  aria-label={`Hapus ${g.nama}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 cursor-pointer"
                >
                  <Trash2 size={13} aria-hidden="true" />
                  <span>Hapus</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────── GALERI TAB ─────────────────────────── */
export function GaleriTab({
  token,
  primaryColor,
  items,
  onRefresh,
}: {
  token: string | null;
  primaryColor: string;
  items: GaleriItem[];
  onRefresh: () => Promise<void>;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [failedIds, setFailedIds] = useState<Record<number, boolean>>({});
  const [form, setForm] = useState({
    judul: "",
    deskripsi: "",
    foto_url: "",
    urutan: "1",
  });

  const resetForm = () => {
    setForm({ judul: "", deskripsi: "", foto_url: "", urutan: String(items.length + 1) });
    setEditId(null);
    setShowForm(false);
  };

  const handleEdit = (g: GaleriItem) => {
    setEditId(g.id);
    setForm({
      judul: g.judul || "",
      deskripsi: g.deskripsi || "",
      foto_url: g.foto_url || "",
      urutan: String(g.urutan ?? 1),
    });
    setShowForm(true);
    setStatusMsg("");
  };

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setStatusMsg("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "galeri");
      const res = await fetch("/api/psb/upload", { method: "POST", body: fd });
      const d = await res.json();
      if (!d.ok) throw new Error(d.error || "Upload gagal.");
      setForm((prev) => ({ ...prev, foto_url: d.url }));
      setStatusMsg("Foto berhasil diunggah, klik Simpan untuk menayangkan.");
    } catch (err) {
      setStatusMsg(err instanceof Error ? err.message : "Upload foto gagal.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !form.judul.trim() || !form.foto_url.trim()) return;
    setSaving(true);
    setStatusMsg("");
    try {
      const payload = {
        ...(editId ? { id: editId } : {}),
        judul: form.judul.trim(),
        deskripsi: form.deskripsi.trim() || null,
        foto_url: form.foto_url.trim(),
        urutan: Number(form.urutan || 1),
      };
      const res = await fetch("/api/admin/galeri", {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const d = await res.json();
      if (!d.ok) throw new Error(d.error || "Gagal menyimpan galeri.");
      setStatusMsg(editId ? "Item galeri berhasil diperbarui." : "Foto berhasil ditambahkan ke galeri.");
      resetForm();
      await onRefresh();
    } catch (err) {
      setStatusMsg(err instanceof Error ? err.message : "Gagal menyimpan galeri.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (g: GaleriItem) => {
    if (!token || !confirm(`Hapus "${g.judul || "item galeri"}"?`)) return;
    await fetch(`/api/admin/galeri?id=${g.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setStatusMsg("Item galeri berhasil dihapus.");
    await onRefresh();
  };

  return (
    <div className="space-y-5">
      {statusMsg && (
        <div
          role="status"
          className={`p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between border ${
            statusMsg.includes("berhasil")
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-700 border-red-200"
          }`}
        >
          <span>{statusMsg}</span>
          <button type="button" onClick={() => setStatusMsg("")} aria-label="Tutup pesan" className="cursor-pointer">
            <X size={15} aria-hidden="true" />
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl p-5 shadow-xs border border-stone-200 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-base font-bold text-stone-900">Kelola Galeri Mading Pesantren</h2>
          <p className="text-xs text-stone-500">Mendukung upload foto langsung, URL gambar, Google Drive, atau link YouTube</p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (showForm) resetForm();
            else {
              resetForm();
              setShowForm(true);
            }
          }}
          className="inline-flex items-center gap-2 min-h-10 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs cursor-pointer"
          style={{ background: primaryColor }}
        >
          <Plus size={15} aria-hidden="true" />
          <span>{showForm ? "Tutup Form" : "Tambah Foto / Video"}</span>
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-emerald-200 space-y-4">
          <h3 className="font-bold text-sm text-stone-900 pb-2 border-b border-stone-100">
            {editId ? "Edit Item Galeri" : "Tambah Foto / Video Baru"}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="gal-judul" className="block text-xs font-bold text-stone-700 mb-1.5">
                Judul Foto / Video *
              </label>
              <input
                id="gal-judul"
                type="text"
                required
                value={form.judul}
                onChange={(e) => setForm({ ...form, judul: e.target.value })}
                placeholder="Contoh: Kegiatan Mengaji Santri"
                className={INPUT_CLS}
              />
            </div>

            <div>
              <label htmlFor="gal-urutan" className="block text-xs font-bold text-stone-700 mb-1.5">
                Urutan Tampil
              </label>
              <input
                id="gal-urutan"
                type="number"
                min={1}
                value={form.urutan}
                onChange={(e) => setForm({ ...form, urutan: e.target.value })}
                className={INPUT_CLS}
              />
            </div>

            <div className="sm:col-span-2 space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <label htmlFor="gal-url" className="block text-xs font-bold text-stone-700">
                  URL Foto / Video YouTube *
                </label>
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 cursor-pointer">
                  <Upload size={13} aria-hidden="true" />
                  <span>{uploading ? "Mengunggah..." : "Upload File Foto"}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleUploadFile}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
              </div>
              <input
                id="gal-url"
                type="text"
                required
                value={form.foto_url}
                onChange={(e) => setForm({ ...form, foto_url: e.target.value })}
                placeholder="Upload file di atas, atau tempel link Google Drive / YouTube..."
                className={INPUT_CLS}
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="gal-desc" className="block text-xs font-bold text-stone-700 mb-1.5">
                Deskripsi Singkat (Catatan Polaroid Mading)
              </label>
              <input
                id="gal-desc"
                type="text"
                value={form.deskripsi}
                onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                placeholder="Keterangan singkat di bawah bingkai foto..."
                className={INPUT_CLS}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={resetForm}
              className="min-h-10 px-4 py-2 rounded-xl text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving || uploading}
              className="min-h-10 px-5 py-2 rounded-xl text-xs font-bold text-white shadow-xs cursor-pointer disabled:opacity-60"
              style={{ background: primaryColor }}
            >
              {saving ? "Menyimpan..." : editId ? "Perbarui Item" : "Simpan ke Galeri"}
            </button>
          </div>
        </form>
      )}

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-stone-200 text-stone-500">
          Belum ada foto atau video di galeri.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((g) => {
            const media = parseMediaUrl(g.foto_url);
            const failed = Boolean(failedIds[g.id]);
            return (
              <div
                key={g.id}
                className="bg-white rounded-2xl overflow-hidden shadow-xs border border-stone-200 flex flex-col justify-between"
              >
                <div className="h-44 bg-stone-100 relative overflow-hidden flex items-center justify-center">
                  {!failed && media.thumbnailUrl ? (
                    <img
                      src={media.thumbnailUrl}
                      alt={g.judul || "Foto galeri"}
                      referrerPolicy="no-referrer"
                      onError={() => setFailedIds((prev) => ({ ...prev, [g.id]: true }))}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-1.5 text-stone-400">
                      <ImageOff size={24} aria-hidden="true" />
                      <span className="text-xs">Gagal memuat pratinjau</span>
                    </div>
                  )}

                  {media.type === "youtube" && (
                    <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 bg-red-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow">
                      <Play size={10} className="fill-current" aria-hidden="true" />
                      <span>YouTube</span>
                    </span>
                  )}

                  <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-black/60 text-white tabular-nums">
                    #{g.urutan}
                  </span>
                </div>

                <div className="p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-sm text-stone-900 truncate">
                      {g.judul || "(Tanpa Judul)"}
                    </h4>
                    {g.deskripsi && (
                      <p className="text-xs text-stone-500 mt-0.5 line-clamp-1">{g.deskripsi}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleEdit(g)}
                      aria-label={`Edit ${g.judul || "galeri"}`}
                      className="p-2 rounded-xl text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors cursor-pointer"
                    >
                      <Edit2 size={14} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(g)}
                      aria-label={`Hapus ${g.judul || "galeri"}`}
                      className="p-2 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
                    >
                      <Trash2 size={14} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────── PROGRAM UNGGULAN TAB ─────────────────────────── */
const ICON_PRESETS = ["⭐", "📖", "🕌", "🏫", "🎓", "💻", "🌍", "⚽", "🎨", "🔬", "🤝", "🌿", "📿", "🏆"];
const COLOR_SWATCHES = ["#0f4c1e", "#1e3a8a", "#7c3aed", "#b91c1c", "#c8a84b", "#0891b2"];

export function ProgramTab({
  token,
  primaryColor,
  items,
  loading,
  onSetItems,
}: {
  token: string | null;
  primaryColor: string;
  items: ProgramItem[];
  loading: boolean;
  onSetItems: (updater: (prev: ProgramItem[]) => ProgramItem[]) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [form, setForm] = useState({
    nama: "",
    deskripsi: "",
    icon: "⭐",
    warna: "#0f4c1e",
    urutan: "1",
  });

  const resetForm = () => {
    setForm({ nama: "", deskripsi: "", icon: "⭐", warna: "#0f4c1e", urutan: String(items.length + 1) });
    setEditId(null);
    setShowForm(false);
  };

  const handleEdit = (prog: ProgramItem) => {
    setEditId(prog.id);
    setForm({
      nama: prog.nama || "",
      deskripsi: prog.deskripsi || "",
      icon: prog.icon || "⭐",
      warna: prog.warna || "#0f4c1e",
      urutan: String(prog.urutan ?? 1),
    });
    setShowForm(true);
    setStatusMsg("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !form.nama.trim()) return;
    setSaving(true);
    setStatusMsg("");
    try {
      const payload = {
        ...(editId ? { id: editId } : {}),
        nama: form.nama.trim(),
        deskripsi: form.deskripsi.trim(),
        icon: form.icon || "⭐",
        warna: form.warna || "#0f4c1e",
        urutan: parseInt(form.urutan, 10) || 1,
      };
      const res = await fetch("/api/program", {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const d = await res.json();
      if (!d.ok) throw new Error(d.error || "Gagal menyimpan program.");

      if (editId) {
        onSetItems((prev) =>
          prev
            .map((p) => (p.id === editId ? d.data : p))
            .sort((a, b) => a.urutan - b.urutan)
        );
        setStatusMsg("Program unggulan berhasil diperbarui.");
      } else {
        onSetItems((prev) => [...prev, d.data].sort((a, b) => a.urutan - b.urutan));
        setStatusMsg("Program unggulan baru berhasil ditambahkan.");
      }
      resetForm();
    } catch (err) {
      setStatusMsg(err instanceof Error ? err.message : "Gagal menyimpan program.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (prog: ProgramItem) => {
    if (!token) return;
    const res = await fetch("/api/program", {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id: prog.id, is_aktif: !prog.is_aktif }),
    });
    const d = await res.json();
    if (d.ok) {
      onSetItems((prev) => prev.map((p) => (p.id === prog.id ? { ...p, is_aktif: !p.is_aktif } : p)));
    }
  };

  const handleDelete = async (prog: ProgramItem) => {
    if (!token || !confirm(`Hapus program "${prog.nama}"?`)) return;
    const res = await fetch("/api/program", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id: prog.id }),
    });
    const d = await res.json();
    if (d.ok) {
      onSetItems((prev) => prev.filter((p) => p.id !== prog.id));
      setStatusMsg(`Program "${prog.nama}" berhasil dihapus.`);
    }
  };

  return (
    <div className="space-y-5">
      {statusMsg && (
        <div
          role="status"
          className={`p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between border ${
            statusMsg.includes("berhasil")
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-700 border-red-200"
          }`}
        >
          <span>{statusMsg}</span>
          <button type="button" onClick={() => setStatusMsg("")} aria-label="Tutup pesan" className="cursor-pointer">
            <X size={15} aria-hidden="true" />
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl p-5 shadow-xs border border-stone-200 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-base font-bold text-stone-900">Kelola Kartu Program Unggulan</h2>
          <p className="text-xs text-stone-500">Tambah, edit konten, atur urutan, atau aktif/nonaktifkan kartu program di landing page</p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (showForm) resetForm();
            else {
              resetForm();
              setShowForm(true);
            }
          }}
          className="inline-flex items-center gap-2 min-h-10 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs cursor-pointer"
          style={{ background: primaryColor }}
        >
          <Plus size={15} aria-hidden="true" />
          <span>{showForm ? "Tutup Form" : "Tambah Program"}</span>
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-emerald-200 space-y-4">
          <h3 className="font-bold text-sm text-stone-900 pb-2 border-b border-stone-100">
            {editId ? "Edit Program Unggulan" : "Tambah Program Unggulan Baru"}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="prog-nama" className="block text-xs font-bold text-stone-700 mb-1.5">
                Nama Program *
              </label>
              <input
                id="prog-nama"
                type="text"
                required
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
                placeholder="Contoh: Tahfidz Al-Qur'an 30 Juz"
                className={INPUT_CLS}
              />
            </div>

            <div>
              <label htmlFor="prog-urutan" className="block text-xs font-bold text-stone-700 mb-1.5">
                Urutan Tampil
              </label>
              <input
                id="prog-urutan"
                type="number"
                min={1}
                value={form.urutan}
                onChange={(e) => setForm({ ...form, urutan: e.target.value })}
                className={INPUT_CLS}
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="prog-desc" className="block text-xs font-bold text-stone-700 mb-1.5">
                Deskripsi Program
              </label>
              <textarea
                id="prog-desc"
                rows={2}
                value={form.deskripsi}
                onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                placeholder="Jelaskan keunggulan program ini secara singkat..."
                className="w-full border border-stone-300 rounded-xl p-3 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <span className="block text-xs font-bold text-stone-700 mb-1.5">Pilih Simbol Ikon</span>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {ICON_PRESETS.map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setForm({ ...form, icon: ic })}
                    aria-label={`Pilih ikon ${ic}`}
                    className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center border-2 cursor-pointer transition-transform ${
                      form.icon === ic
                        ? "border-emerald-700 bg-emerald-50 scale-105"
                        : "border-stone-200 hover:border-stone-400"
                    }`}
                  >
                    {ic}
                  </button>
                ))}
              </div>
              <input
                aria-label="Simbol ikon kustom"
                type="text"
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                className={INPUT_CLS}
              />
            </div>

            <div>
              <label htmlFor="prog-warna" className="block text-xs font-bold text-stone-700 mb-1.5">
                Aksen Warna Kartu
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="prog-warna"
                  type="color"
                  value={form.warna}
                  onChange={(e) => setForm({ ...form, warna: e.target.value })}
                  className="w-10 h-10 rounded-xl border border-stone-300 cursor-pointer shrink-0"
                />
                <div className="flex flex-wrap gap-2">
                  {COLOR_SWATCHES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      aria-label={`Warna ${c}`}
                      onClick={() => setForm({ ...form, warna: c })}
                      className="w-7 h-7 rounded-full border-2 cursor-pointer"
                      style={{
                        background: c,
                        borderColor: form.warna === c ? "#111827" : "transparent",
                      }}
                    />
                  ))}
                </div>
              </div>
              <p className="text-xs font-mono text-stone-500 mt-1.5">{form.warna}</p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={resetForm}
              className="min-h-10 px-4 py-2 rounded-xl text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="min-h-10 px-5 py-2 rounded-xl text-xs font-bold text-white shadow-xs cursor-pointer disabled:opacity-60"
              style={{ background: primaryColor }}
            >
              {saving ? "Menyimpan..." : editId ? "Perbarui Program" : "Simpan Program"}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div
            className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto"
            style={{ borderColor: primaryColor }}
          />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-stone-200 text-stone-500">
          <BookOpen size={36} className="mx-auto mb-2 text-stone-300" aria-hidden="true" />
          <p className="font-bold text-stone-700">Belum ada program unggulan</p>
          <p className="text-xs text-stone-500 mt-1">Klik tombol &ldquo;Tambah Program&rdquo; untuk membuat program pertama.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((prog) => (
            <div
              key={prog.id}
              className={`bg-white rounded-2xl p-5 shadow-xs border border-stone-200 flex flex-col justify-between gap-3 ${
                prog.is_aktif ? "" : "opacity-65"
              }`}
              style={{ borderLeftWidth: "4px", borderLeftColor: prog.warna }}
            >
              <div className="space-y-2.5">
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                    style={{ background: `${prog.warna}18` }}
                  >
                    {prog.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-stone-900 leading-snug">{prog.nama}</h4>
                    <span
                      className={`inline-block mt-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        prog.is_aktif
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-stone-100 text-stone-600"
                      }`}
                    >
                      {prog.is_aktif ? "Aktif" : "Nonaktif"} · Urutan #{prog.urutan}
                    </span>
                  </div>
                </div>
                {prog.deskripsi && (
                  <p className="text-xs text-stone-600 leading-relaxed line-clamp-3">{prog.deskripsi}</p>
                )}
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => handleToggle(prog)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                    prog.is_aktif
                      ? "bg-amber-50 text-amber-800 hover:bg-amber-100"
                      : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                  }`}
                >
                  {prog.is_aktif ? "Nonaktifkan" : "Aktifkan"}
                </button>
                <button
                  type="button"
                  onClick={() => handleEdit(prog)}
                  aria-label={`Edit ${prog.nama}`}
                  className="p-2 rounded-lg text-stone-700 bg-stone-100 hover:bg-stone-200 cursor-pointer"
                >
                  <Edit2 size={14} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(prog)}
                  aria-label={`Hapus ${prog.nama}`}
                  className="p-2 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 cursor-pointer"
                >
                  <Trash2 size={14} aria-hidden="true" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
