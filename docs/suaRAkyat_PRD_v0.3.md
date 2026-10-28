# suaRAkyat — PRD v0.3

> Versi Markdown dari `suaRAkyat_PRD_v0.3.pdf` (25 Okt 2026, @nand). Isi sama dengan PDF; tabel disusun ulang agar mudah dibaca. Diagram (alur status, timeline, sitemap) hanya ada di PDF — halamannya disebut di tempatnya. Kolom "Status" di tabel fitur dihapus karena di PDF semuanya masih "Belum mulai" (snapshot 25 Okt); progres nyata ada di git dan `docs/perbaikan-*.md`.

## Ringkasan cepat

- **Apa ini:** suaRAkyat membuka *alasan* di balik keputusan publik — kenapa satu masalah didahulukan, siapa yang lambat, dan apa yang berubah kalau bobot prioritas diganti.
- **Pembeda:** "transparansi lapis kedua". Lapis pertama (status laporan) sudah ada di CRM Jakarta & LAPOR!. suaRAkyat menambah: skor prioritas yang bisa dijelaskan + simulator bobot publik, Rapor Instansi A–E yang adil, dan riwayat keputusan publik.
- **Fitur khas:** tombol **"Kenapa belum?"** di tiap laporan dan **simulator bobot** tanpa login.
- **Data:** wilayah + statistik nyata (GeoJSON, BPS); laporan/status/rating simulasi dan selalu diberi label.
- **Stack:** Next.js + Supabase (Postgres/PostGIS, Auth, Storage, RLS) + Leaflet, deploy Vercel.
- **Tenggat:** First Draft 1 Nov, fitur dikunci 7 Nov malam, Final Submission 11 Nov, final onsite 28 Nov 2026.
- **Aturan yang harus diikuti persis saat ngoding:** bagian 7 (aturan bisnis), 8 (rapor), 9 (skor prioritas).

## Cara membaca dokumen ini

v0.3 menjadikan transparansi keputusan sebagai pusat cerita dan menutup celah yang ditemukan saat review (tabel kedua di bawah). v0.2 sebelumnya menyesuaikan PRD dengan aturan lomba WIA dan memangkas cakupan. Semua anggota wajib membaca bagian 2 (lomba), 5 (ruang lingkup), dan 14 (jadwal). Bagian 7 sampai 9 adalah aturan yang harus diikuti persis saat ngoding.

Semua yang ditandai *usulan* adalah default dari v0.2. Usulan baru sah setelah disepakati tim di bagian 16.

### Perubahan v0.1 → v0.2

| Bagian | v0.1 | v0.2 |
|---|---|---|
| Dashboard prioritas | Khusus admin | Publik (read-only); ubah bobot hanya akun Perencana |
| Papan skor | Tabel metrik per instansi | Rapor Instansi dengan nilai A–E |
| Metrik respons | Median waktu respons | Ditambah kepatuhan SLA respons; laporan yang belum direspons ikut dihitung |
| Rumus skor prioritas | Beberapa faktor belum terdefinisi | Semua faktor dan edge case terdefinisi |
| Ruang lingkup | Laporan serupa, bobot, penjelasan skor di "sebaiknya ada" | Masuk MVP karena dipakai di demo |
| Wilayah studi kasus | Belum dipilih | Usulan: DKI Jakarta daratan, unit kecamatan |
| Peta prioritas | Heatmap titik | Choropleth per kecamatan |
| Data simulasi | 150–300 laporan | 800–1.000 laporan, generator deterministik |
| Nama instansi | Contoh nama nyata | Nama generik bertanda simulasi |
| Bagian baru | — | Jadwal dan rubrik lomba, arah desain, pembagian peran, naskah video, aturan anti-curang |

### Perubahan v0.2 → v0.3

| Bagian | v0.2 | v0.3 |
|---|---|---|
| Pusat cerita | Rapor Instansi dan prioritas sejajar | Transparansi keputusan: penjelasan prioritas, simulator bobot, riwayat keputusan |
| Simulator bobot | Roadmap | MVP, untuk publik tanpa login (bagian 9) |
| Huruf rapor | Bisa A walau peringatan penolakan menyala | Maksimal C selama peringatan menyala |
| Faktor volume | Laporan aktif + upvote | Hanya laporan terverifikasi; upvote jadi faktor "dukungan warga" berbobot 0,05 |
| Rating kosong | Komponen K dihapus, bobot dibagi ulang | Rating netral 3/5 sebagai titik awal; susunan bobot selalu sama |
| Sumber data prioritas | Simulasi | Data CRM DKI nyata jika layak; rapor dan alur lapor tetap simulasi (bagian 10) |
| Akses demo | Harus daftar | Tombol "Coba sebagai warga demo" dan "Coba sebagai admin demo" |
| Ubah kategori, perkiraan tanggal | MVP | Sebaiknya ada |
| Bagian baru | — | Posisi terhadap CRM Jakarta dan LAPOR!, batas data nyata vs simulasi, jawaban pertanyaan juri |
| Fitur khas dan konsep | — | Konsep "transparansi lapis kedua", tombol "Kenapa belum?" di setiap laporan, jembatan ke Musrenbang |

## 1. Ringkasan produk

suaRAkyat membuat keputusan publik bisa dipahami dan diuji warga: kenapa sebuah masalah didahulukan, siapa yang lambat menanganinya, dan apa yang berubah kalau prioritas kebijakan diganti. Nama berasal dari gabungan *suara* dan *rakyat*.

Konsep intinya adalah **transparansi lapis kedua**. Lapis pertama adalah transparansi status (laporanku sampai mana), yang sudah dikerjakan CRM Jakarta dan LAPOR!. Lapis kedua adalah transparansi keputusan: kenapa laporanku belum dikerjakan, sementara yang lain duluan.

Pelacakan laporan, foto bukti, rating, bahkan penilaian kinerja internal sudah ada di kanal resmi seperti CRM Jakarta dan LAPOR! (tabel di bawah). Pembeda suaRAkyat ada di tiga hal yang belum terbuka untuk publik:

- **Prioritas yang bisa dijelaskan dan diuji.** Setiap isu wilayah mendapat skor 0–100 beserta rincian kontribusi tiap faktor. Siapa pun bisa menggeser bobot di simulator publik dan melihat peringkat berubah, tanpa mengubah keputusan resmi. Di setiap laporan, tombol "Kenapa belum?" menunjukkan posisi isunya dan faktor yang menahannya.
- **Rapor Instansi yang adil.** Nilai A–E per instansi selalu tampil bersama tingkat penolakan, ukuran sampel, dan periode, sehingga nilai bagus hasil membuang laporan langsung terlihat.
- **Riwayat keputusan.** Setiap perubahan bobot dan override oleh Perencana tercatat publik: siapa, kapan, dari berapa ke berapa, dan alasannya.

**Alur cerita:** Kenapa masalah ini didahulukan? → Uji bobotnya sendiri → Lihat siapa yang menangani dan seberapa baik → Dari mana datanya (lapor dan lacak).

**Kalimat pembuka untuk video dan pitch:** "Kanal pengaduan sudah melacak laporan. suaRAkyat membuka alasan di balik keputusan: kenapa satu masalah didahulukan, dan siapa saja bisa mengujinya."

| Subtema WIA | Diwujudkan lewat |
|---|---|
| Open Government Data | Batas wilayah (GeoJSON), penduduk dan kemiskinan (BPS), halaman Sumber Data |
| Public Service Tracking | Kode laporan, timeline status, indikator batas waktu (SLA) |
| Civic Reporting & Accountability | Laporan berbasis peta, verifikasi admin, Rapor Instansi publik |
| Data-Driven Decision Support | Skor prioritas dengan penjelasan dan simulator bobot publik; perbandingan layanan antar instansi dan wilayah |

### Posisi terhadap kanal yang sudah ada

Fitur dasar pengaduan sudah dimiliki kanal resmi, jadi tidak dijual sebagai inovasi. Kolom tengah berdasarkan penelusuran tim per Oktober 2026.

| Kemampuan | Kanal resmi (CRM Jakarta, LAPOR!) | suaRAkyat |
|---|---|---|
| Lapor dan lacak status | Sudah ada | Ada, sebagai sumber data |
| Foto bukti dan rating pelapor | Sudah ada | Ada, plus foto sebelum/sesudah berdampingan |
| Penilaian kinerja penanganan | Ada untuk internal pemerintah (Pergub DKI 128/2017) | Rapor publik dengan tingkat penolakan, sampel, dan periode |
| Alasan sebuah masalah didahulukan | Belum ditemukan terbuka untuk publik | Skor dengan rincian faktor dan kalimat penjelasan |
| Warga menguji bobot prioritas | Belum ditemukan | Simulator bobot publik |
| Riwayat perubahan keputusan prioritas | Belum ditemukan terbuka untuk publik | Riwayat bobot dan override dengan alasan |

Sumber: paparan pengelolaan aduan warga Jakarta, Pergub DKI Jakarta No. 128 Tahun 2017, artikel Hukumonline tentang CRM.

## 2. Lomba WIA: tenggat, deliverable, rubrik

Dua tenggat menentukan lolos atau tidak: **First Draft Submission 1 November** dan **Final Submission 11 November 2026**. Tim terdiri dari 1–3 orang dengan satu ketua. Finalis wajib hadir onsite; yang tidak hadir dianggap mengundurkan diri.

