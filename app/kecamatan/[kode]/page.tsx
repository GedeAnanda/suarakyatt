// app/kecamatan/[kode]/page.tsx — skor satu kecamatan untuk warga awam (pemilik: A + C)
// Revisi FDS 10 Nov (docs/revisi-fds-2026-11-10.md, 2.1–2.3). Tidak ada rumus baru: semua angka dari hitungSkor
// (lib/scoring) dengan bobot resmi, sama dengan Dashboard Prioritas dan warna peta Beranda.
// Urutan isi: satu kalimat jawaban → posisi di antara 42 kecamatan → tiap masalah aktif dengan enam faktor dalam
// bahasa sehari-hari → laporan di kecamatan ini.

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import BadgeStatus from '@/components/BadgeStatus';
import BannerSimulasi from '@/components/BannerSimulasi';
import KepalaHalaman from '@/components/KepalaHalaman';
import FaktorAwam from '@/components/kecamatan/FaktorAwam';
import GrafikPosisi from '@/components/kecamatan/GrafikPosisi';
import PetaPilihKecamatan from '@/components/kecamatan/PetaPilihKecamatan';
import Ikon from '@/components/ui/Ikon';
import { kelasTautan, kelasTombol } from '@/components/ui/Tombol';
import { ambilTitikLaporan, terlambat } from '@/lib/data/laporan';
import { ambilDataPrioritas } from '@/lib/data/prioritas';
import { tanggal } from '@/lib/format';
import { KECAMATAN } from '@/lib/geo/kecamatan-svg';
import { bobotEfektif, formatPoin, hitungSkor } from '@/lib/scoring';
import { kalimatIsu, kalimatKecamatan, LABEL_TINGKAT, ringkasJakarta, tingkatDari } from '@/lib/scoring/kecamatan';

const GAYA_TINGKAT = {
  paling: 'bg-biru text-white',
  tinggi: 'bg-biru-muda text-biru-tua',
  sedang: 'bg-lapis text-teks',
  rendah: 'bg-latar text-lembut',
} as const;

export async function generateMetadata({ params }: PageProps<'/kecamatan/[kode]'>): Promise<Metadata> {
  const { kode } = await params;
  const k = KECAMATAN.find((x) => x.kode_wilayah === decodeURIComponent(kode));
  return {
    title: k ? `Kecamatan ${k.kecamatan}` : 'Kecamatan',
    description: k
      ? `Posisi Kecamatan ${k.kecamatan} (${k.kota}) di daftar prioritas SUARAKYAT, alasan di balik skornya, dan laporan warga di sana.`
      : undefined,
  };
}

