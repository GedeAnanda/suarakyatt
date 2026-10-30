// app/sumber-data/page.tsx — Sumber Data (SDD 9), pemilik: A (isi dari C)
// Daftar dataset, sumber, tahun, lisensi, dan skenario data simulasi (FR-G3, SDD 10).
// C: perbarui baris "Menyusul" saat data BPS dan dataset CRM DKI sudah dimuat.

import type { Metadata } from 'next';
import Image from 'next/image';
import KepalaHalaman from '@/components/KepalaHalaman';
import { FOTO, KATEGORI } from '@/lib/konten';

export const metadata: Metadata = {
  title: 'Sumber data',
  description: 'Dataset yang dipakai SUARAKYAT, lisensinya, dan bagian mana yang merupakan data simulasi.',
};

const DATA_TERBUKA = [
  {
    nama: 'Batas kecamatan DKI Jakarta',
    dipakai: 'Peta kecamatan, choropleth prioritas, penentuan kecamatan dari titik laporan',
    sumber: 'HDX Indonesia Subnational Administrative Boundaries (COD-AB), dipotong ke 42 kecamatan DKI daratan dan disederhanakan (scripts/01_wilayah.py)',
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

const kelasTag = 'inline-block rounded-[0.375rem] px-2 py-0.5 text-mini font-bold whitespace-nowrap';
const kelasKepalaTabel = 'bg-latar text-kecil text-lembut';

export default function SumberDataPage() {
  return (
    <div className="bingkai pt-6 pb-4 sm:pt-8">
      <KepalaHalaman judul="Sumber data">
        Data nyata dipakai untuk wilayah dan statistik yang didukung sumber; data simulasi hanya untuk memperagakan
        mekanisme lapor, rapor, dan prioritas. Keduanya tidak pernah dicampur dalam satu angka, dan setiap halaman menandai
        sumber angkanya.
      </KepalaHalaman>

      <nav aria-label="Isi halaman" className="mt-5 flex flex-wrap gap-2">
        <a href="#terbuka" className="chip">Data terbuka</a>
        <a href="#simulasi" className="chip">Skenario simulasi</a>
        <a href="#batas-waktu" className="chip">Batas waktu layanan</a>
        <a href="#foto" className="chip">Kredit foto</a>
      </nav>

      <section id="terbuka" aria-labelledby="judul-terbuka" className="mt-10 scroll-mt-24">
        <h2 id="judul-terbuka" className="judul-seksi">
          Data terbuka
        </h2>
        <ul className="mt-4 grid gap-3 sm:hidden">
          {DATA_TERBUKA.map((d) => (
            <li key={d.nama} className="kartu grid gap-2 p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="font-bold">{d.nama}</p>
                <span className={`${kelasTag} ${warnaStatus[d.status]}`}>{d.status}</span>
              </div>
              <p className="text-kecil text-lembut">{d.dipakai}</p>
              <p className="text-kecil">
                {d.url ? (
                  <a href={d.url} target="_blank" rel="noreferrer" className="text-biru-tua underline underline-offset-4">
                    {d.sumber}
                  </a>
                ) : (
                  d.sumber
                )}{' '}
                · <span className="font-semibold">{d.lisensi}</span>
              </p>
            </li>
          ))}
        </ul>
        <div className="kartu relative mt-4 hidden overflow-x-auto sm:block">
          <table className="w-full min-w-[56rem] text-left text-badan">
            <thead className={kelasKepalaTabel}>
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Dataset</th>
                <th scope="col" className="px-4 py-3 font-semibold">Dipakai untuk</th>
                <th scope="col" className="px-4 py-3 font-semibold">Sumber</th>
                <th scope="col" className="px-4 py-3 font-semibold">Lisensi</th>
                <th scope="col" className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {DATA_TERBUKA.map((d) => (
                <tr key={d.nama} className="border-t border-garis align-top transition-colors hover:bg-biru-pudar">
                  <th scope="row" className="p-4 font-bold">{d.nama}</th>
                  <td className="p-4 text-kecil text-lembut">{d.dipakai}</td>
                  <td className="p-4 text-kecil">
                    {d.url ? (
                      <a href={d.url} target="_blank" rel="noreferrer" className="text-biru-tua underline underline-offset-4">
                        {d.sumber}
                      </a>
                    ) : (
                      d.sumber
                    )}
                  </td>
                  <td className="p-4 text-kecil whitespace-nowrap">{d.lisensi}</td>
                  <td className="p-4">
                    <span className={`${kelasTag} ${warnaStatus[d.status]}`}>{d.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 max-w-[80ch] text-kecil text-lembut">
          Data wilayah digabung memakai kode wilayah, bukan nama, dan salinan lokal setiap dataset disimpan di repositori
          (folder data/) karena portal bisa berubah. Selama data BPS belum dimuat, penduduk, luas, dan persen miskin di data
          contoh adalah angka contoh.
        </p>
      </section>

      <section id="simulasi" aria-labelledby="judul-simulasi" className="mt-12 scroll-mt-24">
        <h2 id="judul-simulasi" className="judul-seksi">
          Skenario simulasi
        </h2>
        <div className="mt-2 grid max-w-[80ch] gap-3 text-badan text-lembut">
          <p>
            Laporan, status, dukungan, dan rating dibuat oleh generator dengan random seed tetap: 800 sampai 1.000 laporan dalam enam
            bulan terakhir, titiknya diambil acak di dalam poligon kecamatan sebanding jumlah penduduk. Reset data selalu
            menghasilkan angka yang sama, jadi angka di video dan proposal konsisten.
          </p>
          <p>
            Nama instansi sengaja generik dan bertanda simulasi supaya tidak terbaca sebagai kinerja dinas sungguhan. Rapor
            Instansi tidak pernah memakai data nyata. Setiap instansi diberi profil kinerja berikut, dan rating dibuat
            berkorelasi dengan ketepatan waktu penyelesaian.
          </p>
        </div>
        <ul className="mt-5 grid gap-3 sm:hidden">
          {PROFIL.map((p) => (
            <li key={p.instansi} className="kartu p-4">
              <p className="font-bold">{p.instansi} (simulasi)</p>
              <p className="text-kecil text-lembut">{p.peran}</p>
              <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-kecil">
                {[
                  ['Peluang ditolak', p.tolak],
                  ['Respons tepat waktu', p.respons],
                  ['Selesai tepat waktu', p.selesai],
                  ['Rating rata-rata', p.rating],
                ].map(([label, nilai]) => (
                  <div key={label}>
                    <dt className="text-lembut">{label}</dt>
                    <dd className="angka text-badan font-bold">{nilai}</dd>
                  </div>
                ))}
              </dl>
            </li>
          ))}
        </ul>
        <div className="kartu relative mt-5 hidden overflow-x-auto sm:block">
          <table className="w-full min-w-[48rem] text-left text-badan">
            <thead className={kelasKepalaTabel}>
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Instansi (simulasi)</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Peluang ditolak</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Respons tepat waktu</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Selesai tepat waktu</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Rating rata-rata</th>
                <th scope="col" className="px-4 py-3 font-semibold">Peran di demo</th>
              </tr>
            </thead>
            <tbody>
              {PROFIL.map((p) => (
                <tr key={p.instansi} className="border-t border-garis transition-colors hover:bg-biru-pudar">
                  <th scope="row" className="p-4 font-bold">{p.instansi}</th>
                  <td className="angka p-4 text-right">{p.tolak}</td>
                  <td className="angka p-4 text-right">{p.respons}</td>
                  <td className="angka p-4 text-right">{p.selesai}</td>
                  <td className="angka p-4 text-right">{p.rating}</td>
                  <td className="p-4 text-kecil text-lembut">{p.peran}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="batas-waktu" aria-labelledby="judul-batas" className="mt-12 scroll-mt-24">
        <h2 id="judul-batas" className="judul-seksi">
          Batas waktu layanan per kategori
        </h2>
        <p className="mt-2 max-w-[80ch] text-badan text-lembut">
          Dihitung dalam jam kalender agar sederhana. Angkanya ilustrasi dan dinyatakan terbuka di sini.
        </p>
        <ul className="mt-5 grid gap-3 sm:hidden">
          {KATEGORI.map((k) => (
            <li key={k.id} className="kartu flex items-start justify-between gap-4 p-4">
              <div>
                <p className="font-bold">{k.nama}</p>
                <p className="text-kecil text-lembut">
                  {k.instansi} · urgensi {k.urgensi.toLowerCase()}
                </p>
              </div>
              <p className="angka shrink-0 text-right text-kecil">
                <span className="block">respons {k.respons} jam</span>
                <span className="block">selesai {k.selesai / 24} hari</span>
              </p>
            </li>
          ))}
        </ul>
        <div className="kartu relative mt-5 hidden overflow-x-auto sm:block">
          <table className="w-full min-w-[40rem] text-left text-badan">
            <thead className={kelasKepalaTabel}>
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Kategori</th>
                <th scope="col" className="px-4 py-3 font-semibold">Instansi</th>
                <th scope="col" className="px-4 py-3 font-semibold">Urgensi</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Respons</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Selesai</th>
              </tr>
            </thead>
            <tbody>
              {KATEGORI.map((k) => (
                <tr key={k.id} className="border-t border-garis transition-colors hover:bg-biru-pudar">
                  <th scope="row" className="p-4 font-bold">{k.nama}</th>
                  <td className="p-4 text-kecil text-lembut">{k.instansi}</td>
                  <td className="p-4">
                    <span className={`${kelasTag} ${k.urgensi === 'Tinggi' ? 'bg-merah-muda text-merah-tua' : 'bg-oranye-muda text-st-menunggu'}`}>
                      {k.urgensi}
                    </span>
                  </td>
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

      <section id="foto" aria-labelledby="judul-foto" className="mt-12 scroll-mt-24">
        <h2 id="judul-foto" className="judul-seksi">
          Kredit foto
        </h2>
        <p className="mt-2 max-w-[80ch] text-badan text-lembut">
          Foto di Beranda menunjukkan dunia masalah kota Jakarta dan diambil dari koleksi terbuka. Foto-foto ini bukan foto
          laporan di aplikasi.
        </p>
        <ul className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" data-muncul>
          {Object.values(FOTO).map((f) => (
            <li key={f.src} className="kartu overflow-hidden">
              <Image
                src={f.src}
                alt={f.alt}
                width={f.lebar}
                height={f.tinggi}
                sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                className="aspect-[3/2] w-full object-cover"
              />
              <p className="p-4 text-kecil">
                <span className="font-semibold">&ldquo;{f.judul}&rdquo;</span>
                <span className="block text-lembut">
                  {f.pembuat} ·{' '}
                  <a href={f.url} target="_blank" rel="noreferrer" className="text-biru-tua underline underline-offset-4">
                    {f.lisensi}
                  </a>
                </span>
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
