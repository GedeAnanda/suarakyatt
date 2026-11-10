// components/laporan/SalinKode.tsx — salin kode laporan atau bagikan tautan lacaknya (pemilik: A)
// Di ponsel yang mendukung Web Share, tombol Bagikan membuka lembar bagi bawaan.

'use client';

import { useSyncExternalStore } from 'react';
import { umumkan } from '../Pengumuman';
import Ikon from '../ui/Ikon';

const bisaBagikan = () => typeof navigator !== 'undefined' && typeof navigator.share === 'function';

export default function SalinKode({ kode }: { kode: string }) {
  const adaShare = useSyncExternalStore(
    () => () => {},
    bisaBagikan,
    () => false,
  );

  async function salin() {
    try {
      await navigator.clipboard.writeText(kode);
      umumkan(`Kode ${kode} disalin.`);
    } catch {
      umumkan(`Catat kodenya: ${kode}`);
    }
  }

  async function bagikan() {
    try {
      await navigator.share({ title: `Laporan ${kode} · SUARAKYAT`, text: `Lacak laporan ${kode}`, url: window.location.href });
    } catch {
      // dibatalkan pengguna
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={salin} className="chip">
        <Ikon nama="salin" className="size-4" />
        Salin kode
      </button>
      {adaShare && (
        <button type="button" onClick={bagikan} className="chip">
          <Ikon nama="bagikan" className="size-4" />
          Bagikan
        </button>
      )}
    </div>
  );
}
