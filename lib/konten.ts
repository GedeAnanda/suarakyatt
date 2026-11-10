// lib/konten.ts — teks dan data statis yang dipakai di beberapa halaman (pemilik: A)

import type { AlasanTolak, AlasanTunda, Faktor, StatusLaporan } from './types';

export const KOTA = ['Jakarta Pusat', 'Jakarta Utara', 'Jakarta Barat', 'Jakarta Selatan', 'Jakarta Timur'] as const;

/** Kategori dan SLA (PRD 7.2). Angka SLA adalah ilustrasi dan dinyatakan terbuka. */
export const KATEGORI = [
  { id: 1, nama: 'Jalan rusak', instansi: 'Dinas Bina Jalan (simulasi)', urgensi: 'Tinggi', respons: 24, selesai: 120 },
  { id: 2, nama: 'Saluran tersumbat', instansi: 'Dinas Tata Air (simulasi)', urgensi: 'Tinggi', respons: 24, selesai: 96 },
  { id: 3, nama: 'Sampah menumpuk', instansi: 'Dinas Kebersihan (simulasi)', urgensi: 'Sedang', respons: 24, selesai: 72 },
  { id: 4, nama: 'Lampu jalan mati', instansi: 'Dinas Penerangan Jalan (simulasi)', urgensi: 'Sedang', respons: 48, selesai: 168 },
] as const;

export const STATUS_AKTIF: StatusLaporan[] = ['menunggu', 'diverifikasi', 'diproses'];

/** Status yang tampil di peta publik (tanpa Dibatalkan). Di sini, bukan di komponen 'use client', supaya halaman server bisa memakainya. */
export const STATUS_PUBLIK: StatusLaporan[] = ['menunggu', 'diverifikasi', 'diproses', 'selesai', 'ditolak'];

export const LABEL_ALASAN: Record<AlasanTolak, string> = {
  duplikat: 'Duplikat',
  tidak_valid: 'Tidak valid',
  konten_melanggar: 'Konten melanggar',
};

/** Alasan tunda dari instansi (migrasi 0010). Label untuk publik, keterangan untuk form admin. */
export const LABEL_TUNDA: Record<AlasanTunda, string> = {
  antre_jadwal: 'Antre jadwal petugas',
  menunggu_anggaran: 'Menunggu anggaran',
  menunggu_material: 'Menunggu material',
  koordinasi_instansi: 'Perlu koordinasi instansi lain',
  cuaca: 'Terkendala cuaca',
  lainnya: 'Alasan lain',
};

export const KETERANGAN_TUNDA: Record<AlasanTunda, string> = {
  antre_jadwal: 'Tim lapangan atau alat sedang dipakai di lokasi lain yang didahulukan.',
  menunggu_anggaran: 'Perbaikan lebih besar dari pemeliharaan rutin dan perlu anggaran tersendiri.',
  menunggu_material: 'Material, suku cadang, atau lampu pengganti belum tersedia.',
  koordinasi_instansi: 'Lokasi atau asetnya milik instansi lain (misalnya PLN atau dinas lain).',
  cuaca: 'Hujan atau debit air membuat pekerjaan belum bisa dilakukan dengan aman.',
  lainnya: 'Alasan lain. Wajib dijelaskan di catatan.',
};

/**
 * Nama 6 hal yang dinilai, satu set untuk SEMUA halaman (audit bahasa awam 10 Nov, D12): Prioritas, Kecamatan, Beranda,
 * panel "Kenapa belum?". Potongan kalimatnya (LABEL_FAKTOR, PENAHAN_FAKTOR) ada di lib/scoring.
 */
export const NAMA_FAKTOR: Record<Faktor, string> = {
  urgensi: 'Mendesaknya masalah',
  volume: 'Banyaknya laporan',
  dukungan: 'Dukungan warga',
  umur: 'Lama menunggu',
  kerentanan: 'Warga kurang mampu',
  kepadatan: 'Kepadatan penduduk',
};

/** Penjelasan satu-dua kalimat tiap hal, untuk popover Istilah. Tanpa rumus. */
export const DEFINISI_FAKTOR: Record<Faktor, string> = {
  urgensi:
    'Ditentukan oleh jenis masalah, bukan pilihan pelapor. Jalan rusak dan saluran tersumbat paling mendesak (poin penuh); sampah dan lampu mati agak mendesak (60% poin).',
  volume:
    'Jumlah laporan yang sudah diperiksa dinas, dibanding jumlah warga kecamatan (per 10.000 orang), supaya kecamatan kecil dan besar adil.',
  dukungan:
    'Jumlah warga yang menekan Dukung, dibanding jumlah warga. Paling banyak 10 dukungan per laporan dihitung, supaya satu laporan viral tidak menguasai urutan.',
  umur: 'Sudah berapa lama laporan menunggu dibanding batas waktu selesainya. Poin penuh kalau sudah menunggu 2 kali batas waktu.',
  kerentanan:
    'Persen warga miskin di kota itu. Data per kecamatan belum ada, jadi semua kecamatan dalam satu kota mendapat angka yang sama.',
  kepadatan: 'Banyaknya orang per km². Makin padat, makin banyak orang yang terdampak.',
};

