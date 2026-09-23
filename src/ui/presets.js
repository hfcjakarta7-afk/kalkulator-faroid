// Contoh kasus dari ebook. Angka hasil tiap contoh diuji di test/rupiah-bab14.test.js.
export const PRESETS = [
  { nama: 'Kasus Pak Umar (Bab 10.5)', pw: 'L', heirs: { istri: 1, ayah: 1, ibu: 1, nenekIbu: 1, anakL: 1, anakP: 2, sdrLK: 2 }, harta: { bersama: 500000000, bawaan: 100000000, jenazah: 5000000, utang: 37000000, wasiat: 20000000 } },
  { nama: 'Bab 14 · Kasus 1: keluarga inti lengkap', pw: 'P', heirs: { suami: 1, ayah: 1, ibu: 1, anakL: 1, anakP: 1 }, harta: { bawaan: 360000000 } },
  { nama: 'Bab 14 · Kasus 2: ayah tidak kebagian sisa', pw: 'L', heirs: { ayah: 1, ibu: 1, anakP: 2 }, harta: { bawaan: 180000000 } },
  { nama: 'Bab 14 · Kasus 3: pemuda lajang wafat', pw: 'L', heirs: { ibu: 1, sdrLK: 1, sdrPK: 1, sdrLI: 1 }, harta: { bawaan: 90000000 } },
  { nama: 'Bab 14 · Kasus 4: tanpa anak, ada saudara', pw: 'L', heirs: { istri: 1, sdrPK: 2, sdrLA: 1 }, harta: { bawaan: 120000000 } },
  { nama: "Bab 14 · Kasus 5: 'aul", pw: 'P', heirs: { suami: 1, ibu: 1, sdrPK: 2 }, harta: { bawaan: 160000000 } },
  { nama: 'Bab 14 · Kasus 6: radd', pw: 'L', heirs: { ibu: 1, anakP: 2 }, harta: { bawaan: 100000000 } },
  {
    nama: 'Bab 14 · Kasus 7: warisan berupa barang', pw: 'L', heirs: { istri: 1, anakL: 1, anakP: 2 }, harta: { bawaan: 640000000 },
    barang: [
      { nama: 'Rumah', nilai: 360000000, oleh: 'anakL#1' },
      { nama: 'Sawah', nilai: 200000000, oleh: 'anakP#1' },
      { nama: 'Mobil', nilai: 60000000, oleh: 'istri#1' },
      { nama: 'Emas 20 gram', nilai: 20000000, oleh: 'istri#1' },
    ],
  },
  { nama: 'Bab 14 · Kasus 8: anak berbeda agama', pw: 'L', heirs: { istri: 1, anakL: 1, anakP: 1 }, mahrum: [{ key: 'anakL', n: 1, sebab: 'agama' }], harta: { bawaan: 240000000 } },
  { nama: 'Bab 14 · Kasus 9: cucu perempuan dan saudara', pw: 'L', heirs: { istri: 1, anakP: 1, cucuP: 1, sdrLK: 1 }, harta: { bawaan: 240000000 } },
  { nama: 'Bab 14 · Kasus 10: munāsakhah Bu Mira lalu Pak Bayu', pw: 'P', heirs: { suami: 1, anakL: 2 }, harta: { bawaan: 200000000 }, lapis: [{ wafat: '1:suami#1', heirs: { anakL: 2 }, tautan: {} }] },
  { nama: 'Munāsakhah: keluarga Pak Rahmat (Bab 13.3)', pw: 'L', heirs: { istri: 1, anakL: 2, anakP: 1 }, harta: { bawaan: 480000000 }, lapis: [{ wafat: '1:anakL#1', heirs: { istri: 1, ibu: 1, anakL: 1, sdrLK: 1, sdrPK: 1 }, tautan: {} }] },
  { nama: 'Al-Minbariyyah: ʿaul 24 → 27 (Bab 11.1)', pw: 'L', heirs: { istri: 1, anakP: 2, ayah: 1, ibu: 1 }, harta: { bawaan: 270000000 } },
  { nama: 'Al-Gharrāwain (Bab 11.3)', pw: 'P', heirs: { suami: 1, ayah: 1, ibu: 1 }, harta: { bawaan: 120000000 } },
  { nama: 'Al-Musyarrakah (Bab 11.4)', pw: 'P', heirs: { suami: 1, ibu: 1, sdrLI: 2, sdrLK: 1 }, harta: { bawaan: 180000000 } },
  { nama: 'Kakek bersama saudara (Bab 11.5)', pw: 'P', heirs: { suami: 1, ibu: 1, kakek: 1, sdrLK: 3 }, harta: { bawaan: 180000000 } },
  { nama: 'Al-Akdariyyah (Bab 11.6)', pw: 'P', heirs: { suami: 1, ibu: 1, kakek: 1, sdrPK: 1 }, harta: { bawaan: 270000000 } },
];
