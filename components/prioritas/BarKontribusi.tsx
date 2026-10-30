// components/prioritas/BarKontribusi.tsx — rincian skor per faktor (FR-F3, PRD 9), pemilik: A
// Setiap faktor: nilai mentah di samping poinnya ("kemiskinan 4,5% → 15 poin"), dan seberapa
// penuh poin itu dibanding maksimalnya (100 × bobot). Jumlah semua poin = skor.

import { DEFINISI_FAKTOR, NAMA_FAKTOR, SATUAN_FAKTOR } from '@/lib/konten';
import { FAKTOR, formatPoin } from '@/lib/scoring';
import type { Bobot, Faktor, SkorIsu } from '@/lib/types';

/** Warna pelengkap per faktor (enam rona yang mudah dibedakan); faktor selalu juga dinamai dengan teks. */
export const WARNA_FAKTOR: Record<Faktor, string> = {
  urgensi: '#0f766e',
  umur: '#f08a24',
  volume: '#3b82f6',
  dukungan: '#8b5cf6',
  kerentanan: '#e5484d',
  kepadatan: '#7a8699',
};

/** Satu bar bertumpuk: lebar tiap ruas = poin faktor, dari skala 0 sampai 100. */
export function BarTumpuk({ isu, className = 'h-2' }: { isu: SkorIsu; className?: string }) {
  return (
    <div className={`flex w-full overflow-hidden rounded-full bg-lapis ${className}`} aria-hidden="true">
      {FAKTOR.map((f) => (
        <span
          key={f}
          className="transition-[width] duration-500 ease-keluar motion-reduce:transition-none"
          style={{ width: `${isu.kontribusi[f]}%`, background: WARNA_FAKTOR[f] }}
        />
      ))}
    </div>
  );
}

export function KeteranganFaktor({ className = '' }: { className?: string }) {
  return (
    <ul className={`flex flex-wrap gap-x-4 gap-y-1 text-mini text-lembut sm:text-kecil ${className}`}>
      {FAKTOR.map((f) => (
        <li key={f} className="flex items-center gap-1.5">
          <span aria-hidden="true" className="size-2.5 rounded-full" style={{ background: WARNA_FAKTOR[f] }} />
          {NAMA_FAKTOR[f]}
        </li>
      ))}
    </ul>
  );
}

export default function BarKontribusi({ isu, bobot }: { isu: SkorIsu; bobot: Bobot }) {
  return (
    <div>
      <BarTumpuk isu={isu} className="h-4" />
      <dl className="mt-5 grid gap-4">
        {FAKTOR.map((f) => {
          const maksimal = 100 * bobot[f];
          const mentah = isu.mentah[f];
          const tidakMembedakan = isu.faktor_tidak_membedakan.includes(f);
          return (
            <div key={f} className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1.5">
              <dt className="flex items-center gap-2 text-kecil font-semibold sm:text-badan">
                <span aria-hidden="true" className="size-2.5 rounded-full" style={{ background: WARNA_FAKTOR[f] }} />
                <span title={DEFINISI_FAKTOR[f]}>{NAMA_FAKTOR[f]}</span>
              </dt>
              <dd className="angka text-right text-kecil sm:text-badan">
                <span className="font-bold">{formatPoin(isu.kontribusi[f])}</span>
                <span className="text-lembut"> / {formatPoin(maksimal)} poin</span>
              </dd>
              <dd className="col-span-2 grid gap-1.5">
                <span className="relative block h-1.5 overflow-hidden rounded-full bg-lapis" aria-hidden="true">
                  <span
                    className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-500 ease-keluar motion-reduce:transition-none"
                    style={{ width: maksimal > 0 ? `${(isu.kontribusi[f] / maksimal) * 100}%` : '0%', background: WARNA_FAKTOR[f] }}
                  />
                </span>
                <span className="text-mini text-lembut sm:text-kecil">
                  Nilai mentah: {mentah === null ? 'tidak tersedia di mode ini' : SATUAN_FAKTOR[f](mentah)}
                  {tidakMembedakan && '. Faktor ini tidak membedakan wilayah saat ini.'}
                  {f === 'kerentanan' && '. Data level kota: semua kecamatan di kota yang sama bernilai sama.'}
                </span>
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
