export const classRecords = [
    ['user', 'User', 'Atribut berisi identitas akun, kata sandi terlindung, kontak, jenis akun, status aktif, waktu masuk terakhir, serta waktu pencatatan dan perubahan.', 'Satu akun boleh memiliki banyak konsultasi. Riwayat tidak ikut dihapus ketika akun dihapus; user_id pada riwayat menjadi kosong.'],
    ['history', 'Konsultasi', 'Atribut mencakup kode, pemilik akun, data motor, dugaan awal, gangguan akhir, aturan yang digunakan, jawaban, jejak pemeriksaan, status, total biaya, dan tanggal pengerjaan.', 'Dugaan awal dan gangguan akhir disimpan terpisah. Keduanya boleh kosong jika belum dipilih atau belum ada yang cocok.'],
    ['symptom', 'Gejala', 'Atribut mencakup kode, nama, kalimat pertanyaan, kategori, dan waktu pencatatan.', 'Satu gejala dapat digunakan pada banyak aturan melalui tabel rule_premis.'],
    ['damage', 'Kerusakan', 'Atribut mencakup kode, nama, jenis servis, biaya jasa, penjelasan masalah, dan tindakan perbaikan.', 'Method spareparts(), syncSpareparts(), dan estimasi() mengatur anjuran suku cadang serta biaya melalui tabel kerusakan_sparepart.'],
    ['rule', 'Rule', 'Atribut mencakup kode, gangguan tujuan, keterangan, status aktif, dan waktu pencatatan.', 'Hanya aturan aktif yang dipakai untuk memeriksa jawaban. Method save() menyimpan aturan beserta susunan premisnya dalam satu transaksi.'],
    ['premise', 'rule_premis', 'Tabel penghubung berisi rule_id, gejala_id, dan urutan pertanyaan.', 'Bukan model PHP dengan method sendiri. Isinya dibuat dan diubah oleh Rule::save().'],
    ['part', 'Sparepart', 'Atribut mencakup kode, nama, satuan, harga, jumlah persediaan, dan waktu pencatatan.', 'Method withUsage() membantu membaca pemakaian pada anjuran, sedangkan lowStock() menemukan persediaan yang perlu diperiksa.'],
    ['advice', 'kerusakan_sparepart', 'Tabel penghubung berisi kerusakan_id, sparepart_id, dan jumlah pemakaian.', 'Bukan model PHP dengan method sendiri. Isinya dibaca oleh Kerusakan::spareparts() dan diatur oleh Kerusakan::syncSpareparts().'],
];
export const relationRows = [
    ['Akun dan konsultasi', 'Satu akun dapat memiliki nol atau banyak konsultasi.', 'Konsultasi dapat kehilangan pemilik akun jika admin menghapus akun, tetapi riwayatnya tetap tersedia.'],
    ['Konsultasi dan dugaan awal', 'Satu konsultasi dapat memilih satu dugaan gangguan atau belum memilih.', 'Belum memilih berarti semua kemungkinan dapat diperiksa.'],
    ['Konsultasi dan gangguan akhir', 'Satu konsultasi dapat berakhir dengan satu gangguan yang cocok atau tanpa hasil.', 'Gangguan yang cocok dapat muncul pada banyak konsultasi.'],
    ['Konsultasi dan aturan', 'Konsultasi yang selesai dapat menyimpan satu aturan yang digunakan.', 'Aturan yang sama dapat digunakan pada banyak konsultasi.'],
    ['Gejala dalam aturan', 'Setiap bagian aturan menunjuk satu gejala dan satu aturan.', 'Susunan bagian menentukan urutan pertanyaan yang ditampilkan.'],
    ['Gangguan dan aturan', 'Setiap aturan memiliki satu gangguan tujuan.', 'Satu gangguan dapat memiliki beberapa aturan yang berbeda.'],
    ['Gangguan dan anjuran suku cadang', 'Satu gangguan dapat memiliki nol atau banyak anjuran.', 'Anjuran menyebut suku cadang beserta jumlah pemakaiannya.'],
    ['Suku cadang dan anjuran', 'Satu suku cadang dapat muncul pada nol atau banyak anjuran.', 'Jumlah pemakaian dihitung khusus untuk setiap gangguan.'],
];
