// app/sumber-data/page.tsx — Sumber Data (SDD 9), pemilik: A (isi dari C)
// Daftar dataset, sumber, tahun, lisensi, dan skenario data simulasi (FR-G3, SDD 10).
// C: atribusi foto seed bersumber dari data/processed/foto_seed.csv; perbarui FOTO_SEED bila berkas itu berubah.

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
    sumber: 'HDX, Indonesia – Subnational Administrative Boundaries (COD-AB, sumber BPS), v01, berlaku 1 April 2020. Dipotong ke 42 kecamatan DKI daratan; Kepulauan Seribu dan Danau Sunter tidak dipakai. Peta di browser disederhanakan (toleransi 15 m)',
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
    dipakai: 'Faktor volume, dukungan warga, dan kepadatan penduduk (penduduk ÷ luas, dihitung sendiri)',
    sumber: 'BPS Kota Jakarta Selatan, Timur, Pusat, Barat, dan Utara, "Dalam Angka 2026": Tabel 3.1.1 (penduduk, data Dukcapil) dan Tabel 1.1.1 (luas). Total 42 kecamatan, 10,96 juta jiwa',
    lisensi: 'Ketentuan penggunaan data BPS (non-komersial, wajib menyebut sumber)',
    url: 'https://jakarta.bps.go.id',
    status: 'Dipakai',
  },
  {
    nama: 'Persentase penduduk miskin per kota administrasi',
    dipakai: 'Faktor kerentanan wilayah, level kota',
    sumber: 'BPS Provinsi DKI Jakarta, Tabel 13.10, Maret 2025: Jakarta Selatan 3,23%; Jakarta Timur 3,94%; Jakarta Pusat 4,70%; Jakarta Barat 3,91%; Jakarta Utara 6,33%',
    lisensi: 'Ketentuan penggunaan data BPS (non-komersial, wajib menyebut sumber)',
    url: 'https://jakarta.bps.go.id',
    status: 'Dipakai',
  },
  {
    nama: 'Pengaduan masyarakat DKI Jakarta (CRM)',
    dipakai: 'Dicek sebagai sumber dashboard prioritas; tidak dipakai',
    sumber: 'katalog.data.go.id "Cepat Respon Masyarakat (CRM)" 2025 hanya berisi rekap per kategori tanpa wilayah dan tanggal; data.jakarta.go.id per laporan hanya mencakup Jakarta Barat dan Jakarta Pusat 2019–2021. Dashboard prioritas memakai laporan simulasi',
    lisensi: 'Sesuai katalog',
    url: 'https://katalog.data.go.id',
    status: 'Tidak dipakai',
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
  { instansi: 'Dinas Bina Jalan', tolak: '5%', respons: '90%', selesai: '80%', rating: '4,2', peran: 'Contoh dinas yang baik (rapor A)' },
  { instansi: 'Dinas Kebersihan', tolak: '8%', respons: '84%', selesai: '63%', rating: '3,8', peran: 'Mendekati contoh hitungan di Cara Menilai (rapor B)' },
  { instansi: 'Dinas Tata Air', tolak: '6%', respons: '50%', selesai: '35%', rating: '2,8', peran: 'Sering terlambat (rapor D)' },
  { instansi: 'Dinas Penerangan Jalan', tolak: '36%', respons: '95%', selesai: '90%', rating: '4,5', peran: 'Angka setara A, huruf ditahan C karena penolakan tinggi' },
];

