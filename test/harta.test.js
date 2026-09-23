import { describe, it, expect } from 'vitest';
import { hitung, hartaBersih, bagiRupiah, kompensasi, susunLangkah } from '../src/engine/index.js';

describe('harta bersih (Bab 3)', () => {
  it('kasus Pak Umar (Bab 10.5)', () => {
    const hb = hartaBersih({ bersama: 500000000, bawaan: 100000000, jenazah: 5000000, utang: 37000000, wasiat: 20000000 });
    expect(hb.bagianPasangan).toBe(250000000);
    expect(hb.peninggalan).toBe(350000000);
    expect(hb.setelahUtang).toBe(308000000);
    expect(hb.wasiat).toBe(20000000);
    expect(hb.bersih).toBe(288000000);
  });
  it('wasiat dibatasi 1/3 setelah utang', () => {
    const hb = hartaBersih({ bawaan: 90000000, wasiat: 50000000 });
    expect(hb.wasiatDipotong).toBe(true);
    expect(hb.wasiat).toBe(30000000);
    expect(hb.bersih).toBe(60000000);
  });
  it('utang melebihi harta: tidak negatif', () => {
    const hb = hartaBersih({ bawaan: 10000000, utang: 25000000 });
    expect(hb.bersih).toBe(0);
    expect(hb.utangTakTerbayar).toBe(15000000);
  });
  it('harta bersama ganjil: tidak ada rupiah yang hilang', () => {
    const hb = hartaBersih({ bersama: 1001 });
    expect(hb.bagianPasangan + hb.peninggalan).toBe(1001);
  });
});

describe('rupiah (Bab 10.4)', () => {
  it('Pak Umar: total + selisih pembulatan = harta bersih', () => {
    const r = hitung({ pewaris: 'L', heirs: { istri: 1, ayah: 1, ibu: 1, nenekIbu: 1, anakL: 1, anakP: 2, sdrLK: 2 } });
    const bag = bagiRupiah(r, 288000000);
    const get = k => bag.rows.find(x => x.key === k).perOrang;
    expect(get('istri')).toBe(36000000);
    expect(get('ayah')).toBe(48000000);
    expect(get('anakL')).toBe(78000000);
    expect(get('anakP')).toBe(39000000);
    expect(bag.dibagikan + bag.selisihPembulatan).toBe(288000000);
    expect(bag.selisihPembulatan).toBe(0);
  });
  it('pembulatan dilaporkan', () => {
    const r = hitung({ pewaris: 'L', heirs: { anakL: 3 } });
    const bag = bagiRupiah(r, 100);
    expect(bag.dibagikan).toBe(99);
    expect(bag.selisihPembulatan).toBe(1);
  });
  it('nilai besar tetap eksak (BigInt)', () => {
    const r = hitung({ pewaris: 'L', heirs: { istri: 1, anakL: 1, anakP: 1 } });
    const bag = bagiRupiah(r, 9007199254740);
    expect(bag.dibagikan + bag.selisihPembulatan).toBe(9007199254740);
  });
});

describe('kompensasi barang (Bab 10.6)', () => {
  it('Pak Budi', () => {
    const r = hitung({ pewaris: 'L', heirs: { istri: 1, anakL: 2, anakP: 1 } });
    const k = kompensasi(r, 1200000000, [
      { nama: 'Rumah', nilai: 600000000, oleh: 'anakL#2' },
      { nama: 'Tanah kebun', nilai: 300000000, oleh: 'anakL#1' },
      { nama: 'Mobil', nilai: 150000000, oleh: 'istri#1' },
      { nama: 'Motor', nilai: 20000000, oleh: 'anakL#1' },
      { nama: 'Emas 50 gram', nilai: 75000000, oleh: 'anakP#1' },
      { nama: 'Tabungan', nilai: 55000000, oleh: 'anakL#1' },
    ]);
    const p = id => k.penerima.find(x => x.id === id);
    expect(p('istri#1').hak).toBe(150000000);
    expect(p('anakL#1').hak).toBe(420000000);
    expect(p('anakP#1').hak).toBe(210000000);
    expect(p('anakL#2').selisih).toBe(-180000000); // membayar
    expect(p('anakL#1').selisih).toBe(45000000);   // menerima
    expect(k.cocok).toBe(true);
    expect(k.adaEmas).toBe(true);
    expect(k.penerima.reduce((a, x) => a + x.selisih, 0)).toBe(0);
  });
});

