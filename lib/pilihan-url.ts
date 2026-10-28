/** Parameter yang tidak ada berarti semua; nilai kosong berarti tidak ada yang dipilih. */
export function bacaPilihan<T extends string>(nilai: string | null, semua: readonly T[]): T[] {
  if (nilai === null) return [...semua];
  if (nilai === '') return [];
  const sah = new Set<string>(semua);
  const pilihan = [...new Set(nilai.split(',').filter((x): x is T => sah.has(x)))];
  return pilihan.length ? pilihan : [...semua];
}

export function tulisPilihan<T extends string>(params: URLSearchParams, kunci: string, pilihan: readonly T[], semua: readonly T[]) {
  if (semua.every((x) => pilihan.includes(x))) params.delete(kunci);
  else params.set(kunci, pilihan.join(','));
}

/** History API terintegrasi dengan useSearchParams di Next.js, tanpa meminta ulang data server. */
export function ubahParameter(patch: Record<string, string | null>) {
  const url = new URL(window.location.href);
  for (const [kunci, nilai] of Object.entries(patch)) {
    if (nilai === null) url.searchParams.delete(kunci);
    else url.searchParams.set(kunci, nilai);
  }
  window.history.replaceState(null, '', url);
}
