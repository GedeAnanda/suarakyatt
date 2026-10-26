// components/laporan/Galeri.tsx — foto sebelum dan sesudah berdampingan (FR-C1, PRD 7.5), pemilik: A
// Klaim "Selesai" dari dinas bisa dicek warga: foto bukti tampil di samping foto laporan.

import Image from 'next/image';
import type { LaporanPublik } from '@/lib/types';
import Ikon from '../ui/Ikon';

function Kosong({ teks }: { teks: string }) {
  return (
    <div className="flex aspect-[16/7] flex-col items-center justify-center gap-2 rounded-(--radius-kartu) border border-dashed border-lapis-2 bg-terang p-6 text-center text-kecil text-lembut">
      <Ikon nama="kamera" className="size-7" />
      {teks}
    </div>
  );
}

export default function Galeri({ laporan }: { laporan: Pick<LaporanPublik, 'foto' | 'foto_bukti' | 'status' | 'alasan_tolak' | 'is_simulated'> }) {
  if (laporan.alasan_tolak === 'konten_melanggar') {
    return <Kosong teks="Isi dan foto laporan ini disembunyikan karena ditolak dengan alasan konten melanggar." />;
  }
  const selesai = laporan.status === 'selesai';
  const [utama, ...lain] = laporan.foto;
  const ilustrasi = utama?.startsWith('/demo/');
  const buktiIlustrasi = laporan.foto_bukti?.startsWith('/demo/');

  return (
    <div className={`grid gap-3 ${selesai ? 'sm:grid-cols-2' : ''}`}>
      <figure>
        {utama ? (
          <Image src={utama} alt={ilustrasi ? "Lampiran ilustrasi simulasi, bukan foto lapangan" : "Foto dari pelapor"} width={960} height={720} className="aspect-4/3 w-full rounded-(--radius-kartu) bg-lapis object-cover" />
        ) : (
          <Kosong teks={laporan.is_simulated ? 'Laporan simulasi ini tidak punya foto.' : 'Foto tidak tersedia.'} />
        )}
        <figcaption className="mt-2 text-kecil text-lembut">{ilustrasi ? 'Lampiran simulasi · bukan foto lapangan' : selesai ? 'Sebelum · foto dari pelapor' : 'Foto dari pelapor'}</figcaption>
        {lain.length > 0 && (
          <div className="mt-3 grid grid-cols-2 gap-3">
            {lain.map((src, i) => (
              <Image key={src} src={src} alt={`Foto tambahan ${i + 2} dari pelapor`} width={480} height={360} className="aspect-4/3 w-full rounded-(--radius-kartu) bg-lapis object-cover" />
            ))}
          </div>
        )}
      </figure>
      {selesai && (
        <figure>
          {laporan.foto_bukti ? (
            <Image src={laporan.foto_bukti} alt={buktiIlustrasi ? "Lampiran contoh, bukan bukti penyelesaian" : "Foto bukti penyelesaian dari dinas"} width={960} height={720} className="aspect-4/3 w-full rounded-(--radius-kartu) bg-lapis object-cover" />
          ) : (
            <Kosong teks={laporan.is_simulated ? 'Laporan simulasi ini tidak punya foto bukti.' : 'Foto bukti tidak tersedia.'} />
          )}
          <figcaption className="mt-2 text-kecil text-lembut">{buktiIlustrasi ? 'Contoh lampiran penyelesaian · bukan bukti lapangan' : 'Sesudah · foto bukti dari dinas'}</figcaption>
        </figure>
      )}
    </div>
  );
}
