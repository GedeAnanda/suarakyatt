// components/PetaDasar.tsx — peta dasar Jakarta untuk semua halaman (SDD 9.1), pemilik: A
// Leaflet hanya jalan di browser, jadi dimuat dengan next/dynamic + ssr: false.

'use client';

import dynamic from 'next/dynamic';
import type { PetaDasarProps } from './PetaDasarLeaflet';

const PetaDasarLeaflet = dynamic(() => import('./PetaDasarLeaflet'), {
  ssr: false,
  loading: () => <div className="kerangka flex h-full min-h-80 w-full items-center justify-center text-kecil">Memuat peta…</div>,
});

export default function PetaDasar(props: PetaDasarProps) {
  // `isolate` menjaga z-index panel Leaflet tetap di dalam kotak peta.
  return (
    <div className="peta isolate overflow-hidden bg-lapis">
      <PetaDasarLeaflet {...props} />
    </div>
  );
}
