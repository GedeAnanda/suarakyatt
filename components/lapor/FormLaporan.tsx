// components/lapor/FormLaporan.tsx — Buat Laporan (FR-B1 sampai B4, SDD 9), pemilik: A
// Urutan: kategori → titik di peta → foto → deskripsi → cek laporan serupa → kirim.
// Operasi SDD 6: S1 unggah foto (lib/supabase/unggah.ts), R2 similar_reports, R4 toggle_upvote, R3 create_report.
// Isian tidak hilang kalau unggah atau kirim gagal; foto yang sudah terunggah tidak diunggah ulang.
// Tata letak seperti form pemesanan: langkah bernomor di kiri, ringkasan dan tombol kirim menempel di kanan.

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

// Draf disimpan di browser ini saja (bukan di server) supaya isian tidak hilang saat pengguna pindah halaman,
// misalnya membuka laporan serupa lalu kembali. Foto tidak ikut disimpan.
const KUNCI_DRAF = 'suarakyat:draf-laporan';
const UMUR_DRAF = 7 * 24 * 3_600_000;

interface Draf {
  kategori: number | null;
  titik: Titik | null;
  deskripsi: string;
  waktu: number;
}

function hapusDraf() {
  try {
    localStorage.removeItem(KUNCI_DRAF);
  } catch {
    // Penyimpanan browser diblokir: tidak ada draf yang perlu dihapus.
  }
}

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
  /** Pengguna ini sudah mendukungnya (similar_reports, migrasi 0009). */
  didukung?: boolean;
  foto: string | null;
  created_at: string;
}

const PESAN_FOTO: Record<string, string> = {
  TIPE_FOTO: 'Pilih foto JPG, PNG, atau WebP.',
  UKURAN_FOTO: 'Ukuran tiap foto maksimal 20 MB.',
  KOMPRES_GAGAL: 'Foto tidak bisa diproses di perangkat ini. Coba foto lain.',
};

