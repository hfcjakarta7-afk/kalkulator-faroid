// Formulir Berita Acara Pembagian Harta Warisan (ebook Lampiran E), terisi otomatis dari hasil hitung.
// Isian tambahan & tanda tangan disimpan di state.ba (hanya di perangkat, tidak ikut link bagikan).
import { fstr, bagianRupiah, kompensasiOrang } from '../engine/index.js';
import { rp, esc } from './format.js';
import { penerimaAkhir, normOleh } from './hasil.js';

export const baKosong = () => ({ hari: '', tanggal: '', tempat: '', pw: {}, nama: {}, ket: {}, bukti: {}, bayar: {}, kesepakatan: '', saksi: ['', ''], mengetahui: '', ttd: {} });

const ambil = (obj, path) => path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);
export function setBa(ba, path, v) {
  const ks = path.split('.');
  let o = ba;
  ks.slice(0, -1).forEach(k => { if (o[k] == null) o[k] = {}; o = o[k]; });
  o[ks.at(-1)] = v;
}

const inp = (ba, path, ph = '', cls = '') => `<input type="text" class="ba-in ${cls}" data-ba="${path}" value="${esc(ambil(ba, path) || '')}" placeholder="${esc(ph)}" aria-label="${esc(ph || path)}">`;
const ttd = (ba, key, nama) => {
  const img = ba.ttd[key];
  return `<div class="ba-ttd">${img ? `<img src="${img}" alt="Tanda tangan ${esc(nama)}">` : ''}
    <button type="button" class="btn ghost ba-ttd-btn no-print" data-ttd="${esc(key)}" data-ttd-nama="${esc(nama)}">${img ? 'Ubah' : 'Tanda tangan di layar'}</button></div>`;
};

