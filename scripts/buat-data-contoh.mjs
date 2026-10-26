// scripts/buat-data-contoh.mjs — data contoh frontend (pemilik: A, untuk ditinjau C)
//
// Dipakai halaman Peta, Detail, Beranda, dan Prioritas selama database belum berisi seed C.
// Titik laporan diambil acak DI DALAM poligon kecamatan asli (public/data/kecamatan.geojson),
// profil instansi mengikuti SDD v1.0 bagian 10.2, dan faktor prioritas dihitung dari laporan
// yang sama, sehingga peta, detail, dan dashboard saling cocok.
// Penduduk, luas, dan persen miskin di sini BUKAN angka BPS: semuanya angka contoh.
//
// Jalankan: node scripts/buat-data-contoh.mjs
// Keluaran: lib/mocks/contoh-laporan.json, lib/mocks/contoh-prioritas.json

import { readFileSync, writeFileSync } from 'node:fs';

// Semua waktu ditulis relatif terhadap jangkar ini; lib/data menggesernya ke "sekarang"
// saat dibaca, sama seperti reset seed (SDD 4.4).
const JANGKAR = Date.parse('2026-11-01T00:00:00+07:00');
const JAM = 3600 * 1000;

// mulberry32: PRNG kecil yang deterministik.
function prng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const acak = prng(2026);
const pilih = (xs) => xs[Math.floor(acak() * xs.length)];
const antara = (a, b) => a + acak() * (b - a);

const KATEGORI = [
  { id: 1, nama: 'Jalan rusak', instansi: 'Dinas Bina Jalan (simulasi)', urgensi: 1.0, respons: 24, selesai: 120 },
  { id: 2, nama: 'Saluran tersumbat', instansi: 'Dinas Tata Air (simulasi)', urgensi: 1.0, respons: 24, selesai: 96 },
  { id: 3, nama: 'Sampah menumpuk', instansi: 'Dinas Kebersihan (simulasi)', urgensi: 0.6, respons: 24, selesai: 72 },
  { id: 4, nama: 'Lampu jalan mati', instansi: 'Dinas Penerangan Jalan (simulasi)', urgensi: 0.6, respons: 48, selesai: 168 },
];

// SDD 10.2: peluang ditolak, respons tepat waktu, selesai tepat waktu, rating rata-rata.
// `macet` (tambahan untuk data contoh): peluang laporan berhenti di satu tahap dan tetap aktif.
const PROFIL = {
  1: { tolak: 0.05, respons: 0.9, selesai: 0.8, rating: 4.2, macet: 0.22 },
  2: { tolak: 0.06, respons: 0.5, selesai: 0.35, rating: 2.8, macet: 0.5 },
  3: { tolak: 0.1, respons: 0.84, selesai: 0.63, rating: 3.8, macet: 0.3 },
  4: { tolak: 0.32, respons: 0.95, selesai: 0.9, rating: 4.5, macet: 0.15 },
};

// Angka contoh per kota (bukan BPS).
const MISKIN_KOTA = {
  'Jakarta Utara': 6.4,
  'Jakarta Pusat': 4.5,
  'Jakarta Timur': 4.1,
  'Jakarta Barat': 3.8,
  'Jakarta Selatan': 3.2,
};

const DESKRIPSI = {
  1: [
    'Lubang besar di lajur kiri, motor sering oleng saat malam karena tidak ada penerangan.',
    'Aspal mengelupas sepanjang kira-kira 20 meter, genangan muncul setiap hujan.',
    'Jalan amblas dekat gorong-gorong, sudah dipasangi ban bekas oleh warga sebagai tanda.',
    'Tambalan lama terbuka lagi, kerikil berserakan dan membuat pengendara tergelincir.',
  ],
  2: [
    'Saluran depan rumah tertutup lumpur dan sampah plastik, air meluap ke jalan saat hujan.',
    'Gorong-gorong mampet, genangan setinggi mata kaki bertahan sampai dua hari.',
    'Air got tidak mengalir dan berbau, jentik nyamuk mulai banyak.',
    'Tutup saluran patah dan sampah masuk, aliran ke kali tersumbat.',
  ],
  3: [
    'Tumpukan sampah di pinggir jalan sudah tiga hari belum diangkut, mulai berbau.',
    'Sampah rumah tangga menumpuk di dekat jembatan dan sebagian jatuh ke kali.',
    'Bak sampah RT penuh dan meluber ke trotoar.',
    'Sampah bekas pasar menumpuk di sudut jalan setiap pagi.',
  ],
  4: [
    'Tiga lampu jalan berturut-turut mati, jalan gelap total setelah magrib.',
    'Lampu jalan berkedip lalu padam sejak seminggu lalu, rawan begal.',
    'Tiang lampu miring dan lampunya mati setelah tertabrak truk.',
    'Lampu penerangan di gang utama mati, warga memakai senter untuk lewat.',
  ],
};

const CATATAN_SELESAI = {
  1: 'Lubang sudah ditambal dan permukaan diratakan.',
  2: 'Saluran sudah dikeruk dan sampah diangkut.',
  3: 'Sampah sudah diangkut dan lokasi dibersihkan.',
  4: 'Lampu sudah diganti dan menyala kembali.',
};

