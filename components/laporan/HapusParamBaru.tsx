// components/laporan/HapusParamBaru.tsx — buang ?baru=1 dari alamat setelah banner "Laporan terkirim" tampil (pemilik: A)
// Supaya banner tidak muncul lagi saat halaman dimuat ulang, dan tautan yang dibagikan bersih.

'use client';

import { useEffect } from 'react';

export default function HapusParamBaru() {
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.delete('baru');
    window.history.replaceState(null, '', url);
  }, []);
  return null;
}
