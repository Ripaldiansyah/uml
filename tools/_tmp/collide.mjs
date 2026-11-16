// sementara: deteksi benturan label pesan terhadap baris judul/guard fragmen.
// Dipakai lintas diagram; hasil kosong = tidak ada benturan.
import { sequenceSvg } from '../hand-svg.mjs';
import { sequences } from '../diagrams/sequence.mjs';

const num = (s) => parseFloat(s);
let total = 0, sepTotal = 0;
for (const s of sequences) {
    const svg = sequenceSvg(s, 'x', 'y');
    // pemisah `else`: garis frag-sep + label guard tepat di bawahnya (bukan benturan)
    const sepRows = [];
    for (const m of svg.matchAll(/<line x1="[\d.]+" y1="([\d.]+)" x2="[\d.]+" y2="[\d.]+" class="frag-sep"\/>/g)) {
        sepRows.push([num(m[1]), num(m[1]) + 26]);
    }
    const guards = [];
    for (const m of svg.matchAll(/<rect x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)" class="fill-paper"\/>\n<text x="([\d.]+)" y="([\d.]+)" class="sm b"/g)) {
        const x = num(m[1]), y = num(m[2]), w = num(m[3]), h = num(m[4]);
        guards.push([x, x + w, y, y + h]);
    }
    for (const m of svg.matchAll(/<path d="M([\d.]+) ([\d.]+)h([\d.]+)/g)) {
        guards.push([num(m[1]), num(m[1]) + num(m[3]), num(m[2]), num(m[2]) + 19]);
    }
    for (const m of svg.matchAll(/<rect x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)" class="fill-paper"\/>\n<text x="([\d.]+)" y="([\d.]+)" class="lb[^"]*">([^<]*)/g)) {
        const x = num(m[1]), y = num(m[2]), w = num(m[3]), h = num(m[4]), text = m[7];
        const isSep = sepRows.some(([a]) => Math.abs(y - a) < 30);
        const hit = guards.find(([x1, x2, y1, y2]) => x + w > x1 + 2 && x < x2 - 2 && y + h > y1 + 2 && y < y2 - 2);
        if (hit && isSep) {
            sepTotal++;
            console.log(`${s.id}  (baris guard pemisah, wajar) "${text.slice(0, 30)}"`);
        } else if (hit) {
            total++;
            console.log(`${s.id}  "${text.slice(0, 34)}"  label=[${x},${y},${x + w},${y + h}]  guard=[${hit.join(',')}]`);
        }
    }
}
console.log(total ? `${total} benturan` : 'tidak ada benturan label pesan vs baris guard');
console.log(`${sepTotal} label berdiri di baris guard pemisah else (bukan benturan)`);
