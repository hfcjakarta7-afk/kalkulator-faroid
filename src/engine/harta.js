// Langkah 1 dan 7: membersihkan harta (Bab 3) dan mengubah bagian ke rupiah (Bab 10.4).
// Semua nilai rupiah bilangan bulat. Pembagian memakai BigInt agar tetap eksak untuk nilai besar.

const int = v => Math.max(0, Math.floor(+v || 0));

/**
 * Urutan: pisahkan separuh harta bersama untuk pasangan yang hidup (KHI Ps. 96),
 * lalu biaya jenazah → utang → wasiat (maks 1/3 sisa) → harta bersih.
 */
export function hartaBersih(h = {}) {
  const bersama = int(h.bersama), bawaan = int(h.bawaan), jenazah = int(h.jenazah), utang = int(h.utang), wasiatDiminta = int(h.wasiat);
  const bagianPasangan = Math.floor(bersama / 2);
  const peninggalan = bersama - bagianPasangan + bawaan;
  const jenazahDibayar = Math.min(jenazah, peninggalan);
  const setelahJenazah = peninggalan - jenazahDibayar;
  const utangDibayar = Math.min(utang, setelahJenazah);
  const setelahUtang = setelahJenazah - utangDibayar;
  const batasWasiat = Math.floor(setelahUtang / 3);
  const wasiat = Math.min(wasiatDiminta, batasWasiat);
  return {
    bersama, bawaan, bagianPasangan, peninggalan,
    jenazah: jenazahDibayar, setelahJenazah,
    utang: utangDibayar, utangTakTerbayar: utang - utangDibayar, setelahUtang,
    batasWasiat, wasiat, wasiatDipotong: wasiatDiminta > batasWasiat,
    bersih: setelahUtang - wasiat,
  };
}

// floor(H × n / d) dengan BigInt
export const bagianRupiah = (H, f) => Number((BigInt(int(H)) * BigInt(f.n)) / BigInt(f.d));

/**
 * Bagi harta bersih ke tiap orang. Setiap orang dibulatkan ke bawah,
 * lalu selisih pembulatan dilaporkan (tidak disembunyikan).
 */
export function bagiRupiah(hasil, H) {
  let dibagikan = 0;
  const rows = hasil.rows.filter(r => !r.blocked).map(r => {
    const perOrang = bagianRupiah(H, r.each);
    dibagikan += perOrang * r.n;
    return { key: r.key, label: r.label, n: r.n, perOrang, total: perOrang * r.n };
  });
  const sisaTanpaPenerima = hasil.sisa && hasil.sisa.n ? bagianRupiah(H, hasil.sisa) : 0;
  const selisihPembulatan = int(H) - dibagikan - sisaTanpaPenerima;
  return { rows, dibagikan, sisaTanpaPenerima, selisihPembulatan };
}

/** Daftar penerima per orang (untuk memilih siapa mengambil barang). value: "key#i" */
export function daftarPenerima(hasil) {
  const out = [];
  hasil.rows.filter(r => !r.blocked && r.each.n).forEach(r => {
    for (let i = 1; i <= r.n; i++) out.push({ id: `${r.key}#${i}`, label: r.n > 1 ? `${r.label} ${i}` : r.label, each: r.each });
  });
  return out;
}

/**
 * Pembagian barang dan kompensasi (Bab 10.6).
 * barang: [{ nama, nilai, oleh: "key#i" }]
 * Hasil: hak tiap orang, nilai barang yang diambil, dan selisih (+ menerima uang, − membayar).
 */
export function kompensasi(hasil, H, barang = []) {
  const penerima = daftarPenerima(hasil).map(p => ({ ...p, hak: bagianRupiah(H, p.each), ambil: 0, barang: [] }));
  const byId = Object.fromEntries(penerima.map(p => [p.id, p]));
  let totalBarang = 0, belumDipilih = 0;
  barang.forEach(b => {
    const v = int(b.nilai);
    totalBarang += v;
    if (b.oleh && byId[b.oleh]) { byId[b.oleh].ambil += v; byId[b.oleh].barang.push(b.nama || 'Barang'); }
    else belumDipilih += v;
  });
  penerima.forEach(p => { p.selisih = p.hak - p.ambil; });
  const adaEmas = barang.some(b => /emas|perhiasan|logam mulia/i.test(b.nama || ''));
  return { penerima, totalBarang, belumDipilih, cocok: Math.abs(totalBarang - int(H)) <= penerima.length, adaEmas };
}
