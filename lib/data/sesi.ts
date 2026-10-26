// lib/data/sesi.ts — siapa yang sedang login, untuk header dan tombol aksi (pemilik: A)
// Hanya untuk tampilan; hak akses sebenarnya tetap ditegakkan RLS dan RPC (SDD 9.1).

import 'server-only';
import { connection } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export interface Sesi {
  uid: string;
  nama: string;
  peran: 'warga' | 'admin';
  instansiId: number | null;
  perencana: boolean;
  demo: boolean;
}

export async function ambilSesi(): Promise<Sesi | null> {
  await connection();
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    const uid = data?.claims.sub;
    if (!uid) return null;
    const { data: profil } = await supabase
      .from('profiles')
      .select('nama,role,instansi_id,kelola_prioritas,is_demo')
      .eq('id', uid)
      .maybeSingle();
    return {
      uid,
      nama: profil?.nama ?? 'Pengguna',
      peran: profil?.role === 'admin' ? 'admin' : 'warga',
      instansiId: profil?.instansi_id ?? null,
      perencana: Boolean(profil?.kelola_prioritas),
      demo: Boolean(profil?.is_demo),
    };
  } catch {
    return null;
  }
}
