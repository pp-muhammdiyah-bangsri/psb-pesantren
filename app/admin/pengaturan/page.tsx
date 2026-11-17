"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft, Sliders } from "lucide-react";
import Link from "next/link";

export default function AdminPengaturan() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [config, setConfig] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const t = localStorage.getItem("psb_admin_token");
    if (!t) {
      router.push("/admin/login");
      return;
    }
    setToken(t);
    fetch("/api/config")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) setConfig(d.data || {});
      });
  }, [router]);

  const set = (key: string, val: string) => setConfig((prev) => ({ ...prev, [key]: val }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setMsg("");
    try {
      const res = await fetch("/api/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(config),
      });
      const d = await res.json();
      setMsg(d.ok ? "Pengaturan berhasil disimpan!" : d.error || "Gagal menyimpan.");
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    { key: "nama_pesantren", label: "Nama Pesantren", required: true },
    { key: "nama_singkat", label: "Nama Singkat" },
    { key: "navbar_sub", label: "Subjudul Navbar (di bawah logo)" },
    { key: "tagline", label: "Tagline / Moto" },
    { key: "hero_bg_url", label: "Hero: URL Foto Kartu Kanan (Utama / Depan)" },
    { key: "hero_foto_caption", label: "Hero: Keterangan Foto Kartu Kanan" },
    { key: "hero_bg_2_url", label: "Hero: URL Foto Kartu Kiri (Pendamping)" },
    { key: "hero_foto_caption_2", label: "Hero: Keterangan Foto Kartu Kiri (Opsional)" },
    { key: "alamat", label: "Alamat Pesantren" },
    { key: "no_wa_admin", label: "No WhatsApp Admin (format: 628xxx)", type: "tel" },
    { key: "maps_embed_url", label: "Link Embed Google Maps (URL / kode iframe)" },
    { key: "lokasi_badge", label: "Lokasi: Badge Atas" },
    { key: "lokasi_judul", label: "Lokasi: Judul Bagian" },
    { key: "lokasi_deskripsi", label: "Lokasi: Deskripsi / Penjelasan", type: "textarea" },
    { key: "jam_layanan", label: "Jam Pelayanan PSB" },
    { key: "syarat_ketentuan", label: "Syarat & Ketentuan Pendaftaran (1 poin per baris)", type: "textarea" },
    { key: "tahun_berdiri", label: "Tahun Berdiri" },
    { key: "jumlah_santri", label: "Jumlah Santri (tampilan)" },
    { key: "program_pendidikan", label: "Program Pendidikan (pisah koma)" },
  ];

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-200 px-4 sm:px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/dashboard"
              aria-label="Kembali ke Dashboard Admin"
              className="w-10 h-10 rounded-xl border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-colors"
            >
              <ArrowLeft size={18} aria-hidden="true" />
            </Link>
            <div>
              <h1 className="font-bold text-lg text-emerald-950">Pengaturan Cepat Web PSB</h1>
              <p className="text-xs text-stone-500">Edit cepat teks utama, foto hero, kontak, &amp; warna</p>
            </div>
          </div>
          <Link
            href="/admin/dashboard?tab=kustomisasi"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
          >
            <Sliders size={14} aria-hidden="true" />
            <span>Kustomisasi Lengkap</span>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <form
          onSubmit={save}
          className="bg-white rounded-2xl shadow-xs border border-stone-200 p-5 sm:p-7 space-y-5"
        >
          {msg && (
            <div
              role="status"
              className={`text-sm font-medium rounded-xl px-4 py-3 border ${
                msg.includes("berhasil")
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-red-50 text-red-700 border-red-200"
              }`}
            >
              {msg}
            </div>
          )}

          {fields.map(({ key, label, type, required }) => (
            <div key={key} className="flex flex-col gap-1.5">
              <label htmlFor={`cfg-${key}`} className="text-xs font-bold text-stone-700">
                {label} {required && <span className="text-red-500">*</span>}
              </label>
              {type === "textarea" ? (
                <textarea
                  id={`cfg-${key}`}
                  rows={key === "syarat_ketentuan" ? 6 : 3}
                  value={config[key] || ""}
                  onChange={(e) => set(key, e.target.value)}
                  className="border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 leading-relaxed"
                />
              ) : (
                <input
                  id={`cfg-${key}`}
                  type={type || "text"}
                  required={required}
                  value={config[key] || ""}
                  onChange={(e) => set(key, e.target.value)}
                  className="min-h-10 border border-stone-300 rounded-xl px-3.5 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              )}
            </div>
          ))}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-100">
            {[
              { key: "warna_primer", label: "Warna Primer", def: "#0f4c1e" },
              { key: "warna_aksen", label: "Warna Aksen (Emas)", def: "#c8a84b" },
            ].map(({ key, label, def }) => (
              <div key={key} className="flex flex-col gap-1.5">
                <label htmlFor={`cfg-${key}`} className="text-xs font-bold text-stone-700">
                  {label}
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    aria-label={label}
                    value={config[key] || def}
                    onChange={(e) => set(key, e.target.value)}
                    className="h-10 w-12 rounded-lg border border-stone-300 cursor-pointer shrink-0"
                  />
                  <input
                    id={`cfg-${key}`}
                    type="text"
                    value={config[key] || ""}
                    onChange={(e) => set(key, e.target.value)}
                    placeholder={def}
                    className="flex-1 min-h-10 border border-stone-300 rounded-xl px-3 py-2 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full min-h-11 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white transition-opacity hover:opacity-95 disabled:opacity-60 cursor-pointer"
            style={{ background: "linear-gradient(135deg, #0f4c1e, #1a6b2b)" }}
          >
            <Save size={16} aria-hidden="true" />
            <span>{saving ? "Menyimpan..." : "Simpan Pengaturan"}</span>
          </button>
        </form>
      </main>
    </div>
  );
}
