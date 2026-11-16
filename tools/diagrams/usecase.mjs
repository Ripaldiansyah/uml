import { ucRx } from '../hand-svg.mjs';

// Data use case diagram D-01: 3 aktor, 19 use case, include/extend, generalisasi.
// Semua label memakai bahasa bisnis (tanpa nama berkas/kelas).

export const usecase = {
    width: 1600,
    height: 900,
    // batas sistem digeser ke kanan agar ada ruang bagi garis asosiasi actorâ†’use case
    system: { x: 430, y: 24, w: 960, h: 850, title: 'Sistem pendukung keputusan servis & sparepart — AKC Workshop' },
    actors: [
        { id: 'p', label: 'Pengunjung', x: 180, y: 210 },
        { id: 'g', label: 'Guest', x: 180, y: 500 },
        { id: 'a', label: 'Admin', x: 1470, y: 500 },
    ],
    uses: [
        // kolom tengah: akses publik & pelanggan
        { id: 'uc01', label: 'Registrasi akun', x: 700, y: 90 },
        { id: 'uc02', label: 'Login', x: 700, y: 170 },
        { id: 'uc05', label: 'Mulai konsultasi', x: 700, y: 250 },
        { id: 'uc06', label: 'Jawab pertanyaan', x: 700, y: 330 },
        { id: 'uc07', label: 'Ubah jawaban', x: 520, y: 410 },
        { id: 'uc08', label: 'Batalkan konsultasi', x: 700, y: 410 },
        { id: 'uc09', label: 'Lihat hasil diagnosa', x: 700, y: 490 },
        { id: 'uc10', label: 'Unduh work order', x: 520, y: 570 },
        { id: 'uc03', label: 'Logout', x: 700, y: 650 },
        { id: 'uc04', label: 'Kelola profil', x: 520, y: 730 },
        { id: 'uc11', label: 'Riwayat konsultasi saya', x: 760, y: 730 },
        // kolom kanan: menu admin
        { id: 'uc12', label: 'Dashboard', x: 1180, y: 90, admin: true },
        { id: 'uc13', label: 'Kelola gejala', x: 1180, y: 170, admin: true },
        { id: 'uc14', label: 'Kelola kerusakan & servis', x: 1180, y: 250, admin: true },
        { id: 'uc15', label: 'Kelola sparepart', x: 1180, y: 330, admin: true },
        { id: 'uc16', label: 'Kelola aturan penalaran', x: 1180, y: 410, admin: true },
        { id: 'uc17', label: 'Kelola pengguna', x: 1180, y: 490, admin: true },
        { id: 'uc18', label: 'Riwayat semua konsultasi', x: 1180, y: 570, admin: true },
        { id: 'uc19', label: 'Cetak laporan', x: 1180, y: 650, admin: true },
    ],
};

/** Susun koneksi dari daftar use case di atas. */
export function usecaseLinks(d) {
    const by = {};
    d.uses.forEach((u) => { by[u.id] = u; });
    const rx = (u) => ucRx(u.label);

    /* Rute asosiasi. Actor dihubungkan ke batas sistem menurut tata bahasa UML:
       satu titik keluar (kaki tokoh) → kipas pendek → batang tegak di antara aktor
       dan sistem → garis mendatar tepat di baris elips tujuan. Karena hantaran
       mendatar selalu berada di baris elips, tidak ada garis yang memotong elips
       lain; karena batang berada di luar batas sistem, garis hanya sekali
       menembus batas. Nama aktor ditaruh di atas kepala, jadi kaki tetap bersih. */
    const links = [];

    const fan = (actorId, ids, trunkX, dir) => {
        const a = d.actors.find((x) => x.id === actorId);
        const fy = a.y + 62;                     // ujung kaki
        const ys = ids.map((id) => by[id].y);
        const top = Math.min(...ys);
        const bot = Math.max(...ys);
        // satu garis kaki → batang, lalu batang tegak menutup semua baris tujuan
        links.push({ id: '__tie', d: `M${a.x} ${fy}L${a.x} ${top}L${trunkX} ${top}L${trunkX} ${bot}` });
        ids.forEach((id) => {
            const u = by[id];
            const ux = u.x - dir * rx(u);
            links.push({ id, d: `M${trunkX} ${u.y}L${ux} ${u.y}` });
        });
    };

    fan('g', ['uc01', 'uc02', 'uc03', 'uc04', 'uc05', 'uc06', 'uc07', 'uc08', 'uc09', 'uc10', 'uc11'], 360, 1);
    fan('a', ['uc12', 'uc13', 'uc14', 'uc15', 'uc16', 'uc17', 'uc18', 'uc19'], 1470, -1);

    // include/extend: dari tepi elips anak ke tepi elips induk
    const depBetween = (fromId, toId, stereo, side = 1) => {
        const f = by[fromId], t = by[toId];
        const rf = rx(f), rt = rx(t);
        if (Math.abs(f.y - t.y) < 1) {
            const right = t.x > f.x;
            return {
                d: `M${right ? f.x + rf : f.x - rf} ${f.y}L${right ? t.x - rt - 2 : t.x + rt + 2} ${t.y}`,
                lx: (f.x + t.x) / 2, ly: f.y - 8, stereo,
            };
        }
        const down = t.y > f.y;
        return {
            d: `M${f.x} ${down ? f.y + 27 : f.y - 27}L${t.x} ${down ? t.y - 29 : t.y + 29}`,
            lx: f.x + 8 * side, ly: (f.y + t.y) / 2, stereo,
        };
    };

    const deps = [
        depBetween('uc07', 'uc06', '«extend»', -1),
        depBetween('uc08', 'uc06', '«extend»', 1),
        depBetween('uc10', 'uc09', '«extend»', 1),
        depBetween('uc05', 'uc06', '«include»'),
    ];

    // generalisasi Admin ▷ Guest: lajur khusus di bawah seluruh gambar, di luar
    // batas sistem, supaya garisnya tidak memotong elips atau label mana pun
    const g = d.actors[1], ad = d.actors[2];
    const yGen = d.height - 46;
    const genX = g.x + 62;
    const gen = [{ d: `M${ad.x} ${ad.y + 76}L${ad.x} ${yGen}L${genX} ${yGen}L${genX} ${g.y + 88}L${g.x - 6} ${g.y + 88}` }];
    const label = 'Admin mewarisi semua wewenang Guest';
    const genLabel = {
        x: Math.round((genX + ad.x) / 2),
        y: yGen - 9,
        w: Math.round(label.length * 11.5 * 0.47) + 20,
        text: label,
    };

    return { links, deps, gen, genLabel };
}

