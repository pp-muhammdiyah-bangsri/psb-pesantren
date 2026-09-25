"use client";
import Link from "next/link";
import { BookOpen, MapPin, Phone, Mail, Heart } from "lucide-react";
import { toDirectImageUrl } from "@/lib/mediaUtils";

interface FooterProps {
  config: Record<string, string>;
}

export default function Footer({ config }: FooterProps) {
  const primary = config.warna_primer || "#0f4c1e";
  const accent = config.warna_aksen || "#c8a84b";
  const nama = config.nama_pesantren || "Pesantren";

  return (
    <footer id="footer" style={{ background: primary, borderTop: `1px solid ${accent}30` }}>
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              {config.logo_url ? (
                <img src={toDirectImageUrl(config.logo_url)} alt="Logo" referrerPolicy="no-referrer" className="h-10 w-10 rounded-full object-cover bg-white/10" onError={(e) => { (e.target as HTMLElement).style.display = "none"; }} />
              ) : (
                <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ background: `${accent}20`, border: `1px solid ${accent}50` }}>
                  <BookOpen size={20} style={{ color: accent }} />
                </div>
              )}
              <h3 className="text-white font-bold text-sm">{nama}</h3>
            </div>
            <p className="text-white/50 text-sm leading-relaxed">{config.tagline}</p>
          </div>

          {/* Kontak */}
          <div>
            <h4 className="font-semibold mb-4" style={{ color: accent }}>Kontak</h4>
            <div className="space-y-2 text-sm text-white/60">
              {config.alamat && (
                <div className="flex gap-2"><MapPin size={14} className="mt-0.5 shrink-0" style={{ color: accent }} /><span>{config.alamat}</span></div>
              )}
              {config.no_wa_admin && (
                <div className="flex gap-2"><Phone size={14} style={{ color: accent }} /><span>{config.no_wa_admin}</span></div>
              )}
              {config.email && (
                <div className="flex gap-2"><Mail size={14} style={{ color: accent }} /><span>{config.email}</span></div>
              )}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4" style={{ color: accent }}>Pendaftaran</h4>
            <div className="space-y-2">
              <Link href="/daftar" className="block text-sm text-white/60 hover:text-white transition-colors">Form Pendaftaran</Link>
              <Link href="/#gelombang" className="block text-sm text-white/60 hover:text-white transition-colors">Gelombang PSB</Link>
              <Link href="/#program" className="block text-sm text-white/60 hover:text-white transition-colors">Program Unggulan</Link>
              <Link href="/#galeri" className="block text-sm text-white/60 hover:text-white transition-colors">Galeri Pesantren</Link>
              <Link href="/admin/login" className="block text-sm text-white/30 hover:text-white/60 transition-colors">Admin Panel</Link>
            </div>
          </div>
        </div>

        <div className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-2" style={{ borderColor: `${accent}20` }}>
          <p className="text-white/30 text-xs">© {new Date().getFullYear()} {nama}. Hak cipta dilindungi.</p>
          <p className="text-white/20 text-xs flex items-center gap-1">
            Dibuat dengan <Heart size={10} fill="currentColor" /> menggunakan SIMPLE Pesantren
          </p>
        </div>
      </div>
    </footer>
  );
}
