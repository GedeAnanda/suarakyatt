// app/page.tsx — Beranda (SDD 9), pemilik: A
// Urutan cerita (PRD 1): kenapa masalah ini didahulukan → uji bobotnya → di mana isunya →
// masalah apa yang dinilai → dari mana datanya → lacak laporan.
// Operasi SDD 6: R1 stats_beranda, R9 priority_factors + L1 lib/scoring, R8 agency_report_card,
// A1 POST /api/demo-login (TombolDemo).

import Image from 'next/image';
import { Suspense } from 'react';
import AlurLapor from '@/components/beranda/AlurLapor';
import DaftarMasalah from '@/components/beranda/DaftarMasalah';
import HeroGaris from '@/components/beranda/HeroGaris';
import PerbandinganPeringkat from '@/components/beranda/PerbandinganPeringkat';
import SorotKecamatan, { type IsuTeratas } from '@/components/beranda/SorotKecamatan';
import TombolDemo from '@/components/TombolDemo';
import LabelSumber from '@/components/ui/LabelSumber';
import { kodeLaporanUntukIsu, ambilStatistik } from '@/lib/data/laporan';
import { ambilDataPrioritas, ambilRapor } from '@/lib/data/prioritas';
import { desimal, ribuan } from '@/lib/format';
import { FOTO } from '@/lib/konten';
import { hitungSkor, PRESET } from '@/lib/scoring';
import type { SkorIsu } from '@/lib/types';

/** Isu untuk contoh "satu isu, dua urutan": jalan rusak di tengah peringkat yang paling naik saat keselamatan diutamakan. */
function pilihIsuContoh(resmi: SkorIsu[], keselamatan: SkorIsu[]): SkorIsu {
  const posisi = new Map(keselamatan.map((s) => [s.id, s.peringkat]));
  const naik = (s: SkorIsu) => s.peringkat - (posisi.get(s.id) ?? s.peringkat);
  const tengah = resmi.filter((s) => s.peringkat >= 8 && s.peringkat <= Math.max(12, resmi.length * 0.25));
  const kandidat = [...tengah.filter((s) => s.category_id === 1), ...tengah].sort((a, b) => naik(b) - naik(a));
  return kandidat.find((s) => s.category_id === 1 && naik(s) > 0) ?? kandidat[0] ?? resmi[0];
}

