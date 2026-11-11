// app/page.tsx — Beranda (SDD 9), pemilik: A
// Pembeda tampil lebih awal: pita data → hero → perbandingan prioritas → alur lapor → kategori → peta → laporan.
// Penanda data: satu pita satu kalimat di atas, label "Data buatan" di blok angka buatan, "Data asli" di blok Musrenbang.
// Operasi SDD 6: R1 stats_beranda, R9 priority_factors + L1 lib/scoring, R8 agency_report_card,
// Q1 v_laporan_publik (laporan terbaru), A1 POST /api/demo-login (TombolDemo, di deret kupon).

import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';
import BannerSimulasi from '@/components/BannerSimulasi';
import { hitungSLA } from '@/components/IndikatorSLA';
import AlurLapor, { KALIMAT_TOLAK } from '@/components/beranda/AlurLapor';
import DaftarMasalah from '@/components/beranda/DaftarMasalah';
import HeroCari from '@/components/beranda/HeroCari';
import KuponPeran from '@/components/beranda/KuponPeran';
import LaporanTerbaru from '@/components/beranda/LaporanTerbaru';
import PerbandinganPeringkat from '@/components/beranda/PerbandinganPeringkat';
import SorotKecamatan, { type IsuTeratas } from '@/components/beranda/SorotKecamatan';
import AngkaGulir from '@/components/ui/AngkaGulir';
import Ikon from '@/components/ui/Ikon';
import LabelSumber from '@/components/ui/LabelSumber';
import { kodeLaporanUntukIsu, ambilStatistik, ambilTitikLaporan, type TitikLaporan } from '@/lib/data/laporan';
import { ambilDataPrioritas, ambilRapor } from '@/lib/data/prioritas';
import { keTitikPeta, type TitikPeta } from '@/lib/geo/proyeksi';
import { desimal, persen, ribuan } from '@/lib/format';
import { ARTI_HURUF } from '@/lib/kamus';
import { FOTO, KATEGORI } from '@/lib/konten';
import { namaDinas, urutkanRapor } from '@/lib/konten-rapor';
import { hitungSkor, PRESET } from '@/lib/scoring';
import { SUMBER_MUSRENBANG } from '@/lib/sumber';
import type { SkorIsu } from '@/lib/types';

/** Masalah untuk contoh "urutan bisa berubah": jalan rusak di tengah urutan yang paling naik saat keselamatan diutamakan. */
function pilihIsuContoh(resmi: SkorIsu[], keselamatan: SkorIsu[]): SkorIsu {
  const posisi = new Map(keselamatan.map((s) => [s.id, s.peringkat]));
  const naik = (s: SkorIsu) => s.peringkat - (posisi.get(s.id) ?? s.peringkat);
  const tengah = resmi.filter((s) => s.peringkat >= 8 && s.peringkat <= Math.max(12, resmi.length * 0.25));
  const kandidat = [...tengah.filter((s) => s.category_id === 1), ...tengah].sort((a, b) => naik(b) - naik(a));
  return kandidat.find((s) => s.category_id === 1 && naik(s) > 0) ?? kandidat[0] ?? resmi[0];
}

