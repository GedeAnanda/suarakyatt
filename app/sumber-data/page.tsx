// app/sumber-data/page.tsx — Sumber Data (SDD 9), pemilik: A (isi dari C)
// Dibuka dengan ringkasan 3 poin: yang asli, yang buatan, kenapa dibuat. Lalu daftar data yang dipakai, cara data
// buatan dibuat (FR-G3, SDD 10), batas waktu, dan kredit foto. Istilah teknis (nama dataset, skrip, WebAPI, seed) ada di
// <details> "Untuk juri dan pengembang" di akhir.
// C: perbarui baris "Menyusul" saat data BPS dan dataset pengaduan DKI sudah dimuat.

import type { Metadata } from 'next';
import Image from 'next/image';
import KepalaHalaman from '@/components/KepalaHalaman';
import Ikon, { type NamaIkon } from '@/components/ui/Ikon';
import { FOTO, KATEGORI } from '@/lib/konten';

export const metadata: Metadata = {
  title: 'Sumber data',
  description: 'Data mana yang asli dan mana yang buatan di SUARAKYAT, dari mana asalnya, dan lisensinya.',
};

const RINGKAS: { judul: string; ikon: NamaIkon; isi: string; warna: string }[] = [
  {
    judul: 'Yang asli',
    ikon: 'centang',
    isi: 'Batas 42 kecamatan dan peta Jakarta, dari sumber data terbuka (BPS lewat HDX, dan OpenStreetMap). Angka Musrenbang di Beranda juga dikutip dari sumber nyata.',
    warna: 'bg-hijau-muda text-hijau',
  },
  {
    judul: 'Yang buatan',
    ikon: 'info',
    isi: 'Laporan, dinas, rapor, dan untuk sementara angka penduduk serta kemiskinan. Skor prioritas dihitung dari keduanya, jadi ikut berstatus buatan.',
    warna: 'bg-oranye-muda text-st-menunggu',
  },
  {
    judul: 'Kenapa dibuat',
    ikon: 'bantuan',
    isi: 'Untuk memperagakan cara kerja lapor, rapor, dan urutan prioritas tanpa memakai laporan warga atau kinerja dinas sungguhan.',
    warna: 'bg-biru-muda text-biru-tua',
  },
];

const DATA_TERBUKA = [
  {
    nama: 'Batas kecamatan DKI Jakarta',
    dipakai: 'Peta kecamatan yang diwarnai menurut skor, dan menentukan kecamatan dari titik laporan',
    sumber: 'HDX, data batas wilayah Indonesia dari BPS, dipotong ke 42 kecamatan Jakarta daratan',
    lisensi: 'CC BY-IGO',
    url: 'https://data.humdata.org/dataset/cod-ab-idn',
    status: 'Dipakai',
  },
  {
    nama: 'Peta dasar',
    dipakai: 'Gambar peta di Peta laporan, formulir lapor, dan halaman laporan',
    sumber: 'OpenStreetMap contributors',
    lisensi: 'ODbL',
    url: 'https://www.openstreetmap.org/copyright',
    status: 'Dipakai',
  },
  {
    nama: 'Penduduk dan luas kecamatan',
    dipakai: 'Banyaknya laporan, dukungan warga, dan kepadatan penduduk (dibanding jumlah warga)',
    sumber: 'BPS, buku "Dalam Angka" tingkat kota dan kecamatan (tahun terbaru yang tersedia)',
    lisensi: 'Ketentuan penggunaan data BPS',
    url: 'https://jakarta.bps.go.id',
    status: 'Menyusul',
  },
  {
    nama: 'Persen penduduk miskin per kota',
    dipakai: 'Warga kurang mampu (satu angka per kota, ditulis terbuka di penjelasan skor)',
    sumber: 'BPS, tabel di bps.go.id',
    lisensi: 'Ketentuan penggunaan data BPS',
    url: 'https://www.bps.go.id',
    status: 'Menyusul',
  },
  {
    nama: 'Pengaduan masyarakat DKI Jakarta',
    dipakai: 'Calon sumber urutan prioritas, kalau datanya punya kolom wilayah, jenis masalah, dan tanggal',
    sumber: 'Portal Satu Data Indonesia (katalog.data.go.id), sistem pengaduan Pemprov DKI',
    lisensi: 'Sesuai katalog',
    url: 'https://katalog.data.go.id',
    status: 'Sedang dicek',
  },
  {
    nama: 'Angka e-Musrenbang di Beranda',
    dipakai: '18.221 usulan (2019), 254 dikerjakan; 61.174 usulan untuk rencana pembangunan 2027',
    sumber: 'Jurnal Universitas Diponegoro tentang e-Musrenbang DKI; Metro TV, April 2026',
    lisensi: 'Kutipan dengan sumber',
    url: null,
    status: 'Dipakai',
  },
];

