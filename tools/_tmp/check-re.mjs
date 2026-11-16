import { readFileSync } from 'node:fs';
const h = readFileSync('sequence-diagram.html', 'utf8');
const first = {
    '01': 'actor "Pengunjung" as U\nparticipant "Halaman masuk" as L',
    '02': 'actor "Pengunjung" as U\nparticipant "Halaman daftar" as R',
    '03': 'actor "Pengunjung" as U\nparticipant "Formulir konsultasi" as C',
    '04': 'actor "Pengunjung" as U\nparticipant "Halaman pertanyaan" as T',
    '05': 'actor "Pengguna" as U\nparticipant "Halaman hasil" as H',
    '06': 'actor "Pengguna" as U\nparticipant "Halaman unduhan" as P',
    '07': 'actor "Admin" as U\nparticipant "Menu laporan" as L',
};
for (const id of Object.keys(first)) {
    const re = new RegExp('<figure class="drawing" data-puml>[\\s\\S]*?' + first[id].replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[\\s\\S]*?<\\/figure>');
    const m = h.match(re);
    console.log('S-' + id, m ? 'MATCH ' + m[0].length : 'NO MATCH');
}



