// Pecahan eksak: pembilang/penyebut bilangan bulat, selalu dalam bentuk paling sederhana.
// Tidak ada floating point untuk bagian waris.

export const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a || 1; };
export const lcm = (a, b) => (a / gcd(a, b)) * b;

export const F = (n, d = 1) => {
  if (d === 0) throw new Error('Penyebut tidak boleh 0');
  if (d < 0) { n = -n; d = -d; }
  const g = gcd(n, d);
  return { n: n / g, d: d / g };
};

export const add = (a, b) => F(a.n * b.d + b.n * a.d, a.d * b.d);
export const sub = (a, b) => F(a.n * b.d - b.n * a.d, a.d * b.d);
export const mul = (a, b) => F(a.n * b.n, a.d * b.d);
export const div = (a, b) => F(a.n * b.d, a.d * b.n);
export const cmp = (a, b) => a.n * b.d - b.n * a.d;
export const sum = list => list.reduce((acc, x) => add(acc, x), ZERO);

export const ZERO = F(0);
export const ONE = F(1);

export const fstr = f => (f.n === 0 ? '0' : f.d === 1 ? String(f.n) : `${f.n}/${f.d}`);
