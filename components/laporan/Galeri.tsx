// components/laporan/Galeri.tsx — foto sebelum dan sesudah berdampingan (FR-C1, PRD 7.5), pemilik: A
// Klaim "Selesai" dari dinas bisa dicek warga: foto bukti tampil di samping foto laporan.

import Image from 'next/image';
import type { LaporanPublik } from '@/lib/types';
import Ikon from '../ui/Ikon';

function Kosong({ teks }: { teks: string }) {
  return (
    <div className="flex aspect-[16/7] flex-col items-center justify-center gap-2 rounded-kartu border border-dashed border-garis-isian bg-latar p-6 text-center text-kecil text-lembut">
      <Ikon nama="kamera" className="size-7" />
      {teks}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <figcaption className="mt-2 flex items-center gap-1.5 text-kecil text-lembut">
      <Ikon nama="kamera" className="size-3.5" />
      {children}
    </figcaption>
  );
}

export default function Galeri({ laporan }: { laporan: Pick<LaporanPublik, 'foto' | 'foto_bukti' | 'status' | 'alasan_tolak' | 'is_simulated'> }) {
  if (laporan.alasan_tolak === 'konten_melanggar') {
    return <Kosong teks="Foto dan cerita laporan ini disembunyikan karena berisi hal yang tidak pantas atau data pribadi orang lain." />;
  }
  const selesai = laporan.status === 'selesai';
  const [utama, ...lain] = laporan.foto;

  return (
    <div className={`grid gap-3 ${selesai ? 'sm:grid-cols-2' : ''}`}>
      <figure>
        {utama ? (
          <Image src={utama} loading="eager" fetchPriority="high" sizes="(min-width: 1024px) 50vw, 100vw" alt={laporan.is_simulated ? 'Foto ilustrasi (data buatan), bukan foto asli lokasi' : 'Foto dari pelapor'} width={960} height={720} className="aspect-4/3 w-full rounded-kartu bg-lapis object-cover" />
        ) : (
          <Kosong teks={laporan.is_simulated ? 'Laporan simulasi ini tidak punya foto.' : 'Foto tidak tersedia.'} />
        )}
        {/* Foto seed adalah foto ilustrasi berlisensi bebas, bukan foto lapangan (PRD 10: data simulasi selalu diberi label). */}
        <Label>{laporan.is_simulated ? 'Foto ilustrasi (data buatan), bukan foto asli lokasi' : selesai ? 'Sebelum · foto dari pelapor' : 'Foto dari pelapor'}</Label>
        {lain.length > 0 && (
          <div className="mt-3 grid grid-cols-2 gap-3">
            {lain.map((src, i) => (
              <Image key={src} src={src} sizes="(min-width: 1024px) 25vw, 50vw" alt={`Foto tambahan ${i + 2} dari pelapor`} width={480} height={360} className="aspect-4/3 w-full rounded-kartu bg-lapis object-cover" />
            ))}
          </div>
        )}
      </figure>
      {selesai && (
        <figure>
          {laporan.foto_bukti ? (
            <Image src={laporan.foto_bukti} sizes="(min-width: 1024px) 50vw, 100vw" alt={laporan.is_simulated ? 'Foto contoh (data buatan), bukan bukti asli' : 'Foto bukti penyelesaian dari dinas'} width={960} height={720} className="aspect-4/3 w-full rounded-kartu bg-lapis object-cover" />
          ) : (
            <Kosong teks={laporan.is_simulated ? 'Laporan simulasi ini tidak punya foto bukti.' : 'Foto bukti tidak tersedia.'} />
          )}
          <Label>{laporan.is_simulated ? 'Contoh lampiran penyelesaian · bukan bukti lapangan' : 'Sesudah · foto bukti dari dinas'}</Label>
        </figure>
      )}
    </div>
  );
}
