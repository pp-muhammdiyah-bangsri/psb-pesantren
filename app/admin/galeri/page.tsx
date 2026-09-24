"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, Trash2, Plus } from "lucide-react";
import { parseMediaUrl } from "@/lib/mediaUtils";
import Link from "next/link";

interface GaleriItem { id: number; judul: string | null; foto_url: string; urutan: number; }

export default function AdminGaleri() {
  const router = useRouter();
  const [items, setItems] = useState<GaleriItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [judul, setJudul] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("psb_admin_token") : null;

  const fetchGaleri = useCallback(async () => {
    const res = await fetch("/api/galeri");
    const d = await res.json();
    if (d.ok) setItems(d.data);
  }, []);

  useEffect(() => {
    if (!token) { router.push("/admin/login"); return; }
    fetchGaleri();
  }, [token, router, fetchGaleri]);

  const uploadGaleri = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length || !token) return;
    setUploading(true);
    try {
      for (const file of files) {
        const form = new FormData();
        form.append("file", file); form.append("folder", "galeri");
        const uploadRes = await fetch("/api/psb/upload", { method: "POST", body: form });
        const uploadData = await uploadRes.json();
        if (!uploadData.ok) continue;
        await fetch("/api/admin/galeri", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ foto_url: uploadData.url, judul: judul || null, urutan: items.length }),
        });
      }
      setJudul(""); await fetchGaleri();
    } finally {
      setUploading(false);
    }
  };

  const deleteItem = async (id: number) => {
    if (!token || !confirm("Hapus foto ini?")) return;
    await fetch(`/api/admin/galeri?id=${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    await fetchGaleri();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4 flex items-center gap-4" style={{ borderColor: "#e0e0e0" }}>
        <Link href="/admin/dashboard" className="text-gray-400 hover:text-gray-600"><ArrowLeft size={20} /></Link>
        <div>
          <h1 className="font-extrabold text-lg" style={{ color: "#0f4c1e" }}>Kelola Galeri</h1>
          <p className="text-xs text-gray-400">{items.length} foto tersimpan</p>
        </div>
      </header>
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Upload */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6" style={{ borderColor: "#f0f0f0" }}>
          <h3 className="font-semibold text-gray-700 mb-4">Tambah Foto</h3>
          <div className="flex gap-3 mb-4">
            <input type="text" value={judul} onChange={e => setJudul(e.target.value)} placeholder="Judul foto (opsional)" className="flex-1 border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" style={{ borderColor: "#e0e0e0" }} />
          </div>
          <label className="border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-green-400 transition-colors" style={{ borderColor: "#e0e0e0" }}>
            <Upload size={24} className={uploading ? "text-green-500 animate-bounce" : "text-gray-400"} />
            <span className="text-sm text-gray-500">{uploading ? "Mengunggah..." : "Klik untuk pilih foto (bisa multiple)"}</span>
            <input type="file" accept="image/*" multiple className="hidden" onChange={uploadGaleri} disabled={uploading} />
          </label>
        </div>

        {/* Grid */}
        {items.length === 0 ? (
          <div className="text-center py-12 text-gray-400">Belum ada foto di galeri.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map(item => (
              <div key={item.id} className="relative rounded-xl overflow-hidden group aspect-[4/3]">
                <img src={parseMediaUrl(item.foto_url).thumbnailUrl} alt={item.judul || ""} referrerPolicy="no-referrer" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/400x300/e2e8f0/64748b?text=Galeri"; }} />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <button onClick={() => deleteItem(item.id)} className="opacity-0 group-hover:opacity-100 bg-red-600 text-white p-2 rounded-full transition-all hover:scale-110">
                    <Trash2 size={16} />
                  </button>
                </div>
                {item.judul && <p className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2 truncate">{item.judul}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
