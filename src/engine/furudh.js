// Langkah 3a: bagian pasti (al-furūḍ al-muqaddarah), Bab 5–7.
// Termasuk deteksi al-Gharrāwain, al-Musyarrakah, dan al-Akdariyyah (Bab 11).
import { F, mul, sub, div, ONE } from './pecahan.js';

export function furudh(ctx) {
  const { c, notes, status, fw, fwL, fwP, hasAyah, kakekActive, totalSaudara, kandungBlk } = ctx;
  const addF = (k, s, basis) => { ctx.furudh.push({ key: k, share: s, basis }); status[k] = { share: s, kind: 'farḍ', basis }; };

  if (c.suami) addF('suami', fw ? F(1, 4) : F(1, 2), fw ? 'Ada keturunan (farʿu wārits)' : 'Tidak ada keturunan');
  if (c.istri) addF('istri', fw ? F(1, 8) : F(1, 4), (fw ? 'Ada keturunan' : 'Tidak ada keturunan') + (c.istri > 1 ? ', dibagi rata' : ''));

  // al-Akdariyyah: suami, ibu, kakek, satu saudara perempuan kandung/seayah; tanpa yang lain
  const others = Object.keys(c).filter(k => c[k] > 0);
  const akdarSet = new Set(['suami', 'ibu', 'kakek']);
  ctx.akdarSis = c.sdrPK === 1 && c.sdrPA === 0 ? 'sdrPK' : c.sdrPA === 1 && c.sdrPK === 0 ? 'sdrPA' : null;
  ctx.isAkdariyyah = !!(!hasAyah && c.suami && c.ibu && c.kakek && ctx.akdarSis
    && others.every(k => akdarSet.has(k) || k === ctx.akdarSis));

  // al-Gharrāwain: suami/istri + ayah + ibu (tanpa keturunan, kurang dari 2 saudara)
  const spouse = c.suami || c.istri;
  const gharrawain = spouse && hasAyah && c.ibu && !fw && totalSaudara < 2
    && others.every(k => ['suami', 'istri', 'ayah', 'ibu', 'kakek', 'nenekIbu', 'nenekAyah', 'sdrLK', 'sdrPK', 'sdrLA', 'sdrPA', 'sdrLI', 'sdrPI'].includes(k));

  if (c.ibu) {
    if (fw || totalSaudara >= 2) addF('ibu', F(1, 6), fw ? 'Ada keturunan' : 'Ada dua saudara atau lebih');
    else if (gharrawain) {
      const sp = c.suami ? F(1, 2) : F(1, 4);
      addF('ibu', mul(F(1, 3), sub(ONE, sp)), 'Al-Gharrāwain: 1/3 dari sisa setelah bagian ' + (c.suami ? 'suami' : 'istri'));
      notes.push({ t: 'Kasus al-Gharrāwain', d: 'Ibu mendapat 1/3 dari sisa, bukan 1/3 dari seluruh harta (Bab 11.3; KHI Pasal 178 ayat 2).', bab: '11.3' });
    } else addF('ibu', F(1, 3), 'Tidak ada keturunan dan kurang dari dua saudara');
  }

  // nenek: 1/6, dibagi rata bila dua
  ctx.nenekList = ['nenekIbu', 'nenekAyah'].filter(k => c[k] && !status[k]);
  if (ctx.nenekList.length === 1) addF(ctx.nenekList[0], F(1, 6), 'Tidak ada ibu');
  else if (ctx.nenekList.length === 2) {
    const s = F(1, 6);
    ctx.furudh.push({ key: '_nenek', members: ctx.nenekList, share: s });
    ctx.nenekList.forEach(k => { status[k] = { share: div(s, F(2)), kind: 'farḍ', basis: '1/6 dibagi dua nenek' }; });
  }

  // ayah / kakek: 1/6 bila ada keturunan
  ctx.fatherKey = hasAyah ? 'ayah' : kakekActive ? 'kakek' : null;
  if (ctx.fatherKey && fw) addF(ctx.fatherKey, F(1, 6), fwL ? 'Ada anak/cucu laki-laki' : 'Ada anak/cucu perempuan (ditambah sisa)');

  // anak perempuan
  if (c.anakP && !c.anakL) addF('anakP', c.anakP === 1 ? F(1, 2) : F(2, 3), c.anakP === 1 ? 'Satu orang, tanpa anak laki-laki' : 'Dua orang atau lebih, tanpa anak laki-laki');

  // cucu perempuan
  if (c.cucuP && !status.cucuP && !c.anakL && c.cucuL === 0) {
    if (c.anakP === 1) addF('cucuP', F(1, 6), 'Penyempurna 2/3 bersama satu anak perempuan');
    else if (c.anakP === 0) addF('cucuP', c.cucuP === 1 ? F(1, 2) : F(2, 3), 'Menempati posisi anak perempuan');
  }

  // saudara seibu (+ al-Musyarrakah)
  const nSeibu = (status.sdrLI ? 0 : c.sdrLI) + (status.sdrPI ? 0 : c.sdrPI);
  ctx.musyarakah = !!(nSeibu >= 2 && c.sdrLK > 0 && !kandungBlk && !kakekActive && c.suami && (c.ibu || ctx.nenekList.length) && !fw);
  if (nSeibu) {
    const s = nSeibu === 1 ? F(1, 6) : F(1, 3);
    const members = ['sdrLI', 'sdrPI'].filter(k => c[k] && !status[k]);
    if (ctx.musyarakah) members.push('sdrLK', 'sdrPK');
    const present = members.filter(k => c[k]);
    ctx.furudh.push({ key: '_seibu', members: present, share: s, equal: true });
    const heads = present.reduce((a, k) => a + c[k], 0);
    present.forEach(k => {
      status[k] = {
        share: mul(s, F(c[k], heads)), kind: 'farḍ',
        basis: ctx.musyarakah ? 'Al-Musyarrakah: berbagi 1/3 sama rata' : (nSeibu === 1 ? 'Satu saudara seibu' : 'Dua atau lebih, dibagi sama rata'),
      };
    });
    if (ctx.musyarakah) notes.push({ t: 'Kasus al-Musyarrakah', d: 'Saudara kandung ikut berbagi 1/3 sama rata bersama saudara seibu (mazhab Syafiʿi, Bab 11.4).', bab: '11.4' });
  }

  // saudara perempuan kandung (tanpa saudara laki-laki kandung, tanpa keturunan perempuan)
  if (c.sdrPK && !status.sdrPK && c.sdrLK === 0 && !fwP && !kakekActive) addF('sdrPK', c.sdrPK === 1 ? F(1, 2) : F(2, 3), c.sdrPK === 1 ? 'Satu orang' : 'Dua orang atau lebih');

  // saudara perempuan seayah
  if (c.sdrPA && !status.sdrPA && c.sdrLA === 0 && !fwP && !kakekActive) {
    if (c.sdrPK === 1) addF('sdrPA', F(1, 6), 'Penyempurna 2/3 bersama satu saudara perempuan kandung');
    else if (c.sdrPK === 0) addF('sdrPA', c.sdrPA === 1 ? F(1, 2) : F(2, 3), c.sdrPA === 1 ? 'Satu orang' : 'Dua orang atau lebih');
  }
}
