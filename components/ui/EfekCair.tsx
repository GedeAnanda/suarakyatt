// components/ui/EfekCair.tsx — efek air untuk semua tombol pilihan dan tombol bertepi (pemilik: A)
// Diadaptasi dari "Liquid Navbar · Waterline" (Nimbus UI), dipasang sekali di layout dan berlaku di semua halaman:
// - kursor "mengangkat permukaan air": cahaya teal lembut mengikuti kursor di dalam tombol (variabel --mx/--my,
//   digambar di globals.css);
// - riak teal menyebar dari titik tekan, dipotong mengikuti sudut tombol;
// - ikon memainkan adegan kecil saat diklik, dipilih dari jenis ikonnya (rumah melompat, peta berputar, dst.).
// Sasarannya: .chip, .cair (tombol bertepi, tombol Kembali), dan semua tombol di dalam KelompokCair.
// Juga memasang filter SVG #cair-goo yang menyatukan tetesan KelompokCair menjadi satu genangan.
// Riak dan animasi ikon tidak jalan kalau pengguna meminta gerak dikurangi.

'use client';

import { useEffect } from 'react';

const SASARAN = '.chip, .cair, .kelompok-cair a[href], .kelompok-cair button, .kelompok-cair label';

// Adegan ikon menurut kelas ikon Lucide; ikon lain melompat kecil.
const ADEGAN: [string, string][] = [
  ['lucide-house', 'lompat'],
  ['lucide-sliders-horizontal', 'lambai'],
  ['lucide-award', 'putar'],
  ['lucide-map', 'putar'],
  ['lucide-circle-plus', 'letup'],
  ['lucide-file-search', 'tetes'],
  ['lucide-info', 'letup'],
  ['lucide-book-open', 'lambai'],
  ['lucide-database', 'tetes'],
  ['lucide-circle-question-mark', 'putar'],
  ['lucide-search', 'putar'],
  ['lucide-chevron-left', 'kiri'],
  ['lucide-chevron-right', 'kanan'],
  ['lucide-copy', 'letup'],
  ['lucide-share', 'tetes'],
];

export default function EfekCair() {
  useEffect(() => {
    const hemat = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const sasaran = (t: EventTarget | null) =>
      t instanceof Element ? (t.closest(SASARAN) as HTMLElement | null) : null;

    // Cahaya kursor: posisi kursor di dalam tombol disimpan sebagai variabel CSS, sekali per frame.
    let tunda = 0;
    let terakhir: PointerEvent | null = null;
    const gerak = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      terakhir = e;
      if (tunda) return;
      tunda = requestAnimationFrame(() => {
        tunda = 0;
        const ev = terakhir;
        const el = sasaran(ev?.target ?? null);
        if (!ev || !el) return;
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', `${ev.clientX - r.left}px`);
        el.style.setProperty('--my', `${ev.clientY - r.top}px`);
      });
    };

    // Riak: lapisan fixed di atas tombol (di luar pohon React), dipotong mengikuti sudut tombol.
    const tekan = (e: PointerEvent) => {
      if (e.button !== 0 || hemat()) return;
      const el = sasaran(e.target);
      if (!el || el.matches(':disabled, [aria-disabled="true"]')) return;
      const r = el.getBoundingClientRect();
      const bingkai = document.createElement('span');
      bingkai.className = 'riak-tekan';
      bingkai.style.left = `${r.left}px`;
      bingkai.style.top = `${r.top}px`;
      bingkai.style.width = `${r.width}px`;
      bingkai.style.height = `${r.height}px`;
      bingkai.style.borderRadius = getComputedStyle(el).borderRadius;
      const jari = Math.hypot(Math.max(e.clientX - r.left, r.right - e.clientX), Math.max(e.clientY - r.top, r.bottom - e.clientY));
      const titik = document.createElement('span');
      titik.style.left = `${e.clientX - r.left - jari}px`;
      titik.style.top = `${e.clientY - r.top - jari}px`;
      titik.style.width = `${jari * 2}px`;
      titik.style.height = `${jari * 2}px`;
      bingkai.appendChild(titik);
      document.body.appendChild(bingkai);
      titik.addEventListener('animationend', () => bingkai.remove(), { once: true });
      window.setTimeout(() => bingkai.remove(), 1200);
    };

    // Adegan ikon saat diklik.
    const klik = (e: MouseEvent) => {
      if (hemat()) return;
      const el = sasaran(e.target);
      const ikon = el?.querySelector('svg');
      if (!el || !ikon) return;
      const kelas = ikon.getAttribute('class') ?? '';
      const adegan = el.dataset.fx ?? ADEGAN.find(([k]) => kelas.split(/\s+/).includes(k))?.[1] ?? 'lompat';
      ikon.removeAttribute('data-fx');
      void ikon.getBoundingClientRect(); // mulai ulang animasi kalau diklik berturut-turut
      ikon.setAttribute('data-fx', adegan);
      ikon.addEventListener('animationend', () => ikon.removeAttribute('data-fx'), { once: true });
    };

    document.addEventListener('pointermove', gerak, { passive: true });
    document.addEventListener('pointerdown', tekan);
    document.addEventListener('click', klik);
    return () => {
      cancelAnimationFrame(tunda);
      document.removeEventListener('pointermove', gerak);
      document.removeEventListener('pointerdown', tekan);
      document.removeEventListener('click', klik);
    };
  }, []);

  // Filter "goo": kabur lalu dipertegas lagi, jadi tetesan yang berdekatan menyatu seperti air.
  return (
    <svg width="0" height="0" aria-hidden="true" className="absolute">
      <filter id="cair-goo" x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
        <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="kabur" />
        <feColorMatrix in="kabur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8" result="genangan" />
        <feComposite in="SourceGraphic" in2="genangan" operator="atop" />
      </filter>
    </svg>
  );
}
