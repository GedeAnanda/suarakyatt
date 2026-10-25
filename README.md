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

## Progress saat ini

<!-- Perbarui bagian ini sebelum First Draft Submission (1 November 2026) -->

- [x] Repo dan struktur proyek
- [x] Skema database awal (`0001_schema.sql`)
- [x] Kontrak data bersama (`lib/types.ts`) dan data contoh untuk frontend
- [x] Deploy pertama ke Vercel: https://suarakyatt.vercel.app
- [x] RLS dan view publik (`0002`), RPC laporan dan reset demo (`0003`), data instansi dan kategori (`0006`)
- [x] Auth: login, daftar, verifikasi email, akun demo warga dan admin
- [ ] Halaman masuk/daftar (UI)
- [ ] Landing page
- [ ] Peta publik dengan data seed
- [ ] Form laporan dan halaman lacak
- [ ] Halaman admin
- [ ] Rapor Instansi
- [ ] Dashboard Prioritas, simulator bobot, dan "Kenapa belum?"

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
