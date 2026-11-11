// components/kecamatan/CariKecamatan.tsx — pilih kecamatanmu dari daftar (audit bahasa awam 10 Nov, struktur D-C2)
// <select> bawaan HP (roda pilihan di iOS/Android) lebih mudah daripada mencari poligon kecil di peta.

'use client';

import { useRouter } from 'next/navigation';
import { useId } from 'react';

export default function CariKecamatan({ daftar }: { daftar: { kode_wilayah: string; kecamatan: string; kota: string }[] }) {
  const router = useRouter();
  const id = useId();
  const urut = [...daftar].sort((a, b) => a.kecamatan.localeCompare(b.kecamatan, 'id'));
  return (
    <div className="kartu flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-5">
      <label htmlFor={id} className="text-badan font-bold sm:shrink-0">
        Cari kecamatanmu
      </label>
      <select
        id={id}
        defaultValue=""
        onChange={(e) => e.target.value && router.push(`/kecamatan/${e.target.value}`)}
        className="min-h-11 w-full rounded-kontrol border border-garis-isian bg-permukaan px-3 text-badan sm:max-w-sm"
      >
        <option value="" disabled>
          Pilih nama kecamatan…
        </option>
        {urut.map((k) => (
          <option key={k.kode_wilayah} value={k.kode_wilayah}>
            {k.kecamatan} ({k.kota})
          </option>
        ))}
      </select>
    </div>
  );
}
