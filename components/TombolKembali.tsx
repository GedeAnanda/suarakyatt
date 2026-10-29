// components/TombolKembali.tsx — tombol "Kembali" yang jelas terlihat di atas judul halaman (pemilik: A)
// Untuk pengguna lanjut usia dan anak-anak yang belum terbiasa dengan tombol back browser atau jejak halaman:
// berbentuk tombol berbingkai dengan panah dan kata "Kembali", tinggi 44 px.
// Kembali ke halaman sebelumnya kalau ada riwayat; kalau halaman dibuka langsung (tab baru, tautan dibagikan),
// membuka halaman induknya.

'use client';

import { useRouter } from 'next/navigation';
import Ikon from './ui/Ikon';

export default function TombolKembali({ cadangan = '/' }: { cadangan?: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => (window.history.length > 1 ? router.back() : router.push(cadangan))}
      className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-garis-isian bg-permukaan py-1.5 pr-4 pl-2.5 text-badan font-semibold text-teks shadow-kartu transition-[border-color,color,scale] hover:border-biru hover:text-biru-tua active:scale-[0.97]"
    >
      <span className="flex size-7 items-center justify-center rounded-full bg-biru-muda text-biru-tua">
        <Ikon nama="kiri" className="size-4.5" />
      </span>
      Kembali
    </button>
  );
}
