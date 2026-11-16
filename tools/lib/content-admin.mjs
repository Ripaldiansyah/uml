export const adminActivities = {
    a06: {
        intro: 'Aturan menghubungkan gejala dengan dugaan gangguan. Admin memilih gejala yang perlu ditanyakan, menentukan urutannya, dan mengatur apakah aturan tersebut sedang digunakan.',
        steps: ['Buka halaman aturan dan pilih tambah atau ubah.', 'Isi tanda aturan dan pilih gangguan yang menjadi tujuan pemeriksaan. Keterangan tambahan boleh dikosongkan.', 'Pilih sedikitnya satu gejala yang harus diperiksa.', 'Atur urutan gejala dengan pilihan naik atau turun. Susunan ini menentukan urutan pertanyaan kepada pelanggan.', 'Tandai aturan aktif jika ingin digunakan. Aturan yang tidak aktif tidak dipakai dalam pencocokan jawaban.', 'Simpan setelah semua isian diperiksa. Aturan yang belum tepat dapat diperbaiki kembali.', 'Pilih hapus bila aturan tidak lagi diperlukan dan setujui tindakan tersebut. Menonaktifkan aturan dapat dipilih bila riwayatnya ingin dipertahankan.'],
        situations: [
            ['Aturan siap digunakan', 'Ada gangguan tujuan dan sedikitnya satu gejala. Semua gejala diperiksa dalam urutan yang sudah ditentukan.', 'Aturan perlu ditandai aktif agar dipakai dalam pemeriksaan.'],
            ['Gejala belum dipilih', 'Aturan tidak disimpan sampai sedikitnya satu gejala dipilih.', 'Pilih dari daftar gejala yang sudah dibuat sebelumnya.'],
            ['Aturan dinonaktifkan', 'Aturan tetap dapat dilihat dan disunting, tetapi tidak dipakai dalam pencocokan berikutnya.', 'Aktifkan kembali setelah isinya diperiksa.'],
            ['Tanda sudah digunakan', 'Gunakan tanda aturan yang belum ada, lalu simpan kembali.', 'Isian lain tetap dapat diperiksa sebelum dikirim ulang.'],
        ],
    },
    a07: {
        intro: 'Admin menata akun pelanggan dan admin, termasuk menambah akun, memperbaiki data, mengganti kata sandi, mengubah jenis akun, dan mengatur apakah akun dapat digunakan.',
        steps: ['Buka daftar pengguna. Gunakan pencarian atau pilihan jenis akun untuk menemukan orang yang dicari.', 'Pilih tambah untuk membuat akun baru atau ubah untuk memperbaiki akun yang sudah ada.', 'Periksa nama, nama pengguna, email, nomor telepon, kata sandi, dan jenis akun. Pada perubahan akun, biarkan kata sandi kosong jika tidak ingin menggantinya.', 'Aktifkan akun yang diperbolehkan masuk atau nonaktifkan akun yang perlu dibatasi sementara.', 'Hapus akun hanya bila benar-benar tidak diperlukan. Riwayat konsultasi akun tersebut tetap tersimpan.', 'Admin tidak dapat menghapus atau menonaktifkan akunnya sendiri. Jenis akun sendiri juga tetap admin agar tidak kehilangan akses pengelolaan.', 'Kembali ke daftar dan pastikan status serta informasi akun sudah sesuai.'],
        situations: [
            ['Akun baru atau perubahan data', 'Akun disimpan setelah isian yang wajib lengkap dan tanda pengguna tidak bertabrakan dengan akun lain.', 'Kata sandi akun baru minimal enam karakter dan harus diulang dengan benar.'],
            ['Akun dinonaktifkan', 'Pengguna tersebut tidak dapat masuk sampai akun diaktifkan kembali.', 'Data dan riwayatnya tidak dihapus.'],
            ['Akun dihapus', 'Akun tidak lagi muncul pada daftar pengguna.', 'Riwayat konsultasi tetap ada dan tidak ikut dihapus.'],
            ['Akun admin sendiri', 'Penghapusan dan penonaktifan ditolak.', 'Gunakan akun admin lain bila pengelolaan khusus diperlukan.'],
            ['Isian tidak diterima', 'Pesan penjelasan muncul pada bagian yang perlu diperbaiki.', 'Periksa nama pengguna, alamat email, dan konfirmasi kata sandi.'],
        ],
    },
};