// Foto pada laporan simulasi dan bukti penyelesaiannya (Wikimedia Commons). Lisensi CC wajib diatribusikan.
const FOTO_SEED = [
  { kategori: 'Jalan rusak', jenis: 'laporan', judul: 'Pothole on Huntington Creek Road', pembuat: 'Jakec', lisensi: 'CC BY-SA 4.0', urlLisensi: 'https://creativecommons.org/licenses/by-sa/4.0', url: 'https://commons.wikimedia.org/wiki/File:Pothole_on_Huntington_Creek_Road.JPG' },
  { kategori: 'Jalan rusak', jenis: 'laporan', judul: 'A Road filled with potholes', pembuat: 'Adakaibe', lisensi: 'CC BY-SA 4.0', urlLisensi: 'https://creativecommons.org/licenses/by-sa/4.0', url: 'https://commons.wikimedia.org/wiki/File:A_Road_filled_with_potholes.jpg' },
  { kategori: 'Jalan rusak', jenis: 'laporan', judul: 'A mud filled pothole on a road in Lagos, Nigeria', pembuat: 'Àìná - TheSymbyat', lisensi: 'CC BY-SA 4.0', urlLisensi: 'https://creativecommons.org/licenses/by-sa/4.0', url: 'https://commons.wikimedia.org/wiki/File:A_mud_filled_pothole_on_a_road_in_Lagos,_Nigeria.jpg' },
  { kategori: 'Jalan rusak', jenis: 'laporan', judul: 'Ubud-Jalan Raya-Pothole-2009', pembuat: 'Jack Merridew', lisensi: 'Domain publik', urlLisensi: null, url: 'https://commons.wikimedia.org/wiki/File:Ubud-Jalan_Raya-Pothole-2009.jpeg' },
  { kategori: 'Jalan rusak', jenis: 'bukti', judul: 'Asphalt paving', pembuat: 'Sammya Nig Ltd', lisensi: 'CC BY-SA 4.0', urlLisensi: 'https://creativecommons.org/licenses/by-sa/4.0', url: 'https://commons.wikimedia.org/wiki/File:Asphalt_paving.jpg' },
  { kategori: 'Jalan rusak', jenis: 'bukti', judul: 'Asphalt base', pembuat: 'Estr4ng3d', lisensi: 'CC BY-SA 3.0', urlLisensi: 'https://creativecommons.org/licenses/by-sa/3.0', url: 'https://commons.wikimedia.org/wiki/File:Asphalt_base.jpg' },
  { kategori: 'Saluran tersumbat', jenis: 'laporan', judul: 'Vegetation clogged drain - geograph.org.uk - 7006184', pembuat: 'N Chadwick', lisensi: 'CC BY-SA 2.0', urlLisensi: 'https://creativecommons.org/licenses/by-sa/2.0', url: 'https://commons.wikimedia.org/wiki/File:Vegetation_clogged_drain_-_geograph.org.uk_-_7006184.jpg' },
  { kategori: 'Saluran tersumbat', jenis: 'laporan', judul: 'Drain clogged with bulrushes - geograph.org.uk - 6246355', pembuat: 'Jonathan Thacker', lisensi: 'CC BY-SA 2.0', urlLisensi: 'https://creativecommons.org/licenses/by-sa/2.0', url: 'https://commons.wikimedia.org/wiki/File:Drain_clogged_with_bulrushes_-_geograph.org.uk_-_6246355.jpg' },
  { kategori: 'Saluran tersumbat', jenis: 'laporan', judul: 'Clogged drains - geograph.org.uk - 4703773', pembuat: 'Jonathan Thacker', lisensi: 'CC BY-SA 2.0', urlLisensi: 'https://creativecommons.org/licenses/by-sa/2.0', url: 'https://commons.wikimedia.org/wiki/File:Clogged_drains_-_geograph.org.uk_-_4703773.jpg' },
  { kategori: 'Saluran tersumbat', jenis: 'laporan', judul: 'Handyman heavy duty drain cleaning machine', pembuat: 'Tomwsulcer', lisensi: 'Domain publik', urlLisensi: null, url: 'https://commons.wikimedia.org/wiki/File:Handyman_heavy_duty_drain_cleaning_machine.jpg' },
  { kategori: 'Saluran tersumbat', jenis: 'bukti', judul: 'Drainage channel with concrete banks', pembuat: 'EST blueprint', lisensi: 'CC BY-SA 4.0', urlLisensi: 'https://creativecommons.org/licenses/by-sa/4.0', url: 'https://commons.wikimedia.org/wiki/File:Drainage_channel_with_concrete_banks.jpg' },
  { kategori: 'Saluran tersumbat', jenis: 'bukti', judul: 'Seawall and drainage channel - geograph.org.uk - 350030', pembuat: 'Deb Turnbull', lisensi: 'CC BY-SA 2.0', urlLisensi: 'https://creativecommons.org/licenses/by-sa/2.0', url: 'https://commons.wikimedia.org/wiki/File:Seawall_and_drainage_channel_-_geograph.org.uk_-_350030.jpg' },
  { kategori: 'Sampah menumpuk', jenis: 'laporan', judul: 'Jakarta slumhome 2', pembuat: 'Jonathan McIntosh', lisensi: 'CC BY 2.0', urlLisensi: 'https://creativecommons.org/licenses/by/2.0', url: 'https://commons.wikimedia.org/wiki/File:Jakarta_slumhome_2.jpg' },
  { kategori: 'Sampah menumpuk', jenis: 'laporan', judul: 'Bangau di Teluk jakarta', pembuat: 'Arie Basuki', lisensi: 'CC BY-SA 4.0', urlLisensi: 'https://creativecommons.org/licenses/by-sa/4.0', url: 'https://commons.wikimedia.org/wiki/File:Bangau_di_Teluk_jakarta.jpg' },
  { kategori: 'Sampah menumpuk', jenis: 'laporan', judul: 'Bangau di Teluk Jakarta', pembuat: 'Arie Basuki', lisensi: 'CC BY-SA 4.0', urlLisensi: 'https://creativecommons.org/licenses/by-sa/4.0', url: 'https://commons.wikimedia.org/wiki/File:Bangau_di_Teluk_Jakarta.jpg' },
  { kategori: 'Sampah menumpuk', jenis: 'laporan', judul: 'Garbage, Suara Indonesia 22 Jan 1954 p1', pembuat: 'Tanpa nama', lisensi: 'Domain publik', urlLisensi: null, url: 'https://commons.wikimedia.org/wiki/File:Garbage_Suara_Indonesia_22_Jan_1954_p1.jpg' },
  { kategori: 'Sampah menumpuk', jenis: 'bukti', judul: 'Annual cleaning of sidewalks Quebec City', pembuat: 'Marc-Lautenbacher', lisensi: 'CC BY-SA 4.0', urlLisensi: 'https://creativecommons.org/licenses/by-sa/4.0', url: 'https://commons.wikimedia.org/wiki/File:Annual_cleaning_of_sidewalks_Quebec_City.jpg' },
  { kategori: 'Sampah menumpuk', jenis: 'bukti', judul: 'At least there is money for a clean sidewalk...as fares are due to increase (1409420646)', pembuat: 'Jax House', lisensi: 'CC BY-SA 2.0', urlLisensi: 'https://creativecommons.org/licenses/by-sa/2.0', url: 'https://commons.wikimedia.org/wiki/File:At_least_there_is_money_for_a_clean_sidewalk...as_fares_are_due_to_increase_(1409420646).jpg' },
  { kategori: 'Lampu jalan mati', jenis: 'laporan', judul: '2013 Street lamp', pembuat: 'Kreuzschnabel', lisensi: 'CC BY-SA 3.0', urlLisensi: 'https://creativecommons.org/licenses/by-sa/3.0', url: 'https://commons.wikimedia.org/wiki/File:2013_Street_lamp.jpg' },
  { kategori: 'Lampu jalan mati', jenis: 'laporan', judul: 'Niasviž Light Pole 2023-07-02 6080', pembuat: 'Mike1979 Russia', lisensi: 'CC BY-SA 3.0', urlLisensi: 'https://creativecommons.org/licenses/by-sa/3.0', url: 'https://commons.wikimedia.org/wiki/File:Niasvi%C5%BE_Light_Pole_2023-07-02_6080.jpg' },
  { kategori: 'Lampu jalan mati', jenis: 'laporan', judul: 'Lamp Post Incorporating Former Hand Pump', pembuat: 'Jwslubbock', lisensi: 'CC BY-SA 4.0', urlLisensi: 'https://creativecommons.org/licenses/by-sa/4.0', url: 'https://commons.wikimedia.org/wiki/File:Lamp_Post_Incorporating_Former_Hand_Pump.jpg' },
  { kategori: 'Lampu jalan mati', jenis: 'laporan', judul: 'Dülmen, Hausdülmen, Straßenschild -- 2014 -- 3178', pembuat: 'Dietmar Rabich', lisensi: 'CC BY-SA 4.0', urlLisensi: 'https://creativecommons.org/licenses/by-sa/4.0', url: 'https://commons.wikimedia.org/wiki/File:D%C3%BClmen,_Hausd%C3%BClmen,_Stra%C3%9Fenschild_--_2014_--_3178.jpg' },
  { kategori: 'Lampu jalan mati', jenis: 'bukti', judul: 'Esztergom by night 01 - Simor János utca', pembuat: 'Pudelek', lisensi: 'CC BY-SA 4.0', urlLisensi: 'https://creativecommons.org/licenses/by-sa/4.0', url: 'https://commons.wikimedia.org/wiki/File:Esztergom_by_night_01_-_Simor_J%C3%A1nos_utca.jpg' },
  { kategori: 'Lampu jalan mati', jenis: 'bukti', judul: 'Albert Bridge at night, London, UK', pembuat: 'Diliff', lisensi: 'CC BY-SA 3.0', urlLisensi: 'https://creativecommons.org/licenses/by-sa/3.0', url: 'https://commons.wikimedia.org/wiki/File:Albert_Bridge_at_night,_London,_UK_-_Diliff.jpg' },
];

