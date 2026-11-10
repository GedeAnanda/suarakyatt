// components/PetaDasarLeaflet.tsx — isi peta Leaflet (pemilik: A)
// Jangan impor file ini langsung dari halaman: Leaflet butuh `window`. Pakai <PetaDasar />.

'use client';

import 'leaflet/dist/leaflet.css';
import { useEffect, useState, type ReactNode } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';

export const PUSAT_JAKARTA: [number, number] = [-6.2, 106.85];
const ZOOM_AWAL = 11;
/** Kotak batas DKI Jakarta daratan; peta dibuka pas di kotak ini kecuali `pusat` diberikan. */
const BATAS_JAKARTA: [[number, number], [number, number]] = [
  [-6.37, 106.68],
  [-6.08, 106.98],
];

export interface PetaDasarProps {
  /** Atur tinggi lewat kelas Tailwind, misalnya "h-96". */
  className?: string;
  /** Lapisan tambahan: marker, cluster, GeoJSON kecamatan, dan sebagainya. */
  children?: ReactNode;
  pusat?: [number, number];
  zoom?: number;
  /** Gulir roda tetikus untuk zoom; mati secara bawaan supaya halaman tetap bisa digulir. */
  zoomGulir?: boolean;
}

/**
 * Zoom dengan cubit dua jari di touchpad laptop dan Mac, seperti di ponsel. Chrome, Edge, dan Firefox mengirim
 * cubitan sebagai wheel + ctrlKey (sama dengan Ctrl + gulir), jadi zoom roda Leaflet dinyalakan tetapi gulir
 * biasa disaring sebelum sampai ke Leaflet, sehingga halaman tetap bisa digulir. Safari mengirim gesture event.
 */
function ZoomCubit({ gulirBiasa }: { gulirBiasa: boolean }) {
  const map = useMap();
  useEffect(() => {
    const el = map.getContainer();
    const saring = (e: WheelEvent) => {
      if (!gulirBiasa && !e.ctrlKey) e.stopImmediatePropagation();
    };
    type Gestur = Event & { scale: number; clientX: number; clientY: number };
    let awal = map.getZoom();
    const mulai = (e: Event) => {
      e.preventDefault();
      awal = map.getZoom();
    };
    const ubah = (e: Event) => {
      e.preventDefault();
      const g = e as Gestur;
      const titik = map.mouseEventToContainerPoint(g as unknown as MouseEvent);
      map.setZoomAround(titik, awal + Math.log2(g.scale), { animate: false });
    };
    el.addEventListener('wheel', saring, { capture: true });
    el.addEventListener('gesturestart', mulai);
    el.addEventListener('gesturechange', ubah);
    return () => {
      el.removeEventListener('wheel', saring, { capture: true });
      el.removeEventListener('gesturestart', mulai);
      el.removeEventListener('gesturechange', ubah);
    };
  }, [map, gulirBiasa]);
  return null;
}

export default function PetaDasarLeaflet({
  className = 'h-80 sm:h-112',
  children,
  pusat,
  zoom = ZOOM_AWAL,
  zoomGulir = false,
}: PetaDasarProps) {
  // MapContainer (react-leaflet 5) menghapus peta saat effect-nya di-cleanup, tapi tidak membuatnya lagi.
  // Dengan cacheComponents, Next.js menyembunyikan halaman lama lewat <Activity> (effect di-cleanup) dan
  // menampilkannya lagi saat pengguna kembali, sehingga peta crash. Mengganti key saat cleanup membuat
  // MapContainer dipasang ulang dengan peta baru.
  const [kunciPeta, setKunciPeta] = useState(0);
  useEffect(() => () => setKunciPeta((k) => k + 1), []);

  return (
    <MapContainer
      key={kunciPeta}
      {...(pusat ? { center: pusat, zoom } : { bounds: BATAS_JAKARTA })}
      minZoom={10}
      zoomSnap={0.25}
      scrollWheelZoom
      className={`w-full ${className}`}
    >
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        maxZoom={19}
      />
      <ZoomCubit gulirBiasa={zoomGulir} />
      {children}
    </MapContainer>
  );
}
