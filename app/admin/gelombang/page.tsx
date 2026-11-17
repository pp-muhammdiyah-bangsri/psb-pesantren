"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Calendar, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";
import Link from "next/link";

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

const INITIAL = {
  nama: "",
  tanggal_buka: "",
  tanggal_tutup: "",
  kuota: "",
  biaya_pendaftaran: "0",
  keterangan: "",
};

export default function AdminGelombang() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [items, setItems] = useState<Gelombang[]>([]);
  const [form, setForm] = useState(INITIAL);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetch_ = useCallback(async (authToken: string) => {
    const res = await fetch("/api/gelombang?all=1", {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const d = await res.json();
    if (d.ok) setItems(d.data || []);
  }, []);

  useEffect(() => {
    const t = localStorage.getItem("psb_admin_token");
    if (!t) {
      router.push("/admin/login");
      return;
    }
    setToken(t);
    fetch_(t);
  }, [router, fetch_]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !form.nama || !form.tanggal_buka || !form.tanggal_tutup) return;
    setSaving(true);
    try {
      await fetch("/api/gelombang", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...form,
          kuota: form.kuota ? Number(form.kuota) : null,
          biaya_pendaftaran: Number(form.biaya_pendaftaran || 0),
        }),
      });
      setForm(INITIAL);
      setShowForm(false);
      await fetch_(token);
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (id: number, is_aktif: boolean) => {
    if (!token) return;
    await fetch(`/api/admin/gelombang/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ is_aktif: !is_aktif }),
    });
    await fetch_(token);
  };

  const hapus = async (id: number, nama: string) => {
    if (!token || !confirm(`Hapus gelombang "${nama}"?`)) return;
    await fetch(`/api/admin/gelombang/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    await fetch_(token);
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-200 px-4 sm:px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3.5">
            <Link
              href="/admin/dashboard?tab=gelombang"
              aria-label="Kembali ke Dashboard Admin"
              className="w-10 h-10 rounded-xl border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-colors"
            >
              <ArrowLeft size={18} aria-hidden="true" />
            </Link>
            <div>
              <h1 className="font-bold text-lg text-emerald-950">Gelombang PSB</h1>
              <p className="text-xs text-stone-500">Kelola jadwal penerimaan santri baru</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="inline-flex items-center gap-2 min-h-10 px-4 py-2 rounded-xl text-sm font-semibold text-white cursor-pointer"
            style={{ background: "#0f4c1e" }}
          >
            <Plus size={16} aria-hidden="true" />
            <span>{showForm ? "Tutup Form" : "Tambah Gelombang"}</span>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {showForm && (
          <form
            onSubmit={save}
            className="bg-white rounded-2xl shadow-xs border border-stone-200 p-5 sm:p-6 mb-6"
          >
            <h2 className="font-bold text-base text-emerald-950 mb-4">Tambah Gelombang Baru</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label htmlFor="gel-nama" className="text-xs font-bold text-stone-700 block mb-1.5">
                  Nama Gelombang *
                </label>
                <input
                  id="gel-nama"
                  required
                  value={form.nama}
                  onChange={(e) => setForm((p) => ({ ...p, nama: e.target.value }))}
                  placeholder="Gelombang 1 - 2026"
                  className="w-full min-h-10 border border-stone-300 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
              <div>
                <label htmlFor="gel-buka" className="text-xs font-bold text-stone-700 block mb-1.5">
                  Tanggal Buka *
                </label>
                <input
                  id="gel-buka"
                  type="date"
                  required
                  value={form.tanggal_buka}
                  onChange={(e) => setForm((p) => ({ ...p, tanggal_buka: e.target.value }))}
                  className="w-full min-h-10 border border-stone-300 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
              <div>
                <label htmlFor="gel-tutup" className="text-xs font-bold text-stone-700 block mb-1.5">
                  Tanggal Tutup *
                </label>
                <input
                  id="gel-tutup"
                  type="date"
                  required
                  value={form.tanggal_tutup}
                  onChange={(e) => setForm((p) => ({ ...p, tanggal_tutup: e.target.value }))}
                  className="w-full min-h-10 border border-stone-300 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
              <div>
                <label htmlFor="gel-kuota" className="text-xs font-bold text-stone-700 block mb-1.5">
                  Kuota
                </label>
                <input
                  id="gel-kuota"
                  type="number"
                  value={form.kuota}
                  onChange={(e) => setForm((p) => ({ ...p, kuota: e.target.value }))}
                  placeholder="Kosong = tidak terbatas"
                  className="w-full min-h-10 border border-stone-300 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
              <div>
                <label htmlFor="gel-biaya" className="text-xs font-bold text-stone-700 block mb-1.5">
                  Biaya Pendaftaran (Rp)
                </label>
                <input
                  id="gel-biaya"
                  type="number"
                  value={form.biaya_pendaftaran}
                  onChange={(e) => setForm((p) => ({ ...p, biaya_pendaftaran: e.target.value }))}
                  placeholder="0 = Gratis"
                  className="w-full min-h-10 border border-stone-300 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="gel-ket" className="text-xs font-bold text-stone-700 block mb-1.5">
                  Keterangan
                </label>
                <input
                  id="gel-ket"
                  value={form.keterangan}
                  onChange={(e) => setForm((p) => ({ ...p, keterangan: e.target.value }))}
                  placeholder="Info tambahan..."
                  className="w-full min-h-10 border border-stone-300 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>
            <div className="mt-4 flex gap-2.5 justify-end">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="min-h-10 px-5 py-2 rounded-xl font-semibold text-sm border border-stone-300 text-stone-700 hover:bg-stone-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="min-h-10 px-6 py-2 rounded-xl font-semibold text-sm text-white cursor-pointer"
                style={{ background: "#0f4c1e" }}
              >
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </form>
        )}

        <div className="space-y-3">
          {items.map((g) => (
            <div
              key={g.id}
              className="bg-white rounded-2xl shadow-xs border border-stone-200 p-5 flex items-center justify-between gap-4"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-bold text-emerald-950">{g.nama}</h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      g.is_aktif ? "bg-emerald-100 text-emerald-800" : "bg-stone-100 text-stone-600"
                    }`}
                  >
                    {g.is_aktif ? "Aktif" : "Nonaktif"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-stone-600">
                  <Calendar size={14} aria-hidden="true" />
                  <span className="tabular-nums">
                    {new Date(g.tanggal_buka).toLocaleDateString("id-ID")} —{" "}
                    {new Date(g.tanggal_tutup).toLocaleDateString("id-ID")}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => toggle(g.id, g.is_aktif)}
                  aria-label={g.is_aktif ? `Nonaktifkan ${g.nama}` : `Aktifkan ${g.nama}`}
                  className="p-2 rounded-xl text-stone-500 hover:text-emerald-700 hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  {g.is_aktif ? (
                    <ToggleRight size={24} className="text-emerald-700" aria-hidden="true" />
                  ) : (
                    <ToggleLeft size={24} aria-hidden="true" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => hapus(g.id, g.nama)}
                  aria-label={`Hapus ${g.nama}`}
                  className="p-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <Trash2 size={17} aria-hidden="true" />
                </button>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="text-center py-12 text-stone-500 bg-white rounded-2xl border border-stone-200">
              Belum ada gelombang pendaftaran.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
