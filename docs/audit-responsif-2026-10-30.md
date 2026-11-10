# Audit responsif — 30 Oktober 2026

> Audit tampilan di semua ukuran layar, dari ponsel 320 px sampai monitor 1920 px, di branch `feat-ui-2` (commit `2852a61`). Audit desain visual ada di [audit-desain-2026-10-28.md](audit-desain-2026-10-28.md), audit alur di [audit-alur-ux-2026-10-30.md](audit-alur-ux-2026-10-30.md). Di sini yang diperiksa: apakah setiap halaman muat, terbaca, dan enak dipakai di setiap lebar layar.
>
> **Status:** 7 temuan sudah diperbaiki di working tree dan belum di-commit. Sesudah perbaikan, tidak ada lagi halaman yang lebih lebar dari layar di 12 ukuran yang diuji. `tsc`, lint, tes, dan build lulus.

## Ringkasan cepat

- **Sebelum perbaikan, semua 14 halaman melebar ke samping di ponsel 320 dan 360 px.** Penyebabnya satu: isi header (menu, wordmark, ikon Lacak, "Lapor", tombol Masuk) 16–18 px lebih lebar dari layar. Tombol Masuk terpotong di tepi kanan, dan halaman bisa digeser menyamping. Di 375 px (iPhone SE/mini) tidak melebar, tapi tombol Masuk menempel di tepi layar tanpa jarak.
  - Audit alur sebelumnya hanya memeriksa 390 dan 1440 px, jadi masalah ini tidak tertangkap. Tautan "Lapor" di header HP (perbaikan B2, commit `0872b07`) yang menambah lebar itu.
- **6 masalah tata letak lain sudah diperbaiki:**
  - panah carousel Beranda menimpa judul spanduk di semua lebar;
  - nama instansi di ringkasan `/rapor` keluar dari kartunya di 320–360 px;
  - rentang nilai di skala huruf `/rapor/cara-menilai` keluar dari kotaknya di 320–360 px;
  - nama kecamatan di daftar peringkat `/prioritas` terpotong jadi 94 px di layar 1024 px ("Kelapa Ga…"), dengan kolom kosong 60 px di sebelahnya;
  - di `/peta` HP, chip saring tersusun 9 baris, sehingga peta baru terlihat sesudah menggulir ±1 layar;
  - label "Sampah menumpuk" di grafik batas waktu Beranda terpotong 3 px di semua lebar.
- **Yang sudah sehat:** tidak ada console error di 168 kombinasi halaman × ukuran (kecuali 404 yang memang disengaja). Laci menu HP, mode landscape (667×375), safe-area iPhone, tabel lebar (bergulir di dalam kartunya sendiri), dan isian form ≥ 16 px di layar sentuh semuanya berjalan.

## Cara audit

| | |
|---|---|
| Skill | `webapp-testing` (Playwright), `web-design-guidelines` (aturan Vercel Web Interface Guidelines: safe area, scrollbar horizontal, `min-w-0`, `touch-action`, target sentuh) |
| Alat | `next dev` di port 3000, `playwright-core` 1.64 di scratchpad sesi (bukan dependensi proyek), Chromium headless |
| Ukuran layar | 320×568, 360×800, 375×667, 390×844, 430×932, 667×375 (HP miring), 768×1024, 820×1180, 1024×768 (sentuh), 1280×800, 1440×900, 1920×1080 |
| Halaman | `/`, `/peta`, `/lacak`, `/laporan/[kode]`, `/rapor`, `/rapor/cara-menilai`, `/prioritas`, `/sumber-data`, `/contoh`, `/masuk`, 404, `/lapor` (warga demo), `/admin/laporan` dan detailnya (admin demo) |
| Diukur otomatis | lebar dokumen vs layar, elemen yang keluar dari layar, teks yang keluar dari kotaknya sendiri, teks < 12 px, target sentuh < 24 px dan < 44 px, console error |
| Dilihat manual | tangkapan layar per layar (reduced motion, supaya animasi gulir tidak menyembunyikan isi) di 320, 390, 768, 1024, 1440 px; laci menu terbuka; HP miring |
| Data | hanya login demo dan membaca. Tidak ada laporan, dukungan, atau perubahan status yang dikirim |
| Tidak diuji | HP fisik (iOS Safari, Android Chrome), zoom browser 200%, ukuran huruf sistem yang diperbesar |

