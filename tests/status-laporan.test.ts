// tests/status-laporan.test.ts — batas waktu (SLA) dan kendala yang tampil di kotak "Status sekarang" (pemilik: B)
// Revisi FDS 10 Nov (docs/revisi-fds-2026-11-10.md, 3.3). Jalankan: npm test

import { describe, expect, it } from 'vitest';
import { hitungSLA } from '@/components/IndikatorSLA';
import { kendalaBerlaku } from '@/components/laporan/RingkasanStatus';
import type { TimelineItem } from '@/lib/types';

const JAM = 3600 * 1000;
const t0 = Date.parse('2026-11-01T00:00:00Z');
const iso = (ms: number) => new Date(ms).toISOString();
const dasar = { batas_respons: iso(t0 + 24 * JAM), batas_selesai: iso(t0 + 120 * JAM), responded_at: null, resolved_at: null };

describe('hitungSLA', () => {
  it('menunggu: menghitung batas respons', () => {
    const sla = hitungSLA({ ...dasar, status: 'menunggu' }, t0 + 6 * JAM)!;
    expect(sla.terlambat).toBe(false);
    expect(sla.teks).toContain('ditanggapi');
  });

  it('menunggu lewat batas respons: terlambat', () => {
    expect(hitungSLA({ ...dasar, status: 'menunggu' }, t0 + 30 * JAM)!.terlambat).toBe(true);
  });

  it('diproses: menghitung batas selesai, bukan batas respons', () => {
    const sla = hitungSLA({ ...dasar, status: 'diproses', responded_at: iso(t0 + JAM) }, t0 + 30 * JAM)!;
    expect(sla.terlambat).toBe(false);
    expect(sla.teks).toContain('untuk selesai');
    expect(hitungSLA({ ...dasar, status: 'diproses' }, t0 + 121 * JAM)!.terlambat).toBe(true);
  });

  it('laporan warga asli yang Menunggu tidak ditandai terlambat (tidak ada dinas sungguhan)', () => {
    const sla = hitungSLA({ ...dasar, status: 'menunggu', is_simulated: false }, t0 + 300 * JAM)!;
    expect(sla.terlambat).toBe(false);
    expect(sla.teks).toBe('Belum ditanggapi');
  });

  it('selesai tanpa waktu selesai tidak ditebak terlambat (bug daftar peta W1)', () => {
    expect(hitungSLA({ ...dasar, status: 'selesai' }, t0 + 500 * JAM)).toMatchObject({ terlambat: false, teks: 'Selesai' });
  });

  it('selesai terlambat dan selesai tepat waktu', () => {
    expect(hitungSLA({ ...dasar, status: 'selesai', resolved_at: iso(t0 + 140 * JAM) }, t0 + 200 * JAM)).toMatchObject({
      terlambat: true,
      selesai: true,
    });
    expect(hitungSLA({ ...dasar, status: 'selesai', resolved_at: iso(t0 + 100 * JAM) }, t0 + 200 * JAM)).toMatchObject({
      terlambat: false,
      selesai: true,
    });
  });

  it('ditolak dan dibatalkan tidak punya batas waktu', () => {
    expect(hitungSLA({ ...dasar, status: 'ditolak' }, t0 + 500 * JAM)).toBeNull();
    expect(hitungSLA({ ...dasar, status: 'dibatalkan' }, t0 + 500 * JAM)).toBeNull();
  });
});

const baris = (status_baru: TimelineItem['status_baru'], jam: number, alasan_tunda: TimelineItem['alasan_tunda'] = null): TimelineItem => ({
  kode: 'SR-UJI234',
  status_baru,
  alasan_tolak: null,
  catatan: null,
  bukti_url: null,
  pelaku: 'Admin · uji',
  created_at: iso(t0 + jam * JAM),
  alasan_tunda,
  duplikat_dari_kode: null,
});

describe('kendalaBerlaku', () => {
  it('memakai kendala terakhir pada status yang sama', () => {
    const tl = [baris('menunggu', 0), baris('diverifikasi', 5), baris('diverifikasi', 30, 'antre_jadwal'), baris('diverifikasi', 60, 'cuaca')];
    expect(kendalaBerlaku({ status: 'diverifikasi' }, tl)?.alasan_tunda).toBe('cuaca');
  });

  it('mengabaikan kendala dari tahap sebelumnya', () => {
    const tl = [baris('menunggu', 0), baris('diverifikasi', 5), baris('diverifikasi', 30, 'antre_jadwal'), baris('diproses', 50)];
    expect(kendalaBerlaku({ status: 'diproses' }, tl)).toBeNull();
  });

  it('tanpa kendala: null', () => {
    expect(kendalaBerlaku({ status: 'diproses' }, [baris('menunggu', 0), baris('diproses', 5)])).toBeNull();
  });
});
