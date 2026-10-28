"""05_seed.py — generator laporan simulasi yang deterministik (pemilik: C).

TAHAP 1: simulasi laporan + timeline + rating, lalu hitung rapor per instansi.
TAHAP 2: upvote, kasus khusus video, deskripsi + catatan tolak, kode SR-.
TAHAP 3: foto (dari manifest 05b_foto.py), waktu upvote/rating, tulis supabase/seed/seed.sql.
Tidak menyentuh database: user & wilayah dirujuk lewat email / kode_wilayah di dalam SQL.
Acakan tiap tahap dijalankan SETELAH tahap sebelumnya, jadi hasil tahap 1-2 tidak berubah.
seed.sql dimuat dengan scripts/05c_muat_seed.py (bukan SQL editor).

Semua waktu dalam JAM relatif terhadap seed_anchor (0 = anchor, negatif = sebelum anchor).
Rapor dihitung pada titik anchor dengan rumus yang sama dengan lib/scoring/rapor.ts.

Masukan : data/processed/regions_siap_muat.csv, data/processed/wilayah_detail.geojson,
          data/processed/foto_seed.csv, NEXT_PUBLIC_SUPABASE_URL di .env.local (URL publik foto)
Keluaran: supabase/seed/seed.sql

Jalankan dari folder root repo:
    python scripts/05_seed.py
"""

import os
import sys
import uuid
from pathlib import Path

import geopandas as gpd
import numpy as np
import pandas as pd
from dotenv import load_dotenv
from shapely.geometry import Point
from shapely.prepared import prep

ROOT = Path(__file__).resolve().parents[1]
MASUKAN_CSV = ROOT / "data" / "processed" / "regions_siap_muat.csv"
MASUKAN_GEO = ROOT / "data" / "processed" / "wilayah_detail.geojson"
MANIFEST_FOTO = ROOT / "data" / "processed" / "foto_seed.csv"
KELUARAN_SQL = ROOT / "supabase" / "seed" / "seed.sql"

rng = np.random.default_rng(2026)

JUMLAH_LAPORAN = 900
RENTANG_HARI = 180
PORSI_60_HARI = 0.5  # separuh laporan jatuh di 60 hari terakhir
PELUANG_BATAL = 0.02
JUMLAH_WARGA = 40

# category_id -> (instansi_id, porsi, sla_respons_jam, sla_selesai_jam)  — sama dengan 0006
KATEGORI = {
    1: (1, 0.35, 24, 120),  # Jalan rusak / Bina Jalan
    2: (2, 0.20, 24, 96),   # Saluran tersumbat / Tata Air
    3: (3, 0.30, 24, 72),   # Sampah menumpuk / Kebersihan
    4: (4, 0.15, 48, 168),  # Lampu jalan mati / Penerangan
}
NAMA_INSTANSI = {1: "Bina Jalan", 2: "Tata Air", 3: "Kebersihan", 4: "Penerangan"}

# Profil instansi (disetel agar target huruf tercapai):
#   tolak   : peluang laporan ditolak
#   respons : peluang respons tepat waktu                      (~ R)
#   tuntas  : peluang laporan akhirnya selesai; sisanya macet   (~ P)
#   tepat   : peluang selesai tepat waktu di antara yang tuntas (S ~ tuntas x tepat)
#   bintang : rata-rata rating
PROFIL = {
    1: dict(tolak=0.05, respons=0.95, tuntas=0.93, tepat=0.96, bintang=4.2),  # target A
    2: dict(tolak=0.06, respons=0.50, tuntas=0.40, tepat=0.78, bintang=2.8),  # target D
    3: dict(tolak=0.08, respons=0.84, tuntas=0.62, tepat=0.97, bintang=4.0),  # target B ~73,5
    4: dict(tolak=0.36, respons=0.95, tuntas=0.90, tepat=0.95, bintang=4.5),  # angka A, huruf C
}
TARGET_HURUF = {1: "A", 2: "D", 3: "B", 4: "C"}
ALASAN_TOLAK = (["tidak_valid", "duplikat", "konten_melanggar"], [0.7, 0.2, 0.1])
PELUANG_RATING = 0.6

# Tahap 2
WARGA_DEMO = 0           # pelapor 0 = akun warga.demo@ (sudah ada), 1..40 = warga simulasi
LAMBDA_UPVOTE = 1.5      # rata-rata upvote laporan biasa (Poisson)
PELUANG_VIRAL = 0.05     # sebagian kecil laporan ramai: 11-30 upvote (melewati batas 10)
MAKS_UPVOTE = 30
RADIUS_SERUPA_M = 100
ALFABET_KODE = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"  # 32 karakter, tanpa O 0 I 1
URGENSI = {1: 1.0, 2: 1.0, 3: 0.6, 4: 0.6}
AKTIF = ("menunggu", "diverifikasi", "diproses")
TERVERIFIKASI = ("diverifikasi", "diproses")

