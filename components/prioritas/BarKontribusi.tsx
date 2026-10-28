// components/prioritas/BarKontribusi.tsx — rincian skor per faktor (FR-F3, PRD 9), pemilik: A
// Setiap faktor: nilai mentah di samping poinnya ("kemiskinan 4,5% → 15 poin"), dan seberapa
// penuh poin itu dibanding maksimalnya (100 × bobot). Jumlah semua poin = skor.

import { DEFINISI_FAKTOR, NAMA_FAKTOR, SATUAN_FAKTOR } from '@/lib/konten';
import { FAKTOR, formatPoin } from '@/lib/scoring';
import type { Bobot, Faktor, SkorIsu } from '@/lib/types';

/** Warna pelengkap per faktor; faktor selalu juga dinamai dengan teks. */
export const WARNA_FAKTOR: Record<Faktor, string> = {
  urgensi: '#7d0c14',
  umur: '#b07a1f',
  volume: '#2f5d7c',
  dukungan: '#7ea3bf',
  kerentanan: '#3d6b4f',
  kepadatan: '#8a8183',
};

/** Satu bar bertumpuk: lebar tiap ruas = poin faktor, dari skala 0–100. */
export function BarTumpuk({ isu, className = 'h-2.5' }: { isu: SkorIsu; className?: string }) {
  return (
    <div className={`flex w-full overflow-hidden rounded-full bg-lapis ${className}`} aria-hidden="true">
      {FAKTOR.map((f) => (
        <span
          key={f}
          className="transition-[width] duration-500 ease-(--ease-keluar) motion-reduce:transition-none"
          style={{ width: `${isu.kontribusi[f]}%`, background: WARNA_FAKTOR[f] }}
        />
      ))}
    </div>
  );
}

export function KeteranganFaktor({ className = '' }: { className?: string }) {
  return (
    <ul className={`flex flex-wrap gap-x-4 gap-y-1 text-kecil ${className}`}>
      {FAKTOR.map((f) => (
        <li key={f} className="flex items-center gap-1.5">
          <span aria-hidden="true" className="size-3" style={{ background: WARNA_FAKTOR[f] }} />
          {NAMA_FAKTOR[f]}
        </li>
      ))}
    </ul>
  );
}

export default function BarKontribusi({ isu, bobot }: { isu: SkorIsu; bobot: Bobot }) {
  return (
    <div>
      <BarTumpuk isu={isu} className="h-5" />
      <dl className="mt-6 grid gap-4">
        {FAKTOR.map((f) => {
          const maksimal = 100 * bobot[f];
          const mentah = isu.mentah[f];
          const tidakMembedakan = isu.faktor_tidak_membedakan.includes(f);
          return (
            <div key={f} className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1.5">
              <dt className="flex items-center gap-2 text-badan font-medium">
                <span aria-hidden="true" className="size-3" style={{ background: WARNA_FAKTOR[f] }} />
                <span title={DEFINISI_FAKTOR[f]}>{NAMA_FAKTOR[f]}</span>
              </dt>
              <dd className="angka text-right text-badan">
                <span className="font-semibold">{formatPoin(isu.kontribusi[f])}</span>
                <span className="text-lembut"> / {formatPoin(maksimal)} poin</span>
              </dd>
              <dd className="col-span-2 grid gap-1.5">
                <span className="relative block h-1.5 overflow-hidden rounded-full bg-lapis" aria-hidden="true">
                  <span
                    className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-500 ease-(--ease-keluar) motion-reduce:transition-none"
                    style={{ width: maksimal > 0 ? `${(isu.kontribusi[f] / maksimal) * 100}%` : '0%', background: WARNA_FAKTOR[f] }}
                  />
                </span>
                <span className="text-kecil text-lembut">
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
