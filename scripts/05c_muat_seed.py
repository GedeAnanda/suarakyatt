"""05c_muat_seed.py — muat supabase/seed/seed.sql lalu jalankan reset_demo_data() (pemilik: C).

MENULIS KE DATABASE BERSAMA. Selalu jalankan --dry-run dulu.

Semua dalam SATU transaksi:
  1. seed.sql: isi ulang seed.* + app_config 'seed_anchor' (cek jumlah baris di akhir file)
  2. select reset_demo_data(): salin seed.* ke tabel public (FK & check public ikut diuji)
  3. ringkasan laporan simulasi di public
  4. cek: 0 titik di luar poligon, rapor 4 instansi dengan huruf A/D/B/C, priority_factors punya isu
--dry-run: semua langkah dijalankan lalu ROLLBACK -> tidak ada yang berubah.
Kalau langkah 4 gagal: ROLLBACK juga (tidak pernah COMMIT data yang salah).
Tanpa flag: minta ketik MUAT, lalu COMMIT.

Jalankan dari folder root repo:
    python scripts/05c_muat_seed.py --dry-run
    python scripts/05c_muat_seed.py
"""

import argparse
import os
import sys
from pathlib import Path

import psycopg
from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parents[1]
SEED_SQL = ROOT / "supabase" / "seed" / "seed.sql"

RINGKASAN = """
select a.nama, count(*),
       count(*) filter (where r.status in ('menunggu','diverifikasi','diproses')),
       count(*) filter (where r.status = 'selesai'),
       count(*) filter (where r.status = 'ditolak')
from reports r join categories c on c.id = r.category_id join agencies a on a.id = c.instansi_id
where r.is_simulated
group by a.id, a.nama order by a.id
"""

# Huruf rapor yang diharapkan per instansi (id instansi = id kategori, lihat 05_seed.py)
HURUF_TARGET = {1: "A", 2: "D", 3: "B", 4: "C"}

DI_LUAR_POLIGON = """
select count(*) from reports r join regions g on g.id = r.region_id
where r.is_simulated and not ST_Covers(g.geom, r.lokasi::geometry)
"""


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true", help="jalankan semua lalu ROLLBACK")
    args = parser.parse_args()

    if not SEED_SQL.exists():
        sys.exit("seed.sql belum ada. Jalankan dulu: python scripts/05_seed.py")
    load_dotenv(ROOT / ".env.local")
    url_db = os.environ.get("DATABASE_URL")
    if not url_db:
        sys.exit("Kosong di .env.local: DATABASE_URL")

    if not args.dry_run and input(
        "Akan mengisi ulang seed.* dan MENGGANTI semua laporan simulasi + laporan akun demo di database "
        "bersama. Ketik MUAT untuk lanjut: ").strip() != "MUAT":
        sys.exit("Dibatalkan, tidak ada yang diubah.")

    with psycopg.connect(url_db, prepare_threshold=None) as conn:
        with conn.cursor() as cur:
            cur.execute(SEED_SQL.read_text(encoding="utf-8"))  # tanpa parameter: banyak statement sekaligus
            cur.execute("select count(*) from seed.reports")
            n_seed = cur.fetchone()[0]
            cur.execute("select public.reset_demo_data()")
            hasil_reset = cur.fetchone()[0]
            cur.execute(RINGKASAN)
            per_instansi = cur.fetchall()
            cur.execute("select count(*) from upvotes u join reports r on r.id = u.report_id where r.is_simulated")
            n_upvote = cur.fetchone()[0]
            cur.execute("select count(*) from ratings t join reports r on r.id = t.report_id where r.is_simulated")
            n_rating = cur.fetchone()[0]
            # pemeriksaan hasil (fungsi 0007) sebelum COMMIT
            cur.execute(DI_LUAR_POLIGON)
            n_luar = cur.fetchone()[0]
            cur.execute("select public.agency_report_card()")
            rapor = cur.fetchone()[0]
            cur.execute("select public.priority_factors()")
            n_isu = len(cur.fetchone()[0]["isu"] or [])
        huruf = {i["id"]: i["huruf"] for i in rapor["instansi"]}
        gagal = []
        if n_luar:
            gagal.append(f"{n_luar} titik di luar poligon kecamatannya")
        if len(huruf) != 4:
            gagal.append(f"rapor berisi {len(huruf)} instansi, harus 4")
        if huruf != HURUF_TARGET:
            gagal.append(f"huruf rapor {huruf}, harus {HURUF_TARGET}")
        if n_isu == 0:
            gagal.append("priority_factors tidak punya isu")
        if args.dry_run or gagal:
            conn.rollback()
        else:
            conn.commit()

    if gagal:
        print("GAGAL, semua di-ROLLBACK, database tidak berubah:")
        for g in gagal:
            print(" -", g)
    else:
        print("DRY-RUN (semua di-ROLLBACK, database tidak berubah)" if args.dry_run else "TERSIMPAN")
    print(f"seed.reports: {n_seed} | reset_demo_data: {hasil_reset}")
    print(f"Rapor: {' '.join(f'{k}={v}' for k, v in sorted(huruf.items()))} | isu prioritas: {n_isu} | di luar poligon: {n_luar}")
    print("Instansi            total aktif selesai ditolak")
    for nama, total, aktif, selesai, ditolak in per_instansi:
        print(f"{nama[:18]:<18} {total:>6} {aktif:>5} {selesai:>7} {ditolak:>7}")
    print(f"Upvote: {n_upvote} | rating: {n_rating}")
    if gagal:
        sys.exit(1)


if __name__ == "__main__":
    main()
