"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  User, MapPin, GraduationCap, Users, Upload,
  CheckCircle, ArrowLeft, ArrowRight, Send, BookOpen
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
  { id: 1, label: "Biodata", icon: User },
  { id: 2, label: "Pendidikan & Alamat", icon: MapPin },
  { id: 3, label: "Orang Tua", icon: Users },
  { id: 4, label: "Dokumen", icon: Upload },
];

type FormData = Record<string, string | File | null>;

const INITIAL: FormData = {
  nama_lengkap: "", nama_panggilan: "", jenis_kelamin: "",
  tempat_lahir: "", tanggal_lahir: "", anak_ke: "", jumlah_saudara: "",
  asal_sekolah: "", jurusan: "", tahun_lulus: "",
  alamat: "", rt_rw: "", kelurahan: "", kecamatan: "",
  kabupaten: "", provinsi: "", kode_pos: "",
  nama_ayah: "", pekerjaan_ayah: "", nama_ibu: "", pekerjaan_ibu: "",
  no_hp_wali: "", email_wali: "",
  foto: null, kk: null, ijazah: null,
};

function InputField({ label, required, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; required?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        className="border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all"
        style={{ borderColor: "#e0e0e0", focusRingColor: "#0f4c1e" } as React.CSSProperties}
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

function FileField({ label, name, onChange, required }: { label: string; name: string; onChange: (name: string, file: File | null) => void; required?: boolean }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
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
      <label className="border-2 border-dashed rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer hover:border-green-400 transition-colors" style={{ borderColor: "#e0e0e0" }}>
        {preview ? (
          <img src={preview} alt="preview" className="h-24 object-contain rounded-lg" />
        ) : (
          <Upload size={24} className="text-gray-400" />
        )}
        <span className="text-sm text-gray-500">{fileName || "Klik untuk pilih file"}</span>
        <span className="text-xs text-gray-400">JPG, PNG, PDF (maks. 5MB)</span>
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

  useEffect(() => {
    fetch("/api/config").then(r => r.json()).then(d => { if (d.ok) setConfig(d.data); });
  }, []);

  const primary = config.warna_primer || "#0f4c1e";
  const accent = config.warna_aksen || "#c8a84b";

  const set = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }));
  const setFile = (key: string, file: File | null) => setForm(prev => ({ ...prev, [key]: file }));

  const validate = () => {
    if (step === 1 && !form.nama_lengkap) { setError("Nama lengkap wajib diisi."); return false; }
    if (step === 3 && !form.no_hp_wali) { setError("No HP wali wajib diisi."); return false; }
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

      // Upload files
      if (form.foto instanceof File) payload.foto_url = await uploadFile(form.foto, "foto");
      if (form.kk instanceof File) payload.kk_url = await uploadFile(form.kk, "kk");
      if (form.ijazah instanceof File) payload.ijazah_url = await uploadFile(form.ijazah, "ijazah");

      const res = await fetch("/api/psb", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      setSuccess({ nomor: data.nomor_registrasi });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan. Coba lagi.");
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
          <p className="text-xs text-gray-400 mb-6">Tim admin akan menghubungi Anda melalui WhatsApp untuk informasi selanjutnya.</p>
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-white text-sm" style={{ background: primary }}>
            <ArrowLeft size={16} /> Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(160deg, ${primary} 0%, #0a3315 40%, #f8f9fa 40%)` }}>
      {/* Navbar mini */}
      <nav className="px-6 py-4 flex items-center gap-3" style={{ background: `${primary}f0` }}>
        <Link href="/" className="text-white/70 hover:text-white flex items-center gap-2 text-sm">
          <ArrowLeft size={16} /> Beranda
        </Link>
        <span className="text-white/30">|</span>
        <span className="text-white text-sm font-semibold">Form Pendaftaran Santri Baru</span>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
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
                  <span className="text-xs font-medium hidden sm:block" style={{ color: active ? accent : "rgba(255,255,255,0.4)" }}>
                    {s.label}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className="flex-1 h-0.5 mx-2" style={{ background: done ? "#16a34a" : "rgba(255,255,255,0.15)" }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="p-1.5" style={{ background: `linear-gradient(90deg, ${primary}, ${accent}, ${primary})` }} />
          <div className="p-6 sm:p-8">
            <h2 className="text-xl font-bold mb-1" style={{ color: primary }}>
              {STEPS[step - 1].label}
            </h2>
            <p className="text-gray-400 text-sm mb-6">Langkah {step} dari {STEPS.length}</p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>
            )}

            {/* Step 1: Biodata */}
            {step === 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <InputField label="Nama Lengkap" required value={String(form.nama_lengkap)} onChange={e => set("nama_lengkap", e.target.value)} placeholder="Nama sesuai akta kelahiran" />
                </div>
                <InputField label="Nama Panggilan" value={String(form.nama_panggilan)} onChange={e => set("nama_panggilan", e.target.value)} placeholder="Nama panggilan" />
                <SelectField label="Jenis Kelamin" required value={String(form.jenis_kelamin)} onChange={e => set("jenis_kelamin", e.target.value)}>
                  <option value="">-- Pilih --</option>
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </SelectField>
                <InputField label="Tempat Lahir" value={String(form.tempat_lahir)} onChange={e => set("tempat_lahir", e.target.value)} placeholder="Kota lahir" />
                <InputField label="Tanggal Lahir" type="date" value={String(form.tanggal_lahir)} onChange={e => set("tanggal_lahir", e.target.value)} />
                <InputField label="Anak ke-" type="number" value={String(form.anak_ke)} onChange={e => set("anak_ke", e.target.value)} placeholder="1" min="1" />
                <InputField label="Jumlah Saudara" type="number" value={String(form.jumlah_saudara)} onChange={e => set("jumlah_saudara", e.target.value)} placeholder="0" min="0" />
              </div>
            )}

            {/* Step 2: Pendidikan & Alamat */}
            {step === 2 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <InputField label="Asal Sekolah" value={String(form.asal_sekolah)} onChange={e => set("asal_sekolah", e.target.value)} placeholder="Nama sekolah asal" />
                </div>
                <InputField label="Jurusan/Program" value={String(form.jurusan)} onChange={e => set("jurusan", e.target.value)} placeholder="Jurusan (jika ada)" />
                <InputField label="Tahun Lulus" type="number" value={String(form.tahun_lulus)} onChange={e => set("tahun_lulus", e.target.value)} placeholder="2024" />
                <div className="sm:col-span-2"><InputField label="Alamat Lengkap" value={String(form.alamat)} onChange={e => set("alamat", e.target.value)} placeholder="Jl. ..." /></div>
                <InputField label="RT/RW" value={String(form.rt_rw)} onChange={e => set("rt_rw", e.target.value)} placeholder="001/002" />
                <InputField label="Kelurahan/Desa" value={String(form.kelurahan)} onChange={e => set("kelurahan", e.target.value)} />
                <InputField label="Kecamatan" value={String(form.kecamatan)} onChange={e => set("kecamatan", e.target.value)} />
                <InputField label="Kabupaten/Kota" value={String(form.kabupaten)} onChange={e => set("kabupaten", e.target.value)} />
                <SelectField label="Provinsi" value={String(form.provinsi)} onChange={e => set("provinsi", e.target.value)}>
                  <option value="">-- Pilih Provinsi --</option>
                  {PROVINSI.map(p => <option key={p} value={p}>{p}</option>)}
                </SelectField>
                <InputField label="Kode Pos" value={String(form.kode_pos)} onChange={e => set("kode_pos", e.target.value)} placeholder="12345" />
              </div>
            )}

            {/* Step 3: Orang Tua */}
            {step === 3 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="Nama Ayah" value={String(form.nama_ayah)} onChange={e => set("nama_ayah", e.target.value)} />
                <InputField label="Pekerjaan Ayah" value={String(form.pekerjaan_ayah)} onChange={e => set("pekerjaan_ayah", e.target.value)} />
                <InputField label="Nama Ibu" value={String(form.nama_ibu)} onChange={e => set("nama_ibu", e.target.value)} />
                <InputField label="Pekerjaan Ibu" value={String(form.pekerjaan_ibu)} onChange={e => set("pekerjaan_ibu", e.target.value)} />
                <div className="sm:col-span-2">
                  <InputField label="No HP Wali/Orang Tua" required type="tel" value={String(form.no_hp_wali)} onChange={e => set("no_hp_wali", e.target.value)} placeholder="08xxxxxxxxxx" />
                </div>
                <div className="sm:col-span-2">
                  <InputField label="Email Wali (opsional)" type="email" value={String(form.email_wali)} onChange={e => set("email_wali", e.target.value)} placeholder="email@contoh.com" />
                </div>
              </div>
            )}

            {/* Step 4: Dokumen */}
            {step === 4 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <FileField label="Pas Foto (3x4)" name="foto" onChange={setFile} required />
                </div>
                <FileField label="Kartu Keluarga" name="kk" onChange={setFile} />
                <FileField label="Ijazah / SKL" name="ijazah" onChange={setFile} />
                <div className="sm:col-span-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-700">
                  <strong>Catatan:</strong> Dokumen asli akan diminta saat verifikasi di pesantren. File upload hanya untuk kelengkapan administrasi awal.
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
              <button onClick={nextStep} className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90 hover:scale-105" style={{ background: `linear-gradient(135deg, ${primary}, #1a6b2b)`, color: "white" }}>
                Lanjut <ArrowRight size={16} />
              </button>
            ) : (
              <button onClick={submit} disabled={submitting} className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-105 disabled:opacity-60" style={{ background: `linear-gradient(135deg, ${accent}, #f0d080)`, color: primary }}>
                {submitting ? "Mengirim..." : <><Send size={16} /> Kirim Pendaftaran</>}
              </button>
            )}
          </div>
        </div>
      </div>
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
