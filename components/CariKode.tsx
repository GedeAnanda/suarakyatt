// components/CariKode.tsx — kolom cari kode laporan (FR-C2), pemilik: A
// Form GET biasa ke /lacak, jadi tetap jalan tanpa JavaScript.

import Ikon from './ui/Ikon';

export default function CariKode({
  id,
  besar = false,
  className = '',
  nilaiAwal,
}: {
  id: string;
  besar?: boolean;
  className?: string;
  nilaiAwal?: string;
}) {
  return (
    <form action="/lacak" method="get" role="search" className={`flex ${className}`}>
      <label htmlFor={id} className="sr-only">
        Kode laporan
      </label>
      <input
        id={id}
        name="kode"
        defaultValue={nilaiAwal}
        placeholder="SR-K7W3PA"
        autoComplete="off"
        autoCapitalize="characters"
        spellCheck={false}
        className={`relative z-[1] min-w-0 flex-1 rounded-r-none border-r-0 font-medium tracking-wide text-teks uppercase placeholder:font-normal placeholder:text-lembut/70 placeholder:normal-case ${
          besar ? 'h-14 px-4 text-lead' : 'h-11 w-36 px-3 text-kecil'
        }`}
      />
      <button
        type="submit"
        className={`flex shrink-0 items-center gap-2 rounded-r-(--radius-kontrol) bg-tinta font-semibold text-white transition-colors hover:bg-tinta-tua active:scale-[0.98] ${
          besar ? 'h-14 px-5 text-badan' : 'h-11 px-3 text-kecil'
        }`}
      >
        <Ikon nama="cari" className={besar ? 'size-5' : 'size-4'} />
        <span className={besar ? '' : 'sr-only'}>Lacak</span>
      </button>
    </form>
  );
}
