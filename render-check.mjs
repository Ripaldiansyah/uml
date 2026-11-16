// Periksa gambar SVG: struktur, teks keluar kanvas, tumbukan label-garis, simpan pratinjau.
// Jalankan: node render-check.mjs [--shot]
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { JSDOM } from 'jsdom';

const shot = process.argv.includes('--shot');

const RATIO = { t: 0.56, h: 0.55, lb: 0.52, sm: 0.5, mono: 0.6, def: 0.52 };
const SIZE = { t: 20, h: 15, lb: 12.5, sm: 11.5, mono: 11, def: 13 };

let problems = 0;
const files = readdirSync('.').filter((f) => f.endsWith('.html') && !f.includes('.backup.'));

/** Pecah "d" menjadi segmen lurus; kurva kuadratik diambil titik kendalinya. */
function segments(d) {
    const tokens = d.match(/[MLQHVZmlqhvz]|-?\d*\.?\d+/g) || [];
    const segs = [];
    let cx = 0, cy = 0, cmd = 'M', i = 0;
    const num = () => Number(tokens[i++]);
    while (i < tokens.length) {
        if (/[A-Za-z]/.test(tokens[i])) { cmd = tokens[i++]; if (cmd === 'Z' || cmd === 'z') continue; }
        const c = cmd.toUpperCase();
        if (c === 'M' || c === 'L') {
            const x = num(), y = num();
            segs.push([cx, cy, x, y]);
            cx = x; cy = y;
        } else if (c === 'H') { const x = num(); segs.push([cx, cy, x, cy]); cx = x; }
        else if (c === 'V') { const y = num(); segs.push([cx, cy, cx, y]); cy = y; }
        else if (c === 'Q') {
            const qx = num(), qy = num(), x = num(), y = num();
            segs.push([cx, cy, qx, qy], [qx, qy, x, y]);
            cx = x; cy = y;
        } else { num(); num(); }
    }
    return segs;
}

function hitsBox([x1, y1, x2, y2], box) {
    const minX = Math.min(x1, x2), maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2), maxY = Math.max(y1, y2);
    return !(maxX < box.x || minX > box.x + box.w || maxY < box.y || minY > box.y + box.h);
}

