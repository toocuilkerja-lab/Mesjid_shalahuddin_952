import React from 'react';
import { X, Printer, Building2 } from 'lucide-react';
import { Transaction, FinancialSummary } from '../types';
import { formatRupiah } from '../lib/utils';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  summary: FinancialSummary;
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({
  isOpen,
  onClose,
  transactions,
  summary,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const todayIndo = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  // Perhitungan saldo berjalan (rekening koran)
  const balanceMap = React.useMemo(() => {
    const sorted = [...transactions].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      if (dateA !== dateB) return dateA - dateB;
      const createdA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const createdB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return createdA - createdB;
    });

    const map = new Map<string, number>();
    let running = 0;
    for (const item of sorted) {
      if (item.type === 'masuk') {
        running += Number(item.amount) || 0;
      } else {
        running -= Number(item.amount) || 0;
      }
      map.set(item.id, running);
    }
    return map;
  }, [transactions]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-emerald-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full my-4 overflow-hidden flex flex-col max-h-[95vh]">
        {/* Top Control Bar (Hidden on print) */}
        <div className="p-4 bg-slate-800 text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-sm">
              Pratinjau Cetak Laporan Keuangan Resmi
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Area */}
        <div className="p-6 sm:p-10 overflow-y-auto text-slate-900 bg-white">
          {/* Kop Surat Resmi */}
          <div className="border-b-4 border-double border-slate-800 pb-4 mb-6 text-center">
            <div className="flex items-center justify-center gap-4 mb-2">
              <div className="w-16 h-16 rounded-xl bg-emerald-800 flex items-center justify-center text-amber-400 border border-emerald-950">
                <Building2 className="w-9 h-9" />
              </div>
              <div className="text-center">
                <h2 className="text-xl sm:text-2xl font-extrabold uppercase tracking-wide text-slate-900">
                  Dewan Kemakmuran Masjid (DKM) Shalahuddin
                </h2>
                <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider text-emerald-800">
                  Kantor Pelayanan Pajak (KPP) Pratama Jayapura
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Jl. Ahmad Yani No. 8, Kel. Gurabesi, Distrik Jayapura Utara, Kota Jayapura, Papua 99111
                </p>
                <p className="text-[11px] text-slate-500">
                  Email: dkm.shalahuddin@kppjayapura.id • Portal Transparansi Kas Terbuka
                </p>
              </div>
            </div>
          </div>

          {/* Judul Laporan */}
          <div className="text-center mb-6">
            <h4 className="text-base sm:text-lg font-bold underline uppercase tracking-wider text-slate-800">
              Laporan Pertanggungjawaban Kas Keuangan Masjid
            </h4>
            <p className="text-xs text-slate-600 mt-1">
              Periode Per: <strong>{todayIndo}</strong>
            </p>
          </div>

          {/* Ringkasan Saldo Box */}
          <div className="mb-6 bg-slate-50 border border-slate-300 rounded-xl p-4">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Ringkasan Posisi Kas (Real-Time)
            </h5>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <div className="text-[11px] text-slate-500 font-semibold uppercase">Total Pemasukan</div>
                <div className="text-sm sm:text-base font-bold text-emerald-700 mt-1">
                  {formatRupiah(summary.totalIncome)}
                </div>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <div className="text-[11px] text-slate-500 font-semibold uppercase">Total Pengeluaran</div>
                <div className="text-sm sm:text-base font-bold text-rose-600 mt-1">
                  {formatRupiah(summary.totalExpense)}
                </div>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-300">
                <div className="text-[11px] text-emerald-900 font-bold uppercase">Saldo Kas Akhir</div>
                <div className="text-sm sm:text-base font-extrabold text-emerald-800 mt-1">
                  {formatRupiah(summary.currentBalance)}
                </div>
              </div>
            </div>
          </div>

          {/* Tabel Transaksi */}
          <div className="mb-8">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Rincian Mutasi Penerimaan dan Pengeluaran Kas
            </h5>
            <div className="border border-slate-300 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-300">
                  <tr>
                    <th className="p-2 border-r border-slate-300 w-8 text-center">No</th>
                    <th className="p-2 border-r border-slate-300 w-24">Tanggal</th>
                    <th className="p-2 border-r border-slate-300">Uraian Transaksi</th>
                    <th className="p-2 border-r border-slate-300 text-right w-24">Masuk (Rp)</th>
                    <th className="p-2 border-r border-slate-300 text-right w-24">Keluar (Rp)</th>
                    <th className="p-2 text-right w-28 bg-slate-200/50">Sisa Saldo (Rp)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800">
                  {transactions.map((tx, idx) => (
                    <tr key={tx.id} className="border-b border-slate-200">
                      <td className="p-2 border-r border-slate-200 text-center font-mono text-[10px] text-slate-500">
                        {idx + 1}
                      </td>
                      <td className="p-2 border-r border-slate-200 whitespace-nowrap text-[11px]">
                        {tx.date}
                      </td>
                      <td className="p-2 border-r border-slate-200">
                        <div className="font-semibold text-slate-900">{tx.title}</div>
                        {tx.source_destination && (
                          <div className="text-[10px] text-slate-500">
                            Pihak: {tx.source_destination}
                          </div>
                        )}
                      </td>
                      <td className="p-2 border-r border-slate-200 text-right font-medium text-emerald-700">
                        {tx.type === 'masuk' ? formatRupiah(tx.amount) : '-'}
                      </td>
                      <td className="p-2 border-r border-slate-200 text-right font-medium text-rose-600">
                        {tx.type === 'keluar' ? formatRupiah(tx.amount) : '-'}
                      </td>
                      <td className="p-2 text-right font-bold text-slate-900 font-mono">
                        {formatRupiah(balanceMap.get(tx.id) ?? 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-100 font-bold text-xs border-t-2 border-slate-300">
                  <tr>
                    <td colSpan={3} className="p-2 text-right border-r border-slate-300 uppercase">
                      Total & Saldo Akhir
                    </td>
                    <td className="p-2 border-r border-slate-300 text-right text-emerald-800">
                      {formatRupiah(summary.totalIncome)}
                    </td>
                    <td className="p-2 border-r border-slate-300 text-right text-rose-700">
                      {formatRupiah(summary.totalExpense)}
                    </td>
                    <td className="p-2 text-right text-slate-900 font-mono font-bold">
                      {formatRupiah(summary.currentBalance)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Lembar Tanda Tangan Resmi */}
          <div className="grid grid-cols-2 gap-8 text-center text-xs mt-12 pt-4">
            <div>
              <p className="text-slate-600 mb-1">Mengetahui,</p>
              <p className="font-bold text-slate-800">Ketua DKM Masjid Shalahuddin</p>
              <p className="text-[11px] text-slate-500">KPP Pratama Jayapura</p>
              <div className="h-16 flex items-center justify-center">
                <span className="text-[10px] text-slate-300 italic">( Tanda Tangan & Cap )</span>
              </div>
              <p className="font-bold text-slate-800 underline">Ir. H. Muhammad Ridwan, M.M.</p>
              <p className="text-[11px] text-slate-500">NIP. 19780512 200212 1 002</p>
            </div>
            <div>
              <p className="text-slate-600 mb-1">Jayapura, {todayIndo}</p>
              <p className="font-bold text-slate-800">Bendahara DKM Masjid Shalahuddin</p>
              <p className="text-[11px] text-slate-500">KPP Pratama Jayapura</p>
              <div className="h-16 flex items-center justify-center">
                <span className="text-[10px] text-slate-300 italic">( Tanda Tangan )</span>
              </div>
              <p className="font-bold text-slate-800 underline">Ahmad Zaki Syarifuddin, S.E.</p>
              <p className="text-[11px] text-slate-500">NIP. 19860914 200801 1 003</p>
            </div>
          </div>

          {/* Catatan Kaki */}
          <div className="mt-8 pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400">
            Dicetak secara otomatis melalui Sistem Transparansi Keuangan Masjid Shalahuddin KPP Pratama Jayapura. Data terintegrasi dengan database cloud Supabase.
          </div>
        </div>
      </div>
    </div>
  );
};
