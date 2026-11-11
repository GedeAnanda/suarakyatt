# Audit kesiapan lomba SUARAKYAT — 11 November 2026

> Catatan kondisi sebelum perbaikan. Tindak lanjut dan hasil pemeriksaan terbaru ada di [Perbaikan audit 11 November](perbaikan-audit-2026-11-11.md).

**Kesimpulan: alur utama siap diperagakan, tetapi ada perbaikan yang perlu ditutup sebelum menyebutnya siap lomba sepenuhnya.** Nilai tambah terbesar berikutnya adalah konsistensi data, keandalan saat gagal, dan pembuktian bahwa warga memahami fitur pembeda. Tidak perlu menambah fitur besar.

Audit terhadap commit `fa0ad5b`, build produksi lokal di port 3200, database yang dikonfigurasi di workspace, dan tiga halaman situs produksi. Ini laporan pemeriksaan; kode aplikasi dan skema database tidak diubah. Pengujian integrasi memakai transaksi rollback; tidak menjalankan impor wilayah, migrasi, reset permanen, atau perubahan password akun.

## Bukti pemeriksaan

| Pemeriksaan | Hasil saat audit |
| --- | --- |
| `npm run lint` | Lulus |
| `npm test` | 48 tes, 6 berkas, lulus |
| `npm run build` | Lulus, termasuk pemeriksaan TypeScript |
| `npm run test:db` | 12 pemeriksaan integrasi lulus; perubahan baris dibatalkan |
| `npm audit --omit=dev --json` | 0 kerentanan yang tercatat pada dependensi produksi |
| Browser Chromium, 360×812 / 768×812 / 1440×900 | 18 rute/skenario × 3 ukuran = 54 pemeriksaan; tanpa galat JavaScript yang tertangkap |
| axe-core 4.14.0, WCAG 2 A/AA, 2.1 A/AA, 2.2 AA | Temuan pada 3 pasangan halaman/ukuran; detail di bawah. Hasil otomatis bukan sertifikasi aksesibilitas |
| Login demo | Warga masuk ke `/lapor`; admin masuk ke daftar dan detail laporan |
| Pembatasan akses | Tamu diarahkan ke masuk; warga tidak bisa membuka admin |
| RLS lewat transaksi hanya-baca | Tamu membaca 0 baris `profiles` dan `reports`; warga membaca 0 laporan orang lain; admin membaca 0 laporan instansi lain dari view admin |
| Hak istimewa | `anon` tidak bisa menjalankan reset; `authenticated` tidak mendapat hak mengubah kolom `profiles.role` |
| Interaksi | Tab hero dengan keyboard, preset simulator dan reload URL, filter peta kosong dan reload, kode salah, laporan tidak ditemukan, serta preferensi huruf besar berjalan |
| Data wilayah | 42 baris database cocok dengan CSV olahan untuk penduduk, luas, dan kemiskinan |

Rute yang diuji: `/`, `/prioritas`, `/kecamatan`, `/kecamatan/31.74.010`, `/rapor`, `/rapor/cara-menilai`, `/peta`, `/lacak`, `/masuk`, `/tentang`, `/sumber-data`, lima skenario `/contoh?jenis=…`, serta pengalihan tamu dari `/lapor` dan `/admin/laporan`. Form warga, daftar admin, dan detail admin diperiksa setelah login secara terpisah. Pengiriman laporan dan perubahan status diuji melalui tes integrasi, bukan pengiriman permanen dari browser.

## Yang sudah kuat

- Rumus dan agregasi benar pada kasus yang diuji: laporan diabaikan tetap memengaruhi rapor, rating kosong memakai nilai awal netral, dan penolakan tinggi membatasi huruf rapor.
- Lima contoh status dapat dibuka tanpa mencari kode. Alasan tunda, penolakan duplikat, penyembunyian konten, dan penyelesaian tersedia.
- Brand konsisten: satu keluarga huruf, warna hijau kebiruan, foto Jakarta, dan hierarki judul jelas. Tidak ada alasan untuk merombak total desain.
- Ada skip link, dukungan keyboard tab hero, label kontrol, preferensi kurangi gerak, pilihan huruf besar, dan daftar sebagai alternatif peta.
- Label simulasi dan penjelasan bahwa laporan tidak diteruskan ke pemerintah sudah terlihat. Ini perlu dipertahankan.
- Query penulisan penting memeriksa identitas dan hak instansi di database; pemeriksaan akses tidak hanya bergantung pada tombol yang disembunyikan.

