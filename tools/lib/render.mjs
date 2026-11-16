import { COLORS, xml } from './scene.mjs';

function wrapLines(value, width, size) {
    const result = [];
    for (const part of String(value || '').split('\n')) {
        let line = '';
        for (const word of part.split(/\s+/)) {
            const candidate = line ? `${line} ${word}` : word;
            if (line && candidate.length * size * 0.52 > width) {
                result.push(line); line = word;
            } else line = candidate;
        }
        result.push(line);
    }
    return result.filter((_, i, a) => a.length > 1 || i === 0);
}
function svgText(x, y, label, options = {}) {
    const size = options.size || 12, lines = wrapLines(label, options.width || 500, size);
    const height = size * 1.25;
    const anchor = options.align === 'left' ? 'start' : options.align === 'right' ? 'end' : 'middle';
    return `<text x="${x}" y="${y}" fill="${options.color || COLORS.ink}" font-family="Arial, Helvetica, sans-serif" font-size="${size}" font-weight="${options.bold ? '700' : '400'}"${options.underline ? ' text-decoration="underline"' : ''} text-anchor="${anchor}">${lines.map((line, i) => `<tspan x="${x}" dy="${i ? height : 0}">${xml(line)}</tspan>`).join('')}</text>`;
}
function centeredText(n, options = {}) {
    const lines = wrapLines(n.label, n.w - 18, options.size || 12);
    const y = n.y + n.h / 2 - (lines.length - 1) * 7.5 + 4;
    return svgText(n.x + n.w / 2, y, n.label, { width: n.w - 18, ...options });
}
function palette(n) {
    const tone = n.tone || 'blue';
    return { fill: COLORS[tone] || COLORS.white, stroke: COLORS[`${tone}Line`] || COLORS.blueLine };
}

function drawNode(n) {
    const { fill, stroke } = palette(n);
    const center = n.x + n.w / 2;
    if (n.kind === 'lane') {
        return `<rect x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" fill="${COLORS.white}" stroke="#999999"/><rect x="${n.x}" y="${n.y}" width="${n.w}" height="34" fill="${COLORS.gray}" stroke="#999999"/>${svgText(center, n.y + 22, n.label, { bold: true, size: 13 })}`;
    }
    if (n.kind === 'start') return `<circle cx="${center}" cy="${n.y + 11}" r="10" fill="${COLORS.ink}" stroke="${COLORS.ink}"/>`;
    if (n.kind === 'end') return `<circle cx="${center}" cy="${n.y + 13}" r="12" fill="${COLORS.white}" stroke="${COLORS.ink}" stroke-width="2"/><circle cx="${center}" cy="${n.y + 13}" r="7" fill="${COLORS.ink}"/>`;
    if (n.kind === 'decision') {
        return `<path d="M${center} ${n.y}L${n.x + n.w} ${n.y + n.h / 2}L${center} ${n.y + n.h}L${n.x} ${n.y + n.h / 2}Z" fill="${COLORS.orange}" stroke="${COLORS.orangeLine}" stroke-width="1.3"/>${centeredText(n, { size: 11 })}`;
    }
    if (n.kind === 'ellipse') return `<ellipse cx="${center}" cy="${n.y + n.h / 2}" rx="${n.w / 2}" ry="${n.h / 2}" fill="${fill}" stroke="${stroke}" stroke-width="1.3"/>${centeredText(n)}`;
    if (n.kind === 'actor') {
        return `<g fill="none" stroke="${COLORS.ink}" stroke-width="1.4"><circle cx="${center}" cy="${n.y + 8}" r="7"/><path d="M${center} ${n.y + 15}V${n.y + 38}M${n.x + 4} ${n.y + 23}H${n.x + n.w - 4}M${center} ${n.y + 38}L${n.x + 7} ${n.y + 56}M${center} ${n.y + 38}L${n.x + n.w - 7} ${n.y + 56}"/></g>${svgText(center, n.y + n.h + 3, n.label, { size: 12, bold: true, width: 145 })}`;
    }
    if (n.kind === 'note') {
        return `<path d="M${n.x} ${n.y}H${n.x + n.w - 14}L${n.x + n.w} ${n.y + 14}V${n.y + n.h}H${n.x}Z" fill="#fff2cc" stroke="#d6b656"/><path d="M${n.x + n.w - 14} ${n.y}V${n.y + 14}H${n.x + n.w}" fill="none" stroke="#d6b656"/>${centeredText(n, { size: 11 })}`;
    }

    if (n.kind === 'line') return `<line x1="${n.x}" y1="${n.y}" x2="${n.x + (n.kind === 'line' ? n.w : 0)}" y2="${n.y + n.h}" stroke="#999999" stroke-width="1"${n.dashed ? ' stroke-dasharray="5 4"' : ''}/>`;
    if (n.kind === 'text') return svgText(n.x + (n.align === 'left' ? 0 : n.align === 'right' ? n.w : center - n.x), n.y + 14, n.label, { width: n.w, size: n.size || 11, align: n.align, bold: n.bold });
    if (n.kind === 'class') {
        const fields = n.lines || [];
        const operations = n.operations || [];
        const heading = svgText(center, n.y + 23, n.label, { size: 13, bold: true, width: n.w - 24 });
        const attributes = fields.map((line, i) => svgText(n.x + 12, n.y + 54 + i * 20, line, { size: 11, align: 'left', width: n.w - 24 }));
        const dividerY = n.y + 54 + fields.length * 20;
        const methods = operations.map((line, i) => `<g data-operation="${xml(line)}">${svgText(n.x + 12, dividerY + 20 + i * 20, line, { size: 11, align: 'left', width: n.w - 24, underline: true })}</g>`).join('');
        const separator = operations.length ? `<path d="M${n.x} ${dividerY}H${n.x + n.w}" fill="none" stroke="${stroke}" stroke-width="1.3"/>` : '';
        return `<rect x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" fill="${COLORS.white}" stroke="${stroke}" stroke-width="1.3"/><path d="M${n.x} ${n.y}H${n.x + n.w}V${n.y + 34}H${n.x}Z" fill="${fill}" stroke="${stroke}"/>${heading}${attributes.join('')}<g data-compartment="operations">${separator}${methods}</g>`;
    }
    const radius = n.kind === 'action' ? 9 : 0;
    return `<rect x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="${radius}" fill="${fill}" stroke="${stroke}" stroke-width="1.2"/>${centeredText(n, { size: n.size || 12, bold: n.bold })}`;
}
function pointList(e) { return [e.a, ...e.points, e.b]; }

