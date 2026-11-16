// Pemeriksaan struktur halaman UML: tautan daftar isi harus menunjuk ke id yang ada,
// jumlah section/titleblock seimbang, dan tidak ada placeholder tersisa.
// Jalankan: node UML/check-structure.mjs
import { readFileSync, readdirSync } from 'node:fs';

const files = readdirSync('.').filter((f) => f.endsWith('.html'));
let problems = 0;

for (const file of files) {
    const html = readFileSync(file, 'utf8');
    const ids = [...html.matchAll(/<section[^>]*id="([^"]+)"/g)].map((m) => m[1]);
    const toc = [...html.matchAll(/<a href="#([^"]+)"/g)].map((m) => m[1]);
    const titleblocks = [...html.matchAll(/<span>Lembar<\/span><b>([A-Z]{1,2}-?\d\d)<\/b>/g)].map((m) => m[1]);
    const placeholders = [...html.matchAll(/<!--(BODY|SKENARIO|NOTES|VALUE|TABLE|RIGHT|UC)-->|<!--SKENARIO-->/g)].map((m) => m[0]);
    const openDiv = (html.match(/<div\b/g) || []).length;
    const closeDiv = (html.match(/<\/div>/g) || []).length;
    const sectionOpen = (html.match(/<section\b/g) || []).length;
    const sectionClose = (html.match(/<\/section>/g) || []).length;
    const broken = toc.filter((t) => !ids.includes(t));

    const issues = [];
    if (broken.length) issues.push(`toc tanpa target: ${broken.join(', ')}`);
    if (ids.length !== titleblocks.length) issues.push(`section ${ids.length} vs titleblock ${titleblocks.length}`);
    if (placeholders.length) issues.push(`placeholder tersisa: ${placeholders.join(', ')}`);
    if (openDiv !== closeDiv) issues.push(`div ${openDiv}/${closeDiv}`);
    if (sectionOpen !== sectionClose) issues.push(`section ${sectionOpen}/${sectionClose}`);
    if (!/<\/html>\s*$/.test(html)) issues.push('tidak diakhiri </html>');

    problems += issues.length;
    console.log(`${issues.length ? 'FAIL' : 'OK  '} ${file.padEnd(24)} section=${ids.length} toc=${toc.length} titleblock=${titleblocks.length}`);
    issues.forEach((i) => console.log(`     - ${i}`));
}

console.log(problems ? `\n${problems} masalah ditemukan.` : '\nStruktur semua halaman baik.');
process.exit(problems ? 1 : 0);
