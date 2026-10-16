import React from 'react';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Receipt,
  Scale,
  Sparkles,
} from 'lucide-react';
import { FinancialSummary } from '../types';
import { formatRupiah } from '../lib/utils';

interface SummaryCardsProps {
  summary: FinancialSummary;
  isAuthenticated?: boolean;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ summary, isAuthenticated = false }) => {
  const currentMonthName = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(new Date());

  // Rasio pengeluaran terhadap pemasukan
  const expenseRatio = summary.totalIncome > 0
    ? Math.round((summary.totalExpense / summary.totalIncome) * 100)
    : 0;

  // Jika pengunjung publik (belum login), hanya tampilkan Saldo Kas Utama
  if (!isAuthenticated) {
    return (
      <div className="mb-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-800 via-teal-800 to-emerald-950 p-6 sm:p-7 text-white shadow-xl shadow-emerald-950/20 border border-emerald-600/40">
          <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold tracking-widest text-emerald-200 uppercase flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Saldo Kas Utama Masjid Shalahuddin
                </span>
                <span className="font-semibold text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded text-[11px] border border-amber-400/20">
                  Real-Time
                </span>
              </div>
              <div className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-2">
                {formatRupiah(summary.currentBalance)}
              </div>
              <p className="text-xs sm:text-sm text-emerald-100/90 font-light max-w-xl">
                Posisi saldo kas terkini Masjid Shalahuddin KPP Pratama Jayapura yang siap dialokasikan untuk operasional, kemakmuran, dan kegiatan dakwah ibadah jamaah.
              </p>
            </div>
            <div className="p-4 bg-emerald-700/60 rounded-2xl border border-emerald-500/40 text-amber-300 self-start sm:self-auto shadow-inner shrink-0">
              <Wallet className="w-9 h-9" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Jika sudah login sebagai Pengurus DKM, tampilkan 4 kartu lengkap
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-6">
      {/* Saldo Kas Utama */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-800 via-teal-800 to-emerald-950 p-5 text-white shadow-lg shadow-emerald-900/20 border border-emerald-600/40">
        <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-emerald-600/20 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold tracking-wider text-emerald-200 uppercase flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Saldo Kas Utama
          </span>
          <div className="p-2 bg-emerald-700/60 rounded-xl border border-emerald-500/40 text-amber-300">
            <Wallet className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-1">
          {formatRupiah(summary.currentBalance)}
        </div>
        <div className="flex items-center justify-between text-xs text-emerald-200/90 pt-2 border-t border-emerald-700/50 mt-3">
          <span>Kas Siap Pakai</span>
          <span className="font-semibold text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
            Real-Time
          </span>
        </div>
      </div>

      {/* Total Pemasukan */}
      <div className="rounded-2xl bg-white p-5 shadow-sm hover:shadow-md transition border border-slate-200/80">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
            Total Pemasukan
          </span>
          <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-600">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl font-bold tracking-tight text-emerald-700 mb-1">
          {formatRupiah(summary.totalIncome)}
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 mt-3">
          <span>{currentMonthName}</span>
          <span className="font-semibold text-emerald-600">
            +{formatRupiah(summary.monthIncome)}
          </span>
        </div>
      </div>

      {/* Total Pengeluaran */}
      <div className="rounded-2xl bg-white p-5 shadow-sm hover:shadow-md transition border border-slate-200/80">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
            Total Pengeluaran
          </span>
          <div className="p-2 bg-rose-50 rounded-xl border border-rose-100 text-rose-600">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl font-bold tracking-tight text-rose-600 mb-1">
          {formatRupiah(summary.totalExpense)}
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 mt-3">
          <span>{currentMonthName}</span>
          <span className="font-semibold text-rose-600">
            -{formatRupiah(summary.monthExpense)}
          </span>
        </div>
      </div>

      {/* Efisiensi & Transaksi */}
      <div className="rounded-2xl bg-white p-5 shadow-sm hover:shadow-md transition border border-slate-200/80">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
            Akuntabilitas Kas
          </span>
          <div className="p-2 bg-amber-50 rounded-xl border border-amber-100 text-amber-600">
            <Receipt className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl font-bold tracking-tight text-slate-800 mb-1 flex items-baseline gap-2">
          <span>{summary.transactionCount}</span>
          <span className="text-xs font-normal text-slate-500">transaksi tercatat</span>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 mt-3">
          <span className="flex items-center gap-1">
            <Scale className="w-3.5 h-3.5 text-slate-400" /> Rasio Beban
          </span>
          <span className="font-semibold text-slate-700">
            {expenseRatio}% dari infaq
          </span>
        </div>
      </div>
    </div>
  );
};
