import { readFileSync, existsSync } from 'node:fs';
import { sequences } from '../diagrams/sequence.mjs';
import { scene, node, connect, legacyMessages } from './scene.mjs';
const savedUrl = new URL('./sequence-data.json', import.meta.url);

const replacements = [
    [/Basis data/g, 'Penyimpanan data'], [/basis pengetahuan/gi, 'data aturan'],
    [/penalaran/gi, 'pemeriksaan kecocokan'], [/diagnosa/gi, 'pemeriksaan'],
    [/Mesin pemeriksaan kecocokan/g, 'Pemeriksa kecocokan'],
    [/work order/gi, 'perintah kerja'], [/sparepart/gi, 'suku cadang'],
    [/Membuka sesi pengguna/g, 'Menandai pengguna sudah masuk'],
    [/Peringatan bahwa data aturan masih kosong/g, 'Penjelasan bahwa belum ada aturan aktif'],
    [/penyebab terbukti/gi, 'gangguan yang cocok'], [/Penyebab yang terbukti/g, 'Gangguan yang cocok'],
    [/semua gugur/g, 'belum ada yang cocok'],
    [/Kerusakan, suku cadang, biaya, dan urutan pemeriksaan kecocokan/g, 'Gangguan, suku cadang, perkiraan biaya, dan urutan pemeriksaan'],
    [/jejak pemeriksaan kecocokan/gi, 'urutan pemeriksaan'],
    [/Data motor, hasil, dan urutan pemeriksaan/g, 'Data motor, hasil, dan urutan pemeriksaan'],
    [/Pertanyaan aktif dan kemajuan pemeriksaan kecocokan/g, 'Pertanyaan saat ini dan kemajuan pemeriksaan'],
    [/pemeriksaan kecocokan selesai/gi, 'pemeriksaan selesai'],
    [/Memeriksa hak akses konsultasi/g, 'Memeriksa hak membuka konsultasi'],
    [/Memeriksa hak akses/g, 'Memeriksa izin pengguna'],
    [/Akses ditolak/g, 'Permintaan ditolak'],
    [/Formulir ulang dengan pesan pada isian/g, 'Tampilkan kembali isian dan bagian yang perlu diperbaiki'],
    [/Data akun atau tidak ditemukan/g, 'Kirim data akun atau kabar bahwa akun tidak ditemukan'],
    [/Data siap dicetak/g, 'Data siap dibuat menjadi perintah kerja'],
    [/Berkas PDF dengan nomor halaman/g, 'Berkas siap cetak dengan nomor halaman'],
    [/Memakai rentang bawaan/g, 'Gunakan tanggal awal dan akhir yang sudah disediakan'],
    [/basis Penyimpanan data/gi, 'penyimpanan data'],
    [/Mengirim email dan kata sandi/g, 'Mengirim nama pengguna atau email dan kata sandi'],
    [/Mencari akun dengan email tersebut/g, 'Mencari akun dengan nama pengguna atau email tersebut'],
    [/Mengirim nama, email, dan kata sandi/g, 'Mengirim nama, nama pengguna, email, nomor telepon, dan kata sandi yang diulang'],
    [/Memeriksa kelengkapan dan keunikan isian/g, 'Memeriksa kelengkapan isian serta pilihan nama pengguna dan email'],
    [/Mengecek email belum dipakai/g, 'Memastikan nama pengguna dan email belum pernah digunakan'],
    [/Pemberitahuan berhasil, diarahkan ke halaman masuk/g, 'Akun dibuat dan halaman konsultasi pertama dibuka'],
    [/^Login$/, 'Masuk ke akun'], [/^Registrasi akun$/, 'Membuat akun pelanggan'],
    [/inferensi/gi, 'pemeriksaan kecocokan'], [/^Unduh perintah kerja PDF$/, 'Mengunduh perintah kerja'],
    [/^Laporan PDF admin$/, 'Mengunduh laporan admin'],
];
function friendly(value) {
    let result = value;
    for (const [from, to] of replacements) result = result.replace(from, to);
    return result;
}

