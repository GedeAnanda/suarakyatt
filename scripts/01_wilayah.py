"""01_wilayah.py — siapkan 42 kecamatan DKI daratan dari batas HDX (pemilik: C).

Hanya mengolah file lokal, tidak menyentuh database.

Masukan : data/raw/batas/idn_admin3_dki.geojson (hasil 00_potong_dki.py)
Keluaran: public/data/kecamatan.geojson           geometri sederhana untuk peta web
          data/processed/wilayah_detail.geojson   geometri detail untuk dimuat ke tabel regions
          data/processed/regions.csv              kunci kode_wilayah, nama, kota, luas_peta_km2

Jalankan dari folder root repo:
    python scripts/01_wilayah.py
"""

import sys
from pathlib import Path

import geopandas as gpd
import shapely
from shapely.geometry import MultiPolygon

ROOT = Path(__file__).resolve().parents[1]
MASUKAN = ROOT / "data" / "raw" / "batas" / "idn_admin3_dki.geojson"
KELUARAN_PETA = ROOT / "public" / "data" / "kecamatan.geojson"
KELUARAN_DETAIL = ROOT / "data" / "processed" / "wilayah_detail.geojson"
KELUARAN_CSV = ROOT / "data" / "processed" / "regions.csv"

# Jumlah kecamatan per kota menurut BPS. Kepulauan Seribu (ID3101) di luar cakupan.
KOTA_DKI = {
    "ID3171": ("Jakarta Selatan", 10),
    "ID3172": ("Jakarta Timur", 10),
    "ID3173": ("Jakarta Pusat", 8),
    "ID3174": ("Jakarta Barat", 8),
    "ID3175": ("Jakarta Utara", 6),
}
# Baris di HDX yang berupa danau, bukan kecamatan.
BUKAN_KECAMATAN = {"ID3175555", "ID3175888"}
# Ejaan HDX -> ejaan tabel BPS "Dalam Angka 2026". Tambahkan jika ada nama lain yang berbeda.
EJAAN_BPS = {
    "Kali Deres": "Kalideres",
    "Setia Budi": "Setiabudi",
}

UTM_48S = 32748  # proyeksi meter untuk menghitung luas dan menyederhanakan garis
TOLERANSI_M = 15


def kode_wilayah(pcode: str) -> str:
    """ID3171010 -> 31.71.010"""
    angka = pcode.removeprefix("ID")
    return f"{angka[:2]}.{angka[2:4]}.{angka[4:]}"


def ke_multipolygon(g):
    poligon = []
    for p in shapely.get_parts(g):
        if p.geom_type == "Polygon":
            poligon.append(p)
        elif p.geom_type == "MultiPolygon":
            poligon.extend(p.geoms)
    return MultiPolygon(poligon)


def tulis_geojson(gdf: gpd.GeoDataFrame, tujuan: Path, desimal: int) -> None:
    tujuan.parent.mkdir(parents=True, exist_ok=True)
    tujuan.unlink(missing_ok=True)
    gdf.to_file(tujuan, driver="GeoJSON", COORDINATE_PRECISION=desimal)


def ukuran(path: Path) -> str:
    return f"{path.stat().st_size / 1_000_000:.2f} MB"


def main() -> None:
    if not MASUKAN.exists():
        sys.exit(f"File tidak ditemukan: {MASUKAN}. Jalankan dulu scripts/00_potong_dki.py")

    semua = gpd.read_file(MASUKAN)
    if semua.crs is None or semua.crs.to_epsg() != 4326:
        sys.exit(f"CRS masukan bukan EPSG:4326: {semua.crs}")

    # 1. Saring: buang Kepulauan Seribu dan danau.
    dibuang = semua[~semua["adm2_pcode"].isin(list(KOTA_DKI)) | semua["adm3_pcode"].isin(BUKAN_KECAMATAN)]
    wil = semua.drop(dibuang.index).copy()

    print("Baris yang dibuang:")
    for _, r in dibuang.iterrows():
        alasan = "danau" if r["adm3_pcode"] in BUKAN_KECAMATAN else "di luar cakupan"
        print(f"  - {r['adm3_pcode']} {r['adm3_name']} ({alasan})")

    galat = []
    for kode, (kota, harus) in KOTA_DKI.items():
        ada = int((wil["adm2_pcode"] == kode).sum())
        if ada != harus:
            galat.append(f"{kota}: {ada} kecamatan, seharusnya {harus}")
    if wil["adm3_pcode"].duplicated().any():
        galat.append(f"Kode ganda: {wil.loc[wil['adm3_pcode'].duplicated(), 'adm3_pcode'].tolist()}")
    if galat:
        sys.exit("Jumlah kecamatan tidak sesuai:\n  " + "\n  ".join(galat))

    # 2. Bentuk kolom.
    wil["kode_wilayah"] = wil["adm3_pcode"].map(kode_wilayah)
    wil["nama"] = wil["adm3_name"].replace(EJAAN_BPS)
    wil["kota"] = wil["adm2_pcode"].map(lambda k: KOTA_DKI[k][0])
    wil = wil[["kode_wilayah", "nama", "kota", "geometry"]].sort_values("kode_wilayah").reset_index(drop=True)

    # 3. Rapikan geometri.
    tidak_valid = int((~wil.is_valid).sum())
    wil["geometry"] = wil.make_valid().map(ke_multipolygon)

    # 4. Luas dari peta, hanya untuk dicek terhadap Tabel 1.1.1.
    wil_m = wil.to_crs(UTM_48S)
    wil["luas_peta_km2"] = (wil_m.area / 1_000_000).round(2)

    # 5. Versi sederhana untuk peta web.
    sederhana_m = wil_m[["kode_wilayah", "nama", "kota", "geometry"]].copy()
    sederhana_m["geometry"] = sederhana_m.simplify(TOLERANSI_M, preserve_topology=True)
    selisih_luas = ((sederhana_m.area - wil_m.area).abs() / wil_m.area * 100).max()
    sederhana = sederhana_m.to_crs(4326)
    sederhana["geometry"] = sederhana.make_valid().map(ke_multipolygon)

    tulis_geojson(wil[["kode_wilayah", "nama", "kota", "geometry"]], KELUARAN_DETAIL, desimal=6)
    tulis_geojson(sederhana, KELUARAN_PETA, desimal=5)
    KELUARAN_CSV.parent.mkdir(parents=True, exist_ok=True)
    wil.drop(columns="geometry").to_csv(KELUARAN_CSV, index=False)

    print(f"\nJumlah kecamatan: {len(wil)}")
    print(wil["kota"].value_counts().sort_index().to_string())
    print(f"\nGeometri tidak valid yang diperbaiki: {tidak_valid}")
    print(f"Selisih luas terbesar detail vs sederhana: {selisih_luas:.3f}%")

    print("\nUkuran file:")
    for p in (MASUKAN, KELUARAN_DETAIL, KELUARAN_PETA, KELUARAN_CSV):
        print(f"  {p.relative_to(ROOT)}: {ukuran(p)}")

    print("\nDaftar kecamatan (cocokkan nama dengan Tabel 1.1.1 tiap kota):")
    print(wil.drop(columns="geometry").to_string(index=False))


if __name__ == "__main__":
    main()
