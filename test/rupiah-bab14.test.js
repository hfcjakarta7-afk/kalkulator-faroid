// Angka rupiah contoh kasus harus sama dengan tabel di ebook Bab 14.
import { describe, it, expect } from 'vitest';
import { hitung, hartaBersih, bagiRupiah, bagianRupiah, kompensasi, munasakhah, lapisEfektif } from '../src/engine/index.js';
import { PRESETS } from '../src/ui/presets.js';

const preset = awal => PRESETS.find(p => p.nama.startsWith(awal));
function rupiah(p) {
  const r = hitung({ pewaris: p.pw, heirs: p.heirs, mahrum: p.mahrum });
  const H = hartaBersih(p.harta).bersih;
  const bag = bagiRupiah(r, H);
  return { r, H, bag, per: Object.fromEntries(bag.rows.map(x => [x.key, x.perOrang])) };
}

describe('rupiah Bab 14', () => {
  it('Kasus 1', () => {
    const { per, bag } = rupiah(preset('Bab 14 · Kasus 1'));
    expect(per).toEqual({ suami: 90e6, ayah: 60e6, ibu: 60e6, anakL: 100e6, anakP: 50e6 });
    expect(bag.selisihPembulatan).toBe(0);
  });
  it('Kasus 2', () => expect(rupiah(preset('Bab 14 · Kasus 2')).per).toEqual({ ayah: 30e6, ibu: 30e6, anakP: 60e6 }));
  it('Kasus 3', () => expect(rupiah(preset('Bab 14 · Kasus 3')).per).toEqual({ ibu: 15e6, sdrLI: 15e6, sdrLK: 40e6, sdrPK: 20e6 }));
  it('Kasus 4', () => expect(rupiah(preset('Bab 14 · Kasus 4')).per).toEqual({ istri: 30e6, sdrPK: 40e6, sdrLA: 10e6 }));
  it('Kasus 5', () => expect(rupiah(preset('Bab 14 · Kasus 5')).per).toEqual({ suami: 60e6, ibu: 20e6, sdrPK: 40e6 }));
  it('Kasus 6', () => expect(rupiah(preset('Bab 14 · Kasus 6')).per).toEqual({ ibu: 20e6, anakP: 40e6 }));
  it('Kasus 7 + kompensasi', () => {
    const p = preset('Bab 14 · Kasus 7');
    const { r, H, per } = rupiah(p);
    expect(per).toEqual({ istri: 80e6, anakL: 280e6, anakP: 140e6 });
    const k = kompensasi(r, H, p.barang);
    const s = Object.fromEntries(k.penerima.map(x => [x.id, x.selisih]));
    expect(s).toEqual({ 'istri#1': 0, 'anakL#1': -80e6, 'anakP#1': -60e6, 'anakP#2': 140e6 });
  });
  it('Kasus 8 (anak beda agama maḥrūm)', () => {
    const { per, r } = rupiah(preset('Bab 14 · Kasus 8'));
    expect(per).toEqual({ istri: 30e6, anakL: 140e6, anakP: 70e6 });
    expect(r.mahrum.map(m => m.key)).toEqual(['anakL']);
    expect(r.denom).toBe(24);
  });
  it('Kasus 9', () => expect(rupiah(preset('Bab 14 · Kasus 9')).per).toEqual({ istri: 30e6, anakP: 120e6, cucuP: 40e6, sdrLK: 50e6 }));
  it('Kasus 10 (munāsakhah, saran tautan otomatis): tiap anak Rp 100 juta', () => {
    const p = preset('Bab 14 · Kasus 10');
    const m1 = { pewaris: p.pw, heirs: p.heirs };
    const m = munasakhah(m1, lapisEfektif(m1, p.lapis));
    const hidup = m.orang.filter(o => o.saham > 0);
    expect(hidup.map(o => [o.id, bagianRupiah(200e6, o.each)])).toEqual([['1:anakL#1', 100e6], ['1:anakL#2', 100e6]]);
  });
  it('Pak Rahmat (Bab 13.3) dari contoh kasus: Rp 1 juta per saham', () => {
    const p = preset('Munāsakhah: keluarga Pak Rahmat');
    const m1 = { pewaris: p.pw, heirs: p.heirs };
    const m = munasakhah(m1, lapisEfektif(m1, p.lapis));
    const per = Object.fromEntries(m.orang.filter(o => o.saham > 0).map(o => [o.id, bagianRupiah(480e6, o.each)]));
    expect(per).toEqual({ '1:istri#1': 88e6, '1:anakL#2': 168e6, '1:anakP#1': 84e6, '2:istri#1': 21e6, '2:anakL#1': 119e6 });
  });
  it('semua contoh: dibagikan + selisih = harta bersih', () => {
    PRESETS.forEach(p => {
      const { H, bag } = rupiah(p);
      expect(bag.dibagikan + bag.selisihPembulatan + bag.sisaTanpaPenerima, p.nama).toBe(H);
    });
  });
});
