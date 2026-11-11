'use client';

import { useState } from 'react';
import { ubahStatusLaporan } from '@/lib/supabase/aksi-status';
import { pesanError } from '@/lib/errors';
import { Tombol } from '@/components/ui/Tombol';

export default function UlangKarantinaFoto({ kode, aktif }: { kode: string; aktif: boolean }) {
  const [memuat, setMemuat] = useState(false);
  const [hasil, setHasil] = useState<{ ok: boolean; pesan: string } | null>(null);

  async function ulangi() {
    setMemuat(true);
    setHasil(null);
    try {
      const respons = await ubahStatusLaporan({
        p_kode: kode, p_status: 'ditolak', p_alasan: 'konten_melanggar',
        p_catatan: null, p_bukti_url: null, p_duplikat_kode: null, p_perkiraan: null,
      });
      if ('error' in respons) throw new Error(respons.error);
      setHasil({ ok: true, pesan: 'Foto di penyimpanan laporan sudah disembunyikan. Status dan riwayat tidak berubah.' });
    } catch (err) {
      setHasil({ ok: false, pesan: pesanError(err) });
    } finally {
      setMemuat(false);
    }
  }

  return (
    <div className="kartu grid gap-3 p-5">
      <p className="text-kecil text-lembut">
        Jika pemindahan foto sebelumnya gagal, coba lagi agar URL foto lama tidak lagi terbuka untuk publik.
      </p>
      <Tombol onClick={ulangi} disabled={!aktif || memuat}>
        {memuat ? 'Menyembunyikan foto…' : 'Ulangi penyembunyian foto'}
      </Tombol>
      {hasil && <p role={hasil.ok ? 'status' : 'alert'} className="text-kecil">{hasil.pesan}</p>}
    </div>
  );
}
