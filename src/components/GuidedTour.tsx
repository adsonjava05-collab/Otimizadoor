import { useState, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import type { ReactNode } from 'react';

export interface TourStep {
  title: string;
  description: string;
  content?: ReactNode;
}

interface GuidedTourProps {
  steps: TourStep[];
  onComplete: () => void;
  onSkip: () => void;
}

export function GuidedTour({ steps, onComplete, onSkip }: GuidedTourProps) {
  const [current, setCurrent] = useState(0);
  const total = steps.length;
  const step = steps[current];
  const isFirst = current === 0;
  const isLast = current === total - 1;

  const next = useCallback(() => {
    if (isLast) {
      onComplete();
      return;
    }
    setCurrent((c) => Math.min(c + 1, total - 1));
  }, [isLast, onComplete, total]);

  const prev = useCallback(() => {
    setCurrent((c) => Math.max(c - 1, 0));
  }, []);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 py-6">
      <div className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3 dark:border-slate-700">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
            {current + 1} de {total}
          </span>
          <button
            onClick={onSkip}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" />
            Pular
          </button>
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-1.5 px-5 pt-3">
          {steps.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === current
                  ? 'w-6 bg-brand-600 dark:bg-brand-400'
                  : i < current
                    ? 'w-1.5 bg-brand-400 dark:bg-brand-600'
                    : 'w-1.5 bg-slate-200 dark:bg-slate-600'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {step.content && (
            <div className="mb-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/50">
              {step.content}
            </div>
          )}
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{step.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            {step.description}
          </p>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-5 py-3 dark:border-slate-700">
          <button
            onClick={prev}
            disabled={isFirst}
            className="flex items-center gap-1 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </button>

          {isLast ? (
            <button
              onClick={onComplete}
              className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-700 active:scale-[0.98]"
            >
              <CheckCircle2 className="h-4 w-4" />
              Concluir tutorial
            </button>
          ) : (
            <button
              onClick={next}
              className="flex items-center gap-1 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-700 active:scale-[0.98]"
            >
              Próximo
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
