"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, User, BookOpen, Eye, EyeOff, ArrowLeft } from "lucide-react";

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error || "Username atau password tidak sesuai.");
        return;
      }
      localStorage.setItem("psb_admin_token", data.token);
      localStorage.setItem("psb_admin_nama", data.nama);
      router.push("/admin/dashboard");
    } catch {
      setError("Gagal terhubung ke server. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4 py-10"
      style={{ background: "linear-gradient(160deg, #0b3917 0%, #061f0d 100%)" }}
    >
      <div className="w-full max-w-md space-y-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-white/85 hover:text-white transition-colors px-2 py-1 rounded-lg"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          <span>Kembali ke Halaman Utama PSB</span>
        </Link>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/10">
          <div
            className="px-8 py-7 text-center"
            style={{ background: "linear-gradient(135deg, #0f4c1e, #1a6b2b)" }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3.5"
              style={{
                background: "rgba(200,168,75,0.18)",
                border: "1.5px solid #e0c36c",
              }}
            >
              <BookOpen size={26} style={{ color: "#f3dc8a" }} aria-hidden="true" />
            </div>
            <h1 className="font-display text-white font-bold text-2xl tracking-tight">
              Portal Admin PSB
            </h1>
            <p className="text-white/85 text-sm mt-1">
              Masuk untuk mengelola pendaftaran &amp; konten website
            </p>
          </div>

          <form onSubmit={login} className="p-6 sm:p-8 space-y-5">
            {error && (
              <div
                role="alert"
                className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium rounded-xl px-4 py-3"
              >
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label
                htmlFor="admin-username"
                className="block text-xs font-bold text-stone-700"
              >
                Username
              </label>
              <div className="relative">
                <User
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  id="admin-username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  enterKeyHint="next"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username admin"
                  required
                  className="w-full min-h-11 border border-stone-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="admin-password"
                className="block text-xs font-bold text-stone-700"
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  id="admin-password"
                  name="password"
                  type={showPass ? "text" : "password"}
                  autoComplete="current-password"
                  enterKeyHint="done"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  required
                  className="w-full min-h-11 border border-stone-300 rounded-xl pl-10 pr-12 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  aria-label={showPass ? "Sembunyikan password" : "Tampilkan password"}
                  aria-pressed={showPass}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg flex items-center justify-center text-stone-500 hover:text-stone-800 hover:bg-stone-100 cursor-pointer"
                >
                  {showPass ? (
                    <EyeOff size={16} aria-hidden="true" />
                  ) : (
                    <Eye size={16} aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-11 py-3 rounded-xl font-bold text-sm text-white shadow-sm transition-opacity hover:opacity-95 disabled:opacity-60 cursor-pointer"
              style={{ background: "linear-gradient(135deg, #0f4c1e, #1a6b2b)" }}
            >
              {loading ? "Memverifikasi..." : "Masuk ke Dashboard"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
