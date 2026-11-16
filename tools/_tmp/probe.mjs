// Periksa gaya terhitung pada teks tab fragmen di browser yang dipakai untuk ekspor.
// Pakai: node tools/_tmp/probe.mjs <halaman.html>
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 9334;
const page = process.argv[2] || 'sequence-diagram.html';
const chrome = spawn(CHROME, [
    '--headless=new', '--disable-gpu', '--hide-scrollbars',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${resolve('tools/_unduh/_chrome2')}`,
    '--window-size=1400,1200',
    pathToFileURL(resolve(page)).href,
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
await sleep(1500);

const expr = `(() => {
  const t = document.querySelector('.dgm svg text.k');
  const p = t.previousElementSibling;
  const tb = t.getBBox(), pb = p.getBBox();
  return JSON.stringify({
    text: t.textContent,
    textBox: [tb.x, tb.y, tb.width, tb.height].map(Math.round),
    tabBox: [pb.x, pb.y, pb.width, pb.height].map(Math.round),
  });
})()`;
const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true }, sid);
console.log(typeof r.result.result.value === 'string' ? r.result.result.value : JSON.stringify(r.result));
ws.close();
chrome.kill();
