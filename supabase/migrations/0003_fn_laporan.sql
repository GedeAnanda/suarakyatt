-- 0003_fn_laporan.sql  (pemilik: B)
-- Acuan: SDD v1.0 bagian 6.3. Semua fungsi: security definer, set search_path = public,
-- error dengan: raise exception '<KODE>' using errcode = 'P0001';
-- Kode error dan pesannya ada di lib/errors.ts.

-- ---------------------------------------------------------------------------
-- R1 · stats_beranda() — angka ringkas Beranda (publik)
-- ---------------------------------------------------------------------------
create or replace function public.stats_beranda() returns jsonb
language sql stable security definer set search_path = public as $$
  with lap as (
    select r.status, r.is_simulated, c.nama as kategori,
           r.created_at + make_interval(hours => c.sla_respons_jam) as batas_respons,
           r.created_at + make_interval(hours => c.sla_selesai_jam) as batas_selesai
    from reports r join categories c on c.id = r.category_id
    where r.status <> 'dibatalkan'
  )
  select jsonb_build_object(
    'total_laporan', (select count(*) from lap),
    'persen_selesai', coalesce((
      select round(100.0 * count(*) filter (where status = 'selesai')
                   / nullif(count(*) filter (where status <> 'ditolak'), 0), 1)
      from lap), 0),
    'terlambat_aktif', (
      select count(*) from lap
      where status in ('menunggu', 'diverifikasi', 'diproses')
        and ((status = 'menunggu' and now() > batas_respons) or now() > batas_selesai)),
    'per_kategori', coalesce((
      select jsonb_agg(jsonb_build_object('kategori', kategori, 'jumlah', n) order by n desc, kategori)
      from (select kategori, count(*) as n from lap group by kategori) k), '[]'::jsonb),
    'is_simulated', coalesce((select bool_or(is_simulated) from lap), false)
  );
$$;

