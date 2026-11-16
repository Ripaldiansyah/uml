// Pembangun SVG untuk use case, sequence (lifeline boundary), dan activity diagram.
// Diagram ditulis sendiri di sini supaya halaman bebas dependensi luar
// (tanpa PlantUML/Mermaid) dan hasil unduhan identik dengan yang terlihat.
//
// Pakai: node tools/hand-svg.mjs   (menulis ulang usecase/sequence/activity)

const INK = '#0f0e17';
const PAPER = '#fffffe';
const SOFT = '#fff1e0';
const MIST = '#a7a9be';

const esc = (s) => String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* Perkiraan lebar teks. Barlow/Inter sans rata-rata ±0.5 em untuk huruf kecil;
   huruf kapital, spasi, dan tanda baca sedikit lebih lebar. Dipakai konsisten
   oleh pembangun SVG dan penghitung rute supaya garis selalu berhenti di tepi
   bentuk, bukan di dalamnya. */
const GLYPH = { cap: 0.66, lower: 0.5, space: 0.27, punct: 0.3 };
const tw = (s, size = 13) => {
    let u = 0;
    for (const ch of String(s)) {
        if (ch === ' ') u += GLYPH.space;
        else if (/[A-Z]/.test(ch)) u += GLYPH.cap;
        else if (/[a-z]/.test(ch)) u += GLYPH.lower;
        else if (/[0-9]/.test(ch)) u += 0.56;
        else u += GLYPH.punct;
    }
    return Math.round(u * size);
};

/* Radius mendatar elips use case. Satu rumus untuk penggambar dan penghitung
   rute: separuh lebar teks + bantalan. */
const ucRx = (label) => Math.max(64, Math.round(tw(label, 12.5) / 2) + 26);
export { ucRx };

function text(x, y, s, cls = 'lb', extra = '') {
    return `<text x="${x}" y="${y}"${cls ? ` class="${cls}"` : ''}${extra}>${esc(s)}</text>`;
}

/* ---------- 1. USE CASE DIAGRAM ---------- */

/* Nama aktor ditaruh DI ATAS kepala: bagian bawah tokoh (pinggang ke kaki) tetap
   kosong sehingga garis asosiasi bisa keluar dari kaki tanpa memotong nama. */
function stick(cx, top, label) {
    const head = top + 9;
    return `${text(cx, top - 4, label, 'lb b mid')}
<circle cx="${cx}" cy="${head}" r="9"/>
<line x1="${cx}" y1="${head + 9}" x2="${cx}" y2="${head + 40}"/>
<line x1="${cx - 17}" y1="${head + 21}" x2="${cx + 17}" y2="${head + 21}"/>
<line x1="${cx}" y1="${head + 40}" x2="${cx - 15}" y2="${head + 62}"/>
<line x1="${cx}" y1="${head + 40}" x2="${cx + 15}" y2="${head + 62}"/>`;
}

