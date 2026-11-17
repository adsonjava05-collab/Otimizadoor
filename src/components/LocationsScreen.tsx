import { ArrowLeft, MapPin, Play, Square, AlertCircle, Settings, X, Navigation, CheckCircle2, CircleDashed } from 'lucide-react';

export interface LocationInfo {
  id: string;
  name: string;
  address: string;
}

export const LOCATIONS: LocationInfo[] = [
  { id: '1', name: 'Vila Guilherme', address: 'Coordenadas cadastradas' },
  { id: '2', name: 'Lapa', address: 'Coordenadas cadastradas' },
  { id: '3', name: 'Guarulhos', address: 'Coordenadas cadastradas' },
  { id: '4', name: 'Mooca', address: 'Endereço a definir' },
  { id: '5', name: 'Sacomã', address: 'Endereço a definir' },
];

const NATIVE_AVAILABLE_IDS = new Set(['1', '2', '3']);

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
  const activeLocation = activeId ? LOCATIONS.find((l) => l.id === activeId) ?? null : null;

  return (
    <div className="flex min-h-screen flex-col bg-slate-100 dark:bg-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
        <div className="mx-auto flex max-w-md items-center gap-3 px-4 py-3.5">
          <button
            onClick={onBack}
            className="rounded-xl border border-slate-200 p-2 text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="Voltar"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500">
              <MapPin className="h-4.5 w-4.5 text-white" />
            </div>
            <h1 className="text-base font-bold text-slate-900 dark:text-white">Localizações</h1>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col px-4 py-4">
        <div className="mx-auto w-full max-w-md space-y-4">
          {/* Painel de localização ativa */}
          <div
            className={`rounded-2xl border p-3.5 transition-all ${
              activeLocation
                ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/40'
                : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors ${
                  activeLocation
                    ? 'bg-emerald-100 dark:bg-emerald-900/50'
                    : 'bg-slate-100 dark:bg-slate-700'
                }`}
              >
                <Navigation
                  className={`h-5 w-5 ${
                    activeLocation ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'
                  }`}
                />
              </div>
              <div className="min-w-0 flex-1">
                {activeLocation ? (
                  <>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                      Localização simulada ativa
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                        {activeLocation.name}
                      </p>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                        <CheckCircle2 className="h-3 w-3" />
                        Em funcionamento
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                      Localização simulada
                    </p>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                      Nenhuma localização ativa
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Aviso de configuração necessária */}
          {isNativeMode && mockError === 'not_mock_app' && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3.5 dark:border-rose-900/60 dark:bg-rose-950/30">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-rose-900 dark:text-rose-200">
                    Configuração necessária
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-rose-700 dark:text-rose-300">
                    Selecione o Otimiza Flash como aplicativo de localização fictícia nas Opções do desenvolvedor.
                  </p>
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <button
                      onClick={onOpenMockSettings}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-600 active:scale-[0.98]"
                    >
                      <Settings className="h-4 w-4" />
                      Abrir Opções do desenvolvedor
                    </button>
                    <button
                      onClick={onDismissError}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                      <X className="h-4 w-4" />
                      Fechar aviso
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Aviso genérico (somente para erros confirmados que não sejam not_mock_app) */}
          {isNativeMode && mockError && mockError !== '' && mockError !== 'not_mock_app' && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3.5 dark:border-rose-900/60 dark:bg-rose-950/30">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-rose-800 dark:text-rose-200">
                    {mockError === 'no_coordinates'
                      ? 'Esta localização ainda não tem coordenadas cadastradas.'
                      : 'Não foi possível iniciar a simulação. Tente novamente.'}
                  </p>
                  <button
                    onClick={onDismissError}
                    className="mt-2 inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    <X className="h-3.5 w-3.5" />
                    Fechar aviso
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Cartões de localização */}
          <div className="space-y-2.5">
            {LOCATIONS.map((loc) => {
              const isActive = activeId === loc.id;
              const hasCoords = !isNativeMode || NATIVE_AVAILABLE_IDS.has(loc.id);
              return (
                <div
                  key={loc.id}
                  className={`rounded-2xl border p-3.5 transition-all ${
                    isActive
                      ? 'border-emerald-400 bg-white shadow-md ring-1 ring-emerald-200 dark:border-emerald-600 dark:bg-slate-800 dark:ring-emerald-900/40'
                      : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors ${
                        isActive
                          ? 'bg-emerald-100 dark:bg-emerald-900/40'
                          : hasCoords
                            ? 'bg-slate-100 dark:bg-slate-700'
                            : 'bg-slate-50 dark:bg-slate-800'
                      }`}
                    >
                      <MapPin
                        className={`h-5 w-5 ${
                          isActive
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : hasCoords
                              ? 'text-slate-400 dark:text-slate-500'
                              : 'text-slate-300 dark:text-slate-600'
                        }`}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h2 className="truncate text-sm font-bold text-slate-900 dark:text-white">
                          {loc.name}
                        </h2>
                        <span
                          className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                            isActive
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                              : hasCoords
                                ? 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                          }`}
                        >
                          {isActive ? (
                            <>
                              <CheckCircle2 className="h-3 w-3" />
                              Ativa
                            </>
                          ) : hasCoords ? (
                            <>
                              <CircleDashed className="h-3 w-3" />
                              Inativa
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-3 w-3" />
                              Indisponível
                            </>
                          )}
                        </span>
                      </div>
                      <p
                        className={`mt-0.5 truncate text-xs ${
                          hasCoords
                            ? 'text-slate-500 dark:text-slate-400'
                            : 'text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {hasCoords ? loc.address : 'Coordenadas pendentes'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2.5">
                    <button
                      onClick={() => onStart(loc.id)}
                      disabled={isActive || !hasCoords}
                      className={`flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                        isActive || !hasCoords
                          ? 'cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-500'
                          : 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 active:scale-[0.98]'
                      }`}
                    >
                      <Play className="h-4 w-4 fill-current" />
                      Iniciar
                    </button>
                    <button
                      onClick={() => onStop(loc.id)}
                      disabled={!isActive}
                      className={`flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                        !isActive
                          ? 'cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-500'
                          : 'bg-rose-600 text-white shadow-sm hover:bg-rose-700 active:scale-[0.98]'
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
