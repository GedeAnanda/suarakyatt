// components/ui/KelompokCair.tsx — grup tombol dengan tetesan air yang mengalir ke pilihan aktif (pemilik: A)
// Diadaptasi dari "Liquid Navbar · Waterline" (Nimbus UI): saat pilihan berganti, tetesan meregang ke arah item baru,
// pecah menjadi butiran kalau lompatannya jauh, lalu menyatu kembali dengan riak. Bedanya dengan aslinya:
// - Bentuknya persegi panjang bersudut seperti tombol situs ini, bukan pil, dan berwarna teal muda.
// - Tanpa WebGL (aslinya satu konteks WebGL per grup): tetesan berupa elemen biasa yang digabung filter SVG "goo"
//   (#cair-goo, dipasang EfekCair) dan dicampur multiply, jadi teks di bawahnya tetap gelap dan terbaca.
// - Bergerak dua arah (x dan y), jadi bisa dipakai di menu samping yang tegak dan di deret chip yang terlipat.
// Item aktif dikenali dari atributnya (aria-pressed, aria-selected, aria-current, radio terpilih) atau dari alamat
// halaman (aktifDariAlamat, untuk tautan header). Lebih dari satu yang aktif (saringan pilihan ganda) = tanpa tetesan.
// Cahaya kursor, riak saat ditekan, dan animasi ikon diurus EfekCair untuk semua tombol sekaligus.
// Gerak dikurangi: tetesan langsung pindah tanpa regang, butiran, atau riak.

'use client';

import { useEffect, useRef, type HTMLAttributes, type ReactNode, type RefObject } from 'react';

const ITEM = 'a[href], button, label';
const AKTIF = '[aria-pressed="true"], [aria-selected="true"], [aria-current="page"], label:has(input:checked)';

type Tubuh = { x: number; y: number; vx: number; vy: number };
type Butir = { x: number; y: number; vx: number; vy: number; r: number; k: number; el: HTMLSpanElement };

const terlihat = (el: HTMLElement) => el.offsetWidth > 0 && el.getClientRects().length > 0;

