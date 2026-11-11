# Data dan database demo

Jalankan dari root aplikasi. Rahasia dibaca dari `.env.local`; jangan commit file itu.

## Demo fungsional

1. Terapkan migrasi `supabase/migrations/0001` sampai `0011` berurutan pada proyek Supabase.
2. Siapkan akun demo warga dan admin, beserta profil `is_demo = true`. Admin demo menangani instansi 1. Isi variabel `DEMO_*` di `.env.local`.
3. Isi `DATABASE_URL`, kemudian jalankan:

```bash
npm run demo:setup             # pemeriksaan tanpa mengubah data
npm run demo:setup -- --apply  # hanya menerima database wilayah/laporan/seed yang kosong
npm run test:db               # integrasi RPC; semua mutasi uji di-rollback
```

Bootstrap memasukkan 42 wilayah dan 520 laporan simulasi, timeline (termasuk penolakan duplikat yang merujuk laporan asli dan kendala/alasan tunda dari migrasi 0010), rating, serta snapshot untuk reset demo. Proses bersifat transaksional: jika gagal, seluruh perubahan dibatalkan. Data atau akun yang sudah ada tidak dihapus dan peran akun tidak diubah. Skrip menolak pengisian ulang database yang telah berisi data.

Batas wilayah memakai HDX COD-AB. Bootstrap dan cadangan frontend memakai **demografi simulasi**. Database tim sudah memuat 42 baris dari `regions_siap_muat.csv` beratribusi BPS/Dukcapil; kesesuaiannya dengan publikasi asal masih perlu diverifikasi. Laporan awal dimiliki akun admin demo agar akun warga demo bisa mendukungnya. Catatan seed tidak berpura-pura berasal dari petugas; lampiran SVG diberi label ilustrasi, bukan foto lapangan. Dukungan baru berasal dari interaksi pengguna. Snapshot disiapkan untuk RPC `reset_demo_data`, yang memang memulihkan data simulasi dan menghapus interaksi akun demo.

`0007_agregasi_demo.sql` mengisi fungsi `priority_factors` dan `agency_report_card` yang belum diimplementasikan dalam placeholder `0004`/`0005`. Angka dashboard dihitung dari laporan yang sama dengan peta, bukan dari JSON terpisah. Migrasi juga menandai laporan dari akun demo sebagai simulasi.

## Data lokal dan peta

| Skrip | Fungsi |
| --- | --- |
| `00_potong_dki.py` | Memotong batas HDX nasional menjadi DKI |
| `01_wilayah.py` | Menyiapkan 42 kecamatan, GeoJSON web/detail, dan CSV wilayah |
| `02_bps.py` | Menggabungkan CSV demografi dengan kode wilayah; tidak menulis ke database |
| `03_muat_regions.py` | Upsert wilayah; `--dry-run` melakukan rollback, dan uji titik gagal selalu membatalkan transaksi |
| `buat-jalur-svg.mjs` | Menghasilkan jalur SVG untuk peta kecamatan |
| `buat-data-contoh.mjs` | Menghasilkan fallback frontend deterministik, 520 laporan |
| `siapkan-demo.mjs` | Mengisi database demo kosong beserta snapshot |
| `verifikasi-demo.mjs` | Menguji agregasi, alur warga–admin, dan reset dalam transaksi rollback |

Integrasi CRM dan pembuatan akun otomatis belum tersedia. Untuk demografi, periksa sumber CSV terlebih dahulu, jalankan `02_bps.py`, lalu `03_muat_regions.py --dry-run` sebelum pemuatan sebenarnya. Halaman `/sumber-data` mencatat status dan atribusi setiap sumber. Tes pengaman transaksi dapat dijalankan tanpa database atau paket geospasial: `python3 -m unittest discover -s tests -p 'test_*.py'`.

Untuk mengolah geometri lokal:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r scripts/requirements.txt
python scripts/00_potong_dki.py
python scripts/01_wilayah.py
```
