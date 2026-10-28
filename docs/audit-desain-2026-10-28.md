# Audit desain — 28 Oktober 2026

> Audit tampilan semua halaman publik suaRAkyat dengan ukuran juri Awwwards. Yang diukur adalah build produksi `dev` di commit `cc32dc4`. Laporan ini hanya berisi temuan; belum ada kode yang diubah.

## Ringkasan cepat

- **Belum setara Awwwards.** Skor mentah beranda **7,0 / 10**. Karena masih ada pelanggaran nyata di aturan inspector (bayangan pada elemen diam, kartu berikon, bayangan teks), skornya dibatasi menjadi **6,0**. Situs yang terpilih Site of the Day biasanya mendapat 7,5–8,0 dari juri.
- **Yang sudah kuat dan perlu dipertahankan:**
  - ide "KENAPA BELUM?" yang lolos uji pesaing;
  - simulator "Satu isu, dua urutan" sebagai satu hal yang bisa langsung dicoba;
  - foto arsip berlisensi lengkap dengan kreditnya;
  - huruf rapor yang besar;
  - wordmark selebar halaman di footer;
  - aksesibilitas angka bergulir.
- **Yang paling menahan nilai, diurutkan dari dampak terbesar:**
  1. Layar pertama hanya berisi judul, tanpa kalimat penjelas dan tombol. Di ponsel, hampir dua layar habis untuk dua kata.
  2. Bagian di bawah hero terlihat seperti kit template: kartu berikon, bayangan di 27 aturan CSS, kotak bergaris 1px.
  3. Ada bayangan hitam di semua teks putih di atas merah (218 elemen), dan header kaca berubah jadi pita pink pudar saat berada di atas bidang merah.
  4. Ada 6 foto berlisensi, tapi yang terlihat bersamaan di beranda hanya 2.
  5. Semua halaman aplikasi memakai template kepala yang sama, dan teksnya kecil (12–15 px) serta abu-abu.
- Masalah 1–3 adalah perbaikan dengan dampak terbesar untuk kriteria Desain (20% rubrik WIA). Semuanya ada di wilayah A (Frontend & Desain).

## Cara audit

| | |
|---|---|
| Alat | skill `design-taste-frontend`: `lint.mjs` (pemindai source) dan `inspect.mjs` (Chrome sungguhan, mengukur render dan mengambil screenshot) |
| Lebar layar | 1440, 768, dan 390 px |
| Halaman | `/`, `/peta`, `/lacak`, `/rapor`, `/rapor/cara-menilai`, `/prioritas`, `/sumber-data`, `/masuk`, `/contoh`, `/laporan/SR-ZNC2RQ` |
| Tidak diaudit | `/lapor` (diarahkan ke `/masuk` kalau belum login) dan `/admin/*` (butuh login admin) |
| Penilaian | rubrik juri di skill: desain 40%, kegunaan 30%, kreativitas 20%, konten 10%, lalu batas (cap) kalau ada pelanggaran |

Screenshot disimpan di `.taste-skill/audit/<halaman>/` (folder ini di-gitignore). Cara membuat ulang ada di bagian akhir.

## Skor beranda

```
ROUND 1
Seen in one second: "KENAPA BELUM?" merah raksasa di dua bidang warna.
Idea (one sentence): Pertanyaan warga "Kenapa belum?" menjadi hero yang terbelah dua bidang,
  dan halaman sesudahnya menjawab pertanyaan itu dengan data.
Live thing: "Satu isu, dua urutan" — ganti preset bobot, peringkat isu bergulir dari 22 ke 19.
Layout words by section: hero=tipografi penuh / pengantar=pernyataan + 4 kartu ikon /
  simulator=split angka / arsip=foto selebar layar / Musrenbang=daftar angka /
  peta=split peta (bidang merah) / kategori=daftar + foto / alur=3 kartu /
  demo=kartu merah / lacak=kalimat dengan kolom isian / footer=wordmark
Scores: design 6,5 · usability 7,0 · creativity 7,5 · content 8,0 → overall 7,0
Caps applied: masih ada FAIL nyata di inspector → overall maks 6,0;
  bayangan pada elemen diam terlihat di screenshot → maks 6,5;
  kurang dari 4 foto nyata → design maks 6,5.
Top three problems: lihat masalah 1–3 di bawah.
```

Ide halaman ini lolos uji pesaing: kalimat "Kenapa belum?" tidak akan dipakai JAKI atau LAPOR!, karena merekalah yang ditanya. Masalahnya ada di eksekusi, bukan di konsep.

## Yang sudah kuat

