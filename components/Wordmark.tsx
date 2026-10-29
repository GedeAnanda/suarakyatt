// components/Wordmark.tsx — nama suaRAkyat: "RA" yang dipakai bersama suara dan rakyat (pemilik: A)
// "RA" berupa label biru seperti logo situs travel; di atas latar gelap (.di-gelap) warnanya dibalik.

export default function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`font-wordmark inline-flex items-baseline leading-none font-bold tracking-[-0.035em] ${className}`}>
      sua
      <span className="mx-[0.06em] rounded-[0.22em] bg-biru px-[0.14em] pt-[0.08em] pb-[0.05em] text-white [.di-gelap_&]:bg-white [.di-gelap_&]:text-biru-tua">
        RA
      </span>
      kyat
    </span>
  );
}
