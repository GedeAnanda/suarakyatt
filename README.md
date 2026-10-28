# suaRAkyat

Platform web transparansi keputusan publik: warga melapor masalah kota, melacak penanganannya, dan bisa melihat serta menguji kenapa sebuah masalah didahulukan. Dibuat untuk lomba Web in Action (WIA) MIA 2026.

## Tech stack

- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS
- **Backend dan database:** Supabase (Postgres + PostGIS, Auth, Storage, RPC)
- **Peta dan grafik:** Leaflet + OpenStreetMap, Recharts
- **Hosting:** Vercel (termasuk Vercel Cron)
- **Skrip data:** Python (pandas, geopandas)

## Cara menjalankan

```bash
git clone https://github.com/GedeAnanda/suarakyatt.git
cd suarakyatt
npm install
cp .env.example .env.local   # isi nilainya; minta ke ketua tim
npm run dev
```

Buka `http://localhost:3000`.

Untuk menyiapkan database dari nol:

1. Jalankan semua file di `supabase/migrations/` berurutan menurut nomornya lewat SQL editor Supabase atau `supabase db push`.
2. Jalankan skrip data dan seed sesuai `scripts/README.md`.

Tes modul skor: `npm test`.

## Fitur dan pemeriksaan

Beranda interaktif, login/daftar, peta publik, formulir laporan, pelacakan, tindak lanjut admin, rapor instansi, simulator prioritas, dan panel “Kenapa belum?” sudah tersedia. Pengaturan bobot, kategori, dan isu terpilih bisa dibagikan lewat URL. Tautan `/contoh` memilih laporan yang tersedia dari sumber data aktif.

```bash
npm run lint
npm test
npm run build
npm run test:db  # memerlukan DATABASE_URL; semua mutasi pengujian di-rollback
```

Database demo dapat diisi dengan `npm run demo:setup -- --apply` setelah migrasi dan akun demo tersedia. Skrip hanya menerima database kosong. Panduan ada di [scripts/README.md](scripts/README.md).

## Alur presentasi lomba

1. Buka Beranda. Ubah pilihan di “Satu isu, dua urutan” dan jelaskan perubahan peringkat.
2. Buka perhitungan lengkap. Pilih kategori dan isu, ubah bobot, lalu bagikan URL skenarionya.
3. Buka `/contoh`. Bandingkan penjelasan model dengan riwayat penanganan; peringkat bukan janji tanggal perbaikan.
4. Masuk sebagai warga demo untuk melapor atau mendukung laporan yang sudah ada.
5. Masuk sebagai admin demo untuk memverifikasi dan memproses laporan kategori Jalan rusak.
6. Buka rapor: tunjukkan denominator laporan terlambat dan pembatasan huruf ketika tingkat penolakan tinggi.

Fokus subtema: **Data-Driven Decision Support** dan **Civic Reporting & Accountability**, didukung **Public Service Tracking**. Data BPS/CRM belum terintegrasi. Laporan, demografi perhitungan, dan kinerja instansi adalah simulasi; batas wilayah dan angka konteks Musrenbang memiliki sumber publik terpisah.

## Tim

| Nama | Peran |
| --- | --- |
| (isi) | A · Frontend & Desain |
| (isi) | B · Backend & Integrasi (ketua) |
| (isi) | C · Data & Skor |

## Dokumen

- `docs/suaRAkyat_PRD_v0.3.pdf`: kebutuhan produk (apa dan kenapa)
- `docs/suaRAkyat_SDD_v1.0.pdf`: desain teknis (bagaimana)
- `CONTRIBUTING.md`: aturan kerja tim

Versi terbaru kedua dokumen ada di link dokumen online tim; PDF di folder `docs/` adalah salinan.

## Data

Sebagian data di aplikasi ini adalah **data simulasi** dan diberi label di setiap halaman. Sumber dan lisensi data nyata tercantum di halaman Sumber Data aplikasi.
