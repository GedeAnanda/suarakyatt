// components/kecamatan/FaktorAwam.tsx — enam faktor skor dalam bahasa sehari-hari (pemilik: A)
// Revisi FDS 10 Nov (2.3): judulnya pertanyaan awam ("Sudah berapa lama menunggu"), nilainya kata
// (rendah/sedang/tinggi) dan bar 0–1, poinnya di ujung kanan. Istilah teknis dan definisinya di tooltip Istilah.

import { DEFINISI_FAKTOR, NAMA_FAKTOR } from '@/lib/konten';
import { FAKTOR, formatPoin } from '@/lib/scoring';
import type { Bobot, SkorIsu } from '@/lib/types';
import { WARNA_FAKTOR } from '../prioritas/BarKontribusi';
import Istilah from '../ui/Istilah';

const kata = (x: number) => (x >= 2 / 3 ? 'tinggi' : x >= 1 / 3 ? 'sedang' : 'rendah');

export default function FaktorAwam({ isu, bobot }: { isu: SkorIsu; bobot: Bobot }) {
  const urut = [...FAKTOR].sort((a, b) => isu.kontribusi[b] - isu.kontribusi[a]);
  return (
    <div className="grid gap-3">
    <p className="text-kecil text-lembut">
      Rendah/sedang/tinggi = dibanding masalah lain di Jakarta. Poin = sumbangan ke skor 0–100; batang = berapa dari poin
      maksimal yang didapat.
    </p>
    <dl className="grid gap-3">
      {urut.map((f) => (
        <div key={f} className="grid grid-cols-[1fr_auto] items-baseline gap-x-3 gap-y-1">
          <dt className="text-kecil">
            <Istilah id={`awam-${isu.id}-${f}`} judul={`${NAMA_FAKTOR[f]} · paling banyak ${formatPoin(100 * bobot[f])} poin`} definisi={DEFINISI_FAKTOR[f]}>
              {NAMA_FAKTOR[f]}
            </Istilah>
            <span className="ml-1.5 font-bold">{kata(isu.nilai01[f])}</span>
          </dt>
          <dd className="angka text-right text-mini text-lembut">
            +{formatPoin(isu.kontribusi[f])} dari {formatPoin(100 * bobot[f])} poin
          </dd>
          <dd aria-hidden="true" className="col-span-2 h-2 overflow-hidden rounded-full bg-lapis">
            <span className="block h-full rounded-full" style={{ width: `${Math.round(isu.nilai01[f] * 100)}%`, background: WARNA_FAKTOR[f] }} />
          </dd>
        </div>
      ))}
    </dl>
    </div>
  );
}
