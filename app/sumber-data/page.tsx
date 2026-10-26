// app/sumber-data/page.tsx — Sumber Data (SDD 9), pemilik: A (isi dari C)
// Daftar dataset, sumber, tahun, lisensi, dan skenario data simulasi (FR-G3, SDD 10).
// C: perbarui baris "Menyusul" saat data BPS dan dataset CRM DKI sudah dimuat.

import type { Metadata } from 'next';
import Image from 'next/image';
import { FOTO, KATEGORI } from '@/lib/konten';

export const metadata: Metadata = {
  title: 'Sumber data',
  description: 'Dataset yang dipakai suaRAkyat, lisensinya, dan bagian mana yang merupakan data simulasi.',
};

const DATA_TERBUKA = [
  {
    nama: 'Batas kecamatan DKI Jakarta',
    dipakai: 'Peta kecamatan, choropleth prioritas, penentuan kecamatan dari titik laporan',
    sumber: 'HDX Indonesia Subnational Administrative Boundaries (COD-AB), sumber BPS, berlaku 2020; dipecah per provinsi oleh repositori indonesia-district',
    lisensi: 'CC BY-IGO',
    url: 'https://data.humdata.org/dataset/cod-ab-idn',
    status: 'Dipakai',
  },
  {
    nama: 'Peta dasar',
    dipakai: 'Ubin peta di Peta Laporan, form lapor, dan detail laporan',
    sumber: 'OpenStreetMap contributors',
    lisensi: 'ODbL',
    url: 'https://www.openstreetmap.org/copyright',
    status: 'Dipakai',
  },
  {
    nama: 'Penduduk dan luas kecamatan',
    dipakai: 'Faktor volume, dukungan warga, dan kepadatan penduduk',
    sumber: 'BPS, publikasi "Dalam Angka" tingkat kota dan kecamatan (tahun terbaru yang tersedia)',
    lisensi: 'Ketentuan penggunaan data BPS',
    url: 'https://jakarta.bps.go.id',
    status: 'Menyusul',
  },
  {
    nama: 'Persentase penduduk miskin per kota administrasi',
    dipakai: 'Faktor kerentanan wilayah (level kota, ditulis terbuka di penjelasan skor)',
    sumber: 'BPS (WebAPI atau tabel bps.go.id)',
    lisensi: 'Ketentuan penggunaan data BPS',
    url: 'https://www.bps.go.id',
    status: 'Menyusul',
  },
  {
    nama: 'Pengaduan masyarakat DKI Jakarta',
    dipakai: 'Kandidat sumber dashboard prioritas jika punya kolom wilayah, kategori, dan tanggal',
    sumber: 'Portal Satu Data Indonesia (katalog.data.go.id), CRM Pemprov DKI',
    lisensi: 'Sesuai katalog',
    url: 'https://katalog.data.go.id',
    status: 'Sedang dicek',
  },
  {
    nama: 'Angka e-Musrenbang di Beranda',
    dipakai: '18.221 usulan (2019), 254 terealisasi; 61.174 usulan Musrenbang RKPD 2027',
    sumber: 'Jurnal Universitas Diponegoro tentang e-Musrenbang DKI; Metro TV, April 2026',
    lisensi: 'Kutipan dengan sumber',
    url: null,
    status: 'Dipakai',
  },
];

const PROFIL = [
  { instansi: 'Dinas Bina Jalan', tolak: '5%', respons: '90%', selesai: '80%', rating: '4,2', peran: 'Contoh dinas yang baik' },
  { instansi: 'Dinas Kebersihan', tolak: '10%', respons: '84%', selesai: '63%', rating: '3,8', peran: 'Mendekati contoh hitungan di Cara Menilai' },
  { instansi: 'Dinas Tata Air', tolak: '6%', respons: '50%', selesai: '35%', rating: '2,8', peran: 'Nilai D, sering terlambat' },
  { instansi: 'Dinas Penerangan Jalan', tolak: '32%', respons: '95%', selesai: '90%', rating: '4,5', peran: 'Angka setara A, huruf ditahan C karena penolakan' },
];

const warnaStatus: Record<string, string> = {
  Dipakai: 'bg-st-selesai-bg text-st-selesai',
  Menyusul: 'bg-st-menunggu-bg text-st-menunggu',
  'Sedang dicek': 'bg-st-diverifikasi-bg text-st-diverifikasi',
};

