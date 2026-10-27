'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { NAMA_FAKTOR } from '@/lib/konten';
import { FAKTOR, formatPoin, hitungSkor, kenapaBelum, LABEL_PRESET, PRESET, type NamaPreset } from '@/lib/scoring';
import type { Bobot, FaktorIsu } from '@/lib/types';
import AngkaBeralih from '../ui/AngkaBeralih';
import { kelasTautan, kelasTombol } from '../ui/Tombol';

const PILIHAN: NamaPreset[] = ['keselamatan', 'kerentanan', 'suara_warga'];

export default function PerbandinganPeringkat({ isu, bobotResmi, idIsu, kodeLaporan }: {
  isu: FaktorIsu[]; bobotResmi: Bobot; idIsu: string; kodeLaporan: string | null;
}) {
  const [preset, setPreset] = useState<NamaPreset>('keselamatan');
  const jelas = useMemo(() => kenapaBelum(idIsu, isu, bobotResmi, 'diverifikasi'), [idIsu, isu, bobotResmi]);
  const target = isu.find((i) => i.id === idIsu)!;
  const acuan = useMemo(() => hitungSkor(isu, bobotResmi).find((s) => s.id === idIsu)!, [isu, bobotResmi, idIsu]);
  const simulasi = useMemo(() => hitungSkor(isu, PRESET[preset]).find((s) => s.id === idIsu)!, [isu, preset, idIsu]);
  const geser = jelas.peringkat - simulasi.peringkat;
  const query = new URLSearchParams({ isu: idIsu, bobot: FAKTOR.map((f) => Math.round(PRESET[preset][f] * 100)).join(',') });

  return (
    <section id="coba-prioritas" aria-labelledby="judul-dua-urutan" className="bg-permukaan py-14 sm:py-16">
      <div className="bingkai grid gap-8 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5" data-muncul>
          <h2 id="judul-dua-urutan" className="text-judul">Satu isu,<br />dua urutan.</h2>
          <p className="mt-5 max-w-[38ch] text-badan">{target.kategori} di {target.kecamatan} berada di peringkat {jelas.peringkat}. Apa yang berubah saat kita mendahulukan hal lain?</p>
          <fieldset className="mt-6" data-ui>
            <legend className="text-badan font-semibold">Pilih yang ingin diutamakan</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {PILIHAN.map((p) => (
                <button key={p} type="button" aria-pressed={preset === p} onClick={() => setPreset(p)} className="pilihan-gerak min-h-11 rounded-full bg-lapis px-4 py-2 text-kecil font-medium transition-colors hover:bg-lapis-2 aria-pressed:bg-tinta aria-pressed:text-white">
                  {LABEL_PRESET[p].replace('Utamakan ', '')}
                </button>
              ))}
            </div>
          </fieldset>
          <p className="mt-4 max-w-[43ch] text-kecil text-lembut">Contoh perhitungan dengan data simulasi. Bobot acuan adalah pengaturan model, bukan kebijakan pemerintah.</p>
        </div>
        <div className="lg:col-span-7">
          <div className="grid grid-cols-2 gap-3 sm:gap-6" data-ui>
            <div className="bg-lapis p-4 sm:p-6">
              <p className="text-kecil">Bobot acuan</p>
              <p className="angka mt-3 text-[clamp(4.5rem,12vw,11rem)] leading-none font-medium tracking-[-0.06em] text-tinta">{jelas.peringkat}</p>
              <p className="mt-3 text-kecil text-lembut">dari {jelas.total} isu</p>
            </div>
            <div className="di-medan bg-medan p-4 text-medan-tinta sm:p-6">
              <p className="text-kecil">Pilihanmu</p>
              <p className="angka mt-3 text-[clamp(4.5rem,12vw,11rem)] leading-none font-medium tracking-[-0.06em]"><AngkaBeralih nilai={simulasi.peringkat} /></p>
              <p className="mt-3 text-kecil text-medan-lembut">dari {jelas.total} isu</p>
            </div>
          </div>
          <p className="mt-5 text-lead font-medium" aria-live="polite" aria-atomic="true">
            {geser > 0 ? `Naik ${geser} posisi` : geser < 0 ? `Turun ${-geser} posisi` : 'Posisinya tetap'} saat {LABEL_PRESET[preset].replace('Utamakan ', '')} diutamakan.
          </p>
          <details className="mt-3 text-badan">
            <summary className="inline-flex min-h-11 cursor-pointer items-center text-tinta underline underline-offset-4">Mengapa posisinya berubah?</summary>
            <p className="mt-2 max-w-[60ch] text-lembut">Bobot menentukan besar pengaruh setiap faktor. Pada acuan, {NAMA_FAKTOR[jelas.pendorong.faktor].toLowerCase()} menyumbang {formatPoin(jelas.pendorong.poin)} poin. Mengubah bobot menghitung ulang seluruh isu, sehingga urutannya dapat bergeser.</p>
            <table className="mt-4 w-full text-left text-kecil">
              <caption className="pb-3 text-left font-medium">Kontribusi terhadap skor · poin dari 100</caption>
              <thead><tr className="border-b border-batas"><th scope="col" className="py-2 font-medium">Faktor</th><th scope="col" className="px-2 text-right font-medium">Acuan</th><th scope="col" className="text-right font-medium">Pilihanmu</th></tr></thead>
              <tbody>{FAKTOR.map((f) => <tr key={f} className="border-b border-batas"><th scope="row" className="py-2 font-normal">{NAMA_FAKTOR[f]}</th><td className="angka px-2 text-right">{formatPoin(acuan.kontribusi[f])}</td><td className="angka text-right">{formatPoin(simulasi.kontribusi[f])}</td></tr>)}</tbody>
              <tfoot><tr><th scope="row" className="pt-3">Total skor</th><td className="angka px-2 pt-3 text-right font-semibold">{formatPoin(acuan.skor)}</td><td className="angka pt-3 text-right font-semibold">{formatPoin(simulasi.skor)}</td></tr></tfoot>
            </table>
            <p className="mt-3 text-kecil text-lembut">Data isu tetap sama; yang berubah hanya bobot. Peringkat membandingkan seluruh isu, bukan menjanjikan jadwal perbaikan. Selisih kecil pada jumlah poin dapat terjadi karena pembulatan.</p>
          </details>
          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link href={`/prioritas?${query}`} className={kelasTombol()}>Jelajahi perhitungannya</Link>
            {kodeLaporan && <Link href={`/laporan/${kodeLaporan}#kenapa-belum`} className={kelasTautan}>Buka laporan ini</Link>}
          </div>
        </div>
      </div>
    </section>
  );
}
