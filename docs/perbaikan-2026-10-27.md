# Perbaikan kesiapan demo WIA — 27 Oktober 2026

## Perubahan yang diterapkan

- Beranda mendahulukan demonstrasi perubahan peringkat sesudah hero. Pertanyaan “Kenapa belum?” tetap menjadi identitas utama, dengan bidang marun dan Plus Jakarta Sans.
- Hero ponsel dipadatkan, teks pendukung dinaikkan ke 16 px, tombol diseragamkan, dan kolom pelacakan diperbaiki agar muat pada layar 320 px.
- Contoh laporan dipilih dari data aktif melalui `/contoh`; kode contoh yang tidak tersedia dihapus. Penjelasan posisi model dipisahkan dari catatan tindak lanjut instansi.
- Filter peta membedakan parameter yang tidak ada (semua) dari parameter kosong (tidak ada pilihan). Simulator menyimpan bobot, kategori, serta isu pilihan di URL.
- Menu ponsel mendukung Escape dan pengembalian fokus; tab login mendukung panah/Home/End. Jangkar memperhitungkan navigasi melekat. Gerak gulir tidak lagi menyembunyikan isi sebelum pengguna mencapai bagian tersebut.
- Form laporan menahan pengiriman ketika batas wilayah belum dimuat, mengunci isian saat mengunggah, dan mencegah pemrosesan foto bersamaan. Form admin siap untuk transisi berikutnya setelah pembaruan status.
- Ditambahkan RPC `priority_factors` dan `agency_report_card` dalam migrasi `0007`. Rapor menghitung laporan yang diabaikan, prior netral rating, batas sampel, dan pembatasan huruf akibat penolakan tinggi.
- Database yang sebelumnya kosong telah diisi 42 wilayah dan 520 laporan simulasi beserta snapshot reset. Pengisian transaksional menolak database yang telah berisi data; peran akun tidak diubah.
- Klaim Musrenbang diperjelas dan diberi tautan sumber primer/publikasi. Data BPS dan CRM dinyatakan belum digunakan. README menyediakan panduan setup serta alur presentasi.

## Validasi

- ESLint dan build produksi Next.js: lulus.
- Inspeksi visual akhir beranda pada 1440/768/390 px: 0 FAIL; satu peringatan tentang tidak adanya video, dengan alasan desain dijelaskan di bawah.
- Vitest: 16 tes lulus, mencakup perhitungan skor dan round-trip filter URL.
- Integrasi database: 8 pemeriksaan lulus, termasuk denominator R/S, smoothing rating, prioritas aktif, pembatasan huruf, RPC warga–admin, akses publik, dan reset seed. Seluruh mutasi pengujian SQL di-rollback.
- Browser Chrome: beranda, prioritas, peta, rapor diperiksa pada lebar 320, 390, 768, 1440 px; tidak ada overflow horizontal pada pemeriksaan akhir.
- Browser: contoh laporan membuka panel alasan, filter kosong/reset bekerja, pilihan isu bertahan setelah reload, menu Escape mengembalikan fokus, kedua akun demo dapat masuk.
- Browser end-to-end: foto PNG diproses dan diunggah lewat form warga, laporan dibuat, admin mengubahnya menjadi Diverifikasi lalu Diproses tanpa reload manual, timeline publik diperbarui. Dua laporan uji dan lampirannya telah dihapus; tersisa 520 laporan seed.
- Tidak ada exception JavaScript dalam pemeriksaan interaksi terakhir. Ubin OpenStreetMap bergantung pada koneksi jaringan; pemeriksaan awal sebelum selesai memuat tidak diperlakukan sebagai bukti gambar rusak.

## Catatan desain

Arah komposisi: **The printed annual / editorial-report**, seed **1378028268**, tanpa redraw; palet dan tipografi merek dipertahankan. Ide: pertanyaan “Kenapa belum?” menjadi dua bidang warna, lalu dibuktikan dengan perbandingan peringkat yang dapat diubah langsung. Interaksi utamanya adalah pilihan prioritas yang menghitung ulang urutan.

ROUND 1
- Kesan: identitas marun kuat; contoh interaktif sudah lebih awal.
- Masalah: teks sekunder terlalu kecil; formulir pelacakan dan navigasi melebar pada 320 px; animasi gulir membuat bagian yang belum dilewati tampak kosong.
- Perbaikan: teks 16 px, input dapat menyusut, tombol menu ringkas, animasi gulir hanya menggeser posisi.

