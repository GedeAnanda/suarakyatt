import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';
import AlurLapor from '@/components/beranda/AlurLapor';
import DaftarMasalah from '@/components/beranda/DaftarMasalah';
import HeroGaris from '@/components/beranda/HeroGaris';
import PerbandinganPeringkat from '@/components/beranda/PerbandinganPeringkat';
import SorotKecamatan, { type IsuTeratas } from '@/components/beranda/SorotKecamatan';
import CariKode from '@/components/CariKode';
import TombolDemo from '@/components/TombolDemo';
import LabelSumber from '@/components/ui/LabelSumber';
import { kelasTautan } from '@/components/ui/Tombol';
import { ambilContohLaporan, kodeLaporanUntukIsu, ambilStatistik } from '@/lib/data/laporan';
import { ambilDataPrioritas, ambilRapor } from '@/lib/data/prioritas';
import { desimal, ribuan } from '@/lib/format';
import { FOTO } from '@/lib/konten';
import { SUMBER_MUSRENBANG } from '@/lib/sumber';
import { hitungSkor, PRESET } from '@/lib/scoring';
import type { SkorIsu } from '@/lib/types';

function pilihIsuContoh(resmi: SkorIsu[], keselamatan: SkorIsu[]) {
  const posisi = new Map(keselamatan.map((s) => [s.id, s.peringkat]));
  const naik = (s: SkorIsu) => s.peringkat - (posisi.get(s.id) ?? s.peringkat);
  const tengah = resmi.filter((s) => s.peringkat >= 8 && s.peringkat <= Math.max(12, resmi.length * 0.25));
  const kandidat = [...tengah].sort((a, b) => naik(b) - naik(a));
  return kandidat.find((s) => s.category_id === 1 && naik(s) > 0) ?? kandidat[0] ?? resmi[0];
}

async function BagianPrioritas() {
  const data = await ambilDataPrioritas();
  const resmi = hitungSkor(data.faktor.isu, data.bobotResmi);
  if (!resmi.length) return <p className="bingkai py-14">Belum ada isu aktif untuk dibandingkan. <Link href="/peta" className={kelasTautan}>Buka peta laporan</Link>.</p>;
  const contoh = pilihIsuContoh(resmi, hitungSkor(data.faktor.isu, PRESET.keselamatan));
  const kode = await kodeLaporanUntukIsu(data.sumber, contoh.kecamatan, contoh.kategori);
  return <PerbandinganPeringkat isu={data.faktor.isu} bobotResmi={data.bobotResmi} idIsu={contoh.id} kodeLaporan={kode} />;
}

async function BagianWilayah() {
  const [data, { sumber, statistik }] = await Promise.all([ambilDataPrioritas(), ambilStatistik()]);
  const resmi = hitungSkor(data.faktor.isu, data.bobotResmi);
  const skor: Record<string, number> = {};
  const teratas: IsuTeratas[] = [];
  for (const s of resmi) {
    if (skor[s.kode_wilayah] !== undefined) continue;
    skor[s.kode_wilayah] = s.skor;
    if (teratas.length < 5) teratas.push({ kode_wilayah: s.kode_wilayah, kecamatan: s.kecamatan, kota: s.kota, kategori: s.kategori, skor: s.skor, peringkat: s.peringkat });
  }
  return (
    <section className="di-medan bg-medan py-14 text-medan-tinta sm:py-24" aria-labelledby="judul-kecamatan">
      <div className="bingkai" data-muncul>
        <div className="grid gap-6 lg:grid-cols-12">
          <h2 id="judul-kecamatan" className="text-judul lg:col-span-5">Lihat wilayahmu.</h2>
          <div className="min-w-0 lg:col-span-7"><p className="max-w-[55ch] text-badan">Laporan yang tersebar menjadi gambaran bersama. Pilih wilayah untuk melihat masalah yang paling tinggi skornya.</p><div className="mt-3" data-ui><LabelSumber sumber={data.sumber} className="!bg-tinta-tua !text-medan-tinta" /></div></div>
        </div>
        <dl className="mt-8 grid grid-cols-3 gap-4 sm:max-w-3xl" data-ui>
          {[
            [ribuan(statistik.total_laporan), 'laporan masuk'],
            [`${desimal(statistik.persen_selesai, 0)}%`, 'selesai dari yang tidak ditolak'],
            [ribuan(statistik.terlambat_aktif), 'laporan aktif terlambat'],
          ].map(([nilai, label]) => <div key={label}><dd className="angka text-[clamp(2rem,5vw,4rem)] leading-tight font-medium tracking-tight">{nilai}</dd><dt className="mt-1 text-kecil text-medan-lembut">{label}</dt></div>)}
        </dl>
        <p className="mt-3 text-kecil text-medan-lembut">{sumber === 'contoh' ? 'Data contoh bawaan.' : 'Data simulasi aplikasi.'} Laporan yang dibatalkan tidak ditampilkan.</p>
        <div className="mt-10"><SorotKecamatan teratas={teratas} skorPerKecamatan={skor} /></div>
      </div>
    </section>
  );
}

async function BagianAlur() {
  const [{ rapor }, contoh] = await Promise.all([ambilRapor(), ambilContohLaporan()]);
  return <AlurLapor rapor={rapor.instansi} contoh={contoh} />;
}

