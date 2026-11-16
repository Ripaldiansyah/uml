// Pratinjau cepat satu berkas SVG/HTML menjadi PNG memakai Chrome headless.
// Pakai: node _tmp/svg2png.mjs <berkas> <keluaran.png> [lebar] [tinggi]
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const [file, out, w = '1560', h = '900'] = process.argv.slice(2);
execFileSync('C:/Program Files/Google/Chrome/Application/chrome.exe', [
    '--headless=new', '--disable-gpu', '--hide-scrollbars', '--allow-file-access-from-files',
    `--screenshot=${resolve(out)}`, `--window-size=${w},${h}`, '--virtual-time-budget=3000',
    pathToFileURL(resolve(file)).href,
], { stdio: 'ignore' });
console.log('saved', out);
