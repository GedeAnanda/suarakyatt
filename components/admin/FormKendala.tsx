// components/admin/FormKendala.tsx — catat kenapa laporan aktif belum selesai (R12 catat_kendala, migrasi 0010), pemilik: A
// Tidak mengubah status: hanya menambah satu baris riwayat "Kendala" yang tampil publik di halaman lacak,
// ditambah perkiraan tanggal selesai yang baru (opsional). Revisi FDS 10 Nov, butir 1.4.

'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { pesanError } from '@/lib/errors';
import { hariIni } from '@/lib/format';
import { KETERANGAN_TUNDA, LABEL_TUNDA } from '@/lib/konten';
import { catatKendala } from '@/lib/supabase/aksi-status';
import type { AlasanTunda } from '@/lib/types';
import { umumkan } from '../Pengumuman';
import Ikon from '../ui/Ikon';
import { Tombol } from '../ui/Tombol';

const kelasIsian = 'w-full px-4 py-3 text-badan font-normal';

export default function FormKendala({ kode, aktif }: { kode: string; aktif: boolean }) {
  const router = useRouter();
  const [alasan, setAlasan] = useState<AlasanTunda | null>(null);
  const [catatan, setCatatan] = useState('');
  const [perkiraan, setPerkiraan] = useState('');
  const [memuat, setMemuat] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);
  const [berhasil, setBerhasil] = useState<string | null>(null);

  const masalah = [
    !alasan && 'Pilih alasan tunda.',
    alasan === 'lainnya' && !catatan.trim() && 'Catatan wajib untuk "Alasan lain".',
    perkiraan && perkiraan < hariIni() && 'Perkiraan tanggal selesai tidak boleh sebelum hari ini.',
  ].filter(Boolean) as string[];

  async function simpan(e: React.FormEvent) {
    e.preventDefault();
    if (!alasan || masalah.length > 0) return;
    setMemuat(true);
    setGalat(null);
    try {
      const hasil = await catatKendala({
        p_kode: kode,
        p_alasan: alasan,
        p_catatan: catatan.trim() || null,
        p_perkiraan: perkiraan || null,
      });
      if ('error' in hasil) throw new Error(hasil.error);
      setBerhasil(`Alasan tunda "${LABEL_TUNDA[alasan]}" tercatat di riwayat publik ${kode}. Statusnya tidak berubah.`);
      umumkan(`Kendala ${kode} tercatat.`);
      router.refresh();
    } catch (err) {
      setGalat(pesanError(err));
    } finally {
      setMemuat(false);
    }
  }

  if (berhasil) {
    return (
      <div role="status" className="ganti grid gap-3 rounded-kartu bg-hijau-muda p-5 text-badan font-semibold text-hijau">
        <p className="flex gap-2">
          <Ikon nama="centang" className="pop mt-0.5 size-5 shrink-0" />
          {berhasil}
        </p>
        <button
          type="button"
          onClick={() => {
            setBerhasil(null);
            setAlasan(null);
            setCatatan('');
            setPerkiraan('');
          }}
          className="justify-self-start text-kecil font-semibold text-biru-tua underline underline-offset-4"
        >
          Catat kendala lain
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={simpan} aria-labelledby={`judul-kendala-${kode}`} className="kartu grid gap-5 p-5">
      <div>
        <h3 id={`judul-kendala-${kode}`} className="text-badan font-bold">
          Belum bisa diselesaikan? Catat kendalanya
        </h3>
        <p className="mt-1 text-kecil text-lembut">
          Warga melihat alasan ini di bagian paling atas halaman lacak. Status laporan tetap seperti sekarang.
        </p>
      </div>
      <fieldset disabled={!aktif || memuat} className="grid gap-5 disabled:opacity-70">
        <fieldset className="grid gap-2">
          <legend className="sr-only">Alasan tunda</legend>
          {(Object.keys(LABEL_TUNDA) as AlasanTunda[]).map((a) => (
            <label
              key={a}
              className="grid cursor-pointer gap-1 rounded-kontrol border border-garis p-3.5 transition-colors hover:border-biru has-checked:border-biru has-checked:bg-biru-muda"
            >
              <span className="flex items-center gap-2 font-bold">
                <input type="radio" name={`tunda-${kode}`} checked={alasan === a} onChange={() => setAlasan(a)} className="size-4" />
                {LABEL_TUNDA[a]}
              </span>
              <span className="text-kecil text-lembut">{KETERANGAN_TUNDA[a]}</span>
            </label>
          ))}
        </fieldset>
        <label className="grid gap-1.5 text-kecil font-semibold">
          Catatan untuk publik{alasan === 'lainnya' ? ' (wajib)' : ' (opsional)'}
          <textarea value={catatan} onChange={(e) => setCatatan(e.target.value)} rows={2} maxLength={300} className={kelasIsian} />
        </label>
        <label className="grid gap-1.5 text-kecil font-semibold">
          Perkiraan tanggal selesai yang baru (opsional)
          <input type="date" value={perkiraan} min={hariIni()} onChange={(e) => setPerkiraan(e.target.value)} className={`${kelasIsian} sm:max-w-xs`} />
        </label>
      </fieldset>
      {(galat || masalah.length > 0) && (
        <div role={galat ? 'alert' : undefined} className="text-kecil">
          {galat ? <p className="font-bold text-merah-tua">{galat}</p> : <p className="text-lembut">{masalah.join(' ')}</p>}
        </div>
      )}
      <Tombol type="submit" varian="garis" disabled={!aktif || memuat || masalah.length > 0} className="w-full">
        {memuat && <Ikon nama="muat" className="putar size-4" />}
        {memuat ? 'Menyimpan…' : 'Catat kendala'}
      </Tombol>
    </form>
  );
}