export function renderBeritaAcara(state, hasil, hb, m) {
  const ba = state.ba;
  if (!hasil) return `<div class="empty"><b>Belum ada hasil</b>Isi ahli waris dulu, lalu buka berita acara dari halaman hasil.</div>`;
  const H = hb.bersih;
  const penerima = penerimaAkhir(hasil, m);
  const barang = state.barang || [];
  const adaM = !!m;
  const k = barang.length && H ? kompensasiOrang(penerima, H, barang.map(b => ({ ...b, oleh: normOleh(b.oleh, adaM) }))) : null;
  const namaOf = p => ba.nama[p.id] || '';

  const hartaRows = barang.length
    ? barang.map((b, i) => `<tr><td>${i + 1}</td><td>${esc(b.nama || 'Barang ' + (i + 1))}</td><td>${inp(ba, `ket.${i}`, 'mis. SHM no. …')}</td><td class="num">${rp(b.nilai)}</td></tr>`).join('')
    : [['Harta bersama (gono-gini)', hb.bersama, 'bersama'], ['Harta pribadi pewaris', hb.bawaan, 'bawaan']].filter(x => x[1])
      .map((x, i) => `<tr><td>${i + 1}</td><td>${x[0]}</td><td>${inp(ba, `ket.${x[2]}`, 'rincian/bukti')}</td><td class="num">${rp(x[1])}</td></tr>`).join('');
  const totalHarta = barang.length ? barang.reduce((a, b) => a + (+b.nilai || 0), 0) : hb.bersama + hb.bawaan;

  const kewajiban = [
    ['Bagian harta bersama untuk pasangan', hb.bagianPasangan, 'pasangan'],
    ['Biaya pengurusan jenazah', hb.jenazah, 'jenazah'],
    ['Utang', hb.utang, 'utang'],
    ['Wasiat (maks. 1/3)', hb.wasiat, 'wasiat'],
  ].map(([t, v, key]) => `<tr><td>${t}</td><td class="num">${v ? rp(v) : '—'}</td><td>${v ? inp(ba, `bukti.${key}`, 'bukti') : ''}</td></tr>`).join('');

  const ahliWaris = penerima.map((p, i) => `<tr><td>${i + 1}</td><td>${inp(ba, `nama.${p.id}`, 'Nama lengkap')}</td><td>${esc(p.label)}</td><td class="num">${fstr(p.each)}</td><td class="num">${H ? rp(bagianRupiah(H, p.each)) : '—'}</td></tr>`).join('');

  const barangRows = k
    ? k.penerima.map((p, i) => `<tr><td>${i + 1}</td><td>${esc(namaOf(p) || p.label)}</td><td>${esc(p.barang.join(', ') || '—')}</td><td class="num">${rp(p.ambil)}</td>
        <td class="num">${p.status === 'pas' ? 'Pas' : p.status === 'kurang' ? `Kurang ${rp(p.selisih)}<small>menerima</small>` : `Lebih ${rp(-p.selisih)}<small>membayar</small>`}</td><td>${Math.abs(p.selisih) < 1 ? '' : `<textarea class="ba-in ba-mini" rows="2" data-ba="bayar.${p.id}" placeholder="tunai / cicil s.d. …" aria-label="Cara dan waktu pembayaran">${esc(ba.bayar[p.id] || '')}</textarea>`}</td></tr>`).join('')
    : `<tr><td colspan="6">Harta dibagi dalam bentuk uang sesuai nilai hak di tabel 3.</td></tr>`;

  const tglWafatLapis = m ? `<p class="ba-cat">Ahli waris yang wafat sebelum harta dibagi (munāsakhah): ${m.lapis.map(l => esc(l.wafatLabel)).join(', ')}. Bagiannya sudah berpindah kepada ahli warisnya (Bab 13).</p>` : '';

  const html = `<article class="ba-doc" id="ba-doc">
    <h2 id="ba-judul" class="ba-h">BERITA ACARA PEMBAGIAN HARTA WARISAN</h2>
    <p class="ba-p">Pada hari ${inp(ba, 'hari', 'hari', 'pendek')}, tanggal ${inp(ba, 'tanggal', 'tanggal', 'pendek')}, bertempat di ${inp(ba, 'tempat', 'tempat', 'sedang')}, kami para ahli waris dari almarhum/almarhumah:</p>
    <table class="ba-t"><tbody>
      <tr><th>Nama</th><td>${inp(ba, 'pw.nama', state.nama || 'Nama pewaris')}</td></tr>
      <tr><th>Jenis kelamin</th><td>${state.pw === 'L' ? 'Laki-laki' : 'Perempuan'}</td></tr>
      <tr><th>Tempat/tanggal lahir</th><td>${inp(ba, 'pw.ttl', '')}</td></tr>
      <tr><th>Tanggal wafat</th><td>${inp(ba, 'pw.wafat', '')}</td></tr>
      <tr><th>Alamat terakhir</th><td>${inp(ba, 'pw.alamat', '')}</td></tr>
      <tr><th>Bukti kematian (no. akta/surat keterangan)</th><td>${inp(ba, 'pw.bukti', '')}</td></tr>
    </tbody></table>
    <p class="ba-p">telah bermusyawarah dan bersepakat sebagai berikut.</p>

    <h3 class="ba-h3">1. Daftar harta peninggalan dan taksiran nilainya</h3>
    <table class="ba-t"><thead><tr><th>No.</th><th>Jenis harta</th><th>Keterangan/bukti kepemilikan</th><th class="num">Nilai taksiran</th></tr></thead>
      <tbody>${hartaRows || '<tr><td colspan="4">—</td></tr>'}<tr class="ba-tot"><td></td><td>Jumlah</td><td></td><td class="num">${rp(totalHarta)}</td></tr></tbody></table>

    <h3 class="ba-h3">2. Kewajiban yang telah diselesaikan</h3>
    <table class="ba-t"><thead><tr><th>Uraian</th><th class="num">Jumlah</th><th>Bukti</th></tr></thead>
      <tbody>${kewajiban}<tr class="ba-tot"><td>Harta bersih yang dibagi</td><td class="num">${rp(H)}</td><td></td></tr></tbody></table>

    <h3 class="ba-h3">3. Ahli waris dan bagiannya</h3>
    ${tglWafatLapis}
    <table class="ba-t"><thead><tr><th>No.</th><th>Nama</th><th>Hubungan dengan pewaris</th><th class="num">Bagian</th><th class="num">Nilai hak</th></tr></thead>
      <tbody>${ahliWaris}</tbody></table>

    <h3 class="ba-h3">4. Pembagian barang dan kompensasi</h3>
    <table class="ba-t"><thead><tr><th>No.</th><th>Nama ahli waris</th><th>Barang yang diterima</th><th class="num">Nilai barang</th><th class="num">Kompensasi</th><th>Cara dan waktu pembayaran</th></tr></thead>
      <tbody>${barangRows}</tbody></table>
    ${k && (k.transfer.length || k.dariSisa.length) ? `<p class="ba-p ba-bayar">Uang pengganti: ${[
      ...k.transfer.map(t => `${esc(ba.nama[t.dari] || t.dariLabel)} membayar ${rp(t.jumlah)} kepada ${esc(ba.nama[t.ke] || t.keLabel)}`),
      ...k.dariSisa.map(t => `${esc(ba.nama[t.ke] || t.keLabel)} menerima ${rp(t.jumlah)} dari sisa harta`),
    ].join('; ')}.</p>` : ''}

    <h3 class="ba-h3">5. Kesepakatan lain</h3>
    <textarea class="ba-in ba-area" data-ba="kesepakatan" rows="3" placeholder="Misalnya: ahli waris yang merelakan sebagian haknya, harta yang tetap dimiliki bersama beserta persentasenya, atau pemberian kepada kerabat yang tidak mendapat warisan.">${esc(ba.kesepakatan || '')}</textarea>

    <p class="ba-p">Berita acara ini dibuat dengan sadar, tanpa paksaan, setelah setiap ahli waris mengetahui bagiannya masing-masing.</p>

    <table class="ba-t ba-sign"><thead><tr><th>Ahli waris</th><th>Tanda tangan</th></tr></thead><tbody>
      ${penerima.map((p, i) => `<tr><td>${i + 1}. ${esc(namaOf(p) || p.label)}${namaOf(p) ? `<small>${esc(p.label)}</small>` : ''}</td><td>${ttd(ba, p.id, namaOf(p) || p.label)}</td></tr>`).join('')}
    </tbody></table>
    <table class="ba-t ba-sign"><thead><tr><th>Saksi</th><th>Tanda tangan</th></tr></thead><tbody>
      ${[0, 1].map(i => `<tr><td>${i + 1}. ${inp(ba, `saksi.${i}`, 'Nama saksi')}</td><td>${ttd(ba, `saksi${i}`, ba.saksi[i] || `Saksi ${i + 1}`)}</td></tr>`).join('')}
    </tbody></table>
    <table class="ba-t ba-sign"><thead><tr><th>Mengetahui (bila diperlukan): Ketua RT/RW, Kepala Desa/Lurah, atau tokoh agama</th><th>Tanda tangan</th></tr></thead><tbody>
      <tr><td>${inp(ba, 'mengetahui', 'Nama dan jabatan')}</td><td>${ttd(ba, 'mengetahui', ba.mengetahui || 'Yang mengetahui')}</td></tr>
    </tbody></table>
    <p class="ba-foot">Dihitung dengan Kalkulator FAROID menurut fiqih mazhab Syafiʿi (ebook <i>Dari Bingung Jadi Paham Waris</i>, Lampiran E). Untuk sengketa, rujuk ahli faraid atau Pengadilan Agama.</p>
  </article>`;
  // tabel lebar bisa digeser di layar kecil tanpa melebarkan halaman
  return html.replace(/<table class="ba-t/g, '<div class="ba-wrap"><table class="ba-t').replace(/<\/table>/g, '</table></div>');
}

// ---------- tanda tangan di layar ----------
export function pasangPadTtd(canvas) {
  const ctx = canvas.getContext('2d');
  let gambar = false, ada = false, last = null;
  const pos = e => { const r = canvas.getBoundingClientRect(); return [(e.clientX - r.left) * canvas.width / r.width, (e.clientY - r.top) * canvas.height / r.height]; };
  const bersihkan = () => { ctx.clearRect(0, 0, canvas.width, canvas.height); ada = false; };
  canvas.addEventListener('pointerdown', e => { gambar = true; last = pos(e); canvas.setPointerCapture(e.pointerId); e.preventDefault(); });
  canvas.addEventListener('pointermove', e => {
    if (!gambar) return;
    const p = pos(e);
    ctx.strokeStyle = '#10231b'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(...last); ctx.lineTo(...p); ctx.stroke();
    last = p; ada = true;
  });
  const selesai = () => { gambar = false; };
  canvas.addEventListener('pointerup', selesai);
  canvas.addEventListener('pointercancel', selesai);
  return {
    bersihkan,
    kosong: () => !ada,
    // potong ke area goresan supaya ringan disimpan
    hasil() {
      const { width: w, height: h } = canvas;
      const data = ctx.getImageData(0, 0, w, h).data;
      let x0 = w, y0 = h, x1 = 0, y1 = 0;
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (data[(y * w + x) * 4 + 3]) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
      if (x1 < x0) return null;
      const pad = 8, cw = Math.min(w, x1 - x0 + pad * 2), ch = Math.min(h, y1 - y0 + pad * 2);
      const out = document.createElement('canvas'); out.width = cw; out.height = ch;
      out.getContext('2d').drawImage(canvas, Math.max(0, x0 - pad), Math.max(0, y0 - pad), cw, ch, 0, 0, cw, ch);
      return out.toDataURL('image/png');
    },
  };
}
