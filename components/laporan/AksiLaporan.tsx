// components/laporan/AksiLaporan.tsx — dukung, batalkan, dan rating (R4, R5, R7), pemilik: A
// Tombol hanya muncul untuk orang yang boleh memakainya; aturan sebenarnya tetap di RPC.

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { pesanError } from '@/lib/errors';
import { createClient } from '@/lib/supabase/client';
import type { StatusLaporan } from '@/lib/types';
import { umumkan } from '../Pengumuman';
import AngkaGulir from '../ui/AngkaGulir';
import Ikon from '../ui/Ikon';
import { kelasTombol, Tombol } from '../ui/Tombol';

const AKTIF: StatusLaporan[] = ['menunggu', 'diverifikasi', 'diproses'];

export function TombolDukung({
  kode,
  jumlahAwal,
  status,
  login,
  pemilik,
  contoh = false,
}: {
  kode: string;
  jumlahAwal: number;
  status: StatusLaporan;
  login: boolean;
  pemilik: boolean;
  /** Laporan dari data contoh: tidak ada di database, jadi dukungan tidak ditawarkan. */
  contoh?: boolean;
}) {
  const router = useRouter();
  const [jumlah, setJumlah] = useState(jumlahAwal);
  const [didukung, setDidukung] = useState<boolean | null>(null);
  const [memuat, setMemuat] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);
  const aktif = AKTIF.includes(status) && !contoh;

  async function dukung() {
    setMemuat(true);
    setGalat(null);
    const { data, error } = await createClient().rpc('toggle_upvote', { p_kode: kode });
    setMemuat(false);
    if (error) return setGalat(pesanError(error));
    const hasil = data as { upvoted: boolean; jumlah_upvote: number };
    setDidukung(hasil.upvoted);
    setJumlah(hasil.jumlah_upvote);
    umumkan(hasil.upvoted ? 'Dukungan Anda tercatat.' : 'Dukungan dibatalkan.');
    router.refresh();
  }

  return (
    <div className="kartu grid gap-3 p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-full bg-biru-muda text-biru-tua">
            <Ikon nama="dukung" className="size-5" />
          </span>
          <span>
            <span className="angka block text-judul leading-none font-bold">
              <AngkaGulir nilai={String(jumlah)} />
            </span>
            <span className="text-kecil text-lembut">warga mendukung</span>
          </span>
        </p>
        {aktif && !pemilik && login && (
          <Tombol varian={didukung ? 'kedua' : 'utama'} onClick={dukung} disabled={memuat} aria-pressed={didukung ?? undefined}>
            <Ikon key={String(didukung)} nama="dukung" className="pop size-4" isi={Boolean(didukung)} />
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
        <p role="alert" className="text-kecil font-semibold text-merah-tua">
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
    <div className="kartu p-5">
      <p className="text-badan font-bold">Laporan Anda masih menunggu verifikasi.</p>
      <p className="mt-1 text-kecil text-lembut">
        Selama status masih Menunggu, Anda bisa membatalkannya, misalnya karena salah kategori atau salah titik. Laporan
        yang dibatalkan tidak dihitung di rapor maupun skor prioritas.
      </p>
      {!konfirmasi ? (
        <Tombol varian="garis" className="mt-4" onClick={() => setKonfirmasi(true)}>
          Batalkan laporan
        </Tombol>
      ) : (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Tombol varian="bahaya" onClick={batalkan} disabled={memuat}>
            {memuat ? 'Membatalkan…' : `Ya, batalkan ${kode}`}
          </Tombol>
          <Tombol varian="garis" onClick={() => setKonfirmasi(false)} disabled={memuat}>
            Tidak jadi
          </Tombol>
        </div>
      )}
      {galat && (
        <p role="alert" className="mt-3 text-kecil font-semibold text-merah-tua">
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
    umumkan('Rating terkirim.');
    router.refresh();
  }

  if (terkirim) {
    return (
      <p className="flex gap-2 rounded-kartu bg-hijau-muda p-5 text-badan font-semibold text-hijau">
        <Ikon nama="centang" className="mt-0.5 size-5 shrink-0" />
        Terima kasih. Rating Anda ikut menghitung nilai kepuasan di Rapor Instansi.
      </p>
    );
  }

  return (
    <form onSubmit={kirim} className="kartu grid gap-4 p-5">
      <fieldset>
        <legend className="text-badan font-bold">Seberapa baik penanganannya?</legend>
        <p className="text-kecil text-lembut">Rating hanya bisa diberikan sekali, oleh pelapor, setelah laporan selesai.</p>
        <div className="mt-3 flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <label
              key={n}
              className="flex size-11 cursor-pointer items-center justify-center rounded-full text-oranye transition-[scale,background-color] duration-200 hover:scale-110 hover:bg-oranye-muda active:scale-95 has-focus-visible:outline-2 has-focus-visible:outline-biru"
            >
              <input type="radio" name="nilai" value={n} checked={nilai === n} onChange={() => setNilai(n)} className="sr-only" />
              {/* Bintang yang baru terisi muncul dengan pegas. */}
              <Ikon key={String(n <= nilai)} nama="bintang" isi={n <= nilai} className={n <= nilai ? 'pop size-8' : 'size-8'} />
              <span className="sr-only">{n} bintang</span>
            </label>
          ))}
        </div>
      </fieldset>
      <label className="grid gap-1.5 text-kecil font-semibold">
        Komentar (opsional)
        <textarea
          value={komentar}
          onChange={(e) => setKomentar(e.target.value)}
          maxLength={300}
          rows={3}
          className="p-3 text-badan font-normal"
        />
      </label>
      <Tombol type="submit" disabled={!nilai || memuat} className="justify-self-start">
        {memuat ? 'Mengirim…' : 'Kirim rating'}
      </Tombol>
      {galat && (
        <p role="alert" className="text-kecil font-semibold text-merah-tua">
          {galat}
        </p>
      )}
    </form>
  );
}
