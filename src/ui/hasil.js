// Tampilan hasil pembagian (langkah 4) dan teks ringkasan untuk dibagikan.
import { fstr, susunLangkah, bagiRupiah, bagianRupiah, kompensasiOrang, daftarPenerima } from '../engine/index.js';
import { rp, esc, babLink, fmtAngka } from './format.js';

export const KEADAAN_KHUSUS = [
  { key: 'kandungan', label: 'Ada ahli waris yang masih dalam kandungan', bab: '12.2', pesan: 'Ada anak dalam kandungan. Bagian untuknya perlu ditahan dengan perkiraan terbaik (laki-laki atau perempuan) sampai ia lahir. Hitung dua kemungkinan dan tahan selisihnya (Bab 12.2).' },
  { key: 'mafqud', label: 'Ada ahli waris yang hilang dan tidak diketahui kabarnya', bab: '12.3', pesan: 'Ada ahli waris yang hilang (mafqūd). Bagiannya ditahan sampai jelas hidup atau wafatnya, atau sampai ada putusan hakim (Bab 12.3).' },
  { key: 'khuntsa', label: 'Ada ahli waris berkelamin ganda (khuntsā)', bab: '12.4', pesan: 'Ada khuntsā. Menurut mazhab Syafiʿi, ia diberi bagian terkecil dari dua kemungkinan dan sisanya ditahan (Bab 12.4).' },
];

const namaOrang = (r) => `${esc(r.label)}${r.n > 1 ? ` <span class="pill">${r.n} orang</span>` : ''}`;

