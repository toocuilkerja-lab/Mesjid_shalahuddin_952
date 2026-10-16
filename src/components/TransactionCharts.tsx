import React, { useState } from 'react';
import { PieChart } from 'lucide-react';
import { Transaction } from '../types';
import { formatRupiah } from '../lib/utils';

interface TransactionChartsProps {
  transactions: Transaction[];
}

export const TransactionCharts: React.FC<TransactionChartsProps> = ({ transactions }) => {
  const [activeTab, setActiveTab] = useState<'masuk' | 'keluar'>('masuk');

  // Filter transactions by active tab
  const filtered = transactions.filter((t) => t.type === activeTab);
  const totalAmount = filtered.reduce((acc, curr) => acc + Number(curr.amount), 0);

  // Group by category
  const categoryMap: { [cat: string]: number } = {};
  filtered.forEach((tx) => {
    categoryMap[tx.category] = (categoryMap[tx.category] || 0) + Number(tx.amount);
  });

  const categories = Object.entries(categoryMap)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: totalAmount > 0 ? (amount / totalAmount) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const colors = [
    'bg-emerald-500',
    'bg-teal-500',
    'bg-amber-500',
    'bg-cyan-500',
    'bg-indigo-500',
    'bg-blue-500',
    'bg-rose-500',
    'bg-purple-500',
  ];

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
            <PieChart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm sm:text-base">
              Distribusi Kategori Keuangan
            </h3>
            <p className="text-xs text-slate-500">
              Analisis alokasi pos penerimaan infaq dan beban operasional masjid
            </p>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('masuk')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'masuk'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pemasukan ({categories.length})
          </button>
          <button
            onClick={() => setActiveTab('keluar')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'keluar'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pengeluaran ({categories.length})
          </button>
        </div>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-8 text-slate-400 text-sm">
          Belum ada data transaksi {activeTab === 'masuk' ? 'pemasukan' : 'pengeluaran'}.
        </div>
      ) : (
        <div className="space-y-3.5">
          {categories.map((item, idx) => {
            const barColor =
              activeTab === 'masuk'
                ? colors[idx % colors.length]
                : idx === 0
                ? 'bg-rose-500'
                : 'bg-rose-400';

            return (
              <div key={item.category} className="group">
                <div className="flex items-center justify-between text-xs sm:text-sm mb-1.5">
                  <div className="flex items-center gap-2 font-medium text-slate-700 truncate pr-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${barColor} shrink-0`} />
                    <span className="truncate">{item.category}</span>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0 text-right">
                    <span className="font-bold text-slate-800">
                      {formatRupiah(item.amount)}
                    </span>
                    <span className="text-xs text-slate-400 w-11 text-right font-medium">
                      {item.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
                {/* Progress track */}
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                    style={{ width: `${Math.max(item.percentage, 2)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
