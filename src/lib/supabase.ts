import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Transaction, Category, FridaySchedule } from '../types';

// Nama tabel wajib dengan prefix 10001_mesjidshalahuddin_
export const TABLE_TRANSACTIONS = '10001_mesjidshalahuddin_transactions';
export const TABLE_CATEGORIES = '10001_mesjidshalahuddin_categories';
export const TABLE_USERS = '10001_mesjidshalahuddin_users';
export const TABLE_FRIDAY_SCHEDULE = '10001_mesjidshalahuddin_friday_schedule';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.includes('supabase.co') &&
  !supabaseUrl.includes('your-project-id')
);

// Client Supabase
export const supabase: SupabaseClient | null = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false, // TIDAK menyimpan sesi ke local storage
        autoRefreshToken: false,
      },
    })
  : null;

// Default Kategori Realistis Masjid Shalahuddin KPP Pratama Jayapura
export const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'Infaq Kotak Amal Jumat', type: 'masuk', description: 'Kotak amal shalat Jumat jamaah' },
  { id: '2', name: 'Infaq Kotak Harian Jamaah', type: 'masuk', description: 'Infaq harian shalat fardhu' },
  { id: '3', name: 'Sedekah/Zakat Pegawai KPP', type: 'masuk', description: 'Potongan/sedekah pegawai pajak Jayapura' },
  { id: '4', name: 'Infaq Tarawih & Ramadhan', type: 'masuk', description: 'Infaq kegiatan bulan suci' },
  { id: '5', name: 'Donasi Khusus & Pembangunan', type: 'masuk', description: 'Sumbangan renovasi & inventaris' },
  { id: '6', name: 'Honorarium Imam & Khotib', type: 'keluar', description: 'Bisyarah imam rawatib & khotib Jumat' },
  { id: '7', name: 'Honorarium Marbot Masjid', type: 'keluar', description: 'Bisyarah petugas kebersihan/marbot' },
  { id: '8', name: 'Operasional Listrik & Air (PLN/PDAM)', type: 'keluar', description: 'Tagihan utilitas bulanan' },
  { id: '9', name: 'Pemeliharaan AC & Sound System', type: 'keluar', description: 'Perawatan audio & AC ruangan masjid' },
  { id: '10', name: 'Kebersihan & Perlengkapan Sanitasi', type: 'keluar', description: 'Karbol, parfum masjid, sabun cuci' },
  { id: '11', name: 'Konsumsi Kajian & Shalat Jumat', type: 'keluar', description: 'Snack tausiyah & air mineral jamaah' },
  { id: '12', name: 'Santunan Yatim & Dhuafa', type: 'keluar', description: 'Bantuan sosial kaum dhuafa sekitar KPP' },
];