export function usecaseSvg({ width, height, actors, uses, system, links = [], deps = [], gen = [], genLabel = null }, title, desc) {
    const out = [];
    out.push(`<svg viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="uct ucd">`);
    out.push(`<title id="uct">${esc(title)}</title>`);
    out.push(`<desc id="ucd">${esc(desc)}</desc>`);
    out.push(`<defs>
    <marker id="ucopen" viewBox="0 0 12 12" refX="11" refY="6" markerWidth="9" markerHeight="9" orient="auto"><path d="M1 1l9 5-9 5" fill="none" stroke="${INK}" stroke-width="1.3"/></marker>
    <marker id="ucgen" viewBox="0 0 14 12" refX="13" refY="6" markerWidth="13" markerHeight="11" orient="auto"><path d="M13 1L1 6l12 5z" fill="${PAPER}" stroke="${INK}" stroke-width="1.3"/></marker>
</defs>`);

    out.push(`<rect x="${system.x}" y="${system.y}" width="${system.w}" height="${system.h}" class="s2 fill-paper"/>`);
    out.push(text(system.x + 16, system.y + 26, system.title, 'h'));

    uses.forEach((u) => {
        // lebar elips: satu rumus dengan penghitung rute (ucRx), jadi garis berhenti tepat di tepi
        const rx = ucRx(u.label);
        out.push(`<ellipse cx="${u.x}" cy="${u.y}" rx="${rx}" ry="27" class="${u.admin ? 's fill-soft' : 's fill-paper'}"/>`);
        out.push(text(u.x, u.y + 5, u.label, 'lb mid'));
    });

    gen.forEach((k) => out.push(`<path d="${k.d}" class="gen" marker-end="url(#ucgen)"/>`));
    if (genLabel) {
        out.push(`<rect x="${Math.round(genLabel.x - genLabel.w / 2)}" y="${genLabel.y - 13}" width="${genLabel.w}" height="18" class="fill-soft" stroke="${INK}" stroke-width=".8"/>`);
        out.push(text(genLabel.x, genLabel.y, genLabel.text, 'sm mid'));
    }
    deps.forEach((k) => {
        out.push(`<path d="${k.d}" class="dep" marker-end="url(#ucopen)"/>`);
        if (k.stereo) out.push(text(k.lx, k.ly, k.stereo, 'stereo'));
    });
    // Pangkal asosiasi: garis pendek dari aktor ke kolomnya, lalu batang tegak,
    // supaya dua puluh garis tidak bertumpuk di satu titik.
    links.forEach((k) => out.push(`<path d="${k.d}" class="assoc"/>`));
    actors.forEach((k) => out.push(`<g class="actor">${stick(k.x, k.y, k.label)}</g>`));

    out.push('</svg>');
    return out.join('\n');
}

/* ---------- 3. SEQUENCE DIAGRAM — lifeline boundary/control/entity ---------- */

const KIND = {
    actor: { tag: null },
    boundary: { tag: '«boundary»' },
    control: { tag: '«control»' },
    entity: { tag: '«entity»' },
    data: { tag: '«entity»' },
};

function headBox(x, top, label, kind) {
    const w = Math.max(136, tw(label, 13) + 30);
    const out = [];
    if (kind === 'boundary') {
        // Notasi boundary UML: lingkaran + garis penghubung ke kotak kelas.
        out.push(`<circle cx="${x - w / 2 - 10}" cy="${top + 14}" r="7" class="s fill-paper"/>`);
        out.push(`<line x1="${x - w / 2 - 3}" y1="${top + 19}" x2="${x - w / 2 + 6}" y2="${top + 26}" class="s"/>`);
    }
    out.push(`<rect x="${x - w / 2 + 6}" y="${top + 18}" width="${w}" height="44" class="s fill-paper"/>`);
    out.push(`<line x1="${x - w / 2 + 6}" y1="${top + 33}" x2="${x + w / 2 + 6}" y2="${top + 33}" class="s"/>`);
    out.push(text(x + 6, top + 30, KIND[kind].tag, 'stereo mid'));
    out.push(text(x + 6, top + 53, label, 'lb b mid'));
    return out.join('\n');
}