function KonteksPublik() {
  return (
    <section aria-labelledby="judul-konteks" className="bg-lapis py-14 sm:py-24">
      <div className="bingkai">
        <div className="grid gap-8 lg:grid-cols-12" data-muncul>
          <div className="min-w-0 lg:col-span-5"><h2 id="judul-konteks" className="text-judul">Banyak usulan.<br />Perlu alasan.</h2><p className="mt-5 max-w-[40ch] text-badan">Setiap pilihan prioritas punya konsekuensi. Data dan cara menghitungnya perlu bisa diperiksa bersama.</p></div>
          <div className="grid gap-5 lg:col-span-7" data-ui>
            <div><p className="angka text-judul">61.174</p><p className="mt-2 max-w-[55ch] text-badan">aspirasi dihimpun untuk RKPD 2027 melalui Musrenbang, usulan langsung, dan reses DPRD.</p><a href={SUMBER_MUSRENBANG.rkpd2027.url} target="_blank" rel="noreferrer" className="mt-2 inline-block text-kecil underline underline-offset-4">{SUMBER_MUSRENBANG.rkpd2027.label}</a></div>
            <details><summary className="min-h-11 cursor-pointer py-2 text-badan font-medium text-tinta">Lihat konteks e-Musrenbang 2019</summary><p className="mt-2 max-w-[55ch] text-badan">Studi e-Musrenbang mencatat 18.221 usulan langsung dan 254 terealisasi pada data 2019, sekitar 1,4%. Angka ini adalah konteks historis, bukan ukuran kinerja saat ini atau bukti alasan tiap usulan tidak terpilih.</p><a href={SUMBER_MUSRENBANG.studi2019.url} target="_blank" rel="noreferrer" className="mt-3 inline-block text-kecil underline underline-offset-4">Baca studi dan konteks angkanya (PDF)</a></details>
          </div>
        </div>
        <div className="mt-10 grid grid-cols-3 gap-2 sm:mt-14 sm:gap-4">
          {[FOTO.banjirBatavia, FOTO.ciliwung, FOTO.lampuJalan].map((f) => <figure key={f.src} className="min-w-0"><div className="aspect-[3/4] overflow-hidden sm:aspect-[4/3]"><Image src={f.src} alt={f.alt} width={f.lebar} height={f.tinggi} sizes="(min-width: 1440px) 450px, 33vw" className="foto-dekat size-full object-cover grayscale" /></div></figure>)}
        </div>
        <p className="mt-3 text-kecil text-lembut">Arsip dan potret Jakarta sebagai konteks, bukan foto laporan di aplikasi. <Link href="/sumber-data#foto" className="underline underline-offset-4">Lihat tahun, sumber, dan kredit foto</Link>.</p>
      </div>
    </section>
  );
}

function KerangkaBagian() {
  return <div role="status" className="bingkai py-14"><div aria-hidden="true" className="kerangka h-64" /><span className="sr-only">Memuat contoh dan perhitungan…</span></div>;
}

export default function BerandaPage() {
  return (
    <>
      <HeroGaris />
      <Suspense fallback={<KerangkaBagian />}><BagianPrioritas /></Suspense>
      <section aria-labelledby="judul-alur" className="py-14 sm:py-24"><div className="bingkai"><Suspense fallback={<KerangkaBagian />}><BagianAlur /></Suspense></div></section>
      <Suspense fallback={<KerangkaBagian />}><BagianWilayah /></Suspense>
      <section aria-labelledby="judul-masalah" className="py-14 sm:py-24"><div className="bingkai" data-muncul><div className="grid gap-5 lg:grid-cols-12"><h2 id="judul-masalah" className="text-judul lg:col-span-5">Masalahnya nyata.</h2><p className="max-w-[55ch] text-badan lg:col-span-7">Empat jenis masalah sehari-hari menjadi ruang belajar. Batas respons dan penyelesaiannya adalah asumsi simulasi yang terbuka.</p></div><div className="mt-8 sm:mt-12"><DaftarMasalah /></div></div></section>
      <KonteksPublik />
      <section aria-labelledby="judul-coba" className="py-14 sm:py-24"><div className="bingkai grid gap-10 lg:grid-cols-12" data-muncul>
        <div className="min-w-0 lg:col-span-5"><h2 id="judul-coba" className="text-judul">Coba dari sisimu.</h2><p className="mt-5 max-w-[40ch] text-badan">Jelajahi contoh tanpa akun, atau masuk sebagai warga dan admin demo untuk mencoba alur pelaporan.</p><p className="mt-3 max-w-[42ch] text-kecil text-lembut">suaRAkyat adalah prototipe lomba. Laporan tidak diteruskan ke instansi pemerintah.</p></div>
        <div className="min-w-0 lg:col-span-7" data-ui><TombolDemo /><Link href="/contoh" className={`${kelasTautan} mt-5 inline-flex min-h-11 items-center`}>Buka laporan contoh tanpa masuk</Link><div className="mt-8 bg-lapis p-5 sm:p-7"><h3 className="text-lead">Sudah punya kode laporan?</h3><CariKode id="kode-beranda" besar className="mt-4" /><p className="mt-3 text-kecil text-lembut">Status, catatan instansi, dan penjelasan prioritas dalam satu tempat.</p></div></div>
      </div></section>
    </>
  );
}
