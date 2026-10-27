import Link from 'next/link';
import type { DetailLaporan } from '@/lib/data/laporan';
import { tanggalJam, desimal, persen } from '@/lib/format';
import type { RaporInstansi } from '@/lib/types';
import BadgeStatus from '../BadgeStatus';
import { kelasTautan } from '../ui/Tombol';

export default function AlurLapor({ rapor, contoh }: { rapor: RaporInstansi[]; contoh: DetailLaporan | null }) {
  const l = contoh?.laporan;
  const instansi = rapor.find((r) => r.peringatan_penolakan) ?? rapor[0];
  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
      <div className="lg:col-span-5" data-muncul>
        <h2 id="judul-alur" className="text-judul">Satu laporan.<br />Jejaknya terbuka.</h2>
        <p className="mt-5 max-w-[38ch] text-badan">Warga membawa bukti. Instansi mencatat tindak lanjut. Publik bisa memeriksa keduanya.</p>
        <p className="mt-4 max-w-[38ch] text-kecil text-lembut">Cuplikan di samping diambil dari data yang sedang tampil. Semua laporan dan penilaian merupakan simulasi.</p>
      </div>
      <ol className="grid gap-6 lg:col-span-7" data-muncul>
        <li className="bg-lapis p-5 sm:p-7">
          <h3 className="text-lead">Bukti dari warga</h3>
          {l ? <>
            <p className="mt-3 text-badan">{l.deskripsi ?? 'Isi laporan disembunyikan untuk melindungi data pribadi.'}</p>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3" data-ui>
              <Link href={`/laporan/${l.kode}`} className={kelasTautan}>{l.kategori} · {l.kecamatan}</Link>
              <BadgeStatus status={l.status} />
            </div>
          </> : <p className="mt-3 text-badan">Foto, titik lokasi, dan cerita singkat membuat masalah lebih mudah diperiksa.</p>}
        </li>
        <li className="pl-5 sm:pl-7">
          <h3 className="text-lead">Tindak lanjut tercatat</h3>
          {contoh?.timeline.length ? <ol className="mt-4 grid gap-4" data-ui>{contoh.timeline.slice(-2).map((t) => (
            <li key={`${t.created_at}-${t.status_baru}`}>
              <div className="flex flex-wrap items-center gap-3"><BadgeStatus status={t.status_baru} /><span className="text-kecil text-lembut">{tanggalJam(t.created_at)} · {t.pelaku}</span></div>
              {t.catatan && <p className="mt-2 text-badan">{t.catatan}</p>}
            </li>
          ))}</ol> : <p className="mt-3 text-badan">Status, waktu, bukti penyelesaian, dan alasan penolakan dapat dilihat siapa saja.</p>}
        </li>
        <li className="di-medan bg-medan p-5 text-medan-tinta sm:p-7">
          <h3 className="text-lead">Kinerja bisa diperiksa</h3>
          {instansi && <div className="mt-4 flex items-start gap-5" data-ui>
            <span className="angka text-judul">{instansi.huruf ?? '–'}</span>
            <div><p className="text-badan font-semibold">{instansi.nama}</p>
              <p className="mt-1 text-badan">Nilai {desimal(instansi.nilai)} · ditolak {persen(instansi.tingkat_penolakan)}</p>
              {instansi.peringatan_penolakan && <p className="mt-2 text-kecil text-medan-lembut">Penolakan tinggi membatasi huruf maksimal C, meskipun nilai angkanya lebih baik.</p>}
            </div>
          </div>}
          <Link href="/rapor" className="mt-5 inline-flex min-h-11 items-center text-badan underline underline-offset-4">Baca rapor dan cara menilainya</Link>
        </li>
      </ol>
    </div>
  );
}
