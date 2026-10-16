import React from 'react';
import {
  Building2,
  Lock,
  LogOut,
  PlusCircle,
  Volume2,
  ShieldCheck,
  CalendarDays,
} from 'lucide-react';
import { UserSession } from '../types';

interface HeaderProps {
  session: UserSession;
  onOpenLogin: () => void;
  onLogout: () => void;
  onOpenNewTransaction: () => void;
  onOpenPenyampaianJumat: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  session,
  onOpenLogin,
  onLogout,
  onOpenNewTransaction,
  onOpenPenyampaianJumat,
}) => {
  const currentDate = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  return (
    <header className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white shadow-xl border-b border-emerald-700/50 sticky top-0 z-30 no-print">
      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Sisi Kiri: Logo & Identitas Masjid */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-900/30 border border-amber-300/40 shrink-0">
              <Building2 className="w-7 h-7 text-emerald-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-1.5">
                  Masjid Shalahuddin
                </h1>
                <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full">
                  KPP Pratama Jayapura
                </span>
              </div>
              <p className="text-xs sm:text-sm text-emerald-200/90 font-normal">
                Sistem Informasi & Akuntabilitas Kas Keuangan Masjid
              </p>
            </div>
          </div>

          {/* Sisi Kanan (Rata Kanan): Tanggal & Tombol Aksi */}
          <div className="flex flex-col md:items-end justify-center gap-2.5">
            {/* Tanggal Rata Kanan */}
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-emerald-100 bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-700/50 shadow-inner self-start md:self-end">
              <CalendarDays className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{currentDate}</span>
            </div>

            {/* Action buttons */}
            <div className="flex items-center flex-wrap gap-2.5">
              {/* Penyampaian Jumat button */}
              <button
                onClick={onOpenPenyampaianJumat}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-800/90 hover:bg-emerald-700 text-amber-300 hover:text-amber-200 text-xs sm:text-sm font-bold border border-emerald-600/70 transition shadow-sm cursor-pointer"
                title="Lihat Naskah Mimbar & Perbandingan Saldo Penyampaian Jumat"
              >
                <Volume2 className="w-4 h-4 text-amber-400" />
                <span>Penyampaian Jumat</span>
              </button>

              {/* Authenticated user vs Guest */}
              {session.isAuthenticated ? (
                <div className="flex items-center gap-2 bg-emerald-950/60 p-1.5 rounded-xl border border-emerald-600/40">
                  {/* Form Input Button - ONLY FOR LOGGED IN USERS */}
                  <button
                    onClick={onOpenNewTransaction}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-emerald-950 font-bold text-xs sm:text-sm shadow-md transition transform active:scale-95 cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4 text-emerald-950" />
                    <span>Input Transaksi</span>
                  </button>

                  <div className="hidden md:flex flex-col text-right px-2">
                    <span className="text-[11px] text-emerald-300 flex items-center gap-1 justify-end">
                      <ShieldCheck className="w-3 h-3 text-amber-400" />
                      {session.role === 'bendahara' ? 'Bendahara DKM' : 'Pengurus Masjid'}
                    </span>
                    <span className="text-xs font-semibold text-white truncate max-w-[130px]">
                      {session.userName || 'Pengurus'}
                    </span>
                  </div>

                  <button
                    onClick={onLogout}
                    title="Keluar dari akun pengurus"
                    className="p-2 rounded-lg text-emerald-300 hover:text-white hover:bg-red-500/20 transition text-xs font-medium flex items-center gap-1 border border-transparent hover:border-red-500/30 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-red-400" />
                    <span className="hidden sm:inline text-red-300">Logout</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={onOpenLogin}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-medium text-xs sm:text-sm transition shadow-md border border-emerald-500/40 cursor-pointer"
                >
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>Akses Pengurus DKM</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
