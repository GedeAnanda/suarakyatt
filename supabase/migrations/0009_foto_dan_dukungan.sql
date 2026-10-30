-- Audit UI/UX 29 Oktober: foto laporan dan bukti, foto yang dimoderasi, dan status dukungan.
-- 1. Bucket foto-laporan, bukti (publik) dan karantina (privat) beserta batas 5 MB dan JPG/PNG/WebP, yang
--    sebelumnya hanya diatur manual di dashboard.
-- 2. foto_sah(): create_report dan update_report_status sebelumnya menerima teks apa pun sebagai URL foto.
--    Sekarang URL harus menunjuk berkas gambar yang benar-benar ada di bucket, di folder milik pengunggahnya.
--    Asal URL dicek terhadap app_config 'asal_storage' bila diisi (disarankan di produksi, misalnya
--    "https://abcd.supabase.co"); bila kosong, hanya *.supabase.co dan Supabase lokal (port 54321).
-- 3. sudah_dukung() dan kolom didukung di similar_reports, supaya tombol dukung menampilkan status sebenarnya
--    dan tidak membatalkan dukungan tanpa disadari.
-- Foto laporan yang ditolak karena konten melanggar dipindah ke bucket karantina oleh server (Storage API,
-- lib/supabase/aksi-status.ts), karena berkas di bucket publik tetap terbuka lewat URL langsung.
-- Isi tiga fungsi di bawah identik dengan 0003 kecuali bagian yang diberi komentar.