Jendela revisi resmi hanya 8–10 November, jadi semua fitur MVP harus sudah jalan saat mentor mereview draft (3–6 November). *(Diagram timeline WIA MIA 2026, 19 Okt–28 Nov: PDF hal. 5.)*

| Tahap | Tenggat | Yang dikumpulkan |
|---|---|---|
| First Draft Submission | 1 Nov 2026 | Repo publik (GitHub/GitLab) dengan README.md: judul + deskripsi 1–2 kalimat, tech stack, cara menjalankan (clone → install → run), progress saat ini. PDF maks 10 halaman / 10 MB, nama `WIA_FSDMIA2026_NamaTim`: konsep, sitemap, wireframe/mockup, fitur utama, screenshot minimal 2 halaman yang sudah jadi (wajib landing page). |
| Final Submission (penyisihan) | 11 Nov 2026 | Google Drive publik: proposal PDF maks 30 halaman pakai template panitia, nama `WIA_PenyisihanMIA2026_NamaTim`, dan surat orisinalitas bermeterai 10.000. Video YouTube publik maks 5 menit: perkenalan anggota (nama & peran), demo fitur utama, rencana pengembangan, deskripsi YouTube yang menarik. |
| Babak final (10 finalis) | 28 Nov 2026 | Pitch deck .pptx/.pdf maks 15 slide, presentasi 10 menit + tanya jawab 5 menit. Bawa laptop, prototype bisa diakses online plus cadangan offline, backup deck di Google Drive. |

Urutan slide final sudah ditentukan panitia: Cover → Latar Belakang & Masalah → Tujuan & Manfaat → Solusi/Fitur Utama → Demo Website → Rencana Pengembangan → Kesimpulan.

### Rubrik penyisihan dan strategi kita

Penyisihan dinilai dari proposal dan video, tanpa demo langsung. Karena itu video harus menunjukkan semua fitur MVP berjalan mulus.

| Kriteria | Bobot | Yang kita lakukan |
|---|---|---|
| Fungsionalitas Website | 25% | Cakupan dikunci (bagian 5). Fitur yang belum jadi disembunyikan, bukan tampil sebagai tombol mati. Deploy sejak hari pertama, uji di 3 ukuran layar. Tombol akun demo supaya juri bisa mencoba semua alur tanpa daftar. |
| Orisinalitas Ide & Konsep | 20% | Simulator bobot dan penjelasan prioritas jadi pembuka cerita, bukan form laporan. Posisi terhadap CRM Jakarta dan LAPOR! ada di bagian 1. |
| Desain & Estetika | 20% | Satu orang memegang design system (bagian 11). Mobile-first. |
| Konten & Informasi | 20% | Landing page yang jelas, definisi metrik, halaman Sumber Data, label simulasi, proposal rapi. |
| Kesesuaian Tema & Subtema | 15% | Keempat subtema ditunjuk eksplisit di video dan proposal (tabel di bagian 1). |

Rubrik final WIA: Orisinalitas & Konsep 15%, Fungsionalitas & UX 25%, Desain & Kreativitas Visual 20%, Presentasi & Komunikasi 20%. Jumlahnya baru 80% padahal tertulis total 100%, jadi perlu ditanyakan ke panitia (bagian 16). Kriteria presentasi menilai kontribusi nyata tiap anggota, jadi semua anggota harus ikut bicara.

Sistem gamifikasi (XP dan Diamond dari misi harian) layak diikuti. Diamond bisa ditukar tiket konsultasi mentor, dan panitia menyebut leaderboard bisa memengaruhi penilaian di poin tertentu.

## 3. Masalah, tujuan, non-tujuan

Warga sudah bisa melapor, tapi tidak bisa melihat apakah laporannya ditangani, siapa yang lambat, dan kenapa satu masalah didahulukan dari yang lain.

| Masalah | Jawaban suaRAkyat |
|---|---|
| Warga tidak tahu laporannya diproses atau menumpuk | Kode laporan dan timeline status yang bisa dilacak siapa saja |
| Kinerja instansi jarang terlihat publik, jadi tekanan transparansinya kecil | Rapor Instansi A–E yang terbuka |
| Pengambil keputusan tidak punya dasar objektif untuk menentukan prioritas | Skor prioritas dengan rincian faktor, terbuka untuk publik |

Masalah yang sama muncul di perencanaan tahunan. DKI Jakarta menjalankan e-Musrenbang sejak 2016; pada 2019, dari 18.221 usulan langsung yang masuk, hanya 254 yang terealisasi. Untuk Musrenbang RKPD 2027, Pemprov DKI menerima 61.174 usulan aspirasi. Warga jarang tahu kenapa usulannya tidak terpilih, dan dashboard prioritas suaRAkyat bisa menjadi bahan berbasis data untuk proses ini.

Sumber: jurnal Undip tentang e-Musrenbang DKI, Metro TV, April 2026.

### Kriteria keberhasilan untuk lomba

- Video maks 5 menit menunjukkan alur lapor → ubah status → rapor → prioritas tanpa error.
- Menggeser bobot di simulator publik langsung mengubah urutan prioritas di depan kamera, tanpa login.
- Setiap skor prioritas punya rincian kontribusi faktor dan satu kalimat penjelasan.
- Minimal dua sumber data terbuka nyata (batas wilayah dan BPS), dengan sumber dan lisensi tercantum.
- Semua data simulasi diberi label simulasi di aplikasi, proposal, dan video, terpisah tegas dari data nyata (bagian 10).
- Semua halaman MVP lolos uji di lebar layar 360 px, 768 px, dan 1280 px.

### Non-tujuan

- Integrasi dengan sistem instansi yang sebenarnya.
- Aplikasi mobile native; cukup web responsif.
- Verifikasi identitas warga (KTP/NIK).
- Moderasi atau klasifikasi otomatis berbasis AI.
- Lebih dari satu wilayah studi kasus.
- Notifikasi email/WhatsApp (masuk roadmap).

## 4. Pengguna dan hak akses

Ada tiga jenis akun: **Warga**, **Admin instansi**, dan **Perencana**. Admin instansi dan Perencana sama-sama berperan `admin` di database; Perencana dibedakan lewat flag `kelola_prioritas`. Ini menutup celah v0.1, di mana admin satu dinas bisa mengubah bobot prioritas yang berlaku untuk semua dinas.

| Aksi | Publik (tanpa login) | Warga | Admin instansi | Perencana |
|---|---|---|---|---|
| Lihat peta, detail laporan, lacak dengan kode | Ya | Ya | Ya | Ya |
| Lihat Rapor Instansi dan Dashboard Prioritas | Ya | Ya | Ya | Ya |
| Buat laporan, upvote, beri rating | — | Ya | — | — |
| Ubah status laporan milik instansinya | — | — | Ya | — |
| Ubah bobot dan override prioritas | — | — | — | Ya |
| Coba simulator bobot (tanpa menyimpan) | Ya | Ya | Ya | Ya |

Akun admin instansi dan Perencana dibuat lewat seed, tanpa pendaftaran publik. Usulan: satu akun admin per instansi dan satu akun Perencana bernama "Bappeda Kota (simulasi)". Untuk juri dan pengunjung, Beranda menyediakan tombol "Coba sebagai warga demo" dan "Coba sebagai admin demo" yang masuk ke akun demo bersama; data demo direset tiap malam.

### User story

| Kode | Story |
|---|---|
| W1 | Sebagai warga, saya ingin melapor dengan foto dan pin di peta agar masalah tercatat jelas. |
| W2 | Sebagai warga, saya ingin melihat laporan serupa di dekat saya agar bisa mendukungnya (upvote), bukan membuat laporan ganda. |
| W3 | Sebagai warga, saya ingin melacak laporan lewat kode agar tahu sudah diproses atau belum. |
| W4 | Sebagai warga, saya ingin memberi rating setelah laporan selesai agar kualitas penanganan terukur. |
| W5 | Sebagai warga, saya ingin melihat rapor instansi agar tahu mana yang responsif. |
| W6 | Sebagai warga, saya ingin melihat kenapa wilayah saya diprioritaskan atau tidak. |
| A1 | Sebagai admin instansi, saya ingin melihat laporan instansi saya, yang terlambat paling atas. |
| A2 | Sebagai admin instansi, saya ingin mengubah status dan melampirkan bukti agar warga tahu perkembangannya. |
| P1 | Sebagai perencana, saya ingin melihat peringkat isu wilayah beserta alasannya agar sumber daya tepat sasaran. |
| P2 | Sebagai perencana, saya ingin mengatur bobot faktor dan melakukan override dengan alasan publik agar skor mengikuti kebijakan. |

## 5. Ruang lingkup

MVP berisi 12 fitur, fondasi data, paket anti-curang, dan tambahan v0.3. **Fitur dikunci 7 November malam**; setelah itu hanya perbaikan bug. Pemilik A, B, C dijelaskan di bagian 14.

### MVP (wajib selesai 7 November)

