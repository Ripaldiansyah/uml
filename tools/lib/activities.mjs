import { scene, node, start, end, action, connect, decision } from './scene.mjs';
import { activity, U, S, D, accountFlow } from './activity-common.mjs';
import { buildConsult } from './activity-consult.mjs';

function symptoms() {
    const s = activity('A04', 'Aktivitas mengelola gejala dan pertanyaan', 790, 'Admin');
    start(s, 'st', 169, 50);
    U(s, 'pick', 100, 'Tambah gejala atau pilih sunting');
    U(s, 'fill', 200, 'Isi kode, nama, kategori, dan pertanyaan');
    S(s, 'check', 200, 'Periksa kelengkapan isian dan kode yang sama');
    D(s, 'valid', 310, 'Isian lengkap dan kode belum dipakai?');
    U(s, 'fix', 470, 'Perbaiki isian berdasarkan penjelasan');
    S(s, 'save', 470, 'Simpan gejala baru atau ganti gejala lama');
    U(s, 'done', 610, 'Lihat gejala pada daftar');
    end(s, 'end', 167, 700);
    connect(s, 'e1', 'st', 'pick'); connect(s, 'e2', 'pick', 'fill');
    connect(s, 'e3', 'fill', 'check', '', { sides: ['right', 'left'] });
    connect(s, 'e4', 'check', 'valid');
    connect(s, 'e5', 'valid', 'fix', 'Belum', { sides: ['left', 'top'], labelX: 337, labelY: 415 });
    connect(s, 'e6', 'fix', 'fill', '', { sides: ['left', 'left'], points: [{ x: 43, y: 499 }, { x: 43, y: 229 }] });
    connect(s, 'e7', 'valid', 'save', 'Ya', { labelX: 575, labelY: 440 });
    connect(s, 'e8', 'save', 'done', '', { sides: ['left', 'top'] });
    connect(s, 'e9', 'done', 'end');
    return s;
}
function knowledge() {
    const s = scene('A05', 'Aktivitas mengelola data pemeriksaan', 1200, 1090);
    s.description = 'Admin dapat mengelola gejala, gangguan, suku cadang, dan aturan. Setiap isian diperiksa sebelum disimpan.';
    const centers = [157.5, 452.5, 747.5, 1042.5];
    const names = ['Gejala', 'Gangguan', 'Suku cadang', 'Aturan pemeriksaan'];
    const entries = [
        ['Tambah atau pilih sunting', 'Isi kode, nama, kategori, dan pertanyaan'],
        ['Tambah atau pilih sunting', 'Isi nama, saran, jenis servis, biaya, dan suku cadang yang dianjurkan'],
        ['Tambah atau pilih sunting', 'Isi kode, nama, satuan, harga, dan stok'],
        ['Pilih gangguan, lalu tambah atau sunting', 'Pilih dan urutkan gejala yang harus diperiksa'],
    ];
    names.forEach((name, i) => node(s, `lane${i}`, 'lane', 20 + i * 295, 20, 275, 1050, name));
    start(s, 'st', 589, 55);
    action(s, 'open', 425, 95, 350, 'Buka daftar data pemeriksaan');
    node(s, 'choose', 'decision', 510, 190, 180, 'Bagian mana yang dipilih?');
    connect(s, 'e-start', 'st', 'open'); connect(s, 'e-choose', 'open', 'choose');
    centers.forEach((c, i) => {
        const x = c - 115;
        action(s, `entry${i}`, x, 350, 230, entries[i][0]);
        action(s, `fill${i}`, x, 450, 230, entries[i][1]);
        action(s, `check${i}`, x, 570, 230, 'Sistem memeriksa kelengkapan isian', { tone: 'green' });
        node(s, `valid${i}`, 'decision', c - 85, 680, 170, 'Isian dapat disimpan?');
        action(s, `fix${i}`, x, 850, 110, 'Belum: perbaiki isian').h = 95;
        action(s, `save${i}`, x + 120, 850, 110, 'Ya: simpan dan tampilkan daftar', { tone: 'green' }).h = 95;
        end(s, `end${i}`, c - 13, 1000);
        const side = i < 2 ? 'left' : 'right';
        connect(s, `branch${i}`, 'choose', `entry${i}`, names[i], { sides: [side, 'top'], points: [{ x: c, y: 234 }], labelX: c, labelY: 312 });
        connect(s, `f${i}`, `entry${i}`, `fill${i}`);
        connect(s, `c${i}`, `fill${i}`, `check${i}`);
        connect(s, `v${i}`, `check${i}`, `valid${i}`);
        connect(s, `no${i}`, `valid${i}`, `fix${i}`, 'Belum', { sides: ['left', 'top'], labelX: c - 94, labelY: 808 });
        connect(s, `yes${i}`, `valid${i}`, `save${i}`, 'Ya', { sides: ['right', 'top'], labelX: c + 94, labelY: 808 });
        connect(s, `loop${i}`, `fix${i}`, `fill${i}`, '', { sides: ['left', 'left'], points: [{ x: x - 12, y: 897 }, { x: x - 12, y: 479 }] });
        connect(s, `done${i}`, `save${i}`, `end${i}`, '', { sides: ['bottom', 'top'], points: [{ x: c + 60, y: 970 }, { x: c, y: 970 }] });
    });
    return s;
}
export function buildActivities() { return [accountFlow(1, false), accountFlow(2, true), buildConsult(), symptoms(), knowledge()]; }