-- ---------------------------------------------------------------------------
-- R2 · similar_reports() — laporan aktif sekategori dalam radius serupa, maksimal 5
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
             'jumlah_upvote', s.jumlah_upvote, 'foto', s.foto, 'created_at', s.created_at)
           order by s.jarak_m)
    from (
      select r.kode, round(st_distance(r.lokasi, v_titik))::int as jarak_m, r.status,
             (select count(*)::int from upvotes u where u.report_id = r.id) as jumlah_upvote,
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
-- R3 · create_report() — buat laporan + baris timeline pertama
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
-- R4 · toggle_upvote() — dukung/batal dukung; hanya laporan aktif dan bukan milik sendiri
-- ---------------------------------------------------------------------------
create or replace function public.toggle_upvote(p_kode text) returns jsonb
language plpgsql volatile security definer set search_path = public as $$
declare
  v_uid     uuid := auth.uid();
  v_laporan reports%rowtype;
  v_dihapus boolean;
begin
  if v_uid is null then raise exception 'TIDAK_LOGIN' using errcode = 'P0001'; end if;

  select * into v_laporan from reports where kode = p_kode;
  if not found then raise exception 'LAPORAN_TIDAK_ADA' using errcode = 'P0001'; end if;
  if v_laporan.status not in ('menunggu', 'diverifikasi', 'diproses') then
    raise exception 'LAPORAN_TIDAK_AKTIF' using errcode = 'P0001';
  end if;
  if v_laporan.user_id = v_uid then raise exception 'UPVOTE_SENDIRI' using errcode = 'P0001'; end if;

  delete from upvotes where report_id = v_laporan.id and user_id = v_uid;
  v_dihapus := found;
  if not v_dihapus then
    insert into upvotes (report_id, user_id) values (v_laporan.id, v_uid) on conflict do nothing;
  end if;

  return jsonb_build_object(
    'upvoted', not v_dihapus,
    'jumlah_upvote', (select count(*) from upvotes where report_id = v_laporan.id));
end;
$$;

-- ---------------------------------------------------------------------------
-- R5 · cancel_report() — hanya pelapor, hanya dari status menunggu
-- ---------------------------------------------------------------------------
create or replace function public.cancel_report(p_kode text) returns jsonb
language plpgsql volatile security definer set search_path = public as $$
declare
  v_uid     uuid := auth.uid();
  v_laporan reports%rowtype;
begin
  if v_uid is null then raise exception 'TIDAK_LOGIN' using errcode = 'P0001'; end if;

  select * into v_laporan from reports where kode = p_kode for update;
  if not found then raise exception 'LAPORAN_TIDAK_ADA' using errcode = 'P0001'; end if;
  if v_laporan.user_id <> v_uid then raise exception 'BUKAN_PEMILIK' using errcode = 'P0001'; end if;
  if v_laporan.status <> 'menunggu' then raise exception 'TRANSISI_TIDAK_VALID' using errcode = 'P0001'; end if;

  update reports set status = 'dibatalkan' where id = v_laporan.id;
  insert into report_updates (report_id, status_baru) values (v_laporan.id, 'dibatalkan');

  return jsonb_build_object('kode', v_laporan.kode, 'status', 'dibatalkan');
end;
$$;

-- ---------------------------------------------------------------------------
-- R6 · update_report_status() — admin instansi mengubah status sesuai tabel transisi SDD 6.3
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

-- ---------------------------------------------------------------------------
-- R7 · rate_report() — hanya pelapor, hanya jika selesai, sekali per laporan
-- ---------------------------------------------------------------------------
create or replace function public.rate_report(p_kode text, p_nilai smallint, p_komentar text default null)
returns jsonb
language plpgsql volatile security definer set search_path = public as $$
declare
  v_uid     uuid := auth.uid();
  v_laporan reports%rowtype;
begin
  if v_uid is null then raise exception 'TIDAK_LOGIN' using errcode = 'P0001'; end if;

  select * into v_laporan from reports where kode = p_kode;
  if not found then raise exception 'LAPORAN_TIDAK_ADA' using errcode = 'P0001'; end if;
  if v_laporan.user_id <> v_uid then raise exception 'BUKAN_PEMILIK' using errcode = 'P0001'; end if;
  if v_laporan.status <> 'selesai' then raise exception 'BELUM_SELESAI' using errcode = 'P0001'; end if;
  if exists (select 1 from ratings where report_id = v_laporan.id) then
    raise exception 'SUDAH_DIRATING' using errcode = 'P0001';
  end if;

  p_komentar := nullif(btrim(p_komentar), '');
  if p_nilai is null or p_nilai not between 1 and 5 or char_length(p_komentar) > 300 then
    raise exception 'INPUT_TIDAK_VALID' using errcode = 'P0001';
  end if;

  insert into ratings (report_id, user_id, nilai, komentar) values (v_laporan.id, v_uid, p_nilai, p_komentar);

  return jsonb_build_object('kode', v_laporan.kode, 'nilai', p_nilai);
end;
$$;

-- ---------------------------------------------------------------------------
-- R10 · save_weights() — hanya Perencana; bobot dinormalisasi, snapshot lama/baru dicatat
-- ---------------------------------------------------------------------------
create or replace function public.save_weights(p_bobot jsonb, p_alasan text) returns jsonb
language plpgsql volatile security definer set search_path = public as $$
declare
  v_uid    uuid := auth.uid();
  v_faktor constant text[] := array['urgensi', 'volume', 'dukungan', 'umur', 'kerentanan', 'kepadatan'];
  v_total  numeric;
  v_lama   jsonb;
  v_baru   jsonb;
  v_id     bigint;
begin
  if v_uid is null then raise exception 'TIDAK_LOGIN' using errcode = 'P0001'; end if;
  if not public.is_perencana() then raise exception 'BUKAN_PERENCANA' using errcode = 'P0001'; end if;

  p_alasan := btrim(p_alasan);
  if coalesce(char_length(p_alasan), 0) < 10 then
    raise exception 'ALASAN_TERLALU_PENDEK' using errcode = 'P0001';
  end if;

  -- Tepat enam kunci faktor, setiap nilai angka 0–1.
  if jsonb_typeof(p_bobot) is distinct from 'object'
     or (select count(*) from jsonb_object_keys(p_bobot)) <> 6
     or exists (
       select 1 from unnest(v_faktor) f
       where case when jsonb_typeof(p_bobot -> f) = 'number'
                  then (p_bobot ->> f)::numeric not between 0 and 1
                  else true end) then
    raise exception 'BOBOT_TIDAK_VALID' using errcode = 'P0001';
  end if;

  select sum((p_bobot ->> f)::numeric) into v_total from unnest(v_faktor) f;
  if v_total <= 0 then raise exception 'BOBOT_TIDAK_VALID' using errcode = 'P0001'; end if;

  select jsonb_object_agg(faktor, bobot) into v_lama from priority_weights;

  update priority_weights
  set bobot = round((p_bobot ->> faktor)::numeric / v_total, 3), updated_by = v_uid, updated_at = now()
  where faktor = any(v_faktor);

  select jsonb_object_agg(faktor, bobot) into v_baru from priority_weights;

  insert into weight_changes (bobot_lama, bobot_baru, alasan, admin_id)
  values (v_lama, v_baru, p_alasan, v_uid)
  returning id into v_id;

  return jsonb_build_object('bobot', v_baru, 'riwayat_id', v_id);
end;
$$;

-- ---------------------------------------------------------------------------
-- R11 · reset_demo_data() — hanya service_role (dipanggil /api/cron/reset-demo)
--
-- Kontrak dengan C (generator seed, SDD 4.4 dan 10): isi tabel seed.* di bawah dengan data
-- simulasi (struktur sama dengan tabel public-nya) dan simpan app_config 'seed_anchor'
-- (timestamptz saat seed dibuat). Saat reset, semua waktu digeser sebesar now() - seed_anchor.
-- ---------------------------------------------------------------------------
create table if not exists seed.reports        (like public.reports        including defaults including constraints including identity);
create table if not exists seed.report_updates (like public.report_updates including defaults including constraints including identity);
create table if not exists seed.upvotes        (like public.upvotes        including defaults including constraints including identity);
create table if not exists seed.ratings        (like public.ratings        including defaults including constraints including identity);

-- Laporan sungguhan yang ditolak sebagai duplikat dari laporan simulasi tetap valid setelah reset,
-- karena laporan simulasi disalin ulang dengan id yang sama. FK dicek di akhir transaksi reset.
alter table report_updates alter constraint report_updates_duplikat_dari_fkey deferrable initially immediate;

create or replace function public.reset_demo_data() returns jsonb
language plpgsql volatile security definer set search_path = public as $$
declare
  v_anchor timestamptz;
  v_geser  interval;
  v_hapus  int;
  v_salin  int;
begin
  select (nilai #>> '{}')::timestamptz into v_anchor from app_config where kunci = 'seed_anchor';
  if v_anchor is null or not exists (select 1 from seed.reports) then
    raise exception 'SEED_BELUM_ADA' using errcode = 'P0001';
  end if;
  v_geser := now() - v_anchor;

  set constraints report_updates_duplikat_dari_fkey deferred;

  -- Jejak akun demo di laporan warga sungguhan.
  delete from upvotes   where user_id in (select id from profiles where is_demo);
  delete from keberatan where user_id in (select id from profiles where is_demo)
                           or report_id in (select id from reports
                                            where is_simulated or user_id in (select id from profiles where is_demo));

  -- Laporan simulasi + laporan buatan akun demo (timeline, upvote, rating ikut terhapus lewat cascade).
  delete from reports where is_simulated or user_id in (select id from profiles where is_demo);
  get diagnostics v_hapus = row_count;

  insert into reports (id, kode, user_id, category_id, region_id, deskripsi, foto, lokasi, status,
                       perkiraan_selesai, kategori_diubah, created_at, responded_at, resolved_at, is_simulated)
  select id, kode, user_id, category_id, region_id, deskripsi, foto, lokasi, status,
         (perkiraan_selesai + v_geser)::date, kategori_diubah,
         created_at + v_geser, responded_at + v_geser, resolved_at + v_geser, true
  from seed.reports;
  get diagnostics v_salin = row_count;

  insert into report_updates (report_id, admin_id, status_baru, alasan_tolak, duplikat_dari, catatan, bukti_url, created_at)
  select report_id, admin_id, status_baru, alasan_tolak, duplikat_dari, catatan, bukti_url, created_at + v_geser
  from seed.report_updates
  order by created_at, id;

  insert into upvotes (report_id, user_id, created_at)
  select report_id, user_id, created_at + v_geser from seed.upvotes
  on conflict do nothing;

  insert into ratings (report_id, user_id, nilai, komentar, created_at)
  select report_id, user_id, nilai, komentar, created_at + v_geser from seed.ratings
  on conflict do nothing;

  return jsonb_build_object('dihapus', v_hapus, 'disalin', v_salin,
                            'geser_jam', round(extract(epoch from v_geser) / 3600));
end;
$$;

-- ---------------------------------------------------------------------------
-- Hak eksekusi (SDD 5.3). Supabase memberi anon/authenticated hak eksekusi secara default,
-- jadi dicabut dulu lalu diberikan seperlunya.
-- ---------------------------------------------------------------------------
revoke execute on function
  public.stats_beranda(),
  public.similar_reports(smallint, float8, float8),
  public.create_report(smallint, text, text[], float8, float8),
  public.toggle_upvote(text),
  public.cancel_report(text),
  public.update_report_status(text, status_laporan, text, text, alasan_tolak, text, date),
  public.rate_report(text, smallint, text),
  public.save_weights(jsonb, text),
  public.reset_demo_data()
from public, anon, authenticated;

grant execute on function public.stats_beranda() to anon, authenticated;

grant execute on function
  public.similar_reports(smallint, float8, float8),
  public.create_report(smallint, text, text[], float8, float8),
  public.toggle_upvote(text),
  public.cancel_report(text),
  public.update_report_status(text, status_laporan, text, text, alasan_tolak, text, date),
  public.rate_report(text, smallint, text),
  public.save_weights(jsonb, text)
to authenticated;

grant execute on function public.reset_demo_data() to service_role;
