// components/TombolDemo.tsx — "Coba sebagai warga/admin demo" (FR-A2, SDD 6.6 A1), pemilik: A

'use client';

import { useState } from 'react';
import { tujuanAman } from '@/lib/tujuan-aman';
import { Tombol, type VarianTombol } from './ui/Tombol';

type Peran = 'warga' | 'admin';

const PESAN: Record<string, string> = {
  DEMO_BELUM_DIATUR: 'Akun demo belum diatur di server. Hubungi tim.',
  LOGIN_DEMO_GAGAL: 'Akun demo sedang tidak bisa dipakai. Coba lagi sebentar lagi.',
};

/**
 * Datang dari /masuk?lanjut=... (misalnya "Masuk untuk mendukung" di halaman laporan): kembali ke halaman itu,
 * bukan ke tujuan bawaan peran (/lapor atau /admin/laporan). Rute admin hanya untuk admin demo.
 */
function tujuanSetelahDemo(peran: Peran, bawaan: string): string {
  const lanjut = tujuanAman(new URLSearchParams(window.location.search).get('lanjut'), '');
  if (!lanjut || lanjut === '/') return bawaan;
  const keAdmin = lanjut === '/admin' || lanjut.startsWith('/admin/');
  return keAdmin === (peran === 'admin') ? lanjut : bawaan;
}

export default function TombolDemo({
  varianWarga = 'utama',
  varianAdmin = 'kedua',
  className = '',
}: {
  varianWarga?: VarianTombol;
  varianAdmin?: VarianTombol;
  className?: string;
}) {
  const [memuat, setMemuat] = useState<Peran | null>(null);
  const [galat, setGalat] = useState<string | null>(null);

  async function masuk(peran: Peran) {
    setMemuat(peran);
    setGalat(null);
    try {
      const res = await fetch('/api/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ peran }),
      });
      const hasil = (await res.json().catch(() => ({}))) as { redirect?: string; error?: string };
      if (!res.ok || !hasil.redirect) throw new Error(hasil.error ?? 'LOGIN_DEMO_GAGAL');
      // Navigasi penuh, bukan router.push: selagi masih tamu, tautan /lapor sudah di-prefetch dan hasilnya (redirect
      // ke /masuk) tersimpan di cache router. Cookie sesi ditulis route handler, jadi cache itu tidak ikut dibersihkan.
      window.location.assign(tujuanSetelahDemo(peran, hasil.redirect));
    } catch (err) {
      setGalat(PESAN[err instanceof Error ? err.message : ''] ?? PESAN.LOGIN_DEMO_GAGAL);
      setMemuat(null);
    }
  }

  return (
    <div className={className}>
      <div className="flex flex-wrap gap-3">
        <Tombol varian={varianWarga} onClick={() => masuk('warga')} disabled={memuat !== null}>
          {memuat === 'warga' ? 'Masuk sebagai warga…' : 'Coba sebagai warga demo'}
        </Tombol>
        <Tombol varian={varianAdmin} onClick={() => masuk('admin')} disabled={memuat !== null}>
          {memuat === 'admin' ? 'Masuk sebagai admin…' : 'Coba sebagai admin demo'}
        </Tombol>
      </div>
      {galat && (
        <p role="alert" className="mt-3 text-kecil font-medium">
          {galat}
        </p>
      )}
    </div>
  );
}
