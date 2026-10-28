"""02_bps.py — gabungkan angka BPS dengan 42 kecamatan (pemilik: C).

Hanya mengolah file lokal, tidak menyentuh database.

Masukan : data/raw/bps/bps_kecamatan_2026.csv     penduduk (Tabel 3.1.1) dan luas (Tabel 1.1.1) per kecamatan
          data/raw/bps/kemiskinan_kota_2025.csv   persen penduduk miskin per kota (Tabel 13.10)
          data/processed/wilayah_detail.geojson   hasil 01_wilayah.py
Keluaran: data/processed/regions_siap_muat.csv    siap dimuat oleh 03_muat_regions.py

Angka boleh ditulis gaya Indonesia: penduduk "315.289" atau "315289", luas "25,10" atau "25.10".

Jalankan dari folder root repo:
    python scripts/02_bps.py
"""

import sys
from pathlib import Path

import geopandas as gpd
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
MASUKAN_BPS = ROOT / "data" / "raw" / "bps" / "bps_kecamatan_2026.csv"
MASUKAN_MISKIN = ROOT / "data" / "raw" / "bps" / "kemiskinan_kota_2025.csv"
MASUKAN_GEO = ROOT / "data" / "processed" / "wilayah_detail.geojson"
KELUARAN = ROOT / "data" / "processed" / "regions_siap_muat.csv"

JUMLAH_KECAMATAN = 42
BATAS_SELISIH_LUAS = 0.10  # peringatan jika luas BPS vs luas peta beda lebih dari 10%
UTM_48S = 32748

SUMBER = (
    "Batas: HDX COD-AB (BPS) 2020; "
    "Penduduk: Dukcapil via BPS Kota {kota} Dalam Angka 2026; "
    "Luas: BPS 2026; "
    "Miskin: BPS DKI Maret 2025 (level kota)"
)


def angka_bulat(teks: str) -> float:
    """'315.289' / '315,289' / '315289' -> 315289. Kosong -> NaN."""
    teks = str(teks).strip().replace(".", "").replace(",", "").replace(" ", "")
    return float(teks) if teks not in ("", "nan") else float("nan")


def angka_desimal(teks: str) -> float:
    """'25,10' / '25.10' -> 25.1. Kosong -> NaN."""
    teks = str(teks).strip().replace(",", ".").replace(" ", "")
    return float(teks) if teks not in ("", "nan") else float("nan")


def main() -> None:
    for p in (MASUKAN_BPS, MASUKAN_MISKIN, MASUKAN_GEO):
        if not p.exists():
            sys.exit(f"File tidak ditemukan: {p.relative_to(ROOT)}")

    bps = pd.read_csv(MASUKAN_BPS, dtype=str, keep_default_na=False)
    miskin = pd.read_csv(MASUKAN_MISKIN, dtype=str, keep_default_na=False)
    geo = gpd.read_file(MASUKAN_GEO)

    bps["penduduk"] = bps["penduduk"].map(angka_bulat)
    bps["luas_km2"] = bps["luas_km2"].map(angka_desimal)
    miskin["persen_miskin"] = miskin["persen_miskin"].map(angka_desimal)
    geo["luas_peta_km2"] = geo.to_crs(UTM_48S).area / 1_000_000

    galat = []

    # 1. Kunci kode_wilayah harus sama persis di kedua sisi.
    kode_bps, kode_geo = set(bps["kode_wilayah"]), set(geo["kode_wilayah"])
    if bps["kode_wilayah"].duplicated().any():
        galat.append(f"Kode ganda di CSV BPS: {bps.loc[bps['kode_wilayah'].duplicated(), 'kode_wilayah'].tolist()}")
    if kode_bps - kode_geo:
        galat.append(f"Ada di CSV BPS, tidak ada di peta: {sorted(kode_bps - kode_geo)}")
    if kode_geo - kode_bps:
        galat.append(f"Ada di peta, tidak ada di CSV BPS: {sorted(kode_geo - kode_bps)}")

    # 2. Gabung. Nama & kota diambil dari peta agar identik dengan kecamatan.geojson.
    gab = geo[["kode_wilayah", "nama", "kota", "luas_peta_km2"]].merge(
        bps[["kode_wilayah", "nama", "penduduk", "luas_km2"]].rename(columns={"nama": "nama_bps"}),
        on="kode_wilayah",
        how="inner",
    )
    gab = gab.merge(miskin[["kota", "persen_miskin"]], on="kota", how="left")

    if len(gab) != JUMLAH_KECAMATAN:
        galat.append(f"Jumlah baris {len(gab)}, seharusnya {JUMLAH_KECAMATAN}")

    for kolom in ("penduduk", "luas_km2", "persen_miskin"):
        kosong = gab.loc[gab[kolom].isna(), "nama"].tolist()
        if kosong:
            galat.append(f"{kolom} kosong/tidak terbaca ({len(kosong)}): {', '.join(kosong)}")
    for kolom in ("penduduk", "luas_km2"):
        nol = gab.loc[gab[kolom] <= 0, "nama"].tolist()
        if nol:
            galat.append(f"{kolom} <= 0: {', '.join(nol)}")

    if galat:
        sys.exit("BERHENTI, perbaiki dulu:\n  - " + "\n  - ".join(galat))

    # 3. Peringatan (tidak menghentikan).
    peringatan = []
    for _, r in gab[gab["nama"] != gab["nama_bps"]].iterrows():
        peringatan.append(f"Nama beda: peta '{r['nama']}' vs CSV '{r['nama_bps']}' ({r['kode_wilayah']})")
    gab["selisih_luas"] = (gab["luas_km2"] - gab["luas_peta_km2"]).abs() / gab["luas_km2"]
    for _, r in gab[gab["selisih_luas"] > BATAS_SELISIH_LUAS].iterrows():
        peringatan.append(
            f"Luas beda {r['selisih_luas']:.0%}: {r['nama']} BPS {r['luas_km2']:.2f} vs peta {r['luas_peta_km2']:.2f} km2"
        )

    # 4. Tulis.
    gab["penduduk"] = gab["penduduk"].astype(int)
    gab["luas_km2"] = gab["luas_km2"].round(2)
    gab["persen_miskin"] = gab["persen_miskin"].round(2)
    gab["sumber"] = gab["kota"].map(lambda k: SUMBER.format(kota=k))
    hasil = gab[["kode_wilayah", "nama", "kota", "penduduk", "luas_km2", "persen_miskin", "sumber"]]
    hasil = hasil.sort_values("kode_wilayah")
    hasil.to_csv(KELUARAN, index=False)

    kepadatan = gab["penduduk"] / gab["luas_km2"]
    print(f"OK: {len(hasil)} kecamatan -> {KELUARAN.relative_to(ROOT)}")
    print(f"Total penduduk: {gab['penduduk'].sum():,}".replace(",", "."))
    print(f"Total luas    : {gab['luas_km2'].sum():.2f} km2")
    print(
        f"Kepadatan     : {kepadatan.min():,.0f} ({gab.loc[kepadatan.idxmin(), 'nama']}) s.d. "
        f"{kepadatan.max():,.0f} ({gab.loc[kepadatan.idxmax(), 'nama']}) jiwa/km2".replace(",", ".")
    )
    print(f"\nPeringatan: {len(peringatan)}")
    for p in peringatan:
        print(f"  - {p}")


if __name__ == "__main__":
    main()