| # | Fitur | Pemilik |
|---|---|---|
| 0 | Fondasi data: impor batas kecamatan, penduduk, kemiskinan; generator seed | C |
| 1 | Beranda / landing page: hero, statistik ringkas, preview peta, ajakan lapor | A |
| 2 | Daftar dan login warga; akun admin dan Perencana dari seed | B |
| 3 | Form laporan: kategori, deskripsi, 1–3 foto, pin peta; wilayah dan instansi otomatis | A + B |
| 4 | Laporan serupa dalam radius 100 m + upvote | B |
| 5 | Kode laporan, halaman lacak, timeline status, indikator SLA | A + B |
| 6 | Peta publik: clustering, filter kategori dan status | A |
| 7 | Admin instansi: daftar laporan, ubah status (alasan terstruktur untuk Ditolak, foto bukti untuk Selesai) | A + B |
| 8 | Rating 1–5 setelah laporan Selesai | B |
| 9 | Rapor Instansi publik: nilai A–E, komponen, tingkat penolakan + peringatan, definisi metrik | C + A |
| 10 | Dashboard Prioritas publik: choropleth kecamatan, peringkat, rincian faktor, kalimat penjelasan | C + A |
| 11 | Pengaturan bobot (Perencana): peringkat berubah langsung | C + A |
| 12 | Halaman Sumber Data + label "Data simulasi" di peta, rapor, dan dashboard | C |

### Paket anti-curang (MVP, aturan di bagian 7.5)

Dua baris yang dicoret dipindah ke "sebaiknya ada" di v0.3 untuk memberi ruang tambahan v0.3 di bawah. Sisanya sekitar 2 hari kerja jika dibagi bertiga.

| Perbaikan | Pemilik | Kira-kira |
|---|---|---|
| Verifikasi email wajib | B | 1 jam |
| Foto sebelum dan sesudah berdampingan | A | 2 jam |
| Tombol Batalkan untuk pelapor (status Menunggu) | B | 2 jam |
| Peringatan foto wajah/plat nomor di form | A | 15 menit |
| Upvote dihitung maksimal 10 per laporan di skor | C | 1 jam |
| Tiga alasan tolak + isi "Konten melanggar" disembunyikan | B + A | ½ hari |
| Ambang peringatan penolakan: median + batas 25% | C | 1 jam |
| Bobot berlaku dan riwayatnya tampil publik | C + A | ½ hari |
| Nilai mentah di samping kontribusi faktor | A | 2 jam |
| ~~Ubah kategori satu kali per laporan~~ (pindah ke sebaiknya ada) | B + A | ½ hari |
| ~~Perkiraan tanggal saat Diverifikasi + label "Melewati janji"~~ (pindah ke sebaiknya ada) | B + A | ½ hari |

### Tambahan v0.3 (MVP)

Simulator bobot publik dan tombol "Kenapa belum?" adalah fitur khas, jadi dikerjakan lebih dulu dari baris lain di tabel ini.

| Perbaikan | Pemilik | Kira-kira |
|---|---|---|
| Simulator bobot publik: slider, tiga preset, tanda naik/turun dibanding peringkat resmi | C + A | ½ hari |
| Tombol "Kenapa belum?" di detail laporan (bagian 9) | C + A | ½ hari |
| Huruf rapor maksimal C saat peringatan penolakan menyala | C | 30 menit |
| Volume hanya laporan terverifikasi + faktor dukungan warga | C | 1 jam |
| Rating netral 3/5; ukuran sampel, periode, rincian per kategori di rapor | C + A | ½ hari |
| Banner "bukan kanal resmi" + tautan JAKI dan LAPOR! | A | 30 menit |
| Tombol "Coba sebagai warga/admin demo" + reset data demo tiap malam | B | ½ hari |
| Buang metadata EXIF saat kompresi foto | A | 30 menit |
| Mode data nyata untuk dashboard prioritas (hanya jika dataset CRM DKI layak) | C | 1 hari |

### Sebaiknya ada (hanya jika MVP stabil per 7 November)

1. Keberatan Warga: banding penolakan dan protes "belum beres", diputuskan Perencana (bagian 7.6).
2. Halaman cetak "Ringkasan isu prioritas per kecamatan" sebagai bahan usulan Musrenbang.
3. Ubah kategori satu kali per laporan, tercatat di timeline publik (bagian 7.5).
4. Perkiraan tanggal selesai saat Diverifikasi, dengan label "Melewati janji" jika terlewat.
5. Override prioritas oleh Perencana, dengan alasan yang tampil publik.
6. Isu terdampak di riwayat keputusan: setiap perubahan bobot resmi menunjukkan isu wilayah yang naik atau turun.
7. Rapor per wilayah: metrik yang sama dikelompokkan per kota/kecamatan. Ini cocok dengan contoh panitia untuk subtema Decision Support (perbandingan kualitas layanan antar daerah).
8. Filter periode di Rapor Instansi dan Dashboard Prioritas.
9. Halaman Laporan Saya.
10. Filter instansi dan wilayah di peta publik.

### Roadmap (tidak dibangun, masuk slide Rencana Pengembangan)

- Notifikasi status lewat email atau WhatsApp.
- Validasi bobot dan rumus bersama calon pengguna, misalnya perencana daerah dan komunitas warga.
- Integrasi dengan kanal pengaduan resmi agar laporan dari sana ikut dinilai.
- Banding yang tidak selesai di Perencana diteruskan ke lembaga independen seperti Ombudsman.
- Menghubungkan isu prioritas dengan usulan dan anggaran Musrenbang, untuk melihat apakah prioritas sejalan dengan alokasi.
- Perluasan ke kota lain, ekspor laporan PDF, klasifikasi foto otomatis.

Dicoret dari v0.1: batas jumlah laporan per akun per hari. Pengaman spam cukup lewat laporan serupa, verifikasi admin, dan validasi input.

## 6. Kebutuhan fungsional

Setiap FR di bawah harus bisa diuji satu per satu. Angka dan aturan detailnya ada di bagian 7–9.

### 6.1 Autentikasi

- **FR-A1** Warga daftar dan login dengan email + password. Email wajib diverifikasi sebelum bisa melapor, upvote, atau memberi rating.
- **FR-A2** Akun admin instansi dan Perencana dibuat lewat seed, tanpa pendaftaran publik. Tombol "Coba sebagai warga demo" dan "Coba sebagai admin demo" masuk ke akun demo bersama tanpa daftar; data demo direset tiap malam.
- **FR-A3** Hak akses mengikuti tabel bagian 4 dan ditegakkan di server (Row Level Security), bukan hanya disembunyikan di UI.

### 6.2 Pelaporan

- **FR-B1** Form berisi kategori (wajib), deskripsi (wajib, 20–500 karakter), foto 1–3 file (JPG/PNG/WebP, maks 5 MB per file, dikompres di browser sekaligus membuang metadata EXIF), dan pin peta (wajib). Tombol "Pakai lokasi saya" bersifat opsional. Form menampilkan peringatan agar tidak memotret wajah atau plat nomor orang lain. Di atas form ada pemberitahuan bahwa laporan di suaRAkyat tidak diteruskan ke instansi, dengan tautan ke kanal resmi (JAKI, LAPOR!).
- **FR-B2** Kecamatan ditentukan dari koordinat (point-in-polygon), instansi dari kategori. Pin di luar wilayah studi ditolak dengan pesan yang jelas.
- **FR-B3** Sebelum laporan dikirim, sistem menampilkan laporan serupa (bagian 7.3). Warga bisa upvote laporan yang ada atau tetap mengirim.
- **FR-B4** Laporan terkirim mendapat kode unik `SR-` + 6 karakter (huruf besar dan angka, tanpa O, 0, I, 1) dan status awal Menunggu.
- **FR-B5** Satu upvote per akun per laporan. Pelapor tidak bisa upvote laporannya sendiri.
- **FR-B6** Pelapor bisa membatalkan laporannya selama status masih Menunggu. Laporan berstatus Dibatalkan tidak dihitung di rapor maupun skor prioritas.

### 6.3 Pelacakan dan peta

- **FR-C1** Detail laporan menampilkan deskripsi, foto (sebelum dan sesudah berdampingan setelah Selesai), lokasi, timeline status, jumlah upvote, dan indikator SLA (sisa waktu atau label "Terlambat"), serta (sebaiknya ada) perkiraan tanggal dari dinas dengan label "Melewati janji" jika terlewat. Nama pelapor disamarkan menjadi inisial. Untuk laporan yang belum Selesai, tombol "Kenapa belum?" menampilkan peringkat isu wilayahnya, faktor yang menahan dan mendorong skornya, dan posisinya di tiap preset simulator (bagian 9).
- **FR-C2** Laporan bisa dicari dengan kode dari Beranda dan header.
- **FR-C3** Peta publik memakai clustering dan filter kategori serta status. Laporan Ditolak tetap tampil, lengkap dengan alasannya.
- **FR-C4** Rating 1–5 dengan komentar opsional, satu kali per laporan, hanya oleh pelapor, hanya setelah status Selesai.

### 6.4 Admin instansi

- **FR-D1** Daftar laporan instansinya dengan filter status dan "terlambat". Urutan default: yang terlambat paling atas, lalu yang paling dekat batas SLA.
- **FR-D2** Ubah status sesuai transisi di bagian 7.1. (Sebaiknya ada) Diverifikasi wajib disertai perkiraan tanggal selesai. Ditolak wajib memilih alasan terstruktur (bagian 7.4); Selesai wajib foto bukti.
- **FR-D3** Setiap perubahan status tercatat (siapa, kapan, catatan) dan menjadi sumber timeline.
- **FR-D4** Admin hanya bisa mengubah laporan dengan kategori milik instansinya. (Sebaiknya ada) Admin boleh memindahkan laporan ke kategori lain satu kali per laporan (bagian 7.5).

### 6.5 Rapor Instansi

