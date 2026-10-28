// app/laporan/[kode]/page.tsx — Detail & Lacak (SDD 9), pemilik: A
// Operasi SDD 6: Q2 v_laporan_publik + v_timeline_publik, R4 toggle_upvote, R5 cancel_report,
// R7 rate_report, R9 priority_factors + L1 kenapaBelum (lib/scoring) untuk panel "Kenapa belum?".

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import BadgeStatus, { WARNA_TITIK } from '@/components/BadgeStatus';
import IndikatorSLA from '@/components/IndikatorSLA';
import { FormRating, TombolBatalkan, TombolDukung } from '@/components/laporan/AksiLaporan';
import Galeri from '@/components/laporan/Galeri';
import SalinKode from '@/components/laporan/SalinKode';
import PanelKenapaBelum from '@/components/laporan/PanelKenapaBelum';
import Timeline from '@/components/laporan/Timeline';
import TitikTunggal from '@/components/peta/TitikTunggal';
import Ikon from '@/components/ui/Ikon';
import LabelSumber from '@/components/ui/LabelSumber';
import TeksRakit from '@/components/ui/TeksRakit';
import { kelasTautan } from '@/components/ui/Tombol';
import { ambilDetailLaporan, ambilHubungan } from '@/lib/data/laporan';
import { ambilDataPrioritas } from '@/lib/data/prioritas';
import { tanggal, tanggalJam } from '@/lib/format';
import { KANAL_RESMI, LABEL_ALASAN, STATUS_AKTIF } from '@/lib/konten';
import { kenapaBelum } from '@/lib/scoring';
import type { KenapaBelum } from '@/lib/types';

