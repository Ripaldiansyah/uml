import { readFileSync, writeFileSync } from 'node:fs';

// Bandingkan lebar teks "alt" dengan font asli vs font pengganti.
const svg = readFileSync('tools/_unduh/s-05-sequence-diagram.svg', 'utf8');
const plain = svg.replace(/font-family="[^"]*"/g, 'font-family="Georgia, serif"');
writeFileSync('tools/_tmp/nofont.svg', plain);
console.log('nofont.svg ditulis', plain.length);
