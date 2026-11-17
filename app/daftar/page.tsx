"use client";
import { useState, useEffect, useId, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  User,
  MapPin,
  Users,
  Upload,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Send,
  AlertCircle,
  FileCheck,
  X,
  MessageCircle,
  Copy,
  Info,
  ClipboardCheck,
  Calendar,
  ChevronDown,
} from "lucide-react";
import { buildPsbTheme, type PsbTheme } from "@/lib/themeUtils";
import ModalDialog from "@/components/ModalDialog";

const PROVINSI = [
  "Aceh", "Bali", "Banten", "Bengkulu", "DI Yogyakarta", "DKI Jakarta", "Gorontalo",
  "Jambi", "Jawa Barat", "Jawa Tengah", "Jawa Timur", "Kalimantan Barat",
  "Kalimantan Selatan", "Kalimantan Tengah", "Kalimantan Timur", "Kalimantan Utara",
  "Kepulauan Bangka Belitung", "Kepulauan Riau", "Lampung", "Maluku", "Maluku Utara",
  "Nusa Tenggara Barat", "Nusa Tenggara Timur", "Papua", "Papua Barat", "Papua Barat Daya",
  "Papua Pegunungan", "Papua Selatan", "Papua Tengah", "Riau", "Sulawesi Barat",
  "Sulawesi Selatan", "Sulawesi Tengah", "Sulawesi Tenggara", "Sulawesi Utara", "Sumatera Barat",
  "Sumatera Selatan", "Sumatera Utara",
];

const STEPS = [
  { id: 1, label: "Jalur & Biodata", shortLabel: "Biodata", icon: User },
  { id: 2, label: "Pendidikan & Alamat", shortLabel: "Alamat", icon: MapPin },
  { id: 3, label: "Orang Tua / Wali", shortLabel: "Wali", icon: Users },
  { id: 4, label: "Dokumen & Syarat", shortLabel: "Dokumen", icon: Upload },
];

const DEFAULT_SYARAT = [
  "Calon santri beragama Islam dan berakhlak mulia.",
  "Telah lulus atau berada di tingkat akhir jenjang pendidikan sebelumnya (SD/MI untuk SMP, atau SMP/MTs untuk SMA/SMK).",
  "Mengisi data formulir pendaftaran secara lengkap, benar, dan dapat dipertanggungjawabkan sesuai dokumen kependudukan.",
  "Mengunggah berkas persyaratan: Pas Foto (3x4), Kartu Keluarga, dan Akta Kelahiran (maksimal 1MB per berkas).",
  "Khusus calon pendaftar Jalur Beasiswa LKSA (Gratis), wajib melampirkan Surat Keterangan Tidak Mampu (SKTM) atau Surat Keterangan Kematian Orang Tua dari instansi berwenang.",
  "Bersedia mengikuti seluruh rangkaian tes seleksi (membaca Al-Qur'an, tes potensi akademik, dan wawancara santri serta wali) sesuai jadwal.",
  "Bersedia mematuhi dan menaati seluruh tata tertib, disiplin pondok pesantren, dan peraturan sekolah formal yang dipilih.",
  "Menyerahkan berkas fisik asli saat verifikasi akhir / daftar ulang di sekretariat pondok pesantren.",
];

type FormData = Record<string, string | File | null>;

const INITIAL: FormData = {
  jalur_pendaftaran: "reguler",
  jenjang_tujuan: "SMP",
  nama_lengkap: "", nama_panggilan: "", jenis_kelamin: "",
  tempat_lahir: "", tanggal_lahir: "", anak_ke: "", jumlah_saudara: "",
  asal_sekolah: "", jurusan: "", tahun_lulus: "",
  alamat: "", rt_rw: "", kelurahan: "", kecamatan: "",
  kabupaten: "", provinsi: "", kode_pos: "",
  nama_ayah: "", pekerjaan_ayah: "", nama_ibu: "", pekerjaan_ibu: "",
  penghasilan_orang_tua: "",
  no_hp_wali: "", email_wali: "",
  foto: null, kk: null, akta: null, sktm: null,
};

