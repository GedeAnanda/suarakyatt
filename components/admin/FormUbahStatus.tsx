// components/admin/FormUbahStatus.tsx — ubah status laporan (FR-D2, SDD 6.3 R6), pemilik: A
// Pilihan status mengikuti tabel transisi: Menunggu → Diverifikasi/Ditolak, Diverifikasi → Diproses/Ditolak,
// Diproses → Selesai. Ditolak wajib alasan terstruktur; Selesai wajib foto bukti. Server tetap penentu akhir.

'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { pesanError } from '@/lib/errors';
import { kompresFoto, TIPE_FOTO } from '@/lib/foto';
import { normalisasiKode } from '@/lib/format';
import { LABEL_ALASAN } from '@/lib/konten';
import { createClient } from '@/lib/supabase/client';
import { unggahFoto } from '@/lib/supabase/unggah';
import type { AlasanTolak, StatusLaporan } from '@/lib/types';
import { IkonStatus, LABEL_STATUS } from '../BadgeStatus';
import { umumkan } from '../Pengumuman';
import Ikon from '../ui/Ikon';
import { Tombol } from '../ui/Tombol';

const TRANSISI: Partial<Record<StatusLaporan, StatusLaporan[]>> = {
  menunggu: ['diverifikasi', 'ditolak'],
  diverifikasi: ['diproses', 'ditolak'],
  diproses: ['selesai'],
};

const KETERANGAN_ALASAN: Record<AlasanTolak, string> = {
  duplikat: 'Wajib menautkan kode laporan lain yang masih aktif, sekategori, dan berjarak paling jauh 100 m. Dukungan dipindahkan ke laporan itu. Tidak masuk tingkat penolakan.',
  tidak_valid: 'Misalnya spam atau masalah tidak ditemukan di lokasi. Wajib catatan. Masuk tingkat penolakan.',
  konten_melanggar: 'Kata kasar, foto tidak pantas, atau data pribadi orang lain. Isi dan foto disembunyikan dari publik. Wajib catatan. Masuk tingkat penolakan.',
};

const kelasIsian = 'w-full px-4 py-3 text-badan font-normal';

