export const lastSequences = {
    s05: {
        intro: 'Hasil konsultasi hanya dapat dibuka oleh pemiliknya atau admin. Halaman menampilkan data motor, gangguan yang cocok, anjuran servis, dan perkiraan biaya.',
        situations: [
            ['Gangguan cocok', 'Anjuran suku cadang, jumlah pemakaian, biaya jasa, dan perkiraan total dihitung.', 'Harga dapat berubah mengikuti persediaan dan pemeriksaan langsung.'],
            ['Belum ada yang cocok', 'Sistem menampilkan penjelasan bahwa belum ada gangguan yang sesuai.', 'Pelanggan dianjurkan memeriksakan motor secara langsung.'],
            ['Konsultasi orang lain', 'Permintaan ditolak agar catatan pribadi tidak terbuka.', 'Admin memiliki izin membaca seluruh riwayat untuk kebutuhan bengkel.'],
            ['Konsultasi belum selesai', 'Sistem membuka kembali pertanyaan berikutnya.', 'Selesaikan tanya-jawab agar hasil dan perkiraan tersedia.'],
        ],
    },
    s06: {
        intro: 'Perintah kerja adalah berkas siap cetak yang berisi ringkasan konsultasi, tindakan servis, suku cadang, dan perkiraan biaya. Permintaan diperiksa agar tidak membuka konsultasi orang lain.',
        situations: [
            ['Konsultasi selesai dan telah diizinkan', 'Berkas siap cetak dibuat dengan nomor halaman dan dapat disimpan.', 'Gunakan perintah kerja sebagai bahan pembicaraan servis, bukan pengganti pemeriksaan mekanik.'],
            ['Konsultasi belum selesai', 'Sistem meminta pengguna menyelesaikan pemeriksaan terlebih dahulu.', 'Belum ada ringkasan akhir yang dapat dibuat.'],
            ['Bukan pemilik dan bukan admin', 'Permintaan ditolak.', 'Riwayat pengguna lain tetap terlindungi.'],
            ['Nomor konsultasi tidak ditemukan', 'Sistem menjelaskan bahwa data tidak tersedia.', 'Kembali ke daftar konsultasi dan pilih riwayat yang benar.'],
        ],
    },
    s07: {
        intro: 'Admin memilih salah satu dari tujuh laporan: ringkasan, konsultasi, gejala, gangguan, aturan, suku cadang, atau pengguna. Laporan konsultasi dapat dibatasi menurut periode dan hasil pemeriksaan.',
        situations: [
            ['Filter konsultasi lengkap', 'Admin menentukan awal dan akhir tanggal, status konsultasi, serta ada atau tidaknya gangguan yang ditemukan.', 'Gunakan kata pencarian bila ingin mempersempit nama, nomor polisi, atau nomor konsultasi.'],
            ['Tanggal tidak wajar', 'Jika tanggal akhir lebih awal dari tanggal mulai, pilihan yang sudah disediakan sistem digunakan kembali.', 'Periksa kembali rentang tanggal pada hasil sebelum mencetak.'],
            ['Jenis laporan tidak tersedia', 'Sistem menampilkan penjelasan bahwa jenis tersebut tidak dikenali.', 'Pilih jenis laporan dari halaman yang disediakan.'],
            ['Pengguna bukan admin', 'Permintaan laporan ditolak.', 'Laporan pengelolaan bengkel hanya dibuka oleh admin.'],
        ],
    },
};
