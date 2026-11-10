# Revisi dari FDS (First Draft Submission) WIA 2026 — 10 November 2026

> Versi .md dari lembar penilaian mentor `[FDS] WIA_abis ini ke wdp.pdf` (2 halaman), lalu dipetakan ke kode di branch `add-ui-2-animation` (commit `267ac8e`).
>
> **Status 10 Nov (malam):** semua usulan di bawah dikerjakan di `feat/revisi-fds` (commit `1e9544b`), di-merge ke `dev` lewat PR #19, lalu dirilis ke `main` lewat PR #21 (`c37176f`). Situs produksi **https://suarakyatt.vercel.app** sudah memuat revisi ini: tes CI lulus, deploy Vercel sukses, dan skenario duplikat serta terlambat sudah dicek di tampilan HP. Migrasi `0009` dan `0010` sudah diterapkan ke Supabase. Rinciannya di [Hasil pengerjaan](#6-hasil-pengerjaan-10-november). Yang masih terbuka: uji ke orang awam (2.6), Lighthouse dengan throttling (3.5), keputusan Recharts (2.5), dan rilis `dev` → `main`.

## Ringkasan cepat

- **Nilai FDS: 4 sampai 5 di semua aspek.** Nilai 5 ada di Keaslian, Halaman Wajib, Desain Visual, Fungsionalitas, dan Potensi Dampak. Nilai 4 ada di Relevansi Tema, Latar Belakang, Sitemap/Wireframe, dan README.
- **Mentor memberi 3 saran sebelum final submission:**
  1. Alur dari Beranda ke detail pelacakan (kenapa laporan **tertunda** atau **ditolak**) harus mulus, terutama di HP.
  2. Skor 42 kecamatan perlu divisualkan supaya warga awam langsung paham metriknya.
  3. Uji skenario dengan mock data: penolakan dan daftar alasan penanganan harus tampil akurat dan tidak berat.
- **Celah terbesar yang ditemukan di kode:**
  - **Alasan "tertunda" dari instansi belum ada.** 47 laporan aktif di data contoh sudah lewat batas selesai, tetapi catatan instansinya hanya "Petugas sudah di lokasi." Penjelasan yang tersedia cuma peringkat model di panel "Kenapa belum?".
  - **Di HP, jawaban "kenapa" ada jauh di bawah.** Urutannya: kartu ringkasan → peta → foto dan cerita → panel "Kenapa belum?" (masih tertutup) → dukungan → batas waktu → riwayat. Catatan instansi ada paling bawah.
  - **Skor dinilai per isu (kecamatan × kategori), bukan per kecamatan.** Belum ada tampilan "kecamatanku bagaimana?" dengan bahasa awam.
  - **Data contoh untuk penolakan terlalu seragam.** Hanya ada 2 teks catatan penolakan, tidak ada kasus `konten_melanggar`, dan `duplikat_dari` tidak ditautkan di UI. Belum ada tes untuk tampilan penolakan, SLA, atau timeline.
