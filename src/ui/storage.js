// localStorage bisa tidak tersedia (mode privat, diblokir). Semua akses dibungkus try/catch
// dan aplikasi tetap berjalan tanpa penyimpanan.
const KEY_DRAF = 'faroid.draf';
const KEY_RIWAYAT = 'faroid.riwayat';
const MAKS_RIWAYAT = 30;

const baca = (k, def) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch { return def; } };
const tulis = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } };

export const bacaDraf = () => baca(KEY_DRAF, null);
export const simpanDraf = state => tulis(KEY_DRAF, state);

export const daftarRiwayat = () => baca(KEY_RIWAYAT, []);
export function simpanRiwayat(nama, state) {
  const list = daftarRiwayat();
  const item = { id: Date.now().toString(36), nama, waktu: new Date().toISOString(), state };
  list.unshift(item);
  return tulis(KEY_RIWAYAT, list.slice(0, MAKS_RIWAYAT)) ? item : null;
}
export const hapusRiwayat = id => tulis(KEY_RIWAYAT, daftarRiwayat().filter(x => x.id !== id));

export const bacaTema = () => { try { return localStorage.getItem('faroid.tema'); } catch { return null; } };
export const simpanTema = t => { try { t ? localStorage.setItem('faroid.tema', t) : localStorage.removeItem('faroid.tema'); } catch { /* abaikan */ } };
