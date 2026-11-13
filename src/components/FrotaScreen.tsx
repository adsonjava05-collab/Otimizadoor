import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, FileSpreadsheet, Loader2, Users } from 'lucide-react';
import { addFrotaImportEntry } from '../services/historyService';
import { optimizeFrotaFile } from '../services/frotaOptimizerService';
import { saveBlobToDevice, openTempTsv } from '../services/nativeDownload';
import { CircuitHandoffPanel } from './CircuitHandoffPanel';
import { RouteProgress } from './RouteProgress';
import { CANCEL_BUTTON, PRIMARY_BUTTON, StatusPanel } from './RouteScreenParts';
import type { RawRow } from '../types';

const FROTA_PHASE_LABELS = ['Planilha', 'Arquivo da Frota'];

interface FrotaScreenProps {
  onBack: () => void;
  onError: (message: string) => void;
  onRegisterBackHandler: (handler: (() => boolean) | null) => () => void;
}

interface FrotaResult {
  blob: Blob;
  fileName: string;
  totalRows: number;
  outputRows: number;
  duplicatesRemoved: number;
}

export function FrotaScreen({ onBack, onError, onRegisterBackHandler }: FrotaScreenProps) {
  const frotaInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FrotaResult | null>(null);
  const [hasDownloaded, setHasDownloaded] = useState(false);

  const currentPhase = result && !loading ? 1 : 0;

  useEffect(() => {
    const unregister = onRegisterBackHandler(() => {
      if (result && !loading) {
        setResult(null);
        setHasDownloaded(false);
        return true;
      }
      return false;
    });
    return unregister;
  }, [loading, onRegisterBackHandler, result]);

  const downloadFrotaFile = async (): Promise<boolean> => {
    if (!result) return false;
    const { saved } = await saveBlobToDevice(result.blob, result.fileName);
    if (saved) setHasDownloaded(true);
    return saved;
  };

  const handleOpenFile = async () => {
    if (!result) return;
    const opened = await openTempTsv(result.blob, result.fileName);
    if (opened) return;
    const saved = await downloadFrotaFile();
    if (!saved) onError('Não foi possível abrir o arquivo. Baixe-o novamente.');
  };

  const handleFrotaFile = async (file: File) => {
    setResult(null);
    setHasDownloaded(false);
    setLoading(true);

    try {
      const output = await optimizeFrotaFile(file);

      if (output.outputRows === 0 && output.totalRows === 0) {
        onError('Nenhum dado encontrado no arquivo.');
        return;
      }

      try {
        await addFrotaImportEntry(
          file.name,
          output.totalRows,
          output.outputRows,
          output.duplicatesRemoved,
          output.headers,
          output.rows as unknown as RawRow[],
        );
      } catch (dbErr) {
        console.error('Failed to persist frota import:', dbErr);
      }

      setResult({
        blob: output.blob,
        fileName: output.outputFileName,
        totalRows: output.totalRows,
        outputRows: output.outputRows,
        duplicatesRemoved: output.duplicatesRemoved,
      });
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Erro ao processar arquivo Frota.');
    } finally {
      setLoading(false);
    }
  };

  const renderPanel = () => {
    if (loading) {
      return (
        <StatusPanel
          icon={<Loader2 className="h-7 w-7 animate-spin text-brand-600 dark:text-brand-400" />}
          title="Otimizando a frota..."
          text="Estamos processando a sua planilha."
        />
      );
    }

    if (result) {
      return (
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-slate-100 p-2.5 text-center dark:bg-slate-700/50">
              <p className="text-lg font-bold text-slate-900 dark:text-white">{result.totalRows}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Pedidos</p>
            </div>
            <div className="rounded-xl bg-blue-50 p-2.5 text-center dark:bg-blue-900/30">
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{result.duplicatesRemoved}</p>
              <p className="text-[10px] text-blue-600 dark:text-blue-400">Unificados</p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-2.5 text-center dark:bg-emerald-900/30">
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{result.outputRows}</p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400">Paradas</p>
            </div>
          </div>
          <CircuitHandoffPanel
            fileName={result.fileName}
            hasDownloaded={hasDownloaded}
            onOpenCircuit={handleOpenFile}
            onDownload={downloadFrotaFile}
          />
          <div className="flex flex-col items-center gap-2.5">
            <button
              onClick={() => {
                setResult(null);
                setHasDownloaded(false);
              }}
              className={CANCEL_BUTTON}
            >
              Nova otimização
            </button>
          </div>
        </div>
      );
    }

    return (
      <StatusPanel
        icon={<Users className="h-7 w-7 text-brand-600 dark:text-brand-400" />}
        title="Vamos otimizar sua frota?"
        text="Selecione sua planilha da frota."
      >
        <button onClick={() => frotaInputRef.current?.click()} className={PRIMARY_BUTTON}>
          <FileSpreadsheet className="h-4 w-4" />
          Selecionar XLSX
        </button>
      </StatusPanel>
    );
  };

  return (
    <section className="animate-fade-in space-y-5">
      <div className="flex items-start gap-3">
        <button
          onClick={onBack}
          aria-label="Voltar para a página inicial"
          className="mt-0.5 rounded-xl border border-slate-200 p-2 text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h2 className="text-xl font-bold leading-tight text-slate-900 dark:text-white">Otimizar Frota</h2>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">Prepare sua frota para otimização.</p>
        </div>
      </div>

      <RouteProgress
        labels={FROTA_PHASE_LABELS}
        current={currentPhase}
        viewed={currentPhase}
        failed={false}
      />

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        {renderPanel()}
      </div>

      <input
        ref={frotaInputRef}
        type="file"
        accept=".xlsx"
        className="hidden"
        disabled={loading}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFrotaFile(file);
          e.target.value = '';
        }}
      />
    </section>
  );
}
