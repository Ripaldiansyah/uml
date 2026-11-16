/* AKC Workshop — dokumen UML: unduh gambar, zoom, penanda daftar isi aktif. */
(function () {
    'use strict';

    var INK = '#0f0e17';
    var PAPER = '#fffffe';

    function slug(text) {
        return String(text).toLowerCase()
            .replace(/&amp;/g, 'dan').replace(/&/g, 'dan')
            .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'gambar';
    }

    function saveBlob(blob, name) {
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
    }

    /* ---------- ekspor: hasil unduhan harus utuh, termasuk teks ---------- */

    /* Warna & gaya ditulis langsung ke atribut presentasi supaya hasil unduhan
       tampil sama di aplikasi apa pun, tanpa bergantung stylesheet halaman. */
    var INLINE_PROPS = [
        'fill', 'fill-opacity', 'fill-rule', 'stroke', 'stroke-width', 'stroke-opacity',
        'stroke-dasharray', 'stroke-dashoffset', 'stroke-linecap', 'stroke-linejoin',
        'opacity', 'font-family', 'font-size', 'font-weight', 'font-style',
        'text-anchor', 'dominant-baseline', 'visibility', 'paint-order'
    ];

    /* Wadah di <defs> tidak boleh menerima gaya warisan. Bila font-size atau
       stroke-width ditulis pada <marker>, peramban menghitung ulang ruang
       koordinat marker (markerUnits="strokeWidth") sehingga panah meleset jauh. */
    var NO_INLINE = /^(defs|marker|symbol|clipPath|mask|pattern|linearGradient|radialGradient|filter)$/;

    /* Tiru cascade SVG: nilai kosong / 'inherit' tidak boleh menimpa induk.
       Penting: dijalankan pada elemen yang masih menempel di halaman, karena
       getComputedStyle() hanya memberi nilai pada simpul yang sedang dirender. */
    function inlineStyles(root) {
        root.querySelectorAll('*').forEach(function (el) {
            if (NO_INLINE.test(el.tagName)) return;
            var cs;
            try { cs = getComputedStyle(el); } catch (e) { return; }
            if (!cs) return;
            INLINE_PROPS.forEach(function (prop) {
                var value = cs.getPropertyValue(prop);
                if (!value || value === 'inherit' || value === 'initial' || value === 'normal') return;
                if (prop === 'fill' && /^(none|rgba\(0, 0, 0, 0\))$/.test(value)) {
                    el.setAttribute('fill', 'none');
                    return;
                }
                if (prop === 'stroke' && /^rgba\(0, 0, 0, 0\)$/.test(value)) return;
                // Satuan "px" tidak sah di dalam SVG (mis. marker: stroke-width="1.3px"),
                // dan Chrome membuang atribut yang tidak sah saat gambar dibuka.
                el.setAttribute(prop, value.replace(/(\d)px\b/g, '$1'));
            });
        });
        return root;
    }

    function prepareSvg(svg) {
        // 1) tulis gaya nyata ke SVG asli (masih terpasang di halaman),
        // 2) baru digandakan. Gaya hasil inline inilah yang terbawa saat diunduh.
        inlineStyles(svg);

        var clone = svg.cloneNode(true);
        clone.querySelectorAll('.no-export').forEach(function (n) { n.remove(); });

        var box = clone.getAttribute('viewBox') || '';
        var parts = box.split(/[\s,]+/).map(Number);
        var width = parts.length === 4 ? parts[2] : parseFloat(clone.getAttribute('width')) || 800;
        var height = parts.length === 4 ? parts[3] : parseFloat(clone.getAttribute('height')) || 600;
        if (parts.length !== 4) {
            box = '0 0 ' + width + ' ' + height;
            clone.setAttribute('viewBox', box);
        }
        clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
        clone.setAttribute('width', width);
        clone.setAttribute('height', height);

        var bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        bg.setAttribute('x', String(parts[0] || 0));
        bg.setAttribute('y', String(parts[1] || 0));
        bg.setAttribute('width', width);
        bg.setAttribute('height', height);
        bg.setAttribute('fill', PAPER);
        clone.insertBefore(bg, clone.firstChild);

        return { root: clone, xml: '<?xml version="1.0" encoding="UTF-8"?>\n' + new XMLSerializer().serializeToString(clone), width: width, height: height };
    }

    function downloadSvg(svg, name) {
        saveBlob(new Blob([prepareSvg(svg).xml], { type: 'image/svg+xml;charset=utf-8' }), name + '.svg');
    }

    /* SVG dimuat lewat <img> (bukan disisipkan ke halaman) agar peramban
       merendernya mandiri: tidak ada gaya halaman maupun huruf global yang bocor. */
    function downloadPng(svg, name) {
        var out = prepareSvg(svg);
        var scale = 2;
        var img = new Image();
        img.onload = function () {
            var canvas = document.createElement('canvas');
            canvas.width = Math.round(out.width * scale);
            canvas.height = Math.round(out.height * scale);
            var ctx = canvas.getContext('2d');
            ctx.fillStyle = PAPER;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            canvas.toBlob(function (blob) {
                if (blob) saveBlob(blob, name + '.png');
                else downloadSvg(svg, name);
            }, 'image/png');
        };
        img.onerror = function () { downloadSvg(svg, name); };
        img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(out.xml);
    }

    /* ---------- rancangan layar: HTML disaring menjadi gambar ---------- */

    /* Salin seluruh deklarasi gaya yang berlaku (getComputedStyle) ke atribut style. */
    function copyComputedStyles(srcRoot, copyRoot) {
        var originals = [srcRoot].concat([].slice.call(srcRoot.querySelectorAll('*')));
        var copies = [copyRoot].concat([].slice.call(copyRoot.querySelectorAll('*')));
        var skip = { 'css-text': 1, 'parent-rule': 1, 'transition': 1, 'animation': 1 };

        copies.forEach(function (copy, i) {
            var src = originals[i];
            if (!src) return;
            var cs = getComputedStyle(src);
            var decl = [];
            for (var k = 0; k < cs.length; k++) {
                var prop = cs[k];
                if (skip[prop] || prop.indexOf('--') === 0) continue;
                decl.push(prop + ':' + cs.getPropertyValue(prop));
            }
            copy.setAttribute('style', decl.join(';'));
        });
    }

    /* Rancangan layar adalah HTML, jadi dirender ke SVG lewat <foreignObject>,
       lalu diunduh sebagai PNG (atau SVG bila diinginkan). */
    function serializeElement(el) {
        var rect = el.getBoundingClientRect();
        var width = Math.ceil(rect.width);
        var height = Math.ceil(rect.height);

        var clone = el.cloneNode(true);
        copyComputedStyles(el, clone);
        clone.setAttribute('style', 'margin:0;width:' + width + 'px;height:' + height + 'px;background:' + PAPER);

        var xhtml = new XMLSerializer().serializeToString(clone);
        var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + width + '" height="' + height
            + '" viewBox="0 0 ' + width + ' ' + height + '">'
            + '<foreignObject x="0" y="0" width="' + width + '" height="' + height + '">' + xhtml + '</foreignObject></svg>';

        return { xml: '<?xml version="1.0" encoding="UTF-8"?>\n' + svg, width: width, height: height };
    }

    function downloadElementPng(el, name) {
        var out = serializeElement(el);
        var scale = 2;
        var img = new Image();
        img.onload = function () {
            var canvas = document.createElement('canvas');
            canvas.width = out.width * scale;
            canvas.height = out.height * scale;
            var ctx = canvas.getContext('2d');
            ctx.fillStyle = PAPER;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            canvas.toBlob(function (blob) {
                if (blob) saveBlob(blob, name + '.png');
            }, 'image/png');
        };
        img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(out.xml);
    }

    function downloadElementSvg(el, name) {
        saveBlob(new Blob([serializeElement(el).xml], { type: 'image/svg+xml;charset=utf-8' }), name + '.svg');
    }

    /* Tombol unduh + zoom per gambar */
    function buildBar(figure, getSvg) {
        var heading = figure.closest('section') && figure.closest('section').querySelector('h2');
        var label = heading ? heading.textContent.replace(/^[A-Z]-\d+\s*·\s*/, '').trim() : '';
        var name = slug(figure.getAttribute('data-name') || label || 'gambar');

        var bar = document.createElement('div');
        bar.className = 'dgm-bar no-export';

        var tag = document.createElement('span');
        tag.className = 'dgm-name';
        tag.textContent = name + '.svg';
        bar.appendChild(tag);

        var ico = {
            svg: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 2v8M5 7l3 3 3-3M3 13h10"/></svg>',
            png: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="3" width="12" height="10"/><path d="M2 11l3-3 3 3 2-2 3 3"/><circle cx="11" cy="6" r="1"/></svg>',
            zoom: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="7" cy="7" r="4"/><path d="M10 10l4 4M5 7h4M7 5v4"/></svg>'
        };

        function mkButton(label, icon, onClick, pressed) {
            var b = document.createElement('button');
            b.type = 'button';
            b.innerHTML = (icon || '') + '<span>' + label + '</span>';
            if (pressed !== undefined) b.setAttribute('aria-pressed', String(pressed));
            b.addEventListener('click', onClick);
            return b;
        }

        function ready(fn) {
            return function () {
                var target = getSvg();
                if (target) fn(target);
            };
        }

        bar.appendChild(mkButton('SVG', ico.svg, ready(function (target) {
            if (target.nodeName.toLowerCase() === 'svg') downloadSvg(target, name);
            else downloadElementSvg(target, name);
        })));
        bar.appendChild(mkButton('PNG', ico.png, ready(function (target) {
            if (target.nodeName.toLowerCase() === 'svg') downloadPng(target, name);
            else downloadElementPng(target, name);
        })));

        var sep = document.createElement('span');
        sep.className = 'dgm-sep';
        bar.appendChild(sep);

        var zoom = mkButton('Ukuran pas', ico.zoom, function () {
            var full = figure.classList.toggle('is-full');
            zoom.setAttribute('aria-pressed', String(full));
            zoom.querySelector('span').textContent = full ? 'Kembali pas' : 'Ukuran pas';
        }, false);
        bar.appendChild(zoom);

        figure.classList.add('dgm');
        figure.insertBefore(bar, figure.firstChild);
    }

    function initFigures() {
        document.querySelectorAll('figure.drawing, figure.dgm').forEach(arm);

        // Rancangan layar berbentuk HTML: toolbar dipasang di atas wireframe.
        document.querySelectorAll('.sheet-body .wf').forEach(function (wf) {
            if (wf.previousElementSibling && wf.previousElementSibling.classList.contains('dgm-bar')) return;
            var bar = document.createElement('div');
            bar.className = 'dgm-bar dgm-bar--wf no-export';
            wf.parentNode.insertBefore(bar, wf);

            var name = wf.getAttribute('data-name') || slug(
                (wf.closest('section') || document).querySelector('h2').textContent
            );
            buildBarInto(bar, wf, name);
            wf.parentNode.classList.add('dgm', 'dgm--wf');
        });
    }

    /* Isi toolbar untuk satu elemen (gambar SVG atau wireframe HTML). */
    function buildBarInto(bar, target, name) {
        var tag = document.createElement('span');
        tag.className = 'dgm-name';
        tag.textContent = name + '.png';
        bar.appendChild(tag);

        var ico = {
            svg: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 2v8M5 7l3 3 3-3M3 13h10"/></svg>',
            png: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="3" width="12" height="10"/><path d="M2 11l3-3 3 3 2-2 3 3"/><circle cx="11" cy="6" r="1"/></svg>'
        };

        [['SVG', ico.svg, downloadElementSvg], ['PNG', ico.png, downloadElementPng]].forEach(function (spec) {
            var b = document.createElement('button');
            b.type = 'button';
            b.innerHTML = spec[1] + '<span>' + spec[0] + '</span>';
            b.addEventListener('click', function () { spec[2](target, name); });
            bar.appendChild(b);
        });
    }

    function arm(figure) {
        if (figure.querySelector('.dgm-bar')) return;
        // Abaikan ikon di dalam toolbar: yang diekspor harus gambar diagramnya.
        buildBar(figure, function () {
            return figure.querySelector(':scope > svg, .dgm-stage > svg');
        });
    }

    // Diagram PlantUML baru muncul setelah gambarnya diambil; pasang tombol saat itu.
    document.addEventListener('diagram:ready', function (ev) {
        if (ev.detail && ev.detail.figure) arm(ev.detail.figure);
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFigures);
    } else {
        initFigures();
    }


    if (window.mermaid) {
        mermaid.initialize({
            startOnLoad: true,
            theme: 'base',
            securityLevel: 'strict',
            fontFamily: 'Barlow, "Segoe UI", system-ui, sans-serif',
            themeVariables: {
                fontSize: '14px',
                primaryColor: '#fffffe',
                primaryTextColor: '#0f0e17',
                primaryBorderColor: '#0f0e17',
                secondaryColor: '#fff1e0',
                tertiaryColor: '#f2f1ec',
                lineColor: '#0f0e17',
                textColor: '#0f0e17',
                noteBkgColor: '#fff1e0',
                noteBorderColor: '#ff8906',
                noteTextColor: '#0f0e17',
                actorBkg: '#0f0e17',
                actorTextColor: '#fffffe',
                actorBorder: '#0f0e17',
                actorLineColor: '#a7a9be',
                signalColor: '#0f0e17',
                signalTextColor: '#0f0e17',
                labelBoxBkgColor: '#ff8906',
                labelBoxBorderColor: '#0f0e17',
                labelTextColor: '#0f0e17',
                loopTextColor: '#0f0e17',
                activationBkgColor: '#fff1e0',
                activationBorderColor: '#0f0e17',
                sequenceNumberColor: '#fffffe',
                clusterBkg: '#f2f1ec',
                clusterBorder: '#a7a9be',
                edgeLabelBackground: '#fffffe'
            },
            flowchart: { curve: 'linear', htmlLabels: true, nodeSpacing: 34, rankSpacing: 42, useMaxWidth: true },
            sequence: { mirrorActors: false, showSequenceNumbers: true, actorMargin: 46, messageMargin: 34, useMaxWidth: true, wrap: true },
            class: { useMaxWidth: true }
        });
    }

    // Tandai entri daftar isi untuk lembar yang sedang terlihat
    var links = document.querySelectorAll('.toc a[href^="#"]');
    if (!links.length || !('IntersectionObserver' in window)) return;
    var byId = {};
    links.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
            if (!en.isIntersecting) return;
            links.forEach(function (a) { a.classList.remove('is-active'); a.removeAttribute('aria-current'); });
            var a = byId[en.target.id];
            if (a) { a.classList.add('is-active'); a.setAttribute('aria-current', 'true'); }
        });
    }, { rootMargin: '-20% 0px -70% 0px' });
    Object.keys(byId).forEach(function (id) {
        var el = document.getElementById(id);
        if (el) io.observe(el);
    });
})();