export function renderHasil(state, hasil, hb, mk = {}) {
  if (!hasil) {
    return `<div class="empty"><b>Belum ada ahli waris</b>Isi minimal satu ahli waris di langkah 3 untuk melihat pembagian.</div>`;
  }
  const H = hb.bersih;
  const dapat = hasil.rows.filter(r => !r.blocked);
  const coret = hasil.rows.filter(r => r.blocked);
  const bag = H > 0 ? bagiRupiah(hasil, H) : null;
  const rupiahOf = key => bag?.rows.find(x => x.key === key);

  const chips = [
    `<div class="chip"><span>Asal masalah</span><b>${hasil.am}</b></div>`,
    hasil.aul ? `<div class="chip gold"><span>ʿAul</span><b>${hasil.am} → ${hasil.amAul}</b></div>` : '',
    hasil.radd ? `<div class="chip gold"><span>Radd</span><b>ya</b></div>` : '',
    hasil.tashih ? `<div class="chip"><span>Taṣḥīḥ</span><b>${hasil.denom}</b></div>` : '',
    `<div class="chip"><span>Harta bersih</span><b>${H ? rp(H) : '—'}</b></div>`,
  ].join('');

  const shares = dapat.map(r => {
    const rr = rupiahOf(r.key);
    const pct = (r.group.n / r.group.d) * 100;
    return `<div class="share">
      <div class="who">${namaOrang(r)}</div>
      <div class="amt"><span class="frac">${fstr(r.each)}</span>${r.n > 1 ? '<small>per orang</small>' : ''}</div>
      <div class="basis">${esc(r.basis || r.kind)} · ${babLink(r.bab)}</div>
      <div class="amt">${rr ? `<span class="rpv">${rp(rr.perOrang)}</span>${r.n > 1 ? `<small>total ${rp(rr.total)}</small>` : ''}` : `<small>${r.sahamEach} dari ${hasil.denom} saham</small>`}</div>
      <div class="bar" aria-hidden="true"><i style="width:${pct.toFixed(2)}%"></i></div>
    </div>`;
  }).join('');

  const totalLine = bag ? `<div class="totalline"><span>Jumlah dibagikan</span><span>${rp(bag.dibagikan)}</span></div>
    ${bag.selisihPembulatan ? `<p class="sub">Selisih pembulatan ${rp(bag.selisihPembulatan)} dibagikan sesuai kesepakatan keluarga (Bab 10.4).</p>` : ''}
    ${bag.sisaTanpaPenerima ? `<p class="sub">Sisa tanpa penerima: ${rp(bag.sisaTanpaPenerima)}.</p>` : ''}`
    : `<p class="sub" style="margin-top:10px">Isi nilai harta di langkah 2 untuk melihat angka rupiah.</p>`;

  const khususAktif = KEADAAN_KHUSUS.filter(k => state.khusus?.[k.key]);
  const peringatan = khususAktif.map(k => `<div class="note warn"><b>Belum dihitung otomatis</b>${esc(k.pesan)}</div>`).join('');

  const blocked = coret.length || hasil.mahrum.length ? `<div class="sec"><h3>Tidak mendapat bagian</h3><ul class="block-list">
      ${coret.map(r => `<li><span>${esc(r.label)}${r.n > 1 ? ` (${r.n})` : ''}</span><em>terhalang oleh ${esc(r.by)}</em></li>`).join('')}
      ${hasil.mahrum.map(m => `<li><span>${esc(m.label)}${m.n > 1 ? ` (${m.n})` : ''}</span><em>maḥrūm: ${esc(m.alasan.toLowerCase())}</em></li>`).join('')}
    </ul><p class="sub" style="margin-top:6px">Terhalang oleh kerabat yang lebih dekat: Bab 9. Maḥrūm: Bab 2.5.</p></div>` : '';

  const notes = hasil.notes.length || hasil.khi.length ? `<div class="sec"><h3>Catatan</h3><div class="notes">
      ${hasil.notes.map(n => `<div class="note${n.warn ? ' warn' : ''}"><b>${esc(n.t)}</b>${esc(n.d)}</div>`).join('')}
      ${hasil.khi.map(k => `<div class="note khi"><b>Catatan KHI (pembanding)</b>${esc(k.d)}</div>`).join('')}
    </div></div>` : '';

  const langkah = susunLangkah(hasil, H ? hb : null);
  const langkahHtml = `<div class="sec"><details class="panel" id="langkah-box"><summary>Langkah perhitungan (cocokkan dengan Bab 10)</summary>
    <div class="langkah">${langkah.map(l => `<div class="lk"><div class="no">${esc(l.no)}</div><div>
      <h4>${esc(l.judul)} ${babLink(l.bab)}</h4>
      ${l.poin.length ? `<ul>${l.poin.map(p => `<li>${esc(p)}</li>`).join('')}</ul>` : ''}
      ${l.tabel ? `<div class="tablewrap"><table><thead><tr>${l.tabel.kolom.map((k, i) => `<th${i ? ' class="num"' : ''}>${esc(k)}</th>`).join('')}</tr></thead>
        <tbody>${l.tabel.baris.map(b => `<tr>${b.map((v, i) => `<td${i && !(l.tabel.kolom[i] === 'Alasan') ? ' class="num"' : ''}>${esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>` : ''}
    </div></div>`).join('')}</div></details></div>`;

  const m = mk.m;
  const detailLapis1 = `<div class="summary">${chips}</div>
    ${peringatan ? `<div class="notes" style="margin-bottom:14px">${peringatan}</div>` : ''}
    <div class="shares">${shares}</div>
    ${totalLine}
    ${blocked}
    ${notes}`;
  const galat = mk.err ? `<div class="note warn" style="margin-bottom:14px"><b>Munāsakhah belum bisa dihitung</b>${esc(mk.err)}</div>` : '';
  if (!m) return `${galat}${detailLapis1}${H ? renderBarang(state, penerimaAkhir(hasil, null), H) : ''}${langkahHtml}`;
  return `${renderMunasakhah(m, H)}
    ${H ? renderBarang(state, penerimaAkhir(hasil, m), H) : ''}
    <div class="sec"><h3>Rincian lapis 1: pewaris pertama</h3>${detailLapis1}</div>
    ${langkahHtml.replace('Langkah perhitungan (cocokkan dengan Bab 10)', 'Langkah perhitungan lapis 1 (cocokkan dengan Bab 10)')}`;
}

// ---------- munāsakhah ----------
/** Nama orang di hasil akhir: semua perannya, mis. "Istri · Ibu dari Anak laki-laki 1" */
export function namaAkhir(o, m) {
  const wafat = Object.fromEntries(m.lapis.map(l => [l.lapis, l.wafatLabel]));
  // peran kedua dst. tanpa nomor urut (nomor hanya perlu untuk membedakan di peran pertama)
  return o.peran.map((p, i) => {
    const label = i ? p.label.replace(/ \d+$/, '') : p.label;
    return p.lapis === 1 ? label : `${label} dari ${wafat[p.lapis]}`;
  }).join(' · ');
}

/** Daftar penerima akhir [{ id, label, each }] — untuk barang, ringkasan, dan berita acara */
export function penerimaAkhir(hasil, m) {
  if (!m) return daftarPenerima(hasil);
  return m.orang.filter(o => o.saham > 0).map(o => ({ id: o.id, label: namaAkhir(o, m), each: o.each }));
}

// barang.oleh memakai "key#i" (tanpa munāsakhah) atau "1:key#i" (dengan munāsakhah); samakan keduanya
export const normOleh = (oleh, adaM) => (!oleh ? oleh : adaM ? (oleh.includes(':') ? oleh : '1:' + oleh) : oleh.replace(/^1:/, ''));

function renderMunasakhah(m, H) {
  let dibagikan = 0;
  const kartu = m.orang.filter(o => o.saham > 0).map(o => {
    const v = H ? bagianRupiah(H, o.each) : 0;
    dibagikan += v;
    const rincian = o.peran.map(p => `lapis ${p.lapis}: ${p.saham}`).join(' + ');
    return `<div class="share">
      <div class="who">${esc(namaAkhir(o, m))}</div>
      <div class="amt"><span class="frac">${fstr(o.each)}</span></div>
      <div class="basis">${o.saham} dari ${m.J} saham (${esc(rincian)})</div>
      <div class="amt">${H ? `<span class="rpv">${rp(v)}</span>` : ''}</div>
      <div class="bar" aria-hidden="true"><i style="width:${(o.saham / m.J * 100).toFixed(2)}%"></i></div>
    </div>`;
  }).join('');

  const lapis = m.lapis.map(l => {
    const r = l.hasil;
    const tabel = r ? `<div class="tablewrap"><table><thead><tr><th>Ahli waris ${esc(l.wafatLabel)}</th><th class="num">Bagian</th><th class="num">Saham (asal ${l.A})</th><th class="num">× ${l.m2}</th></tr></thead><tbody>
      ${l.penerima.map(p => `<tr><td>${esc(p.label)}${p.baru ? '' : ` <span class="pill gold">= ${esc(p.labelOrang)}</span>`}</td><td class="num">${fstr(p.bagian)}</td><td class="num">${p.sahamLapis}</td><td class="num">${p.saham}</td></tr>`).join('')}
      </tbody></table></div>
      ${r.rows.some(x => x.blocked) ? `<p class="sub" style="margin-top:6px">Terhalang: ${r.rows.filter(x => x.blocked).map(x => `${esc(x.label)} (oleh ${esc(x.by)})`).join('; ')}.</p>` : ''}`
      : `<p class="warn-text">Ahli waris ${esc(l.wafatLabel)} belum diisi; bagiannya dianggap sisa tanpa penerima.</p>`;
    const cara = l.habisDibagi
      ? `${l.S} habis dibagi ${l.A}, jadi tidak perlu disamakan: saham lama tetap, saham lapis ${l.lapis} dikali ${l.S} ÷ ${l.A} = ${l.m2}.`
      : `${l.S} tidak habis dibagi ${l.A}. FPB(${l.S}, ${l.A}) = ${l.F}. Saham lama dikali ${l.A} ÷ ${l.F} = ${l.m1}; saham lapis ${l.lapis} dikali ${l.S} ÷ ${l.F} = ${l.m2}.`;
    return `<details class="panel mk-lapis"><summary>Lapis ${l.lapis}: ${esc(l.wafatLabel)} wafat sebelum harta dibagi</summary>
      <ul class="mk-poin">
        <li>Saham ${esc(l.wafatLabel)} di masalah sebelumnya: <b>S = ${l.S}</b> dari ${l.Jlama}.</li>
        <li>Asal masalah lapis ${l.lapis}${r && r.tashih ? ' (setelah taṣḥīḥ)' : ''}: <b>A = ${l.A}</b>.</li>
        <li>${cara}</li>
        <li>Asal masalah gabungan (<i>al-jāmiʿah</i>): ${l.Jlama} × ${l.m1} = <b>${l.J}</b>.</li>
      </ul>
      ${tabel}
      <p class="sub" style="margin-top:8px">Harta pribadi ${esc(l.wafatLabel)} (jika ada) dibagi tersendiri kepada ahli warisnya dengan perbandingan lapis ini, setelah dipisahkan harta bersama, biaya jenazah, dan utangnya (Bab 13.3).</p>
    </details>`;
  }).join('');

  const selisih = H ? H - dibagikan - (m.sisa.n ? bagianRupiah(H, m.sisa) : 0) : 0;
  return `<div class="summary">
      <div class="chip gold"><span>Munāsakhah</span><b>${m.lapis.length + 1} lapis</b></div>
      <div class="chip"><span>Al-jāmiʿah</span><b>${m.J}</b></div>
      <div class="chip"><span>Harta bersih</span><b>${H ? rp(H) : '—'}</b></div>
    </div>
    <h3 class="mk-judul">Hasil akhir setelah munāsakhah ${babLink('13')}</h3>
    <div class="shares">${kartu}</div>
    ${H ? `<div class="totalline"><span>Jumlah dibagikan</span><span>${rp(dibagikan)}</span></div>` : ''}
    ${selisih ? `<p class="sub">Selisih pembulatan ${rp(selisih)} dibagikan sesuai kesepakatan keluarga (Bab 10.4).</p>` : ''}
    ${m.sisa.n ? `<p class="warn-text">Ada sisa ${fstr(m.sisa)} tanpa penerima (Bab 12.1).</p>` : ''}
    <p class="sub" style="margin-top:6px">Cek: jumlah saham semua orang = ${m.J} ${m.cek ? '✓' : '✗'}</p>
    <div class="sec mk-rincian">${lapis}</div>`;
}

function renderBarang(state, penerima, H) {
  const barang = state.barang || [];
  if (!barang.length) return '';
  const adaM = penerima.some(p => p.id.includes(':'));
  const b2 = barang.map(b => ({ ...b, oleh: normOleh(b.oleh, adaM) }));
  const k = kompensasiOrang(penerima, H, b2);
  const sel = (b, i) => `<select data-barang-oleh="${i}" aria-label="Diambil oleh (${esc(b.nama || 'barang')})">
    <option value="">— belum dipilih —</option>${penerima.map(o => `<option value="${o.id}"${o.id === b.oleh ? ' selected' : ''}>${esc(o.label)}</option>`).join('')}</select>`;
  return `<div class="sec no-break"><h3>Pembagian barang dan kompensasi ${babLink('10.6')}</h3>
    <p class="sub">Pilih siapa yang mengambil tiap barang. Selisih antara hak dan nilai barang ditutup dengan uang pengganti.</p>
    <div class="tablewrap"><table><thead><tr><th>Barang</th><th class="num">Nilai</th><th>Diambil oleh</th></tr></thead><tbody>
      ${b2.map((b, i) => `<tr><td>${esc(b.nama || 'Barang ' + (i + 1))}</td><td class="num">${rp(b.nilai)}</td><td>${sel(b, i)}</td></tr>`).join('')}
    </tbody></table></div>
    <div class="tablewrap" style="margin-top:12px"><table><thead><tr><th>Ahli waris</th><th class="num">Hak</th><th class="num">Nilai barang</th><th class="num">Selisih</th></tr></thead><tbody>
      ${k.penerima.map(p => `<tr><td>${esc(p.label)}</td><td class="num">${rp(p.hak)}</td><td class="num">${rp(p.ambil)}</td><td class="num">${Math.abs(p.selisih) < 1 ? 'Pas' : p.selisih > 0 ? `<span class="recv">Menerima ${rp(p.selisih)}</span>` : `<span class="pay">Membayar ${rp(-p.selisih)}</span>`}</td></tr>`).join('')}
    </tbody></table></div>
    ${k.belumDipilih ? `<p class="warn-text">Barang senilai ${rp(k.belumDipilih)} belum dipilih penerimanya.</p>` : ''}
    ${!k.cocok ? `<p class="warn-text">Total nilai barang (${rp(k.totalBarang)}) belum sama dengan harta bersih (${rp(H)}). Pastikan semua harta sudah tercatat dan utang/wasiat sudah diperhitungkan.</p>` : ''}
    ${k.adaEmas ? `<p class="sub" style="margin-top:8px">Jika emas ditukar dengan uang dalam kompensasi, pembayarannya harus tunai saat itu juga (HR. Muslim no. 1587, Bab 10.6).</p>` : ''}
  </div>`;
}

/** Pratinjau ringkas untuk panel samping (langkah 1–3) */
export function renderPreview(hasil, hb) {
  if (!hasil) return `<p class="sub" style="margin:8px 0 0">Tambahkan ahli waris untuk melihat bagiannya di sini.</p>`;
  const bag = hb.bersih ? bagiRupiah(hasil, hb.bersih) : null;
  return hasil.rows.map(r => r.blocked
    ? `<div class="pv-row x"><span>${esc(r.label)}${r.n > 1 ? ` ×${r.n}` : ''}</span><small>terhalang</small></div>`
    : `<div class="pv-row"><span>${esc(r.label)}${r.n > 1 ? ` ×${r.n}` : ''}</span><b>${fstr(r.each)}${bag ? ` · ${rp(bag.rows.find(x => x.key === r.key).perOrang)}` : ''}</b></div>`).join('')
    + (hb.bersih ? `<div class="pv-row"><span>Harta bersih</span><b>${rp(hb.bersih)}</b></div>` : '');
}

/** Ringkasan teks polos untuk dibagikan (WhatsApp, dll.) */
export function teksRingkasan(state, hasil, hb, m = null) {
  if (!hasil) return '';
  const H = hb.bersih;
  const bag = H ? bagiRupiah(hasil, H) : null;
  const L = [];
  L.push('*Pembagian waris — Kalkulator FAROID*');
  if (state.nama) L.push(state.nama);
  L.push(`Pewaris: ${state.pw === 'L' ? 'laki-laki' : 'perempuan'}${H ? ` · Harta bersih ${rp(H)}` : ''}`);
  if (m) {
    L.push(`Munāsakhah ${m.lapis.length + 1} lapis (${m.lapis.map(l => `${l.wafatLabel} wafat`).join(', ')}), al-jāmiʿah ${m.J}`, '');
    m.orang.filter(o => o.saham > 0).forEach(o => L.push(`• ${namaAkhir(o, m)}: ${o.saham}/${m.J}${H ? ` = ${rp(bagianRupiah(H, o.each))}` : ''}`));
    L.push('', 'Fiqih mazhab Syafiʿi (Bab 13). Untuk edukasi; untuk sengketa rujuk ahli faraid atau Pengadilan Agama.');
    return L.join('\n');
  }
  L.push(`Asal masalah ${hasil.am}${hasil.aul ? `, ʿaul ke ${hasil.amAul}` : ''}${hasil.radd ? ', radd' : ''}${hasil.tashih ? `, taṣḥīḥ ${hasil.denom}` : ''}`);
  L.push('');
  hasil.rows.filter(r => !r.blocked).forEach(r => {
    const rr = bag?.rows.find(x => x.key === r.key);
    L.push(`• ${r.label}${r.n > 1 ? ` (${r.n} orang)` : ''}: ${fstr(r.each)}${r.n > 1 ? ' per orang' : ''}${rr ? ` = ${rp(rr.perOrang)}` : ''}`);
  });
  const coret = hasil.rows.filter(r => r.blocked);
  if (coret.length) L.push('', 'Terhalang: ' + coret.map(r => `${r.label} (oleh ${r.by})`).join('; '));
  if (hasil.mahrum.length) L.push('Maḥrūm: ' + hasil.mahrum.map(m => `${m.label} (${m.alasan.toLowerCase()})`).join('; '));
  L.push('', 'Fiqih mazhab Syafiʿi. Untuk edukasi; untuk sengketa rujuk ahli faraid atau Pengadilan Agama.');
  return L.join('\n');
}

export { fmtAngka };
