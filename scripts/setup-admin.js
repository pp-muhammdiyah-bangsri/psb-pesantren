/**
 * scripts/setup-admin.js
 * Membuat akun admin Web PSB (Mendukung mode LOKAL & SUPABASE)
 */
const fs = require("fs");
const path = require("path");
const readline = require("readline");
const bcrypt = require("bcryptjs");

// 1. Baca .env.local
const envPath = path.resolve(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  envContent.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const idx = trimmed.indexOf("=");
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
        if (!process.env[key]) process.env[key] = val;
      }
    }
  });
}

const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supaKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const isLocalMode = process.env.USE_LOCAL_DB === "true" || !supaUrl || supaUrl.includes("your-project") || supaKey.includes("your-key");

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((r) => rl.question(q, r));

async function main() {
  console.log("\n========================================================");
  if (isLocalMode) {
    console.log("🛠️  MODE: DATABASE LOKAL (OFFLINE / TESTING)");
    console.log("Data akun admin akan disimpan di file: data/local_db.json");
  } else {
    console.log("☁️  MODE: CLOUD SUPABASE");
    console.log("URL:", supaUrl);
  }
  console.log("========================================================\n");

  const username = await ask("Username admin (misal: admin): ");
  const password = await ask("Password (min 6 karakter): ");
  const nama = await ask("Nama Lengkap Admin (misal: Panitia PSB): ");

  if (!username.trim()) {
    console.error("Username wajib diisi!");
    rl.close();
    process.exit(1);
  }

  if (!password || password.length < 6) {
    console.error("Password minimal 6 karakter!");
    rl.close();
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 10);

  if (isLocalMode) {
    // Mode Lokal: Simpan langsung ke data/local_db.json
    const dataDir = path.resolve(__dirname, "..", "data");
    const dbFile = path.join(dataDir, "local_db.json");

    let dbData = { admin_psb: [], pengaturan_psb: [], gelombang_psb: [], pendaftar: [], galeri: [] };
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    if (fs.existsSync(dbFile)) {
      try {
        dbData = JSON.parse(fs.readFileSync(dbFile, "utf8"));
      } catch (_) {}
    }

    if (!Array.isArray(dbData.admin_psb)) dbData.admin_psb = [];

    const existingIdx = dbData.admin_psb.findIndex(a => a.username.toLowerCase() === username.toLowerCase().trim());
    const adminRecord = {
      id: existingIdx !== -1 ? dbData.admin_psb[existingIdx].id : (dbData.admin_psb.length + 1),
      username: username.toLowerCase().trim(),
      password_hash: hash,
      nama: nama || "Administrator Pondok",
      created_at: new Date().toISOString()
    };

    if (existingIdx !== -1) {
      dbData.admin_psb[existingIdx] = adminRecord;
    } else {
      dbData.admin_psb.push(adminRecord);
    }

    fs.writeFileSync(dbFile, JSON.stringify(dbData, null, 2), "utf8");

    console.log(`\n✓ Berhasil! Akun Admin Lokal "${username}" berhasil dibuat/diperbarui.`);
    console.log("  Silakan login di Web PSB: http://localhost:3001/admin/login");
    console.log("  Username : " + username.toLowerCase().trim());
    console.log("  Password : " + password);
    console.log("\n💡 Catatan: Saat nanti ingin pindah ke Supabase Cloud, cukup isi URL & Key di .env.local.\n");
  } else {
    // Mode Supabase Cloud
    const { createClient } = require("@supabase/supabase-js");
    const supabase = createClient(supaUrl, supaKey);

    const { error } = await supabase.from("admin_psb").upsert({
      username: username.toLowerCase().trim(),
      password_hash: hash,
      nama: nama || "Administrator PSB"
    }, { onConflict: "username" });

    if (error) {
      console.error("\nGagal membuat admin di Supabase:", error.message);
    } else {
      console.log(`\n✓ Berhasil! Admin "${username}" siap digunakan di Supabase Cloud.`);
      console.log("  Silakan login di: http://localhost:3001/admin/login");
    }
  }

  rl.close();
}

main().catch((err) => {
  console.error("Terjadi kesalahan:", err);
  rl.close();
});
