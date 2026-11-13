import { useRef, useState } from 'react';
import { ChevronRight, Loader2, Users, FileSpreadsheet } from 'lucide-react';
import { addFrotaImportEntry } from '../services/historyService';
import { optimizeFrotaFile } from '../services/frotaOptimizerService';
import { saveBlobToDevice, openTempTsv } from '../services/nativeDownload';
import { CircuitHandoffPanel } from './CircuitHandoffPanel';
import type { RawRow } from '../types';

interface FrotaCardProps {
  onError?: (message: string) => void;
  onOpen?: () => void;
}

export function FrotaCard({ onError, onOpen }: FrotaCardProps) {
  const frotaInputRef = useRef<HTMLInputElement>(null);
  const [frotaLoading, setFrotaLoading] = useState(false);
  const [frotaResult, setFrotaResult] = useState<{ blob: Blob; fileName: string } | null>(null);
  const [frotaStats, setFrotaStats] = useState<{ totalRows: number; outputRows: number; duplicatesRemoved: number } | null>(null);
  const [hasDownloaded, setHasDownloaded] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const downloadFrotaFile = async (): Promise<boolean> => {
    if (!frotaResult) return false;
    const { saved } = await saveBlobToDevice(frotaResult.blob, frotaResult.fileName);
    if (saved) setHasDownloaded(true);
    return saved;
  };

  const handleOpenFile = async () => {
    if (!frotaResult) return;
    const opened = await openTempTsv(frotaResult.blob, frotaResult.fileName);
    if (opened) return;
    const saved = await downloadFrotaFile();
    if (!saved) onError?.('Não foi possível abrir o arquivo. Baixe-o novamente.');
  };

  const handleFrotaFile = async (file: File) => {
    setFrotaResult(null);
    setFrotaStats(null);
    setHasDownloaded(false);
    setFrotaLoading(true);

    try {
      const result = await optimizeFrotaFile(file);

      if (result.outputRows === 0 && result.totalRows === 0) {
        onError?.('Nenhum dado encontrado no arquivo.');
        return;
      }

      try {
        await addFrotaImportEntry(
          file.name,
          result.totalRows,
          result.outputRows,
          result.duplicatesRemoved,
          result.headers,
          result.rows as unknown as RawRow[],
        );
      } catch (dbErr) {
        console.error('Failed to persist frota import:', dbErr);
      }

      setFrotaResult({ blob: result.blob, fileName: result.outputFileName });
      setFrotaStats({
        totalRows: result.totalRows,
        outputRows: result.outputRows,
        duplicatesRemoved: result.duplicatesRemoved,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao processar arquivo Frota.';
      onError?.(msg);
    } finally {
      setFrotaLoading(false);
    }
  };

  const handleReset = () => {
    setFrotaResult(null);
    setFrotaStats(null);
    setHasDownloaded(false);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-800">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-blue-700">
          <Users className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Otimizar Frota
          </h3>
        </div>
      </div>

      <p className="mb-5 min-h-[88px] text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        Prepare seus endereços e organize suas entregas em poucos passos.
      </p>

      {frotaStats && frotaResult && !frotaLoading && (
        <div className="mb-4 space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-slate-100 p-2.5 text-center dark:bg-slate-700/50">
              <p className="text-lg font-bold text-slate-900 dark:text-white">{frotaStats.totalRows}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Pedidos</p>
            </div>
            <div className="rounded-xl bg-blue-50 p-2.5 text-center dark:bg-blue-900/30">
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{frotaStats.duplicatesRemoved}</p>
              <p className="text-[10px] text-blue-600 dark:text-blue-400">Unificados</p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-2.5 text-center dark:bg-emerald-900/30">
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{frotaStats.outputRows}</p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400">Paradas</p>
            </div>
          </div>
        </div>
      )}

      {!expanded ? (
        <button
          onClick={() => {
            setExpanded(true);
            onOpen?.();
          }}
          className="flex w-full items-center justify-center gap-1 rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-700 active:scale-[0.98]"
        >
          Abrir
          <ChevronRight className="h-4 w-4" />
        </button>
      ) : frotaResult && !frotaLoading ? (
        <div className="space-y-4">
          <CircuitHandoffPanel
            fileName={frotaResult.fileName}
            hasDownloaded={hasDownloaded}
            onOpenCircuit={handleOpenFile}
            onDownload={downloadFrotaFile}
          />
          <button
            onClick={handleReset}
            className="w-full rounded-xl px-4 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200"
          >
            Nova otimização
          </button>
        </div>
      ) : (
        <button
          onClick={() => frotaInputRef.current?.click()}
          disabled={frotaLoading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap"
        >
          {frotaLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processando...
            </>
          ) : (
            <>
              <FileSpreadsheet className="h-4 w-4" />
              Importar XLSX
            </>
          )}
        </button>
      )}
      <input
        ref={frotaInputRef}
        type="file"
        accept=".xlsx"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFrotaFile(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}
