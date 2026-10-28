// components/lapor/PetaPinLeaflet.tsx — isi Leaflet untuk PetaPin (pemilik: A)

'use client';

import L from 'leaflet';
import { useEffect, useMemo } from 'react';
import { Marker, useMap, useMapEvents } from 'react-leaflet';
import PetaDasarLeaflet from '../PetaDasarLeaflet';

export interface Titik {
  lat: number;
  lng: number;
}

function Pengendali({ titik, onPilih }: { titik: Titik | null; onPilih: (t: Titik) => void }) {
  const map = useMap();
  useMapEvents({ click: (e) => onPilih({ lat: e.latlng.lat, lng: e.latlng.lng }) });
  // Saat titik datang dari "Pakai lokasi saya", geser peta ke sana.
  useEffect(() => {
    if (titik && !map.getBounds().pad(-0.15).contains([titik.lat, titik.lng])) {
      map.flyTo([titik.lat, titik.lng], Math.max(map.getZoom(), 16), { duration: 0.6 });
    }
  }, [titik, map]);

  const ikon = useMemo(
    () =>
      L.divIcon({
        html: '<span class="titik" style="width:26px;height:26px;background:var(--color-tinta)"></span>',
        className: '',
        iconSize: [26, 26],
      }),
    [],
  );

  if (!titik) return null;
  return (
    <Marker
      position={[titik.lat, titik.lng]}
      icon={ikon}
      draggable
      title="Titik laporan, bisa digeser"
      eventHandlers={{
        dragend: (e) => {
          const p = (e.target as L.Marker).getLatLng();
          onPilih({ lat: p.lat, lng: p.lng });
        },
      }}
    />
  );
}

export default function PetaPinLeaflet({ titik, onPilih }: { titik: Titik | null; onPilih: (t: Titik) => void }) {
  return (
    <PetaDasarLeaflet className="h-[min(60svh,30rem)] min-h-80 cursor-crosshair" zoomGulir>
      <Pengendali titik={titik} onPilih={onPilih} />
    </PetaDasarLeaflet>
  );
}
