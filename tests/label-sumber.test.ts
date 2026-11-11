import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import BannerSimulasi from '../components/BannerSimulasi';
import LabelSumber from '../components/ui/LabelSumber';

it('menjelaskan cadangan tersimpan pada banner dan label ringkas', () => {
  const banner = renderToStaticMarkup(createElement(BannerSimulasi, { sumber: 'contoh' }));
  const label = renderToStaticMarkup(createElement(LabelSumber, { sumber: 'contoh', ringkas: true }));
  expect(banner).toContain('Koneksi data belum tersedia');
  expect(label).toContain('Data buatan · contoh tersimpan');
  expect(label).toContain('Data terbaru belum tersedia');
});

it('tetap menandai data database sebagai simulasi tanpa peringatan koneksi', () => {
  const banner = renderToStaticMarkup(createElement(BannerSimulasi, { sumber: 'db' }));
  const label = renderToStaticMarkup(createElement(LabelSumber, { sumber: 'db', ringkas: true }));
  expect(banner).not.toContain('Koneksi data belum tersedia');
  expect(label).toContain('Data buatan');
  expect(label).not.toContain('Data terbaru belum tersedia');
});
