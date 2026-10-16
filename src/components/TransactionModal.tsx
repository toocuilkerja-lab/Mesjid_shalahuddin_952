import React, { useState, useEffect } from 'react';
import {
  X,
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  DollarSign,
  Tag,
  FileText,
  User,
  Hash,
  AlertCircle,
  Save,
  CheckCircle2,
  Copy,
  Check,
} from 'lucide-react';
import { Transaction, TransactionType, Category, UserSession } from '../types';
import { formatRupiah } from '../lib/utils';
import { SUPABASE_FIX_RLS_SQL } from '../lib/sqlSchema';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: UserSession;
  categories: Category[];
  editingTransaction?: Transaction | null;
  onSubmit: (data: Omit<Transaction, 'id' | 'created_at'>) => Promise<void>;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  session,
  categories,
  editingTransaction,
  onSubmit,
}) => {
  // Pure React component state - NO LOCAL STORAGE / NO SESSION STORAGE
  const [type, setType] = useState<TransactionType>('masuk');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [sourceDestination, setSourceDestination] = useState<string>('');
  const [receiptNo, setReceiptNo] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedRls, setCopiedRls] = useState(false);

  const handleCopyRls = () => {
    navigator.clipboard.writeText(SUPABASE_FIX_RLS_SQL);
    setCopiedRls(true);
    setTimeout(() => setCopiedRls(false), 2500);
  };

  // Initialize or reset form state when editingTransaction changes
  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setDate(editingTransaction.date);
      setAmount(editingTransaction.amount.toString());
      setCategory(editingTransaction.category);
      setTitle(editingTransaction.title);
      setSourceDestination(editingTransaction.source_destination || '');
      setReceiptNo(editingTransaction.receipt_no || '');
      setNotes(editingTransaction.notes || '');
    } else {
      setType('masuk');
      setDate(new Date().toISOString().split('T')[0]);
      setAmount('');
      setTitle('');
      setSourceDestination('');
      setReceiptNo('');
      setNotes('');
      // Set default category for 'masuk'
      const firstCat = categories.find((c) => c.type === 'masuk');
      setCategory(firstCat ? firstCat.name : 'Infaq Kotak Amal Jumat');
    }
    setErrorMsg(null);
  }, [editingTransaction, categories, isOpen]);

  // When type toggles, select a valid matching category
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const validCat = categories.find((c) => c.type === newType);
    if (validCat) {
      setCategory(validCat.name);
    }
  };

  const filteredCategories = categories.filter((c) => c.type === type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const numericAmount = parseFloat(amount.replace(/[^0-9]/g, ''));
    if (!numericAmount || numericAmount <= 0) {
      setErrorMsg('Harap masukkan nominal transaksi yang valid (lebih dari Rp 0)');
      return;
    }
    if (!title.trim()) {
      setErrorMsg('Harap isi uraian/judul transaksi');
      return;
    }
    if (!category) {
      setErrorMsg('Harap pilih kategori transaksi');
      return;
    }

    try {
      setIsSubmitting(true);
      // Direct write to Supabase (bypasses any browser cache/storage)
      await onSubmit({
        type,
        date,
        amount: numericAmount,
        category,
        title: title.trim(),
        source_destination: sourceDestination.trim() || undefined,
        receipt_no: receiptNo.trim() || undefined,
        notes: notes.trim() || undefined,
        created_by: session.userName || 'Pengurus DKM',
      });
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan saat menyimpan data';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const numericValue = parseFloat(amount.replace(/[^0-9]/g, '')) || 0;

  if (!isOpen || !session.isAuthenticated) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/60 backdrop-blur-xs no-print">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base sm:text-lg flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-amber-400" />
              {editingTransaction ? 'Edit Transaksi Kas' : 'Input Transaksi Kas Baru'}
            </h3>
            <p className="text-xs text-emerald-200/90 mt-0.5">
              Direct-Write langsung ke database Supabase (tanpa cache lokal)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-700/60 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {errorMsg && (
            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="text-xs">{errorMsg}</span>
              </div>
              {(errorMsg.toLowerCase().includes('rls') ||
                errorMsg.toLowerCase().includes('row-level security') ||
                errorMsg.toLowerCase().includes('policy')) && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold">Solusi: Matikan Row Level Security (RLS) Supabase:</span>
                    <button
                      type="button"
                      onClick={handleCopyRls}
                      className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg text-[11px] flex items-center gap-1 cursor-pointer transition shadow-xs"
                    >
                      {copiedRls ? <Check className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedRls ? 'Tersalin!' : 'Salin Skrip Matikan RLS'}</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    Tabel di Supabase masih memiliki proteksi RLS aktif. Jalankan skrip ini di <strong>Supabase Dashboard &rarr; SQL Editor &rarr; Run</strong> untuk mematikan RLS pada semua tabel:
                  </p>
                  <pre className="p-2 bg-slate-900 text-amber-300 rounded font-mono text-[10px] overflow-x-auto">
{`ALTER TABLE "10001_mesjidshalahuddin_transactions" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "10001_mesjidshalahuddin_categories" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "10001_mesjidshalahuddin_users" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "10001_mesjidshalahuddin_friday_schedule" DISABLE ROW LEVEL SECURITY;`}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Transaction Type Radio Tabs */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Jenis Transaksi Kas <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleTypeChange('masuk')}
                className={`py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-2 border transition cursor-pointer ${
                  type === 'masuk'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                <span>Pemasukan (Uang Masuk)</span>
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('keluar')}
                className={`py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-2 border transition cursor-pointer ${
                  type === 'keluar'
                    ? 'bg-rose-50 border-rose-500 text-rose-800 ring-2 ring-rose-500/20'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <ArrowUpRight className="w-4 h-4 text-rose-600" />
                <span>Pengeluaran (Uang Keluar)</span>
              </button>
            </div>
          </div>

          {/* Tanggal & Nominal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tanggal Transaksi <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
                <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nominal (Rupiah) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Contoh: 1500000"
                  value={amount}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/[^0-9]/g, '');
                    setAmount(clean);
                  }}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold text-slate-800 bg-white"
                />
                <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
              {numericValue > 0 && (
                <div className="mt-1 text-xs font-semibold text-emerald-700">
                  {formatRupiah(numericValue)}
                </div>
              )}
            </div>
          </div>

          {/* Kategori */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Kategori Pos Kas <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-medium text-slate-800 cursor-pointer"
              >
                {filteredCategories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <Tag className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Uraian / Judul */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Uraian / Deskripsi Transaksi <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder={
                  type === 'masuk'
                    ? 'Misal: Infaq Kotak Jumat Pekan Ke-2 Oktober'
                    : 'Misal: Bisyarah Khotib Shalat Jumat Ustadz Fauzi'
                }
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
              <FileText className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Sumber / Tujuan & No Bukti */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {type === 'masuk' ? 'Sumber / Pembayar' : 'Penerima Dana / Vendor'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder={type === 'masuk' ? 'Misal: Jamaah / Pegawai Seksi PDI' : 'Misal: PLN / Toko Sentosa Jayapura'}
                  value={sourceDestination}
                  onChange={(e) => setSourceDestination(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nomor Bukti / Kwitansi / Nota
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Misal: KWT-2026/10/01"
                  value={receiptNo}
                  onChange={(e) => setReceiptNo(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-xs bg-white"
                />
                <Hash className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Catatan Tambahan */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Catatan / Keterangan Tambahan
            </label>
            <textarea
              rows={2}
              placeholder="Catatan rincian pendukung transaksi jika ada..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs bg-white"
            />
          </div>

          {/* Security & Direct Write Notification */}
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-[11px] text-emerald-800">
            <strong>Keamanan & Privasi Kas:</strong> Data transaksi ini langsung dikirim (direct-write) ke database Supabase dan tidak disimpan dalam history / storage lokal peramban.
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-600 hover:to-teal-700 text-white font-bold transition shadow-md disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4 text-amber-300" />
              <span>{isSubmitting ? 'Menyimpan ke Supabase...' : editingTransaction ? 'Perbarui Transaksi' : 'Simpan Transaksi Kas'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
