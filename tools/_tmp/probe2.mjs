// Ukur kotak nyata semua elemen SVG di halaman, dari berkas XHTML yang diunduh.
// Pakai: node tools/_tmp/probe2.mjs <berkas.svg|xhtml> <pola class>
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const [file = 'tools/_unduh/s-05-sequence-diagram.svg', pattern = '.frag-box, .frag-tab, .k, .sm'] = process.argv.slice(2);
const raw = readFileSync(file, 'utf8');
const html = `<!doctype html><meta charset="utf-8"><body style="margin:0">${raw.replace(/^<\?xml[^>]*\?>/, '')}</body>`;
writeFileSync(resolve('tools/_tmp/probe2.html'), html);

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 9336;
const chrome = spawn(CHROME, [
    '--headless=new', '--disable-gpu', '--hide-scrollbars', `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${resolve('tools/_unduh/_chrome3')}`, '--window-size=1400,1400',
    pathToFileURL(resolve('tools/_tmp/probe2.html')).href,
], { stdio: 'ignore' });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let target;
for (let i = 0; i < 40 && !target; i++) {
    try {
        const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
        target = list.find((t) => t.type === 'page' && t.webSocketDebuggerUrl);
    } catch (e) { /* belum siap */ }
    if (!target) await sleep(250);
}
const ws = new WebSocket(target.webSocketDebuggerUrl);
let id = 0;
const pending = new Map();
ws.addEventListener('message', (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
});
const send = (method, params = {}, sessionId) => new Promise((res) => {
    const mid = ++id; pending.set(mid, res);
    ws.send(JSON.stringify({ id: mid, method, params, sessionId }));
});
await new Promise((r) => ws.addEventListener('open', r));
const sid = (await send('Target.attachToTarget', {
    targetId: (await send('Target.getTargets')).result.targetInfos.find((t) => t.type === 'page').targetId,
    flatten: true,
})).result.sessionId;
await sleep(1200);

const expr = `(() => {
  const out = [];
  for (const el of document.querySelectorAll(${JSON.stringify(pattern)})) {
    const b = el.getBBox();
    const cs = getComputedStyle(el);
    out.push({
      tag: el.tagName, cls: el.getAttribute('class'), txt: (el.textContent || '').slice(0, 18),
      box: [b.x, b.y, b.width, b.height].map((n) => Math.round(n)),
      fill: cs.fill, font: cs.fontSize + '/' + cs.fontFamily.slice(0, 14),
    });
  }
  return JSON.stringify(out);
})()`;
const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true }, sid);
for (const e of JSON.parse(r.result.result.value)) {
    console.log(`${e.tag} ${e.cls} "${e.txt}" box ${e.box.join(',')} fill ${e.fill} ${e.font}`);
}
ws.close();
chrome.kill();
