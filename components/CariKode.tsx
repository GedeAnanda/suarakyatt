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
        className={`min-w-0 flex-1 bg-terang text-tinta uppercase placeholder:text-lembut/70 placeholder:normal-case focus:outline-3 focus:outline-tinta ${
          besar ? 'h-14 px-4 text-lead' : 'h-11 w-36 px-3 text-kecil'
        }`}
      />
      <button
        type="submit"
        className={`flex shrink-0 items-center gap-2 bg-tinta font-medium text-kertas hover:bg-tinta-tua active:translate-y-px ${
          besar ? 'h-14 px-5 text-badan' : 'h-11 px-3 text-kecil'
        }`}
      >
        <Ikon nama="cari" className={besar ? 'size-5' : 'size-4'} />
        <span className={besar ? '' : 'sr-only'}>Lacak</span>
      </button>
    </form>
  );
}
