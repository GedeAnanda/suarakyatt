// components/peta/TitikTunggal.tsx — peta kecil dengan satu titik laporan (pemilik: A)

'use client';

import dynamic from 'next/dynamic';

const Isi = dynamic(() => import('./TitikTunggalLeaflet'), {
  ssr: false,
  loading: () => <div className="kerangka aspect-2/1 w-full sm:aspect-4/3" />,
});

/** `pendek`: di HP petanya 2:1 (bukan 4:3) supaya status dan alasan tidak terdorong ke bawah layar. */
export default function TitikTunggal({ pendek = false, ...props }: { lat: number; lng: number; warna: string; label: string; pendek?: boolean }) {
  return (
    <div className="peta isolate overflow-hidden bg-lapis" data-ui>
      <Isi {...props} pendek={pendek} />
    </div>
  );
}
