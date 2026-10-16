import React, { useState } from 'react';
import {
  X,
  Database,
  GitBranch,
  Cloud,
  Copy,
  Check,
  FolderTree,
} from 'lucide-react';
import { SUPABASE_SQL_SCHEMA, SUPABASE_SAMPLE_DATA_SQL, SUPABASE_DISABLE_RLS_SQL } from '../lib/sqlSchema';
import { isConfigured } from '../lib/supabase';

interface SetupGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SetupGuideModal: React.FC<SetupGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'supabase' | 'structure' | 'github' | 'vercel'>('supabase');
  const [copiedSQL, setCopiedSQL] = useState(false);
  const [copiedSampleSQL, setCopiedSampleSQL] = useState(false);
  const [copiedDisableRLS, setCopiedDisableRLS] = useState(false);

  const handleCopySQL = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSQL(true);
    setTimeout(() => setCopiedSQL(false), 2500);
  };

  const handleCopySampleSQL = () => {
    navigator.clipboard.writeText(SUPABASE_SAMPLE_DATA_SQL);
    setCopiedSampleSQL(true);
    setTimeout(() => setCopiedSampleSQL(false), 2500);
  };

  const handleCopyDisableRLS = () => {
    navigator.clipboard.writeText(SUPABASE_DISABLE_RLS_SQL);
    setCopiedDisableRLS(true);
    setTimeout(() => setCopiedDisableRLS(false), 2500);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-emerald-950/70 backdrop-blur-xs no-print">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-800 via-teal-900 to-emerald-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-400 text-emerald-950 font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white">
                Panduan Setup Supabase, GitHub & Vercel
              </h3>
              <p className="text-xs text-emerald-200/90">
                Arsitektur & Konfigurasi Masjid Shalahuddin KPP Pratama Jayapura
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="p-2 bg-slate-100 flex flex-wrap gap-1 border-b border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('supabase')}
            className={`px-3 py-2 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'supabase'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span>1. Setup Supabase & SQL</span>
          </button>
          <button
            onClick={() => setActiveTab('structure')}
            className={`px-3 py-2 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'structure'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FolderTree className="w-3.5 h-3.5 text-amber-500" />
            <span>2. Struktur Folder</span>
          </button>
          <button
            onClick={() => setActiveTab('github')}
            className={`px-3 py-2 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'github'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5 text-slate-700" />
            <span>3. Push ke GitHub</span>
          </button>
          <button
            onClick={() => setActiveTab('vercel')}
            className={`px-3 py-2 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'vercel'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Cloud className="w-3.5 h-3.5 text-cyan-600" />
            <span>4. Deploy ke Vercel</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-700">
          {/* TAB 1: SUPABASE */}
          {activeTab === 'supabase' && (
            <div className="space-y-4">
              <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
                isConfigured
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}>
                <div>
                  <div className="font-bold flex items-center gap-1.5">
                    {isConfigured ? '✓ Supabase Terhubung Aktif' : '⚡ Mode In-Memory Aktif (Tanpa Supabase Env)'}
                  </div>
                  <div className="text-xs mt-0.5 opacity-90">
                    {isConfigured
                      ? 'Aplikasi sedang membaca & menulis data langsung ke Supabase.'
                      : 'Data transaksi saat ini berjalan di memori browser. Masukkan kredensial Supabase di .env untuk integrasi cloud.'}
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-800 text-sm">
                  Langkah Setup Database Supabase:
                </h4>
                <ol className="list-decimal list-inside space-y-1 text-xs text-slate-600">
                  <li>Buka <strong>https://supabase.com</strong> dan buat project baru (misal: <code className="bg-slate-200 px-1 py-0.5 rounded">masjid-shalahuddin-kpp</code>).</li>
                  <li>Di menu sebelah kiri dashboard Supabase, klik <strong>SQL Editor</strong>.</li>
                  <li>Klik tombol <strong>&quot;Salin Skrip Lengkap&quot;</strong> di bawah ini, lalu tempel (paste) ke SQL Editor Supabase.</li>
                  <li>Klik tombol <strong>Run</strong> untuk membuat tabel:
                    <ul className="list-disc list-inside ml-4 mt-1 font-mono text-emerald-700">
                      <li>10001_mesjidshalahuddin_transactions</li>
                      <li>10001_mesjidshalahuddin_categories</li>
                      <li>10001_mesjidshalahuddin_users</li>
                      <li>10001_mesjidshalahuddin_friday_schedule</li>
                    </ul>
                  </li>
                  <li>Masuk ke <strong>Project Settings &rarr; API</strong>, salin <strong>Project URL</strong> dan <strong>anon/public Key</strong>.</li>
                  <li>Simpan di file <code className="bg-slate-200 px-1 py-0.5 rounded">.env</code>:
                    <pre className="mt-1 p-2 bg-slate-900 text-emerald-300 rounded font-mono text-[11px]">
VITE_SUPABASE_URL=https://xyzcompany.supabase.co
VITE_SUPABASE_ANON_KEY=eyJh...
                    </pre>
                  </li>
                </ol>
              </div>

              {/* Copy Full SQL Schema Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-700">
                    1. Skrip Lengkap (Tabel + Kategori + 7 Data Contoh)
                  </span>
                  <button
                    onClick={handleCopySQL}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition cursor-pointer"
                  >
                    {copiedSQL ? <Check className="w-3.5 h-3.5 text-amber-300" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSQL ? 'Tersalin!' : 'Salin Skrip Lengkap'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-950 text-emerald-400 rounded-xl font-mono text-[11px] overflow-x-auto max-h-48 border border-slate-800">
                  {SUPABASE_SQL_SCHEMA}
                </pre>
              </div>

              {/* Copy Only 7 Sample Transactions Section */}
              <div className="pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-700 block">
                      2. Hanya 7 Contoh Data Transaksi Kas (INSERT)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Gunakan ini jika tabel sudah Anda buat sebelumnya di Supabase
                    </span>
                  </div>
                  <button
                    onClick={handleCopySampleSQL}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition shrink-0 cursor-pointer"
                  >
                    {copiedSampleSQL ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSampleSQL ? 'Tersalin!' : 'Salin 7 Data Contoh'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-950 text-amber-300 rounded-xl font-mono text-[11px] overflow-x-auto max-h-48 border border-slate-800">
                  {SUPABASE_SAMPLE_DATA_SQL}
                </pre>
              </div>

              {/* Disable RLS Section */}
              <div className="pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-bold text-xs uppercase tracking-wider text-rose-700 block">
                      3. Matikan Row Level Security (DISABLE RLS)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Jalankan skrip ini agar pembacaan & penulisan kas tidak diblokir policy Supabase
                    </span>
                  </div>
                  <button
                    onClick={handleCopyDisableRLS}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition shrink-0 cursor-pointer"
                  >
                    {copiedDisableRLS ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedDisableRLS ? 'Tersalin!' : 'Salin Skrip Matikan RLS'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-950 text-rose-300 rounded-xl font-mono text-[11px] overflow-x-auto max-h-36 border border-slate-800">
                  {SUPABASE_DISABLE_RLS_SQL}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 2: FOLDER STRUCTURE */}
          {activeTab === 'structure' && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-800 text-sm">
                Struktur Proyek Web Keuangan Masjid Shalahuddin:
              </h4>
              <p className="text-xs text-slate-600">
                Arsitektur terstruktur rapi memisahkan logika data Supabase, visualisasi komponen, proteksi autentikasi, dan aturan direct-write:
              </p>
              <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs leading-relaxed overflow-x-auto border border-slate-800">
{`masjid-shalahuddin-keuangan/
├── public/                 # Favicon & aset statis
├── src/
│   ├── components/         # Komponen UI Modular
│   │   ├── Header.tsx             # Header identitas masjid & status sesi
│   │   ├── SummaryCards.tsx       # Kartu metrik saldo, masuk, keluar real-time
│   │   ├── TransactionFilters.tsx # Filter kategori, tipe kas, & pencarian
│   │   ├── TransactionTable.tsx   # Tabel publik & aksi edit/hapus pengurus
│   │   ├── TransactionModal.tsx   # Form input kas (Direct Write, No LocalStorage)
│   │   ├── TransactionCharts.tsx  # Grafik distribusi pos kategori
│   │   ├── LoginModal.tsx         # Modal login autentikasi DKM/Supabase
│   │   ├── PrintReportModal.tsx   # Template cetak laporan resmi Kop DKM
│   │   └── SetupGuideModal.tsx    # Panduan setup SQL, GitHub, & Vercel
│   ├── lib/
│   │   ├── supabase.ts            # Client Supabase & method direct-write
│   │   ├── sqlSchema.ts           # DDL SQL tabel 10001_mesjidshalahuddin_*
│   │   └── utils.ts               # Format Rupiah & tanggal Indonesia, Ekspor CSV
│   ├── types/
│   │   └── index.ts               # Definisi TypeScript model transaksi & session
│   ├── App.tsx                    # Controller utama aplikasi
│   ├── index.css                  # Styling Tailwind CSS & CSS Print Media
│   └── main.tsx                   # React root mount
├── .env.example            # Contoh variabel lingkungan
├── index.html              # Entry HTML & Meta Tag
├── package.json            # Daftar dependensi (@supabase/supabase-js, lucide, dll)
├── tsconfig.json           # Konfigurasi TypeScript
├── vercel.json             # Konfigurasi routing rewrite untuk Vercel
└── vite.config.ts          # Bundler Vite`}
              </pre>
            </div>
          )}

          {/* TAB 3: GITHUB PUSH */}
          {activeTab === 'github' && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-800 text-sm">
                Langkah Push Kode ke Repository GitHub:
              </h4>
              <ol className="list-decimal list-inside space-y-2 text-xs text-slate-600">
                <li>Buka terminal pada direktori root proyek Anda.</li>
                <li>Inisialisasi git dan tambahkan seluruh berkas:</li>
              </ol>
              <pre className="p-3 bg-slate-950 text-amber-300 rounded-xl font-mono text-xs overflow-x-auto">
{`git init
git add .
git commit -m "feat: Inisialisasi aplikasi keuangan Masjid Shalahuddin KPP Pratama Jayapura"
git branch -M main`}
              </pre>
              <ol start={3} className="list-decimal list-inside space-y-2 text-xs text-slate-600">
                <li>Buat repository baru di GitHub (misal: <code>masjid-shalahuddin-kpp-jayapura</code>).</li>
                <li>Hubungkan dan push ke GitHub:</li>
              </ol>
              <pre className="p-3 bg-slate-950 text-amber-300 rounded-xl font-mono text-xs overflow-x-auto">
{`git remote add origin https://github.com/USERNAME_ANDA/masjid-shalahuddin-kpp-jayapura.git
git push -u origin main`}
              </pre>
            </div>
          )}

          {/* TAB 4: VERCEL DEPLOY */}
          {activeTab === 'vercel' && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-800 text-sm">
                Langkah Deploy ke Vercel (Gratis & Cepat):
              </h4>
              <ol className="list-decimal list-inside space-y-2 text-xs text-slate-600">
                <li>Buka <strong>https://vercel.com</strong> dan login dengan akun GitHub Anda.</li>
                <li>Klik tombol <strong>&quot;Add New...&quot; &rarr; &quot;Project&quot;</strong>.</li>
                <li>Pilih repository <strong>masjid-shalahuddin-kpp-jayapura</strong> lalu klik <strong>Import</strong>.</li>
                <li>Pada bagian <strong>Environment Variables</strong>, tambahkan 2 variabel berikut:
                  <div className="mt-2 space-y-1 font-mono text-[11px]">
                    <div className="p-2 bg-slate-100 rounded border border-slate-200">
                      <strong>Name:</strong> VITE_SUPABASE_URL <br />
                      <strong>Value:</strong> https://YOUR_PROJECT_ID.supabase.co
                    </div>
                    <div className="p-2 bg-slate-100 rounded border border-slate-200">
                      <strong>Name:</strong> VITE_SUPABASE_ANON_KEY <br />
                      <strong>Value:</strong> YOUR_SUPABASE_ANON_KEY
                    </div>
                  </div>
                </li>
                <li>Klik tombol <strong>Deploy</strong>. Dalam 1 menit aplikasi siap diakses oleh seluruh jamaah dan pegawai KPP Pratama Jayapura!</li>
              </ol>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            Tutup Panduan
          </button>
        </div>
      </div>
    </div>
  );
};