export function sequenceSvg({ width, participants, events, uid = '' }, title, desc) {
    const headTop = 14;
    const laneTop = headTop + 92;
    const px = (id) => participants.find((p) => p.id === id).x;
    // id unik per diagram: satu halaman memuat beberapa SVG, id tidak boleh bentrok
    const arrow = `seqopen${uid}`;

    // Satu lintasan tata letak. Baris judul fragmen baru diketahui saat `endfrag`
    // (dan posisinya bergantung pada pesan di dalamnya), sedangkan pesan harus
    // mengetahui baris judul itu sebelum digambar. Karena keduanya deterministik,
    // tata letak dijalankan dua lintasan: lintasan 0 mengumpulkan baris judul,
    // lintasan 1 memakainya untuk menghindari benturan. Hasil akhir = lintasan 1.
    const pass = (knownGuards) => {
        const body = [];       // pesan
        // Chrome fragmen dipisah dua lapis agar label guard & tab selalu terbaca:
        //   back  = bingkai + tab + label guard, digambar DI BAWAH seluruh pesan;
        //   front = label guard dari pemisah `else`, digambar di atas pesan.
        // Tab/label yang hanya di lapis belakang akan tertutup pesan yang datang
        // belakangan (termasuk saat fragmen bersarang), jadi teks tab kind dan guard
        // diulang di lapis depan pada posisi yang sama.
        const fragBack = [];
        const fragFront = [];
        // Rekaman benturan dipisah menurut keperluan:
        //   guards = baris judul/tab dan label guard fragmen; label pesan tidak boleh menimpanya;
        //   placed = label pesan yang sudah diletakkan; pemisah `else` tidak boleh menimpanya.
        const guards = knownGuards;
        // label guard pada pemisah `else` berdiri di dekat garis pemisah, jadi tidak dicatat
        // di `guards` (pesan berikutnya memang berada di bawahnya); hanya dicek saat
        // memindahkan pemisah agar tidak menimpa label pesan sebelumnya
        const seps = [];
        const placed = [];
        const stack = [];      // fragmen yang sedang terbuka (boleh bersarang)
        let y = laneTop + 26;

        // tepi kotak fragmen, menjorok ke dalam bila bersarang
        const bounds = (ev) => {
            const xs = (ev.between || participants.map((p) => p.id)).map(px);
            const depth = stack.length;
            return { x1: Math.min(...xs) - 66 + depth * 14, x2: Math.max(...xs) + 66 - depth * 14 };
        };

    for (const ev of events) {
        if (ev.t === 'frag') {
            const b = bounds(ev);
            const kind = ev.kind || 'alt';
            // baris judul fragmen langsung didaftarkan: bingkai digambar di bawah
            // pesan, jadi pesan pertama tidak boleh menutupi tab/guard-nya
            const kw = tw(kind, 11.5);
            const tab = Math.max(56, kw + 26);
            stack.push({ ...b, y: y, kind: kind, guard: ev.guard || '', tab: tab });
            if (!ev.guard) guards.push([b.x1, b.x1 + tab, y, y + 18]);
            y += 30;
            continue;
        }
        if (ev.t === 'else') {
            const f = stack[stack.length - 1];
            const gl = `[${ev.guard}]`;
            const gw = tw(gl, 11.5);
            // geser pemisah ke bawah bila label guard akan menimpa label pesan sebelumnya
            let sep = y;
            for (let k = 0; k < 3; k++, sep += 20) {
                const hit = placed.some(([x1g, x2g, y1g, y2g]) => f.x1 + 10 < x2g && f.x1 + 18 + gw > x1g
                    && sep + 20 > y1g && sep + 1 < y2g);
                if (!hit) break;
            }
            body.push(`<line x1="${f.x1}" y1="${sep}" x2="${f.x2}" y2="${sep}" class="frag-sep"/>`);
            const lx = f.x1 + 14;
            const ly = sep + 16;
            fragBack.push(`<rect x="${f.x1 + 10}" y="${sep + 3}" width="${gw + 10}" height="17" class="fill-paper"/>`);
            fragBack.push(text(lx, ly, gl, 'sm b'));
            // diulang di lapis depan supaya garis pesan tidak memotong label
            fragFront.push(`<rect x="${f.x1 + 10}" y="${sep + 3}" width="${gw + 10}" height="17" class="fill-paper"/>`);
            fragFront.push(text(lx, ly, gl, 'sm b'));
            placed.push([f.x1 + 6, f.x1 + 20 + gw, sep + 2, sep + 22]);
            seps.push([f.x1 + 6, f.x1 + 20 + gw, sep + 2, sep + 22]);
            y = sep + 38;
            continue;
        }
        if (ev.t === 'endfrag') {
            const f = stack.pop();
            if (!f) continue;
            const h = y + 16 - f.y;
            const kw = tw(f.kind, 11.5);
            const tab = f.tab;
            const slant = tab - 7 - (kw + 10) >= 6 ? 7 : 0;
            const tabPath = `M${f.x1} ${f.y}h${tab}l${slant ? -slant : 0} 19h-${tab - slant}z`;
            const kx = f.x1 + 9, ky = f.y + 14;
            fragBack.push(`<g class="frag"><rect x="${f.x1}" y="${f.y}" width="${f.x2 - f.x1}" height="${h}" class="frag-box"/>`);
            fragBack.push(`<path d="${tabPath}" class="frag-tab"/>`);
            fragBack.push(`${text(kx, ky, f.kind, 'sm b k')}</g>`);
            // teks tab diulang di lapis depan: pesan yang datang belakangan tidak boleh menutupinya
            fragFront.push(`<path d="${tabPath}" class="frag-tab"/>`);
            fragFront.push(text(kx, ky, f.kind, 'sm b k'));
            if (f.guard) {
                const gl = `[${f.guard}]`;
                const gx = f.x1 + tab + 8;
                fragBack.push(`<rect x="${gx - 3}" y="${f.y + 2}" width="${tw(gl, 11.5) + 8}" height="16" class="fill-paper"/>`);
                fragBack.push(text(gx, f.y + 14, gl, 'sm b'));
                fragFront.push(`<rect x="${gx - 3}" y="${f.y + 2}" width="${tw(gl, 11.5) + 8}" height="16" class="fill-paper"/>`);
                fragFront.push(text(gx, f.y + 14, gl, 'sm b'));
                // label pesan pertama tidak boleh menimpa baris judul fragmen
                guards.push([gx - 3, gx + 5 + tw(gl, 11.5), f.y + 2, f.y + 18]);
            }
            y += 18;
            continue;
        }

        const label = (ev.n ? ev.n + '  ' : '') + ev.text;
        const selfX = ev.t === 'self' ? px(ev.at) + 12 : 0;
        const lw = tw(label, 12.5);
        // geser y sampai label (baris y-20 … y) tidak menimpa baris judul/guard fragmen mana pun.
        // Rentang baris diperiksa bertahap 20 px supaya label setinggi 17 px tidak lolos
        // di antara dua posisi periksa, dan rentang mendatar dibuat selebar mungkin karena
        // posisi akhir label baru diputuskan setelah ini.
        const avoidGuard = (x0, x1b) => {
            if (!guards.length) return 0;
            for (let row = 0; row < 8; row++) {
                const top = y - 20;
                const bottom = top + 17;
                let lowest = -Infinity;
                for (let a = top; a < bottom; a += 12) {
                    const b = Math.min(a + 12, bottom);
                    for (const [x1g, x2g, y1g, y2g] of guards) {
                        if (x1b > x1g && x0 < x2g && b > y1g && a < y2g) lowest = Math.max(lowest, y2g);
                    }
                }
                if (lowest === -Infinity) return y - (top + 20);
                // label berikutnya diletakkan 6 px di bawah guard yang dilewati
                y = lowest + 20 + 6;
            }
            return 0;
        };
        if (ev.t === 'self') {
            const x1 = px(ev.at);
            const depth = stack.length;
            const { dy: shift } = avoidGuard(selfX, selfX + lw);
            const dy = shift;
            const w = Math.min(Math.max(150, lw + 40), stack.length ? stack[stack.length - 1].x2 - x1 - 12 : 400);
            body.push(`<rect x="${selfX}" y="${y - 20 + dy}" width="${lw + 8}" height="17" class="fill-paper"/>`);
            body.push(text(x1 + 14, y - 7 + dy, label, ev.ret ? 'lb retl' : 'lb'));
            body.push(`<path d="M${x1 + 6} ${y}h${w}v26h-${w}" class="s${ev.ret ? ' ret' : ''}" marker-end="url(#${arrow})"/>`);
            placed.push([selfX, selfX + lw + 8, y - 20 + dy, y - 3 + dy]);
            y += 54 + depth * 2 + dy;
            continue;
        }
        const x1 = px(ev.from), x2 = px(ev.to);
        const dir = x2 > x1 ? 1 : -1;
        // bila label baris ini menutupi guard, pesan ikut turun bersama labelnya.
        // avoidGuard() menggeser y secara langsung, jadi pergeseran tidak ditambahkan lagi.
        avoidGuard(Math.min(x1, x2) - lw / 2, Math.max(x1, x2) + lw / 2);
        // label digambar lebih dulu: elemen berikutnya (garis pesan, pemisah fragmen)
        // selalu berada di atas latar label, jadi tidak ada garis yang tertutup
        const box = (lx2) => [
            `<rect x="${lx2 - lw / 2 - 4}" y="${y - 20}" width="${lw + 8}" height="17" class="fill-paper"/>`,
            text(lx2, y - 7, label, `${ev.ret ? 'lb retl' : 'lb'} mid`),
        ].join('\n');
        const f = stack[stack.length - 1];
        const lo = Math.min(x1, x2) + 8, hi = Math.max(x1, x2) - 8;
        const clash = (c) => {
            const a = c - lw / 2 - 4, b = c + lw / 2 + 4;
            return !!f && b > f.x1 - 6 && a < f.x1 + 6;
        };
        const fit = (c) => c - lw / 2 >= lo && c + lw / 2 <= hi;
        const mid = (x1 + x2) / 2;
        const cands = [mid];
        if (f) {
            const s = f.x1;
            // sisi yang searah panah dicoba lebih dulu agar label tidak "melompat" ke belakang
            const near = x2 > x1 ? [s + 10 + lw / 2, s - 10 - lw / 2] : [s - 10 - lw / 2, s + 10 + lw / 2];
            cands.push(...near);
        }
        // geser bertahap menjauhi tulang bingkai sampai tidak ada benturan
        const nudge = x2 > x1
            ? [10, 24, 38, 52, 66].map((d) => (f ? f.x1 + d + lw / 2 : NaN))
            : [-10, -24, -38, -52, -66].map((d) => (f ? f.x1 + d - lw / 2 : NaN));
        cands.push(...nudge);
        let lx = cands.find((c) => Number.isFinite(c) && fit(c) && !clash(c));
        if (lx === undefined) {
            // tidak muat di antara peserta: taruh di sisi terjauh dari tulang bingkai
            lx = x2 > x1 ? Math.min(hi - lw / 2, x2 - lw / 2) : Math.max(lo + lw / 2, x2 + lw / 2);
        }
        body.push(box(lx));
        body.push(`<line x1="${x1 + dir * 8}" y1="${y}" x2="${x2 - dir * 8}" y2="${y}" class="s${ev.ret ? ' ret' : ''}" marker-end="url(#${arrow})"/>`);
        placed.push([lx - lw / 2 - 4, lx + lw / 2 + 4, y - 20, y - 3]);
        y += 34;
        }
        return { body, fragBack, fragFront, guards, seps, laneBottom: y - 8 };
    };

    // Lintasan 0 mengumpulkan baris judul fragmen; lintasan 1 menghindarinya.
    // Lintasan 1 bisa memunculkan baris judul baru (pesan bergeser → fragmen bergeser),
    // jadi diulang sampai baris judul stabil, maksimal 4 lintasan.
    let guards = [];
    let layout = pass(guards.slice());
    for (let round = 0; round < 3; round++) {
        const next = layout.guards;
        if (next.length === guards.length && next.every((g, i) => g.join() === guards[i].join())) break;
        guards = next.slice();
        layout = pass(guards.slice());
    }
    const { body, fragBack, fragFront, laneBottom } = layout;

    const out = [];
    out.push(`<svg viewBox="0 0 ${width} ${laneBottom + 96}" role="img" aria-labelledby="sqt${uid} sqd${uid}">`);
    out.push(`<title id="sqt${uid}">${esc(title)}</title>`);
    out.push(`<desc id="sqd${uid}">${esc(desc)}</desc>`);
    out.push(`<defs><marker id="${arrow}" viewBox="0 0 12 12" refX="11" refY="6" markerWidth="9" markerHeight="9" orient="auto"><path d="M1 1l9 5-9 5" fill="${INK}" stroke="${INK}" stroke-width="1"/></marker></defs>`);
    participants.forEach((p) => out.push(`<line x1="${p.x}" y1="${laneTop}" x2="${p.x}" y2="${laneBottom}" class="life"/>`));
    out.push(fragBack.join('\n'));
    out.push(body.join('\n'));
    out.push(fragFront.join('\n'));
    participants.forEach((p) => {
        if (p.kind === 'actor') {
            out.push(`<g class="actor">${stick(p.x, headTop + 2, p.label)}</g>`);
            out.push(`<g class="actor">${stick(p.x, laneBottom + 22, p.label)}</g>`);
        } else {
            out.push(headBox(p.x, headTop, p.label, p.kind));
            out.push(headBox(p.x, laneBottom + 16, p.label, p.kind));
        }
    });
    out.push('</svg>');
    return out.join('\n');
}


