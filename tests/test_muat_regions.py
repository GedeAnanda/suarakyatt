"""Uji main asli dengan driver tiruan; tidak perlu paket geospasial atau database."""
import argparse
import ast
import json
import sys
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import MagicMock, patch

ROOT = Path(__file__).resolve().parents[1]
tree = ast.parse((ROOT / 'scripts/03_muat_regions.py').read_text())
main_node = next(n for n in tree.body if isinstance(n, ast.FunctionDef) and n.name == 'main')
MAIN = compile(ast.Module(body=[main_node], type_ignores=[]), '03_muat_regions.py', 'exec')


class MuatRegionsTest(unittest.TestCase):
    def jalankan(self, hasil_titik, dry_run=False):
        conn = MagicMock()
        conn.__enter__.return_value = conn
        cur = conn.cursor.return_value.__enter__.return_value
        cur.fetchone.side_effect = [(42,), (True,), (42,)]
        cur.fetchall.side_effect = [[], hasil_titik]
        gab = MagicMock()
        gab.__len__.return_value = 1
        gab.__getitem__.return_value = ['kode-uji']
        gab.iterrows.return_value = [(0, dict(kode_wilayah='kode-uji', nama='Uji', kota='Uji', geometry=None,
                                             penduduk=100, luas_km2=1, persen_miskin=1, sumber='Uji'))]
        context = dict(argparse=argparse, json=json, sys=sys, ROOT=ROOT, siapkan_data=lambda: gab,
                       load_dotenv=lambda _: None, os=SimpleNamespace(environ={'DATABASE_URL': 'tiruan'}),
                       psycopg=SimpleNamespace(connect=lambda *a, **kw: conn), mapping=lambda _: {},
                       UPSERT='upsert tiruan', CARI_TITIK='titik tiruan', UJI_TITIK=[('Monas', -6, 106, 'Gambir')])
        exec(MAIN, context)
        with patch.object(sys, 'argv', ['03_muat_regions.py'] + (['--dry-run'] if dry_run else [])), \
                patch('builtins.input', return_value='MUAT'), patch('builtins.print'):
            try:
                context['main']()
                galat = None
            except SystemExit as error:
                galat = error
        return conn, galat

    def test_gagal_tidak_pernah_commit(self):
        for dry_run in [False, True]:
            with self.subTest(dry_run=dry_run):
                conn, galat = self.jalankan([('Salah',)], dry_run)
                self.assertIsNotNone(galat)
                self.assertIn('uji titik gagal', str(galat))
                conn.commit.assert_not_called()
                conn.rollback.assert_called_once()

    def test_lulus_commit(self):
        conn, galat = self.jalankan([('Gambir',)])
        self.assertIsNone(galat)
        conn.commit.assert_called_once()

    def test_dry_run_lulus_tetap_rollback(self):
        conn, galat = self.jalankan([('Gambir',)], dry_run=True)
        self.assertIsNone(galat)
        conn.commit.assert_not_called()
        conn.rollback.assert_called_once()


if __name__ == '__main__':
    unittest.main()
