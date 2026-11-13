import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, PlayCircle, CheckCircle, ChevronRight, Route } from 'lucide-react';
import {
  completeTutorial,
  hasCompletedTutorial,
} from '../services/tutorialService';
import { FlexGuidedTour } from './FlexGuidedTour';

interface TutorialsPageProps {
  userId: string;
  onBack: () => void;
}

export function TutorialsPage({ userId, onBack }: TutorialsPageProps) {
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFlexTour, setShowFlexTour] = useState(false);

  useEffect(() => {
    hasCompletedTutorial(userId, 'flex').then(setIsCompleted);
  }, [userId]);

  const handleFlexTourComplete = useCallback(async () => {
    setShowFlexTour(false);
    const success = await completeTutorial(userId, 'flex');
    if (success) setIsCompleted(true);
  }, [userId]);

  const handleFlexTourSkip = useCallback(() => {
    setShowFlexTour(false);
  }, []);

  if (showFlexTour) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
        <FlexGuidedTour onComplete={handleFlexTourComplete} onSkip={handleFlexTourSkip} />
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
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600">
              <PlayCircle className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">Tutoriais</h1>
          </div>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <button
          onClick={() => setShowFlexTour(true)}
          className="group w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm transition-all hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl dark:border-slate-700 dark:bg-slate-800 dark:hover:border-blue-500"
        >
          <div
            className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl transition-colors ${
              isCompleted
                ? 'bg-emerald-100 dark:bg-emerald-900/30'
                : 'bg-blue-50 group-hover:bg-blue-100 dark:bg-blue-900/30'
            }`}
          >
            {isCompleted ? (
              <CheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Route className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            )}
          </div>

          <span
            className={`mt-5 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
              isCompleted
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
            }`}
          >
            {isCompleted ? 'Concluído' : 'Interativo'}
          </span>

          <h2 className="mt-3 text-xl font-bold text-slate-900 dark:text-white">
            Tutorial Flex (Interativo)
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            Apresentação guiada passo a passo do Preparar Rota
          </p>

          <div className="mt-6 flex items-center justify-center gap-1 text-sm font-semibold text-blue-600 transition-transform group-hover:translate-x-1 dark:text-blue-400">
            {isCompleted ? 'Refazer tutorial' : 'Iniciar tutorial'}
            <ChevronRight className="h-4 w-4" />
          </div>
        </button>
      </main>
    </div>
  );
}
