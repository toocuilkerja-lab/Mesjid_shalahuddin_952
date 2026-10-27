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
 * Urutkan daftar transaksi secara kronologis terbalik (Z - A):
 * Tanggal terbaru di paling atas (No. 1).
 * Jika tanggal sama, pertahankan urutan relatif asli (stable sort).
 */
export function sortTransactionsDesc(transactions: Transaction[]): Transaction[] {
  return [...transactions].sort((a, b) => {
    // 1. Tanggal (terbaru di atas)
    const dateComp = b.date.localeCompare(a.date);
    if (dateComp !== 0) return dateComp;
    return 0;
  });
}

/**
 * Hitung saldo berjalan (rekening koran kas masjid) secara presisi.
 * Urutan mutasi kas ditampilkan Z - A (terbaru di atas, terlama di bawah).
 * Bergerak kronologis dari bawah ke atas:
 * Saldo(Row i) = Saldo(Row i+1) + (pemasukan ? +nominal : -nominal).
 * Sehingga pada nomor urut 5 saldo 22.585.890, lalu pada nomor urut 4
 * saat pengeluaran 100 ribu, sisa saldo menjadi tepat 22.485.890.
 */
export function calculateRunningBalances(allTransactions: Transaction[]): Map<string, number> {
  const desc = sortTransactionsDesc(allTransactions);
  // Balik urutan: index 0 adalah transaksi paling lampau (kronologis A - Z)
  const asc = [...desc].reverse();

  const map = new Map<string, number>();
  let running = 0;
  for (const item of asc) {
    if (item.type === 'masuk') {
      running += Number(item.amount) || 0;
    } else {
      running -= Number(item.amount) || 0;
    }
    map.set(item.id, running);
  }
  return map;
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
  const balanceMap = calculateRunningBalances(sourceList);
  const displayList = sortTransactionsDesc(transactions);

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

  const rows = displayList.map((tx, idx) => [
    idx + 1,
    `"${tx.date}"`,
    `"${tx.type === 'masuk' ? 'Pemasukan' : 'Pengeluaran'}"`,
    `"${tx.title.replace(/"/g, '""')}"`,
    tx.type === 'masuk' ? tx.amount : -tx.amount,
    balanceMap.get(tx.id) ?? 0,
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
