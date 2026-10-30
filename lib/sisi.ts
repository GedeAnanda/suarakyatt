// lib/sisi.ts — status menu samping, disimpan sebagai atribut di <html> (pemilik: A)
// Layar ≥ 1024 px: menu berupa deret ikon; data-sisi="buka" membuka panel lebar yang mendorong isi halaman.
// Layar < 1024 px: menu berupa laci; data-laci="buka" membukanya.
// Keduanya tertutup lagi begitu pengguna memilih halaman (components/Sisi.tsx), jadi tidak ada yang diingat.
// Header (TombolMenu) dan menu (Sisi) dua komponen terpisah, jadi keduanya membaca atribut yang sama
// lewat useSyncExternalStore alih-alih berbagi state React.

export const MEDIA_LEBAR = '(min-width: 64rem)';

export function pantauSisi(ubah: () => void) {
  const pengamat = new MutationObserver(ubah);
  pengamat.observe(document.documentElement, { attributes: true, attributeFilter: ['data-sisi', 'data-laci'] });
  const media = window.matchMedia(MEDIA_LEBAR);
  media.addEventListener('change', ubah);
  return () => {
    pengamat.disconnect();
    media.removeEventListener('change', ubah);
  };
}

export const layarLebar = () => window.matchMedia(MEDIA_LEBAR).matches;
export const laciBuka = () => document.documentElement.getAttribute('data-laci') === 'buka';
export const sisiTerbuka = () => document.documentElement.getAttribute('data-sisi') === 'buka';

export function aturLaci(buka: boolean) {
  if (buka) document.documentElement.setAttribute('data-laci', 'buka');
  else document.documentElement.removeAttribute('data-laci');
}

export function aturSisi(buka: boolean) {
  if (buka) document.documentElement.setAttribute('data-sisi', 'buka');
  else document.documentElement.removeAttribute('data-sisi');
}

/** Tutup menu apa pun bentuknya: laci di ponsel, panel lebar di layar besar. */
export function tutupMenu() {
  aturLaci(false);
  aturSisi(false);
}
