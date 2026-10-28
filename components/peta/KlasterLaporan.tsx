// components/peta/KlasterLaporan.tsx — titik laporan dengan leaflet.markercluster (FR-C3), pemilik: A
// Hanya dimuat di browser lewat next/dynamic (lihat PetaLaporan.tsx).

'use client';

import 'leaflet.markercluster/dist/MarkerCluster.css';
import L from 'leaflet';
import 'leaflet.markercluster';
import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import type { TitikLaporan } from '@/lib/data/laporan';
import { LABEL_STATUS, WARNA_TITIK } from '../BadgeStatus';
import PetaDasarLeaflet from '../PetaDasarLeaflet';

const lindungi = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

function Lapisan({ laporan, onPilih }: { laporan: TitikLaporan[]; onPilih?: (kode: string) => void }) {
  const map = useMap();
  const grup = useRef<L.MarkerClusterGroup | null>(null);

  useEffect(() => {
    const g = L.markerClusterGroup({
      showCoverageOnHover: false,
      // Di layar sempit klaster digabung lebih longgar supaya kotaknya tidak saling tumpuk.
      maxClusterRadius: window.innerWidth < 640 ? 72 : 48,
      spiderfyOnMaxZoom: true,
      iconCreateFunction: (c) => {
        const n = c.getChildCount();
        const ukuran = n < 10 ? 34 : n < 50 ? 42 : 52;
        return L.divIcon({
          html: `<span class="klaster" style="width:${ukuran}px;height:${ukuran}px">${n}</span>`,
          className: '',
          iconSize: [ukuran, ukuran],
        });
      },
    });
    grup.current = g;
    map.addLayer(g);
    return () => {
      map.removeLayer(g);
      grup.current = null;
    };
  }, [map]);

  useEffect(() => {
    const g = grup.current;
    if (!g) return;
    g.clearLayers();
    const penanda = laporan.map((l) => {
      const m = L.marker([l.lat, l.lng], {
        icon: L.divIcon({
          html: `<span class="titik" style="width:14px;height:14px;background:${WARNA_TITIK[l.status]}"></span>`,
          className: '',
          iconSize: [14, 14],
        }),
        title: `${l.kode}, ${l.kategori}, ${LABEL_STATUS[l.status]}`,
        keyboard: true,
      });
      m.bindPopup(
        `<p style="font-weight:600;font-size:1rem;font-family:var(--font-kode)">${lindungi(l.kode)}</p>
         <p>${lindungi(l.kategori)} · <strong>${LABEL_STATUS[l.status]}</strong></p>
         <p style="color:var(--color-lembut)">${lindungi(l.kecamatan)}, ${lindungi(l.kota)}</p>
         <p style="margin-top:.5rem"><a href="/laporan/${encodeURIComponent(l.kode)}" style="color:var(--color-tinta);font-weight:600;text-decoration:underline">Buka laporan</a></p>`,
      );
      if (onPilih) m.on('click', () => onPilih(l.kode));
      return m;
    });
    g.addLayers(penanda);
  }, [laporan, onPilih]);

  return null;
}

export default function KlasterLaporan({
  laporan,
  className,
  onPilih,
}: {
  laporan: TitikLaporan[];
  className?: string;
  onPilih?: (kode: string) => void;
}) {
  return (
    <PetaDasarLeaflet className={className}>
      <Lapisan laporan={laporan} onPilih={onPilih} />
    </PetaDasarLeaflet>
  );
}
