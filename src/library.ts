// The visitor's own images, kept in IndexedDB on their device (never uploaded).

export interface StoredImage {
  id: string;
  blob: Blob;
  w: number;
  h: number;
  created: number;
}

const DB = "wicb";
const STORE = "images";
const MAX_SIDE = 1024;

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: "id" });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return open().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(STORE, mode);
        const r = fn(t.objectStore(STORE));
        t.oncomplete = () => resolve(r.result);
        t.onerror = () => reject(t.error);
      }),
  );
}

export async function listImages(): Promise<StoredImage[]> {
  try {
    const all = await tx<StoredImage[]>("readonly", (s) => s.getAll() as IDBRequest<StoredImage[]>);
    return all.sort((a, b) => b.created - a.created);
  } catch {
    return [];
  }
}

/**
 * Save a picture. Square PNGs up to 1024 px are kept byte-exact (they may be a
 * scrambled picture to unscramble); anything else is shrunk to 1024 px.
 */
export async function saveImage(file: Blob, bmp: ImageBitmap): Promise<StoredImage | null> {
  let blob: Blob = file;
  let w = bmp.width;
  let h = bmp.height;
  const exact = file.type === "image/png" && w === h && w <= MAX_SIDE;
  if (!exact && Math.max(w, h) > MAX_SIDE) {
    const s = MAX_SIDE / Math.max(w, h);
    w = Math.round(w * s);
    h = Math.round(h * s);
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    c.getContext("2d")!.drawImage(bmp, 0, 0, w, h);
    blob = await new Promise<Blob>((r) => c.toBlob((b) => r(b!), "image/jpeg", 0.92));
  }
  const item: StoredImage = { id: `img-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`, blob, w, h, created: Date.now() };
  try {
    await tx("readwrite", (s) => s.put(item));
    return item;
  } catch {
    return null;
  }
}

export async function deleteImage(id: string): Promise<void> {
  try {
    await tx("readwrite", (s) => s.delete(id));
  } catch {
    /* ignore */
  }
}
