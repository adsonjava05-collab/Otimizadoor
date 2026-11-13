import { CheckCircle2, Package, Timer } from 'lucide-react';
import { formatOrdersCount, formatScanDuration } from '../services/scanTimerService';

export interface CompletionSummary {
  totalOrders: number;
  durationMs: number;
}

interface CompletionModalProps {
  summary: CompletionSummary;
  onBackToStart: () => void;
}

export function CompletionModal({ summary, onBackToStart }: CompletionModalProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="completion-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm animate-fade-in"
    >
      <div className="w-full max-w-sm animate-slide-up overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 text-center shadow-2xl">
        <div className="h-1.5 bg-gradient-to-r from-brand-500 via-accent-400 to-brand-500" />
        <div className="p-6 sm:p-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-500/15 ring-1 ring-brand-500/40">
            <CheckCircle2 className="h-8 w-8 text-brand-400" />
          </div>

          <h3
            id="completion-modal-title"
            className="mt-4 text-xl font-extrabold uppercase tracking-wide text-white"
          >
            Bipagem concluída!
          </h3>

          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-center gap-3 rounded-2xl bg-slate-800 px-4 py-3">
              <Package className="h-5 w-5 shrink-0 text-slate-300" />
              <span className="text-sm font-semibold uppercase tracking-wide text-slate-100">
                {formatOrdersCount(summary.totalOrders)} bipados
              </span>
            </div>

            <div className="rounded-2xl border border-accent-400/40 bg-accent-400/10 px-4 py-4">
              <div className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent-300">
                <Timer className="h-4 w-4 shrink-0" />
                Tempo total
              </div>
              <p className="mt-1 text-2xl font-extrabold uppercase text-accent-400 sm:text-3xl">
                {formatScanDuration(summary.durationMs)}
              </p>
            </div>
          </div>

          <button
            onClick={onBackToStart}
            className="mt-6 w-full rounded-xl bg-brand-500 py-3 text-sm font-bold uppercase tracking-wide text-slate-900 transition-colors hover:bg-brand-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-400"
          >
            Voltar ao início
          </button>
        </div>
      </div>
    </div>
  );
}
