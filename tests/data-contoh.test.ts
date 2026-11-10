// tests/data-contoh.test.ts — matriks skenario pada data contoh (pemilik: C)
// Revisi FDS 10 Nov (docs/revisi-fds-2026-11-10.md, 3.1–3.3): penolakan dan alasan penanganan harus lengkap dan
// konsisten, supaya halaman lacak bisa menampilkannya tanpa cabang "data tidak ada". Jalankan: npm test

import { describe, expect, it } from 'vitest';
import contoh from '@/lib/mocks/contoh-laporan.json';
import type { LaporanPublik, TimelineItem } from '@/lib/types';

const laporan = contoh.laporan as (LaporanPublik & { category_id: number })[];
const timeline = contoh.timeline as TimelineItem[];
const jangkar = Date.parse(contoh.jangkar);
const perKode = new Map<string, TimelineItem[]>();
for (const t of timeline) perKode.set(t.kode, [...(perKode.get(t.kode) ?? []), t]);
const byKode = new Map(laporan.map((l) => [l.kode, l]));

describe('skenario tersedia (S1–S6)', () => {
  it('setiap skenario punya minimal satu laporan', () => {
    const ada = {
      tidak_valid: laporan.some((l) => l.alasan_tolak === 'tidak_valid'),
      duplikat: laporan.some((l) => l.alasan_tolak === 'duplikat'),
      konten_melanggar: laporan.some((l) => l.alasan_tolak === 'konten_melanggar'),
      kendala: timeline.some((t) => t.alasan_tunda),
      aktif_dalam_batas: laporan.some((l) => l.status === 'diproses' && Date.parse(l.batas_selesai) > jangkar),
      selesai_terlambat: laporan.some((l) => l.status === 'selesai' && Date.parse(l.resolved_at!) > Date.parse(l.batas_selesai)),
    };
    expect(ada).toEqual(Object.fromEntries(Object.keys(ada).map((k) => [k, true])));
  });
});

describe('penolakan', () => {
  const ditolak = laporan.filter((l) => l.status === 'ditolak');

  it('setiap laporan ditolak punya satu baris tolak dengan alasan yang sama', () => {
    for (const l of ditolak) {
      const tolak = perKode.get(l.kode)!.filter((t) => t.status_baru === 'ditolak');
      expect(tolak).toHaveLength(1);
      expect(tolak[0].alasan_tolak).toBe(l.alasan_tolak);
    }
  });

  it('tidak valid dan konten melanggar wajib punya catatan', () => {
    const wajib = timeline.filter((t) => t.alasan_tolak === 'tidak_valid' || t.alasan_tolak === 'konten_melanggar');
    expect(wajib.every((t) => (t.catatan ?? '').trim().length > 10)).toBe(true);
    // Catatan penolakan tidak boleh seragam: warga perlu alasan yang spesifik.
    expect(new Set(wajib.map((t) => t.catatan)).size).toBeGreaterThanOrEqual(4);
  });

  it('duplikat menautkan laporan asli yang sekategori, lebih dulu, dan tidak ditolak', () => {
    for (const t of timeline.filter((x) => x.alasan_tolak === 'duplikat')) {
      const asli = byKode.get(t.duplikat_dari_kode!);
      const ini = byKode.get(t.kode)!;
      expect(asli, t.kode).toBeDefined();
      expect(asli!.category_id).toBe(ini.category_id);
      expect(asli!.status).not.toBe('ditolak');
      expect(Date.parse(asli!.created_at)).toBeLessThan(Date.parse(ini.created_at));
    }
  });

  it('konten melanggar: deskripsi dan foto disembunyikan seperti di v_laporan_publik', () => {
    for (const l of laporan.filter((x) => x.alasan_tolak === 'konten_melanggar')) {
      expect(l.deskripsi).toBeNull();
      expect(l.foto).toEqual([]);
    }
  });
});

describe('kendala (alasan tunda)', () => {
  it('hanya pada diverifikasi atau diproses, dan "lainnya" selalu punya catatan', () => {
    for (const t of timeline.filter((x) => x.alasan_tunda)) {
      expect(['diverifikasi', 'diproses']).toContain(t.status_baru);
      if (t.alasan_tunda === 'lainnya') expect(t.catatan).toBeTruthy();
    }
  });

  it('setiap laporan aktif terverifikasi yang lewat batas selesai punya kendala yang masih berlaku', () => {
    const lewat = laporan.filter((l) => (l.status === 'diverifikasi' || l.status === 'diproses') && Date.parse(l.batas_selesai) < jangkar);
    expect(lewat.length).toBeGreaterThan(0);
    for (const l of lewat) {
      const akhir = perKode.get(l.kode)!.at(-1)!;
      expect(akhir.alasan_tunda, l.kode).toBeTruthy();
      expect(akhir.status_baru).toBe(l.status);
      expect(l.perkiraan_selesai).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});

describe('timeline', () => {
  it('urut menurut waktu per laporan dan selalu diawali menunggu', () => {
    for (const [kode, tl] of perKode) {
      expect(tl[0].status_baru, kode).toBe('menunggu');
      const waktu = tl.map((t) => Date.parse(t.created_at));
      expect(waktu, kode).toEqual([...waktu].sort((a, b) => a - b));
    }
  });

  it('status laporan = status baris terakhir timeline', () => {
    for (const l of laporan) expect(perKode.get(l.kode)!.at(-1)!.status_baru, l.kode).toBe(l.status);
  });
});