- **FR-E1** Halaman publik menampilkan nilai dan huruf tiap instansi, komponen nilainya, dan metrik pendukung (bagian 8), termasuk ukuran sampel, periode, dan rincian per kategori.
- **FR-E2** Setiap metrik punya tooltip definisi, dan ada halaman "Cara Menilai" yang memuat rumus lengkap.
- **FR-E3** Instansi dengan kurang dari 10 laporan yang dapat dinilai ditampilkan "Data belum cukup", tanpa huruf.
- **FR-E4** Tingkat penolakan tampil di samping huruf, dengan tanda peringatan sesuai aturan bagian 8. Selama peringatan menyala, huruf maksimal C.

### 6.6 Prioritas

- **FR-F1** Sistem menghitung skor 0–100 per isu wilayah sesuai bagian 9.
- **FR-F2** Dashboard publik menampilkan peta choropleth kecamatan dan daftar peringkat, dengan filter kategori. Siapa pun bisa menggeser bobot di mode simulasi (bagian 9): peringkat dan penjelasan berubah langsung, bobot resmi tidak tersimpan, dan setiap isu ditandai naik atau turun berapa posisi dibanding peringkat resmi.
- **FR-F3** Memilih satu isu wilayah menampilkan bar kontribusi tiap faktor beserta nilai mentahnya, dan satu kalimat penjelasan.
- **FR-F4** Perencana mengubah bobot lewat slider. Bobot dinormalisasi agar totalnya 1,0, peringkat diperbarui langsung tanpa reload, dan konfigurasi tersimpan. Setiap perubahan bobot wajib disertai alasan. Bobot yang berlaku dan riwayat perubahannya tampil publik.
- **FR-F5** (Sebaiknya ada) Perencana bisa melakukan override dengan alasan wajib yang tampil publik.

### 6.7 Data

- **FR-G1** Seed 800–1.000 laporan simulasi sesuai aturan bagian 10, bisa di-reset ke kondisi awal yang sama.
- **FR-G2** Skrip impor memuat batas kecamatan, kode wilayah, penduduk, luas, dan kemiskinan.
- **FR-G3** Halaman Sumber Data mencantumkan sumber, tahun, dan lisensi setiap dataset, plus penjelasan skenario simulasi. Setiap halaman menandai sumber angkanya: "Data terbuka" atau "Data simulasi".

## 7. Aturan bisnis

### 7.1 Status laporan

Laporan berjalan **Menunggu → Diverifikasi → Diproses → Selesai**. Dari Menunggu atau Diverifikasi, admin bisa menolak dengan alasan wajib. Selesai dan Ditolak bersifat final, kecuali dibatalkan lewat Keberatan Warga (bagian 7.6). *(Diagram alur status, 5 status / 2 final: PDF hal. 16.)*

- `responded_at` diisi saat status pertama kali berubah dari Menunggu, termasuk saat ditolak.
- `resolved_at` diisi saat status menjadi Selesai.

### 7.2 Kategori, instansi, dan SLA

SLA adalah batas waktu respons dan penyelesaian per kategori, dihitung dalam jam kalender agar sederhana. Angka di bawah adalah ilustrasi dan dinyatakan terbuka di aplikasi. Nama instansi sengaja generik dan bertanda simulasi, supaya data simulasi tidak terbaca sebagai kinerja instansi nyata.

| Kategori | Instansi (simulasi) | Urgensi | SLA respons | SLA selesai |
|---|---|---|---|---|
| Jalan rusak | Dinas Bina Jalan | Tinggi | 24 jam | 120 jam (5 hari) |
| Saluran tersumbat | Dinas Tata Air | Tinggi | 24 jam | 96 jam (4 hari) |
| Sampah menumpuk | Dinas Kebersihan | Sedang | 24 jam | 72 jam (3 hari) |
| Lampu jalan mati | Dinas Penerangan Jalan | Sedang | 48 jam | 168 jam (7 hari) |

v0.1 mencatat pemberitaan 2022 tentang target tindak lanjut 6 jam pada sistem pengaduan Jakarta. Angka itu boleh dipakai untuk SLA respons asalkan sumber beritanya dicantumkan di halaman Sumber Data.

Sebuah laporan **terlambat respons** jika belum direspons saat batas respons lewat, atau `responded_at` melewati batas. Laporan **terlambat selesai** memakai aturan yang sama terhadap batas penyelesaian.

### 7.3 Laporan serupa

Laporan dianggap serupa jika kategorinya sama, statusnya Menunggu, Diverifikasi, atau Diproses, dan jaraknya paling jauh 100 m dari pin (nilai bisa dikonfigurasi). Maksimal 5 laporan ditampilkan, diurutkan dari yang terdekat. Implementasi: `ST_DWithin` pada kolom geography di PostGIS.

### 7.4 Penolakan laporan

Admin boleh menolak laporan, tapi penolakan tidak bisa disembunyikan. Tujuannya: huruf rapor yang bagus karena banyak membuang laporan harus terlihat mencurigakan, bukan terlihat hebat.

| Alasan (dropdown) | Syarat | Masuk tingkat penolakan? |
|---|---|---|
| Duplikat | Wajib menautkan kode laporan lain yang masih aktif. Sistem mengecek otomatis: kategori sama dan jarak ≤ 100 m. Upvote dipindahkan ke laporan asli. | Tidak, karena dibuktikan sistem |
| Tidak valid | Wajib catatan, misalnya spam atau masalah tidak ditemukan di lokasi | Ya |
| Konten melanggar | Wajib catatan, misalnya kata kasar, foto tidak pantas, atau data pribadi orang lain. Isi dan foto disembunyikan dari publik. | Ya |

- Laporan Ditolak tetap tampil di peta publik dan halaman detail, dengan label "Ditolak", alasan, dan catatan admin. Khusus "Konten melanggar", yang tampil hanya kategori, lokasi, dan keterangan bahwa isinya disembunyikan.
- Penolakan tetap mengisi `responded_at`, karena menolak juga bentuk respons.
- Tingkat penolakan dan tanda peringatannya diatur di bagian 8.
- Banding atas penolakan "Tidak valid" dan "Konten melanggar" ditangani lewat fitur Keberatan Warga (bagian 7.6).

### 7.5 Aturan anti-curang

Tidak ada pihak yang bisa mengakali suaRAkyat sendirian, baik dinas, warga, maupun Perencana: setiap klaim bisa dicek dan setiap keputusan tercatat publik. Aturannya dikelompokkan dalam empat prinsip.

| Prinsip | Aturan | Menutup celah |
|---|---|---|
| Klaim dinas bisa dicek warga | Foto sebelum dan sesudah tampil berdampingan di detail laporan. (Sebaiknya ada) Status Diverifikasi wajib disertai perkiraan tanggal selesai yang tampil publik; jika tanggal itu lewat dan laporan belum Selesai, muncul label "Melewati janji". | Selesai palsu; respons yang hanya berupa klik |
| Satu orang, satu suara | Email wajib diverifikasi sebelum bisa melapor, upvote, atau memberi rating. Volume prioritas hanya menghitung laporan terverifikasi. Upvote menjadi faktor dukungan warga berbobot kecil, maksimal 10 dihitung per laporan; jumlah aslinya tetap ditampilkan. | Akun ganda untuk menggelembungkan prioritas |
| Keputusan pejabat terlihat publik | Tiga alasan tolak (7.4). Ambang peringatan penolakan memakai median dan batas tetap (bagian 8). Bobot prioritas yang berlaku dan riwayat perubahannya, lengkap dengan alasan, tampil publik. Huruf rapor maksimal C selama peringatan penolakan menyala. Nilai mentah tampil di samping kontribusi faktor (bagian 9). | Tolak sembarangan; permainan bobot; efek min-max yang menyesatkan |
| Jangan menghukum yang bukan salahnya | (Sebaiknya ada) Admin boleh mengubah kategori satu kali per laporan, tercatat di timeline publik; dinas lama tidak dihitung dan SLA dimulai ulang untuk dinas penerima. Pelapor bisa membatalkan laporannya selama status Menunggu; status Dibatalkan tidak dihitung di mana pun. Form laporan memperingatkan agar tidak memotret wajah atau plat nomor orang lain. | Salah kategori; salah input; privasi pihak ketiga |

Di v0.3, "ubah kategori" dan "perkiraan tanggal" dipindah ke sebaiknya ada untuk memberi ruang simulator publik; aturan lainnya wajib masuk MVP. Tanpa "ubah kategori", laporan salah kategori ditolak "Tidak valid" dengan catatan kategori yang benar. Kompromi ini sedikit menaikkan tingkat penolakan dan diterima demi waktu.

### 7.6 Keberatan Warga (sebaiknya ada)

Satu fitur menangani dua jenis keberatan. Keduanya diputuskan Perencana, bukan dinas yang bersangkutan.

- **Banding penolakan:** untuk laporan yang ditolak "Tidak valid" atau "Konten melanggar", diajukan paling lambat 3 hari setelah ditolak.
- **Belum beres:** setelah status Selesai, pelapor punya 3 hari untuk menjawab "Belum beres". Tanpa jawaban, laporan dianggap beres.

Jika keberatan diterima, laporan kembali ke Diverifikasi (banding) atau Diproses (belum beres). Batas SLA tetap dihitung dari tanggal laporan pertama masuk, jadi penolakan atau penyelesaian palsu hampir pasti berakhir tercatat terlambat. Jumlah keberatan yang diterima ikut tampil di rapor instansi.

## 8. Rapor Instansi

Setiap instansi mendapat nilai 0–100 dan huruf A–E dari empat komponen. Laporan yang belum disentuh ikut dihitung, sehingga instansi yang mengabaikan laporan tidak terlihat bagus.

