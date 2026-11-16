export const customerActivities = {
    a01: {
        intro: 'Pengunjung membuat akun pelanggan sendiri. Setelah isian diterima, akun langsung siap dipakai untuk konsultasi pertama.',
        steps: ['Buka halaman daftar dan isi nama lengkap, nama pengguna, serta kata sandi.', 'Tulis ulang kata sandi pada isian konfirmasi. Email dan nomor telepon boleh diisi atau dikosongkan.', 'Sistem memeriksa kelengkapan isian, bentuk alamat email, kesesuaian kata sandi, dan nama pengguna atau email yang sudah digunakan.', 'Jika ada kesalahan, perbaiki bagian yang ditandai lalu kirim kembali.', 'Jika diterima, akun disimpan sebagai pelanggan. Halaman konsultasi pertama langsung terbuka tanpa perlu masuk lagi.'],
        situations: [
            ['Isian diterima', 'Nama dan nama pengguna telah diisi, kata sandi minimal enam karakter serta diulang dengan benar; email dan nomor telepon bersifat pilihan.', 'Nama pengguna dan email harus berbeda dari akun lain.'],
            ['Isian perlu diperbaiki', 'Isian wajib kosong, kata sandi terlalu pendek atau tidak sama, alamat email tidak benar, atau identitas sudah dipakai.', 'Isian yang dikirim sebelumnya tetap tersedia agar mudah diperbaiki.'],
            ['Pendaftaran ditutup', 'Bila layanan pendaftaran mandiri sedang tidak tersedia, pengunjung diminta menghubungi admin untuk dibuatkan akun.', 'Akun admin tidak dibuat melalui pendaftaran mandiri.'],
        ],
    },
    a02: {
        intro: 'Admin dan pelanggan masuk melalui halaman yang sama. Setelah berhasil, halaman tujuan menyesuaikan jenis akun masing-masing.',
        steps: ['Isi nama pengguna atau email pada isian pertama.', 'Isi kata sandi, kemudian kirim.', 'Bila ada isian kosong, lengkapi bagian tersebut.', 'Sistem mencocokkan akun dan kata sandi, lalu memeriksa apakah akun masih aktif.', 'Jika diterima, admin menuju ringkasan bengkel dan pelanggan menuju daftar konsultasinya.'],
        situations: [
            ['Masuk berhasil', 'Admin melihat ringkasan bengkel; pelanggan melihat konsultasinya.', 'Jika sebelumnya mencoba membuka halaman tertentu, sistem dapat melanjutkan ke sana.'],
            ['Isian tidak cocok', 'Nama pengguna atau email tidak ditemukan, atau kata sandi salah.', 'Coba kembali dengan data yang benar. Kata sandi tidak pernah ditampilkan pada halaman.'],
            ['Akun dinonaktifkan', 'Sistem menolak masuk dan menjelaskan bahwa akun sedang tidak aktif.', 'Admin dapat mengaktifkan akun orang lain kembali.'],
        ],
    },
    a03: {
        intro: 'Pelanggan menceritakan data motor dan dapat memilih gangguan yang dicurigai. Sistem kemudian mencocokkan jawaban dengan aturan yang dibuat admin.',
        steps: ['Isi nama pemilik dan merk atau tipe motor. Nomor polisi dan jarak tempuh boleh dikosongkan.', 'Pilih gangguan yang dicurigai bila sudah diketahui, atau pilih tidak tahu untuk memeriksa semua kemungkinan.', 'Pastikan ada aturan aktif. Bila belum ada, hubungi admin untuk melengkapi data pemeriksaan.', 'Jawab setiap pertanyaan dengan Ya atau Tidak. Jawaban sebelumnya dapat diubah selama konsultasi belum selesai.', 'Sistem mengulangi pemeriksaan sampai menemukan gangguan yang cocok atau semua kemungkinan tidak sesuai.', 'Hasil disimpan bersama tanda gangguan, golongan servis, anjuran suku cadang, dan perkiraan biaya.', 'Buka hasil untuk dibaca kembali. Perintah kerja dapat diunduh setelah pemeriksaan selesai.'],
        situations: [
            ['Gangguan ditemukan', 'Halaman hasil menjelaskan gangguan yang cocok, tindakan servis, daftar suku cadang, dan perkiraan biaya.', 'Harga dan kebutuhan perbaikan tetap perlu dipastikan oleh mekanik.'],
            ['Belum ada yang cocok', 'Semua kemungkinan yang tersedia tidak sesuai dengan jawaban.', 'Lengkapi aturan bersama admin atau minta pemeriksaan langsung oleh mekanik.'],
            ['Jawaban ingin diubah', 'Gunakan pilihan mengubah jawaban sebelumnya agar pertanyaan sebelumnya muncul kembali.', 'Jawaban lama tidak langsung menentukan hasil akhir selama belum selesai.'],
            ['Belum ada aturan aktif', 'Sistem menampilkan penjelasan bahwa data pemeriksaan masih kosong.', 'Admin perlu menambah atau mengaktifkan aturan lebih dahulu.'],
        ],
    },
    a04: {
        intro: 'Admin mencatat gejala yang nantinya dipakai sebagai bahan pertanyaan. Setiap gejala mempunyai tanda sendiri agar mudah dibedakan pada aturan dan riwayat.',
        steps: ['Buka daftar gejala dan pilih tambah atau ubah.', 'Tulis pengenal singkat, nama gejala, serta kalimat pertanyaan yang mudah dipahami.', 'Kirim data untuk diperiksa. Tanda gejala tidak boleh sama dengan gejala lain.', 'Perbaiki isian jika ada bagian yang belum tepat; sistem menyimpan data setelah lolos pemeriksaan.', 'Pilih hapus bila gejala sudah tidak dibutuhkan, lalu setujui penghapusan.', 'Kembali ke daftar untuk memeriksa hasil perubahan.'],
        situations: [
            ['Gejala baru atau perubahan', 'Gejala tersimpan setelah semua isian diterima.', 'Gunakan pertanyaan yang dapat dijawab langsung dengan Ya atau Tidak.'],
            ['Pengenal sudah digunakan', 'Pilih tanda yang berbeda, lalu kirim ulang isian.', 'Data lain yang sudah diisi tetap dapat diperiksa kembali.'],
            ['Hapus gejala', 'Gejala dihapus setelah admin menyetujui tindakan tersebut.', 'Pilihan batal meninggalkan daftar tanpa perubahan.'],
        ],
    },
    a05: {
        intro: 'Satu halaman pengelolaan menampung informasi gangguan, tindakan servis, suku cadang, dan anjuran suku cadang. Admin dapat membantu pelanggan melihat biaya yang lebih jelas sebelum perbaikan dimulai.',
        steps: ['Pastikan jenis akun adalah admin, kemudian pilih bagian yang ingin dikelola.', 'Untuk gangguan, isi tanda, nama, jenis servis, biaya jasa, penjelasan, dan tindakan perbaikan.', 'Untuk suku cadang, isi tanda, nama, satuan, harga, dan jumlah persediaan.', 'Untuk anjuran, pilih gangguan dan suku cadang yang sesuai, lalu tentukan jumlah pemakaiannya.', 'Periksa kelengkapan isian dan kesesuaian tanda. Hindari duplikasi yang dapat menimbulkan pemahaman berbeda.', 'Simpan perubahan. Data yang sudah tidak dibutuhkan dapat dihapus setelah konfirmasi.', 'Baca kembali daftar untuk memastikan perubahan sudah sesuai.'],
        situations: [
            ['Data gangguan lengkap', 'Perkiraan biaya jasa dan penjelasan tindakan tersedia untuk konsultasi.', 'Perkiraan belum menggantikan pemeriksaan langsung oleh mekanik.'],
            ['Suku cadang siap dipakai', 'Nama, harga, satuan, dan jumlah persediaan membantu menghitung perkiraan pekerjaan.', 'Stok lima atau kurang ditandai sebagai persediaan rendah pada ringkasan bengkel.'],
            ['Anjuran diperbarui', 'Gangguan yang cocok dapat menampilkan suku cadang beserta jumlah pemakaiannya.', 'Pasangan gangguan dan suku cadang yang sama tidak perlu dibuat dua kali.'],
            ['Perubahan batal', 'Pilihan batal pada penghapusan mengembalikan admin ke daftar tanpa menghapus data.', 'Semua simpanan dan penghapusan hanya tersedia bagi admin.'],
        ],
    },
};