for (const file of files) {
    const html = readFileSync(file, 'utf8');
    const figs = [...html.matchAll(/<figure class="dgm"[\s\S]*?<\/figure>/g)].map((m) => m[0]);
    if (!figs.length) continue;

    figs.forEach((fig, idx) => {
        const name = (fig.match(/data-name="([^"]+)"/) || [])[1] || `${file}#${idx + 1}`;
        const vb = (fig.match(/viewBox="([^"]+)"/) || [])[1];
        if (!vb) { console.log(`FAIL ${name}: tanpa viewBox`); problems++; return; }
        const [vx, vy, vw, vh] = vb.split(/\s+/).map(Number);
        const svgMatch = fig.match(/<svg[\s\S]*<\/svg>/);
        if (!svgMatch) { console.log(`FAIL ${name}: tanpa <svg>`); problems++; return; }
        const svg = svgMatch[0];

        try {
            new JSDOM(svg, { contentType: 'image/svg+xml' });
        } catch (e) {
            const line = String(e.message).match(/:(\d+):(\d+):/);
            const around = line ? (svg.split(/\r?\n/)[Number(line[1]) - 1] || '') : '';
            console.log(`FAIL ${name}: SVG tidak valid - ${e.message}`);
            if (around) console.log(`     ${around.trim().slice(0, 120)}`);
            problems++;
        }

        // kotak: rect bersudut tajam (bukan band/latar)
        const boxes = [...svg.matchAll(/<rect x="([\d.-]+)" y="([\d.-]+)" width="([\d.-]+)" height="([\d.-]+)" class="s[^"]*"\/>/g)]
            .map((m) => ({ x: +m[1], y: +m[2], w: +m[3], h: +m[4] }));
        const texts = [...svg.matchAll(/<text([^>]*)>([\s\S]*?)<\/text>/g)].map(([, attrs, body]) => {
            const x = Number((attrs.match(/\bx="(-?[\d.]+)"/) || [])[1] ?? 0);
            const y = Number((attrs.match(/\by="(-?[\d.]+)"/) || [])[1] ?? 0);
            const cls = (attrs.match(/class="([^"]*)"/) || [, ''])[1].split(/\s+/).filter(Boolean);
            const plain = body.replace(/<[^>]+>/g, '').replace(/&[a-z#0-9]+;/g, 'x');
            let size = SIZE.def, ratio = RATIO.def;
            if (cls.includes('t')) [size, ratio] = [SIZE.t, RATIO.t];
            else if (cls.includes('h')) [size, ratio] = [SIZE.h, RATIO.h];
            else if (cls.includes('mono')) [size, ratio] = [SIZE.mono, RATIO.mono];
            else if (cls.includes('sm')) [size, ratio] = [SIZE.sm, RATIO.sm];
            else if (cls.includes('lb')) [size, ratio] = [SIZE.lb, RATIO.lb];
            const w = plain.length * size * ratio;
            const anchor = cls.includes('mid') ? 'mid' : cls.includes('end') ? 'end' : 'start';
            const left = anchor === 'mid' ? x - w / 2 : anchor === 'end' ? x - w : x;
            return { x, y, w, cls, plain, anchor, box: { x: left, y: y - size * 0.8, w, h: size * 1.05 } };
        });

        const insideOwn = (t) => boxes.some((b) => t.box.x >= b.x - 1 && t.box.x + t.box.w <= b.x + b.w + 1 && t.y >= b.y && t.y <= b.y + b.h);
        const out = texts.filter((t) => t.box.x < vx - 2 || t.box.x + t.box.w > vx + vw + 2 || t.box.y < vy - 2);
        const through = texts.filter((t) => !t.cls.includes('h') && !t.cls.includes('t') && !insideOwn(t)
            && boxes.some((b) => hitsBox([t.box.x, t.box.y, t.box.x + t.box.w, t.box.y + t.box.h], b)));
        const segs = [...svg.matchAll(/<path d="([^"]+)" class="(?:s|dash)[^"]*"/g)].flatMap((m) => segments(m[1]));
        const crossed = texts.filter((t) => {
            if (t.cls.includes('h') || t.cls.includes('t') || insideOwn(t)) return false;
            // label multiplisitas (mis. "0..*") boleh menempel garis; beri kelonggaran
            const num = /^[0-9.*]+$/.test(t.plain);
            const pad = num ? 2.5 : 0;
            const cx = t.box.x + t.box.w / 2, cy = t.box.y + t.box.h / 2;
            return segs.some(([x1, y1, x2, y2]) => {
                if (Math.abs(x1 - x2) < 0.5) return Math.abs(cx - x1) < t.w / 2 + pad && cy > Math.min(y1, y2) && cy < Math.max(y1, y2);
                if (Math.abs(y1 - y2) < 0.5) return Math.abs(cy - y1) < t.box.h / 2 + pad && cx > Math.min(x1, x2) && cx < Math.max(x1, x2);
                return false;
            });
        });

        if (out.length) {
            console.log(`WARN ${name}: ${out.length} teks keluar kanvas`);
            out.slice(0, 5).forEach((t) => console.log(`     "${t.plain.slice(0, 40)}" x=${t.x}`));
            problems++;
        }
        if (through.length) {
            console.log(`WARN ${name}: ${through.length} label menembus kotak`);
            through.slice(0, 8).forEach((t) => console.log(`     "${t.plain.slice(0, 40)}" x=${t.x} y=${t.y}`));
            problems++;
        }
        if (crossed.length) {
            console.log(`WARN ${name}: ${crossed.length} label tertabrak garis`);
            crossed.slice(0, 8).forEach((t) => console.log(`     "${t.plain.slice(0, 40)}" x=${t.x} y=${t.y}`));
            problems++;
        }

        if (shot) {
            mkdirSync('_preview', { recursive: true });
            const styled = svg
                .replace('<svg', `<svg xmlns="http://www.w3.org/2000/svg" width="${vw}" height="${vh}"`)
                .replace('</defs>', `<style>
svg text{font-family:"Barlow","Segoe UI",sans-serif;fill:#0f0e17;font-size:13px}
svg .t{font-family:"Barlow Condensed",sans-serif;font-size:20px;font-weight:600}
svg .h{font-family:"Barlow Condensed",sans-serif;font-size:15px;font-weight:600}
svg .sm{font-size:11.5px;fill:#5c5d6e}
svg .b{font-weight:600}svg .mid{text-anchor:middle}svg .end{text-anchor:end}
svg .s{stroke:#0f0e17;stroke-width:1.2;fill:none}svg .dash{stroke:#0f0e17;stroke-width:1.2;fill:none;stroke-dasharray:6 4}
svg .fill-paper{fill:#fffffe}svg .fill-ink{fill:#0f0e17}svg .band{fill:#fff1e0}
</style></defs>`);
            writeFileSync(`_preview/${name.replace(/[^\w]+/g, '-').toLowerCase()}.svg`, styled, 'utf8');
        }
        console.log(`OK   ${name}  viewBox=${vw}x${vh}  teks=${texts.length}  kotak=${boxes.length}`);
    });
}
console.log(problems ? `\n${problems} temuan perlu diperiksa.` : '\nSemua gambar rapi.');

