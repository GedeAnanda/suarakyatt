// components/TombolHuruf.tsx — pilihan "Huruf besar" untuk semua kalangan (pemilik: A)
// Mengubah atribut data-huruf di <html>; globals.css membesarkan ukuran dasar 12,5%, jadi seluruh tampilan ikut membesar.
// Pilihan disimpan di localStorage HP pengguna (bukan akun) dan dipasang ulang sebelum halaman tergambar (app/layout.tsx).

'use client';

import { useSyncExternalStore } from 'react';

const KUNCI = 'suarakyat-huruf';

function langgan(ubah: () => void) {
  const pengamat = new MutationObserver(ubah);
  pengamat.observe(document.documentElement, { attributes: true, attributeFilter: ['data-huruf'] });
  return () => pengamat.disconnect();
}

export default function TombolHuruf({ className = '' }: { className?: string }) {
  const besar = useSyncExternalStore(
    langgan,
    () => document.documentElement.dataset.huruf === 'besar',
    () => false,
  );

  function ganti() {
    const baru = !besar;
    if (baru) document.documentElement.dataset.huruf = 'besar';
    else delete document.documentElement.dataset.huruf;
    try {
      if (baru) localStorage.setItem(KUNCI, 'besar');
      else localStorage.removeItem(KUNCI);
    } catch {
      // Mode privat atau penyimpanan diblokir: pilihan tetap berlaku sampai halaman ditutup.
    }
  }

  return (
    <button
      type="button"
      onClick={ganti}
      aria-pressed={besar}
      className={`inline-flex min-h-11 items-center gap-2 rounded-kontrol border border-garis bg-permukaan px-3 text-kecil font-semibold hover:border-biru aria-pressed:border-biru aria-pressed:bg-biru-muda aria-pressed:text-biru-tua ${className}`}
    >
      <span aria-hidden="true" className="font-bold">
        A<span className="text-lead">A</span>
      </span>
      {besar ? 'Huruf besar: nyala' : 'Perbesar huruf'}
    </button>
  );
}
