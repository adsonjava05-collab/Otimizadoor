import { CheckCircle2, Download, ExternalLink, FileSpreadsheet, Star } from 'lucide-react';

export function RecommendedBadge() {
  return (
    <span className="absolute -top-2.5 right-3 z-10 inline-flex items-center gap-1 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-amber-950 shadow-md ring-2 ring-white dark:ring-slate-800">
      <Star className="h-3 w-3 fill-current" />
      Recomendado
    </span>
  );
}

interface CircuitHandoffPanelProps {
  fileName: string;
  hasDownloaded: boolean;
  onOpenCircuit: () => void;
  onDownload: () => void;
}

export function CircuitHandoffPanel({
  fileName,
  hasDownloaded,
  onOpenCircuit,
  onDownload,
}: CircuitHandoffPanelProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
      <div className="flex items-center gap-3">
        <FileSpreadsheet className="h-5 w-5 shrink-0 text-brand-600 dark:text-brand-400" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{fileName}</p>
          <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Arquivo gerado com sucesso!
          </p>
        </div>
      </div>

      <div className="relative mt-4">
        <RecommendedBadge />
        <button
          onClick={onOpenCircuit}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 active:scale-[0.98]"
        >
          <ExternalLink className="h-4 w-4" />
          Abrir o Circuit
        </button>
      </div>
      <p className="mt-2.5 text-center text-xs font-medium text-slate-600 dark:text-slate-300">
        Recomendamos abrir o Circuit para enviar automaticamente seu arquivo e organizar e otimizar sua rota.
      </p>

      <button
        onClick={onDownload}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
      >
        <Download className="h-4 w-4" />
        {hasDownloaded ? 'Baixar novamente' : 'Baixar arquivo'}
      </button>
    </div>
  );
}
