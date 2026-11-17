"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, X, BookOpen, ArrowUpRight } from "lucide-react";
import { toDirectImageUrl } from "@/lib/mediaUtils";
import { buildPsbTheme } from "@/lib/themeUtils";

interface NavbarProps {
  config: Record<string, string>;
}

const NAV_LINKS = [
  { href: "/#tentang", label: "Profil" },
  { href: "/#program", label: "Program" },
  { href: "/#pengajar", label: "Asatidz" },
  { href: "/#gelombang", label: "Jadwal PSB" },
  { href: "/#galeri", label: "Galeri" },
  { href: "/#lokasi", label: "Lokasi" },
];

export default function Navbar({ config }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const theme = buildPsbTheme(config);
  const namaSingkat = config.nama_singkat || config.nama_pesantren || "Pesantren";
  const logoSrc = config.logo_url && !logoError ? toDirectImageUrl(config.logo_url) : null;

  return (
    <header className="sticky top-0 z-40 border-b border-black/10" style={{ backgroundColor: theme.primaryDark }}>
      <nav aria-label="Utama" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-[72px]">
          <Link href="/" className="flex items-center gap-3 min-w-0 group">
            {logoSrc ? (
              <img
                src={logoSrc}
                alt={`Logo ${namaSingkat}`}
                width={40}
                height={40}
                referrerPolicy="no-referrer"
                onError={() => setLogoError(true)}
                className="h-10 w-10 rounded-full object-cover bg-white/10 ring-1 ring-white/20 shrink-0"
              />
            ) : (
              <div
                className="h-10 w-10 rounded-full flex items-center justify-center shrink-0 ring-1 ring-white/20"
                style={{ backgroundColor: theme.accent, color: theme.onAccent }}
              >
                <BookOpen size={18} aria-hidden="true" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-white font-bold text-sm sm:text-base leading-tight truncate">
                {namaSingkat}
              </p>
              <p className="text-xs leading-tight truncate" style={{ color: theme.accentLight }}>
                {config.navbar_sub || "Penerimaan Santri Baru"}
              </p>
            </div>
          </Link>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-7">
            <ul className="flex items-center gap-6">
              {NAV_LINKS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm font-medium text-white/85 hover:text-white transition-colors py-1"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/daftar"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full font-bold text-sm transition-transform duration-200 hover:-translate-y-0.5 shadow-sm"
              style={{ backgroundColor: theme.accent, color: theme.onAccent }}
            >
              <span>Daftar Sekarang</span>
              <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          </div>

          {/* Mobile Quick Daftar CTA + Menu Toggle */}
          <div className="flex items-center gap-1.5 lg:hidden shrink-0">
            <Link
              href="/daftar"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full font-bold text-xs shadow-sm transition-transform active:scale-95"
              style={{ backgroundColor: theme.accent, color: theme.onAccent }}
            >
              <span>Daftar</span>
              <ArrowUpRight size={13} aria-hidden="true" />
            </Link>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? "Tutup menu navigasi" : "Buka menu navigasi"}
              className="inline-flex items-center justify-center min-w-10 min-h-10 rounded-xl text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              {open ? <X size={21} aria-hidden="true" /> : <Menu size={21} aria-hidden="true" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {open && (
          <div
            id="mobile-nav"
            className="lg:hidden pb-5 pt-2 border-t border-white/10 space-y-1"
          >
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="block px-3 py-2.5 rounded-xl text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </nav>
    </header>
  );
}
