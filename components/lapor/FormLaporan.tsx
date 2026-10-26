// components/lapor/FormLaporan.tsx — Buat Laporan (FR-B1–B4, SDD 9), pemilik: A
// Urutan: kategori → titik di peta → foto → deskripsi → cek laporan serupa → kirim.
// Operasi SDD 6: S1 unggah foto (lib/supabase/unggah.ts), R2 similar_reports, R4 toggle_upvote, R3 create_report.
// Isian tidak hilang kalau unggah atau kirim gagal; foto yang sudah terunggah tidak diunggah ulang.

'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import { pesanError } from '@/lib/errors';
import { kompresFoto, TIPE_FOTO, UKURAN_MAKS } from '@/lib/foto';
import { lalu } from '@/lib/format';
import { cariKecamatan, muatKecamatan, type FiturKecamatan } from '@/lib/geo/titik';
import { KATEGORI } from '@/lib/konten';
import { createClient } from '@/lib/supabase/client';
import { unggahFoto } from '@/lib/supabase/unggah';
import type { StatusLaporan } from '@/lib/types';
import BadgeStatus from '../BadgeStatus';
import Ikon from '../ui/Ikon';
import { Tombol } from '../ui/Tombol';
import type { Titik } from './PetaPinLeaflet';

const PetaPin = dynamic(() => import('./PetaPinLeaflet'), {
  ssr: false,
  loading: () => <div className="kerangka h-[min(60svh,30rem)] min-h-80 w-full" />,
});

const MIN_DESKRIPSI = 20;
const MAKS_DESKRIPSI = 500;
const MAKS_FOTO = 3;

interface Foto {
  id: string;
  blob: Blob;
  pratinjau: string;
  url?: string; // terisi setelah berhasil diunggah
}

interface Serupa {
  kode: string;
  jarak_m: number;
  status: StatusLaporan;
  jumlah_upvote: number;
  foto: string | null;
  created_at: string;
}

const PESAN_FOTO: Record<string, string> = {
  TIPE_FOTO: 'Pilih foto JPG, PNG, atau WebP.',
  UKURAN_FOTO: 'Ukuran tiap foto maksimal 5 MB.',
  KOMPRES_GAGAL: 'Foto tidak bisa diproses di perangkat ini. Coba foto lain.',
};

function Langkah({ n, judul, children, petunjuk }: { n: number; judul: string; petunjuk?: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={`langkah-${n}`} className="grid gap-4 border-t-4 border-lapis pt-6 lg:grid-cols-12 lg:gap-8">
      <div className="lg:col-span-4">
        <h2 id={`langkah-${n}`} className="text-lead font-medium tracking-tight">
          <span className="angka mr-2 text-lembut">{n}.</span>
          {judul}
        </h2>
        {petunjuk && <p className="mt-2 max-w-[40ch] text-kecil text-lembut">{petunjuk}</p>}
      </div>
      <div className="min-w-0 lg:col-span-8">{children}</div>
    </section>
  );
}