## Temuan dan perbaikan

| # | Temuan | Bukti | Perbaikan | File |
|---|---|---|---|---|
| R1 | Header lebih lebar dari layar di < 375 px, semua halaman. Tombol Masuk (atau avatar akun) terpotong, dan halaman bisa digeser menyamping. | `scrollWidth` 338 di layar 320, 376 di layar 360. Di 375 px pas 375, tanpa jarak kanan. | Di bawah 390 px: wordmark 18 px (dari 21), jarak antarbutir 4 px, padding tautan ikon 8 px, dan padding tombol Masuk 12 px. Di ≥ 390 px tidak berubah. | `components/Header.tsx` |
| R2 | Panah kiri/kanan carousel Beranda ada di tengah kartu, padahal teks kartu (±127 px) mengisi hampir seluruh kartu 16:9 (160–213 px). Panah menimpa judul di semua lebar, dan di 320 px menimpa kalimatnya. | Diukur di 9 lebar: kotak panah beririsan dengan teks di semua lebar. | Panah dipindah ke baris titik di bawah carousel (titik di kiri, panah di kanan). Di ujung deret panahnya nonaktif, tidak hilang, jadi barisnya tidak bergeser. Kartu memakai tinggi tetap 208 px. `min-height` tidak digabung dengan `aspect-ratio`, karena tinggi minimum ikut melebarkan kartu sampai 370 px. | `components/beranda/SpandukGeser.tsx` |
| R3 | Ringkasan `/rapor`: "Kebersihan", "Penerangan Jalan", dan "ditolak 34%" keluar dari kartu di 320 dan 360 px. Kolom teksnya hanya 52–72 px. | `scrollWidth` 73 > 52, 78 > 72 | Di bawah 375 px huruf rapor ditumpuk di atas nama instansi. | `app/rapor/page.tsx` |
| R4 | Skala huruf `/rapor/cara-menilai`: "40–54" dan "di bawah 40" keluar dari kotaknya di 320 dan 360 px. | 29 > 25, 38 > 25 | Padding kiri-kanan kotak di HP 6 px (dari 12). Di 320 px "70–84" kini turun baris, tapi tidak keluar kotak. | `app/rapor/cara-menilai/page.tsx` |
| R5 | Daftar peringkat `/prioritas` di 1024 px: kolom nama hanya 94 px, jadi semua nama terpotong. Di sebelahnya ada kolom tanda geser 48 px yang kosong. Penyebabnya: breakpoint `sm:` mengikuti lebar layar, padahal kolom daftarnya hanya ±555 px (sebelahan dengan panel bobot), dan batang mengambil 224 px lebih dulu. | Tangkapan layar 1024 px | Breakpoint baris diganti container query `@xl` (≥ 36rem lebar kolom). Di bawahnya, batang turun ke baris kedua seperti di HP. Nama dan batang berbagi ruang 3:2 (`minmax(0,3fr) minmax(0,2fr)`). Kolom tanda geser hanya diberi lebar saat bobot disimulasikan. Di HP nama boleh turun baris, tidak lagi dipotong "JakU…". | `components/prioritas/Simulator.tsx` |
| R6 | `/peta` di HP: 4 chip kategori dan 5 chip status tersusun 9 baris (±500 px), jadi peta baru muncul di layar kedua. | Tangkapan layar 320 dan 390 px | Di bawah 640 px tiap deret chip digeser menyamping, sampai tepi kartu, dan chip berikutnya terlihat terpotong sebagai petunjuk. Tinggi bar saring turun dari ±520 px menjadi 195 px. Di 390×844 peta kini mulai di y = 676, jadi sudah terlihat di layar pertama. Di 320×568 peta mulai di y = 795. Deretnya `relative`, karena tanpa itu teks `sr-only` di dalam chip melebarkan halaman sampai 724 px (tertangkap di audit ulang). `<fieldset>` diberi `min-w-0`. | `components/peta/PetaLaporan.tsx` |
| R7 | Label "Sampah menumpuk" di grafik batas waktu Beranda terpotong ("Sampah menump…") di semua lebar. | 123 > 120 px | Kolom label 9rem (dari 7,5rem). | `components/beranda/DaftarMasalah.tsx` |

