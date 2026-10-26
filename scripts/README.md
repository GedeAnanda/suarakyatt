# Skrip data (pemilik: C)

Acuan: SDD v1.0 bagian 10. Jalankan berurutan dari folder root repo.

| Urutan | Skrip | Fungsi | Keluaran |
| --- | --- | --- | --- |
| 0 | `00_potong_dki.py` | Potong batas kecamatan HDX nasional menjadi DKI | `data/raw/batas/idn_admin3_dki.geojson` |
| 1 | `01_wilayah.py` | Saring 42 kecamatan DKI daratan, sederhanakan bentuk | `public/data/kecamatan.geojson`, `data/processed/wilayah_detail.geojson`, `data/processed/regions.csv` |
| 2 | `02_bps.py` | Gabungkan penduduk, luas, kemiskinan via kode wilayah | Data wilayah siap muat |
| 3 | `03_cek_crm.py` | Cek kelayakan dataset CRM DKI (paling lambat 27 Okt) | Ringkasan untuk tim, `crm_agregat.csv` jika layak |
| 4 | `04_akun.py` | Buat akun admin, Perencana, demo, warga simulasi | Akun di Supabase Auth |
| 5 | `05_seed.py` | Generator laporan simulasi (deterministik) | `supabase/seed/seed.sql` |

## Persiapan

```bash
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r scripts/requirements.txt
```

Skrip membaca `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, dan `SUPABASE_SERVICE_ROLE_KEY` dari `.env.local`.

## Aturan

- Simpan salinan asli setiap dataset di `data/raw/` dan catat sumber serta lisensinya untuk halaman Sumber Data.
- Gabungkan data selalu dengan kode wilayah, bukan nama.
- Generator seed memakai `numpy.random.default_rng(2026)` agar hasilnya selalu sama.
