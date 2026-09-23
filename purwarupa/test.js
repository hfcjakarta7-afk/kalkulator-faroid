// Uji engine FAROID terhadap contoh & kasus di ebook "Dari Bingung Jadi Paham Waris"
const F = require('./faraid-engine.js');
let fails = 0, n = 0;
function T(name, pewaris, heirs, expect, extra = {}) {
  n++;
  const r = F.hitung({ pewaris, heirs });
  const got = {}; r.rows.forEach(x => { got[x.key] = x.blocked ? 'X' : F.fstr(x.each); });
  const bad = Object.entries(expect).filter(([k, v]) => got[k] !== v);
  const chk = [];
  if (extra.am && r.am !== extra.am) chk.push(`am ${r.am}≠${extra.am}`);
  if (extra.aul && r.amAul !== extra.aul) chk.push(`aul ${r.amAul}≠${extra.aul}`);
  if (extra.denom && r.denom !== extra.denom) chk.push(`denom ${r.denom}≠${extra.denom}`);
  if (bad.length || chk.length) { fails++; console.log('FAIL', name, JSON.stringify(got), JSON.stringify(bad), chk.join(' '), r.notes.map(x => x.t).join('|')); }
  else console.log('ok  ', name);
}
// Bab 5–8
T('5.2 suami+sdrLK', 'P', { suami: 1, sdrLK: 1 }, { suami: '1/2', sdrLK: '1/2' });
T('5.4 SaadRabi', 'L', { istri: 1, anakP: 2, pamanK: 1 }, { istri: '1/8', anakP: '1/3', pamanK: '5/24' }, { am: 24 });
T('6.1', 'P', { suami: 1, anakL: 1, anakP: 1 }, { suami: '1/4', anakL: '1/2', anakP: '1/4' });
T('6.2', 'L', { istri: 2, anakL: 1 }, { istri: '1/16', anakL: '7/8' });
T('6.3', 'L', { istri: 1, ayah: 1 }, { istri: '1/4', ayah: '3/4' });
T('6.4', 'L', { ayah: 1, anakL: 1 }, { ayah: '1/6', anakL: '5/6' });
T('6.5', 'L', { ayah: 1, anakP: 1 }, { ayah: '1/2', anakP: '1/2' });
T('6.7', 'L', { ayah: 1, ibu: 1 }, { ibu: '1/3', ayah: '2/3' });
T('6.8', 'L', { ayah: 1, ibu: 1, sdrLK: 2 }, { ibu: '1/6', ayah: '5/6', sdrLK: 'X' });
T('6.9', 'L', { kakek: 1, ibu: 1, anakP: 1 }, { anakP: '1/2', ibu: '1/6', kakek: '1/3' });
T('6.10', 'L', { nenekIbu: 1, nenekAyah: 1, anakL: 1 }, { nenekIbu: '1/12', nenekAyah: '1/12', anakL: '5/6' });
T('7.1', 'L', { istri: 1, anakL: 2, anakP: 1 }, { istri: '1/8', anakL: '7/20', anakP: '7/40' });
T('7.2 radd', 'P', { suami: 1, anakP: 3 }, { suami: '1/4', anakP: '1/4' });
T('7.3', 'L', { anakP: 1, cucuP: 1, sdrLK: 1 }, { anakP: '1/2', cucuP: '1/6', sdrLK: '1/3' });
T('7.4', 'L', { anakP: 2, cucuP: 1, cucuL: 1 }, { anakP: '1/3', cucuL: '2/9', cucuP: '1/9' });
T('7.5 musyarakah', 'P', { suami: 1, ibu: 1, sdrLI: 1, sdrPI: 1, sdrLK: 1 }, { suami: '1/2', ibu: '1/6', sdrLI: '1/9', sdrPI: '1/9', sdrLK: '1/9' });
T('7.6', 'L', { sdrLK: 1, sdrPK: 2 }, { sdrLK: '1/2', sdrPK: '1/4' });
T('7.7 radd', 'L', { istri: 1, sdrPK: 1, sdrPA: 1 }, { istri: '1/4', sdrPK: '9/16', sdrPA: '3/16' });
T('8.1', 'L', { istri: 1, ibu: 1, pamanK: 1 }, { istri: '1/4', ibu: '1/3', pamanK: '5/12' });
T('8.2', 'L', { ibu: 1, kepLK: 1, pamanK: 1 }, { ibu: '1/3', kepLK: '2/3', pamanK: 'X' });
T('8.3', 'P', { suami: 1, anakP: 1, sdrLA: 1, kepLK: 1 }, { suami: '1/4', anakP: '1/2', sdrLA: '1/4', kepLK: 'X' });
T('8.4', 'L', { anakP: 1, cucuP: 1, sdrPK: 1, sdrLA: 1 }, { anakP: '1/2', cucuP: '1/6', sdrPK: '1/3', sdrLA: 'X' });
T('8.5', 'L', { ibu: 1, sdrLA: 1, sdrPA: 2 }, { ibu: '1/6', sdrLA: '5/12', sdrPA: '5/24' });
T('9.1', 'L', { ayah: 1, ibu: 1, sdrPK: 2 }, { sdrPK: 'X', ibu: '1/6', ayah: '5/6' });
T('9.3/10.2 Laila', 'P', { suami: 1, ibu: 1, anakP: 1, sdrLK: 2, nenekIbu: 1, sdrPI: 1, pamanK: 1 }, { suami: '1/4', ibu: '1/6', anakP: '1/2', sdrLK: '1/24', nenekIbu: 'X', sdrPI: 'X', pamanK: 'X' }, { am: 12, denom: 24 });
T('10.3', 'L', { istri: 2, anakP: 3, pamanK: 1 }, { istri: '1/16', anakP: '2/9', pamanK: '5/24' }, { am: 24, denom: 144 });
T('10.5 Umar', 'L', { istri: 1, ayah: 1, ibu: 1, nenekIbu: 1, anakL: 1, anakP: 2, sdrLK: 2 }, { istri: '1/8', ayah: '1/6', ibu: '1/6', anakL: '13/48', anakP: '13/96', nenekIbu: 'X', sdrLK: 'X' }, { am: 24, denom: 96 });
// Bab 11
T('11.1 aul7', 'P', { suami: 1, sdrPK: 2 }, { suami: '3/7', sdrPK: '2/7' }, { am: 6, aul: 7 });
T('11.2 minbariyyah', 'L', { istri: 1, anakP: 2, ayah: 1, ibu: 1 }, { istri: '1/9', anakP: '8/27', ayah: '4/27', ibu: '4/27' }, { am: 24, aul: 27 });
T('11.3 radd', 'L', { ibu: 1, anakP: 1 }, { ibu: '1/4', anakP: '3/4' });
T('11.4 radd istri', 'L', { istri: 1, anakP: 1, ibu: 1 }, { istri: '1/8', anakP: '21/32', ibu: '7/32' });
T('11.5a gharrawain suami', 'P', { suami: 1, ayah: 1, ibu: 1 }, { suami: '1/2', ibu: '1/6', ayah: '1/3' });
T('11.5b gharrawain istri', 'L', { istri: 1, ayah: 1, ibu: 1 }, { istri: '1/4', ibu: '1/4', ayah: '1/2' });
T('11.6 musyarakah', 'P', { suami: 1, ibu: 1, sdrLI: 2, sdrLK: 1 }, { suami: '1/2', ibu: '1/6', sdrLI: '1/9', sdrLK: '1/9' });
T('11.7 kakek+1sdr', 'L', { kakek: 1, sdrLK: 1 }, { kakek: '1/2', sdrLK: '1/2' });
T('11.8 kakek+3sdr', 'L', { kakek: 1, sdrLK: 3 }, { kakek: '1/3', sdrLK: '2/9' });
T('11.9 kakek furudh', 'P', { suami: 1, ibu: 1, kakek: 1, sdrLK: 3 }, { suami: '1/2', ibu: '1/6', kakek: '1/6', sdrLK: '1/18' });
T('11.10 akdariyyah', 'P', { suami: 1, ibu: 1, kakek: 1, sdrPK: 1 }, { suami: '1/3', ibu: '2/9', kakek: '8/27', sdrPK: '4/27' });
// Bab 12 & 13
T('12.2 bayi L', 'L', { istri: 1, ayah: 1, anakL: 1 }, { istri: '1/8', ayah: '1/6', anakL: '17/24' });
T('12.2 bayi P', 'L', { istri: 1, ayah: 1, anakP: 1 }, { istri: '1/8', ayah: '3/8', anakP: '1/2' });
T('13 lapis2', 'L', { istri: 1, ibu: 1, anakL: 1, sdrLK: 1, sdrPK: 1 }, { istri: '1/8', ibu: '1/6', anakL: '17/24', sdrLK: 'X', sdrPK: 'X' }, { am: 24 });
// Bab 14
T('K1', 'P', { suami: 1, ayah: 1, ibu: 1, anakL: 1, anakP: 1 }, { suami: '1/4', ayah: '1/6', ibu: '1/6', anakL: '5/18', anakP: '5/36' }, { am: 12, denom: 36 });
T('K2', 'L', { ayah: 1, ibu: 1, anakP: 2 }, { anakP: '1/3', ibu: '1/6', ayah: '1/6' });
T('K3', 'L', { ibu: 1, sdrLK: 1, sdrPK: 1, sdrLI: 1 }, { ibu: '1/6', sdrLI: '1/6', sdrLK: '4/9', sdrPK: '2/9' }, { denom: 18 });
T('K4', 'L', { istri: 1, sdrPK: 2, sdrLA: 1 }, { istri: '1/4', sdrPK: '1/3', sdrLA: '1/12' });
T('K5 aul8', 'P', { suami: 1, ibu: 1, sdrPK: 2 }, { suami: '3/8', ibu: '1/8', sdrPK: '1/4' }, { aul: 8 });
T('K6 radd', 'L', { ibu: 1, anakP: 2 }, { ibu: '1/5', anakP: '2/5' });
T('K8', 'L', { istri: 1, anakL: 1, anakP: 1 }, { istri: '1/8', anakL: '7/12', anakP: '7/24' }, { denom: 24 });
T('K9', 'L', { istri: 1, anakP: 1, cucuP: 1, sdrLK: 1 }, { istri: '1/8', anakP: '1/2', cucuP: '1/6', sdrLK: '5/24' });
T('L1', 'P', { suami: 1, anakP: 1, sdrLK: 1 }, { suami: '1/4', anakP: '1/2', sdrLK: '1/4' });
T('L3', 'L', { istri: 2, ibu: 1, anakL: 3 }, { istri: '1/16', ibu: '1/6', anakL: '17/72' }, { denom: 144 });
T('L4 aul8', 'P', { suami: 1, sdrLI: 1, sdrPI: 1, sdrPK: 1 }, { suami: '3/8', sdrLI: '1/8', sdrPI: '1/8', sdrPK: '3/8' });
T('L5', 'L', { anakP: 1, sdrPA: 1, pamanK: 1 }, { anakP: '1/2', sdrPA: '1/2', pamanK: 'X' });
console.log(`\n${n - fails}/${n} lulus`);
process.exit(fails ? 1 : 0);
