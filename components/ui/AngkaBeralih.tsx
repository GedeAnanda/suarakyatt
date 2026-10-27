'use client';

import { useState } from 'react';

/** Angka asli langsung diperbarui; hanya lapisan visual yang bergeser. */
export default function AngkaBeralih({ nilai }: { nilai: number }) {
  const [transisi, setTransisi] = useState({ sebelum: nilai, sekarang: nilai });
  if (transisi.sekarang !== nilai) {
    setTransisi({ sebelum: transisi.sekarang, sekarang: nilai });
  }

  return (
    <span className="angka-beralih">
      <span className="sr-only">{nilai}</span>
      <span
        key={transisi.sekarang}
        aria-hidden="true"
        className="angka-lapisan"
        data-berubah={transisi.sebelum !== transisi.sekarang}
        data-arah={transisi.sekarang < transisi.sebelum ? 'naik' : 'turun'}
      >
        <span className="angka-sebelum">{transisi.sebelum}</span>
        <span className="angka-sekarang">{transisi.sekarang}</span>
      </span>
    </span>
  );
}
