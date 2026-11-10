# suaRAkyat

Platform web transparansi keputusan publik: warga melapor masalah kota, melacak penanganannya, dan bisa melihat serta menguji kenapa sebuah masalah didahulukan. Dibuat untuk lomba Web in Action (WIA) MIA 2026.

## Tech stack

- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS
- **Backend dan database:** Supabase (Postgres + PostGIS, Auth, Storage, RPC)
- **Peta dan grafik:** Leaflet + OpenStreetMap, grafik SVG/CSS buatan sendiri (paket Recharts terpasang tetapi belum dipakai)
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

Beranda interaktif, login/daftar, peta publik, formulir laporan, pelacakan, tindak lanjut dinas (admin), rapor dinas, urutan prioritas dengan “Coba atur sendiri”, panel “Kenapa belum?”, dan skor 42 kecamatan (`/kecamatan`) sudah tersedia. Seluruh teks memakai bahasa sehari-hari dengan satu kamus istilah (`lib/kamus.ts`, lihat `docs/audit-awam-2026-11-10.md`). Halaman lacak menampilkan “Status sekarang” di atas peta: alasan tunda dari dinas, alasan penolakan, dan tautan ke laporan asli untuk duplikat. Percobaan aturan, jenis masalah, dan masalah terpilih bisa dibagikan lewat URL. Tautan `/contoh` memilih laporan yang tersedia dari sumber data aktif; `/contoh?jenis=terlambat|ditolak|duplikat|melanggar|selesai` membuka tiap skenario.

```bash
npm run lint
npm test
npm run build
npm run test:db  # memerlukan DATABASE_URL; semua mutasi pengujian di-rollback
```

Database demo dapat diisi dengan `npm run demo:setup -- --apply` setelah migrasi dan akun demo tersedia. Skrip hanya menerima database kosong. Panduan ada di [scripts/README.md](scripts/README.md).

## Alur presentasi lomba

1. Buka Beranda. Ubah pilihan di “Urutan bisa berubah, tergantung apa yang diutamakan” dan jelaskan perubahan urutannya.
2. Buka Urutan prioritas. Pilih jenis masalah dan masalahnya, coba pilihan cepat atau atur sendiri, lalu bagikan URL percobaannya.
3. Buka `/lacak`, lalu coba skenario “Terlambat, ada kendala” dan “Ditolak karena duplikat”. Di HP, alasan tunda dan alasan tolak langsung terlihat di kotak “Status sekarang”; panel “Kenapa belum?” menjelaskan posisi model. Peringkat bukan janji tanggal perbaikan.
4. Buka `/kecamatan`, pilih satu kecamatan, dan baca kalimat serta grafik posisinya di antara 42 kecamatan.
5. Masuk sebagai warga demo untuk melapor atau mendukung laporan yang sudah ada.
6. Masuk sebagai admin demo untuk memverifikasi dan memproses laporan kategori Jalan rusak, lalu catat kendalanya (“Belum bisa diselesaikan? Catat kendalanya”).
7. Buka rapor: tunjukkan denominator laporan terlambat dan pembatasan huruf ketika tingkat penolakan tinggi.

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
- `docs/revisi-fds-2026-11-10.md`: catatan mentor First Draft Submission dan hasil revisinya
- `docs/audit-awam-2026-11-10.md`: audit bahasa awam, alur UX di HP, dan data, beserta kamus istilah

Versi terbaru kedua dokumen ada di link dokumen online tim; PDF di folder `docs/` adalah salinan.

## Data

Sebagian data di aplikasi ini adalah **data simulasi** dan diberi label di setiap halaman. Sumber dan lisensi data nyata tercantum di halaman Sumber Data aplikasi.
