// Service worker FAROID: aplikasi tetap bisa dipakai tanpa internet.
// Naikkan VERSI setiap rilis supaya cache lama dibersihkan.
const VERSI = 'faroid-v4';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icons/icon.svg', './icons/icon-192.png'];

// nama file JS/CSS hasil build berhash, jadi dibaca dari index.html saat install
async function asetDariIndex() {
  const html = await (await fetch('./index.html', { cache: 'no-store' })).text();
  return [...html.matchAll(/(?:src|href)="(\.\/assets\/[^"]+)"/g)].map(m => m[1]);
}

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(VERSI);
    await c.addAll(SHELL);
    await c.addAll(await asetDariIndex());
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSI).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // halaman: coba jaringan dulu (supaya dapat versi terbaru), jatuh ke cache saat offline
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(res => {
      const copy = res.clone(); caches.open(VERSI).then(c => c.put('./index.html', copy));
      return res;
    }).catch(() => caches.match('./index.html', { ignoreVary: true })));
    return;
  }

  // font Google: pakai cache, perbarui di belakang layar
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(caches.open(VERSI).then(async c => {
      const hit = await c.match(req, { ignoreVary: true });
      const net = fetch(req).then(res => { if (res.ok || res.type === 'opaque') c.put(req, res.clone()); return res; }).catch(() => hit);
      return hit || net;
    }));
    return;
  }

  // aset sendiri (JS/CSS berhash, ikon): cache dulu
  if (url.origin === self.location.origin) {
    e.respondWith(caches.match(req, { ignoreVary: true }).then(hit => hit || fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(VERSI).then(c => c.put(req, copy)); }
      return res;
    })));
  }
});
