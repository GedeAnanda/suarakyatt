# Audit QA, UI/UX, dan bisnis — 11 November 2026 (siang)

> Lanjutan dari [audit kesiapan lomba pagi ini](audit-kesiapan-lomba-2026-11-11.md) dan [perbaikannya](perbaikan-audit-2026-11-11.md). Temuan di dua dokumen itu tidak diulang di sini. Audit ini menjawab: **dari sisi alur warga, tampilan HP, huruf, animasi, dan bisnis, apa lagi yang kurang?**
>
> Yang diaudit adalah folder kerja saat ini: `dev` (`194b599`) ditambah perbaikan pagi tadi yang **belum di-commit** (20 file). Build produksi lokal dijalankan di port 3200. Lint, 57 tes, typecheck, dan build lulus.

## Ringkasan cepat

- **Status sore:** keenam P1 sudah diperbaiki dan diuji di branch `fix/p1-hp` (belum di-commit). Rinciannya di [Hasil perbaikan P1](#hasil-perbaikan-p1-11-november-sore).
- **Tidak ada yang merusak demo.** Hasil pengujian:
  - 25 rute × 3 lebar layar tanpa galat JavaScript, hydration error, permintaan gagal, atau halaman melebar;
  - 119 tautan internal semuanya berfungsi.
- **Ada 6 masalah serius (P1) yang terasa langsung di HP:**
  1. Tombol melayang "ke atas" dan "?" menutupi isi, termasuk tombol **Kirim laporan**. Area di atas tombol "?" juga menelan ketukan, padahal tidak ada apa-apa di sana.
  2. Peta Leaflet "menjebak" jari: di `/peta` dan `/lapor`, usapan ke atas menggeser peta, bukan halaman.
  3. Kartu "laporan serupa" di form lapor hancur di HP: kode terpotong dan keterangan tampil satu kata per baris.
  4. Tautan "Cara urutan dihitung" (dari menu, panel "Kenapa belum?", dan Kecamatan) mendarat ±4.700 px dari tujuannya.
  5. Layar pertama Beranda belum menjelaskan situs ini untuk apa. Tidak ada kata warga, Jakarta, atau contoh masalah, dan bedanya dengan JAKI/LAPOR! baru muncul di dasar halaman.
  6. Kartu rapor di Beranda menghapus label "(simulasi)", sehingga nama dinas buatan bisa dikira penilaian dinas sungguhan.
- **Bisnis:** menurut PRD, **Final Submission jatuh hari ini (11 Nov)**, dan penyisihan dinilai dari proposal dan video. Jadi yang paling menentukan hari ini:
  - versi baru ter-deploy ke `main` (produksi masih versi lama);
  - kalimat pembeda di layar pertama dan di detik pertama video;
  - cerita adopsi pemerintah (B2G) dan keberlanjutan di proposal;
  - bukti uji warga.
- **Skill yang dipakai:** `ui-ux-pro-max` (checklist 10 kategori) dan `web-design-guidelines`. Audit dikerjakan oleh 3 auditor paralel (QA alur, UI/UX visual dan kode, produk/bisnis) ditambah penelusuran saya sendiri di HP 390 px. Temuan utama dicek ulang ke kode dan screenshot.
- **Yang perlu dikerjakan hari ini:** lihat [Urutan kerja hari ini](#urutan-kerja-hari-ini).

## Cara audit

| Bagian | Cara | Bukti |
|---|---|---|
| QA alur | Chrome headless, emulasi HP 360/390/412 (sentuh) dan desktop 1440. Login demo warga dan admin. Permintaan tulis ke database diblokir; Dukung ditekan lalu dibatalkan (0→1→0). | Skrip dan screenshot di scratchpad sesi (lokal, tidak di-commit) |
| UI/UX | 16 rute di 412×823 dan 360×800. Inventaris ukuran huruf, warna, gerak, dan target sentuh dari kode. Pengukuran zona ketuk dan posisi elemen. | Sama |
| Bisnis | PRD, README, FDS, `/tentang`, Beranda, `/sumber-data`, dan penelusuran HP 360. Grep analytics, privasi, dan berbagi. | Sama |
| Penelusuran sendiri | Beranda (±12 layar), form lapor, contoh terlambat, menu, Prioritas, dan Rapor di HP 390. | Sama |

**Tidak dilakukan:**

- kirim laporan, ubah status, rating, atau unggah foto;
- HP fisik, Safari iOS, atau Firefox;
- pembaca layar manual;
- profil FPS di HP murah.

## Urutan kerja hari ini

Diurutkan dari dampak terbesar terhadap juri dan video, dengan usaha terkecil.

1. **Commit perbaikan pagi tadi, lalu rilis `dev` → `main`.** Produksi masih versi lama, belum ada tombol "Coba ubah prioritas", dan fungsinya masih di `iad1`. Setelah deploy:
   - cek 6 tautan `/contoh`;
   - cek login demo warga dan admin;
   - cek `x-vercel-id` berisi `hnd1`.

   **Baru setelah itu rekam video.** (BZ1)
2. **Perbaiki 6 P1 di bawah.** Semuanya perubahan kecil, ±2–3 jam total.
3. **Teks proposal dan video (bukan kode):**
   - satu kalimat pembeda: "JAKI dan LAPOR! menjawab *laporanku sampai mana*; SUARAKYAT menjawab *kenapa belum*";
   - SUARAKYAT sebagai lapisan penjelas di atas kanal resmi;
   - jalur adopsi B2G 4 tahap dan opsi pembiayaan, diberi label hipotesis. (BZ2, BZ3, BZ5)
4. **Uji warga T1, T2, T4 ke 3–5 orang,** lalu tulis angkanya apa adanya di [kit uji](uji-warga-2026-11-10.md#hasil). (BZ4)
5. **Bekukan kode** beberapa jam sebelum tenggat.

## A. Masalah serius (P1)

| ID | Masalah | Lokasi | Bukti | Perbaikan terkecil |
|---|---|---|---|---|
| **P1-1** (UX1, QA17, QA18) | **Tombol melayang menutupi isi dan menelan ketukan.** "Ke atas" dan "?" bertumpuk di kanan bawah dan menutupi tombol Kirim laporan, saringan admin, legenda peta, dan teks footer. Wadahnya (44×96 px) tetap menerima ketukan walaupun "ke atas" tersembunyi, jadi ketukan ke peta atau pilihan di bawahnya tidak jalan. Tombol ini juga tergambar di atas latar laci menu. | `components/TombolMelayang.tsx:38`, `:46` | Dicoba: ketukan jatuh ke wadah di `/peta`, `/`, dan `/kecamatan`. Screenshot form lapor. | Wadah `pointer-events-none`, tiap tombol `pointer-events-auto` (pola yang sama sudah ada di `Pengumuman.tsx:43`). Beri ruang kosong di bawah footer dan form khusus HP. Sembunyikan saat laci terbuka. |
| **P1-2** (QA3) | **Peta menjebak gulir di HP.** Di `/peta`, peta 356×591 dari layar 844. Usapan vertikal menggeser peta (−365 px), halaman tidak bergerak. Sama di `/lapor`. Daftar pengganti peta dan tombol Kirim ada di bawahnya. | `components/PetaDasarLeaflet.tsx:74` | Dicoba (emulasi sentuh) | Di layar sentuh, peta digeser dengan dua jari, ditambah petunjuk "geser dengan 2 jari", **atau** tinggi peta di HP dibatasi ±45svh. |
| **P1-3** (QA2) | **Kartu "laporan serupa" hancur di HP.** Lebar kolom teks hanya 3–55 px: kode terpotong ("SR-" lalu "JM7X8E"), keterangan satu kata per baris. Padahal ini jalur "cukup Dukung, tidak perlu lapor lagi". | `components/lapor/FormLaporan.tsx:462-483` | Dicoba dan dicek ulang dari screenshot 390 px | Kolom teks diberi lebar minimum (`basis-40` / `min-w-40`), tombol Dukung `w-full sm:w-auto`. |
| **P1-4** (QA1) | **"Cara urutan dihitung" mendarat di tempat salah.** Gulir terjadi sebelum isi Prioritas selesai di-stream, lalu isi yang datang mendorong tujuan ±4.700 px ke bawah (desktop ±2.600 px). Yang terlihat malah peta. | `app/prioritas/page.tsx:93`, `components/prioritas/Simulator.tsx:142` | Dicoba di HP 390 dan desktop | Gulir ulang `#cara-hitung` setelah isi tampil, dengan cara yang sama seperti `#coba-atur`. |
| **P1-5** (QA11, BZ2) | **Layar pertama tidak menjelaskan situs ini.** Teks yang terlihat hanya "Kenapa belum? Lihat alasan suatu masalah didahulukan. Coba ubah prioritasnya." Tidak ada warga, Jakarta, lapor, atau contoh masalah. Kata JAKI baru muncul di y≈9.915 dari 10.587 px. Tugas T1 kit uji warga persis menanyakan ini. | `components/beranda/HeroCari.tsx` | Dicoba di HP 360/390 | Kalimat hero menyebut warga Jakarta dan contoh masalah (jalan rusak, saluran, sampah, lampu), ditambah satu baris pembeda dengan JAKI/LAPOR!. |
| **P1-6** (BZ8, UX14) | **Kartu rapor di Beranda menghapus "(simulasi)".** "Dinas Tata Air" dan "Dinas Kebersihan" mirip nama dinas DKI di masa lalu (perlu dicek). Tanpa label, nilai D bisa dibaca sebagai serangan ke dinas sungguhan. Halaman admin juga masih memakai "(simulasi)", bukan "(data buatan)". | `app/page.tsx:60`, halaman admin | Kode | Tampilkan "(data buatan)" seperti di `KartuRapor.tsx:89`, juga di kalimat ringkasan `/rapor`. |

## B. Alur dan QA (P2–P3)

| ID | Tingkat | Masalah | Lokasi | Perbaikan terkecil |
|---|---|---|---|---|
| QA4 | P2 | Panel "Kenapa belum?" menutup sendiri saat chip "Isi laporan" atau tautan "riwayat penanganan" diketuk, lalu layar meleset ±900 px. | `components/laporan/PanelKenapaBelum.tsx:33-42` | Simpan status buka ke `useState` sekali saat hash awal `#kenapa-belum`. |
| QA5, UX4 | P2 | Chip lompat (Status, Kenapa belum?, Isi laporan, Riwayat) menutupi judul tujuannya. Judul mendarat di y=80, padahal chip menutup sampai y=125. Chip "Alasan tolak" menyembunyikan alasannya. (WCAG 2.4.11) | `app/laporan/[kode]/page.tsx:169/207/251`, `globals.css:136` | `scroll-mt-36` pada h2 tujuan. |
| QA6 | P2 | Tombol back setelah login demo memantul ke `/lapor`. Di console muncul `ERR_TOO_MANY_REDIRECTS` dari redirect tamu yang tersimpan di cache. | `components/TombolDemo.tsx:53`, `proxy.ts:16` | `location.replace`, dan `Cache-Control: no-store` pada pengalihan. |
| QA7 | P2 | Di `/masuk` HP, tombol "Coba sebagai warga/petugas dinas" baru muncul di y≈866–1.074. Layar pertama hanya form email dan password; juri bisa mengira harus mendaftar. | `app/masuk/page.tsx:51` | Di HP, panel demo tampil lebih dulu (`order-first lg:order-none`). |
| QA8, UX10 | P2 | Tabel admin di HP: tombol "Buka" di x=842 (di luar layar). Kode laporan tampak seperti tautan tapi bukan. | `components/admin/TabelLaporanAdmin.tsx:137/158` | Jadikan kode laporan tautan ke detail. |
| QA9 | P2 | Di HP, setelah memilih "pilihan cepat" di Prioritas, perubahan urutan tidak terlihat. Tombolnya di y≈5.955, sedangkan daftar urutan di y≈3.486. | `components/prioritas/Simulator.tsx:414` | Di kotak hasil HP, tampilkan 3–5 baris teratas beserta naik/turunnya. |
| QA10 | P2 | Usapan vertikal yang dimulai di atas slider ikut mengubah nilai (100→50) dan URL. Baru diuji di emulasi; perlu dicek di HP fisik. | `globals.css:859` | `touch-action: pan-y` pada slider, atau slider hanya merespons geser horizontal. |
| UX11 | P2 | Tombol zoom peta hanya 30×30 px di layar sentuh, padahal warga diminta memperbesar peta. Aturan `.leaflet-touch` menimpa aturan 40 px proyek. | `globals.css:917` vs `leaflet.css:324` | Naikkan spesifisitas, ukuran 44 px. |
| QA12 | P3 | Deep link `#hash` saat halaman dimuat penuh tidak menggulir (`/tentang#tanya-jawab`, `/sumber-data#foto`). | — | Pola gulir ulang yang sama dengan P1-4. |
| QA13 | P3 | Soft-404: `/laporan/SR-ZZZZZZ` dan `/kecamatan/99.99.999` mengembalikan HTTP 200 dengan judul tab seolah halamannya ada. | `generateMetadata` | Panggil `notFound()` dari metadata, atau beri judul "Tidak ditemukan". |
| QA14 | P3 | Halaman "kode tidak ditemukan" tidak menampilkan kode yang dicari. Kirim kosong di `/lacak` tidak memberi tanggapan. Contoh kode di kolom terpotong (UX5). | `components/CariKode.tsx:28-37` | Tampilkan kodenya. Label "Kode laporan" terlihat, placeholder cukup `SR-ABC234`. |
| QA15 | P3 | Spanduk "Foto perlu ditambahkan lagi" tetap tampil setelah foto ditambahkan. | `FormLaporan.tsx:371` | Sembunyikan saat jumlah foto > 0. |
| QA16 | P3 | **Admin:** pesan validasi abu-abu tanpa ARIA; kode rujukan duplikat sama dengan kode laporan sendiri lolos; "instansi Anda" dan "Laporan instansi" tidak sesuai kamus. | `app/admin/laporan/[kode]/page.tsx:88/125` | Ganti teks; tolak rujukan ke diri sendiri. |
| QA19 | P3 | Setiap ketukan chip lompat menambah satu entri riwayat, jadi keluar butuh beberapa kali back. | Detail laporan | `history.replaceState` untuk lompat di halaman yang sama. |

## C. Tampilan, huruf, warna, dan gerak (UI/UX)

### Sistem visual saat ini

- **Huruf:**
  - Satoshi Variable saja, bobot 400/500/600/700. Angka tabular berjalan (dipakai 118×).
  - **Skala:** mini 13, kecil 15, badan 16, lead 18, sub 20, seksi 22–28, judul 28–38, hero 40–68 px. Ditambah 17 ukuran bebas.
  - Isi halaman didominasi teks abu-abu 15 px (40–69% karakter).
- **Warna:**
  - latar `#f4f8f7`, teks `#0f2a33`, aksi teal `#0f766e` (teks putih di atasnya 5,5:1);
  - pasangan warna status lulus AA;
  - peta memakai skala GnBu;
  - hanya mode terang.
- **Bentuk:** radius 8/12/16 px, ditambah 6 px yang belum jadi token. 3 token bayangan.
- **Gerak:**
  - kurva expo-out dan pegas;
  - masuk halaman naik 8 px dalam 420 ms, isi susulan 640 ms;
  - muncul saat digulir;
  - riak, tetesan, dan animasi ikon;
  - ±25 durasi berbeda.

### Temuan

| ID | Tingkat | Masalah | Lokasi | Perbaikan terkecil |
|---|---|---|---|---|
| UX2 | P2 | **Status laporan justru paling kecil.** "• Menunggu" (13 px, tanpa latar) mirip "• Data buatan": sama-sama titik dengan teks cokelat. Padahal status adalah jawaban inti bagi warga. | `BadgeStatus.tsx:79`, `LabelSumber.tsx:38` | BadgeStatus 15 px dengan latar `GAYA_STATUS` yang sudah ada. "Data buatan" memakai ikon info, tanpa titik. |
| UX3 | P2 | **Kepala halaman memakan 59–82% layar pertama di HP 360.** Tombol Kembali, jejak, judul, pengantar, dan pita "Data buatan" beserta keterangannya. Peta laporan baru mulai di y=737. | `KepalaHalaman.tsx:33-55`, `BannerSimulasi.tsx` | Di bawah 640 px, jejak disembunyikan (tombol Kembali sudah ada). Keterangan pita dipindah ke `<details>`; pitanya tetap tampil. |
| UX6 | P2 | **9 animasi tanpa akhir** setelah memilih nomor kecamatan di Beranda: peta melayang, 4 pin naik-turun, dan 4 pin berputar di atas peta yang dikaburkan. Membebani baterai HP murah dan mengganggu saat membaca. Pin berwarna merah, padahal teksnya menyebut warna mengikuti status. | `globals.css:1072-1148`, `KecamatanTimbul3D.tsx:103` | Batasi 2–3 putaran. Warna pin pakai `WARNA_TITIK`. Mode kurangi gerak sudah benar. |
| UX7 | P2 | **Kartu dan tautan tidak memberi tanda saat disentuh,** karena sorotan ketuk dimatikan dan `.kartu-klik` hanya punya `:hover`. Di HP terasa seperti tidak terjadi apa-apa. | `globals.css:138` | `-webkit-tap-highlight-color: rgb(15 118 110 / .12)` atau `.kartu-klik:active`. |
| UX8 | P2 | **Data penting masih 13 px:** poin "+30 dari 30 poin", status, waktu, dan dukungan di kartu laporan. Jumlah dukungan tampil sebagai "⇧ 1" tanpa kata. | `--text-mini` (31 pemakaian), `FaktorAwam.tsx:30`, `KartuLaporan.tsx:50` | `--text-mini` ke 14 px. Tulis "1 dukungan". |
| UX9 | P2 | **Navigasi HP bergantung pada ikon:** menu "≡" tanpa kata (40 px), Lacak di header hanya ikon. Prioritas dan Rapor, pembeda utama, tersembunyi di laci untuk lansia. | `TombolMenu.tsx:29`, `Header.tsx:149` | Di ≥390 px tampilkan kata "Menu" dan "Lacak". Tombol menu `size-11`. |
| UX12 | P3 | Ukuran h2 berganti-ganti (18/20/22 px) di halaman yang sama, dan ada h3 sebelum h2. | Beberapa halaman | Satu kelas `judul-seksi` untuk semua h2. |
| UX13 | P3 | `.ganti` dan `.timbul` masih memudar dari opacity 0, termasuk di layar pertama Beranda. Ada ±25 durasi berbeda. | `globals.css` | Samakan ke 3 durasi (cepat 200, sedang 400, lambat 640). |
| UX14 | P3 | **Nama tidak seragam:** satu halaman punya tiga nama ("Cara menilai instansi", "Cara rapor dihitung", "Panduan rapor"); jejak detail laporan berakhir di "Lacak laporan"; "▷ Lanjut" terbaca seperti "berikutnya"; admin masih "respons" dan "instansi Anda". | Beberapa | Satu nama per halaman; jejak berakhir di kode laporan. |
| UX15 | P3 | Warna grafik memakai hex mentah. Oranye kontrasnya hanya 2,51:1, dan merah dipakai untuk faktor "Warga kurang mampu" (merah biasanya berarti bahaya). Legenda "80—100" pecah di 360 px. | `BarKontribusi` | Pakai token. Ganti warna faktor itu. |
| UX17 | P3 | "Ada kendala" memakai ikon dan warna yang sama dengan "Menunggu". | Badge | Ikon dan warna sendiri. |
| UX18–20 | P3 | Masih ada target sentuh 23–40 px: pemicu Istilah di Rapor, BarKontribusi, FaktorAwam; tautan footer (jarak 4 px); panel Bantuan; kolom cari admin. `min-h-11` pada tautan di dalam paragraf membuat jarak baris bolong. | `app/rapor/page.tsx:92`, Footer | Ruang ketuk 44 px untuk kontrol mandiri; tautan di dalam kalimat dibiarkan. |
| UX21 | P3 | Di HP, tombol hero "Lacak laporan" mengulang tab Lacak yang sudah terbuka tepat di bawahnya. Header juga punya ikon Lacak. | `HeroCari.tsx` | Ganti tombol kedua di hero jadi "Lapor masalah", atau hapus. |
| UX22 | P3 | Mode gelap tidak perlu. Tapi mode gelap otomatis Android bisa mewarnai ulang status. | `globals.css` | `color-scheme: only light` (cek di HP). |
| UX23 | P3 | Kode mati: `IkonKategori`, 8 token `kt-*`, `PembukaHalaman`. | — | Hapus. |
| UX24–27 | P3 | Tanda `*` tanpa keterangan. Dua kerangka berturut-turut saat pindah halaman. "STATUS SEKARANG" satu-satunya label huruf kapital. "?" tidak berubah jadi tombol tutup saat panel Bantuan terbuka. | — | Kecil-kecil. |
| (saya) | P3 | "Kenapa tertunda: alasan lain." terasa kosong saat kategori alasannya "lainnya". | Detail laporan | Untuk "lainnya", tampilkan catatannya langsung tanpa label kategori. |

## D. Produk dan bisnis

**Rubrik lomba:** dari PRD bagian 2, penyisihan dinilai dari proposal dan video tanpa demo langsung. Final onsite 28 Nov: pitch maksimal 15 slide, 10 menit. Rubrik resmi panitia tidak ada di repo, jadi poin di bawah tidak mengarang kriteria. Saran bisnis adalah opini dan belum divalidasi.

| ID | Dampak | Celah | Langkah terkecil | Usaha |
|---|---|---|---|---|
| BZ1 | Tinggi | Juri dan video akan melihat versi lama, karena produksi belum memuat perbaikan sejak PR #21. | Commit, rilis ke `main`, cek, baru rekam. | 1–2 j |
| BZ2 | Tinggi | Bedanya dengan JAKI/LAPOR! tidak terlihat di layar pertama (lihat P1-5). | Satu kalimat di hero dan di detik pertama video. | 0,5 j |
| BZ3 | Tinggi | Warga tidak punya alasan nyata untuk melapor di sini: laporan tidak diteruskan, dan laporan JAKI tidak bisa dicek di sini. | Di proposal dan video: SUARAKYAT adalah lapisan penjelas di atas kanal resmi; form lapor hanya peraga sumber data. | 1 j teks |
| BZ4 | Tinggi | Belum ada bukti warga paham: tabel hasil uji masih kosong. | Uji T1, T2, T4 ke 3–5 orang; tulis apa adanya. | 2–3 j |
| BZ5 | Sedang–Tinggi | Belum ada cerita B2G: nilai bagi dinas, jalur adopsi, siapa membayar, risiko politis rapor publik. | Satu halaman proposal dan satu slide (lihat di bawah). | 1–2 j |
| BZ6 | Sedang | Tidak ada kebijakan privasi, persetujuan saat daftar, atau kontak tim. Titik laporan tampil presisi penuh (UU PDP 27/2022). | Halaman `/privasi` singkat, satu kalimat di bawah tombol Daftar, tautan di footer, email tim, dan teks "titik tampil publik" di form. | 1,5–2 j |
| BZ7 | Sedang | Moderasi lemah. Laporan akun asli langsung tayang dan tidak ikut terhapus saat reset malam. Tidak ada tombol "laporkan isi". Tidak ada larangan menulis nama atau nomor HP. | Petunjuk di langkah 4 form, tautan "Laporkan isi tidak pantas" (mailto), cek manual laporan asli sebelum submit. | 1 j |
| BZ9 | Sedang | Gambar pratinjau (OG) satu untuk semua halaman dan usang ("Dashboard prioritas", "Rapor instansi"), tanpa label data buatan. Tidak ada tombol WhatsApp. Rapor dan kecamatan tidak bisa dibagikan. | Kartu OG statis baru; tautan `wa.me/?text=` di laporan, kecamatan, dan simulator. | 1,5 j |
| BZ10 | Sedang | Panel "Kenapa belum?" berakhir tanpa ajakan bertindak. | Bagian "Yang bisa kamu lakukan": dukung, bagikan, lapor resmi lewat JAKI, bawa ke Musrenbang. | 1 j |
| BZ11 | Sedang | Beranda menyebut "bahan usulan Musrenbang", tapi tidak ada cara mencetak atau mengunduhnya. | Lunakkan kalimatnya sekarang; cetak ringkasan masuk roadmap. | 0,2 j |
| BZ12 | Sedang | Tidak ada analytics sama sekali (grep kosong), jadi tidak ada angka untuk final 28 Nov. | Vercel Web Analytics (tanpa cookie), lalu tulis KPI. | 0,5 j |
| BZ13 | Sedang | Tidak ada yang membuat warga kembali: notifikasi, ikuti laporan, ringkasan mingguan. Teks sukses lapor sendiri menulis "Kami tidak mengirim pemberitahuan". | Roadmap: ikuti laporan atau kecamatan, ringkasan email/WhatsApp. | 2–4 hari |
| BZ14 | Rendah–Sedang | Peran Perencana (riwayat keputusan, salah satu pembeda) tidak bisa dicoba juri. | Tunjukkan di video dengan akun perencana tim. | 0 j |
| BZ15 | Rendah | Nama tim dan repo tidak tampil di situs. | Blok Tim dan tautan GitHub di `/tentang`. | 0,5 j |

### B2G dan keberlanjutan (opini, tulis sebagai hipotesis)

- **Nilai bagi dinas:** "Catat kendala" menjawab "kenapa belum" lebih dulu. Hipotesisnya, keluhan yang berulang berkurang.
- **Jalur adopsi:**
  1. Mandiri di atas data terbuka.
  2. Pilot lewat forum Musrenbang kelurahan.
  3. Integrasi baca saja dengan kanal resmi.
  4. Modul "prioritas yang bisa dijelaskan" untuk Bappeda.
- **Pembiayaan:** hibah civic-tech, pengadaan pemda, CSR, atau open source dengan jasa implementasi. Tulis sebagai model yang akan diuji, bukan proyeksi pendapatan.
- **Risiko politis rapor publik:**
  - Mitigasi yang sudah ada: huruf maksimal C kalau penolakan tinggi, sampel dan periode tampil, alasan tunda dari dinas.
  - Yang perlu ditambah: hak jawab dinas, rapor per layanan (bukan per pejabat), dan label "buatan" di setiap kartu.
- **API JAKI / SP4N-LAPOR!:** belum ada bukti di repo bahwa API-nya tersedia. Jangan diklaim.

### KPI usulan

- % peserta uji yang lulus T1 (situs untuk apa), T2 (kenapa belum beres), dan T4 (kecamatanku dalam 30 detik).
- % kunjungan yang membuka "Kenapa belum?" atau mengubah aturan.
- Kunjungan yang masuk lewat URL `?bobot=` atau `/laporan/` (tanda dibagikan).
- % laporan terlambat yang punya alasan tunda.
- Jumlah kelurahan atau dinas yang bersedia ikut pilot.

### Video 3–5 menit

- **Urutan:**
  1. tim;
  2. `/contoh?jenis=terlambat`: Status sekarang + Kenapa belum?;
  3. simulator "Utamakan keselamatan", lalu bagikan URL-nya;
  4. rapor yang ditahan di C;
  5. satu kecamatan;
  6. admin mencatat kendala;
  7. batas data;
  8. rencana pengembangan dan KPI.
- **Pangkas:** peta klaster, daftar kategori, animasi angka, kartu peran, foto Batavia, dan detail form lapor.
- **Tiga kekuatan untuk ditonjolkan:**
  1. "Kenapa belum?" yang jujur: alasan tunda dari dinas dan posisi di urutan prioritas dalam satu kotak, bukan janji tanggal.
  2. Simulator aturan publik tanpa login, dengan URL yang bisa dibagikan dan riwayat perubahan.
  3. Integritas sejak rancangan: rapor ditahan di C kalau banyak menolak, laporan ditolak tetap tampil, dan label data buatan di setiap halaman.

## Yang sudah baik, pertahankan

- **Teknis:**
  - 25 rute × 3 lebar tanpa galat, dan 119 tautan internal berfungsi;
  - lint, 57 tes, typecheck, dan build lulus.
- **Lapor:**
  - 4 langkah dengan ringkasan, galat per langkah yang bisa difokus, dan peringatan foto wajah/plat;
  - deteksi kecamatan, termasuk di luar Jakarta;
  - GPS diizinkan, ditolak, dan di luar Jakarta semuanya tertangani;
  - draf pulih setelah reload, back mempertahankan isian (termasuk foto), dan tidak ada unggahan sebelum Kirim.
- **Lacak:** menormalkan huruf kecil, spasi, tanda pisah panjang, dan kode tanpa "SR".
- **Detail laporan:**
  - 6 skenario `/contoh` benar, panel otomatis terbuka untuk laporan terlambat;
  - tautan ke laporan asli pada duplikat berjalan;
  - Salin kode dan Bagikan ada.
- **Prioritas:** pilihan cepat, URL, reload, back/forward, reset, dan parameter tidak sah tertangani.
- **Gerak:** `prefers-reduced-motion` dipatuhi menyeluruh, di CSS maupun JS. Animasi masuk halaman sudah tanpa opacity.
- **Form akun:** label terlihat, `autocomplete`, tampilkan sandi, dan galat per kolom.
- **Komponen dan peta:**
  - satu komponen Tombol dengan target 44 px di layar sentuh;
  - status selalu ditulis dengan kata, bukan warna saja;
  - menu HP terkelompok dan berlabel;
  - daftar sebagai pengganti peta.
- **Kejujuran:** label data buatan di setiap halaman, dan halaman sumber data jujur soal status verifikasi BPS.

## Yang belum diuji

- **Alur tulis:** kirim laporan beserta unggahan, simpan status atau kendala, rating, batal, daftar, email, dan simpan aturan (perencana).
- **Perangkat:** HP fisik, Safari iOS (safe area sungguhan), Samsung Internet (mode gelap paksa), dan Firefox. P1-2 dan QA10 baru diuji dengan emulasi.
- **Aksesibilitas dan tampilan:** pembaca layar manual, landscape, zoom 200%, dan mode huruf besar di semua alur baru.
- **Lainnya:** profil FPS/CPU di HP murah, mode data cadangan, dan lembar Bagikan bawaan HP.

## Roadmap setelah lomba

1. Agregat CRM DKI nyata untuk "Kenapa belum?" per kecamatan; kelayakan dataset perlu dicek dulu.
2. OG dinamis per laporan, kecamatan, dan percobaan aturan, ditambah QR untuk RT/RW.
3. Ikuti laporan atau kecamatan, plus ringkasan mingguan.
4. Cetak/PDF ringkasan untuk Musrenbang.
5. Moderasi sebelum tayang, blur wajah dan plat, titik publik dibulatkan.
6. Hak jawab dinas dan masa uji rapor yang tertutup.
7. Pilot satu kecamatan, dengan validasi bobot bersama warga dan Bappeda.

## Hasil perbaikan P1 (11 November sore)

Dikerjakan di branch `fix/p1-hp` (dari `dev` setelah PR #26, tanpa upstream). Semua diuji di build produksi lokal dengan Chrome headless, emulasi HP sentuh.

| P1 | Perubahan | Berkas | Hasil uji |
|---|---|---|---|
| P1-1 tombol melayang | Wadah `pointer-events-none`; tombol dan panel Bantuan `pointer-events-auto`. Tombol disembunyikan saat laci menu terbuka. Footer di HP diberi ruang 4 rem di bawah. | `TombolMelayang.tsx`, `Footer.tsx`, `globals.css` | Ketukan di area "ke atas" yang tersembunyi kini sampai ke isi di bawahnya (kartu peta di `/peta`, tab di `/`). Tombol "?" tetap bisa diketuk. |
| P1-2 peta menjebak gulir | Di HP peta setinggi 50svh (`/peta`) dan 45svh (`/lapor`); layar ≥640 px tetap seperti dulu. Tombol zoom 44 px di layar sentuh (aturan `.leaflet-touch` bawaan tidak lagi menimpa). | `PetaLaporan.tsx`, `PetaPinLeaflet.tsx`, `FormLaporan.tsx`, `app/peta/page.tsx`, `globals.css` | HP 390×844: peta 356×422 dan 316×380, jadi selalu ada ruang di luar peta untuk menggulir. Tombol zoom 44×44. |
| P1-3 laporan serupa | Kolom teks `min-w-40`; tombol Dukung selebar kartu di HP. | `FormLaporan.tsx` | Lebar kolom teks 220 px (360) dan 166 px (390), sebelumnya 3–55 px. Kode tidak terpotong lagi. |
| P1-4 `#cara-hitung` | Gulir ulang setelah isi Prioritas tampil, lalu sekali lagi dua frame kemudian. Guliran halus bawaan browser ke fragmen masih berjalan dan sisanya ikut tertambah, sehingga tanpa ulangan meleset 100–290 px. | `Simulator.tsx` | Dibuka langsung: 8 dari 8 percobaan mendarat tepat di y=176, termasuk saat server baru menyala. Lewat klik tautan: y=176 di HP dan desktop. Tombol hero `#coba-atur` tetap memfokuskan panel. |
| P1-5 hero | Kalimat hero menyebut jenis masalah dan Jakarta. Ditambah satu baris pembeda: "JAKI dan LAPOR! menunjukkan laporanmu sampai mana. SUARAKYAT menjelaskan kenapa belum." | `HeroCari.tsx` | Keduanya terlihat di layar pertama HP 360. |
| P1-6 label rapor | Kartu rapor di tab Beranda menampilkan "(dinas buatan)". | `app/page.tsx` | Keempat kartu memuat label itu, tetap rapi di 360 px. |

**Pemeriksaan umum:**

- 13 halaman di HP 360 px: lebar dokumen pas 360 px, tanpa galat JavaScript.
- Lint, typecheck, 57 tes, dan build lulus.

**Belum dicek:** P1-2 di HP fisik (gulir sungguhan di sekitar peta), dan Safari iOS.

