// sementara: bandingkan posisi guard lintasan 0 vs 1
import { readFileSync } from 'node:fs';
const src = readFileSync(new URL('../hand-svg.mjs', import.meta.url), 'utf8')
    .replace('if (lowest === -Infinity) return y - (top + 20);',
        'if (lowest === -Infinity) return y - (top + 20); console.log("  hit", x0, x1b, "top", top, "lowest", lowest, "guards", JSON.stringify(guards));')
const mod = await import('data:text/javascript,' + encodeURIComponent(src));
const seq = await import('../diagrams/sequence.mjs');
const s = seq.sequences.find((d) => d.id === 'S-05');
mod.sequenceSvg(s, 'x', 'y');