## Dicek dan dibiarkan

| Hal | Alasan |
|---|---|
| Tautan remah roti, istilah bergaris titik di `/rapor`, dan kode laporan di tabel admin tingginya 20 px (< 24 px). | Tautan dan tombol inline di dalam teks atau sel tabel, dengan jarak cukup ke target lain. Ini masuk pengecualian *spacing* WCAG 2.5.8. |
| Tautan "Lihat dashboard prioritas" dan sejenisnya di kartu Alur Beranda tingginya 20 px. | Lolos pengecualian jarak. Bisa diberi area klik lebih besar kalau ingin rapi di HP, tapi bukan pelanggaran. |
| Kredit foto spanduk (11 px) dan label JAKI/LAPOR! di deret ikon menu (11 px). | Teks pelengkap. Kredit foto tetap ada lengkap di halaman Sumber data. |
| Nama admin "Admin Demo Bina Jalan" dipotong di header ≥ 768 px. | Disengaja (`max-w-36 truncate`). Nama lengkap ada di menu akun. |
| Tab kotak cari hero terpotong di kanan di HP. | Disengaja. Deret tab digeser menyamping, dan tab yang terpotong jadi petunjuk bahwa deretnya bisa digeser. |
| Angka "00" di tangkapan layar halaman penuh. | Bukan bug. `AngkaGulir` menahan angka di 0 sampai terlihat di layar. Tanpa JavaScript, server sudah merender nilai akhirnya. |
| Tabel `/sumber-data`, rumus `/rapor`, dan tabel admin lebih lebar dari layar HP. | Disengaja. Tabel bergulir di dalam kartunya sendiri, bukan halaman. |

## Hasil sesudah perbaikan

Diulang di 12 ukuran × 14 halaman (168 kombinasi), dengan `tsc`, lint file yang diubah, 19 tes Vitest, dan `next build`. Semuanya lulus.

| Pemeriksaan | Sebelum | Sesudah |
|---|---|---|
| Halaman lebih lebar dari layar | 28 (14 halaman di 320 dan 360 px) | 0 |
| Teks keluar dari kotaknya (bukan `sr-only`, bukan sengaja dipotong) | `/rapor` dan `/rapor/cara-menilai` di 320–360 px, `/prioritas` di 1024 px, label grafik Beranda di semua lebar | 0 |
| Panah carousel menimpa teks | 9 dari 9 lebar | 0 |
| Header: jarak kanan tombol Masuk/avatar di 320–390 px | 0 px atau terpotong | 12 px penuh (tamu, warga, admin) |
| Console error | 0 (selain 404 yang disengaja) | 0 |

Dicek dengan mata di tangkapan layar: header 320 px, carousel 320 dan 1024 px, ringkasan `/rapor` 320 px, skala huruf 320 px, chip `/peta` 320 px, dan daftar peringkat `/prioritas` 360 dan 1024 px.

## Masih perlu ditindaklanjuti

- **A:** buka Beranda, `/peta`, `/rapor`, dan `/prioritas` di iPhone dan Android sungguhan, terutama:
  - geser deret chip `/peta` dengan jari;
  - geser carousel lalu tekan panahnya;
  - header di iPhone SE / mini.
- Uji zoom browser 200% dan ukuran huruf sistem besar. Belum dicakup audit ini.

## Cara mengulang

```bash
npm run dev
# Skrip Playwright audit ini ada di scratchpad sesi, bukan di repo. Ulangi dengan skill webapp-testing:
#   tiap halaman × 12 ukuran: document.scrollWidth vs clientWidth, elemen di luar layar,
#   teks yang scrollWidth > clientWidth, target sentuh < 24 px, console error.
#   Login demo cukup POST /api/demo-login { peran: 'warga' | 'admin' } dari konteks browser.
```
