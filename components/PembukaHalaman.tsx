'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/** Mulai setelah mount, termasuk judul yang datang belakangan lewat streaming. */
export default function PembukaHalaman({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pernah = new WeakSet<Element>();
    const animasi = new Set<Animation>();
    let frame = 0;

    function tampilkan() {
      if (!el) return;
      for (const node of el.querySelectorAll<HTMLElement>('[data-pembuka]')) {
        if (pernah.has(node)) continue;
        pernah.add(node);
        if (media.matches || window.location.hash) continue;
        const rect = node.getBoundingClientRect();
        if (rect.bottom <= 0 || rect.top >= window.innerHeight) continue;
        const jenis = node.dataset.pembuka;
        const hero = jenis === 'baris';
        const delay = Number(node.dataset.jeda ?? (jenis === 'teks' ? 140 : jenis === 'aksi' ? 260 : 0));
        const gerak = node.animate(
          [
            { opacity: hero ? 0.15 : 0, transform: hero ? 'translateY(95%)' : 'translateY(22px)' },
            { opacity: 1, transform: 'translateY(0)' },
          ],
          { duration: hero ? 1100 : 720, delay, easing: 'cubic-bezier(.22, 1, .36, 1)', fill: 'backwards' },
        );
        animasi.add(gerak);
        gerak.finished.then(() => animasi.delete(gerak), () => animasi.delete(gerak));
      }
    }

    function jadwalkan() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(tampilkan);
    }
    function kurangiGerak() {
      if (media.matches) {
        for (const gerak of animasi) gerak.cancel();
        animasi.clear();
      }
    }

    // Tidak menyembunyikan HTML sebelum JavaScript siap; tanpa JS tetap bisa dibaca.
    const observer = new MutationObserver(jadwalkan);
    observer.observe(el, { childList: true, subtree: true });
    media.addEventListener('change', kurangiGerak);
    jadwalkan();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      media.removeEventListener('change', kurangiGerak);
      for (const gerak of animasi) gerak.cancel();
    };
  }, []);

  return <div ref={root} className="contents">{children}</div>;
}