ROUND 2
- Kesan: alur pertanyaan → percobaan → jejak laporan → peta dapat dibaca pada desktop dan ponsel.
- Komposisi: hero dua bidang / perbandingan / jejak vertikal / peta / daftar kategori / konteks sumber / demo dan pelacakan.
- Penilaian mandiri (bukan nilai juri lomba): desain 7,5; kegunaan 8; kreativitas 7; konten 8 → 7,6/10.
- Sisa kelemahan: beberapa foto arsip memberi konteks kota saja; contoh lampiran masih ilustrasi; data demografi belum data resmi. Tidak menambahkan video karena demonstrasi peringkat langsung sudah menjadi media utama untuk menjelaskan produk.

Foto lama di repositori tetap digunakan dengan kredit di caption, footer, dan `/sumber-data#foto`; tidak ada unduhan foto baru:

| Foto | Pembuat | Lisensi dan sumber |
| --- | --- | --- |
| 1975-7-24 Jakarta – Traffic hour | Guus Gorter | [CC BY-SA 4.0](https://commons.wikimedia.org/w/index.php?curid=113048315) |
| Chinese kamp tijdens een overstroming, KITLV 81333 | Tidak diketahui, koleksi KITLV | [CC BY 4.0](https://commons.wikimedia.org/w/index.php?curid=103683427) |
| Jakarta East Flood Canal, June 2024 | Irvan Ary Maulana | [CC BY-SA 4.0](https://commons.wikimedia.org/w/index.php?curid=149996433) |
| Jakarta Indonesia Ciliwung-River-01 | CEphoto, Uwe Aranas | [CC BY-SA 3.0](https://commons.wikimedia.org/wiki/File:Jakarta_Indonesia_Ciliwung-River-01.jpg) |
| Lampu Jalan Jakarta | Rantemario | [CC BY-SA 4.0](https://commons.wikimedia.org/w/index.php?curid=151891901) |

`public/demo/lampiran-simulasi.svg` adalah ilustrasi vektor baru untuk memenuhi alur lampiran pada seed. Gambar dan caption menyatakan bahwa itu bukan foto atau bukti lapangan.

## Batas kesiapan

Frontend diperbaiki dan diuji secara lokal; database demo yang terhubung juga diperbarui. Deploy frontend belum dijalankan. Data BPS/CRM belum terintegrasi; rapor adalah simulasi dan laporan tidak diteruskan ke instansi pemerintah. Verifikasi email ke alamat baru dan deployment publik tidak termasuk pemeriksaan end-to-end yang dilakukan. Sebelum mengubah produk menjadi layanan nyata, sumber demografi dan lampiran contoh harus diganti dengan data yang sah, dan integrasi instansi perlu tersedia.

## Tambahan: animasi halus

Gerakan mengikuti tindakan pengguna: angka peringkat bergeser sesuai arah perubahan, tombol merespons hover/tekan, menu membuka dalam 240 ms, foto kategori berpindah dengan crossfade dan zoom 2,5%, serta garis wilayah pilihan muncul halus. Angka aksesibel langsung memakai hasil perhitungan terbaru, tanpa menghitung angka perantara. Tidak ada dependensi animasi tambahan.

Pengaturan `prefers-reduced-motion` mematikan animasi serta transisi gerak, termasuk efek lama. Pemeriksaan browser memastikan pergantian angka, klik berulang cepat, menu/Escape, lebar 320/390/768/1440 px, dan mode reduced motion bekerja tanpa exception. Lint dan build produksi lulus. Arah visual, foto beserta atribusinya, dan susunan halaman tetap mengikuti ulasan desain di atas.

### Pembuka saat halaman dimuat

Animasi masuk kini dipicu setelah komponen halaman terpasang, bukan hanya ketika stylesheet pertama dibaca. Beranda membuka dua baris judul, teks pengantar, lalu tombol secara berurutan (durasi baris 1.100 ms; jeda 60/210/380/520 ms). Halaman lain memakai judul dan pengantar yang masuk dalam 720 ms. Pemicu mengikuti template halaman dan menangani konten yang datang lewat streaming; perubahan filter tidak mengulang intro.

Pemeriksaan produksi di browser: pemuatan pertama dan reload desktop/HP menjalankan keempat tahap; Prioritas, Peta, Rapor, Masuk, dan Sumber Data menjalankan pembuka masing-masing. Mode reduced motion tidak menjalankan animasi. Konten tetap terbaca tanpa JavaScript. Lint, build, pemeriksaan overflow ponsel, dan pemeriksaan exception browser lulus.
