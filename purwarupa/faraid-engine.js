/* FAROID engine — perhitungan faraid mazhab Syafi'i (purwarupa).
 * Rujukan aturan: ebook "Dari Bingung Jadi Paham Waris" (Abu Kautsar), Bab 4–11.
 * Semua pecahan dihitung eksak (pembilang/penyebut bilangan bulat).
 */
(function (root) {
  'use strict';
  // ---------- pecahan ----------
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a || 1; };
  const lcm = (a, b) => (a / gcd(a, b)) * b;
  const F = (n, d = 1) => { if (d < 0) { n = -n; d = -d; } const g = gcd(n, d); return { n: n / g, d: d / g }; };
  const add = (a, b) => F(a.n * b.d + b.n * a.d, a.d * b.d);
  const sub = (a, b) => F(a.n * b.d - b.n * a.d, a.d * b.d);
  const mul = (a, b) => F(a.n * b.n, a.d * b.d);
  const div = (a, b) => F(a.n * b.d, a.d * b.n);
  const cmp = (a, b) => a.n * b.d - b.n * a.d;
  const ZERO = F(0), ONE = F(1);
  const fstr = f => (f.n === 0 ? '0' : f.d === 1 ? String(f.n) : `${f.n}/${f.d}`);

  // ---------- definisi ahli waris ----------
  // key, label, gender ('L'/'P'), maks jumlah
  const HEIRS = [
    { key: 'suami', label: 'Suami', g: 'L', max: 1, group: 'Pasangan', only: 'P' },
    { key: 'istri', label: 'Istri', g: 'P', max: 4, group: 'Pasangan', only: 'L' },
    { key: 'ayah', label: 'Ayah', g: 'L', max: 1, group: 'Orang tua dan leluhur' },
    { key: 'ibu', label: 'Ibu', g: 'P', max: 1, group: 'Orang tua dan leluhur' },
    { key: 'kakek', label: 'Kakek (ayahnya ayah)', g: 'L', max: 1, group: 'Orang tua dan leluhur' },
    { key: 'nenekIbu', label: 'Nenek (ibunya ibu)', g: 'P', max: 1, group: 'Orang tua dan leluhur' },
    { key: 'nenekAyah', label: 'Nenek (ibunya ayah)', g: 'P', max: 1, group: 'Orang tua dan leluhur' },
    { key: 'anakL', label: 'Anak laki-laki', g: 'L', max: 20, group: 'Keturunan' },
    { key: 'anakP', label: 'Anak perempuan', g: 'P', max: 20, group: 'Keturunan' },
    { key: 'cucuL', label: 'Cucu laki-laki (dari anak laki-laki)', g: 'L', max: 20, group: 'Keturunan' },
    { key: 'cucuP', label: 'Cucu perempuan (dari anak laki-laki)', g: 'P', max: 20, group: 'Keturunan' },
    { key: 'sdrLK', label: 'Saudara laki-laki kandung', g: 'L', max: 20, group: 'Saudara' },
    { key: 'sdrPK', label: 'Saudara perempuan kandung', g: 'P', max: 20, group: 'Saudara' },
    { key: 'sdrLA', label: 'Saudara laki-laki seayah', g: 'L', max: 20, group: 'Saudara' },
    { key: 'sdrPA', label: 'Saudara perempuan seayah', g: 'P', max: 20, group: 'Saudara' },
    { key: 'sdrLI', label: 'Saudara laki-laki seibu', g: 'L', max: 20, group: 'Saudara' },
    { key: 'sdrPI', label: 'Saudara perempuan seibu', g: 'P', max: 20, group: 'Saudara' },
    { key: 'kepLK', label: 'Keponakan laki-laki (dari saudara laki-laki kandung)', g: 'L', max: 20, group: 'Kerabat lain' },
    { key: 'kepLA', label: 'Keponakan laki-laki (dari saudara laki-laki seayah)', g: 'L', max: 20, group: 'Kerabat lain' },
    { key: 'pamanK', label: 'Paman kandung (saudara ayah)', g: 'L', max: 20, group: 'Kerabat lain' },
    { key: 'pamanA', label: 'Paman seayah (saudara ayah)', g: 'L', max: 20, group: 'Kerabat lain' },
    { key: 'sepK', label: 'Sepupu laki-laki (anak paman kandung)', g: 'L', max: 20, group: 'Kerabat lain' },
    { key: 'sepA', label: 'Sepupu laki-laki (anak paman seayah)', g: 'L', max: 20, group: 'Kerabat lain' },
  ];
  const LABEL = Object.fromEntries(HEIRS.map(h => [h.key, h.label]));

  /**
   * hitung(input) → hasil
   * input: { pewaris: 'L'|'P', heirs: {key: count}, harta: {...} }
   */
  function hitung(input) {
    const c = {}; HEIRS.forEach(h => { c[h.key] = Math.max(0, Math.min(h.max, Math.floor(+((input.heirs || {})[h.key]) || 0))); });
    if (input.pewaris === 'L') c.suami = 0; else c.istri = 0;
    const notes = [];
    const status = {}; // key -> {blockedBy?:string, share?:F, kind:string, basis:string}
    const block = (k, by) => { if (c[k] > 0) status[k] = { blocked: true, by }; };

    const fwL = c.anakL + c.cucuL > 0;               // far'u warits laki-laki
    const fwP = c.anakP + c.cucuP > 0;
    const fw = fwL || fwP;
    const hasAyah = c.ayah > 0;
    const kakekActive = !hasAyah && c.kakek > 0;
    const totalSaudara = c.sdrLK + c.sdrPK + c.sdrLA + c.sdrPA + c.sdrLI + c.sdrPI; // termasuk yang terhalang

    // ---------- 1. ḥajb ----------
    if (hasAyah) block('kakek', 'ayah');
    if (c.ibu) { block('nenekIbu', 'ibu'); block('nenekAyah', 'ibu'); }
    if (hasAyah) block('nenekAyah', 'ayah');
    if (c.anakL) { block('cucuL', 'anak laki-laki'); block('cucuP', 'anak laki-laki'); }
    if (!c.anakL && c.anakP >= 2 && c.cucuL === 0) block('cucuP', '2 anak perempuan atau lebih');
    // saudara seibu
    const seibuBlk = fw ? 'keturunan (anak/cucu)' : hasAyah ? 'ayah' : kakekActive ? 'kakek' : null;
    if (seibuBlk) { block('sdrLI', seibuBlk); block('sdrPI', seibuBlk); }
    // saudara kandung
    const kandungBlk = c.anakL ? 'anak laki-laki' : c.cucuL ? 'cucu laki-laki' : hasAyah ? 'ayah' : null;
    if (kandungBlk) { block('sdrLK', kandungBlk); block('sdrPK', kandungBlk); }
    const sdrPKmaaGhair = !kandungBlk && c.sdrLK === 0 && c.sdrPK > 0 && fwP;
    // saudara seayah
    let seayahBlk = kandungBlk || (c.sdrLK ? 'saudara laki-laki kandung' : sdrPKmaaGhair ? "saudara perempuan kandung (ʿaṣabah maʿa al-ghair)" : null);
    if (seayahBlk) { block('sdrLA', seayahBlk); block('sdrPA', seayahBlk); }
    if (!seayahBlk && c.sdrPK >= 2 && c.sdrLA === 0) block('sdrPA', '2 saudara perempuan kandung atau lebih');

    // ---------- 2. bagian pasti ----------
    const furudh = []; // {key, share(F) for whole group}
    const addF = (k, s, basis) => { furudh.push({ key: k, share: s, basis }); status[k] = { share: s, kind: 'farḍ', basis }; };

    if (c.suami) addF('suami', fw ? F(1, 4) : F(1, 2), fw ? 'Ada keturunan (farʿu wārits)' : 'Tidak ada keturunan');
    if (c.istri) addF('istri', fw ? F(1, 8) : F(1, 4), (fw ? 'Ada keturunan' : 'Tidak ada keturunan') + (c.istri > 1 ? ', dibagi rata' : ''));

    // Kasus khusus: al-Akdariyyah (suami, ibu, kakek, 1 saudara perempuan kandung/seayah; tanpa yang lain)
    const others = Object.keys(c).filter(k => c[k] > 0);
    const akdarSet = new Set(['suami', 'ibu', 'kakek']);
    const akdarSis = c.sdrPK === 1 && c.sdrPA === 0 ? 'sdrPK' : c.sdrPA === 1 && c.sdrPK === 0 ? 'sdrPA' : null;
    const isAkdariyyah = !hasAyah && c.suami && c.ibu && c.kakek && akdarSis && others.every(k => akdarSet.has(k) || k === akdarSis);

    // Gharrawain: suami/istri + ayah + ibu saja (tanpa keturunan, tanpa 2+ saudara)
    const spouse = c.suami || c.istri;
    const gharrawain = spouse && hasAyah && c.ibu && !fw && totalSaudara < 2 &&
      others.every(k => ['suami', 'istri', 'ayah', 'ibu', 'kakek', 'nenekIbu', 'nenekAyah', 'sdrLK', 'sdrPK', 'sdrLA', 'sdrPA', 'sdrLI', 'sdrPI'].includes(k));

    if (c.ibu) {
      if (fw || totalSaudara >= 2) addF('ibu', F(1, 6), fw ? 'Ada keturunan' : 'Ada dua saudara atau lebih');
      else if (gharrawain) {
        const sp = c.suami ? F(1, 2) : F(1, 4);
        addF('ibu', mul(F(1, 3), sub(ONE, sp)), 'Al-Gharrāwain: 1/3 dari sisa setelah bagian ' + (c.suami ? 'suami' : 'istri'));
        notes.push({ t: 'Kasus al-Gharrāwain', d: 'Ibu mendapat 1/3 dari sisa, bukan 1/3 dari seluruh harta (Bab 11.3; KHI Pasal 178 ayat 2).' });
      } else addF('ibu', F(1, 3), 'Tidak ada keturunan dan kurang dari dua saudara');
    }
    // nenek
    const nenekList = ['nenekIbu', 'nenekAyah'].filter(k => c[k] && !status[k]);
    if (nenekList.length) {
      const s = F(1, 6);
      if (nenekList.length === 1) addF(nenekList[0], s, 'Tidak ada ibu');
      else { furudh.push({ key: '_nenek', members: nenekList, share: s }); nenekList.forEach(k => { status[k] = { share: div(s, F(2)), kind: 'farḍ', basis: '1/6 dibagi dua nenek' }; }); }
    }
    // ayah / kakek (bagian pasti 1/6 bila ada keturunan)
    const fatherKey = hasAyah ? 'ayah' : kakekActive ? 'kakek' : null;
    if (fatherKey && fw) addF(fatherKey, F(1, 6), fwL ? 'Ada anak/cucu laki-laki' : 'Ada anak/cucu perempuan (ditambah sisa)');

    // anak perempuan
    if (c.anakP && !c.anakL) addF('anakP', c.anakP === 1 ? F(1, 2) : F(2, 3), c.anakP === 1 ? 'Satu orang, tanpa anak laki-laki' : 'Dua orang atau lebih, tanpa anak laki-laki');
    // cucu perempuan
    if (c.cucuP && !status.cucuP && !c.anakL && c.cucuL === 0) {
      if (c.anakP === 1) addF('cucuP', F(1, 6), 'Penyempurna 2/3 bersama satu anak perempuan');
      else if (c.anakP === 0) addF('cucuP', c.cucuP === 1 ? F(1, 2) : F(2, 3), 'Menempati posisi anak perempuan');
    }
    // saudara seibu
    const nSeibu = (status.sdrLI ? 0 : c.sdrLI) + (status.sdrPI ? 0 : c.sdrPI);
    // al-Musyarrakah
    const musyarakah = nSeibu >= 2 && c.sdrLK > 0 && !kandungBlk && !kakekActive && c.suami && (c.ibu || nenekList.length) && !fw;
    if (nSeibu) {
      const s = nSeibu === 1 ? F(1, 6) : F(1, 3);
      const members = ['sdrLI', 'sdrPI'].filter(k => c[k] && !status[k]);
      if (musyarakah) members.push('sdrLK', 'sdrPK');
      furudh.push({ key: '_seibu', members: members.filter(k => c[k]), share: s, equal: true });
      const heads = members.filter(k => c[k]).reduce((a, k) => a + c[k], 0);
      members.filter(k => c[k]).forEach(k => { status[k] = { share: mul(s, F(c[k], heads)), kind: 'farḍ', basis: musyarakah ? 'Al-Musyarrakah: berbagi 1/3 sama rata' : (nSeibu === 1 ? 'Satu saudara seibu' : 'Dua atau lebih, dibagi sama rata') }; });
      if (musyarakah) notes.push({ t: 'Kasus al-Musyarrakah', d: 'Saudara kandung ikut berbagi 1/3 sama rata bersama saudara seibu (mazhab Syafiʿi, Bab 11.4).' });
    }
    // saudara perempuan kandung (bila tidak ada saudara laki-laki kandung, tidak ada keturunan)
    if (c.sdrPK && !status.sdrPK && c.sdrLK === 0 && !fwP && !kakekActive) addF('sdrPK', c.sdrPK === 1 ? F(1, 2) : F(2, 3), c.sdrPK === 1 ? 'Satu orang' : 'Dua orang atau lebih');
    // saudara perempuan seayah
    if (c.sdrPA && !status.sdrPA && c.sdrLA === 0 && !fwP && !kakekActive) {
      if (c.sdrPK === 1) addF('sdrPA', F(1, 6), 'Penyempurna 2/3 bersama satu saudara perempuan kandung');
      else if (c.sdrPK === 0) addF('sdrPA', c.sdrPA === 1 ? F(1, 2) : F(2, 3), c.sdrPA === 1 ? 'Satu orang' : 'Dua orang atau lebih');
    }

    // ---------- 3. ʿaṣabah ----------
    let asabah = null; // {members:[{key, weight}], basis}
    const W = (k, g) => ({ key: k, weight: (g || HEIRS.find(h => h.key === k).g) === 'L' ? 2 : 1 });
    const kakekWithSaudara = kakekActive && !fwL && !isAkdariyyah && ((c.sdrLK + c.sdrPK) > 0 || (c.sdrLA + c.sdrPA) > 0);
    if (c.anakL) asabah = { members: [W('anakL'), ...(c.anakP ? [W('anakP')] : [])], basis: 'Anak laki-laki' + (c.anakP ? ' bersama anak perempuan (2 : 1)' : '') };
    else if (c.cucuL) asabah = { members: [W('cucuL'), ...(c.cucuP && !status.cucuP?.share ? [W('cucuP')] : [])], basis: 'Cucu laki-laki' + (c.cucuP && !status.cucuP?.share ? ' bersama cucu perempuan (2 : 1)' : '') };
    else if (fatherKey && !kakekWithSaudara) asabah = { members: [{ key: fatherKey, weight: 1 }], basis: fw ? '1/6 ditambah sisa' : 'Penerima sisa' };
    else if (!kandungBlk && c.sdrLK && !musyarakah && !kakekWithSaudara) asabah = { members: [W('sdrLK'), ...(c.sdrPK ? [W('sdrPK')] : [])], basis: 'Saudara laki-laki kandung' + (c.sdrPK ? ' bersama saudara perempuan kandung (2 : 1)' : '') };
    else if (sdrPKmaaGhair && !kakekWithSaudara) asabah = { members: [{ key: 'sdrPK', weight: 1 }], basis: 'ʿAṣabah maʿa al-ghair (bersama anak/cucu perempuan)' };
    else if (!seayahBlk && c.sdrLA && !kakekWithSaudara) asabah = { members: [W('sdrLA'), ...(c.sdrPA && !status.sdrPA ? [W('sdrPA')] : [])], basis: 'Saudara laki-laki seayah' + (c.sdrPA && !status.sdrPA ? ' bersama saudara perempuan seayah (2 : 1)' : '') };
    else if (!seayahBlk && c.sdrPA && fwP && c.sdrPK === 0 && !kakekWithSaudara) asabah = { members: [{ key: 'sdrPA', weight: 1 }], basis: 'ʿAṣabah maʿa al-ghair (bersama anak/cucu perempuan)' };
    else if (!kakekWithSaudara) {
      const chain = ['kepLK', 'kepLA', 'pamanK', 'pamanA', 'sepK', 'sepA'];
      const first = chain.find(k => c[k]);
      if (first) asabah = { members: [{ key: first, weight: 1 }], basis: 'Kerabat laki-laki terdekat (ʿaṣabah bi an-nafsi)' };
    }
    // mencoret ʿaṣabah bi an-nafsi yang lebih jauh
    const nafsiOrder = ['anakL', 'cucuL', 'ayah', 'kakek', 'sdrLK', 'sdrLA', 'kepLK', 'kepLA', 'pamanK', 'pamanA', 'sepK', 'sepA'];
    const topKey = asabah ? asabah.members[0].key : (kakekWithSaudara ? 'kakek' : (isAkdariyyah ? 'kakek' : null));
    const levelOf = k => (k === 'sdrPK' ? nafsiOrder.indexOf('sdrLK') : k === 'sdrPA' ? nafsiOrder.indexOf('sdrLA') : nafsiOrder.indexOf(k));
    const higherHolder = fatherKey || (c.anakL ? 'anakL' : c.cucuL ? 'cucuL' : null);
    nafsiOrder.forEach(k => {
      if (!c[k] || status[k]) return;
      if (asabah && asabah.members.some(m => m.key === k)) return;
      if (k === 'kakek' && (kakekWithSaudara || isAkdariyyah)) return;
      if (['sdrLK', 'sdrLA'].includes(k) && (kakekWithSaudara || musyarakah)) return;
      const lv = levelOf(k), top = topKey ? levelOf(topKey) : -1;
      if (top >= 0 && lv > top) block(k, LABEL[topKey].toLowerCase());
      else if (!topKey && higherHolder) block(k, LABEL[higherHolder].toLowerCase());
    });
    ['kepLK', 'kepLA', 'pamanK', 'pamanA', 'sepK', 'sepA'].forEach(k => { if (c[k] && !status[k] && kakekActive && !(asabah && asabah.members[0].key === k)) block(k, 'kakek'); });

    // ---------- 4. kakek bersama saudara / akdariyyah ----------
    let special = null;
    if (isAkdariyyah) {
      // suami 1/2, ibu 1/3, kakek 1/6, saudari 1/2 → ʿaul 9, lalu kakek+saudari (4) dibagi 2:1 → 27
      status.suami = { share: F(9, 27), kind: 'farḍ', basis: 'Al-Akdariyyah' };
      status.ibu = { share: F(6, 27), kind: 'farḍ', basis: 'Al-Akdariyyah' };
      status.kakek = { share: F(8, 27), kind: 'khusus', basis: 'Al-Akdariyyah: gabungan dengan saudara perempuan, 2 : 1' };
      status[akdarSis] = { share: F(4, 27), kind: 'khusus', basis: 'Al-Akdariyyah' };
      special = { aul: true, am: 6, amAul: 9, final: 27 };
      notes.push({ t: 'Kasus al-Akdariyyah', d: 'Diselesaikan menurut Zaid bin Tsābit: ʿaul ke 9, lalu taṣḥīḥ ke 27 (Bab 11.6).' });
    }

    // total furudh
    let totalF = ZERO;
    Object.keys(status).forEach(k => { if (status[k].share && status[k].kind === 'farḍ') totalF = add(totalF, status[k].share); });

    if (kakekWithSaudara && !special) {
      if (status.kakek && status.kakek.kind === 'farḍ') { totalF = sub(totalF, status.kakek.share); delete status.kakek; }
      const rem = sub(ONE, totalF);
      // saudara yang ikut dihitung: kandung bila ada, jika tidak seayah (penyederhanaan muʿāddah)
      const useK = (c.sdrLK + c.sdrPK) > 0;
      const sL = useK ? 'sdrLK' : 'sdrLA', sP = useK ? 'sdrPK' : 'sdrPA';
      if (useK && (c.sdrLA + c.sdrPA) > 0) {
        block('sdrLA', 'saudara kandung'); block('sdrPA', 'saudara kandung');
        notes.push({ t: 'Perhatian: kasus muʿāddah', d: 'Ada saudara kandung dan seayah bersama kakek. Kalkulator menyederhanakan dengan tidak menghitung saudara seayah. Konsultasikan dengan ahli faraid (Bab 11.5).' });
      }
      const jat = 2 * c[sL] + c[sP];
      const hasFurudh = totalF.n > 0;
      const opts = [{ name: 'Berbagi (muqāsamah)', v: mul(rem, F(2, 2 + jat)) }];
      if (hasFurudh) { opts.push({ name: '1/3 dari sisa', v: mul(rem, F(1, 3)) }, { name: '1/6 dari seluruh harta', v: F(1, 6) }); }
      else opts.push({ name: '1/3 dari seluruh harta', v: F(1, 3) });
      let best = opts[0]; opts.forEach(o => { if (cmp(o.v, best.v) > 0) best = o; });
      if (cmp(best.v, rem) > 0) best = { name: '1/6 (ʿaul)', v: F(1, 6) };
      status.kakek = { share: best.v, kind: 'khusus', basis: `Kakek bersama saudara: dipilih "${best.name}" (terbesar)` };
      const restS = sub(rem, best.v);
      const members = [sL, sP].filter(k => c[k]);
      if (members.length && cmp(restS, ZERO) > 0) asabah = { members: members.map(k => W(k)), basis: 'Sisa setelah bagian kakek (2 : 1)', pool: restS };
      else members.forEach(k => { status[k] = { share: ZERO, kind: 'ʿaṣabah', basis: 'Harta habis' }; });
      totalF = add(totalF, best.v);
      notes.push({ t: 'Kakek bersama saudara', d: 'Mengikuti pendapat Zaid bin Tsābit (mazhab Syafiʿi): kakek mendapat pilihan terbaik (Bab 11.5). Opsi: ' + opts.map(o => `${o.name} = ${fstr(o.v)}`).join('; ') + '.' });
    }

    // ---------- 5. ʿaul / radd / sisa ----------
    let aul = false, radd = false, sisaBaitulMal = ZERO;
    const shares = {}; // key -> F (untuk seluruh kelompok)
    Object.keys(status).forEach(k => { if (status[k].share) shares[k] = status[k].share; });
    const fard = { ...shares };
    let totalShares = ZERO; Object.values(shares).forEach(s => { totalShares = add(totalShares, s); });

    if (special) { /* sudah final */ }
    else if (cmp(totalShares, ONE) > 0) {
      aul = true;
      Object.keys(shares).forEach(k => { shares[k] = div(shares[k], totalShares); });
      if (asabah) asabah.members.forEach(m => {
        if (shares[m.key] && shares[m.key].n) { status[m.key].basis = (status[m.key].basis || '') + '; tidak ada sisa'; }
        else { status[m.key] = { share: ZERO, kind: 'ʿaṣabah', basis: asabah.basis + ' — harta habis' }; shares[m.key] = ZERO; }
      });
      notes.push({ t: 'ʿAul', d: `Jumlah bagian pasti (${fstr(totalShares)}) melebihi harta, sehingga semua bagian dikurangi secara seimbang (Bab 11.1; KHI Pasal 192).` });
    } else {
      const rem = asabah && asabah.pool ? asabah.pool : sub(ONE, totalShares);
      if (asabah) {
        const totalW = asabah.members.reduce((a, m) => a + m.weight * c[m.key], 0);
        asabah.members.forEach(m => {
          const s = mul(rem, F(m.weight * c[m.key], totalW));
          const prev = shares[m.key] || ZERO;
          shares[m.key] = add(prev, s);
          status[m.key] = { share: shares[m.key], kind: prev.n ? 'farḍ + sisa' : 'ʿaṣabah', basis: (status[m.key] && status[m.key].basis && prev.n ? status[m.key].basis + '; ' : '') + asabah.basis };
        });
      } else if (rem.n > 0) {
        const rk = Object.keys(shares).filter(k => !['suami', 'istri'].includes(k) && shares[k].n > 0);
        if (rk.length) {
          radd = true;
          let base = ZERO; rk.forEach(k => { base = add(base, shares[k]); });
          rk.forEach(k => { shares[k] = add(shares[k], mul(rem, div(shares[k], base))); });
          notes.push({ t: 'Radd', d: 'Sisa harta dikembalikan kepada pemilik bagian pasti sesuai perbandingan bagiannya. Suami/istri tidak ikut radd menurut mazhab Syafiʿi (Bab 11.2). KHI Pasal 193 tidak tegas soal ini.' });
        } else {
          sisaBaitulMal = rem;
          notes.push({ t: 'Sisa harta', d: `Masih tersisa ${fstr(rem)} tanpa penerima. Menurut mazhab Syafiʿi generasi belakangan, sisa diberikan kepada dzawil arḥām (kerabat jauh) bila ada; jika tidak ada, ke Baitul Māl (Bab 12.1).` });
        }
      }
    }

    // ---------- 6. per orang + asal masalah ----------
    const rows = [];
    HEIRS.forEach(h => {
      const n = c[h.key]; if (!n) return;
      const st = status[h.key] || {};
      if (st.blocked) { rows.push({ key: h.key, label: h.label, n, blocked: true, by: st.by }); return; }
      const g = shares[h.key] || ZERO;
      rows.push({ key: h.key, label: h.label, n, group: g, each: div(g, F(n)), fard: fard[h.key] || null, kind: st.kind || '—', basis: st.basis || '' });
    });
    let denom = 1; rows.forEach(r => { if (r.each) denom = lcm(denom, r.each.d); });
    if (sisaBaitulMal.n) denom = lcm(denom, sisaBaitulMal.d);
    // asal masalah klasik (sebelum taṣḥīḥ): KPK penyebut bagian pasti per kelompok
    const amParts = furudh.filter(x => x.share && x.share.n && (x.key.startsWith('_') || (status[x.key] && !status[x.key].blocked && status[x.key].kind !== 'khusus')));
    let am = 1; amParts.forEach(x => { am = lcm(am, x.share.d); });
    if (!amParts.length && asabah) am = asabah.members.reduce((a, m) => a + m.weight * c[m.key], 0);
    let amAul = null; if (aul) { let s = 0; amParts.forEach(x => { s += x.share.n * (am / x.share.d); }); amAul = s; }
    if (special) { am = special.am; amAul = special.amAul; }
    rows.forEach(r => { if (r.each) { r.sahamEach = r.each.n * (denom / r.each.d); r.sahamGroup = r.sahamEach * r.n; } });

    // khusus: catatan KHI
    const khi = [];
    if (input.harta && +input.harta.bersama > 0) khi.push('Separuh harta bersama dipisahkan untuk pasangan yang masih hidup sebelum dibagi waris (KHI Pasal 96).');
    if (c.cucuL + c.cucuP === 0) khi.push('Jika ada anak pewaris yang wafat lebih dulu dan meninggalkan anak (cucu pewaris), menurut KHI Pasal 185 cucu tersebut dapat menjadi ahli waris pengganti. Kalkulator ini mengikuti fiqih Syafiʿi (Bab 12.6).');

    return { counts: c, rows, denom, am, amAul, aul: aul || !!(special && special.aul), radd, sisa: sisaBaitulMal, notes, khi, tashih: denom !== (amAul || am) };
  }

  // ---------- harta ----------
  function hartaBersih(h) {
    const v = k => Math.max(0, +h[k] || 0);
    const bagianPasangan = v('bersama') / 2;
    const peninggalan = v('bersama') - bagianPasangan + v('bawaan');
    const setelahJenazah = Math.max(0, peninggalan - v('jenazah'));
    const setelahUtang = Math.max(0, setelahJenazah - v('utang'));
    const batasWasiat = setelahUtang / 3;
    const wasiat = Math.min(v('wasiat'), batasWasiat);
    return { bagianPasangan, peninggalan, setelahJenazah, setelahUtang, batasWasiat, wasiat, wasiatDipotong: v('wasiat') > batasWasiat, bersih: setelahUtang - wasiat };
  }

  root.Faraid = { HEIRS, LABEL, hitung, hartaBersih, F, fstr, mul, add };
  if (typeof module !== 'undefined') module.exports = root.Faraid;
})(typeof window !== 'undefined' ? window : globalThis);
