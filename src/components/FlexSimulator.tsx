import { FileSpreadsheet, FileText, ExternalLink, Download, ArrowRight, Camera, CheckCircle2, Truck, Loader2 } from 'lucide-react';
import { RecommendedBadge } from './CircuitHandoffPanel';

const PRIMARY_BTN = 'flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-semibold text-white';
const SECONDARY_BTN = 'flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:border-slate-600 dark:text-slate-200';

function MiniProgress({ phase }: { phase: 0 | 1 | 2 | 3 }) {
  const labels = ['Planilha', 'Arquivo da Rota', 'PDF da rota'];
  return (
    <div className="flex items-center gap-2 px-4 pt-3">
      {labels.map((label, i) => (
        <div key={label} className="flex min-w-0 flex-1 flex-col gap-1">
          <span className={`h-1 w-full rounded-full ${i <= phase ? 'bg-brand-600' : 'bg-slate-200 dark:bg-slate-700'}`} />
          <span className={`truncate text-[9px] font-medium ${i <= phase ? 'text-slate-600 dark:text-slate-300' : 'text-slate-300 dark:text-slate-600'}`}>{label}</span>
        </div>
      ))}
    </div>
  );
}

export function SimHomeCard() {
  return (
    <div className="p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col rounded-2xl border-2 border-brand-500 bg-white p-4 dark:bg-slate-800">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700">
            <Truck className="h-5 w-5 text-white" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Preparar Rota Flex</h4>
          <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">Prepare seus endereços em poucos passos.</p>
          <span className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-brand-600 dark:text-brand-400">
            Abrir <ArrowRight className="h-3 w-3" />
          </span>
        </div>
        <div className="flex flex-col rounded-2xl border border-slate-200 bg-white/50 p-4 opacity-50 dark:border-slate-700 dark:bg-slate-800/50">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-400">
            <Truck className="h-5 w-5 text-white" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Otimizar Frota</h4>
          <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">Otimize a frota.</p>
        </div>
      </div>
    </div>
  );
}

export function SimSelectXlsx() {
  return (
    <div className="p-4">
      <MiniProgress phase={0} />
      <div className="mt-4 flex flex-col items-center py-3 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 dark:bg-brand-900/30">
          <Truck className="h-6 w-6 text-brand-600 dark:text-brand-400" />
        </div>
        <h4 className="text-sm font-bold text-slate-900 dark:text-white">Vamos preparar sua rota?</h4>
        <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Selecione sua planilha do SPX.</p>
        <div className="mt-3 flex w-full flex-col gap-2">
          <div className={`${PRIMARY_BTN} ring-2 ring-brand-300 ring-offset-2`}>
            <FileSpreadsheet className="h-4 w-4" />
            Selecionar XLSX
          </div>
          <div className="flex items-center gap-2 py-0.5">
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
            <span className="text-[9px] font-medium uppercase text-slate-400">ou</span>
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
          </div>
          <div className={SECONDARY_BTN}>
            <FileText className="h-4 w-4" />
            Já tenho o PDF
          </div>
        </div>
      </div>
    </div>
  );
}

export function SimArquivoSpx() {
  return (
    <div className="p-4">
      <MiniProgress phase={1} />
      <div className="mt-4 space-y-3">
        <div className="flex flex-col items-center py-2 text-center">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-900/30">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-xs font-bold text-slate-900 dark:text-white">Arquivo gerado com sucesso!</p>
          <p className="mt-0.5 text-[10px] text-slate-400">rota_otimizada.tsv</p>
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
        <div className="flex flex-col items-center gap-2 pt-1">
          <p className="text-[10px] text-slate-500 dark:text-slate-400">Já tem o PDF da rota?</p>
          <div className={SECONDARY_BTN}>Continuar →</div>
        </div>
      </div>
    </div>
  );
}

export function SimPdfStage() {
  return (
    <div className="p-4">
      <MiniProgress phase={2} />
      <div className="mt-4 flex flex-col items-center py-2 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 dark:bg-brand-900/30">
          <FileText className="h-6 w-6 text-brand-600 dark:text-brand-400" />
        </div>
        <h4 className="text-sm font-bold text-slate-900 dark:text-white">Aguardando o PDF da rota</h4>
        <p className="mt-1 max-w-[220px] text-[11px] text-slate-500 dark:text-slate-400">
          Quando o Circuit gerar o PDF, importe o arquivo aqui ou envie pela impressora virtual.
        </p>
        <div className="mt-3 w-full">
          <div className={`${PRIMARY_BTN} ring-2 ring-brand-300 ring-offset-2`}>
            <FileText className="h-4 w-4" />
            Importar PDF
          </div>
        </div>
      </div>
    </div>
  );
}

export function SimScanner() {
  return (
    <div className="p-4">
      <div className="rounded-2xl border border-slate-200 bg-slate-900 p-4 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white">Bipagem</span>
          <Camera className="h-4 w-4 text-white/70" />
        </div>
        <div className="relative mx-auto mt-3 flex h-32 items-center justify-center rounded-xl border-2 border-dashed border-white/20">
          <div className="absolute top-1/2 left-1/2 h-0.5 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500/60" />
          <Loader2 className="h-5 w-5 animate-spin text-white/40" />
        </div>
        <p className="mt-2 text-center text-[10px] text-white/50">
          Aponte para o código do pacote
        </p>
      </div>
      <div className="mt-3 space-y-1.5">
        {[
          { seq: '001', tn: 'SPX-123456', ok: true },
          { seq: '002', tn: 'SPX-789012', ok: true },
          { seq: '003', tn: 'SPX-345678', ok: false },
        ].map((item) => (
          <div key={item.seq} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 dark:border-slate-700 dark:bg-slate-800">
            {item.ok ? (
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
            ) : (
              <div className="h-3.5 w-3.5 shrink-0 rounded-full border-2 border-slate-300" />
            )}
            <span className="text-[10px] font-mono text-slate-400">{item.seq}</span>
            <span className="text-[10px] font-medium text-slate-700 dark:text-slate-200">{item.tn}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SimFinalizacao() {
  return (
    <div className="flex flex-col items-center p-8 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
        <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
      </div>
      <h4 className="text-base font-bold text-slate-900 dark:text-white">Rota concluída!</h4>
      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
        Todos os pedidos foram conferidos.
      </p>
    </div>
  );
}