function sequenceScene(definition) {
    const extra = [];
    if (definition.slug === 's01') extra.push(
        { t: 'msg', from: 'a', to: 'l', text: 'Masuk ditolak karena akun sedang dinonaktifkan', ret: true },
        { t: 'msg', from: 'l', to: 'u', text: 'Penjelasan bahwa akun sedang tidak aktif', ret: true },
    );
    if (definition.slug === 's04') extra.push(
        { t: 'msg', from: 'u', to: 't', text: 'Menekan Ubah jawaban sebelumnya' },
        { t: 'msg', from: 't', to: 's', text: 'Meminta jawaban terakhir dibuka kembali' },
        { t: 'msg', from: 's', to: 'd', text: 'Menghapus jawaban terakhir' },
        { t: 'msg', from: 'd', to: 't', text: 'Pertanyaan sebelumnya siap dijawab kembali', ret: true },
        { t: 'msg', from: 'u', to: 't', text: 'Menyetujui pembatalan konsultasi' },
        { t: 'msg', from: 't', to: 'd', text: 'Menghapus konsultasi yang belum selesai' },
        { t: 'msg', from: 't', to: 'u', text: 'Kembali ke halaman konsultasi baru', ret: true },
    );
    if (definition.slug === 's02') extra.push(
        { t: 'msg', from: 'r', to: 'u', text: 'Penjelasan bahwa pendaftaran sedang ditutup; minta bantuan admin untuk membuat akun', ret: true, condition: 'Jika pendaftaran sedang ditutup' },
    );
    if (definition.slug === 's05') extra.push(
        { t: 'msg', from: 'h', to: 'u', text: 'Membuka kembali pertanyaan berikutnya', ret: true, condition: 'Jika konsultasi belum selesai' },
    );
    if (definition.slug === 's06') extra.push(
        { t: 'msg', from: 'p', to: 'u', text: 'Penjelasan bahwa konsultasi harus diselesaikan terlebih dahulu', ret: true, condition: 'Jika konsultasi belum selesai' },
    );
    if (definition.slug === 's07') extra.push(
        { t: 'msg', from: 's', to: 'c', text: 'Penjelasan bahwa jenis laporan tidak dikenali', ret: true, condition: 'Jika jenis laporan tidak tersedia' },
    );
    const messages = definition.messages || legacyMessages([...definition.events, ...extra]).map((e) => {
        const additional = extra.find((item) => item.text === e.text);
        let condition = friendly(additional?.condition || e.condition);
        if (additional && !additional.condition) condition = definition.slug === 's04' && e.text.includes('Ubah') ? 'Jika jawaban sebelumnya ingin diubah' : definition.slug === 's04' ? 'Jika konsultasi dibatalkan sebelum selesai' : 'Jika akun sedang dinonaktifkan';
        return { ...e, label: friendly(e.text), condition };
    });
    const count = definition.participants.length;
    const width = Math.max(1220, count * 260 + 80);
    const height = 190 + messages.reduce((sum, e) => sum + (e.condition ? 113 : 90), 80);
    const s = scene(definition.slug, friendly(definition.title), width, height);
    const captions = {
        's01': 'Satu halaman masuk digunakan admin dan pelanggan. Isian dapat berupa nama pengguna atau email.',
        's02': 'Pendaftaran mandiri membuat akun pelanggan. Setelah akun dibuat, konsultasi pertama langsung dapat dimulai.',
        's03': 'Konsultasi dapat dimulai jika isian utama diterima dan sudah ada aturan aktif.',
        's04': 'Setiap jawaban diperiksa kembali. Jawaban lama dapat diubah, dan konsultasi yang belum selesai dapat dibatalkan.',
        's05': 'Pengguna hanya dapat membuka konsultasinya sendiri. Bila belum ada gangguan yang cocok, pemeriksaan langsung di bengkel dianjurkan.',
        's06': 'Perintah kerja disiapkan setelah pemilik konsultasi dan penyelesaian pemeriksaan dipastikan.',
        's07': 'Admin memilih jenis laporan dan rentang tanggal. Rentang yang tidak wajar diganti dengan pilihan yang sudah disediakan.',
    };
    s.description = captions[definition.slug] || definition.caption || '';
    const columns = new Map();
    definition.participants.forEach((p, i) => {
        const x = Math.round(130 + i * (width - 260) / (count - 1));
        columns.set(p.id, { x, ...p, label: friendly(p.label) });
    });
    for (const p of columns.values()) {
        if (p.kind === 'actor') node(s, `head-${p.id}`, 'actor', p.x - 19, 20, 38, 63, p.label);
        else node(s, `head-${p.id}`, 'object', p.x - 100, 28, 200, 54, p.label, { tone: p.kind === 'data' ? 'gray' : 'blue' });
        node(s, `life-${p.id}`, 'line', p.x, 105, 0, height - 155, '', { dashed: true, behind: true });
    }
    let y = 155;
    for (const [index, e] of messages.entries()) {
        const from = columns.get(e.from), to = columns.get(e.to);
        const duration = e.condition ? 113 : 90;
        if (!from || !to) continue;
        if (from.x === to.x) {
            node(s, `a${index}`, 'activation', from.x - 6, y, 12, 58, '', { tone: 'orange' });
            connect(s, `m${index}`, `a${index}`, `a${index}`, '', {
                sides: ['right', 'right'], arrow: e.ret ? 'open' : 'open', dashed: !!e.ret,
                points: [{ x: from.x + 58, y: y + 29 }, { x: from.x + 58, y: y + 48 }, { x: from.x + 6, y: y + 48 }],
            });
        } else {
            node(s, `a${index}`, 'activation', from.x - 6, y, 12, 58, '', { tone: 'orange' });
            node(s, `b${index}`, 'activation', to.x - 6, y, 12, 58, '', { tone: 'orange' });
            connect(s, `m${index}`, `a${index}`, `b${index}`, '', {
                sides: [to.x > from.x ? 'right' : 'left', to.x > from.x ? 'left' : 'right'],
                arrow: 'open', dashed: !!e.ret,
            });
        }
        const caption = e.condition ? `${e.condition}: ${e.label}` : e.label;
        const center = from.x === to.x ? from.x + 160 : (from.x + to.x) / 2;
        node(s, `t${index}`, 'text', center - 120, y + 2, 240, 40, caption, { size: 11 });
        y += duration;
    }
    s.messages = messages;
    return s;
}
export function allSequences() {
    const definitions = existsSync(savedUrl) ? JSON.parse(readFileSync(savedUrl, 'utf8')) : sequences;
    return definitions.map(sequenceScene);
}
