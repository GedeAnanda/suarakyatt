-- Agregasi publik dari laporan yang sama dengan peta dan pelacakan.
-- Tanpa identitas pelapor. Angka demografi pada demo tetap dilabeli simulasi.
create or replace function public.priority_factors(p_category_id smallint default null, p_sumber text default 'simulasi')
returns jsonb language sql stable security definer set search_path = public as $$
  with isu as (
    select g.id::text || '-' || c.id::text as id, g.kode_wilayah, g.nama as kecamatan, g.kota,
      c.id as category_id, c.nama as kategori, count(*) as laporan_aktif,
      count(*) filter (where r.status <> 'menunggu') as laporan_terverifikasi,
      jsonb_build_object(
        'urgensi', case c.urgensi when 'tinggi' then 1.0 when 'sedang' then 0.6 else 0.3 end,
        'volume', 10000.0 * count(*) filter (where r.status <> 'menunggu') / g.penduduk,
        'dukungan', 10000.0 * coalesce(sum(least(10, (select count(*) from upvotes u where u.report_id=r.id))) filter (where r.status <> 'menunggu'),0) / g.penduduk,
        'umur', avg(least(2.0, greatest(0, extract(epoch from (now()-r.created_at))/3600/c.sla_selesai_jam))),
        'kerentanan', g.persen_miskin, 'kepadatan', g.penduduk/g.luas_km2
      ) as mentah
    from reports r join regions g on g.id=r.region_id join categories c on c.id=r.category_id
    where r.status in ('menunggu','diverifikasi','diproses')
      and (p_category_id is null or c.id=p_category_id) and p_sumber='simulasi'
    group by g.id, c.id
  )
  select jsonb_build_object('sumber','simulasi','waktu_acuan',now(),'isu',coalesce((select jsonb_agg(to_jsonb(isu) order by id) from isu),'[]'::jsonb));
$$;

