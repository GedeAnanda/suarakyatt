// components/laporan/AksiLaporan.tsx — dukung, batalkan, dan rating (R4, R5, R7), pemilik: A
// Tombol hanya muncul untuk orang yang boleh memakainya; aturan sebenarnya tetap di RPC.

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { pesanError } from '@/lib/errors';
import { createClient } from '@/lib/supabase/client';
import type { StatusLaporan } from '@/lib/types';
import Ikon from '../ui/Ikon';
import { kelasTombol, Tombol } from '../ui/Tombol';

const AKTIF: StatusLaporan[] = ['menunggu', 'diverifikasi', 'diproses'];

export function TombolDukung({
  kode,
  jumlahAwal,
  status,
  login,
  pemilik,
}: {
  kode: string;
  jumlahAwal: number;
  status: StatusLaporan;
  login: boolean;
  pemilik: boolean;
}) {
  const router = useRouter();
  const [jumlah, setJumlah] = useState(jumlahAwal);
  const [didukung, setDidukung] = useState<boolean | null>(null);
  const [memuat, setMemuat] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);
  const aktif = AKTIF.includes(status);

  async function dukung() {
    setMemuat(true);
    setGalat(null);
    const { data, error } = await createClient().rpc('toggle_upvote', { p_kode: kode });
    setMemuat(false);
    if (error) return setGalat(pesanError(error));
    const hasil = data as { upvoted: boolean; jumlah_upvote: number };
    setDidukung(hasil.upvoted);
    setJumlah(hasil.jumlah_upvote);
    router.refresh();
  }

  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap items-center gap-4">
        <p className="angka text-judul leading-none font-medium tracking-[-0.04em]">
          {jumlah}
          <span className="ml-2 text-badan tracking-normal text-lembut">warga mendukung</span>
        </p>
        {aktif && !pemilik && login && (
          <Tombol varian={didukung ? 'kedua' : 'utama'} onClick={dukung} disabled={memuat} aria-pressed={didukung ?? undefined}>
            <Ikon nama="dukung" className="size-4" isi={Boolean(didukung)} />
            {memuat ? 'Menyimpan…' : didukung ? 'Batal dukung' : 'Dukung laporan ini'}
          </Tombol>
        )}
        {aktif && !login && (
          <Link href={`/masuk?lanjut=/laporan/${kode}`} className={kelasTombol('kedua')}>
            Masuk untuk mendukung
          </Link>
        )}
      </div>
      <p className="text-kecil text-lembut">
        Satu akun satu dukungan. Di skor prioritas, maksimal 10 dukungan per laporan yang dihitung; jumlah aslinya tetap
        ditampilkan.
      </p>
      {galat && (
        <p role="alert" className="text-kecil font-medium">
          {galat}
        </p>
      )}
    </div>
  );
}

export function TombolBatalkan({ kode }: { kode: string }) {
  const router = useRouter();
  const [konfirmasi, setKonfirmasi] = useState(false);
  const [memuat, setMemuat] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);

  async function batalkan() {
    setMemuat(true);
    setGalat(null);
    const { error } = await createClient().rpc('cancel_report', { p_kode: kode });
    setMemuat(false);
    if (error) return setGalat(pesanError(error));
    router.push('/peta');
    router.refresh();
  }

  return (
    <div className="bg-lapis p-5">
      <p className="text-badan font-medium">Laporan Anda masih menunggu verifikasi.</p>
      <p className="mt-1 text-kecil">
        Selama status masih Menunggu, Anda bisa membatalkannya, misalnya karena salah kategori atau salah titik. Laporan
        yang dibatalkan tidak dihitung di rapor maupun skor prioritas.
      </p>
      {!konfirmasi ? (
        <Tombol varian="kedua" className="mt-4" onClick={() => setKonfirmasi(true)}>
          Batalkan laporan
        </Tombol>
      ) : (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Tombol varian="bahaya" onClick={batalkan} disabled={memuat}>
            {memuat ? 'Membatalkan…' : `Ya, batalkan ${kode}`}
          </Tombol>
          <Tombol varian="kedua" onClick={() => setKonfirmasi(false)} disabled={memuat}>
            Tidak jadi
          </Tombol>
        </div>
      )}
      {galat && (
        <p role="alert" className="mt-3 text-kecil font-medium">
          {galat}
        </p>
      )}
    </div>
  );
}

export function FormRating({ kode }: { kode: string }) {
  const router = useRouter();
  const [nilai, setNilai] = useState(0);
  const [komentar, setKomentar] = useState('');
  const [memuat, setMemuat] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);
  const [terkirim, setTerkirim] = useState(false);

  async function kirim(e: React.FormEvent) {
    e.preventDefault();
    if (!nilai) return;
    setMemuat(true);
    setGalat(null);
    const { error } = await createClient().rpc('rate_report', { p_kode: kode, p_nilai: nilai, p_komentar: komentar || null });
    setMemuat(false);
    if (error) return setGalat(pesanError(error));
    setTerkirim(true);
    router.refresh();
  }

  if (terkirim) {
    return <p className="bg-lapis p-5 text-badan font-medium">Terima kasih. Rating Anda ikut menghitung nilai kepuasan di Rapor Instansi.</p>;
  }

  return (
    <form onSubmit={kirim} className="grid gap-4 bg-lapis p-5">
      <fieldset>
        <legend className="text-badan font-medium">Seberapa baik penanganannya?</legend>
        <p className="text-kecil text-lembut">Rating hanya bisa diberikan sekali, oleh pelapor, setelah laporan selesai.</p>
        <div className="mt-3 flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className="cursor-pointer p-1.5 has-focus-visible:outline-3 has-focus-visible:outline-tinta">
              <input type="radio" name="nilai" value={n} checked={nilai === n} onChange={() => setNilai(n)} className="sr-only" />
              <Ikon nama="bintang" isi={n <= nilai} className="size-8" />
              <span className="sr-only">{n} bintang</span>
            </label>
          ))}
        </div>
      </fieldset>
      <label className="grid gap-1.5 text-kecil">
        Komentar (opsional)
        <textarea
          value={komentar}
          onChange={(e) => setKomentar(e.target.value)}
          maxLength={300}
          rows={3}
          className="bg-terang p-3 text-badan focus:outline-3 focus:outline-tinta"
        />
      </label>
      <Tombol type="submit" disabled={!nilai || memuat} className="justify-self-start">
        {memuat ? 'Mengirim…' : 'Kirim rating'}
      </Tombol>
      {galat && (
        <p role="alert" className="text-kecil font-medium">
          {galat}
        </p>
      )}
    </form>
  );
}
