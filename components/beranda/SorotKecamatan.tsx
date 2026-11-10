// components/beranda/SorotKecamatan.tsx — 10 masalah paling didahulukan + peta kecamatan (pemilik: A)
// Satu masalah per kecamatan disorot bergantian (paling cepat 6 detik sekali), dan kecamatannya timbul di peta.
// Tidak bergilir sendiri di layar sentuh atau kalau pengguna meminta gerak dikurangi; tombol Jeda/Lanjut selalu ada
// (WCAG 2.2.2). Berhenti sementara saat diarahkan kursor atau fokus keyboard.
// Memilih nomor membuka tampilan fokus: kecamatannya bergerak ke tengah peta (3D) dengan beberapa titik laporan,
// peta lain diburamkan. Nomor yang sama ditekan lagi = kembali ke tampilan awal.
// Kolom kiri: saat fokus, "Kenapa urutan ke-N?" (6 hal yang dinilai) dan daftar laporan contoh yang titiknya tampil di
// peta; di bawahnya selalu legenda warna peta dan satu tombol "Cari kecamatanmu" ke /kecamatan.

'use client';

import Link from 'next/link';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { KECAMATAN } from '@/lib/geo/kecamatan-svg';
import type { TitikPeta } from '@/lib/geo/proyeksi';
import { NAMA_FAKTOR } from '@/lib/konten';
import { FAKTOR, formatPoin } from '@/lib/scoring';
import type { Faktor } from '@/lib/types';
import BadgeStatus from '../BadgeStatus';
import { pilihContoh } from '../KecamatanTimbul3D';
import PetaKecamatan, { KeteranganKelas } from '../PetaKecamatan';
import { WARNA_FAKTOR } from '../prioritas/BarKontribusi';
import Ikon from '../ui/Ikon';
import { kelasTombol } from '../ui/Tombol';

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

/** Jeda antar-sorotan. Cukup lama untuk membaca satu kalimat. */
const JEDA_GILIR = 6000;

// Bergilir sendiri hanya di perangkat berkursor dan tanpa permintaan gerak dikurangi.
const KUERI_TANPA_GILIR = ['(hover: none)', '(prefers-reduced-motion: reduce)'];
function pantauMedia(ubah: () => void) {
  const daftar = KUERI_TANPA_GILIR.map((q) => window.matchMedia(q));
  for (const m of daftar) m.addEventListener('change', ubah);
  return () => {
    for (const m of daftar) m.removeEventListener('change', ubah);
  };
}
const bisaGilirSendiri = () => KUERI_TANPA_GILIR.every((q) => !window.matchMedia(q).matches);

