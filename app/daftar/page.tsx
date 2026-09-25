"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  User, MapPin, GraduationCap, Users, Upload,
  CheckCircle, ArrowLeft, ArrowRight, Send, BookOpen, AlertCircle, FileCheck, X
} from "lucide-react";

const PROVINSI = [
  "Aceh","Bali","Banten","Bengkulu","DI Yogyakarta","DKI Jakarta","Gorontalo",
  "Jambi","Jawa Barat","Jawa Tengah","Jawa Timur","Kalimantan Barat",
  "Kalimantan Selatan","Kalimantan Tengah","Kalimantan Timur","Kalimantan Utara",
  "Kepulauan Bangka Belitung","Kepulauan Riau","Lampung","Maluku","Maluku Utara",
  "Nusa Tenggara Barat","Nusa Tenggara Timur","Papua","Papua Barat","Papua Barat Daya",
  "Papua Pegunungan","Papua Selatan","Papua Tengah","Riau","Sulawesi Barat",
  "Sulawesi Selatan","Sulawesi Tengah","Sulawesi Tenggara","Sulawesi Utara","Sumatera Barat",
  "Sumatera Selatan","Sumatera Utara"
];

const STEPS = [
  { id: 1, label: "Jalur & Biodata", icon: User },
  { id: 2, label: "Pendidikan & Alamat", icon: MapPin },
  { id: 3, label: "Orang Tua / Wali", icon: Users },
  { id: 4, label: "Dokumen & Syarat", icon: Upload },
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
  no_hp_wali: "", email_wali: "",
  foto: null, kk: null, akta: null, sktm: null,
};

function InputField({ label, required, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; required?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        className="border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all"
        style={{ borderColor: "#e0e0e0" }}
        {...props}
      />
    </div>
  );
}

function SelectField({ label, required, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; required?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        className="border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 bg-white transition-all"
        style={{ borderColor: "#e0e0e0" }}
        {...props}
      >
        {children}
      </select>
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
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const MAX_SIZE = 1 * 1024 * 1024; // 1MB

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file && file.size > MAX_SIZE) {
      alert(`Ukuran file "${file.name}" adalah ${(file.size / 1024 / 1024).toFixed(2)}MB, melebihi batas maksimal 1MB. Silakan pilih file yang lebih kecil atau kompres terlebih dahulu.`);
      e.target.value = "";
      onChange(name, null);
      setFileName("");
      setPreview(null);
      return;
    }
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
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <label
        className="border-2 border-dashed rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer hover:border-green-500 transition-colors bg-gray-50/50 hover:bg-green-50/20"
        style={{ borderColor: "#e0e0e0" }}
      >
        {preview ? (
          <img src={preview} alt="preview" className="h-24 object-contain rounded-lg shadow-sm" />
        ) : (
          <Upload size={24} className="text-gray-400" />
        )}
        <span className="text-sm font-medium text-gray-700 text-center truncate max-w-full px-2">
          {fileName || "Klik untuk memilih file"}
        </span>
        <span className="text-xs text-gray-400 font-medium">Format: JPG, PNG, PDF (Maksimal 1MB)</span>
        <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleChange} />
      </label>
    </div>
  );
}

