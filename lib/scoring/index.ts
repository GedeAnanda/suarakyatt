// lib/scoring/index.ts — skor prioritas, simulator, dan "Kenapa belum?" (pemilik: C)
// Acuan: SDD v1.0 bagian 8.3 dan PRD v0.3 bagian 9.
// Fungsi di sini murni (tanpa akses jaringan), jadi mudah dites dan dijelaskan.

import type { Bobot, Faktor, FaktorIsu, KenapaBelum, SkorIsu, StatusLaporan } from '../types';

export const FAKTOR: Faktor[] = ['urgensi', 'volume', 'dukungan', 'umur', 'kerentanan', 'kepadatan'];

/** Faktor yang diubah ke skala 0 sampai 1 dengan min-max antar isu yang sedang dinilai. */
const FAKTOR_MINMAX: Faktor[] = ['volume', 'dukungan', 'kerentanan', 'kepadatan'];

export const BOBOT_AWAL: Bobot = {
  urgensi: 0.3,
  volume: 0.2,
  dukungan: 0.05,
  umur: 0.2,
  kerentanan: 0.15,
  kepadatan: 0.1,
};

export type NamaPreset = 'keselamatan' | 'kerentanan' | 'suara_warga';

export const PRESET: Record<NamaPreset, Bobot> = {
  keselamatan: { urgensi: 0.4, volume: 0.15, dukungan: 0, umur: 0.3, kerentanan: 0.1, kepadatan: 0.05 },
  kerentanan: { urgensi: 0.2, volume: 0.15, dukungan: 0.05, umur: 0.15, kerentanan: 0.3, kepadatan: 0.15 },
  suara_warga: { urgensi: 0.2, volume: 0.35, dukungan: 0.15, umur: 0.15, kerentanan: 0.1, kepadatan: 0.05 },
};

export const LABEL_PRESET: Record<NamaPreset, string> = {
  keselamatan: 'Utamakan keselamatan',
  kerentanan: 'Utamakan kerentanan sosial',
  suara_warga: 'Utamakan suara warga',
};

export const LABEL_FAKTOR: Record<Faktor, string> = {
  urgensi: 'urgensi kategori',
  volume: 'banyak laporan terverifikasi',
  dukungan: 'dukungan warga',
  umur: 'laporan lama melewati batas waktu',
  kerentanan: 'kerentanan wilayah',
  kepadatan: 'kepadatan penduduk',
};

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/** Format angka satu desimal dengan koma, misalnya 73,5. */
export const formatPoin = (x: number) =>
  (Math.round(x * 10) / 10).toLocaleString('id-ID', { maximumFractionDigits: 1 });

/** Bagi setiap bobot dengan jumlahnya sehingga total 1. Nilai negatif dianggap 0. */
export function normalisasiBobot(b: Bobot): Bobot {
  const bersih = FAKTOR.map((f) => (Number.isFinite(b[f]) ? Math.max(0, b[f]) : 0));
  const total = bersih.reduce((s, x) => s + x, 0);
  if (total <= 0) throw new Error('BOBOT_TIDAK_VALID');
  return Object.fromEntries(FAKTOR.map((f, i) => [f, bersih[i] / total])) as Bobot;
}

/** Bobot yang benar-benar dipakai: di mode crm (umur null), bobot umur dijadikan 0. */
export function bobotEfektif(isu: FaktorIsu[], bobot: Bobot): Bobot {
  const umurKosong = isu.some((i) => i.mentah.umur === null);
  return normalisasiBobot(umurKosong ? { ...bobot, umur: 0 } : bobot);
}

function jelaskan(h: SkorIsu): string {
  const [f1, f2] = [...FAKTOR].sort((a, b) => h.kontribusi[b] - h.kontribusi[a]);
  return (
    `Skor ${formatPoin(h.skor)}: terutama karena ${LABEL_FAKTOR[f1]} (${formatPoin(h.kontribusi[f1])} poin) ` +
    `dan ${LABEL_FAKTOR[f2]} (${formatPoin(h.kontribusi[f2])} poin).`
  );
}

