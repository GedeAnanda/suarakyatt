"""05b_foto.py — kumpulan foto seed berlisensi bebas dari Wikimedia Commons (pemilik: C).

Langkah 1 (tanpa flag): cari foto per kategori di Commons, unduh versi 1024 px ke
  _data_besar/foto_seed/ (di LUAR repo), tulis manifest + lisensi ke data/processed/foto_seed.csv.
  Tidak menyentuh Supabase. Periksa fotonya dengan mata sebelum langkah 2.
Langkah 2: unggah ke bucket foto-laporan/seed/ dengan service role (upsert, tanpa hapus).
    python scripts/05b_foto.py --unggah --dry-run   (hanya cek bucket + daftar yang akan diunggah)
    python scripts/05b_foto.py --unggah

Hanya lisensi CC0 / Public domain / CC BY / CC BY-SA yang diambil; penulis dan lisensi dicatat
untuk halaman Sumber Data. Foto di BLOKIR (judul Commons) dilewati.

Jalankan dari folder root repo:
    python scripts/05b_foto.py
"""

import argparse
import csv
import html
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parents[1]
FOLDER_FOTO = ROOT.parent / "_data_besar" / "foto_seed"
MANIFEST = ROOT / "data" / "processed" / "foto_seed.csv"
BUCKET = "foto-laporan"

API = "https://commons.wikimedia.org/w/api.php"
USER_AGENT = "suaRAkyat-seed/1.0 (proyek portofolio mahasiswa; skrip unduh sekali jalan)"
LEBAR = 1024

# (category_id, jenis) -> (jumlah, kueri dicoba berurutan sampai jumlah terpenuhi)
KUERI = {
    (1, "laporan"): (4, ["pothole road Indonesia", "jalan berlubang", "pothole asphalt road"]),
    (1, "bukti"):   (2, ["road asphalt paving Indonesia", "asphalt paving road work"]),
    (2, "laporan"): (4, ["selokan sampah", "clogged drain garbage Indonesia", "drainage ditch garbage",
                         "clogged drain", "polluted canal Jakarta", "selokan"]),
    (2, "bukti"):   (2, ["concrete drainage channel", "drainage channel", "saluran air"]),
    (3, "laporan"): (4, ["garbage pile street Jakarta", "sampah menumpuk", "garbage heap roadside Indonesia",
                         "garbage Jakarta", "sampah Jakarta", "rubbish street Indonesia", "garbage pile"]),
    (3, "bukti"):   (2, ["clean sidewalk", "clean street", "empty sidewalk Jakarta", "trotoar"]),
    (4, "laporan"): (4, ["street light pole Jakarta", "street lamp pole Indonesia", "street light pole",
                         "street lamp"]),
    (4, "bukti"):   (2, ["street lights night road", "street lamp night", "lampu jalan"]),
}
LISENSI_BOLEH = re.compile(r"^(CC0|Public domain|PD|CC BY(-SA)? \d)", re.I)
# Judul "File:..." yang ditolak setelah diperiksa manual (wajah jelas / bukan objeknya)
BLOKIR = {
    "File:Waste in rain gutter near school Bali.jpg",                                       # wajah
    "File:Market Men cleaning drainage in Agbara, Lagos Badagry Expressway.jpg",            # wajah
    "File:Jakarta slumlife34.JPG",                                                          # wajah
    "File:Jakarta slumlife54.JPG",                                                          # wajah
    "File:Covered sidewalk, New Orleans LOC agc.7a09777.jpg",                               # foto kuno
    "File:Kudat Sabah Garbage-Collection-Truck-01.jpg",                                     # wajah
    "File:Jean Béraud La Modiste Sur Les Champs Elysees.jpg",                               # lukisan
    "File:TransNusa Airbus A320 PK-TLD Jakarta 2025 (02).jpg",                              # pesawat
    "File:Light Lamp in Vivah Mandap, Janakpur-September 22, 2016-IMG 7395.jpg",            # bukan lampu jalan
    "File:Batavia. (1888) Calcutta. (1880) - Port de Batavia. (Tanjong Priok)-Calcutta. 4e Série. Pl. XXII. "
    "Ministère des Travaux Publics. (IA dr batavia-1888-calcutta-1880-port-de-batavia-tanjong-priok-calcutt-"
    "14306112).jpg",                                                                        # gambar lama
}

KOLOM = ["path_bucket", "category_id", "jenis", "judul_commons", "penulis", "lisensi", "url_lisensi", "url_sumber"]


def ambil_json(param: dict) -> dict:
    url = API + "?" + urllib.parse.urlencode({**param, "format": "json", "formatversion": 2})
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)


def bersihkan(teks: str) -> str:
    return html.unescape(re.sub(r"<[^>]+>", "", teks or "")).strip()


def cari(kueri: str) -> list[dict]:
    data = ambil_json(dict(
        action="query", generator="search", gsrsearch=f"{kueri} filetype:bitmap", gsrnamespace=6,
        gsrlimit=30, prop="imageinfo", iiprop="url|mime|extmetadata", iiurlwidth=LEBAR,
    ))
    hasil = []
    for hal in sorted(data.get("query", {}).get("pages", []), key=lambda h: h["index"]):
        info = (hal.get("imageinfo") or [{}])[0]
        meta = info.get("extmetadata", {})
        lisensi = bersihkan(meta.get("LicenseShortName", {}).get("value", ""))
        if info.get("mime") != "image/jpeg" or not LISENSI_BOLEH.match(lisensi) or hal["title"] in BLOKIR:
            continue
        hasil.append(dict(
            judul_commons=hal["title"], lisensi=lisensi,
            penulis=bersihkan(meta.get("Artist", {}).get("value", "")) or "tidak diketahui",
            url_lisensi=meta.get("LicenseUrl", {}).get("value", ""),
            url_sumber=info.get("descriptionurl", ""), url_unduh=info.get("thumburl") or info["url"],
        ))
    return hasil


