// Penjelasan hasil mengikuti "Tujuh Langkah Menghitung Waris" (Bab 10.1),
// supaya pengguna bisa mencocokkan dengan cara manual di ebook.
import { F, mul, fstr } from './pecahan.js';
import { LABEL } from './ahli-waris.js';
import { bagiRupiah } from './harta.js';

const rp = v => 'Rp ' + Math.round(v).toLocaleString('id-ID');
const nama = (key, n) => LABEL[key] + (n > 1 ? ` (${n} orang)` : '');

/**
 * susunLangkah(hasil, hb) → [{ no, judul, bab, poin: [string], tabel?: {kolom, baris} }]
 * hb: hasil hartaBersih(); boleh null bila nilai harta belum diisi.
 */
export function susunLangkah(hasil, hb) {
  const L = [];
  const c = hasil.counts;
  const H = hb ? hb.bersih : 0;

  // 1. Bersihkan harta
  const p1 = [];
  if (!hb || !hb.peninggalan) p1.push('Nilai harta belum diisi, jadi langkah ini dilewati. Bagian tetap bisa dihitung dalam pecahan.');
  else {
    if (hb.bersama) p1.push(`Harta bersama ${rp(hb.bersama)}: separuhnya (${rp(hb.bagianPasangan)}) milik pasangan yang masih hidup, bukan harta waris.`);
    p1.push(`Harta peninggalan: ${rp(hb.peninggalan)}.`);
    if (hb.jenazah) p1.push(`Dikurangi biaya jenazah ${rp(hb.jenazah)} → ${rp(hb.setelahJenazah)}.`);
    if (hb.utang) p1.push(`Dikurangi utang ${rp(hb.utang)} → ${rp(hb.setelahUtang)}.`);
    if (hb.utangTakTerbayar) p1.push(`Utang ${rp(hb.utangTakTerbayar)} tidak tertutup harta. Ahli waris tidak wajib menanggungnya dari harta pribadi, tetapi dianjurkan membantu melunasi.`);
    if (hb.wasiat || hb.wasiatDipotong) p1.push(`Wasiat ${rp(hb.wasiat)}${hb.wasiatDipotong ? ` (dibatasi 1/3 = ${rp(hb.batasWasiat)}; kelebihannya butuh persetujuan semua ahli waris)` : ''}.`);
    p1.push(`Harta bersih yang dibagi waris: ${rp(hb.bersih)}.`);
  }
  L.push({ no: '1', judul: 'Bersihkan harta', bab: '3', poin: p1 });

  // 2. Daftar dan coret ahli waris
  const p2 = [];
  const dapat = hasil.rows.filter(r => !r.blocked);
  const coret = hasil.rows.filter(r => r.blocked);
  p2.push('Ahli waris yang mendapat bagian: ' + (dapat.length ? dapat.map(r => nama(r.key, r.n)).join(', ') : '—') + '.');
  coret.forEach(r => p2.push(`${nama(r.key, r.n)} terhalang (maḥjūb) oleh ${r.by}.`));
  hasil.mahrum.forEach(m => p2.push(`${m.label}${m.n > 1 ? ` (${m.n} orang)` : ''} tidak mewarisi (maḥrūm): ${m.alasan.toLowerCase()}. Ia dianggap tidak ada dan tidak menghalangi siapa pun.`));
  L.push({ no: '2', judul: 'Daftar dan coret ahli waris', bab: '2, 4, 9', poin: p2 });

  // 3. Tentukan bagian
  L.push({
    no: '3', judul: 'Tentukan bagian tiap ahli waris', bab: '5–8', poin: [],
    tabel: {
      kolom: ['Ahli waris', 'Bagian', 'Alasan'],
      baris: dapat.map(r => [nama(r.key, r.n), r.kind === 'ʿaṣabah' ? 'Sisa' : r.kind === 'farḍ + sisa' ? `${fstr(r.fard)} + sisa` : r.fard ? fstr(r.fard) : '—', r.basis]),
    },
  });

  // 4–5. Asal masalah dan saham
  if (hasil.special || hasil.adaKhusus) {
    L.push({
      no: '4–5', judul: 'Asal masalah dan saham', bab: hasil.special ? '11.6' : '11.5',
      poin: [
        hasil.special
          ? `Kasus al-Akdariyyah: asal masalah ${hasil.am}, di-ʿaul-kan ke ${hasil.amAul}, lalu di-taṣḥīḥ ke ${hasil.denom}.`
          : 'Kasus kakek bersama saudara: bagian kakek dipilih yang terbaik baginya, lalu sisanya untuk saudara. Rinciannya ada di catatan di bawah.',
      ],
    });
  } else {
    const baris = [];
    let jumlah = 0;
    hasil.kelompok.forEach(k => {
      const saham = mul(k.share, F(hasil.am));
      jumlah += saham.n / saham.d;
      baris.push([k.members.map(m => nama(m, c[m])).join(' + '), fstr(k.share), `${fstr(k.share)} × ${hasil.am} = ${fstr(saham)}`]);
    });
    const poin = [`Asal masalah = KPK penyebut bagian pasti = ${hasil.am}.`];
    if (hasil.penerimaSisa.length && !hasil.aul) {
      const sisa = hasil.am - jumlah;
      baris.push([hasil.penerimaSisa.map(m => nama(m, c[m])).join(' + '), 'Sisa', `${hasil.am} − ${jumlah} = ${sisa}`]);
      poin.push(hasil.kelompok.length ? `Sisa ${sisa} saham untuk penerima sisa (ʿaṣabah).` : `Semua harta untuk penerima sisa; pembagi = jumlah kepala dengan perbandingan 2 : 1 = ${hasil.am}.`);
    }
    if (hasil.aul) poin.push(`Jumlah saham ${hasil.amAul} lebih besar dari ${hasil.am}, maka terjadi ʿaul: asal masalah dinaikkan menjadi ${hasil.amAul} (Bab 11.1).`);
    else if (hasil.radd) poin.push(`Jumlah saham ${jumlah} lebih kecil dari ${hasil.am} dan tidak ada penerima sisa, maka terjadi radd: sisa dikembalikan kepada pemilik bagian pasti selain suami/istri (Bab 11.2).`);
    else if (hasil.sisa.n) poin.push(`Jumlah saham ${jumlah} lebih kecil dari ${hasil.am} dan tidak ada yang berhak atas sisa (${fstr(hasil.sisa)}).`);
    else poin.push(`Jumlah saham = ${hasil.am}. Cocok.`);
    L.push({ no: '4–5', judul: 'Asal masalah dan saham', bab: '10.2', poin, tabel: baris.length ? { kolom: ['Kelompok', 'Bagian', 'Saham'], baris } : null });
  }

  // 6. Taṣḥīḥ / pembagi akhir
  const p6 = [];
  const pembagiAwal = hasil.amAul || hasil.am;
  if (hasil.tashih) p6.push(hasil.radd
    ? `Setelah radd, pembagi akhir menjadi ${hasil.denom} supaya tiap orang mendapat saham bulat.`
    : `Saham sebagian kelompok tidak bisa dibagi rata kepada anggotanya, maka pembagi ${pembagiAwal} dinaikkan menjadi ${hasil.denom} (taṣḥīḥ).`);
  else p6.push(`Semua saham sudah bisa dibagi rata. Pembagi akhir tetap ${hasil.denom}.`);
  L.push({
    no: '6', judul: 'Saham akhir per orang', bab: '10.3', poin: p6,
    tabel: { kolom: ['Ahli waris', 'Saham per orang', 'Pecahan'], baris: dapat.map(r => [nama(r.key, r.n), `${r.sahamEach} dari ${hasil.denom}`, fstr(r.each)]) },
  });

  // 7. Rupiah
  if (H > 0) {
    const bag = bagiRupiah(hasil, H);
    const poin = [`Rupiah per orang = harta bersih × saham ÷ ${hasil.denom}, dibulatkan ke bawah.`];
    poin.push(`Total dibagikan ${rp(bag.dibagikan)}.` + (bag.selisihPembulatan ? ` Selisih pembulatan ${rp(bag.selisihPembulatan)} dibagikan sesuai kesepakatan keluarga (Bab 10.4).` : ' Tidak ada selisih pembulatan.'));
    if (bag.sisaTanpaPenerima) poin.push(`Sisa tanpa penerima: ${rp(bag.sisaTanpaPenerima)}.`);
    L.push({
      no: '7', judul: 'Ubah ke rupiah dan cek totalnya', bab: '10.4', poin,
      tabel: { kolom: ['Ahli waris', 'Per orang', 'Jumlah'], baris: bag.rows.map(r => [nama(r.key, r.n), rp(r.perOrang), rp(r.total)]) },
    });
  } else {
    L.push({ no: '7', judul: 'Ubah ke rupiah', bab: '10.4', poin: ['Isi nilai harta untuk melihat angka rupiah.'] });
  }
  return L;
}