function InputField({
  label,
  required,
  hint,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
}) {
  const inputId = useId();
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-semibold text-stone-800">
        {label} {required && <span className="text-red-600" aria-hidden="true">*</span>}
      </label>
      <input
        id={inputId}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        data-invalid={error ? "true" : undefined}
        className={`border rounded-xl px-4 py-2.5 text-sm text-stone-900 bg-white placeholder:text-stone-400 transition-colors ${
          error
            ? "border-red-500 ring-2 ring-red-500/15 focus:border-red-600"
            : "border-stone-300 focus:border-emerald-700"
        }`}
        {...props}
      />
      {error && (
        <p id={errorId} role="alert" className="text-xs text-red-700 font-medium flex items-center gap-1">
          <AlertCircle size={13} className="shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}
      {hint && (
        <p id={hintId} className="text-xs text-stone-500 leading-relaxed">
          {hint}
        </p>
      )}
    </div>
  );
}

function SelectField({
  label,
  required,
  error,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  required?: boolean;
  error?: string;
}) {
  const selectId = useId();
  const errorId = error ? `${selectId}-error` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={selectId} className="text-sm font-semibold text-stone-800">
        {label} {required && <span className="text-red-600" aria-hidden="true">*</span>}
      </label>
      <div className="relative">
        <select
          id={selectId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          data-invalid={error ? "true" : undefined}
          className={`w-full appearance-none border rounded-xl pl-4 pr-10 py-2.5 text-sm text-stone-900 bg-white transition-colors ${
            error
              ? "border-red-500 ring-2 ring-red-500/15 focus:border-red-600"
              : "border-stone-300 focus:border-emerald-700"
          }`}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-500"
          aria-hidden="true"
        />
      </div>
      {error && (
        <p id={errorId} role="alert" className="text-xs text-red-700 font-medium flex items-center gap-1">
          <AlertCircle size={13} className="shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

function FileField({
  label,
  name,
  onChange,
  required,
}: {
  label: string;
  name: string;
  onChange: (name: string, file: File | null) => void;
  required?: boolean;
}) {
  const inputId = useId();
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [fileError, setFileError] = useState<string>("");
  const MAX_SIZE = 1 * 1024 * 1024;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file && file.size > MAX_SIZE) {
      setFileError(
        `Ukuran "${file.name}" (${(file.size / 1024 / 1024).toFixed(2)} MB) melebihi batas 1 MB. Silakan pilih file yang lebih kecil.`
      );
      e.target.value = "";
      onChange(name, null);
      setFileName("");
      setPreview(null);
      return;
    }
    setFileError("");
    onChange(name, file);
    setFileName(file?.name || "");
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-semibold text-stone-800">
        {label} {required && <span className="text-red-600" aria-hidden="true">*</span>}
      </label>
      <label
        htmlFor={inputId}
        className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center gap-2 cursor-pointer transition-colors ${
          fileError
            ? "border-red-300 bg-red-50/40"
            : fileName
            ? "border-emerald-400 bg-emerald-50/30"
            : "border-stone-300 bg-[#faf8f4] hover:border-emerald-600"
        }`}
      >
        {preview ? (
          <img src={preview} alt={`Pratinjau ${label}`} className="h-24 object-contain rounded-lg shadow-xs" />
        ) : (
          <Upload size={22} className="text-stone-400" aria-hidden="true" />
        )}
        <span className="text-sm font-semibold text-stone-700 text-center truncate max-w-full px-2">
          {fileName || "Klik untuk memilih berkas"}
        </span>
        <span className="text-xs text-stone-500">Format: JPG, PNG, PDF (Maks. 1 MB)</span>
        <input
          id={inputId}
          type="file"
          accept="image/*,.pdf"
          className="sr-only"
          onChange={handleChange}
        />
      </label>
      {fileError && (
        <p role="alert" className="text-xs text-red-700 font-medium flex items-start gap-1.5">
          <AlertCircle size={14} className="shrink-0 mt-0.5" aria-hidden="true" />
          <span>{fileError}</span>
        </p>
      )}
    </div>
  );
}

interface SuccessData {
  nomor: string;
  nama: string;
  jenjang: string;
  jalur: string;
  noHpWali: string;
  namaWali: string;
  asalSekolah: string;
}

function SuccessView({
  success,
  config,
  theme,
}: {
  success: SuccessData;
  config: Record<string, string>;
  theme: PsbTheme;
}) {
  const [copied, setCopied] = useState(false);

  const copyNomor = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(success.nomor);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const pesantren = config.nama_pesantren || "Pondok Pesantren";
  const noWaAdmin = (config.no_wa_admin || "").replace(/[^0-9]/g, "");
  const jalurLabel = success.jalur === "lksa" ? "Beasiswa LKSA (Gratis)" : "Reguler (MBS)";

  const waMessage = encodeURIComponent(
    `Assalamu'alaikum Admin PSB ${pesantren},\n\n` +
      `Saya telah mendaftarkan calon santri baru secara online melalui website PSB dengan data berikut:\n\n` +
      `📋 *No. Registrasi:* ${success.nomor}\n` +
      `👤 *Nama Santri:* ${success.nama}\n` +
      `🎓 *Jenjang Tujuan:* ${success.jenjang}\n` +
      `🏷️ *Jalur Pendaftaran:* ${jalurLabel}\n` +
      `🏫 *Asal Sekolah:* ${success.asalSekolah || "-"}\n` +
      `👨‍👩‍👧 *Nama Wali:* ${success.namaWali}\n` +
      `📱 *No. HP Wali:* ${success.noHpWali}\n\n` +
      `Mohon konfirmasi penerimaan pendaftaran ini dan informasi jadwal seleksi berikutnya. Terima kasih.`
  );

  const waUrl = noWaAdmin
    ? `https://wa.me/${noWaAdmin}?text=${waMessage}`
    : `https://wa.me/?text=${waMessage}`;

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 py-10"
      style={{ backgroundColor: theme.primaryDark }}
    >
      <div className="bg-white rounded-3xl p-7 sm:p-8 max-w-md w-full shadow-2xl border border-stone-200 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 size={34} aria-hidden="true" />
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold" style={{ color: theme.primary }}>
            Pendaftaran Berhasil
          </h1>
          <p className="text-stone-600 text-sm">
            Data calon santri telah tersimpan di sistem {pesantren}.
          </p>
        </div>

        {/* Nomor Registrasi */}
        <div
          className="rounded-2xl p-4 text-center border-2"
          style={{ backgroundColor: "#faf8f4", borderColor: theme.accent }}
        >
          <p className="text-xs text-stone-600 font-semibold inline-flex items-center gap-1.5 mb-1">
            <ClipboardCheck size={14} style={{ color: theme.accentTextOnLight }} aria-hidden="true" />
            <span>Nomor Registrasi Anda</span>
          </p>
          <p
            className="text-2xl font-mono font-extrabold tracking-widest mb-2.5 tabular-nums"
            style={{ color: theme.primary }}
          >
            {success.nomor}
          </p>
          <button
            onClick={copyNomor}
            type="button"
            className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-full transition-colors cursor-pointer"
            style={{
              backgroundColor: copied ? "#dcfce7" : "#e7e5e4",
              color: copied ? "#166534" : "#292524",
            }}
          >
            <Copy size={12} aria-hidden="true" />
            <span>{copied ? "Nomor Tersalin" : "Salin Nomor"}</span>
          </button>
        </div>

        {/* Ringkasan */}
        <dl className="rounded-2xl border border-stone-200 bg-[#faf8f4] px-4 py-3.5 space-y-2 text-sm">
          <div className="flex justify-between gap-2">
            <dt className="text-stone-500">Nama Santri</dt>
            <dd className="font-bold text-stone-900 text-right">{success.nama}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-stone-500">Jenjang</dt>
            <dd className="font-bold text-stone-900">{success.jenjang}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-stone-500">Jalur</dt>
            <dd className="font-bold text-stone-900 text-right">{jalurLabel}</dd>
          </div>
        </dl>

        {/* CTA WhatsApp */}
        <div className="rounded-2xl p-4 bg-emerald-50 border border-emerald-200 space-y-3">
          <p className="text-sm font-bold text-emerald-950 flex items-center gap-1.5">
            <MessageCircle size={16} className="text-emerald-700" aria-hidden="true" />
            <span>Langkah Berikutnya — Konfirmasi Berkas</span>
          </p>
          <p className="text-xs text-emerald-900 leading-relaxed">
            Kirim konfirmasi ke Admin PSB via WhatsApp agar berkas segera diverifikasi dan Anda menerima jadwal tes seleksi.
          </p>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl font-bold text-white text-sm bg-emerald-700 hover:bg-emerald-800 transition-colors shadow-sm"
          >
            <MessageCircle size={17} aria-hidden="true" />
            <span>Kirim Konfirmasi via WhatsApp</span>
          </a>
        </div>

        <Link
          href="/"
          className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm border border-stone-200 text-stone-700 hover:bg-stone-50 transition-colors"
        >
          <ArrowLeft size={15} aria-hidden="true" />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>
    </main>
  );
}

function DaftarForm() {
  const searchParams = useSearchParams();
  const gelombangId = searchParams.get("gelombang");

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(INITIAL);
  const [config, setConfig] = useState<Record<string, string>>({});
  const [gelombangNama, setGelombangNama] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<SuccessData | null>(null);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [setujuSyarat, setSetujuSyarat] = useState(false);
  const [showSyaratModal, setShowSyaratModal] = useState(false);
  const formCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) setConfig(d.data);
      })
      .catch(() => {});

    if (gelombangId) {
      fetch("/api/gelombang")
        .then((r) => r.json())
        .then((d) => {
          if (d.ok && Array.isArray(d.data)) {
            const found = d.data.find((g: { id: number; nama: string }) => String(g.id) === gelombangId);
            if (found?.nama) setGelombangNama(String(found.nama));
          }
        })
        .catch(() => {});
    }
  }, [gelombangId]);

  const theme = buildPsbTheme(config);

  const syaratList = config.syarat_ketentuan
    ? config.syarat_ketentuan.split("\n").map((s) => s.trim()).filter(Boolean)
    : DEFAULT_SYARAT;

  const set = (key: string, val: string) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };
  const setFile = (key: string, file: File | null) => {
    setForm((prev) => ({ ...prev, [key]: file }));
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const scrollToFirstInvalid = () => {
    window.requestAnimationFrame(() => {
      const container = formCardRef.current;
      if (!container) return;
      const firstInvalid = container.querySelector<HTMLElement>('[data-invalid="true"]');
      if (firstInvalid) {
        firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
        firstInvalid.focus({ preventScroll: true });
      } else {
        container.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (step === 1) {
      if (!String(form.nama_lengkap || "").trim()) {
        nextErrors.nama_lengkap = "Nama lengkap calon santri wajib diisi.";
      }
      if (!form.jenis_kelamin) {
        nextErrors.jenis_kelamin = "Jenis kelamin wajib dipilih.";
      }
    }
    if (step === 3 && !String(form.no_hp_wali || "").trim()) {
      nextErrors.no_hp_wali = "Nomor WhatsApp / HP orang tua atau wali wajib diisi.";
    }
    if (step === 4) {
      if (form.jalur_pendaftaran === "lksa" && !form.sktm) {
        nextErrors.sktm = "Jalur Beasiswa LKSA wajib melampirkan Surat Keterangan Tidak Mampu (SKTM).";
      }
      if (!setujuSyarat) {
        nextErrors.setujuSyarat =
          "Silakan centang persetujuan Syarat & Ketentuan pendaftaran sebelum mengirim formulir.";
      }
    }

    const keys = Object.keys(nextErrors);
    if (keys.length > 0) {
      setFieldErrors(nextErrors);
      setError(nextErrors[keys[0]]);
      scrollToFirstInvalid();
      return false;
    }

    setFieldErrors({});
    setError("");
    return true;
  };

  const nextStep = () => {
    if (validate()) setStep((s) => Math.min(s + 1, 4));
  };
  const prevStep = () => {
    setFieldErrors({});
    setError("");
    setStep((s) => Math.max(s - 1, 1));
  };

  const uploadFile = async (file: File, folder: string): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);
    const res = await fetch("/api/psb/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (!data.ok) throw new Error(data.error);
    return data.url;
  };

  const submit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setError("");
    try {
      const payload: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(form)) {
        if (v instanceof File) continue;
        if (v !== null && v !== "") payload[k] = v;
      }
      if (gelombangId) payload.gelombang_id = Number(gelombangId);

      if (form.foto instanceof File) payload.foto_url = await uploadFile(form.foto, "foto");
      if (form.kk instanceof File) payload.kk_url = await uploadFile(form.kk, "kk");
      if (form.akta instanceof File) payload.akta_url = await uploadFile(form.akta, "akta");
      if (form.sktm instanceof File) payload.sktm_url = await uploadFile(form.sktm, "sktm");

      const res = await fetch("/api/psb", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      setSuccess({
        nomor: data.nomor_registrasi,
        nama: String(payload.nama_lengkap || ""),
        jenjang: String(payload.jenjang_tujuan || ""),
        jalur: String(payload.jalur_pendaftaran || "reguler"),
        noHpWali: String(payload.no_hp_wali || ""),
        namaWali: String(payload.nama_ayah || payload.nama_ibu || "Wali Santri"),
        asalSekolah: String(payload.asal_sekolah || ""),
      });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return <SuccessView success={success} config={config} theme={theme} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f4]">
      {/* Header Bar */}
      <header className="sticky top-0 z-30 border-b border-black/15 shadow-sm text-white" style={{ backgroundColor: theme.primaryDark }}>
        <div className="max-w-3xl mx-auto px-4 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-white/85 hover:text-white transition-colors shrink-0"
            >
              <ArrowLeft size={16} aria-hidden="true" />
              <span>Beranda</span>
            </Link>
            <span className="text-white/25" aria-hidden="true">|</span>
            <h1 className="text-sm font-bold truncate">Formulir PSB Online</h1>
          </div>
          <button
            type="button"
            onClick={() => setShowSyaratModal(true)}
            className="text-xs font-semibold px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white shrink-0 cursor-pointer transition-colors"
          >
            <FileCheck size={14} style={{ color: theme.accentLight }} aria-hidden="true" />
            <span>Syarat</span>
          </button>
        </div>
      </header>

      {/* Main Form Container */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-8 sm:py-10 space-y-6">
        {/* Banner Gelombang Terpilih */}
        {gelombangId && (
          <div
            className="rounded-2xl px-4 py-3 border flex items-center justify-between gap-3 bg-white"
            style={{ borderColor: `${theme.accent}80` }}
          >
            <div className="flex items-center gap-2.5 text-sm">
              <Calendar size={16} style={{ color: theme.accentTextOnLight }} aria-hidden="true" />
              <span className="text-stone-700">
                Jalur Gelombang:{" "}
                <strong className="text-stone-900">
                  {gelombangNama || `Gelombang #${gelombangId}`}
                </strong>
              </span>
            </div>
            <Link
              href="/daftar"
              className="text-xs font-semibold text-stone-500 hover:text-stone-800 underline shrink-0"
            >
              Ubah
            </Link>
          </div>
        )}

        {/* Stepper */}
        <nav aria-label="Tahapan pendaftaran" className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/80 shadow-xs">
          <ol className="relative grid grid-cols-4 gap-2">
            {/* Garis penghubung horizontal antar langkah */}
            <div
              aria-hidden="true"
              className="absolute top-5 left-[12.5%] right-[12.5%] h-0.5 bg-stone-200"
            >
              <div
                className="h-full transition-all duration-300"
                style={{
                  width: `${((step - 1) / (STEPS.length - 1)) * 100}%`,
                  backgroundColor: "#15803d",
                }}
              />
            </div>

            {STEPS.map((s) => {
              const Icon = s.icon;
              const active = s.id === step;
              const done = s.id < step;
              const canJump = done;

              return (
                <li key={s.id} className="relative z-10 flex flex-col items-center text-center gap-1.5">
                  <button
                    type="button"
                    disabled={!canJump}
                    onClick={() => canJump && setStep(s.id)}
                    aria-label={`Langkah ${s.id}: ${s.label}`}
                    aria-current={active ? "step" : undefined}
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ring-4 ring-white ${
                      canJump ? "cursor-pointer" : "cursor-default"
                    }`}
                    style={{
                      backgroundColor: done
                        ? "#15803d"
                        : active
                        ? theme.accent
                        : "#f5f5f4",
                      color: done ? "#ffffff" : active ? theme.onAccent : "#78716c",
                    }}
                  >
                    {done ? <CheckCircle2 size={18} aria-hidden="true" /> : <Icon size={16} aria-hidden="true" />}
                  </button>
                  <span
                    className="text-[11px] sm:text-xs font-semibold leading-tight"
                    style={{
                      color: active ? theme.primary : done ? "#15803d" : "#78716c",
                    }}
                  >
                    <span className="sm:hidden">{s.shortLabel}</span>
                    <span className="hidden sm:inline">{s.label}</span>
                  </span>
                </li>
              );
            })}
          </ol>
        </nav>

        {/* Form Card */}
        <div ref={formCardRef} className="bg-white rounded-3xl shadow-sm border border-stone-200/90 overflow-hidden">
          <div
            aria-hidden="true"
            className="h-1.5 w-full"
            style={{ background: `linear-gradient(90deg, ${theme.primary}, ${theme.accent})` }}
          />
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-stone-100">
              <div>
                <h2 className="font-display text-2xl font-bold" style={{ color: theme.primary }}>
                  {STEPS[step - 1].label}
                </h2>
                <p className="text-stone-500 text-xs sm:text-sm mt-0.5">
                  Pastikan seluruh data diisi sesuai dokumen resmi kependudukan.
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-stone-100 text-stone-700 tabular-nums">
                Langkah {step} / {STEPS.length}
              </span>
            </div>

            {error && (
              <div
                role="alert"
                className="bg-red-50 border border-red-200 text-red-800 text-sm rounded-2xl px-4 py-3 flex items-start gap-2.5"
              >
                <AlertCircle size={18} className="shrink-0 text-red-600 mt-0.5" aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            {/* Step 1: Jalur & Biodata */}
            {step === 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 bg-[#faf8f4] p-4 sm:p-5 rounded-2xl border border-stone-200/80 space-y-5">
                  <fieldset>
                    <legend className="text-xs font-extrabold uppercase tracking-wider text-stone-700 mb-2.5">
                      Pilih Jalur Pendaftaran <span className="text-red-600" aria-hidden="true">*</span>
                    </legend>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label
                        className={`flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-colors bg-white ${
                          form.jalur_pendaftaran === "reguler"
                            ? "border-emerald-700 ring-2 ring-emerald-700/15"
                            : "border-stone-200 hover:border-stone-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="jalur_pendaftaran"
                          value="reguler"
                          checked={form.jalur_pendaftaran === "reguler"}
                          onChange={() => set("jalur_pendaftaran", "reguler")}
                          className="mt-1 accent-emerald-700"
                        />
                        <div>
                          <div className="text-sm font-bold text-stone-900">Santri Reguler (MBS)</div>
                          <p className="text-xs text-stone-600 mt-0.5">
                            Muhammadiyah Boarding School reguler berasrama
                          </p>
                        </div>
                      </label>

                      <label
                        className={`flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-colors bg-white ${
                          form.jalur_pendaftaran === "lksa"
                            ? "border-amber-600 ring-2 ring-amber-600/15"
                            : "border-stone-200 hover:border-stone-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="jalur_pendaftaran"
                          value="lksa"
                          checked={form.jalur_pendaftaran === "lksa"}
                          onChange={() => set("jalur_pendaftaran", "lksa")}
                          className="mt-1 accent-amber-600"
                        />
                        <div>
                          <div className="text-sm font-bold text-stone-900 flex items-center gap-1.5 flex-wrap">
                            <span>Santri LKSA (Gratis)</span>
                            <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                              Beasiswa
                            </span>
                          </div>
                          <p className="text-xs text-stone-600 mt-0.5">
                            Khusus yatim / piatu / dhuafa asuhan LKSA
                          </p>
                        </div>
                      </label>
                    </div>

                    {form.jalur_pendaftaran === "lksa" && (
                      <div className="text-xs text-amber-950 mt-3 bg-amber-50 p-3 rounded-xl border border-amber-200 flex items-start gap-2 leading-relaxed">
                        <Info size={15} className="shrink-0 mt-0.5 text-amber-700" aria-hidden="true" />
                        <span>
                          <strong>Syarat Khusus LKSA:</strong> Pendaftar jalur ini bebas biaya dan wajib melampirkan{" "}
                          <strong>Surat Keterangan Tidak Mampu (SKTM)</strong> atau Surat Keterangan Yatim/Kematian Orang Tua pada langkah ke-4.
                        </span>
                      </div>
                    )}
                  </fieldset>

                  <fieldset>
                    <legend className="text-xs font-extrabold uppercase tracking-wider text-stone-700 mb-2.5">
                      Jenjang Sekolah Formal <span className="text-red-600" aria-hidden="true">*</span>
                    </legend>
                    <div className="grid grid-cols-3 gap-2.5">
                      {[
                        { val: "SMP", label: "SMP", desc: "SMP Muhammadiyah" },
                        { val: "SMA", label: "SMA", desc: "SMA Muhammadiyah" },
                        { val: "SMK", label: "SMK", desc: "SMK Muhammadiyah" },
                      ].map((item) => (
                        <label
                          key={item.val}
                          className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-colors text-center bg-white ${
                            form.jenjang_tujuan === item.val
                              ? "border-emerald-700 ring-2 ring-emerald-700/15"
                              : "border-stone-200 hover:border-stone-300"
                          }`}
                        >
                          <input
                            type="radio"
                            name="jenjang_tujuan"
                            value={item.val}
                            checked={form.jenjang_tujuan === item.val}
                            onChange={() => set("jenjang_tujuan", item.val)}
                            className="sr-only"
                          />
                          <span className="text-base font-extrabold text-stone-900">{item.label}</span>
                          <span className="text-[11px] text-stone-500 mt-0.5 hidden sm:block">
                            {item.desc}
                          </span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                </div>

                <div className="sm:col-span-2">
                  <InputField
                    label="Nama Lengkap"
                    required
                    autoComplete="name"
                    error={fieldErrors.nama_lengkap}
                    value={String(form.nama_lengkap)}
                    onChange={(e) => set("nama_lengkap", e.target.value)}
                    placeholder="Nama lengkap sesuai akta kelahiran"
                  />
                </div>
                <InputField
                  label="Nama Panggilan"
                  value={String(form.nama_panggilan)}
                  onChange={(e) => set("nama_panggilan", e.target.value)}
                  placeholder="Nama panggilan"
                />
                <SelectField
                  label="Jenis Kelamin"
                  required
                  error={fieldErrors.jenis_kelamin}
                  value={String(form.jenis_kelamin)}
                  onChange={(e) => set("jenis_kelamin", e.target.value)}
                >
                  <option value="">-- Pilih Jenis Kelamin --</option>
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </SelectField>
                <InputField
                  label="Tempat Lahir"
                  value={String(form.tempat_lahir)}
                  onChange={(e) => set("tempat_lahir", e.target.value)}
                  placeholder="Kota tempat lahir"
                />
                <InputField
                  label="Tanggal Lahir"
                  type="date"
                  value={String(form.tanggal_lahir)}
                  onChange={(e) => set("tanggal_lahir", e.target.value)}
                />
                <InputField
                  label="Anak ke-"
                  type="number"
                  value={String(form.anak_ke)}
                  onChange={(e) => set("anak_ke", e.target.value)}
                  placeholder="1"
                  min="1"
                />
                <InputField
                  label="Jumlah Saudara"
                  type="number"
                  value={String(form.jumlah_saudara)}
                  onChange={(e) => set("jumlah_saudara", e.target.value)}
                  placeholder="0"
                  min="0"
                />
              </div>
            )}

            {/* Step 2: Pendidikan & Alamat */}
            {step === 2 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <InputField
                    label="Asal Sekolah Sebelumnya"
                    value={String(form.asal_sekolah)}
                    onChange={(e) => set("asal_sekolah", e.target.value)}
                    placeholder="Contoh: SD Negeri 1 Bangsri / MTs ..."
                  />
                </div>
                <InputField
                  label="Peminatan / Jurusan (jika SMA/SMK)"
                  value={String(form.jurusan)}
                  onChange={(e) => set("jurusan", e.target.value)}
                  placeholder="Contoh: IPA / IPS / TKJ / Umum"
                />
                <InputField
                  label="Tahun Lulus"
                  type="number"
                  value={String(form.tahun_lulus)}
                  onChange={(e) => set("tahun_lulus", e.target.value)}
                  placeholder="2026"
                />
                <div className="sm:col-span-2">
                  <InputField
                    label="Alamat Lengkap"
                    autoComplete="street-address"
                    value={String(form.alamat)}
                    onChange={(e) => set("alamat", e.target.value)}
                    placeholder="Nama jalan, dusun, atau perumahan"
                  />
                </div>
                <InputField
                  label="RT / RW"
                  value={String(form.rt_rw)}
                  onChange={(e) => set("rt_rw", e.target.value)}
                  placeholder="001/002"
                />
                <InputField
                  label="Kelurahan / Desa"
                  value={String(form.kelurahan)}
                  onChange={(e) => set("kelurahan", e.target.value)}
                />
                <InputField
                  label="Kecamatan"
                  value={String(form.kecamatan)}
                  onChange={(e) => set("kecamatan", e.target.value)}
                />
                <InputField
                  label="Kabupaten / Kota"
                  autoComplete="address-level2"
                  value={String(form.kabupaten)}
                  onChange={(e) => set("kabupaten", e.target.value)}
                />
                <SelectField
                  label="Provinsi"
                  value={String(form.provinsi)}
                  onChange={(e) => set("provinsi", e.target.value)}
                >
                  <option value="">-- Pilih Provinsi --</option>
                  {PROVINSI.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </SelectField>
                <InputField
                  label="Kode Pos"
                  autoComplete="postal-code"
                  value={String(form.kode_pos)}
                  onChange={(e) => set("kode_pos", e.target.value)}
                  placeholder="59453"
                />
              </div>
            )}

            {/* Step 3: Orang Tua / Wali */}
            {step === 3 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="Nama Ayah"
                  value={String(form.nama_ayah)}
                  onChange={(e) => set("nama_ayah", e.target.value)}
                />
                <InputField
                  label="Pekerjaan Ayah"
                  value={String(form.pekerjaan_ayah)}
                  onChange={(e) => set("pekerjaan_ayah", e.target.value)}
                />
                <InputField
                  label="Nama Ibu"
                  value={String(form.nama_ibu)}
                  onChange={(e) => set("nama_ibu", e.target.value)}
                />
                <InputField
                  label="Pekerjaan Ibu"
                  value={String(form.pekerjaan_ibu)}
                  onChange={(e) => set("pekerjaan_ibu", e.target.value)}
                />
                <div className="sm:col-span-2">
                  <InputField
                    label="Rata-rata Penghasilan Orang Tua (Per Bulan)"
                    value={String(form.penghasilan_orang_tua || "")}
                    onChange={(e) => set("penghasilan_orang_tua", e.target.value)}
                    placeholder="Contoh: Rp 2.500.000"
                    hint="Tuliskan kisaran penghasilan gabungan per bulan."
                  />
                </div>
                <div className="sm:col-span-2">
                  <InputField
                    label="No. WhatsApp / HP Orang Tua/Wali"
                    required
                    type="tel"
                    autoComplete="tel"
                    error={fieldErrors.no_hp_wali}
                    value={String(form.no_hp_wali)}
                    onChange={(e) => set("no_hp_wali", e.target.value)}
                    placeholder="08xxxxxxxxxx"
                    hint="Nomor aktif untuk menerima informasi verifikasi berkas dan jadwal seleksi."
                  />
                </div>
                <div className="sm:col-span-2">
                  <InputField
                    label="Email Orang Tua/Wali (opsional)"
                    type="email"
                    autoComplete="email"
                    value={String(form.email_wali)}
                    onChange={(e) => set("email_wali", e.target.value)}
                    placeholder="contoh@gmail.com"
                  />
                </div>
              </div>
            )}

            {/* Step 4: Dokumen & Syarat Ketentuan */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <FileField label="Pas Foto Santri (3x4)" name="foto" onChange={setFile} required />
                  </div>
                  <FileField label="Kartu Keluarga (KK)" name="kk" onChange={setFile} />
                  <FileField label="Akta Kelahiran" name="akta" onChange={setFile} />

                  {form.jalur_pendaftaran === "lksa" && (
                    <div className="sm:col-span-2 p-4 rounded-2xl bg-amber-50 border border-amber-300 space-y-2.5">
                      <div className="flex items-center gap-2 text-amber-950 font-bold text-sm">
                        <AlertCircle size={16} className="text-amber-700 shrink-0" aria-hidden="true" />
                        <span>Berkas Wajib Jalur Beasiswa LKSA</span>
                      </div>
                      <FileField
                        label="Surat Keterangan Tidak Mampu (SKTM) / Keterangan Yatim"
                        name="sktm"
                        onChange={setFile}
                        required
                      />
                    </div>
                  )}
                </div>

                {/* Syarat & Ketentuan */}
                <div className="p-4 sm:p-5 rounded-2xl border border-stone-200 bg-[#faf8f4] space-y-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <FileCheck size={18} style={{ color: theme.primary }} aria-hidden="true" />
                      <h3 className="font-bold text-sm text-stone-900">Syarat &amp; Ketentuan Pendaftaran</h3>
                    </div>
                    <span className="text-[11px] font-semibold text-stone-500 tabular-nums">
                      {syaratList.length} poin (gulir ke bawah)
                    </span>
                  </div>

                  <ol className="max-h-52 overflow-y-scroll [scrollbar-width:thin] pr-2 space-y-2 text-xs text-stone-700 bg-white p-3.5 rounded-xl border border-stone-200/70 leading-relaxed">
                    {syaratList.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="font-bold tabular-nums shrink-0" style={{ color: theme.primary }}>
                          {idx + 1}.
                        </span>
                        <span>{item.replace(/^\d+[\.\)]\s*/, "")}</span>
                      </li>
                    ))}
                  </ol>

                  <label
                    className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${
                      fieldErrors.setujuSyarat
                        ? "border-red-400 bg-red-50/70"
                        : "border-emerald-200 bg-emerald-50/70 hover:bg-emerald-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={setujuSyarat}
                      data-invalid={fieldErrors.setujuSyarat ? "true" : undefined}
                      onChange={(e) => {
                        setSetujuSyarat(e.target.checked);
                        if (e.target.checked) {
                          setFieldErrors((prev) => {
                            if (!prev.setujuSyarat) return prev;
                            const next = { ...prev };
                            delete next.setujuSyarat;
                            return next;
                          });
                        }
                      }}
                      className="mt-0.5 w-4 h-4 accent-emerald-700 rounded cursor-pointer shrink-0"
                    />
                    <span className="text-xs text-emerald-950 font-medium leading-relaxed">
                      Saya menyatakan seluruh data yang diisi adalah benar, dokumen yang dilampirkan sah, dan bersedia menaati{" "}
                      <strong>Syarat, Ketentuan, serta Tata Tertib</strong> pondok pesantren.
                    </span>
                  </label>
                  {fieldErrors.setujuSyarat && (
                    <p role="alert" className="text-xs text-red-700 font-medium flex items-center gap-1">
                      <AlertCircle size={13} className="shrink-0" aria-hidden="true" />
                      <span>{fieldErrors.setujuSyarat}</span>
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Navigation Footer */}
            <div className="pt-4 border-t border-stone-100 flex items-center justify-between gap-3">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-stone-300 font-semibold text-sm text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer"
                >
                  <ArrowLeft size={16} aria-hidden="true" />
                  <span>Sebelumnya</span>
                </button>
              ) : (
                <div />
              )}

              {step < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm text-white transition-opacity hover:opacity-95 cursor-pointer"
                  style={{ backgroundColor: theme.primary }}
                >
                  <span>Lanjut</span>
                  <ArrowRight size={16} aria-hidden="true" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={submit}
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm border border-black/10 transition-opacity hover:opacity-95 disabled:opacity-60 shadow-sm cursor-pointer"
                  style={{ backgroundColor: theme.accent, color: theme.onAccent }}
                >
                  {submitting ? (
                    <span>Mengirim Pendaftaran...</span>
                  ) : (
                    <>
                      <Send size={16} aria-hidden="true" />
                      <span>Kirim Pendaftaran</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modal Syarat & Ketentuan */}
      <ModalDialog
        open={showSyaratModal}
        onClose={() => setShowSyaratModal(false)}
        labelledBy="syarat-modal-title"
        className="w-full max-w-lg"
      >
        <div className="bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <FileCheck size={20} style={{ color: theme.primary }} aria-hidden="true" />
              <h3 id="syarat-modal-title" className="font-bold text-base text-stone-900">
                Syarat &amp; Ketentuan Pendaftaran
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setShowSyaratModal(false)}
              aria-label="Tutup syarat dan ketentuan"
              className="min-w-9 min-h-9 rounded-full flex items-center justify-center text-stone-500 hover:bg-stone-100 hover:text-stone-800 cursor-pointer"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>

          <ol className="max-h-[60vh] overflow-y-auto pr-2 space-y-2.5 text-xs text-stone-700 leading-relaxed">
            {syaratList.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#faf8f4]">
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 tabular-nums"
                  style={{ backgroundColor: theme.primary }}
                >
                  {idx + 1}
                </span>
                <span>{item.replace(/^\d+[\.\)]\s*/, "")}</span>
              </li>
            ))}
          </ol>

          <div className="text-right pt-2">
            <button
              type="button"
              onClick={() => setShowSyaratModal(false)}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white cursor-pointer"
              style={{ backgroundColor: theme.primary }}
            >
              Saya Mengerti
            </button>
          </div>
        </div>
      </ModalDialog>
    </div>
  );
}

export default function DaftarPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#faf8f4]">
          <div className="text-center space-y-3">
            <div className="w-9 h-9 rounded-full border-2 border-emerald-800 border-t-transparent animate-spin mx-auto" />
            <p className="text-stone-600 font-medium text-sm">Memuat formulir pendaftaran...</p>
          </div>
        </div>
      }
    >
      <DaftarForm />
    </Suspense>
  );
}
