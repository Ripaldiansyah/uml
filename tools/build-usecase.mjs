// Bangun ulang halaman use case: ganti <figure class="drawing" data-puml> berisi
// sumber PlantUML dengan SVG tulisan sendiri, dan buang <script plantuml.js>.
// Pakai: node tools/build-usecase.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { usecase, usecaseLinks } from './diagrams/usecase.mjs';
import { usecaseSvg } from './hand-svg.mjs';

const FILE = 'usecase-diagram.html';
let html = readFileSync(FILE, 'utf8');

const svg = usecaseSvg(
    {
        width: usecase.width,
        height: usecase.height,
        actors: usecase.actors,
        uses: usecase.uses,
        system: usecase.system,
        ...usecaseLinks(usecase),
    },
    'Use case diagram sistem AKC Workshop',
    'Tiga aktor (Pengunjung, Guest, Admin), sembilan belas use case di dalam batas sistem, hubungan include dan extend, serta generalisasi Admin terhadap Guest.',
);

const figure = `<figure class="dgm" data-name="D-01 use case diagram">
${svg}
            </figure>`;

// ganti figure diagram lama (PlantUML) atau hasil build sebelumnya — idempoten
const re = /<figure class="drawing" data-puml[\s\S]*?<\/figure>|<figure class="dgm" data-name="D-01 use case diagram">[\s\S]*?<\/figure>/;
if (!re.test(html)) {
    console.error('figure diagram tidak ditemukan di ' + FILE);
    process.exit(1);
}
html = html.replace(re, figure);

// halaman ini tidak lagi memuat penampil PlantUML
html = html.replace(/\s*<script src="assets\/plantuml\.js"><\/script>/, '');

// gaya lokal lama (kelas .uc) tidak dipakai lagi
html = html.replace(/<style>\s*\.uc[\s\S]*?<\/style>\s*/, '');

writeFileSync(FILE, html);
console.log('OK   ' + FILE + '  (SVG use case ' + usecase.width + 'x' + usecase.height + ')');
