// components/prioritas/JawabanCepat.tsx — ringkasan sekali lihat di atas halaman Urutan prioritas (pemilik: A)
// Uji keterbacaan 10 Nov: halaman ini 65 kalimat dan langsung dibuka dengan alat. Warga yang hanya ingin tahu
// "apa yang paling didahulukan sekarang?" dan "kecamatanku bagaimana?" mendapat jawabannya di sini, tanpa menggulir.
// Angka dari hitungSkor dengan aturan resmi, sama dengan daftar di bawahnya.

import Link from 'next/link';
import { LABEL_FAKTOR, formatPoin } from '@/lib/scoring';
import { alasanUtama } from '@/lib/scoring/kecamatan';
import type { SkorIsu } from '@/lib/types';
import CariKecamatan from '../kecamatan/CariKecamatan';

export default function JawabanCepat({
  teratas,
  total,
  kecamatan,
}: {
  teratas: SkorIsu[];
  total: number;
  kecamatan: { kode_wilayah: string; kecamatan: string; kota: string }[];
}) {
  return (
    <section aria-labelledby="judul-jawaban-cepat" className="kartu grid gap-4 p-5 sm:p-6">
      <div>
        <h2 id="judul-jawaban-cepat" className="text-lead font-bold">
          Paling didahulukan sekarang
        </h2>
        <p className="text-kecil text-lembut">Dari {total} masalah di Jakarta. Skor 0–100: makin tinggi, makin perlu ditangani dulu.</p>
      </div>
      <ol className="grid gap-2">
        {teratas.map((i) => {
          const alasan = alasanUtama(i).map((f) => LABEL_FAKTOR[f]);
          return (
            <li key={i.id}>
              <Link
                href={`/kecamatan/${i.kode_wilayah}`}
                className="grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-3 rounded-kontrol bg-latar px-3 py-2.5 hover:bg-biru-muda"
              >
                <span className="angka text-center text-lead font-bold text-biru-tua">{i.peringkat}</span>
                <span className="min-w-0">
                  <span className="block font-bold">
                    {i.kategori} di {i.kecamatan}
                  </span>
                  {alasan.length > 0 && <span className="block text-kecil text-lembut">karena {alasan.join(' dan ')}</span>}
                </span>
                <span className="angka text-right font-bold">
                  {formatPoin(i.skor)}
                  <span className="text-mini font-normal text-lembut">/100</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
      <CariKecamatan daftar={kecamatan} />
    </section>
  );
}
