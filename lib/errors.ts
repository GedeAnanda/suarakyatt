// lib/errors.ts — peta kode error RPC ke pesan untuk pengguna (SDD v1.0 bagian 6.2)

// Bahasa warga (audit 10 Nov, W8, W25–W30, W43): sebut penyebab DAN jalan keluarnya; sapaan "kamu".
export const PESAN_ERROR: Record<string, string> = {
  TIDAK_LOGIN: 'Sesimu sudah berakhir. Masuk lagi, lalu coba sekali lagi. Isian yang sudah kamu tulis tetap tersimpan.',
  INPUT_TIDAK_VALID: 'Ada isian yang belum sesuai. Periksa bagian yang bertanda merah.',
  LAPORAN_TIDAK_ADA: 'Kode laporan tidak ditemukan. Periksa lagi kodenya, misalnya SR-ABC234.',
  LUAR_WILAYAH: 'Titik ini di luar Jakarta. Geser titiknya ke dalam wilayah Jakarta (Kepulauan Seribu belum bisa dilaporkan di sini).',
  BUKAN_PEMILIK: 'Hanya pelapor laporan ini yang bisa melakukannya.',
  BUKAN_INSTANSI: 'Laporan ini ditangani dinas lain, jadi tidak bisa diubah dari akun ini.',
  BUKAN_PERENCANA: 'Hanya petugas perencana kota yang bisa mengubah aturan resmi.',
  TRANSISI_TIDAK_VALID: 'Status laporan ini sudah berubah, jadi langkah ini tidak bisa dilakukan lagi. Muat ulang halaman untuk melihat status terbarunya.',
  ALASAN_WAJIB: 'Pilih alasan penolakan dan tulis catatannya.',
  BUKTI_WAJIB: 'Lampirkan foto bukti bahwa masalahnya sudah diperbaiki.',
  DUPLIKAT_TIDAK_VALID:
    'Laporan asli yang dirujuk harus jenis masalahnya sama, masih belum selesai, dan berjarak paling jauh 100 m.',
  LAPORAN_TIDAK_AKTIF: 'Laporan ini sudah selesai, ditolak, atau dibatalkan, jadi tidak bisa didukung lagi.',
  UPVOTE_SENDIRI: 'Kamu tidak bisa mendukung laporanmu sendiri.',
  BELUM_SELESAI: 'Nilai bintang baru bisa diberikan setelah laporan selesai.',
  SUDAH_DIRATING: 'Laporan ini sudah kamu beri nilai.',
  BOBOT_TIDAK_VALID: 'Tingkat kepentingan harus 0–100% dan tidak boleh semuanya nol.',
  ALASAN_TERLALU_PENDEK: 'Alasan minimal 10 karakter.',
  DEMO_TERBATAS: 'Akun demo hanya bisa mengubah laporan data buatan.',
  KENDALA_TIDAK_BERLAKU: 'Kendala hanya bisa dicatat untuk laporan yang sudah diperiksa atau sedang dikerjakan.',
  ALASAN_TUNDA_WAJIB: 'Pilih alasan tunda. Untuk "Alasan lain", tulis juga catatannya.',
  TANGGAL_LEWAT: 'Perkiraan tanggal selesai tidak boleh sebelum hari ini.',

  // Auth dan unggah foto (lib/supabase/aksi-auth.ts, lib/supabase/unggah.ts)
  KREDENSIAL_SALAH: 'Email atau password salah. Lupa password? Minta tautan untuk menggantinya.',
  EMAIL_BELUM_VERIFIKASI: 'Akunmu belum aktif. Buka email dari SUARAKYAT dan ketuk tautannya, atau kirim ulang emailnya lewat tombol di bawah.',
  PASSWORD_LEMAH: 'Password minimal 8 karakter.',
  NAMA_TIDAK_VALID: 'Nama minimal 2 huruf, maksimal 80.',
  EMAIL_TIDAK_VALID: 'Format email belum benar, misalnya nama@contoh.id.',
  SANDI_SAMA: 'Password baru harus berbeda dari password lama.',
  DEMO_SANDI: 'Password akun demo dipakai bersama dan tidak bisa diubah.',
  BATAS_EMAIL: 'Terlalu banyak permintaan email. Coba lagi beberapa menit lagi.',
  EMAIL_TIDAK_TERKIRIM:
    'Saat ini kami belum bisa mengirim email ke alamat ini. Untuk mencoba aplikasinya, pakai tombol "Coba sebagai warga demo" di bawah.',
  UNGGAH_GAGAL: 'Foto gagal dikirim, biasanya karena sinyal lemah. Periksa internet, lalu coba kirim lagi. Foto tidak perlu dipilih ulang.',
  FOTO_TIDAK_VALID: 'Foto ini tidak bisa dipakai. Hapus, lalu pilih foto lain dari kamera atau galeri.',
  KARANTINA_GAGAL:
    'Status sudah tersimpan, tetapi foto laporan belum berhasil disembunyikan dari publik. Hubungi tim SUARAKYAT.',
};

const PESAN_UMUM = 'Ada gangguan. Periksa koneksi internet, lalu coba lagi beberapa menit lagi.';

/** Ubah error dari supabase-js (atau Error biasa) menjadi pesan yang ramah pengguna. */
export function pesanError(err: unknown): string {
  if (typeof err === 'object' && err !== null && 'message' in err) {
    const kode = String((err as { message: unknown }).message);
    return PESAN_ERROR[kode] ?? PESAN_UMUM;
  }
  return PESAN_UMUM;
}