# Tahap 3
DOMAIN = "suarakyat.test"
EMAIL_ADMIN = {1: f"admin.binajalan@{DOMAIN}", 2: f"admin.tataair@{DOMAIN}",
               3: f"admin.kebersihan@{DOMAIN}", 4: f"admin.penerangan@{DOMAIN}"}
JUMLAH_FOTO = ([1, 2, 3], [0.65, 0.25, 0.10])
NS_UUID = uuid.UUID("5ea5a7a1-2026-4c00-8000-000000000005")  # id laporan = uuid5(NS, kode) -> stabil
URL_PUBLIK_FOTO = "{dasar}/storage/v1/object/public/foto-laporan/{path}"


# ---------- wilayah ----------

def muat_wilayah() -> pd.DataFrame:
    tabel = pd.read_csv(MASUKAN_CSV, dtype={"kode_wilayah": str})
    geo = gpd.read_file(MASUKAN_GEO).to_crs(4326)
    gab = geo[["kode_wilayah", "geometry"]].merge(tabel, on="kode_wilayah", how="inner")
    gab["bobot"] = gab["penduduk"] / gab["penduduk"].sum()
    gab["siap"] = gab.geometry.map(prep)
    return gab


def titik_acak(baris) -> tuple[float, float]:
    """Rejection sampling: ambil titik acak di kotak batas sampai jatuh di dalam poligon."""
    minx, miny, maxx, maxy = baris.geometry.bounds
    while True:
        lon, lat = rng.uniform(minx, maxx), rng.uniform(miny, maxy)
        if baris.siap.contains(Point(lon, lat)):
            return round(lon, 6), round(lat, 6)


# ---------- simulasi ----------

def waktu_dibuat() -> float:
    hari = rng.uniform(0, 60) if rng.random() < PORSI_60_HARI else rng.uniform(60, RENTANG_HARI)
    return -hari * 24


def simulasi_laporan(wilayah: pd.DataFrame) -> list[dict]:
    kategori_ids = list(KATEGORI)
    porsi = [KATEGORI[k][1] for k in kategori_ids]
    laporan = []

    for i in range(JUMLAH_LAPORAN):
        kat = int(rng.choice(kategori_ids, p=porsi))
        instansi, _, sla_r, sla_s = KATEGORI[kat]
        prof = PROFIL[instansi]
        w = wilayah.iloc[rng.choice(len(wilayah), p=wilayah["bobot"].to_numpy())]
        lon, lat = titik_acak(w)
        t0 = waktu_dibuat()

        lap = dict(
            no=i, category_id=kat, instansi=instansi, kode_wilayah=w["kode_wilayah"],
            lon=lon, lat=lat, pelapor=int(rng.integers(1, JUMLAH_WARGA + 1)),
            created=t0, responded=None, resolved=None, alasan=None, duplikat_dari=None,
            sla_r=sla_r, sla_s=sla_s, rating=None,
        )
        # Timeline rencana: (jam, status_baru, oleh_admin). Disaring ke <= anchor di akhir.
        rencana = [(t0, "menunggu", False)]

        if rng.random() < PELUANG_BATAL:
            rencana.append((t0 + rng.uniform(1, 12), "dibatalkan", False))
        else:
            tepat_respons = rng.random() < prof["respons"]
            t_resp = sla_r * (rng.uniform(0.15, 0.95) if tepat_respons else rng.uniform(1.1, 3.0))
            if rng.random() < prof["tolak"]:
                lap["alasan"] = str(rng.choice(ALASAN_TOLAK[0], p=ALASAN_TOLAK[1]))
                rencana.append((t0 + t_resp, "ditolak", True))
            else:
                rencana.append((t0 + t_resp, "diverifikasi", True))
                if rng.random() < prof["tuntas"]:
                    if rng.random() < prof["tepat"]:
                        t_sel = sla_s * rng.uniform(0.4, 0.95)
                    else:
                        t_sel = sla_s * rng.uniform(1.1, 2.5)
                    t_sel = max(t_sel, t_resp + rng.uniform(2, 12))
                    t_proses = t_resp + (t_sel - t_resp) * rng.uniform(0.2, 0.6)
                    rencana += [(t0 + t_proses, "diproses", True), (t0 + t_sel, "selesai", True)]
                elif rng.random() < 0.5:  # macet: sebagian sudah diproses, sebagian berhenti di diverifikasi
                    rencana.append((t0 + t_resp + sla_s * rng.uniform(0.2, 0.8), "diproses", True))

        lap["timeline"] = [e for e in rencana if e[0] <= 0]
        lap["status"] = lap["timeline"][-1][1]
        if len(lap["timeline"]) > 1 and lap["timeline"][1][1] != "dibatalkan":
            lap["responded"] = lap["timeline"][1][0]
        if lap["status"] == "selesai":
            lap["resolved"] = lap["timeline"][-1][0]
        if lap["status"] != "ditolak":
            lap["alasan"] = None
        laporan.append(lap)

    tautkan_duplikat(laporan)
    beri_rating(laporan)
    return laporan