def unduh_semua() -> None:
    lama = set()
    if MANIFEST.exists():
        with MANIFEST.open(encoding="utf-8") as f:
            lama = {b["judul_commons"] for b in csv.DictReader(f)}
    FOLDER_FOTO.mkdir(parents=True, exist_ok=True)
    for p in FOLDER_FOTO.glob("k[1-4]_*.jpg"):  # hanya foto buatan skrip ini; diunduh ulang di bawah
        p.unlink()
    baris, terpakai, kurang = [], set(), []
    for (kat, jenis), (jumlah, daftar_kueri) in KUERI.items():
        dapat = []
        for kueri in daftar_kueri:
            for f in cari(kueri):
                if len(dapat) == jumlah:
                    break
                if f["judul_commons"] not in terpakai:
                    terpakai.add(f["judul_commons"])
                    dapat.append(f)
            if len(dapat) == jumlah:
                break
            time.sleep(1)
        print(f"  kategori {kat} {jenis}: {len(dapat)}/{jumlah} foto, mengunduh...", flush=True)
        if len(dapat) < jumlah:
            kurang.append(f"kategori {kat} {jenis}: dapat {len(dapat)}/{jumlah}")
        for i, f in enumerate(dapat, 1):
            nama = f"k{kat}_{jenis}_{i:02d}.jpg"
            req = urllib.request.Request(f["url_unduh"], headers={"User-Agent": USER_AGENT})
            with urllib.request.urlopen(req, timeout=60) as r:
                (FOLDER_FOTO / nama).write_bytes(r.read())
            time.sleep(1)
            baris.append(dict(path_bucket=f"seed/{nama}", category_id=kat, jenis=jenis,
                              **{k: f[k] for k in KOLOM[3:]}))

    MANIFEST.parent.mkdir(parents=True, exist_ok=True)
    with MANIFEST.open("w", newline="", encoding="utf-8") as f:
        tulis = csv.DictWriter(f, fieldnames=KOLOM)
        tulis.writeheader()
        tulis.writerows(baris)

    ukuran = sum(p.stat().st_size for p in FOLDER_FOTO.glob("*.jpg")) / 1e6
    print(f"Diunduh {len(baris)} foto ({ukuran:.1f} MB) ke {FOLDER_FOTO}")
    print(f"Manifest + lisensi: {MANIFEST.relative_to(ROOT)}")
    lisensi = {}
    for b in baris:
        lisensi[b["lisensi"]] = lisensi.get(b["lisensi"], 0) + 1
    print("Lisensi: " + ", ".join(f"{k} {n}" for k, n in sorted(lisensi.items())))
    print("KURANG: " + "; ".join(kurang) if kurang else "Semua slot terisi.")
    baru = [Path(b["path_bucket"]).stem for b in baris if b["judul_commons"] not in lama]
    print("Foto BARU, perlu dicek: " + (", ".join(baru) if baru else "tidak ada"))


def unggah(dry_run: bool) -> None:
    from supabase import create_client

    if not MANIFEST.exists():
        sys.exit("Manifest belum ada. Jalankan dulu: python scripts/05b_foto.py")
    with MANIFEST.open(encoding="utf-8") as f:
        baris = list(csv.DictReader(f))
    hilang = [b["path_bucket"] for b in baris if not (FOLDER_FOTO / Path(b["path_bucket"]).name).exists()]
    if hilang:
        sys.exit(f"File foto tidak ada di {FOLDER_FOTO}: {', '.join(hilang[:5])}")

    load_dotenv(ROOT / ".env.local")
    url_api, kunci = os.environ.get("NEXT_PUBLIC_SUPABASE_URL"), os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not url_api or not kunci:
        sys.exit("Kosong di .env.local: NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY")
    storage = create_client(url_api, kunci).storage.from_(BUCKET)

    sudah = {o["name"] for o in storage.list("seed", {"limit": 1000})}
    baru = [b for b in baris if Path(b["path_bucket"]).name not in sudah]
    print(f"Bucket {BUCKET}/seed: sudah ada {len(sudah)} file; dari manifest {len(baris)}, baru {len(baru)}")
    if dry_run:
        print("DRY-RUN: tidak ada yang diunggah.")
        return
    if input(f"Akan mengunggah {len(baris)} foto ke bucket bersama (timpa yang namanya sama). "
             "Ketik UNGGAH untuk lanjut: ").strip() != "UNGGAH":
        sys.exit("Dibatalkan, tidak ada yang diunggah.")

    gagal = []
    for b in baris:
        isi = (FOLDER_FOTO / Path(b["path_bucket"]).name).read_bytes()
        try:
            storage.upload(b["path_bucket"], isi, {"content-type": "image/jpeg", "upsert": "true"})
        except Exception as e:  # lanjut, laporkan di akhir
            gagal.append(f"{b['path_bucket']}: {type(e).__name__}: {e}")
    print(f"Terunggah {len(baris) - len(gagal)}/{len(baris)}")
    for g in gagal[:5]:
        print(f"  GAGAL {g}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--unggah", action="store_true", help="unggah foto di manifest ke bucket")
    parser.add_argument("--dry-run", action="store_true", help="dengan --unggah: hanya cek, tidak mengunggah")
    args = parser.parse_args()
    if args.unggah:
        unggah(args.dry_run)
    else:
        unduh_semua()


if __name__ == "__main__":
    main()
