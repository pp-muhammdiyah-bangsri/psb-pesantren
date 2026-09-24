"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, X, BookOpen } from "lucide-react";

interface NavbarProps {
  config: Record<string, string>;
}

export default function Navbar({ config }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const nama = config.nama_pesantren || "Pesantren";
  const namaSingkat = config.nama_singkat || "Ponpes";
  const primary = config.warna_primer || "#0f4c1e";
  const accent = config.warna_aksen || "#c8a84b";

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50"
      style={{ background: `${primary}f0`, backdropFilter: "blur(12px)", borderBottom: `1px solid ${accent}40` }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo + Nama */}
          <Link href="/" className="flex items-center gap-3 group">
            {config.logo_url ? (
              <img src={config.logo_url} alt="Logo" className="h-10 w-10 rounded-full object-cover" />
            ) : (
              <div
                className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}
              >
                <BookOpen size={20} style={{ color: primary }} />
              </div>
            )}
            <div className="hidden sm:block">
              <p className="text-white font-bold text-sm leading-tight">{namaSingkat}</p>
              <p className="text-xs leading-tight" style={{ color: accent }}>
                Pendaftaran Online
              </p>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/#gelombang" className="text-white/80 hover:text-white text-sm font-medium transition-colors">
              Gelombang PSB
            </Link>
            <Link href="/#galeri" className="text-white/80 hover:text-white text-sm font-medium transition-colors">
              Galeri
            </Link>
            <Link href="/#tentang" className="text-white/80 hover:text-white text-sm font-medium transition-colors">
              Tentang Kami
            </Link>
            <Link
              href="/daftar"
              className="px-5 py-2 rounded-full font-semibold text-sm transition-all hover:opacity-90 hover:scale-105"
              style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)`, color: primary }}
            >
              Daftar Sekarang
            </Link>
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setOpen(!open)} className="md:hidden text-white p-2">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden px-4 pb-4 space-y-2" style={{ background: primary }}>
          <Link href="/#gelombang" onClick={() => setOpen(false)} className="block text-white/80 py-2 text-sm">
            Gelombang PSB
          </Link>
          <Link href="/#galeri" onClick={() => setOpen(false)} className="block text-white/80 py-2 text-sm">
            Galeri
          </Link>
          <Link href="/#tentang" onClick={() => setOpen(false)} className="block text-white/80 py-2 text-sm">
            Tentang Kami
          </Link>
          <Link
            href="/daftar"
            onClick={() => setOpen(false)}
            className="block text-center py-2 rounded-full font-semibold text-sm mt-2"
            style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)`, color: primary }}
          >
            Daftar Sekarang
          </Link>
        </div>
      )}
    </nav>
  );
}
