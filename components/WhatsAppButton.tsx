"use client";
import { MessageCircle } from "lucide-react";

export default function WhatsAppButton({ noWa }: { noWa?: string }) {
  if (!noWa) return null;
  const wa = noWa.replace(/\D/g, "");
  const msg = encodeURIComponent("Assalamualaikum, saya ingin mengetahui informasi Penerimaan Santri Baru.");
  return (
    <a
      href={`https://wa.me/${wa}?text=${msg}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full text-white font-semibold text-sm shadow-2xl transition-all hover:scale-105"
      style={{ background: "linear-gradient(135deg, #25D366, #1da851)", boxShadow: "0 6px 25px rgba(37,211,102,0.5)" }}
    >
      <MessageCircle size={20} fill="white" />
      <span className="hidden sm:inline">Hubungi Kami</span>
    </a>
  );
}
