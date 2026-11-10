// lib/data/prioritas.ts — R9, Q5, Q6 dan R8 untuk Server Component (pemilik: A)
// Sampai fungsi priority_factors dan agency_report_card (C) ada di database, halaman memakai
// data contoh di lib/mocks dan menandainya "Data contoh".

import 'server-only';
import { cache } from 'react';
import { connection } from 'next/server';
import contohPrioritas from '@/lib/mocks/contoh-prioritas.json';
import contohRapor from '@/lib/mocks/rapor.json';
import { BOBOT_AWAL, FAKTOR } from '@/lib/scoring';
import { createClient } from './klien';
import type { Bobot, PriorityFactorsResponse, RaporResponse } from '@/lib/types';
import type { Sumber } from './laporan';

export interface RiwayatBobot {
  created_at: string;
  bobot_lama: Bobot;
  bobot_baru: Bobot;
  alasan: string;
  pelaku: string;
}

export interface DataPrioritas {
  sumber: Sumber;
  faktor: PriorityFactorsResponse;
  bobotResmi: Bobot;
  bobotDiperbarui: string | null;
  riwayat: RiwayatBobot[];
}

// Riwayat contoh supaya bagian "Riwayat keputusan" bisa dilihat bentuknya sebelum ada perubahan bobot acuan.
const RIWAYAT_CONTOH: RiwayatBobot[] = [
  {
    created_at: '2026-10-20T09:12:00+07:00',
    bobot_lama: { urgensi: 0.35, volume: 0.2, dukungan: 0.05, umur: 0.15, kerentanan: 0.15, kepadatan: 0.1 },
    bobot_baru: BOBOT_AWAL,
    alasan:
      'Banyak laporan saluran di Jakarta Utara melewati batas waktu menjelang musim hujan. Bobot umur laporan dinaikkan agar isu yang lama tertunda naik.',
    pelaku: 'Perencana · Bappeda Kota (simulasi)',
  },
  {
    created_at: '2026-09-02T14:40:00+07:00',
    bobot_lama: { urgensi: 0.3, volume: 0.3, dukungan: 0.1, umur: 0.15, kerentanan: 0.1, kepadatan: 0.05 },
    bobot_baru: { urgensi: 0.35, volume: 0.2, dukungan: 0.05, umur: 0.15, kerentanan: 0.15, kepadatan: 0.1 },
    alasan:
      'Volume dan dukungan warga terlalu menguntungkan wilayah yang warganya aktif daring. Kerentanan wilayah dinaikkan untuk menyeimbangkan.',
    pelaku: 'Perencana · Bappeda Kota (simulasi)',
  },
];

export const ambilDataPrioritas = cache(async (): Promise<DataPrioritas> => {
  await connection();
  try {
    const supabase = await createClient();
    const [faktor, bobot, riwayat] = await Promise.all([
      supabase.rpc('priority_factors'),
      supabase.from('priority_weights').select('faktor,bobot,updated_at'),
      supabase.from('v_riwayat_bobot').select('*').order('created_at', { ascending: false }).limit(20),
    ]);
    const isu = (faktor.data as PriorityFactorsResponse | null)?.isu;
    if (!faktor.error && Array.isArray(isu)) {
      const baris = (bobot.data ?? []) as { faktor: string; bobot: number; updated_at: string }[];
      const bobotResmi = { ...BOBOT_AWAL };
      for (const b of baris) if ((FAKTOR as string[]).includes(b.faktor)) bobotResmi[b.faktor as keyof Bobot] = Number(b.bobot);
      return {
        sumber: 'db',
        faktor: faktor.data as PriorityFactorsResponse,
        bobotResmi,
        bobotDiperbarui: baris.map((b) => b.updated_at).sort().at(-1) ?? null,
        riwayat: (riwayat.data ?? []) as RiwayatBobot[],
      };
    }
  } catch {
    // lanjut ke data contoh
  }
  return {
    sumber: 'contoh',
    faktor: contohPrioritas as PriorityFactorsResponse,
    bobotResmi: BOBOT_AWAL,
    bobotDiperbarui: RIWAYAT_CONTOH[0].created_at,
    riwayat: RIWAYAT_CONTOH,
  };
});

export const ambilRapor = cache(async (): Promise<{ sumber: Sumber; rapor: RaporResponse }> => {
  await connection();
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc('agency_report_card');
    if (!error && data && (data as RaporResponse).instansi?.length > 0) {
      return { sumber: 'db', rapor: data as RaporResponse };
    }
  } catch {
    // lanjut ke data contoh
  }
  const akhir = new Date();
  const mulai = new Date(akhir.getTime() - 180 * 86400000);
  return { sumber: 'contoh', rapor: { ...contohRapor, periode: { dari: mulai.toISOString(), sampai: akhir.toISOString() } } as RaporResponse };
});
