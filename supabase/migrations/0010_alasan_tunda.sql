-- 0010_alasan_tunda.sql — alasan tunda dari instansi + kode laporan asli di timeline publik (pemilik: B)
-- Revisi FDS 10 Nov 2026 (docs/revisi-fds-2026-11-10.md, butir 1.4, 1.5, 3.1).
--
-- 1. Enum alasan_tunda dan kolomnya di report_updates (juga di seed.report_updates).
--    Satu baris "kendala" adalah catatan instansi TANPA perubahan status: status_baru sama dengan status saat itu.
-- 2. RPC catat_kendala(): admin instansi mencatat kenapa laporan aktif belum bisa diselesaikan.
-- 3. v_timeline_publik: tambah alasan_tunda dan duplikat_dari_kode (kode laporan asli untuk penolakan duplikat).
-- 4. reset_demo_data(): ikut menyalin alasan_tunda.
-- 5. isi_kendala_simulasi(): mengisi kendala untuk laporan simulasi yang aktif (seed + data tampil). Hanya service role.

-- ---------------------------------------------------------------------------
-- 1. Skema
-- ---------------------------------------------------------------------------
create type alasan_tunda as enum (
  'antre_jadwal',         -- antre jadwal tim lapangan
  'menunggu_anggaran',    -- perlu anggaran di luar pemeliharaan rutin
  'menunggu_material',    -- material atau suku cadang belum tersedia
  'koordinasi_instansi',  -- wewenang atau aset instansi lain
  'cuaca',                -- hujan atau debit air tinggi
  'lainnya'               -- catatan wajib
);

alter table public.report_updates add column alasan_tunda public.alasan_tunda;
alter table public.report_updates
  add constraint report_updates_tunda_status_check check (alasan_tunda is null or status_baru in ('diverifikasi','diproses')),
  add constraint report_updates_tunda_catatan_check check (alasan_tunda is distinct from 'lainnya' or catatan is not null);

alter table seed.report_updates add column alasan_tunda public.alasan_tunda;
alter table seed.report_updates
  add constraint report_updates_tunda_status_check check (alasan_tunda is null or status_baru in ('diverifikasi','diproses')),
  add constraint report_updates_tunda_catatan_check check (alasan_tunda is distinct from 'lainnya' or catatan is not null);

-- ---------------------------------------------------------------------------
-- 2. R12 · catat_kendala() — catatan kendala tanpa mengubah status
-- ---------------------------------------------------------------------------
create or replace function public.catat_kendala(
  p_kode text,
  p_alasan alasan_tunda,
  p_catatan text default null,
  p_perkiraan date default null
) returns jsonb
language plpgsql volatile security definer set search_path = public as $$
declare
  v_uid      uuid := auth.uid();
  v_profil   profiles%rowtype;
  v_laporan  reports%rowtype;
  v_instansi smallint;
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

  -- Sama dengan update_report_status (SDD 5.5): admin demo hanya menyentuh laporan simulasi atau buatan akun demo.
  if v_profil.is_demo and not v_laporan.is_simulated
     and not exists (select 1 from profiles where id = v_laporan.user_id and is_demo) then
    raise exception 'DEMO_TERBATAS' using errcode = 'P0001';
  end if;

  -- Kendala hanya masuk akal setelah laporan diterima dan sebelum selesai.
  if v_laporan.status not in ('diverifikasi', 'diproses') then
    raise exception 'KENDALA_TIDAK_BERLAKU' using errcode = 'P0001';
  end if;

  p_catatan := nullif(btrim(p_catatan), '');
  if p_alasan is null or (p_alasan = 'lainnya' and p_catatan is null) then
    raise exception 'ALASAN_TUNDA_WAJIB' using errcode = 'P0001';
  end if;
  if char_length(p_catatan) > 300 then raise exception 'INPUT_TIDAK_VALID' using errcode = 'P0001'; end if;
  if p_perkiraan is not null and p_perkiraan < (now() at time zone 'Asia/Jakarta')::date then
    raise exception 'TANGGAL_LEWAT' using errcode = 'P0001';
  end if;

  update reports set perkiraan_selesai = coalesce(p_perkiraan, perkiraan_selesai) where id = v_laporan.id;

  insert into report_updates (report_id, admin_id, status_baru, alasan_tunda, catatan)
  values (v_laporan.id, v_uid, v_laporan.status, p_alasan, p_catatan);

  return jsonb_build_object('kode', v_laporan.kode, 'status', v_laporan.status, 'alasan_tunda', p_alasan,
                            'perkiraan_selesai', coalesce(p_perkiraan, v_laporan.perkiraan_selesai));
