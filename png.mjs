// Render pratinjau SVG (_preview/*.svg) menjadi PNG agar bisa diperiksa secara visual.
// Pakai: node png.mjs [lebar]
import { execFileSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const width = process.argv[2] || '1420';

for (const f of readdirSync('_preview').filter((n) => n.endsWith('.svg'))) {
    const src = resolve('_preview', f);
    const out = resolve(`_shot-${f.replace(/\.svg$/, '')}.png`);
    execFileSync(CHROME, [
        '--headless=new', '--disable-gpu', '--hide-scrollbars',
        '--allow-file-access-from-files',
        '--force-device-scale-factor=1',
        `--screenshot=${out}`,
        `--window-size=${width},1150`,
        '--default-background-color=ffffffff',
        '--virtual-time-budget=3000',
        pathToFileURL(src).href,
    ], { stdio: 'inherit' });
    console.log('saved', out);
}
