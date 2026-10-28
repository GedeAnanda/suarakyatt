// components/peta/TitikTunggal.tsx — peta kecil dengan satu titik laporan (pemilik: A)

'use client';

import dynamic from 'next/dynamic';

const Isi = dynamic(() => import('./TitikTunggalLeaflet'), {
  ssr: false,
  loading: () => <div className="kerangka aspect-4/3 w-full" />,
});

export default function TitikTunggal(props: { lat: number; lng: number; warna: string; label: string }) {
  return (
    <div className="peta isolate overflow-hidden bg-lapis" data-ui>
      <Isi {...props} />
    </div>
  );
}
