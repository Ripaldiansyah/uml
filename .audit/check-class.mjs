import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { classDiagram } from '../tools/lib/classes.mjs';
import { classRecords } from '../tools/lib/content-class.mjs';
import { sceneSvg } from '../tools/lib/render.mjs';
import { buildPages } from '../tools/lib/pages.mjs';
import { openBrowser, fileUrl } from '../tools/lib/browser-client.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const project = fileURLToPath(new URL('../../', import.meta.url));
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const scene = classDiagram()[0];
const modelShapes = scene.shapes.filter((shape) => shape.kind === 'class' && shape.operations.length);
const files = { user: 'User', history: 'Konsultasi', symptom: 'Gejala', damage: 'Kerusakan', rule: 'Rule', part: 'Sparepart' };
assert(modelShapes.length === 6, 'Harus ada enam model PHP dengan method.');
assert(scene.shapes.filter((shape) => shape.kind === 'class').length === 8, 'Jumlah model dan tabel penghubung berubah.');
assert(classRecords.length === 8, 'Penjelasan dan bentuk kelas tidak selaras.');
assert(modelShapes.reduce((total, shape) => total + shape.operations.length, 0) === 27, 'Jumlah method yang disajikan tidak sesuai.');
for (const shape of modelShapes) {
    const source = readFileSync(join(project, `app/models/${files[shape.id]}.php`), 'utf8');
    const inherited = readFileSync(join(project, 'app/core/Model.php'), 'utf8');
    for (const operation of shape.operations) {
        const match = operation.match(/^([+-]) (\w+)\(/);
        assert(match, `${shape.id}: format method tidak lengkap: ${operation}`);
        const [, visibility, name] = match;
        const declaration = new RegExp(`\\b${visibility === '+' ? 'public' : 'private'}\\s+static\\s+function\\s+${name}\\s*\\(`);
        assert(declaration.test(source) || declaration.test(inherited), `${shape.id}: method ${name} tidak ditemukan di PHP.`);
    }
}
const html = buildPages()['class-diagram.html'];
assert((html.match(/<section class="section"/g) || []).length === 1, 'Halaman kelas harus memiliki satu bagian utama.');
for (const model of modelShapes) {
    for (const operation of model.operations) assert(html.includes(operation), `Method belum muncul di penjelasan HTML: ${operation}`);
}
const svgFile = join(root, 'assets/diagrams/C-01.svg');
assert(readFileSync(svgFile, 'utf8') === `${sceneSvg(scene)}\n`, 'SVG C-01 belum diperbarui dari sumber.');
const drawio = readFileSync(join(root, 'drawio/C-01.drawio'), 'utf8');
for (const model of modelShapes) assert(drawio.includes(`id="${model.id}"`), `Draw.io kehilangan model ${model.id}.`);
assert((drawio.match(/&lt;u&gt;/g) || []).length === 27, 'Method statis belum ditandai di Draw.io.');

const report = { models: 6, operations: 27, checkedPhp: true, svgCurrent: true, drawioCurrent: true, checks: [] };
let browser;
try {
    browser = await openBrowser();
    const errors = [];
    browser.on('Runtime.exceptionThrown', (event) => errors.push(event.exceptionDetails?.exception?.description || event.exceptionDetails?.text));
    await browser.navigate(fileUrl(join(root, 'class-diagram.html')));
    await browser.evaluate('document.fonts.ready.then(() => true)');
    const result = await browser.evaluate(`(()=>{
        const svg=document.querySelector('[data-dgm] svg');
        const expected=${JSON.stringify(Object.fromEntries(modelShapes.map((shape) => [shape.id, shape.operations])))};
        const errors=[];
        for(const [id,operations] of Object.entries(expected)){
            const group=svg.querySelector('[data-shape="'+id+'"]');
            if(!group){errors.push('Model hilang: '+id);continue;}
            const found=[...group.querySelectorAll('[data-operation]')].map(e=>e.dataset.operation);
            if(JSON.stringify(found)!==JSON.stringify(operations))errors.push('Method berbeda di SVG: '+id);
            if(group.querySelector('[data-compartment="operations"] path')===null)errors.push('Pemisah method hilang: '+id);
            const box=group.querySelector('rect').getBBox();
            for(const method of group.querySelectorAll('[data-operation] text')){
                const b=method.getBBox();
                if(b.x<box.x+5 || b.x+b.width>box.x+box.width-5 || b.y+b.height>box.y+box.height-8)errors.push('Teks method keluar kotak: '+id+' '+method.textContent);
                if(method.querySelectorAll('tspan').length>1)errors.push('Method ke baris lain: '+id+' '+method.textContent);
            }
            const text=[...group.querySelectorAll('text')].map(e=>({value:e.textContent,box:e.getBBox()}));
            for(let i=0;i<text.length;i++)for(let j=i+1;j<text.length;j++){
                const a=text[i],b=text[j];
                if(Math.min(a.box.x+a.box.width,b.box.x+b.box.width)-Math.max(a.box.x,b.box.x)>2 && Math.min(a.box.y+a.box.height,b.box.y+b.box.height)-Math.max(a.box.y,b.box.y)>2)errors.push('Teks bertumpuk: '+a.value+' / '+b.value);
            }
        }
        return {errors,models:svg.querySelectorAll('[data-kind="class"]').length,methods:svg.querySelectorAll('[data-operation]').length};
    })()`);
    assert(result.models === 8 && result.methods === 27, 'Hasil halaman tidak memuat seluruh kelas dan method.');
    assert(result.errors.length === 0, result.errors.join('\n'));
    report.checks.push('Semua method dan pemisah kompartemen tampil di SVG halaman.');
    const before = await browser.evaluate(`document.querySelector('[data-dgm] svg').getBoundingClientRect().width`);
    await browser.click('[data-zoom-in]');
    assert(await browser.evaluate(`document.querySelector('[data-dgm] svg').getBoundingClientRect().width`) > before, 'Pembesar diagram tidak bekerja.');
    await browser.click('[data-fit]');
    for (let i = 0; i < 4; i++) await browser.click('[data-zoom-in]');
    report.checks.push('Zoom dan fit bekerja.');
    await browser.click('[data-pan]');
    const pan = await browser.evaluate(`(()=>{const e=document.querySelector('[data-canvas]');return e.scrollWidth>e.clientWidth && getComputedStyle(e).cursor.startsWith('grab');})()`);
    assert(pan, 'Geser diagram tidak aktif.');
    report.checks.push('Pan aktif pada skala besar.');
    await browser.click('[data-fit]');
    const saveScreenshot = async (file) => {
        const size = await browser.evaluate(`({width:document.documentElement.clientWidth,height:document.documentElement.scrollHeight})`);
        const image = await browser.send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, ...size, scale: 1 }, captureBeyondViewport: true });
        writeFileSync(join(root, '.audit', file), Buffer.from(image.data, 'base64'));
    };
    assert(await browser.evaluate('document.documentElement.scrollWidth<=innerWidth'), 'Halaman desktop melebar.');
    await saveScreenshot('class-desktop.png');
    await browser.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: false });
    await browser.navigate(fileUrl(join(root, 'class-diagram.html')));
    assert(await browser.evaluate('document.documentElement.scrollWidth<=innerWidth'), 'Halaman ponsel melebar.');
    assert(await browser.evaluate(`[...document.querySelectorAll('.card')].every(e=>e.scrollWidth<=e.clientWidth+1)`), 'Method menyebabkan kartu ponsel melebar.');
    await saveScreenshot('class-mobile.png');
    await browser.send('Emulation.setDeviceMetricsOverride', { width: 1400, height: 1300, deviceScaleFactor: 1, mobile: false });
    await browser.navigate(fileUrl(svgFile));
    await browser.evaluate('document.fonts.ready.then(() => true)');
    const image = await browser.send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: 1400, height: 1300, scale: 1 }, captureBeyondViewport: true });
    writeFileSync(join(root, '.audit/class-diagram.png'), Buffer.from(image.data, 'base64'));
    report.checks.push('Desktop dan ponsel tidak mengalami overflow; tangkapan layar tersimpan.');
    assert(errors.length === 0, `Kesalahan browser: ${errors.join('; ')}`);
    report.errors = errors;
    console.log(JSON.stringify(report, null, 2));
} finally {
    if (browser) await browser.close();
    writeFileSync(join(root, '.audit/class-check.json'), JSON.stringify(report, null, 2) + '\n');
}
