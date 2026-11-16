// Model bersama untuk gambar pada halaman dan berkas Draw.io.
// Setiap bentuk dan garis tetap menjadi objek yang dapat dipilih dan diedit.
export const COLORS = {
    ink: '#333333', blue: '#dae8fc', blueLine: '#6c8ebf',
    orange: '#ffe6cc', orangeLine: '#d79b00', green: '#d5e8d4',
    greenLine: '#82b366', red: '#f8cecc', redLine: '#b85450',
    gray: '#f5f5f5', grayLine: '#666666', white: '#ffffff',
};

export const xml = (value) => String(value ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&apos;');
export const plain = (value) => String(value ?? '').replace(/<[^>]*>/g, '');

export function scene(id, title, width, height) {
    return { id, title, width, height, shapes: [], edges: [] };
}

export function node(s, id, kind, x, y, w, h, label = '', options = {}) {
    const shape = { id, kind, x, y, w, h, label, ...options };
    s.shapes.push(shape);
    return shape;
}
export const text = (s, id, x, y, w, h, label, options = {}) =>
    node(s, id, 'text', x, y, w, h, label, options);
export const action = (s, id, x, y, w, label, options = {}) =>
    node(s, id, 'action', x, y, w, 58, label, options);
export const decision = (s, id, x, y, w, label) =>
    node(s, id, 'decision', x, y, w, 88, label);
export const start = (s, id, x, y) => node(s, id, 'start', x, y, 22, 22);
export const end = (s, id, x, y) => node(s, id, 'end', x, y, 26, 26);

export function port(shape, side) {
    const { x, y, w, h } = shape;
    if (side === 'left') return { x, y: y + h / 2, side };
    if (side === 'right') return { x: x + w, y: y + h / 2, side };
    if (side === 'top') return { x: x + w / 2, y, side };
    return { x: x + w / 2, y: y + h, side: 'bottom' };
}

/** Sambungkan dua bentuk, dengan jalur siku-siku bila diperlukan. */
export function connect(s, id, from, to, label = '', options = {}) {
    const source = s.shapes.find((n) => n.id === from);
    const target = to ? s.shapes.find((n) => n.id === to) : null;
    if (!source || (to && !target)) throw new Error(`${s.id}: garis ${id} tidak menemukan bentuk ${from}/${to}`);
    let sides = options.sides;
    if (!sides && target) {
        const dx = target.x - source.x, dy = target.y - source.y;
        sides = Math.abs(dy) > 30 || Math.abs(dx) < 10
            ? (dy >= 0 ? ['bottom', 'top'] : ['top', 'bottom'])
            : (dx >= 0 ? ['right', 'left'] : ['left', 'right']);
    }
    sides ||= ['bottom', 'top'];
    const a = port(source, sides[0]);
    const b = target ? port(target, sides[1]) : { x: options.x2, y: options.y2 };
    if (b.side === undefined && target) b.side = sides[1];
    let points = options.points || [];
    if (!points.length && target && a.side !== b.side) {
        if (a.side === 'bottom' || a.side === 'top') {
            const middle = options.middle ?? (a.y + b.y) / 2;
            points = [{ x: a.x, y: middle }, { x: b.x, y: middle }];
        } else {
            const middle = options.middle ?? (a.x + b.x) / 2;
            points = [{ x: middle, y: a.y }, { x: middle, y: b.y }];
        }
    }
    s.edges.push({ id, from, to, label, a, b, points,
        arrow: options.arrow || 'block', dashed: !!options.dashed,
        labelX: options.labelX, labelY: options.labelY,
        color: options.color, width: options.width });
    return s.edges.at(-1);
}

export function lanes(s, names, height) {
    const width = 540;
    names.forEach((name, index) => node(s, `lane${index}`, 'lane', 20 + index * (width + 20), 20, width, height - 40, name));
    return names.map((_, i) => ({ left: 40 + i * (width + 20), center: 290 + i * (width + 20), right: 500 + i * (width + 20) }));
}

// Pengganti bingkai alt/loop/opt UML 2.5: setiap pesan memiliki syaratnya sendiri.
export function legacyMessages(events) {
    const stack = [];
    const messages = [];
    for (const event of events) {
        if (event.t === 'frag') {
            stack.push({ kind: event.kind, guard: null });
        } else if (event.t === 'else') {
            stack.at(-1).guard = event.guard;
        } else if (event.t === 'endfrag') {
            stack.pop();
        } else {
            if (stack.length && stack.at(-1).guard === null) stack.at(-1).guard = stack.at(-1).kind === 'loop' ? 'pengulangan pertama' : '';
            const conditions = stack.filter((f) => f.guard).map((f) => `${f.kind === 'loop' ? 'Selama' : 'Jika'} ${f.guard}`);
            messages.push({ ...event, condition: conditions.join(' dan ') });
        }
    }
    return messages;
}
