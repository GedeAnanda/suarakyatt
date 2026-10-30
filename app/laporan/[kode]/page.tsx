// app/laporan/[kode]/page.tsx — Detail & Lacak (SDD 9), pemilik: A
// Operasi SDD 6: Q2 v_laporan_publik + v_timeline_publik, R4 toggle_upvote, R5 cancel_report,
// R7 rate_report, R9 priority_factors + L1 kenapaBelum (lib/scoring) untuk panel "Kenapa belum?".
// Seperti halaman detail di situs travel: kartu ringkasan + peta di atas, foto dan cerita di kiri,
// lalu kolom kanan yang menempel: "Kenapa belum?", dukungan, batas waktu, dan riwayat.

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import BadgeStatus, { WARNA_TITIK } from '@/components/BadgeStatus';
import IndikatorSLA from '@/components/IndikatorSLA';
import { FormRating, TombolBatalkan, TombolDukung } from '@/components/laporan/AksiLaporan';
import Galeri from '@/components/laporan/Galeri';
import HapusParamBaru from '@/components/laporan/HapusParamBaru';
import SalinKode from '@/components/laporan/SalinKode';
import PanelKenapaBelum from '@/components/laporan/PanelKenapaBelum';
import Timeline from '@/components/laporan/Timeline';
import TitikTunggal from '@/components/peta/TitikTunggal';
import TombolKembali from '@/components/TombolKembali';
import Ikon from '@/components/ui/Ikon';
import LabelSumber from '@/components/ui/LabelSumber';
import { kelasTautan } from '@/components/ui/Tombol';
import { ambilDetailLaporan, ambilHubungan } from '@/lib/data/laporan';
import { ambilDataPrioritas } from '@/lib/data/prioritas';
import { akhirHari, tanggal, tanggalJam } from '@/lib/format';
import { KANAL_RESMI, LABEL_ALASAN, STATUS_AKTIF } from '@/lib/konten';
import { kenapaBelum } from '@/lib/scoring';
import type { KenapaBelum } from '@/lib/types';

export async function generateMetadata({ params }: PageProps<'/laporan/[kode]'>): Promise<Metadata> {
  const { kode } = await params;
  const k = decodeURIComponent(kode);
  return {
    title: `Laporan ${k}`,
    description: `Status, riwayat penanganan, batas waktu, dan posisi laporan ${k} di daftar prioritas SUARAKYAT, termasuk jawaban "Kenapa belum?".`,
  };
}

