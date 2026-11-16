import { useState } from 'react';
import { TextCursorInput } from 'lucide-react';
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
        <TextCursorInput className="h-5 w-5 shrink-0 text-emerald-500" />
        <span>Modo de preenchimento</span>
      </div>

      <div role="radiogroup" aria-label="Modo de preenchimento" className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-900">
        {MODE_OPTIONS.map((option) => {
          const selected = mode === option.value;
          return (
            <button
              key={option.value}
              role="radio"
              aria-checked={selected}
              onClick={() => handleSelect(option.value)}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                selected
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">{MODE_DESCRIPTIONS[mode]}</p>

      {showAccessibilityInfo && (
        <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/40 dark:bg-amber-900/20">
          <p className="text-xs leading-5 text-amber-900 dark:text-amber-200">
            O modo automático precisa da autorização de acessibilidade do Otimiza Flash. Ela é usada somente quando você toca no botão flutuante, para colocar o número no campo selecionado. O aplicativo não lê nem guarda o conteúdo de outros campos e nunca envia ou confirma formulários.
          </p>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => openAccessibilitySettings()}
              className="w-full rounded-lg bg-brand-500 px-3 py-2.5 text-sm font-bold text-slate-900 transition-colors hover:bg-brand-400 active:scale-[0.98]"
            >
              Abrir configurações de acessibilidade
            </button>
            <button
              onClick={() => setShowAccessibilityInfo(false)}
              className="w-full rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-amber-100 dark:text-slate-300 dark:hover:bg-amber-900/30"
            >
              Continuar no modo normal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
