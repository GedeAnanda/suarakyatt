# Audit suaRAkyat dari sudut pandang juri WIA

Tanggal: 27 Oktober 2026. Audit terhadap aplikasi lokal production di localhost:3001 dan kode repository. Ini temuan audit, bukan perubahan implementasi atau prediksi kelolosan.

## Kesimpulan

Identitas marun, tipografi, dan ide membuka perhitungan prioritas sudah terbentuk. Risiko terbesar sekarang adalah konsistensi demo admin, jarak kontrol dengan hasil pada mobile, serta kekuatan bukti data dan keputusan. Menambah animasi dekoratif tidak menyelesaikan ketiganya.

Rubrik dari screenshot peserta: fungsionalitas 25%, orisinalitas 20%, desain 20%, konten 20%, kesesuaian tema 15%. Tidak ada dasar untuk menghitung probabilitas masuk final atau menganggap data simulasi otomatis menggugurkan peserta.

## Lingkup pemeriksaan

- Tampilan beranda, prioritas, peta, rapor, cara menilai, sumber data, masuk, contoh laporan, dan kode tidak ditemukan pada viewport 1440×900 serta 390×900.
- Form warga, daftar admin dan detail admin pada mobile, melalui akun demo.
- Pemeriksaan tambahan overflow beranda/prioritas/rapor/peta pada lebar 320 piksel.
- Interaksi preset cepat, perpindahan dari daftar prioritas, isi draf lalu navigasi, dan pemeriksaan animasi pembuka.
- Tidak mengirim laporan, mengubah status, atau menyimpan bobot selama audit ini. Pengujian negatif otorisasi backend disimpulkan dari kode; tombol lintas instansi diverifikasi langsung di browser tanpa dikirim.
- Tidak menguji ulang seluruh alur registrasi email, upload, seluruh kombinasi filter, jaringan lambat, Safari/Firefox, atau perangkat fisik. Tidak ada klaim semua fitur bebas bug.

## Temuan berurutan menurut dampak

### 1. P0 — Daftar dan izin aksi admin tidak sesuai instansi

**Terlihat langsung:** akun demo berlabel Dinas Bina Jalan menampilkan lampu jalan, sampah, dan saluran. Detail `SR-598BET` (lampu jalan mati di Cakung) menampilkan tombol **Simpan sebagai Diproses** dalam keadaan aktif, tanpa peringatan bukan instansinya.

**Penyebab dalam kode:** seed menggunakan akun admin sebagai pemilik seluruh laporan (`scripts/siapkan-demo.mjs:23`, `:41`). Kebijakan baca milik sendiri tetap mengizinkan laporan tersebut dibaca (`supabase/migrations/0002_views_rls.sql:65`). View admin hanya mengikuti RLS tanpa filter instansi eksplisit (`:173`). `lib/data/admin.ts` menganggap keberadaan baris pada view sebagai `milikInstansi`. Padahal RPC `update_report_status` memeriksa kecocokan instansi tersendiri (`supabase/migrations/0003_fn_laporan.sql:213`).

**Risiko juri:** alur yang tampak tersedia berakhir ditolak saat disimpan; angka ringkasan juga tercampur lintas instansi. Ini ketidaksesuaian tampilan dengan kewenangan, bukan bukti backend berhasil ditembus.

**Perbaikan:** pisahkan filter daftar instansi dari hak baca umum/pemilik; hitung izin mutasi dari kecocokan instansi; periksa seed serta hak Perencana secara terpisah. Tambahkan pengujian admin yang kebetulan menjadi pelapor lintas instansi.

### 2. P1 — Interaksi utama mobile memisahkan kontrol dan hasil terlalu jauh

Pada lebar 390 piksel, judul Bobot Faktor berada di y≈673, detail isu terpilih y≈2.019, dan daftar peringkat y≈2.866. Keenam slider bahkan masih tertutup pada ukuran ini. Ketika baris kelima dipilih, posisi gulir berubah dari 2.969 menjadi 1.778: perjalanan sekitar 1.191 piksel ke atas.

**Risiko juri:** hubungan “ubah bobot → siapa naik → mengapa” tidak langsung terbaca. Orang harus mengingat hasil lama sambil berpindah beberapa layar.

