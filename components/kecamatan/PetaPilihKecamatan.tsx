// components/kecamatan/PetaPilihKecamatan.tsx — choropleth yang membuka halaman kecamatan saat dipilih (pemilik: A)
// Klik, Enter, atau Spasi pada kecamatan → /kecamatan/<kode_wilayah>. Daftar teks di halaman yang sama adalah
// alternatif aksesibel untuk peta ini (revisi FDS 10 Nov, 2.4).

'use client';

import { useRouter } from 'next/navigation';
import PetaKecamatan from '../PetaKecamatan';

export default function PetaPilihKecamatan({
  skor,
  keterangan,
  sorot,
}: {
  skor: Record<string, number>;
  keterangan: Record<string, string>;
  sorot?: string;
}) {
  const router = useRouter();
  return (
    <PetaKecamatan
      skor={skor}
      keterangan={keterangan}
      sorot={sorot}
      judul="Peta skor prioritas 42 kecamatan. Pilih kecamatan untuk membuka penjelasannya."
      onPilih={(kode) => router.push(`/kecamatan/${kode}`)}
    />
  );
}
