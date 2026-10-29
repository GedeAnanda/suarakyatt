import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { ambilContohLaporan } from '@/lib/data/laporan';

async function BukaContoh() {
  const contoh = await ambilContohLaporan();
  return redirect(contoh ? `/laporan/${contoh.laporan.kode}#kenapa-belum` : '/peta');
}

export default function ContohPage() {
  return (
    <Suspense fallback={<p role="status" className="bingkai py-16 text-badan text-lembut">Membuka laporan contoh…</p>}>
      <BukaContoh />
    </Suspense>
  );
}
