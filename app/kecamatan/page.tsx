// app/kecamatan/page.tsx — skor 42 kecamatan dalam satu peta dan satu daftar (pemilik: A + C)
// Revisi FDS 10 Nov (docs/revisi-fds-2026-11-10.md, 2.1 dan 2.4). Pintu masuk "kecamatanku bagaimana?":
// pilih di peta, atau cari namanya di daftar berperingkat (alternatif teks untuk peta).
// Skor kecamatan = skor masalah (isu) tertingginya dengan bobot resmi; sama dengan warna peta Beranda.

import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import BannerSimulasi from '@/components/BannerSimulasi';
import KepalaHalaman from '@/components/KepalaHalaman';
import CariKecamatan from '@/components/kecamatan/CariKecamatan';
import PetaPilihKecamatan from '@/components/kecamatan/PetaPilihKecamatan';
import { KeteranganKelas } from '@/components/PetaKecamatan';
import Ikon from '@/components/ui/Ikon';
import { kelasTombol } from '@/components/ui/Tombol';
import { ambilDataPrioritas } from '@/lib/data/prioritas';
import { KECAMATAN } from '@/lib/geo/kecamatan-svg';
import { formatPoin, hitungSkor } from '@/lib/scoring';
import { ALASAN_AWAM, alasanUtama, LABEL_TINGKAT, ringkasJakarta, tingkatDari } from '@/lib/scoring/kecamatan';

const GAYA_TINGKAT = {
  paling: 'bg-biru text-white',
  tinggi: 'bg-biru-muda text-biru-tua',
  sedang: 'bg-lapis text-teks',
  rendah: 'bg-latar text-lembut',
} as const;

export const metadata: Metadata = {
  title: 'Skor kecamatan',
  description: 'Seberapa didahulukan masalah di tiap kecamatan Jakarta, dan alasannya dalam bahasa sehari-hari.',
};

async function Isi() {
  const data = await ambilDataPrioritas();
  const resmi = hitungSkor(data.faktor.isu, data.bobotResmi);
  const ringkas = ringkasJakarta(resmi, KECAMATAN);
  const urut = [...ringkas.kecamatan].sort(
    (a, b) => (a.urutan ?? Number.POSITIVE_INFINITY) - (b.urutan ?? Number.POSITIVE_INFINITY) || a.kecamatan.localeCompare(b.kecamatan, 'id'),
  );
  const skor: Record<string, number> = {};
  const keterangan: Record<string, string> = {};
  for (const b of urut) {
    if (b.skor === null) continue;
    skor[b.kode_wilayah] = b.skor;
    keterangan[b.kode_wilayah] = `Urutan ${b.urutan} · ${b.isu[0].kategori.toLowerCase()}`;
  }

  return (
    <>
      <BannerSimulasi sumber={data.sumber} keterangan="Skor dari aturan resmi · angka warga kurang mampu per kota" />
      <div className="mt-6">
        <CariKecamatan daftar={KECAMATAN} />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-start">
        <section aria-labelledby="judul-peta" className="kartu p-3 sm:p-5 lg:sticky lg:top-20">
          <h2 id="judul-peta" className="px-2 pt-1 text-lead font-bold">
            Pilih kecamatan di peta
          </h2>
          <p className="px-2 text-kecil text-lembut">Makin gelap warnanya, makin didahulukan masalah terberat di sana.</p>
          <div className="mt-3">
            <PetaPilihKecamatan skor={skor} keterangan={keterangan} />
          </div>
          <KeteranganKelas className="mt-3 px-2" />
        </section>

        <section aria-labelledby="judul-daftar">
          <h2 id="judul-daftar" className="judul-seksi">
            Urutan {ringkas.dinilai} kecamatan yang punya laporan belum selesai
          </h2>
          <p className="mt-1 text-kecil text-lembut">
            Skor 0–100: makin tinggi, makin didahulukan. Garis hitam di tiap batang = nilai tengah Jakarta (
            {formatPoin(ringkas.median)}): separuh kecamatan di atasnya, separuh di bawahnya.
          </p>
          <ol className="kartu mt-4 divide-y divide-garis">
            {urut.map((k) => {
              const t = k.isu[0] ? tingkatDari(k.isu[0].peringkat, ringkas.totalIsu) : null;
              const alasan = k.isu[0] ? alasanUtama(k.isu[0]).map((f) => ALASAN_AWAM[f]) : [];
              return (
                <li key={k.kode_wilayah}>
                  <Link
                    href={`/kecamatan/${k.kode_wilayah}`}
                    className="grid grid-cols-[2.25rem_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 px-4 py-3 hover:bg-latar sm:px-5"
                  >
                    <span className="angka text-right text-kecil font-bold text-lembut">{k.urutan ?? '–'}</span>
                    <span className="min-w-0">
                      <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="font-bold">{k.kecamatan}</span>
                        {t && <span className={`rounded-full px-2 py-0.5 text-mini font-bold ${GAYA_TINGKAT[t]}`}>{LABEL_TINGKAT[t]}</span>}
                      </span>
                      {/* Tanpa truncate: alasannya justru informasi terpenting (audit 10 Nov, D13). */}
                      <span className="mt-0.5 block text-kecil text-lembut">
                        {k.kota}
                        {k.isu[0]
                          ? ` · ${k.isu[0].kategori.toLowerCase()}${alasan.length ? `: ${alasan.join(' dan ')}` : ''}`
                          : ' · tidak ada laporan belum selesai'}
                      </span>
                    </span>
                    <span className="angka text-right text-badan font-bold">
                      {k.skor === null ? '–' : formatPoin(k.skor)}
                      {k.skor !== null && <span className="text-mini font-normal text-lembut">/100</span>}
                    </span>
                    <span aria-hidden="true" className="relative col-start-2 col-end-4 h-2.5 overflow-hidden rounded-full bg-lapis">
                      {k.skor !== null && <span className="absolute inset-y-0 left-0 rounded-full bg-biru" style={{ width: `${k.skor}%` }} />}
                      <span className="absolute inset-y-0 w-0.5 bg-teks" style={{ left: `${ringkas.median}%` }} />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>
      </div>
    </>
  );
}

export default function DaftarKecamatanPage() {
  return (
    <div className="bingkai pt-6 pb-4 sm:pt-8">
      <KepalaHalaman
        judul="Skor kecamatan"
        aksi={
          <Link href="/prioritas" className={kelasTombol('garis', 'text-kecil')}>
            <Ikon nama="geser" className="size-4" />
            Atur urutannya sendiri
          </Link>
        }
      >
        Seberapa didahulukan masalah di tiap kecamatan, dihitung dari enam faktor yang sama dengan Dashboard Prioritas. Pilih
        kecamatanmu untuk melihat alasannya dalam bahasa sehari-hari.
      </KepalaHalaman>
      <Suspense fallback={<div aria-hidden="true" className="kerangka mt-6 h-[36rem]" />}>
        <div className="masuk">
          <Isi />
        </div>
      </Suspense>
    </div>
  );
}
