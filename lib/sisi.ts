// lib/sisi.ts — status menu samping, disimpan sebagai atribut di <html> (pemilik: A)
// Layar ≥ 1280 px: menu terbuka bawaannya; data-sisi="ciut" menjadikannya deret ikon.
// Layar 1024–1279 px (iPad miring, laptop kecil): deret ikon bawaannya; data-sisi="lebar" membukanya.
// Pilihan pengguna ("ciut" atau "lebar") diingat di localStorage.
// Layar < 1024 px: menu berupa laci; data-laci="buka" membukanya (tidak diingat).
// Header (TombolMenu) dan menu (Sisi) dua komponen terpisah, jadi keduanya membaca atribut yang sama
// lewat useSyncExternalStore alih-alih berbagi state React.

export const KUNCI_SISI = 'suarakyat:sisi';

/** Dijalankan di <head> sebelum halaman digambar, supaya pilihan menu tidak membuat tata letak melompat. */
export const SKRIP_SISI = `(function(){try{var v=localStorage.getItem("${KUNCI_SISI}");if(v==="ciut"||v==="lebar")document.documentElement.setAttribute("data-sisi",v)}catch(e){}})()`;

export const MEDIA_LEBAR = '(min-width: 64rem)';
const MEDIA_PENUH = '(min-width: 80rem)';

export function pantauSisi(ubah: () => void) {
  const pengamat = new MutationObserver(ubah);
  pengamat.observe(document.documentElement, { attributes: true, attributeFilter: ['data-sisi', 'data-laci'] });
  const media = [window.matchMedia(MEDIA_LEBAR), window.matchMedia(MEDIA_PENUH)];
  media.forEach((m) => m.addEventListener('change', ubah));
  return () => {
    pengamat.disconnect();
    media.forEach((m) => m.removeEventListener('change', ubah));
  };
}

export const layarLebar = () => window.matchMedia(MEDIA_LEBAR).matches;
export const laciBuka = () => document.documentElement.getAttribute('data-laci') === 'buka';

/** Menu samping terbuka penuh (bukan deret ikon). Hanya bermakna di layar ≥ 1024 px. */
export function sisiTerbuka() {
  const nilai = document.documentElement.getAttribute('data-sisi');
  return window.matchMedia(MEDIA_PENUH).matches ? nilai !== 'ciut' : nilai === 'lebar';
}

export function aturLaci(buka: boolean) {
  if (buka) document.documentElement.setAttribute('data-laci', 'buka');
  else document.documentElement.removeAttribute('data-laci');
}

export function aturSisi(terbuka: boolean) {
  const penuh = window.matchMedia(MEDIA_PENUH).matches;
  // Hanya simpan yang berbeda dari bawaan rentang layar ini.
  const nilai = penuh ? (terbuka ? null : 'ciut') : terbuka ? 'lebar' : null;
  if (nilai) document.documentElement.setAttribute('data-sisi', nilai);
  else document.documentElement.removeAttribute('data-sisi');
  try {
    if (nilai) localStorage.setItem(KUNCI_SISI, nilai);
    else localStorage.removeItem(KUNCI_SISI);
  } catch {
    // Mode privat atau penyimpanan diblokir: pilihan hanya berlaku sampai halaman dimuat ulang.
  }
}