```
Nilai = 100 × (0,3·R + 0,3·S + 0,2·P + 0,2·K)
```

| Komponen | Simbol | Bobot | Rumus |
|---|---|---|---|
| Kepatuhan SLA respons | R | 30% | Laporan yang direspons dalam batas ÷ laporan yang sudah bisa dinilai (sudah direspons, atau belum direspons tapi batasnya lewat) |
| Kepatuhan SLA selesai | S | 30% | Laporan Selesai dalam batas ÷ laporan tidak ditolak yang sudah bisa dinilai (sudah Selesai, atau belum Selesai tapi batasnya lewat) |
| Tingkat penyelesaian | P | 20% | Laporan Selesai ÷ laporan tidak ditolak |
| Kepuasan warga | K | 20% | Rata-rata rating ÷ 5 |

**Huruf:** A untuk nilai 85 ke atas, B 70–84, C 55–69, D 40–54, dan E di bawah 40.

**Rating netral:** supaya semua instansi dihitung dengan susunan bobot yang sama, K memakai rating netral sebagai titik awal: rata-rata rating = (jumlah bintang + 3 × 5) ÷ (jumlah pemberi rating + 5), lalu dibagi 5. Instansi tanpa rating mendapat K = 0,6, dan pengaruh titik awal ini mengecil seiring bertambahnya rating.

- Laporan yang masih dalam batas waktu dan belum selesai tidak dihitung dulu, karena hasilnya belum bisa ditentukan.
- Instansi dengan kurang dari 10 laporan yang dapat dinilai ditampilkan "Data belum cukup".
- Laporan Dibatalkan, laporan yang ditolak sebagai duplikat, dan laporan yang sudah dipindahkan ke instansi lain tidak dihitung untuk instansi ini.

### Contoh hitungan

Dinas Kebersihan (simulasi) menerima 100 laporan, 10 di antaranya ditolak "Tidak valid". Hasilnya nilai 73,5, huruf B.

| Komponen | Kejadiannya | Nilai |
|---|---|---|
| R | 80 direspons tepat waktu (termasuk penolakan), 10 telat, 5 diabaikan sampai lewat batas, 5 baru masuk dan belum bisa dinilai | 80 ÷ 95 = 0,84 |
| S | Dari 90 yang tidak ditolak: 50 selesai tepat waktu, 15 selesai telat, 15 belum selesai padahal lewat batas, 10 masih dalam batas | 50 ÷ 80 = 0,63 |
| P | 65 selesai dari 90 yang tidak ditolak | 0,72 |
| K | Rating rata-rata 3,8 bintang dari 60 pemberi rating; dengan titik awal netral menjadi (228 + 15) ÷ 65 = 3,74 | 3,74 ÷ 5 = 0,75 |

```
100 × (0,3 × 0,84 + 0,3 × 0,63 + 0,2 × 0,72 + 0,2 × 0,75) = 73,5
```

### Tingkat penolakan

Tingkat penolakan ditampilkan di samping huruf, tanpa mengubah nilai. Rumusnya: laporan ditolak "Tidak valid" atau "Konten melanggar" ÷ semua laporan, kecuali yang ditolak sebagai duplikat dan yang dibatalkan pelapor.

Tanda peringatan muncul jika tingkat penolakan suatu instansi **di atas 25%**, atau **lebih dari dua kali median instansi lain dengan minimal 10%**. Pembandingnya median instansi lain, bukan rata-rata semua instansi, supaya dua instansi yang sama-sama curang tidak saling menutupi. Selama peringatan menyala, huruf rapor dibatasi **maksimal C**, berapa pun nilai angkanya. Contoh dua dinas yang sama-sama menerima 100 laporan:

| | Dinas A (menangani laporan susah) | Dinas B (menolak laporan susah) |
|---|---|---|
| Ditolak "Tidak valid" | 5 | 35 |
| Rapor jika hanya huruf | B | A |
| Rapor dengan tingkat penolakan | B · ditolak 5% | C (angkanya setara A) · ditolak 35% ⚠ melewati batas 25% |

Aturan ini tidak melarang menolak, karena spam memang perlu ditolak. Yang dicegah adalah menolak tanpa terlihat: publik bisa mengklik peringatan itu dan membaca setiap laporan yang ditolak beserta alasannya.

### Ditampilkan, tapi tidak masuk nilai

- Median waktu respons, dari laporan yang sudah direspons. Tidak dinilai karena laporan yang diabaikan tidak punya waktu respons, sehingga median bisa menyesatkan.
- Ukuran sampel (jumlah laporan yang dinilai), periode penilaian, jumlah laporan aktif yang sedang terlambat, dan rincian semua metrik per kategori. Karena SLA tiap kategori adalah asumsi simulasi dan beban kerja tiap dinas berbeda, rapor tidak mengklaim mengukur kualitas instansi secara menyeluruh.

Default periode: seluruh data. Filter periode masuk daftar "sebaiknya ada".

## 9. Skor prioritas

Skor 0–100 dihitung per **isu wilayah**, yaitu satu kecamatan × satu kategori, yang punya minimal satu laporan aktif. **Laporan aktif** adalah laporan berstatus Menunggu, Diverifikasi, atau Diproses.

```
Skor = 100 × Σ wᵢ · fᵢ,   dengan Σ wᵢ = 1
```

| Faktor | Bobot awal | Nilai mentah | Diubah ke skala 0–1 dengan |
|---|---|---|---|
| Urgensi kategori (U) | 0,30 | Tinggi 1,0 · Sedang 0,6 · Rendah 0,3 | Langsung, tanpa min-max |
| Volume (V) | 0,20 | Laporan aktif yang sudah diverifikasi admin, per 10.000 penduduk kecamatan | Min-max antar isu wilayah yang dinilai |
| Dukungan warga (W) | 0,05 | Upvote pada laporan aktif terverifikasi, maksimal 10 dihitung per laporan, per 10.000 penduduk kecamatan | Min-max |
| Umur laporan (A) | 0,20 | Rata-rata (umur ÷ SLA selesai) laporan aktif, dibatasi maksimal 2 | Dibagi 2 |
| Kerentanan (K) | 0,15 | Persentase penduduk miskin kota administrasi (BPS) | Min-max |
| Kepadatan (D) | 0,10 | Penduduk ÷ luas (jiwa/km²) kecamatan | Min-max |

Volume dihitung per penduduk supaya kecamatan besar tidak otomatis menang hanya karena warganya lebih banyak. Urgensi ditentukan dari kategori, bukan dipilih warga, karena semua orang akan memilih "sangat urgent". Volume hanya menghitung laporan terverifikasi, dan upvote dipisah menjadi faktor dukungan warga berbobot 0,05, supaya wilayah yang warganya lebih aktif online tidak otomatis menang. Faktor kerentanan ikut menyeimbangkan bias partisipasi digital ini.

### Edge case yang wajib ditangani

- Isu wilayah tanpa laporan aktif tidak diberi peringkat. Kalau tetap dihitung, wilayah padat dan miskin bisa naik ke atas tanpa ada masalah yang dilaporkan. Di peta, wilayah ini ditampilkan "Tidak ada laporan aktif".
- Jika nilai maksimum sama dengan minimum untuk suatu faktor, nilai faktor itu 0 untuk semua isu wilayah. UI menulis "Faktor ini tidak membedakan wilayah saat ini."
- Bobot dinormalisasi: setiap bobot dibagi jumlah semua slider. Kondisi semua slider bernilai 0 ditolak.
- Kerentanan masih level kota. Semua kecamatan dalam satu kota mendapat nilai yang sama, dan ini ditulis terbuka di penjelasan skor. Jika ditemukan data kemiskinan level kecamatan atau kelurahan, data kota diganti.

### Penjelasan skor

Kontribusi faktor i adalah `100 × wᵢ × fᵢ` poin, dan jumlah semua kontribusi sama dengan skor. UI menampilkannya sebagai bar bertumpuk per isu wilayah dengan nilai mentah tiap faktor di sampingnya (misalnya "kemiskinan 4,5% → 15 poin"), ditambah satu kalimat dari template berisi dua faktor terbesar.

- Template: "Skor {skor}: terutama karena {faktor 1} ({poin 1} poin) dan {faktor 2} ({poin 2} poin)."
- Contoh: "Skor 78: terutama karena urgensi tinggi (30 poin) dan banyak laporan melewati batas waktu (19 poin)."

### Siapa menentukan prioritas

Sistem menghitung, Perencana memegang kata akhir, dan semuanya terlihat publik. Warga memberi input lewat kategori dan upvote. Perencana mengatur bobot (nilai dan riwayatnya tampil publik) dan, jika fitur override selesai, bisa menyematkan isu ke atas atau menurunkannya ke bawah daftar dengan alasan wajib. Override tidak mengubah angka skor; isu tersebut diberi badge "Disematkan Perencana" dan alasannya tampil publik sampai dicabut.

### Simulator bobot publik

Simulator adalah fitur unggulan v0.3: siapa pun, tanpa login, bisa menguji "bagaimana kalau prioritasnya diubah?" tanpa mengubah bobot resmi.

