import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, PlayCircle, CheckCircle, ChevronRight, Route, Users } from 'lucide-react';
import { getTutorialStatus } from '../services/tutorialService';
import { FlexGuidedTour } from './FlexGuidedTour';
import { FrotaGuidedTour } from './FrotaGuidedTour';
import type { TutorialType } from '../services/tutorialService';

interface TutorialsPageProps {
  userId: string;
  onBack: () => void;
}

interface TutorialInfo {
  type: TutorialType;
  title: string;
  description: string;
  icon: typeof Route;
  iconBg: string;
}

const TUTORIALS: TutorialInfo[] = [
  {
    type: 'flex',
    title: 'Tutorial Flex (Interativo)',
    description: 'Apresentação guiada passo a passo do Preparar Rota',
    icon: Route,
    iconBg: 'from-brand-500 to-accent-400',
  },
  {
    type: 'frota',
    title: 'Tutorial Frota (Interativo)',
    description: 'Apresentação guiada passo a passo do Otimizar Frota',
    icon: Users,
    iconBg: 'from-brand-500 to-accent-400',
  },
];

export function TutorialsPage({ userId, onBack }: TutorialsPageProps) {
  const [statuses, setStatuses] = useState<Record<string, string>>({});
  const [activeTour, setActiveTour] = useState<TutorialType | null>(null);

  useEffect(() => {
    const s: Record<string, string> = {};
    for (const t of TUTORIALS) {
      s[t.type] = getTutorialStatus(t.type);
    }
    setStatuses(s);
  }, []);

  const handleTourComplete = useCallback((type: TutorialType) => {
    setActiveTour(null);
  }, []);

  const handleTourSkip = useCallback(() => {
    setActiveTour(null);
  }, []);

  if (activeTour === 'flex') {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
        <FlexGuidedTour
          onComplete={() => handleTourComplete('flex')}
          onSkip={handleTourSkip}
        />
      </div>
    );
  }

  if (activeTour === 'frota') {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
        <FrotaGuidedTour
          onComplete={() => handleTourComplete('frota')}
          onSkip={handleTourSkip}
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-100 dark:bg-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto flex max-w-4xl items-center gap-4 px-4 py-4">
          <button
            onClick={onBack}
            className="rounded-xl border border-slate-200 p-2.5 text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500">
              <PlayCircle className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">Tutoriais</h1>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-8">
        <div className="grid w-full max-w-md gap-4">
          {TUTORIALS.map((tutorial) => {
            const status = statuses[tutorial.type] ?? 'pendente';
            const isDone = status === 'concluido' || status === 'pulado';
            const Icon = tutorial.icon;
            return (
              <button
                key={tutorial.type}
                onClick={() => setActiveTour(tutorial.type)}
                className="group w-full rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm transition-all hover:-translate-y-1 hover:border-brand-300 hover:shadow-xl dark:border-slate-700 dark:bg-slate-800 dark:hover:border-brand-500"
              >
                <div
                  className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${tutorial.iconBg} transition-transform group-hover:scale-105`}
                >
                  <Icon className="h-8 w-8 text-slate-900" />
                </div>

                <span
                  className={`mt-5 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                    isDone
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                  }`}
                >
                  {isDone ? 'Concluído' : 'Interativo'}
                </span>

                <h2 className="mt-3 text-xl font-bold text-slate-900 dark:text-white">
                  {tutorial.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  {tutorial.description}
                </p>

                <div className="mt-6 flex items-center justify-center gap-1 text-sm font-semibold text-brand-700 transition-transform group-hover:translate-x-1 dark:text-brand-400">
                  {isDone ? 'Refazer tutorial' : 'Iniciar tutorial'}
                  <ChevronRight className="h-4 w-4" />
                </div>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}
