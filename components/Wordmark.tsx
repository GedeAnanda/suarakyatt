// components/Wordmark.tsx — nama suaRAkyat: "RA" yang dipakai bersama suara dan rakyat (pemilik: A)

export default function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-baseline font-semibold tracking-[-0.04em] ${className}`}>
      sua
      <span className="mx-[0.04em] bg-tinta px-[0.12em] text-kertas [.di-medan_&]:bg-medan-tinta [.di-medan_&]:text-tinta">
        RA
      </span>
      kyat
    </span>
  );
}