- Enam slider faktor yang otomatis dinormalisasi ke total 1,0, plus tombol kembali ke bobot resmi.
- Setiap isu wilayah menampilkan perubahan posisi dibanding peringkat resmi, misalnya "↑3" atau "↓2", dan peta choropleth ikut berubah warna.
- Satu kalimat konsekuensi dari template, misalnya "Dengan bobot ini, 3 isu di Jakarta Utara masuk 10 besar dan 2 isu di Jakarta Selatan keluar."
- Semua dihitung di browser dari hasil `priority_factors`, jadi tidak ada beban server dan tidak ada yang tersimpan.

Tiga preset untuk demo (usulan):

| Preset | U | V | W | A | K | D |
|---|---|---|---|---|---|---|
| Bobot resmi awal | 0,30 | 0,20 | 0,05 | 0,20 | 0,15 | 0,10 |
| Utamakan keselamatan | 0,40 | 0,15 | 0,00 | 0,30 | 0,10 | 0,05 |
| Utamakan kerentanan sosial | 0,20 | 0,15 | 0,05 | 0,15 | 0,30 | 0,15 |
| Utamakan suara warga | 0,20 | 0,35 | 0,15 | 0,15 | 0,10 | 0,05 |

**Posisi untuk pitch:** suaRAkyat tidak mengklaim tahu bobot yang benar. Yang dibuat adalah pilihan bobot yang terlihat, tercatat, dan bisa diperdebatkan siapa pun.

### Tombol "Kenapa belum?"

Tombol ini menerjemahkan skor prioritas ke bahasa satu laporan, dan menjadi fitur khas suaRAkyat. Semua angkanya diambil dari perhitungan yang sama dengan dashboard dan simulator, jadi tidak ada logika baru di server.

- **Posisi:** peringkat isu wilayah laporan ini di antara semua isu yang dinilai.
- **Pendorong terbesar:** faktor dengan kontribusi poin terbesar.
- **Penahan terbesar:** faktor dengan selisih terbesar antara poin maksimalnya (100 × bobot) dan poin yang didapat.
- **Kalau bobot diganti:** posisi isu ini di masing-masing tiga preset simulator.

Contoh tampilan (angka ilustrasi): "Isu Jalan rusak di Kecamatan X berada di peringkat 14 dari 120. Pendorong terbesar: urgensi tinggi (30 poin). Penahan terbesar: kerentanan wilayah (3 dari 15 poin). Dengan preset Utamakan keselamatan, isu ini naik ke peringkat 6."

Jika laporan masih berstatus Menunggu, tombol menjelaskan bahwa laporan belum dihitung di volume karena belum diverifikasi, tapi tetap dihitung di faktor umur laporan.

## 10. Data dan sumber

Usulan wilayah studi: **DKI Jakarta daratan** (lima kota administrasi), dengan unit **kecamatan**. Data wilayah dan statistik memakai sumber nyata; laporan, status, dan rating memakai data simulasi.

Alasan memilih DKI: dataset pengaduan yang ditemukan di katalog.data.go.id berasal dari CRM Pemprov DKI. Selain itu, data kemiskinan BPS per kota memberi lima nilai berbeda antar kecamatan, sehingga faktor kerentanan tetap bekerja. Kabupaten Kepulauan Seribu dikeluarkan karena karakter wilayahnya sangat berbeda.

| Data | Level | Sumber | Catatan |
|---|---|---|---|
| Batas kecamatan (GeoJSON) | Kecamatan | Repositori GitHub batas administrasi Indonesia (pembaruan Juni 2023) atau GADM v4.0; sumber resmi BIG lewat Ina-Geoportal | Disederhanakan (misalnya dengan mapshaper) agar ringan dimuat |
| Kode wilayah | Semua level | Repositori data wilayah Indonesia (JSON per level) | Kunci join antar dataset |
| Penduduk dan luas | Kecamatan | Publikasi BPS "Dalam Angka" tingkat kota/kecamatan | Cek tahun terbaru yang tersedia |
| Persentase penduduk miskin | Kota administrasi | WebAPI BPS (perlu token) atau tabel bps.go.id | Ditulis terbuka sebagai data level kota |
| Pengaduan masyarakat | Bervariasi | katalog.data.go.id (CRM Pemprov DKI) | Kandidat sumber dashboard prioritas (lihat di bawah); kolom wajib dicek paling lambat 27 Okt |
| Laporan, status, upvote, rating | Titik | Generator seed (simulasi) | `is_simulated = true` |

### Batas data nyata dan simulasi

Data nyata dipakai untuk analisis yang didukung sumber; data simulasi hanya untuk mendemonstrasikan mekanisme. Keduanya tidak pernah dicampur dalam satu angka.

| Bagian aplikasi | Sumber data | Label di UI |
|---|---|---|
| Batas wilayah, penduduk, kemiskinan | Nyata (GeoJSON, BPS) | Nama sumber dan tahun |
| Dashboard prioritas dan simulator | Nyata jika dataset CRM DKI layak (agregat per kecamatan, kategori, bulan); jika tidak, simulasi | "Data terbuka CRM DKI, periode …" atau "Data simulasi" |
| Alur lapor, status, rapor instansi | Selalu simulasi | "Data simulasi", nama instansi generik |

Rapor instansi tidak pernah memakai data nyata, karena prototipe ini mendemonstrasikan mekanisme penilaian, bukan menilai dinas sungguhan.

Dataset CRM DKI dianggap layak jika punya kolom wilayah (minimal kecamatan), kategori yang bisa dipetakan ke empat kategori kita, dan tanggal. Jika tidak ada kolom status, faktor umur laporan dinonaktifkan di mode data nyata dan hal ini ditulis di penjelasan skor.

### Aturan generator seed

- 800–1.000 laporan tersebar dalam 6 bulan terakhir.
- Titik diambil acak di dalam poligon kecamatan, dengan jumlah per kecamatan sebanding dengan penduduknya.
- Setiap instansi diberi profil kinerja (misalnya satu cepat, satu sering terlambat), dan skenario ini ditulis di halaman Sumber Data.
- Rating dibuat berkorelasi dengan ketepatan waktu penyelesaian, supaya data terasa masuk akal.
- Generator memakai random seed tetap, sehingga reset selalu menghasilkan angka demo yang sama.

### Prinsip data

- Join selalu memakai kode wilayah, bukan nama, karena nama sering tidak konsisten antar sumber.
- Salinan lokal setiap dataset disimpan di repo (folder `/data`), karena portal bisa berubah.
- Lisensi setiap dataset dibaca dan dicantumkan di halaman Sumber Data.
- Data simulasi dinyatakan terbuka di aplikasi, proposal, dan video.

## 11. Desain dan pengalaman pengguna

Desain bernilai 20% di penyisihan dan final, jadi satu orang (A) memegang keputusan visual dan yang lain mengikuti komponennya.

**Arah visual (usulan):** tenang dan tepercaya seperti layanan publik yang baik, bukan gaya startup yang ramai. Warna dasar netral dengan satu warna aksen. Font usulan: Plus Jakarta Sans (gratis di Google Fonts), cocok dengan konteks Jakarta.

### Komponen inti

| Komponen | Dipakai di | Catatan |
|---|---|---|
| Badge status | Peta, lacak, admin | Warna + label teks + ikon |
| Indikator SLA | Detail laporan, admin | "Sisa 18 jam" atau "Terlambat 2 hari" |
| Kartu laporan | Peta, daftar admin, laporan serupa | Foto kecil, kategori, status, jarak |
| Kartu rapor | Rapor Instansi | Huruf besar + nilai + empat komponen |
| Bar kontribusi faktor | Dashboard Prioritas | Bar bertumpuk, label poin per faktor |
| Slider bobot | Dashboard (Perencana) | Total ternormalisasi selalu terlihat |
| Banner simulasi | Peta, rapor, dashboard | Tidak bisa ditutup |

### Aturan UX

- **Mobile-first.** Semua alur warga harus nyaman di lebar 360 px. Halaman admin dan dashboard boleh optimal di desktop, tapi tetap bisa dipakai di ponsel.
- **Aksesibilitas.** Kontras minimal WCAG AA, setiap input punya label, bisa dinavigasi dengan keyboard, dan status tidak dibedakan hanya lewat warna.
- **Bahasa awam.** Pakai "Terlambat", bukan "Overdue"; "batas waktu layanan", dengan istilah SLA di tooltip. Huruf rapor tetap terbaca dalam grayscale.
- **Privasi.** Nama pelapor tampil sebagai inisial; yang ditampilkan publik hanya lokasi masalah.

### Checklist desain sebelum 31 Oktober

- [ ] Palet warna (netral, aksen, warna status) dan tipografi
- [ ] Tujuh komponen inti di atas
- [ ] Wireframe Beranda, Lapor, Lacak, Rapor Instansi, Dashboard Prioritas

## 12. Desain teknis

Usulan stack: Next.js + Supabase + Leaflet, di-deploy ke Vercel. Ganti hanya jika tim jauh lebih menguasai stack lain, karena waktunya tidak cukup untuk belajar dari nol.

| Lapisan | Pilihan | Alasan |
|---|---|---|
| Frontend | Next.js (React) + Tailwind CSS | Cepat dibangun, deploy mulus di Vercel |
| Peta | Leaflet + OpenStreetMap (react-leaflet, leaflet.markercluster) | Gratis, tanpa API key |
| Grafik | Recharts | Bar kontribusi faktor, komponen rapor |
| Backend dan database | Supabase: Postgres + PostGIS, Auth, Storage, Row Level Security | Auth dan penyimpanan foto siap pakai |
| Deploy | Vercel | Preview otomatis tiap pull request |
| Skrip data | Python (pandas, geopandas) atau Node | Impor GeoJSON dan BPS, generator seed |