export default function FormLaporan() {
  const router = useRouter();
  const idInputFoto = useId();
  const inputFoto = useRef<HTMLInputElement>(null);

  const [kategori, setKategori] = useState<number | null>(null);
  const [titik, setTitik] = useState<Titik | null>(null);
  const [batas, setBatas] = useState<FiturKecamatan[] | null>(null);
  const [lokasiGalat, setLokasiGalat] = useState<string | null>(null);
  const [mencariLokasi, setMencariLokasi] = useState(false);
  const [foto, setFoto] = useState<Foto[]>([]);
  const [fotoGalat, setFotoGalat] = useState<string | null>(null);
  const [deskripsi, setDeskripsi] = useState('');
  const [hasilSerupa, setHasilSerupa] = useState<{ kunci: string; data: Serupa[]; waktu: number } | null>(null);
  const [didukung, setDidukung] = useState<Record<string, boolean>>({});
  const [tahap, setTahap] = useState<'isi' | 'mengunggah' | 'mengirim'>('isi');
  const [galat, setGalat] = useState<string | null>(null);
  const [cobaKirim, setCobaKirim] = useState(false);

  useEffect(() => {
    muatKecamatan().then(setBatas, () => setBatas([]));
  }, []);

  const wilayah = titik && batas && batas.length > 0 ? cariKecamatan(titik.lat, titik.lng, batas) : null;
  const diLuar = Boolean(titik && batas && batas.length > 0 && !wilayah);

  // Laporan serupa: kategori sama, aktif, dalam radius 100 m (PRD 7.3). Hasil hanya ditampilkan
  // kalau masih cocok dengan kategori dan titik yang sekarang dipilih.
  const kunciSerupa = kategori && titik && !diLuar ? `${kategori}|${titik.lat}|${titik.lng}` : null;
  const serupa = hasilSerupa && hasilSerupa.kunci === kunciSerupa ? hasilSerupa.data : null;
  useEffect(() => {
    if (!kunciSerupa || !kategori || !titik) return;
    let batal = false;
    const t = window.setTimeout(async () => {
      const { data, error } = await createClient().rpc('similar_reports', {
        p_category_id: kategori,
        p_lat: titik.lat,
        p_lng: titik.lng,
      });
      if (!batal) setHasilSerupa({ kunci: kunciSerupa, data: error ? [] : ((data ?? []) as Serupa[]), waktu: Date.now() });
    }, 450);
    return () => {
      batal = true;
      window.clearTimeout(t);
    };
  }, [kunciSerupa, kategori, titik]);

  function pakaiLokasiSaya() {
    if (!('geolocation' in navigator)) {
      setLokasiGalat('Browser ini tidak bisa membaca lokasi. Ketuk peta untuk menaruh titik.');
      return;
    }
    setMencariLokasi(true);
    setLokasiGalat(null);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setMencariLokasi(false);
        setTitik({ lat: p.coords.latitude, lng: p.coords.longitude });
      },
      () => {
        setMencariLokasi(false);
        setLokasiGalat('Lokasi tidak bisa dibaca. Izinkan akses lokasi, atau ketuk peta untuk menaruh titik.');
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  async function tambahFoto(files: FileList | null) {
    if (!files) return;
    setFotoGalat(null);
    const sisa = MAKS_FOTO - foto.length;
    const dipilih = Array.from(files).slice(0, sisa);
    if (files.length > sisa) setFotoGalat(`Maksimal ${MAKS_FOTO} foto.`);
    const baru: Foto[] = [];
    for (const f of dipilih) {
      try {
        const blob = await kompresFoto(f);
        baru.push({ id: crypto.randomUUID(), blob, pratinjau: URL.createObjectURL(blob) });
      } catch (e) {
        setFotoGalat(PESAN_FOTO[e instanceof Error ? e.message : ''] ?? PESAN_FOTO.KOMPRES_GAGAL);
      }
    }
    setFoto((x) => [...x, ...baru]);
    if (inputFoto.current) inputFoto.current.value = '';
  }

  function hapusFoto(id: string) {
    setFoto((x) => {
      const f = x.find((y) => y.id === id);
      if (f) URL.revokeObjectURL(f.pratinjau);
      return x.filter((y) => y.id !== id);
    });
  }

  async function dukung(kode: string) {
    const { data, error } = await createClient().rpc('toggle_upvote', { p_kode: kode });
    if (error) return setGalat(pesanError(error));
    const hasil = data as { upvoted: boolean; jumlah_upvote: number };
    setDidukung((d) => ({ ...d, [kode]: hasil.upvoted }));
    setHasilSerupa((h) =>
      h ? { ...h, data: h.data.map((x) => (x.kode === kode ? { ...x, jumlah_upvote: hasil.jumlah_upvote } : x)) } : h,
    );
  }

  const panjang = deskripsi.trim().length;
  const masalah = [
    !kategori && 'Pilih kategori.',
    !titik && 'Taruh titik lokasi di peta.',
    diLuar && 'Titik berada di luar DKI Jakarta daratan.',
    foto.length === 0 && 'Tambahkan minimal satu foto.',
    panjang < MIN_DESKRIPSI && `Deskripsi minimal ${MIN_DESKRIPSI} karakter.`,
    panjang > MAKS_DESKRIPSI && `Deskripsi maksimal ${MAKS_DESKRIPSI} karakter.`,
  ].filter(Boolean) as string[];

  async function kirim(e: React.FormEvent) {
    e.preventDefault();
    setCobaKirim(true);
    if (masalah.length > 0 || !titik || !kategori) return;
    setGalat(null);
    try {
      setTahap('mengunggah');
      const urls: string[] = [];
      for (const f of foto) {
        const url = f.url ?? (await unggahFoto('foto-laporan', f.blob));
        if (!f.url) setFoto((x) => x.map((y) => (y.id === f.id ? { ...y, url } : y)));
        urls.push(url);
      }
      setTahap('mengirim');
      const { data, error } = await createClient().rpc('create_report', {
        p_category_id: kategori,
        p_deskripsi: deskripsi.trim(),
        p_foto: urls,
        p_lat: titik.lat,
        p_lng: titik.lng,
      });
      if (error) throw error;
      router.push(`/laporan/${(data as { kode: string }).kode}?baru=1`);
    } catch (err) {
      setGalat(pesanError(err));
      setTahap('isi');
    }
  }

  const sibuk = tahap !== 'isi';

  return (
    <form onSubmit={kirim} noValidate className="grid gap-14">
      <Langkah n={1} judul="Masalahnya apa?" petunjuk="Urgensi dan dinas penanggung jawab ditentukan dari kategori, bukan dipilih pelapor.">
        <fieldset>
          <legend className="sr-only">Kategori</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {KATEGORI.map((k) => (
              <label
                key={k.id}
                className="grid cursor-pointer gap-1 bg-lapis p-4 transition-colors hover:bg-lapis-2 has-checked:bg-tinta has-checked:text-kertas has-focus-visible:outline-3 has-focus-visible:outline-tinta"
              >
                <input type="radio" name="kategori" value={k.id} checked={kategori === k.id} onChange={() => setKategori(k.id)} className="sr-only" />
                <span className="text-lead font-medium tracking-tight">{k.nama}</span>
                <span className="text-kecil opacity-85">
                  {k.instansi} · urgensi {k.urgensi.toLowerCase()} · respons {k.respons} jam, selesai {k.selesai / 24} hari
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </Langkah>

      <Langkah n={2} judul="Di mana tepatnya?" petunjuk="Ketuk peta untuk menaruh titik, lalu geser titiknya kalau perlu. Kecamatan dan instansi ditentukan otomatis.">
        <div className="peta isolate overflow-hidden bg-lapis">
          <PetaPin titik={titik} onPilih={setTitik} />
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-badan" aria-live="polite">
            {!titik ? (
              <span className="text-lembut">Belum ada titik.</span>
            ) : diLuar ? (
              <span className="font-semibold">Titik ini di luar DKI Jakarta daratan. Pindahkan ke wilayah layanan.</span>
            ) : wilayah ? (
              <span className="inline-flex items-center gap-1.5">
                <Ikon nama="lokasi" className="size-4" />
                Kecamatan {wilayah.kecamatan}, {wilayah.kota}
              </span>
            ) : (
              <span className="text-lembut">Memeriksa wilayah…</span>
            )}
          </p>
          <Tombol varian="kedua" onClick={pakaiLokasiSaya} disabled={mencariLokasi}>
            <Ikon nama="lokasi" className="size-4" />
            {mencariLokasi ? 'Membaca lokasi…' : 'Pakai lokasi saya'}
          </Tombol>
        </div>
        {lokasiGalat && (
          <p role="alert" className="mt-2 text-kecil font-medium">
            {lokasiGalat}
          </p>
        )}
      </Langkah>

      <Langkah n={3} judul="Foto masalahnya" petunjuk="1–3 foto JPG, PNG, atau WebP, maksimal 5 MB. Foto dikecilkan dan data lokasi di dalam file dibuang sebelum diunggah.">
        <p className="flex gap-2 bg-st-menunggu-bg p-3 text-kecil text-st-menunggu">
          <Ikon nama="peringatan" className="mt-0.5 size-4" />
          Jangan memotret wajah atau plat nomor orang lain. Foto tampil publik.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {foto.map((f, i) => (
            <figure key={f.id} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element -- pratinjau blob lokal */}
              <img src={f.pratinjau} alt={`Foto ${i + 1} yang dipilih`} className="aspect-square w-full bg-lapis object-cover" />
              <button
                type="button"
                onClick={() => hapusFoto(f.id)}
                disabled={sibuk}
                className="absolute top-2 right-2 flex size-9 items-center justify-center bg-tinta text-kertas hover:bg-tinta-tua"
                aria-label={`Hapus foto ${i + 1}`}
              >
                <Ikon nama="tutup" className="size-4" />
              </button>
            </figure>
          ))}
          {foto.length < MAKS_FOTO && (
            <label
              htmlFor={idInputFoto}
              className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 bg-lapis p-4 text-center text-kecil hover:bg-lapis-2 has-focus-visible:outline-3 has-focus-visible:outline-tinta"
            >
              <Ikon nama="kamera" className="size-7" />
              Tambah foto
              <span className="text-lembut">
                {foto.length} dari {MAKS_FOTO}
              </span>
              <input
                ref={inputFoto}
                id={idInputFoto}
                type="file"
                accept={TIPE_FOTO.join(',')}
                multiple
                capture="environment"
                onChange={(e) => tambahFoto(e.target.files)}
                className="sr-only"
                data-ukuran-maks={UKURAN_MAKS}
              />
            </label>
          )}
        </div>
        {fotoGalat && (
          <p role="alert" className="mt-2 text-kecil font-medium">
            {fotoGalat}
          </p>
        )}
      </Langkah>

      <Langkah n={4} judul="Ceritakan singkat" petunjuk="Apa yang terjadi, sejak kapan, dan dampaknya. 20–500 karakter.">
        <label htmlFor="deskripsi" className="sr-only">
          Deskripsi
        </label>
        <textarea
          id="deskripsi"
          value={deskripsi}
          onChange={(e) => setDeskripsi(e.target.value)}
          rows={5}
          maxLength={MAKS_DESKRIPSI + 50}
          aria-describedby="hitung-deskripsi"
          className="w-full bg-terang p-4 text-badan focus:outline-3 focus:outline-tinta"
          placeholder="Contoh: Lubang besar di lajur kiri dekat halte, motor sering oleng saat malam karena lampu jalan mati."
        />
        <p id="hitung-deskripsi" className={`angka mt-1 text-kecil ${panjang > MAKS_DESKRIPSI ? 'font-semibold' : 'text-lembut'}`}>
          {panjang} / {MAKS_DESKRIPSI} karakter{panjang < MIN_DESKRIPSI ? `, minimal ${MIN_DESKRIPSI}` : ''}
        </p>
      </Langkah>

      {serupa && serupa.length > 0 && (
        <section aria-labelledby="judul-serupa" className="di-medan bg-medan p-5 text-medan-tinta sm:p-8">
          <h2 id="judul-serupa" className="text-lead font-medium tracking-tight">
            Sudah ada {serupa.length} laporan serupa dalam 100 meter
          </h2>
          <p className="mt-2 max-w-[60ch] text-badan text-medan-lembut">
            Dukung laporan yang sudah ada supaya suaranya terkumpul di satu tempat. Kalau masalahnya memang berbeda, tetap
            kirim laporan baru di bawah.
          </p>
          <ul className="mt-6 grid gap-2">
            {serupa.map((s) => (
              <li key={s.kode} className="flex flex-wrap items-center gap-x-5 gap-y-3 bg-terang p-4 text-tinta">
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-3">
                    <Link href={`/laporan/${s.kode}`} target="_blank" className="angka font-semibold underline-offset-4 hover:underline">
                      {s.kode}
                    </Link>
                    <BadgeStatus status={s.status} />
                  </p>
                  <p className="mt-1 text-kecil text-lembut">
                    {s.jarak_m} m dari titik Anda · {lalu(s.created_at, hasilSerupa?.waktu ?? Date.parse(s.created_at))} · {s.jumlah_upvote} dukungan
                  </p>
                </div>
                <Tombol varian={didukung[s.kode] ? 'kedua' : 'utama'} onClick={() => dukung(s.kode)} aria-pressed={didukung[s.kode] ?? false}>
                  <Ikon nama="dukung" className="size-4" isi={didukung[s.kode]} />
                  {didukung[s.kode] ? 'Didukung' : 'Dukung'}
                </Tombol>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="grid gap-4 bg-lapis p-5 sm:p-6 lg:grid-cols-12 lg:items-center lg:gap-8">
        <div className="lg:col-span-8">
          {cobaKirim && masalah.length > 0 ? (
            <div role="alert">
              <p className="text-badan font-semibold">Belum bisa dikirim:</p>
              <ul className="mt-1 list-inside list-disc text-badan">
                {masalah.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </div>
          ) : galat ? (
            <p role="alert" className="text-badan font-semibold">
              {galat} Isian Anda masih tersimpan; tekan tombol kirim untuk mencoba lagi.
            </p>
          ) : (
            <p className="text-badan">
              Setelah terkirim Anda mendapat kode SR untuk melacak laporan. Status awalnya Menunggu sampai dinas merespons.
            </p>
          )}
        </div>
        <Tombol type="submit" disabled={sibuk} className="min-h-12 lg:col-span-4 lg:justify-self-end">
          {tahap === 'mengunggah' ? 'Mengunggah foto…' : tahap === 'mengirim' ? 'Mengirim laporan…' : galat ? 'Coba kirim lagi' : 'Kirim laporan'}
        </Tombol>
      </div>
    </form>
  );
}
