// components/beranda/SorotKecamatan.tsx — 42 kecamatan sebagai satu kalimat + peta (pemilik: A)
// Satu nama menyala bergantian mengikuti sepuluh isu teratas, dan kecamatannya disorot (timbul) di peta.
// Berhenti bergantian kalau pengguna meminta gerak dikurangi, atau saat diarahkan kursor.
// Memilih nomor membuka tampilan fokus: kecamatannya bergerak ke tengah peta (3D) dengan beberapa titik laporan,
// peta lain diburamkan. Nomor yang sama ditekan lagi = kembali ke tampilan awal (bergantian otomatis).
// Kolom kiri di bawah daftar kecamatan: saat fokus, "Kenapa peringkat ini" (enam faktor skor) dan daftar laporan contoh
// yang pin-nya tampil di peta; di bawahnya selalu legenda warna peta.

'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { KECAMATAN } from '@/lib/geo/kecamatan-svg';
import type { TitikPeta } from '@/lib/geo/proyeksi';
import { NAMA_FAKTOR } from '@/lib/konten';
import { FAKTOR, formatPoin } from '@/lib/scoring';
import type { Faktor } from '@/lib/types';
import BadgeStatus from '../BadgeStatus';
import { pilihContoh } from '../KecamatanTimbul3D';
import PetaKecamatan, { KeteranganKelas } from '../PetaKecamatan';
import { WARNA_FAKTOR } from '../prioritas/BarKontribusi';

export interface IsuTeratas {
  kode_wilayah: string;
  kecamatan: string;
  kota: string;
  kategori: string;
  skor: number;
  peringkat: number;
  /** Poin tiap faktor; jumlahnya sama dengan skor. */
  kontribusi: Record<Faktor, number>;
}

const NAMA_URUT = [...KECAMATAN].sort((a, b) => a.kecamatan.localeCompare(b.kecamatan, 'id'));

