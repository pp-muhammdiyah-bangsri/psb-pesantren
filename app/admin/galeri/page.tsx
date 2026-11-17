"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, Trash2, ImageOff } from "lucide-react";
import { parseMediaUrl } from "@/lib/mediaUtils";
import Link from "next/link";

interface GaleriItem {
  id: number;
  judul: string | null;
  foto_url: string;
  urutan: number;
}

export default function AdminGaleri() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [items, setItems] = useState<GaleriItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [judul, setJudul] = useState("");
  const [failedIds, setFailedIds] = useState<Record<number, boolean>>({});
  const [statusMsg, setStatusMsg] = useState("");

  const fetchGaleri = useCallback(async () => {
    const res = await fetch("/api/galeri");
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
    fetchGaleri();
  }, [router, fetchGaleri]);

  const uploadGaleri = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length || !token) return;
    setUploading(true);
    setStatusMsg("");
    try {
      let successCount = 0;
      for (const file of files) {
        const form = new FormData();
        form.append("file", file);
        form.append("folder", "galeri");
        const uploadRes = await fetch("/api/psb/upload", { method: "POST", body: form });
        const uploadData = await uploadRes.json();
        if (!uploadData.ok) continue;
        const saveRes = await fetch("/api/admin/galeri", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            foto_url: uploadData.url,
            judul: judul || null,
            urutan: items.length + successCount + 1,
          }),
        });
        const saveData = await saveRes.json();
        if (saveData.ok) successCount++;
      }
      setJudul("");
      setStatusMsg(
        successCount > 0
          ? `${successCount} foto berhasil diunggah ke galeri.`
          : "Gagal mengunggah foto. Pastikan ukuran <= 1MB per file."
      );
      await fetchGaleri();
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const deleteItem = async (id: number) => {
    if (!token || !confirm("Hapus foto ini?")) return;
    await fetch(`/api/admin/galeri?id=${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setStatusMsg("Foto berhasil dihapus dari galeri.");
    await fetchGaleri();
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-200 px-4 sm:px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-3.5">
          <Link
            href="/admin/dashboard?tab=galeri"
            aria-label="Kembali ke Dashboard Admin"
            className="w-10 h-10 rounded-xl border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-colors"
          >
            <ArrowLeft size={18} aria-hidden="true" />
          </Link>
          <div>
            <h1 className="font-bold text-lg text-emerald-950">Kelola Galeri Cepat</h1>
            <p className="text-xs text-stone-500">{items.length} foto tersimpan</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {statusMsg && (
          <div
            role="status"
            className={`text-sm font-medium rounded-xl px-4 py-3 border ${
              statusMsg.includes("berhasil")
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-red-50 text-red-700 border-red-200"
            }`}
          >
            {statusMsg}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xs border border-stone-200 p-5 sm:p-6 space-y-4">
          <h2 className="font-bold text-stone-900">Upload Foto Baru</h2>
          <div>
            <label htmlFor="galeri-judul-cepat" className="block text-xs font-bold text-stone-700 mb-1.5">
              Judul Foto (Opsional)
            </label>
            <input
              id="galeri-judul-cepat"
              type="text"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              placeholder="Contoh: Kegiatan Mengaji Santri"
              className="w-full min-h-10 border border-stone-300 rounded-xl px-3.5 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <label className="border-2 border-dashed border-stone-300 rounded-xl p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-emerald-600 hover:bg-emerald-50/40 transition-colors text-center">
            <Upload
              size={24}
              className={uploading ? "text-emerald-600 animate-bounce" : "text-stone-400"}
              aria-hidden="true"
            />
            <span className="text-sm font-medium text-stone-700">
              {uploading ? "Sedang mengunggah..." : "Klik untuk memilih foto dari perangkat (bisa multiple, maks 1MB)"}
            </span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={uploadGaleri}
              disabled={uploading}
            />
          </label>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-12 text-stone-500 bg-white rounded-2xl border border-stone-200">
            Belum ada foto di galeri.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="relative rounded-2xl overflow-hidden border border-stone-200 bg-white shadow-xs aspect-[4/3] group"
              >
                {!failedIds[item.id] ? (
                  <img
                    src={parseMediaUrl(item.foto_url).thumbnailUrl}
                    alt={item.judul || "Foto galeri"}
                    referrerPolicy="no-referrer"
                    onError={() => setFailedIds((p) => ({ ...p, [item.id]: true }))}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-stone-100 text-stone-400 p-3">
                    <ImageOff size={22} aria-hidden="true" />
                    <span className="text-[11px] mt-1 text-center">Gagal memuat</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => deleteItem(item.id)}
                  aria-label={`Hapus ${item.judul || "foto ini"}`}
                  className="absolute top-2 right-2 w-9 h-9 rounded-full bg-red-600/90 hover:bg-red-700 text-white flex items-center justify-center shadow-md cursor-pointer transition-colors"
                >
                  <Trash2 size={15} aria-hidden="true" />
                </button>
                {item.judul && (
                  <p className="absolute bottom-0 inset-x-0 bg-black/65 text-white text-xs font-medium px-2.5 py-1.5 truncate">
                    {item.judul}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
