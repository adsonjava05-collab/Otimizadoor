import { useState, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle } from 'lucide-react';
import type { ReactNode } from 'react';

export interface TourStep {
  title: string;
  description: string;
  content?: ReactNode;
  hideDescription?: boolean;
}

interface GuidedTourProps {
  steps: TourStep[];
  onComplete: () => void;
  onSkip: () => void;
}

export function GuidedTour({ steps, onComplete, onSkip }: GuidedTourProps) {
  const [current, setCurrent] = useState(0);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);
  const [showSkipInfo, setShowSkipInfo] = useState(false);
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

  const handleSkipClick = () => setShowSkipConfirm(true);
  const handleSkipCancel = () => setShowSkipConfirm(false);
  const handleSkipConfirmYes = () => {
    setShowSkipConfirm(false);
    setShowSkipInfo(true);
  };
  const handleSkipInfoOk = () => {
    setShowSkipInfo(false);
    onSkip();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 py-6">
      <div className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3 dark:border-slate-700">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
            {current + 1} de {total}
          </span>
          <button
            onClick={handleSkipClick}
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
                  ? 'w-6 bg-brand-500 dark:bg-brand-400'
                  : i < current
                    ? 'w-1.5 bg-brand-400 dark:bg-brand-500'
                    : 'w-1.5 bg-slate-200 dark:bg-slate-600'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className={`flex-1 overflow-y-auto ${step.hideDescription ? 'px-3 py-3' : 'px-5 py-4'}`}>
          {step.content && (
            <div
              className={`overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/50 ${
                step.hideDescription ? 'mb-3' : 'mb-4'
              }`}
            >
              {step.content}
            </div>
          )}
          <h3 className={`text-lg font-bold text-slate-900 dark:text-white ${step.hideDescription ? 'px-2' : ''}`}>
            {step.title}
          </h3>
          {!step.hideDescription && (
            <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              {step.description}
            </p>
          )}
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
              className="flex items-center gap-1.5 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-bold text-slate-900 transition-colors hover:bg-brand-400 active:scale-[0.98]"
            >
              <CheckCircle2 className="h-4 w-4" />
              Concluir tutorial
            </button>
          ) : (
            <button
              onClick={next}
              className="flex items-center gap-1 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-bold text-slate-900 transition-colors hover:bg-brand-400 active:scale-[0.98]"
            >
              Próximo
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Skip confirmation — step 1 */}
      {showSkipConfirm && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-2xl dark:border-slate-700 dark:bg-slate-800">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
              <AlertTriangle className="h-7 w-7 text-amber-600 dark:text-amber-400" />
            </div>
            <p className="text-base font-bold text-slate-900 dark:text-white">
              Tem certeza de que deseja pular o tutorial?
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleSkipConfirmYes}
                className="flex-1 rounded-xl bg-brand-500 py-3 text-sm font-bold text-slate-900 transition-colors hover:bg-brand-400 active:scale-[0.98]"
              >
                Sim
              </button>
              <button
                onClick={handleSkipCancel}
                className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-100 active:scale-[0.98] dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
              >
                Não
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Skip info — step 2 */}
      {showSkipInfo && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-2xl dark:border-slate-700 dark:bg-slate-800">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/30">
              <CheckCircle2 className="h-7 w-7 text-brand-700 dark:text-brand-400" />
            </div>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Você pode rever este tutorial a qualquer momento em Configurações &gt; Tutoriais.
            </p>
            <button
              onClick={handleSkipInfoOk}
              className="mt-6 w-full rounded-xl bg-brand-500 py-3 text-sm font-bold text-slate-900 transition-colors hover:bg-brand-400 active:scale-[0.98]"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
