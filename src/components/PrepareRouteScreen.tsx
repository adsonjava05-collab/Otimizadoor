import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  Loader2,
  RotateCcw,
  Truck,
} from 'lucide-react';
import { importPdf } from '../services/importService';
import { findByFileName, type HistoryEntry } from '../services/historyService';
import { optimizeAddressesFile } from '../services/addressOptimizerService';
import { ACTIVE_OPERATION_STEPS, type FlowState } from '../services/addressFlowService';
import { openSavedFile, openTempTsv } from '../services/nativeDownload';
import { CircuitHandoffPanel } from './CircuitHandoffPanel';
import { DuplicateFileModal } from './DuplicateFileModal';
import { ConfirmModal } from './ConfirmModal';
import { RouteProgress, routePhaseIndex } from './RouteProgress';
import { CANCEL_BUTTON, PRIMARY_BUTTON, SECONDARY_BUTTON, StatusPanel } from './RouteScreenParts';
import type { RawRow } from '../types';

interface PrepareRouteScreenProps {
  flowState: FlowState;
  preparedRoute: { blob: Blob; fileName: string } | null;
  routeRestoring: boolean;
  onBack: () => void;
  onCancelOperation: () => void;
  onAdvanceToPdfStage: () => void;
  onImport: (rows: RawRow[], headers: string[], fileName: string) => void;
  onResumeEntry: (entry: HistoryEntry) => void;
  onError: (message: string) => void;
  onAddressOptimized: (
    blob: Blob,
    outputFileName: string,
    metrics: FlowState['metrics'],
  ) => Promise<boolean>;
  onRetrySave: () => void;
  onDownloadAgain: () => Promise<boolean>;
  onRegisterBackHandler: (handler: (() => boolean) | null) => () => void;
}

