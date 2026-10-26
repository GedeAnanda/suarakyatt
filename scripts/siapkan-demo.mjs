/** Bootstrap database demo KOSONG. Tidak menghapus laporan atau mengubah akun/peran.
 * npm run demo:setup          pemeriksaan saja
 * npm run demo:setup -- --apply  migrasi agregasi + wilayah + seed dalam satu transaksi
 */
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import pg from 'pg';
import env from '@next/env';
env.loadEnvConfig(process.cwd());
const contoh=JSON.parse(readFileSync('lib/mocks/contoh-laporan.json','utf8'));
const prioritas=JSON.parse(readFileSync('lib/mocks/contoh-prioritas.json','utf8'));
const geo=JSON.parse(readFileSync('public/data/kecamatan.geojson','utf8'));
const miskin={'Jakarta Utara':6.4,'Jakarta Pusat':4.5,'Jakarta Timur':4.1,'Jakarta Barat':3.8,'Jakarta Selatan':3.2};
const c=new pg.Client({connectionString:process.env.DATABASE_URL,connectionTimeoutMillis:10000});
try {
  if(!process.env.DATABASE_URL) throw new Error('DATABASE_URL belum diisi.');
  await c.connect();
  await c.query('begin');
  await c.query('lock table public.regions,public.reports,seed.reports in share row exclusive mode');
  const counts=(await c.query('select (select count(*) from regions)::int regions,(select count(*) from reports)::int reports,(select count(*) from seed.reports)::int seed_reports')).rows[0];
  console.log('Kondisi database:',counts);
  if(Object.values(counts).some(n=>n>0)) throw new Error('Bootstrap hanya untuk database kosong; data yang ada tidak diubah.');
  const owner=(await c.query("select id from profiles where is_demo and role='admin' order by id limit 1")).rows[0]?.id;
  if(!owner) throw new Error('Akun admin demo belum tersedia.');
  console.log(`Rencana: ${geo.features.length} wilayah, ${contoh.laporan.length} laporan simulasi, agregasi prioritas dan rapor. Angka demografi adalah asumsi, bukan BPS.`);
  if(!process.argv.includes('--apply')) {await c.query('rollback');console.log('Pemeriksaan selesai. Gunakan --apply untuk mengisi.');}
  else {
    await c.query(readFileSync('supabase/migrations/0007_agregasi_demo.sql','utf8'));
    const regions=geo.features.map(f=>{
      const semua=f.geometry.coordinates.flat(2),xs=semua.map(p=>p[0]),ys=semua.map(p=>p[1]);
      const luas=Math.max(0.1,Math.round((Math.max(...xs)-Math.min(...xs))*110.6*(Math.max(...ys)-Math.min(...ys))*110.6*.62*10)/10);
      const density=prioritas.isu.find(i=>i.kode_wilayah===f.properties.kode_wilayah)?.mentah.kepadatan??15000;
      return {...f.properties,geom:f.geometry,luas,penduduk:Math.round(luas*density),miskin:miskin[f.properties.kota]};
    });
    const ids=(await c.query(`insert into regions(kode_wilayah,nama,kota,geom,penduduk,luas_km2,persen_miskin,sumber)
      select x->>'kode_wilayah',x->>'nama',x->>'kota',st_multi(st_setsrid(st_geomfromgeojson(x->>'geom'),4326)),(x->>'penduduk')::int,(x->>'luas')::numeric,(x->>'miskin')::numeric,
      'Batas: HDX COD-AB. Penduduk, luas statistik dan kemiskinan: asumsi simulasi 2026, bukan data BPS.'
      from jsonb_array_elements($1::jsonb) x returning id,kode_wilayah`,[JSON.stringify(regions)])).rows;
    const sekarang=new Date(),geser=+sekarang-Date.parse(contoh.jangkar);
    const waktu=d=>d?new Date(Date.parse(d)+geser).toISOString():null;
    const laporan=contoh.laporan.map(l=>({id:randomUUID(),kode:l.kode,user_id:owner,category_id:l.category_id,
      region_id:ids.find(g=>g.kode_wilayah===l.kode_wilayah).id,deskripsi:l.deskripsi,foto:['/demo/lampiran-simulasi.svg'],
      lokasi:`SRID=4326;POINT(${l.lng} ${l.lat})`,status:l.status,perkiraan_selesai:null,kategori_diubah:false,
      created_at:waktu(l.created_at),responded_at:waktu(l.responded_at),resolved_at:waktu(l.resolved_at),is_simulated:true}));
    await c.query('insert into reports select * from jsonb_populate_recordset(null::public.reports,$1::jsonb)',[JSON.stringify(laporan)]);
    // Contoh offline tidak memuat referensi duplikat; gunakan alasan tidak_valid secara eksplisit.
    const updates=contoh.timeline.map(t=>({report_id:laporan.find(l=>l.kode===t.kode).id,status_baru:t.status_baru,
      alasan_tolak:t.alasan_tolak==='duplikat'?'tidak_valid':t.alasan_tolak,
      catatan:t.alasan_tolak==='duplikat'?'Simulasi: informasi lokasi belum cukup untuk diverifikasi.':t.catatan,
      bukti_url:t.status_baru==='selesai'?'/demo/lampiran-simulasi.svg':null,created_at:waktu(t.created_at)}));
    await c.query(`insert into report_updates(report_id,status_baru,alasan_tolak,catatan,bukti_url,created_at)
      select report_id,status_baru,alasan_tolak,catatan,bukti_url,created_at from jsonb_populate_recordset(null::public.report_updates,$1::jsonb)`,[JSON.stringify(updates)]);
    const ratings=laporan.filter((l,i)=>l.status==='selesai'&&i%3!==0).map((l,i)=>({report_id:l.id,user_id:owner,nilai:l.category_id===2?(i%3)+2:(i%2)+4,komentar:'Rating contoh untuk simulasi.',created_at:l.resolved_at}));
    await c.query('insert into ratings select * from jsonb_populate_recordset(null::public.ratings,$1::jsonb)',[JSON.stringify(ratings)]);
    await c.query('insert into seed.reports select * from reports');
    await c.query('insert into seed.report_updates overriding system value select * from report_updates');
    await c.query('insert into seed.ratings select * from ratings');
    await c.query("insert into app_config(kunci,nilai) values('seed_anchor',to_jsonb($1::text)) on conflict(kunci) do update set nilai=excluded.nilai",[sekarang.toISOString()]);
    const checks=(await c.query("select jsonb_array_length(priority_factors()->'isu') isu,jsonb_array_length(agency_report_card()->'instansi') instansi,(select count(*) from reports r join regions g on g.id=r.region_id where not st_covers(g.geom,r.lokasi::geometry)) titik_di_luar")).rows[0];
    if(checks.isu===0||checks.instansi!==4||Number(checks.titik_di_luar)!==0) throw new Error('Pemeriksaan konsistensi gagal; transaksi dibatalkan.');
    await c.query('commit');console.log('Data demo tersimpan:',checks);
  }
} catch(e) {
  await c.query('rollback').catch(()=>{});
  // Jangan cetak connection string atau detail driver yang mungkin memuat kredensial.
  console.error('Setup gagal:',e.code??e.message);process.exitCode=1;
} finally {await c.end();}
