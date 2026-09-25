"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft, Settings } from "lucide-react";
import Link from "next/link";

export default function AdminPengaturan() {
  const router = useRouter();
  const [config, setConfig] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("psb_admin_token") : null;

  useEffect(() => {
    if (!token) { router.push("/admin/login"); return; }
    fetch("/api/config").then(r => r.json()).then(d => { if (d.ok) setConfig(d.data); });
  }, [token, router]);

  const set = (key: string, val: string) => setConfig(prev => ({ ...prev, [key]: val }));

  const save = async () => {
    setSaving(true); setMsg("");
    try {
      const res = await fetch("/api/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(config),
      });
      const d = await res.json();
      setMsg(d.ok ? "Pengaturan berhasil disimpan!" : d.error);
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    { key: "nama_pesantren", label: "Nama Pesantren", required: true },
    { key: "nama_singkat", label: "Nama Singkat" },
    { key: "tagline", label: "Tagline / Moto" },
    { key: "alamat", label: "Alamat Pesantren" },
    { key: "no_wa_admin", label: "No WhatsApp Admin (format: 628xxx)", type: "tel" },
    { key: "maps_embed_url", label: "Link Embed Google Maps (URL / kode iframe)" },
    { key: "syarat_ketentuan", label: "Syarat & Ketentuan Pendaftaran (1 poin per baris)", type: "textarea" },
    { key: "tahun_berdiri", label: "Tahun Berdiri" },
    { key: "jumlah_santri", label: "Jumlah Santri (tampilan)" },
    { key: "program_pendidikan", label: "Program Pendidikan (pisah koma)" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4 flex items-center gap-4" style={{ borderColor: "#e0e0e0" }}>
        <Link href="/admin/dashboard" className="text-gray-400 hover:text-gray-600"><ArrowLeft size={20} /></Link>
        <div>
          <h1 className="font-extrabold text-lg" style={{ color: "#0f4c1e" }}>Pengaturan Web PSB</h1>
          <p className="text-xs text-gray-400">Sesuaikan tampilan web untuk pesantren Anda</p>
        </div>
      </header>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-4" style={{ borderColor: "#f0f0f0" }}>
          {msg && <div className={`text-sm rounded-xl px-4 py-3 ${msg.includes("berhasil") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-600 border border-red-200"}`}>{msg}</div>}
          {fields.map(({ key, label, type, required }) => (
            <div key={key} className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">{label} {required && <span className="text-red-500">*</span>}</label>
              {type === "textarea" ? (
                <textarea
                  rows={6}
                  value={config[key] || ""}
                  onChange={e => set(key, e.target.value)}
                  placeholder="Tuliskan poin-poin syarat dan ketentuan pendaftaran..."
                  className="border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 font-mono leading-relaxed"
                  style={{ borderColor: "#e0e0e0" }}
                />
              ) : (
                <input
                  type={type || "text"}
                  value={config[key] || ""}
                  onChange={e => set(key, e.target.value)}
                  className="border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  style={{ borderColor: "#e0e0e0" }}
                />
              )}
            </div>
          ))}
          <div className="grid grid-cols-2 gap-4">
            {[{key:"warna_primer", label:"Warna Primer"},{key:"warna_aksen", label:"Warna Aksen (Emas)"}].map(({key, label}) => (
              <div key={key} className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">{label}</label>
                <div className="flex gap-2 items-center">
                  <input type="color" value={config[key] || "#0f4c1e"} onChange={e => set(key, e.target.value)} className="h-10 w-12 rounded-lg border cursor-pointer" style={{ borderColor: "#e0e0e0" }} />
                  <input type="text" value={config[key] || ""} onChange={e => set(key, e.target.value)} placeholder="#0f4c1e" className="flex-1 border rounded-xl px-3 py-2 text-sm focus:outline-none" style={{ borderColor: "#e0e0e0" }} />
                </div>
              </div>
            ))}
          </div>
          <button onClick={save} disabled={saving} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white transition-all hover:opacity-90 disabled:opacity-60" style={{ background: "linear-gradient(135deg, #0f4c1e, #1a6b2b)" }}>
            <Save size={16} /> {saving ? "Menyimpan..." : "Simpan Pengaturan"}
          </button>
        </div>
      </div>
    </div>
  );
}
