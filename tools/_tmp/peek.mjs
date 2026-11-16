import { readFileSync } from 'node:fs';

const svg = readFileSync('tools/_unduh/s-05-sequence-diagram.svg', 'utf8');
console.log('--- frames');
for (const m of svg.matchAll(/<rect x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)" class="frag-box"/g)) {
    console.log(`frame x ${m[1]} y ${m[2]} w ${m[3]} h ${m[4]}`);
}
console.log('--- tabs');
for (const m of svg.matchAll(/<path d="M([\d.]+) ([\d.]+)h([\d.]+)l-?(\d*) ?19h-([\d.]+)z" class="frag-tab"/g)) {
    console.log(`tab ${m[1]},${m[2]} w ${m[3]} slant ${m[4] || 0}`);
}
console.log('--- backing rects (h<20)');
for (const m of svg.matchAll(/<rect x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="(\d+)" class="fill-paper"/g)) {
    if (Number(m[4]) < 20) console.log(`backing x ${m[1]} y ${m[2]} w ${m[3]} h ${m[4]}`);
}
