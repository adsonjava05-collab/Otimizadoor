import { clearStore, deleteRecord, getAllRecords, getRecord, putRecord } from './localDb';
import type { RawRow, DeliveryGroup, CheckState } from '../types';

export interface HistoryEntry {
  id: string;
  fileName: string;
  date: string;
  totalOrders: number;
  totalGroups: number;
  checkedOrders: number;
  importTime: string;
  exportTime: string | null;
  rows: RawRow[];
  groups: DeliveryGroup[];
  headers: string[];
  checkState: CheckState;
  importType?: string;
  firstScanAt: number | null;
  completedAt: number | null;
}

export interface FrotaHistoryEntry {
  id: string;
  fileName: string;
  totalRows: number;
  outputRows: number;
  duplicatesRemoved: number;
  headers: string[];
  rows: RawRow[];
  importTime: string;
}

interface ImportRecord {
  id: string;
  fileName: string;
  importType: string;
  importTime: string;
  exportTime: string | null;
  totalOrders: number;
  totalGroups: number;
  checkedGroups: number;
  rows: RawRow[];
  groups: DeliveryGroup[];
  headers: string[];
  checkState: CheckState;
  createdAt: string;
  firstScanAt?: number | null;
  completedAt?: number | null;
}

const EMPTY_CHECK_STATE: CheckState = { checked: {}, spxToGroup: {} };

function countChecked(checkState: CheckState): number {
  return Object.values(checkState.checked).filter(Boolean).length;
}

function newRecordId(): string {
  return crypto.randomUUID();
}

function toHistoryEntry(record: ImportRecord): HistoryEntry {
  const importTime = record.importTime;
  return {
    id: record.id,
    fileName: record.fileName,
    date: importTime ? new Date(importTime).toLocaleDateString('pt-BR') : '',
    totalOrders: record.totalOrders,
    totalGroups: record.totalGroups,
    checkedOrders: record.checkedGroups,
    importTime: importTime ? new Date(importTime).toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '',
    exportTime: record.exportTime,
    rows: record.rows,
    groups: record.groups,
    headers: record.headers,
    checkState: record.checkState,
    importType: record.importType,
    firstScanAt: record.firstScanAt ?? null,
    completedAt: record.completedAt ?? null,
  };
}

function toFrotaEntry(record: ImportRecord): FrotaHistoryEntry {
  return {
    id: record.id,
    fileName: record.fileName,
    totalRows: record.totalOrders,
    outputRows: record.totalGroups,
    duplicatesRemoved: record.checkedGroups,
    headers: record.headers,
    rows: record.rows,
    importTime: record.importTime,
  };
}

async function getSortedImports(importType?: string): Promise<ImportRecord[]> {
  const records = await getAllRecords<ImportRecord>('import_history');
  return records
    .filter((r) => importType === undefined || r.importType === importType)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getHistory(): Promise<HistoryEntry[]> {
  try {
    return (await getSortedImports()).map(toHistoryEntry);
  } catch (err) {
    console.error('Error fetching import history:', err);
    return [];
  }
}

export async function getFrotaImportHistory(): Promise<FrotaHistoryEntry[]> {
  try {
    return (await getSortedImports('frota')).map(toFrotaEntry);
  } catch (err) {
    console.error('Error fetching frota import history:', err);
    return [];
  }
}

export async function addImportEntry(
  rows: RawRow[],
  groups: DeliveryGroup[],
  headers: string[],
  fileName: string,
  checkState: CheckState
): Promise<HistoryEntry | null> {
  const now = new Date().toISOString();
  const record: ImportRecord = {
    id: newRecordId(),
    fileName,
    importType: 'flex',
    importTime: now,
    exportTime: null,
    totalOrders: rows.length,
    totalGroups: groups.length,
    checkedGroups: countChecked(checkState),
    rows,
    groups,
    headers,
    checkState,
    createdAt: now,
  };

  try {
    await putRecord('import_history', record);
    return toHistoryEntry(record);
  } catch (err) {
    console.error('Error adding import entry:', err);
    return null;
  }
}

export async function addFrotaImportEntry(
  fileName: string,
  totalRows: number,
  outputRows: number,
  duplicatesRemoved: number,
  headers: string[],
  rows: RawRow[]
): Promise<FrotaHistoryEntry | null> {
  const now = new Date().toISOString();
  const record: ImportRecord = {
    id: newRecordId(),
    fileName,
    importType: 'frota',
    importTime: now,
    exportTime: null,
    totalOrders: totalRows,
    totalGroups: outputRows,
    checkedGroups: duplicatesRemoved,
    rows,
    groups: [],
    headers,
    checkState: EMPTY_CHECK_STATE,
    createdAt: now,
  };

  try {
    await putRecord('import_history', record);
    return toFrotaEntry(record);
  } catch (err) {
    console.error('Error adding frota import entry:', err);
    return null;
  }
}

async function patchImport(id: string, patch: Partial<ImportRecord>): Promise<void> {
  try {
    const record = await getRecord<ImportRecord>('import_history', id);
    if (!record) return;
    await putRecord('import_history', { ...record, ...patch });
  } catch (err) {
    console.error('Error updating import entry:', err);
  }
}

export async function updateExportEntry(
  id: string,
  groups: DeliveryGroup[],
  checkState: CheckState
): Promise<void> {
  await patchImport(id, {
    exportTime: new Date().toISOString(),
    groups,
    checkState,
    checkedGroups: countChecked(checkState),
  });
}

export async function updateHistoryProgress(
  id: string,
  groups: DeliveryGroup[],
  checkState: CheckState,
  firstScanAt: number | null
): Promise<void> {
  await patchImport(id, {
    groups,
    checkState,
    checkedGroups: countChecked(checkState),
    firstScanAt,
  });
}

export async function updateHistoryCompletion(id: string, completedAt: number): Promise<void> {
  await patchImport(id, { completedAt });
}

export async function deleteImportEntry(id: string): Promise<void> {
  try {
    await deleteRecord('import_history', id);
  } catch (err) {
    console.error('Error deleting import entry:', err);
  }
}

export async function deleteHistoryEntry(id: string): Promise<void> {
  await deleteImportEntry(id);
}

export function reexportXlsx(entry: HistoryEntry): void {
  import('xlsx').then((XLSX) => {
    const sheetData = [entry.headers, ...entry.rows.map((row) => [
      row.colA,
      row.sequence,
      row.colC,
      row.spxTn,
      row.destinationAddress,
      row.colF,
      row.colG,
      row.colH,
      row.colI,
      row.colJ,
      ...row.extra,
    ])];
    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Entregas');
    const baseName = entry.fileName.replace(/\.[^.]+$/, '');
    XLSX.writeFile(wb, `${baseName}.xlsx`);
  }).catch((err) => {
    console.error('Failed to re-export XLSX:', err);
  });
}

export async function findByFileName(fileName: string): Promise<HistoryEntry | null> {
  try {
    const match = (await getSortedImports()).find((r) => r.fileName === fileName);
    return match ? toHistoryEntry(match) : null;
  } catch (err) {
    console.error('Error finding import by file name:', err);
    return null;
  }
}

export async function clearImportHistory(): Promise<{ success: boolean; error?: string }> {
  try {
    await clearStore('import_history');
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Erro ao limpar histórico' };
  }
}
