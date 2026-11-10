# Audit bahasa awam, alur UX, dan data — 10 November 2026

> Audit menyeluruh atas pertanyaan: **apakah warga biasa (lulusan SMA, membuka di HP, tidak paham statistik) bisa memahami SUARAKYAT?** Tema WIA 2026 menuntut masyarakat mudah mengerti, dan mentor FDS meminta visualisasi skor yang langsung dipahami warga awam. Semua bagian A, B, dan C diambil alih dalam satu branch: `feat/bahasa-awam` (dari `dev`, tanpa upstream).
>
> **Status 10 Nov (malam):**
>
> - Putaran 1 (bahasa) sudah di-merge ke `dev` lewat PR #23. Migrasi `0011` sudah diterapkan ke Supabase. Rinciannya di [Hasil](#hasil).
> - Putaran 2 (aksesibilitas, huruf besar, kit uji warga) ada di `feat/ramah-semua`, commit `c57ce14`.
> - Putaran 3 (LCP) ada di branch yang sama dan belum di-commit. Rinciannya di [Putaran 3](#putaran-3-lcp-dan-lebar-halaman-di-hp-10-november-malam).

## Ringkasan cepat

- **135 temuan bahasa dan UI** dari 3 audit paralel:
  - Beranda dan halaman umum (B1–B45);
  - alur warga: lapor, lacak, peta (W1–W45);
  - halaman data dan admin: Prioritas, Kecamatan, Rapor, admin (D1–D45).
- Ada temuan **data** (X1–X3) dan **alur di HP** (U1–U3).
- **1 bug sungguhan (W1):** laporan berstatus **Selesai** di daftar peta tampil "Terlambat N hari", karena data titik tidak membawa `resolved_at`.
- **Masalah data terbesar (X1):** 210 dari 221 laporan yang sedang ditangani tampil terlambat, median ±50 hari dan paling lama 176 hari. Akibatnya aplikasi terkesan rusak, dan faktor "lama menunggu" mentok di batas atas untuk hampir semua masalah. Sudah diperbaiki lewat migrasi `0011`.
- **Lima pola masalah yang paling sering muncul:**
  1. Istilah teknis tanpa penjelasan: isu wilayah, bobot, preset, faktor, SLA, median, sampel, R/S/P/K.
  2. Satu konsep punya banyak nama: satu faktor punya 4 nama; "simulasi" dipakai untuk data lomba sekaligus percobaan bobot; instansi/dinas/admin.
  3. Alat dan rumus muncul sebelum jawaban: di HP, panel bobot ada sebelum daftar urutan, dan rumus rapor ada sebelum kartu dinas.
  4. Warga dibuat menunggu dinas yang tidak ada: "sampai dinas merespons" dan hitung mundur batas waktu, padahal laporan tidak dikirim ke dinas.
  5. Angka tanpa konteks: "0,84", "peringkat 12 dari 91", "22,1" tanpa "dari 100", poin tanpa batas maksimal.

## Kamus baku

Dipakai di semua teks yang terlihat warga. Sumber kodenya ada di `lib/kamus.ts`, `lib/konten.ts` (`NAMA_FAKTOR`, `DEFINISI_FAKTOR`), dan `lib/scoring` (`LABEL_FAKTOR`, `PENAHAN_FAKTOR`).

| Konsep | Dulu (campur) | Sekarang |
|---|---|---|
| sapaan | Anda / kamu | **kamu** |
| satu kiriman warga | laporan | **laporan** |
| laporan sejenis di satu kecamatan | isu, isu wilayah, masalah | **masalah** ("jalan rusak di Setiabudi") |
| lembaga | instansi, dinas, admin, petugas | **dinas** ("Rapor dinas") |
| posisi | peringkat, posisi, urutan, #4 | **urutan ke-4 dari 91** (1 = paling didahulukan) |
| status | Diverifikasi, Diproses | **Sudah diperiksa**, **Sedang dikerjakan** (enum database tetap) |
| faktor | faktor (4 nama berbeda per faktor) | **6 hal yang dinilai**: Mendesaknya masalah · Banyaknya laporan · Dukungan warga · Lama menunggu · Warga kurang mampu · Kepadatan penduduk |
| bobot | bobot, preset, bobot acuan/resmi, mode simulasi | **seberapa penting**, **pilihan cepat**, **aturan resmi**, **percobaanmu** |
| statistik | median, sampel, normalisasi, min-max | **nilai tengah**, **laporan yang dinilai**, "dibanding masalah lain di Jakarta" |
| rapor | R / S / P / K, huruf ditahan C | **Cepat menanggapi · Selesai tepat waktu · Banyak yang diselesaikan · Warga puas**; "nilai paling tinggi C karena terlalu banyak menolak"; A Sangat baik … E Buruk |
| batas waktu | SLA, batas respons, batas selesai | **batas waktu ditanggapi**, **batas waktu selesai** |
| label data | data simulasi, data contoh, prototipe | **Data buatan** + satu kalimat yang selalu terlihat |
| saluran resmi | kanal pengaduan resmi, CRM | **aplikasi pengaduan resmi (JAKI, LAPOR!)** |

## Temuan data (X) dan alur HP (U)

| ID | Temuan | Perbaikan | Status |
|---|---|---|---|
| X1 | 210/221 laporan aktif terlambat, median ±50 hari, maks 176 hari; faktor umur mentok di 2× untuk hampir semua isu | Migrasi `0011_umur_laporan_aktif.sql`: umur laporan aktif simulasi dibuat ulang per profil dinas (terlambat 25% / 75% / 50% / 25%), tanpa mengubah lama respons atau urutan riwayat. Hasil: 140/221 terlambat, maks 8,3 hari (Tata Air), 2,1 hari (Sampah), < 1 hari untuk dua dinas lain. Huruf rapor tetap A / D / B / C(A). Faktor umur kembali membedakan (median 1,06; yang mentok tinggal 2 isu). Diterapkan ke Supabase. | ✅ |
| X2 | 208 laporan punya "perkiraan selesai" yang lebih awal dari tanggal kendalanya, sehingga muncul "Melewati janji" di mana-mana | Ikut dibuat ulang oleh 0011 → `isi_kendala_simulasi()`; sisa 1 | ✅ |
| X3 | Data contoh JSON (cadangan kalau DB tidak terjangkau): 38/72 terlambat, maks 39,5 hari | Belum diubah; hanya tampil kalau Supabase mati | ⏭️ |
| U1 | Prioritas di HP: panel bobot muncul sebelum daftar urutan | Urutan DOM: hasil dulu, "Coba atur sendiri" sesudahnya | ✅ |
| U2 | Rapor di HP: rumus muncul sebelum kartu dinas pertama | Rumus pindah ke "Cara rapor dihitung"; arti huruf satu baris; ringkasan paling baik / paling perlu diperbaiki | ✅ |
| U3 | Beranda di HP: judul "Kenapa belum?" tanpa penjelasan, aksi utama butuh kode, tab terpotong | Subjudul tetap; tombol "Laporkan masalah" dan "Lacak laporan"; tautan "Cek kecamatanmu" | ✅ |

## Temuan per area

Rincian lengkap tiap temuan (lokasi `file:baris`, teks lama, dan teks baru) tercatat di riwayat audit. Ringkasannya:

### Alur warga (W)

- **W1 (bug):** laporan Selesai di peta tampil terlambat.
- **W2, W3, W19:** "terkirim/dinas merespons" padahal laporan tidak dikirim ke dinas; tidak ada langkah berikutnya.
- **W4, W5, W10–W14:** panel "Kenapa belum?" memakai bahasa model (isu wilayah, pendorong/penahan, poin, bobot).
- **W6, W15, W16:** "batas waktu respons" dan "SLA".
- **W7, W23:** alasan tolak/tunda tanpa arti.
- **W8, W25–W30, W43:** pesan galat yang tidak memberi jalan keluar.
- **W9:** laporan serupa tanpa foto dan tanpa saran "cukup dukung saja".
- **W17, W18, W35–W37:** teks form lapor; tombol "Pakai lokasi saya" tersembunyi di bawah peta.
- **W20–W22, W41:** kotak status.
- **W24:** arti tombol Dukung.
- **W31–W34:** halaman masuk dan lacak.
- **W38:** dinas/instansi/admin campur.
- **W39–W42:** teks timeline dan galeri.
- **W44:** petunjuk peta.
- **W45:** target sentuh kecil; draf terhapus tanpa konfirmasi.
- **Alur C1:** laporan warga sungguhan berstatus Menunggu ikut "Terlambat" padahal tidak ada dinas yang memeriksa.

### Halaman data (D)

- **D1:** "Cara menilai" di halaman Kecamatan menuju rumus rapor, bukan cara urutan dihitung.
- **D2, D3:** kalimat kecamatan/masalah di urutan bawah menyebut alasan yang menaikkan skor (logikanya terbalik).
- **D4–D8, D14, D39–D43:** Rapor (rumus duluan, 0–1, R/S/P/K, "ditahan C", "sampel", "median").
- **D9–D11, D15–D24, D37, D38, D44:** Prioritas (judul "Dashboard", "isu wilayah", preset/normalisasi/acuan, "#4 … acuan 6 ▲2", bar tanpa skala, bug "JakSelatan", petunjuk kursor di HP).
- **D12:** satu faktor punya 4 nama.
- **D13, D29–D36:** Kecamatan (alasan terpotong di HP, label tingkat hanya untuk pembaca layar, "median", "model", dua urutan tanpa keterangan, grafik pucat).
- **D45:** admin (seed, SLA, target sentuh 36 px).

### Beranda dan halaman umum (B)

- **B1, B3–B5, B15, B21:** hero tidak menjelaskan situs; klaim "ikut menentukan prioritas" dan "semua laporan warga di Jakarta"; peringatan bukan kanal resmi ada di bawah tombol.
- **B2, B6, B30–B32:** penanda data buatan tidak konsisten; klaim data nyata vs simulasi saling bertentangan.
- **B7, B26:** angka Musrenbang tanpa konteks; istilah Musrenbang tidak dijelaskan.
- **B8–B13, B20, B27:** blok perbandingan urutan, sorotan kecamatan (rotasi 2,2 detik), nomor 1–10 tanpa judul, 42 nama berderet.
- **B14, B17–B19, B42:** kartu peran dan akun demo ("lapis kedua", "admin demo").
- **B16, B22–B25:** istilah rapor dan batas waktu di Beranda.
- **B33–B38, B41:** Tentang dan Sumber data ditulis untuk juri/pengembang.
- **B39:** nama menu tidak konsisten.
- **B40, B43–B45:** kalimat puitis, empty state buntu, halaman galat, kode contoh palsu.

## Hasil

Dikerjakan 10 Nov dengan pembagian file yang tidak saling tumpang tindih:

- pustaka bersama, alur warga, Kecamatan, pesan galat, dan admin dikerjakan sendiri;
- Rapor dinas, Urutan prioritas, dan Beranda/halaman umum dikerjakan 3 subagent.

Pemeriksaan sesudahnya:

- `tsc`, `eslint`, 48 tes Vitest, `next build`, dan `npm run test:db` (12/12) lulus.
- 14 halaman dicek di build produksi lokal (375 px): tidak ada galat, tidak ada geser ke samping, dan tidak ada sisa "isu", "Anda", "diverifikasi", "median", atau "data simulasi" di teks yang tampil.

### Per area

| Area | Status | Inti perubahan | File utama |
|---|---|---|---|
| Kamus dan pustaka | ✅ | `lib/kamus.ts` (arti status, alasan tolak, alasan tunda, kalimat "bukan layanan resmi", Data buatan, arti huruf). `NAMA_FAKTOR`/`DEFINISI_FAKTOR`/`SATUAN_FAKTOR` diganti satu set bahasa awam. `LABEL_FAKTOR` + `PENAHAN_FAKTOR` + `penahanUtama()`. Label status "Sudah diperiksa" / "Sedang dikerjakan" | `lib/kamus.ts`, `lib/konten.ts`, `lib/scoring/*`, `components/BadgeStatus.tsx` |
| W1 bug | ✅ | Data titik peta membawa `responded_at`/`resolved_at`; laporan Selesai tidak lagi "Terlambat" | `lib/data/laporan.ts`, `components/IndikatorSLA.tsx` |
| Batas waktu (W6, W15, C1) | ✅ | "Sisa 5 jam untuk ditanggapi", "Belum selesai, lewat 38 jam". Laporan warga asli yang Menunggu: "Belum ditanggapi" tanpa tanda merah dan tanpa membuka "Kenapa belum?" otomatis | `components/IndikatorSLA.tsx` |
| Halaman lacak (W3, W4–W7, W10–W14, W20–W23, W39–W42) | ✅ | Kotak status dengan arti status, "Kenapa tertunda", "Ditolak karena …" dan langkah berikutnya. Panel "Kenapa belum?" memakai "urutan ke-N dari M masalah", "menyumbang 12 dari 30 poin", "Paling menaikkan / Paling menahan". Banner sukses jadi 3 langkah. Nama pelaku tanpa "Admin ·"/"(simulasi)" | `components/laporan/*`, `app/laporan/[kode]/page.tsx` |
| Lapor (W2, W8, W9, W16–W19, W35–W37, W45) | ✅ | "Pakai lokasi saya" di atas peta; laporan serupa dengan foto dan saran "cukup Dukung"; konfirmasi sebelum menghapus draf; tautan "Masuk lagi" saat sesi habis; bahasa "tidak dikirim ke dinas sungguhan" | `components/lapor/FormLaporan.tsx`, `app/lapor/page.tsx` |
| Galat (W25–W30, W43) | ✅ | Semua pesan menyebut penyebab dan jalan keluar | `lib/errors.ts` |
| Masuk, Lacak, Peta (W31–W34, W44) | ✅ | Arti tiap status di `/lacak`; contoh kode `SR-ABC234` (format sah); petunjuk peta untuk HP | `app/masuk`, `components/FormAuth.tsx`, `app/lacak`, `components/peta/PetaLaporan.tsx` |
| Kecamatan (D1–D3, D13, D29–D36) | ✅ | Tautan ke `/prioritas#cara-hitung` (bukan rumus rapor). Kalimat 3 bagian; urutan bawah menyebut yang paling menahan. "Cari kecamatanmu"; alasan tidak terpotong; label tingkat terlihat; grafik abu-abu dengan kecamatan ini hitam; "dari 20 poin" | `app/kecamatan/*`, `components/kecamatan/*`, `lib/scoring/kecamatan.ts` |
| Urutan prioritas (D9–D11, D15–D24, D37, D38, D44) | ✅ | Judul "Urutan prioritas". Hasil sebelum "Coba atur sendiri". Bagian `#cara-hitung` + rumus dalam `<details>`. Aturan resmi / pilihan cepat / Percobaanmu; "Urutan ke-4 … (naik 2)"; bug "JakSelatan"; popover Istilah; legenda peta dengan kata | `app/prioritas/page.tsx`, `components/prioritas/*`, `components/PetaKecamatan.tsx` |
| Rapor dinas (D4–D8, D14, D39–D43) | ✅ | Ringkasan "Paling baik / Paling perlu diperbaiki". Kartu: huruf + kata, kesimpulan paling kuat / paling lemah, "94 dari 100" dengan garis rata-rata dinas lain, "Ditolak 4% (batas 25%)". Cara rapor dihitung dibuka dengan cerita contoh; tabel A/B jadi dua kartu di HP | `app/rapor/*`, `components/rapor/KartuRapor.tsx`, `lib/konten-rapor.ts` |
| Beranda dan umum (B1–B44) | ✅ | Pita "Data buatan"; subjudul hero; tombol Laporkan/Lacak; peringatan bukan kanal resmi di atas tombol; urutan bagian baru; rotasi sorotan 6 detik dan tidak otomatis di layar sentuh; menu: Urutan prioritas, Rapor dinas, Cara rapor dihitung, Cara urutan dihitung, Skor kecamatan; Tentang dan Sumber data dibuka dengan 3 poin, detail teknis di "Untuk juri dan pengembang" | `app/page.tsx`, `components/beranda/*`, `app/tentang`, `app/sumber-data`, `components/Header.tsx`, `Footer.tsx`, `Sisi.tsx`, `BannerSimulasi.tsx`, `ui/LabelSumber.tsx` |
| B45 | ➖ | Contoh kode publik jadi `SR-ABC234`; placeholder di form admin tetap `SR-K7W3PA` | — |
| Admin (D45) | ✅ | "Laporan dinas", tanpa "seed/SLA", akibat penolakan ke rapor disebut, target sentuh 44 px | `app/admin/*`, `components/admin/*` |

### Yang belum

- **X3:** data contoh JSON cadangan masih punya keterlambatan sampai 39 hari. Data ini hanya tampil kalau Supabase mati.
- **Uji ke orang awam** (revisi FDS 2.6) tetap perlu orang sungguhan. Bahan ujinya sekarang:
  - `/kecamatan` → "Cari kecamatanmu";
  - `/lacak` → skenario "Terlambat, ada kendala".
- Belum dicek di HP fisik: popover Istilah di slider, rotasi sorotan Beranda di layar sentuh, dan `<select>` "Cari kecamatanmu" di iOS.
- Kelas `.chip` tingginya masih 40 px, di bawah target sentuh 44 px (perlu ubah `globals.css`).

## Putaran 2: bukti, aksesibilitas, performa (10 November malam)

Branch `feat/ramah-semua` (dari `dev` setelah PR #23), belum di-commit.

### Keterbacaan (diukur)

Hanya paragraf yang dibaca warga (`<p>`, `<li>`, `<dd>`), di build produksi lokal 375 px:

| Halaman | Kalimat | Rata-rata kata/kalimat | > 20 kata |
|---|---:|---:|---:|
| Beranda | 86 | 9,2 | 2 |
| Lacak | 13 | 7,2 | 0 |
| Detail laporan | 34 | 8,7 | 0 |
| Peta | 6 | 8,7 | 0 |
| Urutan prioritas | 65 | 10,4 | 0 |
| Kecamatan | 29 | 9,1 | 0 |
| Rapor dinas | 62 | 7,5 | 0 |
| Cara rapor dihitung | 58 | 9,9 | 0 |

Kalimat pendek **belum membuktikan** warga paham. Buktinya harus dari uji ke warga: kit ada di [uji-warga-2026-11-10.md](uji-warga-2026-11-10.md) (5 profil, 6 tugas, batas waktu, lembar catat).

### Aksesibilitas

- **axe-core 4.10 (WCAG 2.2 A/AA), 13 halaman di 375 px: 0 pelanggaran.**
  - Halaman yang dicek: Beranda, Lacak, dua detail laporan, Peta, Urutan prioritas, dua halaman Kecamatan, Rapor, Cara rapor dihitung, Tentang, Sumber data, dan Masuk.
  - Satu catatan "perlu dicek": id `sisi` dobel, berasal dari potongan streaming React yang tersembunyi (`<div hidden id="S:0">`) di layout. Elemen itu tidak terlihat, tidak terbaca pembaca layar, dan sudah ada sebelum audit.
- **Lighthouse aksesibilitas:**
  - Awalnya 96–97, karena kontras gagal saat animasi "muncul" berjalan dan ada tautan dalam teks tanpa garis bawah.
  - Sesudah perbaikan: **100** di 5 halaman. Peta tidak bisa dinilai karena alatnya galat di gatherer RootCauses.
- **Perbaikan:**
  - Animasi "muncul saat digulir" hanya bergerak naik, tanpa memudar, sehingga teks selalu kontras penuh.
  - `kelasTautan` selalu bergaris bawah (layar sentuh tidak punya hover; WCAG 1.4.1).
  - Chip 44 px.
  - Tombol **"Perbesar huruf"** di menu dan footer: seluruh tampilan +12,5%, pilihan disimpan di HP, dan dipasang sebelum halaman tergambar. Saat menyala, 7 halaman utama tetap pas di 375 px; label "Lapor" di header jadi ikon saja.

### Performa (Lighthouse 12, HP, simulasi 4G lambat)

| Halaman | Performa awal → akhir | LCP awal → akhir | FCP | CLS |
|---|---|---|---:|---:|
| Beranda | 75 → 80 | 7,4 → 5,3 s | 1,2 s | 0 |
| Detail laporan | 77 → 80 | 6,4 → 5,5 s | 0,9 s | 0 |
| Peta | 84 → 77 | 4,5 → 4,7 s | 1,2 s | 0 |
| Urutan prioritas | 84 → 85 | 4,5 → 4,4 s | 1,2 s | 0 |
| Kecamatan | 81 → 82 | 4,7 → 4,5 s | 1,1 s | 0,096 |
| Rapor dinas | 86 → 85 | 4,2 → 4,4 s | 0,9 s | 0 |

- Selisih ±3 poin antar-percobaan adalah variasi wajar Lighthouse; Peta dan Rapor tidak diubah.
- **Perbaikan:**
  - Foto tab hero di Beranda baru diunduh saat tabnya dibuka (dulu 5 foto, ±500 KB, sekaligus).
  - Galeri laporan diberi `sizes`; dulu HP diberi gambar selebar 1920 px.
- **Belum memenuhi target LCP 2,5 s.** Dugaan awal: JavaScript (terutama Leaflet) dan foto di bawah layar. Pengukuran di [Putaran 3](#putaran-3-lcp-dan-lebar-halaman-di-hp-10-november-malam) menemukan penyebab lain, dan dugaan Leaflet ternyata salah (Leaflet sudah dimuat terpisah).

### Ringkasan sekali lihat

- Urutan prioritas sekarang dibuka dengan kotak **"Paling didahulukan sekarang"**: 3 masalah teratas, alasannya, skor dari 100, dan "Cari kecamatanmu".
- Halaman lain sudah dibuka dengan jawaban:
  - Rapor: "Paling baik / Paling perlu diperbaiki";
  - Kecamatan: kalimat 3 bagian;
  - Lacak: "Status sekarang".

### README (nilai FDS 4)

README sekarang memuat:

- tautan situs dan latar belakang/tujuan;
- **peta halaman** (Mermaid);
- tabel **progres** yang jujur (termasuk yang belum: uji warga, LCP, data BPS/CRM);
- nama tim dari riwayat git: Wildan (@wildanpanjii), Gede Ananda (@GedeAnanda), Fatih Akram Wicaksono. **Tim perlu memastikan nama lengkapnya.**

## Putaran 3: LCP dan lebar halaman di HP (10 November malam)

### Ringkasan cepat

- **Rapor 4,4 → 2,6 s, Peta 4,7 → 3,1 s, Prioritas 4,5 → 3,2 s, Beranda 5,3 → 3,6 s.** LCP adalah waktu sampai bagian terbesar halaman tampil; diukur dengan Lighthouse 13.5, HP, simulasi 4G lambat.
- **Bug di HP:** Beranda melebar sampai 1209 px di layar 412 px, jadi halaman bisa digeser ke samping. Sudah diperbaiki.
- **Penyebab terbesar di situs produksi:** fungsi Vercel berjalan di Amerika (iad1), sedangkan database di Tokyo. Region dipindah ke `hnd1` (Tokyo); hasilnya baru terlihat setelah deploy.
- **Belum:** Detail laporan (5,0 s) dan Kecamatan (4,1 s) masih di atas 2,5 s, karena teks utamanya baru tampil setelah data datang dari database.

### Cara mengukur

- **Lighthouse 13.5**, bukan 12. Versi 12 tidak bisa membaca elemen LCP di Chrome terbaru (galat `RootCauses`), jadi dugaan di putaran 2 tidak bisa dibuktikan.
- **Build produksi lokal** (`next start`), dengan simulasi HP dan 4G lambat bawaan Lighthouse.
- Versi sebelum dan sesudah diukur dengan alat yang sama. Selisih ±0,3 s antar-percobaan masih wajar.
- **Lebar halaman** diperiksa di Chrome headless dengan emulasi HP 412 × 823.

### Yang ditemukan

1. **Animasi masuk menunda LCP.** Isi halaman memudar dari transparan (opacity 0): 420 ms untuk seluruh halaman, 640 ms untuk isi yang datang menyusul. Chrome baru mencatat LCP setelah animasi itu selesai.
   - Contoh: di Prioritas, teks pembuka tampil di 77 ms, tetapi LCP tercatat di 510 ms.
2. **Beranda melebar 1209 px di HP.** Kartu "Untuk siapa SUARAKYAT" bisa digeser menyamping. Teks khusus pembaca layar (`sr-only`) di kartu yang masih di luar layar tidak terkurung oleh jalur geser, sehingga halaman ikut melebar. Akibatnya:
   - halaman bisa digeser ke samping;
   - Chrome menganggap layarnya setinggi 2416 px dan mengunduh foto jauh di bawah sebagai foto yang terlihat (Beranda 1.088 KB);
   - LCP terbaca pada foto yang salah.

   Di putaran 2 angka 1191 px ini dikira artefak alat ukur. Ternyata bug sungguhan.
3. **supabase-js (±65 KB gzip) ikut dimuat di setiap halaman,** padahal di browser ia hanya dipakai saat tombol ditekan: dukung, batal, beri nilai, kirim laporan, unggah foto, dan simpan aturan.
4. **Detail laporan mengambil data berurutan.** Laporan diambil dulu, baru riwayatnya, baru data prioritas: tiga kali bolak-balik ke database.
5. **Server jauh dari database.** Header `x-vercel-id` menunjukkan fungsi berjalan di `iad1` (Washington). Database Supabase ada di `ap-northeast-1` (Tokyo).
   - Hitungannya sendiri cepat: `priority_factors` hanya 5 ms di server database.
   - Yang lama adalah jaraknya. Di produksi, isi Detail laporan baru selesai dikirim setelah sekitar 2,1 detik.
6. **Leaflet bukan penyebab.** Leaflet sudah dimuat terpisah (`next/dynamic`, `ssr: false`) dan tidak menunda teks utama.

### Yang diubah

| Perubahan | Berkas |
|---|---|
| Animasi masuk halaman dan isi susulan hanya bergeser naik 8 px, tanpa memudar. Teks juga tidak pernah pucat. | `app/globals.css` |
| Jalur geser diberi `relative`, supaya isi kartu di luar layar ikut terpotong. | `components/ui/BarisGeser.tsx` |
| supabase-js baru dimuat saat tombol ditekan, lewat `supabaseBrowser()`. | `lib/supabase/muat.ts`, `AksiLaporan`, `FormLaporan`, `Simulator`, `lib/supabase/unggah.ts` |
| Laporan, riwayat, hubungan pengguna, dan data prioritas diambil bersamaan. | `lib/data/laporan.ts`, `app/laporan/[kode]/page.tsx` |
| Fungsi Vercel dipindah ke Tokyo: `"regions": ["hnd1"]`. | `vercel.json` |

### Hasil (Lighthouse 13.5, HP, 4G lambat, build lokal)

| Halaman | Performa | LCP | JS | Total unduhan |
|---|---|---|---|---|
| Beranda | 80 → 90 | 5,3 → 3,6 s | 313 → 248 KB | 1.088 → 576 KB |
| Urutan prioritas | 84 → 93 | 4,5 → 3,2 s | 313 → 248 KB | 527 → 461 KB |
| Detail laporan | 80 → 82 | 5,4 → 5,0 s | 374 → 308 KB | 745 → 679 KB |
| Peta | 83 → 93 | 4,7 → 3,1 s | 367 → 301 KB | 882 → 816 KB |
| Kecamatan | 82 → 85 | 4,5 → 4,1 s | 317 → 251 KB | 511 → 445 KB |
| Rapor dinas | 85 → 97 | 4,4 → 2,6 s | 313 → 248 KB | 477 → 412 KB |

Di semua halaman FCP tetap 0,9–1,2 s, TBT ≤ 50 ms, dan CLS ≤ 0,096.

Cek lain:

- **Lebar halaman:** 13 halaman di HP 412 px sekarang pas 412 px, tidak ada yang bisa digeser ke samping.
- **Waktu data di Detail laporan (tanpa throttling, lokal → Tokyo):** 1.755 → 485 ms.
- **Tombol Dukung** diuji dengan akun warga demo: supabase-js tidak dimuat saat halaman dibuka, lalu dimuat saat tombol ditekan. Dukung dan batal dukung tetap berjalan, dan datanya dikembalikan seperti semula.
- `tsc`, `lint`, 48 tes, dan build lulus.

### Pembanding produksi (sebelum deploy perubahan ini)

Diukur 10 Nov malam di https://suarakyatt.vercel.app. Kodenya masih versi `main` lama, dan fungsinya masih di `iad1`.

| Halaman | Performa | LCP | Teks utama tampil (tanpa throttling) |
|---|---|---|---|
| Beranda | 87 | 2,9 s | 926 ms |
| Urutan prioritas | 96 | 2,7 s | 763 ms |
| Detail laporan | 82 | 4,7 s | 3.235 ms |
| Kecamatan | 89 | 3,3 s | 2.592 ms |

- **Halaman lengkap selesai dikirim (curl):** Detail laporan ±2,1 s, Prioritas ±1,5 s, Kecamatan ±1,8 s, Rapor 1,0–1,7 s.
- **Angka produksi lebih baik dari lokal** karena CDN Vercel mengompres dengan brotli. Untuk juri, yang berlaku adalah angka produksi.

### Setelah deploy, cek ini

1. `curl -sI https://suarakyatt.vercel.app/api/cron/reset-demo` harus menunjukkan `x-vercel-id: …::hnd1::…`, bukan `iad1`.
2. Ukur ulang di [PageSpeed Insights](https://pagespeed.web.dev/) untuk `/laporan/SR-27RPCJ` dan `/kecamatan/31.74.010`. Dua halaman ini paling banyak menunggu data, jadi paling terbantu oleh region Tokyo.
3. Catat hasilnya di tabel ini.

### Yang belum

- **Detail laporan dan Kecamatan masih di atas 2,5 s.** Teks utamanya (status dan kalimat kecamatan) baru ada setelah data datang. Langkah berikutnya, kalau region Tokyo belum cukup:
  - simpan data publik ini di cache (`'use cache'` + `cacheTag`), lalu segarkan saat status atau dukungan berubah;
  - risikonya: tampilan bisa tertinggal sebentar, dan lapisan data (bagian B) perlu diubah.
- **Batas bawah sekitar 2,6 s** di simulasi 4G lambat datang dari JavaScript kerangka Next.js dan React (±170 KB gzip), yang dimuat di setiap halaman.
- **Prefetch rute:** setelah halaman siap, Next.js mengambil lebih dulu ±12 rute dari tautan menu. Ini membantu perpindahan halaman, tetapi memakai kuota data di HP. Belum diubah.
