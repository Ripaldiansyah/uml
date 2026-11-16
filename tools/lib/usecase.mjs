import { scene, node, connect, text } from './scene.mjs';

function use(s, id, x, y, label, admin = false) {
    node(s, id, 'ellipse', x - 132, y - 36, 264, 72, label, { tone: admin ? 'orange' : 'blue' });
}
function association(s, id, a, b, points, sides = ['right', 'left']) {
    connect(s, id, a, b, '', { sides, points, arrow: 'none', color: '#666666' });
}
function next(s, id, a, b, label, options = {}) {
    connect(s, id, a, b, label, { dashed: true, arrow: 'open', ...options });
}

export function usecaseDiagram() {
    const s = scene('usecase', 'Kasus penggunaan AKC Workshop', 1660, 1060);
    s.description = 'Pengunjung dapat mendaftar dan masuk. Pelanggan memeriksa motornya dan melihat riwayat sendiri. Admin memiliki kemampuan pelanggan serta mengelola data bengkel dan laporan.';
    node(s, 'system', 'lane', 320, 25, 1120, 940, 'Layanan AKC Workshop');
    node(s, 'visitor', 'actor', 105, 170, 40, 65, 'Pengunjung');
    node(s, 'member', 'actor', 105, 570, 40, 65, 'Pelanggan');
    node(s, 'admin', 'actor', 1520, 570, 40, 65, 'Admin');
    const definitions = [
        ['uc01', 460, 145, 'Membuat akun pelanggan'], ['uc02', 460, 240, 'Masuk ke akun'],
        ['uc05', 460, 365, 'Memulai konsultasi'], ['uc06', 460, 480, 'Menjawab pertanyaan'],
        ['uc07', 835, 420, 'Membatalkan jawaban terakhir'], ['uc08', 835, 545, 'Membatalkan konsultasi'],
        ['uc09', 460, 670, 'Membaca hasil pemeriksaan'], ['uc10', 835, 700, 'Mengunduh perintah kerja'],
        ['uc03', 460, 785, 'Keluar dari akun'], ['uc04', 720, 880, 'Mengubah profil'],
        ['uc11', 1070, 880, 'Melihat riwayat sendiri'],
        ['uc12', 1180, 135, 'Melihat ringkasan bengkel', true], ['uc13', 1180, 220, 'Mengelola gejala', true],
        ['uc14', 1180, 305, 'Mengelola gangguan dan servis', true], ['uc15', 1180, 390, 'Mengelola suku cadang', true],
        ['uc16', 1180, 475, 'Mengelola aturan pemeriksaan', true], ['uc17', 1200, 600, 'Mengelola pengguna', true],
        ['uc18', 1200, 690, 'Melihat semua riwayat', true], ['uc19', 1200, 780, 'Mencetak laporan', true],
    ];
    definitions.forEach((d) => use(s, ...d));
    association(s, 'v1', 'visitor', 'uc01', [{ x: 250, y: 202 }, { x: 250, y: 145 }]);
    association(s, 'v2', 'visitor', 'uc02', [{ x: 250, y: 202 }, { x: 250, y: 240 }]);
    ['uc05', 'uc06', 'uc09', 'uc03'].forEach((id) => {
        const target = s.shapes.find((n) => n.id === id);
        association(s, `m-${id}`, 'member', id, [{ x: 255, y: 602 }, { x: 255, y: target.y + target.h / 2 }]);
    });
    association(s, 'm-uc04', 'member', 'uc04', [{ x: 255, y: 602 }, { x: 255, y: 940 }, { x: 720, y: 940 }], ['right', 'bottom']);
    association(s, 'm-uc11', 'member', 'uc11', [{ x: 255, y: 602 }, { x: 255, y: 940 }, { x: 1070, y: 940 }], ['right', 'bottom']);
    definitions.filter((d) => d[4]).forEach(([id, x, y]) => association(s, `a-${id}`, 'admin', id, [{ x: 1480, y: 602 }, { x: 1480, y }], ['left', 'right']));
    next(s, 'step1', 'uc05', 'uc06', 'setelah konsultasi dibuat', { labelX: 460, labelY: 428 });
    next(s, 'optional1', 'uc06', 'uc07', 'bila ingin membetulkan jawaban', { sides: ['right', 'left'], labelX: 648, labelY: 433 });
    next(s, 'optional2', 'uc06', 'uc08', 'bila ingin berhenti', { sides: ['right', 'left'], labelX: 650, labelY: 529 });
    next(s, 'optional3', 'uc09', 'uc10', 'bila hasil tersedia', { sides: ['right', 'left'], labelX: 648, labelY: 667 });
    connect(s, 'general', 'admin', 'member', 'Admin juga dapat menggunakan layanan pelanggan', { arrow: 'triangle', sides: ['bottom', 'bottom'], points: [{ x: 1540, y: 1000 }, { x: 125, y: 1000 }], labelX: 859, labelY: 989 });
    text(s, 'explain', 400, 80, 975, 28, 'Garis putus-putus menunjukkan langkah lanjutan atau fitur tambahan. Tidak ada proses yang wajib diikuti bila tidak dibutuhkan.', { size: 12 });
    return [s];
}
