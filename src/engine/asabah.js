// Langkah 3b: penerima sisa (ʿaṣabah), Bab 8, lalu mencoret ʿaṣabah bi an-nafsi yang lebih jauh (Bab 9).
import { HEIR, LABEL } from './ahli-waris.js';

const NAFSI_ORDER = ['anakL', 'cucuL', 'ayah', 'kakek', 'sdrLK', 'sdrLA', 'kepLK', 'kepLA', 'pamanK', 'pamanA', 'sepK', 'sepA'];
const KERABAT_JAUH = ['kepLK', 'kepLA', 'pamanK', 'pamanA', 'sepK', 'sepA'];

// bobot 2 : 1 (laki-laki : perempuan)
const W = k => ({ key: k, weight: HEIR[k].g === 'L' ? 2 : 1 });

export function asabah(ctx) {
  const { c, status, block, fw, fwL, fwP, fatherKey, kandungBlk, seayahBlk, sdrPKmaaGhair, musyarakah, isAkdariyyah, kakekActive } = ctx;

  ctx.kakekWithSaudara = kakekActive && !fwL && !isAkdariyyah && ((c.sdrLK + c.sdrPK) > 0 || (c.sdrLA + c.sdrPA) > 0);
  const kws = ctx.kakekWithSaudara;

  let a = null; // { members: [{key, weight}], basis, pool? }
  if (c.anakL) {
    a = { members: [W('anakL'), ...(c.anakP ? [W('anakP')] : [])], basis: 'Anak laki-laki' + (c.anakP ? ' bersama anak perempuan (2 : 1)' : '') };
  } else if (c.cucuL) {
    const ikutP = c.cucuP && !status.cucuP?.share;
    a = { members: [W('cucuL'), ...(ikutP ? [W('cucuP')] : [])], basis: 'Cucu laki-laki' + (ikutP ? ' bersama cucu perempuan (2 : 1)' : '') };
  } else if (fatherKey && !kws) {
    a = { members: [{ key: fatherKey, weight: 1 }], basis: fw ? '1/6 ditambah sisa' : 'Penerima sisa' };
  } else if (!kandungBlk && c.sdrLK && !musyarakah && !kws) {
    a = { members: [W('sdrLK'), ...(c.sdrPK ? [W('sdrPK')] : [])], basis: 'Saudara laki-laki kandung' + (c.sdrPK ? ' bersama saudara perempuan kandung (2 : 1)' : '') };
  } else if (sdrPKmaaGhair && !kws) {
    a = { members: [{ key: 'sdrPK', weight: 1 }], basis: 'ʿAṣabah maʿa al-ghair (bersama anak/cucu perempuan)' };
  } else if (!seayahBlk && c.sdrLA && !kws) {
    const ikutP = c.sdrPA && !status.sdrPA;
    a = { members: [W('sdrLA'), ...(ikutP ? [W('sdrPA')] : [])], basis: 'Saudara laki-laki seayah' + (ikutP ? ' bersama saudara perempuan seayah (2 : 1)' : '') };
  } else if (!seayahBlk && c.sdrPA && fwP && c.sdrPK === 0 && !kws) {
    a = { members: [{ key: 'sdrPA', weight: 1 }], basis: 'ʿAṣabah maʿa al-ghair (bersama anak/cucu perempuan)' };
  } else if (!kws) {
    const first = KERABAT_JAUH.find(k => c[k]);
    if (first) a = { members: [{ key: first, weight: 1 }], basis: 'Kerabat laki-laki terdekat (ʿaṣabah bi an-nafsi)' };
  }
  ctx.asabah = a;

  // coret ʿaṣabah bi an-nafsi yang lebih jauh dari penerima sisa teratas
  const topKey = a ? a.members[0].key : (kws || isAkdariyyah ? 'kakek' : null);
  const levelOf = k => NAFSI_ORDER.indexOf(k === 'sdrPK' ? 'sdrLK' : k === 'sdrPA' ? 'sdrLA' : k);
  const higherHolder = fatherKey || (c.anakL ? 'anakL' : c.cucuL ? 'cucuL' : null);
  NAFSI_ORDER.forEach(k => {
    if (!c[k] || status[k]) return;
    if (a && a.members.some(m => m.key === k)) return;
    if (k === 'kakek' && (kws || isAkdariyyah)) return;
    if (['sdrLK', 'sdrLA'].includes(k) && (kws || musyarakah)) return;
    const lv = levelOf(k), top = topKey ? levelOf(topKey) : -1;
    if (top >= 0 && lv > top) block(k, LABEL[topKey].toLowerCase());
    else if (!topKey && higherHolder) block(k, LABEL[higherHolder].toLowerCase());
  });
  KERABAT_JAUH.forEach(k => {
    if (c[k] && !status[k] && kakekActive && !(a && a.members[0].key === k)) block(k, 'kakek');
  });
}
