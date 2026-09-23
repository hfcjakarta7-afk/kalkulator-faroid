// Tampilan hasil pembagian (langkah 4) dan teks ringkasan untuk dibagikan.
import { fstr, susunLangkah, bagiRupiah, kompensasi, daftarPenerima } from '../engine/index.js';
import { rp, esc, babLink, fmtAngka } from './format.js';

export const KEADAAN_KHUSUS = [
  { key: 'kandungan', label: 'Ada ahli waris yang masih dalam kandungan', bab: '12.2', pesan: 'Ada anak dalam kandungan. Bagian untuknya perlu ditahan dengan perkiraan terbaik (laki-laki atau perempuan) sampai ia lahir. Hitung dua kemungkinan dan tahan selisihnya (Bab 12.2).' },
  { key: 'mafqud', label: 'Ada ahli waris yang hilang dan tidak diketahui kabarnya', bab: '12.3', pesan: 'Ada ahli waris yang hilang (mafqūd). Bagiannya ditahan sampai jelas hidup atau wafatnya, atau sampai ada putusan hakim (Bab 12.3).' },
  { key: 'khuntsa', label: 'Ada ahli waris berkelamin ganda (khuntsā)', bab: '12.4', pesan: 'Ada khuntsā. Menurut mazhab Syafiʿi, ia diberi bagian terkecil dari dua kemungkinan dan sisanya ditahan (Bab 12.4).' },
  { key: 'munasakhah', label: 'Ada ahli waris yang wafat sebelum harta dibagi', bab: '13', pesan: 'Ada ahli waris yang wafat sebelum harta dibagi (munāsakhah). Selesaikan pembagian pertama dulu, lalu bagian orang itu dibagi lagi kepada ahli warisnya sendiri (Bab 13).' },
];

const namaOrang = (r) => `${esc(r.label)}${r.n > 1 ? ` <span class="pill">${r.n} orang</span>` : ''}`;

export function renderHasil(state, hasil, hb) {
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

  return `<div class="summary">${chips}</div>
    ${peringatan ? `<div class="notes" style="margin-bottom:14px">${peringatan}</div>` : ''}
    <div class="shares">${shares}</div>
    ${totalLine}
    ${blocked}
    ${notes}
    ${H ? renderBarang(state, hasil, H) : ''}
    ${langkahHtml}`;
}

function renderBarang(state, hasil, H) {
  const barang = state.barang || [];
  if (!barang.length) return '';
  const opsi = daftarPenerima(hasil);
  const k = kompensasi(hasil, H, barang);
  const sel = (b, i) => `<select data-barang-oleh="${i}" aria-label="Diambil oleh (${esc(b.nama || 'barang')})">
    <option value="">— belum dipilih —</option>${opsi.map(o => `<option value="${o.id}"${o.id === b.oleh ? ' selected' : ''}>${esc(o.label)}</option>`).join('')}</select>`;
  return `<div class="sec no-break"><h3>Pembagian barang dan kompensasi ${babLink('10.6')}</h3>
    <p class="sub">Pilih siapa yang mengambil tiap barang. Selisih antara hak dan nilai barang ditutup dengan uang pengganti.</p>
    <div class="tablewrap"><table><thead><tr><th>Barang</th><th class="num">Nilai</th><th>Diambil oleh</th></tr></thead><tbody>
      ${barang.map((b, i) => `<tr><td>${esc(b.nama || 'Barang ' + (i + 1))}</td><td class="num">${rp(b.nilai)}</td><td>${sel(b, i)}</td></tr>`).join('')}
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
export function teksRingkasan(state, hasil, hb) {
  if (!hasil) return '';
  const H = hb.bersih;
  const bag = H ? bagiRupiah(hasil, H) : null;
  const L = [];
  L.push('*Pembagian waris — Kalkulator FAROID*');
  if (state.nama) L.push(state.nama);
  L.push(`Pewaris: ${state.pw === 'L' ? 'laki-laki' : 'perempuan'}${H ? ` · Harta bersih ${rp(H)}` : ''}`);
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
