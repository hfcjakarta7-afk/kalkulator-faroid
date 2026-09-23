// Membuat screenshot untuk buku panduan dari aplikasi yang sedang jalan (npm run dev).
// Jalankan: npm run panduan:gambar   (butuh Google Chrome terpasang)
import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';

const BASE = process.env.FAROID_URL || 'http://localhost:5173/';
const CHROME = [process.env.CHROME_PATH, 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', '/usr/bin/google-chrome'].find(p => p && existsSync(p));
const OUT = 'public/panduan';

const kosong = { step: 1, view: 'form', nama: '', pw: 'L', heirs: {}, mahrum: [], harta: {}, barang: [], khusus: {}, lapis: [] };
const umar = { ...kosong, nama: 'Kasus Pak Umar', heirs: { istri: 1, ayah: 1, ibu: 1, nenekIbu: 1, anakL: 1, anakP: 2, sdrLK: 2 },
  harta: { bersama: 500000000, bawaan: 100000000, jenazah: 5000000, utang: 37000000, wasiat: 20000000 } };
const joko = { ...kosong, nama: 'Almarhum Bapak Joko', heirs: { istri: 1, anakL: 1, anakP: 2 }, harta: { bawaan: 640000000 },
  barang: [{ nama: 'Rumah', nilai: 360000000, oleh: 'anakL#1' }, { nama: 'Sawah', nilai: 200000000, oleh: 'anakP#1' },
    { nama: 'Mobil', nilai: 60000000, oleh: 'istri#1' }, { nama: 'Emas 20 gram', nilai: 20000000, oleh: 'istri#1' }],
  ba: { nama: { 'istri#1': 'Sri', 'anakL#1': 'Fajar', 'anakP#1': 'Gita', 'anakP#2': 'Hana' } } };
const rahmat = { ...kosong, nama: 'Keluarga Pak Rahmat', heirs: { istri: 1, anakL: 2, anakP: 1 }, harta: { bawaan: 480000000 },
  lapis: [{ wafat: '1:anakL#1', heirs: { istri: 1, ibu: 1, anakL: 1, sdrLK: 1, sdrPK: 1 }, tautan: {} }] };

// [nama file, state, fungsi persiapan di halaman (opsional), selector yang difoto, tinggi maks, lebar layar (opsional)]
const SHOTS = [
  ['01-pewaris', { ...kosong, step: 1, nama: 'Kasus Pak Umar' }, null, '.step.active', 900],
  ['02-harta', { ...umar, step: 2 }, null, '.step.active', 1100],
  ['03-ahli-waris', { ...umar, step: 3 }, null, '.step.active', 1300],
  ['04-hasil', { ...umar, step: 4 }, null, '.step.active', 1250],
  ['05-terhalang-catatan', { ...umar, step: 4 }, () => document.querySelector('.block-list').closest('.sec').scrollIntoView(), '#out .sec', 700],
  ['06-langkah', { ...umar, step: 4 }, () => { document.querySelector('#langkah-box').open = true; }, '#langkah-box', 950],
  ['07-barang-input', { ...joko, step: 2 }, () => { document.querySelector('#barang-box').open = true; }, '#barang-box', 700],
  ['08-kurang-lebih', { ...joko, step: 4 }, null, '#barang-hasil', 1600],
  ['09-munasakhah-lapis', { ...rahmat, step: 3 }, () => { document.querySelectorAll('.lapis-card details.more').forEach(d => d.open = false); }, '.lapis-card', 640],
  ['09b-tautan', { ...rahmat, step: 3 }, null, '.tautan', 900],
  ['10-munasakhah-hasil', { ...rahmat, step: 4 }, null, '.step.active', 1300],
  ['11-berita-acara', { ...joko, step: 4, view: 'ba' }, null, '#ba-doc', 1250, 820],
  ['12-tombol-hasil', { ...umar, step: 4 }, null, '.result-head', 300],
];

const b = await puppeteer.launch({ executablePath: CHROME, headless: 'new' });
const p = await b.newPage();
await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
await p.goto(BASE, { waitUntil: 'networkidle0' });
for (const [nama, state, siapkan, selector, maks, lebar = 390] of SHOTS) {
  await p.setViewport({ width: lebar, height: 844, deviceScaleFactor: 2 });
  await p.evaluate(s => { localStorage.setItem('faroid.tema', 'light'); localStorage.setItem('faroid.draf', JSON.stringify(s)); }, state);
  await p.reload({ waitUntil: 'networkidle0' });
  await p.evaluate(() => document.fonts.ready);
  // elemen menempel (stepper, tombol bawah) jangan ikut terfoto
  await p.addStyleTag({ content: ".stepper,.nav-bar{position:static!important}.toast{display:none!important}" });
  if (siapkan) await p.evaluate(siapkan);
  await new Promise(r => setTimeout(r, 300));
  const el = await p.$(selector);
  const box = await el.boundingBox();
  await p.screenshot({ path: `${OUT}/${nama}.jpg`, type: 'jpeg', quality: 82, clip: { x: Math.max(0, box.x - 6), y: box.y + (await p.evaluate(() => scrollY)) - 6, width: Math.min(lebar, box.width + 12), height: Math.min(box.height, maks) + 12 }, captureBeyondViewport: true });
  console.log('✓', nama);
}
await b.close();
