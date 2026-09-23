// Definisi ahli waris (Bab 4). key, label, gender ('L'/'P'), jumlah maksimum, kelompok tampilan.
// `only`: hanya muncul bila pewaris berjenis kelamin tertentu (suami untuk pewaris perempuan, dst).
// `bab`: rujukan bab ebook yang menjelaskan bagian ahli waris ini.

export const HEIRS = [
  { key: 'suami', label: 'Suami', g: 'L', max: 1, group: 'Pasangan', only: 'P', bab: '6.1' },
  { key: 'istri', label: 'Istri', g: 'P', max: 4, group: 'Pasangan', only: 'L', bab: '6.2' },
  { key: 'ayah', label: 'Ayah', g: 'L', max: 1, group: 'Orang tua dan leluhur', bab: '6.3' },
  { key: 'ibu', label: 'Ibu', g: 'P', max: 1, group: 'Orang tua dan leluhur', bab: '6.4' },
  { key: 'kakek', label: 'Kakek (ayahnya ayah)', g: 'L', max: 1, group: 'Orang tua dan leluhur', bab: '6.5' },
  { key: 'nenekIbu', label: 'Nenek (ibunya ibu)', g: 'P', max: 1, group: 'Orang tua dan leluhur', bab: '6.6' },
  { key: 'nenekAyah', label: 'Nenek (ibunya ayah)', g: 'P', max: 1, group: 'Orang tua dan leluhur', bab: '6.6' },
  { key: 'anakL', label: 'Anak laki-laki', g: 'L', max: 20, group: 'Keturunan', bab: '7.1' },
  { key: 'anakP', label: 'Anak perempuan', g: 'P', max: 20, group: 'Keturunan', bab: '7.1' },
  { key: 'cucuL', label: 'Cucu laki-laki (dari anak laki-laki)', g: 'L', max: 20, group: 'Keturunan', bab: '7.2' },
  { key: 'cucuP', label: 'Cucu perempuan (dari anak laki-laki)', g: 'P', max: 20, group: 'Keturunan', bab: '7.2' },
  { key: 'sdrLK', label: 'Saudara laki-laki kandung', g: 'L', max: 20, group: 'Saudara', bab: '7.4' },
  { key: 'sdrPK', label: 'Saudara perempuan kandung', g: 'P', max: 20, group: 'Saudara', bab: '7.4' },
  { key: 'sdrLA', label: 'Saudara laki-laki seayah', g: 'L', max: 20, group: 'Saudara', bab: '7.4' },
  { key: 'sdrPA', label: 'Saudara perempuan seayah', g: 'P', max: 20, group: 'Saudara', bab: '7.4' },
  { key: 'sdrLI', label: 'Saudara laki-laki seibu', g: 'L', max: 20, group: 'Saudara', bab: '7.3' },
  { key: 'sdrPI', label: 'Saudara perempuan seibu', g: 'P', max: 20, group: 'Saudara', bab: '7.3' },
  { key: 'kepLK', label: 'Keponakan laki-laki (dari saudara laki-laki kandung)', g: 'L', max: 20, group: 'Kerabat lain', bab: '8.2' },
  { key: 'kepLA', label: 'Keponakan laki-laki (dari saudara laki-laki seayah)', g: 'L', max: 20, group: 'Kerabat lain', bab: '8.2' },
  { key: 'pamanK', label: 'Paman kandung (saudara ayah)', g: 'L', max: 20, group: 'Kerabat lain', bab: '8.2' },
  { key: 'pamanA', label: 'Paman seayah (saudara ayah)', g: 'L', max: 20, group: 'Kerabat lain', bab: '8.2' },
  { key: 'sepK', label: 'Sepupu laki-laki (anak paman kandung)', g: 'L', max: 20, group: 'Kerabat lain', bab: '8.2' },
  { key: 'sepA', label: 'Sepupu laki-laki (anak paman seayah)', g: 'L', max: 20, group: 'Kerabat lain', bab: '8.2' },
];

export const LABEL = Object.fromEntries(HEIRS.map(h => [h.key, h.label]));
export const HEIR = Object.fromEntries(HEIRS.map(h => [h.key, h]));

// Tiga penghalang waris (Bab 2.5). Orang yang maḥrūm dianggap tidak ada:
// ia tidak menerima apa pun dan tidak menghalangi siapa pun.
export const SEBAB_MAHRUM = {
  pembunuhan: 'Membunuh pewaris',
  agama: 'Berbeda agama dengan pewaris',
  perbudakan: 'Berstatus budak',
};