## Temuan yang harus diperbaiki

### 1. Impor wilayah tetap melakukan commit ketika uji titik gagal — P1

**Lokasi:** `scripts/03_muat_regions.py:123`, `scripts/03_muat_regions.py:130`.

Skrip sudah menghitung `lulus`, tetapi hasilnya hanya dijadikan teks. Pada mode biasa, `conn.commit()` tetap dipanggil walaupun Monas masuk ke kecamatan yang salah atau titik laut masuk ke suatu wilayah. Pada dry-run, kasus gagal juga tidak menghasilkan status keluar gagal.

**Bukti:** fungsi `main()` dijalankan dengan driver database tiruan dan hasil Monas `KECAMATAN SALAH`. Keluaran mencetak `TERSIMPAN`, `GAGAL`, dan pemeriksaan membuktikan `commit()` terpanggil. Reproduksi ini tidak menyentuh database.

**Perbaikan terkecil:** simpan hasil boolean semua uji; jika ada yang gagal, hentikan dengan exception sebelum commit. Tambahkan satu tes yang membuktikan tidak ada commit ketika uji titik gagal. Dry-run yang gagal harus keluar dengan kode bukan nol.

**Jika dilewati:** pengaman geografis memberi rasa aman palsu; data salah dapat tersimpan dan memengaruhi penentuan wilayah laporan serta skor.

### 2. Karantina foto tidak bisa dipulihkan melalui alur yang sama setelah gagal — P1

**Lokasi:** `lib/supabase/aksi-status.ts:28`, `supabase/migrations/0009_foto_dan_dukungan.sql:208`, `components/admin/FormUbahStatus.tsx:106`.

Status ditolak tersimpan melalui RPC terlebih dahulu, baru foto dipindahkan dari bucket publik ke karantina. Jika Storage gagal, status sudah final. Percobaan ulang lewat fungsi yang sama memanggil RPC lagi dan berhenti pada `TRANSISI_TIDAK_VALID` sebelum mencapai pemindahan foto. UI memang menjelaskan `KARANTINA_GAGAL` dan melakukan refresh; mekanisme pemulihannya belum tersedia.

**Perbaikan terkecil:** sediakan percobaan ulang karantina bagi admin instansi yang berwenang, berdasarkan status dan alasan penolakan yang tersimpan. Operasi ulang tidak perlu mengubah status atau menambah timeline lagi. Uji kegagalan Storage setelah RPC berhasil dan pemulihan pada percobaan berikutnya.

**Jika dilewati:** foto yang seharusnya dimoderasi masih bisa dibuka lewat URL publik lama. Ini temuan alur kegagalan yang terkonfirmasi dari kode, bukan bukti bahwa kegagalan tersebut sedang terjadi di produksi. Audit tidak sengaja membuat kegagalan Storage pada laporan nyata.

### 3. Status sumber demografi bertentangan dengan data yang dipakai — P1

**Lokasi:** `app/sumber-data/page.tsx:25`, `app/sumber-data/page.tsx:57`, `app/sumber-data/page.tsx:218`, `README.md:115`, `scripts/README.md:19`, `scripts/README.md:34`.

UI menyatakan penduduk, luas, dan kemiskinan masih buatan serta BPS belum dipakai. Database justru memiliki 42 wilayah dengan atribusi BPS/Dukcapil 2026 dan kemiskinan Maret 2025; ketiga nilai demografinya cocok dengan `data/processed/regions_siap_muat.csv` pada seluruh 42 baris. Skrip BPS juga sudah ada, walaupun panduan mengatakan belum tersedia.

**Perbaikan terkecil:** cocokkan CSV dengan publikasi/tabel BPS asal, simpan tautan publikasi dan nomor tabelnya, lalu samakan keterangan di UI dan README dengan kondisi tersebut. Jika belum terverifikasi terhadap publikasi asal, tulis bahwa angka sudah dimuat tetapi verifikasi sumber masih berlangsung. Laporan dan kinerja dinas tetap diberi label simulasi.