describe('kurang/lebih dan rencana bayar', () => {
  const r = hitung({ pewaris: 'L', heirs: { istri: 1, anakL: 2, anakP: 1 } }); // hak: 150 / 420 / 420 / 210 (juta)
  it('sebagian harta berupa uang yang tidak dicatat sebagai barang: kekurangan diambil dari sisa harta', () => {
    const k = kompensasi(r, 1200e6, [{ nama: 'Rumah', nilai: 600e6, oleh: 'anakL#1' }]);
    expect(k.transfer).toEqual([{ dari: 'anakL#1', dariLabel: 'Anak laki-laki 1', ke: 'anakL#2', keLabel: 'Anak laki-laki 2', jumlah: 180e6 }]);
    // sisanya (anakL#2 masih kurang 240 jt, istri 150 jt, anakP 210 jt) dari uang/harta yang belum dibagi
    expect(k.dariSisa.map(x => [x.ke, x.jumlah])).toEqual([['anakL#2', 240e6], ['anakP#1', 210e6], ['istri#1', 150e6]]);
    expect(k.kelebihanLepas).toEqual([]);
  });
  it('nilai barang melebihi harta bersih: kelebihan tanpa pasangan dilaporkan', () => {
    const k = kompensasi(r, 1200e6, [{ nama: 'Rumah', nilai: 1300e6, oleh: 'istri#1' }]);
    expect(k.kelebihanLepas).toEqual([{ dari: 'istri#1', dariLabel: 'Istri', jumlah: 100e6 }]);
  });
  it('jumlah semua transfer + dari sisa = jumlah semua kekurangan', () => {
    const k = kompensasi(r, 1200e6, [{ nama: 'A', nilai: 700e6, oleh: 'istri#1' }, { nama: 'B', nilai: 500e6, oleh: 'anakP#1' }]);
    const kurang = k.penerima.filter(p => p.selisih > 0).reduce((a, p) => a + p.selisih, 0);
    expect(k.transfer.reduce((a, t) => a + t.jumlah, 0) + k.dariSisa.reduce((a, t) => a + t.jumlah, 0)).toBe(kurang);
  });
});

describe('maḥrūm (Bab 2.5)', () => {
  it('anak beda agama tidak menerima dan tidak menghalangi saudara', () => {
    const r = hitung({ pewaris: 'L', heirs: { istri: 1, sdrLK: 1 }, mahrum: [{ key: 'anakL', n: 1, sebab: 'agama' }] });
    expect(r.mahrum).toHaveLength(1);
    expect(r.mahrum[0].alasan).toMatch(/agama/);
    const sdr = r.rows.find(x => x.key === 'sdrLK');
    expect(sdr.blocked).toBeFalsy();
    expect(r.rows.find(x => x.key === 'istri').each).toEqual({ n: 1, d: 4 });
  });
});

describe('penjelasan tujuh langkah', () => {
  it('Laila (Bab 10.2): asal masalah 12, taṣḥīḥ 24', () => {
    const r = hitung({ pewaris: 'P', heirs: { suami: 1, ibu: 1, anakP: 1, sdrLK: 2, nenekIbu: 1, sdrPI: 1, pamanK: 1 } });
    const L = susunLangkah(r, hartaBersih({ bawaan: 240000000 }));
    expect(L.map(x => x.no)).toEqual(['1', '2', '3', '4–5', '6', '7']);
    const s45 = L.find(x => x.no === '4–5');
    expect(s45.poin[0]).toContain('12');
    expect(s45.tabel.baris.at(-1)[2]).toBe('12 − 11 = 1');
    expect(L.find(x => x.no === '6').poin[0]).toContain('24');
  });
  it('ʿaul disebut', () => {
    const r = hitung({ pewaris: 'P', heirs: { suami: 1, sdrPK: 2 } });
    const s45 = susunLangkah(r, null).find(x => x.no === '4–5');
    expect(s45.poin.join(' ')).toMatch(/ʿaul/);
  });
});
