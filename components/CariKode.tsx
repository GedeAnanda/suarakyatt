// components/CariKode.tsx — kolom cari kode laporan (FR-C2), pemilik: A
// Form GET biasa ke /lacak, jadi tetap jalan tanpa JavaScript.
// Varian "kepala": kolom cari di header, tombol ikon biru di ujung kanan. Varian "besar": halaman Lacak dan 404.

import Ikon from './ui/Ikon';

export default function CariKode({
  id,
  varian = 'besar',
  className = '',
  nilaiAwal,
}: {
  id: string;
  varian?: 'kepala' | 'besar';
  className?: string;
  nilaiAwal?: string;
}) {
  const kepala = varian === 'kepala';
  return (
    <form
      action="/lacak"
      method="get"
      role="search"
      className={`flex min-w-0 items-center rounded-kontrol border border-garis-isian bg-permukaan transition-[border-color,box-shadow] focus-within:border-biru focus-within:shadow-[0_0_0_3px_rgb(50_100_255/0.22)] hover:border-biru ${
        kepala ? 'h-10 pl-3' : 'h-14 pl-4'
      } ${className}`}
    >
      <label htmlFor={id} className="sr-only">
        Kode laporan
      </label>
      {!kepala && <Ikon nama="cari" className="mr-3 size-5 text-lembut" />}
      <input
        id={id}
        name="kode"
        defaultValue={nilaiAwal}
        maxLength={32}
        placeholder={kepala ? 'Lacak kode, misalnya SR-K7W3PA' : 'Kode laporan, misalnya SR-K7W3PA'}
        autoComplete="off"
        autoCapitalize="characters"
        spellCheck={false}
        className={`font-kode h-full w-0 min-w-0 flex-1 rounded-none border-0 bg-transparent p-0 font-semibold tracking-wide uppercase shadow-none outline-none placeholder:font-normal placeholder:tracking-normal placeholder:normal-case focus:shadow-none ${
          kepala ? 'text-kecil' : 'text-lead'
        }`}
      />
      <button
        type="submit"
        className={`flex shrink-0 items-center justify-center gap-2 bg-biru font-semibold text-white transition-colors hover:bg-biru-tua ${
          kepala ? 'm-1 size-8 rounded-[0.375rem]' : 'm-1.5 h-11 rounded-[0.375rem] px-5 text-badan'
        }`}
      >
        <Ikon nama="cari" className={kepala ? 'size-4' : 'size-5'} />
        <span className={kepala ? 'sr-only' : ''}>Lacak</span>
      </button>
    </form>
  );
}
