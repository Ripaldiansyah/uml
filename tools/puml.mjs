// Utilitas PlantUML untuk dokumen ini.
// Skema encode mengikuti PlantUML: deflate + Base64 varian PlantUML ("-_").
//
// Perintah:
//   node tools/puml.mjs encode <berkas.puml>          -> cetak URL gambar (svg/png)
//   node tools/puml.mjs check <berkas.html|berkas.puml>
//        -> render semua blok <pre class="puml"> / berkas .puml ke server PlantUML,
//           laporkan galat sintaks + ukuran gambar (memastikan tidak ada "Syntax Error").
//   node tools/puml.mjs svg <berkas.puml> <keluaran.svg>
//        -> simpan hasil render SVG (untuk pemeriksaan visual).
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { deflateRawSync } from 'node:zlib';
import { basename } from 'node:path';

const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_';
const SERVER = process.env.PLANTUML_SERVER || 'https://www.plantuml.com/plantuml';

// PlantUML: teks UTF-8 → DEFLATE → Base64 varian PlantUML (tanpa awalan).
export function encode(text) {
    const bytes = deflateRawSync(Buffer.from(text, 'utf8'), { level: 9 });
    let out = '';
    for (let i = 0; i < bytes.length; i += 3) {
        const b1 = bytes[i] << 16 | (bytes[i + 1] || 0) << 8 | (bytes[i + 2] || 0);
        out += ALPHABET[(b1 >> 18) & 63] + ALPHABET[(b1 >> 12) & 63] + ALPHABET[(b1 >> 6) & 63] + ALPHABET[b1 & 63];
    }
    return out;
}

export function url(text, format = 'svg') {
    return `${SERVER}/${format}/${encode(text)}`;
}

export async function fetchDiagram(text, format = 'svg') {
    const res = await fetch(url(text, format));
    const body = await res.text();
    // PlantUML membalas 200 dengan gambar galat bila sintaks salah, jadi periksa isinya.
    const broken = body.includes('Syntax Error') || /Cannot find|Assumed diagram type|data-diagram-type="ERROR"|An error has occured/i.test(body);
    if (!res.ok || broken || !body.includes('<svg')) {
        const line = (body.match(/<text[^>]*>([^<]{2,160})<\/text>/) || [])[1] || '';
        const msg = (body.match(/<title>([^<]{0,200})<\/title>/) || [])[1] || '';
        throw new Error(`render gagal (${res.status}) ${msg} ${line}`);
    }
    return body;
}

const blocks = (file) => {
    if (file.endsWith('.puml')) return [{ where: basename(file), code: readFileSync(file, 'utf8') }];
    const html = readFileSync(file, 'utf8');
    return [...html.matchAll(/<pre class="puml">([\s\S]*?)<\/pre>/g)]
        .map((m, i) => ({ where: `#${i + 1}`, code: m[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>') }));
};

const [cmd, ...args] = process.argv.slice(2);
const isCli = process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('puml.mjs');

if (!isCli) {
    // diimpor sebagai pustaka
} else if (cmd === 'encode') {
    console.log(url(readFileSync(args[0], 'utf8'), args[1] || 'svg'));
} else if (cmd === 'svg') {
    writeFileSync(args[1], await fetchDiagram(readFileSync(args[0], 'utf8')));
    console.log('saved', args[1]);
} else if (cmd === 'check') {
    const files = args.length ? args : readdirSync('.').filter((f) => f.endsWith('.html'));
    let total = 0, failed = 0;
    for (const file of files) {
        for (const b of blocks(file)) {
            total++;
            const name = `${file} ${b.where}`;
            const head = b.code.trim().split('\n').find((l) => l.startsWith('|') || l.startsWith('{') || /^(class|entity|status)\b/.test(l)) || '';
            try {
                const svg = await fetchDiagram(b.code);
                const size = (svg.match(/<svg[^>]*width="(\d+)"[^>]*height="(\d+)"/) || []).slice(1).join('×');
                console.log(`OK   ${name} ${size} ${head.trim()}`);
            } catch (err) {
                failed++;
                console.log(`FAIL ${name} — ${err.message}`);
            }
        }
    }
    console.log(`\n${total - failed}/${total} blok PlantUML dapat dirender.`);
    process.exit(failed ? 1 : 0);
} else {
    console.log('Pakai: encode <file> | check [files...] | svg <file.puml> <out.svg>');
}