export default function FormUbahStatus({ kode, status, aktif }: { kode: string; status: StatusLaporan; aktif: boolean }) {
  const router = useRouter();
  const pilihan = TRANSISI[status] ?? [];
  const [baru, setBaru] = useState<StatusLaporan | null>(pilihan[0] ?? null);
  const [alasan, setAlasan] = useState<AlasanTolak | null>(null);
  const [rujukan, setRujukan] = useState('');
  const [catatan, setCatatan] = useState('');
  const [perkiraan, setPerkiraan] = useState('');
  const [bukti, setBukti] = useState<{ blob: Blob; pratinjau: string; url?: string } | null>(null);
  const [memuat, setMemuat] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);
  const [berhasil, setBerhasil] = useState<string | null>(null);

  if (pilihan.length === 0) {
    return (
      <p className="kartu flex gap-3 p-5 text-badan">
        <Ikon nama="info" className="mt-0.5 size-5 shrink-0 text-biru" />
        Status {LABEL_STATUS[status].toLowerCase()} bersifat final. Status ini tidak bisa diubah dari halaman ini. Hubungi
        Perencana bila ada keputusan yang perlu ditinjau.
      </p>
    );
  }

  const catatanWajib = baru === 'ditolak' && (alasan === 'tidak_valid' || alasan === 'konten_melanggar');
  const masalah = [
    baru === 'ditolak' && !alasan && 'Pilih alasan penolakan.',
    baru === 'ditolak' && alasan === 'duplikat' && !normalisasiKode(rujukan) && 'Isi kode laporan rujukan yang sah.',
    catatanWajib && !catatan.trim() && 'Catatan wajib untuk alasan ini.',
    baru === 'selesai' && !bukti && 'Lampirkan foto bukti penyelesaian.',
  ].filter(Boolean) as string[];

  async function pilihBukti(files: FileList | null) {
    const f = files?.[0];
    if (!f) return;
    setGalat(null);
    try {
      const blob = await kompresFoto(f);
      if (bukti) URL.revokeObjectURL(bukti.pratinjau);
      setBukti({ blob, pratinjau: URL.createObjectURL(blob) });
    } catch {
      setGalat('Foto tidak bisa diproses. Pilih JPG, PNG, atau WebP maksimal 5 MB.');
    }
  }

  async function simpan(e: React.FormEvent) {
    e.preventDefault();
    if (!baru || masalah.length > 0) return;
    setMemuat(true);
    setGalat(null);
    try {
      let buktiUrl: string | null = null;
      if (baru === 'selesai' && bukti) {
        buktiUrl = bukti.url ?? (await unggahFoto('bukti', bukti.blob));
        setBukti({ ...bukti, url: buktiUrl });
      }
      const { error } = await createClient().rpc('update_report_status', {
        p_kode: kode,
        p_status: baru,
        p_catatan: catatan.trim() || null,
        p_bukti_url: buktiUrl,
        p_alasan: baru === 'ditolak' ? alasan : null,
        p_duplikat_kode: baru === 'ditolak' && alasan === 'duplikat' ? normalisasiKode(rujukan) : null,
        p_perkiraan: baru === 'diverifikasi' && perkiraan ? perkiraan : null,
      });
      if (error) throw error;
      setBerhasil(`Status ${kode} sekarang ${LABEL_STATUS[baru]}. Perubahan ini tampil di riwayat publik.`);
      umumkan(`Status ${kode} diubah menjadi ${LABEL_STATUS[baru]}.`);
      router.refresh();
    } catch (err) {
      setGalat(pesanError(err));
    } finally {
      setMemuat(false);
    }
  }

  if (berhasil) {
    return (
      <p role="status" className="flex gap-2 rounded-kartu bg-hijau-muda p-5 text-badan font-semibold text-hijau">
        <Ikon nama="centang" className="mt-0.5 size-5 shrink-0" />
        {berhasil}
      </p>
    );
  }

  return (
    <form onSubmit={simpan} className="kartu grid gap-6 p-5">
      <fieldset disabled={!aktif || memuat} className="grid gap-6 disabled:opacity-70">
        <div role="radiogroup" aria-labelledby={`label-status-${kode}`}>
          <p id={`label-status-${kode}`} className="text-badan font-bold">
            Ubah status menjadi
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {pilihan.map((s) => (
              <label key={s} className="chip">
                <input type="radio" name="status" checked={baru === s} onChange={() => setBaru(s)} className="sr-only" />
                <IkonStatus status={s} />
                {LABEL_STATUS[s]}
              </label>
            ))}
          </div>
        </div>

        {baru === 'ditolak' && (
          <fieldset className="grid gap-2">
            <legend className="text-badan font-bold">Alasan penolakan</legend>
            {(Object.keys(LABEL_ALASAN) as AlasanTolak[]).map((a) => (
              <label
                key={a}
                className="grid cursor-pointer gap-1 rounded-kontrol border border-garis p-4 transition-colors hover:border-biru has-checked:border-biru has-checked:bg-biru-muda"
              >
                <span className="flex items-center gap-2 font-bold">
                  <input type="radio" name="alasan" checked={alasan === a} onChange={() => setAlasan(a)} className="size-4" />
                  {LABEL_ALASAN[a]}
                </span>
                <span className="text-kecil text-lembut">{KETERANGAN_ALASAN[a]}</span>
              </label>
            ))}
            {alasan === 'duplikat' && (
              <label className="mt-2 grid gap-1.5 text-kecil font-semibold">
                Kode laporan rujukan
                <input value={rujukan} onChange={(e) => setRujukan(e.target.value)} placeholder="SR-K7W3PA" className={`${kelasIsian} font-kode uppercase`} />
              </label>
            )}
          </fieldset>
        )}

        {baru === 'diverifikasi' && (
          <label className="grid gap-1.5 text-kecil font-semibold">
            Perkiraan tanggal selesai (opsional, tampil publik; lewat dari tanggal ini muncul label &ldquo;Melewati janji&rdquo;)
            <input type="date" value={perkiraan} onChange={(e) => setPerkiraan(e.target.value)} className={`${kelasIsian} sm:max-w-xs`} />
          </label>
        )}

        {baru === 'selesai' && (
          <div className="grid gap-2">
            <p className="text-badan font-bold">Foto bukti penyelesaian (wajib)</p>
            <p className="text-kecil text-lembut">Tampil berdampingan dengan foto dari pelapor, supaya warga bisa mengecek klaim selesai.</p>
            <div className="flex flex-wrap items-center gap-4">
              {bukti && (
                /* eslint-disable-next-line @next/next/no-img-element -- pratinjau blob lokal */
                <img src={bukti.pratinjau} alt="Pratinjau foto bukti" className="size-28 rounded-kontrol object-cover" />
              )}
              <label className="flex min-h-10 cursor-pointer items-center gap-2 rounded-kontrol border border-garis-isian px-4 font-semibold hover:border-biru hover:text-biru-tua has-focus-visible:outline-2 has-focus-visible:outline-biru">
                <Ikon nama="unggah" className="size-4" />
                {bukti ? 'Ganti foto' : 'Pilih foto'}
                <input type="file" accept={TIPE_FOTO.join(',')} onChange={(e) => pilihBukti(e.target.files)} className="sr-only" />
              </label>
            </div>
          </div>
        )}

        <label className="grid gap-1.5 text-kecil font-semibold">
          Catatan untuk publik{catatanWajib ? ' (wajib)' : ' (opsional)'}
          <textarea value={catatan} onChange={(e) => setCatatan(e.target.value)} rows={3} maxLength={500} className={kelasIsian} />
        </label>
      </fieldset>

      {(galat || masalah.length > 0) && (
        <div role={galat ? 'alert' : undefined} className="text-kecil">
          {galat && <p className="font-bold text-merah-tua">{galat}</p>}
          {!galat && <p className="text-lembut">{masalah.join(' ')}</p>}
        </div>
      )}
      <Tombol type="submit" disabled={!aktif || memuat || !baru || masalah.length > 0} className="w-full">
        {memuat ? 'Menyimpan…' : baru ? `Simpan sebagai ${LABEL_STATUS[baru]}` : 'Simpan'}
      </Tombol>
    </form>
  );
}
