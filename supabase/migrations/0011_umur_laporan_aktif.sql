-- 0011_umur_laporan_aktif.sql — umur laporan aktif simulasi dibuat masuk akal (pemilik: C)
-- Audit bahasa awam dan data 10 Nov (docs/audit-awam-2026-11-10.md, temuan data).
--
-- Masalah: di seed, 210 dari 221 laporan berstatus diverifikasi/diproses sudah lewat batas selesai, median ±50 hari
-- dan paling lama 176 hari. Halaman lacak jadi penuh "Terlambat 54 hari" dan "Melewati janji", faktor umur di skor
-- prioritas mentok di batas 2× untuk hampir semua isu (tidak lagi membedakan), dan warga membaca aplikasinya rusak.
--
-- Perbaikan: setiap laporan aktif simulasi dipindah ke umur baru = g × batas selesai kategorinya, g deterministik dari
-- kode laporan di rentang [0,3; hi]. hi dipilih per kategori supaya profil instansi tetap (bagian terlambat pada jangkar):
--   Jalan rusak 25%, Saluran tersumbat 75% (Dinas Tata Air tetap paling lambat), Sampah 50%, Lampu jalan 25%.
-- Umur baru tidak pernah lebih pendek dari jeda verifikasi/pengerjaan yang sudah tercatat (+10%), jadi lama respons
-- dan urutan riwayat tidak berubah: semua waktu laporan itu digeser maju dengan selisih yang sama.
-- Kendala (alasan tunda) dan perkiraan selesai laporan yang digeser dibuat ulang oleh isi_kendala_simulasi().
-- Hanya seed.* yang diubah; data tampil disalin ulang dengan reset_demo_data() (sama dengan reset malam).
-- Laporan warga sungguhan (bukan simulasi) tidak disentuh.

create or replace function public.rapikan_umur_aktif_simulasi() returns jsonb
language plpgsql volatile security definer set search_path = public as $$
declare
  v_anchor timestamptz;
  v_n      int;
begin
  select (nilai #>> '{}')::timestamptz into v_anchor from app_config where kunci = 'seed_anchor';
  if v_anchor is null then raise exception 'SEED_BELUM_ADA' using errcode = 'P0001'; end if;

  drop table if exists umur_baru;
  create temp table umur_baru (id uuid primary key, geser interval) on commit drop;

  insert into umur_baru
  with akt as (
    select s.id, s.category_id, s.created_at, c.sla_selesai_jam as sla, abs(hashtext(s.kode)::bigint) as h,
           coalesce((select max(u.created_at) from seed.report_updates u
                     where u.report_id = s.id and u.alasan_tunda is null), s.created_at) - s.created_at as jeda
    from seed.reports s join categories c on c.id = s.category_id
    where s.status in ('diverifikasi', 'diproses')
  ), prm(category_id, hi) as (values (1, 1.233), (2, 3.1), (3, 1.7), (4, 1.233))
  select a.id,
         (v_anchor - greatest(make_interval(secs => (0.3 + (a.h % 1000) / 1000.0 * (p.hi - 0.3)) * a.sla * 3600),
                              a.jeda * 1.1 + interval '2 hours'))
         - a.created_at
  from akt a join prm p on p.category_id = a.category_id;

  -- Hanya membuat laporan lebih muda; yang sudah muda dibiarkan (fungsi ini idempoten).
  delete from umur_baru where geser <= interval '1 minute';
  select count(*) into v_n from umur_baru;

  update seed.reports s
     set created_at = s.created_at + g.geser,
         responded_at = s.responded_at + g.geser,
         perkiraan_selesai = null
    from umur_baru g where g.id = s.id;
  delete from seed.report_updates u using umur_baru g where u.report_id = g.id and u.alasan_tunda is not null;
  update seed.report_updates u set created_at = u.created_at + g.geser from umur_baru g where u.report_id = g.id;
  update seed.upvotes v
     set created_at = least(v.created_at + g.geser, v_anchor - interval '1 hour')
    from umur_baru g where v.report_id = g.id;

  return jsonb_build_object('digeser', v_n);
end;
$$;

revoke execute on function public.rapikan_umur_aktif_simulasi() from public, anon, authenticated;
grant execute on function public.rapikan_umur_aktif_simulasi() to service_role;

-- Database tim: rapikan seed, buat ulang kendala, lalu salin seed ke data tampil.
do $$
begin
  if exists (select 1 from seed.reports) and exists (select 1 from app_config where kunci = 'seed_anchor') then
    perform public.rapikan_umur_aktif_simulasi();
    perform public.isi_kendala_simulasi();
    perform public.reset_demo_data();
  end if;
end;
$$;

notify pgrst, 'reload schema';
