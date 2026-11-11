# Perbaikan setelah audit kesiapan lomba — 11 November 2026

Web pengembangan dijalankan di `http://localhost:3000`. Perubahan ada di workspace, belum di-deploy atau di-commit. Tidak ada migrasi skema atau impor data permanen.

| Temuan audit | Perubahan |
| --- | --- |
| 1 — impor wilayah | Uji titik gagal sekarang selalu melakukan rollback dan keluar dengan status gagal, termasuk pada `--dry-run`. Ada tiga tes transaksi memakai driver tiruan tanpa database/paket geospasial. |
| 2 — karantina foto | Keputusan penolakan yang sama dapat mencoba pemindahan foto lagi. Pemeriksaan hak tetap dilakukan RPC sebelum layanan admin dipakai; status/timeline tidak ditulis ulang. Detail admin menyediakan tombol “Ulangi penyembunyian foto”. |
| 3 — sumber demografi | Sumber data, FAQ Tentang, README, dan panduan skrip kini membedakan CSV yang sudah dimuat, verifikasi publikasi asal yang belum selesai, serta demografi simulasi pada cadangan frontend. Tidak mengklaim data sudah disahkan BPS. |
| 4 — overflow HP | Judul dan badge kartu sumber boleh berpindah baris, dan grid dapat menyusut. Tidak ada overflow pada lebar 320/360/390/768/1440 px. Mode huruf besar 360 px juga lulus. |
| 5 — keyboard tabel | Ketiga wadah tabel sumber memiliki fokus keyboard dan nama aksesibel. Tabel profil dapat digeser memakai tombol panah setelah difokuskan. |
| 6 — tombol istilah | Ruang klik enam label faktor simulator diperbesar; tetap memakai popover dan gaya yang ada. |
| 7 — CI | Workflow sekarang menjalankan tes Python, lint, dan build selain tes TypeScript. |
| 8 — data cadangan | Banner/label menunjukkan ketika contoh tersimpan dipakai, serta memperingatkan bahwa laporan atau perubahan terbaru mungkin belum terlihat. Label data buatan tetap ada. |
| 9 — konteks Musrenbang | Klaim 1,4% dibatasi pada usulan langsung tahun 2019. Angka 61.174 menyebut cakupan Musrenbang, usulan langsung, dan reses DPRD. Tautan studi dan siaran pers primer dapat dibuka dari Beranda/Sumber data. |
| 10 — fitur pembeda | Hero memiliki tombol utama “Coba ubah prioritas”. Perbandingan interaktif dipindahkan tepat setelah hero; pada 360 px mulai sekitar y=1.251, sebelumnya y=6.366. |

Pengujian tombol hero juga menemukan masalah navigasi hash: panel simulator belum ada saat navigasi awal karena streaming. Simulator sekarang menggeser layar dan memindahkan fokus setelah panel tersedia. Preset dan URL tetap berjalan setelah reload.

## Verifikasi

- ESLint dan build produksi, termasuk TypeScript: lulus.
- Vitest: **57 tes pada 8 berkas**, lulus.
- Python unittest: **3 tes**, lulus.
- Integrasi database: **14 pemeriksaan**, lulus; mutasi pengujian di-rollback. Dua pemeriksaan tambahan memastikan admin berwenang mencapai pemeriksaan transisi dan warga ditolak sebelumnya.
- Browser Chromium: Beranda, Sumber data, dan Prioritas pada lima lebar layar, **15 kombinasi**, tanpa galat JavaScript yang tertangkap, tanpa overflow dokumen, dan tanpa temuan axe pada aturan WCAG A/AA yang dijalankan.
- Interaksi: tombol hero benar-benar membuka panel; pilihan cepat bertahan setelah reload; Sumber data huruf besar tidak melebar; tabel dapat digeser lewat keyboard.
- Kegagalan dan pemulihan Storage diuji dengan mock. Tidak sengaja membuat kegagalan atau memindahkan foto laporan pengguna untuk pengujian.

Hasil browser dan screenshot ada di `.taste-skill/perbaikan-2026-11-11/` (lokal, diabaikan Git). Audit awal disimpan sebagai catatan kondisi sebelum perbaikan di `audit-kesiapan-lomba-2026-11-11.md`.

## Yang tetap terbuka

Verifikasi transkripsi terhadap publikasi BPS asal, uji ke lima warga, penilaian manual target peta, Safari/perangkat fisik, dan pemeriksaan berkas submission. Tidak ada hasil uji warga yang dibuat-buat. Perubahan ini belum mengubah situs produksi; angka Lighthouse produksi di README adalah baseline sebelum perbaikan ini.

## Penyederhanaan tampilan setelah masukan pengguna

Pengguna merasa font, ikon, dan jumlah teks membingungkan. Fokus revisi ini adalah beranda dan elemen bersama, dengan identitas Satoshi/teal tetap dipakai.

- Hero menjadi satu kalimat pendukung; slogan tab dan tiga klaim berulang dihapus. Ikon dekoratif di tab dihilangkan, petunjuk lacak dipersingkat.
- Contoh tiga langkah dan rincian alasan peringkat dapat dibuka lewat `details/summary`, sehingga penjelasan tetap tersedia dengan keyboard maupun tanpa JavaScript.
- Spanduk promosi berulang di tengah beranda dihapus. Teks bagian kategori, laporan, Musrenbang, dan peran diringkas.
- Teks kecil dinaikkan dari 14 ke 15 px. Bobot paragraf hero dan isian dikurangi agar berbeda jelas dari judul/tombol.
- Menu samping desktop diperlebar dari 76 ke 100 px dan diberi label. Ikon tetap memakai keluarga Lucide yang sama.
- Label batas waktu boleh membungkus agar teks yang lebih besar tidak membuat halaman melebar.

Pengukuran Chromium: teks beranda yang langsung terlihat turun dari sekitar 9.975 ke 6.673 karakter (sekitar 33%; dapat berubah mengikuti data). Ini ukuran kepadatan konten, bukan hasil uji pemahaman warga. Pemeriksaan visual dilakukan pada screenshot HP, tablet, dan desktop. Inspector estetika tetap menandai pola lama (garis, kartu, bayangan) dan salah membaca digit animasi sebagai judul panjang; tidak diklaim lolos seluruh aturan estetika. Revisi ini tidak mengganti seluruh desain aplikasi.
