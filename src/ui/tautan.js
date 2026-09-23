// Link kasus yang bisa dibagikan. Data kasus disimpan di bagian "#" URL,
// sehingga tidak pernah terkirim ke server mana pun.
// Isian berita acara (nama orang, tanda tangan) sengaja TIDAK ikut dibagikan.

const VERSI = 1;
const KUNCI = ['nama', 'pw', 'heirs', 'mahrum', 'harta', 'barang', 'khusus', 'lapis'];

const keBase64Url = bytes => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const dariBase64Url = s => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), ch => ch.charCodeAt(0));

export function buatLink(state, base = location.href) {
  const data = { v: VERSI };
  KUNCI.forEach(k => {
    const v = state[k];
    const kosong = v == null || v === '' || (Array.isArray(v) ? !v.length : typeof v === 'object' && !Object.keys(v).length);
    if (!kosong) data[k] = v;
  });
  const url = new URL(base);
  url.hash = 'k=' + keBase64Url(new TextEncoder().encode(JSON.stringify(data)));
  return url.toString();
}

/** Membaca kasus dari hash URL. Mengembalikan null bila tidak ada / rusak. */
export function bacaLink(hash = location.hash) {
  const m = /^#k=([A-Za-z0-9_-]+)$/.exec(hash || '');
  if (!m) return null;
  try {
    const data = JSON.parse(new TextDecoder().decode(dariBase64Url(m[1])));
    if (!data || data.v !== VERSI) return null;
    const out = {};
    KUNCI.forEach(k => { if (data[k] !== undefined) out[k] = data[k]; });
    if (out.pw !== 'L' && out.pw !== 'P') return null;
    return out;
  } catch {
    return null;
  }
}
