// Munāsakhah: ahli waris wafat sebelum harta dibagi (Bab 13).
// Diselesaikan lapis demi lapis sesuai urutan wafat, dengan cara di Bab 13.2:
//   S = saham orang yang wafat di masalah sebelumnya, A = asal masalah (akhir) lapis berikutnya,
//   F = FPB(S, A); saham lama × (A ÷ F), saham lapis baru × (S ÷ F), asal masalah gabungan (al-jāmiʿah) = J × (A ÷ F).
import { gcd, F as frac, fstr } from './pecahan.js';
import { HEIR } from './ahli-waris.js';
import { hitung } from './hitung.js';

const aman = n => { if (!Number.isSafeInteger(n)) throw new Error('Angka terlalu besar untuk dihitung. Kurangi jumlah lapis.'); return n; };

/** id orang: "<lapis>:<key>#<urutan>", contoh "1:anakL#2" = anak laki-laki ke-2 di lapis 1 */
export const idOrang = (lapis, key, i) => `${lapis}:${key}#${i}`;
export const pecahId = id => { const [l, rest] = id.split(':'); const [key, i] = rest.split('#'); return { lapis: +l, key, i: +i }; };

function labelOrang(key, i, n) { return HEIR[key].label + (n > 1 ? ` ${i}` : ''); }

/**
 * munasakhah(masalah1, lapisList)
 * masalah1: input hitung() untuk pewaris pertama.
 * lapisList: [{ wafat: idOrang, heirs, mahrum?, tautan?: { "key#i": idOrang } }]
 *   `tautan` menandai ahli waris lapis ini yang orangnya sama dengan orang di lapis sebelumnya
 *   (misalnya ibu dari anak yang wafat = istri pewaris pertama).
 */
export function munasakhah(masalah1, lapisList = []) {
  const hasil1 = hitung(masalah1);
  let J = hasil1.denom;
  const orang = new Map();
  const tambah = (id, data) => {
    if (!orang.has(id)) orang.set(id, { id, label: data.label, peran: [], pindah: 0, wafatDiLapis: null });
    const o = orang.get(id);
    o.peran.push({ lapis: data.lapis, key: data.key, label: data.label, saham: data.saham });
    return o;
  };

  hasil1.rows.filter(r => !r.blocked).forEach(r => {
    for (let i = 1; i <= r.n; i++) tambah(idOrang(1, r.key, i), { lapis: 1, key: r.key, label: labelOrang(r.key, i, r.n), saham: r.sahamEach });
  });
  let sisa = hasil1.sisa.n ? aman(hasil1.sisa.n * (J / hasil1.sisa.d)) : 0;

  const totalOf = o => o.peran.reduce((a, p) => a + p.saham, 0) - o.pindah;
  const lapisDetail = [];

  lapisList.forEach((lp, idx) => {
    const n = idx + 2;
    const D = orang.get(lp.wafat);
    if (!D) throw new Error(`Lapis ${n}: orang yang wafat belum dipilih atau tidak ada di lapis sebelumnya.`);
    if (D.wafatDiLapis) throw new Error(`Lapis ${n}: ${D.label} sudah wafat di lapis ${D.wafatDiLapis}.`);
    const S = totalOf(D);
    if (S <= 0) throw new Error(`Lapis ${n}: ${D.label} tidak mendapat bagian, jadi tidak ada yang berpindah.`);

    const kunciD = D.peran[0].key;
    const pewaris = HEIR[kunciD].g;
    const heirsAda = Object.values(lp.heirs || {}).some(v => +v > 0);
    const hasil = heirsAda ? hitung({ pewaris, heirs: lp.heirs, mahrum: lp.mahrum }) : null;
    const A = hasil ? hasil.denom : 1;
    const Fp = gcd(S, A);
    const m1 = A / Fp, m2 = S / Fp;

    // naikkan semua saham lama
    orang.forEach(o => { o.peran.forEach(p => { p.saham = aman(p.saham * m1); }); o.pindah = aman(o.pindah * m1); });
    sisa = aman(sisa * m1);
    const Jlama = J;
    J = aman(J * m1);
    D.pindah += S * m1;
    D.wafatDiLapis = n;

    const penerima = [];
    if (hasil) {
      hasil.rows.filter(r => !r.blocked).forEach(r => {
        for (let i = 1; i <= r.n; i++) {
          const tautan = lp.tautan && lp.tautan[`${r.key}#${i}`];
          const sah = tautan && orang.has(tautan) && !orang.get(tautan).wafatDiLapis; // orang yang sudah wafat tidak mewarisi
          const id = sah ? tautan : idOrang(n, r.key, i);
          const label = labelOrang(r.key, i, r.n);
          const saham = aman(r.sahamEach * m2);
          const o = tambah(id, { lapis: n, key: r.key, label, saham });
          penerima.push({ id, key: r.key, label, labelOrang: o.label, bagian: r.each, sahamLapis: r.sahamEach, saham, baru: id === idOrang(n, r.key, i) });
        }
      });
      if (hasil.sisa.n) sisa = aman(sisa + (hasil.sisa.n * (A / hasil.sisa.d)) * m2);
    } else {
      sisa = aman(sisa + S * m1); // tidak ada ahli waris: bagiannya ke Baitul Māl / dzawil arḥām
    }

    lapisDetail.push({ lapis: n, wafat: D.id, wafatLabel: D.label, pewaris, hasil, S, A, F: Fp, m1, m2, Jlama, J, habisDibagi: S % A === 0, penerima });
  });

  const hasilOrang = [...orang.values()].map(o => {
    const saham = totalOf(o);
    return { id: o.id, label: o.label, peran: o.peran, saham, wafatDiLapis: o.wafatDiLapis, each: frac(saham, J) };
  });
  const cek = hasilOrang.reduce((a, o) => a + o.saham, 0) + sisa === J;

  return { hasil1, lapis: lapisDetail, orang: hasilOrang, J, sisa: frac(sisa, J), cek };
}

