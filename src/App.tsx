import { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { SummaryCards } from './components/SummaryCards';
import { TransactionFilters } from './components/TransactionFilters';
import { TransactionTable } from './components/TransactionTable';
import { TransactionModal } from './components/TransactionModal';
import { LoginModal } from './components/LoginModal';
import { PrintReportModal } from './components/PrintReportModal';
import { PenyampaianJumatModal } from './components/PenyampaianJumatModal';
import { SetupGuideModal } from './components/SetupGuideModal';
import { PWABanner } from './components/PWABanner';
import {
  Transaction,
  UserSession,
  PeriodFilter,
  TransactionType,
} from './types';
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from './lib/supabase';
import {
  calculateFinancialSummary,
  exportTransactionsToCSV,
  sortTransactionsDesc,
} from './lib/utils';
import {
  Building2,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
} from 'lucide-react';

export default function App() {
  // Application Data States
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Authentication State (In-Memory React State only, no localStorage)
  const [session, setSession] = useState<UserSession>({
    isAuthenticated: false,
  });

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all');

  // Modal Visibility States
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isPrintReportOpen, setIsPrintReportOpen] = useState(false);
  const [isPenyampaianJumatOpen, setIsPenyampaianJumatOpen] = useState(false);
  const [isSetupGuideOpen, setIsSetupGuideOpen] = useState(false);

  // Show temporary toast notification
  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  }, []);

  // Fetch data from Supabase
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const txData = await getTransactions();
      setTransactions(sortTransactionsDesc(txData));
    } catch (error) {
      console.error('Error fetching data:', error);
      showToast('Gagal memuat data transaksi', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle new or updated transaction (Direct write to Supabase)
  const handleSaveTransaction = async (
    data: Omit<Transaction, 'id' | 'created_at'>
  ) => {
    try {
      if (editingTransaction) {
        const updated = await updateTransaction(editingTransaction.id, data);
        setTransactions((prev) =>
          prev.map((t) => (t.id === updated.id ? updated : t))
        );
        showToast('Transaksi berhasil diperbarui di database Supabase');
      } else {
        const created = await createTransaction(data);
        setTransactions((prev) => sortTransactionsDesc([created, ...prev]));
        showToast('Transaksi kas baru berhasil dicatat di Supabase');
      }
      setEditingTransaction(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan transaksi';
      showToast(msg, 'error');
      throw err;
    }
  };

  // Handle delete transaction
  const handleDeleteTransaction = async (id: string, title: string) => {
    try {
      await deleteTransaction(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      showToast(`Transaksi "${title}" berhasil dihapus dari Supabase`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menghapus transaksi';
      showToast(msg, 'error');
    }
  };

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    return transactions.filter((tx) => {
      // Type filter
      if (typeFilter !== 'all' && tx.type !== typeFilter) {
        return false;
      }
      // Period filter
      if (periodFilter !== 'all') {
        const txDate = new Date(tx.date);
        const txYear = txDate.getFullYear();
        const txMonth = txDate.getMonth();

        if (periodFilter === 'this_month') {
          if (txYear !== currentYear || txMonth !== currentMonth) return false;
        } else if (periodFilter === 'last_month') {
          const lastMonthTarget = currentMonth === 0 ? 11 : currentMonth - 1;
          const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
          if (txYear !== lastMonthYear || txMonth !== lastMonthTarget) return false;
        } else if (periodFilter === 'this_year') {
          if (txYear !== currentYear) return false;
        }
      }

      // Search Query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchTitle = tx.title.toLowerCase().includes(q);
        const matchNotes = (tx.notes || '').toLowerCase().includes(q);
        const matchParty = (tx.source_destination || '').toLowerCase().includes(q);
        const matchRef = (tx.receipt_no || '').toLowerCase().includes(q);

        if (!matchTitle && !matchNotes && !matchParty && !matchRef) {
          return false;
        }
      }

      return true;
    });
  }, [transactions, typeFilter, periodFilter, searchQuery]);

  // Overall Financial Summary based on all transactions
  const financialSummary = useMemo(() => {
    return calculateFinancialSummary(transactions);
  }, [transactions]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setPeriodFilter('all');
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-emerald-200">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-4 z-50 animate-bounce no-print">
          <div
            className={`px-4 py-3 rounded-xl shadow-lg border text-xs sm:text-sm font-semibold flex items-center gap-2 ${
              notification.type === 'error'
                ? 'bg-rose-600 text-white border-rose-700'
                : 'bg-emerald-800 text-white border-emerald-900'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-amber-300" />
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Global Header */}
      <Header
        session={session}
        onOpenLogin={() => setIsLoginOpen(true)}
        onLogout={() => {
          setSession({ isAuthenticated: false });
          showToast('Anda telah keluar dari mode Pengurus DKM', 'info');
        }}
        onOpenNewTransaction={() => {
          setEditingTransaction(null);
          setIsTransactionModalOpen(true);
        }}
        onOpenPenyampaianJumat={() => setIsPenyampaianJumatOpen(true)}
      />

      {/* PWA Install Banner */}
      <PWABanner />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1">
        {/* Transparency Hero Banner */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-900 text-white p-5 sm:p-6 mb-6 shadow-md border border-emerald-800/50">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2 mb-2.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-800/80 text-amber-300 text-xs font-semibold border border-emerald-700/60">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Prinsip Akuntabilitas & Amanah Kas Masjid</span>
                </div>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white mb-1.5">
                Transparansi Mutasi Kas Masjid Shalahuddin
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-light">
                Seluruh dana infaq, sedekah pegawai Kantor Pelayanan Pajak (KPP) Pratama Jayapura, serta donatur jamaah shalat Jumat tercatat secara terbuka, akuntabel, dan dapat diawasi bersama secara real-time.
              </p>
            </div>

            {/* Infaq Rekening Bank & QRIS Badge */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white/10 backdrop-blur-sm p-3.5 rounded-xl border border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-400 text-emerald-950 flex items-center justify-center shrink-0 shadow-xs">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] text-emerald-200 uppercase font-semibold">Rekening Infaq DKM</div>
                  <div className="font-mono font-bold text-white text-xs sm:text-sm tracking-wider">
                    Bank Syariah Indonesia (BSI)
                  </div>
                  <div className="font-mono text-amber-300 font-extrabold text-sm tracking-widest">
                    716 9620 207
                  </div>
                </div>
              </div>
              <div className="hidden sm:block w-px h-10 bg-white/20"></div>
              <div className="text-[11px] text-emerald-200">
                a.n. <strong className="text-white">DKM Masjid Shalahuddin KPP</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Summary Cards */}
        <SummaryCards
          summary={financialSummary}
          isAuthenticated={session.isAuthenticated}
        />

        {/* Konten Khusus Pengurus DKM: Hanya muncul saat login */}
        {session.isAuthenticated && (
          <>
            {/* Filters & Search */}
            <TransactionFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              typeFilter={typeFilter}
              onTypeFilterChange={setTypeFilter}
              periodFilter={periodFilter}
              onPeriodFilterChange={setPeriodFilter}
              totalMatches={filteredTransactions.length}
              onResetFilters={handleResetFilters}
            />

            {/* Transaction Table */}
            <TransactionTable
              transactions={filteredTransactions}
              allTransactions={transactions}
              session={session}
              isLoading={isLoading}
              onRefresh={loadData}
              onEdit={(tx) => {
                setEditingTransaction(tx);
                setIsTransactionModalOpen(true);
              }}
              onDelete={handleDeleteTransaction}
              onExportCSV={() => exportTransactionsToCSV(filteredTransactions, transactions)}
              onOpenPrintReport={() => setIsPrintReportOpen(true)}
              onOpenPenyampaianJumat={() => setIsPenyampaianJumatOpen(true)}
            />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-4 sm:px-6 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-700" />
            <span className="font-bold text-slate-700">
              Masjid Shalahuddin KPP Pratama Jayapura
            </span>
          </div>
          <div className="text-center sm:text-left text-xs sm:text-sm text-slate-500">
            Jalan Otonom No. 3 Kotaraja, Wahno, Distrik Jayapura Selatan, Kota Jayapura, Papua 99226
          </div>
          <div className="flex items-center gap-3">
            <div className="text-slate-400">
              Sistem Informasi & Transparansi Kas Keuangan
            </div>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      {/* 1. Login Modal for Pengurus DKM */}
      {isLoginOpen && (
        <LoginModal
          isOpen={isLoginOpen}
          onClose={() => setIsLoginOpen(false)}
          onLoginSuccess={(newSession) => {
            setSession(newSession);
            showToast(`Berhasil login sebagai ${newSession.userName || 'Pengurus DKM'}`);
          }}
        />
      )}

      {/* 2. Transaction Modal (ONLY ACCESSIBLE WHEN LOGGED IN) */}
      {isTransactionModalOpen && session.isAuthenticated && (
        <TransactionModal
          isOpen={isTransactionModalOpen}
          onClose={() => {
            setIsTransactionModalOpen(false);
            setEditingTransaction(null);
          }}
          session={session}
          editingTransaction={editingTransaction}
          onSubmit={handleSaveTransaction}
        />
      )}

      {/* 3. Official Printable Statement Modal */}
      {isPrintReportOpen && (
        <PrintReportModal
          isOpen={isPrintReportOpen}
          onClose={() => setIsPrintReportOpen(false)}
          transactions={filteredTransactions}
          summary={financialSummary}
        />
      )}

      {/* 4. Penyampaian Jumat Modal (Naskah Mimbar & Perhitungan Otomatis) */}
      {isPenyampaianJumatOpen && (
        <PenyampaianJumatModal
          isOpen={isPenyampaianJumatOpen}
          onClose={() => setIsPenyampaianJumatOpen(false)}
          transactions={transactions}
          session={session}
        />
      )}

      {/* 5. Setup Guide Modal */}
      {isSetupGuideOpen && (
        <SetupGuideModal
          isOpen={isSetupGuideOpen}
          onClose={() => setIsSetupGuideOpen(false)}
        />
      )}
    </div>
  );
}
