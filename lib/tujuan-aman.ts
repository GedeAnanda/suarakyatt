// lib/tujuan-aman.ts — validasi tujuan redirect setelah login (pemilik: B)

const ASAL_UJI = 'https://suarakyat.invalid';

/**
 * Hanya terima path internal supaya parameter ?lanjut= tidak bisa dipakai untuk mengarahkan pengguna ke situs
 * lain (open redirect). Memeriksa awalan "//" atau "/\" saja tidak cukup: browser membuang tab dan baris baru
 * dari URL, jadi "/\t/situs-lain" dibaca "//situs-lain". Karena itu masukan diurai sebagai URL lalu asalnya
 * dibandingkan, dan yang dikembalikan selalu hasil uraian (path + query + hash), bukan teks mentahnya.
 */
export function tujuanAman(lanjut: string | null | undefined, bawaan = '/'): string {
  if (!lanjut || !lanjut.startsWith('/') || lanjut.startsWith('//') || lanjut.startsWith('/\\')) return bawaan;
  try {
    const url = new URL(lanjut, ASAL_UJI);
    if (url.origin !== ASAL_UJI) return bawaan;
    return url.pathname + url.search + url.hash;
  } catch {
    return bawaan;
  }
}
