// Munāsakhah (Bab 13 dan Bab 14 Kasus 10).
import { describe, it, expect } from 'vitest';
import { munasakhah, sarankanTautan, bagianRupiah } from '../src/engine/index.js';

const saham = (m, id) => m.orang.find(o => o.id === id)?.saham;

describe('munāsakhah', () => {
  const rahmat = { pewaris: 'L', heirs: { istri: 1, anakL: 2, anakP: 1 } };
  const ali = { wafat: '1:anakL#1', heirs: { istri: 1, ibu: 1, anakL: 1, sdrLK: 1, sdrPK: 1 }, tautan: { 'ibu#1': '1:istri#1', 'sdrLK#1': '1:anakL#2', 'sdrPK#1': '1:anakP#1' } };

  it('Keluarga Pak Rahmat (Bab 13.3): jāmiʿah 480', () => {
    const m = munasakhah(rahmat, [ali]);
    const l2 = m.lapis[0];
    expect(m.hasil1.denom).toBe(40);
    expect([l2.S, l2.A, l2.F, l2.m1, l2.m2]).toEqual([14, 24, 2, 12, 7]);
    expect(m.J).toBe(480);
    expect(saham(m, '1:istri#1')).toBe(88);   // Bu Siti: 60 + 28
    expect(saham(m, '1:anakL#2')).toBe(168);  // Hasan
    expect(saham(m, '1:anakP#1')).toBe(84);   // Fatimah
    expect(saham(m, '2:istri#1')).toBe(21);   // Nisa
    expect(saham(m, '2:anakL#1')).toBe(119);  // Hafiz
    expect(saham(m, '1:anakL#1')).toBe(0);    // Ali: berpindah seluruhnya
    expect(m.cek).toBe(true);
    // rupiah: Rp 1.000.000 per saham
    expect(bagianRupiah(480e6, m.orang.find(o => o.id === '1:istri#1').each)).toBe(88e6);
    // saudara Ali terhalang oleh anak laki-laki
    expect(l2.hasil.rows.filter(r => r.blocked).map(r => r.key)).toEqual(['sdrLK', 'sdrPK']);
  });

  it('saran tautan untuk kasus Pak Rahmat', () => {
    expect(sarankanTautan(rahmat, '1:anakL#1', ali.heirs)).toEqual({ 'ibu#1': '1:istri#1', 'sdrLK#1': '1:anakL#2', 'sdrPK#1': '1:anakP#1' });
  });

  it('Bab 14 Kasus 10: Bu Mira lalu Pak Bayu → tiap anak 1/2', () => {
    const m1 = { pewaris: 'P', heirs: { suami: 1, anakL: 2 } };
    const tautan = sarankanTautan(m1, '1:suami#1', { anakL: 2 });
    expect(tautan).toEqual({ 'anakL#1': '1:anakL#1', 'anakL#2': '1:anakL#2' });
    const m = munasakhah(m1, [{ wafat: '1:suami#1', heirs: { anakL: 2 }, tautan }]);
    expect(m.J).toBe(8);
    expect(saham(m, '1:anakL#1')).toBe(4);
    expect(saham(m, '1:anakL#2')).toBe(4);
    expect(bagianRupiah(200e6, m.orang.find(o => o.id === '1:anakL#1').each)).toBe(100e6);
  });

  it('tanpa tautan: ahli waris lapis 2 jadi orang baru, total tetap utuh', () => {
    const m = munasakhah(rahmat, [{ wafat: '1:anakL#1', heirs: { istri: 1, ibu: 1, anakL: 1 } }]);
    expect(saham(m, '2:ibu#1')).toBe(28);
    expect(saham(m, '1:istri#1')).toBe(60);
    expect(m.cek).toBe(true);
  });

  it('tiga lapis: yang wafat di lapis 3 berasal dari lapis 2', () => {
    const m = munasakhah(rahmat, [ali, { wafat: '2:anakL#1', heirs: { ibu: 1, anakL: 1 } }]);
    expect(m.lapis).toHaveLength(2);
    expect(saham(m, '2:anakL#1')).toBe(0);
    expect(m.cek).toBe(true);
    expect(m.orang.filter(o => o.saham > 0).reduce((a, o) => a + o.saham, 0)).toBe(m.J);
  });

  it('menolak orang yang wafat tapi tidak mendapat bagian', () => {
    expect(() => munasakhah({ pewaris: 'L', heirs: { anakL: 1, sdrLK: 1 } }, [{ wafat: '1:sdrLK#1', heirs: { anakL: 1 } }])).toThrow();
  });

  it('orang yang sudah wafat tidak bisa ditautkan sebagai ahli waris', () => {
    const m = munasakhah(rahmat, [ali, { wafat: '1:anakL#2', heirs: { sdrLK: 1 }, tautan: { 'sdrLK#1': '1:anakL#1' } }]);
    expect(saham(m, '1:anakL#1')).toBe(0);
    expect(saham(m, '3:sdrLK#1')).toBeGreaterThan(0);
    expect(m.cek).toBe(true);
  });
});
