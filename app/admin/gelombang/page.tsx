"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Calendar, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import Link from "next/link";

interface Gelombang {
  id: number; nama: string; tanggal_buka: string; tanggal_tutup: string;
  kuota: number | null; biaya_pendaftaran: number; keterangan: string | null; is_aktif: boolean;
}

const INITIAL = { nama: "", tanggal_buka: "", tanggal_tutup: "", kuota: "", biaya_pendaftaran: "0", keterangan: "" };

export default function AdminGelombang() {
  const router = useRouter();
  const [items, setItems] = useState<Gelombang[]>([]);
  const [form, setForm] = useState(INITIAL);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const token = typeof window !== "undefined" ? localStorage.getItem("psb_admin_token") : null;

  const fetch_ = useCallback(async () => {
    const res = await fetch("/api/gelombang");
    const d = await res.json();
    if (d.ok) setItems(d.data);
  }, []);

  useEffect(() => { if (!token) { router.push("/admin/login"); return; } fetch_(); }, [token, router, fetch_]);

  const save = async () => {
    if (!form.nama || !form.tanggal_buka || !form.tanggal_tutup) return;
    setSaving(true);
    await fetch("/api/gelombang", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...form, kuota: form.kuota ? Number(form.kuota) : null, biaya_pendaftaran: Number(form.biaya_pendaftaran) }),
    });
    setForm(INITIAL); setShowForm(false); await fetch_(); setSaving(false);
  };

  const toggle = async (id: number, is_aktif: boolean) => {
    await fetch(`/api/admin/gelombang/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ is_aktif: !is_aktif }),
    });
    await fetch_();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between" style={{ borderColor: "#e0e0e0" }}>
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard" className="text-gray-400 hover:text-gray-600"><ArrowLeft size={20} /></Link>
          <div>
            <h1 className="font-extrabold text-lg" style={{ color: "#0f4c1e" }}>Gelombang PSB</h1>
            <p className="text-xs text-gray-400">Kelola jadwal penerimaan santri baru</p>
          </div>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: "#0f4c1e" }}>
          <Plus size={16} /> Tambah Gelombang
        </button>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {showForm && (
          <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6" style={{ borderColor: "#f0f0f0" }}>
            <h3 className="font-semibold mb-4" style={{ color: "#0f4c1e" }}>Tambah Gelombang Baru</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-gray-700 block mb-1">Nama Gelombang *</label>
                <input value={form.nama} onChange={e => setForm(p=>({...p,nama:e.target.value}))} placeholder="Gelombang 1 - 2026" className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" style={{ borderColor: "#e0e0e0" }} />
              </div>
              {[{key:"tanggal_buka",label:"Tanggal Buka"},{key:"tanggal_tutup",label:"Tanggal Tutup"}].map(({key,label})=>(
                <div key={key}>
                  <label className="text-sm font-medium text-gray-700 block mb-1">{label} *</label>
                  <input type="date" value={(form as Record<string, string>)[key]} onChange={e => setForm(p=>({...p,[key]:e.target.value}))} className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none" style={{ borderColor: "#e0e0e0" }} />
                </div>
              ))}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Kuota</label>
                <input type="number" value={form.kuota} onChange={e => setForm(p=>({...p,kuota:e.target.value}))} placeholder="Kosong = tidak terbatas" className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none" style={{ borderColor: "#e0e0e0" }} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Biaya Pendaftaran (Rp)</label>
                <input type="number" value={form.biaya_pendaftaran} onChange={e => setForm(p=>({...p,biaya_pendaftaran:e.target.value}))} placeholder="0 = Gratis" className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none" style={{ borderColor: "#e0e0e0" }} />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-gray-700 block mb-1">Keterangan</label>
                <input value={form.keterangan} onChange={e => setForm(p=>({...p,keterangan:e.target.value}))} placeholder="Info tambahan..." className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none" style={{ borderColor: "#e0e0e0" }} />
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <button onClick={save} disabled={saving} className="px-6 py-2.5 rounded-xl font-semibold text-sm text-white" style={{ background: "#0f4c1e" }}>{saving ? "Menyimpan..." : "Simpan"}</button>
              <button onClick={() => setShowForm(false)} className="px-6 py-2.5 rounded-xl font-semibold text-sm border" style={{ borderColor: "#e0e0e0" }}>Batal</button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {items.map(g => (
            <div key={g.id} className="bg-white rounded-2xl shadow-sm border p-5 flex items-center justify-between gap-4" style={{ borderColor: "#f0f0f0" }}>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold" style={{ color: "#0f4c1e" }}>{g.nama}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${g.is_aktif ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{g.is_aktif ? "Aktif" : "Nonaktif"}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Calendar size={13} />
                  <span>{new Date(g.tanggal_buka).toLocaleDateString("id-ID")} — {new Date(g.tanggal_tutup).toLocaleDateString("id-ID")}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggle(g.id, g.is_aktif)} className="text-gray-400 hover:text-green-600 transition-colors">
                  {g.is_aktif ? <ToggleRight size={24} style={{ color: "#0f4c1e" }} /> : <ToggleLeft size={24} />}
                </button>
              </div>
            </div>
          ))}
          {items.length === 0 && <div className="text-center py-12 text-gray-400">Belum ada gelombang pendaftaran.</div>}
        </div>
      </div>
    </div>
  );
}
