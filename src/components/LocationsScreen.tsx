import { useState } from 'react';
import { ArrowLeft, MapPin, Play, Square, Info } from 'lucide-react';

interface LocationInfo {
  id: string;
  name: string;
  address: string;
}

const LOCATIONS: LocationInfo[] = [
  { id: '1', name: 'Localização 1', address: 'Avenida Paulista, 1010' },
  { id: '2', name: 'Localização 2', address: 'Rua Machado Nunes, 87' },
  { id: '3', name: 'Localização 3', address: 'Rua Joaquim Meira de Siqueira, 260' },
  { id: '4', name: 'Localização 4', address: 'Endereço a definir' },
];

interface LocationsScreenProps {
  onBack: () => void;
}

export function LocationsScreen({ onBack }: LocationsScreenProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleStart = (id: string) => {
    setActiveId(id);
  };

  const handleStop = (id: string) => {
    if (activeId === id) setActiveId(null);
  };

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
              <MapPin className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">Localizações</h1>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col px-4 py-6">
        <div className="mx-auto w-full max-w-md space-y-5">
          <div>
            <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Selecione uma localização para iniciar ou parar.
            </p>
            <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2.5 dark:bg-amber-950/30">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-200">
                Funcionalidade em demonstração. Os endereços são apenas exemplos visuais.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {LOCATIONS.map((loc) => {
              const isActive = activeId === loc.id;
              return (
                <div
                  key={loc.id}
                  className={`rounded-2xl border p-5 transition-all ${
                    isActive
                      ? 'border-emerald-400 bg-white shadow-md ring-2 ring-emerald-200 dark:border-emerald-500 dark:bg-slate-800 dark:ring-emerald-900/50'
                      : 'border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors ${
                        isActive
                          ? 'bg-emerald-100 dark:bg-emerald-900/40'
                          : 'bg-slate-100 dark:bg-slate-700'
                      }`}
                    >
                      <MapPin
                        className={`h-6 w-6 ${
                          isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'
                        }`}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                        {loc.name}
                      </h2>
                      <p className="mt-0.5 truncate text-sm text-slate-500 dark:text-slate-400">
                        {loc.address}
                      </p>

                      <div className="mt-2.5 flex items-center gap-2">
                        <span
                          className={`inline-block h-2.5 w-2.5 rounded-full ${
                            isActive ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
                          }`}
                        />
                        <span
                          className={`text-xs font-semibold ${
                            isActive
                              ? 'text-emerald-700 dark:text-emerald-300'
                              : 'text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          {isActive ? 'Ativa' : 'Inativa'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleStart(loc.id)}
                      disabled={isActive}
                      className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                        isActive
                          ? 'cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-500'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.98]'
                      }`}
                    >
                      <Play className="h-4 w-4 fill-current" />
                      Iniciar
                    </button>
                    <button
                      onClick={() => handleStop(loc.id)}
                      disabled={!isActive}
                      className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                        !isActive
                          ? 'cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-500'
                          : 'bg-rose-600 text-white hover:bg-rose-700 active:scale-[0.98]'
                      }`}
                    >
                      <Square className="h-4 w-4 fill-current" />
                      Parar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