function drawEdge(e, uid) {
    const d = pointList(e).map((p, i) => `${i ? 'L' : 'M'}${p.x} ${p.y}`).join('');
    const color = e.color || COLORS.ink;
    const stroke = `stroke="${color}" stroke-width="${e.width || 1.2}" fill="none"`;
    const dash = e.dashed ? ' stroke-dasharray="6 4"' : '';
    const arrow = e.arrow === 'none' ? '' : ` marker-end="url(#${uid}-${e.arrow})"`;
    let label = '';
    if (e.label) {
        const x = e.labelX ?? pointList(e).reduce((v, p) => v + p.x, 0) / pointList(e).length;
        const y = e.labelY ?? (e.a.y + e.b.y) / 2 - 7;
    const maxWidth = Math.max(60, Math.min(260, Math.abs(e.b.x - e.a.x) > 100 ? Math.abs(e.b.x - e.a.x) - 8 : 150));
        const lines = wrapLines(e.label, maxWidth - 8, 11);
        const width = Math.max(40, Math.min(maxWidth, Math.max(...lines.map((line) => line.length)) * 6.4 + 10));
        label = `<rect x="${x - width / 2}" y="${y - 13}" width="${width}" height="${lines.length * 14 + 5}" fill="${COLORS.white}"/>${svgText(x, y, e.label, { size: 11, width: maxWidth - 8 })}`;
    }
    return `<path d="${d}" ${stroke}${dash}${arrow}/>${label}`;
}

export function sceneSvg(s) {
    const uid = s.id.replace(/[^a-z0-9]/gi, '');
    const out = [`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${s.width} ${s.height}" role="img" aria-labelledby="${uid}t ${uid}d">`,
        `<title id="${uid}t">${xml(s.title)}</title>`,
        `<desc id="${uid}d">${xml(s.description || s.title)}</desc>`,
        `<rect width="${s.width}" height="${s.height}" fill="#ffffff"/>`,
        '<defs>',
        `<marker id="${uid}-block" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M1 1L11 6L1 11Z" fill="#333333"/></marker>`,
        `<marker id="${uid}-open" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="9" markerHeight="9" orient="auto-start-reverse"><path d="M1 1L11 6L1 11" fill="none" stroke="#333333" stroke-width="1.3"/></marker>`,
        `<marker id="${uid}-triangle" viewBox="0 0 16 14" refX="14" refY="7" markerWidth="13" markerHeight="12" orient="auto-start-reverse"><path d="M15 1L1 7L15 13Z" fill="#ffffff" stroke="#333333"/></marker>`,
        '</defs>'];
    const shape = (n) => `<g data-shape="${xml(n.id)}" data-kind="${xml(n.kind)}">${drawNode(n)}</g>`;
    s.shapes.filter((n) => n.behind).forEach((n) => out.push(shape(n)));
    s.shapes.filter((n) => n.kind === 'lane').forEach((n) => out.push(shape(n)));
    s.edges.forEach((e) => out.push(drawEdge(e, uid)));
    s.shapes.filter((n) => !n.behind && n.kind !== 'lane').forEach((n) => out.push(shape(n)));
    out.push('</svg>');
    return out.join('\n');
}