def tautkan_duplikat(laporan: list[dict]) -> None:
    """Laporan ditolak-duplikat menunjuk laporan lebih awal di kategori sama; kalau tidak ada -> tidak_valid."""
    for lap in laporan:
        if lap["alasan"] != "duplikat":
            continue
        calon = [l["no"] for l in laporan
                 if l["category_id"] == lap["category_id"] and l["created"] < lap["created"] and l["alasan"] is None]
        if calon:
            lap["duplikat_dari"] = int(rng.choice(calon))
        else:
            lap["alasan"] = "tidak_valid"


def beri_rating(laporan: list[dict]) -> None:
    """~60% laporan selesai dapat rating; tepat waktu -> lebih tinggi, rata-rata per instansi tetap."""
    selisih = 1.2
    for lap in laporan:
        if lap["status"] != "selesai" or rng.random() >= PELUANG_RATING:
            continue
        prof = PROFIL[lap["instansi"]]
        tepat = lap["resolved"] - lap["created"] <= lap["sla_s"]
        rata = prof["bintang"] + (selisih * (1 - prof["tepat"]) if tepat else -selisih * prof["tepat"])
        lap["rating"] = int(np.clip(round(rng.normal(rata, 0.8)), 1, 5))


# ---------- tahap 2: upvote ----------

def beri_upvote(laporan: list[dict]) -> None:
    """Pemberi upvote = warga simulasi selain pelapor, tanpa dobel (pk report_id, user_id)."""
    for lap in laporan:
        lap["upvote"] = []
        if lap["status"] == "dibatalkan":
            continue
        if rng.random() < PELUANG_VIRAL:
            n = int(rng.integers(11, MAKS_UPVOTE + 1))
        else:
            n = min(int(rng.poisson(LAMBDA_UPVOTE)), MAKS_UPVOTE)
        calon = [w for w in range(1, JUMLAH_WARGA + 1) if w != lap["pelapor"]]
        lap["upvote"] = sorted(int(w) for w in rng.choice(calon, size=n, replace=False))


# ---------- tahap 2: kasus khusus video ----------

def jarak_m(a: dict, b: dict) -> float:
    lat1, lat2 = np.radians(a["lat"]), np.radians(b["lat"])
    dlat, dlon = lat2 - lat1, np.radians(b["lon"] - a["lon"])
    h = np.sin(dlat / 2) ** 2 + np.cos(lat1) * np.cos(lat2) * np.sin(dlon / 2) ** 2
    return float(2 * 6_371_000 * np.arcsin(np.sqrt(h)))


def geser_titik(pusat: dict, poligon, meter: float) -> tuple[float, float]:
    """Titik acak berjarak `meter` dari pusat, tetap di dalam poligon kecamatan pusat."""
    while True:
        sudut = rng.uniform(0, 2 * np.pi)
        lat = pusat["lat"] + meter * np.sin(sudut) / 111_320
        lon = pusat["lon"] + meter * np.cos(sudut) / (111_320 * np.cos(np.radians(pusat["lat"])))
        if poligon.contains(Point(lon, lat)):
            return round(float(lon), 6), round(float(lat), 6)


def skor_isu(laporan: list[dict], wilayah: pd.DataFrame) -> list[tuple]:
    """PERKIRAAN peringkat prioritas (rumus final ada di lib/scoring, belum dibuat):
    faktor 0005 dinormalisasi min-maks lalu dijumlah dengan bobot sama. Urut tertinggi dulu."""
    info = wilayah.set_index("kode_wilayah")
    isu = {}
    for l in laporan:
        if l["status"] in AKTIF:
            isu.setdefault((l["kode_wilayah"], l["category_id"]), []).append(l)
    baris = []
    for (kode, kat), daftar in isu.items():
        w = info.loc[kode]
        ver = [l for l in daftar if l["status"] in TERVERIFIKASI]
        baris.append(dict(
            isu=(kode, kat), urgensi=URGENSI[kat],
            volume=len(ver) / w["penduduk"] * 1e4,
            dukungan=sum(min(len(l["upvote"]), 10) for l in ver) / w["penduduk"] * 1e4,
            umur=float(np.mean([min(-l["created"] / l["sla_s"], 2) for l in daftar])),
            kerentanan=w["persen_miskin"], kepadatan=w["penduduk"] / w["luas_km2"],
        ))
    tabel = pd.DataFrame(baris).set_index("isu")
    norm = (tabel - tabel.min()) / (tabel.max() - tabel.min()).replace(0, 1)
    return list(norm.sum(axis=1).sort_values(ascending=False).index)


