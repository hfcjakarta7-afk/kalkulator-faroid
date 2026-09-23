import { describe, it, expect } from 'vitest';
import { buatLink, bacaLink } from '../src/ui/tautan.js';

describe('link kasus', () => {
  const state = {
    step: 4, nama: 'Kasus Pak Joko — rumah & sawah', pw: 'L', heirs: { istri: 1, anakL: 1, anakP: 2 },
    harta: { bawaan: 640000000 }, barang: [{ nama: 'Emas 20 gram', nilai: 20000000, oleh: 'istri#1' }],
    mahrum: [], khusus: {}, lapis: [],
    ba: { nama: { '1:istri#1': 'Bu Sri' }, ttd: { x: 'data:image/png;base64,AAAA' } },
  };

  it('bolak-balik tanpa kehilangan data', () => {
    const url = buatLink(state, 'https://contoh.github.io/faroid/');
    expect(url.startsWith('https://contoh.github.io/faroid/#k=')).toBe(true);
    const back = bacaLink(new URL(url).hash);
    expect(back).toEqual({ nama: state.nama, pw: 'L', heirs: state.heirs, harta: state.harta, barang: state.barang });
  });

  it('isian berita acara (nama, tanda tangan) tidak ikut dibagikan', () => {
    const url = buatLink(state, 'https://contoh.github.io/faroid/');
    expect(JSON.stringify(bacaLink(new URL(url).hash))).not.toMatch(/Bu Sri|base64/);
  });

  it('hash rusak atau asing diabaikan', () => {
    expect(bacaLink('#k=%%%')).toBeNull();
    expect(bacaLink('#k=abc')).toBeNull();
    expect(bacaLink('#tentang')).toBeNull();
    expect(bacaLink('')).toBeNull();
  });
});
