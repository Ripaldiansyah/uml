// Uji cepat: pakai potongan <defs> hasil ekspor untuk melihat penanda mana yang gagal.
import { readFileSync, writeFileSync } from 'node:fs';

const src = readFileSync('tools/_unduh/d-01-use-case-diagram.svg', 'utf8');
const markers = src.match(/<marker[\s\S]*?<\/marker>/g);
const mk = (inner) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 140">${inner}
<path d="M150 30L300 30" stroke="red" stroke-width="2" marker-end="url(#t)"/>
<path d="M20 100L40 100L40 60L70 60" fill="none" stroke="blue" stroke-width="2" marker-end="url(#t)"/>
</svg>`;

const base = markers[1].replace('id="ucgen"', 'id="t"');
const strip = (re) => base.replace(re, '');
const variants = {
    xa: base,
    xb: strip(/\sfill-rule="[^"]*"/),
    xc: strip(/\sfill-opacity="[^"]*"/),
    xd: strip(/\sstroke-opacity="[^"]*"/),
    xe: strip(/\sfill="[^"]*"/),
    xf: strip(/\sfont-family="[^"]*"/),
    xg: strip(/\sdominant-baseline="[^"]*"/),
    xh: strip(/\s(text-anchor|visibility)="[^"]*"/g),
    // isolasi: yang mana yang membengkakkan penanda?
    xj: strip(/\sfont-size="[^"]*"/),
    xk: strip(/\sfill-opacity="[^"]*"/).replace(/\sfill-rule="[^"]*"/, ''),
    xl: base.replace(/\sfill="[^"]*"/, '').replace(/\sfill-opacity="[^"]*"/, ''),
    xm: base.replace(/ (fill|stroke|opacity|stroke-width|stroke-opacity)="[^"]*"/g, ''),
    xn: base.replace(/ (font-family|font-size|font-weight|text-anchor|dominant-baseline|visibility)="[^"]*"/g, ''),
    xo: base.replace(/ (fill|stroke)="[^"]*"/g, ''),
};
for (const [k, v] of Object.entries(variants)) writeFileSync(`_tmp/${k}.svg`, mk(`<defs>${v}</defs>`));
console.log('ok');
