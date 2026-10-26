// components/beranda/TeksTinta.tsx — pernyataan yang terisi tinta kata demi kata saat dibaca (pemilik: A)
// Kata dipisah di server, jadi tidak ada teks yang menunggu JavaScript. Tanpa dukungan scroll timeline atau
// dengan gerak dikurangi, kalimat langsung tampil dengan tinta penuh (aturan di globals.css, .tinta-isi).

export default function TeksTinta({ teks, className = '' }: { teks: string; className?: string }) {
  const kata = teks.split(' ');
  return (
    <p className={`tinta-isi ${className}`}>
      {kata.map((k, i) => (
        <span key={i}>
          {k}
          {i < kata.length - 1 ? ' ' : ''}
        </span>
      ))}
    </p>
  );
}
