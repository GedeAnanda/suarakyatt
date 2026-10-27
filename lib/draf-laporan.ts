// Draf per akun, hanya di browser ini. Blob foto tetap lokal sampai Kirim laporan.
export interface DrafLaporan {
  versi: 1;
  kategori: number | null;
  titik: { lat: number; lng: number } | null;
  deskripsi: string;
  foto: { id: string; blob: Blob; url?: string }[];
}

let antrean: Promise<unknown> = Promise.resolve();

function akses<T>(uid: string, operasi: 'baca' | 'tulis' | 'hapus', nilai?: DrafLaporan): Promise<T> {
  return new Promise((resolve, reject) => {
    const buka = indexedDB.open('suarakyat-draf', 1);
    buka.onupgradeneeded = () => buka.result.createObjectStore('laporan');
    buka.onerror = () => reject(buka.error);
    buka.onblocked = () => reject(new Error('Draf terkunci di tab lain.'));
    buka.onsuccess = () => {
      const db = buka.result;
      const tx = db.transaction('laporan', operasi === 'baca' ? 'readonly' : 'readwrite');
      const store = tx.objectStore('laporan');
      const req = operasi === 'baca' ? store.get(uid) : operasi === 'hapus' ? store.delete(uid) : store.put(nilai, uid);
      tx.oncomplete = () => { db.close(); resolve(req.result as T); };
      tx.onabort = tx.onerror = () => { db.close(); reject(tx.error ?? new Error('Draf tidak tersimpan.')); };
    };
  });
}

// Urutkan baca/tulis/hapus, termasuk ketika form dilepas lalu dipasang lagi oleh navigasi.
export function drafLaporan(uid: string, operasi: 'baca', nilai?: never): Promise<DrafLaporan | undefined>;
export function drafLaporan(uid: string, operasi: 'tulis' | 'hapus', nilai?: DrafLaporan): Promise<void>;
export function drafLaporan(uid: string, operasi: 'baca' | 'tulis' | 'hapus', nilai?: DrafLaporan) {
  const tugas = antrean.catch(() => {}).then(() => akses(uid, operasi, nilai));
  antrean = tugas;
  return tugas;
}
