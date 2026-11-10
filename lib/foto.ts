// lib/foto.ts — kompres foto di browser sekaligus membuang metadata EXIF (FR-B1, SDD 5.4), pemilik: A
// Foto digambar ulang ke canvas lalu diekspor sebagai WebP: hasilnya hanya berisi piksel,
// tanpa EXIF (lokasi GPS, merek ponsel, waktu). Orientasi dari EXIF diterapkan dulu.

export const TIPE_FOTO = ['image/jpeg', 'image/png', 'image/webp'];
/** Batas file asli dari perangkat. Foto kamera HP 48 MP biasanya 5 sampai 12 MB; hasil kompresnya hanya ratusan KB. */
export const UKURAN_MAKS = 20 * 1024 * 1024;
/** Batas hasil kompres, sama dengan batas bucket Storage (lib/supabase/unggah.ts). */
const UKURAN_HASIL_MAKS = 5 * 1024 * 1024;
const SISI_MAKS = 1600;

export async function kompresFoto(file: File): Promise<Blob> {
  if (!TIPE_FOTO.includes(file.type)) throw new Error('TIPE_FOTO');
  if (file.size > UKURAN_MAKS) throw new Error('UKURAN_FOTO');

  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const skala = Math.min(1, SISI_MAKS / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * skala);
  const h = Math.round(bitmap.height * skala);

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('KOMPRES_GAGAL');
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  const hasil = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/webp', 0.82));
  // Safari lama tidak bisa mengekspor WebP dan jatuh ke PNG; pakai JPEG supaya tetap kecil.
  if (!hasil || hasil.type !== 'image/webp') {
    const jpeg = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/jpeg', 0.82));
    if (!jpeg) throw new Error('KOMPRES_GAGAL');
    if (jpeg.size > UKURAN_HASIL_MAKS) throw new Error('UKURAN_FOTO');
    return jpeg;
  }
  if (hasil.size > UKURAN_HASIL_MAKS) throw new Error('UKURAN_FOTO');
  return hasil;
}
