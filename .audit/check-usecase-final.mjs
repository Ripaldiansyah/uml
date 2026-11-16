import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { openBrowser, fileUrl } from '../tools/lib/browser-client.mjs';
const assert = (ok, message) => { if (!ok) throw new Error(message); };
const browser = await openBrowser();
const errors = [];
browser.on('Runtime.exceptionThrown', event => errors.push(event.exceptionDetails?.exception?.description || event.exceptionDetails?.text));
const capture = async name => {
    const image = await browser.send('Page.captureScreenshot', { format:'png', captureBeyondViewport:false });
    writeFileSync(fileURLToPath(new URL(name, import.meta.url)), Buffer.from(image.data, 'base64'));
};
try {
    await browser.navigate(fileUrl('C:/laragon/www/akc_workshop/UML/usecase-diagram.html'));
    const style = await browser.evaluate(`(()=>{
        const css=(el,p)=>getComputedStyle(el)[p];
        const facts=document.querySelector('.scenario-facts');
        const fact=facts.querySelector('.fact-card');
        const table=document.querySelector('#skenario-uc05 table');
        const svg=document.querySelector('[data-dgm] svg');
        return {
            sections:document.querySelectorAll('main>.section').length,
            scenarios:document.querySelectorAll('[id^="skenario-uc"]').length,
            allFacts:document.querySelectorAll('.scenario-facts .fact-card').length,
            grids:css(facts,'gridTemplateColumns').split(' ').length,
            bodyFont:css(document.body,'fontFamily'),titleFont:css(facts.querySelector('h3'),'fontFamily'),
            sectionTitleFont:css(document.querySelector('.section h2'),'fontFamily'),
            cardBackground:css(fact,'backgroundColor'),cardPadding:css(fact,'padding'),
            headerBackground:css(table.querySelector('th'),'backgroundColor'),headerColor:css(table.querySelector('th'),'color'),
            pageBackground:css(document.body,'backgroundColor'),navbarBackground:css(document.querySelector('.topbar'),'backgroundColor'),
            columns:[...table.querySelectorAll('thead th')].map(el=>el.textContent.trim()),
            labels:[...facts.querySelectorAll('h3')].map(el=>el.textContent),
            diagramWidth:svg.getBoundingClientRect().width,diagramShapes:svg.querySelectorAll('[data-shape]').length,
            links:document.querySelectorAll('.toc a[href^="#skenario-uc"]').length,
            incomplete:[...document.querySelectorAll('main table tbody tr')].filter(tr=>tr.children.length!==3).length
        };
    })()`);
    assert(style.sections===20 && style.scenarios===19 && style.links===19, 'Diagram utama dan 19 skenario belum lengkap.');
    assert(style.allFacts===76 && style.labels.length===4, 'Ringkasan tujuan, pelaku, awal, dan akhir belum lengkap.');
    assert(style.grids===2, 'Ringkasan desktop harus dua kolom.');
    assert(style.bodyFont.startsWith('Arial') && style.titleFont.startsWith('Arial') && style.sectionTitleFont.startsWith('Georgia'), 'Tipografi berbeda dari aktivitas.');
    assert(style.pageBackground==='rgb(244, 246, 248)' && style.navbarBackground==='rgb(20, 42, 64)', 'Latar atau aksen berbeda dari aktivitas.');
    assert(style.cardPadding==='18px', 'Kartu tidak memakai gaya aktivitas.');
    assert(style.headerBackground==='rgb(32, 54, 76)' && style.headerColor==='rgb(255, 255, 255)', 'Tabel tidak memakai gaya aktivitas.');
    assert(style.labels.join('|')==='Tujuan|Pelaku|Kondisi awal|Hasil akhir', 'Label ringkasan tidak tepat.');
    assert(style.columns.join('|')==='Situasi|Yang terjadi|Hal yang perlu diperhatikan' && style.incomplete===0, 'Struktur skenario berbeda dari aktivitas.');
    assert(style.diagramWidth>0 && style.diagramShapes===24, 'Diagram utama gagal dimuat.');
    await capture('usecase-desktop.png');
    await browser.evaluate("document.querySelector('.toc a[href=\"#skenario-uc06\"]').click()");
    assert(await browser.evaluate("location.hash==='#skenario-uc06'"), 'Tautan skenario tidak bekerja.');
    const previousWidth=await browser.evaluate("document.querySelector('[data-dgm] svg').getBoundingClientRect().width");
    await browser.click('[data-zoom-in]');
    assert(await browser.evaluate("document.querySelector('[data-dgm] svg').getBoundingClientRect().width")>previousWidth, 'Tombol perbesar tidak bekerja.');
    await browser.evaluate(`new Promise(resolve=>{document.documentElement.style.scrollBehavior='auto';document.querySelector('[data-fit]').click();window.scrollTo(0,document.querySelector('#skenario-uc05').getBoundingClientRect().top+window.scrollY);requestAnimationFrame(()=>requestAnimationFrame(resolve));})`);
    await capture('usecase-scenario.png');
    await browser.send('Emulation.setDeviceMetricsOverride', {width:390,height:844,deviceScaleFactor:1,mobile:true});
    const mobile=await browser.evaluate(`({overflow:document.documentElement.scrollWidth>innerWidth,grids:getComputedStyle(document.querySelector('.scenario-facts')).gridTemplateColumns.split(' ').length,tableScroll:document.querySelector('#skenario-uc05 .table-wrap').scrollWidth>innerWidth})`);
    assert(!mobile.overflow && mobile.grids===1 && mobile.tableScroll, 'Tata letak ponsel belum sesuai.');
    await capture('usecase-mobile.png');
    assert(errors.length===0, errors.join('; '));
    console.log('PASS eksekusi HTML: 19 skenario, 76 ringkasan, tema aktivitas, navigasi, zoom, desktop, ponsel; tanpa error peramban.');
    console.log('Gaya:',JSON.stringify(style));
    console.log('Ponsel:',JSON.stringify(mobile));
} finally { await browser.close(); }
