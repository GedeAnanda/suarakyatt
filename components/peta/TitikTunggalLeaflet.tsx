// components/peta/TitikTunggalLeaflet.tsx — isi Leaflet untuk TitikTunggal (pemilik: A)

'use client';

import L from 'leaflet';
import { Marker } from 'react-leaflet';
import PetaDasarLeaflet from '../PetaDasarLeaflet';

export default function TitikTunggalLeaflet({ lat, lng, warna, label }: { lat: number; lng: number; warna: string; label: string }) {
  const ikon = L.divIcon({
    html: `<span class="titik" style="width:20px;height:20px;background:${warna}"></span>`,
    className: '',
    iconSize: [20, 20],
  });
  return (
    <PetaDasarLeaflet className="aspect-4/3" pusat={[lat, lng]} zoom={15}>
      <Marker position={[lat, lng]} icon={ikon} title={label} />
    </PetaDasarLeaflet>
  );
}
