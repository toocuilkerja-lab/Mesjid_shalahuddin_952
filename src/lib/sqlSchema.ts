/**
 * SQL Schema & Migration Script untuk Supabase Database
 * Tabel menggunakan prefix wajib: 10001_mesjidshalahuddin_
 * CATATAN: Row Level Security (RLS) DINONAKTIFKAN (DISABLE) sesuai permintaan pengguna.
 */
export const SUPABASE_SQL_SCHEMA = `-- ========================================================
-- SISTEM KEUANGAN MASJID SHALAHUDDIN KPP PRATAMA JAYAPURA
-- TABEL DATABASE SUPABASE (Prefix: 10001_mesjidshalahuddin_)
-- ========================================================

-- 1. Buat Tabel Kategori Transaksi
CREATE TABLE IF NOT EXISTS "10001_mesjidshalahuddin_categories" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "type" VARCHAR(10) NOT NULL CHECK ("type" IN ('masuk', 'keluar')),
    "description" TEXT,
    "created_at" TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Buat Tabel Transaksi Keuangan
CREATE TABLE IF NOT EXISTS "10001_mesjidshalahuddin_transactions" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "date" DATE NOT NULL DEFAULT CURRENT_DATE,
    "type" VARCHAR(10) NOT NULL CHECK ("type" IN ('masuk', 'keluar')),
    "category" VARCHAR(100) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "amount" NUMERIC(15, 2) NOT NULL CHECK ("amount" > 0),
    "source_destination" VARCHAR(150),
    "receipt_no" VARCHAR(100),
    "notes" TEXT,
    "created_by" VARCHAR(100) DEFAULT 'Pengurus DKM',
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Buat Tabel Pengurus Masjid (Bendahara & Ketua)
CREATE TABLE IF NOT EXISTS "10001_mesjidshalahuddin_users" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "username" VARCHAR(50) UNIQUE NOT NULL,
    "password" VARCHAR(100) NOT NULL,
    "role" VARCHAR(20) NOT NULL CHECK ("role" IN ('bendahara', 'ketua')),
    "name" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Buat Tabel Petugas Shalat Jumat (Khatib & Muadzin)
CREATE TABLE IF NOT EXISTS "10001_mesjidshalahuddin_friday_schedule" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "friday_date" DATE NOT NULL UNIQUE,
    "khatib_imam" VARCHAR(150) NOT NULL,
    "muadzin" VARCHAR(150) NOT NULL,
    "updated_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_by" VARCHAR(100) DEFAULT 'Pengurus DKM'
);

-- 5. Index untuk performa query pencarian & filter
CREATE INDEX IF NOT EXISTS "idx_10001_trans_date" ON "10001_mesjidshalahuddin_transactions" ("date" DESC);
CREATE INDEX IF NOT EXISTS "idx_10001_trans_type" ON "10001_mesjidshalahuddin_transactions" ("type");
CREATE INDEX IF NOT EXISTS "idx_10001_trans_cat" ON "10001_mesjidshalahuddin_transactions" ("category");

-- 6. NONAKTIFKAN ROW LEVEL SECURITY (RLS) - Tanpa pembatasan policy
ALTER TABLE "10001_mesjidshalahuddin_categories" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "10001_mesjidshalahuddin_transactions" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "10001_mesjidshalahuddin_users" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "10001_mesjidshalahuddin_friday_schedule" DISABLE ROW LEVEL SECURITY;

-- 7. Seed Akun Pengurus Default (Password 123456)
INSERT INTO "10001_mesjidshalahuddin_users" ("username", "password", "role", "name") VALUES
('bendahara', '123456', 'bendahara', 'Bendahara Masjid Shalahuddin'),
('ketua', '123456', 'ketua', 'Ketua DKM Masjid Shalahuddin')
ON CONFLICT ("username") DO NOTHING;

-- 8. Seed Kategori Awal Masjid Shalahuddin KPP Pratama Jayapura
INSERT INTO "10001_mesjidshalahuddin_categories" ("name", "type", "description") VALUES
('Infaq Kotak Amal Jumat', 'masuk', 'Penerimaan infaq dari kotak shalat Jumat'),
('Infaq Kotak Harian Jamaah', 'masuk', 'Infaq harian jamaah masjid kpp'),
('Sedekah/Zakat Pegawai KPP', 'masuk', 'Zakat & sedekah dari pegawai KPP Pratama Jayapura'),
('Infaq Tarawih & Ramadhan', 'masuk', 'Kegiatan dakwah ramadhan & buka puasa bersama'),
('Donasi Khusus & Pembangunan', 'masuk', 'Bantuan renovasi sarana masjid & perlengkapan'),
('Honorarium Imam & Khotib', 'keluar', 'Bisyarah / honorarium imam shalat & khotib jumat'),
('Honorarium Marbot Masjid', 'keluar', 'Bisyarah pemeliharaan dan marbot harian'),
('Operasional Listrik & Air (PLN/PDAM)', 'keluar', 'Biaya daya listrik dan pasokan air bersih'),
('Pemeliharaan AC & Sound System', 'keluar', 'Service berkala pendingin ruangan & audio masjid'),
('Kebersihan & Perlengkapan Sanitasi', 'keluar', 'Pembersih karpet, sabun, pewangi, dan plastik tempat sandal'),
('Santunan Yatim & Dhuafa', 'keluar', 'Penyaluran kepedulian sosial sekitar kantor KPP');

-- 9. Seed Petugas Shalat Jumat Awal
INSERT INTO "10001_mesjidshalahuddin_friday_schedule" ("friday_date", "khatib_imam", "muadzin") VALUES
('2026-10-16', 'Ustadz H. Warna di Bany Salam', 'Bapak Dino')
ON CONFLICT ("friday_date") DO NOTHING;

-- 10. Seed 7 Contoh Transaksi Nyata Masjid Shalahuddin KPP Pratama Jayapura
INSERT INTO "10001_mesjidshalahuddin_transactions" 
("date", "type", "category", "title", "amount", "source_destination", "receipt_no", "notes", "created_by") 
VALUES
('2026-10-10', 'masuk', 'Infaq Kotak Amal Jumat', 'Infaq Shalat Jumat Pekan Ke-2 Oktober 2026', 4750000, 'Jamaah Shalat Jumat', 'KOTAK-2026-10-001', 'Penghitungan bersama DKM ba''da shalat Jumat', 'Bendahara DKM'),
('2026-10-08', 'masuk', 'Sedekah/Zakat Pegawai KPP', 'Zakat Penghasilan & Sedekah Pegawai KPP Pratama Jayapura', 8650000, 'Pegawai KPP Pratama Jayapura', 'TRF-KPP-20261008', 'Transfer kolektif payroll sedekah bulanan pegawai', 'Bendahara DKM'),
('2026-10-05', 'keluar', 'Honorarium Imam & Khotib', 'Bisyarah Khotib & Imam Shalat Jumat', 1500000, 'Ustadz Ahmad Fauzi, Lc.', 'KWT-DKM-0084', 'Khotbah bertema Integritas dan Amanah Kerja', 'Bendahara DKM'),
('2026-10-03', 'keluar', 'Operasional Listrik & Air (PLN/PDAM)', 'Pembayaran Tagihan Listrik PLN Gedung Masjid', 1850000, 'PT PLN (Persero) Jayapura', 'PLN-9843729810', 'Tagihan daya listrik AC dan penerangan masjid', 'Pengurus DKM'),
('2026-09-28', 'masuk', 'Donasi Khusus & Pembangunan', 'Donasi Perlengkapan Karpet Sajadah Shaf Utama', 5000000, 'Hamba Allah (Pejabat Fungsional KPP)', 'DON-202609-012', 'Infaq wakaf karpet shaf depan', 'Bendahara DKM'),
('2026-09-25', 'keluar', 'Pemeliharaan AC & Sound System', 'Service Rutin Cuci 4 Unit AC Standing & Cek Mic Wireless', 1200000, 'CV Sentosa Teknik Jayapura', 'INV-STJ-449', 'Penggantian baterai mic dan cuci filter evaporator', 'Seksi Sarana & Prasarana'),
('2026-09-20', 'keluar', 'Honorarium Marbot Masjid', 'Bisyarah Bulanan Marbot Masjid Shalahuddin', 2500000, 'Bpk. Ridwan (Marbot Masjid)', 'KWT-MARBOT-09', 'Bisyarah pemeliharaan kebersihan dan adzan 5 waktu bulan September', 'Bendahara DKM');
`;

