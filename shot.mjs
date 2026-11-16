// Ambil tangkapan layar halaman (Chrome headless) untuk pemeriksaan visual.
// Pakai: node shot.mjs <halaman.html> <keluaran.png> [lebar] [tinggi]
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const [page, out, w = '1500', h = '1200'] = process.argv.slice(2);

execFileSync(CHROME, [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--allow-file-access-from-files',
    `--screenshot=${resolve(out)}`,
    `--window-size=${w},${h}`,
    `--virtual-time-budget=4000`,
    pathToFileURL(resolve(page)).href
], { stdio: 'inherit' });

console.log('saved', out);
