// Cek aset: setiap src/href lokal harus ada di disk; halaman berisi diagram wajib
// memuat plantuml.js (penampil diagram) atau svg inline, serta uml.css dan uml.js.
import { readFileSync, readdirSync, existsSync } from 'node:fs';

let problems = 0;
for (const file of readdirSync('.').filter((f) => f.endsWith('.html'))) {
    const html = readFileSync(file, 'utf8');
    const local = [...html.matchAll(/(?:src|href)="((?!https?:|data:|#)[^"]+)"/g)].map((m) => m[1]);
    const missing = local.filter((p) => !existsSync(p));
    const hasPuml = /<pre class="puml">/.test(html);
    const hasInlineSvg = /<figure class="(?:drawing|dgm)">\s*<svg/.test(html) || /<svg viewBox="0 0 1[0-9]{3}/.test(html);
    const loadsPuml = /src="assets\/plantuml\.js"/.test(html);
    const loadsJs = /src="assets\/uml\.js"/.test(html);
    const loadsCss = /href="assets\/uml\.css"/.test(html);

    const issues = [];
    if (missing.length) issues.push(`aset hilang: ${missing.join(', ')}`);
    if (hasPuml && !loadsPuml) issues.push('diagram PlantUML tanpa plantuml.js');
    if (!loadsJs) issues.push('uml.js tidak dimuat');
    if (!loadsCss) issues.push('uml.css tidak dimuat');

    problems += issues.length;
    const kind = hasPuml ? 'plantuml' : hasInlineSvg ? 'svg' : '-';
    console.log(`${issues.length ? 'FAIL' : 'OK  '} ${file.padEnd(24)} diagram=${kind} asetLokal=${local.length}`);
    issues.forEach((i) => console.log(`     - ${i}`));
}

console.log(problems ? `\n${problems} masalah aset.` : '\nSemua aset lokal tersedia.');
process.exit(problems ? 1 : 0);