/** Hitung skor, kontribusi, peringkat, dan kalimat penjelasan untuk setiap isu wilayah. */
export function hitungSkor(isu: FaktorIsu[], bobot: Bobot): SkorIsu[] {
  if (isu.length === 0) return [];
  const w = bobotEfektif(isu, bobot);

  const rentang = {} as Record<Faktor, { min: number; max: number }>;
  for (const f of FAKTOR_MINMAX) {
    const nilai = isu.map((i) => i.mentah[f] ?? 0);
    rentang[f] = { min: Math.min(...nilai), max: Math.max(...nilai) };
  }
  const tidakMembedakan = FAKTOR_MINMAX.filter((f) => rentang[f].max === rentang[f].min);

  const hasil: SkorIsu[] = isu.map((i) => {
    const nilai01 = {} as Record<Faktor, number>;
    nilai01.urgensi = clamp01(i.mentah.urgensi ?? 0);
    nilai01.umur = clamp01((i.mentah.umur ?? 0) / 2);
    for (const f of FAKTOR_MINMAX) {
      const { min, max } = rentang[f];
      nilai01[f] = max === min ? 0 : ((i.mentah[f] ?? 0) - min) / (max - min);
    }
    const kontribusi = {} as Record<Faktor, number>;
    let skor = 0;
    for (const f of FAKTOR) {
      kontribusi[f] = 100 * w[f] * nilai01[f];
      skor += kontribusi[f];
    }
    return {
      ...i,
      nilai01,
      kontribusi,
      skor,
      peringkat: 0,
      faktor_tidak_membedakan: tidakMembedakan,
      penjelasan: '',
    };
  });

  hasil.sort(
    (a, b) =>
      b.skor - a.skor ||
      b.laporan_terverifikasi - a.laporan_terverifikasi ||
      a.kode_wilayah.localeCompare(b.kode_wilayah) ||
      a.category_id - b.category_id,
  );
  hasil.forEach((h, idx) => {
    h.peringkat = idx + 1;
    h.penjelasan = jelaskan(h);
  });
  return hasil;
}

/** Selisih posisi per isu: positif = naik dibanding peringkat resmi. */
export function selisihPeringkat(resmi: SkorIsu[], simulasi: SkorIsu[]): Record<string, number> {
  const posisiResmi = new Map(resmi.map((s) => [s.id, s.peringkat]));
  const hasil: Record<string, number> = {};
  for (const s of simulasi) {
    const r = posisiResmi.get(s.id);
    if (r !== undefined) hasil[s.id] = r - s.peringkat;
  }
  return hasil;
}

function ringkasPerKota(daftar: SkorIsu[]): string {
  const hitung = new Map<string, number>();
  for (const s of daftar) hitung.set(s.kota, (hitung.get(s.kota) ?? 0) + 1);
  const bagian = [...hitung.entries()].map(([kota, n]) => `${n} isu di ${kota}`);
  return bagian.length <= 1 ? bagian.join('') : `${bagian.slice(0, -1).join(', ')} dan ${bagian.at(-1)}`;
}

/** Kalimat ringkas tentang perubahan anggota n besar akibat bobot simulasi. */
export function kalimatKonsekuensi(resmi: SkorIsu[], simulasi: SkorIsu[], n = 10): string {
  const atasResmi = new Set(resmi.filter((s) => s.peringkat <= n).map((s) => s.id));
  const atasSimulasi = new Set(simulasi.filter((s) => s.peringkat <= n).map((s) => s.id));
  const masuk = simulasi.filter((s) => atasSimulasi.has(s.id) && !atasResmi.has(s.id));
  const keluar = resmi.filter((s) => atasResmi.has(s.id) && !atasSimulasi.has(s.id));

  if (masuk.length === 0) {
    const selisih = selisihPeringkat(resmi, simulasi);
    const bergeser = [...atasResmi].some((id) => (selisih[id] ?? 0) !== 0);
    return bergeser
      ? `Dengan bobot ini, anggota ${n} besar tetap sama, tapi urutannya berubah.`
      : `Dengan bobot ini, ${n} besar tidak berubah.`;
  }
  return `Dengan bobot ini, ${ringkasPerKota(masuk)} masuk ${n} besar, dan ${ringkasPerKota(keluar)} keluar.`;
}

/** Data untuk panel "Kenapa belum?" di halaman detail laporan. */
export function kenapaBelum(
  isuId: string,
  isu: FaktorIsu[],
  bobotResmi: Bobot,
  status: StatusLaporan,
): KenapaBelum {
  const resmi = hitungSkor(isu, bobotResmi);
  const target = resmi.find((s) => s.id === isuId);
  if (!target) throw new Error('ISU_TIDAK_DINILAI');

  const w = bobotEfektif(isu, bobotResmi);
  const aktif = FAKTOR.filter((f) => w[f] > 0);

  const pendorongF = [...aktif].sort((a, b) => target.kontribusi[b] - target.kontribusi[a])[0];
  const penahanF = [...aktif].sort(
    (a, b) => 100 * w[b] - target.kontribusi[b] - (100 * w[a] - target.kontribusi[a]),
  )[0];

  const per_preset = (Object.keys(PRESET) as NamaPreset[]).map((nama) => ({
    preset: LABEL_PRESET[nama],
    peringkat: hitungSkor(isu, PRESET[nama]).find((s) => s.id === isuId)?.peringkat ?? 0,
  }));

  return {
    peringkat: target.peringkat,
    total: resmi.length,
    pendorong: { faktor: pendorongF, poin: target.kontribusi[pendorongF] },
    penahan: { faktor: penahanF, poin: target.kontribusi[penahanF], maksimal: 100 * w[penahanF] },
    per_preset,
    catatan:
      status === 'menunggu'
        ? 'Laporan ini belum diverifikasi, jadi belum dihitung di faktor volume. Laporan ini tetap dihitung di faktor umur laporan.'
        : null,
  };
}
