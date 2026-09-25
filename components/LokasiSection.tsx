"use client";
import { MapPin, Phone, Mail, Clock, ExternalLink, Navigation } from "lucide-react";
import { parseGoogleMapsEmbedUrl } from "@/lib/mapsHelper";

interface LokasiSectionProps {
  config: Record<string, string>;
}

export default function LokasiSection({ config }: LokasiSectionProps) {
  const primary = config.warna_primer || "#0f4c1e";
  const accent = config.warna_aksen || "#c8a84b";
  const nama = config.nama_pesantren || "Pondok Pesantren";
  const alamat = config.alamat || "Bangsri, Kabupaten Jepara, Jawa Tengah";
  
  const embedUrl = parseGoogleMapsEmbedUrl(config.maps_embed_url, `${nama}, ${alamat}`);

  const directMapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    nama + " " + alamat
  )}`;

  return (
    <section id="lokasi" className="py-20 px-4 bg-gray-50/70 relative">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <p className="text-xs sm:text-sm font-bold uppercase tracking-widest mb-2" style={{ color: accent }}>
            Lokasi & Kunjungan
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-3" style={{ color: primary }}>
            Lokasi Pondok Pesantren
          </h2>
          <div
            className="w-16 h-1 mx-auto rounded-full mb-4"
            style={{ background: `linear-gradient(90deg, ${accent}, #f0d080)` }}
          />
          <p className="text-sm text-gray-500 max-w-xl mx-auto">
            Silakan berkunjung langsung ke sekretariat PSB untuk konsultasi program, survei asrama, atau verifikasi berkas pendaftaran santri baru.
          </p>
        </div>

        {/* Content Grid: Info & Google Maps Embed */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Card Info Alamat & Pelayanan */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 flex flex-col justify-between space-y-6">
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-green-900 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                  Sekretariat PSB
                </span>
                <h3 className="text-lg font-bold text-gray-900 mt-3">{nama}</h3>
              </div>

              {/* Alamat Lengkap */}
              <div className="flex items-start gap-3.5">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
                  style={{ background: `${accent}20` }}
                >
                  <MapPin size={20} style={{ color: accent }} />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase text-gray-500 tracking-wider">Alamat Lengkap</h4>
                  <p className="text-sm font-semibold text-gray-800 mt-1 leading-relaxed">{alamat}</p>
                </div>
              </div>

              {/* Jam Pelayanan */}
              <div className="flex items-start gap-3.5">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
                  style={{ background: "#dcfce7" }}
                >
                  <Clock size={20} style={{ color: "#16a34a" }} />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase text-gray-500 tracking-wider">Jam Pelayanan PSB</h4>
                  <p className="text-sm font-semibold text-gray-800 mt-1">
                    {config.jam_layanan || "Senin - Sabtu: 08.00 - 15.00 WIB"}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">Ahad & Hari Libur: Dengan Konfirmasi Panitia</p>
                </div>
              </div>

              {/* Kontak */}
              <div className="pt-2 border-t border-gray-100 space-y-3">
                {config.no_wa_admin && (
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <Phone size={16} style={{ color: accent }} />
                    <span className="font-semibold">{config.no_wa_admin}</span>
                  </div>
                )}
                {config.email && (
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <Mail size={16} style={{ color: accent }} />
                    <span className="font-semibold">{config.email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Tombol Petunjuk Arah */}
            <div className="pt-4">
              <a
                href={directMapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm text-white shadow-md hover:opacity-95 transition-all"
                style={{ background: `linear-gradient(135deg, ${primary}, #1a6b2b)` }}
              >
                <Navigation size={16} />
                <span>Petunjuk Arah Google Maps ↗</span>
              </a>
            </div>
          </div>

          {/* Card Embed Google Maps */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-3 sm:p-4 shadow-sm border border-gray-100 flex flex-col min-h-[400px]">
            <div className="relative w-full h-[380px] sm:h-[420px] lg:h-full min-h-[380px] rounded-2xl overflow-hidden border border-gray-200 bg-gray-100 shadow-inner">
              <iframe
                src={embedUrl}
                title={`Peta Lokasi ${nama}`}
                className="w-full h-full min-h-[380px] border-0"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <div className="mt-2.5 px-2 flex items-center justify-between text-xs text-gray-400">
              <span>Klik dan seret untuk menjelajahi peta</span>
              <a
                href={directMapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-800 font-semibold hover:underline flex items-center gap-1 font-medium"
              >
                <span>Buka Peta Besar</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
