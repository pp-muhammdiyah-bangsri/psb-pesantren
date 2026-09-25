-- =============================================
-- SCHEMA SUPABASE untuk Web PSB SIMPLE Pesantren
-- Jalankan di: Supabase Dashboard > SQL Editor
-- =============================================

-- 1. Konfigurasi pesantren (customizable)
CREATE TABLE IF NOT EXISTS pengaturan_psb (
  key TEXT PRIMARY KEY,
  value TEXT
);

-- Seed data default
INSERT INTO pengaturan_psb (key, value) VALUES
  ('nama_pesantren', 'Pesantren Anda'),
  ('nama_singkat', 'Ponpes'),
  ('tagline', 'Mencetak Generasi Rabbani yang Unggul dan Berakhlak Mulia'),
  ('alamat', 'Jl. Pesantren No. 1, Indonesia'),
  ('no_wa_admin', '6281234567890'),
  ('warna_primer', '#0f4c1e'),
  ('warna_aksen', '#c8a84b'),
  ('logo_url', ''),
  ('tahun_berdiri', '1985'),
  ('jumlah_santri', '1000+'),
  ('program_pendidikan', 'Tahfidz Al-Qur''an, Madrasah Aliyah, Kitab Kuning'),
  ('video_profil_url', '')
ON CONFLICT (key) DO NOTHING;

-- 2. Gelombang pendaftaran
CREATE TABLE IF NOT EXISTS gelombang_psb (
  id SERIAL PRIMARY KEY,
  nama TEXT NOT NULL,
  tanggal_buka DATE NOT NULL,
  tanggal_tutup DATE NOT NULL,
  kuota INTEGER,
  biaya_pendaftaran INTEGER DEFAULT 0,
  keterangan TEXT,
  is_aktif BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Data pendaftar
CREATE TABLE IF NOT EXISTS pendaftar (
  id SERIAL PRIMARY KEY,
  nomor_registrasi TEXT UNIQUE,
  gelombang_id INTEGER REFERENCES gelombang_psb(id),
  nama_lengkap TEXT NOT NULL,
  nama_panggilan TEXT,
  jenis_kelamin TEXT,
  tempat_lahir TEXT,
  tanggal_lahir DATE,
  anak_ke INTEGER,
  jumlah_saudara INTEGER,
  asal_sekolah TEXT,
  jurusan TEXT,
  tahun_lulus INTEGER,
  alamat TEXT,
  rt_rw TEXT,
  kelurahan TEXT,
  kecamatan TEXT,
  kabupaten TEXT,
  provinsi TEXT,
  kode_pos TEXT,
  nama_ayah TEXT,
  pekerjaan_ayah TEXT,
  nama_ibu TEXT,
  pekerjaan_ibu TEXT,
  no_hp_wali TEXT,
  email_wali TEXT,
  foto_url TEXT,
  kk_url TEXT,
  ijazah_url TEXT,
  akta_url TEXT,
  sktm_url TEXT,
  jenjang_tujuan TEXT DEFAULT 'SMP',
  jalur_pendaftaran TEXT DEFAULT 'reguler',
  status TEXT DEFAULT 'menunggu',
  catatan_admin TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Galeri pesantren
CREATE TABLE IF NOT EXISTS galeri (
  id SERIAL PRIMARY KEY,
  judul TEXT,
  deskripsi TEXT,
  foto_url TEXT NOT NULL,
  urutan INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Admin PSB (sederhana, tanpa tabel users Supabase Auth)
CREATE TABLE IF NOT EXISTS admin_psb (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  nama TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE pengaturan_psb ENABLE ROW LEVEL SECURITY;
ALTER TABLE gelombang_psb ENABLE ROW LEVEL SECURITY;
ALTER TABLE pendaftar ENABLE ROW LEVEL SECURITY;
ALTER TABLE galeri ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_psb ENABLE ROW LEVEL SECURITY;

-- Public read untuk pengaturan, gelombang, galeri
CREATE POLICY "public_read_pengaturan" ON pengaturan_psb FOR SELECT USING (true);
CREATE POLICY "public_read_gelombang" ON gelombang_psb FOR SELECT USING (true);
CREATE POLICY "public_read_galeri" ON galeri FOR SELECT USING (true);
-- Public insert untuk pendaftar
CREATE POLICY "public_insert_pendaftar" ON pendaftar FOR INSERT WITH CHECK (true);
-- Service role bypass untuk admin operations (menggunakan service_role key di API routes)

-- Storage bucket untuk dokumen pendaftar
INSERT INTO storage.buckets (id, name, public)
VALUES ('psb-documents', 'psb-documents', false)
ON CONFLICT DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('psb-galeri', 'psb-galeri', true)
ON CONFLICT DO NOTHING;

-- Storage policy: public read galeri
CREATE POLICY "public_read_galeri_storage" ON storage.objects FOR SELECT
  USING (bucket_id = 'psb-galeri');
-- Public insert dokumen
CREATE POLICY "public_insert_documents" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'psb-documents');

-- =============================================
-- MIGRATION: Jalankan di Supabase SQL Editor jika tabel pendaftar sudah ada
-- =============================================
ALTER TABLE pendaftar ADD COLUMN IF NOT EXISTS jenjang_tujuan TEXT DEFAULT 'SMP';
ALTER TABLE pendaftar ADD COLUMN IF NOT EXISTS jalur_pendaftaran TEXT DEFAULT 'reguler';
ALTER TABLE pendaftar ADD COLUMN IF NOT EXISTS akta_url TEXT;
ALTER TABLE pendaftar ADD COLUMN IF NOT EXISTS sktm_url TEXT;