create or replace function public.agency_report_card(p_dari date default null, p_sampai date default null)
returns jsonb language sql stable security definer set search_path = public as $$
  with rentang as (
    select coalesce(p_dari,current_date-180) as dari,coalesce(p_sampai,current_date) as sampai
  ), lap as (
    select r.*, c.instansi_id, c.nama as kategori,
      r.created_at+make_interval(hours=>c.sla_respons_jam) as batas_respons,
      r.created_at+make_interval(hours=>c.sla_selesai_jam) as batas_selesai,
      (select u.alasan_tolak from report_updates u where u.report_id=r.id and u.status_baru=r.status order by u.created_at desc,u.id desc limit 1) as alasan,
      (select nilai from ratings t where t.report_id=r.id) as rating
    from reports r join categories c on c.id=r.category_id cross join rentang
    where r.status<>'dibatalkan' and r.created_at>=dari and r.created_at<sampai+1
  ), metrik as (
    select a.id,a.nama,
      count(l.id) filter(where l.responded_at is not null or now()>l.batas_respons) as sampel,
      coalesce(count(l.id) filter(where l.responded_at<=l.batas_respons)::numeric / nullif(count(l.id) filter(where l.responded_at is not null or now()>l.batas_respons),0),0) as "R",
      coalesce(count(l.id) filter(where l.status='selesai' and l.resolved_at<=l.batas_selesai)::numeric / nullif(count(l.id) filter(where l.status<>'ditolak' and (l.resolved_at is not null or now()>l.batas_selesai)),0),0) as "S",
      coalesce(count(l.id) filter(where l.status='selesai')::numeric/nullif(count(l.id) filter(where l.status<>'ditolak'),0),0) as "P",
      (coalesce(sum(l.rating),0)+15.0)/(count(l.rating)+5)/5 as "K",
      coalesce(count(l.id) filter(where l.status='ditolak' and l.alasan in ('tidak_valid','konten_melanggar'))::numeric / nullif(count(l.id) filter(where l.alasan is distinct from 'duplikat'),0),0) as tingkat_penolakan,
      percentile_cont(0.5) within group(order by extract(epoch from(l.responded_at-l.created_at))/3600) filter(where l.responded_at is not null) as median_respons_jam,
      count(l.id) filter(where l.status in ('menunggu','diverifikasi','diproses') and ((l.status='menunggu' and now()>l.batas_respons) or now()>l.batas_selesai)) as terlambat_aktif,
      (select count(*) from keberatan k join reports kr on kr.id=k.report_id join categories kc on kc.id=kr.category_id cross join rentang w where kc.instansi_id=a.id and k.status='diterima' and kr.created_at>=w.dari and kr.created_at<w.sampai+1) as keberatan_diterima
    from agencies a left join lap l on l.instansi_id=a.id group by a.id
  ), nilai as (
    select m.*,round(100*(0.3*"R"+0.3*"S"+0.2*"P"+0.2*"K"),1) as nilai,
      (tingkat_penolakan>0.25 or (tingkat_penolakan>=0.10 and tingkat_penolakan>2*(select percentile_cont(0.5) within group(order by x.tingkat_penolakan) from metrik x where x.id<>m.id and x.sampel>=10))) is true as peringatan_penolakan
    from metrik m
  ), huruf as (
    select n.*,case when nilai>=85 then 'A' when nilai>=70 then 'B' when nilai>=55 then 'C' when nilai>=40 then 'D' else 'E' end as huruf_asli from nilai n
  ), hasil as (
    select h.*,case when sampel<10 then null when peringatan_penolakan and huruf_asli in ('A','B') then 'C' else huruf_asli end as huruf,
    coalesce((select jsonb_agg(x) from (
      select kategori,count(*) filter(where responded_at is not null or now()>batas_respons) as sampel,
        coalesce(count(*) filter(where responded_at<=batas_respons)::numeric/nullif(count(*) filter(where responded_at is not null or now()>batas_respons),0),0) as "R",
        coalesce(count(*) filter(where status='selesai' and resolved_at<=batas_selesai)::numeric/nullif(count(*) filter(where status<>'ditolak' and (resolved_at is not null or now()>batas_selesai)),0),0) as "S",
        coalesce(count(*) filter(where status='selesai')::numeric/nullif(count(*) filter(where status<>'ditolak'),0),0) as "P"
      from lap where instansi_id=h.id group by kategori
    ) x),'[]'::jsonb) as per_kategori from huruf h
  )
  select jsonb_build_object('periode',(select to_jsonb(rentang) from rentang),'is_simulated',true,'instansi',coalesce((select jsonb_agg(to_jsonb(hasil) order by id) from hasil),'[]'::jsonb));
$$;

-- Demo yang dibuat melalui formulir tetap ditandai simulasi.
create or replace function public.tandai_laporan_demo() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if exists(select 1 from profiles where id=new.user_id and is_demo) then new.is_simulated:=true; end if;
  return new;
end;
$$;
drop trigger if exists tandai_laporan_demo on public.reports;
create trigger tandai_laporan_demo before insert on public.reports for each row execute function public.tandai_laporan_demo();
revoke all on function public.tandai_laporan_demo() from public;
revoke all on function public.priority_factors(smallint,text), public.agency_report_card(date,date) from public;
grant execute on function public.priority_factors(smallint,text), public.agency_report_card(date,date) to anon,authenticated,service_role;

-- Jejak seed tanpa akun petugas tidak ditampilkan seolah-olah ditulis pelapor.
create or replace view public.v_timeline_publik with (security_barrier=true) as
select r.kode,ru.status_baru,ru.alasan_tolak,ru.catatan,ru.bukti_url,
  case when ru.admin_id is not null then 'Admin · '||coalesce(a.nama,'instansi')
       when r.is_simulated and ru.status_baru not in ('menunggu','dibatalkan') then 'Catatan simulasi'
       else 'Pelapor' end as pelaku,ru.created_at
from report_updates ru join reports r on r.id=ru.report_id
left join profiles p on p.id=ru.admin_id left join agencies a on a.id=p.instansi_id
where r.status<>'dibatalkan';
notify pgrst,'reload schema';
