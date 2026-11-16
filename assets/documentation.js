/* Pengatur tampilan dan unduhan gambar tanpa pustaka tambahan. */
(() => {
    'use strict';
    function setText(element, value) { if (element) element.textContent = value; }
    function downloadDocument(document) {
        document.querySelectorAll('[data-dgm]').forEach((diagram) => {
            const svg = diagram.querySelector('svg');
            const canvas = diagram.querySelector('[data-canvas]');
            const section = diagram.closest('.section') || diagram;
            const label = diagram.querySelector('[data-zoom-label]');
            const panButton = diagram.querySelector('[data-pan]');
            const expandButton = diagram.querySelector('[data-expand]');
            const width = Number(svg.viewBox.baseVal.width), height = Number(svg.viewBox.baseVal.height);
            let mode = 'fit', factor = 1, pan = false, dragging = false;
            function availableWidth() { return Math.max(160, (section.clientWidth || diagram.clientWidth || width) - 70); }
            function place(value, restore = true) {
                const oldWidth = svg.getBoundingClientRect().width || availableWidth();
                const px = (canvas.scrollLeft + canvas.clientWidth / 2) / Math.max(1, oldWidth);
                const py = (canvas.scrollTop + canvas.clientHeight / 2) / Math.max(1, svg.getBoundingClientRect().height || height);
                const next = Math.max(80, value);
                svg.style.width = `${next}px`; setText(label, `${Math.round(next / width * 100)}%`);
                if (restore) requestAnimationFrame(() => {
                    canvas.scrollLeft = Math.max(0, px * next - canvas.clientWidth / 2);
                    canvas.scrollTop = Math.max(0, py * next * height / width - canvas.clientHeight / 2);
                });
            }
            function fit() {
                mode = 'fit'; factor = 1; place(availableWidth(), false);
                diagram.querySelector('[data-fit]').setAttribute('aria-pressed', 'true');
                diagram.querySelector('[data-whole]').setAttribute('aria-pressed', 'false');
            }
            function whole() {
                mode = 'whole';
                const room = diagram.matches(':fullscreen') || diagram.classList.contains('is-expanded') ? canvas.clientHeight : Math.max(270, window.innerHeight - 250);
                place(Math.min(availableWidth(), width, room * width / height), false);
                diagram.querySelector('[data-fit]').setAttribute('aria-pressed', 'false');
                diagram.querySelector('[data-whole]').setAttribute('aria-pressed', 'true');
            }
            function zoom(change) {
                if (mode !== 'zoom') factor = (svg.getBoundingClientRect().width || width) / width;
                mode = 'zoom'; factor = Math.max(.2, Math.min(3, factor + change)); place(width * factor);
                diagram.querySelector('[data-fit]').setAttribute('aria-pressed', 'false');
                diagram.querySelector('[data-whole]').setAttribute('aria-pressed', 'false');
            }
            function expanded() { return document.fullscreenElement === diagram || diagram.classList.contains('is-expanded'); }
            function setExpanded(value) {
                setText(expandButton, value ? 'Tutup' : 'Perbesar');
                expandButton.setAttribute('aria-pressed', String(value));
                if (value) { fit(); canvas.focus(); }
            }
            function closeFallback() {
                diagram.classList.remove('is-expanded'); document.body.classList.remove('diagram-modal-open'); setExpanded(false);
            }
            expandButton.addEventListener('click', async () => {
                if (diagram.classList.contains('is-expanded')) { closeFallback(); return; }
                if (document.fullscreenElement === diagram) { await document.exitFullscreen(); return; }
                if (diagram.requestFullscreen) {
                    try { await diagram.requestFullscreen(); return; }
                    catch (_) { /* Gunakan tampilan halaman penuh jika layar penuh ditolak. */ }
                }
                diagram.classList.add('is-expanded'); document.body.classList.add('diagram-modal-open'); setExpanded(true);
            });
            document.addEventListener('fullscreenchange', () => setExpanded(expanded()));
            document.addEventListener('keydown', (event) => {
                if (event.key === 'Escape' && diagram.classList.contains('is-expanded')) { closeFallback(); expandButton.focus(); }
            });
            diagram.querySelector('[data-fit]').addEventListener('click', fit);
            diagram.querySelector('[data-whole]').addEventListener('click', whole);
            diagram.querySelector('[data-zoom-in]').addEventListener('click', () => zoom(.15));
            diagram.querySelector('[data-zoom-out]').addEventListener('click', () => zoom(-.15));
            canvas.addEventListener('keydown', (event) => {
                if (event.key === '+' || event.key === '=') { event.preventDefault(); zoom(.15); }
                if (event.key === '-') { event.preventDefault(); zoom(-.15); }
                if (event.key === '0') { event.preventDefault(); fit(); }
            });
            panButton.addEventListener('click', () => {
                pan = !pan; diagram.classList.toggle('is-panning', pan); panButton.setAttribute('aria-pressed', String(pan));
            });
            let startX = 0, startY = 0, left = 0, top = 0;
            canvas.addEventListener('pointerdown', (event) => {
                if (!pan || event.button !== 0) return;
                dragging = true; startX = event.clientX; startY = event.clientY;
                left = canvas.scrollLeft; top = canvas.scrollTop;
                diagram.classList.add('is-dragging'); canvas.setPointerCapture(event.pointerId);
            });
            canvas.addEventListener('pointermove', (event) => {
                if (!dragging) return;
                canvas.scrollLeft = left - (event.clientX - startX); canvas.scrollTop = top - (event.clientY - startY);
            });
            function stopPan() { dragging = false; diagram.classList.remove('is-dragging'); }
            canvas.addEventListener('pointerup', stopPan); canvas.addEventListener('pointercancel', stopPan);
            window.addEventListener('resize', () => { if (mode === 'fit') fit(); else if (mode === 'whole') whole(); });
            fit();
        });
    }
    function enablePng(document) {
        document.querySelectorAll('[data-png]').forEach((button) => {
            const diagram = button.closest('.section').querySelector('[data-dgm]');
            const feedback = button.closest('.section').querySelector('[data-feedback]');
            button.addEventListener('click', () => {
                const source = diagram.querySelector('svg').cloneNode(true);
                const box = diagram.querySelector('svg').viewBox.baseVal;
                source.setAttribute('width', String(box.width)); source.setAttribute('height', String(box.height));
                const blob = new Blob([new XMLSerializer().serializeToString(source)], { type: 'image/svg+xml;charset=utf-8' });
                const url = URL.createObjectURL(blob), image = new Image();
                button.disabled = true; setText(button, 'Membuat gambar…');
                feedback.classList.remove('error'); setText(feedback, 'Sedang menyiapkan gambar PNG.');
                function failed() {
                    URL.revokeObjectURL(url); button.disabled = false; setText(button, 'Unduh PNG');
                    feedback.classList.add('error'); setText(feedback, 'PNG belum dapat dibuat pada peramban ini. Silakan gunakan tombol Unduh SVG.');
                }
                image.onload = () => {
                    const ratio = Math.min(2, 16000 / Math.max(box.width, box.height));
                    const sheet = document.createElement('canvas');
                    sheet.width = Math.round(box.width * ratio); sheet.height = Math.round(box.height * ratio);
                    const brush = sheet.getContext('2d');
                    if (!brush) { failed(); return; }
                    brush.fillStyle = '#ffffff'; brush.fillRect(0, 0, sheet.width, sheet.height);
                    brush.drawImage(image, 0, 0, sheet.width, sheet.height); URL.revokeObjectURL(url);
                    sheet.toBlob((png) => {
                        if (!png) { button.disabled = false; setText(button, 'Unduh PNG'); feedback.classList.add('error'); setText(feedback, 'PNG belum dapat dibuat. Gunakan tombol Unduh SVG.'); return; }
                        const pngUrl = URL.createObjectURL(png), link = document.createElement('a');
                        link.download = button.dataset.file || `${diagram.dataset.code}.png`; link.href = pngUrl;
                        document.body.append(link); link.click(); link.remove();
                        button.disabled = false; setText(button, 'Unduh PNG'); setText(feedback, `${link.download} siap diunduh.`);
                        setTimeout(() => URL.revokeObjectURL(pngUrl), 30000);
                    }, 'image/png');
                };
                image.onerror = failed; image.src = url;
            });
        });
    }
    function run() { downloadDocument(document); enablePng(document); }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
    else run();
})();
