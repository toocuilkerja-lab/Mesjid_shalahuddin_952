import React, { useState, useMemo } from 'react';
import {
  Download,
  Printer,
  Edit2,
  Trash2,
  ArrowDownLeft,
  ArrowUpRight,
  Receipt,
  RotateCcw,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { Transaction, UserSession } from '../types';
import { formatRupiah, formatDateIndo, formatDateShort } from '../lib/utils';

interface TransactionTableProps {
  transactions: Transaction[];
  allTransactions?: Transaction[];
  session: UserSession;
  isLoading: boolean;
  onRefresh: () => void;
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string, title: string) => void;
  onExportCSV: () => void;
  onOpenPrintReport: () => void;
  onOpenPenyampaianJumat?: () => void;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  allTransactions,
  session,
  isLoading,
  onRefresh,
  onEdit,
  onDelete,
  onExportCSV,
  onOpenPrintReport,
  onOpenPenyampaianJumat,
}) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Perhitungan saldo berjalan (rekening koran kas masjid)
  const balanceMap = useMemo(() => {
    const sourceList = allTransactions && allTransactions.length > 0 ? allTransactions : transactions;
    // Urutkan dari kronologis paling awal ke terbaru
    const sorted = [...sourceList].sort((a, b) => {
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
  }, [transactions, allTransactions]);

  const confirmDelete = (tx: Transaction) => {
    if (window.confirm(`Yakin ingin menghapus transaksi "${tx.title}" senilai ${formatRupiah(tx.amount)}? Data akan terhapus langsung dari database Supabase.`)) {
      setDeletingId(tx.id);
      onDelete(tx.id, tx.title);
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
      {/* Table Header Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-50/70 to-white">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-100/70 text-emerald-800">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm sm:text-base">
              Daftar Mutasi Kas Masjid
            </h3>
            <p className="text-xs text-slate-500">
              Catatan riwayat uang masuk dan keluar secara kronologis
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            title="Muat ulang data dari Supabase"
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition border border-slate-200 cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
          <button
            onClick={onExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ekspor CSV</span>
          </button>
          <button
            onClick={onOpenPrintReport}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition shadow-xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-amber-300" />
            <span>Cetak Laporan</span>
          </button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="py-20 text-center">
          <div className="inline-block w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-sm font-medium text-slate-600">Memuat transaksi dari Supabase...</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="py-16 text-center px-4 max-w-lg mx-auto">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 border border-emerald-100">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h4 className="font-bold text-slate-800 mb-1 text-sm sm:text-base">
            Tabel Kas di Supabase Masih Kosong
          </h4>
          <p className="text-xs text-slate-500 mb-4 leading-relaxed">
            Database Supabase Anda berhasil terhubung, namun tabel <code className="bg-slate-100 px-1.5 py-0.5 rounded text-emerald-700 font-mono text-[11px]">10001_mesjidshalahuddin_transactions</code> belum memiliki catatan mutasi. Anda dapat mengimpor 7 contoh transaksi kas atau menginput transaksi baru.
          </p>
          {onOpenPenyampaianJumat && (
            <button
              onClick={onOpenPenyampaianJumat}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-amber-300" />
              <span>Buka Naskah Penyampaian Jumat</span>
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[11px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">No</th>
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Uraian & Keterangan</th>
                  <th className="py-3 px-4">Tipe</th>
                  <th className="py-3 px-4 text-right">Mutasi (Rp)</th>
                  <th className="py-3 px-4 text-right bg-emerald-50/50 text-emerald-900">Sisa Saldo (Rp)</th>
                  <th className="py-3 px-4">Pihak / Bukti</th>
                  {session.isAuthenticated && (
                    <th className="py-3 px-4 text-center w-24">Aksi</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {transactions.map((tx, idx) => {
                  const isIncome = tx.type === 'masuk';
                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-50/80 transition group"
                    >
                      <td className="py-3.5 px-4 text-center font-mono text-xs text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 font-medium text-xs">
                        {formatDateIndo(tx.date)}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{tx.title}</div>
                        {tx.notes && (
                          <div className="text-xs text-slate-500 mt-0.5 line-clamp-1 italic">
                            {tx.notes}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                            isIncome
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {isIncome ? (
                            <ArrowDownLeft className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          )}
                          {isIncome ? 'Pemasukan' : 'Pengeluaran'}
                        </span>
                      </td>
                      <td
                        className={`py-3.5 px-4 text-right font-bold whitespace-nowrap text-sm ${
                          isIncome ? 'text-emerald-700' : 'text-rose-600'
                        }`}
                      >
                        {isIncome ? '+' : '-'} {formatRupiah(tx.amount)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold whitespace-nowrap text-sm text-slate-900 bg-emerald-50/20 font-mono">
                        {formatRupiah(balanceMap.get(tx.id) ?? 0)}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-500">
                        <div className="truncate max-w-[150px] font-medium text-slate-700">
                          {tx.source_destination || '-'}
                        </div>
                        {tx.receipt_no && (
                          <div className="flex items-center gap-1 text-[11px] text-slate-400">
                            <Receipt className="w-3 h-3" />
                            <span>{tx.receipt_no}</span>
                          </div>
                        )}
                      </td>
                      {session.isAuthenticated && (
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => onEdit(tx)}
                              title="Edit transaksi"
                              className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => confirmDelete(tx)}
                              disabled={deletingId === tx.id}
                              title="Hapus transaksi"
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-slate-100">
            {transactions.map((tx) => {
              const isIncome = tx.type === 'masuk';
              return (
                <div key={tx.id} className="p-4 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                        isIncome
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {isIncome ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                      {isIncome ? 'Pemasukan' : 'Pengeluaran'}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {formatDateShort(tx.date)}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{tx.title}</h4>
                    {tx.notes && (
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 italic">
                        {tx.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-slate-500 font-medium">Sisa Saldo:</span>
                      <span className="font-bold font-mono text-xs bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-100">
                        {formatRupiah(balanceMap.get(tx.id) ?? 0)}
                      </span>
                    </div>
                    <span
                      className={`text-base font-extrabold ${
                        isIncome ? 'text-emerald-700' : 'text-rose-600'
                      }`}
                    >
                      {isIncome ? '+' : '-'} {formatRupiah(tx.amount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-50">
                    <span>{tx.source_destination || 'Tanpa keterangan pihak'}</span>
                    {tx.receipt_no && (
                      <span className="font-mono text-slate-400">Ref: {tx.receipt_no}</span>
                    )}
                  </div>
                  {session.isAuthenticated && (
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => onEdit(tx)}
                        className="px-2.5 py-1 text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg font-medium flex items-center gap-1 cursor-pointer"
                      >
                        <Edit2 className="w-3 h-3" /> Edit
                      </button>
                      <button
                        onClick={() => confirmDelete(tx)}
                        className="px-2.5 py-1 text-xs text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg font-medium flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" /> Hapus
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Footer summary in table */}
      <div className="p-3 bg-slate-50/90 border-t border-slate-200/80 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2 px-4">
        <span>
          Semua transaksi kas tercatat secara real-time langsung ke cloud Supabase.
        </span>
        <span className="font-medium text-emerald-700">
          Masjid Shalahuddin KPP Pratama Jayapura
        </span>
      </div>
    </div>
  );
};
