import fs from "fs";
import path from "path";

const DATA_DIR = path.resolve(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "local_db.json");

interface LocalSchema {
  admin_psb: Array<{ id: number; username: string; password_hash: string; nama: string; created_at: string }>;
  pengaturan_psb: Array<{ key: string; value: string }>;
  gelombang_psb: Array<{
    id: number;
    nama: string;
    tanggal_buka: string;
    tanggal_tutup: string;
    kuota: number;
    biaya_pendaftaran: number;
    keterangan: string;
    is_aktif: boolean;
    created_at: string;
  }>;
  pendaftar: Array<{
    id: number;
    nomor_registrasi?: string;
    nama_lengkap: string;
    nama_panggilan?: string;
    jenis_kelamin: string;
    tempat_lahir?: string;
    tanggal_lahir?: string;
    asal_sekolah?: string;
    jurusan?: string;
    nama_ayah?: string;
    pekerjaan_ayah?: string;
    nama_ibu?: string;
    pekerjaan_ibu?: string;
    no_hp_wali?: string;
    email_wali?: string;
    alamat?: string;
    foto_url?: string;
    status: string;
    catatan_admin?: string;
    gelombang_id?: number | string;
    created_at: string;
    [key: string]: any;
  }>;
  galeri: Array<{
    id: number;
    judul: string;
    deskripsi?: string;
    foto_url: string;
    urutan: number;
    created_at: string;
  }>;
}

// Default Seed Data
const DEFAULT_DATA: LocalSchema = {
  admin_psb: [
    {
      id: 1,
      username: "admin",
      // bcrypt hash for "admin123"
      password_hash: "$2a$10$tZ2E7H4H1vK6BwN6fV4.G.7C4P3rR5kZ.9i3H6N7s5.D9Y.W2f1a6",
      nama: "Administrator Pondok",
      created_at: new Date().toISOString()
    }
  ],
  pengaturan_psb: [
    { key: "nama_pesantren", value: "Pondok Pesantren Al-Ikhlas" },
    { key: "tagline", value: "Mencetak Generasi Qur'ani, Berakhlak Mulia & Mandiri" },
    { key: "deskripsi", value: "Pondok Pesantren Modern dengan kurikulum terpadu Tahfidzul Qur'an, Dirasah Islamiyah, dan Kurikulum Nasional." },
    { key: "warna_primer", value: "#0f4c1e" },
    { key: "warna_aksen", value: "#c8a84b" },
    { key: "no_wa_admin", value: "081234567890" },
    { key: "alamat", value: "Jl. Pesantren No. 1, Jawa Timur" },
    { key: "email", value: "psb@pesantren-alikhlas.sch.id" },
    { key: "tahun_berdiri", value: "1985" },
    { key: "jumlah_santri", value: "1200+" },
    { key: "program_pendidikan", value: "Tahfidz Al-Qur'an, Madrasah Tsanawiyah, Madrasah Aliyah" }
  ],
  gelombang_psb: [
    {
      id: 1,
      nama: "Gelombang 1 - TA 2026/2027",
      tanggal_buka: "2026-01-01",
      tanggal_tutup: "2026-06-30",
      kuota: 150,
      biaya_pendaftaran: 250000,
      keterangan: "Jalur Reguler & Beasiswa Prestasi Tahfidz",
      is_aktif: true,
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      nama: "Gelombang 2 - TA 2026/2027",
      tanggal_buka: "2026-07-01",
      tanggal_tutup: "2026-08-31",
      kuota: 100,
      biaya_pendaftaran: 300000,
      keterangan: "Jalur Reguler Tahap II",
      is_aktif: false,
      created_at: new Date().toISOString()
    }
  ],
  pendaftar: [
    {
      id: 1,
      nomor_registrasi: "PSB-2026-0001",
      nama_lengkap: "Ahmad Fauzi Rahman",
      nama_panggilan: "Fauzi",
      jenis_kelamin: "L",
      tempat_lahir: "Surabaya",
      tanggal_lahir: "2012-05-14",
      asal_sekolah: "SDN 1 Surabaya",
      jurusan: "Madrasah Tsanawiyah (MTs)",
      nama_ayah: "H. Abdullah",
      pekerjaan_ayah: "Wiraswasta",
      nama_ibu: "Hj. Maryam",
      pekerjaan_ibu: "Guru",
      no_hp_wali: "081234567890",
      alamat: "Jl. Rungkut Asri No. 12, Surabaya, Jawa Timur",
      status: "diterima",
      gelombang_id: 1,
      created_at: new Date(Date.now() - 86400000 * 3).toISOString()
    },
    {
      id: 2,
      nomor_registrasi: "PSB-2026-0002",
      nama_lengkap: "Siti Nur Aisyah",
      nama_panggilan: "Aisyah",
      jenis_kelamin: "P",
      tempat_lahir: "Malang",
      tanggal_lahir: "2010-09-21",
      asal_sekolah: "SMP Negeri 3 Malang",
      jurusan: "Madrasah Aliyah (MA) IPA",
      nama_ayah: "Drs. Usman",
      pekerjaan_ayah: "PNS",
      nama_ibu: "Khadijah",
      pekerjaan_ibu: "Ibu Rumah Tangga",
      no_hp_wali: "081398765432",
      alamat: "Jl. Ijen No. 45, Malang, Jawa Timur",
      status: "diterima",
      gelombang_id: 1,
      created_at: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: 3,
      nomor_registrasi: "PSB-2026-0003",
      nama_lengkap: "Muhammad Rizqi Pratama",
      nama_panggilan: "Rizqi",
      jenis_kelamin: "L",
      tempat_lahir: "Sidoarjo",
      tanggal_lahir: "2012-11-03",
      asal_sekolah: "MI Ma'arif Sidoarjo",
      jurusan: "Tahfidz Intensif",
      nama_ayah: "Bambang Santoso",
      pekerjaan_ayah: "Karyawan Swasta",
      nama_ibu: "Nurul Hidayah",
      pekerjaan_ibu: "Wiraswasta",
      no_hp_wali: "081555667788",
      alamat: "Perum Graha Indah Blok B-3, Sidoarjo, Jawa Timur",
      status: "menunggu",
      gelombang_id: 1,
      created_at: new Date(Date.now() - 86400000 * 1).toISOString()
    }
  ],
  galeri: [
    {
      id: 1,
      judul: "Gedung Asrama & Masjid Utama",
      deskripsi: "Lingkungan pondok asri, nyaman, dan tenang untuk belajar",
      foto_url: "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800&q=80",
      urutan: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      judul: "Halaqah Tahfidzul Qur'an",
      deskripsi: "Bimbingan hafalan 30 Juz bersama masyayikh bersanad",
      foto_url: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80",
      urutan: 2,
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      judul: "Laboratorium Sains & Bahasa",
      deskripsi: "Fasilitas modern penunjang pendidikan formal berstandar nasional",
      foto_url: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=800&q=80",
      urutan: 3,
      created_at: new Date().toISOString()
    }
  ]
};

