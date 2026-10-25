-- 0002_views_rls.sql  (pemilik: B)
-- Acuan: SDD v1.0 bagian 4.3 (view) dan 5 (keamanan).
-- Prinsip: klien hanya MEMBACA lewat RLS dan view; semua penulisan lewat RPC di 0003.

-- ---------------------------------------------------------------------------
-- 1. Fungsi bantu peran (SDD 5.1)
--    security definer: membaca profiles tanpa terhalang RLS profiles sendiri.
-- ---------------------------------------------------------------------------

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

-- Instansi admin yang sedang login; null untuk warga, tamu, atau Perencana tanpa instansi.
create or replace function public.my_instansi() returns smallint
language sql stable security definer set search_path = public as $$
  select instansi_id from profiles where id = auth.uid() and role = 'admin';
$$;

create or replace function public.is_perencana() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin' and kelola_prioritas);
$$;

revoke execute on function public.is_admin(), public.my_instansi(), public.is_perencana() from public;
grant execute on function public.is_admin(), public.my_instansi(), public.is_perencana() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 2. RLS untuk SEMUA tabel public (SDD 5.2)
-- ---------------------------------------------------------------------------

alter table app_config         enable row level security;
alter table agencies           enable row level security;
alter table categories         enable row level security;
alter table regions            enable row level security;
alter table profiles           enable row level security;
alter table reports            enable row level security;
alter table report_updates     enable row level security;
alter table upvotes            enable row level security;
alter table ratings            enable row level security;
alter table priority_weights   enable row level security;
alter table weight_changes     enable row level security;
alter table priority_overrides enable row level security;
alter table keberatan          enable row level security;
alter table crm_agregat        enable row level security;

-- Data referensi: dibaca siapa saja.
create policy "publik baca" on app_config       for select to anon, authenticated using (true);
create policy "publik baca" on agencies         for select to anon, authenticated using (true);
create policy "publik baca" on categories       for select to anon, authenticated using (true);
create policy "publik baca" on regions          for select to anon, authenticated using (true);
create policy "publik baca" on priority_weights for select to anon, authenticated using (true);
create policy "publik baca" on crm_agregat      for select to anon, authenticated using (true);
create policy "publik baca yang aktif" on priority_overrides for select to anon, authenticated using (aktif);

-- profiles: hanya baris sendiri; yang boleh diubah hanya kolom nama (lihat bagian 5).
create policy "baca profil sendiri" on profiles for select to authenticated
  using (id = (select auth.uid()));
create policy "ubah profil sendiri" on profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- reports: pelapor (miliknya), admin (kategori instansinya), Perencana (semua).
-- Publik tidak membaca tabel ini; publik lewat v_laporan_publik.
create policy "pelapor baca miliknya" on reports for select to authenticated
  using (user_id = (select auth.uid()));
create policy "admin baca laporan instansinya" on reports for select to authenticated
  using (exists (
    select 1 from categories c
    where c.id = reports.category_id and c.instansi_id = (select public.my_instansi())
  ));
create policy "perencana baca semua" on reports for select to authenticated
  using ((select public.is_perencana()));

-- report_updates: admin instansi dan Perencana. Publik lewat v_timeline_publik.
create policy "admin baca timeline instansinya" on report_updates for select to authenticated
  using (exists (
    select 1 from reports r join categories c on c.id = r.category_id
    where r.id = report_updates.report_id and c.instansi_id = (select public.my_instansi())
  ));
create policy "perencana baca semua" on report_updates for select to authenticated
  using ((select public.is_perencana()));

-- upvotes dan ratings: baris milik sendiri. Jumlah upvote publik lewat view.
create policy "baca miliknya" on upvotes for select to authenticated
  using (user_id = (select auth.uid()));
create policy "baca miliknya" on ratings for select to authenticated
  using (user_id = (select auth.uid()));

-- keberatan (sebaiknya ada): pelapor (miliknya) dan Perencana.
create policy "pelapor baca miliknya" on keberatan for select to authenticated
  using (user_id = (select auth.uid()));
create policy "perencana baca semua" on keberatan for select to authenticated
  using ((select public.is_perencana()));

-- weight_changes: sengaja tanpa kebijakan; publik membaca lewat v_riwayat_bobot (tanpa admin_id).

-- ---------------------------------------------------------------------------
-- 3. View publik (SDD 4.3)
--    Dimiliki postgres sehingga bisa membaca tabel dasar, tapi hanya mengekspos kolom aman.
--    security_barrier mencegah filter di view dibocorkan lewat fungsi di WHERE.
-- ---------------------------------------------------------------------------