/**
 * Saran tautan orang yang sama antar lapis untuk kasus paling umum (bisa diubah pengguna):
 * - yang wafat adalah anak pewaris pertama → ibunya = istri pewaris (jika istrinya satu), ayahnya = suami pewaris,
 *   saudara kandungnya = anak-anak lain pewaris pertama;
 * - yang wafat adalah suami/istri pewaris pertama → anak-anaknya = anak-anak pewaris pertama.
 * Hanya berlaku untuk orang yang wafat dari lapis 1.
 */
export function sarankanTautan(masalah1, wafatId, heirsLapis) {
  const saran = {};
  if (!wafatId) return saran;
  const { lapis, key: kD, i: iD } = pecahId(wafatId);
  if (lapis !== 1) return saran;
  const h1 = hitung(masalah1);
  const hidup = {};
  h1.rows.filter(r => !r.blocked && r.each.n).forEach(r => { hidup[r.key] = r.n; });
  const ambil = (key, kecuali) => {
    const out = [];
    for (let i = 1; i <= (hidup[key] || 0); i++) if (!(key === kD && i === iD) && !(kecuali && kecuali === `${key}#${i}`)) out.push(idOrang(1, key, i));
    return out;
  };
  const pasang = (keyLapis, daftar) => {
    const n = +(heirsLapis[keyLapis] || 0);
    for (let i = 1; i <= Math.min(n, daftar.length); i++) saran[`${keyLapis}#${i}`] = daftar[i - 1];
  };

  if (kD === 'anakL' || kD === 'anakP') {
    if (masalah1.pewaris === 'L' && hidup.istri === 1) pasang('ibu', ambil('istri'));
    if (masalah1.pewaris === 'P' && hidup.suami) pasang('ayah', ambil('suami'));
    pasang('sdrLK', ambil('anakL'));
    pasang('sdrPK', ambil('anakP'));
  }
  if (kD === 'suami' || kD === 'istri') {
    pasang('anakL', ambil('anakL'));
    pasang('anakP', ambil('anakP'));
  }
  return saran;
}

/**
 * Tautan yang dipakai = saran otomatis, ditimpa pilihan pengguna.
 * Di `lp.tautan`, nilai "" berarti pengguna memilih "orang baru" (tidak ditautkan).
 */
export function lapisEfektif(masalah1, lapisList = []) {
  return lapisList.filter(lp => lp.wafat).map(lp => {
    const gabung = { ...sarankanTautan(masalah1, lp.wafat, lp.heirs || {}), ...(lp.tautan || {}) };
    Object.keys(gabung).forEach(k => { if (!gabung[k]) delete gabung[k]; });
    return { ...lp, tautan: gabung };
  });
}

export { fstr };
