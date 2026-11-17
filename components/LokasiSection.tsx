"use client";
import { MapPin, Phone, Mail, Clock, ExternalLink, Navigation } from "lucide-react";
import { parseGoogleMapsEmbedUrl } from "@/lib/mapsHelper";
import { buildPsbTheme, formatPhoneDisplay } from "@/lib/themeUtils";

interface LokasiSectionProps {
  config: Record<string, string>;
}

export default function LokasiSection({ config }: LokasiSectionProps) {
  const theme = buildPsbTheme(config);
  const nama = config.nama_pesantren || "Pondok Pesantren";
  const alamat = config.alamat || "Bangsri, Kabupaten Jepara, Jawa Tengah";

  const badge = config.lokasi_badge || "Lokasi & Kunjungan";
  const judul = config.lokasi_judul || "Lokasi Pondok Pesantren";
  const deskripsi =
    config.lokasi_deskripsi ||
    "Silakan berkunjung langsung ke sekretariat PSB untuk konsultasi program, survei asrama, atau verifikasi berkas pendaftaran santri baru.";
  const cardBadge = config.lokasi_card_badge || "Sekretariat PSB";
  const jamLayanan = config.jam_layanan || "Senin - Sabtu: 08.00 - 15.00 WIB";
  const jamKeterangan = config.lokasi_jam_keterangan || "Ahad & Hari Libur: Dengan Konfirmasi Panitia";
  const ctaArah = (config.lokasi_cta_arah || "Petunjuk Arah Google Maps").replace(/\s*↗$/, "");

  const embedUrl = parseGoogleMapsEmbedUrl(config.maps_embed_url, `${nama}, ${alamat}`);
  const directMapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${nama} ${alamat}`
  )}`;

  const cleanWa = (config.no_wa_admin || "").replace(/\D/g, "");

  return (
    <section id="lokasi" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#faf8f4] border-t border-stone-200/70">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6 text-center md:text-left">
          <div className="max-w-2xl mx-auto md:mx-0 space-y-2.5">
            <p
              className="text-xs font-bold uppercase tracking-[0.18em]"
              style={{ color: theme.accentTextOnLight }}
            >
              {badge}
            </p>
            <h2
              className="font-display text-3xl sm:text-4xl font-bold leading-tight"
              style={{ color: theme.primary }}
            >
              {judul}
            </h2>
          </div>
          <p className="text-sm sm:text-base text-stone-600 max-w-md mx-auto md:mx-0 leading-relaxed">
            {deskripsi}
          </p>
        </div>

        {/* Grid Info & Google Maps */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs flex flex-col justify-between space-y-6">
            <div className="space-y-6">
              <div className="text-center sm:text-left">
                <span
                  className="inline-block text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border"
                  style={{
                    backgroundColor: theme.primarySoft,
                    color: theme.primary,
                    borderColor: `${theme.primary}25`,
                  }}
                >
                  {cardBadge}
                </span>
                <h3 className="text-lg font-bold text-stone-900 mt-3">{nama}</h3>
              </div>

              <div className="flex items-start gap-3.5">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${theme.accent}22`, color: theme.accentTextOnLight }}
                >
                  <MapPin size={19} aria-hidden="true" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase text-stone-500 tracking-wider">
                    Alamat Lengkap
                  </h4>
                  <p className="text-sm font-semibold text-stone-800 mt-1 leading-relaxed">
                    {alamat}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: theme.primarySoft, color: theme.primary }}
                >
                  <Clock size={19} aria-hidden="true" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase text-stone-500 tracking-wider">
                    Jam Pelayanan PSB
                  </h4>
                  <p className="text-sm font-semibold text-stone-800 mt-1">{jamLayanan}</p>
                  {jamKeterangan && (
                    <p className="text-xs text-stone-500 mt-0.5">{jamKeterangan}</p>
                  )}
                </div>
              </div>

              {(config.no_wa_admin || config.email) && (
                <div className="pt-4 border-t border-stone-100 space-y-2.5">
                  {config.no_wa_admin && (
                    <a
                      href={cleanWa ? `https://wa.me/${cleanWa}` : `tel:${config.no_wa_admin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-sm text-stone-700 hover:text-stone-950 font-semibold transition-colors"
                    >
                      <Phone size={16} style={{ color: theme.accentTextOnLight }} aria-hidden="true" />
                      <span className="tabular-nums">{formatPhoneDisplay(config.no_wa_admin)}</span>
                    </a>
                  )}
                  {config.email && (
                    <a
                      href={`mailto:${config.email}`}
                      className="flex items-center gap-3 text-sm text-stone-700 hover:text-stone-950 font-semibold transition-colors"
                    >
                      <Mail size={16} style={{ color: theme.accentTextOnLight }} aria-hidden="true" />
                      <span>{config.email}</span>
                    </a>
                  )}
                </div>
              )}
            </div>

            <a
              href={directMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl font-bold text-sm text-white transition-opacity hover:opacity-95"
              style={{ backgroundColor: theme.primary }}
            >
              <Navigation size={16} aria-hidden="true" />
              <span>{ctaArah}</span>
              <ExternalLink size={14} aria-hidden="true" />
            </a>
          </div>

          <div className="lg:col-span-7 bg-white rounded-3xl p-3 sm:p-4 border border-stone-200/80 shadow-xs flex flex-col min-h-[380px]">
            <div className="relative w-full h-[360px] sm:h-[420px] lg:h-full min-h-[360px] rounded-2xl overflow-hidden border border-stone-200 bg-stone-100">
              <iframe
                src={embedUrl}
                title={`Peta Lokasi ${nama}`}
                className="w-full h-full min-h-[360px] border-0"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <div className="mt-3 px-2 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500">
              <span>Klik dan seret untuk menjelajahi peta</span>
              <a
                href={directMapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold hover:underline inline-flex items-center gap-1 whitespace-nowrap shrink-0"
                style={{ color: theme.primary }}
              >
                <span>Buka Peta Besar</span>
                <ExternalLink size={12} aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