async function Isi({ params }: { params: PageProps<'/kecamatan/[kode]'>['params'] }) {
  const { kode: mentah } = await params;
  const kode = decodeURIComponent(mentah);
  if (!KECAMATAN.some((x) => x.kode_wilayah === kode)) notFound();

  const [data, titik] = await Promise.all([ambilDataPrioritas(), ambilTitikLaporan()]);
  const resmi = hitungSkor(data.faktor.isu, data.bobotResmi);
  const bobot = data.faktor.isu.length ? bobotEfektif(data.faktor.isu, data.bobotResmi) : data.bobotResmi;
  const ringkas = ringkasJakarta(resmi, KECAMATAN);
  const k = ringkas.kecamatan.find((x) => x.kode_wilayah === kode)!;

  const laporan = titik.laporan.filter((l) => l.kecamatan === k.kecamatan);
  const hitung = {
    aktif: laporan.filter((l) => ['menunggu', 'diverifikasi', 'diproses'].includes(l.status)).length,
    terlambat: laporan.filter((l) => terlambat(l, titik.sekarang)).length,
    selesai: laporan.filter((l) => l.status === 'selesai').length,
    ditolak: laporan.filter((l) => l.status === 'ditolak').length,
  };
  const terbaru = [...laporan].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 5);
  // Label tingkat kecamatan = label masalah teratasnya, supaya kartu ringkasan dan kartu masalah tidak tampak bertentangan.
  const tingkat = k.isu[0] ? tingkatDari(k.isu[0].peringkat, ringkas.totalIsu) : null;

  const skorPeta: Record<string, number> = {};
  const ketPeta: Record<string, string> = {};
  for (const b of ringkas.kecamatan) {
    if (b.skor === null) continue;
    skorPeta[b.kode_wilayah] = b.skor;
    ketPeta[b.kode_wilayah] = `Urutan ${b.urutan} · ${b.isu[0].kategori.toLowerCase()}`;
  }

  return (
    <>
      <BannerSimulasi sumber={data.sumber} keterangan="Skor dari aturan resmi · angka warga kurang mampu per kota" />

      {/* 1. Jawaban dalam satu kalimat */}
      <section aria-labelledby="judul-ringkas" className="kartu mt-6 grid gap-5 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_14rem] lg:items-center">
        <div>
          <h2 id="judul-ringkas" className="sr-only">
            Ringkasan
          </h2>
          {tingkat && (
            <span className={`inline-flex rounded-full px-3 py-1 text-kecil font-bold ${GAYA_TINGKAT[tingkat]}`}>{LABEL_TINGKAT[tingkat]}</span>
          )}
          <p className="mt-3 max-w-[60ch] text-lead">{kalimatKecamatan(k, ringkas, bobot)}</p>
          <p className="mt-3 text-kecil text-lembut">
            Urutan ini menunjukkan masalah mana yang sebaiknya ditangani lebih dulu, bukan janji kapan diperbaiki. Skor
            kecamatan diambil dari masalahnya yang paling didahulukan.{' '}
            {/* Dulu menuju rumus rapor dinas (audit 10 Nov, D1). */}
            <Link href="/prioritas#cara-hitung" className={kelasTautan}>
              Bagaimana urutan ini dihitung?
            </Link>
          </p>
        </div>
        <dl className="grid grid-cols-2 gap-4 rounded-kontrol bg-latar p-4 lg:grid-cols-1">
          <div>
            <dt className="text-kecil text-lembut">Skor prioritas</dt>
            <dd className="angka text-[2.5rem] leading-none font-bold">
              {k.skor === null ? '–' : formatPoin(k.skor)}
              <span className="text-kecil font-normal text-lembut"> dari 100</span>
            </dd>
            <dd className="mt-1 text-mini text-lembut">
              Makin tinggi, makin didahulukan. Ini perbandingan dengan masalah lain di Jakarta, bukan nilai baik-buruk.
            </dd>
          </div>
          <div>
            <dt className="text-kecil text-lembut">Urutan kecamatan</dt>
            <dd className="angka text-lead font-bold">{k.urutan ? `ke-${k.urutan} dari ${ringkas.dinilai} kecamatan` : 'Tidak dinilai'}</dd>
          </div>
        </dl>
      </section>

      {/* 2. Posisi di antara semua kecamatan */}
      <section aria-labelledby="judul-posisi" className="kartu mt-5 p-5 sm:p-7">
        <h2 id="judul-posisi" className="text-sub font-bold">
          Posisinya di antara {KECAMATAN.length} kecamatan
        </h2>
        <p className="mt-1 text-kecil text-lembut">
          Tiap batang satu kecamatan. Makin tinggi, makin didahulukan. Hitam = kecamatan ini; garis putus-putus = nilai tengah
          Jakarta.
        </p>
        <div className="mt-5">
          <GrafikPosisi ringkas={ringkas} kode={k.kode_wilayah} />
        </div>
      </section>

      {/* 3. Masalah aktif dan alasannya */}
      <section aria-labelledby="judul-masalah" className="mt-5">
        <h2 id="judul-masalah" className="judul-seksi">
          Masalah aktif di {k.kecamatan}
        </h2>
        {k.isu.length === 0 ? (
          <p className="kartu mt-4 p-5 text-badan">Tidak ada laporan belum selesai yang dinilai di kecamatan ini.</p>
        ) : (
          <ul className="mt-4 grid gap-4 lg:grid-cols-2">
            {k.isu.map((i) => {
              const t = tingkatDari(i.peringkat, ringkas.totalIsu);
              return (
                <li key={i.id} className="kartu grid content-start gap-4 p-5 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lead font-bold">{i.kategori}</h3>
                      <p className="text-kecil text-lembut">
                        {i.laporan_aktif} laporan belum selesai · {i.laporan_terverifikasi} sudah diperiksa dinas
                      </p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-mini font-bold ${GAYA_TINGKAT[t]}`}>{LABEL_TINGKAT[t]}</span>
                  </div>
                  <div>
                    <div className="flex items-baseline justify-between text-kecil">
                      <span>
                        Skor <strong className="angka text-lead font-bold">{formatPoin(i.skor)}</strong> dari 100
                      </span>
                      <span className="angka text-lembut">
                        urutan ke-{i.peringkat} dari {ringkas.totalIsu} masalah
                      </span>
                    </div>
                    <div className="relative mt-1.5 h-3 overflow-hidden rounded-full bg-lapis" aria-hidden="true">
                      <span className="absolute inset-y-0 left-0 rounded-full bg-biru" style={{ width: `${i.skor}%` }} />
                    </div>
                  </div>
                  <p className="text-badan">{kalimatIsu(i, ringkas.totalIsu, bobot)}</p>
                  <details className="group">
                    <summary className="inline-flex min-h-10 cursor-pointer list-none items-center gap-1.5 text-kecil font-semibold text-biru-tua [&::-webkit-details-marker]:hidden">
                      Lihat rincian alasannya
                      <Ikon nama="turun" className="size-4 transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="mt-3">
                      <FaktorAwam isu={i} bobot={bobot} />
                    </div>
                  </details>
                  <Link href={`/prioritas?isu=${encodeURIComponent(i.id)}`} className={`${kelasTautan} text-kecil`}>
                    Coba aturan penilaian lain untuk masalah ini
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* 4. Laporan di kecamatan ini */}
      <section aria-labelledby="judul-laporan" className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="kartu p-5 sm:p-6">
          <h2 id="judul-laporan" className="text-sub font-bold">
            Laporan warga di {k.kecamatan}
          </h2>
          <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Belum selesai', nilai: hitung.aktif },
              { label: 'Lewat batas waktu', nilai: hitung.terlambat, merah: hitung.terlambat > 0 },
              { label: 'Selesai', nilai: hitung.selesai },
              { label: 'Ditolak', nilai: hitung.ditolak },
            ].map((s) => (
              <div key={s.label} className="rounded-kontrol bg-latar p-3">
                <dt className="text-kecil text-lembut">{s.label}</dt>
                <dd className={`angka text-sub font-bold ${s.merah ? 'text-merah-tua' : ''}`}>{s.nilai}</dd>
              </div>
            ))}
          </dl>
          {terbaru.length > 0 && (
            <ul className="mt-5 divide-y divide-garis">
              {terbaru.map((l) => (
                <li key={l.kode} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5">
                  <Link href={`/laporan/${l.kode}`} className="font-kode angka font-bold text-biru-tua hover:underline">
                    {l.kode}
                  </Link>
                  <BadgeStatus status={l.status} />
                  <span className="text-kecil text-lembut">
                    {l.kategori} · {tanggal(l.created_at)}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Link href="/peta" className={`${kelasTombol('garis', 'mt-5 text-kecil')}`}>
            <Ikon nama="peta" className="size-4" />
            Buka peta laporan
          </Link>
        </div>
        <div className="kartu p-3 sm:p-4">
          <PetaPilihKecamatan skor={skorPeta} keterangan={ketPeta} sorot={k.kode_wilayah} />
          <p className="mt-2 px-1 text-mini text-lembut">Pilih kecamatan lain di peta untuk membandingkan.</p>
        </div>
      </section>
    </>
  );
}

export default function KecamatanPage({ params }: PageProps<'/kecamatan/[kode]'>) {
  return (
    <div className="bingkai pt-6 pb-4 sm:pt-8">
      <Suspense fallback={<div aria-hidden="true" className="kerangka h-[36rem]" />}>
        <Judul params={params} />
        <div className="masuk">
          <Isi params={params} />
        </div>
      </Suspense>
    </div>
  );
}

async function Judul({ params }: { params: PageProps<'/kecamatan/[kode]'>['params'] }) {
  const { kode } = await params;
  const k = KECAMATAN.find((x) => x.kode_wilayah === decodeURIComponent(kode));
  return (
    <KepalaHalaman
      judul={k ? `Kecamatan ${k.kecamatan}` : 'Kecamatan'}
      jejak={[{ href: '/kecamatan', label: 'Skor kecamatan' }]}
      aksi={
        <Link href="/kecamatan" className={kelasTombol('garis', 'text-kecil')}>
          <Ikon nama="grafik" className="size-4" />
          Semua kecamatan
        </Link>
      }
    >
      {k?.kota}. Seberapa didahulukan masalah di kecamatan ini dibanding kecamatan lain, dan kenapa.
    </KepalaHalaman>
  );
}
