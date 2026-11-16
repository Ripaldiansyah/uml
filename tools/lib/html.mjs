import { xml } from './scene.mjs';
import { sceneSvg } from './render.mjs';
export const h = xml;

export function codeFor(s) {
    if (/^s\d\d$/.test(s.id)) return `S-${s.id.slice(1)}`;
    if (s.id === 'usecase') return 'D-01';
    return s.id === 'class' ? 'C-01' : s.id;
}
export function table(headers, rows) {
    return `<div class="table-wrap"><table class="plain-table"><thead><tr>${headers.map((x) => `<th scope="col">${h(x)}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((x) => `<td>${h(x)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
export function scenarios(rows) { return table(['Situasi', 'Yang terjadi', 'Hal yang perlu diperhatikan'], rows); }
export function steps(items) { return `<ol class="steps">${items.map((x) => `<li>${h(x)}</li>`).join('')}</ol>`; }

export function figure(s) {
    const id = codeFor(s);
    return `<figure class="diagram" data-dgm data-code="${id}">
<div class="dgm-toolbar"><span class="dgm-label">Gambar ${id} · dapat disunting</span><div class="dgm-tools">
<button class="btn" type="button" data-zoom-out aria-label="Perkecil gambar" title="Perkecil gambar">−</button>
<output class="zoom-number" data-zoom-label aria-live="polite">Pas</output>
<button class="btn" type="button" data-zoom-in aria-label="Perbesar gambar" title="Perbesar gambar">+</button>
<button class="btn" type="button" data-fit aria-pressed="true" title="Sesuaikan lebar gambar dengan halaman">Lebar halaman</button>
<button class="btn" type="button" data-whole aria-pressed="false" title="Tampilkan seluruh gambar dalam satu layar">Satu layar</button>
<button class="btn" type="button" data-pan aria-pressed="false" title="Aktifkan geser gambar dengan mouse atau sentuhan">Geser</button>
<button class="btn" type="button" data-expand aria-pressed="false" title="Buka gambar sebesar layar">Perbesar</button>
</div></div>
<div class="diagram-canvas" data-canvas tabindex="0" aria-label="Pratinjau ${h(s.title)}; gunakan tombol pengatur ukuran untuk membaca." aria-describedby="${id}-caption">${sceneSvg(s)}</div>
<figcaption id="${id}-caption" class="diagram-foot"><span>${h(s.description)}</span><span><a href="assets/diagrams/${id}.svg" download="${id}.svg">Unduh SVG</a> · <a href="drawio/${id}.drawio" download="${id}.drawio">Sunting di Draw.io</a></span></figcaption></figure>
<div class="action-row"><button class="btn btn-primary" type="button" data-png data-file="${id}.png">Unduh PNG</button><a class="btn" href="assets/diagrams/${id}.svg" target="_blank" rel="noopener">Buka gambar di tab baru ↗</a></div><p class="dgm-feedback" data-feedback role="status" aria-live="polite"></p>`;
}
export function section(id, code, title, content) {
    return `<section class="section" id="${id}"><div class="section-head"><h2>${h(title)}</h2><span class="sheet-code">Lembar ${code}</span></div>${content}</section>`;
}
export function page({ title, subtitle, active, toc, sections }) {
    const nav = [['index', 'Ringkasan', 'index.html'], ['activity', 'Aktivitas', 'activity-diagram.html'], ['sequence', 'Urutan pesan', 'sequence-diagram.html'], ['usecase', 'Kasus penggunaan', 'usecase-diagram.html'], ['class-diagram', 'Diagram kelas', 'class-diagram.html']];
    return `<!doctype html>
<html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="${h(subtitle)}"><title>${h(title)} · AKC Workshop</title><link rel="icon" type="image/svg+xml" href="../assets/images/favicon.svg"><link rel="stylesheet" href="assets/documentation.css"><script defer src="assets/documentation.js"></script></head>
<body><header class="topbar"><div class="topbar-inner"><a class="brand" href="index.html"><img src="../assets/images/logo-bengkel-800.jpg" alt="AKC Workshop"><span>AKC Workshop<small>DOKUMENTASI ALUR KERJA BENGKEL</small></span></a><nav class="topnav" aria-label="Halaman dokumentasi">${nav.map(([id, label, href]) => `<a href="${href}"${active === id ? ' aria-current="page"' : ''}>${label}</a>`).join('')}</nav></div></header>
<div class="hero"><div class="hero-inner"><span class="eyebrow">Dokumentasi AKC Workshop</span><h1>${h(title)}</h1><p>${h(subtitle)}</p><span class="badge">Notasi UML klasik</span><span class="badge">Bahasa Indonesia sehari-hari</span><span class="badge">Dapat disunting di Draw.io</span></div></div>
<div class="page-shell"><aside class="toc"><nav aria-label="Daftar isi"><h2>Daftar isi</h2><ol>${toc.map(([id, label], i) => `<li><a href="#${id}"><span class="toc-count">${String(i + 1).padStart(2, '0')}</span>${h(label)}</a></li>`).join('')}</ol></nav></aside><main class="sheet">${sections.join('')}</main></div>
<footer class="footer"><span><strong>AKC Workshop</strong> · Dokumentasi alur kerja dan informasi bengkel.</span><a href="index.html">Kembali ke ringkasan</a></footer></body></html>
`;
}