function edgePath(a, b) {
    const y1 = b.y > a.y ? a.y + (a.h || 22) / 2 : a.y - (a.h || 22) / 2;
    const y2 = b.y > a.y ? b.y - (b.h || 22) / 2 : b.y + (b.h || 22) / 2;
    if (Math.abs(a.x - b.x) < 1) return `M${a.x} ${y1}L${b.x} ${y2}`;
    const my = (y1 + y2) / 2;
    return `M${a.x} ${y1}L${a.x} ${my}L${b.x} ${my}L${b.x} ${y2}`;
}

export function activitySvg({ width, height, lanes = [], nodes, edges }, title, desc) {
    const by = {};
    nodes.forEach((n) => { by[n.id] = n; });
    const out = [];
    out.push(`<svg viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="act actd">`);
    out.push(`<title id="act">${esc(title)}</title>`);
    out.push(`<desc id="actd">${esc(desc)}</desc>`);
    out.push(`<defs><marker id="arrown" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="9" markerHeight="9" orient="auto"><path d="M1 1l9 5-9 5" fill="none" stroke="${INK}" stroke-width="1.4"/></marker></defs>`);

    lanes.forEach((l) => {
        out.push(`<rect x="${l.x}" y="${l.y}" width="${l.w}" height="${l.h}" class="lane"/>`);
        out.push(`<rect x="${l.x}" y="${l.y}" width="${l.w}" height="30" class="band"/>`);
        out.push(text(l.x + l.w / 2, l.y + 21, l.label, 'lb b mid'));
        out.push(`<rect x="${l.x}" y="${l.y}" width="${l.w}" height="${l.h}" class="s2"/>`);
    });

    edges.forEach((e) => {
        const a = by[e.from], b = by[e.to];
        if (!a || !b) return;
        out.push(`<path d="${e.path || edgePath(a, b)}" class="s" marker-end="url(#arrown)"/>`);
        if (e.label) {
            const lx = e.lx ?? (a.x + b.x) / 2;
            const ly = e.ly ?? (a.y + b.y) / 2;
            const w = tw(e.label, 11.5) + 14;
            out.push(`<rect x="${lx - w / 2}" y="${ly - 12}" width="${w}" height="17" class="fill-paper"/>`);
            out.push(text(lx, ly, e.label, 'sm mid'));
        }
    });

    nodes.forEach((n) => {
        if (n.t === 'start') {
            out.push(`<circle cx="${n.x}" cy="${n.y}" r="11" class="fill-ink"/>`);
        } else if (n.t === 'end') {
            out.push(`<circle cx="${n.x}" cy="${n.y}" r="13" class="s2 fill-paper"/><circle cx="${n.x}" cy="${n.y}" r="8" class="fill-ink"/>`);
        } else if (n.t === 'dec') {
            out.push(`<path d="M${n.x} ${n.y - n.h / 2}L${n.x + n.w / 2} ${n.y}L${n.x} ${n.y + n.h / 2}L${n.x - n.w / 2} ${n.y}Z" class="s fill-soft"/>`);
            const lines = n.label;
            lines.forEach((line, i) => out.push(text(n.x, n.y + 5 + (i - (lines.length - 1) / 2) * 15, line, 'lb mid')));
        } else {
            out.push(`<rect x="${n.x - n.w / 2}" y="${n.y - n.h / 2}" width="${n.w}" height="${n.h}" rx="14" class="s fill-paper"/>`);
            const lines = n.label;
            lines.forEach((line, i) => out.push(text(n.x, n.y + 5 + (i - (lines.length - 1) / 2) * 16, line, 'lb mid')));
        }
    });

    out.push('</svg>');
    return out.join('\n');
}