end;
$$;

revoke execute on function public.catat_kendala(text, alasan_tunda, text, date) from public, anon, authenticated;
grant execute on function public.catat_kendala(text, alasan_tunda, text, date) to authenticated;

-- ---------------------------------------------------------------------------
-- 3. v_timeline_publik — kolom baru ditambahkan di akhir supaya create or replace bisa dipakai
-- ---------------------------------------------------------------------------
create or replace view public.v_timeline_publik with (security_barrier=true) as
select r.kode,ru.status_baru,ru.alasan_tolak,ru.catatan,ru.bukti_url,
  case when ru.admin_id is not null then 'Admin · '||coalesce(a.nama,'instansi')
       when r.is_simulated and ru.status_baru not in ('menunggu','dibatalkan') then 'Catatan simulasi'
       else 'Pelapor' end as pelaku,ru.created_at,
  ru.alasan_tunda,
  -- Kode laporan asli untuk penolakan duplikat; laporan asli yang dibatalkan tidak punya halaman publik.
  case when d.status <> 'dibatalkan' then d.kode end as duplikat_dari_kode
from report_updates ru join reports r on r.id=ru.report_id
left join reports d on d.id=ru.duplikat_dari
left join profiles p on p.id=ru.admin_id left join agencies a on a.id=p.instansi_id
where r.status<>'dibatalkan';

-- ---------------------------------------------------------------------------
-- 4. reset_demo_data() — sama dengan 0003, ditambah alasan_tunda
-- ---------------------------------------------------------------------------
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

  insert into report_updates (report_id, admin_id, status_baru, alasan_tolak, duplikat_dari, catatan, bukti_url,
                              alasan_tunda, created_at)
  select report_id, admin_id, status_baru, alasan_tolak, duplikat_dari, catatan, bukti_url,
         alasan_tunda, created_at + v_geser
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
-- 5. isi_kendala_simulasi() — kendala untuk laporan simulasi yang masih aktif
--    Dipilih: semua yang sudah lewat batas selesai pada jangkar seed, ditambah ±1/4 yang belum lewat
--    (instansi yang memberi kabar lebih awal). Alasan dan catatan dipilih deterministik dari kode laporan.
--    Idempoten: laporan yang sudah punya kendala dilewati. Data tampil diisi dengan geseran waktu yang sama
--    dengan seed-nya, hanya untuk laporan yang statusnya belum berubah sejak seed.
-- ---------------------------------------------------------------------------
create or replace function public.isi_kendala_simulasi() returns jsonb
language plpgsql volatile security definer set search_path = public as $$
declare
  v_anchor timestamptz;
  v_seed   int;
  v_tampil int;
