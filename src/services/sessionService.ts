import { clearStore, getAllRecords, getRecord, putRecord } from './localDb';
import type { RawRow, DeliveryGroup, CheckState } from '../types';

export interface ActiveSession {
  id: string;
  fileName: string;
  rows: RawRow[];
  groups: DeliveryGroup[];
  headers: string[];
  checkState: CheckState;
  totalOrders: number;
  checkedCount: number;
  completed: boolean;
  updatedAt: string;
  firstScanAt?: number | null;
}

export async function getActiveSession(): Promise<ActiveSession | null> {
  try {
    const sessions = await getAllRecords<ActiveSession>('active_sessions');
    if (sessions.length === 0) return null;
    return sessions.reduce((latest, s) => (s.updatedAt > latest.updatedAt ? s : latest));
  } catch (err) {
    console.error('Failed to load active session:', err);
    return null;
  }
}

export async function saveActiveSession(
  historyId: string,
  fileName: string,
  rows: RawRow[],
  groups: DeliveryGroup[],
  headers: string[],
  checkState: CheckState,
  firstScanAt: number | null = null
): Promise<void> {
  const checkedCount = Object.values(checkState.checked).filter(Boolean).length;

  try {
    await putRecord<ActiveSession>('active_sessions', {
      id: historyId,
      fileName,
      rows,
      groups,
      headers,
      checkState,
      totalOrders: rows.length,
      checkedCount,
      completed: false,
      updatedAt: new Date().toISOString(),
      firstScanAt,
    });
  } catch (err) {
    console.error('Failed to save active session:', err);
  }
}

export async function markSessionCompleted(historyId: string): Promise<void> {
  try {
    const session = await getRecord<ActiveSession>('active_sessions', historyId);
    if (!session) return;
    await putRecord<ActiveSession>('active_sessions', {
      ...session,
      completed: true,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Failed to mark session completed:', err);
  }
}

export async function clearActiveSession(): Promise<void> {
  try {
    await clearStore('active_sessions');
  } catch (err) {
    console.error('Failed to clear active session:', err);
  }
}