async function BagianPrioritas() {
  const [data, { sumber: sumberStat, statistik }] = await Promise.all([ambilDataPrioritas(), ambilStatistik()]);
  const resmi = hitungSkor(data.faktor.isu, data.bobotResmi);
  if (resmi.length === 0) return null;
  const contoh = pilihIsuContoh(resmi, hitungSkor(data.faktor.isu, PRESET.keselamatan));
  const kode = await kodeLaporanUntukIsu(data.sumber, contoh.kecamatan, contoh.kategori);

  const skorPerKecamatan: Record<string, number> = {};
  for (const s of resmi) skorPerKecamatan[s.kode_wilayah] = Math.max(skorPerKecamatan[s.kode_wilayah] ?? 0, s.skor);
  const sudah = new Set<string>();
  const teratas: IsuTeratas[] = [];
  for (const s of resmi) {
    if (sudah.has(s.kode_wilayah)) continue;
    sudah.add(s.kode_wilayah);
    teratas.push({ kode_wilayah: s.kode_wilayah, kecamatan: s.kecamatan, kota: s.kota, kategori: s.kategori, skor: s.skor, peringkat: s.peringkat });
    if (teratas.length === 10) break;
  }

  return (
    <>
      <PerbandinganPeringkat isu={data.faktor.isu} bobotResmi={data.bobotResmi} idIsu={contoh.id} kodeLaporan={kode} />

      <figure className="relative">
        <div className="h-[70svh] min-h-[22rem] overflow-hidden">
          <Image
            src={FOTO.banjirBatavia.src}
            alt={FOTO.banjirBatavia.alt}
            width={FOTO.banjirBatavia.lebar}
            height={FOTO.banjirBatavia.tinggi}
            sizes="100vw"
            className="foto-dekat size-full object-cover grayscale contrast-[1.05]"
          />
        </div>
        <figcaption className="bingkai grid gap-4 pt-5 pb-2 lg:grid-cols-12">
          <p className="text-pernyataan tracking-[-0.02em] lg:col-span-7">
            Banjir di Batavia, awal abad ke-20. Masalahnya sudah tua; alasan urutan penanganannya yang jarang dibuka.
          </p>
          <p className="text-kecil text-lembut lg:col-span-4 lg:col-start-9">
            Foto: {FOTO.banjirBatavia.judul}. {FOTO.banjirBatavia.pembuat},{' '}
            <a href={FOTO.banjirBatavia.url} target="_blank" rel="noreferrer" className="underline">
              {FOTO.banjirBatavia.lisensi}
            </a>
            .
          </p>
        </figcaption>
      </figure>

      <AngkaMusrenbang />

      <section aria-labelledby="judul-kecamatan" className="di-medan bg-medan py-24 text-medan-tinta sm:py-32">
        <div className="bingkai" data-muncul>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2 id="judul-kecamatan" className="text-judul">
              Di mana masalahnya menumpuk
            </h2>
            <LabelSumber sumber={data.sumber} className="!bg-tinta-tua !text-medan-tinta" />
          </div>
          <dl className="mt-10 grid grid-cols-3 gap-4 sm:max-w-3xl">
            {[
              { nilai: ribuan(statistik.total_laporan), label: 'laporan masuk' },
              { nilai: `${desimal(statistik.persen_selesai, 0)}%`, label: 'laporan selesai' },
              { nilai: ribuan(statistik.terlambat_aktif), label: 'laporan aktif terlambat' },
            ].map((s) => (
              <div key={s.label} className="flex flex-col-reverse">
                <dt className="text-kecil text-medan-lembut">{s.label}</dt>
                <dd className="angka text-judul font-medium tracking-[-0.04em]">{s.nilai}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-2 text-kecil text-medan-lembut">
            {sumberStat === 'contoh' ? 'Data contoh' : 'Data simulasi'}, dihitung dari semua laporan kecuali yang dibatalkan.
          </p>
          <div className="mt-16 sm:mt-20">
            <SorotKecamatan teratas={teratas} skorPerKecamatan={skorPerKecamatan} />
          </div>
        </div>
      </section>
    </>
  );
}

function AngkaMusrenbang() {
  const BARIS = [
    { utuh: '18.221', desimal: '', label: 'usulan langsung warga masuk lewat e-Musrenbang DKI Jakarta pada 2019.' },
    { utuh: '254', desimal: '', label: 'usulan dari jumlah itu yang akhirnya terealisasi.' },
    { utuh: '1', desimal: ',4', label: 'persen. Sisanya tidak pernah tahu kenapa tidak terpilih.' },
    { utuh: '61.174', desimal: '', label: 'usulan aspirasi diterima untuk Musrenbang RKPD 2027.' },
  ];
  return (
    <section aria-labelledby="judul-musrenbang" className="py-24 sm:py-36">
      <div className="bingkai grid gap-12 lg:grid-cols-12 lg:items-center" data-muncul>
        <div className="lg:col-span-5">
          <h2 id="judul-musrenbang" className="text-judul">
            <span className="block text-lembut">Usulan warga,</span>
            nasibnya gelap
          </h2>
          <p className="mt-6 max-w-[44ch] text-badan">
            Masalah yang sama muncul di perencanaan tahunan. Peringkat prioritas yang bisa dijelaskan dapat menjadi bahan
            berbasis data untuk Musrenbang.
          </p>
          <p className="mt-4 text-kecil text-lembut">
            Sumber: jurnal Universitas Diponegoro tentang e-Musrenbang DKI (data 2019); Metro TV, April 2026.
          </p>
        </div>
        <dl className="grid gap-5 lg:col-span-6 lg:col-start-7">
          {BARIS.map((b) => (
            <div key={b.label} className="grid grid-cols-[52%_1fr] items-baseline sm:grid-cols-[minmax(0,5fr)_minmax(0,1.2fr)_minmax(0,6fr)]">
              <dd className="angka text-right text-[clamp(3.25rem,1rem+5.4vw,6rem)] leading-none font-medium tracking-[-0.05em]">
                {b.utuh}
              </dd>
              <dd className="angka text-[clamp(3.25rem,1rem+5.4vw,6rem)] leading-none font-medium tracking-[-0.05em]">
                {b.desimal}
              </dd>
              <dt className="col-span-2 mt-1 text-kecil sm:col-span-1 sm:mt-0 sm:pl-4 sm:text-badan">{b.label}</dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

async function BagianAlur() {
  const { rapor } = await ambilRapor();
  return <AlurLapor rapor={rapor.instansi} kodeContoh="SR-K7W3PA" />;
}

function KerangkaBagian({ tinggi = 'h-[80svh]', nada = 'bg-lapis' }: { tinggi?: string; nada?: string }) {
  return <div aria-hidden="true" className={`${tinggi} ${nada} w-full`} />;
}

export default function BerandaPage() {
  return (
    <>
      <HeroGaris />

      <section aria-label="Tentang suaRAkyat" className="py-24 sm:py-32">
        <div className="bingkai" data-muncul>
          <p className="max-w-[58ch] text-pernyataan tracking-[-0.02em]">
            Warga Jakarta sudah bisa melapor dan melacak status laporannya. Yang belum terbuka adalah lapis kedua: kenapa
            jalan di satu kecamatan diperbaiki lebih dulu, dinas mana yang lambat, dan apa yang berubah kalau prioritasnya
            diganti.
          </p>
          <div className="mt-16 grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4">
            <p className="text-badan">
              <strong className="font-semibold">Untuk warga.</strong> Lihat posisi isu wilayahmu di antara semua
              isu yang dinilai, faktor yang mendorong dan menahannya, lalu lacak laporanmu dengan kode SR.
            </p>
            <p className="text-badan">
              <strong className="font-semibold">Untuk perencana.</strong> Bobot enam faktor diatur Perencana.
              Setiap perubahan wajib beralasan dan tercatat publik: siapa, kapan, dari berapa ke berapa.
            </p>
            <p className="text-badan">
              <strong className="font-semibold">Untuk pengawas.</strong> Jurnalis, DPRD, dan komunitas membaca
              Rapor Instansi A sampai E, selalu bersama tingkat penolakan, ukuran sampel, dan periodenya.
            </p>
            <p className="text-badan">
              <strong className="font-semibold">Bukan kanal resmi.</strong> Laporan di sini tidak diteruskan ke
              instansi. Wilayah studinya DKI Jakarta daratan: lima kota administrasi, 42 kecamatan.
            </p>
          </div>
        </div>
      </section>

      <Suspense fallback={<KerangkaBagian />}>
        <BagianPrioritas />
      </Suspense>

      <section aria-labelledby="judul-masalah" className="py-24 sm:py-36">
        <div className="bingkai" data-muncul>
          <h2 id="judul-masalah" className="text-judul">
            Empat masalah, empat batas waktu
          </h2>
          <div className="mt-12 sm:mt-16">
            <DaftarMasalah />
          </div>
        </div>
      </section>

      <section aria-labelledby="judul-alur" className="bg-lapis py-24 sm:py-36">
        <div className="bingkai grid lg:grid-cols-12">
          <div className="lg:col-span-7 lg:col-start-3 xl:col-span-6 xl:col-start-4">
            <h2 id="judul-alur" className="text-judul">
              Dari mana datanya
            </h2>
            <div className="mt-14">
              <Suspense fallback={<KerangkaBagian tinggi="h-[60svh]" nada="bg-lapis-2" />}>
                <BagianAlur />
              </Suspense>
            </div>
            <div className="mt-24 bg-kertas p-6 sm:p-8" data-muncul>
              <h3 className="text-lead font-medium">Coba alurnya sendiri, tanpa daftar</h3>
              <p className="mt-2 max-w-[52ch] text-badan">
                Warga demo bisa melapor dan mendukung laporan; admin demo bisa mengubah status laporan Dinas Bina Jalan
                (simulasi). Data demo dikembalikan ke awal setiap malam.
              </p>
              <TombolDemo className="mt-6" />
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="judul-lacak" className="py-24 sm:py-36">
        <div className="bingkai">
          <h2 id="judul-lacak" className="sr-only">
            Lacak laporan
          </h2>
          <form action="/lacak" method="get" className="text-[clamp(2.25rem,1rem+5.4vw,6rem)] leading-[1.1] font-medium tracking-[-0.04em]">
            <label htmlFor="kode-kalimat">Lacak laporan </label>
            <input
              id="kode-kalimat"
              name="kode"
              placeholder="SR-K7W3PA"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              className="my-1 h-[1.08em] w-full bg-lapis px-[0.2em] align-baseline text-tinta uppercase placeholder:text-lembut/60 focus:bg-terang focus:outline-3 focus:outline-tinta sm:w-[6.3em]"
            />{' '}
            dengan kode,{' '}
            <button type="submit" className="bg-tinta px-[0.2em] text-kertas hover:bg-tinta-tua active:translate-y-px">
              sekarang
            </button>
            .
          </form>
          <p className="mt-6 max-w-[60ch] text-badan text-lembut">
            Kode dikirim saat laporan terkirim. Siapa saja bisa membuka halaman lacaknya: status, riwayat, batas waktu, dan
            posisinya di daftar prioritas.
          </p>
        </div>
      </section>
    </>
  );
}