// In-Memory Data Store (HANYA AKTIF JIKA URL SUPABASE BELUM DIISI)
// PENTING: Sesuai instruksi, TIDAK ada localStorage / sessionStorage yang digunakan!
let inMemoryTransactions: Transaction[] = [
  {
    id: 'tx-101',
    date: '2026-10-10',
    type: 'masuk',
    category: 'Infaq Kotak Amal Jumat',
    title: 'Infaq Shalat Jumat Pekan Ke-2 Oktober 2026',
    amount: 4750000,
    source_destination: 'Jamaah Shalat Jumat',
    receipt_no: 'KOTAK-2026-10-001',
    notes: "Penghitungan bersama DKM ba'da shalat Jumat",
    created_by: 'Bendahara DKM',
    created_at: new Date('2026-10-10T13:30:00Z').toISOString(),
  },
  {
    id: 'tx-102',
    date: '2026-10-08',
    type: 'masuk',
    category: 'Sedekah/Zakat Pegawai KPP',
    title: 'Zakat Penghasilan & Sedekah Pegawai KPP Pratama Jayapura',
    amount: 8650000,
    source_destination: 'Pegawai KPP Pratama Jayapura',
    receipt_no: 'TRF-KPP-20261008',
    notes: 'Transfer kolektif payroll sedekah bulanan pegawai',
    created_by: 'Bendahara DKM',
    created_at: new Date('2026-10-08T09:00:00Z').toISOString(),
  },
  {
    id: 'tx-103',
    date: '2026-10-05',
    type: 'keluar',
    category: 'Honorarium Imam & Khotib',
    title: 'Bisyarah Khotib & Imam Shalat Jumat',
    amount: 1500000,
    source_destination: 'Ustadz Ahmad Fauzi, Lc.',
    receipt_no: 'KWT-DKM-0084',
    notes: 'Khotbah bertema Integritas dan Amanah Kerja',
    created_by: 'Bendahara DKM',
    created_at: new Date('2026-10-05T14:15:00Z').toISOString(),
  },
  {
    id: 'tx-104',
    date: '2026-10-03',
    type: 'keluar',
    category: 'Operasional Listrik & Air (PLN/PDAM)',
    title: 'Pembayaran Tagihan Listrik PLN Gedung Masjid',
    amount: 1850000,
    source_destination: 'PT PLN (Persero) Jayapura',
    receipt_no: 'PLN-9843729810',
    notes: 'Tagihan daya listrik AC dan penerangan masjid',
    created_by: 'Pengurus DKM',
    created_at: new Date('2026-10-03T11:00:00Z').toISOString(),
  },
  {
    id: 'tx-105',
    date: '2026-09-28',
    type: 'masuk',
    category: 'Donasi Khusus & Pembangunan',
    title: 'Donasi Perlengkapan Karpet Sajadah Shaf Utama',
    amount: 5000000,
    source_destination: 'Hamba Allah (Pejabat Fungsional KPP)',
    receipt_no: 'DON-202609-012',
    notes: 'Infaq wakaf karpet shaf depan',
    created_by: 'Bendahara DKM',
    created_at: new Date('2026-09-28T16:00:00Z').toISOString(),
  },
  {
    id: 'tx-106',
    date: '2026-09-25',
    type: 'keluar',
    category: 'Pemeliharaan AC & Sound System',
    title: 'Service Rutin Cuci 4 Unit AC Standing & Cek Mic Wireless',
    amount: 1200000,
    source_destination: 'CV Sentosa Teknik Jayapura',
    receipt_no: 'INV-STJ-449',
    notes: 'Penggantian baterai mic dan cuci filter evaporator',
    created_by: 'Seksi Sarana & Prasarana',
    created_at: new Date('2026-09-25T15:00:00Z').toISOString(),
  },
  {
    id: 'tx-107',
    date: '2026-09-20',
    type: 'keluar',
    category: 'Honorarium Marbot Masjid',
    title: 'Bisyarah Bulanan Marbot Masjid Shalahuddin',
    amount: 2500000,
    source_destination: 'Bpk. Ridwan (Marbot Masjid)',
    receipt_no: 'KWT-MARBOT-09',
    notes: 'Bisyarah pemeliharaan kebersihan dan adzan 5 waktu bulan September',
    created_by: 'Bendahara DKM',
    created_at: new Date('2026-09-20T17:00:00Z').toISOString(),
  },
];

/**
 * Fetch semua transaksi dari Supabase (Direct Read)
 */
export async function getTransactions(): Promise<Transaction[]> {
  if (isConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from(TABLE_TRANSACTIONS)
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        console.warn('Gagal membaca tabel Supabase (mungkin tabel belum dibuat atau RLS belum diset):', error.message);
        return [];
      }
      return (data || []) as Transaction[];
    } catch (err) {
      console.error('Error saat fetch Supabase:', err);
      return [];
    }
  }

  // Hanya jika Supabase belum dikonfigurasi sama sekali di .env, tampilkan contoh in-memory
  return inMemoryTransactions;
}

/**
 * Direct write transaksi baru ke Supabase
 * TIDAK MENYIMPAN HISTORY DI LOCAL STORAGE / SESSION STORAGE!
 */
export async function createTransaction(tx: Omit<Transaction, 'id' | 'created_at'>): Promise<Transaction> {
  const newId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `tx-${Date.now()}`;
  const now = new Date().toISOString();
  const record: Transaction = {
    ...tx,
    id: newId,
    created_at: now,
  };

  if (isConfigured && supabase) {
    const { data, error } = await supabase
      .from(TABLE_TRANSACTIONS)
      .insert([record])
      .select()
      .single();

    if (error) {
      console.error('Gagal direct-write ke Supabase:', error.message);
      if (error.message.includes('row-level security') || error.message.includes('policy')) {
        throw new Error(
          `RLS di Supabase masih aktif: ${error.message}. Jalankan perintah "ALTER TABLE ... DISABLE ROW LEVEL SECURITY;" di Supabase SQL Editor.`
        );
      }
      throw new Error(`Gagal menyimpan ke Supabase: ${error.message}`);
    }

    return (data as Transaction) || record;
  }

  // In-memory fallback (murni variabel memori, tanpa localStorage)
  inMemoryTransactions = [record, ...inMemoryTransactions];
  return record;
}

/**
 * Direct update transaksi ke Supabase
 */
export async function updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction> {
  if (isConfigured && supabase) {
    const { data, error } = await supabase
      .from(TABLE_TRANSACTIONS)
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Gagal update di Supabase: ${error.message}`);
    }
    return data as Transaction;
  }

  inMemoryTransactions = inMemoryTransactions.map((item) =>
    item.id === id ? { ...item, ...updates } : item
  );
  const found = inMemoryTransactions.find((item) => item.id === id);
  if (!found) throw new Error('Transaksi tidak ditemukan');
  return found;
}

/**
 * Direct delete transaksi dari Supabase
 */
export async function deleteTransaction(id: string): Promise<void> {
  if (isConfigured && supabase) {
    const { error } = await supabase
      .from(TABLE_TRANSACTIONS)
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Gagal hapus transaksi di Supabase: ${error.message}`);
    }
    return;
  }

  inMemoryTransactions = inMemoryTransactions.filter((item) => item.id !== id);
}