**Jika dilewati:** juri tidak bisa menentukan data mana yang nyata dan mana yang buatan. Menyamakan CSV dengan database membuktikan pemuatan, belum membuktikan kebenaran transkripsi dari BPS; audit ini tidak mengesahkan semua nilai BPS.

### 4. Halaman Sumber data melebar di HP 360 px — P2

**Lokasi:** `app/sumber-data/page.tsx:163`.

Pada viewport 360 px, lebar dokumen menjadi **375 px**. Baris judul dan badge status tidak cukup ruang, terutama pada label “Belum dipakai, sementara buatan”. Screenshot memperlihatkan kartu keluar dari tepi kanan dan judul menjadi kolom sempit.

**Perbaikan terkecil:** izinkan baris judul/badge membungkus atau tumpuk badge di bawah judul pada layar kecil; pastikan anak grid bisa menyusut. Verifikasi kembali pada 320/360/390 px dan mode huruf besar.

**Jika dilewati:** bagian yang menjadi bukti kredibilitas data justru terlihat terpotong di HP. Jangan hanya menyembunyikan overflow halaman karena kontennya tetap salah tata letak.

### 5. Tabel profil simulasi belum bisa difokuskan untuk digeser dengan keyboard — P2

**Lokasi:** `app/sumber-data/page.tsx:260`.

Di lebar 768 px, tabel lebih lebar daripada wadahnya, tetapi wadah tidak fokusabel dan isi tabel tidak memiliki kontrol fokusabel. axe melaporkan `scrollable-region-focusable`; pengguna keyboard pada browser yang tidak otomatis memfokuskan wadah gulir dapat kesulitan mencapai kolom kanan.

**Perbaikan terkecil:** beri wadah gulir `tabIndex={0}`, nama aksesibel yang jelas, dan indikator fokus. Uji masuk dengan Tab lalu geser dengan tombol panah.

**Jika dilewati:** ada bagian penjelasan dataset yang aksesnya bergantung pada mouse atau sentuhan.

## Temuan yang sebaiknya ditutup

### 6. Enam tombol definisi faktor terlalu pendek — P2

**Lokasi:** `components/ui/Istilah.tsx:22`, pemakaian pada `components/prioritas/Simulator.tsx`.

axe pada `/prioritas` 1440 px menemukan enam tombol definisi faktor setinggi sekitar **20,3 px**, dengan jarak terhadap kontrol di sekitarnya yang juga tidak cukup untuk ambang 24 px. Ini tombol label tersendiri di panel faktor, bukan tautan di tengah kalimat biasa.

**Perbaikan terkecil:** tambah tinggi/ruang klik pada pemakaian label faktor tersebut, tanpa memperbesar semua istilah sebaris di seluruh situs. Pertahankan garis fokus. Jika memungkinkan, gunakan ruang klik sekitar 44 px untuk kenyamanan sentuh.

**Jika dilewati:** kontrol bantuan yang menjelaskan cara skor dihitung lebih sulit dipilih; klaim “0 pelanggaran” harus dibatasi pada hasil audit sebelumnya, bukan kondisi semua ukuran hari ini.

### 7. CI belum memeriksa lint dan build — P2

**Lokasi:** `.github/workflows/test.yml:15`.

Workflow hanya menjalankan `npm ci` dan `npm test`. Perubahan yang lulus tes rumus tetapi gagal TypeScript, ESLint, atau build masih bisa mendapat status tes hijau. Ketiga pemeriksaan itu kebetulan lulus pada commit audit ini.

**Perbaikan terkecil:** tambahkan `npm run lint` dan `npm run build` ke job yang sama. Tidak perlu membuat sistem CI baru atau memasukkan kredensial database bersama ke pemeriksaan PR.

**Jika dilewati:** status hijau belum cukup menjadi bukti bahwa versi berikutnya bisa dirilis.

### 8. Pergantian ke data cadangan tidak terlihat oleh pengguna — P2

**Lokasi:** `lib/data/laporan.ts:77`, `lib/data/prioritas.ts:73`, `components/BannerSimulasi.tsx:11`, `components/ui/LabelSumber.tsx:10`.