def kasus_khusus(laporan: list[dict], wilayah: pd.DataFrame) -> None:
    """(a) 3 jalan rusak aktif dalam radius 100 m, (b) 1 laporan aktif warga demo di isu
    peringkat menengah, (c) 1 laporan Bina Jalan berstatus diproses. Hanya mengubah lokasi,
    kecamatan, dan pelapor laporan yang sudah ada -> rapor tidak berubah."""
    for l in laporan:
        l["khusus"] = None
    poligon = dict(zip(wilayah["kode_wilayah"], wilayah["siap"]))

    # (c) laporan Bina Jalan 'diproses' terbaru
    diproses = [l for l in laporan if l["category_id"] == 1 and l["status"] == "diproses"]
    max(diproses, key=lambda l: l["created"])["khusus"] = "c"

    # (a) satu pusat + dua laporan lain dipindah 30-80 m dari pusat
    jalan_aktif = [l for l in laporan if l["category_id"] == 1 and l["status"] in AKTIF and not l["khusus"]]
    pilih = rng.choice(len(jalan_aktif), size=3, replace=False)
    pusat, *pindah = [jalan_aktif[i] for i in pilih]
    pusat["khusus"] = "a"
    for l in pindah:
        l["lon"], l["lat"] = geser_titik(pusat, poligon[pusat["kode_wilayah"]], rng.uniform(30, 80))
        l["kode_wilayah"] = pusat["kode_wilayah"]
        l["khusus"] = "a"

    # (b) isu di tengah peringkat; pilih laporan menunggu/diverifikasi di isu itu
    urutan = skor_isu(laporan, wilayah)
    for jarak in range(len(urutan)):  # mulai dari median, melebar sampai ketemu calon
        for idx in sorted({len(urutan) // 2 - jarak, len(urutan) // 2 + jarak}):
            if not 0 <= idx < len(urutan):
                continue
            calon = [l for l in laporan if (l["kode_wilayah"], l["category_id"]) == urutan[idx]
                     and l["status"] in ("menunggu", "diverifikasi") and not l["khusus"]]
            if calon:
                calon[0]["pelapor"], calon[0]["khusus"] = WARGA_DEMO, "b"
                calon[0]["peringkat"] = (idx + 1, len(urutan))
                if WARGA_DEMO in calon[0]["upvote"]:
                    calon[0]["upvote"].remove(WARGA_DEMO)
                return


# ---------- tahap 2: deskripsi, catatan tolak, kode ----------

TEKS = {
    1: (["Jalan berlubang cukup dalam", "Aspal rusak dan mengelupas", "Ada lubang besar di badan jalan",
         "Permukaan jalan amblas", "Jalan bergelombang dan retak parah"],
        ["sudah beberapa pengendara motor terjatuh.", "berbahaya saat malam karena tidak terlihat.",
         "lubangnya tertutup genangan saat hujan.", "membuat lalu lintas tersendat di jam sibuk."]),
    2: (["Saluran air tersumbat sampah dan lumpur", "Got di pinggir jalan mampet",
         "Air di selokan tidak mengalir", "Gorong-gorong tertutup endapan"],
        ["jalan cepat tergenang setiap hujan.", "airnya meluap sampai ke rumah warga.",
         "baunya menyengat dan banyak nyamuk.", "genangan baru surut berjam-jam setelah hujan."]),
    3: (["Sampah menumpuk di pinggir jalan", "Tumpukan sampah rumah tangga tidak diangkut",
         "TPS liar penuh dan meluber", "Sampah berserakan di trotoar"],
        ["sudah lebih dari tiga hari tidak diangkut.", "baunya tercium sampai permukiman.",
         "menghalangi pejalan kaki.", "mulai dikerumuni lalat dan tikus."]),
    4: (["Lampu jalan mati", "Beberapa lampu PJU padam", "Lampu penerangan jalan berkedip lalu mati",
         "Tiang lampu jalan tidak menyala"],
        ["jalan jadi sangat gelap di malam hari.", "warga khawatir rawan kejahatan.",
         "sudah sekitar seminggu tidak menyala.", "pengendara sulit melihat lubang dan pejalan kaki."]),
}
TEMPAT = ["sekolah", "pasar", "halte TransJakarta", "masjid", "puskesmas", "pertigaan",
          "kantor kelurahan", "minimarket", "gang masuk permukiman", "jembatan penyeberangan"]
PENUTUP = ["Mohon segera ditindaklanjuti.", "Mohon dicek petugas.", "Terima kasih.", ""]
CATATAN_TOLAK = {
    "tidak_valid": ["Foto tidak menunjukkan masalah yang dilaporkan.",
                    "Titik lokasi tidak sesuai dengan foto setelah dicek petugas.",
                    "Saat dicek di lapangan, kondisi sudah normal."],
    "konten_melanggar": ["Deskripsi memuat kata-kata kasar terhadap pihak tertentu.",
                         "Foto memuat wajah orang yang dapat dikenali tanpa disensor."],
}


def beri_teks_dan_kode(laporan: list[dict], wilayah: pd.DataFrame) -> None:
    nama = dict(zip(wilayah["kode_wilayah"], wilayah["nama"]))
    terpakai = set()
    for l in laporan:
        pembuka, detail = TEKS[l["category_id"]]
        l["deskripsi"] = (f"{rng.choice(pembuka)} di dekat {rng.choice(TEMPAT)}, Kec. {nama[l['kode_wilayah']]}, "
                          f"{rng.choice(detail)} {rng.choice(PENUTUP)}").strip()
        assert 20 <= len(l["deskripsi"]) <= 500, l["deskripsi"]
        l["catatan_tolak"] = str(rng.choice(CATATAN_TOLAK[l["alasan"]])) if l["alasan"] in CATATAN_TOLAK else None
        while True:
            kode = "SR-" + "".join(rng.choice(list(ALFABET_KODE), size=6))
            if kode not in terpakai:
                terpakai.add(kode)
                l["kode"] = kode
                break


def tahap2(laporan: list[dict], wilayah: pd.DataFrame) -> None:
    beri_upvote(laporan)
    kasus_khusus(laporan, wilayah)
    beri_teks_dan_kode(laporan, wilayah)


# ---------- tahap 3: foto, waktu upvote/rating, catatan timeline ----------

CATATAN = {
    "diproses": ["Petugas dijadwalkan ke lokasi.", "Sedang dikerjakan oleh tim lapangan.",
                 "Material sudah disiapkan, pengerjaan dimulai."],
    "selesai": ["Pekerjaan selesai, foto bukti terlampir.", "Sudah ditangani petugas di lokasi.",
                "Selesai dikerjakan. Terima kasih atas laporannya."],
}
KOMENTAR = {
    5: ["Cepat sekali ditangani, terima kasih!", "Mantap, petugasnya responsif."],
    4: ["Sudah beres, terima kasih.", "Cukup cepat ditangani."],
    3: ["Sudah diperbaiki, tapi agak lama.", "Lumayan, semoga awet."],
    2: ["Lama sekali baru dikerjakan.", "Hasilnya kurang rapi."],
    1: ["Sangat lambat, sudah berminggu-minggu.", "Belum benar-benar beres."],
}


def muat_foto(url_dasar: str) -> dict:
    """{(category_id, jenis): [url publik, ...]} dari manifest 05b_foto.py."""
    if not MANIFEST_FOTO.exists():
        sys.exit("Manifest foto belum ada. Jalankan dulu: python scripts/05b_foto.py")
    tabel = pd.read_csv(MANIFEST_FOTO)
    kumpulan = {}
    for b in tabel.itertuples():
        url = URL_PUBLIK_FOTO.format(dasar=url_dasar.rstrip("/"), path=b.path_bucket)
        kumpulan.setdefault((int(b.category_id), b.jenis), []).append(url)
    kosong = [f"{k} {j}" for k in KATEGORI for j in ("laporan", "bukti") if not kumpulan.get((k, j))]
    if kosong:
        sys.exit(f"Foto kosong untuk: {', '.join(kosong)} — jalankan ulang 05b_foto.py")
    return kumpulan


def tahap3(laporan: list[dict], url_dasar: str) -> None:
    foto = muat_foto(url_dasar)
    for l in laporan:
        kat = l["category_id"]
        pool = foto[(kat, "laporan")]
        n = min(int(rng.choice(JUMLAH_FOTO[0], p=JUMLAH_FOTO[1])), len(pool))
        l["foto"] = [str(u) for u in rng.choice(pool, size=n, replace=False)]
        l["bukti"] = str(rng.choice(foto[(kat, "bukti")])) if l["status"] == "selesai" else None
        l["id"] = str(uuid.uuid5(NS_UUID, l["kode"]))

        # catatan per baris timeline (ditolak: catatan_tolak tahap 2; duplikat: rujukan kode)
        l["catatan"] = [str(rng.choice(CATATAN[s])) if s in CATATAN else None for _, s, _ in l["timeline"]]
        l["waktu_upvote"] = [l["created"] + rng.uniform(0.05, 1) * -l["created"] for _ in l["upvote"]]
        if l["rating"] is not None:
            jeda = min(72.0, -l["resolved"])
            l["waktu_rating"] = l["resolved"] + rng.uniform(0.1, 1) * jeda
            l["komentar"] = str(rng.choice(KOMENTAR[l["rating"]])) if rng.random() < 0.5 else None


# ---------- tahap 3: tulis seed.sql ----------

def sql_teks(x) -> str:
    return "null" if x is None else "'" + str(x).replace("'", "''") + "'"


def sql_waktu(jam: float | None) -> str:
    """Jam relatif anchor -> ekspresi berbasis now() (konstan dalam satu transaksi = seed_anchor)."""
    return "null" if jam is None else f"now() + interval '{round(jam * 3600)} seconds'"


def email_warga(no: int) -> str:
    return f"warga.demo@{DOMAIN}" if no == WARGA_DEMO else f"warga{no:02d}@{DOMAIN}"


def tulis_sql(laporan: list[dict]) -> dict:
    id_no = {l["no"]: l for l in laporan}
    r_baris, u_baris, v_baris, t_baris = [], [], [], []
    n_pelapor = 0

    for l in laporan:
        perkiraan = (f"({sql_waktu(l['created'] + l['sla_s'])})::date"
                     if l["status"] in TERVERIFIKASI else "null")
        foto = "array[" + ", ".join(sql_teks(u) for u in l["foto"]) + "]"
        r_baris.append(
            f"({sql_teks(l['id'])}, {sql_teks(l['kode'])}, {sql_teks(email_warga(l['pelapor']))}, "
            f"{l['category_id']}, {sql_teks(l['kode_wilayah'])}, {sql_teks(l['deskripsi'])}, {foto}, "
            f"{l['lon']}, {l['lat']}, {sql_teks(l['status'])}, {perkiraan}, {sql_waktu(l['created'])}, "
            f"{sql_waktu(l['responded'])}, {sql_waktu(l['resolved'])})")

        for (jam, status, oleh_admin), catatan in zip(l["timeline"], l["catatan"]):
            alasan = dup = bukti = None
            if status == "ditolak":
                alasan = l["alasan"]
                if alasan == "duplikat":
                    target = id_no[l["duplikat_dari"]]
                    dup, catatan = target["id"], f"Sudah dilaporkan sebelumnya ({target['kode']})."
                else:
                    catatan = l["catatan_tolak"]
            if status == "selesai":
                bukti = l["bukti"]
            n_pelapor += not oleh_admin
            u_baris.append(
                f"({sql_teks(l['id'])}, {sql_teks(EMAIL_ADMIN[l['instansi']] if oleh_admin else None)}, "
                f"{sql_teks(status)}, {sql_teks(alasan)}, {sql_teks(dup)}, {sql_teks(catatan)}, "
                f"{sql_teks(bukti)}, {sql_waktu(jam)})")

        for w, jam in zip(l["upvote"], l["waktu_upvote"]):
            v_baris.append(f"({sql_teks(l['id'])}, {sql_teks(email_warga(w))}, {sql_waktu(jam)})")
        if l["rating"] is not None:
            t_baris.append(f"({sql_teks(l['id'])}, {sql_teks(email_warga(l['pelapor']))}, {l['rating']}, "
                           f"{sql_teks(l['komentar'])}, {sql_waktu(l['waktu_rating'])})")

    jumlah = dict(reports=len(r_baris), report_updates=len(u_baris), upvotes=len(v_baris), ratings=len(t_baris))
    pisah = ",\n  "
    sql = f"""-- supabase/seed/seed.sql — DIBUAT OTOMATIS oleh scripts/05_seed.py (rng 2026). Jangan diedit manual.
-- Hanya mengisi seed.* dan app_config 'seed_anchor'. Muat dengan scripts/05c_muat_seed.py
-- (satu transaksi: now() di seluruh file = seed_anchor). User dirujuk lewat email, wilayah lewat kode_wilayah.
-- Jumlah: {', '.join(f'{k} {v}' for k, v in jumlah.items())}

-- Kosongkan isi seed lama (hanya baris simulasi; tabel seed.* tidak punya FK, jadi dihapus satu per satu).
delete from seed.ratings        where report_id in (select id from seed.reports where is_simulated);
delete from seed.upvotes        where report_id in (select id from seed.reports where is_simulated);
delete from seed.report_updates where report_id in (select id from seed.reports where is_simulated);
delete from seed.reports        where is_simulated;

insert into seed.reports (id, kode, user_id, category_id, region_id, deskripsi, foto, lokasi, status,
                          perkiraan_selesai, kategori_diubah, created_at, responded_at, resolved_at, is_simulated)
select v.id::uuid, v.kode, u.id, v.category_id, g.id, v.deskripsi, v.foto,
       st_setsrid(st_makepoint(v.lon, v.lat), 4326)::geography, v.status::status_laporan,
       v.perkiraan_selesai::date, false, v.created_at, v.responded_at::timestamptz, v.resolved_at::timestamptz, true
from (values
  {pisah.join(r_baris)}
) v(id, kode, email, category_id, kode_wilayah, deskripsi, foto, lon, lat, status, perkiraan_selesai,
    created_at, responded_at, resolved_at)
join auth.users u     on u.email = v.email
join public.regions g on g.kode_wilayah = v.kode_wilayah;

insert into seed.report_updates (report_id, admin_id, status_baru, alasan_tolak, duplikat_dari, catatan, bukti_url, created_at)
select v.report_id::uuid, u.id, v.status_baru::status_laporan, v.alasan_tolak::alasan_tolak,
       v.duplikat_dari::uuid, v.catatan, v.bukti_url, v.created_at
from (values
  {pisah.join(u_baris)}
) v(report_id, email_admin, status_baru, alasan_tolak, duplikat_dari, catatan, bukti_url, created_at)
left join auth.users u on u.email = v.email_admin
order by v.created_at;

insert into seed.upvotes (report_id, user_id, created_at)
select v.report_id::uuid, u.id, v.created_at
from (values
  {pisah.join(v_baris)}
) v(report_id, email, created_at)
join auth.users u on u.email = v.email;

insert into seed.ratings (report_id, user_id, nilai, komentar, created_at)
select v.report_id::uuid, u.id, v.nilai, v.komentar::text, v.created_at
from (values
  {pisah.join(t_baris)}
) v(report_id, email, nilai, komentar, created_at)
join auth.users u on u.email = v.email;

insert into public.app_config (kunci, nilai) values ('seed_anchor', to_jsonb(now()))
on conflict (kunci) do update set nilai = excluded.nilai;

-- Cek akhir: jumlah harus persis (email/kode_wilayah yang tidak ditemukan membuat baris hilang).
do $$
declare n int;
begin
  select count(*) into n from seed.reports;        if n <> {jumlah['reports']} then raise exception 'seed.reports % baris, harus {jumlah['reports']} (akun warga / regions kurang?)', n; end if;
  select count(*) into n from seed.report_updates; if n <> {jumlah['report_updates']} then raise exception 'seed.report_updates % baris, harus {jumlah['report_updates']}', n; end if;
  select count(*) into n from seed.report_updates where admin_id is null;
  if n <> {n_pelapor} then raise exception 'report_updates tanpa admin % baris, harus {n_pelapor} (akun admin instansi kurang?)', n; end if;
  select count(*) into n from seed.upvotes;        if n <> {jumlah['upvotes']} then raise exception 'seed.upvotes % baris, harus {jumlah['upvotes']}', n; end if;
  select count(*) into n from seed.ratings;        if n <> {jumlah['ratings']} then raise exception 'seed.ratings % baris, harus {jumlah['ratings']}', n; end if;
end $$;
"""
    KELUARAN_SQL.parent.mkdir(parents=True, exist_ok=True)
    KELUARAN_SQL.write_text(sql, encoding="utf-8", newline="\n")
    jumlah["n_pelapor"] = n_pelapor
    return jumlah


# ---------- rapor (cermin lib/scoring/rapor.ts) ----------

def huruf_dari(nilai: float) -> str:
    return "A" if nilai >= 85 else "B" if nilai >= 70 else "C" if nilai >= 55 else "D" if nilai >= 40 else "E"


def hitung_rapor(laporan: list[dict], sekarang: float = 0.0) -> dict:
    hasil = {}
    for ins in NAMA_INSTANSI:
        semua = [l for l in laporan if l["instansi"] == ins]
        dinilai = [l for l in semua if l["status"] != "dibatalkan" and l["alasan"] != "duplikat"]
        r_n = r_t = s_n = s_t = selesai = tidak_ditolak = 0
        for l in dinilai:
            batas_r, batas_s = l["created"] + l["sla_r"], l["created"] + l["sla_s"]
            if l["responded"] is not None or sekarang > batas_r:
                r_n += 1
                r_t += l["responded"] is not None and l["responded"] <= batas_r
            if l["status"] != "ditolak":
                tidak_ditolak += 1
                selesai += l["status"] == "selesai"
                if l["resolved"] is not None or sekarang > batas_s:
                    s_n += 1
                    s_t += l["resolved"] is not None and l["resolved"] <= batas_s
        rating = [l["rating"] for l in dinilai if l["rating"] is not None]
        R = r_t / r_n if r_n else 0
        S = s_t / s_n if s_n else 0
        P = selesai / tidak_ditolak if tidak_ditolak else 0
        K = (sum(rating) + 15) / (len(rating) + 5) / 5
        nilai = round(100 * (0.3 * R + 0.3 * S + 0.2 * P + 0.2 * K), 1)
        ditolak = sum(l["alasan"] in ("tidak_valid", "konten_melanggar") for l in dinilai)
        hasil[ins] = dict(n=len(semua), R=R, S=S, P=P, K=K, nilai=nilai, sampel=r_n,
                          tolak=ditolak / len(dinilai) if dinilai else 0, n_rating=len(rating))

    for ins, h in hasil.items():
        lain = sorted(hasil[j]["tolak"] for j in hasil if j != ins)
        median = lain[len(lain) // 2] if len(lain) % 2 else (lain[len(lain) // 2 - 1] + lain[len(lain) // 2]) / 2
        h["peringatan"] = h["tolak"] > 0.25 or (h["tolak"] >= 0.10 and h["tolak"] > 2 * median)
        h["huruf_asli"] = huruf_dari(h["nilai"])
        h["huruf"] = (None if h["sampel"] < 10
                      else "C" if h["peringatan"] and h["huruf_asli"] in ("A", "B") else h["huruf_asli"])
    return hasil


# ---------- ringkasan ----------

def cetak_ringkasan(laporan: list[dict], rapor: dict) -> None:
    status = pd.Series([l["status"] for l in laporan]).value_counts()
    aktif = sum(l["status"] in ("menunggu", "diverifikasi", "diproses") for l in laporan) / len(laporan)
    print(f"Laporan: {len(laporan)} | status: " + ", ".join(f"{s} {n}" for s, n in status.items()))
    print(f"Aktif di anchor: {aktif:.0%} (target 25-35%) -> {'OK' if 0.25 <= aktif <= 0.35 else 'BELUM'}")
    print(f"Kecamatan terpakai: {len({l['kode_wilayah'] for l in laporan})}/42, "
          f"rating: {sum(l['rating'] is not None for l in laporan)}")
    print("\nInstansi     n    R     S     P     K   tolak  nilai  asli huruf target")
    semua_ok = aktif >= 0.25 and aktif <= 0.35
    for ins, h in rapor.items():
        ok = h["huruf"] == TARGET_HURUF[ins]
        semua_ok &= ok
        print(f"{NAMA_INSTANSI[ins]:<11}{h['n']:>4} {h['R']:.2f}  {h['S']:.2f}  {h['P']:.2f}  {h['K']:.2f}  "
              f"{h['tolak']:.2f}{'!' if h['peringatan'] else ' '}  {h['nilai']:>5}   {h['huruf_asli']}    "
              f"{h['huruf'] or '-'}    {TARGET_HURUF[ins]} {'OK' if ok else 'BELUM'}")
    print(f"\nKesimpulan: {'SEMUA TARGET TERCAPAI' if semua_ok else 'PERLU DISETEL'}")


def cetak_tahap2(laporan: list[dict]) -> None:
    jumlah = [len(l["upvote"]) for l in laporan]
    print("\n--- Tahap 2 ---")
    print(f"Upvote: total {sum(jumlah)}, maks {max(jumlah)}, laporan >10 upvote: {sum(n > 10 for n in jumlah)}")
    panjang = [len(l["deskripsi"]) for l in laporan]
    print(f"Deskripsi: {min(panjang)}-{max(panjang)} karakter | kode unik: {len({l['kode'] for l in laporan})}/{len(laporan)}")
    tolak_tanpa_catatan = sum(l["alasan"] in CATATAN_TOLAK and not l["catatan_tolak"] for l in laporan)
    print(f"Ditolak tidak_valid/konten_melanggar tanpa catatan: {tolak_tanpa_catatan} (harus 0)")

    a = [l for l in laporan if l["khusus"] == "a"]
    jarak = [jarak_m(a[i], a[j]) for i in range(3) for j in range(i + 1, 3)]
    ok_a = len(a) == 3 and max(jarak) <= RADIUS_SERUPA_M and all(l["status"] in AKTIF for l in a)
    print(f"(a) {', '.join(l['kode'] + ' ' + l['status'] for l in a)} | jarak maks {max(jarak):.0f} m "
          f"-> {'OK' if ok_a else 'BELUM'}")
    b = [l for l in laporan if l["khusus"] == "b"]
    ok_b = len(b) == 1 and b[0]["pelapor"] == WARGA_DEMO and b[0]["status"] in AKTIF
    if b:
        print(f"(b) {b[0]['kode']} {b[0]['status']} kategori {b[0]['category_id']}, isu peringkat "
              f"{b[0]['peringkat'][0]}/{b[0]['peringkat'][1]} (perkiraan) -> {'OK' if ok_b else 'BELUM'}")
    c = [l for l in laporan if l["khusus"] == "c"]
    ok_c = len(c) == 1 and c[0]["category_id"] == 1 and c[0]["status"] == "diproses"
    print(f"(c) {c[0]['kode']} {c[0]['status']} Bina Jalan -> {'OK' if ok_c else 'BELUM'}")
    print(f"Kesimpulan tahap 2: {'SEMUA OK' if ok_a and ok_b and ok_c and not tolak_tanpa_catatan else 'ADA MASALAH'}")


def cetak_tahap3(laporan: list[dict], jumlah: dict) -> None:
    print("\n--- Tahap 3 ---")
    n_foto = pd.Series([len(l["foto"]) for l in laporan]).value_counts().sort_index()
    print("Foto per laporan: " + ", ".join(f"{k} foto {v}" for k, v in n_foto.items()))
    tanpa_bukti = sum(l["status"] == "selesai" and not l["bukti"] for l in laporan)
    print(f"Selesai tanpa foto bukti: {tanpa_bukti} (harus 0)")
    ukuran = KELUARAN_SQL.stat().st_size / 1e6
    print(f"Ditulis {KELUARAN_SQL.relative_to(ROOT)} ({ukuran:.2f} MB): "
          + ", ".join(f"{k} {v}" for k, v in jumlah.items() if k != "n_pelapor"))
    print(f"Kesimpulan tahap 3: {'OK' if not tanpa_bukti and ukuran < 10 else 'ADA MASALAH'}")


def main() -> None:
    load_dotenv(ROOT / ".env.local")
    url_dasar = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    if not url_dasar:
        sys.exit("Kosong di .env.local: NEXT_PUBLIC_SUPABASE_URL (dipakai untuk URL publik foto)")

    wilayah = muat_wilayah()
    laporan = simulasi_laporan(wilayah)
    tahap2(laporan, wilayah)
    cetak_ringkasan(laporan, hitung_rapor(laporan))
    cetak_tahap2(laporan)
    tahap3(laporan, url_dasar)
    cetak_tahap3(laporan, tulis_sql(laporan))


if __name__ == "__main__":
    main()
