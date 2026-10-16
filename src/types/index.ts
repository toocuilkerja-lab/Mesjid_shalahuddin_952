export type TransactionType = 'masuk' | 'keluar';

export interface Transaction {
  id: string;
  date: string; // ISO date 'YYYY-MM-DD'
  type: TransactionType;
  category: string;
  title: string;
  amount: number;
  source_destination?: string; // Penerima / Pembayar
  receipt_no?: string; // Nomor bukti / kwitansi
  notes?: string;
  created_by?: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  description?: string;
}

export interface FinancialSummary {
  currentBalance: number;
  totalIncome: number;
  totalExpense: number;
  monthIncome: number;
  monthExpense: number;
  transactionCount: number;
}

export interface UserSession {
  isAuthenticated: boolean;
  userEmail?: string;
  userName?: string;
  role?: 'bendahara' | 'ketua' | 'pengurus' | 'admin';
}

export type PeriodFilter = 'all' | 'this_month' | 'last_month' | 'this_year' | 'custom';

export interface FridaySchedule {
  id?: string;
  friday_date: string; // 'YYYY-MM-DD'
  khatib_imam: string;
  muadzin: string;
  updated_at?: string;
  updated_by?: string;
}