export async function generateMetadata({ params }: PageProps<'/laporan/[kode]'>): Promise<Metadata> {
  const { kode } = await params;
  const k = decodeURIComponent(kode);
  return {
    title: `Laporan ${k}`,
    description: `Status, riwayat penanganan, batas waktu, dan posisi laporan ${k} di daftar prioritas suaRAkyat, termasuk jawaban "Kenapa belum?".`,
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
    sumber === 'db' ? ambilHubungan(kode) : Promise.resolve({ login: false, pemilik: false, sudahRating: false }),
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
  const baru = sp.baru === '1';

  return (
    <>
      {baru && (
        <div role="status" className="di-medan pop mb-10 rounded-(--radius-kartu) bg-medan p-5 text-medan-tinta sm:p-6">
          <p className="text-lead font-medium">Laporan terkirim. Simpan kode {l.kode} untuk melacaknya.</p>
          <p className="mt-2 max-w-[70ch] text-badan text-medan-lembut">
            Laporan di suaRAkyat tidak diteruskan ke instansi. Untuk pengaduan resmi, kirim juga lewat{' '}
            {KANAL_RESMI.map((k, i) => (
              <span key={k.nama}>
                {i > 0 && ' atau '}
                <a href={k.url} target="_blank" rel="noreferrer" className="text-medan-tinta underline">
                  {k.nama}
                </a>
              </span>
            ))}
            .
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-7" data-awal>
          <div className="flex flex-wrap items-center gap-3">
            <BadgeStatus status={l.status} besar />
            {(l.is_simulated || sumber === 'contoh') && <LabelSumber sumber={sumber} />}
          </div>
          {/* Kode dirakit huruf demi huruf, seperti judul Beranda; pembaca layar membaca kodenya utuh. */}
          <h1 className="font-kode angka mt-5 text-[clamp(3rem,1.6rem+6vw,7rem)] leading-[0.9] font-semibold tracking-[-0.05em]">
            <span className="sr-only">{l.kode}</span>
            <span aria-hidden="true">
              <TeksRakit teks={l.kode} sebar={0.6} jeda={150} />
            </span>
          </h1>
          <div className="mt-4">
            <SalinKode kode={l.kode} />
          </div>
          <p className="mt-5 text-pernyataan tracking-[-0.02em]">
            {l.kategori} di {l.kecamatan}, {l.kota}
          </p>
          <p className="mt-2 text-kecil text-lembut">
            Dilaporkan {tanggalJam(l.created_at)} oleh {l.inisial_pelapor || 'warga'} · ditangani {l.instansi}
          </p>
          <div className="mt-5">
            <IndikatorSLA laporan={l} sekarang={sekarang} />
          </div>
          {l.perkiraan_selesai && (
            <p className="mt-3 text-badan">
              Perkiraan selesai dari dinas: <strong className="font-semibold">{tanggal(l.perkiraan_selesai)}</strong>
              {aktif && sekarang > Date.parse(l.perkiraan_selesai) && (
                <span className="ml-2 bg-tinta px-2 py-0.5 text-kecil font-semibold text-kertas">Melewati janji</span>
              )}
            </p>
          )}
        </div>
        <div className="lg:col-span-5" data-awal>
          <TitikTunggal lat={l.lat} lng={l.lng} warna={WARNA_TITIK[l.status]} label={`Lokasi ${l.kode}`} />
          <p className="mt-2 text-kecil text-lembut">Yang tampil publik hanya lokasi masalah, bukan identitas pelapor.</p>
        </div>
      </div>

      {penolakan && (
        <section aria-labelledby="judul-tolak" className="mt-12 rounded-(--radius-kartu) bg-st-ditolak-bg p-5 text-st-ditolak sm:p-6">
          <h2 id="judul-tolak" className="flex items-center gap-2 text-lead font-medium">
            <Ikon nama="peringatan" className="size-5" />
            Ditolak · {penolakan.alasan_tolak ? LABEL_ALASAN[penolakan.alasan_tolak] : 'tanpa alasan tercatat'}
          </h2>
          {penolakan.catatan && <p className="mt-2 max-w-[70ch] text-badan">&ldquo;{penolakan.catatan}&rdquo; · {penolakan.pelaku}</p>}
          <p className="mt-3 text-kecil opacity-80">
            Laporan yang ditolak tetap tampil publik. Penolakan &ldquo;Tidak valid&rdquo; dan &ldquo;Konten melanggar&rdquo;
            dihitung di tingkat penolakan instansi pada Rapor Instansi.
          </p>
        </section>
      )}

      <div className="mt-14 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
        <div className="grid content-start gap-12 lg:col-span-7" data-muncul>
          <section aria-labelledby="judul-isi">
            <h2 id="judul-isi" className="sr-only">
              Isi laporan
            </h2>
            <Galeri laporan={l} />
            <p className="mt-6 max-w-[65ch] text-pernyataan tracking-[-0.02em]">
              {l.deskripsi === null ? 'Isi laporan ini disembunyikan karena ditolak dengan alasan konten melanggar.' : `“${l.deskripsi}”`}
            </p>
          </section>
        </div>

        {/* Kiri: isi laporan. Kanan: "Kenapa belum?" paling atas (fitur khas, langsung di samping foto), lalu
            dukungan, batas waktu, dan riwayat penanganan. Di ponsel urutannya tetap foto → kutipan → Kenapa belum. */}
        <aside className="grid content-start gap-6 lg:col-span-5" data-muncul>
          {aktif && <PanelKenapaBelum data={jelas} isu={{ kategori: l.kategori, kecamatan: l.kecamatan }} idIsu={idIsu} />}
          <TombolDukung
            kode={l.kode}
            jumlahAwal={l.jumlah_upvote}
            status={l.status}
            login={hubungan.login}
            pemilik={hubungan.pemilik}
            contoh={sumber === 'contoh'}
          />
          {hubungan.pemilik && l.status === 'menunggu' && <TombolBatalkan kode={l.kode} />}
          {hubungan.pemilik && l.status === 'selesai' && !hubungan.sudahRating && <FormRating kode={l.kode} />}
          {sumber === 'contoh' && (
            <p className="kartu p-5 text-kecil">
              Ini laporan dari data contoh. Tombol dukung, batal, dan rating aktif untuk laporan yang tersimpan di database.
            </p>
          )}
          <div className="kartu p-5 text-kecil">
            <p className="font-medium">Batas waktu layanan untuk {l.kategori.toLowerCase()}</p>
            <p className="mt-1">
              Respons sampai {tanggalJam(l.batas_respons)}, selesai sampai {tanggalJam(l.batas_selesai)}. Angka batas waktu
              per kategori adalah ilustrasi; lihat{' '}
              <Link href="/sumber-data" className={kelasTautan}>
                sumber data
              </Link>
              .
            </p>
          </div>
          <section aria-labelledby="judul-riwayat" className="mt-6">
            <h2 id="judul-riwayat" className="text-lead font-medium tracking-tight">
              Riwayat penanganan
            </h2>
            <div className="mt-6">
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
    <div aria-hidden="true" className="grid gap-8 lg:grid-cols-12">
      <div className="grid content-start gap-4 lg:col-span-7">
        <div className="kerangka h-8 w-40" />
        <div className="kerangka h-24 w-3/4" />
        <div className="kerangka h-8 w-1/2" />
      </div>
      <div className="kerangka aspect-4/3 lg:col-span-5" />
    </div>
  );
}

export default function DetailLaporanPage({ params, searchParams }: PageProps<'/laporan/[kode]'>) {
  return (
    <div className="bingkai pt-10 pb-24 sm:pt-14">
      <p className="mb-8 text-kecil">
        <Link href="/peta" className={kelasTautan}>
          Peta laporan
        </Link>
        <span className="text-lembut"> / lacak laporan</span>
      </p>
      <Suspense fallback={<Kerangka />}>
        <Isi params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
