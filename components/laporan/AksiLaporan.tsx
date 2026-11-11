// components/laporan/AksiLaporan.tsx — dukung, batalkan, dan rating (R4, R5, R7), pemilik: A
// Tombol hanya muncul untuk orang yang boleh memakainya; aturan sebenarnya tetap di RPC.

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { pesanError } from '@/lib/errors';
import { supabaseBrowser } from '@/lib/supabase/muat';
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
  didukungAwal = false,
  contoh = false,
}: {
  kode: string;
  jumlahAwal: number;
  status: StatusLaporan;
  login: boolean;
  pemilik: boolean;
  /** Pengguna sudah mendukung sebelumnya, supaya tombol menawarkan "Batal dukung" sejak awal. */
  didukungAwal?: boolean;
  /** Laporan dari data contoh: tidak ada di database, jadi dukungan tidak ditawarkan. */
  contoh?: boolean;
}) {
  const router = useRouter();
  const [jumlah, setJumlah] = useState(jumlahAwal);
  const [didukung, setDidukung] = useState(didukungAwal);
  const [memuat, setMemuat] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);
  const aktif = AKTIF.includes(status) && !contoh;

  async function dukung() {
    setMemuat(true);
    setGalat(null);
    const { data, error } = await (await supabaseBrowser()).rpc('toggle_upvote', { p_kode: kode });
    setMemuat(false);
    if (error) return setGalat(pesanError(error));
    const hasil = data as { upvoted: boolean; jumlah_upvote: number };
    setDidukung(hasil.upvoted);
    setJumlah(hasil.jumlah_upvote);
    umumkan(hasil.upvoted ? 'Dukunganmu tercatat.' : 'Dukungan dibatalkan.');
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
          <Tombol varian={didukung ? 'kedua' : 'utama'} onClick={dukung} disabled={memuat} aria-pressed={didukung}>
            {memuat ? (
              <Ikon nama="muat" className="putar size-4" />
            ) : (
              <Ikon key={String(didukung)} nama="dukung" className="pop size-4" isi={didukung} />
            )}
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
        Tekan Dukung kalau kamu juga terdampak masalah ini. Tiap akun bisa mendukung sekali. Dukungan membantu masalah ini
        didahulukan (paling banyak 10 per laporan yang dihitung).
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
    const { error } = await (await supabaseBrowser()).rpc('cancel_report', { p_kode: kode });
    setMemuat(false);
    if (error) return setGalat(pesanError(error));
    // Laporan yang dibatalkan tidak tampil publik, jadi pemberitahuan ini satu-satunya konfirmasi.
    umumkan(`Laporan ${kode} dibatalkan.`);
    router.push('/peta');
    router.refresh();
  }

  return (
    <div className="kartu p-5">
      <p className="text-badan font-bold">Laporanmu belum diperiksa dinas, jadi masih bisa dibatalkan.</p>
      <p className="mt-1 text-kecil text-lembut">
        Misalnya karena salah jenis masalah atau salah titik. Laporan yang dibatalkan hilang dari peta, tidak dihitung di
        rapor maupun urutan prioritas, dan tidak bisa dikembalikan.
      </p>
      {!konfirmasi ? (
        <Tombol varian="garis" className="mt-4" onClick={() => setKonfirmasi(true)}>
          Batalkan laporan
        </Tombol>
      ) : (
        <div className="ganti mt-4 flex flex-wrap items-center gap-3">
          <Tombol varian="bahaya" onClick={batalkan} disabled={memuat}>
            {memuat && <Ikon nama="muat" className="putar size-4" />}
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
    const { error } = await (await supabaseBrowser()).rpc('rate_report', { p_kode: kode, p_nilai: nilai, p_komentar: komentar || null });
    setMemuat(false);
    if (error) return setGalat(pesanError(error));
    setTerkirim(true);
    umumkan('Nilai bintangmu terkirim.');
    router.refresh();
  }

  if (terkirim) {
    return (
      <p className="ganti flex gap-2 rounded-kartu bg-hijau-muda p-5 text-badan font-semibold text-hijau">
        <Ikon nama="centang" className="pop mt-0.5 size-5 shrink-0" />
        Terima kasih. Nilai bintangmu ikut dihitung di bagian &ldquo;Warga puas&rdquo; pada Rapor dinas.
      </p>
    );
  }

  return (
    <form onSubmit={kirim} className="kartu grid gap-4 p-5">
      <fieldset>
        <legend className="text-badan font-bold">Seberapa baik penanganannya?</legend>
        <p className="text-kecil text-lembut">Beri nilai bintang 1–5 untuk hasil perbaikannya. Hanya pelapor yang bisa menilai, sekali saja.</p>
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
        {memuat && <Ikon nama="muat" className="putar size-4" />}
        {memuat ? 'Mengirim…' : 'Kirim nilai'}
      </Tombol>
      {galat && (
        <p role="alert" className="text-kecil font-semibold text-merah-tua">
          {galat}
        </p>
      )}
    </form>
  );
}
