// components/TombolMenu.tsx — tombol garis tiga di ujung kiri header (pemilik: A)
// Layar ≥ 1024 px: menciutkan menu samping menjadi deret ikon atau membukanya lagi (diingat di localStorage).
// Layar kecil: membuka atau menutup laci menu. Statusnya dibaca dari atribut <html> (lib/sisi.ts).

'use client';

import { useSyncExternalStore } from 'react';
import { aturLaci, aturSisi, laciBuka, layarLebar, pantauSisi, sisiTerbuka } from '@/lib/sisi';
import Ikon from './ui/Ikon';

export default function TombolMenu() {
  // Di server: anggap layar lebar dengan menu terbuka, sama dengan HTML awal.
  const terbuka = useSyncExternalStore(
    pantauSisi,
    () => (layarLebar() ? sisiTerbuka() : laciBuka()),
    () => true,
  );
  const laci = useSyncExternalStore(pantauSisi, () => !layarLebar() && laciBuka(), () => false);

  return (
    <button
      id="tombol-menu"
      type="button"
      aria-controls="sisi"
      aria-expanded={terbuka}
      aria-label="Menu utama"
      title={terbuka ? 'Tutup menu' : 'Buka menu'}
      onClick={() => (layarLebar() ? aturSisi(!sisiTerbuka()) : aturLaci(!laciBuka()))}
      className="flex size-10 shrink-0 items-center justify-center rounded-kontrol text-teks transition-[background-color,scale] hover:bg-lapis active:scale-95"
    >
      <Ikon nama={laci ? 'tutup' : 'menu'} className="size-6" />
    </button>
  );
}