**Perbaikan:** letakkan ringkasan perubahan dekat preset; gunakan pilihan Peta/Daftar pada mobile, detail ringkas dekat baris terpilih, dan buka penjelasan panjang secara opsional. Jangan menjadikan seluruh hasil panel panjang selalu tampil. Sumber: `components/prioritas/Simulator.tsx:132` dan struktur dua kolomnya.

### 3. P1 — Model berfungsi, tetapi bukti substantif transparansi masih terbatas

Halaman Sumber Data secara jujur menyebut penduduk, luas, kemiskinan, laporan, rating, dan instansi sebagai simulasi. BPS dan CRM berstatus belum digunakan. Geometri wilayah digunakan; angka Musrenbang menjadi konteks, tidak masuk perhitungan.

**Pertanyaan juri:** “Data publik apa yang benar-benar diolah menjadi keputusan? Bagaimana tahu urutan ini masuk akal?” Transparansi formula merupakan keunggulan, tetapi tidak dengan sendirinya memvalidasi pilihan faktor, bobot, atau batas layanan.

**Perbaikan:** integrasikan satu dataset nyata yang relevan dan dapat ditelusuri (tahun, unit, cakupan, proses penggabungan), lalu buat satu studi kasus dengan penjelasan sensitivitas bobot. Jika tetap simulasi, sajikan sebagai validasi mekanisme prototipe dan tunjukkan batas klaimnya. Jangan menjanjikan integrasi pemerintah yang belum ada. Sumber: `app/sumber-data/page.tsx:30–48`, `:159`.

### 4. P1 — Janji “Kenapa belum?” lebih luas daripada jawaban model

Penjelasan yang tersedia terutama menjawab posisi suatu isu menurut model. Ini belum menjelaskan kendala operasional sebenarnya, misalnya anggaran, kewenangan, material, atau jadwal petugas. Panel sudah mengungkapkan perbedaan itu, tetapi pengunjung baru mengetahuinya setelah membuka detail.

**Risiko juri:** konsep terasa menjanjikan penjelasan sebab keterlambatan, sedangkan bukti yang tersedia adalah skor prioritas. Orisinalitas perlu dijelaskan melalui kemampuan yang benar-benar ada.

**Perbaikan:** beri subjudul hero yang eksplisit tentang prioritas pengaduan Jakarta dan model simulasi. Bedakan “alasan posisi menurut model” dan “kendala yang dicatat instansi” secara konsisten. Demo unggulan: satu isu berubah peringkat, kontribusi berubah, alasan terlihat, lalu tindak lanjut publik dapat diperiksa. Sumber: `components/beranda/HeroGaris.tsx:16`, `components/laporan/PanelKenapaBelum.tsx:70`.

### 5. P1 — Animasi peringkat bertumpuk saat input cepat

Dalam delapan pergantian preset dengan jeda sekitar 65 ms, satu baris mempunyai sampai **7 animasi aktif bersamaan**; total teramati 35 animasi pada baris daftar. Efek FLIP berdurasi 520 ms dibuat ulang tanpa membatalkan animasi sebelumnya, dengan kurva yang melewati posisi tujuan.

**Risiko:** gerak kurang terkendali ketika pengguna menggeser slider atau menekan preset cepat. Ini kondisi stres yang direproduksi, bukan pernyataan setiap klik biasa selalu patah.

**Perbaikan:** simpan satu animasi per baris; ambil posisi visual saat interupsi, batalkan animasi lama lalu lanjutkan dari posisi tersebut. Gunakan gerak lebih pendek dan kurva tanpa pantulan untuk tabel data. Sumber: `components/prioritas/Simulator.tsx:113–129`.

### 6. P1 — Proporsi halaman terlalu panjang untuk pembuktian cepat

Beranda terukur sekitar 6.731 piksel desktop dan 7.965 mobile. Ada ruang kosong besar di kiri bagian “Satu laporan. Jejaknya terbuka.” karena teks pendek dipasangkan dengan tumpukan konten kanan yang jauh lebih tinggi. Akses “Coba dari sisimu” baru muncul di y≈6.161 pada mobile.

Hero desktop memakai huruf 208 piksel; identitasnya kuat, tetapi konteks produk kalah dominan dibanding pertanyaannya. Pada halaman informasi, banyak H2 memakai ukuran 64 piksel seperti H1. Judul “Yang tampil tapi tidak dinilai” menjadi blok setinggi sekitar 367 piksel pada kolom desktop yang sempit. Pola judul besar, bidang marun, dan blok panjang diulang cukup sering.