export default function KelompokCair({
  as = 'div',
  aktifDariAlamat = false,
  className = '',
  children,
  ...props
}: HTMLAttributes<HTMLElement> & {
  as?: 'div' | 'nav';
  /** Item aktif = tautan yang alamatnya sama dengan halaman sekarang (untuk tautan tanpa aria-current). */
  aktifDariAlamat?: boolean;
  children: ReactNode;
}) {
  const wadahRef = useRef<HTMLElement>(null);
  const tetesRef = useRef<HTMLSpanElement>(null);
  const riakRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const wadah = wadahRef.current;
    const lapis = tetesRef.current;
    const lapisRiak = riakRef.current;
    if (!wadah || !lapis || !lapisRiak) return;
    const hemat = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const buat = (kelas: string) => {
      const el = document.createElement('span');
      el.className = kelas;
      lapis.appendChild(el);
      return el;
    };
    const kepalaEl = buat('cair-tetes');
    const ekorEl = buat('cair-tetes');
    const leherEl = buat('cair-tetes');

    // Dua tubuh pegas (kepala dan ekor tetesan), seperti di komponen aslinya, tetapi dua arah.
    const a: Tubuh = { x: 0, y: 0, vx: 0, vy: 0 };
    const b: Tubuh = { x: 0, y: 0, vx: 0, vy: 0 };
    const tuju = { x: 0, y: 0, w: 0, h: 0, r: 8 };
    const ukuran = { w: 0, h: 0 };
    let depan: 0 | 1 = 0;
    let tundaEkor = 0;
    let butir: Butir[] = [];
    let siap = false;
    let ada = false;
    let gerak = false;
    let pecah = false;
    let raf = 0;
    let akhir = 0;

    const cariAktif = (): HTMLElement | null => {
      // Isi menu turun (misalnya "Laporan instansi" di menu akun) bukan bagian deret: tetesan akan nyangkut di sana.
      const calon = [...wadah.querySelectorAll<HTMLElement>(ITEM)].filter((el) => terlihat(el) && !el.closest('.turun-panel'));
      if (aktifDariAlamat) {
        const jalur = window.location.pathname;
        const cocok = calon.filter(
          (el): el is HTMLAnchorElement =>
            el instanceof HTMLAnchorElement &&
            el.origin === window.location.origin &&
            (el.pathname === jalur || (el.pathname !== '/' && jalur.startsWith(`${el.pathname}/`))),
        );
        return cocok.sort((x, y) => y.pathname.length - x.pathname.length)[0] ?? null;
      }
      const aktif = calon.filter((el) => el.matches(AKTIF));
      return aktif.length === 1 ? aktif[0] : null;
    };

    const kotak = (el: HTMLElement, x: number, y: number, w: number, h: number, r: number, sx = 1, sy = 1) => {
      el.style.width = `${w}px`;
      el.style.height = `${h}px`;
      el.style.borderRadius = `${r}px`;
      el.style.transform = `translate(${x - w / 2}px, ${y - h / 2}px) scale(${sx}, ${sy})`;
    };

    const gambar = () => {
      const kepala = depan === 0 ? a : b;
      const ekor = depan === 0 ? b : a;
      const dx = kepala.x - ekor.x;
      const dy = kepala.y - ekor.y;
      const jarak = Math.hypot(dx, dy);
      const tipis = Math.min(jarak / Math.max(ukuran.w, ukuran.h, 1), 1);
      // Kepala memanjang ke arah geraknya dan memipih di arah lain.
      const regang = Math.min(Math.hypot(kepala.vx, kepala.vy) / 2600, 0.22);
      const datar = Math.abs(kepala.vx) >= Math.abs(kepala.vy);
      kotak(kepalaEl, kepala.x, kepala.y, ukuran.w, ukuran.h, tuju.r, datar ? 1 + regang : 1 - regang / 2, datar ? 1 - regang / 2 : 1 + regang);
      // Ekor mengecil makin jauh tertinggal.
      const kecil = 1 - 0.55 * tipis;
      kotak(ekorEl, ekor.x, ekor.y, ukuran.w * kecil, ukuran.h * kecil, tuju.r * kecil);
      // Leher menyambung kepala dan ekor sampai putus (pecah menjadi butiran).
      if (!pecah && jarak > 2) {
        const tebal = Math.min(ukuran.w, ukuran.h) * (0.6 - 0.3 * tipis);
        leherEl.style.width = `${jarak}px`;
        leherEl.style.height = `${tebal}px`;
        leherEl.style.borderRadius = `${tebal / 2}px`;
        leherEl.style.transform = `translate(${(kepala.x + ekor.x) / 2 - jarak / 2}px, ${(kepala.y + ekor.y) / 2 - tebal / 2}px) rotate(${Math.atan2(dy, dx)}rad)`;
        leherEl.style.opacity = '1';
      } else {
        leherEl.style.opacity = '0';
      }
      for (const d of butir) {
        d.el.style.width = `${d.r * 2}px`;
        d.el.style.height = `${d.r * 2}px`;
        d.el.style.borderRadius = '50%';
        d.el.style.transform = `translate(${d.x - d.r}px, ${d.y - d.r}px)`;
      }
    };

    const riak = (kuat: number) => {
      const el = document.createElement('span');
      el.className = 'cair-riak';
      el.style.left = `${tuju.x - tuju.w / 2}px`;
      el.style.top = `${tuju.y - tuju.h / 2}px`;
      el.style.width = `${tuju.w}px`;
      el.style.height = `${tuju.h}px`;
      el.style.borderRadius = `${tuju.r}px`;
      el.style.opacity = String(kuat);
      lapisRiak.appendChild(el);
      el.addEventListener('animationend', () => el.remove(), { once: true });
    };

    const langkah = (dt: number, kini: number) => {
      ukuran.w += (tuju.w - ukuran.w) * Math.min(1, dt * 12);
      ukuran.h += (tuju.h - ukuran.h) * Math.min(1, dt * 12);
      let diam = true;
      [a, b].forEach((B, i) => {
        const memimpin = i === depan;
        const k = memimpin ? 210 : 72;
        const c = memimpin ? 25 : 13;
        const f = !memimpin && kini < tundaEkor ? 0.08 : 1;
        B.vx += (k * (tuju.x - B.x) - c * B.vx) * dt * f;
        B.vy += (k * (tuju.y - B.y) - c * B.vy) * dt * f;
        B.x += B.vx * dt;
        B.y += B.vy * dt;
        if (Math.hypot(tuju.x - B.x, tuju.y - B.y) > 0.3 || Math.hypot(B.vx, B.vy) > 3) diam = false;
      });
      // Lompatan jauh: leher putus menjadi tiga butiran yang ikut mengalir lalu menyatu di tujuan.
      const kepala = depan === 0 ? a : b;
      const ekor = depan === 0 ? b : a;
      if (!pecah && gerak && Math.hypot(kepala.x - ekor.x, kepala.y - ekor.y) > Math.max(ukuran.w, ukuran.h) * 0.9) {
        pecah = true;
        [0.3, 0.5, 0.72].forEach((t, j) => {
          butir.push({
            x: ekor.x + (kepala.x - ekor.x) * t + (Math.random() - 0.5) * 6,
            y: ekor.y + (kepala.y - ekor.y) * t + (Math.random() - 0.5) * 6,
            vx: (ekor.vx + kepala.vx) * 0.45,
            vy: (ekor.vy + kepala.vy) * 0.45 + (Math.random() - 0.5) * 60,
            r: 4 + Math.random() * 2.5 - j * 0.4,
            k: 70 + Math.random() * 90,
            el: buat('cair-tetes'),
          });
        });
      }
      butir = butir.filter((d) => {
        d.vx += (d.k * (tuju.x - d.x) - 9 * d.vx) * dt;
        d.vy += (d.k * (tuju.y - d.y) - 9 * d.vy) * dt;
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        if (Math.hypot(tuju.x - d.x, tuju.y - d.y) < Math.min(ukuran.w, ukuran.h) * 0.6) d.r -= dt * 26;
        if (d.r > 0.6) return true;
        d.el.remove();
        return false;
      });
      if (butir.length) diam = false;
      if (gerak && diam) {
        gerak = false;
        riak(pecah ? 1 : 0.7);
      }
    };

    const mulai = () => {
      if (raf) return;
      akhir = performance.now();
      const detak = (kini: number) => {
        const dt = Math.min((kini - akhir) / 1000, 1 / 30);
        akhir = kini;
        langkah(dt, kini);
        gambar();
        const masihBerubah = Math.abs(ukuran.w - tuju.w) > 0.3 || Math.abs(ukuran.h - tuju.h) > 0.3;
        raf = gerak || butir.length || masihBerubah ? requestAnimationFrame(detak) : 0;
      };
      raf = requestAnimationFrame(detak);
    };

    // lompat: taruh tetesan langsung di tujuan (pertama kali, ukuran wadah berubah, atau gerak dikurangi).
    const ukur = (lompat = false) => {
      const el = cariAktif();
      const tadi = ada;
      ada = el !== null;
      wadah.toggleAttribute('data-tetes', ada);
      lapis.style.opacity = ada ? '1' : '0';
      if (!el) return;
      const rw = wadah.getBoundingClientRect();
      const re = el.getBoundingClientRect();
      const x = re.left - rw.left + re.width / 2;
      const y = re.top - rw.top + re.height / 2;
      tuju.w = re.width;
      tuju.h = re.height;
      tuju.r = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 8;
      if (!siap || lompat || !tadi || hemat) {
        Object.assign(a, { x, y, vx: 0, vy: 0 });
        Object.assign(b, { x, y, vx: 0, vy: 0 });
        ukuran.w = re.width;
        ukuran.h = re.height;
        tuju.x = x;
        tuju.y = y;
        for (const d of butir) d.el.remove();
        butir = [];
        gerak = false;
        siap = true;
        gambar();
        return;
      }
      if (Math.hypot(x - tuju.x, y - tuju.y) > 0.5) {
        depan = Math.hypot(x - a.x, y - a.y) <= Math.hypot(x - b.x, y - b.y) ? 0 : 1;
        tundaEkor = performance.now() + 70;
        gerak = true;
        pecah = false;
      }
      tuju.x = x;
      tuju.y = y;
      mulai();
    };

    // Pilihan berganti (atribut) = tetesan mengalir; isi grup berubah (elemen baru) = tetesan langsung pindah.
    const mo = new MutationObserver((daftar) => {
      const luar = daftar.filter((m) => !lapis.contains(m.target) && !lapisRiak.contains(m.target));
      if (luar.length) ukur(luar.some((m) => m.type === 'childList'));
    });
    mo.observe(wadah, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['aria-pressed', 'aria-selected', 'aria-current'],
    });
    const radioBerubah = () => ukur();
    wadah.addEventListener('change', radioBerubah);
    let lebarTadi = -1;
    let tinggiTadi = -1;
    const ro = new ResizeObserver(() => {
      if (wadah.offsetWidth === lebarTadi && wadah.offsetHeight === tinggiTadi) return;
      lebarTadi = wadah.offsetWidth;
      tinggiTadi = wadah.offsetHeight;
      ukur(true);
    });
    ro.observe(wadah);
    // Tautan header: alamat berganti tanpa atribut apa pun yang berubah. Navigation API memberi tahu setiap
    // pergantian halaman (termasuk pushState Next.js); popstate untuk browser tanpa API itu.
    const navigasi = (window as { navigation?: EventTarget }).navigation;
    const alamatBerubah = () => ukur();
    if (aktifDariAlamat) {
      navigasi?.addEventListener('currententrychange', alamatBerubah);
      window.addEventListener('popstate', alamatBerubah);
    }
    // Huruf yang selesai dimuat bisa menggeser item tanpa mengubah ukuran wadah.
    let hidup = true;
    void document.fonts?.ready.then(() => hidup && ukur(true));
    ukur(true);

    return () => {
      hidup = false;
      cancelAnimationFrame(raf);
      mo.disconnect();
      ro.disconnect();
      wadah.removeEventListener('change', radioBerubah);
      navigasi?.removeEventListener('currententrychange', alamatBerubah);
      window.removeEventListener('popstate', alamatBerubah);
      wadah.removeAttribute('data-tetes');
      lapis.replaceChildren();
      lapisRiak.replaceChildren();
    };
  }, [aktifDariAlamat]);

  const isi = (
    <>
      {children}
      <span ref={tetesRef} aria-hidden="true" className="cair-lapis" />
      <span ref={riakRef} aria-hidden="true" className="cair-lapis-riak" />
    </>
  );
  const kelas = `kelompok-cair ${className}`;

  // Dua cabang JSX, bukan createElement(as, { ref }), supaya aturan react-hooks/refs tidak mengira ref dibaca saat render.
  return as === 'nav' ? (
    <nav ref={wadahRef} className={kelas} {...props}>
      {isi}
    </nav>
  ) : (
    <div ref={wadahRef as RefObject<HTMLDivElement>} className={kelas} {...props}>
      {isi}
    </div>
  );
}
