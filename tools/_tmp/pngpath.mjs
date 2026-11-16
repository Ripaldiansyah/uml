// Tumpuk SVG hasil unduhan di atas PNG hasil unduhan, agar selisihnya kelihatan.
// Pakai: node tools/_tmp/pngpath.mjs [nama-dasar tanpa ekstensi]
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const base = process.argv[2] || 'tools/_unduh/s-05-sequence-diagram';
const svg = readFileSync(`${base}.svg`, 'utf8').replace(/^<\?xml[^>]*\?>/, '');
const png = 'data:image/png;base64,' + readFileSync(`${base}.png`).toString('base64');
const vm = /viewBox="0 0 ([\d.]+) ([\d.]+)"/.exec(svg);
const W = Number(vm[1]), H = Number(vm[2]);

const html = `<!doctype html><meta charset="utf-8"><body style="margin:0;background:#fff">
<div style="position:relative;width:${W}px;height:${H}px;overflow:hidden">
  <img src="${png}" style="position:absolute;inset:0;width:${W}px;height:${H / 2}px;opacity:.55">
  <div id="slot" style="position:absolute;inset:0"></div>
</div>
<script>
document.getElementById('slot').innerHTML = ${JSON.stringify(svg)};
document.title = 'siap';
</script>`;
writeFileSync('tools/_tmp/pngpath.html', html);

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
spawn(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
    '--virtual-time-budget=4000', `--screenshot=${resolve('tools/_tmp/pngpath.png')}`, `--window-size=${W},${H}`,
    pathToFileURL(resolve('tools/_tmp/pngpath.html')).href], { stdio: 'ignore' })
    .on('exit', (c) => console.log('tumpuk', W + 'x' + H, 'exit', c));

