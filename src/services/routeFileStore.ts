/**
 * Keeps the generated SPX route file (TSV) in the app's private browser storage
 * so it survives closing the app. IndexedDB is used because it works in both the
 * PWA and the Android WebView, and the file never touches the Downloads folder.
 */

const DB_NAME = 'rota123-route-files';
const STORE_NAME = 'routes';
const DB_VERSION = 1;
const CURRENT_KEY = 'current';

interface StoredRoute {
  id: string;
  blob: Blob;
  fileName: string;
  savedAt: number;
}

export interface StoredRouteFile {
  blob: Blob;
  fileName: string;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function runTransaction<T>(
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T> | null,
): Promise<T | undefined> {
  const db = await openDB();
  try {
    return await new Promise<T | undefined>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, mode);
      const request = operation(tx.objectStore(STORE_NAME));
      let result: T | undefined;
      if (request) request.onsuccess = () => (result = request.result);
      tx.oncomplete = () => resolve(result);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}

export async function saveStoredRoute(blob: Blob, fileName: string): Promise<void> {
  await runTransaction('readwrite', (store) => {
    const record: StoredRoute = { id: CURRENT_KEY, blob, fileName, savedAt: Date.now() };
    store.put(record);
    return null;
  });
}

export async function loadStoredRoute(): Promise<StoredRouteFile | null> {
  const record = await runTransaction<StoredRoute | undefined>('readonly', (store) =>
    store.get(CURRENT_KEY),
  );
  if (!record || !(record.blob instanceof Blob) || typeof record.fileName !== 'string') return null;
  return { blob: record.blob, fileName: record.fileName };
}

export async function clearStoredRoute(): Promise<void> {
  try {
    await runTransaction('readwrite', (store) => {
      store.delete(CURRENT_KEY);
      return null;
    });
  } catch (err) {
    console.error('Falha ao remover o arquivo temporário da rota:', err);
  }
}