### Model data

| Tabel | Kolom penting |
|---|---|
| `profiles` | id, nama, role (warga/admin), instansi_id, kelola_prioritas |
| `agencies` | id, nama, is_simulated |
| `categories` | id, nama, instansi_id, urgensi (tinggi/sedang/rendah), sla_respons_jam, sla_selesai_jam |
| `regions` | id, kode_wilayah, nama, kota, geom (MultiPolygon), penduduk, luas_km2, persen_miskin |
| `reports` | id, kode, user_id, category_id, region_id, deskripsi, foto[], lokasi (geography Point), status (termasuk Dibatalkan), perkiraan_selesai, kategori_diubah, created_at, responded_at, resolved_at, is_simulated |
| `report_updates` | id, report_id, admin_id, status_baru, alasan_tolak (duplikat/tidak_valid/konten_melanggar), duplikat_dari, catatan, bukti_url, created_at |
| `upvotes` | report_id, user_id (unik berpasangan) |
| `ratings` | report_id (unik), user_id, nilai, komentar |
| `priority_weights` | faktor, bobot, updated_by, updated_at |
| `priority_overrides` | id, region_id, category_id, admin_id, arah (atas/bawah), alasan, aktif, created_at |
| `weight_changes` | id, faktor, bobot_lama, bobot_baru, alasan, admin_id, created_at |
| `keberatan` (sebaiknya ada) | id, report_id, user_id, jenis (banding/belum_beres), alasan, status, diputuskan_oleh, created_at |
| `crm_agregat` (hanya jika dataset layak) | region_id, category_id, bulan, jumlah_laporan, sumber, tahun_data |

### Fungsi backend (Supabase RPC)

| Fungsi | Tugas | Akses |
|---|---|---|
| `create_report` | Tentukan kecamatan dan instansi, buat kode, simpan laporan | Warga |
| `similar_reports(lat, lng, category_id)` | Laporan serupa dalam radius | Warga |
| `update_report_status(report_id, status, catatan, bukti_url)` | Validasi transisi, instansi, dan alasan tolak (cek duplikat otomatis), isi `responded_at` / `resolved_at` | Admin instansi |
| `agency_report_card()` | Komponen R, S, P, K, nilai, dan tingkat penolakan per instansi | Publik |
| `priority_factors(category_id?)` | Nilai mentah faktor per isu wilayah | Publik |
| `save_weights(weights)` | Simpan bobot dengan alasan wajib, dan catat riwayatnya di `weight_changes` | Perencana |
| `cancel_report(report_id)` | Batalkan laporan milik sendiri selama status Menunggu | Warga |
| `change_category(report_id, category_id)` | Pindahkan laporan ke kategori lain, satu kali per laporan, catat di timeline | Admin instansi |

Normalisasi dan pembobotan skor dihitung di browser dari hasil `priority_factors`. Dengan begitu slider langsung mengubah peringkat tanpa menunggu server, dan logikanya mudah diuji.

### Keamanan dan kinerja

- Row Level Security aktif di semua tabel; aturan akses mengikuti bagian 4.
- Foto di Storage: publik bisa membaca, hanya pemilik yang bisa mengunggah. Tipe dan ukuran divalidasi di klien dan server.
- Password dan verifikasi email dikelola Supabase Auth; HTTPS dari Vercel.
- Peta memakai clustering dan GeoJSON yang sudah disederhanakan agar tetap lancar dengan seribu titik.

## 13. Halaman, sitemap, dan naskah video

Ada 11 halaman MVP dalam empat kelompok akses, ditambah mode edit bobot untuk Perencana. Sitemap ini bisa langsung dipakai di PDF First Draft Submission. *(Diagram sitemap, 11 halaman + mode edit bobot: PDF hal. 31.)*

### Naskah video penyisihan (maks 5 menit)

Video adalah satu-satunya demo yang dilihat juri di penyisihan. Bagian demo sekitar 3 menit, sisanya untuk perkenalan, masalah, dan rencana pengembangan yang wajib ada. Sejak v0.3 urutannya dibalik: video dibuka dari keputusan, baru kemudian dari mana datanya berasal.

| Waktu | Adegan | Yang ditunjukkan |
|---|---|---|
| 0:00–0:15 | Perkenalan tim | Nama dan peran tiap anggota |
| 0:15–0:45 | Pertanyaan pembuka | "Kenapa jalan di tempatku belum diperbaiki, padahal sudah dilaporkan?" Tekan tombol "Kenapa belum?" di laporan itu, lalu perkenalkan konsep transparansi lapis kedua |
| 0:45–1:30 | Dashboard prioritas | Isu teratas di peta, bar kontribusi faktor, kalimat penjelasan, label sumber data |
| 1:30–2:10 | Simulator publik | Preset "Utamakan keselamatan" lalu "Utamakan kerentanan sosial"; peringkat bergeser dengan tanda ↑/↓; buka riwayat bobot resmi beserta alasannya |
| 2:10–2:45 | Rapor Instansi | Satu dinas nilai D karena sering terlambat; dinas lain tertahan di C karena peringatan penolakan |
| 2:45–3:25 | Dari mana datanya | Warga demo melapor dan laporan serupa muncul; admin demo menyelesaikan dengan foto sebelum/sesudah |
| 3:25–3:50 | Anti-curang | Laporan Ditolak tetap publik, batas upvote, riwayat bobot: "tidak ada yang bisa mengakali sendirian" |
| 3:50–4:30 | Rencana pengembangan | Keberatan Warga, integrasi kanal resmi, validasi bobot bersama pengguna |
| 4:30–4:50 | Penutup | Kalimat pembuka diulang, empat subtema disebut |

Rekam demo dari aplikasi yang sudah di-deploy, setelah seed di-reset, supaya angka di video sama dengan proposal. Siapkan tiga profil browser yang sudah login (warga, admin, Perencana) supaya pindah akun tidak memakan waktu.

### Pitch final (10 menit + 5 menit tanya jawab)

Ikuti urutan slide wajib di bagian 2, maksimal 15 slide. Setiap anggota membawakan bagian yang ia bangun: A untuk solusi dan demo warga, B untuk alur admin dan arsitektur, C untuk Rapor Instansi dan skor prioritas. Siapkan jawaban untuk pertanyaan "apa bedanya dengan LAPOR!" dan "kenapa bobotnya segitu", serta "bagaimana kalau dinasnya menolak laporan sembarangan?" (jawabannya di bagian 7.4 sampai 7.6): "Tidak ada pihak yang bisa mengakali suaRAkyat sendirian, baik dinas, warga, maupun perencana, karena setiap klaim bisa dicek dan setiap keputusan tercatat publik."

### Jawaban untuk pertanyaan juri

Setiap anggota harus bisa menjawab tujuh pertanyaan ini tanpa melihat catatan. Hindari klaim "pertama di Indonesia"; cukup katakan kanal resmi sudah membuka status, dan suaRAkyat membuka alasan keputusan.

| Pertanyaan | Jawaban singkat |
|---|---|
| Kenapa tidak pakai CRM Jakarta saja? | CRM membuka transparansi lapis pertama: status laporan. suaRAkyat membuka lapis kedua: menjelaskan kenapa sebuah masalah didahulukan, dan siapa saja bisa menguji alasannya lewat simulator. |
| Apa bukti bobot kalian objektif? | Tidak ada bobot yang objektif. Karena itu bobot dibuat publik, punya riwayat beserta alasan, dan bisa disimulasikan siapa pun. |
| Bagaimana kalau dinas menolak laporan demi nilai? | Laporan yang ditolak tetap publik, tingkat penolakan tampil di samping huruf, dan huruf tertahan maksimal C saat peringatan menyala. |
| Kenapa wilayah yang melek internet bisa lebih diuntungkan? | Volume hanya menghitung laporan terverifikasi, upvote dibatasi dan berbobot kecil, dan faktor kerentanan menyeimbangkan. |
| Kenapa memakai data simulasi? | Dashboard prioritas memakai data terbuka nyata jika layak. Simulasi hanya untuk mendemonstrasikan alur dan rapor, dan selalu diberi label. |
| Siapa yang memakai dashboard prioritas? | Perencana daerah (Bappeda) untuk memutuskan, misalnya sebagai bahan saat Musrenbang; warga, jurnalis, dan DPRD untuk mengawasi. |
| Kalau pemerintah tidak memakainya, apa manfaatnya bagi warga? | Simulator dan analisis prioritas di atas data terbuka tetap bisa dipakai warga dan jurnalis untuk mempertanyakan keputusan. |

## 14. Tim dan jadwal kerja

Usulan: tiga orang dengan satu pemilik per area, supaya tidak ada pekerjaan yang "punya semua orang" lalu tidak dikerjakan siapa pun. Fitur dikunci 7 November malam.

| Peran | Nama | Tanggung jawab | Bagian di video/pitch |
|---|---|---|---|
| A · Frontend & Desain | (isi) | Design system, Beranda, peta, form lapor, halaman lacak, UI rapor dan dashboard | Solusi dan demo warga |
| B · Backend & Integrasi | (isi) | Skema database, RLS, auth, storage foto, transisi status, laporan serupa, deploy, README | Alur admin dan arsitektur |
| C · Data & Skor | (isi) | Impor wilayah dan BPS, generator seed, query rapor, faktor prioritas, halaman Sumber Data | Rapor Instansi dan skor prioritas |

