// Membuat PDF buku panduan dari halaman Panduan di aplikasi (npm run dev harus jalan).
// Jalankan: npm run panduan:pdf  → public/panduan/Panduan-Kalkulator-FAROID.pdf
import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';

const BASE = process.env.FAROID_URL || 'http://localhost:5173/';
const CHROME = [process.env.CHROME_PATH, 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', '/usr/bin/google-chrome'].find(p => p && existsSync(p));
const OUT = 'public/panduan/Panduan-Kalkulator-FAROID.pdf';

const b = await puppeteer.launch({ executablePath: CHROME, headless: 'new' });
const p = await b.newPage();
await p.goto(BASE, { waitUntil: 'networkidle0' });
await p.evaluate(() => {
  localStorage.setItem('faroid.tema', 'light');
  localStorage.setItem('faroid.draf', JSON.stringify({ step: 1, view: 'panduan', pw: 'L', heirs: {}, mahrum: [], harta: {}, barang: [], khusus: {}, lapis: [] }));
});
await p.reload({ waitUntil: 'networkidle0' });
await p.evaluate(async () => {
  await document.fonts.ready;
  await Promise.all([...document.images].map(img => (img.loading = 'eager', img.complete ? 0 : new Promise(r => { img.onload = img.onerror = r; }))));
});
await p.pdf({
  path: OUT, format: 'A4', printBackground: true,
  margin: { top: '16mm', bottom: '18mm', left: '16mm', right: '16mm' },
  displayHeaderFooter: true,
  headerTemplate: '<span></span>',
  footerTemplate: '<div style="width:100%;font-size:8px;color:#777;padding:0 16mm;display:flex;justify-content:space-between;font-family:Georgia,serif"><span>Buku Panduan Kalkulator FAROID</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>',
});
await b.close();
console.log('✓', OUT);