const warnaStatus: Record<string, string> = {
  Dipakai: 'bg-st-selesai-bg text-st-selesai',
  'Tidak dipakai': 'bg-lapis-2 text-teks',
};

export default function SumberDataPage() {
  return (
    <div className="bingkai pt-12 pb-24 sm:pt-16">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12" data-awal>
        <h1 className="text-judul lg:col-span-6">Sumber data</h1>
        <p className="max-w-[60ch] text-badan lg:col-span-6">
          Data nyata dipakai untuk wilayah dan statistik yang didukung sumber; data simulasi hanya untuk memperagakan
          mekanisme lapor, rapor, dan prioritas. Keduanya tidak pernah dicampur dalam satu angka, dan setiap halaman
          menandai sumber angkanya.
        </p>
      </div>

      <section aria-labelledby="judul-terbuka" className="mt-16" data-muncul>
        <h2 id="judul-terbuka" className="text-lead font-medium tracking-tight">
          Data terbuka
        </h2>
        <ul className="mt-5 grid gap-3 sm:hidden" data-muncul>
          {DATA_TERBUKA.map((d) => (
            <li key={d.nama} className="kartu grid gap-2 p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="font-semibold">{d.nama}</p>
                <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-kecil font-semibold ${warnaStatus[d.status]}`}>{d.status}</span>
              </div>
              <p className="text-kecil text-lembut">{d.dipakai}</p>
              <p className="text-kecil">
                {d.url ? (
                  <a href={d.url} target="_blank" rel="noreferrer" className="underline underline-offset-4">
                    {d.sumber}
                  </a>
                ) : (
                  d.sumber
                )}{' '}
                · <span className="font-medium">{d.lisensi}</span>
              </p>
            </li>
          ))}
        </ul>
        <div className="kartu tabel-masuk relative mt-5 hidden overflow-x-auto sm:block">
          <table className="w-full min-w-[56rem] text-left text-badan">
            <thead className="bg-terang text-kecil">
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
                <tr key={d.nama} className="border-t border-batas align-top transition-colors hover:bg-terang">
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
                  <td className="min-w-[10rem] p-4 text-kecil">{d.lisensi}</td>
                  <td className="p-4">
                    <span className={`rounded-full px-2.5 py-0.5 text-kecil font-semibold whitespace-nowrap ${warnaStatus[d.status]}`}>{d.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 grid max-w-[75ch] gap-3 text-kecil text-lembut">
          <p>
            Data wilayah digabung memakai kode wilayah BPS (mis. 31.71.010), bukan nama, dan salinan lokal setiap dataset
            disimpan di repositori (folder data/) karena portal bisa berubah. Luas memakai angka tabel BPS; untuk tiga
            kecamatan (Sawah Besar, Taman Sari, Penjaringan) angka ini berbeda lebih dari 10% dari luas poligon peta.
          </p>
          <p>
            <strong className="font-semibold text-teks">Kerentanan dihitung per kota, bukan per kecamatan.</strong> BPS
            tidak menerbitkan persentase penduduk miskin per kecamatan, jadi semua kecamatan dalam satu kota administrasi
            mendapat angka yang sama. Faktor ini hanya membedakan kecamatan antarkota, tidak di dalam satu kota.
          </p>
        </div>
      </section>

      <section id="simulasi" aria-labelledby="judul-simulasi" className="mt-24 scroll-mt-6" data-muncul>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <h2 id="judul-simulasi" className="text-judul lg:col-span-6">
            Skenario simulasi
          </h2>
          <div className="grid gap-4 text-badan lg:col-span-6">
            <p>
              Laporan, status, dukungan, dan rating dibuat oleh generator (scripts/05_seed.py) dengan random seed tetap
              2026: 900 laporan dari 40 akun warga simulasi, tersebar dalam 180 hari sebelum titik acuan dengan porsi lebih
              besar di 60 hari terakhir. Kecamatan dipilih sebanding jumlah penduduk dan titiknya diambil acak di dalam
              poligon kecamatan. Proporsi kategori: jalan rusak 35%, sampah 30%, saluran 20%, lampu jalan 15%. Hasilnya
              3.011 riwayat status, 2.167 dukungan, dan 338 rating; sekitar seperempat laporan masih aktif. Reset data
              menggeser semua waktu ke hari ini, jadi angka di video dan proposal tetap sama.
            </p>
            <p>
              Nama instansi sengaja generik dan bertanda simulasi supaya tidak terbaca sebagai kinerja dinas sungguhan. Rapor
              Instansi tidak pernah memakai data nyata. Setiap instansi diberi profil kinerja berikut, dan rating dibuat
              berkorelasi dengan ketepatan waktu penyelesaian.
            </p>
          </div>
        </div>
        <ul className="mt-10 grid gap-3 sm:hidden" data-muncul>
          {PROFIL.map((p) => (
            <li key={p.instansi} className="kartu p-4">
              <p className="font-semibold">{p.instansi} (simulasi)</p>
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
                    <dd className="angka text-badan font-semibold">{nilai}</dd>
                  </div>
                ))}
              </dl>
            </li>
          ))}
        </ul>
        <div className="kartu tabel-masuk relative mt-10 hidden overflow-x-auto sm:block">
          <table className="w-full min-w-[48rem] text-left text-badan">
            <thead className="bg-terang text-kecil">
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
                <tr key={p.instansi} className="border-t border-batas transition-colors hover:bg-terang">
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
        <ul className="mt-5 grid gap-3 sm:hidden" data-muncul>
          {KATEGORI.map((k) => (
            <li key={k.id} className="kartu flex items-start justify-between gap-4 p-4">
              <div>
                <p className="font-semibold">{k.nama}</p>
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
        <div className="kartu tabel-masuk relative mt-5 hidden overflow-x-auto sm:block">
          <table className="w-full min-w-[40rem] text-left text-badan">
            <thead className="bg-terang text-kecil">
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
                <tr key={k.id} className="border-t border-batas transition-colors hover:bg-terang">
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
        <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" data-muncul>
          {Object.values(FOTO).map((f) => (
            <li key={f.src}>
              <Image src={f.src} alt={f.alt} width={f.lebar} height={f.tinggi} sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw" className="aspect-[3/2] w-full rounded-(--radius-kartu) object-cover grayscale" />
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

      <section id="foto-simulasi" aria-labelledby="judul-foto-simulasi" className="mt-24 scroll-mt-6" data-muncul>
        <h2 id="judul-foto-simulasi" className="text-judul">
          Foto laporan simulasi
        </h2>
        <p className="mt-4 max-w-[70ch] text-badan">
          Foto pada laporan simulasi dan bukti penyelesaiannya diambil dari Wikimedia Commons, bukan foto dari Jakarta pada
          tanggal laporan. Semua foto diperkecil untuk aplikasi; isinya tidak diubah. Foto berlisensi CC BY-SA tetap
          berlisensi sama.
        </p>
        <div className="mt-10 grid grid-cols-1 gap-x-10 gap-y-12 lg:grid-cols-2">
          {KATEGORI.map((k) => (
            <div key={k.id}>
              <h3 className="text-lead font-medium tracking-tight">{k.nama}</h3>
              <ul className="mt-4 grid text-kecil">
                {FOTO_SEED.filter((f) => f.kategori === k.nama).map((f) => (
                  <li key={f.url} className="grid gap-1 border-t border-batas py-3 sm:grid-cols-[7.5rem_1fr] sm:gap-4">
                    <span className="font-medium text-lembut">{f.jenis === 'bukti' ? 'Bukti selesai' : 'Laporan'}</span>
                    <p>
                      &ldquo;{f.judul}&rdquo; · {f.pembuat} ·{' '}
                      {f.urlLisensi ? (
                        <a href={f.urlLisensi} target="_blank" rel="noreferrer" className="whitespace-nowrap underline underline-offset-4">
                          {f.lisensi}
                        </a>
                      ) : (
                        <span className="whitespace-nowrap">{f.lisensi}</span>
                      )}{' '}
                      ·{' '}
                      <a href={f.url} target="_blank" rel="noreferrer" className="underline underline-offset-4">
                        Wikimedia Commons
                      </a>{' '}
                      · diperkecil
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
