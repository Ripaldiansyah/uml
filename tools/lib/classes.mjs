import { scene, node, connect, text } from './scene.mjs';

function box(s, id, x, y, w, h, title, lines, operations = []) {
    return node(s, id, 'class', x, y, w, h, title, { lines, operations });
}
function relation(s, id, a, b, label, options = {}) {
    connect(s, id, a, b, label, { arrow: 'none', ...options });
}

export function classDiagram() {
    const s = scene('class', 'Model, atribut, method, dan hubungan AKC Workshop', 1400, 1300);
    s.description = 'Enam model PHP dengan atribut dan method yang nyata. Dua tabel penghubung menyimpan premis aturan dan anjuran suku cadang; garis pengaitnya disediakan oleh model terkait.';
    text(s, 'heading', 70, 20, 1250, 55, 'Setiap model memiliki kompartemen atribut dan method. Nama serta parameter method mengikuti implementasi PHP pada folder app.', { size: 14, bold: true });
    box(s, 'user', 40, 120, 340, 295, 'User', [
        'id, nama, username, email', 'Nomor HP dan kata sandi', 'Role dan status aktif',
        'Waktu masuk terakhir', 'Waktu dibuat dan diubah',
    ], [
        '+ register(data: array): int',
        '+ rules(ignoreId: ?int, passwordRequired: bool): array',
        '+ update(id: int, data: array): void',
        '+ withKonsultasiCount(): array',
    ]);
    box(s, 'history', 435, 110, 445, 415, 'Konsultasi', [
        'id, kode, user_id', 'Nama pemilik dan merek motor',
        'Nomor kendaraan dan kilometer', 'Status: proses atau selesai',
        'target_kerusakan_id dan kerusakan_id', 'rule_id yang menghasilkan diagnosis',
        'Jawaban dan jejak pemeriksaan', 'total_biaya, waktu dibuat dan selesai',
    ], [
        '+ generateKode(): string',
        '+ detail(id: int): ?array',
        '+ filtered(filter: array): array',
        '+ update(id: int, data: array): void',
        '+ stats(userId: ?int): array',
        '- filterClause(f: array): array',
    ]);
    box(s, 'damage', 1010, 120, 370, 280, 'Kerusakan', [
        'id, kode, nama', 'Deskripsi dan solusi',
        'Jenis servis dan biaya jasa', 'Waktu dibuat',
    ], [
        '+ spareparts(kerusakanId: int): array',
        '+ syncSpareparts(kerusakanId: int, items: array): void',
        '+ estimasi(kerusakan: array): array', '+ summary(): array',
    ]);
    box(s, 'symptom', 40, 630, 290, 265, 'Gejala', [
        'id, kode, nama', 'Pertanyaan untuk pengguna',
        'Kategori', 'Waktu dibuat',
    ], [
        '+ rules(ignoreId: ?int): array', '+ keyed(): array',
        '+ withUsage(): array', '+ create(data: array): int',
    ]);
    box(s, 'rule', 435, 620, 445, 305, 'Rule', [
        'id, kode, kerusakan_id', 'Keterangan dan status aktif', 'Waktu dibuat',
    ], [
        '+ withPremis(onlyActive: bool): array',
        '+ findWithPremis(id: int): ?array',
        '+ save(id: ?int, data: array, premisIds: array): int',
        '+ duplicateOf(kerusakanId: int, premisIds: array): ?string',
        '+ toText(rule: array, withNames: bool): string',
    ]);
    box(s, 'premise', 540, 1010, 300, 140, 'rule_premis · tabel', [
        'rule_id, gejala_id', 'urutan pertanyaan',
        'Unik pada setiap aturan', 'Premis diatur oleh Rule::save().',
    ]);
    box(s, 'part', 930, 1020, 290, 265, 'Sparepart', [
        'id, kode, nama', 'Satuan, harga, dan stok', 'Waktu dibuat',
    ], [
        '+ rules(ignoreId: ?int): array', '+ withUsage(): array',
        '+ lowStock(threshold: int): array', '+ update(id: int, data: array): void',
    ]);
    box(s, 'advice', 1070, 915, 290, 80, 'kerusakan_sparepart · tabel', [
        'kerusakan_id, sparepart_id', 'qty dianjurkan',
    ]);

    relation(s, 'r1', 'user', 'history', '1 → 0..*', { sides: ['right', 'left'], labelX: 407.5, labelY: 250 });
    relation(s, 'r2', 'history', 'damage', 'Hasil: 0..1 → 0..*', { sides: ['right', 'left'], labelX: 945, labelY: 245 });
    relation(s, 'r2b', 'history', 'damage', 'Dugaan awal: 0..1 → 0..*', { sides: ['bottom', 'bottom'], points: [{ x: 657.5, y: 540 }, { x: 1185, y: 540 }], labelX: 967, labelY: 540 });
    relation(s, 'r3', 'history', 'rule', '0..1 → 0..*', { sides: ['bottom', 'top'], labelX: 750, labelY: 577 });
    relation(s, 'r4', 'rule', 'premise', '1 → 1..*', { sides: ['bottom', 'top'], labelX: 714, labelY: 970 });
    relation(s, 'r3b', 'damage', 'rule', '1 → 0..*', { sides: ['bottom', 'left'], points: [{ x: 1185, y: 607 }, { x: 925, y: 607 }], labelX: 1100, labelY: 607 });
    relation(s, 'r5', 'symptom', 'premise', '1 → 0..*', { sides: ['bottom', 'left'], points: [{ x: 185, y: 1110 }, { x: 510, y: 1110 }], labelX: 365, labelY: 1135 });
    relation(s, 'r6', 'damage', 'advice', '1 → 0..*', { sides: ['bottom', 'top'], points: [{ x: 1185, y: 500 }, { x: 1215, y: 500 }], labelX: 1295, labelY: 476 });
    relation(s, 'r7', 'advice', 'part', '0..1 → 0..*', { sides: ['bottom', 'top'], labelX: 1050, labelY: 1000 });
    return [s];
}
