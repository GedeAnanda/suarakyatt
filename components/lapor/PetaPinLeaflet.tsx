// components/lapor/PetaPinLeaflet.tsx — isi Leaflet untuk PetaPin (pemilik: A)
// Tanpa tetikus: fokus ke peta (Tab), geser dengan tombol panah, lalu Enter menaruh titik di tanda + di tengah peta.

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

  // Pengganti klik untuk keyboard. Panah dan +/− sudah ditangani Leaflet; Enter atau Spasi menaruh titik di tengah.
  useEffect(() => {
    const el = map.getContainer();
    el.setAttribute('aria-label', 'Peta lokasi laporan. Geser dengan tombol panah, lalu tekan Enter untuk menaruh titik di tengah peta.');
    const tekan = (e: KeyboardEvent) => {
      if (e.target !== el || (e.key !== 'Enter' && e.key !== ' ')) return;
      e.preventDefault();
      const c = map.getCenter();
      onPilih({ lat: c.lat, lng: c.lng });
    };
    el.addEventListener('keydown', tekan);
    return () => el.removeEventListener('keydown', tekan);
  }, [map, onPilih]);

  const ikon = useMemo(
    () =>
      L.divIcon({
        html: '<span class="titik" style="width:26px;height:26px;background:var(--color-biru)"></span>',
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
    <div className="group relative">
      <PetaDasarLeaflet className="h-[min(60svh,30rem)] min-h-80 cursor-crosshair" zoomGulir>
        <Pengendali titik={titik} onPilih={onPilih} />
      </PetaDasarLeaflet>
      {/* Hanya saat peta difokus dengan keyboard: tanda + di tengah dan petunjuk tombol. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-1000 hidden group-has-[.leaflet-container:focus-visible]:block">
        <span className="absolute top-1/2 left-1/2 size-8 -translate-1/2 text-[2rem] leading-8 font-bold text-biru-tua">+</span>
        <span className="absolute inset-x-3 bottom-3 rounded-kontrol bg-navy/90 px-3 py-2 text-kecil font-semibold text-white">
          Panah: geser peta · Enter: taruh titik di tanda +
        </span>
      </div>
    </div>
  );
}
