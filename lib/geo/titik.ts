// lib/geo/titik.ts — cari kecamatan dari koordinat di browser (pemilik: A)
// Hanya untuk umpan balik cepat di form lapor. Penentu akhir tetap create_report (ST_Contains di PostGIS).

type Cincin = number[][];
type Geometri = { type: 'Polygon'; coordinates: Cincin[] } | { type: 'MultiPolygon'; coordinates: Cincin[][] };

export interface FiturKecamatan {
  /** Properti keluaran scripts/01_wilayah.py; kode_wilayah berformat 31.71.010. */
  properties: { kode_wilayah: string; nama: string; kota: string };
  geometry: Geometri;
}

function dalamCincin(x: number, y: number, cincin: Cincin) {
  let dalam = false;
  for (let i = 0, j = cincin.length - 1; i < cincin.length; j = i++) {
    const [xi, yi] = cincin[i];
    const [xj, yj] = cincin[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) dalam = !dalam;
  }
  return dalam;
}

export function cariKecamatan(lat: number, lng: number, fitur: FiturKecamatan[]) {
  for (const f of fitur) {
    const poligon = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
    const kena = poligon.some(
      ([luar, ...lubang]) => dalamCincin(lng, lat, luar) && !lubang.some((l) => dalamCincin(lng, lat, l)),
    );
    if (kena) return { kode_wilayah: f.properties.kode_wilayah, kecamatan: f.properties.nama, kota: f.properties.kota };
  }
  return null;
}

let cache: Promise<FiturKecamatan[]> | null = null;

/** Muat batas kecamatan sekali per kunjungan. */
export function muatKecamatan(): Promise<FiturKecamatan[]> {
  cache ??= fetch('/data/kecamatan.geojson')
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error('GEOJSON_GAGAL'))))
    .then((g: { features: FiturKecamatan[] }) => g.features)
    .catch((e) => {
      cache = null;
      throw e;
    });
  return cache;
}