-- ---------------------------------------------------------------------------
-- 1. Bucket
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('foto-laporan', 'foto-laporan', true,  5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('bukti',        'bukti',        true,  5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('karantina',    'karantina',    false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public             = excluded.public,
  file_size_limit    = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
-- karantina sengaja tanpa policy: hanya service role yang bisa membaca dan menulis.

-- ---------------------------------------------------------------------------
-- 2. foto_sah() — dipakai di dalam RPC saja, tidak bisa dipanggil klien
-- ---------------------------------------------------------------------------
create or replace function public.foto_sah(p_url text, p_bucket text, p_uid uuid)
returns boolean
language plpgsql stable security definer set search_path = public as $$
declare
  -- <asal>/storage/v1/object/public/<bucket>/<uid>/<uuid>.<ext>, sama dengan keluaran lib/supabase/unggah.ts.
  v_bagian text[] := regexp_match(coalesce(p_url, ''),
    '^(https?://[^/?#]+)/storage/v1/object/public/([a-z-]+)/([0-9a-f-]{36})/([0-9a-f-]{36}\.(webp|jpg|png))$');
  v_asal   text := (select rtrim(nilai #>> '{}', '/') from app_config where kunci = 'asal_storage');
begin
  if v_bagian is null or p_uid is null or v_bagian[2] <> p_bucket or v_bagian[3] <> p_uid::text then
    return false;
  end if;
  if v_asal is not null then
    if v_bagian[1] <> v_asal then return false; end if;
  elsif v_bagian[1] !~ '^https://[a-z0-9]+\.supabase\.co$' and v_bagian[1] !~ '^http://(localhost|127\.0\.0\.1):54321$' then
    return false;
  end if;
  return exists (
    select 1 from storage.objects o
    where o.bucket_id = p_bucket
      and o.name = v_bagian[3] || '/' || v_bagian[4]
      and o.metadata ->> 'mimetype' in ('image/jpeg', 'image/png', 'image/webp')
      and coalesce((o.metadata ->> 'size')::bigint, 0) between 1 and 5242880);
end;
$$;

-- ---------------------------------------------------------------------------
-- 3. sudah_dukung() — apakah pengguna yang login sudah mendukung laporan ini
-- ---------------------------------------------------------------------------
create or replace function public.sudah_dukung(p_kode text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from upvotes u join reports r on r.id = u.report_id
    where r.kode = p_kode and u.user_id = auth.uid());
$$;

-- ---------------------------------------------------------------------------
-- R2 · similar_reports() — ditambah kolom didukung
-- ---------------------------------------------------------------------------
create or replace function public.similar_reports(p_category_id smallint, p_lat float8, p_lng float8)
returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  v_titik  geography := st_setsrid(st_makepoint(p_lng, p_lat), 4326)::geography;
  v_radius numeric := coalesce((select (nilai #>> '{}')::numeric from app_config where kunci = 'radius_serupa_m'), 100);
begin
  if auth.uid() is null then raise exception 'TIDAK_LOGIN' using errcode = 'P0001'; end if;
  if p_category_id is null or p_lat is null or p_lng is null then
    raise exception 'INPUT_TIDAK_VALID' using errcode = 'P0001';
  end if;

  return coalesce((
    select jsonb_agg(jsonb_build_object(
             'kode', s.kode, 'jarak_m', s.jarak_m, 'status', s.status,
             'jumlah_upvote', s.jumlah_upvote, 'didukung', s.didukung, 'foto', s.foto, 'created_at', s.created_at)
           order by s.jarak_m)
    from (
      select r.kode, round(st_distance(r.lokasi, v_titik))::int as jarak_m, r.status,
             (select count(*)::int from upvotes u where u.report_id = r.id) as jumlah_upvote,
             exists (select 1 from upvotes u where u.report_id = r.id and u.user_id = auth.uid()) as didukung,
             r.foto[1] as foto, r.created_at
      from reports r
      where r.category_id = p_category_id
        and r.status in ('menunggu', 'diverifikasi', 'diproses')
        and st_dwithin(r.lokasi, v_titik, v_radius)
      order by st_distance(r.lokasi, v_titik)
      limit 5
    ) s), '[]'::jsonb);
end;
$$;

-- ---------------------------------------------------------------------------
-- R3 · create_report() — ditambah pemeriksaan foto
-- ---------------------------------------------------------------------------
create or replace function public.create_report(
  p_category_id smallint, p_deskripsi text, p_foto text[], p_lat float8, p_lng float8
) returns jsonb
language plpgsql volatile security definer set search_path = public as $$
declare
  v_uid      uuid := auth.uid();
  v_kategori categories%rowtype;
  v_wilayah  regions%rowtype;
  v_instansi text;
  v_kode     text;
  v_id       uuid;
  v_dibuat   timestamptz;
  -- 32 huruf/angka tanpa O, 0, I, 1 supaya kode tidak tertukar saat dibaca.
  v_alfabet  constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
begin
  if v_uid is null then raise exception 'TIDAK_LOGIN' using errcode = 'P0001'; end if;

  p_deskripsi := btrim(p_deskripsi);
  if p_deskripsi is null or char_length(p_deskripsi) not between 20 and 500
     or p_foto is null or cardinality(p_foto) not between 1 and 3
     or exists (select 1 from unnest(p_foto) f where coalesce(btrim(f), '') = '')
     or p_lat is null or p_lng is null then
    raise exception 'INPUT_TIDAK_VALID' using errcode = 'P0001';
  end if;

  -- Foto harus berkas gambar milik pelapor sendiri di bucket foto-laporan, tidak dipakai dua kali.
  if exists (select 1 from unnest(p_foto) f where not public.foto_sah(f, 'foto-laporan', v_uid))
     or cardinality(p_foto) <> (select count(distinct f) from unnest(p_foto) f) then
    raise exception 'FOTO_TIDAK_VALID' using errcode = 'P0001';
  end if;

  select * into v_kategori from categories where id = p_category_id;
  if not found then raise exception 'INPUT_TIDAK_VALID' using errcode = 'P0001'; end if;

  select * into v_wilayah from regions
  where st_contains(geom, st_setsrid(st_makepoint(p_lng, p_lat), 4326))
  limit 1;
  if not found then raise exception 'LUAR_WILAYAH' using errcode = 'P0001'; end if;

  loop
    v_kode := 'SR-' || (select string_agg(substr(v_alfabet, 1 + floor(random() * 32)::int, 1), '')
                        from generate_series(1, 6));
    exit when not exists (select 1 from reports where kode = v_kode)
          and not exists (select 1 from seed.reports where kode = v_kode);
  end loop;

  insert into reports (kode, user_id, category_id, region_id, deskripsi, foto, lokasi)
  values (v_kode, v_uid, p_category_id, v_wilayah.id, p_deskripsi, p_foto,
          st_setsrid(st_makepoint(p_lng, p_lat), 4326)::geography)
  returning id, created_at into v_id, v_dibuat;

  insert into report_updates (report_id, status_baru) values (v_id, 'menunggu');

  select nama into v_instansi from agencies where id = v_kategori.instansi_id;

  return jsonb_build_object(
    'kode', v_kode, 'status', 'menunggu',
    'kecamatan', v_wilayah.nama, 'kota', v_wilayah.kota, 'instansi', v_instansi,
    'batas_respons', v_dibuat + make_interval(hours => v_kategori.sla_respons_jam));
end;
$$;

-- ---------------------------------------------------------------------------
-- R6 · update_report_status() — ditambah pemeriksaan foto bukti
-- ---------------------------------------------------------------------------
create or replace function public.update_report_status(
  p_kode text,
  p_status status_laporan,
  p_catatan text default null,
  p_bukti_url text default null,
  p_alasan alasan_tolak default null,
  p_duplikat_kode text default null,
  p_perkiraan date default null
) returns jsonb
language plpgsql volatile security definer set search_path = public as $$
declare
  v_uid       uuid := auth.uid();
  v_profil    profiles%rowtype;
  v_laporan   reports%rowtype;
  v_rujukan   reports%rowtype;
  v_instansi  smallint;
  v_radius    numeric;
  v_responded timestamptz;
  v_resolved  timestamptz;
begin
  if v_uid is null then raise exception 'TIDAK_LOGIN' using errcode = 'P0001'; end if;

  select * into v_profil from profiles where id = v_uid;
  if not found or v_profil.role <> 'admin' then raise exception 'BUKAN_INSTANSI' using errcode = 'P0001'; end if;

  select * into v_laporan from reports where kode = p_kode for update;
  if not found then raise exception 'LAPORAN_TIDAK_ADA' using errcode = 'P0001'; end if;

  select instansi_id into v_instansi from categories where id = v_laporan.category_id;
  if v_profil.instansi_id is null or v_profil.instansi_id <> v_instansi then
    raise exception 'BUKAN_INSTANSI' using errcode = 'P0001';
  end if;

  -- SDD 5.5: admin demo hanya boleh mengubah laporan simulasi atau laporan buatan akun demo.
  if v_profil.is_demo and not v_laporan.is_simulated
     and not exists (select 1 from profiles where id = v_laporan.user_id and is_demo) then
    raise exception 'DEMO_TERBATAS' using errcode = 'P0001';
  end if;

  if not (   (v_laporan.status = 'menunggu'     and p_status in ('diverifikasi', 'ditolak'))
          or (v_laporan.status = 'diverifikasi' and p_status in ('diproses', 'ditolak'))
          or (v_laporan.status = 'diproses'     and p_status = 'selesai')) then
    raise exception 'TRANSISI_TIDAK_VALID' using errcode = 'P0001';
  end if;

  p_catatan   := nullif(btrim(p_catatan), '');
  p_bukti_url := nullif(btrim(p_bukti_url), '');

  if p_status = 'ditolak' then
    if p_alasan is null
       or (p_alasan in ('tidak_valid', 'konten_melanggar') and p_catatan is null) then
      raise exception 'ALASAN_WAJIB' using errcode = 'P0001';
    end if;

    if p_alasan = 'duplikat' then
      v_radius := coalesce((select (nilai #>> '{}')::numeric from app_config where kunci = 'radius_serupa_m'), 100);
      select * into v_rujukan from reports where kode = p_duplikat_kode;
      if not found
         or v_rujukan.id = v_laporan.id
         or v_rujukan.category_id <> v_laporan.category_id
         or v_rujukan.status not in ('menunggu', 'diverifikasi', 'diproses')
         or not st_dwithin(v_rujukan.lokasi, v_laporan.lokasi, v_radius) then
        raise exception 'DUPLIKAT_TIDAK_VALID' using errcode = 'P0001';
      end if;

      -- Pindahkan dukungan ke laporan rujukan (kecuali dukungan dari pemilik rujukan itu sendiri).
      insert into upvotes (report_id, user_id, created_at)
      select v_rujukan.id, u.user_id, u.created_at
      from upvotes u
      where u.report_id = v_laporan.id and u.user_id <> v_rujukan.user_id
      on conflict do nothing;
      delete from upvotes where report_id = v_laporan.id;
    end if;
  else
    p_alasan := null;
  end if;

  if p_status = 'selesai' and p_bukti_url is null then
    raise exception 'BUKTI_WAJIB' using errcode = 'P0001';
  end if;
  if p_status = 'selesai' and not public.foto_sah(p_bukti_url, 'bukti', v_uid) then
    raise exception 'FOTO_TIDAK_VALID' using errcode = 'P0001';
  end if;

  update reports set
    status            = p_status,
    responded_at      = case when v_laporan.status = 'menunggu' then coalesce(responded_at, now()) else responded_at end,
    resolved_at       = case when p_status = 'selesai' then now() else resolved_at end,
    perkiraan_selesai = coalesce(p_perkiraan, perkiraan_selesai)
  where id = v_laporan.id
  returning responded_at, resolved_at into v_responded, v_resolved;

  insert into report_updates (report_id, admin_id, status_baru, alasan_tolak, duplikat_dari, catatan, bukti_url)
  values (v_laporan.id, v_uid, p_status, p_alasan,
          case when p_alasan = 'duplikat' then v_rujukan.id end,
          p_catatan,
          case when p_status = 'selesai' then p_bukti_url end);

  return jsonb_build_object(
    'kode', v_laporan.kode, 'status', p_status,
    'responded_at', v_responded, 'resolved_at', v_resolved);
end;
$$;

revoke execute on function public.foto_sah(text, text, uuid) from public, anon, authenticated;
revoke execute on function public.sudah_dukung(text) from public, anon, authenticated;
grant execute on function public.sudah_dukung(text) to authenticated;
-- similar_reports, create_report, dan update_report_status: create or replace mempertahankan hak dari 0003.