const INISIAL = 'ABDEFGHIJKLMNPRSTUWY';
const ALFABET_KODE = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

// --- Geometri -------------------------------------------------------------

const geo = JSON.parse(readFileSync('public/data/kecamatan.geojson', 'utf8'));

function dalamCincin([x, y], cincin) {
  let dalam = false;
  for (let i = 0, j = cincin.length - 1; i < cincin.length; j = i++) {
    const [xi, yi] = cincin[i];
    const [xj, yj] = cincin[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) dalam = !dalam;
  }
  return dalam;
}
function dalamPoligon(titik, geometri) {
  const poligon = geometri.type === 'Polygon' ? [geometri.coordinates] : geometri.coordinates;
  return poligon.some(([luar, ...lubang]) => dalamCincin(titik, luar) && !lubang.some((l) => dalamCincin(titik, l)));
}
function kotakBatas(geometri) {
  const semua = (geometri.type === 'Polygon' ? [geometri.coordinates] : geometri.coordinates).flat(2);
  const xs = semua.map((p) => p[0]);
  const ys = semua.map((p) => p[1]);
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
}
// Luas kasar dalam km² dari kotak batas × faktor isi; cukup untuk angka contoh.
function luasKasar([x0, y0, x1, y1]) {
  return (x1 - x0) * 110.6 * (y1 - y0) * 110.6 * 0.62;
}

const wilayah = geo.features.map((f, i) => {
  const kotak = kotakBatas(f.geometry);
  const luas = Math.round(luasKasar(kotak) * 10) / 10;
  const kepadatanDasar = { 'Jakarta Pusat': 19000, 'Jakarta Barat': 17000, 'Jakarta Timur': 15000, 'Jakarta Selatan': 14000, 'Jakarta Utara': 12000 }[f.properties.kota];
  const penduduk = Math.round(luas * kepadatanDasar * antara(0.75, 1.3));
  return { id: i + 1, ...f.properties, geometri: f.geometry, kotak, luas, penduduk };
});

function titikAcak(w) {
  const [x0, y0, x1, y1] = w.kotak;
  for (let n = 0; n < 500; n++) {
    const titik = [antara(x0, x1), antara(y0, y1)];
    if (dalamPoligon(titik, w.geometri)) return titik;
  }
  throw new Error(`Gagal mengambil titik di ${w.kecamatan}`);
}

// --- Laporan --------------------------------------------------------------

const kodeTerpakai = new Set();
function kodeBaru() {
  let kode;
  do kode = 'SR-' + Array.from({ length: 6 }, () => pilih(ALFABET_KODE)).join('');
  while (kodeTerpakai.has(kode));
  kodeTerpakai.add(kode);
  return kode;
}

const iso = (ms) => new Date(ms).toISOString();
const JUMLAH = 520;
const totalPenduduk = wilayah.reduce((s, w) => s + w.penduduk, 0);

const laporan = [];
const timeline = [];