async function Isi({ params, searchParams }: Pick<PageProps<'/laporan/[kode]'>, 'params' | 'searchParams'>) {
  const [{ kode: mentah }, sp] = await Promise.all([params, searchParams]);
  const kode = decodeURIComponent(mentah).toUpperCase();
  const detail = await ambilDetailLaporan(kode);
  if (!detail) notFound();

  const { laporan: l, timeline, sekarang, sumber } = detail;
  const aktif = STATUS_AKTIF.includes(l.status);
  const [hubungan, prioritas] = await Promise.all([
    sumber === 'db' ? ambilHubungan(kode) : Promise.resolve({ login: false, pemilik: false, sudahRating: false, sudahDukung: false }),
    aktif ? ambilDataPrioritas() : Promise.resolve(null),
  ]);

  let jelas: KenapaBelum | null = null;
  let idIsu: string | null = null;
  if (prioritas) {
    const isu = prioritas.faktor.isu.find((i) => i.kecamatan === l.kecamatan && i.kategori === l.kategori);
    if (isu) {
      idIsu = isu.id;
      jelas = kenapaBelum(isu.id, prioritas.faktor.isu, prioritas.bobotResmi, l.status);
    }
  }
  const penolakan = l.status === 'ditolak' ? [...timeline].reverse().find((t) => t.status_baru === 'ditolak') : undefined;
  // Banner "terkirim" hanya untuk pelapornya; orang lain yang membuka tautan ?baru=1 melihat halaman biasa.
  const baru = sp.baru === '1' && hubungan.pemilik;

  return (
    <>
      {sp.baru !== undefined && <HapusParamBaru />}
      {baru && (
        <div role="status" className="pop mb-5 flex gap-3 rounded-kartu border border-st-selesai/30 bg-hijau-muda p-5">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-hijau text-white">
            <Ikon nama="centang" className="size-5" />
          </span>
          <div>
            <p className="text-lead font-bold text-hijau">Laporan terkirim. Simpan kode {l.kode} untuk melacaknya.</p>
            <p className="mt-1 max-w-[75ch] text-kecil">
              Laporan di SUARAKYAT tidak diteruskan ke instansi. Untuk pengaduan resmi, kirim juga lewat{' '}
              {KANAL_RESMI.map((k, i) => (
                <span key={k.nama}>
                  {i > 0 && ' atau '}
                  <a href={k.url} target="_blank" rel="noreferrer" className="font-bold text-biru-tua underline">
                    {k.nama}
                  </a>
                </span>
              ))}
              .
            </p>
          </div>
        </div>
      )}

      <div className="kartu grid overflow-hidden lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <div className="p-5 sm:p-7">
          <div className="flex flex-wrap items-center gap-2">
            <BadgeStatus status={l.status} besar />
            {(l.is_simulated || sumber === 'contoh') && <LabelSumber sumber={sumber} />}
          </div>
          <h1 className="font-kode angka mt-4 text-[clamp(2.25rem,1.5rem+3vw,3.75rem)] leading-none font-bold tracking-[-0.01em] text-teks">
            {l.kode}
          </h1>
          <div className="mt-3">
            <SalinKode kode={l.kode} />
          </div>
          <p className="mt-5 text-sub font-bold">
            {l.kategori} di {l.kecamatan}, {l.kota}
          </p>
          <p className="mt-1 text-kecil text-lembut">
            Dilaporkan {tanggalJam(l.created_at)} oleh {l.inisial_pelapor || 'warga'} · ditangani {l.instansi}
          </p>
          <div className="mt-4 rounded-kontrol bg-latar px-4 py-3">
            <IndikatorSLA laporan={l} sekarang={sekarang} />
            {l.perkiraan_selesai && (
              <p className="mt-2 text-kecil">
                Perkiraan selesai dari dinas: <strong className="font-bold">{tanggal(l.perkiraan_selesai)}</strong>
                {aktif && sekarang > akhirHari(l.perkiraan_selesai) && (
                  <span className="ml-2 rounded-[0.375rem] bg-merah-muda px-2 py-0.5 text-mini font-bold text-merah-tua">Melewati janji</span>
                )}
              </p>
            )}
          </div>
        </div>
        <div className="border-t border-garis p-3 lg:border-t-0 lg:border-l">
          <TitikTunggal lat={l.lat} lng={l.lng} warna={WARNA_TITIK[l.status]} label={`Lokasi ${l.kode}`} />
          <p className="mt-2 px-1 text-mini text-lembut">Yang tampil publik hanya lokasi masalah, bukan identitas pelapor.</p>
        </div>
      </div>

      {penolakan && (
        <section aria-labelledby="judul-tolak" className="di-gelap mt-5 rounded-kartu bg-navy p-5 text-white sm:p-6">
          <h2 id="judul-tolak" className="flex items-center gap-2 text-lead font-bold">
            <Ikon nama="peringatan" className="size-5" />
            Ditolak · {penolakan.alasan_tolak ? LABEL_ALASAN[penolakan.alasan_tolak] : 'tanpa alasan tercatat'}
          </h2>
          {penolakan.catatan && <p className="mt-2 max-w-[70ch] text-badan">&ldquo;{penolakan.catatan}&rdquo; · {penolakan.pelaku}</p>}
          <p className="mt-3 text-kecil text-white/80">
            Laporan yang ditolak tetap tampil publik. Penolakan &ldquo;Tidak valid&rdquo; dan &ldquo;Konten melanggar&rdquo;
            dihitung di tingkat penolakan instansi pada Rapor Instansi.
          </p>
        </section>
      )}

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:items-start">
        <section aria-labelledby="judul-isi" className="kartu p-5 sm:p-6">
          <h2 id="judul-isi" className="text-lead font-bold">
            Isi laporan
          </h2>
          <div className="mt-4">
            <Galeri laporan={l} />
          </div>
          <p className="mt-5 max-w-[65ch] text-lead">
            {l.deskripsi === null ? 'Isi laporan ini disembunyikan karena ditolak dengan alasan konten melanggar.' : `“${l.deskripsi}”`}
          </p>
        </section>

        {/* Kanan: "Kenapa belum?" paling atas (fitur khas, langsung di samping foto), lalu dukungan, batas waktu,
            dan riwayat penanganan. Di ponsel urutannya tetap foto → kutipan → Kenapa belum. */}
        <aside className="grid content-start gap-4">
          {aktif && <PanelKenapaBelum data={jelas} isu={{ kategori: l.kategori, kecamatan: l.kecamatan }} idIsu={idIsu} />}
          <TombolDukung
            kode={l.kode}
            jumlahAwal={l.jumlah_upvote}
            status={l.status}
            login={hubungan.login}
            pemilik={hubungan.pemilik}
            didukungAwal={hubungan.sudahDukung}
            contoh={sumber === 'contoh'}
          />
          {hubungan.pemilik && l.status === 'menunggu' && <TombolBatalkan kode={l.kode} />}
          {hubungan.pemilik && l.status === 'selesai' && !hubungan.sudahRating && <FormRating kode={l.kode} />}
          {sumber === 'contoh' && (
            <p className="flex gap-2 rounded-kartu bg-oranye-muda p-4 text-kecil text-st-menunggu">
              <Ikon nama="info" className="mt-0.5 size-4 shrink-0" />
              Ini laporan dari data contoh. Tombol dukung, batal, dan rating aktif untuk laporan yang tersimpan di database.
            </p>
          )}
          <div className="kartu p-5 text-kecil">
            <p className="flex items-center gap-2 font-bold">
              <Ikon nama="jam" className="size-4 text-biru" />
              Batas waktu layanan untuk {l.kategori.toLowerCase()}
            </p>
            <p className="mt-1.5 text-lembut">
              Respons sampai {tanggalJam(l.batas_respons)}, selesai sampai {tanggalJam(l.batas_selesai)}. Angka batas waktu
              per kategori adalah ilustrasi; lihat{' '}
              <Link href="/sumber-data" className={kelasTautan}>
                sumber data
              </Link>
              .
            </p>
          </div>
          <section aria-labelledby="judul-riwayat" className="kartu scroll-mt-24 p-5">
            <h2 id="judul-riwayat" className="text-lead font-bold">
              Riwayat penanganan
            </h2>
            <div className="mt-5">
              <Timeline item={timeline} berjalan={aktif} />
            </div>
          </section>
        </aside>
      </div>
    </>
  );
}

function Kerangka() {
  return (
    <div aria-hidden="true" className="grid gap-5">
      <div className="kerangka h-72" />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <div className="kerangka h-[28rem]" />
        <div className="kerangka h-64" />
      </div>
    </div>
  );
}

export default function DetailLaporanPage({ params, searchParams }: PageProps<'/laporan/[kode]'>) {
  return (
    <div className="bingkai pt-6 pb-4 sm:pt-8">
      <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2">
      <TombolKembali cadangan="/peta" />
      <nav aria-label="Jejak halaman">
        <ol className="flex flex-wrap items-center gap-1 text-kecil text-lembut">
          <li className="flex items-center gap-1">
            <Link href="/" className="hover:text-biru-tua hover:underline">
              Beranda
            </Link>
            <Ikon nama="kanan" className="size-3.5" />
          </li>
          <li className="flex items-center gap-1">
            <Link href="/peta" className="hover:text-biru-tua hover:underline">
              Peta laporan
            </Link>
            <Ikon nama="kanan" className="size-3.5" />
          </li>
          <li aria-current="page" className="font-medium text-teks">
            Lacak laporan
          </li>
        </ol>
      </nav>
      </div>
      <Suspense fallback={<Kerangka />}>
        <Isi params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
