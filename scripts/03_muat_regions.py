"""03_muat_regions.py — muat 42 kecamatan ke tabel regions (pemilik: C).

MENULIS KE DATABASE BERSAMA. Selalu jalankan --dry-run dulu.

Masukan : data/processed/regions_siap_muat.csv    hasil 02_bps.py
          data/processed/wilayah_detail.geojson   geometri detail dari 01_wilayah.py
Keluaran: tabel regions (upsert per kode_wilayah; id lama tidak berubah, tidak ada DELETE)

--dry-run menjalankan upsert + uji titik di dalam transaksi lalu ROLLBACK,
jadi constraint database ikut teruji tanpa ada yang tersimpan.

Jalankan dari folder root repo:
    python scripts/03_muat_regions.py --dry-run
    python scripts/03_muat_regions.py
"""

import argparse
import json
import os
import sys
from pathlib import Path

import geopandas as gpd
import pandas as pd
import psycopg
from dotenv import load_dotenv
from shapely.geometry import mapping

ROOT = Path(__file__).resolve().parents[1]
MASUKAN_CSV = ROOT / "data" / "processed" / "regions_siap_muat.csv"
MASUKAN_GEO = ROOT / "data" / "processed" / "wilayah_detail.geojson"

JUMLAH_KECAMATAN = 42

UPSERT = """
insert into regions (kode_wilayah, nama, kota, geom, penduduk, luas_km2, persen_miskin, sumber)
values (%s, %s, %s, ST_Multi(ST_SetSRID(ST_GeomFromGeoJSON(%s), 4326)), %s, %s, %s, %s)
on conflict (kode_wilayah) do update set
  nama = excluded.nama,
  kota = excluded.kota,
  geom = excluded.geom,
  penduduk = excluded.penduduk,
  luas_km2 = excluded.luas_km2,
  persen_miskin = excluded.persen_miskin,
  sumber = excluded.sumber
returning (xmax = 0) as baru
"""

# (label, lat, lon, nama yang diharapkan; None = harus di luar semua kecamatan)
UJI_TITIK = [
    ("Monas", -6.1754, 106.8272, "Gambir"),
    ("Laut Jawa", -6.05, 106.85, None),
]
CARI_TITIK = "select nama from regions where ST_Contains(geom, ST_SetSRID(ST_MakePoint(%s, %s), 4326))"


def siapkan_data() -> pd.DataFrame:
    for p in (MASUKAN_CSV, MASUKAN_GEO):
        if not p.exists():
            sys.exit(f"File tidak ditemukan: {p.relative_to(ROOT)}")

    tabel = pd.read_csv(MASUKAN_CSV, dtype={"kode_wilayah": str})
    geo = gpd.read_file(MASUKAN_GEO).to_crs(4326)

    # Gabung dari sisi geo agar hasilnya tetap GeoDataFrame.
    gab = geo[["kode_wilayah", "geometry"]].merge(tabel, on="kode_wilayah", how="inner")
    galat = []
    if len(tabel) != JUMLAH_KECAMATAN or len(gab) != JUMLAH_KECAMATAN:
        galat.append(f"CSV {len(tabel)} baris, cocok dengan peta {len(gab)}; seharusnya {JUMLAH_KECAMATAN}")
    tidak_valid = gab.loc[~gab.geometry.is_valid, "nama"].tolist()
    if tidak_valid:
        galat.append(f"Geometri tidak valid: {', '.join(tidak_valid)}")
    if galat:
        sys.exit("BERHENTI, perbaiki dulu:\n  - " + "\n  - ".join(galat))
    return gab


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true", help="uji di dalam transaksi lalu ROLLBACK")
    args = parser.parse_args()

    gab = siapkan_data()

    load_dotenv(ROOT / ".env.local")
    url = os.environ.get("DATABASE_URL")
    if not url:
        sys.exit("DATABASE_URL tidak ada di .env.local")

    if not args.dry_run:
        jawab = input(f"Akan menulis {len(gab)} baris ke tabel regions (database bersama). Ketik MUAT untuk lanjut: ")
        if jawab.strip() != "MUAT":
            sys.exit("Dibatalkan, tidak ada yang ditulis.")

    # prepare_threshold=None agar aman di pooler Supabase (mode transaction).
    with psycopg.connect(url, prepare_threshold=None) as conn:
        with conn.cursor() as cur:
            cur.execute("select count(*) from regions")
            sebelum = cur.fetchone()[0]

            baru = 0
            for _, r in gab.iterrows():
                cur.execute(
                    UPSERT,
                    (
                        r["kode_wilayah"],
                        r["nama"],
                        r["kota"],
                        json.dumps(mapping(r["geometry"])),
                        int(r["penduduk"]),
                        float(r["luas_km2"]),
                        float(r["persen_miskin"]),
                        r["sumber"],
                    ),
                )
                baru += cur.fetchone()[0]

            cur.execute("select count(*) from regions")
            sesudah = cur.fetchone()[0]
            cur.execute("select kode_wilayah from regions where not (kode_wilayah = any(%s))", (list(gab["kode_wilayah"]),))
            lain = [k for (k,) in cur.fetchall()]

            hasil_uji = []
            for label, lat, lon, harap in UJI_TITIK:
                cur.execute(CARI_TITIK, (lon, lat))
                dapat = [n for (n,) in cur.fetchall()]
                lulus = dapat == ([harap] if harap else [])
                hasil_uji.append(f"{'LULUS' if lulus else 'GAGAL'}: {label} -> {dapat or 'tidak ada'} (harap {harap or 'tidak ada'})")

        if args.dry_run:
            conn.rollback()
        else:
            conn.commit()

    print(f"{'DRY-RUN (di-ROLLBACK, tidak tersimpan)' if args.dry_run else 'TERSIMPAN'}")
    print(f"regions sebelum: {sebelum} baris, sesudah: {sesudah} baris")
    print(f"Baris baru: {baru}, diperbarui: {len(gab) - baru}")
    if lain:
        print(f"Peringatan: {len(lain)} baris regions di luar 42 kecamatan (dibiarkan): {', '.join(lain[:10])}")
    for h in hasil_uji:
        print(h)


if __name__ == "__main__":
    main()
