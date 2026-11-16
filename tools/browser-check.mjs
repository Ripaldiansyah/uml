import { readFileSync, readdirSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { setTimeout as pause } from 'node:timers/promises';
import { openBrowser, fileUrl } from './lib/browser-client.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
const review = join(root, '_review'), downloads = join(review, 'downloads');
mkdirSync(downloads, { recursive: true });
const assert = (condition, message) => { if (!condition) throw new Error(message); };
async function waitFor(fn, message, limit = 15000) {
    const until = Date.now() + limit;
    while (Date.now() < until) { const value = fn(); if (value) return value; await pause(80); }
    throw new Error(message);
}
const report = { diagrams: [], downloads: [], pages: [], errors: [] };
let browser;
try {
    browser = await openBrowser();
    console.log(`Peramban: ${browser.executable}`);
    const observed = new Map();
    browser.on('Runtime.exceptionThrown', (e) => report.errors.push(e.exceptionDetails?.exception?.description || e.exceptionDetails?.text));
    for (const event of ['Browser.downloadWillBegin', 'Page.downloadWillBegin']) browser.on(event, (e) => observed.set(e.guid, { id: e.guid, name: e.suggestedFilename, state: 'mulai' }));
    for (const event of ['Browser.downloadProgress', 'Page.downloadProgress']) browser.on(event, (e) => { const d = observed.get(e.guid); if (d) d.state = e.state; });
    await browser.send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: downloads, eventsEnabled: true });
    for (const file of ['index.html', 'activity-diagram.html', 'sequence-diagram.html', 'usecase-diagram.html', 'class-diagram.html']) {
        await browser.navigate(fileUrl(join(root, file)));
        const status = await browser.evaluate(`({page:document.title,figures:document.querySelectorAll('[data-dgm]').length,missing:[...document.querySelectorAll('script[src],link[href]')].filter(e=>!e.href && !e.src).length,overflow:document.documentElement.scrollWidth>window.innerWidth})`);
        assert(status.figures === (file === 'index.html' ? 0 : file.includes('usecase') || file.includes('class') ? 1 : 7), `Jumlah gambar tidak sesuai pada ${file}`);
        assert(!status.overflow, `Halaman terlalu lebar: ${file}`);
        report.pages.push(status); console.log(`OK HTML ${file}: ${status.figures} gambar`);
    }
    await browser.navigate(fileUrl(join(root, 'activity-diagram.html')));
    const before = await browser.evaluate(`document.querySelector('svg').getBoundingClientRect().width`);
    await browser.click('[data-zoom-in]');
    const after = await browser.evaluate(`document.querySelector('svg').getBoundingClientRect().width`);
    assert(after > before, 'Tombol pembesar tidak mengubah ukuran gambar.');
    await browser.click('[data-fit]');
    for (let i = 0; i < 5; i++) await browser.click('[data-zoom-in]');
    await browser.click('[data-pan]');
    const point = await browser.evaluate(`(()=>{const e=document.querySelector('[data-canvas]');const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2,before:e.scrollTop};})()`);
    await browser.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: point.x, y: point.y, button: 'left', clickCount: 1 });
    await browser.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: point.x, y: point.y - 140, button: 'left', buttons: 1, clickCount: 1 });
    await browser.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: point.x, y: point.y - 140, button: 'left', clickCount: 1 });
    const moved = await browser.evaluate(`document.querySelector('[data-canvas]').scrollTop`);
    assert(moved > point.before, 'Penggeseran gambar tidak bekerja.');
    await browser.click('[data-expand]');
    await pause(150);
    assert(await browser.evaluate(`document.fullscreenElement !== null || document.querySelector('.diagram').classList.contains('is-expanded')`), 'Mode gambar penuh gagal dibuka.');
    await browser.key('Escape', 'Escape', 27);
    await browser.click('[data-png]');
    await waitFor(() => [...observed.values()].some((d) => d.name === 'A01.png' && d.state === 'completed'), 'Unduhan PNG belum selesai.');
    for (const extension of ['svg', 'drawio']) {
        await browser.click(`a[download$=".${extension}"]`); await waitFor(() => [...observed.values()].some((d) => d.name === `A01.${extension}` && d.state === 'completed'), `Unduhan ${extension} belum selesai.`);
    }
    for (const d of observed.values()) {
        const path = join(downloads, d.name); assert(existsSync(path), `Berkas unduhan tidak ditemukan: ${d.name}`);
        const content = readFileSync(path); assert(content.length > 1000, `Berkas unduhan terlalu kecil: ${d.name}`);
        if (d.name.endsWith('.png')) { assert(content.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])), 'Penanda PNG tidak benar.'); assert(content.readUInt32BE(16) > 0 && content.readUInt32BE(20) > 0, 'Ukuran PNG kosong.'); }
        else if (d.name.endsWith('.drawio')) assert(content.toString('utf8').startsWith('<mxfile'), 'Isi Draw.io tidak sesuai.');
        else assert(content.toString('utf8').startsWith('<svg'), 'Isi SVG tidak sesuai.');
        report.downloads.push({ name: d.name, bytes: content.length }); console.log(`OK Unduh ${d.name}: ${content.length} bita`);
    }

    for (const path of readdirSync(join(root, 'assets/diagrams')).filter((x) => x.endsWith('.svg')).sort()) {
        await browser.navigate('about:blank');
        const svg = readFileSync(join(root, 'assets/diagrams', path), 'utf8');
        await browser.evaluate(`(()=>{document.body.style.margin='0';document.body.innerHTML=${JSON.stringify(svg)};const s=document.querySelector('svg');s.style.display='block';s.style.width=s.viewBox.baseVal.width+'px';s.style.height=s.viewBox.baseVal.height+'px';return true;})()`);
        await browser.evaluate(`document.fonts.ready.then(()=>true)`);
        const issues = await browser.evaluate(`(()=>{
            const svg=document.querySelector('svg'), w=svg.viewBox.baseVal.width,h=svg.viewBox.baseVal.height;
            const records=[...svg.querySelectorAll('text')].filter(t=>t.textContent.trim()).map(t=>{const box=t.getBBox();const group=t.closest('[data-shape]');const shape=group?.firstElementChild?.getBBox();return {text:t.textContent,kind:group?.dataset.kind,id:group?.dataset.shape||'',x:box.x,y:box.y,w:box.width,h:box.height,shape:shape?{x:shape.x,y:shape.y,w:shape.width,h:shape.height}:null};});
            const errors=[];
            for(const a of records){
                if(a.x < -2 || a.y < -2 || a.x+a.w>w+2 || a.y+a.h>h+2) errors.push({type:'keluar kanvas',...a});
                if(a.shape && ['action','decision','ellipse','object','class','note'].includes(a.kind) && (a.x<a.shape.x-3 || a.y<a.shape.y-3 || a.x+a.w>a.shape.x+a.shape.w+3 || a.y+a.h>a.shape.y+a.shape.h+3)) errors.push({type:'keluar kotak',...a});
            }
            for(let i=0;i<records.length;i++) for(let j=i+1;j<records.length;j++){
                const a=records[i],b=records[j]; if(a.id && a.id===b.id)continue;
                if(Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x)>2 && Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y)>2) errors.push({type:'tumpang tindih',a:a.text,b:b.text,ida:a.id,idb:b.id});
            }
            return errors;
        })()`);
        const size = await browser.evaluate(`(()=>{const s=document.querySelector('svg').viewBox.baseVal;return {width:s.width,height:s.height};})()`);
        if (size.width > 1440) await browser.send('Emulation.setDeviceMetricsOverride', { width: size.width + 4, height: Math.min(size.height + 4, 3000), deviceScaleFactor: 1, mobile: false });
        const image = await browser.send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: size.width, height: size.height, scale: 1 }, captureBeyondViewport: true });
        writeFileSync(join(review, path.replace('.svg', '.png')), Buffer.from(image.data, 'base64'));
        report.diagrams.push({ id: path.replace('.svg', ''), issues });
        console.log(`${issues.length ? 'PERIKSA' : 'OK'} SVG ${path}: ${issues.length} masalah`);
    }
    await browser.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: false });
    for (const file of ['index.html', 'activity-diagram.html', 'sequence-diagram.html', 'usecase-diagram.html', 'class-diagram.html']) {
        await browser.navigate(fileUrl(join(root, file)));
        assert(await browser.evaluate(`document.documentElement.scrollWidth <= window.innerWidth`), `Tampilan ponsel terlalu lebar: ${file}`);
    }
    console.log('OK Tampilan ponsel seluruh halaman.');
} catch (error) { report.errors.push(error.stack || error.message); console.error(error); }
finally {
    if (browser) await browser.close();
    writeFileSync(join(review, 'hasil.json'), JSON.stringify(report, null, 2));
}
if (report.errors.length || report.diagrams.some((d) => d.issues.length)) process.exitCode = 1;
else console.log('Seluruh pemeriksaan peramban lulus.');
