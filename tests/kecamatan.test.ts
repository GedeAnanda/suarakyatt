// tests/kecamatan.test.ts — skor per kecamatan dan kalimat awam (pemilik: C)
// Revisi FDS 10 Nov (docs/revisi-fds-2026-11-10.md, 2.2). Jalankan: npm test

import { describe, expect, it } from 'vitest';
import { KECAMATAN } from '@/lib/geo/kecamatan-svg';
import contohPrioritas from '@/lib/mocks/contoh-prioritas.json';
import { NAMA_FAKTOR } from '@/lib/konten';
import { BOBOT_AWAL, FAKTOR, hitungSkor, PENAHAN_FAKTOR, penahanUtama } from '@/lib/scoring';
import {
  ALASAN_AWAM,
  alasanUtama,
  kalimatIsu,
  kalimatKecamatan,
  ringkasJakarta,
  tingkatDari,
} from '@/lib/scoring/kecamatan';
import type { FaktorIsu } from '@/lib/types';

const isu = contohPrioritas.isu as FaktorIsu[];
const skor = hitungSkor(isu, BOBOT_AWAL);
const ringkas = ringkasJakarta(skor, KECAMATAN);

describe('ringkasJakarta', () => {
  it('memuat semua 42 kecamatan, termasuk yang tanpa isu aktif', () => {
    expect(ringkas.kecamatan).toHaveLength(42);
    expect(ringkas.totalIsu).toBe(isu.length);
    const tanpaIsu = ringkas.kecamatan.filter((k) => k.skor === null);
    expect(tanpaIsu.every((k) => k.urutan === null && k.isu.length === 0)).toBe(true);
    expect(ringkas.dinilai).toBe(42 - tanpaIsu.length);
  });

  it('skor kecamatan = skor isu tertingginya, dan urutan mengikuti skor itu', () => {
    for (const k of ringkas.kecamatan.filter((x) => x.skor !== null)) {
      expect(k.skor).toBe(Math.max(...skor.filter((s) => s.kode_wilayah === k.kode_wilayah).map((s) => s.skor)));
    }
    const urut = ringkas.kecamatan.filter((k) => k.urutan !== null).sort((a, b) => a.urutan! - b.urutan!);
    expect(urut.map((k) => k.urutan)).toEqual(urut.map((_, i) => i + 1));
    for (let i = 1; i < urut.length; i++) expect(urut[i - 1].skor!).toBeGreaterThanOrEqual(urut[i].skor!);
  });

  it('kecamatan peringkat 1 memuat isu peringkat 1', () => {
    expect(ringkas.kecamatan.find((k) => k.urutan === 1)!.isu[0].peringkat).toBe(1);
  });

  it('median berada di antara skor terendah dan tertinggi', () => {
    const s = ringkas.kecamatan.filter((k) => k.skor !== null).map((k) => k.skor!);
    expect(ringkas.median).toBeGreaterThanOrEqual(Math.min(...s));
    expect(ringkas.median).toBeLessThanOrEqual(Math.max(...s));
  });
});

describe('tingkatDari', () => {
  it('membagi posisi relatif, bukan ambang skor', () => {
    expect(tingkatDari(1, 40)).toBe('paling');
    expect(tingkatDari(4, 40)).toBe('paling');
    expect(tingkatDari(5, 40)).toBe('tinggi');
    expect(tingkatDari(20, 40)).toBe('sedang');
    expect(tingkatDari(40, 40)).toBe('rendah');
  });
});

describe('kalimat awam', () => {
  it('setiap faktor punya nama dan alasan awam', () => {
    for (const f of FAKTOR) {
      expect(NAMA_FAKTOR[f].length).toBeGreaterThan(5);
      expect(PENAHAN_FAKTOR[f].length).toBeGreaterThan(5);
      expect(ALASAN_AWAM[f].length).toBeGreaterThan(5);
    }
  });

  it('alasan utama = dua faktor dengan poin terbesar', () => {
    const atas = skor[0];
    const dua = [...FAKTOR].sort((a, b) => atas.kontribusi[b] - atas.kontribusi[a]).slice(0, 2);
    expect(alasanUtama(atas)).toEqual(dua);
  });

  it('kalimat isu menyebut kategori, kecamatan, urutan, dan alasan', () => {
    const k = kalimatIsu(skor[0], skor.length, BOBOT_AWAL);
    expect(k).toContain(skor[0].kategori);
    expect(k).toContain(skor[0].kecamatan);
    expect(k).toContain(`urutan ke-1 dari ${skor.length}`);
    expect(k).toContain(ALASAN_AWAM[alasanUtama(skor[0])[0]]);
    expect(k).not.toMatch(/poin|bobot|min-max|normalisasi|isu/);
  });

  it('masalah di sepertiga bawah dijelaskan dengan hal yang menahan, bukan yang menaikkan', () => {
    const bawah = skor.at(-1)!;
    const k = kalimatIsu(bawah, skor.length, BOBOT_AWAL);
    expect(k).toContain('Belum didahulukan');
    expect(k).toContain(PENAHAN_FAKTOR[penahanUtama(bawah, BOBOT_AWAL)]);
  });

  it('kalimat kecamatan membandingkan dengan median Jakarta', () => {
    const atas = ringkas.kecamatan.find((k) => k.urutan === 1)!;
    expect(kalimatKecamatan(atas, ringkas, BOBOT_AWAL)).toMatch(/urutan ke-1 dari \d+ kecamatan/);
    expect(kalimatKecamatan(atas, ringkas, BOBOT_AWAL)).toContain('lebih tinggi dari kebanyakan kecamatan');
    const terbawah = [...ringkas.kecamatan].filter((k) => k.urutan !== null).sort((a, b) => b.urutan! - a.urutan!)[0];
    expect(kalimatKecamatan(terbawah, ringkas, BOBOT_AWAL)).toContain('Yang paling menahan');
    const tanpa = ringkas.kecamatan.find((k) => k.skor === null);
    if (tanpa) expect(kalimatKecamatan(tanpa, ringkas, BOBOT_AWAL)).toContain('tidak punya laporan yang belum selesai');
  });
});