function Langkah({
  n,
  judul,
  children,
  petunjuk,
  selesai,
  galat,
}: {
  n: number;
  judul: string;
  petunjuk?: string;
  selesai: boolean;
  galat: string[];
  children: React.ReactNode;
}) {
  return (
    <section
      id={`bagian-langkah-${n}`}
      aria-labelledby={`langkah-${n}`}
      className={`kartu scroll-mt-24 p-5 transition-[border-color,box-shadow] sm:p-6 ${
        galat.length ? 'border-merah shadow-[0_0_0_3px_rgb(217_35_48/0.12)]' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`angka flex size-8 shrink-0 items-center justify-center rounded-full text-kecil font-bold text-white transition-colors ${
            selesai ? 'bg-hijau' : galat.length ? 'bg-merah' : 'bg-biru'
          }`}
        >
          {selesai ? <Ikon key="centang" nama="centang" className="pop size-4.5" /> : n}
          <span className="sr-only">{selesai ? ', lengkap' : ', belum lengkap'}</span>
        </span>
        <div className="min-w-0">
          <h2 id={`langkah-${n}`} className="text-lead font-bold">
            {judul}{' '}
            <span className="text-merah" aria-hidden="true">
              *
            </span>
          </h2>
          {petunjuk && <p className="mt-0.5 text-kecil text-lembut">{petunjuk}</p>}
        </div>
      </div>
      <div className="mt-4 min-w-0">
        {children}
        {galat.length > 0 && (
          <ul id={`galat-langkah-${n}`} className="mt-3 grid gap-1">
            {galat.map((t) => (
              <li key={t} className="flex items-center gap-2 text-kecil font-semibold text-merah-tua">
                <Ikon nama="peringatan" className="size-4" />
                {t}
              </li>
            ))}
          </ul>
        )}
      </div>
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
  const prosesFoto = useRef(false);
  const [fotoMemproses, setFotoMemproses] = useState(false);
  const [fotoGalat, setFotoGalat] = useState<string | null>(null);
  const [deskripsi, setDeskripsi] = useState('');
  const [hasilSerupa, setHasilSerupa] = useState<{ kunci: string; data: Serupa[]; waktu: number } | null>(null);
  const [didukung, setDidukung] = useState<Record<string, boolean>>({});
  const [galatDukung, setGalatDukung] = useState<string | null>(null);
  const [tahap, setTahap] = useState<'isi' | 'mengunggah' | 'mengirim'>('isi');
  const [galat, setGalat] = useState<string | null>(null);
  const [cobaKirim, setCobaKirim] = useState(false);
  // Bertambah setiap kali tombol kirim ditekan: ringkasan galat dipasang ulang dan bergetar lagi, jadi penekanan
  // berikutnya yang masih gagal tetap terasa ada tanggapannya.
  const [percobaan, setPercobaan] = useState(0);
  const ringkasan = useRef<HTMLDivElement>(null);
  const drafSiap = useRef(false);
  const [drafDipulihkan, setDrafDipulihkan] = useState(false);

  // Simpan draf setiap isian berubah. Efek ini sengaja ditulis sebelum efek pemulihan: saat pertama dipasang,
  // drafSiap masih false sehingga isian kosong awal tidak menimpa draf yang belum sempat dipulihkan.
  useEffect(() => {
    if (!drafSiap.current) return;
    try {
      if (!kategori && !titik && !deskripsi.trim()) localStorage.removeItem(KUNCI_DRAF);
      else localStorage.setItem(KUNCI_DRAF, JSON.stringify({ kategori, titik, deskripsi, waktu: Date.now() } satisfies Draf));
    } catch {
      // Penyimpanan penuh atau diblokir: formulir tetap jalan tanpa draf.
    }
  }, [kategori, titik, deskripsi]);

  useEffect(() => {
    try {
      const d = JSON.parse(localStorage.getItem(KUNCI_DRAF) ?? 'null') as Partial<Draf> | null;
      if (d && typeof d.waktu === 'number' && Date.now() - d.waktu < UMUR_DRAF) {
        const k = KATEGORI.some((x) => x.id === d.kategori) ? (d.kategori as number) : null;
        const t = d.titik && Number.isFinite(d.titik.lat) && Number.isFinite(d.titik.lng) ? d.titik : null;
        const teks = typeof d.deskripsi === 'string' ? d.deskripsi.slice(0, MAKS_DESKRIPSI + 50) : '';
        // Sekali saja setelah hidrasi: localStorage tidak ada di server, jadi draf tidak bisa jadi nilai awal state.
        /* eslint-disable react-hooks/set-state-in-effect */
        if (k) setKategori(k);
        if (t) setTitik(t);
        if (teks) setDeskripsi(teks);
        if (k || t || teks.trim()) setDrafDipulihkan(true);
        /* eslint-enable react-hooks/set-state-in-effect */
      }
    } catch {
      // Draf rusak atau penyimpanan diblokir: mulai dari kosong.
    }
    drafSiap.current = true;
  }, []);

  function mulaiKosong() {
    hapusDraf();
    setKategori(null);
    setTitik(null);
    setDeskripsi('');
    setDrafDipulihkan(false);
  }

  useEffect(() => {
    muatKecamatan().then(setBatas, () => { setBatas([]); setLokasiGalat('Batas wilayah gagal dimuat. Muat ulang halaman untuk mencoba lagi.'); });
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
      try {
      const { data, error } = await createClient().rpc('similar_reports', {
        p_category_id: kategori,
        p_lat: titik.lat,
        p_lng: titik.lng,
      });
      if (!batal) setHasilSerupa({ kunci: kunciSerupa, data: error ? [] : ((data ?? []) as Serupa[]), waktu: Date.now() });
      } catch {
        if (!batal) setHasilSerupa({ kunci: kunciSerupa, data: [], waktu: Date.now() });
      }
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
    if (!files || prosesFoto.current) return;
    prosesFoto.current = true;
    setFotoMemproses(true);
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
    prosesFoto.current = false;
    setFotoMemproses(false);
  }

  function hapusFoto(id: string) {
    setFoto((x) => {
      const f = x.find((y) => y.id === id);
      if (f) URL.revokeObjectURL(f.pratinjau);
      return x.filter((y) => y.id !== id);
    });
  }

  // Klik di halaman ini menang; sebelum ada klik, pakai status dari server.
  const sudah = (s: Serupa) => didukung[s.kode] ?? s.didukung ?? false;

  async function dukung(kode: string) {
    setGalatDukung(null);
    const { data, error } = await createClient().rpc('toggle_upvote', { p_kode: kode });
    if (error) return setGalatDukung(pesanError(error));
    const hasil = data as { upvoted: boolean; jumlah_upvote: number };
    setDidukung((d) => ({ ...d, [kode]: hasil.upvoted }));
    setHasilSerupa((h) =>
      h ? { ...h, data: h.data.map((x) => (x.kode === kode ? { ...x, jumlah_upvote: hasil.jumlah_upvote } : x)) } : h,
    );
  }

  const panjang = deskripsi.trim().length;
  const semuaMasalah: { langkah: number; teks: string | false }[] = [
    { langkah: 1, teks: !kategori && 'Pilih salah satu kategori.' },
    { langkah: 2, teks: (!batas || batas.length === 0) && 'Tunggu peta wilayah selesai dimuat. Jika gagal, muat ulang halaman.' },
    { langkah: 2, teks: !titik && 'Ketuk peta untuk menaruh titik lokasi.' },
    { langkah: 2, teks: diLuar && 'Titik berada di luar DKI Jakarta daratan; pindahkan ke wilayah layanan.' },
    { langkah: 3, teks: foto.length === 0 && 'Tambahkan minimal satu foto.' },
    { langkah: 4, teks: panjang < MIN_DESKRIPSI && `Tulis minimal ${MIN_DESKRIPSI} karakter (sekarang ${panjang}).` },
    { langkah: 4, teks: panjang > MAKS_DESKRIPSI && `Persingkat menjadi maksimal ${MAKS_DESKRIPSI} karakter.` },
  ];
  const masalah = semuaMasalah.filter((m): m is { langkah: number; teks: string } => Boolean(m.teks));
  const galatLangkah = (n: number) => (cobaKirim ? masalah.filter((m) => m.langkah === n).map((m) => m.teks) : []);
  const lengkap = [1, 2, 3, 4].filter((n) => !masalah.some((m) => m.langkah === n));

  async function kirim(e: React.FormEvent) {
    e.preventDefault();
    if (tahap !== 'isi' || prosesFoto.current) return;
    setCobaKirim(true);
    setPercobaan((p) => p + 1);
    if (masalah.length > 0 || !titik || !kategori) {
      // Fokus ke ringkasan supaya pembaca layar dan keyboard langsung tahu apa yang kurang.
      window.requestAnimationFrame(() => ringkasan.current?.focus());
      return;
    }
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
      drafSiap.current = false;
      hapusDraf();
      router.push(`/laporan/${(data as { kode: string }).kode}?baru=1`);
    } catch (err) {
      setGalat(pesanError(err));
      setTahap('isi');
    }
  }

  const sibuk = tahap !== 'isi';
  const ISI_RINGKAS = [
    { n: 1, label: 'Kategori', isi: KATEGORI.find((k) => k.id === kategori)?.nama },
    { n: 2, label: 'Lokasi', isi: wilayah ? `Kec. ${wilayah.kecamatan}` : undefined },
    { n: 3, label: 'Foto', isi: foto.length ? `${foto.length} foto` : undefined },
    { n: 4, label: 'Cerita', isi: panjang ? `${panjang} karakter` : undefined },
  ];

  return (
    <form onSubmit={kirim} noValidate className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start xl:grid-cols-[minmax(0,1fr)_21rem]">
      <fieldset disabled={sibuk || fotoMemproses} className="contents">
      <legend className="sr-only">Isi laporan masalah</legend>
      <div className="grid min-w-0 gap-5">
      {drafDipulihkan && (
        <div role="status" className="ganti flex flex-wrap items-center gap-x-4 gap-y-2 rounded-kontrol bg-biru-muda px-4 py-3 text-kecil text-biru-tua sm:text-badan">
          <Ikon nama="info" className="size-5 shrink-0" />
          <span className="min-w-0 flex-1">Isian terakhir Anda dipulihkan. Foto perlu ditambahkan lagi.</span>
          <button type="button" onClick={mulaiKosong} className="font-semibold underline underline-offset-2 hover:text-biru">
            Mulai dari kosong
          </button>
        </div>
      )}
      <Langkah n={1} selesai={lengkap.includes(1)} galat={galatLangkah(1)} judul="Masalahnya apa?" petunjuk="Urgensi dan dinas penanggung jawab ditentukan dari kategori, bukan dipilih pelapor.">
        <fieldset>
          <legend className="sr-only">Kategori</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {KATEGORI.map((k) => (
              <label
                key={k.id}
                className="group grid cursor-pointer grid-cols-[1.25rem_1fr] items-start gap-x-3 gap-y-1 rounded-kartu border border-garis bg-permukaan p-4 transition-[background-color,border-color,scale] duration-200 hover:border-biru active:scale-[0.99] has-checked:border-biru has-checked:bg-biru-muda has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-biru"
              >
                <input type="radio" name="kategori" value={k.id} checked={kategori === k.id} onChange={() => setKategori(k.id)} className="sr-only" />
                <span aria-hidden="true" className="mt-1 flex size-5 items-center justify-center rounded-full border-2 border-garis-isian bg-permukaan group-has-[:checked]:border-biru">
                  <span className="size-2.5 rounded-full bg-biru opacity-0 transition-opacity group-has-[:checked]:opacity-100" />
                </span>
                <span className="text-lead font-bold">{k.nama}</span>
                <span className="col-start-2 text-kecil text-lembut">
                  {k.instansi} · urgensi {k.urgensi.toLowerCase()} · respons {k.respons} jam, selesai {k.selesai / 24} hari
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </Langkah>

      <Langkah n={2} selesai={lengkap.includes(2)} galat={galatLangkah(2)} judul="Di mana tepatnya?" petunjuk="Ketuk peta untuk menaruh titik, lalu geser titiknya kalau perlu. Kecamatan dan instansi ditentukan otomatis.">
        <div className="peta isolate overflow-hidden bg-lapis" data-ui>
          <PetaPin titik={titik} onPilih={setTitik} />
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-badan" aria-live="polite">
            {!titik ? (
              <span className="text-lembut">Belum ada titik.</span>
            ) : diLuar ? (
              <span className="font-bold text-merah-tua">Titik ini di luar DKI Jakarta daratan. Pindahkan ke wilayah layanan.</span>
            ) : wilayah ? (
              <span className="inline-flex items-center gap-1.5 font-semibold">
                <Ikon nama="lokasi" className="size-4 text-biru" />
                Kecamatan {wilayah.kecamatan}, {wilayah.kota}
              </span>
            ) : (
              <span className="text-lembut">Memeriksa wilayah…</span>
            )}
            {serupa && serupa.length > 0 && (
              <span className="sr-only"> Ada {serupa.length} laporan serupa dalam 100 meter, tercantum di bawah peta.</span>
            )}
          </p>
          <Tombol varian="garis" onClick={pakaiLokasiSaya} disabled={mencariLokasi}>
            <Ikon nama={mencariLokasi ? 'muat' : 'lokasi'} className={`size-4 ${mencariLokasi ? 'putar' : ''}`} />
            {mencariLokasi ? 'Membaca lokasi…' : 'Pakai lokasi saya'}
          </Tombol>
        </div>
        {lokasiGalat && (
          <p role="alert" className="mt-2 text-kecil font-semibold text-merah-tua">
            {lokasiGalat}
          </p>
        )}

        {/* Laporan serupa langsung di bawah peta: warga tahu sebelum memotret dan menulis cerita (FR-B3). */}
        {serupa && serupa.length > 0 && (
          <section aria-labelledby="judul-serupa" className="ganti mt-4 rounded-kontrol bg-biru-pudar p-4 sm:p-5">
            <h3 id="judul-serupa" className="flex items-center gap-2 text-badan font-bold text-biru-tua">
              <Ikon nama="info" className="size-5" />
              Sudah ada {serupa.length} laporan serupa dalam 100 meter
            </h3>
            <p className="mt-1.5 max-w-[60ch] text-kecil text-lembut">
              Dukung laporan yang sudah ada supaya suaranya terkumpul di satu tempat. Kalau masalahnya memang berbeda, tetap
              lanjutkan laporan baru.
            </p>
            <ul className="mt-4 grid gap-2">
              {serupa.map((s) => (
                <li key={s.kode} className="flex flex-wrap items-center gap-x-5 gap-y-3 rounded-kontrol border border-garis bg-permukaan p-4">
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-3">
                      <Link href={`/laporan/${s.kode}`} target="_blank" className="font-kode angka font-bold text-biru-tua underline-offset-4 hover:underline">
                        {s.kode}
                        <span className="sr-only"> (tab baru)</span>
                      </Link>
                      <BadgeStatus status={s.status} />
                    </p>
                    <p className="mt-1 text-kecil text-lembut">
                      {s.jarak_m} m dari titik Anda · {lalu(s.created_at, hasilSerupa?.waktu ?? Date.parse(s.created_at))} · {s.jumlah_upvote} dukungan
                    </p>
                  </div>
                  <Tombol varian={sudah(s) ? 'kedua' : 'utama'} onClick={() => dukung(s.kode)} aria-pressed={sudah(s)}>
                    <Ikon nama="dukung" className="size-4" isi={sudah(s)} />
                    {sudah(s) ? 'Didukung' : 'Dukung'}
                  </Tombol>
                </li>
              ))}
            </ul>
            {galatDukung && (
              <p role="alert" className="mt-3 text-kecil font-semibold text-merah-tua">
                {galatDukung}
              </p>
            )}
          </section>
        )}
      </Langkah>

      <Langkah n={3} selesai={lengkap.includes(3)} galat={galatLangkah(3)} judul="Foto masalahnya" petunjuk="1 sampai 3 foto JPG, PNG, atau WebP, maksimal 20 MB per foto. Foto dikecilkan dan data lokasi di dalam file dibuang sebelum diunggah.">
        <p className="flex gap-2 rounded-kontrol bg-oranye-muda p-3 text-kecil text-st-menunggu">
          <Ikon nama="peringatan" className="mt-0.5 size-4 shrink-0" />
          Jangan memotret wajah atau plat nomor orang lain. Foto tampil publik.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {foto.map((f, i) => (
            <figure key={f.id} className="pop relative">
              {/* eslint-disable-next-line @next/next/no-img-element -- pratinjau blob lokal */}
              <img src={f.pratinjau} alt={`Foto ${i + 1} yang dipilih`} className="aspect-square w-full rounded-kartu bg-lapis object-cover" />
              <button
                type="button"
                onClick={() => hapusFoto(f.id)}
                disabled={sibuk}
                className="absolute top-2 right-2 flex size-10 items-center justify-center rounded-full bg-navy/85 text-white hover:bg-navy"
                aria-label={`Hapus foto ${i + 1}`}
              >
                <Ikon nama="tutup" className="size-4" />
              </button>
            </figure>
          ))}
          {/* Selama foto dikecilkan di perangkat (bisa beberapa detik untuk foto besar), petak tambah foto berganti
              menjadi penanda proses, karena seluruh form sedang dikunci. */}
          {fotoMemproses && (
            <p role="status" className="flex aspect-square flex-col items-center justify-center gap-2 rounded-kartu border-2 border-dashed border-biru bg-biru-pudar p-4 text-center text-kecil font-semibold text-biru-tua">
              <Ikon nama="muat" className="putar size-7" />
              Memproses foto…
            </p>
          )}
          {foto.length < MAKS_FOTO && !fotoMemproses && (
            <label
              htmlFor={idInputFoto}
              className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-kartu border-2 border-dashed border-garis-isian bg-latar p-4 text-center text-kecil font-semibold transition-colors hover:border-biru hover:bg-biru-pudar hover:text-biru-tua has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-biru"
            >
              <Ikon nama="kamera" className="size-7" />
              Tambah foto
              <span className="font-normal text-lembut">
                {foto.length} dari {MAKS_FOTO}
              </span>
              <input
                ref={inputFoto}
                id={idInputFoto}
                type="file"
                accept={TIPE_FOTO.join(',')}
                multiple
                onChange={(e) => tambahFoto(e.target.files)}
                className="sr-only"
                data-ukuran-maks={UKURAN_MAKS}
              />
            </label>
          )}
        </div>
        {fotoGalat && (
          <p role="alert" className="mt-2 text-kecil font-semibold text-merah-tua">
            {fotoGalat}
          </p>
        )}
      </Langkah>

      <Langkah n={4} selesai={lengkap.includes(4)} galat={galatLangkah(4)} judul="Ceritakan singkat" petunjuk="Apa yang terjadi, sejak kapan, dan dampaknya. 20 sampai 500 karakter.">
        <label htmlFor="deskripsi" className="sr-only">
          Deskripsi
        </label>
        <textarea
          id="deskripsi"
          value={deskripsi}
          onChange={(e) => setDeskripsi(e.target.value)}
          rows={5}
          maxLength={MAKS_DESKRIPSI + 50}
          aria-describedby={`hitung-deskripsi${galatLangkah(4).length ? ' galat-langkah-4' : ''}`}
          aria-invalid={galatLangkah(4).length > 0 || undefined}
          className="w-full p-4 text-badan"
          placeholder="Contoh: Lubang besar di lajur kiri dekat halte, motor sering oleng saat malam karena lampu jalan mati."
        />
        <p id="hitung-deskripsi" className={`angka mt-1 text-kecil ${panjang > MAKS_DESKRIPSI ? 'font-bold text-merah-tua' : 'text-lembut'}`}>
          {panjang} / {MAKS_DESKRIPSI} karakter{panjang < MIN_DESKRIPSI ? `, minimal ${MIN_DESKRIPSI}` : ''}
        </p>
      </Langkah>
      </div>

      {/* Ringkasan: seperti ringkasan pesanan, menempel di kanan selama form digulir. */}
      <aside aria-labelledby="judul-ringkasan" className="lg:sticky lg:top-20">
        <div className="kartu p-5">
          <h2 id="judul-ringkasan" className="text-lead font-bold">
            Ringkasan laporan
          </h2>
          <ul className="mt-4 grid gap-2.5">
            {ISI_RINGKAS.map((r) => {
              const ok = lengkap.includes(r.n);
              return (
                <li key={r.n} className="flex items-center justify-between gap-3 text-kecil">
                  <span className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className={`flex size-5 items-center justify-center rounded-full text-mini font-bold ${ok ? 'bg-hijau text-white' : 'bg-lapis text-lembut'}`}
                    >
                      {ok ? <Ikon nama="centang" className="size-3" /> : r.n}
                    </span>
                    {r.label}
                  </span>
                  <span className={`truncate text-right ${ok ? 'font-semibold' : 'text-lembut'}`}>{r.isi ?? 'Belum diisi'}</span>
                </li>
              );
            })}
          </ul>
          <p className="mt-4 flex items-center gap-3 border-t border-garis pt-4 text-kecil font-bold">
            <span className="angka">{lengkap.length} dari 4 langkah lengkap</span>
            <span aria-hidden="true" className="flex flex-1 gap-1">
              {[1, 2, 3, 4].map((n) => (
                <span key={n} className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${lengkap.includes(n) ? 'bg-hijau' : 'bg-lapis-2'}`} />
              ))}
            </span>
          </p>

          <div className="mt-4">
            {cobaKirim && masalah.length > 0 ? (
              <div
                key={percobaan}
                ref={ringkasan}
                tabIndex={-1}
                role="alert"
                className="goyang rounded-kontrol bg-merah-muda p-3 outline-none focus-visible:outline-2 focus-visible:outline-merah"
              >
                <p className="text-kecil font-bold text-merah-tua">Belum bisa dikirim: {masalah.length} hal perlu dilengkapi</p>
                <ul className="mt-2 grid gap-1">
                  {masalah.map((m) => (
                    <li key={m.teks}>
                      <a href={`#bagian-langkah-${m.langkah}`} className="text-kecil text-merah-tua underline underline-offset-4">
                        Langkah {m.langkah}: {m.teks}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : galat ? (
              <p role="alert" className="rounded-kontrol bg-merah-muda p-3 text-kecil font-bold text-merah-tua">
                {galat} Isian Anda masih tersimpan; tekan tombol kirim untuk mencoba lagi.
              </p>
            ) : (
              <p className="text-kecil text-lembut">
                Setelah terkirim Anda mendapat kode SR untuk melacak laporan. Status awalnya Menunggu sampai dinas merespons.
              </p>
            )}
          </div>
          <Tombol type="submit" disabled={sibuk} className="mt-4 min-h-12 w-full text-lead">
            {sibuk && <Ikon nama="muat" className="putar size-5" />}
            {tahap === 'mengunggah' ? 'Mengunggah foto…' : tahap === 'mengirim' ? 'Mengirim laporan…' : galat ? 'Coba kirim lagi' : 'Kirim laporan'}
          </Tombol>
        </div>
      </aside>
      </fieldset>
    </form>
  );
}