function DaftarForm() {
  const searchParams = useSearchParams();
  const gelombangId = searchParams.get("gelombang");

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(INITIAL);
  const [config, setConfig] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ nomor: string } | null>(null);
  const [error, setError] = useState("");
  const [setujuSyarat, setSetujuSyarat] = useState(false);
  const [showSyaratModal, setShowSyaratModal] = useState(false);

  useEffect(() => {
    fetch("/api/config").then(r => r.json()).then(d => { if (d.ok) setConfig(d.data); });
  }, []);

  const primary = config.warna_primer || "#0f4c1e";
  const accent = config.warna_aksen || "#c8a84b";

  const syaratList = config.syarat_ketentuan
    ? config.syarat_ketentuan.split("\n").map(s => s.trim()).filter(Boolean)
    : DEFAULT_SYARAT;

  const set = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }));
  const setFile = (key: string, file: File | null) => setForm(prev => ({ ...prev, [key]: file }));

  const validate = () => {
    if (step === 1) {
      if (!form.nama_lengkap) { setError("Nama lengkap wajib diisi."); return false; }
      if (!form.jenis_kelamin) { setError("Jenis kelamin wajib dipilih."); return false; }
    }
    if (step === 3 && !form.no_hp_wali) { setError("No HP / WhatsApp wali wajib diisi."); return false; }
    if (step === 4) {
      if (form.jalur_pendaftaran === "lksa" && !form.sktm) {
        setError("Calon pendaftar jalur Beasiswa LKSA wajib mengunggah Surat Keterangan Tidak Mampu (SKTM).");
        return false;
      }
      if (!setujuSyarat) {
        setError("Anda wajib mencentang persetujuan Syarat & Ketentuan pendaftaran sebelum mengirim formulir.");
        return false;
      }
    }
    setError(""); return true;
  };

  const nextStep = () => { if (validate()) setStep(s => Math.min(s + 1, 4)); };
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

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

      // Upload berkas dokumen (maks. 1MB per file)
      if (form.foto instanceof File) payload.foto_url = await uploadFile(form.foto, "foto");
      if (form.kk instanceof File) payload.kk_url = await uploadFile(form.kk, "kk");
      if (form.akta instanceof File) payload.akta_url = await uploadFile(form.akta, "akta");
      if (form.sktm instanceof File) payload.sktm_url = await uploadFile(form.sktm, "sktm");

      const res = await fetch("/api/psb", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      setSuccess({ nomor: data.nomor_registrasi });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: `linear-gradient(160deg, ${primary} 0%, #0a3315 100%)` }}>
        <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-2xl">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: "#dcfce7" }}>
            <CheckCircle size={40} style={{ color: "#16a34a" }} />
          </div>
          <h2 className="text-2xl font-extrabold mb-2" style={{ color: primary }}>Pendaftaran Berhasil!</h2>
          <p className="text-gray-500 mb-6 text-sm">Simpan nomor registrasi Anda untuk mengecek status pendaftaran.</p>
          <div className="rounded-2xl p-4 mb-6" style={{ background: `${accent}15`, border: `2px solid ${accent}` }}>
            <p className="text-xs text-gray-500 mb-1">Nomor Registrasi</p>
            <p className="text-2xl font-mono font-bold" style={{ color: primary }}>{success.nomor}</p>
          </div>
          <p className="text-xs text-gray-400 mb-6">Panitia PSB akan menghubungi Anda melalui WhatsApp untuk informasi jadwal tes dan seleksi berikutnya.</p>
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-white text-sm shadow-md" style={{ background: primary }}>
            <ArrowLeft size={16} /> Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(160deg, ${primary} 0%, #0a3315 40%, #f8f9fa 40%)` }}>
      {/* Navbar mini */}
      <nav className="px-6 py-4 flex items-center justify-between" style={{ background: `${primary}f0` }}>
        <div className="flex items-center gap-3">
          <Link href="/" className="text-white/70 hover:text-white flex items-center gap-2 text-sm">
            <ArrowLeft size={16} /> Beranda
          </Link>
          <span className="text-white/30">|</span>
          <span className="text-white text-sm font-semibold">Formulir Pendaftaran Santri Baru</span>
        </div>
        <button
          onClick={() => setShowSyaratModal(true)}
          className="text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all text-white bg-white/10 hover:bg-white/20 border border-white/20"
        >
          <FileCheck size={14} style={{ color: accent }} />
          <span>Syarat & Ketentuan</span>
        </button>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            const active = s.id === step;
            const done = s.id < step;
            return (
              <div key={s.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all"
                    style={{
                      background: done ? "#16a34a" : active ? `linear-gradient(135deg, ${accent}, #f0d080)` : "rgba(255,255,255,0.15)",
                      color: done || active ? (active ? primary : "white") : "rgba(255,255,255,0.5)",
                      boxShadow: active ? `0 4px 15px ${accent}50` : "none",
                    }}
                  >
                    {done ? <CheckCircle size={18} /> : <Icon size={16} />}
                  </div>
                  <span className="text-xs font-medium hidden sm:block text-center" style={{ color: active ? accent : "rgba(255,255,255,0.6)" }}>
                    {s.label}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className="flex-1 h-0.5 mx-2" style={{ background: done ? "#16a34a" : "rgba(255,255,255,0.2)" }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="p-1.5" style={{ background: `linear-gradient(90deg, ${primary}, ${accent}, ${primary})` }} />
          <div className="p-6 sm:p-8">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-xl font-bold" style={{ color: primary }}>
                {STEPS[step - 1].label}
              </h2>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                Langkah {step} dari {STEPS.length}
              </span>
            </div>
            <p className="text-gray-400 text-xs mb-6">
              Pastikan seluruh informasi diisi dengan teliti dan sesuai dengan data resmi.
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-5 flex items-center gap-2">
                <AlertCircle size={18} className="shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Step 1: Jalur & Biodata */}
            {step === 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Bagian Pilihan Jalur dan Jenjang Sekolah Formal */}
                <div className="sm:col-span-2 bg-gradient-to-br from-green-50/80 to-emerald-50/30 p-4 sm:p-5 rounded-2xl border border-green-200/80 space-y-4">
                  {/* Pilihan Jalur */}
                  <div>
                    <label className="text-xs font-extrabold uppercase tracking-wider text-green-950 block mb-2">
                      Pilih Jalur Pendaftaran <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label
                        className={`flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                          form.jalur_pendaftaran === "reguler"
                            ? "border-green-600 bg-white shadow-sm ring-2 ring-green-600/20"
                            : "border-gray-200 bg-white/70 hover:bg-white"
                        }`}
                      >
                        <input
                          type="radio"
                          name="jalur_pendaftaran"
                          value="reguler"
                          checked={form.jalur_pendaftaran === "reguler"}
                          onChange={() => set("jalur_pendaftaran", "reguler")}
                          className="mt-1 text-green-700 focus:ring-green-600"
                        />
                        <div>
                          <div className="text-sm font-bold text-gray-900">Santri Reguler (MBS)</div>
                          <p className="text-xs text-gray-500 mt-0.5">Muhammadiyah Boarding School reguler berasrama</p>
                        </div>
                      </label>

                      <label
                        className={`flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                          form.jalur_pendaftaran === "lksa"
                            ? "border-amber-600 bg-white shadow-sm ring-2 ring-amber-600/20"
                            : "border-gray-200 bg-white/70 hover:bg-white"
                        }`}
                      >
                        <input
                          type="radio"
                          name="jalur_pendaftaran"
                          value="lksa"
                          checked={form.jalur_pendaftaran === "lksa"}
                          onChange={() => set("jalur_pendaftaran", "lksa")}
                          className="mt-1 text-amber-600 focus:ring-amber-500"
                        />
                        <div>
                          <div className="text-sm font-bold text-amber-950 flex items-center gap-1.5">
                            <span>Santri LKSA (Gratis)</span>
                            <span className="text-[10px] bg-amber-100 text-amber-800 font-extrabold px-1.5 py-0.5 rounded">Beasiswa</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">Khusus yatim / piatu / dhuafa asuhan LKSA</p>
                        </div>
                      </label>
                    </div>

                    {form.jalur_pendaftaran === "lksa" && (
                      <div className="text-xs text-amber-900 mt-2.5 bg-amber-50 p-2.5 rounded-xl border border-amber-200 leading-relaxed">
                        ℹ️ <strong>Syarat Khusus LKSA:</strong> Pendaftar jalur ini bebas biaya dan wajib melampirkan berkas <strong>Surat Keterangan Tidak Mampu (SKTM)</strong> atau Surat Keterangan Yatim/Kematian Orang Tua pada langkah ke-4 (Dokumen).
                      </div>
                    )}
                  </div>

                  {/* Pilihan Jenjang Formal */}
                  <div>
                    <label className="text-xs font-extrabold uppercase tracking-wider text-green-950 block mb-2">
                      Jenjang Sekolah Formal yang Dituju <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2.5">
                      {[
                        { val: "SMP", label: "SMP", desc: "SMP Muhammadiyah" },
                        { val: "SMA", label: "SMA", desc: "SMA Muhammadiyah" },
                        { val: "SMK", label: "SMK", desc: "SMK Muhammadiyah" },
                      ].map((item) => (
                        <label
                          key={item.val}
                          className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all text-center ${
                            form.jenjang_tujuan === item.val
                              ? "border-green-600 bg-white shadow-sm ring-2 ring-green-600/20"
                              : "border-gray-200 bg-white/70 hover:bg-white"
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
                          <span className="text-base font-extrabold text-gray-900">{item.label}</span>
                          <span className="text-[11px] text-gray-500 mt-0.5 hidden sm:block">{item.desc}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <InputField label="Nama Lengkap" required value={String(form.nama_lengkap)} onChange={e => set("nama_lengkap", e.target.value)} placeholder="Nama lengkap sesuai akta kelahiran" />
                </div>
                <InputField label="Nama Panggilan" value={String(form.nama_panggilan)} onChange={e => set("nama_panggilan", e.target.value)} placeholder="Nama panggilan" />
                <SelectField label="Jenis Kelamin" required value={String(form.jenis_kelamin)} onChange={e => set("jenis_kelamin", e.target.value)}>
                  <option value="">-- Pilih Jenis Kelamin --</option>
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </SelectField>
                <InputField label="Tempat Lahir" value={String(form.tempat_lahir)} onChange={e => set("tempat_lahir", e.target.value)} placeholder="Kota tempat lahir" />
                <InputField label="Tanggal Lahir" type="date" value={String(form.tanggal_lahir)} onChange={e => set("tanggal_lahir", e.target.value)} />
                <InputField label="Anak ke-" type="number" value={String(form.anak_ke)} onChange={e => set("anak_ke", e.target.value)} placeholder="1" min="1" />
                <InputField label="Jumlah Saudara" type="number" value={String(form.jumlah_saudara)} onChange={e => set("jumlah_saudara", e.target.value)} placeholder="0" min="0" />
              </div>
            )}

            {/* Step 2: Pendidikan & Alamat */}
            {step === 2 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <InputField label="Asal Sekolah Sebelumnya" value={String(form.asal_sekolah)} onChange={e => set("asal_sekolah", e.target.value)} placeholder="Contoh: SD Negeri 1 Bangsri / MTs ..." />
                </div>
                <InputField label="Peminatan / Jurusan (jika SMA/SMK)" value={String(form.jurusan)} onChange={e => set("jurusan", e.target.value)} placeholder="Contoh: IPA / IPS / TKJ / Umum" />
                <InputField label="Tahun Lulus" type="number" value={String(form.tahun_lulus)} onChange={e => set("tahun_lulus", e.target.value)} placeholder="2025" />
                <div className="sm:col-span-2">
                  <InputField label="Alamat Lengkap" value={String(form.alamat)} onChange={e => set("alamat", e.target.value)} placeholder="Nama jalan, RT/RW, Dusun" />
                </div>
                <InputField label="RT / RW" value={String(form.rt_rw)} onChange={e => set("rt_rw", e.target.value)} placeholder="001/002" />
                <InputField label="Kelurahan / Desa" value={String(form.kelurahan)} onChange={e => set("kelurahan", e.target.value)} />
                <InputField label="Kecamatan" value={String(form.kecamatan)} onChange={e => set("kecamatan", e.target.value)} />
                <InputField label="Kabupaten / Kota" value={String(form.kabupaten)} onChange={e => set("kabupaten", e.target.value)} />
                <SelectField label="Provinsi" value={String(form.provinsi)} onChange={e => set("provinsi", e.target.value)}>
                  <option value="">-- Pilih Provinsi --</option>
                  {PROVINSI.map(p => <option key={p} value={p}>{p}</option>)}
                </SelectField>
                <InputField label="Kode Pos" value={String(form.kode_pos)} onChange={e => set("kode_pos", e.target.value)} placeholder="12345" />
              </div>
            )}

            {/* Step 3: Orang Tua / Wali */}
            {step === 3 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="Nama Ayah" value={String(form.nama_ayah)} onChange={e => set("nama_ayah", e.target.value)} />
                <InputField label="Pekerjaan Ayah" value={String(form.pekerjaan_ayah)} onChange={e => set("pekerjaan_ayah", e.target.value)} />
                <InputField label="Nama Ibu" value={String(form.nama_ibu)} onChange={e => set("nama_ibu", e.target.value)} />
                <InputField label="Pekerjaan Ibu" value={String(form.pekerjaan_ibu)} onChange={e => set("pekerjaan_ibu", e.target.value)} />
                <div className="sm:col-span-2">
                  <InputField label="No. WhatsApp / HP Orang Tua/Wali" required type="tel" value={String(form.no_hp_wali)} onChange={e => set("no_hp_wali", e.target.value)} placeholder="08xxxxxxxxxx" />
                  <p className="text-[11px] text-gray-500 mt-1">Nomor ini akan digunakan untuk mengirimkan informasi tes dan kelulusan.</p>
                </div>
                <div className="sm:col-span-2">
                  <InputField label="Email Orang Tua/Wali (opsional)" type="email" value={String(form.email_wali)} onChange={e => set("email_wali", e.target.value)} placeholder="contoh@gmail.com" />
                </div>
              </div>
            )}

            {/* Step 4: Dokumen & Syarat Ketentuan */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2">
                    <FileField label="Pas Foto Santri (3x4)" name="foto" onChange={setFile} required />
                  </div>
                  <FileField label="Kartu Keluarga (KK)" name="kk" onChange={setFile} />
                  <FileField label="Akta Kelahiran" name="akta" onChange={setFile} />

                  {/* Upload Khusus Santri LKSA */}
                  {form.jalur_pendaftaran === "lksa" && (
                    <div className="sm:col-span-2 p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 space-y-2">
                      <div className="flex items-center gap-1.5 text-amber-900 font-bold text-sm">
                        <AlertCircle size={16} className="text-amber-700" />
                        <span>Berkas Wajib untuk Jalur Santri LKSA (Gratis):</span>
                      </div>
                      <FileField
                        label="Surat Keterangan Tidak Mampu (SKTM) / Keterangan Yatim"
                        name="sktm"
                        onChange={setFile}
                        required
                      />
                      <p className="text-xs text-amber-700 leading-relaxed">
                        Lampirkan scan / foto Surat Keterangan Tidak Mampu dari Kelurahan/Desa atau Surat Keterangan Kematian Orang Tua (maksimal 1MB).
                      </p>
                    </div>
                  )}
                </div>

                {/* Kotak Syarat & Ketentuan Pendaftaran */}
                <div className="p-4 sm:p-5 rounded-2xl border border-gray-200 bg-gray-50/70 space-y-3">
                  <div className="flex items-center gap-2">
                    <FileCheck size={18} style={{ color: primary }} />
                    <h3 className="font-bold text-sm text-gray-900">Syarat & Ketentuan Pendaftaran</h3>
                  </div>

                  <div className="max-h-48 overflow-y-auto pr-2 space-y-2 text-xs text-gray-600 bg-white p-3.5 rounded-xl border border-gray-100 leading-relaxed">
                    {syaratList.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="font-bold text-green-800 shrink-0">{idx + 1}.</span>
                        <span>{item.replace(/^\d+[\.\)]\s*/, "")}</span>
                      </div>
                    ))}
                  </div>

                  <label className="flex items-start gap-3 p-3 rounded-xl border border-green-200 bg-green-50/60 cursor-pointer hover:bg-green-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={setujuSyarat}
                      onChange={(e) => setSetujuSyarat(e.target.checked)}
                      className="mt-0.5 w-4 h-4 text-green-700 rounded focus:ring-green-600 cursor-pointer shrink-0"
                    />
                    <span className="text-xs text-green-950 font-medium leading-relaxed">
                      Saya menyatakan bahwa seluruh data yang diisi adalah benar, dokumen yang dilampirkan adalah sah, dan saya bersedia menaati seluruh <strong>Syarat, Ketentuan, serta Tata Tertib</strong> pondok pesantren.
                    </span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="px-6 sm:px-8 pb-8 flex items-center justify-between gap-4">
            {step > 1 ? (
              <button onClick={prevStep} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border font-medium text-sm transition-all hover:bg-gray-50" style={{ borderColor: "#e0e0e0" }}>
                <ArrowLeft size={16} /> Sebelumnya
              </button>
            ) : (
              <div />
            )}
            {step < 4 ? (
              <button onClick={nextStep} className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90" style={{ background: `linear-gradient(135deg, ${primary}, #1a6b2b)`, color: "white" }}>
                Lanjut <ArrowRight size={16} />
              </button>
            ) : (
              <button onClick={submit} disabled={submitting} className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all hover:opacity-95 disabled:opacity-60 shadow-md" style={{ background: `linear-gradient(135deg, ${accent}, #f0d080)`, color: primary }}>
                {submitting ? "Mengirim Pendaftaran..." : <><Send size={16} /> Kirim Pendaftaran</>}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal Syarat & Ketentuan Pop-up */}
      {showSyaratModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b mb-4">
              <div className="flex items-center gap-2">
                <FileCheck size={20} style={{ color: primary }} />
                <h3 className="font-extrabold text-base text-gray-900">Syarat & Ketentuan Pendaftaran</h3>
              </div>
              <button onClick={() => setShowSyaratModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-2.5 text-xs text-gray-700 leading-relaxed mb-6">
              {syaratList.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-2 rounded-lg bg-gray-50">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0" style={{ background: primary }}>
                    {idx + 1}
                  </span>
                  <span>{item.replace(/^\d+[\.\)]\s*/, "")}</span>
                </div>
              ))}
            </div>

            <div className="text-right">
              <button
                type="button"
                onClick={() => setShowSyaratModal(false)}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white shadow-sm"
                style={{ background: primary }}
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DaftarPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-800 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Memuat formulir pendaftaran...</p>
        </div>
      </div>
    }>
      <DaftarForm />
    </Suspense>
  );
}
