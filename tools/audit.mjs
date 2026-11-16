// Sidik jari cepat isi UML: kisi latar, catatan dalam diagram, label teknis, sisa Mermaid.
// Pakai: node tools/audit.mjs
import { readdirSync, readFileSync } from 'node:fs';

const files = readdirSync('.').filter((f) => f.endsWith('.html') && !f.includes('backup'));
const checks = {
    'kisi latar (gradient)': /repeating-linear-gradient|linear-gradient\(.*grid/i,
    'catatan di diagram': /<text[^>]*>Catatan<|note over|Note over/i,
    'sisa Mermaid': /<pre class="mermaid">|mermaid\.min\.js/,
    'label teknis di diagram': /<text[^>]*>[^<]*(::|\w+\.php|SELECT |INSERT )/i,
};

for (const f of files) {
    const html = readFileSync(f, 'utf8');
    const hits = Object.entries(checks)
        .filter(([, re]) => re.test(html))
        .map(([name]) => name);
    console.log(`${hits.length ? 'CEK ' : 'OK  '} ${f.padEnd(26)} ${hits.join(', ') || 'bersih'}`);
}

const css = readFileSync('assets/uml.css', 'utf8');
console.log(`${/repeating-linear-gradient|grid-background/i.test(css) ? 'CEK ' : 'OK  '} assets/uml.css            kisi latar`);