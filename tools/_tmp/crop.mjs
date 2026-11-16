// Crop perbesaran area tab fragmen dari PNG hasil unduhan, untuk melihat goresan teks.
// Pakai: node tools/_tmp/crop.mjs <file.png> <x> <y> <w> <h> <skala> <keluaran.png>
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const [file = 'tools/_unduh/s-05-sequence-diagram.png', x = '380', y = '560',
    w = '500', h = '120', scale = '4', out = 'tools/_tmp/crop.png'] = process.argv.slice(2);
const name = out.split(/[\\/]/).pop();
const dir = resolve(out, '..');
mkdirSync(dir, { recursive: true });
const dataUrl = 'data:image/png;base64,' + readFileSync(file).toString('base64');

const html = `<!doctype html><body style="margin:0;background:#fff">
<canvas id="c"></canvas>
<script>
const img = new Image();
img.onload = () => {
  const [x, y, w, h, s] = ${JSON.stringify([x, y, w, h, scale].map(Number))};
  const c = document.getElementById('c');
  c.width = w * s; c.height = h * s;
  const g = c.getContext('2d');
  g.imageSmoothingEnabled = false;
  g.drawImage(img, x, y, w, h, 0, 0, c.width, c.height);
  document.title = 'crop-siap';
};
img.src = ${JSON.stringify(dataUrl)};
</script>`;

writeFileSync(resolve('tools/_tmp/crop.html'), html);
spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', [
    '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
    `--screenshot=${dir}\\${name}`,
    '--window-size=1600,1200',
    pathToFileURL(resolve('tools/_tmp/crop.html')).href,
], { stdio: 'ignore' }).on('exit', (c) => console.log('crop:', out, 'exit', c));
