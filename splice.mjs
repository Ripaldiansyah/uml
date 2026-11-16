// Ganti blok baris (1-based, inklusif) pada file HTML dengan isi satu atau beberapa file.
// Pakai: node splice.mjs <target.html> <startLine> <endLine> <isi1.txt> [isi2.txt ...]
import { readFileSync, writeFileSync } from 'node:fs';

const [target, startRaw, endRaw, ...bodyFiles] = process.argv.slice(2);
const start = Number(startRaw);
const end = Number(endRaw);
if (!bodyFiles.length) { console.error('Tidak ada file isi yang diberikan.'); process.exit(1); }
const lines = readFileSync(target, 'utf8').split(/\r?\n/);
const body = bodyFiles.flatMap((f) => readFileSync(f, 'utf8').replace(/^\uFEFF/, '').replace(/\r?\n$/, '').split(/\r?\n/));
const before = lines.slice(0, start - 1);
const after = lines.slice(end);
console.log(`target=${target} total=${lines.length} hapus=${end - start + 1} sisip=${body.length} (${bodyFiles.length} file)`);
writeFileSync(target, [...before, ...body, ...after].join('\n'), 'utf8');
console.log('OK');

