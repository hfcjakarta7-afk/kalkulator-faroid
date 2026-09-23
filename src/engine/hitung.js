// Mesin hitung faraid mazhab Syafiʿi. Mengikuti tujuh langkah Bab 10:
// ḥajb → bagian pasti → ʿaṣabah → kasus khusus → ʿaul/radd → asal masalah & taṣḥīḥ.
import { F, add, sub, mul, div, cmp, lcm, fstr, ZERO, ONE } from './pecahan.js';
import { HEIRS, HEIR, SEBAB_MAHRUM } from './ahli-waris.js';
import { hajb } from './hajb.js';
import { furudh } from './furudh.js';
import { asabah } from './asabah.js';
import { akdariyyah, kakekBersamaSaudara } from './kasus-khusus.js';

const clampCount = (key, v) => Math.max(0, Math.min(HEIR[key].max, Math.floor(+v || 0)));

/**
 * hitung(input) → hasil
 * input: {
 *   pewaris: 'L' | 'P',
 *   heirs: { [key]: jumlah },                       // ahli waris yang hidup dan tidak terhalang sebab lain
 *   mahrum: [{ key, n, sebab }],                    // opsional: kerabat yang terhalang karena pembunuhan/beda agama/perbudakan
 *   harta: { bersama, ... }                         // opsional, hanya untuk catatan KHI
 * }
 */