Ketua tim (penanggung jawab pendaftaran, komunikasi dengan panitia, dan pengumpulan): (isi). Proposal dan video dikerjakan bersama di fase 4.

### Fase 1 · 25–31 Oktober: fondasi dan bahan FDS

- [ ] Sepakati keputusan di bagian 16 (semua), paling lambat 26 Okt
- [ ] Repo publik, Next.js + Supabase, deploy pertama ke Vercel (B), 26 Okt
- [ ] Palet, tipografi, komponen inti, wireframe 5 halaman (A), 27 Okt
- [ ] Skema database, RLS, auth (B)
- [ ] Impor batas kecamatan, penduduk, luas, kemiskinan; cek kolom dataset CRM DKI paling lambat 27 Okt (C)
- [ ] Generator seed versi pertama (C)
- [ ] Beranda / landing page jadi dan ter-deploy (A)
- [ ] Peta publik dengan data seed (A + C)
- [ ] README lengkap sesuai syarat FDS (B)
- [ ] PDF FDS maks 10 halaman: konsep, sitemap, wireframe, fitur, screenshot (semua), 31 Okt
- [ ] Submit FDS (ketua), 1 Nov

### Fase 2 · 2–7 November: fitur inti

- [ ] Form laporan + foto + kecamatan otomatis + laporan serupa (A + B)
- [ ] Halaman lacak + timeline + indikator SLA + tombol "Kenapa belum?" (A + B + C)
- [ ] Admin: daftar laporan dan ubah status (A + B)
- [ ] Rating setelah Selesai (B)
- [ ] Fungsi rapor + halaman Rapor Instansi (C + A)
- [ ] Faktor prioritas + dashboard + slider bobot + simulator publik + kalimat penjelasan (C + A)
- [ ] Halaman Sumber Data + banner simulasi (C)
- [ ] Fitur dikunci (semua), 7 Nov malam

### Fase 3 · 8–9 November: revisi dan uji

- [ ] Baca laporan evaluasi mentor (7 Nov) dan ikut sesi konsultasi (8 Nov)
- [ ] Perbaikan dari mentor dan bug bash bersama
- [ ] Uji di lebar 360, 768, 1280 px dan di dua ponsel nyata
- [ ] Reset seed, cek angka demo konsisten di semua halaman

### Fase 4 · 10–11 November: pengumpulan

- [ ] Rekam dan edit video maks 5 menit, unggah ke YouTube publik dengan deskripsi
- [ ] Proposal PDF maks 30 halaman pakai template panitia
- [ ] Surat orisinalitas bermeterai 10.000 (beli meterai sebelum 9 Nov)
- [ ] Submit di website MIA pada 11 Nov siang, jangan menunggu malam

### Fase 5 · 12–28 November: jika lolos final

- [ ] Konfirmasi kehadiran onsite
- [ ] Pitch deck maks 15 slide sesuai urutan wajib
- [ ] Latihan presentasi 10 menit dan simulasi tanya jawab
- [ ] Cadangan offline demo dan backup deck di Google Drive

## 15. Risiko dan mitigasi

Risiko terbesar adalah waktu, bukan teknologi: fitur yang setengah jadi menurunkan nilai Fungsionalitas yang bobotnya paling besar.

| Risiko | Akibat | Mitigasi |
|---|---|---|
| Fitur belum selesai saat 11 November | Nilai Fungsionalitas (25%) turun | Fitur dikunci 7 Nov; fitur yang belum jadi disembunyikan dari UI |
| Anggota sibuk kuliah atau ujian | Jadwal molor diam-diam | Satu pemilik per area; cek progres singkat tiap malam lewat tracker di bagian 5 |
| Peta atau upload foto bermasalah setelah deploy | Demo error | Deploy di hari pertama; uji di ponsel nyata setiap fase |
| Faktor kemiskinan tidak membedakan wilayah | Demo ubah bobot tidak berefek | Unit kecamatan se-DKI (5 nilai kota); edge case max = min; momen demo bisa pakai faktor lain |
| Pembersihan data BPS dan GeoJSON memakan waktu | Fase 1 molor | Satu wilayah studi, join pakai kode wilayah, salinan lokal di repo |
| Juri menganggap mirip LAPOR! atau aplikasi kota | Nilai Orisinalitas turun | Cerita dibuka dari simulator dan penjelasan prioritas; posisi terhadap CRM Jakarta dan LAPOR! di bagian 1 |
| Data simulasi terbaca sebagai kinerja instansi nyata | Kredibilitas turun | Nama instansi generik, label simulasi di semua halaman |
| Data simulasi terasa tidak meyakinkan | Nilai Konten turun | Profil kinerja realistis, seed deterministik, skenario ditulis terbuka |
| Laporan palsu atau ganda di produk nyata | Data kotor | Laporan serupa, verifikasi admin, validasi input |
| Dinas menolak laporan sembarangan demi nilai rapor | Rapor menyesatkan, kepercayaan publik turun | Alasan tolak terstruktur, laporan Ditolak tetap publik, tingkat penolakan + peringatan di rapor, Keberatan Warga (bagian 7.4–7.6) |
| Admin menandai Selesai dengan bukti palsu | Masalah hilang dari prioritas, rapor menyesatkan | Foto sebelum dan sesudah tampil publik; Keberatan Warga "belum beres" (bagian 7.5–7.6) |
| Akun ganda menggelembungkan upvote | Skor prioritas bisa diarahkan ke wilayah tertentu | Verifikasi email; maksimal 10 upvote dihitung per laporan |
| Perencana mengatur bobot demi wilayah tertentu | Prioritas tidak objektif | Bobot yang berlaku dan riwayat perubahannya tampil publik |
| Perencana bukan pihak independen (sama-sama pemerintah daerah) | Juri meragukan keadilan keberatan warga | Diakui terbuka; roadmap: keberatan yang tidak tuntas diteruskan ke Ombudsman |
| Warga mengira laporannya diteruskan ke pemerintah | Kecewa, kepercayaan turun | Banner "bukan kanal resmi" di atas form, dengan tautan ke JAKI dan LAPOR! |

## 16. Keputusan terbuka dan glosarium

Delapan keputusan perlu disepakati paling lambat 26 Oktober, karena semuanya memblokir pekerjaan fase 1. Ubah kolom status jadi "Disepakati" atau "Diubah" setelah dibahas.

| Keputusan | Usulan v0.2 | Status |
|---|---|---|
| Anggota tim, ketua, dan pembagian peran A/B/C | 3 orang (bagian 14) | Usulan |
| Nama tim | Untuk penamaan file pengumpulan | Usulan |
| Wilayah studi dan unit analisis | DKI Jakarta daratan, unit kecamatan | Usulan |
| Stack | Next.js + Supabase + Leaflet + Vercel | Usulan |
| Kategori dan instansi | 4 kategori, 4 instansi generik (bagian 7.2) | Usulan |
| Angka SLA | Ilustrasi di bagian 7.2, dinyatakan terbuka | Usulan |
| Bobot awal skor prioritas | Bagian 9 | Usulan |
| Dataset pengaduan DKI | Dipakai untuk dashboard prioritas jika ada kolom wilayah, kategori, dan tanggal (bagian 10); dicek C paling lambat 27 Okt | Usulan |

### Pertanyaan untuk panitia

- Rubrik final WIA hanya berjumlah 80% (15 + 25 + 20 + 20). Apa kriteria untuk 20% sisanya?
- Poin mana dari gamifikasi yang ikut memengaruhi penilaian lomba?

### Glosarium

| Istilah | Arti |
|---|---|
| SLA | Batas waktu layanan: maksimal berapa lama laporan harus direspons dan diselesaikan |
| Terlambat | Laporan yang melewati batas SLA respons atau selesai |
| Laporan aktif | Laporan berstatus Menunggu, Diverifikasi, atau Diproses |
| Isu wilayah | Kombinasi satu kecamatan dan satu kategori; unit yang diberi skor prioritas |
| Rapor Instansi | Nilai 0–100 dan huruf A–E per instansi (bagian 8) |
| Perencana | Akun admin dengan hak mengubah bobot dan override prioritas |
| Min-max | Mengubah nilai ke skala 0–1: (nilai − minimum) ÷ (maksimum − minimum) |
| Choropleth | Peta yang mewarnai setiap wilayah sesuai nilainya |
| Seed data | Data awal yang dimasukkan ke database untuk demo dan pengujian |
| RLS | Row Level Security: aturan akses per baris data yang ditegakkan database |
| MVP | Versi minimal yang sudah bisa didemokan |
| Tingkat penolakan | Persentase laporan yang ditolak "Tidak valid" oleh suatu instansi, tampil di samping huruf rapor |
| Keberatan Warga | Banding penolakan atau protes "belum beres" dari pelapor, diputuskan Perencana (bagian 7.6) |
| Melewati janji | Label saat perkiraan tanggal dari dinas sudah lewat tapi laporan belum Selesai |
| Simulator bobot | Mode di dashboard prioritas tempat siapa pun menggeser bobot tanpa mengubah bobot resmi (bagian 9) |
| Dukungan warga | Faktor prioritas dari upvote, berbobot kecil dan dibatasi 10 per laporan |
| Transparansi lapis kedua | Keterbukaan atas alasan keputusan (kenapa satu masalah didahulukan), di atas keterbukaan status laporan yang sudah ada di kanal resmi |
| Musrenbang | Musyawarah Perencanaan Pembangunan: forum tahunan tempat usulan warga disaring menjadi prioritas pembangunan daerah |