export default function SorotKecamatan({
  teratas,
  total,
  skorPerKecamatan,
  titik = {},
}: {
  teratas: IsuTeratas[];
  /** Jumlah semua masalah yang diurutkan, untuk "urutan ke-3 dari 160 masalah". */
  total: number;
  skorPerKecamatan: Record<string, number>;
  /** Beberapa titik laporan per kode_wilayah, untuk tampilan fokus. */
  titik?: Record<string, TitikPeta[]>;
}) {
  const [indeks, setIndeks] = useState(0);
  // Berhenti sementara selama kursor atau fokus keyboard ada di bagian ini.
  const [disentuh, setDisentuh] = useState(false);
  // Dihentikan dengan memilih nomor: tetap berhenti sampai nomor yang sama ditekan lagi.
  const [kunci, setKunci] = useState(false);
  // Tampilan fokus di peta, dibuka dengan memilih nomor.
  const [fokus, setFokus] = useState(false);
  // Pilihan pengguna lewat tombol Jeda/Lanjut; null = ikut perangkat (layar sentuh: tidak bergilir sendiri).
  const [pilihanGilir, setPilihanGilir] = useState<boolean | null>(null);
  const gilirSendiri = useSyncExternalStore(pantauMedia, bisaGilirSendiri, () => false);
  const bergilir = (pilihanGilir ?? gilirSendiri) && teratas.length > 1;
  // Kalau pengguna sendiri menekan Lanjut, kursor atau fokus di bagian ini tidak menghentikannya lagi. Fokus hanya
  // menghentikan kalau dari keyboard (:focus-visible): ketukan jari di tombol tidak.
  const jeda = !bergilir || kunci || (disentuh && pilihanGilir !== true);

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
    if (jeda) return;
    const t = window.setInterval(() => setIndeks((i) => (i + 1) % teratas.length), JEDA_GILIR);
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
      onFocus={(e) => e.target.matches(':focus-visible') && setDisentuh(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setDisentuh(false)}
    >
      <div>
        <h3 className="text-badan font-bold">{teratas.length} masalah paling didahulukan sekarang, satu per kecamatan</h3>
        <p className="mt-1 text-kecil text-lembut">Ketuk nomornya untuk melihat di peta.</p>
        {nyala && (
          <div key={nyala.kode_wilayah + nyala.kategori} className="ganti mt-4 flex items-start gap-3 rounded-kartu bg-biru-pudar p-4" aria-live="off">
            <span className="angka flex size-10 shrink-0 items-center justify-center rounded-kontrol bg-biru text-badan font-bold text-white">
              {indeks + 1}
            </span>
            <p className="text-badan">
              <strong className="font-bold">
                {nyala.kategori} di {nyala.kecamatan}
              </strong>
              , {nyala.kota}.{' '}
              <span className="text-lembut">
                Skor {formatPoin(nyala.skor)} dari 100 · urutan ke-{nyala.peringkat} dari {total} masalah
              </span>
            </p>
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2" role="group" aria-label="Pilih masalah untuk dilihat di peta">
          {/* Satu kecamatan satu tombol, jadi nomornya 1 sampai 10, bukan urutan masalah yang bisa loncat. */}
          {teratas.map((t, i) => (
            <button
              key={t.kode_wilayah + t.kategori}
              type="button"
              aria-pressed={fokus && i === indeks}
              aria-label={`${i + 1}. ${t.kategori} di ${t.kecamatan}, urutan ke-${t.peringkat} dari ${total} masalah`}
              onClick={() => pilih(i)}
              className={`angka size-11 rounded-kontrol border text-kecil font-bold transition-[background-color,color,border-color,scale] active:scale-90 ${
                i === indeks
                  ? 'border-biru bg-biru text-white'
                  : 'border-garis bg-permukaan hover:border-biru hover:text-biru-tua'
              }`}
            >
              {i + 1}
            </button>
          ))}
          {/* Jeda/Lanjut: selalu ada selama tidak sedang fokus pada satu nomor. */}
          {!fokus && teratas.length > 1 && (
            <button
              type="button"
              onClick={() => setPilihanGilir(!bergilir)}
              className="ml-1 inline-flex min-h-11 items-center gap-1.5 rounded-kontrol px-3 text-kecil font-semibold text-biru-tua transition-colors hover:bg-biru-muda"
            >
              <Ikon nama={bergilir ? 'jeda' : 'putar'} className="size-4" />
              {bergilir ? 'Jeda' : 'Lanjut'}
              <span className="sr-only"> pergantian otomatis</span>
            </button>
          )}
        </div>
        {fokus && nyala && (
          <p className="mt-3 text-kecil text-lembut" aria-live="polite">
            {(titik[nyala.kode_wilayah]?.length ?? 0) > 0
              ? `Titik di peta: contoh laporan ${nyala.kategori.toLowerCase()} di ${nyala.kecamatan}. Warnanya menurut status. `
              : ''}
            Ketuk nomor {indeks + 1} lagi untuk kembali ke peta penuh.
          </p>
        )}

        {fokus && nyala && (
          <div key={`rincian-${nyala.kode_wilayah}-${nyala.kategori}`} className="ganti mt-8 grid gap-6 border-t border-garis pt-6">
            {/* Kenapa urutan ini: 6 hal yang dinilai sebagai satu bar bertumpuk (lebar = poin dari 100), lalu tiga terbesar. */}
            <section aria-labelledby="judul-kenapa-peringkat">
              <h3 id="judul-kenapa-peringkat" className="text-badan font-bold">
                Kenapa urutan ke-{nyala.peringkat}?
              </h3>
              <p className="mt-1 text-kecil text-lembut">
                Skor {formatPoin(nyala.skor)} dari 100. Paling banyak disumbang oleh:
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

        {fokus && nyala && (
          <p className="mt-6 text-kecil">
            <Link href={`/kecamatan/${nyala.kode_wilayah}`} className="font-semibold text-biru-tua underline underline-offset-4">
              Penjelasan lengkap Kecamatan {nyala.kecamatan} dalam bahasa sehari-hari
            </Link>
          </p>
        )}
        <KeteranganKelas className="mt-8" />
        {/* Satu tombol, bukan dinding 42 nama: daftar lengkapnya ada di /kecamatan. */}
        <Link href="/kecamatan" className={kelasTombol('kedua', 'mt-5 min-h-11')}>
          <Ikon nama="cari" className="size-4" />
          Cari kecamatanmu
        </Link>
      </div>

      <figure>
        <PetaKecamatan
          skor={skorPerKecamatan}
          sorot={nyala?.kode_wilayah}
          efek={fokus ? 'fokus' : 'timbul'}
          titik={fokus && nyala ? titik[nyala.kode_wilayah] : undefined}
          judul="Peta Jakarta per kecamatan, diwarnai menurut skor masalah tertinggi di tiap kecamatan"
        />
        <figcaption className="mt-3 flex flex-wrap items-center gap-2 text-kecil text-lembut">
          <span className="inline-flex items-center gap-1.5 rounded-[0.375rem] bg-hijau-muda px-2 py-0.5 font-semibold text-hijau">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-hijau" />
            Data asli
          </span>
          Batas kecamatan dan peta. Warnanya dari skor, yang dihitung dari data buatan.
        </figcaption>
      </figure>
    </div>
  );
}
