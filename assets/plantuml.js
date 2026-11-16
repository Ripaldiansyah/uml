/* AKC Workshop — penampil diagram UML (PlantUML).
   Menggambar setiap <pre class="puml"> menjadi gambar sungguhan (dirender di server PlantUML),
   sehingga tombol unduh SVG/PNG bekerja pada ukuran asli gambar tersebut.
   Skema encode mengikuti PlantUML: deflate mentah + Base64 varian PlantUML ("-_"). */
(function () {
    'use strict';

    var SERVER = 'https://www.plantuml.com/plantuml';
    var ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_';

    function base64(bytes) {
        var out = '';
        for (var i = 0; i < bytes.length; i += 3) {
            var n = (bytes[i] << 16) | ((bytes[i + 1] || 0) << 8) | (bytes[i + 2] || 0);
            out += ALPHABET[(n >> 18) & 63] + ALPHABET[(n >> 12) & 63] + ALPHABET[(n >> 6) & 63] + ALPHABET[n & 63];
        }
        return out;
    }

    /* Tanpa awalan: DEFLATE + Base64 varian PlantUML. Awalan "~h" berarti heksadesimal. */
    async function encode(text) {
        var input = new TextEncoder().encode(text);
        if (typeof CompressionStream === 'undefined') return '~h' + hex(input);
        var stream = new Blob([input]).stream().pipeThrough(new CompressionStream('deflate-raw'));
        var bytes = new Uint8Array(await new Response(stream).arrayBuffer());
        return base64(bytes);
    }

    /* Cadangan untuk peramban tanpa CompressionStream: PlantUML menerima heksadesimal. */
    function hex(bytes) {
        var out = '';
        for (var i = 0; i < bytes.length; i++) out += ('0' + bytes[i].toString(16)).slice(-2);
        return out;
    }

    /* SVG disisipkan langsung ke halaman (bukan lewat <img>) agar gayanya bisa
       dibaca apa adanya saat diunduh: hasilnya identik dengan yang terlihat. */
    async function render(pre) {
        var figure = pre.closest('figure');
        var heading = (pre.closest('section') || document).querySelector('h2');
        var src;
        try {
            src = SERVER + '/svg/' + await encode(pre.textContent.trim());
        } catch (err) {
            fail(pre, 'Diagram tidak dapat disiapkan.');
            return;
        }

        var res;
        try {
            res = await fetch(src);
        } catch (err) {
            fail(pre, 'Gambar diagram gagal dimuat. Periksa koneksi internet lalu muat ulang halaman.');
            return;
        }

        var markup = await res.text();
        if (!res.ok || markup.indexOf('<svg') < 0) {
            fail(pre, 'Diagram tidak dapat digambar. Periksa penulisan diagramnya.');
            return;
        }

        var doc = new DOMParser().parseFromString(markup, 'image/svg+xml');
        var svg = doc.documentElement;
        if (!svg || svg.nodeName.toLowerCase() !== 'svg') {
            fail(pre, 'Diagram tidak dapat digambar.');
            return;
        }

        svg.setAttribute('role', 'img');
        svg.setAttribute('aria-label', heading ? heading.textContent.trim() : 'Diagram UML');
        svg.removeAttribute('style');
        svg.removeAttribute('width');
        svg.removeAttribute('height');
        svg.classList.add('puml-svg');
        pre.replaceWith(document.importNode(svg, true));

        // Tombol unduh dipasang setelah gambarnya ada.
        document.dispatchEvent(new CustomEvent('diagram:ready', { detail: { figure: figure } }));
    }

    function fail(pre, message) {
        pre.textContent = message;
        pre.classList.add('puml-error');
    }

    function start() {
        document.querySelectorAll('pre.puml').forEach(render);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }
})();
