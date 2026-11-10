# Audit alur pengguna dan UX — 30 Oktober 2026

> Audit fungsional atas alur warga, tamu, dan admin di branch `feat-ui-2` (commit `dab3412`). Audit desain visual sudah dikerjakan di [audit-desain-2026-10-28.md](audit-desain-2026-10-28.md). Yang diperiksa di sini adalah apakah alurnya jalan, jelas, dan bisa dipakai semua orang.
>
> **Status 30 Oktober (sore):** semua temuan A, B, dan C sudah diperbaiki di working tree dan belum di-commit. Rinciannya ada di [Hasil perbaikan](#hasil-perbaikan). 42 pemeriksaan browser lulus. Dua hal masih butuh tindakan di luar kode: pengaturan Redirect URLs di dashboard Supabase untuk lupa password, dan uji B3 di HP asli.

## Ringkasan cepat (temuan awal)

- **Ada 3 bug yang memutus alur, dan semuanya kena alur presentasi juri.** Perbaiki ketiganya sebelum hari H.
  1. `/peta?status=…` selalu error ("Halaman ini gagal dimuat"). Tautan dari Rapor, Cara Menilai, spanduk Beranda, dan reload sesudah klik chip status semuanya rusak.
  2. Tombol "Coba sebagai warga demo" di `/masuk` tidak pindah ke `/lapor`. Login sebenarnya berhasil (header sudah "Warga Demo"), tapi layar tetap di form masuk.
  3. Admin hanya bisa mengubah status satu kali. Sesudah itu form berganti jadi pesan sukses dan tidak kembali. Untuk lanjut dari Diverifikasi ke Diproses, admin harus pindah halaman dulu. Ini regresi dari commit `987e1e0`.
- **Ada 8 celah UX tingkat sedang**, antara lain: laporan serupa muncul sekitar 900 px di bawah peta, CTA "Lapor masalah" tidak terlihat di layar pertama HP, input foto memaksa kamera, foto HP di atas 5 MB ditolak sebelum dikompres, dan tidak ada "Lupa password".
- **Yang sudah sehat:** 9 halaman publik di 390 px dan 1440 px tanpa console error dan tanpa overflow horizontal. 30 tautan internal tidak ada yang rusak. Draf laporan, ringkasan galat, dan pengaman open redirect berjalan. Lint, 19 tes Vitest, dan build produksi lulus.

## Cara audit

| | |
|---|---|
| Skill | `find-skills` (memilih alat), `web-design-guidelines` (aturan Vercel Web Interface Guidelines), `webapp-testing` (Playwright) |
| Alat | build produksi `next start -p 3100`, `playwright-core` 1.64 dan `axe-core` di luar proyek (bukan dependensi), Chrome headless |
| Lebar layar | 390×844 (HP, sentuh) dan 1440×900 |
| Akun | tamu, warga demo, admin demo |
| Data | tidak ada laporan, dukungan, atau perubahan status yang dikirim. Bug 3 dibuktikan lewat kode dan riwayat git, bukan dengan mengubah data demo |
| Tidak diuji | email verifikasi sungguhan, HP fisik (iOS/Android), Vercel produksi |

## A. Bug yang memutus alur (kritis)

### A1. `/peta?status=…` selalu error

- **Gejala:** `/peta?status=ditolak` dan `/peta?status=ditolak&kategori=1` menampilkan "Halaman ini gagal dimuat". `/peta?kategori=1` aman. Di log server muncul `TypeError: f.STATUS_PUBLIK.includes is not a function`.
- **Sebab:** [app/peta/page.tsx:8](../app/peta/page.tsx#L8) adalah Server Component yang mengimpor konstanta `STATUS_PUBLIK` dari [components/peta/PetaLaporan.tsx:24](../components/peta/PetaLaporan.tsx#L24), padahal file itu `'use client'`. Di server, ekspor dari file klien hanya berupa referensi klien, bukan array, jadi `.includes` di [baris 23](../app/peta/page.tsx#L23) gagal.
- **Yang kena:**
  - peringatan penolakan di [KartuRapor.tsx:27](../components/rapor/KartuRapor.tsx#L27) (langkah 6 alur presentasi);
  - [cara-menilai/page.tsx:128](../app/rapor/cara-menilai/page.tsx#L128);
  - spanduk Beranda [SpandukGeser.tsx:15](../components/beranda/SpandukGeser.tsx#L15);
  - URL yang ditulis `replaceState` sesudah pengguna menekan chip status, lalu halaman di-reload atau tautannya dibagikan.
- **Perbaikan (A):** pindahkan `STATUS_PUBLIK` ke modul yang aman untuk server (misalnya `lib/konten.ts`), lalu impor dari sana di kedua file.

### A2. "Coba sebagai warga demo" tetap di halaman Masuk

- **Gejala:** Di `/masuk`, desktop maupun HP, klik "Coba sebagai warga demo" berakhir di `/masuk?lanjut=/lapor`. Form masuk tetap tampil, padahal header sudah menampilkan "WD Warga Demo". Membuka `/lapor` langsung bisa. Via curl, cookie sesi sudah sah (`/lapor` → 200).
- **Sebab:** Waktu masih tamu, tautan "Lapor masalah" di header ([Header.tsx:133](../components/Header.tsx#L133)) dan di menu samping di-prefetch, dan hasilnya redirect proxy ke `/masuk?lanjut=/lapor`. Sesudah login, [TombolDemo.tsx:52](../components/TombolDemo.tsx#L52) memanggil `router.push('/lapor')`, dan router memakai hasil prefetch lama itu. Halaman `/masuk` juga tidak mengalihkan pengguna yang sudah login ([masuk/page.tsx:16](../app/masuk/page.tsx#L16)), jadi pengguna terjebak.
- **Dampak:** Ini langkah 4 alur presentasi README ("Masuk sebagai warga demo untuk melapor"). Admin demo tidak kena karena tidak ada tautan `/admin` yang di-prefetch.
- **Perbaikan (A):**
  1. Di `TombolDemo`, ganti `router.push` dan `router.refresh` dengan `window.location.assign(tujuan)` (navigasi penuh, jadi cache router ikut bersih).
  2. Di `/masuk`, kalau sesi sudah ada, langsung `redirect(lanjut)`. Dengan begitu redirect lama di cache tetap berakhir di tujuan yang benar.

### A3. Admin macet sesudah satu kali ubah status (regresi)

- **Gejala (dari kode):** Sesudah simpan, `FormUbahStatus` menyimpan `berhasil` dan menampilkan pesan sukses ([FormUbahStatus.tsx:115](../components/admin/FormUbahStatus.tsx#L115)). `router.refresh()` mengirim status baru lewat props, tapi state `berhasil` tetap ada, sehingga form transisi berikutnya tidak muncul.
- **Sebab:** Commit `3c84e18` (27 Okt) sudah memasang `key={l.status}` supaya form dipasang ulang setiap status berubah. Commit `987e1e0` (28 Okt) menghapus key itu dari [admin/laporan/[kode]/page.tsx:83](../app/admin/laporan/%5Bkode%5D/page.tsx#L83).
- **Dampak:** Alur admin Menunggu → Diverifikasi → Diproses (langkah 5 alur presentasi) butuh pindah halaman di antara setiap perubahan.
- **Perbaikan (A):** kembalikan `<FormUbahStatus key={l.status} … />`.

## B. Celah UX tingkat sedang

| # | Celah | Bukti | Usulan | Pemilik |
|---|---|---|---|---|
| B1 | Laporan serupa (FR-B3) muncul jauh dari peta | Diukur: kartu "Sudah ada 1 laporan serupa" ada sekitar 905 px (desktop) dan 887 px (HP) di bawah peta, sesudah langkah foto dan cerita. Kartunya juga tidak berada di live region. [FormLaporan.tsx:499](../components/lapor/FormLaporan.tsx#L499) | Tampilkan langsung di bawah peta di langkah 2, atau beri satu baris `aria-live` di langkah 2 ("1 laporan serupa dalam 100 m · Lihat"). Warga sebaiknya tahu sebelum menulis cerita. | A |
| B2 | CTA "Lapor masalah" tidak terlihat di layar pertama HP | Di 390 px header hanya berisi menu dan Masuk ([Header.tsx:133](../components/Header.tsx#L133) `hidden sm:flex`). Di hero, "Lapor masalah" adalah tab ke-5 dan tab ke-3 saja sudah terpotong ([HeroCari.tsx:54](../components/beranda/HeroCari.tsx#L54)). | Tampilkan ikon "Lapor" di header HP, atau jadikan tab Lapor terlihat tanpa digeser. | A |
| B3 | Input foto memaksa kamera | `capture="environment"` di [FormLaporan.tsx:464](../components/lapor/FormLaporan.tsx#L464). Di Android Chrome dan iOS Safari, atribut ini langsung membuka kamera tanpa pilihan galeri, padahal warga sering memotret dulu lalu melapor belakangan. | Hapus `capture`. Menu bawaan HP tetap menawarkan kamera dan galeri. Perlu dicek di HP asli. | A |
| B4 | Foto HP di atas 5 MB ditolak sebelum dikompres | [lib/foto.ts:11](../lib/foto.ts#L11) memeriksa ukuran file mentah, padahal hasil kompresnya (1600 px WebP) hanya ratusan KB. Foto kamera 48 MP biasanya 5–12 MB. | Naikkan batas file mentah (misalnya 20 MB). Batas 5 MB tetap berlaku untuk hasil kompres, sesuai bucket. Selaraskan teks FR-B1 di PRD. | A |
| B5 | Tidak ada "Lupa password" | Tidak ada tautan atau alur reset di [FormAuth.tsx](../components/FormAuth.tsx). Pesan `EMAIL_BELUM_VERIFIKASI` juga tidak punya tombol kirim ulang. | Tambahkan `resetPasswordForEmail` dan halaman ganti password, plus tombol "Kirim ulang verifikasi". Untuk lomba ini prioritas rendah karena juri memakai akun demo. | B + A |
| B6 | Form Daftar mengosongkan isian sesudah galat | Diuji: nama 1 huruf → "Periksa kembali isian Anda." Nama dan email ikut kosong. Penyebabnya, React 19 mereset form sesudah action selesai ([FormAuth.tsx:92](../components/FormAuth.tsx#L92)). Pesannya juga tidak menyebut kolom yang salah. | Kembalikan nilai lewat state action lalu pakai `defaultValue`, atau validasi di klien (`minLength={2}` pada Nama). Tampilkan galat per kolom. | A + B |
| B7 | Belum ada "Laporan saya" | Warga yang kehilangan kode tidak punya jalan untuk menemukan laporannya. Menu akun hanya berisi Lapor dan Keluar ([Header.tsx:84](../components/Header.tsx#L84)). Fitur ini masuk daftar "Sebaiknya ada" no. 9 di PRD. | Minimal: daftar kode milik akun di menu akun atau di `/lacak` saat login. | A + B |
| B8 | Memilih titik tidak bisa lewat keyboard | Diuji: fokus di peta lalu Enter atau Spasi tidak membuat titik. Titik hanya bisa dibuat dengan klik ([PetaPinLeaflet.tsx:17](../components/lapor/PetaPinLeaflet.tsx#L17)) atau "Pakai lokasi saya". Tidak ada pencarian alamat. | Tambahkan tombol "Taruh titik di tengah peta" (peta digeser dengan panah), dan sebaiknya pencarian nama jalan atau kelurahan. | A |

## C. Detail kecil

| # | Temuan | Lokasi | Usulan |
|---|---|---|---|
| C1 | Banner "Laporan terkirim. Simpan kode …" tampil untuk siapa saja yang membuka URL `?baru=1`. Sudah dicek sebagai tamu. | [laporan/[kode]/page.tsx:62](../app/laporan/%5Bkode%5D/page.tsx#L62) | Tampilkan hanya kalau `hubungan.pemilik`, lalu hapus parameternya dengan `router.replace`. |
| C2 | Galat "Dukung" di daftar laporan serupa muncul di kotak kirim, dengan tambahan "Isian Anda masih tersimpan; tekan tombol kirim untuk mencoba lagi", dan tombolnya berubah jadi "Coba kirim lagi". | [FormLaporan.tsx:292](../components/lapor/FormLaporan.tsx#L292), [584](../components/lapor/FormLaporan.tsx#L584) | Pakai state galat terpisah dan tampilkan di dalam kartu serupa. |
| C3 | Sesudah "Ya, batalkan", pengguna dipindah ke `/peta` tanpa pemberitahuan apa pun. | [AksiLaporan.tsx:109](../components/laporan/AksiLaporan.tsx#L109) | `umumkan('Laporan … dibatalkan.')` sebelum pindah halaman. |
| C4 | `/masuk` tetap menampilkan form untuk pengguna yang sudah login. | [masuk/page.tsx](../app/masuk/page.tsx) | Ikut diperbaiki oleh A2 langkah 2. |
| C5 | Tautan verifikasi email selalu kembali ke `/lapor`. Pendaftar yang datang dari "Masuk untuk mendukung" tidak dikembalikan ke laporannya. | [aksi-auth.ts:83](../lib/supabase/aksi-auth.ts#L83) | Teruskan `lanjut` ke form Daftar dan ke `emailRedirectTo`. |
| C6 | Proxy membuang query string waktu mengarahkan tamu ke `/masuk` (`/lapor?kategori=1` → `lanjut=/lapor`). | [proxy.ts:30](../proxy.ts#L30) | Kirim `pathname + search`. Dampaknya kecil karena belum ada tautan `/lapor?…`. |
| C7 | Perkiraan tanggal selesai di form admin bisa diisi tanggal yang sudah lewat, sehingga label "Melewati janji" langsung muncul. | [FormUbahStatus.tsx:168](../components/admin/FormUbahStatus.tsx#L168) | `min={hari ini}`. |
| C8 | Detail laporan di admin tidak punya peta lokasi, padahal admin perlu memverifikasi titiknya. | [admin/laporan/[kode]/page.tsx](../app/admin/laporan/%5Bkode%5D/page.tsx) | Pakai `TitikTunggal` seperti di halaman publik. |
| C9 | Titik indikator spanduk di Beranda berukuran 10×24 px (axe `target-size`, WCAG 2.5.8 minimal 24×24). | [SpandukGeser.tsx:132](../components/beranda/SpandukGeser.tsx#L132) | Lebarkan area klik ke `min-w-6`; titik visualnya boleh tetap kecil. |
| C10 | Subjudul tombol "Kenapa belum?" punya kontras 4,15:1 (`text-white/90` di atas `#3264ff`). Batas AA 4,5:1. | [PanelKenapaBelum.tsx:52](../components/laporan/PanelKenapaBelum.tsx#L52) | `text-white` penuh. |
| C11 | "Kembali" memakai `history.length > 1`. Pengunjung yang datang dari Google atau WhatsApp bisa terlempar keluar situs. | [TombolKembali.tsx:17](../components/TombolKembali.tsx#L17) | Cek `document.referrer` dari origin yang sama; kalau bukan, pakai `cadangan`. |
| C12 | Build memperingatkan `metadataBase` belum diisi. Di Vercel, Next memakai URL produksi otomatis; di host lain, URL OG image jatuh ke localhost. | [app/layout.tsx:20](../app/layout.tsx#L20) | Isi `metadataBase` dari env. |

## D. Yang sudah sehat

- Halaman `/`, `/peta`, `/prioritas`, `/rapor`, `/rapor/cara-menilai`, `/sumber-data`, `/lacak`, `/masuk`, dan `/contoh` di 390 px dan 1440 px: status 200, satu `h1`, tidak ada console error, tidak ada overflow horizontal.
- 30 tautan internal dicek dan tidak ada yang 4xx/5xx. Catatan: `/peta?status=…` mengembalikan 200 tapi isinya halaman error (A1), jadi lolos dari cek status.
- Form Lapor:
  - draf tersimpan dan dipulihkan, lengkap dengan banner "Mulai dari kosong";
  - kirim kosong memfokuskan ringkasan "Belum bisa dikirim: 4 hal";
  - titik di peta menentukan kecamatan dengan benar (contoh: Setiabudi);
  - laporan serupa terdeteksi.
- Login salah: pesan jelas dan email tetap terisi. `tujuanAman` menolak open redirect dan punya tes.
- Admin: kembali dari detail ke daftar mempertahankan filter. Tolak "Tidak valid" tanpa catatan membuat tombol simpan nonaktif dan menampilkan petunjuknya.
- Kontras rapor yang dulu gagal ternyata hanya terjadi saat animasi berjalan. Sesudah animasi selesai, rapor lolos axe.

## Urutan kerja yang disarankan

1. **Hari ini:** A1, A2, dan A3. Ketiganya perbaikan 1–5 baris dan memulihkan langkah 4–6 alur presentasi.
2. **Sebelum hari H:** B1, B2, B3, B4, B6, C1, C2, C3. Semuanya kecil dan semuanya di wilayah A.
3. **Kalau ada waktu:** B7, B8, C5–C12.
4. **Roadmap:** B5 (reset password dan kirim ulang verifikasi), cukup disebut di slide.

## Hasil perbaikan

Dikerjakan di `feat-ui-2` dan belum di-commit. `tsc`, lint, 19 tes Vitest, dan build produksi lulus. Pemeriksaan browser memakai build produksi di 320, 360, 390, dan 1440 px. Tidak ada laporan, dukungan, perubahan status, atau email yang dikirim.

| # | Perubahan | File | Bukti di browser |
|---|---|---|---|
| A1 | `STATUS_PUBLIK` dipindah ke `lib/konten.ts`, jadi halaman server tidak lagi mengimpor nilai dari file `'use client'`. File klien lain sudah dicek dan tidak ada kasus serupa. | `lib/konten.ts`, `app/peta/page.tsx`, `components/peta/PetaLaporan.tsx` | `/peta?status=ditolak`, `…&kategori=1`, dan reload sesudah klik chip status semuanya terbuka normal dengan chip yang benar |
| A2 | Demo login memakai `window.location.assign`, bukan `router.push`. Proxy mengalihkan pengguna yang sudah login dari `/masuk` ke `lanjut` (sekaligus menutup C4). | `components/TombolDemo.tsx`, `proxy.ts` | Warga demo dari `/masuk` → `/lapor`. Dari `/masuk?lanjut=/laporan/…` → kembali ke laporan. Admin demo → `/admin/laporan` |
| A3 | `key={l.status}` dikembalikan. | `app/admin/laporan/[kode]/page.tsx` | Dicek lewat kode, bukan dengan mengubah status (supaya data demo tidak berubah). Ini perbaikan yang sama dengan commit `3c84e18`, yang dulu sudah diuji end-to-end |
| B1 + C2 | Kartu laporan serupa dipindah ke langkah 2, tepat di bawah peta. Jumlahnya ikut diumumkan di live region lokasi. Galat dukung punya tempat sendiri di dalam kartu. | `components/lapor/FormLaporan.tsx` | Jarak dari peta turun dari 905 px menjadi 88 px; jumlah serupa terbaca di live region |
| B2 | Tautan "Lapor" di header HP. Di bawah 360 px hanya ikonnya; nama lengkap tetap dibaca pembaca layar. | `components/Header.tsx` | Terlihat di 320, 360, dan 390 px, tamu maupun login. **Koreksi:** di 320–374 px header ternyata 16–18 px lebih lebar dari layar. Sudah diperbaiki, lihat R1 di [audit-responsif-2026-10-30.md](audit-responsif-2026-10-30.md) |
| B3 | Atribut `capture` dihapus, jadi HP menawarkan kamera dan galeri. | `components/lapor/FormLaporan.tsx` | Atributnya sudah tidak ada. **Perlu dicek di HP asli** |
| B4 | Batas file asli naik menjadi 20 MB. Batas 5 MB kini berlaku untuk hasil kompres, sama dengan bucket. Teks form, form admin, dan FR-B1 di PRD ikut diselaraskan. | `lib/foto.ts`, `components/lapor/FormLaporan.tsx`, `components/admin/FormUbahStatus.tsx`, `docs/suaRAkyat_PRD_v0.3.md` | – |
| B5 | Ditambahkan "Lupa password?" (`lupaPassword`), halaman `/masuk/sandi-baru` (`gantiPassword`), dan tombol "Kirim ulang email verifikasi" yang muncul setelah `EMAIL_BELUM_VERIFIKASI`. Password akun demo tidak bisa diganti dari situs, dan email reset tidak dikirim ke akun demo. | `lib/supabase/aksi-auth.ts`, `components/FormAuth.tsx`, `app/masuk/page.tsx`, `app/masuk/sandi-baru/page.tsx`, `lib/errors.ts` | Form lupa terisi email yang tadi diketik. `/masuk?mode=lupa` dan tautan reset yang gagal menampilkan form lupa. `/masuk/sandi-baru` tanpa sesi menawarkan tautan baru. Akun demo ditolak dengan pesan yang jelas |
| B6 | Nama dan email dikembalikan action sebagai `defaultValue`. Galat tampil di bawah kolomnya, dengan `aria-invalid`, lalu fokus pindah ke kolom itu. Nama diberi `minLength={2}` dan `maxLength={80}`. | `components/FormAuth.tsx`, `lib/supabase/aksi-auth.ts` | Login gagal: email tetap. Daftar dengan nama 1 huruf: nama dan email tetap, galat muncul di kolom Nama, dan kolom itu terfokus |
| B7 | Bagian "Laporan Anda" di `/lacak` untuk pengguna login, memakai RLS `pelapor baca miliknya` (tanpa migrasi). Laporan yang dibatalkan ikut tampil tapi tidak ditautkan. Menu akun mendapat "Laporan saya". | `lib/data/laporan.ts`, `app/lacak/page.tsx`, `components/Header.tsx` | Warga demo melihat daftar laporannya |
| B8 | Peta di form Lapor bisa dipakai dengan keyboard: panah menggeser peta, Enter atau Spasi menaruh titik di tengah. Saat difokus dengan keyboard, tanda + dan petunjuk tombol muncul, dan peta punya `aria-label`. Pencarian alamat belum dibuat; Nominatim publik tidak cocok untuk produksi. | `components/lapor/PetaPinLeaflet.tsx` | Fokus, panah, lalu Enter menaruh titik dan menampilkan kecamatannya |
| C1 | Banner "Laporan terkirim" hanya untuk pelapor. `?baru=1` dihapus dari URL dengan `history.replaceState`. | `app/laporan/[kode]/page.tsx`, `components/laporan/HapusParamBaru.tsx` | Tamu tidak melihat banner, dan URL-nya bersih |
| C3 | Toast "Laporan … dibatalkan." sebelum pindah ke peta. | `components/laporan/AksiLaporan.tsx` | Dicek lewat kode (membatalkan laporan akan mengubah data) |
| C5 | `lanjut` diteruskan ke form Daftar dan ke tautan verifikasi. | `components/FormAuth.tsx`, `lib/supabase/aksi-auth.ts` | – |
| C6 | Proxy membawa query ke `lanjut`. | `proxy.ts` | `/lapor?kategori=1` → `/masuk?lanjut=%2Flapor%3Fkategori%3D1` |
| C7 | `min` hari ini (WIB) pada input tanggal, ditambah pemeriksaan di form. | `components/admin/FormUbahStatus.tsx`, `lib/format.ts` (`hariIni`) | `min=2026-10-30` |
| C8 | Peta titik laporan di detail admin. | `app/admin/laporan/[kode]/page.tsx` | Peta tampil |
| C9 | Area klik titik spanduk minimal 24×24 px. | `components/beranda/SpandukGeser.tsx` | axe `target-size` bersih di Beranda |
| C10 | Subjudul "Kenapa belum?" memakai `text-white` penuh. | `components/laporan/PanelKenapaBelum.tsx` | axe `color-contrast` bersih di `/contoh` |
| C11 | "Kembali" memakai Navigation API (hanya entri dari origin yang sama), dengan cadangan `document.referrer`. | `components/TombolKembali.tsx` | – |
| C12 | `metadataBase` dibaca dari env `SITE_URL` (opsional; tanpa env itu, Next memakai domain Vercel). | `app/layout.tsx`, `.env.example` | Peringatan build lokal tetap muncul selama `SITE_URL` kosong; ini wajar |

axe (`color-contrast`, `target-size`) bersih di `/`, `/contoh`, `/lacak`, `/masuk`, `/peta`, `/rapor`, dan `/prioritas`. Tidak ada console error atau page error.

### Masih perlu ditindaklanjuti

- **B (Supabase):** pastikan Redirect URLs menerima `https://<domain>/auth/callback**` dan `http://localhost:3000/auth/callback**`. Kalau belum, tautan lupa password jatuh ke Site URL.
- **Keamanan akun demo (sudah ada sebelum audit ini, sudah dimitigasi):** siapa pun yang login sebagai warga demo bisa memanggil `supabase.auth.updateUser({ password })` langsung dari console browser memakai anon key. Pengaman di `gantiPassword` hanya menutup jalur lewat UI. Sekarang `/api/cron/reset-demo` mengembalikan email dan password kedua akun demo ke nilai env setiap malam (`pulihkanAkunDemo`), jadi akun paling lama terkunci sampai reset berikutnya. Panggilan `updateUserById` sudah diuji dengan nilai yang sama: berhasil, dan login kedua akun tetap jalan. Cron lengkapnya tidak dijalankan karena akan mereset data demo. Kalau akun terkunci di hari H, tim bisa memicu cron secara manual (`curl -H "Authorization: Bearer $CRON_SECRET" https://<domain>/api/cron/reset-demo`). Pengunjung juga masih bisa mengganti nama profil demo (policy `ubah profil sendiri`), dan nama itu belum ikut dipulihkan.
- **A:** uji B3 (kamera atau galeri) dan B4 (foto 10 MB) di Android dan iPhone sungguhan.
- **A3 dan C3** belum diuji di browser karena keduanya mengubah data demo. Uji keduanya sekali di data demo sebelum hari H; data kembali ke awal lewat reset malam.

## Cara mengulang

```bash
npm run build && npx next start -p 3100
# skrip Playwright audit ini ada di scratchpad sesi, bukan di repo; ulangi dengan skill webapp-testing:
#   alur publik (console, overflow, axe, link), alur login/daftar, alur warga demo, alur admin demo
curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:3100/peta?status=ditolak"   # 200, tapi isinya halaman error
```
