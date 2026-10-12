import Link from "next/link";
import { ArrowLeft, Home, HelpCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center shadow-xl border border-gray-100">
        <div className="w-20 h-20 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
          <HelpCircle size={40} />
        </div>
        <h1 className="text-4xl font-black text-gray-900 mb-2">404</h1>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Halaman Tidak Ditemukan</h2>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          Halaman yang Anda tuju tidak ditemukan atau alamat URL mungkin salah.
        </p>
        <div className="space-y-3">
          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm bg-green-700 text-white hover:bg-green-800 transition-colors shadow-md"
          >
            <Home size={16} /> Kembali ke Beranda
          </Link>
          <Link
            href="/daftar"
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={16} /> Buka Formulir Pendaftaran
          </Link>
        </div>
      </div>
    </div>
  );
}
