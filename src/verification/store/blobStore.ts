/**
 * IndexedDB storage for uploaded document images.
 *
 * WHY THESE ARE NOT IN localStorage
 *
 * The flow collects 18 documents — ID card, licence front and back, proof of
 * address, guarantor ID, insurance, roadworthiness, and seven vehicle photos.
 * Each is downscaled to roughly 200-530 KB and then base64-encoded, which adds
 * another third. Eighteen of those is about 5.4 MB.
 *
 * A localStorage origin quota is typically 5 MB. The draft was written there
 * on every keystroke, and then a second complete copy was written on submit —
 * roughly 10.8 MB against a 5 MB budget. Both writes caught QuotaExceededError
 * and did nothing with it, while the UI went on saying "Your progress is saved
 * automatically". A driver could photograph nine documents, close the tab, and
 * find an empty form, having been told throughout that it was saved.
 *
 * IndexedDB is the right home for this: its quota is a share of free disk
 * rather than a fixed 5 MB, it stores binary without a base64 penalty, and it
 * is asynchronous so a 5 MB write does not block the main thread. The text
 * fields stay in localStorage, where they are a few kilobytes and sync access
 * keeps the reducer simple.
 *
 * This is still browser-local storage of identity documents, which is not
 * where they belong. The API has no upload endpoint — no multipart handling,
 * no storage SDK, no document columns — so there is nowhere to send them yet.
 * When that lands, this becomes a pre-upload cache and the documents leave the
 * device. Until then the honest framing is "saved on this device", and the
 * copy now says exactly that.
 */

const DB_NAME = "arkride-verification";
const DB_VERSION = 1;
const STORE = "documents";

/** Blobs are held as data URLs so nothing downstream has to change. */
type Stored = string;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    // Fires when another tab holds an older version open. Rare, but it would
    // otherwise hang forever rather than reject.
    request.onblocked = () =>
      reject(new Error("Storage is open in another tab. Close it and retry."));
  });
}

/** True when IndexedDB is usable at all — private modes can disable it. */
export function isAvailable(): boolean {
  return typeof indexedDB !== "undefined";
}

async function withStore<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await openDb();
  try {
    return await new Promise<T>((resolve, reject) => {
      const tx = db.transaction(STORE, mode);
      const request = fn(tx.objectStore(STORE));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      // A quota failure surfaces on the transaction, not the request, so
      // without this the promise would resolve as if the write succeeded.
      tx.onabort = () => reject(tx.error ?? new Error("Storage transaction aborted"));
    });
  } finally {
    db.close();
  }
}

/**
 * Write every document in one transaction.
 *
 * One transaction rather than eighteen: IndexedDB commits atomically, so a
 * quota failure partway through rolls the whole thing back instead of leaving
 * a draft that references documents which were never stored.
 */
export async function putAll(entries: Map<string, Stored>): Promise<void> {
  if (!isAvailable() || entries.size === 0) return;

  const db = await openDb();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      const store = tx.objectStore(STORE);
      for (const [key, value] of entries) store.put(value, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error ?? new Error("Storage transaction aborted"));
    });
  } finally {
    db.close();
  }
}

export async function getAll(): Promise<Map<string, Stored>> {
  if (!isAvailable()) return new Map();

  const db = await openDb();
  try {
    return await new Promise<Map<string, Stored>>((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const store = tx.objectStore(STORE);
      const out = new Map<string, Stored>();
      const cursorRequest = store.openCursor();

      cursorRequest.onsuccess = () => {
        const cursor = cursorRequest.result;
        if (!cursor) {
          resolve(out);
          return;
        }
        if (typeof cursor.key === "string" && typeof cursor.value === "string") {
          out.set(cursor.key, cursor.value);
        }
        cursor.continue();
      };
      cursorRequest.onerror = () => reject(cursorRequest.error);
    });
  } finally {
    db.close();
  }
}

/** Remove keys that are no longer referenced by the draft. */
export async function removeMissing(keep: Set<string>): Promise<void> {
  if (!isAvailable()) return;
  const existing = await getAll();
  const stale = [...existing.keys()].filter((k) => !keep.has(k));
  if (stale.length === 0) return;

  const db = await openDb();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      const store = tx.objectStore(STORE);
      for (const key of stale) store.delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}

/**
 * Delete every stored document.
 *
 * Called after a successful submission. The draft used to survive submission
 * forever — `reset()` existed but had no call sites — so a shared or public
 * machine kept a full set of someone's identity scans indefinitely.
 */
export async function clearAll(): Promise<void> {
  if (!isAvailable()) return;
  await withStore("readwrite", (store) => store.clear());
}
