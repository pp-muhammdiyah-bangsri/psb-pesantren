"use client";
import Link from "next/link";
import { AlertCircle, RefreshCw, Home } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center shadow-xl border border-gray-100">
        <div className="w-20 h-20 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={40} />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Terjadi Sedikit Kendala</h2>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          {error.message || "Halaman mengalami kesalahan saat memproses data. Silakan coba lagi."}
        </p>
        <div className="space-y-3">
          <button
            onClick={() => reset()}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm bg-green-700 text-white hover:bg-green-800 transition-colors shadow-md cursor-pointer"
          >
            <RefreshCw size={16} /> Coba Lagi
          </button>
          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Home size={16} /> Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
