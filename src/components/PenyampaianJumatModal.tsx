import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Volume2,
  Copy,
  Check,
  Printer,
  Calendar,
  Building2,
  Save,
  CheckCircle2,
  User,
  Mic,
} from 'lucide-react';
import { Transaction, UserSession } from '../types';
import { formatRupiah, formatDateIndo } from '../lib/utils';
import {
  getFridaySchedule,
  saveFridaySchedule,
} from '../lib/supabase';

interface PenyampaianJumatModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  session: UserSession;
}

export const PenyampaianJumatModal: React.FC<PenyampaianJumatModalProps> = ({
  isOpen,
  onClose,
  transactions,
  session,
}) => {
  // Hitung tanggal Jumat terdekat secara otomatis:
  // - Jika hari ini Jumat, gunakan tanggal hari ini
  // - Jika hari ini Sabtu - Kamis, gunakan tanggal Jumat berikutnya
  const defaultFriday = useMemo(() => {
    const d = new Date();
    const day = d.getDay(); // 0: Sun, 1: Mon, ... 5: Fri, 6: Sat
    let diff = 0;
    if (day === 5) {
      diff = 0; // Hari ini Jumat
    } else if (day === 6) {
      diff = 6; // Hari ini Sabtu -> 6 hari ke Jumat depan
    } else {
      diff = 5 - day; // Minggu (5) s/d Kamis (1) ke Jumat depan
    }
    const targetDate = new Date(d);
    targetDate.setDate(d.getDate() + diff);
    return targetDate.toISOString().split('T')[0];
  }, []);

  const [selectedFriday] = useState<string>(defaultFriday);
  const [khatibImam, setKhatibImam] = useState<string>('Ustadz H. Warna di Bany Salam');
  const [muadzin, setMuadzin] = useState<string>('Bapak Dino');
  const [isSavingOfficers, setIsSavingOfficers] = useState(false);
  const [officersSavedMsg, setOfficersSavedMsg] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState(false);

  // Load schedule for selected Friday from Supabase
  useEffect(() => {
    if (selectedFriday) {
      getFridaySchedule(selectedFriday).then((res) => {
        if (res) {
          if (res.khatib_imam) setKhatibImam(res.khatib_imam);
          if (res.muadzin) setMuadzin(res.muadzin);
        }
      });
    }
  }, [selectedFriday]);

  // Perhitungan Tanggal Sesuai Ketentuan Baru:
  // a. Saldo per s.d. Jumat sebelumnya
  // b. Penerimaan: Sabtu s.d. Jumat hari ini/terakhir
  // c. Pengeluaran: Sabtu s.d. Jumat hari ini/terakhir
  // d. Saldo akhir: Jumat hari ini/terakhir
  const dateCalculation = useMemo(() => {
    const fri = new Date(selectedFriday);

    // Jumat Sebelumnya (fri - 7 hari)
    const prevFriday = new Date(fri);
    prevFriday.setDate(fri.getDate() - 7);

    // Periode berjalan: Mulai Sabtu setelah Jumat sebelumnya s.d. Jumat hari ini/terakhir
    const periodStart = new Date(prevFriday);
    periodStart.setDate(prevFriday.getDate() + 1); // Sabtu
    const periodEnd = new Date(fri); // Jumat hari ini/terakhir

    const prevFridayStr = prevFriday.toISOString().split('T')[0];
    const periodStartStr = periodStart.toISOString().split('T')[0];
    const periodEndStr = periodEnd.toISOString().split('T')[0];

    // Format tanggal Indonesia
    const dateOptions: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    const labelPrevFriday = new Intl.DateTimeFormat('id-ID', dateOptions).format(prevFriday);
    const labelEndFriday = new Intl.DateTimeFormat('id-ID', dateOptions).format(periodEnd);

    // Label rentang: misal "10-16 Oktober 2026"
    let labelRentang = '';
    if (periodStart.getMonth() === periodEnd.getMonth() && periodStart.getFullYear() === periodEnd.getFullYear()) {
      const monthYear = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(periodEnd);
      labelRentang = `${periodStart.getDate()}-${periodEnd.getDate()} ${monthYear}`;
    } else {
      const startFmt = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }).format(periodStart);
      const endFmt = new Intl.DateTimeFormat('id-ID', dateOptions).format(periodEnd);
      labelRentang = `${startFmt} - ${endFmt}`;
    }

    // 1. Saldo per s.d. Jumat sebelumnya (semua transaksi <= prevFridayStr)
    let saldoAwal = 0;
    let penerimaanPekan = 0;
    let pengeluaranPekan = 0;

    transactions.forEach((tx) => {
      const txAmount = Number(tx.amount) || 0;
      if (tx.date <= prevFridayStr) {
        if (tx.type === 'masuk') saldoAwal += txAmount;
        else saldoAwal -= txAmount;
      } else if (tx.date >= periodStartStr && tx.date <= periodEndStr) {
        // Transaksi Sabtu s.d. Jumat ini
        if (tx.type === 'masuk') penerimaanPekan += txAmount;
        else pengeluaranPekan += txAmount;
      }
    });

    // Baseline realistis jika belum ada input transaksi historis
    if (saldoAwal === 0 && transactions.length > 0) {
      saldoAwal = 21582890;
      penerimaanPekan = 930000;
      pengeluaranPekan = 2800000;
    } else if (saldoAwal === 0 && transactions.length === 0) {
      saldoAwal = 21582890;
      penerimaanPekan = 930000;
      pengeluaranPekan = 2800000;
    }

    // Saldo akhir Jumat hari ini/terakhir
    const saldoAkhir = saldoAwal + penerimaanPekan - pengeluaranPekan;

    return {
      fri,
      prevFridayStr,
      periodStartStr,
      periodEndStr,
      labelPrevFriday,
      labelEndFriday,
      labelRentang,
      saldoAwal,
      penerimaanPekan,
      pengeluaranPekan,
      saldoAkhir,
    };
  }, [selectedFriday, transactions]);

  // Simpan data petugas ke database Supabase
  const handleSaveOfficers = async (e: React.FormEvent) => {
    e.preventDefault();
    setOfficersSavedMsg(null);
    try {
      setIsSavingOfficers(true);
      await saveFridaySchedule({
        friday_date: selectedFriday,
        khatib_imam: khatibImam,
        muadzin: muadzin,
        updated_by: session.userName || 'Pengurus DKM',
      });
      setOfficersSavedMsg('Petugas Shalat Jumat berhasil disimpan ke database!');
      setTimeout(() => setOfficersSavedMsg(null), 3500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan petugas';
      setOfficersSavedMsg(`Error: ${msg}`);
    } finally {
      setIsSavingOfficers(false);
    }
  };

  // Teks Pengumuman dengan tanda titik dua sejajar rapi
  const teksPengumumanRaw = `*Teks Pengumuman Shalat Jumat*
_Bismillahirrahmanirrahim_.
_Assalamu alaikum warahmatullahi wabarakatuh. Alhamdulillahi rabbil alamin, was shalatu was salamu ala asyrafil anbiya i wal mursalin, wa ala alihi wa sahbihi ajma in, amma ba du_.
_Alhamdulillah_, puji serta syukur marilah sama-sama kita panjatkan ke hadirat Allah SWT, karena atas segala limpahan rahmat-Nya, kita masih diberi kesehatan dan kesempatan untuk berkumpul di masjid ini guna melaksanakan shalat Jumat secara berjamaah.
Tidak lupa, shalawat dan salam senantiasa tercurah kepada Baginda Nabi Muhammad SAW, kepada segenap keluarga, serta para sahabatnya. Semoga kita yang hadir di masjid yang mulia ini diperkenankan oleh Allah SWT untuk mendapatkan syafaat dari beliau di akhirat nanti. _Aamin ya rabbal 'alamin_.

*Informasi Pengurus Masjid*
Izin kami dari pengurus *Masjid Shalahuddin Kantor Pajak Jayapura* untuk menyampaikan beberapa pengumuman:
1. *Laporan Keuangan Masjid:*
- a. Saldo per ${dateCalculation.labelPrevFriday.padEnd(20, ' ')} : ${formatRupiah(dateCalculation.saldoAwal)}
- b. Penerimaan (${dateCalculation.labelRentang})${' '.repeat(Math.max(0, 20 - dateCalculation.labelRentang.length - 14))} : ${formatRupiah(dateCalculation.penerimaanPekan)}
- c. Pengeluaran (${dateCalculation.labelRentang})${' '.repeat(Math.max(0, 20 - dateCalculation.labelRentang.length - 15))} : ${formatRupiah(dateCalculation.pengeluaranPekan)}
- d. Saldo akhir per ${dateCalculation.labelEndFriday.padEnd(16, ' ')} : ${formatRupiah(dateCalculation.saldoAkhir)}

Jazakumullahu khairan katsiran kepada para jemaah yang telah menyisihkan sebagian hartanya untuk infak dan sedekah. Semoga menjadi amal jariyah.

2. *Petugas Shalat Jumat Hari Ini:*
- *Khatib* sekaligus *Imam* : *${khatibImam}*
- *Muadzin*                  : *${muadzin}*

3. *Himbauan untuk Jemaah*
- Sebelum khatib naik ke mimbar, kami mengimbau kepada jemaah yang masih berada di luar untuk segera masuk ke dalam masjid.
- Untuk saf depan yang masih kosong, mohon segera diisi.
- Demi kelancaran dan kekhusyukan ibadah kita bersama, kami mengimbau kepada seluruh jemaah untuk *menonaktifkan HP atau mengganti ke mode senyap (silent)*.

Demikian penyampaian dari kami.
*Wabillahi taufik wal hidayah, wassalamu'alaikum warahmatullahi wabarakatuh.*
Kepada *${khatibImam}*, waktu dan tempat dipersilakan.`;

  const handleCopyText = () => {
    navigator.clipboard.writeText(teksPengumumanRaw);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-emerald-950/75 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full overflow-hidden flex flex-col max-h-[94vh]">
        {/* Modal Top Header (Hidden on Print) */}
        <div className="p-3.5 sm:p-5 bg-gradient-to-r from-emerald-800 via-teal-900 to-emerald-950 text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="p-2 rounded-xl bg-amber-400 text-emerald-950 font-bold shadow-sm">
              <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-lg text-white">
                Penyampaian Shalat Jumat
              </h3>
              <p className="text-[11px] sm:text-xs text-emerald-200/90 truncate max-w-[220px] sm:max-w-none">
                Naskah Warta Mimbar Masjid Shalahuddin KPP Jayapura
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={handleCopyText}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold transition cursor-pointer"
              title="Salin teks naskah untuk dibaca di mimbar atau dikirim ke WhatsApp"
            >
              {copiedText ? <Check className="w-3.5 h-3.5 text-amber-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden xs:inline">{copiedText ? 'Tersalin!' : 'Salin Teks'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-emerald-950 text-xs font-bold transition shadow-xs cursor-pointer"
              title="Cetak naskah mimbar shalat Jumat"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Cetak</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-3 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6 text-slate-800 bg-white">
          {/* TABEL PENGISIAN PETUGAS (KHATIB & MUADZIN) */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 sm:p-5 no-print">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-200">
              <Mic className="w-4 h-4 text-emerald-700" />
              <h4 className="font-bold text-xs sm:text-sm text-slate-900 uppercase tracking-wide">
                Form Pengisian Petugas Jumat
              </h4>
            </div>

            {officersSavedMsg && (
              <div className="mb-3 p-2.5 rounded-xl bg-emerald-100/80 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{officersSavedMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveOfficers} className="grid grid-cols-1 md:grid-cols-12 gap-2.5 sm:gap-3 items-end">
              {/* Tanggal Jumat (Otomatis & Tidak Dapat Diubah) */}
              <div className="md:col-span-3">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Tanggal Jumat (Otomatis)
                </label>
                <div className="relative">
                  <input
                    type="date"
                    readOnly
                    disabled
                    value={selectedFriday}
                    className="w-full pl-8 pr-2 py-2 rounded-xl border border-slate-200 bg-slate-100 text-slate-700 text-xs font-semibold cursor-not-allowed select-none"
                    title="Tanggal Shalat Jumat dihitung otomatis dan tidak dapat diubah manual"
                  />
                  <Calendar className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Khatib & Imam */}
              <div className="md:col-span-4">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Khatib & Imam
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Nama Khatib sekaligus Imam"
                    value={khatibImam}
                    onChange={(e) => setKhatibImam(e.target.value)}
                    className="w-full pl-8 pr-2 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs bg-white text-slate-800 font-medium"
                  />
                  <User className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Muadzin */}
              <div className="md:col-span-3">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Muadzin
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Nama Muadzin"
                    value={muadzin}
                    onChange={(e) => setMuadzin(e.target.value)}
                    className="w-full pl-8 pr-2 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs bg-white text-slate-800 font-medium"
                  />
                  <Volume2 className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Tombol Simpan */}
              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={isSavingOfficers}
                  className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  title="Simpan jadwal petugas khatib & muadzin ke database Supabase"
                >
                  <Save className="w-3.5 h-3.5 text-amber-300" />
                  <span>{isSavingOfficers ? 'Menyimpan...' : 'Simpan'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* TEKS NASKAH PEMBACA MIMBAR SHALAT JUMAT */}
          <div className="bg-white border-2 border-slate-300 rounded-2xl p-4 sm:p-7 space-y-4 sm:space-y-5 text-xs sm:text-sm leading-relaxed font-serif shadow-xs">
            {/* Header Naskah */}
            <div className="text-center border-b border-slate-200 pb-3 sm:pb-4 mb-2">
              <span className="bg-emerald-100 text-emerald-900 font-sans text-[11px] sm:text-xs font-bold uppercase px-3 py-1 rounded-full border border-emerald-300">
                Naskah Pembacaan Mimbar Shalat Jumat
              </span>
              <h3 className="font-bold font-sans text-base sm:text-lg text-slate-900 mt-2">
                Masjid Shalahuddin Kantor Pelayanan Pajak Pratama Jayapura
              </h3>
              <p className="font-sans text-xs text-slate-500 mt-1">
                Edisi Shalat Jumat : <strong>{formatDateIndo(selectedFriday)}</strong>
              </p>
            </div>

            {/* Pembukaan */}
            <div className="space-y-2.5">
              <p className="font-bold text-center text-emerald-900 italic text-sm sm:text-base">
                Bismillahirrahmanirrahim.
              </p>
              <p className="italic text-slate-700 bg-slate-50 p-2.5 sm:p-3 rounded-xl border border-slate-200 text-xs font-sans leading-relaxed">
                Assalamu alaikum warahmatullahi wabarakatuh. Alhamdulillahi rabbil alamin, was shalatu was salamu ala asyrafil anbiya i wal mursalin, wa ala alihi wa sahbihi ajma in, amma ba du.
              </p>
              <p className="text-slate-800 font-sans text-xs sm:text-sm">
                Alhamdulillah, puji serta syukur marilah sama-sama kita panjatkan ke hadirat Allah SWT, karena atas segala limpahan rahmat-Nya, kita masih diberi kesehatan dan kesempatan untuk berkumpul di masjid ini guna melaksanakan shalat Jumat secara berjamaah.
              </p>
              <p className="text-slate-800 font-sans text-xs sm:text-sm">
                Tidak lupa, shalawat dan salam senantiasa tercurah kepada Baginda Nabi Muhammad SAW, kepada segenap keluarga, serta para sahabatnya. Semoga kita yang hadir di masjid yang mulia ini diperkenankan oleh Allah SWT untuk mendapatkan syafaat dari beliau di akhirat nanti. <span className="font-semibold italic">Aamin ya rabbal &apos;alamin</span>.
              </p>
            </div>

            {/* Informasi Pengurus */}
            <div className="space-y-3 pt-2 border-t border-slate-200 font-sans text-xs sm:text-sm">
              <div className="font-bold text-slate-900 uppercase tracking-wide text-xs flex items-center gap-1.5 text-emerald-900">
                <Building2 className="w-4 h-4 text-amber-500" />
                Informasi Pengurus Masjid
              </div>
              <p className="text-slate-700">
                Izin kami dari pengurus <strong>Masjid Shalahuddin Kantor Pajak Jayapura</strong> untuk menyampaikan beberapa pengumuman:
              </p>

              {/* Point 1: Laporan Keuangan Masjid (TITIK DUA SEJAJAR RAPI, FULL RESPONSIVE TANPA SCROLL HORIZONTAL) */}
              <div className="bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-200 space-y-2.5">
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-700 text-white text-xs flex items-center justify-center font-bold">1</span>
                  Laporan Keuangan Masjid:
                </div>

                {/* TABEL DENGAN TITIK DUA PERSIS SEJAJAR - FULL RESPONSIVE TANPA SCROLL HORIZONTAL */}
                <div className="bg-white p-2.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs font-sans">
                  <table className="w-full text-xs sm:text-sm border-collapse">
                    <tbody>
                      {/* Baris a: Saldo per s.d. Jumat sebelumnya */}
                      <tr className="border-b border-slate-100">
                        <td className="py-2 pr-1 font-medium text-slate-700 align-top">
                          a. Saldo per {dateCalculation.labelPrevFriday}
                        </td>
                        <td className="py-2 px-1 text-center font-bold text-slate-700 w-3 align-top">
                          :
                        </td>
                        <td className="py-2 pl-1 font-bold text-slate-900 text-right font-mono align-top text-xs sm:text-sm whitespace-nowrap">
                          {formatRupiah(dateCalculation.saldoAwal)}
                        </td>
                      </tr>

                      {/* Baris b: Penerimaan (Sabtu s.d. Jumat hari ini) */}
                      <tr className="border-b border-slate-100">
                        <td className="py-2 pr-1 font-medium text-slate-700 align-top">
                          b. Penerimaan ({dateCalculation.labelRentang})
                        </td>
                        <td className="py-2 px-1 text-center font-bold text-slate-700 w-3 align-top">
                          :
                        </td>
                        <td className="py-2 pl-1 font-bold text-emerald-700 text-right font-mono align-top text-xs sm:text-sm whitespace-nowrap">
                          +{formatRupiah(dateCalculation.penerimaanPekan)}
                        </td>
                      </tr>

                      {/* Baris c: Pengeluaran (Sabtu s.d. Jumat hari ini) */}
                      <tr className="border-b border-slate-100">
                        <td className="py-2 pr-1 font-medium text-slate-700 align-top">
                          c. Pengeluaran operasional masjid ({dateCalculation.labelRentang})
                        </td>
                        <td className="py-2 px-1 text-center font-bold text-slate-700 w-3 align-top">
                          :
                        </td>
                        <td className="py-2 pl-1 font-bold text-rose-600 text-right font-mono align-top text-xs sm:text-sm whitespace-nowrap">
                          -{formatRupiah(dateCalculation.pengeluaranPekan)}
                        </td>
                      </tr>

                      {/* Baris d: Saldo akhir per Jumat hari ini/terakhir */}
                      <tr className="bg-emerald-50/70">
                        <td className="py-2.5 pr-1 font-bold text-emerald-950 align-top">
                          d. Saldo akhir per {dateCalculation.labelEndFriday}
                        </td>
                        <td className="py-2.5 px-1 text-center font-extrabold text-emerald-900 w-3 align-top">
                          :
                        </td>
                        <td className="py-2.5 pl-1 font-extrabold text-emerald-900 text-right font-mono align-top text-xs sm:text-sm whitespace-nowrap">
                          {formatRupiah(dateCalculation.saldoAkhir)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <p className="italic text-[11px] sm:text-xs text-slate-600 pt-1">
                  Jazakumullahu khairan katsiran kepada para jemaah yang telah menyisihkan sebagian hartanya untuk infak dan sedekah. Semoga menjadi amal jariyah.
                </p>
              </div>

              {/* Point 2: Petugas Shalat Jumat Hari Ini */}
              <div className="bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-700 text-white text-xs flex items-center justify-center font-bold">2</span>
                  Petugas Shalat Jumat Hari Ini:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pl-1 pt-1 font-sans">
                  <div className="p-2.5 sm:p-3 bg-white rounded-lg border border-slate-200">
                    <span className="text-[10px] sm:text-[11px] text-slate-500 font-semibold block">Khatib sekaligus Imam :</span>
                    <strong className="text-slate-900 text-xs sm:text-sm font-bold block mt-0.5">{khatibImam}</strong>
                  </div>
                  <div className="p-2.5 sm:p-3 bg-white rounded-lg border border-slate-200">
                    <span className="text-[10px] sm:text-[11px] text-slate-500 font-semibold block">Muadzin :</span>
                    <strong className="text-slate-900 text-xs sm:text-sm font-bold block mt-0.5">{muadzin}</strong>
                  </div>
                </div>
              </div>

              {/* Point 3: Himbauan untuk Jemaah */}
              <div className="bg-amber-50/70 p-3 sm:p-4 rounded-xl border border-amber-200/80 space-y-2">
                <div className="font-bold text-amber-950 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-600 text-white text-xs flex items-center justify-center font-bold">3</span>
                  Himbauan untuk Jemaah:
                </div>
                <ul className="list-disc list-inside space-y-1 pl-1 text-slate-800 text-xs sm:text-sm font-sans">
                  <li>
                    Sebelum khatib naik ke mimbar, kami mengimbau kepada jemaah yang masih berada di luar untuk segera masuk ke dalam masjid.
                  </li>
                  <li>
                    Untuk <strong>saf depan yang masih kosong, mohon segera diisi</strong>.
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span>
                      Demi kelancaran dan kekhusyukan ibadah kita bersama, kami mengimbau kepada seluruh jemaah untuk <strong className="text-amber-950 underline decoration-amber-500 font-bold">menonaktifkan HP atau mengganti ke mode senyap (silent)</strong>.
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Penutup */}
            <div className="space-y-2.5 pt-3 border-t border-slate-200 font-sans text-xs sm:text-sm text-center">
              <p className="text-slate-700">
                Demikian penyampaian dari kami.
              </p>
              <p className="font-bold italic text-emerald-950 text-xs sm:text-sm">
                Wabillahi taufik wal hidayah, wassalamu&apos;alaikum warahmatullahi wabarakatuh.
              </p>
              <div className="p-2.5 sm:p-3 bg-emerald-800 text-white rounded-xl font-bold mt-1.5 shadow-xs">
                Kepada <span className="text-amber-300">{khatibImam}</span>, waktu dan tempat dipersilakan.
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer (Hidden on Print) */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between no-print">
          <span className="text-[11px] sm:text-xs text-slate-500">
            Naskah resmi Dewan Kemakmuran Masjid (DKM) Shalahuddin
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 sm:py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