export function PrepareRouteScreen({
  flowState,
  preparedRoute,
  routeRestoring,
  onBack,
  onCancelOperation,
  onAdvanceToPdfStage,
  onImport,
  onResumeEntry,
  onError,
  onAddressOptimized,
  onRetrySave,
  onDownloadAgain,
  onRegisterBackHandler,
}: PrepareRouteScreenProps) {
  const xlsxInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const [addressLoading, setAddressLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pendingAddressFile, setPendingAddressFile] = useState<File | null>(null);
  const [pendingPdf, setPendingPdf] = useState<File | null>(null);
  const [existingEntry, setExistingEntry] = useState<HistoryEntry | null>(null);
  const [hasDownloaded, setHasDownloaded] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState<number | null>(null);

  const step = flowState.step;
  const currentPhase = routePhaseIndex(step);
  const viewedPhase =
    selectedPhase !== null && selectedPhase < currentPhase ? selectedPhase : currentPhase;

  const handleBack = useCallback(() => {
    if (existingEntry) {
      setExistingEntry(null);
      setPendingPdf(null);
      return true;
    }
    if (pendingAddressFile) {
      setPendingAddressFile(null);
      return true;
    }
    if (selectedPhase !== null) {
      if (selectedPhase > 0) {
        setSelectedPhase(selectedPhase - 1);
        return true;
      }
      return false;
    }
    if (currentPhase > 0) {
      setSelectedPhase(currentPhase - 1);
      return true;
    }
    return false;
  }, [currentPhase, existingEntry, pendingAddressFile, selectedPhase]);

  useEffect(() => onRegisterBackHandler(handleBack), [handleBack, onRegisterBackHandler]);

  const handleOpenFile = async () => {
    if (!preparedRoute) return;
    onAdvanceToPdfStage();
    const opened = await openTempTsv(preparedRoute.blob, preparedRoute.fileName);
    if (opened) return;
    const openedSaved = await openSavedFile(preparedRoute.fileName);
    if (openedSaved) return;
    const saved = await onDownloadAgain();
    if (!saved) onError('Não foi possível abrir o arquivo. Baixe-o novamente.');
  };

  const handleDownloadFile = async () => {
    if (!preparedRoute) return;
    const saved = await onDownloadAgain();
    if (saved) setHasDownloaded(true);
  };

  const readPdf = async (file: File) => {
    const { rows, headers } = await importPdf(file);
    if (rows.length === 0) onError('Nenhum pedido encontrado no arquivo.');
    else onImport(rows, headers, file.name);
  };

  const handlePdfSelected = async (file: File) => {
    setPdfLoading(true);
    try {
      const existing = await findByFileName(file.name);
      if (existing) {
        setPendingPdf(file);
        setExistingEntry(existing);
        return;
      }
      await readPdf(file);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Erro ao importar arquivo.');
    } finally {
      setPdfLoading(false);
    }
  };

  const handleImportAnyway = async () => {
    if (!pendingPdf) return;
    const file = pendingPdf;
    setExistingEntry(null);
    setPendingPdf(null);
    setPdfLoading(true);
    try {
      await readPdf(file);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Erro ao importar arquivo.');
    } finally {
      setPdfLoading(false);
    }
  };

  const runAddressFlow = async (file: File) => {
    setSelectedPhase(null);
    setHasDownloaded(false);
    setAddressLoading(true);
    try {
      const { blob, outputFileName, totalOrders, totalStops } = await optimizeAddressesFile(file);
      if (!outputFileName) {
        onError('Nenhum endereço encontrado no arquivo.');
        return;
      }
      await onAddressOptimized(blob, outputFileName, {
        totalOrders,
        savedStops: Math.max(0, totalOrders - totalStops),
        totalStops,
      });
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Erro ao processar endereços.');
    } finally {
      setAddressLoading(false);
    }
  };

  const handleXlsxSelected = (file: File) => {
    if (ACTIVE_OPERATION_STEPS.includes(step)) {
      setPendingAddressFile(file);
      return;
    }
    runAddressFlow(file);
  };

  const cancelButton = (
    <button onClick={onCancelOperation} className={CANCEL_BUTTON}>
      Cancelar operação
    </button>
  );

  const backToCurrentButton = (
    <button onClick={() => setSelectedPhase(null)} className={SECONDARY_BUTTON}>
      Voltar para a etapa atual
    </button>
  );

  const renderPastPhase = () => {
    if (viewedPhase === 0) {
      return (
        <StatusPanel
          icon={<FileSpreadsheet className="h-7 w-7 text-brand-700 dark:text-brand-400" />}
          title="Planilha otimizada"
          text="Esta etapa já foi concluída. Para usar outra planilha, troque-a aqui e a preparação atual será substituída."
        >
          <button onClick={() => xlsxInputRef.current?.click()} className={PRIMARY_BUTTON}>
            <FileSpreadsheet className="h-4 w-4" />
            Trocar planilha
          </button>
          {backToCurrentButton}
        </StatusPanel>
      );
    }

    if (viewedPhase === 1) {
      return (
        <div className="space-y-5">
          {preparedRoute && (
            <CircuitHandoffPanel
              fileName={preparedRoute.fileName}
              hasDownloaded={hasDownloaded}
              onOpenCircuit={handleOpenFile}
              onDownload={handleDownloadFile}
            />
          )}
          <div className="flex flex-col items-center gap-2.5">{backToCurrentButton}</div>
        </div>
      );
    }

    return (
      <StatusPanel
        icon={<FileText className="h-7 w-7 text-brand-700 dark:text-brand-400" />}
        title="PDF da rota importado"
        text="Esta etapa já foi concluída."
      >
        {backToCurrentButton}
      </StatusPanel>
    );
  };

  const renderPanel = () => {
    if (addressLoading) {
      return (
        <StatusPanel
          icon={<Loader2 className="h-7 w-7 animate-spin text-brand-700 dark:text-brand-400" />}
          title="Otimizando endereços..."
          text="Estamos padronizando os endereços da sua planilha."
        />
      );
    }

    if (routeRestoring) {
      return (
        <StatusPanel
          icon={<Loader2 className="h-7 w-7 animate-spin text-brand-700 dark:text-brand-400" />}
          title="Recuperando a rota..."
          text="Estamos carregando o arquivo da rota salvo neste aparelho."
        />
      );
    }

    if (pdfLoading) {
      return (
        <StatusPanel
          icon={<Loader2 className="h-7 w-7 animate-spin text-brand-700 dark:text-brand-400" />}
          title="Lendo o PDF da rota..."
          text="Isso leva apenas alguns instantes."
        />
      );
    }

    if (viewedPhase < currentPhase) return renderPastPhase();

    if (step === 'optimized') {
      return (
        <StatusPanel
          icon={<Loader2 className="h-7 w-7 animate-spin text-brand-700 dark:text-brand-400" />}
          title="Salvando arquivo TSV..."
          text="Confirme o salvamento para continuar."
        />
      );
    }

    if (step === 'processing_pdf') {
      return (
        <StatusPanel
          icon={<Loader2 className="h-7 w-7 animate-spin text-brand-700 dark:text-brand-400" />}
          title="Processando o PDF da rota..."
          text="Aguarde enquanto preparamos a sua rota."
        />
      );
    }

    if (step === 'failed') {
      return (
        <StatusPanel
          icon={<RotateCcw className="h-7 w-7 text-red-600 dark:text-red-400" />}
          title="Não foi possível concluir"
          text={flowState.error ?? 'Ocorreu um erro ao preparar a rota.'}
        >
          <button
            onClick={() => (preparedRoute ? onRetrySave() : xlsxInputRef.current?.click())}
            className={PRIMARY_BUTTON}
          >
            <RotateCcw className="h-4 w-4" />
            Tentar novamente
          </button>
          <button onClick={onCancelOperation} className={SECONDARY_BUTTON}>
            Cancelar operação
          </button>
        </StatusPanel>
      );
    }

    if (step === 'awaiting_pdf' && !preparedRoute) {
      return (
        <StatusPanel
          icon={<RotateCcw className="h-7 w-7 text-red-600 dark:text-red-400" />}
          title="Arquivo da Rota indisponível"
          text="Não foi possível recuperar o arquivo da rota. Importe a planilha novamente para gerar o arquivo."
        >
          <button onClick={() => xlsxInputRef.current?.click()} className={PRIMARY_BUTTON}>
            <FileSpreadsheet className="h-4 w-4" />
            Importar a planilha novamente
          </button>
          {cancelButton}
        </StatusPanel>
      );
    }

    if (step === 'awaiting_pdf') {
      return (
        <div className="space-y-5">
          {preparedRoute && (
            <CircuitHandoffPanel
              fileName={preparedRoute.fileName}
              hasDownloaded={hasDownloaded}
              onOpenCircuit={handleOpenFile}
              onDownload={handleDownloadFile}
            />
          )}
          <div className="flex flex-col items-center gap-3">
            <p className="text-sm text-slate-500 dark:text-slate-400">Já tem o PDF da rota?</p>
            <button onClick={onAdvanceToPdfStage} className={SECONDARY_BUTTON}>
              Continuar →
            </button>
            {cancelButton}
          </div>
        </div>
      );
    }

    if (step === 'pdf_stage') {
      return (
        <StatusPanel
          icon={<FileText className="h-7 w-7 text-brand-700 dark:text-brand-400" />}
          title="Aguardando o PDF da rota"
          text="Quando o Circuit gerar o PDF, importe o arquivo aqui ou envie-o pela impressora virtual."
        >
          <button onClick={() => pdfInputRef.current?.click()} className={PRIMARY_BUTTON}>
            <FileText className="h-4 w-4" />
            Importar PDF
          </button>
          {preparedRoute && (
            <button onClick={handleOpenFile} className={SECONDARY_BUTTON}>
              <ExternalLink className="h-4 w-4" />
              Abrir o Circuit novamente
            </button>
          )}
          {cancelButton}
        </StatusPanel>
      );
    }

    if (step === 'pdf_imported') {
      return (
        <StatusPanel
          icon={<Truck className="h-7 w-7 text-brand-700 dark:text-brand-400" />}
          title="Rota em bipagem"
          text="A rota já foi importada. Para continuar a bipagem, abra-a pelo Histórico."
        >
          {cancelButton}
        </StatusPanel>
      );
    }

    return (
      <StatusPanel
        icon={<Truck className="h-7 w-7 text-brand-700 dark:text-brand-400" />}
        title="Vamos preparar sua rota?"
        text="Selecione sua planilha do SPX."
      >
        <button onClick={() => xlsxInputRef.current?.click()} className={PRIMARY_BUTTON}>
          <FileSpreadsheet className="h-4 w-4" />
          Selecionar XLSX
        </button>
        <div className="my-1 flex items-center gap-2">
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
          <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">ou</span>
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
        </div>
        <button onClick={() => pdfInputRef.current?.click()} className={SECONDARY_BUTTON}>
          <FileText className="h-4 w-4" />
          Já tenho o PDF
        </button>
      </StatusPanel>
    );
  };

  return (
    <section className="animate-fade-in space-y-5">
      <div className="flex items-start gap-3">
        <button
          onClick={() => {
            if (!handleBack()) onBack();
          }}
          aria-label="Voltar"
          className="mt-0.5 rounded-xl border border-slate-200 p-2 text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h2 className="text-xl font-bold leading-tight text-slate-900 dark:text-white">Preparar Rota</h2>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">Sua rota, do arquivo à bipagem.</p>
        </div>
      </div>

      <RouteProgress
        current={currentPhase}
        viewed={viewedPhase}
        failed={step === 'failed'}
        onSelect={(index) => setSelectedPhase(index === currentPhase ? null : index)}
      />

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        {renderPanel()}
        {flowState.error && step !== 'failed' && (
          <p className="mt-4 rounded-lg bg-red-50 p-2.5 text-xs text-red-700 dark:bg-red-900/20 dark:text-red-400">
            {flowState.error}
          </p>
        )}
      </div>

      <input
        ref={xlsxInputRef}
        type="file"
        accept=".xlsx"
        className="hidden"
        disabled={addressLoading}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleXlsxSelected(file);
          e.target.value = '';
        }}
      />
      <input
        ref={pdfInputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        disabled={pdfLoading}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handlePdfSelected(file);
          e.target.value = '';
        }}
      />

      {existingEntry && (
        <DuplicateFileModal
          fileName={existingEntry.fileName}
          onResume={() => {
            onResumeEntry(existingEntry);
            setExistingEntry(null);
            setPendingPdf(null);
          }}
          onImportAgain={handleImportAnyway}
          onClose={() => {
            setExistingEntry(null);
            setPendingPdf(null);
          }}
        />
      )}

      {pendingAddressFile && (
        <ConfirmModal
          title="Substituir a preparação atual?"
          message="Já existe uma rota em andamento com dados posteriores à planilha. Ao selecionar outra planilha, essa preparação será substituída."
          confirmLabel="Substituir"
          confirmVariant="danger"
          onConfirm={() => {
            const file = pendingAddressFile;
            setPendingAddressFile(null);
            runAddressFlow(file);
          }}
          onCancel={() => setPendingAddressFile(null)}
        />
      )}
    </section>
  );
}
