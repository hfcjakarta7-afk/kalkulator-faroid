// Engine modular harus memberi hasil yang sama persis dengan engine purwarupa
// untuk ribuan kombinasi ahli waris acak (jaring pengaman refaktor).
import { describe, it, expect } from 'vitest';
import { createRequire } from 'node:module';
import { hitung, HEIRS, fstr } from '../src/engine/index.js';

const require = createRequire(import.meta.url);
const lama = require('../purwarupa/faraid-engine.js');

// generator acak deterministik
function rng(seed) { return () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648); }

const ringkas = r => r.rows.map(x => `${x.key}:${x.n}:${x.blocked ? 'X' : fstr(x.each)}:${x.sahamEach ?? ''}`).join('|')
  + `#am=${r.am}#aul=${r.amAul}#denom=${r.denom}#radd=${r.radd}#sisa=${fstr(r.sisa)}`;

describe('setara dengan purwarupa', () => {
  it('5000 kasus acak', () => {
    const rand = rng(20260923);
    for (let i = 0; i < 5000; i++) {
      const pewaris = rand() < 0.5 ? 'L' : 'P';
      const heirs = {};
      const peluang = 0.15 + rand() * 0.35;
      HEIRS.forEach(h => { if (rand() < peluang) heirs[h.key] = 1 + Math.floor(rand() * Math.min(h.max, 4)); });
      const input = { pewaris, heirs };
      expect(ringkas(hitung(input)), JSON.stringify(input)).toBe(ringkas(lama.hitung(input)));
    }
  });
});
