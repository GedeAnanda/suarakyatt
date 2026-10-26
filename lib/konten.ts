// lib/konten.ts — teks dan data statis yang dipakai di beberapa halaman (pemilik: A)

import type { AlasanTolak, Faktor, StatusLaporan } from './types';

export const KOTA = ['Jakarta Pusat', 'Jakarta Utara', 'Jakarta Barat', 'Jakarta Selatan', 'Jakarta Timur'] as const;

/** Kategori dan SLA (PRD 7.2). Angka SLA adalah ilustrasi dan dinyatakan terbuka. */
export const KATEGORI = [
  { id: 1, nama: 'Jalan rusak', instansi: 'Dinas Bina Jalan (simulasi)', urgensi: 'Tinggi', respons: 24, selesai: 120 },
  { id: 2, nama: 'Saluran tersumbat', instansi: 'Dinas Tata Air (simulasi)', urgensi: 'Tinggi', respons: 24, selesai: 96 },
  { id: 3, nama: 'Sampah menumpuk', instansi: 'Dinas Kebersihan (simulasi)', urgensi: 'Sedang', respons: 24, selesai: 72 },
  { id: 4, nama: 'Lampu jalan mati', instansi: 'Dinas Penerangan Jalan (simulasi)', urgensi: 'Sedang', respons: 48, selesai: 168 },
] as const;

export const STATUS_AKTIF: StatusLaporan[] = ['menunggu', 'diverifikasi', 'diproses'];

export const LABEL_ALASAN: Record<AlasanTolak, string> = {
  duplikat: 'Duplikat',
  tidak_valid: 'Tidak valid',
  konten_melanggar: 'Konten melanggar',
};

/** Nama faktor untuk judul dan slider (huruf kapital di awal); LABEL_FAKTOR di lib/scoring untuk kalimat. */
export const NAMA_FAKTOR: Record<Faktor, string> = {
  urgensi: 'Urgensi kategori',
  volume: 'Volume laporan',
  dukungan: 'Dukungan warga',
  umur: 'Umur laporan',
  kerentanan: 'Kerentanan wilayah',
  kepadatan: 'Kepadatan penduduk',
};

export const DEFINISI_FAKTOR: Record<Faktor, string> = {
  urgensi: 'Ditentukan dari kategori, bukan dipilih warga: tinggi 1,0, sedang 0,6, rendah 0,3.',
  volume: 'Laporan aktif yang sudah diverifikasi admin, per 10.000 penduduk kecamatan.',
  dukungan: 'Upvote pada laporan aktif terverifikasi, maksimal 10 dihitung per laporan, per 10.000 penduduk.',
  umur: 'Rata-rata umur laporan aktif dibanding batas waktu selesainya, dibatasi maksimal 2 kali.',
  kerentanan: 'Persentase penduduk miskin di kota administrasi. Semua kecamatan dalam satu kota bernilai sama.',
  kepadatan: 'Jumlah penduduk dibagi luas kecamatan (jiwa per km²).',
};

/** Satuan nilai mentah, untuk "kemiskinan 4,5% → 15 poin". */
export const SATUAN_FAKTOR: Record<Faktor, (x: number) => string> = {
  urgensi: (x) => (x >= 1 ? 'tinggi' : x >= 0.6 ? 'sedang' : 'rendah'),
  volume: (x) => `${x.toLocaleString('id-ID', { maximumFractionDigits: 2 })} per 10 rb jiwa`,
  dukungan: (x) => `${x.toLocaleString('id-ID', { maximumFractionDigits: 2 })} per 10 rb jiwa`,
  umur: (x) => `${x.toLocaleString('id-ID', { maximumFractionDigits: 2 })}× batas waktu`,
  kerentanan: (x) => `${x.toLocaleString('id-ID', { maximumFractionDigits: 1 })}% miskin`,
  kepadatan: (x) => `${Math.round(x).toLocaleString('id-ID')} jiwa/km²`,
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
