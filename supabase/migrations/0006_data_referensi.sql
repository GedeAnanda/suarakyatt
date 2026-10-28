-- 0006_data_referensi.sql  (pemilik: B)
-- Data referensi instansi dan kategori. Sumber: PRD v0.3 bagian 7.2 (angka SLA = ilustrasi,
-- dinyatakan terbuka di halaman Sumber Data). Nama instansi generik dan bertanda simulasi.
-- Id dikunci 1–4 supaya cocok dengan lib/mocks/*.json dan dipakai generator seed (C).
-- Aman dijalankan ulang: baris yang sudah ada dilewati.

insert into agencies (id, nama, is_simulated) overriding system value values
  (1, 'Dinas Bina Jalan (simulasi)',       true),
  (2, 'Dinas Tata Air (simulasi)',         true),
  (3, 'Dinas Kebersihan (simulasi)',       true),
  (4, 'Dinas Penerangan Jalan (simulasi)', true)
on conflict do nothing;

insert into categories (id, nama, instansi_id, urgensi, sla_respons_jam, sla_selesai_jam) overriding system value values
  (1, 'Jalan rusak',       1, 'tinggi', 24, 120),
  (2, 'Saluran tersumbat', 2, 'tinggi', 24,  96),
  (3, 'Sampah menumpuk',   3, 'sedang', 24,  72),
  (4, 'Lampu jalan mati',  4, 'sedang', 48, 168)
on conflict do nothing;

-- Lanjutkan penomoran otomatis setelah id yang diisi manual.
select setval(pg_get_serial_sequence('agencies', 'id'),   (select max(id) from agencies));
select setval(pg_get_serial_sequence('categories', 'id'), (select max(id) from categories));
