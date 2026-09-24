"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Users, CheckCircle, XCircle, Clock, Download,
  Search, Filter, LogOut, Eye, X, ChevronDown
} from "lucide-react";

interface Pendaftar {
  id: number;
  nomor_registrasi: string;
  nama_lengkap: string;
  jenis_kelamin: string;
  no_hp_wali: string;
  asal_sekolah: string;
  status: "menunggu" | "diterima" | "ditolak";
  created_at: string;
  gelombang_psb?: { nama: string };
}

const STATUS_COLOR = {
  menunggu: { bg: "#fef9c3", text: "#a16207", label: "Menunggu" },
  diterima: { bg: "#dcfce7", text: "#15803d", label: "Diterima" },
  ditolak: { bg: "#fee2e2", text: "#b91c1c", label: "Ditolak" },
};

export default function AdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState<Pendaftar[]>([]);
  const [filter, setFilter] = useState("semua");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Pendaftar | null>(null);
  const [updating, setUpdating] = useState(false);
  const [catatan, setCatatan] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("psb_admin_token") : null;
  const nama = typeof window !== "undefined" ? localStorage.getItem("psb_admin_nama") : "";

  const fetchData = useCallback(async () => {
    if (!token) { router.push("/admin/login"); return; }
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== "semua") params.set("status", filter);
      const res = await fetch(`/api/admin/pendaftar?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      const d = await res.json();
      if (!d.ok) { router.push("/admin/login"); return; }
      setData(d.data);
    } finally {
      setLoading(false);
    }
  }, [token, filter, router]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const logout = () => { localStorage.removeItem("psb_admin_token"); router.push("/admin/login"); };

  const updateStatus = async (id: number, status: string) => {
    if (!token) return;
    setUpdating(true);
    try {
      await fetch("/api/admin/pendaftar", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id, status, catatan_admin: catatan }),
      });
      await fetchData();
      setSelected(null);
    } finally {
      setUpdating(false);
    }
  };

  const exportCSV = () => {
    const headers = ["No Registrasi","Nama","JK","HP Wali","Asal Sekolah","Status","Tanggal Daftar"];
    const rows = data.map(d => [
      d.nomor_registrasi, d.nama_lengkap, d.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan",
      d.no_hp_wali, d.asal_sekolah, d.status,
      new Date(d.created_at).toLocaleDateString("id-ID")
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c || ""}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `pendaftar_psb_${Date.now()}.csv`; a.click();
  };

  const filtered = data.filter(d =>
    d.nama_lengkap.toLowerCase().includes(search.toLowerCase()) ||
    d.nomor_registrasi?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: data.length,
    menunggu: data.filter(d => d.status === "menunggu").length,
    diterima: data.filter(d => d.status === "diterima").length,
    ditolak: data.filter(d => d.status === "ditolak").length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between" style={{ borderColor: "#e0e0e0" }}>
        <div>
          <h1 className="font-extrabold text-lg" style={{ color: "#0f4c1e" }}>Admin PSB</h1>
          <p className="text-xs text-gray-400">Selamat datang, {nama}</p>
        </div>
        <button onClick={logout} className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 transition-colors">
          <LogOut size={16} /> Keluar
        </button>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Pendaftar", value: stats.total, icon: Users, color: "#0f4c1e", bg: "#dcfce7" },
            { label: "Menunggu", value: stats.menunggu, icon: Clock, color: "#a16207", bg: "#fef9c3" },
            { label: "Diterima", value: stats.diterima, icon: CheckCircle, color: "#15803d", bg: "#bbf7d0" },
            { label: "Ditolak", value: stats.ditolak, icon: XCircle, color: "#b91c1c", bg: "#fecaca" },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white rounded-2xl p-4 shadow-sm border flex items-center gap-3" style={{ borderColor: "#f0f0f0" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                <Icon size={20} style={{ color }} />
              </div>
              <div>
                <p className="text-2xl font-extrabold leading-tight" style={{ color }}>{value}</p>
                <p className="text-xs text-gray-400">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-2xl shadow-sm border p-4 mb-4 flex flex-col sm:flex-row gap-3" style={{ borderColor: "#f0f0f0" }}>
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Cari nama atau nomor registrasi..."
              className="w-full border rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              style={{ borderColor: "#e0e0e0" }}
            />
          </div>
          <div className="flex gap-2">
            {["semua","menunggu","diterima","ditolak"].map(s => (
              <button key={s} onClick={() => setFilter(s)}
                className="px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-all"
                style={{
                  background: filter === s ? "#0f4c1e" : "#f5f5f5",
                  color: filter === s ? "white" : "#555",
                }}
              >
                {s}
              </button>
            ))}
          </div>
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: "#0f4c1e" }}>
            <Download size={15} /> Export CSV
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden" style={{ borderColor: "#f0f0f0" }}>
          {loading ? (
            <div className="p-12 text-center text-gray-400">Memuat data...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-gray-400">Tidak ada data pendaftar.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "#f8faf9", borderBottom: "1px solid #e0e0e0" }}>
                    {["No Registrasi","Nama","JK","Asal Sekolah","Status","Tgl Daftar","Aksi"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, idx) => (
                    <tr key={p.id} className="border-t hover:bg-gray-50 transition-colors" style={{ borderColor: "#f0f0f0" }}>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.nomor_registrasi}</td>
                      <td className="px-4 py-3 font-semibold text-gray-800">{p.nama_lengkap}</td>
                      <td className="px-4 py-3 text-gray-500">{p.jenis_kelamin === "L" ? "L" : "P"}</td>
                      <td className="px-4 py-3 text-gray-500 max-w-[150px] truncate">{p.asal_sekolah || "-"}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 rounded-full text-xs font-semibold" style={{ background: STATUS_COLOR[p.status].bg, color: STATUS_COLOR[p.status].text }}>
                          {STATUS_COLOR[p.status].label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{new Date(p.created_at).toLocaleDateString("id-ID")}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => { setSelected(p); setCatatan(""); }} className="text-green-700 hover:text-green-900 p-1 rounded-lg hover:bg-green-50 transition-colors">
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "#e0e0e0" }}>
              <h3 className="font-bold" style={{ color: "#0f4c1e" }}>Detail Pendaftar</h3>
              <button onClick={() => setSelected(null)}><X size={20} className="text-gray-400" /></button>
            </div>
            <div className="p-6 space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-400">No Registrasi</span><span className="font-mono font-semibold">{selected.nomor_registrasi}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Nama</span><span className="font-semibold">{selected.nama_lengkap}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">HP Wali</span><span>{selected.no_hp_wali}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Asal Sekolah</span><span>{selected.asal_sekolah || "-"}</span></div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Status</span>
                <span className="px-2 py-1 rounded-full text-xs font-semibold" style={{ background: STATUS_COLOR[selected.status].bg, color: STATUS_COLOR[selected.status].text }}>
                  {STATUS_COLOR[selected.status].label}
                </span>
              </div>
              <div>
                <label className="text-gray-400 text-xs block mb-1">Catatan Admin</label>
                <textarea value={catatan} onChange={e => setCatatan(e.target.value)} rows={2}
                  className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  style={{ borderColor: "#e0e0e0" }}
                  placeholder="Tambahkan catatan..." />
              </div>
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button onClick={() => updateStatus(selected.id, "diterima")} disabled={updating}
                className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #15803d, #16a34a)" }}>
                ✓ Terima
              </button>
              <button onClick={() => updateStatus(selected.id, "ditolak")} disabled={updating}
                className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #b91c1c, #dc2626)" }}>
                ✗ Tolak
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
