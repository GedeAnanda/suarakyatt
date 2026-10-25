# Aturan kerja tim suaRAkyat

Ringkasan dari SDD v1.0 bagian 3. Baca sekali, lalu ikuti setiap hari.

## Branch dan pull request

- `main` = produksi (https://suarakyatt.vercel.app, yang dilihat juri). `dev` = tempat semua fitur digabung dulu. Jangan push langsung ke `main` maupun `dev`.
- Satu fitur, satu branch, selalu dibuat dari `dev` terbaru: `feat/<peran>-<fitur>`, misalnya `feat/a-landing`, `feat/b-auth`, `feat/c-rapor`.
- Perbaikan: `fix/<topik>`.
- PR fitur selalu ke **`dev`**. `dev` di-merge ke `main` oleh ketua setelah dicek stabil (misalnya sebelum First Draft).
- Setiap PR dicek minimal **satu anggota lain** sebelum di-merge.

```bash
git checkout dev && git pull           # mulai dari dev terbaru
git checkout -b feat/a-rapor           # branch fitur
# ...ngoding, commit...
git push -u origin feat/a-rapor        # lalu buka PR ke dev di GitHub
git pull origin dev                    # jika branch sudah lama, ambil perubahan dev terbaru
```
- Vercel otomatis membuat link preview untuk setiap PR. Cek tampilannya di ponsel sebelum minta review.

## Commit

Format: `feat: ...`, `fix: ...`, `docs: ...`, `data: ...` + kalimat singkat bahasa Indonesia.
Contoh: `feat: form laporan dengan pin peta`.

## Kepemilikan folder

| Folder | Pemilik |
| --- | --- |
| `app/`, `components/` | A |
| `app/api/`, `lib/supabase/`, `lib/errors.ts`, migrasi `0001`–`0003` | B |
| `lib/scoring/`, `scripts/`, `data/`, `tests/`, migrasi `0004`–`0005` | C |
| `lib/types.ts` | Semua (kontrak) |

Boleh mengubah folder orang lain, tapi minta pemiliknya mereview PR-nya.

## Kontrak data

`lib/types.ts` dan bentuk keluaran RPC adalah kesepakatan bersama. Perubahan wajib diumumkan di grup dan disetujui pemilik kedua sisi sebelum di-merge.

## Migrasi database

- File baru selalu dengan nomor berikutnya (`0006_...sql`).
- File yang sudah diterapkan **tidak diedit**.
- Perubahan skema hanya masuk lewat PR yang di-merge B.

## Rahasia

- `.env.local` tidak pernah di-commit.
- `SUPABASE_SERVICE_ROLE_KEY` hanya dipakai di API route dan skrip, tidak pernah di komponen browser.

## Definisi "selesai"

Fitur dianggap selesai jika sudah di `main`, ter-deploy, dan sudah dicoba di ponsel. Setelah itu, ubah statusnya di tracker PRD bagian 5.

## Ritme harian

Setiap malam, masing-masing kirim tiga baris di grup: yang selesai hari ini, rencana besok, hambatan.
