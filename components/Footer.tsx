"use client";
import { useState } from "react";
import Link from "next/link";
import { BookOpen, MapPin, Phone, Mail, Heart } from "lucide-react";
import { toDirectImageUrl } from "@/lib/mediaUtils";
import { buildPsbTheme, formatPhoneDisplay } from "@/lib/themeUtils";

interface FooterProps {
  config: Record<string, string>;
}

export default function Footer({ config }: FooterProps) {
  const [logoError, setLogoError] = useState(false);
  const theme = buildPsbTheme(config);
  const nama = config.nama_pesantren || "Pesantren";
  const logoSrc = config.logo_url && !logoError ? toDirectImageUrl(config.logo_url) : null;

  return (
    <footer
      id="footer"
      className="text-white border-t border-white/10"
      style={{ backgroundColor: theme.primaryDark }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-14">
        <div className="grid md:grid-cols-12 gap-8 pb-10 text-center md:text-left">
          {/* Brand */}
          <div className="md:col-span-5 flex flex-col items-center md:items-start space-y-4">
            <div className="flex items-center gap-3">
              {logoSrc ? (
                <img
                  src={logoSrc}
                  alt={`Logo ${nama}`}
                  width={40}
                  height={40}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={() => setLogoError(true)}
                  className="h-10 w-10 rounded-full object-cover bg-white/10 ring-1 ring-white/20 shrink-0"
                />
              ) : (
                <div
                  className="h-10 w-10 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${theme.accent}25`, border: `1px solid ${theme.accent}60` }}
                >
                  <BookOpen size={19} style={{ color: theme.accentLight }} aria-hidden="true" />
                </div>
              )}
              <h3 className="text-white font-bold text-base leading-snug">{nama}</h3>
            </div>
            {config.tagline && (
              <p className="text-white/75 text-sm leading-relaxed max-w-md">{config.tagline}</p>
            )}
          </div>

          {/* Kontak */}
          <div className="md:col-span-4 space-y-3.5">
            <h4 className="font-bold text-xs uppercase tracking-widest" style={{ color: theme.accentLight }}>
              Sekretariat &amp; Kontak
            </h4>
            <div className="space-y-2.5 text-sm text-white/80">
              {config.alamat && (
                <div className="flex justify-center md:justify-start gap-2.5">
                  <MapPin size={15} className="mt-0.5 shrink-0" style={{ color: theme.accentLight }} aria-hidden="true" />
                  <span>{config.alamat}</span>
                </div>
              )}
              {config.no_wa_admin && (
                <div className="flex items-center justify-center md:justify-start gap-2.5">
                  <Phone size={15} className="shrink-0" style={{ color: theme.accentLight }} aria-hidden="true" />
                  <span className="tabular-nums">{formatPhoneDisplay(config.no_wa_admin)}</span>
                </div>
              )}
              {config.email && (
                <div className="flex items-center justify-center md:justify-start gap-2.5">
                  <Mail size={15} className="shrink-0" style={{ color: theme.accentLight }} aria-hidden="true" />
                  <span>{config.email}</span>
                </div>
              )}
            </div>
          </div>

          {/* Tautan */}
          <div className="md:col-span-3 space-y-3.5">
            <h4 className="font-bold text-xs uppercase tracking-widest" style={{ color: theme.accentLight }}>
              Navigasi PSB
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/daftar" className="text-white/80 hover:text-white transition-colors">
                  Formulir Pendaftaran
                </Link>
              </li>
              <li>
                <Link href="/#gelombang" className="text-white/80 hover:text-white transition-colors">
                  Gelombang PSB
                </Link>
              </li>
              <li>
                <Link href="/#program" className="text-white/80 hover:text-white transition-colors">
                  Program Unggulan
                </Link>
              </li>
              <li>
                <Link href="/#galeri" className="text-white/80 hover:text-white transition-colors">
                  Galeri Pesantren
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="text-white/65 hover:text-white transition-colors">
                  Portal Admin
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/15 pt-6 pb-14 sm:pb-2 lg:pr-44 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/70">
          <p>{config.footer_hak_cipta || `© ${new Date().getFullYear()} ${nama}. Hak cipta dilindungi.`}</p>
          <p className="inline-flex items-center gap-1.5">
            Dibuat dengan <Heart size={11} className="fill-current text-amber-300" aria-hidden="true" /> menggunakan SIMPLE Pesantren
          </p>
        </div>
      </div>
    </footer>
  );
}
