import { beforeEach, describe, expect, it, vi } from 'vitest';

const mock = vi.hoisted(() => ({ rpc: vi.fn(), publik: vi.fn(), foto: vi.fn(), move: vi.fn(), admin: vi.fn() }));
vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({ rpc: mock.rpc, from: () => ({ select: () => ({ eq: () => ({ maybeSingle: mock.publik }) }) }) }),
}));
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => {
    mock.admin();
    return {
      from: () => ({ select: () => ({ eq: () => ({ single: mock.foto }) }) }),
      storage: { from: () => ({ move: mock.move }) },
    };
  },
}));
import { ubahStatusLaporan } from '../lib/supabase/aksi-status';

const input = {
  p_kode: 'SR-ABC234', p_status: 'ditolak' as const, p_alasan: 'konten_melanggar' as const,
  p_catatan: 'Data pribadi di foto.', p_bukti_url: null, p_duplikat_kode: null, p_perkiraan: null,
};

beforeEach(() => {
  vi.resetAllMocks();
  mock.rpc.mockResolvedValue({ error: null });
  mock.publik.mockResolvedValue({ data: { status: 'ditolak', alasan_tolak: 'konten_melanggar' }, error: null });
  mock.foto.mockResolvedValue({ data: { foto: ['https://proyek.supabase.co/storage/v1/object/public/foto-laporan/pemilik/foto.webp'] }, error: null });
  mock.move.mockResolvedValue({ error: null });
});

describe('pemulihan karantina foto', () => {
  it('dapat mencoba lagi setelah status tersimpan tetapi Storage gagal', async () => {
    mock.move.mockResolvedValueOnce({ error: { message: 'Storage tidak tersedia' } });
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(await ubahStatusLaporan(input)).toEqual({ error: 'KARANTINA_GAGAL' });
    mock.rpc.mockResolvedValueOnce({ error: { message: 'TRANSISI_TIDAK_VALID' } });
    expect(await ubahStatusLaporan(input)).toEqual({ ok: true });
    expect(mock.move).toHaveBeenLastCalledWith('pemilik/foto.webp', 'pemilik/foto.webp', { destinationBucket: 'karantina' });
    expect(mock.move).toHaveBeenCalledTimes(2);
    log.mockRestore();
  });

  it.each(['TIDAK_LOGIN', 'BUKAN_INSTANSI', 'DEMO_TERBATAS'])('menolak %s sebelum memakai service role', async (message) => {
    mock.rpc.mockResolvedValueOnce({ error: { message } });
    expect(await ubahStatusLaporan(input)).toEqual({ error: message });
    expect(mock.admin).not.toHaveBeenCalled();
    expect(mock.publik).not.toHaveBeenCalled();
  });

  it.each([
    { status: 'diproses', alasan_tolak: null },
    { status: 'ditolak', alasan_tolak: 'duplikat' },
    null,
  ])('tidak mengarantina keputusan yang berbeda: %j', async (data) => {
    mock.rpc.mockResolvedValueOnce({ error: { message: 'TRANSISI_TIDAK_VALID' } });
    mock.publik.mockResolvedValueOnce({ data, error: null });
    expect(await ubahStatusLaporan(input)).toEqual({ error: 'TRANSISI_TIDAK_VALID' });
    expect(mock.admin).not.toHaveBeenCalled();
  });
});
