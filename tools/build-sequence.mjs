// Bangun ulang halaman sequence: ganti tiap <figure class="drawing" data-puml>
// berisi sumber PlantUML dengan SVG tulisan sendiri, lalu buang <script plantuml.js>.
// Idempoten: hasil build sebelumnya (figure.dgm data-name="S-0x …") juga diganti.
// Pemecahan memakai penanda </figure> (bukan regex malas) agar aman terhadap
// perbedaan akhir baris CRLF/LF.
// Pakai: node tools/build-sequence.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { sequences } from './diagrams/sequence.mjs';
import { sequenceSvg } from './hand-svg.mjs';

const FILE = 'sequence-diagram.html';
let html = readFileSync(FILE, 'utf8');

// pecah dokumen menjadi potongan yang berakhir di tiap </figure>
const parts = html.split('</figure>');
// penanda sumber PlantUML tiap skenario: baris aktor + peserta pertama
const KEY = {
    'S-01': ['Pengunjung', 'Halaman masuk'],
    'S-02': ['Pengunjung', 'Halaman daftar'],
    'S-03': ['Pengunjung', 'Formulir konsultasi'],
    'S-04': ['Pengunjung', 'Halaman pertanyaan'],
    'S-05': ['Pengguna', 'Halaman hasil'],
    'S-06': ['Pengguna', 'Halaman unduhan'],
    'S-07': ['Admin', 'Menu laporan'],
};
let done = 0;

for (const s of sequences) {
    const name = `${s.id} sequence diagram`;
    const svg = sequenceSvg(
        { width: s.width, participants: s.participants, events: s.events, uid: s.id.replace(/\W/g, '') },
        `Sequence diagram ${s.id} — ${s.title}`,
        s.caption,
    );
    const figure = `<figure class="dgm" data-name="${name}">\n${svg}\n            `;
    const [who, first] = KEY[s.id];

    const i = parts.findIndex((p) => {
        const at = p.lastIndexOf('<figure');
        if (at < 0) return false;
        const body = p.slice(at).replace(/\r\n/g, '\n');
        // sudah pernah dibangun: cocokkan nama diagramnya
        if (body.startsWith(`<figure class="dgm" data-name="${name}"`)) return true;
        // masih PlantUML: cocokkan pasangan aktor + peserta pertama
        if (!body.startsWith('<figure class="drawing" data-puml>')) return false;
        return body.includes(`actor "${who}" as U`) && body.includes(`participant "${first}" as`);
    });

    if (i < 0) {
        console.error(`figure ${s.id} tidak ditemukan di ${FILE}`);
        process.exit(1);
    }
    const at = parts[i].lastIndexOf('<figure');
    parts[i] = parts[i].slice(0, at) + figure;
    done++;
}

html = parts.join('</figure>');

// halaman ini tidak lagi memuat penampil PlantUML
html = html.replace(/\s*<script src="assets\/plantuml\.js"><\/script>/, '');

writeFileSync(FILE, html);
console.log(`OK   ${FILE}  (${done} SVG sequence)`);