/** Label status dalam bahasa sehari-hari; kuncinya tetap supaya C mudah memperbarui. */
const LABEL_STATUS_DATA: Record<string, string> = {
  Dipakai: 'Sudah dipakai',
  Menyusul: 'Belum dipakai, sementara buatan',
  'Sedang dicek': 'Sedang dicek',
};

const PROFIL = [
  { instansi: 'Dinas Bina Jalan', tolak: '5%', respons: '90%', selesai: '80%', rating: '4,2', peran: 'Contoh dinas yang baik' },
  { instansi: 'Dinas Kebersihan', tolak: '10%', respons: '84%', selesai: '63%', rating: '3,8', peran: 'Mendekati contoh hitungan di Cara rapor dihitung' },
  { instansi: 'Dinas Tata Air', tolak: '6%', respons: '50%', selesai: '35%', rating: '2,8', peran: 'Nilai D (kurang), sering terlambat' },
  {
    instansi: 'Dinas Penerangan Jalan',
    tolak: '32%',
    respons: '95%',
    selesai: '90%',
    rating: '4,5',
    peran: 'Angkanya setara A, tetapi nilai paling tinggi C karena terlalu banyak menolak',
  },
];

const warnaStatus: Record<string, string> = {
  Dipakai: 'bg-st-selesai-bg text-st-selesai',
  Menyusul: 'bg-st-menunggu-bg text-st-menunggu',
  'Sedang dicek': 'bg-st-diverifikasi-bg text-st-diverifikasi',
};

/** 24 jam ditulis jam; 48 jam ke atas yang pas harian ditulis hari. */
const waktu = (jam: number) => (jam % 24 === 0 && jam >= 48 ? `${jam / 24} hari` : `${jam} jam`);

const kelasTag = 'inline-block rounded-[0.375rem] px-2 py-0.5 text-kecil font-bold whitespace-nowrap';
const kelasKepalaTabel = 'bg-latar text-kecil text-lembut';

