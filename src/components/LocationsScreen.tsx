import { ArrowLeft, MapPin, Play, Square, Info, AlertCircle, Settings } from 'lucide-react';

export interface LocationInfo {
  id: string;
  name: string;
  address: string;
}

export const LOCATIONS: LocationInfo[] = [
  { id: '1', name: 'Vila Guilherme', address: 'Coordenadas cadastradas' },
  { id: '2', name: 'Lapa', address: 'Endereço a definir' },
  { id: '3', name: 'Guarulhos', address: 'Endereço a definir' },
  { id: '4', name: 'Mooca', address: 'Endereço a definir' },
  { id: '5', name: 'Sacomã', address: 'Endereço a definir' },
];

const NATIVE_AVAILABLE_IDS = new Set(['1']);

interface LocationsScreenProps {
  activeId: string | null;
  onStart: (id: string) => void;
  onStop: (id: string) => void;
  onBack: () => void;
  isNativeMode: boolean;
  mockError: string;
  onOpenMockSettings: () => void;
  onDismissError: () => void;
}

export function LocationsScreen({
  activeId,
  onStart,
  onStop,
  onBack,
  isNativeMode,
  mockError,
  onOpenMockSettings,
  onDismissError,
}: LocationsScreenProps) {
  const errorMessages: Record<string, string> = {
    not_mock_app:
      'Selecione o Otimiza Flash como app de localização fictícia nas Opções do desenvolvedor.',
    no_coordinates: 'Esta localização ainda não tem coordenadas cadastradas.',
    unknown: 'Não foi possível iniciar a simulação. Tente novamente.',
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
                {isNativeMode
                  ? 'Localização simulada via Android. Selecione o app nas Opções do desenvolvedor.'
                  : 'Funcionalidade em demonstração. Os endereços são apenas exemplos visuais.'}
              </p>
            </div>
          </div>

          {isNativeMode && mockError && mockError !== '' && (
            <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900/50 dark:bg-rose-950/30">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-rose-800 dark:text-rose-200">
                  {errorMessages[mockError] ?? 'Erro ao iniciar simulação.'}
                </p>
                {mockError === 'not_mock_app' && (
                  <button
                    onClick={onOpenMockSettings}
                    className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-rose-700 hover:text-rose-800 dark:text-rose-300"
                  >
                    <Settings className="h-4 w-4" />
                    Abrir Opções do desenvolvedor
                  </button>
                )}
                <button
                  onClick={onDismissError}
                  className="mt-2 text-xs text-rose-600 hover:underline dark:text-rose-400"
                >
                  Fechar aviso
                </button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {LOCATIONS.map((loc) => {
              const isActive = activeId === loc.id;
              const hasCoords = !isNativeMode || NATIVE_AVAILABLE_IDS.has(loc.id);
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
                      onClick={() => onStart(loc.id)}
                      disabled={isActive || !hasCoords}
                      className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                        isActive || !hasCoords
                          ? 'cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-500'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.98]'
                      }`}
                    >
                      <Play className="h-4 w-4 fill-current" />
                      Iniciar
                    </button>
                    <button
                      onClick={() => onStop(loc.id)}
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
                  {isNativeMode && !hasCoords && (
                    <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                      Coordenadas ainda não cadastradas.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