export const SUPABASE_SAMPLE_DATA_SQL = `-- ====================================================================
-- IMPORT 7 CONTOH TRANSAKSI KAS MASJID SHALAHUDDIN KPP PRATAMA JAYAPURA
-- Jalankan di: Supabase Dashboard -> SQL Editor -> Run
-- ====================================================================
INSERT INTO "10001_mesjidshalahuddin_transactions" 
("date", "type", "category", "title", "amount", "source_destination", "receipt_no", "notes", "created_by") 
VALUES
('2026-10-10', 'masuk', 'Infaq Kotak Amal Jumat', 'Infaq Shalat Jumat Pekan Ke-2 Oktober 2026', 4750000, 'Jamaah Shalat Jumat', 'KOTAK-2026-10-001', 'Penghitungan bersama DKM ba''da shalat Jumat', 'Bendahara DKM'),
('2026-10-08', 'masuk', 'Sedekah/Zakat Pegawai KPP', 'Zakat Penghasilan & Sedekah Pegawai KPP Pratama Jayapura', 8650000, 'Pegawai KPP Pratama Jayapura', 'TRF-KPP-20261008', 'Transfer kolektif payroll sedekah bulanan pegawai', 'Bendahara DKM'),
('2026-10-05', 'keluar', 'Honorarium Imam & Khotib', 'Bisyarah Khotib & Imam Shalat Jumat', 1500000, 'Ustadz Ahmad Fauzi, Lc.', 'KWT-DKM-0084', 'Khotbah bertema Integritas dan Amanah Kerja', 'Bendahara DKM'),
('2026-10-03', 'keluar', 'Operasional Listrik & Air (PLN/PDAM)', 'Pembayaran Tagihan Listrik PLN Gedung Masjid', 1850000, 'PT PLN (Persero) Jayapura', 'PLN-9843729810', 'Tagihan daya listrik AC dan penerangan masjid', 'Pengurus DKM'),
('2026-09-28', 'masuk', 'Donasi Khusus & Pembangunan', 'Donasi Perlengkapan Karpet Sajadah Shaf Utama', 5000000, 'Hamba Allah (Pejabat Fungsional KPP)', 'DON-202609-012', 'Infaq wakaf karpet shaf depan', 'Bendahara DKM'),
('2026-09-25', 'keluar', 'Pemeliharaan AC & Sound System', 'Service Rutin Cuci 4 Unit AC Standing & Cek Mic Wireless', 1200000, 'CV Sentosa Teknik Jayapura', 'INV-STJ-449', 'Penggantian baterai mic dan cuci filter evaporator', 'Seksi Sarana & Prasarana'),
('2026-09-20', 'keluar', 'Honorarium Marbot Masjid', 'Bisyarah Bulanan Marbot Masjid Shalahuddin', 2500000, 'Bpk. Ridwan (Marbot Masjid)', 'KWT-MARBOT-09', 'Bisyarah pemeliharaan kebersihan dan adzan 5 waktu bulan September', 'Bendahara DKM');
`;

export const SUPABASE_FIX_RLS_SQL = `-- ====================================================================
-- NONAKTIFKAN ROW LEVEL SECURITY (RLS) PADA SEMUA TABEL
-- Jalankan di: Supabase Dashboard -> SQL Editor -> Run
-- ====================================================================
ALTER TABLE IF EXISTS "10001_mesjidshalahuddin_categories" DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "10001_mesjidshalahuddin_transactions" DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "10001_mesjidshalahuddin_users" DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "10001_mesjidshalahuddin_friday_schedule" DISABLE ROW LEVEL SECURITY;
`;

export const SUPABASE_DISABLE_RLS_SQL = SUPABASE_FIX_RLS_SQL;