**Perbaikan:** pertahankan hero sebagai aksen utama; kurangi ukuran judul sekunder dan gabungkan bagian yang mengulang alasan produk. Seimbangkan tinggi dua kolom. Bawa jalur demo ke dekat pembuktian pertama. Targetnya bukan seluruh halaman pendek, melainkan pengunjung sampai ke nilai pembeda tanpa harus membaca seluruh landing page.

### 7. P1 — Draf form hilang setelah berpindah halaman

Deskripsi yang sudah diisi hilang setelah pindah ke beranda dan membuka form lagi. Tidak ditemukan mekanisme draf atau penjagaan navigasi di form. Form mobile sendiri mencapai sekitar 4.421 piksel termasuk footer, dengan deskripsi baru sekitar y≈2.595.

**Risiko juri:** ketika mencoba membuka peta atau sumber data di tengah mengisi laporan, pekerjaan harus diulang. Isian memang tetap bertahan ketika pengiriman gagal pada komponen yang sama; itu berbeda dari bertahan saat navigasi.

**Perbaikan:** simpan draf teks/kategori/lokasi secara lokal dengan pilihan hapus; kelola foto secara terpisah dan jelaskan bila perlu dipilih ulang. Beri peringatan saat meninggalkan perubahan yang belum aman tersimpan. Sumber: `components/lapor/FormLaporan.tsx`.

### 8. P2 — Admin mobile masih berupa tabel desktop panjang

Lebar minimum tabel 52rem, sedangkan layar 390 piksel. Kolom lokasi dan tenggat tersembunyi di kanan, sehingga pengguna harus menggulir dua arah. Tinggi halaman admin pada data saat audit sekitar 12.791 piksel. Nilai ini juga diperburuk oleh masalah cakupan instansi di temuan pertama.

**Perbaikan:** tampilkan daftar kartu ringkas khusus mobile yang memuat kode, lokasi, status dan tenggat dalam satu pandangan; sediakan pencarian kode/lokasi dan paginasi atau “muat lagi”. Desktop dapat mempertahankan tabel. Sumber: `components/admin/TabelLaporanAdmin.tsx:98`.

### 9. P2 — Pintu masuk demo kalah prioritas dari form akun

Pada mobile, judul “Coba tanpa daftar” baru muncul sekitar y≈732; tombol demonnya berada lebih bawah. Juri yang ingin cepat mencoba berpotensi mengira harus membuat akun. Rapor juga menghabiskan hampir satu layar untuk pengantar, pemberitahuan, dan navigasi ringkas sebelum rincian instansi pertama.

**Perbaikan:** di mode lomba, bawa pilihan peran demo ke atas form login dan berikan jalur singkat Warga → Admin → Lacak. Ringkas pemberitahuan simulasi yang berulang tanpa menyembunyikan status datanya. Sumber: `app/masuk/page.tsx:23`, `app/rapor/page.tsx`.

### 10. P2 — Detail laporan mengutamakan lampiran generik di atas penjelasan unggulan

Contoh yang diperiksa menampilkan ilustrasi lampiran simulasi besar sebelum “Kenapa belum?”. Panel tersebut berada sekitar y≈1.324 pada mobile; timeline sekitar y≈2.324. Tautan `/contoh` sudah membantu melalui anchor, tetapi pengunjung dari jalur lain tetap mengikuti urutan panjang tersebut.

**Perbaikan:** tampilkan status, ringkasan alasan, dan tindakan berikutnya dekat judul; lampiran menjadi bukti pendukung setelah ringkasan. Siapkan satu demonstrasi lengkap dengan dokumentasi yang memang diperoleh sendiri atau jelas dilabeli skenario. Ilustrasi seed tidak boleh diposisikan sebagai bukti lapangan. Sumber: `app/laporan/[kode]/page.tsx:129–147`.

### 11. P2 — Bukti keputusan dan bahasa produk belum selesai

Riwayat keputusan masih kosong dan menyebut “bobot awal dari PRD”. Istilah PRD tidak menjelaskan dasar kebijakan kepada masyarakat. Halaman sumber juga mencantumkan detail folder/script yang lebih cocok sebagai dokumentasi teknis tambahan.