for (let n = 0; n < JUMLAH; n++) {
  // Kecamatan dipilih sebanding penduduknya.
  let r = acak() * totalPenduduk;
  const w = wilayah.find((x) => (r -= x.penduduk) <= 0) ?? wilayah.at(-1);
  const k = pilih(KATEGORI);
  const p = PROFIL[k.id];
  const [lng, lat] = titikAcak(w);

  // Umur 0–180 hari, lebih banyak laporan baru.
  const umurJam = Math.round(Math.pow(acak(), 2.1) * 180 * 24) + 2;
  const dibuat = JANGKAR - umurJam * JAM;
  const batasRespons = dibuat + k.respons * JAM;
  const batasSelesai = dibuat + k.selesai * JAM;

  const kode = kodeBaru();
  const tl = [{ kode, status_baru: 'menunggu', alasan_tolak: null, catatan: null, bukti_url: null, pelaku: 'Pelapor', created_at: iso(dibuat) }];
  const admin = `Admin · ${k.instansi}`;

  let status = 'menunggu';
  let respondedAt = null;
  let resolvedAt = null;
  let alasan = null;

  // Respons: tepat waktu sesuai profil; sebagian lewat batas atau belum disentuh.
  const tepatRespons = acak() < p.respons;
  // Tahap tempat laporan macet: 0 = belum direspons, 1 = diverifikasi, 2 = diproses.
  const macetDi = acak() < p.macet ? Math.floor(acak() * 3) : 3;
  const jedaRespons = tepatRespons ? antara(0.5, k.respons * 0.9) : k.respons * antara(1.1, 3);
  if (macetDi > 0 && dibuat + jedaRespons * JAM < JANGKAR) {
    respondedAt = dibuat + jedaRespons * JAM;
    if (acak() < p.tolak) {
      status = 'ditolak';
      alasan = acak() < 0.85 ? 'tidak_valid' : 'duplikat';
      tl.push({
        kode, status_baru: 'ditolak', alasan_tolak: alasan, bukti_url: null, pelaku: admin, created_at: iso(respondedAt),
        catatan: alasan === 'tidak_valid' ? 'Petugas tidak menemukan masalah di titik yang dilaporkan.' : 'Sudah dilaporkan warga lain di lokasi yang sama.',
      });
    } else {
      status = 'diverifikasi';
      tl.push({ kode, status_baru: 'diverifikasi', alasan_tolak: null, catatan: 'Laporan diterima dan dijadwalkan untuk dicek.', bukti_url: null, pelaku: admin, created_at: iso(respondedAt) });
      const mulai = respondedAt + antara(4, 30) * JAM;
      if (macetDi > 1 && mulai < JANGKAR) {
        status = 'diproses';
        tl.push({ kode, status_baru: 'diproses', alasan_tolak: null, catatan: 'Petugas sudah di lokasi.', bukti_url: null, pelaku: admin, created_at: iso(mulai) });
        const tepatSelesai = acak() < p.selesai;
        const jamSelesai = tepatSelesai ? antara(k.selesai * 0.3, k.selesai * 0.95) : k.selesai * antara(1.1, 2.6);
        const selesai = dibuat + jamSelesai * JAM;
        if (macetDi > 2 && selesai < JANGKAR && selesai > mulai) {
          status = 'selesai';
          resolvedAt = selesai;
          tl.push({ kode, status_baru: 'selesai', alasan_tolak: null, catatan: CATATAN_SELESAI[k.id], bukti_url: null, pelaku: admin, created_at: iso(selesai) });
        }
      }
    }
  }

  const upvote = status === 'ditolak' ? Math.floor(acak() * 2) : Math.floor(Math.pow(acak(), 2.2) * 18);
  laporan.push({
    kode,
    category_id: k.id,
    kategori: k.nama,
    instansi: k.instansi,
    region_id: w.id,
    kode_wilayah: w.kode_wilayah,
    kecamatan: w.kecamatan,
    kota: w.kota,
    status,
    lat: Math.round(lat * 1e6) / 1e6,
    lng: Math.round(lng * 1e6) / 1e6,
    deskripsi: pilih(DESKRIPSI[k.id]),
    foto: [],
    foto_bukti: null,
    alasan_tolak: status === 'ditolak' ? alasan : null,
    inisial_pelapor: pilih(INISIAL) + pilih(INISIAL),
    jumlah_upvote: upvote,
    created_at: iso(dibuat),
    responded_at: respondedAt && iso(respondedAt),
    resolved_at: resolvedAt && iso(resolvedAt),
    perkiraan_selesai: null,
    batas_respons: iso(batasRespons),
    batas_selesai: iso(batasSelesai),
    is_simulated: true,
  });
  timeline.push(...tl);
}

// --- Faktor prioritas (bentuk PriorityFactorsResponse) ---------------------

const AKTIF = new Set(['menunggu', 'diverifikasi', 'diproses']);
const isu = new Map();
for (const l of laporan) {
  if (!AKTIF.has(l.status)) continue;
  const w = wilayah.find((x) => x.id === l.region_id);
  const k = KATEGORI.find((x) => x.id === l.category_id);
  const id = `${w.id}-${k.id}`;
  if (!isu.has(id)) isu.set(id, { w, k, aktif: [], terverifikasi: [] });
  const i = isu.get(id);
  i.aktif.push(l);
  if (l.status !== 'menunggu') i.terverifikasi.push(l);
}

const bulat = (x, d = 2) => Math.round(x * 10 ** d) / 10 ** d;
const faktor = [...isu.entries()].map(([id, { w, k, aktif, terverifikasi }]) => ({
  id,
  kode_wilayah: w.kode_wilayah,
  kecamatan: w.kecamatan,
  kota: w.kota,
  category_id: k.id,
  kategori: k.nama,
  laporan_aktif: aktif.length,
  laporan_terverifikasi: terverifikasi.length,
  mentah: {
    urgensi: k.urgensi,
    volume: bulat((terverifikasi.length / w.penduduk) * 10000, 3),
    dukungan: bulat((terverifikasi.reduce((s, l) => s + Math.min(10, l.jumlah_upvote), 0) / w.penduduk) * 10000, 3),
    umur: bulat(aktif.reduce((s, l) => s + Math.min(2, (JANGKAR - Date.parse(l.created_at)) / JAM / k.selesai), 0) / aktif.length),
    kerentanan: MISKIN_KOTA[w.kota],
    kepadatan: Math.round(w.penduduk / w.luas),
  },
}));

writeFileSync(
  'lib/mocks/contoh-laporan.json',
  JSON.stringify({ jangkar: iso(JANGKAR), laporan, timeline }) + '\n',
);
writeFileSync(
  'lib/mocks/contoh-prioritas.json',
  JSON.stringify({ sumber: 'simulasi', waktu_acuan: iso(JANGKAR), isu: faktor }, null, 1) + '\n',
);

const hitung = (s) => laporan.filter((l) => l.status === s).length;
console.log(
  `${laporan.length} laporan (${['menunggu', 'diverifikasi', 'diproses', 'selesai', 'ditolak'].map((s) => `${s} ${hitung(s)}`).join(', ')}), ` +
    `${timeline.length} baris timeline, ${faktor.length} isu wilayah.`,
);
