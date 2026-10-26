/** Integrasi SQL/RPC. Semua mutasi berada dalam transaksi yang SELALU di-rollback. */
import assert from 'node:assert/strict';
import pg from 'pg';
import env from '@next/env';
env.loadEnvConfig(process.cwd());
const c=new pg.Client({connectionString:process.env.DATABASE_URL,connectionTimeoutMillis:10000});
let checks=0;
function cek(value,expected,label){assert.deepEqual(value,expected,label);checks++;console.log('OK:',label);}
try {
  await c.connect();await c.query('begin');
  const profiles=(await c.query('select id,role from profiles where is_demo')).rows;
  const warga=profiles.find(p=>p.role==='warga').id,admin=profiles.find(p=>p.role==='admin').id;
  const region=(await c.query('select id,st_y(st_pointonsurface(geom)) lat,st_x(st_pointonsurface(geom)) lng from regions order by id limit 1')).rows[0];
  const agency=(await c.query("insert into agencies(nama) values('Uji agregasi rollback') returning id")).rows[0].id;
  const category=(await c.query("insert into categories(nama,instansi_id,urgensi,sla_respons_jam,sla_selesai_jam) values('Uji rollback',$1,'tinggi',24,48) returning id",[agency])).rows[0].id;
  await c.query(`insert into reports(kode,user_id,category_id,region_id,deskripsi,foto,lokasi,status,created_at,responded_at,resolved_at,is_simulated)
    select 'TEST-'||n,$1,$2,$3,'Laporan uji yang selalu di-rollback',array['/demo/lampiran-simulasi.svg'],st_setsrid(st_makepoint($4,$5),4326),
      case when n<=5 then 'selesai'::status_laporan else 'menunggu'::status_laporan end,
      now()-interval '10 days',case when n<=5 then now()-interval '10 days'+interval '2 hours' end,
      case when n<=5 then now()-interval '9 days' end,true from generate_series(1,10) n`,[admin,category,region.id,region.lng,region.lat]);
  let rapor=(await c.query('select agency_report_card() data')).rows[0].data.instansi.find(i=>i.id===agency);
  cek([rapor.sampel,rapor.R,rapor.S,rapor.P,rapor.K,rapor.nilai,rapor.huruf],[10,.5,.5,.5,.6,52,'D'],'Laporan diabaikan masuk denominator R/S; rating netral; ambang huruf');
  await c.query("insert into ratings(report_id,user_id,nilai) select id,user_id,5 from reports where category_id=$1 and status='selesai'",[category]);
  rapor=(await c.query('select agency_report_card() data')).rows[0].data.instansi.find(i=>i.id===agency);
  cek([rapor.K,rapor.nilai,rapor.huruf],[.8,56,'C'],'Rating memakai prior netral 5 penilai');
  const isu=(await c.query('select priority_factors($1::smallint) data',[category])).rows[0].data.isu;
  cek([isu.length,isu[0].laporan_aktif,isu[0].laporan_terverifikasi,isu[0].mentah.volume,isu[0].mentah.umur],[1,5,0,0,2],'Prioritas mengecualikan laporan selesai dan menahan volume belum diverifikasi');
  await c.query("delete from reports where category_id=$1",[category]);
  await c.query(`insert into reports(kode,user_id,category_id,region_id,deskripsi,foto,lokasi,status,created_at,responded_at,resolved_at,is_simulated)
    select 'TEST-REJECT-'||n,$1,$2,$3,'Laporan uji yang selalu di-rollback',array['/demo/lampiran-simulasi.svg'],st_setsrid(st_makepoint($4,$5),4326),
      case when n<=6 then 'ditolak'::status_laporan else 'selesai'::status_laporan end,
      now()-interval '10 days',now()-interval '10 days'+interval '2 hours',case when n>6 then now()-interval '9 days' end,true
      from generate_series(1,20) n`,[admin,category,region.id,region.lng,region.lat]);
  await c.query("insert into report_updates(report_id,status_baru,alasan_tolak,catatan) select id,'ditolak','tidak_valid','Catatan uji' from reports where category_id=$1 and status='ditolak'",[category]);
  rapor=(await c.query('select agency_report_card() data')).rows[0].data.instansi.find(i=>i.id===agency);
  cek([rapor.nilai,rapor.huruf_asli,rapor.tingkat_penolakan,rapor.peringatan_penolakan,rapor.huruf],[92,'A',.3,true,'C'],'Penolakan 30% menahan nilai A menjadi C');
  // Jalankan RPC sebagai pengguna, bukan sebagai pemilik database.
  await c.query('set local role authenticated');
  await c.query("select set_config('request.jwt.claim.sub',$1,true)",[warga]);
  const dibuat=(await c.query("select create_report(1::smallint,'Uji alur laporan yang selalu di-rollback',array['/demo/lampiran-simulasi.svg'],$1,$2) data",[region.lat,region.lng])).rows[0].data;
  cek(Boolean(dibuat.kode?.startsWith('SR-')),true,'Warga dapat membuat laporan pada wilayah terpetakan');
  await c.query("select set_config('request.jwt.claim.sub',$1,true)",[admin]);
  await c.query("select update_report_status($1,'diverifikasi')",[dibuat.kode]);
  await c.query("select update_report_status($1,'diproses')",[dibuat.kode]);
  await c.query('reset role');
  const report=(await c.query('select status,is_simulated from reports where kode=$1',[dibuat.kode])).rows[0];
  cek(report,{status:'diproses',is_simulated:true},'Admin menindaklanjuti laporan demo; label simulasi otomatis');
  await c.query('set local role anon');
  cek((await c.query("select jsonb_array_length(priority_factors()->'isu')>0 ok")).rows[0].ok,true,'Agregasi prioritas dapat dibaca pengunjung');
  await c.query('reset role');
  const reset=(await c.query('select reset_demo_data() data')).rows[0].data;
  cek(reset.disalin,520,'Reset demo dapat memulihkan snapshot seed');
  console.log(`${checks} pemeriksaan integrasi lulus; semua perubahan uji dibatalkan.`);
} catch(e){ console.error('Verifikasi gagal:',e.code??e.message);process.exitCode=1; }
finally {await c.query('rollback').catch(()=>{});await c.end();}