**Perbaikan:** gunakan “bobot awal model”, jelaskan penyusunnya dan alasannya, lalu perlihatkan satu perubahan bobot yang benar-benar dilakukan serta dicatat sebagai skenario demo. Jangan membuat nama pejabat atau keputusan historis fiktif. Simpan detail implementasi di bagian teknis yang bisa dibuka. Sumber: `components/prioritas/RiwayatBobot.tsx:17`, `app/sumber-data/page.tsx:159`.

### 12. P2 — Bahasa gerak belum konsisten antara pembuka, menu, dan kontrol

- Hero: dua baris 1.100 ms; CTA baru mulai setelah jeda 520 ms dan bergerak 720 ms. Pada sampel desktop, animasi mulai sekitar 120 ms setelah navigasi, sehingga keseluruhan pembuka sekitar 1,36 detik. Ini keputusan desain yang terasa cukup panjang untuk kunjungan berulang, bukan bug kinerja yang sudah dibuktikan.
- Menu mobile masuk dengan animasi 240 ms, tetapi saat ditutup langsung mendapat `hidden`; animasi keluar tidak tersedia.
- Membuka keenam slider mengganti `hidden` dengan `grid` langsung, menggeser konten di bawah tanpa transisi.
- Pembuka berbasis efek JavaScript dimulai setelah HTML tersedia. Pada beberapa sampel first paint mendahului animasi. Ada potensi kilatan pada hidrasi lambat, tetapi kilatan yang terlihat belum dibuktikan dalam audit ini.

**Perbaikan:** pembuka hero secukupnya, CTA dapat diakses segera, interaksi kecil lebih singkat, pembukaan/penutupan simetris, dan animasi data mengikuti perubahan data. Pertahankan dukungan reduced motion. Sumber: `components/PembukaHalaman.tsx:27–33`, `components/NavUtama.tsx:96`, `app/globals.css:529`, `components/prioritas/Simulator.tsx:202`.

## Hal yang sudah baik dan jangan dirusak

- Label simulasi dan sumber data cukup terbuka; angka Musrenbang tidak diklaim sebagai hasil model.
- Formula, kontribusi faktor, dan penalti penolakan pada rapor bisa diperiksa; ini bagian narasi transparansi yang paling layak ditonjolkan.
- Warna dan tipografi konsisten, kontrol utama cukup besar, status menggunakan teks selain warna.
- Tidak ditemukan overflow horizontal tingkat halaman pada rute publik yang diuji di 390 dan 1440 piksel; empat rute tambahan juga lolos pemeriksaan tersebut pada 320 piksel. Tabel admin tetap mempunyai scroll internal.
- Kode pelacakan tidak valid akhirnya menampilkan pesan yang jelas. Pada satu sampel, konten belum selesai dalam 1,7 detik; pemeriksaan lebih lama berhasil, sehingga tidak dikategorikan sebagai halaman rusak.
- Tidak ada exception JavaScript tercatat dalam sesi browser audit. Itu tidak menggantikan pengujian semua alur.
- Pemeriksaan batang rapor pada beberapa posisi scroll tidak menunjukkan perubahan panjang yang keliru; dugaan tersebut tidak dimasukkan sebagai bug.

## Urutan pengerjaan yang disarankan

1. Betulkan cakupan instansi dan izin tombol admin; uji jalur demo yang dipakai juri.
2. Dekatkan kontrol dengan hasil prioritas di mobile dan perbaiki interupsi animasi.
3. Amankan draf form serta rapikan admin mobile.
4. Ringkas landing dan hierarki tipografi; naikkan akses demo serta ringkasan alasan.
5. Perkuat satu studi kasus berbasis data yang bisa dipertanggungjawabkan dan catatan keputusan yang benar-benar didemokan.
6. Terakhir, poles animasi pembuka, menu, dan panel secara konsisten.

Jangan menyebar upaya ke banyak fitur baru sebelum alur inti dapat dijelaskan dan ditunjukkan dalam satu demonstrasi singkat.

## Bukti

Screenshot pilihan: `audit-juri-assets/`. Hasil mentah lokal saat audit: `/tmp/suarakyat-juri/results.json`, `motion.json`, `admin-check.json`. Angka posisi merupakan hasil viewport dan dataset saat pemeriksaan; bukan ukuran tetap untuk semua perangkat.

Acuan UX tambahan: [Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md), khususnya interupsi animasi, keadaan formulir, dan keterbacaan. Rubrik resmi yang digunakan tetap screenshot dari pengguna.