- **Temuan di luar saran:**
  - ~~Tautan demo 404~~ **Koreksi:** yang dicek waktu itu `suarakyat.vercel.app` (satu t), domain yang bukan milik tim. Domain produksi yang benar adalah **https://suarakyatt.vercel.app** (dua t, sesuai `CONTRIBUTING.md`), dan situs itu hidup.
  - Branch `dev` terakhir diperbarui 29 Okt; 20 commit UI di `add-ui-2-animation` belum masuk ke `dev`.
  - **Migrasi `0009_foto_dan_dukungan.sql` (30 Okt) ternyata belum diterapkan ke Supabase**, padahal kode di branch UI sudah memanggil `sudah_dukung` dan karantina foto. Sudah diterapkan 10 Nov malam. Lihat [Migrasi 0009](#migrasi-0009-diterapkan-10-november).

## 1. Lembar FDS (versi teks)

| | |
|---|---|
| Nama tim | abis ini ke wdp |
| Judul karya | Suarakyat |
| Cabang lomba | Web In Action |
| Tema utama | Designing Digital Futures |
| Subtema | Public Service Tracking, Civic Reporting & Accountability |
| Mentor penilai | Adi Prabowo |
| Repository | https://github.com/GedeAnanda/suarakyatt |
| Dokumen tim | https://canva.link/q0fss8e0kkltpey |

Skala: 1 = belum terlihat · 2 = masih perlu banyak perbaikan · 3 = cukup untuk tahap awal · 4 = baik dan mulai solid · 5 = sangat baik, siap lanjut.

| Bagian | Aspek | Yang dinilai | Nilai |
|---|---|---|:-:|
| 1 · Konsep | Relevansi ide terhadap tema dan subtema | Menjawab transparansi dan akuntabilitas layanan publik | 4 |
| 1 · Konsep | Latar belakang dan tujuan | Masalah, tujuan, dan rencana fitur jelas | 4 |
| 1 · Konsep | Keaslian dan kreativitas | Cara baru mengolah dan menyajikan data publik | **5** |
| 2 · Struktur | Sitemap dan wireframe | Struktur halaman dan mockup jelas | 4 |
| 2 · Struktur | Repository dan README.md | Deskripsi, tech stack, cara run, progres | 4 |
| 2 · Struktur | Halaman wajib FDS | Screenshot landing + 1 halaman lain | **5** |
| 3 · Visual | Desain visual dan layout | Proporsional, harmonis, mudah dibaca | **5** |
| 3 · Visual | Fungsionalitas, navigasi, responsif | Fitur awal jalan, struktur kode, responsif | **5** |
| 3 · Visual | Potensi dampak | Memudahkan akses informasi dan keputusan berbasis data | **5** |

**Catatan mentor (diringkas):** konsep dan visual sudah solid untuk tahap FDS, dan pembagian peran Frontend, Backend, dan Data terlihat jelas. Saran pengembangannya:

1. **Penyempurnaan alur interaksi.** Transisi dari landing page ke halaman detail pelacakan, misalnya saat pengguna melacak alasan laporan tertunda atau ditolak, harus mulus dan intuitif, terutama di HP.
2. **Validasi data dan integrasi skor kecamatan.** Karena fitur ini menilai 42 kecamatan DKI, fokuskan pengembangan pada visualisasi data atau grafik skor yang mudah dipahami warga awam.
3. **Simulasi skenario penggunaan nyata.** Sebelum final submission, uji fungsionalitas dengan mock data supaya skenario penolakan dan daftar alasan penanganan tampil akurat tanpa kendala performa.

## 2. Saran 1 — Alur Beranda ke "kenapa tertunda/ditolak" di HP

### Kondisi sekarang

- **Pintu masuk dari Beranda:**
  - tab "Lacak" di hero ([HeroCari.tsx:239](../components/beranda/HeroCari.tsx#L239)) → `/lacak?kode=` → langsung ke `/laporan/KODE`;
  - spanduk "ditolak" → `/peta?status=ditolak` → pin → detail;
  - tanpa kode: `/contoh`, yang selalu memilih laporan **Jalan rusak berstatus diverifikasi** ([lib/data/laporan.ts:88](../lib/data/laporan.ts#L88)). Tidak ada contoh laporan ditolak atau terlambat yang bisa dibuka sekali klik.
- **Urutan halaman detail di HP (di bawah `lg`, satu kolom)** dari [laporan/[kode]/page.tsx](../app/laporan/%5Bkode%5D/page.tsx):
  1. kartu ringkasan: status, kode, kategori, indikator SLA ("Terlambat 3 hari");
  2. peta lokasi;
  3. blok "Ditolak · alasan" (hanya untuk laporan ditolak);
  4. isi laporan: galeri foto dan cerita;
  5. **"Kenapa belum?"** (tertutup, kecuali dibuka lewat `#kenapa-belum`);
  6. dukungan, batas waktu layanan;
  7. **riwayat penanganan**, tempat catatan instansi.
- **Laporan terlambat:** jawaban "kenapa" tersebar di 3 tempat: badge SLA di atas, peringkat model di panel tengah, dan catatan instansi paling bawah. Ketiganya tidak saling merujuk di layar pertama.
- **Laporan ditolak:** blok penolakan sudah muncul di urutan 3 dan cukup jelas. Untuk alasan `duplikat`, skema punya `duplikat_dari` ([0001_schema.sql:90](../supabase/migrations/0001_schema.sql#L90)), tetapi UI tidak menautkan laporan aslinya.
- Urutan di atas dibaca dari kode, belum diukur di browser. `node_modules` belum terpasang di mesin ini, dan situs Vercel 404.

### Usulan

| # | Perubahan | Pemilik |
|---|---|---|
| 1.1 | **Kotak "Status sekarang" satu kalimat** tepat di bawah kode, sebelum peta. Contoh: "Terlambat 3 hari · Dinas Bina Marga: menunggu jadwal alat berat · Lihat penjelasan ↓", atau "Ditolak · Duplikat dari SR-K7W3PA". Tautannya melompat ke panel atau riwayat yang sesuai. | A |
| 1.2 | Di HP, panel "Kenapa belum?" dipindah **ke atas galeri** (`order-*`). Kalau laporan terlambat, panel terbuka otomatis. Peta lokasi dibuat lebih pendek atau bisa dilipat. | A |
| 1.3 | Chip lompat yang menempel di HP: **Status · Kenapa belum · Riwayat**. | A |
| 1.4 | **Alasan tunda terstruktur** dari instansi: enum `alasan_tunda` di `report_updates` (mis. `antre_jadwal`, `butuh_anggaran`, `koordinasi_instansi`, `cuaca`, `menunggu_material`, `lainnya`), kolom di form admin, dan ikut di `v_timeline_publik`. Migrasi `0010`. | B (+ A untuk form admin) |
| 1.5 | Penolakan `duplikat` menautkan laporan aslinya. Butuh `duplikat_dari` dibuka di `v_timeline_publik` dalam bentuk kode, bukan id. | B + A |
| 1.6 | `/contoh?jenis=ditolak` dan `/contoh?jenis=terlambat`, ditautkan dari Beranda atau `/lacak` ("Coba lacak laporan yang ditolak"). Juri bisa melihat dua skenario itu tanpa mencari kode. | A |

## 3. Saran 2 — Skor kecamatan yang langsung dipahami warga awam

### Kondisi sekarang

- **Beranda** ([SorotKecamatan.tsx](../components/beranda/SorotKecamatan.tsx)): peta choropleth 42 kecamatan, 10 isu teratas yang bergantian, dan 3 faktor pendorong saat difokus.
- **/prioritas** ([Simulator.tsx](../components/prioritas/Simulator.tsx)): choropleth, daftar peringkat, bar 6 faktor per isu ([BarKontribusi.tsx](../components/prioritas/BarKontribusi.tsx)), dan slider bobot.
- **/rapor**: dinilai per **instansi** dengan komponen R, S, P, K, bukan per kecamatan.
- Satuan skornya adalah **isu** (satu kecamatan × satu kategori). Warga yang ingin tahu "Kecamatan saya bagaimana?" harus memilih isu satu per satu di simulator.
- Bahasanya masih teknis: "poin", "bobot", "kontribusi", "R · S · P · K". Belum ada pembanding seperti median Jakarta.
- `recharts` terpasang dan disebut di README, tetapi tidak dipakai di mana pun. Semua grafik memakai CSS atau SVG sendiri.

### Usulan

| # | Perubahan | Pemilik |
|---|---|---|
| 2.1 | **Halaman `/kecamatan/[kode]`**, dibuka dari klik peta di Beranda, /peta, dan /prioritas. Isinya: peringkat isu tertinggi di antara 42 kecamatan, bar horizontal skor per kategori, garis median Jakarta, jumlah laporan aktif/terlambat/ditolak, dan 3 laporan terbaru. | A + C |
| 2.2 | **Kalimat awam di atas setiap grafik**, dibuat dari data yang sama. Contoh: "Jalan rusak di Setiabudi ada di urutan 4 dari 120 isu, terutama karena banyak laporan dan sudah lama menunggu." Fungsi pembuat kalimatnya di `lib/scoring`, dengan tes. | C (+ A) |
| 2.3 | Nama faktor versi awam di grafik, istilah teknis di tooltip: "Seberapa mendesak", "Sudah berapa lama", "Berapa banyak laporan", "Dukungan warga", "Kerentanan warga", "Kepadatan". | A + C |
| 2.4 | Choropleth dengan legenda yang langsung terbaca ("Merah = isu paling didahulukan") dan daftar teks sebagai alternatif aksesibel. | A |
| 2.5 | Putuskan nasib `recharts`: pakai untuk 2.1, atau hapus dari dependensi dan README. Jangan biarkan README menyebut pustaka yang tidak dipakai. | A |
| 2.6 | Uji keterbacaan dengan 3 sampai 5 orang awam. Tugasnya: "Kecamatanmu peringkat berapa, dan kenapa?" Targetnya terjawab dalam 30 detik di HP. | semua |

## 4. Saran 3 — Uji skenario dengan mock data

### Kondisi sekarang

- **Data contoh** ([lib/mocks/contoh-laporan.json](../lib/mocks/contoh-laporan.json)):
  - 520 laporan: selesai 326, ditolak 63, menunggu 59, diproses 44, diverifikasi 28;
  - 1.677 entri timeline.
- **Penolakan di data contoh:**
  - 55 `tidak_valid`, semuanya dengan catatan "Petugas tidak menemukan masalah di titik yang dilaporkan.";
  - 8 `duplikat`, semuanya dengan catatan "Sudah dilaporkan warga lain di lokasi yang sama.";
  - **0 `konten_melanggar`**, padahal kasus ini menyembunyikan deskripsi di halaman detail;
  - tidak satu pun punya tautan ke laporan asli.
- **Laporan aktif:** semua catatan "diverifikasi" sama persis, begitu pula semua catatan "diproses". **47 laporan aktif melewati batas selesai tanpa alasan tunda.**
- **Tes:**
  - Vitest hanya mencakup `scoring`, `pilihan-url`, dan `tujuan-aman`.
  - `test:db` ([verifikasi-demo.mjs](../scripts/verifikasi-demo.mjs)) menguji satu penolakan `tidak_valid` di DB lalu rollback.
  - Belum ada tes untuk `hitungSLA`, tampilan penolakan, timeline, atau performa.

### Usulan

| # | Perubahan | Pemilik |
|---|---|---|
| 3.1 | **Perkaya data contoh dan seed DB.** Ketiga alasan tolak ada, termasuk `konten_melanggar` dengan deskripsi null. Catatan dibuat bervariasi per kategori. Laporan terlambat diberi `alasan_tunda` dari 1.4. Duplikat diberi `duplikat_dari`. Tambahkan beberapa laporan dengan riwayat panjang (catatan berkali-kali, foto bukti). | C |
| 3.2 | **Matriks skenario** yang wajib tampil benar (tabel di bawah), plus satu kode contoh tetap per skenario supaya bisa diuji ulang. | C + A |
| 3.3 | Tes Vitest: `hitungSLA` (sisa, terlambat, selesai terlambat, ditolak = null), dan tes fixture: setiap `ditolak` punya alasan, `tidak_valid`/`konten_melanggar` punya catatan, `duplikat` punya `duplikat_dari`, setiap aktif terlambat punya `alasan_tunda`. | B + C |
| 3.4 | Tes browser per skenario di 390 px dan 1440 px (Playwright di luar dependensi, seperti audit 30 Okt): teks alasan, tautan duplikat, isi tersembunyi, urutan di HP. | A + B |
| 3.5 | **Performa:** Lighthouse mobile (throttling 4G) untuk `/`, `/laporan/[kode]`, `/peta` (900 laporan seed), dan `/prioritas`. Target LCP < 2,5 s, INP < 200 ms, CLS < 0,1. Catat hasilnya di dokumen ini. | B |
| 3.6 | `test:db` diperluas: penolakan ketiga alasan, alasan tunda, dan pembacaan `v_timeline_publik` sebagai tamu. Semuanya tetap di-rollback. | B |

**Matriks skenario (3.2)**

| ID | Skenario | Yang wajib tampil |
|---|---|---|
| S1 | Ditolak · tidak valid | Blok "Ditolak · Tidak valid", catatan instansi, nama pelaku; laporan tetap publik |
| S2 | Ditolak · duplikat | "Duplikat dari SR-…" dengan tautan ke laporan asli |
| S3 | Ditolak · konten melanggar | Deskripsi diganti kalimat "disembunyikan"; foto tidak tampil |
| S4 | Aktif · terlambat dengan alasan tunda | Kotak status: "Terlambat N hari · <alasan>", panel "Kenapa belum?" terbuka di HP |
| S5 | Aktif · masih dalam batas | "Sisa N jam", panel tertutup |
| S6 | Selesai terlambat | "Selesai terlambat N hari", foto bukti, form rating (pemilik) |
| S7 | Menunggu, baru dikirim | Banner "Laporan terkirim" hanya untuk pemilik, tombol batalkan |

## 5. Urutan kerja yang disarankan

1. **B (backend):** 1.4 migrasi `alasan_tunda`, 1.5 `duplikat_dari` di view, 3.6 `test:db`. Fitur lain bergantung pada kolom ini.
2. **C (data):** 3.1 perkaya data contoh dan seed, 2.2 fungsi kalimat awam, 3.2 kode contoh per skenario.
3. **A (frontend):** 1.1 sampai 1.3 dan 1.6 (alur HP), lalu 2.1, 2.3, dan 2.4 (halaman kecamatan).
4. **Semua:** 3.3 sampai 3.5 (tes dan performa), lalu 2.6 (uji ke orang awam). Catat hasilnya di sini sebelum final submission.

Hal yang perlu dibereskan dulu:

- ~~Hidupkan lagi tautan demo.~~ Tidak perlu: produksi ada di https://suarakyatt.vercel.app dan hidup. Yang 404 hanya `suarakyat.vercel.app` (satu t), domain yang salah ketik.
- **Gabungkan branch UI ke `dev`.** Sekarang `add-ui-2-animation` 20 commit di depan `dev`. Buat branch kerja baru dari situ dengan `--no-track`.
- **Lengkapi tabel Tim di README.** Masih "(isi)", dan aspek README hanya dapat nilai 4.

## 6. Hasil pengerjaan (10 November)

Branch `feat/revisi-fds`, belum di-commit. `tsc`, `eslint`, 45 tes Vitest (19 lama + 26 baru), dan `next build` lulus. Uji browser memakai build produksi lokal (`next start -p 3200`) dengan data dari Supabase, di 375×812 dan 1440×900. Tidak ada console error atau galat server.

### Saran 1 — alur lacak di HP

| # | Status | Perubahan | File |
|---|---|---|---|
| 1.1 | Selesai | Kotak **"Status sekarang"** di bawah kode, sebelum peta. Isinya: batas waktu, **"Kenapa tertunda: …"** (kendala terakhir dari instansi, hanya jika status belum berubah sejak dicatat), "Ditolak karena …" plus tautan laporan asli untuk duplikat, perkiraan selesai, dan tautan lompat. | `components/laporan/RingkasanStatus.tsx`, `app/laporan/[kode]/page.tsx` |
| 1.2 | Selesai | Di HP, "Kenapa belum?" naik ke atas foto. Panel terbuka otomatis kalau laporan lewat batas waktu. Peta lokasi di HP 2:1 (sebelumnya 4:3). Di layar lebar tata letaknya tetap: isi di kiri, panel di kanan. | `app/laporan/[kode]/page.tsx`, `components/laporan/PanelKenapaBelum.tsx`, `components/peta/TitikTunggal*.tsx` |
| 1.3 | Selesai | Baris lompat menempel di bawah header (HP saja): Status · Kenapa belum? · Alasan tolak · Isi laporan · Riwayat. | `app/laporan/[kode]/page.tsx` |
| 1.4 | Selesai | Migrasi `0010`: enum `alasan_tunda`, kolomnya di `report_updates` dan `seed.report_updates`, RPC **R12 `catat_kendala`** (catat kendala tanpa mengubah status, plus perkiraan selesai baru). Form admin **"Belum bisa diselesaikan? Catat kendalanya"**. Timeline menampilkan "Kendala · <alasan>". | `supabase/migrations/0010_alasan_tunda.sql`, `components/admin/FormKendala.tsx`, `lib/supabase/aksi-status.ts`, `components/laporan/Timeline.tsx` |
| 1.5 | Selesai | `v_timeline_publik` ditambah `duplikat_dari_kode`. Penolakan duplikat menautkan laporan asli di kotak status, blok penolakan, dan timeline. | `0010`, `RingkasanStatus.tsx`, `Timeline.tsx` |
| 1.6 | Selesai | `/contoh?jenis=terlambat\|ditolak\|duplikat\|melanggar\|selesai`. Pilihan diurutkan menurut kode, jadi tautan yang sama selalu membuka laporan yang sama. Chip skenario ada di `/lacak`, dan Beranda menautkan contoh "terlambat" dan "ditolak". | `lib/data/laporan.ts`, `app/contoh/page.tsx`, `app/lacak/page.tsx`, `components/beranda/HeroCari.tsx` |

**Bukti di HP (375×812)** pada laporan terlambat berkendala `SR-27RPCJ`:

- kotak status mulai di y = 538, jadi masuk layar pertama;
- "Kenapa belum?" di y = 1213, sudah terbuka;
- isi laporan di y = 2086;
- riwayat di y = 2973;
- tidak ada overflow horizontal.

Sebelumnya, "Kenapa belum?" baru muncul sesudah foto dan cerita, dan alasan tunda dari instansi belum ada.

**Skenario yang dicek di browser:**

| Skenario | Kode | Yang tampil |
|---|---|---|
| Tidak valid | `SR-29W3MR` | "Ditolak karena tidak valid", catatan petugas |
| Duplikat | `SR-229J6C` | Tautan ke `SR-SFBJQF` di kotak status dan di blok penolakan |
| Konten melanggar | `SR-2VRFAB` | Isi dan foto disembunyikan |
| Selesai | `SR-22FAXB` | "Selesai tepat waktu", tanpa panel "Kenapa belum?" |

### Saran 2 — skor kecamatan untuk warga awam

| # | Status | Perubahan | File |
|---|---|---|---|
| 2.1 | Selesai | **`/kecamatan`**: peta yang bisa dipilih plus daftar 42 kecamatan berperingkat, dengan bar dan garis median. **`/kecamatan/[kode]`** berisi lima bagian: (1) satu kalimat jawaban dan label tingkat; (2) grafik posisi di antara 42 kecamatan dengan median Jakarta; (3) tiap masalah aktif dengan skor, urutan, dan kalimat; (4) laporan aktif, terlambat, selesai, dan ditolak; (5) peta. Ditautkan dari Beranda (nama kecamatan dan tampilan fokus), menu samping, footer, detail laporan (nama kecamatan), dan simulator Prioritas. | `app/kecamatan/page.tsx`, `app/kecamatan/[kode]/page.tsx`, `components/kecamatan/*` |
| 2.2 | Selesai | `lib/scoring/kecamatan.ts` membuat kalimat seperti "Kecamatan Kembangan ada di urutan 28 dari 40 kecamatan yang punya laporan aktif… di bawah median Jakarta (61,6), terutama karena jenis masalahnya mendesak dan laporannya sudah lama menunggu." Tidak ada rumus baru: skor kecamatan = skor isu tertingginya (sama dengan warna peta). Modul ini punya 9 tes. | `lib/scoring/kecamatan.ts`, `tests/kecamatan.test.ts` |
| 2.3 | Selesai | Faktor ditampilkan sebagai pertanyaan awam ("Sudah berapa lama menunggu", "Seberapa padat penduduknya") dengan nilai rendah/sedang/tinggi. Istilah teknis dan definisinya ada di tooltip. | `components/kecamatan/FaktorAwam.tsx` |
| 2.4 | Selesai | Choropleth di `/kecamatan` diberi keterangan "Makin gelap birunya, makin didahulukan", plus daftar teks 42 kecamatan sebagai alternatif aksesibel. Grafik posisi menaruh semua teksnya di HTML, jadi tetap terbaca di HP. | `app/kecamatan/page.tsx`, `components/kecamatan/GrafikPosisi.tsx` |
| 2.5 | Sebagian | README kini jujur: grafik memakai SVG/CSS sendiri, dan Recharts terpasang tetapi belum dipakai. **Keputusan menghapus paket `recharts` diserahkan ke A.** | `README.md` |
| 2.6 | Belum | Uji keterbacaan dengan 3 sampai 5 orang awam butuh orang sungguhan. Tugas yang disarankan: buka `/kecamatan` di HP, cari kecamatanmu, lalu jawab "urutan berapa dan kenapa?" dalam 30 detik. | — |

### Saran 3 — uji skenario dengan mock data

| # | Status | Perubahan | File |
|---|---|---|---|
| 3.1 | Selesai | **Data contoh** (fallback, 520 laporan; kode dan status tidak berubah): tidak valid 47 dengan 4 variasi catatan, duplikat 8 yang semuanya menautkan laporan asli, konten melanggar 8 dengan deskripsi dan foto disembunyikan, dan kendala 44 (6 jenis). **Database** (900 seed): sebelumnya sudah ada 3 alasan tolak dan 19 duplikat bertaut; `isi_kendala_simulasi()` menambah **214 kendala** di seed dan di data tampil, semua laporan aktif yang lewat batas punya kendala, dan rapor serta prioritas terbukti tidak berubah. | `scripts/buat-data-contoh.mjs`, `lib/mocks/contoh-*.json`, `0010`, `scripts/05c_muat_seed.py`, `scripts/siapkan-demo.mjs` |
| 3.2 | Selesai | Matriks S1–S7 punya kode contoh tetap lewat `/contoh?jenis=…` (lihat tabel skenario di atas). | `lib/data/laporan.ts` |
| 3.3 | Selesai | Tes baru: `status-laporan.test.ts` (SLA dan kendala yang berlaku, 8 tes) dan `data-contoh.test.ts` (matriks skenario, alasan tolak, duplikat, konten melanggar, kendala, urutan timeline; 9 tes). | `tests/` |
| 3.4 | Selesai, manual | Dicek di browser untuk semua skenario di HP dan desktop (bukti di atas). Belum ada skrip Playwright tetap di repo. | — |
| 3.5 | Sebagian | Diukur di build produksi lokal tanpa throttling (tabel di bawah). LCP tidak terekam karena pane browser uji tersembunyi. **Lighthouse mobile dengan 4G belum dijalankan.** | — |
| 3.6 | Selesai | `test:db` ditambah 3 pemeriksaan: kendala tanpa ubah status; tiga alasan tolak lewat RPC; tamu membaca isi tersembunyi, kode laporan asli, dan alasan tunda. **Hasil: 12/12 lulus** setelah 0009 diterapkan. Sebelumnya, pemeriksaan foto selalu gagal karena 0009 belum ada di DB. | `scripts/verifikasi-demo.mjs` |

**Pengukuran lokal (375×812, `next start`, tanpa throttling):**

| Halaman | DOMContentLoaded | JS terunduh | Elemen DOM |
|---|---:|---:|---:|
| `/` | 936 ms | 197 KB | 1.943 |
| `/laporan/SR-27RPCJ` | 1.080 ms | 232 KB | 708 |
| `/peta` (900 laporan) | 737 ms | 164 KB | 1.051 |
| `/prioritas` | 521 ms | 252 KB | 1.118 |
| `/kecamatan/31.74.010` | 479 ms | 180 KB | 1.008 |

TTFB semua halaman sekitar 10 ms. `/contoh?jenis=terlambat` membaca maksimal 1.000 baris kendala dari `v_timeline_publik`.

### Perbaikan lain yang ikut dikerjakan

- `scripts/siapkan-demo.mjs` tidak lagi menjalankan ulang `0007`. Dulu ini akan mengembalikan `agency_report_card` ke versi sebelum `0008`, dan sekarang juga akan membuang kolom view dari `0010`. Skrip mewajibkan migrasi 0001–0010 sudah diterapkan, lalu memakai duplikat dan kendala dari data contoh.
- Data contoh: nama "Setia Budi" ikut diperbaiki menjadi "Setiabudi", sesuai geojson.
- Halaman laporan konten melanggar tidak lagi menulis kalimat "isi disembunyikan" dua kali.

### Migrasi 0009 diterapkan (10 November)

`0009_foto_dan_dukungan.sql` dibuat 30 Okt di branch UI, tetapi belum pernah diterapkan ke Supabase. Akibatnya selama ini:

- tombol dukung tidak tahu apakah pengguna sudah mendukung, dan mengklik lagi justru menghapus dukungan;
- karantina foto konten melanggar diam-diam terlewati;
- `create_report` menerima URL foto apa saja.

Sebelum diterapkan, sudah dicek:

- **Tidak menimpa perubahan manual.** Isi `create_report`, `update_report_status`, dan `similar_reports` di DB sama persis dengan 0003, dan tanda tangannya sama dengan 0009, jadi fungsinya diganti di tempat tanpa membuat versi ganda.
- **Bucket tidak berubah perilakunya.** `foto-laporan` dan `bukti` sudah memakai batas 5 MB dan JPG/PNG/WebP. Yang baru hanya bucket privat `karantina`. Ada 26 berkas lama (terbesar 0,9 MB), semuanya aman.
- **Form lapor versi `main` tetap jalan.** Pengunggahnya memakai path `<uid>/<uuid>.<ext>` yang sama, jadi lolos `foto_sah`.
- **Diuji di dalam transaksi yang di-rollback:** `test:db` 13/13 lulus (ditambah cek bucket karantina). Lalu `sudah_dukung` berubah false → true setelah mendukung, `similar_reports.didukung` = true, dan tamu ditolak.

Sesudah diterapkan: fungsi `foto_sah` dan `sudah_dukung` ada; bucket `bukti` (publik), `foto-laporan` (publik), `karantina` (privat); `npm run test:db` 12/12 lulus.

### Masih terbuka

1. **2.6:** uji ke 3–5 orang awam.
2. **3.5:** Lighthouse mobile dengan 4G di HP/Chrome sungguhan, untuk `/`, `/laporan/[kode]`, `/peta`, `/prioritas`, dan `/kecamatan`. Catat hasilnya di sini.
3. **2.5:** hapus paket `recharts` atau pakai.
4. Batas waktu final submission tidak tercantum di lembar FDS.

Sudah beres sejak daftar ini ditulis:

- **Rilis `dev` → `main`:** PR #21, `c37176f`. Tes CI lulus, deploy Vercel sukses.
- **Tautan demo:** tidak bermasalah. Produksi ada di https://suarakyatt.vercel.app; catatan "404" sebelumnya keliru karena domainnya salah ketik.
