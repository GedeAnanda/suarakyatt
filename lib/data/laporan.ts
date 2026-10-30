// lib/data/laporan.ts — Q1, Q2, R1 untuk Server Component (pemilik: A)
// Membaca database lebih dulu. Selama database belum berisi seed C, halaman memakai
// lib/mocks/contoh-laporan.json dan menandainya "Data contoh" (sumber: 'contoh').
// Panggil hanya di dalam <Suspense>: fungsi ini membaca cookie dan waktu sekarang.

import 'server-only';
import { connection } from 'next/server';
import { cache } from 'react';
import contoh from '@/lib/mocks/contoh-laporan.json';
import { createClient } from './klien';
import type { LaporanPublik, StatusLaporan, TimelineItem } from '@/lib/types';

export type Sumber = 'db' | 'contoh';

export type TitikLaporan = Pick<
  LaporanPublik,
  'kode' | 'kategori' | 'status' | 'lat' | 'lng' | 'jumlah_upvote' | 'kecamatan' | 'kota' | 'created_at' | 'batas_respons' | 'batas_selesai'
>;

export interface StatistikBeranda {
  total_laporan: number;
  persen_selesai: number;
  terlambat_aktif: number;
  per_kategori: { kategori: string; jumlah: number }[];
  is_simulated: boolean;
}

const KOLOM_TITIK = 'kode,kategori,status,lat,lng,jumlah_upvote,kecamatan,kota,created_at,batas_respons,batas_selesai';
const AKTIF: StatusLaporan[] = ['menunggu', 'diverifikasi', 'diproses'];

// --- Data contoh: semua waktu digeser supaya "sekarang" sama dengan jangkar generator (SDD 4.4).

type LaporanContoh = LaporanPublik & { category_id: number; region_id: number; kode_wilayah: string };

function geser(iso: string | null, ms: number): string | null {
  return iso === null ? null : new Date(Date.parse(iso) + ms).toISOString();
}

const dataContoh = cache(async () => {
  await connection();
  const ms = Date.now() - Date.parse(contoh.jangkar);
  const laporan = (contoh.laporan as LaporanContoh[]).map((l) => ({
    ...l,
    created_at: geser(l.created_at, ms)!,
    responded_at: geser(l.responded_at, ms),
    resolved_at: geser(l.resolved_at, ms),
    batas_respons: geser(l.batas_respons, ms)!,
    batas_selesai: geser(l.batas_selesai, ms)!,
  }));
  const timeline = (contoh.timeline as TimelineItem[]).map((t) => ({ ...t, created_at: geser(t.created_at, ms)! }));
  return { laporan, timeline, sekarang: Date.now() };
});

export function terlambat(l: Pick<LaporanPublik, 'status' | 'batas_respons' | 'batas_selesai'>, sekarang: number) {
  if (!AKTIF.includes(l.status)) return false;
  return (l.status === 'menunggu' && sekarang > Date.parse(l.batas_respons)) || sekarang > Date.parse(l.batas_selesai);
}

// --- Q1 · titik laporan untuk peta

export const ambilTitikLaporan = cache(async (): Promise<{ sumber: Sumber; laporan: TitikLaporan[]; sekarang: number }> => {
  await connection();
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('v_laporan_publik').select(KOLOM_TITIK).limit(2000);
    if (!error && data && data.length > 0) {
      return { sumber: 'db', laporan: data as TitikLaporan[], sekarang: Date.now() };
    }
  } catch {
    // Supabase belum diatur atau tidak terjangkau: pakai data contoh.
  }
  const { laporan, sekarang } = await dataContoh();
  return {
    sumber: 'contoh',
    sekarang,
    laporan: laporan.map(
      ({ kode, kategori, status, lat, lng, jumlah_upvote, kecamatan, kota, created_at, batas_respons, batas_selesai }) => ({
        kode, kategori, status, lat, lng, jumlah_upvote, kecamatan, kota, created_at, batas_respons, batas_selesai,
      }),
    ),
  };
});

/** Pilih contoh dari sumber yang sedang tampil; tidak ada kode laporan fiktif di antarmuka. */
export const ambilContohLaporan = cache(async () => {
  const { laporan } = await ambilTitikLaporan();
  const pilihan = laporan.find((l) => l.kategori === 'Jalan rusak' && l.status === 'diverifikasi')
    ?? laporan.find((l) => l.status === 'diproses')
    ?? laporan.find((l) => AKTIF.includes(l.status))
    ?? laporan[0];
  return pilihan ? ambilDetailLaporan(pilihan.kode) : null;
});

// --- Q2 · detail + timeline

export interface DetailLaporan {
  sumber: Sumber;
  laporan: LaporanPublik;
  timeline: TimelineItem[];
  sekarang: number;
}