/** Angka asli tiap hal, untuk "4,5% warga miskin → 15 poin". */
export const SATUAN_FAKTOR: Record<Faktor, (x: number) => string> = {
  urgensi: (x) => (x >= 1 ? 'sangat mendesak' : x >= 0.6 ? 'agak mendesak' : 'kurang mendesak'),
  volume: (x) => `${x.toLocaleString('id-ID', { maximumFractionDigits: 2 })} laporan per 10.000 warga`,
  dukungan: (x) => `${x.toLocaleString('id-ID', { maximumFractionDigits: 2 })} dukungan per 10.000 warga`,
  umur: (x) => `sudah menunggu ${x.toLocaleString('id-ID', { maximumFractionDigits: 1 })} kali batas waktu`,
  kerentanan: (x) => `${x.toLocaleString('id-ID', { maximumFractionDigits: 1 })}% warga miskin`,
  kepadatan: (x) => `${Math.round(x).toLocaleString('id-ID')} orang per km²`,
};

/** Kanal pengaduan resmi (FR-B1). */
export const KANAL_RESMI = [
  { nama: 'JAKI', url: 'https://jaki.jakarta.go.id' },
  { nama: 'LAPOR!', url: 'https://www.lapor.go.id' },
];

/** Foto dunia nyata dari koleksi terbuka. Tidak pernah dipakai sebagai foto laporan. */
export const FOTO = {
  jalan1975: {
    src: '/foto/jalan-jakarta-1975.jpg',
    lebar: 1920,
    tinggi: 1315,
    alt: 'Jalan di Jakarta pada 1975: mobil, sepeda motor, dan gerobak berbagi satu jalan di depan deretan rumah beratap genteng.',
    judul: '1975-7-24 Jakarta - Traffic hour',
    pembuat: 'Guus Gorter',
    lisensi: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/w/index.php?curid=113048315',
  },
  banjirBatavia: {
    src: '/foto/banjir-batavia-kitlv.jpg',
    lebar: 1920,
    tinggi: 1442,
    alt: 'Banjir di sebuah jalan Batavia awal abad ke-20: warga dan kereta kuda melintasi air setinggi betis.',
    judul: 'Chinese kamp tijdens een overstroming (bandjir) te Batavia, KITLV 81333',
    pembuat: 'Tidak diketahui (koleksi KITLV)',
    lisensi: 'CC BY 4.0',
    url: 'https://commons.wikimedia.org/w/index.php?curid=103683427',
  },
  kanalTimur: {
    src: '/foto/banjir-kanal-timur-2024.jpg',
    lebar: 1920,
    tinggi: 3413,
    alt: 'Banjir Kanal Timur ruas Cipinang Muara pada Juni 2024, air tenang di antara tanggul berumput.',
    judul: 'Jakarta East Flood Canal, Cipinang Muara Section, June 2024',
    pembuat: 'Irvan Ary Maulana',
    lisensi: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/w/index.php?curid=149996433',
  },
  ciliwung: {
    src: '/foto/kali-ciliwung-2015.jpg',
    lebar: 1920,
    tinggi: 1064,
    alt: 'Kali Ciliwung di tengah kota pada 2015, sampah plastik mengapung di air cokelat di antara tanggul beton.',
    judul: 'Jakarta Indonesia Ciliwung-River-01',
    pembuat: 'CEphoto, Uwe Aranas',
    lisensi: 'CC BY-SA 3.0',
    url: 'https://commons.wikimedia.org/wiki/File:Jakarta_Indonesia_Ciliwung-River-01.jpg',
  },
  lampuJalan: {
    src: '/foto/lampu-jalan-jakarta.jpg',
    lebar: 1536,
    tinggi: 2048,
    alt: 'Tiang lampu jalan di Jakarta dengan ornamen ondel-ondel, difoto dari bawah dengan langit berawan.',
    judul: 'Lampu Jalan Jakarta',
    pembuat: 'Rantemario',
    lisensi: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/w/index.php?curid=151891901',
  },
  banjirTanjungDuren: {
    src: '/foto/banjir-tanjung-duren-2020.jpg',
    lebar: 1920,
    tinggi: 2560,
    alt: 'Taman bermain perumahan di Tanjung Duren terendam banjir cokelat pada 1 Januari 2020; ayunan dan papan "Jagalah kebersihan" berdiri di dalam air.',
    judul: 'Banjir Jakarta Perumahan di Tanjung Duren 1 Januari 2020',
    pembuat: 'Cun Cun',
    lisensi: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Banjir_Jakarta_Perumahan_di_Tanjung_Duren_1_Januari_2020.jpg',
  },
  trotoar: {
    src: '/foto/trotoar-jakarta.jpg',
    lebar: 1024,
    tinggi: 576,
    alt: 'Jalan raya di Jakarta dengan bajaj merah, sepeda motor, lampu lalu lintas, dan trotoar di bawah pohon rindang.',
    judul: 'Jakarta sidewalks/walking paths',
    pembuat: 'pfctdayelise',
    lisensi: 'CC BY-SA 2.0',
    url: 'https://www.flickr.com/photos/82397118@N00/8133842211',
  },
} as const;

export type FotoTerbuka = (typeof FOTO)[keyof typeof FOTO];