/**
 * Fetch daftar kategori
 */
export async function getCategories(): Promise<Category[]> {
  if (isConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from(TABLE_CATEGORIES)
        .select('*');

      if (!error && data && data.length > 0) {
        return data as Category[];
      }
    } catch {
      // fallback ke DEFAULT_CATEGORIES
    }
  }
  return DEFAULT_CATEGORIES;
}

export interface PengurusUser {
  id?: string;
  username: string;
  role: 'bendahara' | 'ketua';
  name: string;
}

/**
 * Autentikasi Pengurus (Bendahara / Ketua) berdasarkan tabel 10001_mesjidshalahuddin_users
 */
export async function authenticatePengurus(
  usernameInput: string,
  passwordInput: string
): Promise<PengurusUser | null> {
  const cleanUsername = usernameInput.toLowerCase().trim();
  const cleanPassword = passwordInput.trim();

  // 1. Jika Supabase dikonfigurasi, cek langsung ke tabel database Supabase
  if (isConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from(TABLE_USERS)
        .select('id, username, role, name, password')
        .eq('username', cleanUsername)
        .eq('password', cleanPassword)
        .maybeSingle();

      if (!error && data) {
        return {
          id: data.id,
          username: data.username,
          role: data.role as 'bendahara' | 'ketua',
          name: data.name,
        };
      }
      if (error) {
        console.warn('Gagal membaca tabel users di Supabase:', error.message);
      }
    } catch (err) {
      console.error('Error saat login pengurus:', err);
    }
  }

  // 2. Fallback in-memory jika tabel di Supabase belum dibuat atau belum ada env
  if (cleanUsername === 'bendahara' && cleanPassword === '123456') {
    return {
      username: 'bendahara',
      role: 'bendahara',
      name: 'Bendahara Masjid Shalahuddin',
    };
  }
  if (cleanUsername === 'ketua' && cleanPassword === '123456') {
    return {
      username: 'ketua',
      role: 'ketua',
      name: 'Ketua DKM Masjid Shalahuddin',
    };
  }

  return null;
}

// In-Memory store untuk jadwal jumat jika Supabase belum terhubung
const inMemoryFridaySchedules: Record<string, FridaySchedule> = {
  'default': {
    friday_date: '2026-10-16',
    khatib_imam: 'Ustadz H. Warna di Bany Salam',
    muadzin: 'Bapak Dino',
  },
};

/**
 * Mengambil jadwal petugas Shalat Jumat (Khatib/Imam & Muadzin) dari Supabase
 */
export async function getFridaySchedule(fridayDate: string): Promise<FridaySchedule> {
  const defaultOfficer: FridaySchedule = {
    friday_date: fridayDate,
    khatib_imam: 'Ustadz H. Warna di Bany Salam',
    muadzin: 'Bapak Dino',
  };

  if (isConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from(TABLE_FRIDAY_SCHEDULE)
        .select('*')
        .eq('friday_date', fridayDate)
        .maybeSingle();

      if (!error && data) {
        return data as FridaySchedule;
      }

      // Jika tanggal tersebut belum ada, coba ambil jadwal terdekat atau gunakan default
      const { data: latest } = await supabase
        .from(TABLE_FRIDAY_SCHEDULE)
        .select('*')
        .order('friday_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (latest) {
        return {
          ...latest,
          friday_date: fridayDate,
        };
      }
    } catch (err) {
      console.warn('Gagal fetch jadwal Jumat dari Supabase:', err);
    }
  }

  return inMemoryFridaySchedules[fridayDate] || inMemoryFridaySchedules['default'] || defaultOfficer;
}

/**
 * Menyimpan jadwal petugas Shalat Jumat ke Supabase
 */
export async function saveFridaySchedule(schedule: FridaySchedule): Promise<FridaySchedule> {
  const payload = {
    friday_date: schedule.friday_date,
    khatib_imam: schedule.khatib_imam.trim(),
    muadzin: schedule.muadzin.trim(),
    updated_at: new Date().toISOString(),
    updated_by: schedule.updated_by || 'Pengurus DKM',
  };

  if (isConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from(TABLE_FRIDAY_SCHEDULE)
        .upsert(payload, { onConflict: 'friday_date' })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }
      return data as FridaySchedule;
    } catch (err: unknown) {
      console.error('Error saat menyimpan jadwal jumat ke Supabase:', err);
      throw err;
    }
  }

  inMemoryFridaySchedules[schedule.friday_date] = payload;
  return payload;
}
