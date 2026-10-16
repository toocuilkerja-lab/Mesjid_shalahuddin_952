import React from 'react';
import { Search, Calendar, X, Tag } from 'lucide-react';
import { PeriodFilter, TransactionType } from '../types';

interface TransactionFiltersProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  typeFilter: 'all' | TransactionType;
  onTypeFilterChange: (val: 'all' | TransactionType) => void;
  categoryFilter: string;
  onCategoryFilterChange: (val: string) => void;
  periodFilter: PeriodFilter;
  onPeriodFilterChange: (val: PeriodFilter) => void;
  availableCategories: string[];
  totalMatches: number;
  onResetFilters: () => void;
}

export const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  periodFilter,
  onPeriodFilterChange,
  availableCategories,
  totalMatches,
  onResetFilters,
}) => {
  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    typeFilter !== 'all' ||
    categoryFilter !== 'all' ||
    periodFilter !== 'all';

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 mb-5">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari transaksi (uraian, pihak pembayar/penerima, no kwitansi)..."
            className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filters bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Type Segment Control */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            <button
              onClick={() => onTypeFilterChange('all')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                typeFilter === 'all'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => onTypeFilterChange('masuk')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 cursor-pointer ${
                typeFilter === 'masuk'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-700 hover:text-emerald-800'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Masuk
            </button>
            <button
              onClick={() => onTypeFilterChange('keluar')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 cursor-pointer ${
                typeFilter === 'keluar'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-rose-700 hover:text-rose-800'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
              Keluar
            </button>
          </div>

          {/* Period Dropdown */}
          <div className="relative">
            <select
              value={periodFilter}
              onChange={(e) => onPeriodFilterChange(e.target.value as PeriodFilter)}
              className="appearance-none pl-8 pr-7 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="all">Semua Periode</option>
              <option value="this_month">Bulan Ini</option>
              <option value="last_month">Bulan Lalu</option>
              <option value="this_year">Tahun 2026</option>
            </select>
            <Calendar className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Category Dropdown */}
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => onCategoryFilterChange(e.target.value)}
              className="appearance-none pl-8 pr-7 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 max-w-[190px] truncate cursor-pointer"
            >
              <option value="all">Semua Kategori</option>
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <Tag className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Reset Filters button if any active */}
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="px-2.5 py-1.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition font-medium flex items-center gap-1 border border-rose-200 cursor-pointer"
            >
              <X className="w-3 h-3" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Result counter badge */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>
          Menampilkan <strong className="text-slate-700">{totalMatches}</strong> transaksi
          {hasActiveFilters && ' yang sesuai dengan kriteria filter'}
        </span>
        <span className="text-emerald-700 font-medium hidden sm:inline">
          Data Terbuka & Transparan
        </span>
      </div>
    </div>
  );
};