export default function SorotKecamatan({
  teratas,
  skorPerKecamatan,
  titik = {},
}: {
  teratas: IsuTeratas[];
  skorPerKecamatan: Record<string, number>;
  /** Beberapa titik laporan per kode_wilayah, untuk tampilan fokus. */
  titik?: Record<string, TitikPeta[]>;
}) {
  const [indeks, setIndeks] = useState(0);
  // Berhenti sementara selama kursor atau fokus keyboard ada di bagian ini.
  const [disentuh, setDisentuh] = useState(false);
  // Dihentikan dengan memilih nomor: tetap berhenti sampai nomor yang sama ditekan lagi (WCAG 2.2.2).
  const [kunci, setKunci] = useState(false);
  // Tampilan fokus di peta, dibuka dengan memilih nomor.
  const [fokus, setFokus] = useState(false);
  const jeda = disentuh || kunci;

  function pilih(i: number) {
    if (fokus && i === indeks) {
      // Nomor yang sama ditekan lagi: kembali ke tampilan awal.
      setFokus(false);
      setKunci(false);
      return;
    }
    setIndeks(i);
    setKunci(true);
    setFokus(true);
  }

  useEffect(() => {
    if (jeda || teratas.length < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = window.setInterval(() => setIndeks((i) => (i + 1) % teratas.length), 2200);
    return () => window.clearInterval(t);
  }, [jeda, teratas.length]);

  const nyala = teratas[indeks];
  const bentuk = nyala && KECAMATAN.find((k) => k.kode_wilayah === nyala.kode_wilayah);
  // Laporan contoh yang sama dengan pin di peta.
  const contoh = fokus && nyala && bentuk ? pilihContoh(bentuk.d, titik[nyala.kode_wilayah] ?? []) : [];
  const pendorong = nyala ? [...FAKTOR].sort((a, b) => nyala.kontribusi[b] - nyala.kontribusi[a]).slice(0, 3) : [];

  return (
    <div
      className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-10"
      onMouseEnter={() => setDisentuh(true)}
      onMouseLeave={() => setDisentuh(false)}
      onFocus={() => setDisentuh(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setDisentuh(false)}
    >
      <div>
        {nyala && (
          <div key={nyala.kode_wilayah + nyala.kategori} className="ganti flex items-start gap-3 rounded-kartu bg-biru-pudar p-4" aria-live="off">
            <span className="angka flex size-10 shrink-0 items-center justify-center rounded-kontrol bg-biru text-badan font-bold text-white">
              {indeks + 1}
            </span>
            <p className="text-badan">
              <strong className="font-bold">
                {nyala.kategori} di {nyala.kecamatan}
              </strong>
              , {nyala.kota}.{' '}
              <span className="text-lembut">
                Skor {formatPoin(nyala.skor)}, peringkat {nyala.peringkat} dari semua isu.
              </span>
            </p>
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2" role="group" aria-label="Pilih kecamatan teratas untuk disorot">
          {/* Satu kecamatan satu tombol, jadi nomornya urutan kecamatan (1 sampai 10), bukan peringkat isu yang bisa loncat. */}
          {teratas.map((t, i) => (
            <button
              key={t.kode_wilayah + t.kategori}
              type="button"
              aria-pressed={fokus && i === indeks}
              aria-label={`${i + 1}. ${t.kecamatan}: ${t.kategori}, peringkat isu ${t.peringkat}`}
              onClick={() => pilih(i)}
              className={`angka size-10 rounded-kontrol border text-kecil font-bold transition-[background-color,color,border-color,scale] active:scale-90 ${
                i === indeks
                  ? 'border-biru bg-biru text-white'
                  : 'border-garis bg-permukaan hover:border-biru hover:text-biru-tua'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
        {fokus && nyala && (
          <p className="mt-3 text-kecil text-lembut" aria-live="polite">
            {(titik[nyala.kode_wilayah]?.length ?? 0) > 0
              ? `Pin di peta: contoh laporan ${nyala.kategori.toLowerCase()} di ${nyala.kecamatan}, warna titiknya menurut status. `
              : ''}
            Tekan nomor {indeks + 1} lagi untuk kembali ke peta penuh.
          </p>
        )}

        <p className="mt-6 text-kecil leading-relaxed text-lembut">
          <span className="font-semibold text-teks">Isu wilayah dinilai di 42 kecamatan: </span>
          {NAMA_URUT.map((k, i) => (
            <span key={k.kode_wilayah}>
              <span
                className={`transition-colors duration-[400ms] ${
                  k.kode_wilayah === nyala?.kode_wilayah ? 'rounded-[0.25rem] bg-biru-muda px-1 font-bold text-biru-tua' : ''
                }`}
              >
                {k.kecamatan}
              </span>
              {i < NAMA_URUT.length - 1 ? ', ' : '.'}
            </span>
          ))}
        </p>

        {fokus && nyala && (
          <div key={`rincian-${nyala.kode_wilayah}-${nyala.kategori}`} className="ganti mt-8 grid gap-6 border-t border-garis pt-6">
            {/* Kenapa peringkat ini: enam faktor sebagai satu bar bertumpuk (lebar = poin dari 100), lalu tiga terbesar. */}
            <section aria-labelledby="judul-kenapa-peringkat">
              <h3 id="judul-kenapa-peringkat" className="text-badan font-bold">
                Kenapa peringkat {nyala.peringkat}?
              </h3>
              <p className="mt-1 text-kecil text-lembut">
                Skor {formatPoin(nyala.skor)} dari 100, dijumlahkan dari enam faktor. Yang paling mendorong:
              </p>
              <div aria-hidden="true" className="mt-3 flex h-2.5 w-full overflow-hidden rounded-full bg-lapis">
                {FAKTOR.map((f) => (
                  <span key={f} style={{ width: `${nyala.kontribusi[f]}%`, background: WARNA_FAKTOR[f] }} />
                ))}
              </div>
              <ul className="mt-3 grid gap-1.5 text-kecil">
                {pendorong.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span aria-hidden="true" className="size-2.5 shrink-0 rounded-[0.15rem]" style={{ background: WARNA_FAKTOR[f] }} />
                    <span className="flex-1">{NAMA_FAKTOR[f]}</span>
                    <span className="angka font-semibold">{formatPoin(nyala.kontribusi[f])} poin</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Laporan yang pin-nya tampil di peta, bisa dibuka di halaman lacak. */}
            {contoh.length > 0 && (
              <section aria-labelledby="judul-contoh-laporan">
                <h3 id="judul-contoh-laporan" className="text-badan font-bold">
                  Contoh laporan di {nyala.kecamatan}
                </h3>
                <ul className="mt-3 divide-y divide-garis overflow-hidden rounded-kartu border border-garis bg-permukaan">
                  {contoh.map((t) => (
                    <li key={t.kode}>
                      <Link
                        href={`/laporan/${t.kode}`}
                        className="flex items-center justify-between gap-3 px-4 py-2.5 transition-colors hover:bg-biru-pudar"
                      >
                        <span className="min-w-0">
                          <span className="font-kode angka block text-kecil font-bold text-biru-tua">{t.kode}</span>
                          <BadgeStatus status={t.status} />
                        </span>
                        <span className={`text-right text-kecil ${t.telat ? 'font-semibold text-merah-tua' : 'text-lembut'}`}>
                          {t.sla ?? ''}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}

        <KeteranganKelas className="mt-8" />
      </div>

      <figure>
        <PetaKecamatan
          skor={skorPerKecamatan}
          sorot={nyala?.kode_wilayah}
          efek={fokus ? 'fokus' : 'timbul'}
          titik={fokus && nyala ? titik[nyala.kode_wilayah] : undefined}
          judul="Peta DKI Jakarta per kecamatan, diwarnai menurut skor prioritas tertinggi"
        />
      </figure>
    </div>
  );
}
