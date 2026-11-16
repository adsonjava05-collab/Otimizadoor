import { useState } from 'react';
import { CheckCircle2, ChevronLeft, ChevronRight, Layers, Settings, ShieldAlert } from 'lucide-react';

interface FloatingNumberTutorialProps {
  onCancel: () => void;
  onOpenSettings: () => void;
}

const STEPS = [
  {
    icon: Layers,
    title: 'Sobreposição',
    description:
      'O Gerador de Números precisa aparecer sobre outros aplicativos. Assim, você gera e copia o número sem sair da tela de entregas.',
    iconClass: 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300',
  },
  {
    icon: ShieldAlert,
    title: 'Configurações restritas',
    description:
      'Em alguns aparelhos, o Android pede autorizações extras para sobreposição, dependendo da versão. Se a opção aparecer bloqueada, libere o acesso restrito do aplicativo nas configurações do aparelho.',
    iconClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  },
  {
    icon: CheckCircle2,
    title: 'Ativação',
    description:
      'Toque em Abrir configurações, permita a sobreposição para o Otimiza Flash e volte para o aplicativo. O gerador será ativado automaticamente.',
    iconClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  },
];

export function FloatingNumberTutorial({ onCancel, onOpenSettings }: FloatingNumberTutorialProps) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="floating-tutorial-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center"
    >
      <div className="animate-slide-up w-full max-w-md rounded-t-3xl bg-white p-5 dark:bg-slate-800 sm:rounded-3xl">
        <div className="mb-5 flex gap-2" aria-hidden="true">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                i <= step ? 'bg-brand-500' : 'bg-slate-200 dark:bg-slate-700'
              }`}
            />
          ))}
        </div>

        <div className="mb-6 flex items-start gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-colors ${current.iconClass}`}
          >
            <Icon className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Passo {step + 1} de {STEPS.length}
            </p>
            <h2
              id="floating-tutorial-title"
              className="mt-0.5 text-lg font-bold text-slate-900 dark:text-white"
            >
              {current.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {current.description}
            </p>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={onCancel}
            className="w-full rounded-xl px-4 py-3 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-700 sm:w-auto dark:text-slate-400 dark:hover:text-slate-200"
          >
            Cancelar
          </button>
          <div className="flex gap-2">
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 sm:flex-none dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <ChevronLeft className="h-4 w-4" />
                Voltar
              </button>
            )}
            {isLast ? (
              <button
                onClick={onOpenSettings}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-3 text-sm font-bold text-slate-900 transition-colors hover:bg-brand-400 active:scale-[0.98] sm:flex-none"
              >
                <Settings className="h-4 w-4" />
                Abrir configurações
              </button>
            ) : (
              <button
                onClick={() => setStep(step + 1)}
                className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-brand-500 px-4 py-3 text-sm font-bold text-slate-900 transition-colors hover:bg-brand-400 active:scale-[0.98] sm:flex-none"
              >
                Próximo
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