export default function SumberDataPage() {
  return (
    <div className="bingkai pt-12 pb-24 sm:pt-16">
      <div className="grid gap-6 lg:grid-cols-12">
        <h1 className="text-judul lg:col-span-6">Sumber data</h1>
        <p className="max-w-[60ch] text-badan lg:col-span-6">
          Data nyata dipakai untuk wilayah dan statistik yang didukung sumber; data simulasi hanya untuk memperagakan
          mekanisme lapor, rapor, dan prioritas. Keduanya tidak pernah dicampur dalam satu angka, dan setiap halaman
          menandai sumber angkanya.
        </p>
      </div>

      <section aria-labelledby="judul-terbuka" className="mt-16">
        <h2 id="judul-terbuka" className="text-lead font-medium tracking-tight">
          Data terbuka
        </h2>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[56rem] text-left text-badan">
            <thead className="bg-lapis-2 text-kecil">
              <tr>
                <th scope="col" className="p-4 font-medium">Dataset</th>
                <th scope="col" className="p-4 font-medium">Dipakai untuk</th>
                <th scope="col" className="p-4 font-medium">Sumber</th>
                <th scope="col" className="p-4 font-medium">Lisensi</th>
                <th scope="col" className="p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {DATA_TERBUKA.map((d) => (
                <tr key={d.nama} className="border-t-2 border-kertas bg-lapis align-top">
                  <th scope="row" className="p-4 font-semibold">{d.nama}</th>
                  <td className="p-4 text-kecil">{d.dipakai}</td>
                  <td className="p-4 text-kecil">
                    {d.url ? (
                      <a href={d.url} target="_blank" rel="noreferrer" className="underline underline-offset-4">
                        {d.sumber}
                      </a>
                    ) : (
                      d.sumber
                    )}
                  </td>
                  <td className="p-4 text-kecil whitespace-nowrap">{d.lisensi}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 text-kecil font-medium whitespace-nowrap ${warnaStatus[d.status]}`}>{d.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 max-w-[75ch] text-kecil text-lembut">
          Data wilayah digabung memakai kode wilayah, bukan nama, dan salinan lokal setiap dataset disimpan di repositori
          (folder data/) karena portal bisa berubah. Selama data BPS belum dimuat, penduduk, luas, dan persen miskin di data
          contoh adalah angka contoh.
        </p>
      </section>

      <section id="simulasi" aria-labelledby="judul-simulasi" className="mt-24 scroll-mt-6">
        <div className="grid gap-6 lg:grid-cols-12">
          <h2 id="judul-simulasi" className="text-judul lg:col-span-6">
            Skenario simulasi
          </h2>
          <div className="grid gap-4 text-badan lg:col-span-6">
            <p>
              Laporan, status, dukungan, dan rating dibuat oleh generator dengan random seed tetap: 800–1.000 laporan dalam
              enam bulan terakhir, titiknya diambil acak di dalam poligon kecamatan sebanding jumlah penduduk. Reset data
              selalu menghasilkan angka yang sama, jadi angka di video dan proposal konsisten.
            </p>
            <p>
              Nama instansi sengaja generik dan bertanda simulasi supaya tidak terbaca sebagai kinerja dinas sungguhan. Rapor
              Instansi tidak pernah memakai data nyata. Setiap instansi diberi profil kinerja berikut, dan rating dibuat
              berkorelasi dengan ketepatan waktu penyelesaian.
            </p>
          </div>
        </div>
        <div className="mt-10 overflow-x-auto">
          <table className="w-full min-w-[48rem] text-left text-badan">
            <thead className="bg-lapis-2 text-kecil">
              <tr>
                <th scope="col" className="p-4 font-medium">Instansi (simulasi)</th>
                <th scope="col" className="p-4 text-right font-medium">Peluang ditolak</th>
                <th scope="col" className="p-4 text-right font-medium">Respons tepat waktu</th>
                <th scope="col" className="p-4 text-right font-medium">Selesai tepat waktu</th>
                <th scope="col" className="p-4 text-right font-medium">Rating rata-rata</th>
                <th scope="col" className="p-4 font-medium">Peran di demo</th>
              </tr>
            </thead>
            <tbody>
              {PROFIL.map((p) => (
                <tr key={p.instansi} className="border-t-2 border-kertas bg-lapis">
                  <th scope="row" className="p-4 font-semibold">{p.instansi}</th>
                  <td className="angka p-4 text-right">{p.tolak}</td>
                  <td className="angka p-4 text-right">{p.respons}</td>
                  <td className="angka p-4 text-right">{p.selesai}</td>
                  <td className="angka p-4 text-right">{p.rating}</td>
                  <td className="p-4 text-kecil">{p.peran}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="mt-14 text-lead font-medium tracking-tight">Batas waktu layanan per kategori</h3>
        <p className="mt-2 max-w-[70ch] text-badan">
          Dihitung dalam jam kalender agar sederhana. Angkanya ilustrasi dan dinyatakan terbuka di sini.
        </p>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[40rem] text-left text-badan">
            <thead className="bg-lapis-2 text-kecil">
              <tr>
                <th scope="col" className="p-4 font-medium">Kategori</th>
                <th scope="col" className="p-4 font-medium">Instansi</th>
                <th scope="col" className="p-4 font-medium">Urgensi</th>
                <th scope="col" className="p-4 text-right font-medium">Respons</th>
                <th scope="col" className="p-4 text-right font-medium">Selesai</th>
              </tr>
            </thead>
            <tbody>
              {KATEGORI.map((k) => (
                <tr key={k.id} className="border-t-2 border-kertas bg-lapis">
                  <th scope="row" className="p-4 font-semibold">{k.nama}</th>
                  <td className="p-4 text-kecil">{k.instansi}</td>
                  <td className="p-4">{k.urgensi}</td>
                  <td className="angka p-4 text-right">{k.respons} jam</td>
                  <td className="angka p-4 text-right">
                    {k.selesai} jam ({k.selesai / 24} hari)
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="foto" aria-labelledby="judul-foto" className="mt-24 scroll-mt-6">
        <h2 id="judul-foto" className="text-judul">
          Kredit foto
        </h2>
        <p className="mt-4 max-w-[70ch] text-badan">
          Foto di Beranda menunjukkan dunia masalah kota Jakarta dan diambil dari koleksi terbuka. Foto-foto ini bukan foto
          laporan di aplikasi.
        </p>
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Object.values(FOTO).map((f) => (
            <li key={f.src}>
              <Image src={f.src} alt={f.alt} width={f.lebar} height={f.tinggi} sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw" className="aspect-[3/2] w-full object-cover grayscale" />
              <p className="mt-2 text-kecil">
                &ldquo;{f.judul}&rdquo; · {f.pembuat} ·{' '}
                <a href={f.url} target="_blank" rel="noreferrer" className="underline underline-offset-4">
                  {f.lisensi}
                </a>
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