export default function SumberDataPage() {
  return (
    <div className="bingkai pt-6 pb-4 sm:pt-8">
      <KepalaHalaman judul="Sumber data">
        Mana data yang asli, mana yang dibuat tim, dan dari mana asalnya. Setiap halaman memberi label &ldquo;Data
        buatan&rdquo; pada angka yang dibuat tim.
      </KepalaHalaman>

      {/* Ringkasan 3 poin dalam bahasa sehari-hari: cukup dibaca ini saja. */}
      <section aria-labelledby="judul-ringkas" className="mt-6">
        <h2 id="judul-ringkas" className="sr-only">
          Ringkasan
        </h2>
        <ul className="grid gap-3 md:grid-cols-3">
          {RINGKAS.map((r) => (
            <li key={r.judul} className="kartu flex gap-3 p-5">
              <span className={`flex size-10 shrink-0 items-center justify-center rounded-full ${r.warna}`}>
                <Ikon nama={r.ikon} className="size-5" />
              </span>
              <div>
                <h3 className="text-lead font-bold">{r.judul}</h3>
                <p className="mt-1 text-badan text-lembut">{r.isi}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <nav aria-label="Isi halaman" className="mt-6 flex flex-wrap gap-2">
        <a href="#terbuka" className="chip">Data yang dipakai</a>
        <a href="#simulasi" className="chip">Cara data buatan dibuat</a>
        <a href="#batas-waktu" className="chip">Batas waktu</a>
        <a href="#foto" className="chip">Kredit foto</a>
        <a href="#teknis" className="chip">Untuk juri dan pengembang</a>
      </nav>

      <section id="terbuka" aria-labelledby="judul-terbuka" className="mt-10 scroll-mt-24">
        <h2 id="judul-terbuka" className="judul-seksi">
          Data yang dipakai
        </h2>
        <ul className="mt-4 grid gap-3 sm:hidden">
          {DATA_TERBUKA.map((d) => (
            <li key={d.nama} className="kartu grid gap-2 p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="font-bold">{d.nama}</p>
                <span className={`${kelasTag} ${warnaStatus[d.status]}`}>{LABEL_STATUS_DATA[d.status]}</span>
              </div>
              <p className="text-kecil text-lembut">Dipakai untuk: {d.dipakai}</p>
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
                <th scope="col" className="px-4 py-3 font-semibold">Data</th>
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
                    <span className={`${kelasTag} ${warnaStatus[d.status]}`}>{LABEL_STATUS_DATA[d.status]}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 max-w-[80ch] text-kecil text-lembut">
          Selama data BPS belum dimuat, angka penduduk, luas, dan persen warga miskin adalah angka buatan.
        </p>
      </section>

      <section id="simulasi" aria-labelledby="judul-simulasi" className="mt-12 scroll-mt-24">
        <h2 id="judul-simulasi" className="judul-seksi">
          Cara data buatan dibuat
        </h2>
        <div className="mt-2 grid max-w-[80ch] gap-3 text-badan text-lembut">
          <p>
            Laporan, status, dukungan, dan nilai bintang dibuat program komputer dengan aturan tetap, jadi hasilnya selalu
            sama tiap diulang. Isinya 800 sampai 1.000 laporan dalam enam bulan terakhir. Titiknya disebar acak di dalam
            kecamatan, lebih banyak di kecamatan yang penduduknya lebih banyak.
          </p>
          <p>
            Nama dinas sengaja dibuat umum dan diberi tanda buatan, supaya tidak dikira kinerja dinas sungguhan. Rapor dinas
            tidak pernah memakai data nyata. Setiap dinas diberi watak kinerja berikut, dan nilai bintangnya dibuat sejalan
            dengan ketepatan waktu.
          </p>
        </div>
        <ul className="mt-5 grid gap-3 sm:hidden">
          {PROFIL.map((p) => (
            <li key={p.instansi} className="kartu p-4">
              <p className="font-bold">{p.instansi} (buatan)</p>
              <p className="text-kecil text-lembut">{p.peran}</p>
              <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-kecil">
                {[
                  ['Peluang ditolak', p.tolak],
                  ['Ditanggapi tepat waktu', p.respons],
                  ['Selesai tepat waktu', p.selesai],
                  ['Bintang rata-rata', p.rating],
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
                <th scope="col" className="px-4 py-3 font-semibold">Dinas (buatan)</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Peluang ditolak</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Ditanggapi tepat waktu</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Selesai tepat waktu</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Bintang rata-rata</th>
                <th scope="col" className="px-4 py-3 font-semibold">Perannya di contoh</th>
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
          Batas waktu tiap jenis masalah
        </h2>
        <p className="mt-2 max-w-[80ch] text-badan text-lembut">
          Dihitung 24 jam sehari, termasuk hari libur. Batas waktu ini contoh buatan tim, bukan aturan resmi pemerintah.
        </p>
        <ul className="mt-5 grid gap-3 sm:hidden">
          {KATEGORI.map((k) => (
            <li key={k.id} className="kartu grid gap-2 p-4">
              <div>
                <p className="font-bold">{k.nama}</p>
                <p className="text-kecil text-lembut">
                  {k.instansi.replace(' (simulasi)', ' (buatan)')} · {k.urgensi === 'Tinggi' ? 'paling mendesak' : 'agak mendesak'}
                </p>
              </div>
              <dl className="angka grid grid-cols-2 gap-3 text-kecil">
                <div>
                  <dt className="text-lembut">Harus ditanggapi dalam</dt>
                  <dd className="font-bold">{waktu(k.respons)}</dd>
                </div>
                <div>
                  <dt className="text-lembut">Harus selesai dalam</dt>
                  <dd className="font-bold">{waktu(k.selesai)}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
        <div className="kartu relative mt-5 hidden overflow-x-auto sm:block">
          <table className="w-full min-w-[40rem] text-left text-badan">
            <thead className={kelasKepalaTabel}>
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Jenis masalah</th>
                <th scope="col" className="px-4 py-3 font-semibold">Dinas (buatan)</th>
                <th scope="col" className="px-4 py-3 font-semibold">Seberapa mendesak</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Harus ditanggapi dalam</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Harus selesai dalam</th>
              </tr>
            </thead>
            <tbody>
              {KATEGORI.map((k) => (
                <tr key={k.id} className="border-t border-garis transition-colors hover:bg-biru-pudar">
                  <th scope="row" className="p-4 font-bold">{k.nama}</th>
                  <td className="p-4 text-kecil text-lembut">{k.instansi.replace(' (simulasi)', '')}</td>
                  <td className="p-4">
                    <span className={`${kelasTag} ${k.urgensi === 'Tinggi' ? 'bg-merah-muda text-merah-tua' : 'bg-oranye-muda text-st-menunggu'}`}>
                      {k.urgensi === 'Tinggi' ? 'Paling mendesak' : 'Agak mendesak'}
                    </span>
                  </td>
                  <td className="angka p-4 text-right">{waktu(k.respons)}</td>
                  <td className="angka p-4 text-right">{waktu(k.selesai)}</td>
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
          Foto di Beranda menunjukkan masalah kota Jakarta dan diambil dari koleksi terbuka. Foto-foto ini bukan foto
          laporan di SUARAKYAT.
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

      {/* Istilah teknis untuk juri dan pengembang: tertutup sampai dibuka. */}
      <details id="teknis" className="kartu group mt-12 scroll-mt-24">
        <summary className="flex min-h-14 list-none items-center justify-between gap-4 px-5 py-4 text-lead font-bold transition-colors hover:text-biru-tua sm:px-6 [&::-webkit-details-marker]:hidden">
          Untuk juri dan pengembang
          <Ikon nama="turun" className="size-5 text-lembut transition-transform duration-300 group-open:rotate-180" />
        </summary>
        <div className="turun-panel grid max-w-[80ch] gap-3 px-5 pb-6 text-kecil text-lembut sm:px-6">
          <p>
            <strong className="text-teks">Batas wilayah.</strong> HDX Indonesia Subnational Administrative Boundaries
            (COD-AB), dipotong ke 42 kecamatan DKI daratan dan disederhanakan dengan <code>scripts/01_wilayah.py</code>.
            Dipakai untuk choropleth prioritas dan penentuan kecamatan dari titik laporan (point-in-polygon).
          </p>
          <p>
            <strong className="text-teks">Peta dasar.</strong> Ubin peta (tile) OpenStreetMap lewat Leaflet.
          </p>
          <p>
            <strong className="text-teks">Data BPS.</strong> Persen penduduk miskin diambil dari WebAPI atau tabel
            bps.go.id. Data wilayah digabung memakai kode wilayah, bukan nama, dan salinan lokal setiap dataset disimpan di
            repositori (folder <code>data/</code>) karena portal bisa berubah.
          </p>
          <p>
            <strong className="text-teks">Data buatan.</strong> Dibuat generator dengan random seed tetap; titik diambil acak
            di dalam poligon kecamatan sebanding jumlah penduduk. Reset data selalu menghasilkan angka yang sama, jadi angka
            di video dan proposal konsisten. Dinas bertanda &ldquo;(simulasi)&rdquo; di basis data.
          </p>
        </div>
      </details>
    </div>
  );
}
