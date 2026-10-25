// lib/tujuan-aman.ts — validasi tujuan redirect setelah login (pemilik: B)

/**
 * Hanya terima path internal (diawali "/" tapi bukan "//" atau "/\") supaya parameter
 * ?lanjut= tidak bisa dipakai untuk mengarahkan pengguna ke situs lain (open redirect).
 */
export function tujuanAman(lanjut: string | null | undefined, bawaan = '/'): string {
  if (!lanjut || !lanjut.startsWith('/') || lanjut.startsWith('//') || lanjut.startsWith('/\\')) return bawaan;
  return lanjut;
}
