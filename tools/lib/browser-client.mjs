import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { setTimeout as pause } from 'node:timers/promises';
import { pathToFileURL } from 'node:url';
export const fileUrl = (path) => pathToFileURL(path).href;

export async function openBrowser() {
    const candidates = [process.env.BROWSER_PATH, 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'].filter(Boolean);
    const executable = candidates.find((p) => existsSync(p));
    if (!executable) throw new Error('Atur BROWSER_PATH ke Chrome atau Edge untuk menjalankan pemeriksaan.');
    const profile = mkdtempSync(join(tmpdir(), 'akc-diagram-check-'));
    const child = spawn(executable, ['--headless=new', '--no-first-run', '--no-default-browser-check', '--disable-gpu', '--disable-extensions', '--disable-background-networking', '--remote-debugging-address=127.0.0.1', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] });
    let errors = '';
    child.stderr.on('data', (chunk) => { if (errors.length < 4000) errors += chunk.toString(); });
    let port;
    try {
        for (let i = 0; i < 100; i++) {
            const file = join(profile, 'DevToolsActivePort');
            if (existsSync(file)) { port = Number(readFileSync(file, 'utf8').split(/\r?\n/)[0]); if (port) break; }
            if (child.exitCode !== null) throw new Error(`Peramban berhenti: ${errors}`);
            await pause(120);
        }
        if (!port) throw new Error(`Peramban belum siap. ${errors}`);
        let address;
        for (let i = 0; i < 80; i++) {
            try {
                const targets = await fetch(`http://127.0.0.1:${port}/json/list`).then((r) => r.json());
                address = targets.find((t) => t.type === 'page')?.webSocketDebuggerUrl;
                if (address) break;
            } catch (_) { /* Port belum sepenuhnya siap. */ }
            await pause(100);
        }
        if (!address) throw new Error('Halaman pemeriksaan tidak ditemukan.');
        const socket = new WebSocket(address);
        await new Promise((resolve, reject) => {
            socket.addEventListener('open', resolve, { once: true });
            socket.addEventListener('error', reject, { once: true });
        });
        const pending = new Map(), listeners = new Map();
        let nextId = 1;
        socket.addEventListener('message', ({ data }) => {
            const msg = JSON.parse(String(data));
            if (msg.id && pending.has(msg.id)) {
                const { resolve, reject, timer } = pending.get(msg.id); pending.delete(msg.id); clearTimeout(timer);
                if (msg.error) reject(new Error(`${msg.error.message}: ${msg.error.data || ''}`)); else resolve(msg.result);
            }
            if (msg.method) for (const cb of listeners.get(msg.method) || []) cb(msg.params || {});
        });
        socket.addEventListener('close', () => {
            for (const item of pending.values()) { clearTimeout(item.timer); item.reject(new Error('Sambungan peramban tertutup.')); }
            pending.clear();
        });
        const send = (method, params = {}) => new Promise((resolve, reject) => {
            const id = nextId++;
            const timer = setTimeout(() => { pending.delete(id); reject(new Error(`Waktu habis: ${method}`)); }, 15000);
            timer.unref(); pending.set(id, { resolve, reject, timer }); socket.send(JSON.stringify({ id, method, params }));
        });
        const on = (method, callback) => {
            const set = listeners.get(method) || new Set(); set.add(callback); listeners.set(method, set);
            return () => set.delete(callback);
        };
        const waitEvent = (method, timeout = 15000) => new Promise((resolve, reject) => {
            const off = on(method, (event) => { clearTimeout(timer); off(); resolve(event); });
            const timer = setTimeout(() => { off(); reject(new Error(`Menunggu ${method} melewati batas waktu.`)); }, timeout); timer.unref();
        });
        const evaluate = async (expression) => {
            const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true, userGesture: true });
            if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
            return result.result?.value;
        };
        const navigate = async (url) => {
            const ready = waitEvent('Page.loadEventFired');
            const result = await send('Page.navigate', { url });
            if (result.errorText) throw new Error(result.errorText); await ready;
        };
        const click = async (selector) => {
            const point = await evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e)throw new Error('Tombol tidak ditemukan: '+${JSON.stringify(selector)});e.scrollIntoView({block:'center',inline:'center'});const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);
            for (const [type, button, clickCount] of [['mouseMoved', 'none', 0], ['mousePressed', 'left', 1], ['mouseReleased', 'left', 1]]) await send('Input.dispatchMouseEvent', { type, x: point.x, y: point.y, button, clickCount });
        };
        const key = async (key, code, virtualKeyCode) => {
            await send('Input.dispatchKeyEvent', { type: 'keyDown', key, code, windowsVirtualKeyCode: virtualKeyCode });
            await send('Input.dispatchKeyEvent', { type: 'keyUp', key, code, windowsVirtualKeyCode: virtualKeyCode });
        };
        async function close() {
            try { await send('Browser.close'); } catch (_) { /* Proses ditutup sebagai cadangan. */ }
            if (child.exitCode === null) { child.kill(); await pause(100); }
            socket.close();
            if (dirname(profile) === tmpdir()) rmSync(profile, { recursive: true, force: true });
        }
        await send('Page.enable'); await send('Runtime.enable');
        await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1100, deviceScaleFactor: 1, mobile: false });
        return { executable, evaluate, navigate, click, key, send, on, close };
    } catch (error) {
        if (child.exitCode === null) child.kill();
        rmSync(profile, { recursive: true, force: true }); throw error;
    }
}
