// Membuat ikon PNG PWA dari public/icons/icon.svg. Jalankan: npm run ikon
import { Resvg } from '@resvg/resvg-js';
import { readFileSync, writeFileSync } from 'node:fs';

const svg = readFileSync('public/icons/icon.svg', 'utf8');
const render = (src, size, out) => {
  const png = new Resvg(src, { fitTo: { mode: 'width', value: size }, font: { loadSystemFonts: true } }).render().asPng();
  writeFileSync(out, png);
  console.log(out, png.length, 'byte');
};
render(svg, 192, 'public/icons/icon-192.png');
render(svg, 512, 'public/icons/icon-512.png');
// maskable: isi digeser ke zona aman 80% di tengah
const maskable = svg.replace('<rect width="512" height="512" fill="url(#g)"/>', '<rect width="512" height="512" fill="url(#g)"/><g transform="translate(51.2 51.2) scale(.8)">').replace('</svg>', '</g></svg>');
render(maskable, 512, 'public/icons/icon-maskable-512.png');
