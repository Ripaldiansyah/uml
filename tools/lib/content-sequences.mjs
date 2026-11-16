export const firstSequences = {
    s01: {
        intro: 'Pengunjung mengirim nama pengguna atau email bersama kata sandi. Sistem memeriksa kecocokan akun serta status aktifnya sebelum membuka layanan.',
        situations: [
            ['Pelanggan berhasil masuk', 'Sistem menandai pengguna sudah masuk dan membuka daftar konsultasi miliknya.', 'Hanya konsultasi milik akun tersebut yang dapat dibuka.'],
            ['Admin berhasil masuk', 'Halaman ringkasan bengkel terbuka.', 'Admin dapat mengelola data serta membaca seluruh riwayat.'],
            ['Isian kosong atau tidak cocok', 'Halaman masuk menampilkan bagian yang perlu diperbaiki atau pesan bahwa akun tidak dikenali.', 'Ubah isian lalu kirim kembali; kata sandi tidak ditampilkan.'],
            ['Akun tidak aktif', 'Masuk ditolak dengan penjelasan tentang status akun.', 'Pengelolaan akun tetap tersedia bagi admin.'],
        ],
    },
    s02: {
        intro: 'Pendaftaran mandiri membuat akun pelanggan dan langsung menandai pengguna sudah masuk. Data yang belum diterima dikembalikan untuk diperbaiki.',
        situations: [
            ['Isian diterima', 'Akun baru merupakan akun pelanggan; halaman konsultasi pertama terbuka.', 'Nama pengguna dan email tidak boleh sama dengan akun lain.'],
            ['Isian perlu diperbaiki', 'Kelengkapan isian, pilihan nama pengguna, alamat email, dan pengulangan kata sandi diperiksa.', 'Perbaiki bagian yang dijelaskan pada pesan lalu kirim ulang.'],
            ['Pendaftaran ditutup', 'Pengunjung menerima penjelasan bahwa pendaftaran mandiri tidak tersedia.', 'Hubungi admin agar dibuatkan akun.'],
        ],
    },
    s03: {
        intro: 'Konsultasi dimulai dari data pemilik dan motor. Dugaan gangguan dapat dipilih lebih dahulu, tetapi tidak wajib. Data konsultasi disimpan sebelum pertanyaan pertama dibuka.',
        situations: [
            ['Konsultasi berhasil dibuat', 'Nomor konsultasi dibuat dan data motor disimpan dengan status sedang diperiksa.', 'Pertanyaan pertama muncul setelah penyimpanan berhasil.'],
            ['Isian utama belum lengkap', 'Nama pemilik serta merk atau tipe motor perlu dilengkapi.', 'Pilihan gangguan harus diambil dari daftar yang tersedia; pilihan kosong berarti belum tahu.'],
            ['Belum ada aturan aktif', 'Konsultasi tidak dimulai. Pengguna mendapat penjelasan bahwa data pemeriksaan masih kosong.', 'Aktifkan atau tambahkan aturan melalui admin.'],
        ],
    },
    s04: {
        intro: 'Setiap jawaban Ya atau Tidak memperbarui pemeriksaan kecocokan. Sistem berhenti ketika menemukan gangguan yang sesuai atau semua kemungkinan tidak cocok, kemudian menyimpan hasilnya.',
        situations: [
            ['Gangguan sesuai', 'Gangguan, aturan yang digunakan, urutan pemeriksaan, dan perkiraan biaya disimpan lalu ditampilkan.', 'Tindakan servis dan biaya akhir tetap dipastikan di bengkel.'],
            ['Belum ada gangguan yang sesuai', 'Konsultasi tetap selesai dan pilihan pemeriksaan langsung dianjurkan.', 'Hasil ini bukan bukti bahwa motor pasti sehat; aturan mungkin belum mencakup keluhan tersebut.'],
            ['Mengubah jawaban terakhir', 'Jawaban terakhir dihapus dan pertanyaan sebelumnya dibuka kembali.', 'Pilihan ini tersedia selama pemeriksaan masih berjalan.'],
            ['Membatalkan konsultasi', 'Setelah persetujuan, konsultasi yang belum selesai dihapus.', 'Pengguna kembali ke halaman konsultasi baru. Riwayat yang sudah selesai tidak dihapus oleh pilihan ini.'],
            ['Jawaban tidak sesuai pertanyaan aktif', 'Sistem tidak memakai jawaban untuk pertanyaan yang sama atau sudah berganti.', 'Pilih Ya atau Tidak pada pertanyaan yang sedang ditampilkan.'],
        ],
    },
};