- **Hero tipografi.** Dalam satu detik orang langsung menangkap satu hal. Garis belah merah yang memotong "BELUM?" sudah menjadi identitas.
- **Simulator di beranda.** Ini satu hal yang bisa dicoba pengunjung, memakai data asli, dan bisa dipakai dengan jempol di ponsel.
- **Foto arsip** banjir Batavia (KITLV) dan lalu lintas Jakarta 1975, lengkap dengan kredit dan lisensi.
- **Rapor instansi.** Huruf A–E yang besar, peringatan penolakan yang jelas, dan versi ponselnya rapi.
- **Detail laporan.** Kode laporan besar, peta, foto sebelum dan sesudah (dengan label simulasi dari PR #13), kutipan pelapor, dan timeline.
- **Footer.** Pernyataan, JAKI / LAPOR! dalam ukuran besar, kredit, lalu wordmark selebar halaman sebagai penutup.
- **Aksesibilitas.** `AngkaGulir` mengirim nilai akhir dari server, menyediakan teks `sr-only`, dan kolom digitnya `aria-hidden`.
- **Satu keluarga huruf.** Author untuk semua teks, Satoshi hanya untuk wordmark dan kode laporan.

## Masalah, diurutkan dari dampak terbesar

### 1. Layar pertama tidak menjawab dan tidak mengajak

- **Bukti:** Di desktop 1440×900, layar pertama hanya berisi judul. Kalimat penjelas dan tombol "Uji bobot prioritas" baru muncul di bawah lipatan (`beranda/desktop-fold.jpg`). Di ponsel 390 px, judul berada di tengah layar, dengan sekitar 300 px kosong di atasnya dan sekitar 350 px bidang merah kosong di bawahnya. Kalimat penjelas baru muncul di layar kedua (`beranda/mobile-fold.jpg`).
- **Sebab:** Tinggi hero dikunci `h-[calc(100svh-4rem-1px)]` di `components/beranda/HeroGaris.tsx:52`.
- **Usulan:** Pindahkan kalimat penjelas dan tombol "Uji bobot prioritas" ke bidang merah di layar pertama, tepat di bawah "BELUM?". Di ponsel, tinggi hero mengikuti isinya, bukan `100svh`.

### 2. Bagian di bawah hero terlihat seperti kit template

- **Bukti:** Ada barisan 4 kartu berikon ("Untuk warga", "Untuk perencana", "Untuk pengawas", "Bukan kanal resmi") di `app/page.tsx:~190–230`. Pola ini paling khas halaman buatan AI, dan inspector mencatatnya sebagai `icon-cards`. Selain itu ada 3 kartu bernomor 1-2-3 di "Dari mana datanya" (`app/page.tsx:246`), dan kartu merah "Coba alurnya sendiri" dengan bayangan besar (`app/page.tsx:263`). Lint menemukan **27 `box-shadow`** di `app/globals.css` (antara lain baris 189, 228, 238, 403, 415, 422) dan beberapa kotak bergaris 1px.
- **Usulan:**
  - Ganti 4 kartu dengan daftar berukuran besar tanpa kotak: nama peran sebagai judul baris, satu kalimat di sebelahnya.
  - Hapus bayangan dari elemen yang diam. Bayangan cukup untuk menu, dialog, dan popover.
  - Pisahkan permukaan dengan beda warna latar (`#ffffff` di atas `#f3f3f4`), bukan dengan garis atau bayangan.

### 3. Bayangan teks dan header kaca

- **Bukti:**
  - `app/globals.css:873–896` memberi `text-shadow` hitam 70% ke semua teks terang di atas merah, sebanyak 218 elemen. Teks putih di atas `#7d0c14` sudah punya kontras sekitar 10,9:1, jadi bayangan itu tidak diperlukan. Bayangan itu malah membuat huruf terlihat buram dan murah, paling jelas di "BELUM?" pada hero.
  - `components/Header.tsx:79` memakai `bg-kertas/75` dengan `backdrop-blur-md`. Di atas bidang merah dan footer, header berubah menjadi pita pink pudar (terlihat di hampir semua screenshot halaman).
- **Usulan:** Hapus aturan `text-shadow` dan kelas `bayang-judul`. Buat header solid `bg-kertas` tanpa blur.

### 4. Foto ada, tapi tidak dipakai

- **Bukti:** `public/foto/` berisi 6 foto berlisensi. Beranda hanya menampilkan 2 secara bersamaan (inspector: `few-pictures`, design maksimal 6,5). Empat foto di `DaftarMasalah` bergantian di satu slot. Galeri 3 foto (Batavia, Ciliwung, lampu jalan) sudah dihapus di commit `987e1e0`.
- **Usulan:** Kembalikan satu pita foto besar, misalnya Kanal Timur 2024 atau Ciliwung, di antara bagian Musrenbang dan peta. Tidak perlu mencari foto baru.

### 5. Ruang kosong yang tidak disengaja

- **Bukti:** Di beranda ada pita kosong antara daftar kategori dan "Dari mana datanya" (`beranda/desktop-page-02.jpg`). Di akhir halaman Rapor, Prioritas, dan Detail laporan juga ada area kosong sebelum footer.
- **Usulan:** Rapatkan jarak antarbagian. Ruang kosong yang disengaja cukup satu per halaman.

### 6. Terlalu banyak ukuran huruf, dan teks aplikasi terlalu kecil

- **Bukti:** Beranda memakai 11 ukuran huruf (15–440 px), padahal batas wajarnya sekitar 5. Di halaman aplikasi, teks badan berukuran 14,4–15 px, dan banyak label 12–13 px berwarna abu-abu (inspector: `body-size`, `small-text`).
- **Usulan:** Teks badan 16–18 px di semua halaman. Metadata minimal 14 px, memakai warna tinta penuh, bukan abu-abu.

### 7. Semua halaman aplikasi memakai kepala yang sama

- **Bukti:** Prioritas, Rapor, Peta, dan Sumber Data punya susunan yang sama persis: judul di kiri, paragraf di kanan, chip "Data simulasi", lalu spanduk pink "Data simulasi". Label simulasinya jadi muncul dua kali dan mendorong isi utama ke bawah. Prioritas juga punya 3 kartu langkah bernomor (`app/prioritas/page.tsx:86`) yang mengulang isi paragraf.
- **Usulan:**
  - Sisakan satu label simulasi. PRD mewajibkan banner yang tidak bisa ditutup di peta, rapor, dan dashboard, jadi gabungkan info periode ke dalam banner itu dan hapus chip-nya.
  - Hapus kartu langkah di Prioritas, dan berikan ruangnya untuk peta.

### 8. Detail kecil

- **Label di atas angka.** Label kecil "Bobot resmi" dan "Utamakan keselamatan" di atas angka 22 dan 19 tercatat sebagai `eyebrow`. Sebagai label data, keduanya boleh dipertahankan, tapi naikkan ukurannya ke ukuran badan.
- **Tombol.** Tombol yang punya bayangan atau glow (`button-fx` di Rapor) dibuat rata.
- **Garis tipis.** Ada 12 `border-t` di `app/rapor/cara-menilai/page.tsx` dan `app/sumber-data/page.tsx`. Garis di tabel sungguhan boleh dipertahankan; garis yang hanya berfungsi sebagai pemisah sebaiknya dihapus.

## Bukan masalah (temuan inspector yang salah sasaran)

| Temuan | Kenapa diabaikan |
|---|---|
| `headline-lines` 10–18 baris di beranda | Inspector membaca kolom digit 0–9 milik `AngkaGulir` sebagai teks. Pembaca layar hanya membaca teks `sr-only`. |
| Angka "000 / 00%" di screenshot tablet | Animasi menahan angka di 0 sampai bagiannya terlihat di layar. Server tetap mengirim angka asli (876, 71%, 214). |
| `side-scroll` di Rapor, Sumber Data, Cara Menilai | Yang bergeser ke samping adalah tabel sungguhan di layar sempit. Ini boleh. |
| `font-fallback` Lucida Console | Berasal dari CSS bawaan Leaflet, hanya di halaman yang memuat peta. Kode kita tidak memakai monospace. |
| `still-page` di Lacak, Masuk, Prioritas | Halaman aplikasi memang wajar bergerak sedikit. |

## Hasil inspector per halaman

| Halaman | FAIL | WARN | Temuan utama |
|---|---|---|---|
| Beranda | 9 | 5 | bayangan, bayangan teks, kartu ikon, kotak garis 1px, foto sedikit, 11 ukuran huruf |
| Prioritas | 5 | 3 | bayangan, bayangan teks, kotak garis 1px, tanpa foto |
| Rapor | 9 | 3 | bayangan, kartu ikon (ringkasan A–D), teks badan 15 px, tombol berbayangan |
| Detail laporan | 7 | 7 | bayangan, bayangan teks, teks badan 15 px, teks di bawah 13 px |
| Peta | 4 | 5 | bayangan, teks badan 15 px, teks di bawah 13 px |
| Sumber data | 5 | 4 | bayangan, garis tipis, kotak garis 1px |
| Cara menilai | 7 | 4 | garis tipis, judul berupa rumus 15 kata, tanpa foto |
| Lacak | 7 | 3 | kartu ikon, bayangan, tanpa foto |
| Masuk | 4 | 4 | bayangan, teks badan 15 px |
| Contoh | 8 | 6 | bayangan, teks badan 15 px, label di atas judul |

Semua angka FAIL di atas sudah termasuk temuan yang salah sasaran. Lint source: 39 FAIL (27 bayangan, 12 garis tipis) dan 5 WARN (4 kotak garis 1px, 1 blur).

## Urutan kerja yang disarankan

1. Kerjakan masalah 1–3 dulu: hero, kartu dan bayangan, bayangan teks dan header.
2. Jalankan ulang inspector dan nilai ulang screenshot-nya. Maksimal tiga putaran.
3. Lanjutkan ke masalah 4–7.

Semua perbaikan ada di wilayah A. B cukup mereview PR-nya.

## Cara mengulang audit

```bash
npm run build && npx next start -p 3100
SK=~/.claude/skills/design-taste-frontend
node $SK/scripts/lint.mjs app components
node $SK/scripts/inspect.mjs http://localhost:3100/ --out .taste-skill/audit/beranda
# ulangi inspect.mjs untuk halaman lain dengan --out .taste-skill/audit/<nama>
```
