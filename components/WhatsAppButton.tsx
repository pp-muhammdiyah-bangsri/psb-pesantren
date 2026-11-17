"use client";
import { MessageCircle } from "lucide-react";

interface WhatsAppButtonProps {
  noWa?: string;
  label?: string;
  defaultMessage?: string;
}

export default function WhatsAppButton({
  noWa,
  label,
  defaultMessage,
}: WhatsAppButtonProps) {
  if (!noWa) return null;
  const wa = noWa.replace(/\D/g, "");
  if (!wa) return null;
  const msg = encodeURIComponent(
    defaultMessage || "Assalamualaikum, saya ingin mengetahui informasi Penerimaan Santri Baru."
  );

  return (
    <a
      href={`https://wa.me/${wa}?text=${msg}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Hubungi panitia PSB melalui WhatsApp"
      className="fixed bottom-5 right-5 z-30 inline-flex items-center gap-2 min-h-11 px-4 py-2.5 rounded-full text-white font-bold text-sm shadow-lg transition-transform duration-200 hover:-translate-y-0.5"
      style={{
        backgroundColor: "#15803d",
        boxShadow: "0 10px 25px -8px rgba(21, 128, 61, 0.55)",
      }}
    >
      <MessageCircle size={19} aria-hidden="true" />
      <span className="hidden sm:inline">{label || "Konsultasi PSB"}</span>
    </a>
  );
}
