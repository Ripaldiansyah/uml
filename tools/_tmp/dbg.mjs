// sementara: pantau jumlah lintasan & posisi label semua diagram sequence
import { readFileSync } from 'node:fs';
const src = readFileSync(new URL('../hand-svg.mjs', import.meta.url), 'utf8')
    .replace('const layout = pass(guards);', 'PLACEHOLDER')
    .replace('let layout = pass(guards);', 'let layout = pass(guards); console.log("  guards0", layout.guards.length, JSON.stringify(layout.guards));')
    .replace('        layout = pass(guards);', '        layout = pass(guards); console.log("  guards~", layout.guards.length);')
    .replace('if (next.length === guards.length && next.every((g, i) => g.join() === guards[i].join())) break;',
        'if (next.length === guards.length && next.every((g, i) => g.join() === guards[i].join())) { console.log("  stabil di ronde", round); break; }');
const mod = await import('data:text/javascript,' + encodeURIComponent(src));
const seq = await import('../diagrams/sequence.mjs');
for (const s of seq.sequences) {
    console.log(s.id);
    const svg = mod.sequenceSvg(s, 'x', 'y');
    const bad = [...svg.matchAll(/<text x="([\d.]+)" y="([\d.]+)" class="lb[^"]*">([^<]{0,40})/g)]
        .map((m) => `${m[2]} ${m[1]} ${m[3]}`);
    console.log('  labels', bad.length, 'h:', svg.match(/viewBox="0 0 \d+ (\d+)"/)[1]);
}