Saat database gagal, peta, detail, dan agregasi dapat beralih ke JSON cadangan secara terpisah. Label untuk `db` dan `contoh` identik; banner bahkan tidak membaca `sumber`. Jika hanya satu permintaan gagal, pengguna dapat melihat hitungan dari database bersama bagian lain dari snapshot cadangan tanpa penjelasan.

**Perbaikan terkecil:** pertahankan fallback, tetapi tampilkan penjelasan singkat saat snapshot cadangan dipakai, misalnya “Koneksi data terganggu; sedang menampilkan contoh tersimpan.” Jelaskan keterbatasan tindakan saat itu. Tambahkan satu uji kegagalan pengambilan data yang memeriksa penanda tersebut.

**Jika dilewati:** demo terlihat tetap hidup, tetapi perbedaan angka atau laporan yang baru dibuat tidak ditemukan sulit dijelaskan. Cabang kegagalan dikonfirmasi dari kode; gangguan jaringan produksi tidak disimulasikan pada audit ini.

### 9. Dasar angka Musrenbang perlu lebih presisi dan bisa dibuka — P2

**Lokasi:** `README.md:12`, `app/page.tsx:208`, `app/page.tsx:263`, `app/sumber-data/page.tsx:80`, `lib/sumber.ts:2`.

README menyebut sekitar 1,4% “usulan Musrenbang” tanpa batasan tahun dan jenis usulan. Sumber yang diperiksa mendukung **254 dari 18.221 usulan langsung tahun 2019**, bukan persentase seluruh Musrenbang lintas tahun. Angka 61.174 dalam siaran pers mencakup Musrenbang, usulan langsung, dan hasil reses DPRD; sumber itu tidak membuktikan frasa “hasilnya belum diumumkan” per November 2026.

**Perbaikan terkecil:** batasi klaim 1,4% pada sampel/tahun yang benar; sebut cakupan angka 61.174 sesuai sumber. Ganti atribusi umum Metro TV dengan tautan sumber primer yang sudah tersedia. `SUMBER_MUSRENBANG` saat ini belum diimpor oleh halaman mana pun.

**Jika dilewati:** latar belakang yang seharusnya memperkuat konsep dapat dipertanyakan karena terlalu menggeneralisasi sumber.

