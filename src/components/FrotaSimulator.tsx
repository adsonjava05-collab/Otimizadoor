import { Users, FileSpreadsheet, Loader2, CheckCircle2, ExternalLink, Download } from 'lucide-react';
import { RecommendedBadge } from './CircuitHandoffPanel';

const PRIMARY_BTN = 'flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-xs font-semibold text-white';
const SECONDARY_BTN = 'flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:border-slate-600 dark:text-slate-200';

export function SimFrotaHomeCard() {
  return (
    <div className="p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col rounded-2xl border border-slate-200 bg-white/50 p-4 opacity-50 dark:border-slate-700 dark:bg-slate-800/50">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-400">
            <FileSpreadsheet className="h-5 w-5 text-white" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Preparar Rota Flex</h4>
          <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">Prepare seus endereços em poucos passos.</p>
        </div>
        <div className="flex flex-col rounded-2xl border-2 border-orange-500 bg-white p-4 dark:bg-slate-800">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-blue-700">
            <Users className="h-5 w-5 text-white" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Otimizar Frota</h4>
          <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">Otimize a frota.</p>
        </div>
      </div>
    </div>
  );
}

export function SimFrotaImport() {
  return (
    <div className="p-4">
      <div className="flex flex-col items-center py-3 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-blue-700">
          <Users className="h-6 w-6 text-white" />
        </div>
        <h4 className="text-sm font-bold text-slate-900 dark:text-white">Otimizar Frota</h4>
        <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
          Prepare seus endereços e organize suas entregas em poucos passos.
        </p>
        <div className="mt-3 w-full">
          <div className={`${PRIMARY_BTN} ring-2 ring-orange-300 ring-offset-2`}>
            <FileSpreadsheet className="h-4 w-4" />
            Importar XLSX
          </div>
        </div>
      </div>
    </div>
  );
}

export function SimFrotaResult() {
  return (
    <div className="p-4">
      <div className="mb-4 space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-slate-100 p-2.5 text-center dark:bg-slate-700/50">
            <p className="text-lg font-bold text-slate-900 dark:text-white">120</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Pedidos</p>
          </div>
          <div className="rounded-xl bg-blue-50 p-2.5 text-center dark:bg-blue-900/30">
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">15</p>
            <p className="text-[10px] text-blue-600 dark:text-blue-400">Unificados</p>
          </div>
          <div className="rounded-xl bg-emerald-50 p-2.5 text-center dark:bg-emerald-900/30">
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">105</p>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400">Paradas</p>
          </div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex flex-col items-center py-2 text-center">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-900/30">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-xs font-bold text-slate-900 dark:text-white">Arquivo gerado com sucesso!</p>
          <p className="mt-0.5 text-[10px] text-slate-400">frota_otimizada.tsv</p>
        </div>
        <div className="relative">
          <RecommendedBadge />
          <div className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white ring-2 ring-blue-300 ring-offset-2">
            <ExternalLink className="h-4 w-4" />
            Abrir o Circuit
          </div>
        </div>
        <p className="text-center text-[10px] text-slate-500 dark:text-slate-400">
          Recomendamos abrir o Circuit para enviar automaticamente seu arquivo e organizar e otimizar sua rota.
        </p>
        <div className={SECONDARY_BTN}>
          <Download className="h-4 w-4" />
          Baixar arquivo
        </div>
      </div>
    </div>
  );
}
