import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { allActivities } from './lib/all-activities.mjs';
import { allSequences } from './lib/sequences.mjs';
import { classDiagram } from './lib/classes.mjs';
import { usecaseDiagram } from './lib/usecase.mjs';
import { sceneSvg } from './lib/render.mjs';
import { drawioFile } from './lib/drawio.mjs';
import { buildPages } from './lib/pages.mjs';
import { indexPage } from './lib/index-page.mjs';
import { codeFor } from './lib/html.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
mkdirSync(`${root}assets/diagrams`, { recursive: true });
mkdirSync(`${root}drawio`, { recursive: true });
const scenes = [...allActivities(), ...allSequences(), ...usecaseDiagram(), ...classDiagram()];
if (scenes.length !== 16) throw new Error(`Seharusnya ada 16 gambar; ditemukan ${scenes.length}.`);
for (const s of scenes) {
    if (!Number.isFinite(s.width) || !Number.isFinite(s.height)) throw new Error(`${s.id}: ukuran gambar belum lengkap.`);
    if (new Set(s.shapes.map((n) => n.id)).size !== s.shapes.length) throw new Error(`${s.id}: ada pengenal bentuk yang sama.`);
    for (const n of s.shapes) {
        if (n.x < 0 || n.y < 0 || n.x + n.w > s.width || n.y + n.h > s.height) throw new Error(`${s.id}: bentuk ${n.id} keluar dari gambar.`);
    }
    const id = codeFor(s);
    writeFileSync(`${root}assets/diagrams/${id}.svg`, `${sceneSvg(s)}\n`);
    writeFileSync(`${root}drawio/${id}.drawio`, `${drawioFile(s)}\n`);
    console.log(`OK ${id.padEnd(4)} ${s.width}x${s.height} — ${s.shapes.length} bentuk, ${s.edges.length} garis`);
}
writeFileSync(`${root}drawio/semua-diagram.drawio`, `${drawioFile(scenes)}\n`);
const saved = new URL('./lib/sequence-data.json', import.meta.url);
if (!existsSync(saved) || process.argv.includes('--refresh-sequences')) {
    const data = scenes.filter((s) => /^s\d\d$/.test(s.id)).map((s) => ({
        id: s.id, slug: s.id, title: s.title, caption: s.description,
        participants: s.shapes.filter((n) => /^head-/.test(n.id)).map((n) => ({ id: n.id.slice(5), kind: n.kind === 'actor' ? 'actor' : n.tone === 'gray' ? 'data' : 'object', label: n.label })),
        messages: s.messages.map(({ from, to, label, condition, ret }) => ({ from, to, label, condition, ret })),
    }));
    if (data.length !== 7) throw new Error('Urutan pesan belum lengkap.');
    writeFileSync(saved, `${JSON.stringify(data, null, 2)}\n`);
    console.log('OK Data urutan klasik disimpan.');
}
const pages = { 'index.html': indexPage(), ...buildPages() };
for (const [name, html] of Object.entries(pages)) {
    writeFileSync(`${root}${name}`, `${html}\n`);
    console.log(`OK ${name}`);
}
console.log(`Selesai: ${scenes.length} gambar, ${scenes.length + 1} berkas Draw.io, ${Object.keys(pages).length} halaman.`);