function readDb(): LocalSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DATA, null, 2), "utf8");
      return JSON.parse(JSON.stringify(DEFAULT_DATA));
    }
    const raw = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(raw);
  } catch (e) {
    return JSON.parse(JSON.stringify(DEFAULT_DATA));
  }
}

function writeDb(data: LocalSchema) {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (e) {
    console.error("[LocalDB] Write failed:", e);
  }
}

class QueryBuilder {
  private tableName: keyof LocalSchema;
  private filters: Array<(item: any) => boolean> = [];
  private orderField: string | null = null;
  private orderAsc: boolean = true;
  private limitNum: number | null = null;
  private isSingle: boolean = false;
  private pendingAction: (() => { data: any; error: any }) | null = null;

  constructor(tableName: keyof LocalSchema) {
    this.tableName = tableName;
  }

  select(fields?: string) {
    return this;
  }

  eq(col: string, val: any) {
    this.filters.push((item) => {
      if (val === "true") val = true;
      if (val === "false") val = false;
      return String(item[col]) === String(val);
    });
    return this;
  }

  in(col: string, vals: any[]) {
    this.filters.push((item) => vals.includes(item[col]));
    return this;
  }

  order(col: string, opts?: { ascending?: boolean }) {
    this.orderField = col;
    this.orderAsc = opts?.ascending !== false;
    return this;
  }

