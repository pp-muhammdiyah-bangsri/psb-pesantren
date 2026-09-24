# 🕌 Web PSB Pesantren (Penerimaan Santri Baru Online)

Aplikasi Web PSB Online modern, elegan, mobile-first, dan dapat dikustomisasi penuh sesuai identitas masing-masing pondok pesantren. Dirancang terintegrasi dengan **SIMPLE-Pesantren** secara hybrid (Cloud ke Server Lokal) **tanpa perlu VPN** atau IP publik!

---

## 🌟 Fitur Unggulan

### 1. Untuk Calon Wali Santri & Santri (Publik)
- **Landing Page Elegan**: Desain bernuansa Islami premium dengan sentuhan warna emas (*emerald & gold*), responsif di HP/Tablet/Laptop.
- **Formulir Pendaftaran Multi-Step (`/daftar`)**:
  - Step 1: Biodata lengkap calon santri
  - Step 2: Pendidikan asal & alamat domisili
  - Step 3: Data orang tua / wali santri & kontak WhatsApp
  - Step 4: Upload pas foto, Kartu Keluarga, dan berkas ijazah/akta
  - Step 5: Generate nomor registrasi otomatis (`PSB-2026-XXXX`) & cetak bukti pendaftaran
- **Info Gelombang & Kuota**: Countdown timer pendaftaran, kuota per gelombang, dan rincian biaya.
- **Galeri Fasilitas & Kegiatan**: Showcase pesantren dengan kategori foto.
- **Floating WhatsApp**: Tombol tanya jawab cepat langsung ke nomor panitia PSB.

### 2. Untuk Panitia PSB (Admin Web `/admin`)
- **Dashboard Pendaftar (`/admin/dashboard`)**:
  - Statistik pendaftar real-time (Total, Menunggu, Diterima, Ditolak, Ter-import).
  - Verifikasi berkas pendaftar dan preview foto.
  - Ubah status pendaftaran (Terima / Tolak / Pending) dengan catatan verifikator.
  - Export data ke CSV/Excel untuk backup offline.
- **Manajemen Gelombang (`/admin/gelombang`)**: Buka/tutup gelombang, atur kuota, tanggal buka/tutup, dan biaya pendaftaran.
- **Manajemen Galeri (`/admin/galeri`)**: Upload dan hapus foto kegiatan/sarana pesantren.
- **Kustomisasi Pesantren (`/admin/pengaturan`)**:
  - Ganti Nama Pesantren, Tagline, dan Deskripsi
  - Upload Logo Pesantren & Foto Banner
  - Pilih Warna Primer & Aksen (branding pesantren)
  - Atur Nomor WhatsApp Panitia, Alamat, dan Media Sosial

### 3. Integrasi ke SIMPLE Pesantren (Local Server)
- **Tanpa VPN**: Web PSB dan Supabase di-host di Cloud. Komputer kantor pesantren di jaringan lokal cukup membuka menu **PSB Online** di aplikasi SIMPLE Pesantren lalu klik **"Tarik Data Terbaru"** (koneksi outbound HTTPS aman).
- **One-Click Import**: Calon santri yang berstatus `Diterima` langsung masuk ke tabel `santri` lokal SQLite lengkap dengan NIS, data wali, dan alamat.
- **Offline File Import**: Mendukung upload file CSV/JSON jika internet pesantren sedang tidak aktif.

---

## 🚀 Panduan Setup & Deploy

### Langkah 1: Setup Supabase Database
1. Buat project baru di [supabase.com](https://supabase.com) (Gratis).
2. Buka menu **SQL Editor**, buka file `supabase_schema.sql` di project ini, salin isinya lalu klik **Run**.
3. Di Supabase, buka menu **Storage**, buat bucket publik baru bernama: `psb-berkas`.
4. Buka **Project Settings > API**, salin:
   - **Project URL**
   - **anon / public key**
   - **service_role key** (simpan rahasia)

### Langkah 2: Konfigurasi Environment (`.env.local`)
Isi file `.env.local` pada folder `psb-pesantren`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
ADMIN_JWT_SECRET=rahasia-jwt-token-admin-anda-yang-panjang
```

### Langkah 3: Buat Akun Admin Pertama
Jalankan script pembuatan user admin pertama:
```bash
node scripts/setup-admin.js
```
*(Default: username `admin`, password `admin123` — dapat diubah di script sebelum dijalankan).*

### Langkah 4: Jalankan Lokal / Testing
```bash
npm run dev
# Web PSB akan berjalan di http://localhost:3001
```

### Langkah 5: Deploy ke Cloud (Vercel)
1. Push project `psb-pesantren` ke GitHub repository Anda.
2. Buka [vercel.com](https://vercel.com) dan klik **Add New > Project**, lalu import repository.
3. Masukkan Environment Variables yang sama dengan `.env.local`.
4. Klik **Deploy**. Website PSB Anda langsung live dan siap diakses publik dengan domain Anda (misal: `psb.pesantren-anda.com`)!

---

## 🔗 Menghubungkan ke SIMPLE Pesantren Lokal
1. Buka aplikasi **SIMPLE Pesantren** di komputer kantor pesantren.
2. Di menu sidebar **Data Utama**, klik **PSB Online**.
3. Masuk ke tab **⚙️ Pengaturan Koneksi Cloud**.
4. Masukkan URL Web PSB Anda (misal `https://psb-pesantren.vercel.app`) dan Supabase API Key.
5. Klik **Tes Koneksi Cloud** lalu **Simpan Pengaturan**.
6. Klik tab **🌐 Pendaftar Online (Cloud)** dan klik **Tarik Data Terbaru** untuk mulai mengimpor calon santri baru!