-- Q1, Q2 · bentuknya sama dengan LaporanPublik di lib/types.ts
create view v_laporan_publik with (security_barrier = true) as
select
  r.kode,
  c.nama  as kategori,
  a.nama  as instansi,
  g.nama  as kecamatan,
  g.kota,
  r.status,
  st_y(r.lokasi::geometry) as lat,
  st_x(r.lokasi::geometry) as lng,
  case when akhir.alasan_tolak = 'konten_melanggar' then null else r.deskripsi end as deskripsi,
  case when akhir.alasan_tolak = 'konten_melanggar' then '{}'::text[] else r.foto end as foto,
  case when r.status = 'selesai' then akhir.bukti_url end as foto_bukti,
  case when r.status = 'ditolak' then akhir.alasan_tolak end as alasan_tolak,
  upper(left(split_part(btrim(p.nama), ' ', 1), 1) || left(split_part(btrim(p.nama), ' ', 2), 1)) as inisial_pelapor,
  (select count(*)::int from upvotes u where u.report_id = r.id) as jumlah_upvote,
  r.created_at,
  r.responded_at,
  r.resolved_at,
  r.perkiraan_selesai,
  r.created_at + make_interval(hours => c.sla_respons_jam) as batas_respons,
  r.created_at + make_interval(hours => c.sla_selesai_jam) as batas_selesai,
  r.is_simulated
from reports r
join categories c on c.id = r.category_id
join agencies a   on a.id = c.instansi_id
join regions g    on g.id = r.region_id
join profiles p   on p.id = r.user_id
-- Baris timeline terakhir untuk status sekarang: sumber alasan tolak dan foto bukti.
left join lateral (
  select ru.alasan_tolak, ru.bukti_url
  from report_updates ru
  where ru.report_id = r.id and ru.status_baru = r.status
  order by ru.created_at desc
  limit 1
) akhir on true
where r.status <> 'dibatalkan';

-- Q2 · bentuknya sama dengan TimelineItem di lib/types.ts
create view v_timeline_publik with (security_barrier = true) as
select
  r.kode,
  ru.status_baru,
  ru.alasan_tolak,
  ru.catatan,
  ru.bukti_url,
  case when ru.admin_id is null then 'Pelapor'
       else 'Admin · ' || coalesce(a.nama, 'instansi') end as pelaku,
  ru.created_at
from report_updates ru
join reports r on r.id = ru.report_id
left join profiles p  on p.id = ru.admin_id
left join agencies a  on a.id = p.instansi_id
where r.status <> 'dibatalkan';

-- Q6
create view v_riwayat_bobot as
select
  w.created_at,
  w.bobot_lama,
  w.bobot_baru,
  w.alasan,
  'Perencana · ' || coalesce(a.nama, 'Bappeda Kota (simulasi)') as pelaku
from weight_changes w
left join profiles p on p.id = w.admin_id
left join agencies a on a.id = p.instansi_id;

-- Q3 · security_invoker: RLS tabel reports tetap berlaku, jadi admin hanya melihat instansinya.
create view v_laporan_admin with (security_invoker = true) as
select
  r.*,
  st_y(r.lokasi::geometry) as lat,
  st_x(r.lokasi::geometry) as lng,
  c.nama as kategori,
  g.nama as kecamatan,
  g.kota,
  r.created_at + make_interval(hours => c.sla_respons_jam) as batas_respons,
  r.created_at + make_interval(hours => c.sla_selesai_jam) as batas_selesai,
  r.status in ('menunggu', 'diverifikasi', 'diproses') and (
    (r.status = 'menunggu' and now() > r.created_at + make_interval(hours => c.sla_respons_jam))
    or now() > r.created_at + make_interval(hours => c.sla_selesai_jam)
  ) as terlambat
from reports r
join categories c on c.id = r.category_id
join regions g    on g.id = r.region_id;

-- ---------------------------------------------------------------------------
-- 4. Storage (SDD 5.4). Baca: bucket publik. Batas 5 MB dan JPG/PNG/WebP diatur di bucket.
-- ---------------------------------------------------------------------------

create policy "foto-laporan: unggah ke folder sendiri" on storage.objects for insert to authenticated
  with check (
    bucket_id = 'foto-laporan'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "bukti: admin unggah ke folder sendiri" on storage.objects for insert to authenticated
  with check (
    bucket_id = 'bukti'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and (select public.is_admin())
  );

-- ---------------------------------------------------------------------------
-- 5. Hak akses tabel: klien hanya SELECT (dibatasi RLS di atas).
--    Supabase memberi anon/authenticated semua hak secara default; dicabut di sini
--    supaya penulisan hanya bisa lewat RPC security definer (0003).
-- ---------------------------------------------------------------------------

revoke all on all tables in schema public from anon, authenticated;
grant select on all tables in schema public to anon, authenticated;
revoke select on v_laporan_admin from anon;
grant update (nama) on profiles to authenticated;
