import { scene, node, action, decision, start, end, connect } from './scene.mjs';

export function activity(id, title, height, first = 'Pengguna') {
    const s = scene(id, title, 760, height);
    s.description = `${title}. ${first} dan sistem melakukan kegiatan secara berurutan; cabang dan pengulangan ditunjukkan dengan panah.`;
    node(s, 'lane-u', 'lane', 20, 20, 340, height - 40, first);
    node(s, 'lane-s', 'lane', 380, 20, 340, height - 40, 'Sistem');
    return s;
}
export const U = (s, id, y, label) => action(s, id, 70, y, 220, label);
export const S = (s, id, y, label) => action(s, id, 430, y, 250, label, { tone: 'green' });
export const D = (s, id, y, label) => decision(s, id, 450, y, 210, label);

export function accountFlow(number, login) {
    const s = activity(`A0${number}`, login ? 'Aktivitas masuk ke akun' : 'Aktivitas membuat akun pelanggan', 780);
    start(s, 'st', 169, 55);
    U(s, 'fill', 110, login ? 'Isi nama pengguna atau email serta kata sandi' : 'Isi nama, nama pengguna, nomor telepon, email, serta kata sandi dua kali');
    S(s, 'check', 110, login ? 'Cocokkan akun dan kata sandi, lalu periksa apakah akun masih aktif' : 'Periksa kelengkapan isian serta nama pengguna dan email yang sudah pernah digunakan');
    D(s, 'valid', 230, login ? 'Akun sesuai dan masih aktif?' : 'Semua isian dapat diterima?');
    U(s, 'fix', 400, 'Baca penjelasan, lalu perbaiki isian');
    S(s, 'save', 400, login ? 'Simpan waktu masuk dan buka halaman utama' : 'Simpan akun dan buka konsultasi pertama');
    U(s, 'ready', 570, login ? 'Gunakan layanan sesuai jenis pengguna' : 'Mulai mengisi data motor');
    end(s, 'end', 167, 680);
    connect(s, 'e1', 'st', 'fill');
    connect(s, 'e2', 'fill', 'check', '', { sides: ['right', 'left'] });
    connect(s, 'e3', 'check', 'valid');
    connect(s, 'e4', 'valid', 'fix', 'Belum', { sides: ['left', 'top'], labelX: 337, labelY: 346 });
    connect(s, 'e5', 'valid', 'save', 'Ya', { labelX: 575, labelY: 376 });
    connect(s, 'e6', 'fix', 'fill', '', { sides: ['left', 'left'], points: [{ x: 43, y: 429 }, { x: 43, y: 139 }] });
    connect(s, 'e7', 'save', 'ready', '', { sides: ['left', 'top'] });
    connect(s, 'e8', 'ready', 'end');
    return s;
}
