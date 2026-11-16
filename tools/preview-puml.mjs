// Pratinjau cepat satu berkas .puml: render ke SVG lalu tangkapan layar PNG.
// Pakai: node tools/preview-puml.mjs <berkas.puml> [lebar] [tinggi]
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve, basename } from 'node:path';
import { fetchDiagram } from './puml.mjs';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const [file, w = '1000', h = '900'] = process.argv.slice(2);
const stem = basename(file, '.puml');

let svg;
try {
    svg = await fetchDiagram(readFileSync(file, 'utf8'));
} catch (err) {
    console.error(`render gagal ${file}: ${err.message}`);
    process.exit(1);
}

const svgPath = resolve(`_${stem}.svg`);
writeFileSync(svgPath, svg);

const dims = svg.match(/\swidth="(\d+)px"\s+height="(\d+)px"/) || [];
const shotW = Math.min(1800, Math.max(Number(w), Number(dims[1] || w) + 40));
const shotH = Math.min(1800, Math.max(Number(h), Number(dims[2] || h) + 40));

execFileSync(CHROME, [
    '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
    `--screenshot=${resolve(`_${stem}.png`)}`,
    `--window-size=${shotW},${shotH}`, '--default-background-color=ffffffff',
    pathToFileURL(svgPath).href,
], { stdio: 'ignore' });

console.log(`saved _${stem}.png  svg=${dims[1] || '?'}×${dims[2] || '?'}`);
