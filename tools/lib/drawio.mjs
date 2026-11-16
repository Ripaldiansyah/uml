import { COLORS, xml } from './scene.mjs';

const label = (value) => xml(value).replace(/\r?\n/g, '&lt;br&gt;');
const point = (p) => ({ left: [0, 0.5], right: [1, 0.5], top: [0.5, 0], bottom: [0.5, 1] }[p.side || 'bottom']);

function style(n) {
    const tone = n.tone || 'blue';
    const fill = COLORS[tone] || COLORS.white;
    const stroke = COLORS[`${tone}Line`] || COLORS.blueLine;
    const common = `html=1;whiteSpace=wrap;fontFamily=Arial;fontSize=12;fontColor=${COLORS.ink};`;
    switch (n.kind) {
        case 'lane': return `swimlane;${common}startSize=34;fillColor=${COLORS.gray};swimlaneFillColor=${COLORS.white};strokeColor=#999999;fontStyle=1;`;
        case 'action': return `rounded=1;arcSize=16;${common}fillColor=${fill};strokeColor=${stroke};`;
        case 'decision': return `rhombus;${common}fontSize=11;fillColor=${COLORS.orange};strokeColor=${COLORS.orangeLine};`;
        case 'ellipse': return `ellipse;${common}fillColor=${fill};strokeColor=${stroke};`;
        case 'actor': return `shape=umlActor;${common}verticalLabelPosition=bottom;verticalAlign=top;labelPosition=center;fillColor=${COLORS.white};strokeColor=${COLORS.ink};fontStyle=1;`;
        case 'start': return `ellipse;aspect=fixed;html=1;fillColor=${COLORS.ink};strokeColor=${COLORS.ink};`;
        case 'end': return `ellipse;aspect=fixed;html=1;fillColor=${COLORS.ink};strokeColor=${COLORS.ink};strokeWidth=2;`;
        case 'note': return `shape=note;${common}fontSize=11;fillColor=#fff2cc;strokeColor=#d6b656;size=14;`;
        case 'text': return `text;${common}fontSize=${n.size || 11};align=${n.align || 'center'};verticalAlign=top;${n.bold ? 'fontStyle=1;' : ''}`;
        case 'line': return `${n.dashed ? 'line;direction=south;dashed=1;dashPattern=4 4;' : 'rounded=0;'}html=1;strokeColor=${n.color || '#999999'};fillColor=${n.fill || COLORS.orange};`;
        case 'object': return `rounded=0;${common}fillColor=${fill};strokeColor=${stroke};fontStyle=4;`;
        case 'class': return `rounded=0;${common}align=left;verticalAlign=top;spacing=8;fillColor=${fill};strokeColor=${stroke};`;
        default: return `rounded=0;${common}fillColor=${fill};strokeColor=${stroke};${n.bold ? 'fontStyle=1;' : ''}`;
    }
}
function nodeXml(n) {
    let value = n.label;
    if (n.kind === 'class') {
        const attributes = (n.lines || []).map(xml).join('<br>');
        const operations = (n.operations || []).map((operation) => `<u>${xml(operation)}</u>`).join('<br>');
        value = `<div style="text-align:center"><b>${xml(n.label)}</b></div><hr>${attributes}${operations ? `<hr>${operations}` : ''}`;
    }
    if (n.kind === 'end') {
        // Bulatan ganda adalah bentuk selesai klasik, bukan simbol bawaan UML 2.5.
        return `<mxCell id="${n.id}" style="${style(n)}" vertex="1" parent="1"><mxGeometry x="${n.x + 3}" y="${n.y + 3}" width="20" height="20" as="geometry"/></mxCell>
<mxCell id="${n.id}-ring" value="" style="ellipse;aspect=fixed;html=1;fillColor=none;strokeColor=${COLORS.ink};strokeWidth=2;" vertex="1" parent="1"><mxGeometry x="${n.x}" y="${n.y}" width="26" height="26" as="geometry"/></mxCell>`;
    }
    return `<mxCell id="${n.id}" value="${label(value)}" style="${style(n)}" vertex="1" connectable="${n.kind === 'lane' || n.kind === 'text' ? 0 : 1}" parent="1"><mxGeometry x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" as="geometry"/></mxCell>`;
}
function edgeXml(e) {
    const [exitX, exitY] = point(e.a), [entryX, entryY] = point(e.b);
    const arrow = e.arrow === 'triangle' ? 'block;endFill=0;endSize=14;' : e.arrow === 'open' ? 'open;endFill=0;' : e.arrow === 'none' ? 'none;' : 'block;endFill=1;';
    const style = `edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=${e.color || COLORS.ink};strokeWidth=${e.width || 1.2};endArrow=${arrow}exitX=${exitX};exitY=${exitY};exitDx=0;exitDy=0;entryX=${entryX};entryY=${entryY};entryDx=0;entryDy=0;${e.dashed ? 'dashed=1;dashPattern=6 4;' : ''}fontFamily=Arial;fontSize=11;labelBackgroundColor=#ffffff;`;
    const points = e.points.map((p) => `<mxPoint x="${p.x}" y="${p.y}"/>`).join('');
    const ox = e.labelX === undefined ? 0 : e.labelX - (e.a.x + e.b.x) / 2;
    const oy = e.labelY === undefined ? 0 : e.labelY - (e.a.y + e.b.y) / 2;
    return `<mxCell id="${e.id}" value="${label(e.label)}" style="${style}" edge="1" parent="1"${e.from ? ` source="${e.from}"` : ''}${e.to ? ` target="${e.to}"` : ''}><mxGeometry relative="1" as="geometry"><mxPoint x="${e.a.x}" y="${e.a.y}" as="sourcePoint"/><mxPoint x="${e.b.x}" y="${e.b.y}" as="targetPoint"/>${points ? `<Array as="points">${points}</Array>` : ''}<mxPoint x="${ox}" y="${oy}" as="offset"/></mxGeometry></mxCell>`;
}

export function diagramXml(s) {
    return `<diagram id="${s.id}" name="${xml(s.title)}"><mxGraphModel dx="1000" dy="700" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="${Math.ceil(s.width / 10) * 10}" pageHeight="${Math.ceil(s.height / 10) * 10}" math="0" shadow="0"><root><mxCell id="0"/><mxCell id="1" parent="0"/>${s.shapes.map(nodeXml).join('')}${s.edges.map(edgeXml).join('')}</root></mxGraphModel></diagram>`;
}
export function drawioFile(scenes) {
    const body = Array.isArray(scenes) ? scenes.map(diagramXml).join('') : diagramXml(scenes);
    return `<mxfile host="app.diagrams.net" agent="Dokumentasi AKC Workshop" version="24.7.17" type="device">${body}</mxfile>`;
}
