import { Users, FileSpreadsheet, CheckCircle2, ExternalLink, Download } from 'lucide-react';
import { RecommendedBadge } from './CircuitHandoffPanel';

const SECONDARY_BTN = 'flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:border-slate-600 dark:text-slate-200';

export function SimFrotaImport() {
  return (
    <div className="p-4">
      <div className="flex flex-col items-center py-3 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-blue-700">
          <Users className="h-6 w-6 text-white" />
        </div>
        <h4 className="text-sm font-bold text-slate-900 dark:text-white">Otimizar Frota</h4>
        <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
          Selecione a planilha XLSX da sua frota.
        </p>
        <div className="mt-3 w-full">
          <div className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-xs font-semibold text-white ring-2 ring-orange-300 ring-offset-2">
            <FileSpreadsheet className="h-4 w-4" />
            Selecionar XLSX
          </div>
        </div>
      </div>
    </div>
  );
}

export function SimFrotaResult() {
  return (
    <div className="p-4">
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
