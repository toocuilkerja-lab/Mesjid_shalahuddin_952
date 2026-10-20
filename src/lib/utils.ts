import { Transaction, FinancialSummary } from '../types';

/**
 * Format angka ke mata uang Rupiah Indonesia (Rp)
 */
export function formatRupiah(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return 'Rp 0';
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format tanggal ke format Bahasa Indonesia (misal: 15 Oktober 2026)
 */
export function formatDateIndo(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateStr;
  }
}

/**
 * Format tanggal pendek (15/10/2026)
 */
export function formatDateShort(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateStr;
  }
}

/**
 * Hitung ringkasan keuangan
 */
export function calculateFinancialSummary(transactions: Transaction[]): FinancialSummary {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  let totalIncome = 0;
  let totalExpense = 0;
  let monthIncome = 0;
  let monthExpense = 0;

  transactions.forEach((tx) => {
    const txDate = new Date(tx.date);
    const isThisMonth =
      txDate.getFullYear() === currentYear && txDate.getMonth() === currentMonth;

    if (tx.type === 'masuk') {
      totalIncome += Number(tx.amount);
      if (isThisMonth) monthIncome += Number(tx.amount);
    } else {
      totalExpense += Number(tx.amount);
      if (isThisMonth) monthExpense += Number(tx.amount);
    }
  });

  return {
    currentBalance: totalIncome - totalExpense,
    totalIncome,
    totalExpense,
    monthIncome,
    monthExpense,
    transactionCount: transactions.length,
  };
}

/**
 * Export data transaksi ke format CSV
 */
export function exportTransactionsToCSV(
  transactions: Transaction[],
  allTransactions?: Transaction[]
): void {
  const sourceList = allTransactions && allTransactions.length > 0 ? allTransactions : transactions;
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

  const headers = [
    'No',
    'Tanggal',
    'Jenis',
    'Uraian Transaksi',
    'Mutasi (Rp)',
    'Sisa Saldo (Rp)',
    'Pihak Terkait / Sumber',
    'No. Bukti/Kwitansi',
    'Keterangan',
    'Pencatat',
  ];

  const rows = transactions.map((tx, idx) => [
    idx + 1,
    `"${tx.date}"`,
    `"${tx.type === 'masuk' ? 'Pemasukan' : 'Pengeluaran'}"`,
    `"${tx.title.replace(/"/g, '""')}"`,
    tx.type === 'masuk' ? tx.amount : -tx.amount,
    map.get(tx.id) ?? 0,
    `"${(tx.source_destination || '-').replace(/"/g, '""')}"`,
    `"${(tx.receipt_no || '-').replace(/"/g, '""')}"`,
    `"${(tx.notes || '-').replace(/"/g, '""')}"`,
    `"${(tx.created_by || 'Pengurus').replace(/"/g, '""')}"`,
  ]);

  const csvContent =
    '\uFEFF' +
    [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `Laporan_Keuangan_Masjid_Shalahuddin_KPP_Jayapura_${new Date().toISOString().split('T')[0]}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