export function hitung(input) {
  const c = {};
  HEIRS.forEach(h => { c[h.key] = clampCount(h.key, (input.heirs || {})[h.key]); });
  if (input.pewaris === 'L') c.suami = 0; else c.istri = 0;

  const ctx = {
    c, notes: [], status: {}, furudh: [], peringatan: [], asabah: null, special: null,
    block(k, by) { if (c[k] > 0) ctx.status[k] = { blocked: true, by }; },
  };
  const { status, notes } = ctx;

  hajb(ctx);
  furudh(ctx);
  asabah(ctx);
  akdariyyah(ctx);
  kakekBersamaSaudara(ctx);

  // ---------- ʿaul / radd / sisa ----------
  let aul = false, radd = false, sisaBaitulMal = ZERO;
  const shares = {};
  Object.keys(status).forEach(k => { if (status[k].share) shares[k] = status[k].share; });
  const fard = { ...shares }; // bagian sebelum ʿaul/radd/sisa
  let totalShares = ZERO;
  Object.values(shares).forEach(s => { totalShares = add(totalShares, s); });
  const a = ctx.asabah;

  if (ctx.special) { /* sudah final */ }
  else if (cmp(totalShares, ONE) > 0) {
    aul = true;
    Object.keys(shares).forEach(k => { shares[k] = div(shares[k], totalShares); });
    if (a) a.members.forEach(m => {
      if (shares[m.key] && shares[m.key].n) status[m.key].basis = (status[m.key].basis || '') + '; tidak ada sisa';
      else { status[m.key] = { share: ZERO, kind: 'ʿaṣabah', basis: a.basis + ' — harta habis' }; shares[m.key] = ZERO; }
    });
    notes.push({ t: 'ʿAul', d: `Jumlah bagian pasti (${fstr(totalShares)}) melebihi harta, sehingga semua bagian dikurangi secara seimbang (Bab 11.1; KHI Pasal 192).`, bab: '11.1' });
  } else {
    const rem = a && a.pool ? a.pool : sub(ONE, totalShares);
    if (a) {
      const totalW = a.members.reduce((acc, m) => acc + m.weight * c[m.key], 0);
      a.members.forEach(m => {
        const s = mul(rem, F(m.weight * c[m.key], totalW));
        const prev = shares[m.key] || ZERO;
        shares[m.key] = add(prev, s);
        const prevBasis = status[m.key] && status[m.key].basis && prev.n ? status[m.key].basis + '; ' : '';
        status[m.key] = { share: shares[m.key], kind: prev.n ? 'farḍ + sisa' : 'ʿaṣabah', basis: prevBasis + a.basis };
      });
    } else if (rem.n > 0) {
      const rk = Object.keys(shares).filter(k => !['suami', 'istri'].includes(k) && shares[k].n > 0);
      if (rk.length) {
        radd = true;
        let base = ZERO; rk.forEach(k => { base = add(base, shares[k]); });
        rk.forEach(k => { shares[k] = add(shares[k], mul(rem, div(shares[k], base))); });
        notes.push({ t: 'Radd', d: 'Sisa harta dikembalikan kepada pemilik bagian pasti sesuai perbandingan bagiannya. Suami/istri tidak ikut radd menurut mazhab Syafiʿi (Bab 11.2). KHI Pasal 193 tidak tegas soal ini.', bab: '11.2' });
      } else {
        sisaBaitulMal = rem;
        ctx.peringatan.push('dzawilArham');
        notes.push({ t: 'Sisa harta', d: `Masih tersisa ${fstr(rem)} tanpa penerima. Menurut mazhab Syafiʿi generasi belakangan, sisa diberikan kepada dzawil arḥām (kerabat jauh) bila ada; jika tidak ada, ke Baitul Māl. Kalkulator belum menghitung dzawil arḥām (Bab 12.1).`, bab: '12.1', warn: true });
      }
    }
  }

  // ---------- baris per ahli waris ----------
  const rows = [];
  HEIRS.forEach(h => {
    const n = c[h.key]; if (!n) return;
    const st = status[h.key] || {};
    if (st.blocked) { rows.push({ key: h.key, label: h.label, n, blocked: true, by: st.by, bab: '9' }); return; }
    const g = shares[h.key] || ZERO;
    rows.push({ key: h.key, label: h.label, n, group: g, each: div(g, F(n)), fard: fard[h.key] || null, kind: st.kind || '—', basis: st.basis || '', bab: h.bab });
  });

  // kerabat yang maḥrūm (Bab 2.5): tidak menerima dan tidak menghalangi siapa pun
  const mahrum = (input.mahrum || [])
    .filter(m => HEIR[m.key] && (+m.n || 0) > 0)
    .map(m => ({ key: m.key, label: HEIR[m.key].label, n: Math.floor(+m.n), sebab: m.sebab, alasan: SEBAB_MAHRUM[m.sebab] || 'Terhalang sebab lain' }));

  // ---------- asal masalah & taṣḥīḥ ----------
  let denom = 1;
  rows.forEach(r => { if (r.each) denom = lcm(denom, r.each.d); });
  if (sisaBaitulMal.n) denom = lcm(denom, sisaBaitulMal.d);

  // asal masalah klasik (sebelum taṣḥīḥ): KPK penyebut bagian pasti per kelompok
  const amParts = ctx.furudh.filter(x => x.share && x.share.n
    && (x.key.startsWith('_') || (status[x.key] && !status[x.key].blocked && status[x.key].kind !== 'khusus')));
  let am = 1;
  amParts.forEach(x => { am = lcm(am, x.share.d); });
  if (!amParts.length && a) am = a.members.reduce((acc, m) => acc + m.weight * c[m.key], 0);
  let amAul = null;
  if (aul) { let s = 0; amParts.forEach(x => { s += x.share.n * (am / x.share.d); }); amAul = s; }
  if (ctx.special) { am = ctx.special.am; amAul = ctx.special.amAul; }
  rows.forEach(r => { if (r.each) { r.sahamEach = r.each.n * (denom / r.each.d); r.sahamGroup = r.sahamEach * r.n; } });

  // ---------- catatan KHI (pembanding, bukan dasar hitungan) ----------
  const khi = [];
  if (input.harta && +input.harta.bersama > 0) khi.push({ d: 'Separuh harta bersama dipisahkan untuk pasangan yang masih hidup sebelum dibagi waris (KHI Pasal 96).', bab: '3.1' });
  if (c.cucuL + c.cucuP === 0) {
    khi.push({ d: 'Jika ada anak pewaris yang wafat lebih dulu dan meninggalkan anak (cucu pewaris), menurut KHI Pasal 185 cucu tersebut dapat menjadi ahli waris pengganti. Kalkulator ini mengikuti fiqih Syafiʿi.', bab: '12.6' });
  }
  if (radd && (c.suami || c.istri)) khi.push({ d: 'Sebagian praktik Pengadilan Agama mengikutsertakan suami/istri dalam radd. Menurut mazhab Syafiʿi, pasangan tidak ikut radd (KHI Pasal 193).', bab: '11.2' });

  const total = rows.filter(r => !r.blocked).reduce((acc, r) => add(acc, r.group), ZERO);

  return {
    pewaris: input.pewaris, counts: c, rows, mahrum, denom, am, amAul,
    aul: aul || !!(ctx.special && ctx.special.aul), radd, sisa: sisaBaitulMal,
    special: ctx.special ? 'akdariyyah' : null,
    // untuk penjelasan langkah: kelompok bagian pasti (dipakai menentukan asal masalah) dan penerima sisa
    kelompok: amParts.map(x => ({ members: (x.members || [x.key]).filter(k => c[k]), share: x.share })),
    penerimaSisa: a && !aul ? a.members.map(m => m.key) : [],
    adaKhusus: rows.some(r => r.kind === 'khusus'),
    notes, khi, peringatan: ctx.peringatan,
    tashih: denom !== (amAul || am),
    total, // harus 1 kecuali ada sisa tanpa penerima
  };
}
