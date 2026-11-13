const DB_NAME = 'rota123-local-db';
const DB_VERSION = 1;

export const LOCAL_STORES = [
  'import_history',
  'active_sessions',
  'app_settings',
  'global_announcements',
  'announcement_confirmations',
] as const;

export type LocalStoreName = (typeof LOCAL_STORES)[number];

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        for (const name of LOCAL_STORES) {
          if (!db.objectStoreNames.contains(name)) {
            db.createObjectStore(name, { keyPath: 'id' });
          }
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        dbPromise = null;
        reject(request.error);
      };
    });
  }
  return dbPromise;
}

function runRequest<T>(
  store: LocalStoreName,
  mode: IDBTransactionMode,
  operation: (objectStore: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(store, mode);
        const request = operation(tx.objectStore(store));
        tx.oncomplete = () => resolve(request.result);
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
      })
  );
}

export function getAllRecords<T>(store: LocalStoreName): Promise<T[]> {
  return runRequest<T[]>(store, 'readonly', (s) => s.getAll());
}

export async function getRecord<T>(store: LocalStoreName, id: string): Promise<T | undefined> {
  return runRequest<T | undefined>(store, 'readonly', (s) => s.get(id));
}

export async function putRecord<T extends { id: string }>(store: LocalStoreName, record: T): Promise<void> {
  await runRequest(store, 'readwrite', (s) => s.put(record));
}

export async function deleteRecord(store: LocalStoreName, id: string): Promise<void> {
  await runRequest(store, 'readwrite', (s) => s.delete(id));
}

export async function clearStore(store: LocalStoreName): Promise<void> {
  await runRequest(store, 'readwrite', (s) => s.clear());
}
