import { describe, expect, it } from 'vitest';
import { bacaPilihan, tulisPilihan } from '../lib/pilihan-url';

const kategori = ['1', '2', '3', '4'] as const;

describe('filter yang dapat dibagikan', () => {
  it('membedakan semua kategori dengan tidak ada kategori, termasuk setelah reload', () => {
    for (const pilihan of [[], ['2'], ['1', '3'], [...kategori]]) {
      const params = new URLSearchParams('status=menunggu');
      tulisPilihan(params, 'kategori', pilihan, kategori);
      const setelahReload = new URL(`https://contoh.test/peta?${params}`).searchParams;
      expect(bacaPilihan(setelahReload.get('kategori'), kategori)).toEqual(pilihan);
      expect(setelahReload.get('status')).toBe('menunggu');
    }
  });

  it('mengabaikan nilai asing dan duplikat dari tautan', () => {
    expect(bacaPilihan('1,1,asing,3', kategori)).toEqual(['1', '3']);
    expect(bacaPilihan('asing', kategori)).toEqual([...kategori]);
    expect(bacaPilihan(null, kategori)).toEqual([...kategori]);
  });
});
