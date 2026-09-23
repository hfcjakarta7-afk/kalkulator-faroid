// Kasus khusus yang mengubah bagian sebelum ʿaul/radd: al-Akdariyyah dan kakek bersama saudara (Bab 11.5–11.6).
import { F, add, sub, mul, cmp, fstr, ZERO, ONE } from './pecahan.js';
import { HEIR } from './ahli-waris.js';

const W = k => ({ key: k, weight: HEIR[k].g === 'L' ? 2 : 1 });

export function akdariyyah(ctx) {
  if (!ctx.isAkdariyyah) return;
  const { status, notes, akdarSis } = ctx;
  // suami 1/2, ibu 1/3, kakek 1/6, saudari 1/2 → ʿaul ke 9; lalu kakek + saudari (4 saham) dibagi 2 : 1 → taṣḥīḥ 27
  status.suami = { share: F(9, 27), kind: 'farḍ', basis: 'Al-Akdariyyah' };
  status.ibu = { share: F(6, 27), kind: 'farḍ', basis: 'Al-Akdariyyah' };
  status.kakek = { share: F(8, 27), kind: 'khusus', basis: 'Al-Akdariyyah: digabung dengan saudara perempuan, lalu dibagi 2 : 1' };
  status[akdarSis] = { share: F(4, 27), kind: 'khusus', basis: 'Al-Akdariyyah' };
  ctx.special = { aul: true, am: 6, amAul: 9, final: 27 };
  notes.push({ t: 'Kasus al-Akdariyyah', d: 'Diselesaikan menurut Zaid bin Tsābit: ʿaul ke 9, lalu taṣḥīḥ ke 27 (Bab 11.6).', bab: '11.6' });
}

// total bagian pasti saat ini
export function totalFurudh(status) {
  let t = ZERO;
  Object.keys(status).forEach(k => { if (status[k].share && status[k].kind === 'farḍ') t = add(t, status[k].share); });
  return t;
}

export function kakekBersamaSaudara(ctx) {
  if (!ctx.kakekWithSaudara || ctx.special) return;
  const { c, status, notes, block } = ctx;

  if (status.kakek && status.kakek.kind === 'farḍ') delete status.kakek;
  const totalF = totalFurudh(status);
  const rem = sub(ONE, totalF);

  // saudara yang ikut dihitung: kandung bila ada, jika tidak seayah (penyederhanaan muʿāddah)
  const useK = (c.sdrLK + c.sdrPK) > 0;
  const sL = useK ? 'sdrLK' : 'sdrLA', sP = useK ? 'sdrPK' : 'sdrPA';
  if (useK && (c.sdrLA + c.sdrPA) > 0) {
    block('sdrLA', 'saudara kandung'); block('sdrPA', 'saudara kandung');
    ctx.peringatan.push('muaddah');
    notes.push({ t: 'Perhatian: kasus muʿāddah', d: 'Ada saudara kandung dan seayah bersama kakek. Kalkulator menyederhanakan dengan tidak menghitung saudara seayah. Konsultasikan dengan ahli faraid (Bab 11.5).', bab: '11.5', warn: true });
  }

  const jatah = 2 * c[sL] + c[sP];
  const opts = [{ name: 'Berbagi (muqāsamah)', v: mul(rem, F(2, 2 + jatah)) }];
  if (totalF.n > 0) opts.push({ name: '1/3 dari sisa', v: mul(rem, F(1, 3)) }, { name: '1/6 dari seluruh harta', v: F(1, 6) });
  else opts.push({ name: '1/3 dari seluruh harta', v: F(1, 3) });

  let best = opts[0];
  opts.forEach(o => { if (cmp(o.v, best.v) > 0) best = o; });
  if (cmp(best.v, rem) > 0) best = { name: '1/6 (ʿaul)', v: F(1, 6) };

  status.kakek = { share: best.v, kind: 'khusus', basis: `Kakek bersama saudara: dipilih "${best.name}" (terbesar)` };
  const restS = sub(rem, best.v);
  const members = [sL, sP].filter(k => c[k]);
  if (members.length && cmp(restS, ZERO) > 0) ctx.asabah = { members: members.map(W), basis: 'Sisa setelah bagian kakek (2 : 1)', pool: restS };
  else members.forEach(k => { status[k] = { share: ZERO, kind: 'ʿaṣabah', basis: 'Harta habis' }; });

  notes.push({ t: 'Kakek bersama saudara', d: 'Mengikuti pendapat Zaid bin Tsābit (mazhab Syafiʿi): kakek mendapat pilihan terbaik (Bab 11.5). Opsi: ' + opts.map(o => `${o.name} = ${fstr(o.v)}`).join('; ') + '.', bab: '11.5' });
}
