import { readFileSync } from 'node:fs';

// Cetak elemen SVG S-05 berurutan, mulai dari indeks kemunculan tertentu.
const html = readFileSync('sequence-diagram.html', 'utf8');
const start = html.indexOf('data-name="S-05 sequence diagram">');
const seg = html.slice(start, html.indexOf('</svg>', start));
const from = Number(process.argv[2] || 0);   // lewati N elemen
const take = Number(process.argv[3] || 24);  // cetak N elemen

const els = [...seg.matchAll(/<(?!\/)[a-z]+\b[^>]*>/g)].map((m) => m[0]);
const at = els.findIndex((t) => t.includes('frag-tab') && t.includes('681'));
console.log('tab pada indeks', at, 'dari', els.length);
els.forEach((tag, i) => {
    if (i < from || i >= from + take) return;
    const m = /class="([^"]*)"/.exec(tag);
    console.log(String(i).padStart(3), (m ? m[1] : '').padEnd(14), tag.replace(/\s+/g, ' ').slice(0, 150));
});