/** Isi tab "Rapor dinas" di kotak cari: empat dinas, huruf, artinya, dan persen laporan yang ditolak. */
async function PanelRapor() {
  const { sumber, rapor } = await ambilRapor();
  return (
    <div>
      <LabelSumber sumber={sumber} ringkas className="mb-3" />
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {urutkanRapor(rapor.instansi).map((i) => (
          <li key={i.id}>
            <Link href={`/rapor#instansi-${i.id}`} className="kartu kartu-klik flex items-center gap-3 p-3">
              <span
                className={`flex size-12 shrink-0 items-center justify-center rounded-kontrol text-[1.75rem] leading-none font-bold ${
                  i.huruf ? 'bg-biru text-white' : 'bg-lapis text-lembut'
                }`}
              >
                {i.huruf ?? '?'}
              </span>
              <span className="min-w-0 text-kecil leading-tight">
                {/* Label "dinas buatan" tetap tampil: tanpa itu nilai D bisa dikira penilaian dinas sungguhan (audit 11 Nov, P1-6). */}
                <span className="block font-bold">
                  {namaDinas(i.nama)} <span className="font-normal text-lembut">(dinas buatan)</span>
                </span>
                <span className="mt-0.5 block text-lembut">{i.huruf ? ARTI_HURUF[i.huruf] : 'Belum cukup laporan'}</span>
                <span
                  className={`mt-0.5 flex items-center gap-1 ${i.peringatan_penolakan ? 'font-semibold text-merah-tua' : 'text-lembut'}`}
                >
                  {i.peringatan_penolakan && <Ikon nama="peringatan" className="size-3.5" />}
                  {persen(i.tingkat_penolakan)} laporan ditolak
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-kecil text-lembut">
        {KALIMAT_TOLAK}{' '}
        <Link href="/rapor/cara-menilai" className="font-semibold text-biru-tua hover:underline">
          Cara rapor dihitung
        </Link>
      </p>
    </div>
  );
}

async function PerbandinganPrioritas() {
  const data = await ambilDataPrioritas();
  const resmi = hitungSkor(data.faktor.isu, data.bobotResmi);
  if (resmi.length === 0) return null;
  const contoh = pilihIsuContoh(resmi, hitungSkor(data.faktor.isu, PRESET.keselamatan));
  const kode = await kodeLaporanUntukIsu(data.sumber, contoh.kecamatan, contoh.kategori);
  return <PerbandinganPeringkat isu={data.faktor.isu} bobotResmi={data.bobotResmi} idIsu={contoh.id} kodeLaporan={kode} sumber={data.sumber} />;
}

async function BagianPrioritas() {
  const [data, { statistik }, { laporan, sekarang }] = await Promise.all([
    ambilDataPrioritas(),
    ambilStatistik(),
    ambilTitikLaporan(),
  ]);
  const resmi = hitungSkor(data.faktor.isu, data.bobotResmi);
  if (resmi.length === 0) return null;

  const skorPerKecamatan: Record<string, number> = {};
  for (const s of resmi) skorPerKecamatan[s.kode_wilayah] = Math.max(skorPerKecamatan[s.kode_wilayah] ?? 0, s.skor);
  const sudah = new Set<string>();
  const teratas: IsuTeratas[] = [];
  for (const s of resmi) {
    if (sudah.has(s.kode_wilayah)) continue;
    sudah.add(s.kode_wilayah);
    teratas.push({
      kode_wilayah: s.kode_wilayah,
      kecamatan: s.kecamatan,
      kota: s.kota,
      kategori: s.kategori,
      skor: s.skor,
      peringkat: s.peringkat,
      kontribusi: s.kontribusi,
    });
    if (teratas.length === 10) break;
  }

  // Titik untuk tampilan fokus di peta: paling banyak 8 laporan berkategori sama di kecamatan itu, yang masih
  // berjalan didahulukan. Dipilih di server supaya peramban tidak menerima semua laporan.
  const AKTIF = new Set(['menunggu', 'diverifikasi', 'diproses']);
  const titikIsu: Record<string, TitikPeta[]> = {};
  for (const t of teratas) {
    titikIsu[t.kode_wilayah] = laporan
      .filter((l) => l.kecamatan === t.kecamatan && l.kategori === t.kategori && l.status !== 'dibatalkan')
      .filter((l) => Number.isFinite(l.lat) && Number.isFinite(l.lng))
      .sort((a, b) => Number(AKTIF.has(b.status)) - Number(AKTIF.has(a.status)))
      .slice(0, 8)
      .map((l) => {
        const [x, y] = keTitikPeta(l.lat, l.lng);
        const sla = AKTIF.has(l.status) ? hitungSLA({ ...l, responded_at: null, resolved_at: null }, sekarang) : null;
        return { kode: l.kode, status: l.status, x, y, sla: sla?.teks, telat: sla?.terlambat };
      });
  }

  return (
    <>
      <section aria-labelledby="judul-kecamatan" className="bingkai mt-12 sm:mt-14">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="judul-kecamatan" className="judul-seksi">
            Di mana masalah menumpuk
          </h2>
          <LabelSumber sumber={data.sumber} ringkas />
        </div>
        <div className="kartu muncul mt-5 p-5 sm:p-7">
          <dl className="grid grid-cols-3 gap-2 sm:gap-3">
            {[
              { nilai: ribuan(statistik.total_laporan), label: 'laporan masuk' },
              { nilai: `${desimal(statistik.persen_selesai, 0)}%`, label: 'laporan selesai' },
              { nilai: ribuan(statistik.terlambat_aktif), label: 'belum selesai dan lewat batas waktu' },
            ].map((s) => (
              // justify-end: di flex-col-reverse isi jadi rata atas, jadi angka di ketiga kotak sejajar walau labelnya
              // turun ke baris yang berbeda jumlahnya.
              <div key={s.label} className="flex flex-col-reverse justify-end rounded-kontrol bg-latar p-3 sm:p-4">
                <dt className="mt-1 text-kecil text-lembut">{s.label}</dt>
                <dd className="angka text-sub font-bold sm:text-judul">
                  <AngkaGulir nilai={s.nilai} />
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-2 text-kecil text-lembut">
            Angka di atas dihitung dari semua laporan, kecuali yang dibatalkan pelapor.
          </p>
          <div className="mt-6 border-t border-garis pt-6">
            <SorotKecamatan teratas={teratas} total={resmi.length} skorPerKecamatan={skorPerKecamatan} titik={titikIsu} />
          </div>
        </div>
      </section>
    </>
  );
}

function AngkaMusrenbang() {
  const ANGKA = [
    { nilai: '18.221', label: 'usulan langsung dari warga lewat e-Musrenbang DKI Jakarta (2019)' },
    { nilai: '254', label: 'dari usulan itu yang akhirnya dikerjakan' },
    { nilai: '1,4%', label: 'hanya segini yang benar-benar dikerjakan' },
    { nilai: '61.174', label: 'aspirasi untuk rencana pembangunan 2027, melalui Musrenbang, usulan langsung, dan reses DPRD' },
  ];
  return (
    <section aria-labelledby="judul-musrenbang" className="bingkai mt-12 sm:mt-14">
      <div className="relative isolate grid overflow-hidden rounded-besar bg-[linear-gradient(120deg,var(--color-biru-pudar)_0%,#d4ebe5_100%)] lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        {/* Lingkaran hiasan di sudut, seperti latar bagian aplikasi di situs travel. */}
        <span aria-hidden="true" className="pointer-events-none absolute -top-28 -left-28 -z-10 size-80 rounded-full bg-white/45" />
        <span aria-hidden="true" className="pointer-events-none absolute -bottom-36 left-1/3 -z-10 size-72 rounded-full bg-biru/8" />
        <div className="p-6 sm:p-10">
          <div className="flex flex-wrap items-center gap-3">
            <h2 id="judul-musrenbang" className="judul-seksi">
              Usulan perlu tindak lanjut
            </h2>
            <LabelSumber sumber="terbuka" ringkas />
          </div>
          <p className="mt-3 max-w-[56ch] text-badan text-lembut">
            Gunakan urutan prioritas sebagai bahan usulan dalam rapat pembangunan warga (Musrenbang).
          </p>
          <dl className="mt-6 grid grid-cols-2 gap-3 xl:grid-cols-4" data-muncul>
            {ANGKA.map((a) => (
              <div key={a.label} className="flex flex-col-reverse justify-end rounded-kartu bg-white p-4">
                <dt className="mt-1 text-kecil text-lembut">{a.label}</dt>
                <dd className="angka text-seksi font-bold text-biru-tua">
                  <AngkaGulir nilai={a.nilai} />
                </dd>
              </div>
            ))}
          </dl>
          <figure className="mt-6">
            {/* 254 dari 18.221 usulan: ruas biru tipis di bar penuh, terisi saat terlihat. */}
            <div className="relative h-3 overflow-hidden rounded-full bg-white" aria-hidden="true">
              <div className="bar-isi absolute inset-y-0 left-0 w-[max(1.4%,6px)] rounded-full bg-biru" />
            </div>
            <figcaption className="mt-2 flex flex-wrap justify-between gap-x-6 gap-y-1 text-kecil text-lembut">
              <span>
                <strong className="font-bold text-biru-tua">254</strong> usulan dikerjakan
              </span>
              <span>dari 18.221 usulan langsung warga, e-Musrenbang DKI 2019</span>
            </figcaption>
          </figure>
          <p className="mt-4 text-kecil text-lembut">
            Sumber:{' '}
            <a href={SUMBER_MUSRENBANG.studi2019.url} target="_blank" rel="noreferrer" className="underline underline-offset-4">
              {SUMBER_MUSRENBANG.studi2019.label}
            </a>{' '}dan{' '}
            <a href={SUMBER_MUSRENBANG.rkpd2027.url} target="_blank" rel="noreferrer" className="underline underline-offset-4">
              {SUMBER_MUSRENBANG.rkpd2027.label}
            </a>.
          </p>
        </div>
        <figure className="relative min-h-72 lg:min-h-full">
          <Image
            src={FOTO.banjirTanjungDuren.src}
            alt={FOTO.banjirTanjungDuren.alt}
            fill
            sizes="(min-width: 1024px) 30vw, 100vw"
            className="object-cover"
          />
          <figcaption className="absolute inset-x-0 bottom-0 bg-[linear-gradient(0deg,rgb(15_42_51/0.85),transparent)] px-4 pt-10 pb-3 text-mini text-white">
            Tanjung Duren, Grogol Petamburan, 1 Januari 2020: salah satu dari 42 kecamatan di SUARAKYAT. Foto &ldquo;
            {FOTO.banjirTanjungDuren.judul}&rdquo; oleh {FOTO.banjirTanjungDuren.pembuat},{' '}
            <a href={FOTO.banjirTanjungDuren.url} target="_blank" rel="noreferrer" className="underline">
              {FOTO.banjirTanjungDuren.lisensi}
            </a>
            .
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

async function BagianAlur() {
  const { sumber, rapor } = await ambilRapor();
  return <AlurLapor rapor={rapor.instansi} sumber={sumber} kodeContoh="SR-ABC234" />;
}

/** Enam laporan terbaru per tab (semua + tiap kategori), dipilih di server. */
async function BagianTerbaru() {
  const { sumber, laporan, sekarang } = await ambilTitikLaporan();
  const urut = [...laporan].sort((a, b) => b.created_at.localeCompare(a.created_at));
  const per: Record<string, TitikLaporan[]> = { semua: urut.slice(0, 6) };
  for (const k of KATEGORI) per[String(k.id)] = urut.filter((l) => l.kategori === k.nama).slice(0, 6);
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="judul-terbaru" className="judul-seksi">
            Laporan terbaru
          </h2>
          <p className="mt-2 max-w-[70ch] text-badan text-lembut">
            Pantau status dan alasan penanganannya.
          </p>
        </div>
        <LabelSumber sumber={sumber} ringkas />
      </div>
      <div className="muncul mt-5">
        <LaporanTerbaru per={per} sekarang={sekarang} />
      </div>
    </>
  );
}

function KerangkaBagian({ tinggi = 'h-[40rem]' }: { tinggi?: string }) {
  return (
    <div aria-hidden="true" className="bingkai mt-12 sm:mt-14">
      <div className={`kerangka ${tinggi}`} />
    </div>
  );
}

export default function BerandaPage() {
  return (
    <>
      {/* Satu pita, satu kalimat untuk seluruh Beranda; blok angka buatan cukup diberi label "Data buatan". */}
      <div className="bingkai pt-3 sm:pt-4">
        <BannerSimulasi />
      </div>

      <HeroCari
        panelRapor={
          <Suspense fallback={<div aria-hidden="true" className="kerangka h-20" />}>
            <PanelRapor />
          </Suspense>
        }
      />

      <Suspense fallback={<KerangkaBagian tinggi="h-[32rem]" />}>
        <PerbandinganPrioritas />
      </Suspense>

      <section aria-labelledby="judul-alur" className="bingkai mt-12 sm:mt-14">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="judul-alur" className="judul-seksi">
              Cara kerjanya
            </h2>
            <p className="mt-2 max-w-[70ch] text-badan text-lembut">
              Lapor, pantau, lalu nilai penanganannya.
            </p>
          </div>
        </div>
        <div className="mt-5">
          <Suspense fallback={<div aria-hidden="true" className="kerangka h-[28rem]" />}>
            <BagianAlur />
          </Suspense>
        </div>
      </section>

      <section aria-labelledby="judul-masalah" className="bingkai mt-12 sm:mt-14">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="judul-masalah" className="judul-seksi">
            Masalah yang bisa dilaporkan
          </h2>
          <LabelSumber sumber="db" ringkas />
        </div>
        <p className="mt-2 max-w-[70ch] text-badan text-lembut">
          Pilih jenis masalah untuk melihat dinas dan batas waktu penanganan.
        </p>
        <div className="muncul mt-5">
          <DaftarMasalah />
        </div>
      </section>

      <Suspense fallback={<KerangkaBagian />}>
        <BagianPrioritas />
      </Suspense>

      {/* Bagian rekomendasi: tab pil + deretan kartu, seperti di situs travel. */}
      <section aria-labelledby="judul-terbaru" className="bingkai mt-12 sm:mt-14">
        <Suspense fallback={<div aria-hidden="true" className="kerangka h-[24rem]" />}>
          <BagianTerbaru />
        </Suspense>
      </section>

      <AngkaMusrenbang />

      <KuponPeran />
    </>
  );
}