begin
  select (nilai #>> '{}')::timestamptz into v_anchor from app_config where kunci = 'seed_anchor';
  if v_anchor is null then raise exception 'SEED_BELUM_ADA' using errcode = 'P0001'; end if;

  -- Variabel PL/pgSQL tidak bisa dipakai di CREATE TABLE AS, jadi tabelnya dibuat dulu lalu diisi.
  drop table if exists kendala_baru;
  create temp table kendala_baru (
    report_id uuid, status status_laporan, alasan alasan_tunda, catatan text, waktu timestamptz, perkiraan date
  ) on commit drop;

  insert into kendala_baru
  with pilihan(category_id, urut, alasan, catatan) as (values
    (1, 0, 'menunggu_material'::alasan_tunda,   'Aspal hotmix belum tersedia di gudang suku dinas; penambalan menunggu kiriman.'),
    (1, 1, 'antre_jadwal',                      'Masuk antrean tim tambal keliling; perbaikan di jalan arteri didahulukan.'),
    (1, 2, 'cuaca',                             'Penambalan ditunda karena hujan; aspal tidak merekat di permukaan basah.'),
    (1, 3, 'menunggu_anggaran',                 'Kerusakan lebih luas dari tambal sulam; perlu pengaspalan ulang lewat anggaran perubahan.'),
    (2, 0, 'cuaca',                             'Debit air masih tinggi sejak hujan; pengerukan menunggu air surut.'),
    (2, 1, 'koordinasi_instansi',               'Saluran ada di bawah trotoar milik dinas jalan; pembongkaran perlu izin bersama.'),
    (2, 2, 'antre_jadwal',                      'Alat pengeruk sedang dipakai di saluran penghubung; lokasi ini dijadwalkan berikutnya.'),
    (2, 3, 'menunggu_material',                 'Tutup saluran beton perlu dipesan ulang sesuai ukuran.'),
    (3, 0, 'antre_jadwal',                      'Truk pengangkut penuh di rute ini; pengangkutan masuk jadwal rit berikutnya.'),
    (3, 1, 'koordinasi_instansi',               'Lahan milik pihak swasta; pengangkutan menunggu koordinasi dengan pengelola lahan.'),
    (3, 2, 'lainnya',                           'Warga masih membuang sampah di titik yang sama; petugas memasang papan larangan lebih dulu.'),
    (3, 3, 'antre_jadwal',                      'Petugas kebersihan kecamatan sedang dikerahkan ke lokasi banjir.'),
    (4, 0, 'koordinasi_instansi',               'Gangguan ada di jaringan listrik PLN, bukan di lampunya; menunggu perbaikan dari PLN.'),
    (4, 1, 'menunggu_material',                 'Lampu LED pengganti sedang dipesan; stok gudang habis.'),
    (4, 2, 'antre_jadwal',                      'Mobil tangga sedang dipakai di wilayah lain; perbaikan dijadwalkan pekan ini.'),
    (4, 3, 'menunggu_anggaran',                 'Tiang perlu diganti, bukan hanya lampunya; pengadaan tiang masuk anggaran berikutnya.')
  ),
  kandidat as (
    select s.id, s.category_id, s.status, abs(hashtext(s.kode)::bigint) as h,
           s.created_at + make_interval(hours => c.sla_selesai_jam) as batas,
           (select max(u.created_at) from seed.report_updates u where u.report_id = s.id) as terakhir
    from seed.reports s join categories c on c.id = s.category_id
    where s.status in ('diverifikasi', 'diproses')
      and not exists (select 1 from seed.report_updates u where u.report_id = s.id and u.alasan_tunda is not null)
  )
  select k.id as report_id, k.status, p.alasan, p.catatan,
         -- antara 30% dan 69% dari jeda sejak catatan terakhir sampai jangkar
         k.terakhir + (v_anchor - k.terakhir) * (0.3 + (k.h % 40) / 100.0) as waktu,
         ((v_anchor at time zone 'Asia/Jakarta')::date
           + (case when p.alasan = 'menunggu_anggaran' then 30 + k.h % 30 else 2 + k.h % 10 end)::int) as perkiraan
  from kandidat k
  join pilihan p on p.category_id = k.category_id and p.urut = (k.h / 7) % 4
  where k.terakhir is not null and (k.batas < v_anchor or k.h % 4 = 0);

  insert into seed.report_updates (report_id, status_baru, alasan_tunda, catatan, created_at)
  select report_id, status, alasan, catatan, waktu from kendala_baru;
  get diagnostics v_seed = row_count;

  update seed.reports s set perkiraan_selesai = k.perkiraan
  from kendala_baru k where k.report_id = s.id and s.perkiraan_selesai is null;

  -- Data yang sedang tampil: geser dengan selisih created_at laporan tampil terhadap seed-nya.
  insert into report_updates (report_id, status_baru, alasan_tunda, catatan, created_at)
  select k.report_id, k.status, k.alasan, k.catatan, k.waktu + (r.created_at - s.created_at)
  from kendala_baru k
  join seed.reports s on s.id = k.report_id
  join reports r on r.id = k.report_id and r.is_simulated and r.status = k.status
  where not exists (select 1 from report_updates u where u.report_id = r.id and u.alasan_tunda is not null);
  get diagnostics v_tampil = row_count;

  update reports r set perkiraan_selesai = (k.perkiraan + (r.created_at - s.created_at))::date
  from kendala_baru k join seed.reports s on s.id = k.report_id
  where r.id = k.report_id and r.is_simulated and r.status = k.status and r.perkiraan_selesai is null;

  return jsonb_build_object('seed', v_seed, 'tampil', v_tampil);
end;
$$;

revoke execute on function public.isi_kendala_simulasi() from public, anon, authenticated;
grant execute on function public.isi_kendala_simulasi() to service_role;

-- Isi sekarang kalau seed sudah ada (database tim). Database kosong: dipanggil oleh skrip pemuat seed.
do $$
begin
  if exists (select 1 from seed.reports) and exists (select 1 from app_config where kunci = 'seed_anchor') then
    perform public.isi_kendala_simulasi();
  end if;
end;
$$;

notify pgrst, 'reload schema';