Sumber yang dibuka saat audit: [studi e-Musrenbang Undip, halaman PDF 3](https://ejournal3.undip.ac.id/index.php/jpgs/article/download/37272/28351), [siaran pers Pemprov DKI, 16 April 2026](https://www.jakarta.go.id/siaran-pers/6628-SP-HMS-04-2026).

## Prioritas agar pembeda lomba lebih terasa

### 10. Pengunjung HP terlalu lama mencapai demonstrasi pembeda

**Lokasi:** `components/beranda/HeroCari.tsx:195`, urutan bagian pada `app/page.tsx`.

Pada 360×812, Beranda panjangnya sekitar **12.512 px**. Bagian interaktif “Urutan bisa berubah…” baru mulai di **y≈6.366 px**, hampir delapan tinggi layar dari atas. Dua aksi terkuat di layar awal adalah lapor/lacak. Tab “Atur urutan” tersedia, tetapi berada dalam deret tab yang digeser horizontal pada HP. Di halaman Prioritas sendiri sudah ada tautan “pilihan cepat”; jangan menganggap fitur itu tidak memiliki jalan pintas sama sekali.

**Perubahan yang disarankan:** jadikan “Coba ubah prioritas” aksi yang jelas di hero dan pindahkan perbandingan urutan ke dekat hero, sebelum uraian langkah serta daftar kategori. Beri satu contoh lengkap: masalah yang sama, urutan awal, aturan pilihan warga, urutan baru, dan alasan perubahannya. Gunakan komponen yang sudah ada.

**Alasannya:** juri dan pengunjung baru harus cepat melihat bahwa produk ini membuka alasan keputusan. Ini rekomendasi hierarki berdasarkan hasil render, bukan temuan crash atau skor juri resmi.

### 11. Bukti pemahaman warga belum tercatat

**Lokasi:** `README.md:114`, `docs/uji-warga-2026-11-10.md`.

Kit uji tersedia, tetapi README masih menyebut uji lima warga belum dijalankan; hasil observasi tidak ditemukan dalam dokumen yang diperiksa. Tes otomatis tidak membuktikan warga memahami perbedaan alasan tunda dari dinas dan posisi dalam model prioritas.

Jalankan tugas yang sudah tersedia pada lima orang: temukan alasan laporan tertunda; temukan laporan asli dari duplikat; jelaskan mengapa urutan berubah; bedakan data nyata dan simulasi; temukan kanal resmi. Catat selesai/tidak, lama tugas, salah paham, dan perubahan yang dilakukan. Laporkan hasil sebenarnya, termasuk jika ada tugas yang gagal.

Ini bukti yang lebih berguna untuk proposal daripada menambah animasi atau grafik baru. Belum ada alasan untuk menyebut skor ini telah divalidasi sebagai dasar kebijakan pemerintah.

## Performa dan SEO: hasil baru, bukan asumsi dari laporan lama

Lighthouse **13.6.0**, preset mobile dengan simulasi throttling, satu pengukuran per URL pada 11 November sekitar 07.25–07.29 WIB. Angka satu kali ukur dapat berubah; belum ada pengukuran pengguna nyata atau uji INP lapangan.

| Lingkungan / halaman | Performa | Aksesibilitas | Best practices | SEO | LCP | TBT | CLS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Produksi `/` | 95 | 100 | 100 | 100 | 2,8 dtk | 110 ms | 0 |
| Produksi `/laporan/SR-27RPCJ` | 95 | 100 | 100 | 91 | 2,4 dtk | 70 ms | 0 |
| Produksi `/kecamatan` | 100 | 100 | 100 | 100 | 1,1 dtk | 10 ms | 0 |
| Lokal `/laporan/SR-27RPCJ` | 81 | 100 | 100 | 91 | 5,0 dtk | 40 ms | 0 |

Produksi detail dan Kecamatan sudah jauh lebih baik daripada catatan lama. Beranda masih sedikit melewati sasaran LCP 2,5 detik; optimasi bertahap boleh dilanjutkan, tetapi hasil lokal 5 detik tidak boleh dipakai untuk menyatakan produksi juga 5 detik. Jangan menambah cache yang berisiko menampilkan status lama hanya demi mengejar angka audit lokal.

SEO 91 pada detail berasal dari pemeriksaan meta description. Setelah halaman selesai, description **ada**, tetapi berada di `body` karena streaming metadata Next.js. Dokumentasi Next.js yang terpasang menjelaskan perilaku ini. OG image produksi memakai domain produksi yang benar. Ini perlu diperiksa dengan bot/pratinjau tautan sebelum mengubah konfigurasi streaming; bukan bukti bahwa description sama sekali belum dibuat. Build lokal juga memberi peringatan `metadataBase` karena `SITE_URL` tidak diisi di lingkungan ini.

## Temuan otomatis yang perlu penilaian manual

- Pada peta 1440 px, axe menandai 7 target berupa titik/klaster. Titik tunggal berukuran 14×14 px (`components/peta/KlasterLaporan.tsx:52`), dan ada klaster yang bertumpuk. Daftar laporan menyediakan cara alternatif untuk membuka laporan yang sama, sehingga hasil ini tidak otomatis membuktikan pelanggaran WCAG tanpa memeriksa pengecualian kontrol ekuivalen. Perbesar area klik transparan sambil mempertahankan titik kecil jika ingin memperbaiki kenyamanannya.
- Inspektor visual mendeteksi 11 kelompok FAIL dan 7 WARN dari aturan selera yang sangat ketat. Beberapa hitungan baris keliru membaca digit animasi tersembunyi sebagai judul panjang; kredit foto terbaca sebagai label dekoratif. Ini bukan 18 bug produk. Tidak ada dasar untuk menghapus kredit, angka, atau seluruh komponen hanya untuk meluluskan pemeriksa tersebut.
- Teks sekunder 14 px cukup dominan; sebagian kredit 11 px. Pertahankan keterangan ringkas dan prioritaskan keterbacaan alasan status/skor. Pilihan “Perbesar huruf” sudah bekerja, tetapi pengujian manual pengguna low vision dan pembaca layar belum dilakukan.

## Batas keamanan dan operasional yang masih perlu diketahui

Tidak ditemukan bypass akses dalam pemeriksaan RLS yang dilakukan. Satu `dangerouslySetInnerHTML` di layout berisi skrip preferensi huruf konstan; itu tidak menerima masukan pengguna. Pemeriksaan dependensi tidak menggantikan uji penetrasi.

Akun demo memakai identitas bersama. Kode reset sendiri mencatat bahwa token pengguna demo bisa dipakai untuk `auth.updateUser`; form situs yang menyembunyikan perubahan password tidak membatasi API Auth tersebut. Pemulihan otomatis dijadwalkan setiap hari, bukan langsung ketika juri akan masuk. Ini keterbatasan operasional yang sudah diketahui dalam kode, belum diuji dengan sengaja mengubah kredensial. Pastikan ada prosedur pemulihan internal dan periksa login kedua peran sebelum merekam/mengirim demo; untuk pemakaian publik yang lebih luas, evaluasi pembatasan di layanan Auth.

Reset database menghapus laporan/interaksi demo, bukan berkas Storage yang terunggah. Belum dilakukan pengukuran pertumbuhan Storage atau uji kebocoran metadata unggahan; pengujian ini tidak mengunggah berkas permanen. Batas pengambilan peta 2.000 dan daftar admin 500 belum diuji dengan data melebihi batas tersebut. Tidak dilakukan stress test, audit dashboard Supabase/Vercel, pemeriksaan SMTP, atau pengiriman email verifikasi.

## Urutan penutupan yang disarankan

1. **Data/backend:** tutup temuan 1–3; verifikasi sumber BPS; buat uji kecil untuk kegagalan impor dan pemulihan karantina.
2. **Frontend:** tutup temuan 4–6; ulangi ukuran 360 dan 768 px serta mode huruf besar.
3. **Konten/tim:** perbaiki temuan 9 dan tampilkan fitur pembeda lebih awal sesuai temuan 10.
4. **Rilis:** tambahkan lint/build ke CI; tandai mode data cadangan; cek login demo kedua peran dan lima tautan skenario setelah deploy.
5. **Bukti lomba:** jalankan uji warga, rekam demo singkat, dan cocokkan seluruh klaim proposal dengan versi yang dirilis.

PRD internal mencatat final submission **11 November 2026**, video publik maksimal lima menit, proposal sesuai template, dan surat orisinalitas. Ketentuan tersebut belum diverifikasi ulang ke panitia dalam audit ini. Proposal final, video YouTube, akses Drive publik, surat, dan bukti pengumpulan tidak diperiksa; jangan menganggapnya selesai hanya karena website lulus build.

Alur rekaman yang disarankan: masalah satu warga → alasan penundaan → ubah aturan dan tunjukkan urutan bergeser → buka rapor yang membatasi penolakan tinggi → tunjukkan sumber dan batas simulasi → demonstrasikan tindak lanjut admin. Ini rekomendasi naskah, bukan klaim dampak yang sudah terbukti.

## Artefak dan batas pemeriksaan

Hasil JSON, tangkapan layar, skrip audit browser, reproduksi loader dengan driver tiruan, pemeriksaan RLS, dan Lighthouse tersimpan lokal di `.taste-skill/audit-2026-11-11/` (diabaikan Git). Screenshot tiga ukuran Beranda dan laporan inspektor ada di `.taste-skill/inspect/`. Jangan memublikasikan artefak sesi terautentikasi tanpa memeriksa isinya.

Pengujian dilakukan pada Chromium, bukan Safari/Firefox atau perangkat fisik. Tidak menguji semua kombinasi status, semua kebijakan database, gangguan layanan nyata, aksesibilitas manual penuh, ataupun setiap halaman produksi. Tidak ada jaminan hasil lomba; yang didukung audit adalah alur yang berjalan, temuan yang dapat ditelusuri, dan urutan perbaikan di atas.

**Verdict: siap demo bersyarat; perbaiki 1–6 dan selaraskan bukti data sebelum rilis penutupan lomba.**
