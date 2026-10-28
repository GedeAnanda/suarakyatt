"""04_akun.py — buat akun admin instansi, Perencana, dan warga simulasi (pemilik: C).

MENULIS KE SUPABASE AUTH + TABEL profiles. Selalu jalankan --dry-run dulu.

Akun yang dibuat (semua @suarakyat.test, is_demo = false):
  - 4 admin instansi  admin.<instansi>@   role admin, instansi_id 1–4
  - 1 Perencana       perencana@          role admin, kelola_prioritas, tanpa instansi
  - 40 warga          warga01@ … warga40@ role warga
Akun demo (warga.demo@, admin.demo@) TIDAK disentuh.

Idempoten: email yang sudah ada tidak dibuat ulang (password lama tetap), tapi profilnya
disetel ulang agar role/instansi selalu benar. Password akun baru disimpan ke
_pribadi/akun_simulasi.csv (di luar repo), tidak pernah dicetak.

--dry-run hanya membaca auth.users dan menguji update profil di transaksi lalu ROLLBACK;
tidak ada akun yang dibuat.

Jalankan dari folder root repo:
    python scripts/04_akun.py --dry-run
    python scripts/04_akun.py
"""

import argparse
import csv
import os
import secrets
import sys
from pathlib import Path

import psycopg
from dotenv import load_dotenv
from supabase import create_client

ROOT = Path(__file__).resolve().parents[1]
FILE_PASSWORD = ROOT.parent / "_pribadi" / "akun_simulasi.csv"

DOMAIN = "suarakyat.test"
JUMLAH_WARGA = 40

# (email, nama, role, instansi_id, kelola_prioritas)
AKUN = [
    (f"admin.binajalan@{DOMAIN}", "Admin Dinas Bina Jalan (simulasi)", "admin", 1, False),
    (f"admin.tataair@{DOMAIN}", "Admin Dinas Tata Air (simulasi)", "admin", 2, False),
    (f"admin.kebersihan@{DOMAIN}", "Admin Dinas Kebersihan (simulasi)", "admin", 3, False),
    (f"admin.penerangan@{DOMAIN}", "Admin Dinas Penerangan Jalan (simulasi)", "admin", 4, False),
    (f"perencana@{DOMAIN}", "Bappeda Kota (simulasi)", "admin", None, True),
] + [
    (f"warga{i:02d}@{DOMAIN}", f"Warga Simulasi {i:02d}", "warga", None, False)
    for i in range(1, JUMLAH_WARGA + 1)
]

SETEL_PROFIL = """
update profiles p
set nama = %s, role = %s, instansi_id = %s, kelola_prioritas = %s, is_demo = false
from auth.users u
where u.id = p.id and u.email = %s
"""


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true", help="hanya periksa; update profil di-ROLLBACK")
    args = parser.parse_args()

    load_dotenv(ROOT / ".env.local")
    url_db = os.environ.get("DATABASE_URL")
    url_api = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    kunci = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    kurang = [n for n, v in (("DATABASE_URL", url_db), ("NEXT_PUBLIC_SUPABASE_URL", url_api),
                             ("SUPABASE_SERVICE_ROLE_KEY", kunci)) if not v]
    if kurang:
        sys.exit(f"Kosong di .env.local: {', '.join(kurang)}")

    semua_email = [a[0] for a in AKUN]
    with psycopg.connect(url_db, prepare_threshold=None) as conn:
        with conn.cursor() as cur:
            cur.execute("select email from auth.users where email = any(%s)", (semua_email,))
            sudah_ada = {e for (e,) in cur.fetchall()}
    akun_baru = [a for a in AKUN if a[0] not in sudah_ada]

    if not args.dry_run and akun_baru:
        jawab = input(f"Akan membuat {len(akun_baru)} akun di Supabase Auth (database bersama). Ketik BUAT untuk lanjut: ")
        if jawab.strip() != "BUAT":
            sys.exit("Dibatalkan, tidak ada yang dibuat.")

    # 1. Buat akun yang belum ada lewat Admin API. Trigger handle_new_user membuat profil 'warga'.
    dibuat, gagal = 0, []
    if not args.dry_run and akun_baru:
        klien = create_client(url_api, kunci)
        FILE_PASSWORD.parent.mkdir(parents=True, exist_ok=True)
        file_baru = not FILE_PASSWORD.exists()
        with FILE_PASSWORD.open("a", newline="", encoding="utf-8") as f:
            tulis = csv.writer(f)
            if file_baru:
                tulis.writerow(["email", "password", "nama"])
            for email, nama, *_ in akun_baru:
                password = secrets.token_urlsafe(12)
                try:
                    klien.auth.admin.create_user({
                        "email": email,
                        "password": password,
                        "email_confirm": True,
                        "user_metadata": {"nama": nama},
                    })
                except Exception as e:  # lanjut ke akun berikutnya, laporkan di akhir
                    gagal.append(f"{email}: {type(e).__name__}: {e}")
                    continue
                tulis.writerow([email, password, nama])
                dibuat += 1

    # 2. Setel profil semua akun target (role, instansi, kelola_prioritas).
    tanpa_profil = []
    with psycopg.connect(url_db, prepare_threshold=None) as conn:
        with conn.cursor() as cur:
            for email, nama, role, instansi_id, kelola in AKUN:
                cur.execute(SETEL_PROFIL, (nama, role, instansi_id, kelola, email))
                if cur.rowcount != 1 and (email in sudah_ada or not args.dry_run):
                    tanpa_profil.append(email)
            cur.execute(
                "select p.role, count(*) from profiles p join auth.users u on u.id = p.id "
                "where u.email = any(%s) group by p.role order by p.role",
                (semua_email,),
            )
            per_role = ", ".join(f"{r} {n}" for r, n in cur.fetchall()) or "-"
        if args.dry_run:
            conn.rollback()
        else:
            conn.commit()

    print("DRY-RUN (tidak ada akun dibuat, update profil di-ROLLBACK)" if args.dry_run else "TERSIMPAN")
    print(f"Target {len(AKUN)} akun: sudah ada {len(sudah_ada)}, perlu dibuat {len(akun_baru)}")
    if not args.dry_run:
        print(f"Dibuat sekarang: {dibuat}" + (f" (password di {FILE_PASSWORD})" if dibuat else ""))
    print(f"Profil per role (akun yang ada di DB): {per_role}")
    if tanpa_profil:
        print(f"Peringatan: {len(tanpa_profil)} akun tanpa baris profiles: {', '.join(tanpa_profil[:5])}")
    if gagal:
        print(f"GAGAL dibuat ({len(gagal)}):")
        for g in gagal[:5]:
            print(f"  - {g}")


if __name__ == "__main__":
    main()
