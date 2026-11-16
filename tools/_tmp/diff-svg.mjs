import { readFileSync } from 'node:fs';

// Bandingkan jumlah & urutan elemen antara SVG di halaman dan SVG hasil unduhan.
const html = readFileSync('sequence-diagram.html', 'utf8');
const start = html.indexOf('data-name="S-05 sequence diagram">');
const pageSeg = html.slice(start, html.indexOf('</svg>', start));
const expSeg = readFileSync('tools/_unduh/s-05-sequence-diagram.svg', 'utf8');

const tags = (seg) => [...seg.matchAll(/<([a-z]+)\b([^>]*)>/g)].map((m) => ({
    tag: m[1],
    key: (m[2].match(/class="([^"]*)"/) || [, ''])[1],
    xy: (m[2].match(/(?:^|\s)x="([\d.]+)"/) || [, ''])[1] + ',' + (m[2].match(/(?:^|\s)y="([\d.]+)"/) || [, ''])[1],
}));
const a = tags(pageSeg), b = tags(expSeg);
const count = (list) => list.reduce((acc, e) => ((acc[e.tag] = (acc[e.tag] || 0) + 1), acc), {});
console.log('halaman  :', count(a));
console.log('unduhan  :', count(b));
console.log('--- elemen halaman yang hilang di unduhan (berdasarkan tag+kelas+x,y)');
const seen = new Map();
for (const e of b) seen.set(`${e.tag}|${e.key}|${e.xy}`, (seen.get(`${e.tag}|${e.key}|${e.xy}`) || 0) + 1);
for (const e of a) {
    const k = `${e.tag}|${e.key}|${e.xy}`;
    if (seen.get(k)) seen.set(k, seen.get(k) - 1);
    else console.log('  ', k);
}
