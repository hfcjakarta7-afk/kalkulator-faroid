// Langkah 2: ḥajb ḥirmān — siapa terhalang total oleh siapa (Bab 9).
// Pencoretan ʿaṣabah bi an-nafsi yang lebih jauh dilakukan belakangan di asabah.js.

export function hajb(ctx) {
  const { c, block } = ctx;

  ctx.fwL = c.anakL + c.cucuL > 0; // farʿu wārits laki-laki
  ctx.fwP = c.anakP + c.cucuP > 0;
  ctx.fw = ctx.fwL || ctx.fwP;
  ctx.hasAyah = c.ayah > 0;
  ctx.kakekActive = !ctx.hasAyah && c.kakek > 0;
  // termasuk saudara yang terhalang: mereka tetap mengurangi bagian ibu (ḥajb nuqṣān)
  ctx.totalSaudara = c.sdrLK + c.sdrPK + c.sdrLA + c.sdrPA + c.sdrLI + c.sdrPI;

  const { fw, hasAyah, kakekActive, fwP } = ctx;

  if (hasAyah) block('kakek', 'ayah');
  if (c.ibu) { block('nenekIbu', 'ibu'); block('nenekAyah', 'ibu'); }
  if (hasAyah) block('nenekAyah', 'ayah');
  if (c.anakL) { block('cucuL', 'anak laki-laki'); block('cucuP', 'anak laki-laki'); }
  if (!c.anakL && c.anakP >= 2 && c.cucuL === 0) block('cucuP', '2 anak perempuan atau lebih');

  // saudara seibu
  const seibuBlk = fw ? 'keturunan (anak/cucu)' : hasAyah ? 'ayah' : kakekActive ? 'kakek' : null;
  if (seibuBlk) { block('sdrLI', seibuBlk); block('sdrPI', seibuBlk); }

  // saudara kandung
  ctx.kandungBlk = c.anakL ? 'anak laki-laki' : c.cucuL ? 'cucu laki-laki' : hasAyah ? 'ayah' : null;
  if (ctx.kandungBlk) { block('sdrLK', ctx.kandungBlk); block('sdrPK', ctx.kandungBlk); }
  ctx.sdrPKmaaGhair = !ctx.kandungBlk && c.sdrLK === 0 && c.sdrPK > 0 && fwP;

  // saudara seayah
  ctx.seayahBlk = ctx.kandungBlk
    || (c.sdrLK ? 'saudara laki-laki kandung'
      : ctx.sdrPKmaaGhair ? 'saudara perempuan kandung (ʿaṣabah maʿa al-ghair)' : null);
  if (ctx.seayahBlk) { block('sdrLA', ctx.seayahBlk); block('sdrPA', ctx.seayahBlk); }
  if (!ctx.seayahBlk && c.sdrPK >= 2 && c.sdrLA === 0) block('sdrPA', '2 saudara perempuan kandung atau lebih');
}
