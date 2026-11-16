// Probe diagnostik: jalankan potongan JS di halaman, cetak hasilnya.
// Pakai: node tools/probe.mjs <halaman.html> <berkas-probe.js>
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 9336;
const [page, probeFile] = process.argv.slice(2);

const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars',
    `--remote-debugging-port=${PORT}`, `--user-data-dir=${resolve('tools/_unduh/_probe')}`,
    '--window-size=1400,1200', pathToFileURL(resolve(page)).href], { stdio: 'ignore' });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let ws = null;
for (let i = 0; i < 60 && !ws; i++) {
    try {
        const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
        const t = list.find((x) => x.type === 'page' && x.webSocketDebuggerUrl);
        if (t) ws = new WebSocket(t.webSocketDebuggerUrl);
    } catch { /* belum siap */ }
    if (!ws) await sleep(250);
}
await new Promise((r) => ws.addEventListener('open', r));

let id = 0;
const pending = new Map();
ws.addEventListener('message', (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
});
const send = (method, params = {}) => new Promise((res) => {
    const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params }));
});

await sleep(2500);
const expr = readFileSync(probeFile, 'utf8');
const out = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
console.log(out.result?.result?.value ?? JSON.stringify(out.result, null, 1));

ws.close();
chrome.kill();
