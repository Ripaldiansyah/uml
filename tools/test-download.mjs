// Uji tombol unduh: klik PNG & SVG pada satu halaman, simpan hasilnya, lalu laporkan.
// Pakai (Chrome terpasang, port debug dibuka otomatis):
//   node tools/test-download.mjs <halaman.html> [indeksGambar]
// Hasil: tools/_unduh/gambar-N.png dan gambar-N.svg
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 9333;
const [page, index = '0'] = process.argv.slice(2);
const outDir = resolve('tools/_unduh');
mkdirSync(outDir, { recursive: true });

const chrome = spawn(CHROME, [
    '--headless=new', '--disable-gpu', '--hide-scrollbars',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${resolve('tools/_unduh/_chrome')}`,
    `--window-size=1400,1200`,
    pathToFileURL(resolve(page)).href,
], { stdio: 'ignore' });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function wsUrl() {
    for (let i = 0; i < 40; i++) {
        try {
            const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
            const target = list.find((t) => t.type === 'page' && t.webSocketDebuggerUrl);
            if (target) return target.webSocketDebuggerUrl;
        } catch (e) { /* belum siap */ }
        await sleep(250);
    }
    throw new Error('Chrome devtools tidak tersedia');
}

const ws = new WebSocket(await wsUrl());
let id = 0;
const pending = new Map();
const downloads = new Map();

const completed = new Set();
ws.addEventListener('message', (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
        pending.get(msg.id)(msg);
        pending.delete(msg.id);
    }
    if (msg.method === 'Runtime.exceptionThrown') {
        console.log('GALAT:', msg.params.exceptionDetails.exception?.description || msg.params.exceptionDetails.text);
    }
    if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
        console.log('KONSOL:', msg.params.args.map((a) => a.value || a.description).join(' '));
    }
    if (msg.method === 'Browser.downloadWillBegin') {
        downloads.set(msg.params.guid, msg.params.suggestedFilename);
    }
    if (msg.method === 'Browser.downloadProgress' && msg.params.state === 'completed') {
        const name = downloads.get(msg.params.guid);
        completed.add(name);
        console.log('unduhan selesai:', name);
    }
});

const send = (method, params = {}, sessionId) => new Promise((res) => {
    const mid = ++id;
    pending.set(mid, res);
    ws.send(JSON.stringify({ id: mid, method, params, sessionId }));
});

await new Promise((r) => ws.addEventListener('open', r));

const { result: { sessionId } } = await send('Target.attachToTarget', { targetId: (await send('Target.getTargets')).result.targetInfos.find((t) => t.type === 'page').targetId, flatten: true });
await send('Runtime.enable', {}, sessionId);
await send('Log.enable', {}, sessionId);
await send('Page.enable', {}, sessionId);
await send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: outDir, eventsEnabled: true });

// tunggu diagram selesai digambar
for (let i = 0; i < 60; i++) {
    const r = await send('Runtime.evaluate', { expression: 'document.querySelectorAll("figure.drawing .dgm-bar").length', returnByValue: true }, sessionId);
    if ((r.result.result.value || 0) > 0) break;
    await sleep(300);
}
await sleep(600);

const click = (n) => `(() => { const bar = document.querySelectorAll('.dgm-bar')[${index}]; if (!bar) return 'toolbar-missing'; const b = bar.querySelectorAll('button')[${n}]; if (!b) return 'button-missing'; b.click(); return b.textContent; })()`;
console.log('klik', (await send('Runtime.evaluate', { expression: click(0), returnByValue: true }, sessionId)).result.result.value, '(SVG)');
for (let i = 0; i < 40 && completed.size < 1; i++) await sleep(250);
console.log('klik', (await send('Runtime.evaluate', { expression: click(1), returnByValue: true }, sessionId)).result.result.value, '(PNG)');
for (let i = 0; i < 60 && completed.size < 2; i++) await sleep(250);
console.log('total unduhan:', completed.size);

ws.close();
chrome.kill();