export async function ambilDetailLaporan(kode: string): Promise<DetailLaporan | null> {
  await connection();
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('v_laporan_publik').select('*').eq('kode', kode).maybeSingle();
    if (!error && !data && (await ambilTitikLaporan()).sumber === 'db') return null;
    if (!error && data) {
      const { data: tl } = await supabase.from('v_timeline_publik').select('*').eq('kode', kode).order('created_at');
      return { sumber: 'db', laporan: data as LaporanPublik, timeline: (tl ?? []) as TimelineItem[], sekarang: Date.now() };
    }
  } catch {
    // lanjut ke data contoh
  }
  const { laporan, timeline, sekarang } = await dataContoh();
  const cocok = laporan.find((l) => l.kode === kode);
  if (!cocok) return null;
  return { sumber: 'contoh', laporan: cocok, timeline: timeline.filter((t) => t.kode === kode), sekarang };
}

/** Hubungan pengguna yang sedang login dengan satu laporan: untuk tombol dukung, batal, dan rating. */
export interface HubunganLaporan {
  login: boolean;
  pemilik: boolean;
  sudahRating: boolean;
  /** Pengguna ini sudah mendukung laporan (RPC sudah_dukung, migrasi 0009). */
  sudahDukung: boolean;
}

export async function ambilHubungan(kode: string): Promise<HubunganLaporan> {
  await connection();
  try {
    const supabase = await createClient();
    const { data: klaim } = await supabase.auth.getClaims();
    const uid = klaim?.claims.sub;
    if (!uid) return { login: false, pemilik: false, sudahRating: false, sudahDukung: false };
    // RLS "pelapor baca miliknya": baris hanya kembali jika laporan ini milik pengguna.
    const { data: milik } = await supabase.from('reports').select('id').eq('kode', kode).eq('user_id', uid).maybeSingle();
    if (!milik) {
      const { data: dukung } = await supabase.rpc('sudah_dukung', { p_kode: kode });
      return { login: true, pemilik: false, sudahRating: false, sudahDukung: dukung === true };
    }
    const { count } = await supabase.from('ratings').select('report_id', { count: 'exact', head: true }).eq('report_id', milik.id);
    return { login: true, pemilik: true, sudahRating: (count ?? 0) > 0, sudahDukung: false };
  } catch {
    return { login: false, pemilik: false, sudahRating: false, sudahDukung: false };
  }
}

/** Satu laporan aktif terverifikasi di isu wilayah tertentu, untuk contoh "Kenapa belum?" di Beranda. */
export async function kodeLaporanUntukIsu(sumber: Sumber, kecamatan: string, kategori: string): Promise<string | null> {
  await connection();
  if (sumber === 'db') {
    try {
      const supabase = await createClient();
      const { data } = await supabase
        .from('v_laporan_publik')
        .select('kode')
        .eq('kecamatan', kecamatan)
        .eq('kategori', kategori)
        .in('status', ['diverifikasi', 'diproses'])
        .order('created_at')
        .limit(1);
      return data?.[0]?.kode ?? null;
    } catch {
      return null;
    }
  }
  const { laporan } = await dataContoh();
  const cocok = laporan
    .filter((l) => l.kecamatan === kecamatan && l.kategori === kategori && l.status !== 'menunggu' && AKTIF.includes(l.status))
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
  return cocok[0]?.kode ?? null;
}

// --- R1 · statistik ringkas Beranda

export async function ambilStatistik(): Promise<{ sumber: Sumber; statistik: StatistikBeranda }> {
  await connection();
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc('stats_beranda');
    if (!error && data && (data as StatistikBeranda).total_laporan > 0) {
      return { sumber: 'db', statistik: data as StatistikBeranda };
    }
  } catch {
    // lanjut ke data contoh
  }
  const { laporan, sekarang } = await dataContoh();
  const selesai = laporan.filter((l) => l.status === 'selesai').length;
  const tidakDitolak = laporan.filter((l) => l.status !== 'ditolak').length;
  const perKategori = new Map<string, number>();
  for (const l of laporan) perKategori.set(l.kategori, (perKategori.get(l.kategori) ?? 0) + 1);
  return {
    sumber: 'contoh',
    statistik: {
      total_laporan: laporan.length,
      persen_selesai: Math.round((1000 * selesai) / tidakDitolak) / 10,
      terlambat_aktif: laporan.filter((l) => terlambat(l, sekarang)).length,
      per_kategori: [...perKategori.entries()]
        .map(([kategori, jumlah]) => ({ kategori, jumlah }))
        .sort((a, b) => b.jumlah - a.jumlah),
      is_simulated: true,
    },
  };
}
