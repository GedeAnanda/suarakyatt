import { describe, expect, it } from 'vitest';
import { tujuanAman } from '../lib/tujuan-aman';

describe('tujuan redirect setelah login', () => {
  it('meneruskan path internal apa adanya', () => {
    expect(tujuanAman('/laporan/SR-K7W3PA')).toBe('/laporan/SR-K7W3PA');
    expect(tujuanAman('/peta?kategori=1,2#daftar')).toBe('/peta?kategori=1,2#daftar');
  });

  it('menolak tujuan ke situs lain, termasuk yang disamarkan', () => {
    for (const jahat of [
      'https://situs-lain.test',
      '//situs-lain.test',
      '/\\situs-lain.test',
      '/\t/situs-lain.test',
      '/\n/situs-lain.test',
      '/\r\n/situs-lain.test',
      '\\\\situs-lain.test',
      'javascript:alert(1)',
    ]) {
      expect(tujuanAman(jahat, '/aman')).toBe('/aman');
    }
  });

  it('memakai bawaan bila kosong', () => {
    expect(tujuanAman(null)).toBe('/');
    expect(tujuanAman('', '/lapor')).toBe('/lapor');
  });
});
