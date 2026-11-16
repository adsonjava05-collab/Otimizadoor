import { CheckCircle2, Link2, MapPin, Package, XCircle } from 'lucide-react';
import type { ScanFilter } from '../types';

interface DashboardProps {
  total: number;
  stops: number;
  checked: number;
  activeFilter: ScanFilter;
  onFilterChange: (filter: ScanFilter) => void;
}

export function Dashboard({ total, stops, checked, activeFilter, onFilterChange }: DashboardProps) {
  const saved = Math.max(0, total - stops);
  const missing = Math.max(0, total - checked);

  const routeSummary = [
    { icon: Package, label: 'Pedidos', value: total, valueClass: 'text-slate-900 dark:text-white' },
    { icon: Link2, label: 'Economizadas', value: saved, valueClass: 'text-emerald-500' },
    { icon: MapPin, label: 'Paradas', value: stops, valueClass: 'text-slate-900 dark:text-white' },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
      {/* Linha 1 — Resumo da rota */}
      <div className="grid grid-cols-3 gap-2">
        {routeSummary.map(({ icon: Icon, label, value, valueClass }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-1 rounded-xl bg-slate-50 px-1 py-3 dark:bg-slate-800/60"
          >
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <Icon className="h-4 w-4" />
              <span className="text-[11px] font-medium leading-tight">{label}</span>
            </div>
            <p className={`text-2xl font-bold leading-none sm:text-3xl ${valueClass}`}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Linha 2 — Progresso da bipagem */}
      <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 dark:border-slate-700">
        <button
          type="button"
          aria-pressed={activeFilter === 'checked'}
          onClick={() => onFilterChange(activeFilter === 'checked' ? 'all' : 'checked')}
          className={`flex items-center justify-center gap-2 rounded-xl bg-emerald-50 px-2 py-2.5 ring-2 transition-all active:scale-[0.98] dark:bg-emerald-900/20 ${
            activeFilter === 'checked' ? 'ring-emerald-500' : 'ring-transparent hover:ring-emerald-200 dark:hover:ring-emerald-800'
          }`}
        >
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Lidos</span>
          <span className="text-lg font-bold leading-none text-emerald-500">{checked}</span>
        </button>
        <button
          type="button"
          aria-pressed={activeFilter === 'missing'}
          onClick={() => onFilterChange(activeFilter === 'missing' ? 'all' : 'missing')}
          className={`flex items-center justify-center gap-2 rounded-xl bg-red-50 px-2 py-2.5 ring-2 transition-all active:scale-[0.98] dark:bg-red-900/20 ${
            activeFilter === 'missing' ? 'ring-red-500' : 'ring-transparent hover:ring-red-200 dark:hover:ring-red-800'
          }`}
        >
          <XCircle className="h-4 w-4 shrink-0 text-red-500" />
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Faltantes</span>
          <span className="text-lg font-bold leading-none text-red-500">{missing}</span>
        </button>
      </div>
    </div>
  );
}