  limit(n: number) {
    this.limitNum = n;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  insert(record: any) {
    this.pendingAction = () => {
      const db = readDb();
      const list = (db[this.tableName] as any[]) || [];
      const id = list.length > 0 ? Math.max(...list.map((x: any) => x.id || 0)) + 1 : 1;
      const created = {
        ...record,
        id: record.id || id,
        created_at: record.created_at || new Date().toISOString()
      };
      list.push(created);
      writeDb(db);
      return { data: created, error: null };
    };
    return this;
  }

  update(updates: any) {
    this.pendingAction = () => {
      const db = readDb();
      const list = (db[this.tableName] as any[]) || [];
      let updatedCount = 0;
      let lastUpdated: any = null;

      for (let i = 0; i < list.length; i++) {
        const matches = this.filters.every((f) => f(list[i]));
        if (matches) {
          list[i] = { ...list[i], ...updates };
          lastUpdated = list[i];
          updatedCount++;
        }
      }
      writeDb(db);
      return { data: lastUpdated, error: null };
    };
    return this;
  }

  upsert(record: any, opts?: { onConflict?: string }) {
    this.pendingAction = () => {
      const db = readDb();
      const list = (db[this.tableName] as any[]) || [];
      const conflictCol = opts?.onConflict || (record.key !== undefined ? "key" : "id");
      const idx = list.findIndex((x: any) => String(x[conflictCol]) === String(record[conflictCol]));

      if (idx !== -1) {
        list[idx] = { ...list[idx], ...record };
      } else {
        const id = list.length > 0 ? Math.max(...list.map((x: any) => x.id || 0)) + 1 : 1;
        list.push({ ...record, id: record.id || id });
      }
      writeDb(db);
      return { data: record, error: null };
    };
    return this;
  }

  delete() {
    this.pendingAction = () => {
      const db = readDb();
      let list = (db[this.tableName] as any[]) || [];
      list = list.filter((item: any) => !this.filters.every((f) => f(item)));
      (db as any)[this.tableName] = list;
      writeDb(db);
      return { data: null, error: null };
    };
    return this;
  }

  private execute() {
    if (this.pendingAction) {
      return this.pendingAction();
    }

    const db = readDb();
    let rows = (db[this.tableName] as any[]) || [];

    // Apply filters
    for (const f of this.filters) {
      rows = rows.filter(f);
    }

    // Join with gelombang_psb if requested for pendaftar
    if (this.tableName === "pendaftar") {
      const gelombangs = db.gelombang_psb || [];
      const gMap = new Map(gelombangs.map((g) => [g.id, g]));
      rows = rows.map((p) => ({
        ...p,
        gelombang_psb: p.gelombang_id ? gMap.get(Number(p.gelombang_id)) || null : null
      }));
    }

    // Order
    if (this.orderField) {
      const field = this.orderField;
      const asc = this.orderAsc;
      rows = [...rows].sort((a, b) => {
        const va = a[field];
        const vb = b[field];
        if (va < vb) return asc ? -1 : 1;
        if (va > vb) return asc ? 1 : -1;
        return 0;
      });
    }

    // Limit
    if (this.limitNum !== null) {
      rows = rows.slice(0, this.limitNum);
    }

    // Single
    if (this.isSingle) {
      const singleRow = rows[0] || null;
      return { data: singleRow, error: singleRow ? null : { message: "Row not found" } };
    }

    return { data: rows, error: null };
  }

  then(onfulfilled?: (value: { data: any; error: any }) => any, onrejected?: (reason: any) => any) {
    const res = this.execute();
    return Promise.resolve(res).then(onfulfilled, onrejected);
  }
}

export const localDbClient = {
  from(tableName: string) {
    return new QueryBuilder(tableName as keyof LocalSchema);
  },
  storage: {
    from(_bucket: string) {
      return {
        async upload(filename: string, fileBytes: Buffer, _opts?: any) {
          try {
            const uploadDir = path.resolve(process.cwd(), "public", "uploads", path.dirname(filename));
            if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
            fs.writeFileSync(path.resolve(process.cwd(), "public", "uploads", filename), fileBytes);
            return { error: null };
          } catch (e: any) {
            return { error: e };
          }
        },
        getPublicUrl(filename: string) {
          return { data: { publicUrl: `/uploads/${filename}` } };
        }
      };
    }
  }
};
