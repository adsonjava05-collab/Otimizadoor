import { useState } from 'react';
import {
  getFloatingNumberAutoFill,
  isFillAccessibilityConnected,
  openAccessibilitySettings,
  setFloatingNumberAutoFill,
} from '../services/floatingNumberService';

type FillMode = 'normal' | 'auto';

const MODE_OPTIONS: { value: FillMode; label: string }[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'auto', label: 'Automático' },
];

const MODE_DESCRIPTIONS: Record<FillMode, string> = {
  normal: 'Gera e copia o número, como antes.',
  auto: 'Preenche o campo selecionado. Se não for possível, copia o número.',
};

export function FloatingNumberModeSelector() {
  const [mode, setMode] = useState<FillMode>(() => (getFloatingNumberAutoFill() ? 'auto' : 'normal'));
  const [showAccessibilityInfo, setShowAccessibilityInfo] = useState(false);

  const applyMode = (next: FillMode) => {
    setMode(next);
    setFloatingNumberAutoFill(next === 'auto');
    setShowAccessibilityInfo(false);
  };

  const handleSelect = (next: FillMode) => {
    if (next === mode) return;
    if (next === 'auto' && !isFillAccessibilityConnected()) {
      setShowAccessibilityInfo(true);
      return;
    }
    applyMode(next);
  };

  return (
    <div className="space-y-3 px-4 pb-3.5">
      <div className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-200">
        <span className="shrink-0">Modo do gerador</span>
        <div
          role="radiogroup"
          aria-label="Modo do gerador de números"
          className="grid flex-1 grid-cols-2 rounded-lg bg-slate-100 p-1 dark:bg-slate-800"
        >
          {MODE_OPTIONS.map((option) => {
            const selected = mode === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => handleSelect(option.value)}
                className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                  selected
                    ? 'bg-white font-semibold text-slate-900 shadow-sm dark:bg-slate-600 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
      <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">{MODE_DESCRIPTIONS[mode]}</p>

      {showAccessibilityInfo && (
        <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/40">
          <p className="text-xs leading-relaxed text-amber-900 dark:text-amber-100">
            O modo automático precisa da autorização de acessibilidade do Otimiza Flash. Ela é usada somente quando você toca no botão flutuante, para colocar o número no campo selecionado. O aplicativo não lê nem guarda o conteúdo de outros campos e nunca envia ou confirma formulários.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => openAccessibilitySettings()}
              className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
            >
              Abrir configurações
            </button>
            <button
              type="button"
              onClick={() => setShowAccessibilityInfo(false)}
              className="rounded-md px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-amber-100 dark:text-slate-200 dark:hover:bg-amber-900/60"
            >
              Agora não
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
