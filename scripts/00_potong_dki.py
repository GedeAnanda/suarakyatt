"""00_potong_dki.py — potong file batas kecamatan HDX menjadi DKI Jakarta saja (pemilik: C).

File asli (~280 MB) tidak dibaca utuh ke memori: GDAL menyaring baris DKI saat membaca.
Kepulauan Seribu masih ikut; dibuang nanti di 01_wilayah.py.

Jalankan dari folder root repo:
    python scripts/00_potong_dki.py
    python scripts/00_potong_dki.py --masukan ../_data_besar/idn_admin3.geojson
"""

import argparse
import sys
from pathlib import Path

import geopandas as gpd
import pyogrio

ROOT = Path(__file__).resolve().parents[1]
MASUKAN_AWAL = ROOT.parent / "_data_besar" / "idn_admin3.geojson"
KELUARAN = ROOT / "data" / "raw" / "batas" / "idn_admin3_dki.geojson"

# Kode BPS provinsi DKI Jakarta = 31. Di HDX ditulis dengan awalan "ID", misalnya ID31, ID3171, ID3171010.
KODE_DKI = "ID31"
# Nama kolom HDX berbeda antarversi, jadi dicari tanpa membedakan huruf besar/kecil.
KOLOM_PROVINSI = ["adm1_pcode"]
KOLOM_KECAMATAN = ["adm3_pcode"]


def cari_kolom(kolom: list[str], calon: list[str]) -> str | None:
    kecil = {k.lower(): k for k in kolom}
    for c in calon:
        if c in kecil:
            return kecil[c]
    return None


def main() -> None:
    parser = argparse.ArgumentParser(description="Saring kecamatan DKI dari file batas HDX.")
    parser.add_argument("--masukan", type=Path, default=MASUKAN_AWAL)
    args = parser.parse_args()

    if not args.masukan.exists():
        sys.exit(f"File tidak ditemukan: {args.masukan}")

    # Hanya membaca skema (nama kolom), bukan isi file.
    info = pyogrio.read_info(args.masukan)
    kolom = list(info["fields"])

    kolom_prov = cari_kolom(kolom, KOLOM_PROVINSI)
    kolom_kec = cari_kolom(kolom, KOLOM_KECAMATAN)
    if kolom_prov:
        saring = f"{kolom_prov} = '{KODE_DKI}'"
    elif kolom_kec:
        saring = f"{kolom_kec} LIKE '{KODE_DKI}%'"
    else:
        sys.exit(f"Kolom kode wilayah tidak dikenali. Kolom yang ada: {kolom}")

    print(f"Membaca {args.masukan.name} dengan saringan: {saring}")
    dki = gpd.read_file(args.masukan, where=saring)
    if dki.empty:
        sys.exit("Tidak ada baris DKI. Cek format kode di kolom kode wilayah.")

    KELUARAN.parent.mkdir(parents=True, exist_ok=True)
    KELUARAN.unlink(missing_ok=True)
    dki.to_file(KELUARAN, driver="GeoJSON")

    print(f"\nTersimpan: {KELUARAN.relative_to(ROOT)}")
    print(f"CRS: {dki.crs}")
    print(f"\nNama kolom ({len(dki.columns)}):")
    for k in dki.columns:
        print(f"  - {k}")
    print(f"\nJumlah kecamatan DKI (termasuk Kepulauan Seribu): {len(dki)}")

    kolom_kota = cari_kolom(list(dki.columns), ["adm2_en", "adm2_name"])
    if kolom_kota:
        print("\nPer kota/kabupaten:")
        print(dki[kolom_kota].value_counts().sort_index().to_string())

    print("\n5 baris pertama (tanpa geometri):")
    print(dki.drop(columns="geometry").head(5).to_string())


if __name__ == "__main__":
    main()
