import type { FlowState } from '../services/addressFlowService';

const ROUTE_PHASE_LABELS = ['Planilha', 'Arquivo da Rota', 'PDF da rota'];

export function routePhaseIndex(step: FlowState['step']): number {
  if (step === 'idle' || step === 'completed') return -1;
  if (step === 'pdf_imported') return 3;
  if (step === 'processing_pdf' || step === 'pdf_stage') return 2;
  if (step === 'optimized' || step === 'xlsx_saved' || step === 'awaiting_pdf') return 1;
  return 0;
}

interface RouteProgressProps {
  current: number;
  viewed: number;
  failed: boolean;
  onSelect?: (index: number) => void;
  labels?: string[];
}

export function RouteProgress({ current, viewed, failed, onSelect, labels = ROUTE_PHASE_LABELS }: RouteProgressProps) {
  return (
    <ol className="flex items-center gap-2" aria-label="Progresso da preparação">
      {labels.map((label, index) => {
        const reachable = index <= current;
        const filled = index <= current;
        const active = index === current;
        return (
          <li key={label} className="flex min-w-0 flex-1">
            <button
              type="button"
              disabled={!reachable || !onSelect}
              onClick={() => onSelect?.(index)}
              aria-current={index === viewed ? 'step' : undefined}
              className="flex min-w-0 flex-1 flex-col gap-1.5 rounded-lg transition-opacity enabled:hover:opacity-80 disabled:cursor-default"
            >
              <span
                className={`h-1 w-full rounded-full transition-colors ${
                  filled
                    ? failed && active
                      ? 'bg-red-500'
                      : 'bg-brand-500 dark:bg-brand-400'
                    : 'bg-slate-200 dark:bg-slate-700'
                }`}
              />
              <span
                className={`truncate text-[11px] font-medium ${
                  index === viewed
                    ? 'text-slate-900 dark:text-white'
                    : reachable
                      ? 'text-slate-500 dark:text-slate-400'
                      : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {label}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
