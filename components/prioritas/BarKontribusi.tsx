// components/prioritas/BarKontribusi.tsx — rincian skor per hal yang dinilai (FR-F3, PRD 9), pemilik: A
// Setiap hal: angka aslinya di samping poinnya ("4,5% warga miskin → 15 dari 15 poin"), dan seberapa
// penuh poin itu dibanding poin terbanyaknya (100 × tingkat kepentingan). Jumlah semua poin = skor.
// Nama tiap hal memakai Istilah (popover yang bisa diketuk), bukan title=, supaya penjelasannya juga muncul di HP.

import { DEFINISI_FAKTOR, NAMA_FAKTOR, SATUAN_FAKTOR } from '@/lib/konten';
import { FAKTOR, formatPoin } from '@/lib/scoring';
import type { Bobot, Faktor, SkorIsu } from '@/lib/types';
import Istilah from '../ui/Istilah';

/** Warna pelengkap per hal (enam rona yang mudah dibedakan); hal selalu juga dinamai dengan teks. */
export const WARNA_FAKTOR: Record<Faktor, string> = {
  urgensi: '#0f766e',
  umur: '#f08a24',
  volume: '#3b82f6',
  dukungan: '#8b5cf6',
  kerentanan: '#e5484d',
  kepadatan: '#7a8699',
};

/** Satu bar bertumpuk: lebar tiap ruas = poin satu hal, dari skala 0 sampai 100. */
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

/** Kalimat angka asli satu hal. Mendesaknya masalah berupa kata, jadi kalimatnya berbeda. */
function angkaAsli(f: Faktor, mentah: number | null): string {
  if (mentah === null) return 'Angka ini belum tersedia.';
  if (f === 'urgensi') return `Jenis masalah ini ${SATUAN_FAKTOR[f](mentah)}.`;
  return `Angka aslinya: ${SATUAN_FAKTOR[f](mentah)}.`;
}

export default function BarKontribusi({ isu, bobot }: { isu: SkorIsu; bobot: Bobot }) {
  return (
    <div>
      <BarTumpuk isu={isu} className="h-4" />
      <p className="mt-2 text-kecil text-lembut">Panjang batang = skor (penuh = 100). Warna = asal poinnya.</p>
      <dl className="mt-5 grid gap-4">
        {FAKTOR.map((f) => {
          const maksimal = 100 * bobot[f];
          const tidakMembedakan = isu.faktor_tidak_membedakan.includes(f);
          return (
            <div key={f} className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1.5">
              <dt className="flex items-center gap-2 text-kecil font-semibold sm:text-badan">
                <span aria-hidden="true" className="size-2.5 shrink-0 rounded-full" style={{ background: WARNA_FAKTOR[f] }} />
                <Istilah id={`istilah-poin-${f}`} judul={NAMA_FAKTOR[f]} definisi={DEFINISI_FAKTOR[f]}>
                  {NAMA_FAKTOR[f]}
                </Istilah>
              </dt>
              <dd className="angka text-right text-kecil sm:text-badan">
                <span className="font-bold">{formatPoin(isu.kontribusi[f])}</span>
                <span className="text-lembut"> dari {formatPoin(maksimal)} poin</span>
              </dd>
              <dd className="col-span-2 grid gap-1.5">
                <span className="relative block h-1.5 overflow-hidden rounded-full bg-lapis" aria-hidden="true">
                  <span
                    className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-500 ease-keluar motion-reduce:transition-none"
                    style={{ width: maksimal > 0 ? `${(isu.kontribusi[f] / maksimal) * 100}%` : '0%', background: WARNA_FAKTOR[f] }}
                  />
                </span>
                <span className="text-kecil text-lembut">
                  {angkaAsli(f, isu.mentah[f])}
                  {maksimal === 0 && ' Tingkat kepentingannya 0%, jadi hal ini tidak dihitung.'}
                  {maksimal > 0 &&
                    tidakMembedakan &&
                    ' Semua masalah punya angka yang sama untuk hal ini, jadi tidak ada yang mendapat poin.'}
                  {f === 'kerentanan' && ' Angka ini per kota: semua kecamatan di kota yang sama mendapat angka sama.'}
                </span>
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
