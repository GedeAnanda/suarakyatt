// components/rapor/PapanRapor.tsx — daftar peringkat instansi + panel rincian satu instansi (pemilik: A)
// Kiri: daftar ringkas (huruf, nama, nilai, tingkat penolakan) yang bisa dipilih. Kanan: rincian instansi terpilih
// (KartuRapor). Tautan #instansi-{id} (misalnya dari Beranda) langsung memilih instansi itu. Layar kecil: daftar di
// atas, rincian di bawahnya.

'use client';

import { useState, useSyncExternalStore } from 'react';
import { desimal, persen } from '@/lib/format';
import type { RaporInstansi } from '@/lib/types';
import KartuRapor from './KartuRapor';

function pantauHash(ubah: () => void) {
  window.addEventListener('hashchange', ubah);
  return () => window.removeEventListener('hashchange', ubah);
}

export default function PapanRapor({
  instansi,
  kategoriId,
}: {
  /** Sudah berurutan sesuai peringkat. */
  instansi: RaporInstansi[];
  /** Kategori tiap instansi (untuk tautan laporan yang ditolak), per id instansi. */
  kategoriId: Record<number, number | undefined>;
}) {
  const hash = useSyncExternalStore(pantauHash, () => window.location.hash, () => '');
  const [pilihan, setPilihan] = useState<number | null>(null);
  const dariHash = instansi.find((i) => hash === `#instansi-${i.id}`)?.id;
  const idTerpilih = pilihan ?? dariHash ?? instansi[0]?.id;
  const terpilih = instansi.find((i) => i.id === idTerpilih) ?? instansi[0];

  if (!terpilih) return null;

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(17rem,22rem)_minmax(0,1fr)] lg:items-start">
      <nav aria-label="Peringkat instansi" className="kartu overflow-hidden lg:sticky lg:top-[calc(var(--tinggi-kepala)+1rem)]">
        <p className="border-b border-garis px-4 py-3 text-kecil font-bold">Peringkat</p>
        <ol>
          {instansi.map((i, n) => {
            const aktif = i.id === terpilih.id;
            return (
              <li key={i.id} id={`instansi-${i.id}`} className="scroll-mt-24 border-b border-garis last:border-b-0">
                <button
                  type="button"
                  aria-pressed={aktif}
                  aria-controls="rapor-rincian"
                  onClick={() => setPilihan(i.id)}
                  className={`grid w-full grid-cols-[1.25rem_2rem_minmax(0,1fr)_auto] items-center gap-x-3 border-l-[3px] px-4 py-3 text-left transition-colors ${
                    aktif ? 'border-biru bg-biru-muda' : 'border-transparent hover:bg-latar'
                  }`}
                >
                  <span className="angka text-mini text-lembut">{n + 1}</span>
                  <span className={`text-[1.75rem] leading-none font-bold ${i.huruf ? 'text-biru' : 'text-lembut'}`}>
                    {i.huruf ?? '?'}
                  </span>
                  <span className="min-w-0">
                    <span className={`block truncate text-kecil ${aktif ? 'font-bold' : 'font-semibold'}`}>
                      {i.nama.replace(' (simulasi)', '')}
                    </span>
                    <span className={`block text-mini ${i.peringatan_penolakan ? 'font-semibold text-merah-tua' : 'text-lembut'}`}>
                      ditolak {persen(i.tingkat_penolakan)}
                    </span>
                  </span>
                  <span className="angka text-kecil font-bold">{desimal(i.nilai)}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <section id="rapor-rincian" aria-live="polite" className="kartu px-4 sm:px-7">
        <div key={terpilih.id} className="ganti">
          <KartuRapor i={terpilih} kategoriId={kategoriId[terpilih.id]} />
        </div>
      </section>
    </div>
  );
}
