// components/beranda/AlurLapor.tsx — dari mana datanya: lapor, dinas menjawab, warga menilai (pemilik: A)
// Setiap langkah: kalimat, lalu yang diisi (potongan form), lalu yang kembali (potongan hasil).
// Potongan memakai komponen asli aplikasi supaya tampilannya sama persis dengan halaman sebenarnya.

import BadgeStatus from '../BadgeStatus';
import Ikon from '../ui/Ikon';
import type { RaporInstansi } from '@/lib/types';
import { desimal, persen } from '@/lib/format';

function Isian({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[8rem_1fr] sm:gap-4">
      <span className="text-kecil text-lembut">{label}</span>
      <span className="text-badan">{children}</span>
    </div>
  );
}

function BarisRapor({ i }: { i: RaporInstansi }) {
  const tertahan = i.huruf !== i.huruf_asli;
  return (
    <div className="flex items-start gap-5 bg-terang p-4 sm:p-5">
      <span className="w-[1.1ch] text-[3.5rem] leading-[0.9] font-semibold tracking-[-0.04em]">{i.huruf ?? '–'}</span>
      <div className="grid flex-1 gap-1">
        <span className="font-medium">{i.nama}</span>
        <span className="text-kecil text-lembut">
          Nilai <span className="angka">{desimal(i.nilai)}</span>
          {tertahan && `, angka setara ${i.huruf_asli}`} · sampel {i.sampel} laporan
        </span>
        <span className={`text-kecil ${i.peringatan_penolakan ? 'font-semibold text-tinta' : 'text-lembut'}`}>
          {i.peringatan_penolakan && <Ikon nama="peringatan" className="mr-1 inline size-3.5 align-[-2px]" />}
          Ditolak {persen(i.tingkat_penolakan)}
          {i.peringatan_penolakan ? ', melewati batas 25%: huruf ditahan maksimal C' : ''}
        </span>
      </div>
    </div>
  );
}

export default function AlurLapor({ rapor, kodeContoh }: { rapor: RaporInstansi[]; kodeContoh: string }) {
  const baik = rapor.find((r) => !r.peringatan_penolakan && r.huruf === 'A') ?? rapor[0];
  const tertahan = rapor.find((r) => r.peringatan_penolakan) ?? rapor[1];

  return (
    <ol className="grid gap-20 sm:gap-24">
      <li className="grid gap-4" data-muncul>
        <p className="text-lead font-medium">Pertama, warga melapor dengan foto dan titik di peta.</p>
        <div data-ui className="grid gap-3 bg-terang p-5">
          <Isian label="Kategori">Jalan rusak</Isian>
          <Isian label="Deskripsi">Lubang besar di lajur kiri, motor sering oleng saat malam karena gelap.</Isian>
          <Isian label="Lokasi">
            <span className="inline-flex items-center gap-1.5">
              <Ikon nama="lokasi" className="size-4" /> Cipayung, Jakarta Timur
            </span>
          </Isian>
          <Isian label="Foto">2 foto, wajah dan plat nomor tidak terlihat</Isian>
        </div>
        <div data-ui className="grid gap-2 bg-lapis p-5 sm:ml-14">
          <p className="text-kecil text-lembut">Yang kembali ke pelapor</p>
          <p className="angka text-judul font-semibold tracking-[-0.03em]">{kodeContoh}</p>
          <div className="flex flex-wrap items-center gap-3">
            <BadgeStatus status="menunggu" />
            <span className="text-kecil">Sisa 24 jam menuju batas waktu respons</span>
          </div>
        </div>
      </li>

      <li className="grid gap-4" data-muncul>
        <p className="text-lead font-medium">Lalu dinas menjawab, dan jawabannya terbuka untuk publik.</p>
        <div data-ui className="grid gap-3 bg-terang p-5">
          <Isian label="Ubah status">
            <span className="inline-flex flex-wrap items-center gap-2">
              <BadgeStatus status="diverifikasi" /> menjadi <BadgeStatus status="diproses" />
            </span>
          </Isian>
          <Isian label="Catatan">Petugas sudah di lokasi, penambalan dijadwalkan besok pagi.</Isian>
        </div>
        <div data-ui className="grid gap-3 bg-lapis p-5 sm:ml-14">
          <p className="text-kecil text-lembut">Riwayat yang dilihat semua orang</p>
          <ul className="grid gap-2 text-kecil">
            <li className="flex flex-wrap items-center gap-2">
              <BadgeStatus status="menunggu" /> Senin 08.12 · Pelapor
            </li>
            <li className="flex flex-wrap items-center gap-2">
              <BadgeStatus status="diverifikasi" /> Senin 15.40 · Admin Dinas Bina Jalan (simulasi)
            </li>
            <li className="flex flex-wrap items-center gap-2">
              <BadgeStatus status="diproses" /> Selasa 09.05 · Petugas sudah di lokasi
            </li>
          </ul>
          <p className="text-kecil">
            Laporan yang <strong className="font-semibold">ditolak</strong> tetap tampil di peta dan di halaman ini, lengkap
            dengan alasannya.
          </p>
        </div>
      </li>

      <li className="grid gap-4" data-muncul>
        <p className="text-lead font-medium">Terakhir, warga menilai, dan rapor dinas ikut berubah.</p>
        <div data-ui className="grid gap-3 bg-terang p-5">
          <Isian label="Rating">
            <span className="inline-flex items-center gap-0.5" aria-label="4 dari 5 bintang">
              {[1, 2, 3, 4, 5].map((n) => (
                <Ikon key={n} nama="bintang" isi={n <= 4} className="size-5" />
              ))}
            </span>
          </Isian>
          <Isian label="Komentar">Ditambal rapi, tapi baru selesai setelah enam hari.</Isian>
        </div>
        <div data-ui className="grid gap-2 bg-lapis p-5 sm:ml-14 lg:mr-[-12rem]">
          <p className="text-kecil text-lembut">Rapor Instansi, dihitung ulang dari semua laporan</p>
          <BarisRapor i={baik} />
          <BarisRapor i={tertahan} />
        </div>
      </li>
    </ol>
  );
}
