import './style.css';
import { HEIRS, HEIR, SEBAB_MAHRUM, hitung, hartaBersih, munasakhah, lapisEfektif, sarankanTautan, pecahId } from '../engine/index.js';
import { PRESETS } from './presets.js';
import { rp, parseRp, fmtAngka, esc } from './format.js';
import { renderHasil, renderPreview, teksRingkasan, KEADAAN_KHUSUS, namaAkhir } from './hasil.js';
import { renderBeritaAcara, baKosong, setBa, pasangPadTtd } from './berita-acara.js';
import { buatLink, bacaLink } from './tautan.js';
import * as store from './storage.js';

const $ = sel => document.querySelector(sel);
const $$ = sel => [...document.querySelectorAll(sel)];

const kosong = () => ({ step: 1, view: 'form', nama: '', pw: 'L', heirs: {}, mahrum: [], harta: {}, barang: [], khusus: {}, lapis: [], ba: baKosong() });
const rapikan = s => { const st = Object.assign(kosong(), s); st.ba = Object.assign(baKosong(), st.ba || {}); return st; };

// kasus dari link bagikan (#k=...) didahulukan daripada draf tersimpan
const dariLink = bacaLink();
let state = rapikan(dariLink ? { ...dariLink, step: 4 } : store.bacaDraf() || {});
if (dariLink) history.replaceState(null, '', location.pathname + location.search);

const MONEY = [
  { key: 'bersama', label: 'Harta bersama (gono-gini)', hint: 'Diperoleh selama menikah. Separuhnya milik pasangan yang masih hidup (KHI Ps. 96).' },
  { key: 'bawaan', label: 'Harta pribadi pewaris', hint: 'Harta bawaan, hibah, atau warisan yang ia terima.' },
  { key: 'jenazah', label: 'Biaya pengurusan jenazah', hint: 'Memandikan, mengafani, menguburkan secara wajar.' },
  { key: 'utang', label: 'Utang pewaris', hint: 'Termasuk utang kepada Allah seperti zakat yang belum dibayar.' },
  { key: 'wasiat', label: 'Wasiat', hint: 'Maksimal 1/3 setelah utang, dan bukan untuk ahli waris.' },
];
const MAIN_GROUPS = ['Pasangan', 'Orang tua dan leluhur', 'Keturunan', 'Saudara'];

// ---------- hitung ----------
function jumlahAhliWaris() { return Object.values(state.heirs).reduce((a, b) => a + (+b || 0), 0); }
const masalah1 = () => ({ pewaris: state.pw, heirs: state.heirs, mahrum: state.mahrum, harta: state.harta });
function compute() {
  const hb = hartaBersih(state.harta);
  const hasil = jumlahAhliWaris() ? hitung(masalah1()) : null;
  let m = null, err = null;
  if (hasil && state.lapis.some(l => l.wafat)) {
    try { m = munasakhah(masalah1(), lapisEfektif(masalah1(), state.lapis)); } catch (e) { err = e.message; }
  }
  return { hb, hasil, m, err };
}

// ---------- langkah 1: pewaris ----------
function renderPewaris() {
  $$('[data-pw]').forEach(b => b.setAttribute('aria-checked', String(b.dataset.pw === state.pw)));
  $('#pw-hint').textContent = state.pw === 'L' ? 'Pasangan yang ditinggalkan: istri (boleh lebih dari satu).' : 'Pasangan yang ditinggalkan: suami.';
  $('#nama-kasus').value = state.nama || '';
}
$$('[data-pw]').forEach(b => b.addEventListener('click', () => {
  state.pw = b.dataset.pw;
  if (state.pw === 'L') delete state.heirs.suami; else delete state.heirs.istri;
  state.mahrum = state.mahrum.filter(m => !(HEIR[m.key].only && HEIR[m.key].only !== state.pw));
  renderPewaris(); renderHeirs(); renderMahrum(); renderLapis(); update();
}));
$('#nama-kasus').addEventListener('input', e => { state.nama = e.target.value; save(); });

// ---------- langkah 2: harta ----------
function renderMoney() {
  $('#money').innerHTML = MONEY.map(m => `
    <label for="m-${m.key}">${m.label}<small>${m.hint}</small></label>
    <div class="rp"><input id="m-${m.key}" data-money="${m.key}" type="text" inputmode="numeric" autocomplete="off" value="${fmtAngka(state.harta[m.key])}" placeholder="0"></div>`).join('');
}
$('#money').addEventListener('input', e => {
  const k = e.target.dataset.money; if (!k) return;
  state.harta[k] = parseRp(e.target.value);
  update();
});
$('#money').addEventListener('focusout', e => { if (e.target.dataset.money) e.target.value = fmtAngka(state.harta[e.target.dataset.money]); });

function renderFlow(hb) {
  const h = state.harta;
  if (!MONEY.some(m => h[m.key])) { $('#flow').innerHTML = ''; return; }
  $('#flow').innerHTML = `
    ${hb.bersama ? `<div class="minus"><span>Separuh harta bersama untuk pasangan</span><span>${rp(hb.bagianPasangan)}</span></div>` : ''}
    <div><span>Harta peninggalan</span><span>${rp(hb.peninggalan)}</span></div>
    ${hb.jenazah ? `<div class="minus"><span>− Biaya jenazah</span><span>${rp(hb.jenazah)}</span></div>` : ''}
    ${hb.utang ? `<div class="minus"><span>− Utang</span><span>${rp(hb.utang)}</span></div>` : ''}
    ${hb.utangTakTerbayar ? `<div class="warn-text">Utang ${rp(hb.utangTakTerbayar)} melebihi harta yang ada.</div>` : ''}
    ${hb.wasiat ? `<div class="minus"><span>− Wasiat${hb.wasiatDipotong ? ' (dibatasi 1/3)' : ''}</span><span>${rp(hb.wasiat)}</span></div>` : ''}
    ${hb.wasiatDipotong ? `<div class="warn-text">Wasiat melebihi 1/3. Kelebihannya hanya sah jika semua ahli waris setuju (KHI Ps. 195).</div>` : ''}
    <div class="net"><span>Harta bersih yang dibagi</span><span>${rp(hb.bersih)}</span></div>`;
}

function renderBarangInput() {
  $('#barang-list').innerHTML = state.barang.map((b, i) => `<div class="lrow">
      <input type="text" data-bi="${i}" data-bf="nama" value="${esc(b.nama)}" placeholder="Nama barang, mis. Rumah" aria-label="Nama barang ${i + 1}">
      <div class="rp"><input type="text" data-bi="${i}" data-bf="nilai" inputmode="numeric" value="${fmtAngka(b.nilai)}" placeholder="Taksiran" aria-label="Nilai barang ${i + 1}"></div>
      <button type="button" class="icon-btn x" data-bdel="${i}" aria-label="Hapus barang ${i + 1}">×</button></div>`).join('');
  const total = state.barang.reduce((a, b) => a + (+b.nilai || 0), 0);
  const btn = $('#barang-pakai');
  btn.hidden = !total;
  btn.textContent = `Pakai total barang (${rp(total)}) sebagai harta pribadi`;
  if (state.barang.length) $('#barang-box').open = true;
}
$('#barang-add').addEventListener('click', () => {
  state.barang.push({ nama: '', nilai: 0, oleh: '' });
  renderBarangInput(); update();
  $(`[data-bi="${state.barang.length - 1}"][data-bf="nama"]`)?.focus();
});
$('#barang-list').addEventListener('input', e => {
  const i = e.target.dataset.bi; if (i == null) return;
  const f = e.target.dataset.bf;
  state.barang[i][f] = f === 'nilai' ? parseRp(e.target.value) : e.target.value;
  const total = state.barang.reduce((a, b) => a + (+b.nilai || 0), 0);
  $('#barang-pakai').hidden = !total;
  $('#barang-pakai').textContent = `Pakai total barang (${rp(total)}) sebagai harta pribadi`;
  update();
});
$('#barang-list').addEventListener('focusout', e => { if (e.target.dataset.bf === 'nilai') e.target.value = fmtAngka(state.barang[e.target.dataset.bi]?.nilai); });
$('#barang-list').addEventListener('click', e => {
  const d = e.target.closest('[data-bdel]'); if (!d) return;
  state.barang.splice(+d.dataset.bdel, 1); renderBarangInput(); update();
});
$('#barang-pakai').addEventListener('click', () => {
  state.harta.bawaan = state.barang.reduce((a, b) => a + (+b.nilai || 0), 0);
  renderMoney(); update(); toast('Total barang dipakai sebagai harta pribadi pewaris.');
});

// ---------- langkah 3: ahli waris ----------
/** Grid tombol −/+ untuk jumlah tiap ahli waris. idPrefix membedakan grid utama dan grid tiap lapis. */
function gridAhliWaris(heirs, pw, idPrefix) {
  const groups = {};
  HEIRS.forEach(h => { if (h.only && h.only !== pw) return; (groups[h.group] ||= []).push(h); });
  const block = g => `<fieldset><legend>${g}</legend>${groups[g].map(h => {
    const v = heirs[h.key] || 0;
    const id = `${idPrefix}-${h.key}`;
    return `<div class="heir${v ? ' on' : ''}">
      <label for="${id}">${h.label}</label>
      <span class="stepnum"><button type="button" data-k="${h.key}" data-d="-1" aria-label="Kurangi ${h.label}">−</button><input id="${id}" type="number" inputmode="numeric" min="0" max="${h.max}" value="${v}" data-k="${h.key}"><button type="button" data-k="${h.key}" data-d="1" aria-label="Tambah ${h.label}">+</button></span>
    </div>`;
  }).join('')}</fieldset>`;
  const lainOpen = HEIRS.some(h => h.group === 'Kerabat lain' && heirs[h.key]);
  return MAIN_GROUPS.filter(g => groups[g]).map(block).join('')
    + `<details class="more"${lainOpen ? ' open' : ''}><summary>Kerabat lain (keponakan, paman, sepupu)</summary>${block('Kerabat lain')}</details>`;
}
function renderHeirs() { $('#heirs').innerHTML = gridAhliWaris(state.heirs, state.pw, 'h'); }
const setJumlah = (heirs, k, v) => {
  const n = Math.max(0, Math.min(HEIR[k].max, Math.floor(+v || 0)));
  if (n) heirs[k] = n; else delete heirs[k];
};
const setHeir = (k, v) => { setJumlah(state.heirs, k, v); renderLapis(); };
$('#heirs').addEventListener('click', e => {
  const b = e.target.closest('button[data-k]'); if (!b) return;
  setHeir(b.dataset.k, (state.heirs[b.dataset.k] || 0) + (+b.dataset.d));
  renderHeirs(); update();
  $(`button[data-k="${b.dataset.k}"][data-d="${b.dataset.d}"]`)?.focus();
});
$('#heirs').addEventListener('change', e => {
  const i = e.target.closest('input[data-k]'); if (!i) return;
  setHeir(i.dataset.k, i.value); renderHeirs(); update();
});

function renderMahrum() {
  const opsi = HEIRS.filter(h => !h.only || h.only === state.pw);
  $('#mahrum-list').innerHTML = state.mahrum.map((m, i) => `<div class="lrow m">
      <select data-mi="${i}" data-mf="key" aria-label="Hubungan kerabat maḥrūm ${i + 1}">${opsi.map(h => `<option value="${h.key}"${h.key === m.key ? ' selected' : ''}>${h.label}</option>`).join('')}</select>
      <input type="number" min="1" max="20" inputmode="numeric" data-mi="${i}" data-mf="n" value="${m.n}" aria-label="Jumlah">
      <select data-mi="${i}" data-mf="sebab" aria-label="Sebab">${Object.entries(SEBAB_MAHRUM).map(([k, v]) => `<option value="${k}"${k === m.sebab ? ' selected' : ''}>${v}</option>`).join('')}</select>
      <button type="button" class="icon-btn x" data-mdel="${i}" aria-label="Hapus">×</button></div>`).join('');
  if (state.mahrum.length) $('#mahrum-box').open = true;
}
$('#mahrum-add').addEventListener('click', () => {
  state.mahrum.push({ key: 'anakL', n: 1, sebab: 'agama' }); renderMahrum(); update();
});
$('#mahrum-list').addEventListener('change', e => {
  const i = e.target.dataset.mi; if (i == null) return;
  const f = e.target.dataset.mf;
  state.mahrum[i][f] = f === 'n' ? Math.max(1, Math.min(20, Math.floor(+e.target.value || 1))) : e.target.value;
  update();
});
$('#mahrum-list').addEventListener('click', e => {
  const d = e.target.closest('[data-mdel]'); if (!d) return;
  state.mahrum.splice(+d.dataset.mdel, 1); renderMahrum(); update();
});

function renderKhusus() {
  $('#khusus').innerHTML = KEADAAN_KHUSUS.map(k => `<label><input type="checkbox" data-khusus="${k.key}"${state.khusus[k.key] ? ' checked' : ''}><span>${k.label}<small>Bab ${k.bab}</small></span></label>`).join('');
  if (KEADAAN_KHUSUS.some(k => state.khusus[k.key])) $('#khusus-box').open = true;
}
$('#khusus').addEventListener('change', e => {
  const k = e.target.dataset.khusus; if (!k) return;
  state.khusus[k] = e.target.checked; update();
});

// ---------- munāsakhah (lapis) ----------
function renderLapis() {
  const m1 = masalah1();
  const ada = jumlahAhliWaris() > 0;
  $('#lapis-add').disabled = !ada;
  $('#lapis-list').innerHTML = state.lapis.map((lp, k) => {
    const n = k + 2;
    let kandidat = [], galat = null;
    if (ada) {
      try {
        const sebelum = munasakhah(m1, lapisEfektif(m1, state.lapis.slice(0, k)));
        kandidat = sebelum.orang.filter(o => o.saham > 0).map(o => ({ id: o.id, label: namaAkhir(o, sebelum) }));
      } catch (e) { galat = e.message; }
    }
    const pilihWafat = `<select data-lp="${k}" data-lf="wafat" aria-label="Siapa yang wafat (lapis ${n})">
      <option value="">— pilih ahli waris yang wafat —</option>
      ${kandidat.map(c => `<option value="${c.id}"${c.id === lp.wafat ? ' selected' : ''}>${esc(c.label)}</option>`).join('')}</select>`;
    let isi = '';
    if (lp.wafat && kandidat.some(c => c.id === lp.wafat)) {
      const D = kandidat.find(c => c.id === lp.wafat);
      const g = HEIR[pecahId(lp.wafat).key].g;
      const saran = sarankanTautan(m1, lp.wafat, lp.heirs);
      const lain = kandidat.filter(c => c.id !== lp.wafat);
      const baris = [];
      Object.entries(lp.heirs).forEach(([key, cnt]) => {
        for (let i = 1; i <= cnt; i++) {
          const kunci = `${key}#${i}`;
          const pilih = lp.tautan && kunci in lp.tautan ? lp.tautan[kunci] : saran[kunci] || '';
          baris.push(`<div class="tautan-row"><span>${HEIR[key].label}${cnt > 1 ? ` ${i}` : ''}</span>
            <select data-lp="${k}" data-lt="${kunci}" aria-label="${HEIR[key].label}${cnt > 1 ? ` ${i}` : ''} adalah">
              <option value=""${!pilih ? ' selected' : ''}>Orang baru</option>
              ${lain.map(c => `<option value="${c.id}"${c.id === pilih ? ' selected' : ''}>sama dengan: ${esc(c.label)}</option>`).join('')}</select></div>`);
        }
      });
      isi = `<p class="sub">Ahli waris <b>${esc(D.label)}</b> (${g === 'L' ? 'laki-laki' : 'perempuan'}) yang masih hidup <b>saat ia wafat</b>:</p>
        <div data-lp="${k}" data-lgrid>${gridAhliWaris(lp.heirs, g, `lp${k}`)}</div>
        ${baris.length ? `<div class="tautan"><p class="sub"><b>Orang yang sama?</b> Jika ahli waris ini juga sudah tercatat sebelumnya (misalnya ibunya = istri pewaris pertama), tautkan supaya bagiannya dijumlahkan. Sudah diisi otomatis untuk kasus umum; periksa lagi.</p>${baris.join('')}</div>` : ''}`;
    }
    return `<div class="lapis-card">
      <div class="lapis-head"><b>Lapis ${n}</b><button type="button" class="icon-btn x" data-ldel="${k}" aria-label="Hapus lapis ${n}">×</button></div>
      ${galat ? `<p class="warn-text">${esc(galat)}</p>` : ''}
      <label class="field"><span>Siapa yang wafat sebelum harta dibagi?</span>${pilihWafat}</label>
      ${isi}
    </div>`;
  }).join('');
  if (state.lapis.length) $('#lapis-box').open = true;
}
$('#lapis-add').addEventListener('click', () => {
  state.lapis.push({ wafat: '', heirs: {}, tautan: {} }); renderLapis(); update();
});
$('#lapis-list').addEventListener('change', e => {
  const el = e.target, k = el.closest('[data-lp]')?.dataset.lp; if (k == null) return;
  const lp = state.lapis[+k];
  if (el.dataset.lf === 'wafat') { lp.wafat = el.value; lp.heirs = {}; lp.tautan = {}; state.lapis.splice(+k + 1); }
  else if (el.dataset.lt) lp.tautan[el.dataset.lt] = el.value;
  else if (el.dataset.k) setJumlah(lp.heirs, el.dataset.k, el.value);
  else return;
  renderLapis(); update();
});
$('#lapis-list').addEventListener('click', e => {
  const del = e.target.closest('[data-ldel]');
  if (del) { state.lapis.splice(+del.dataset.ldel); renderLapis(); update(); return; } // lapis sesudahnya ikut terhapus
  const b = e.target.closest('button[data-k]'); if (!b) return;
  const k = +b.closest('[data-lp]').dataset.lp;
  setJumlah(state.lapis[k].heirs, b.dataset.k, (state.lapis[k].heirs[b.dataset.k] || 0) + (+b.dataset.d));
  renderLapis(); update();
  $(`[data-lp="${k}"] button[data-k="${b.dataset.k}"][data-d="${b.dataset.d}"]`)?.focus();
});

// ---------- langkah 4: hasil ----------
$('#out').addEventListener('change', e => {
  const i = e.target.dataset.barangOleh; if (i == null) return;
  state.barang[i].oleh = e.target.value; update();
});

// ---------- navigasi langkah ----------
function goStep(n, { scroll = true } = {}) {
  state.step = Math.max(1, Math.min(4, n));
  $$('.step').forEach(s => s.classList.toggle('active', +s.dataset.step === state.step));
  $$('.stepper [data-go]').forEach(b => {
    const k = +b.dataset.go;
    if (k === state.step) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
    b.classList.toggle('done', k < state.step);
  });
  $('#layout').dataset.step = state.step;
  $('#btn-prev').disabled = state.step === 1;
  $('#btn-next').hidden = state.step === 4;
  $('#btn-next').textContent = state.step === 3 ? 'Lihat hasil →' : 'Lanjut →';
  save();
  if (scroll) window.scrollTo({ top: Math.min(window.scrollY, $('.stepper').offsetTop), behavior: 'smooth' });
}
$$('.stepper [data-go]').forEach(b => b.addEventListener('click', () => goStep(+b.dataset.go)));
$('#btn-prev').addEventListener('click', () => goStep(state.step - 1));
$('#btn-next').addEventListener('click', () => goStep(state.step + 1));

// ---------- pembaruan ----------
let saveTimer;
function save() { clearTimeout(saveTimer); saveTimer = setTimeout(() => store.simpanDraf(state), 250); }

function update() {
  const { hb, hasil, m, err } = compute();
  renderFlow(hb);
  $('#out').innerHTML = renderHasil(state, hasil, hb, { m, err });
  $('#preview').innerHTML = renderPreview(hasil, hb);
  const n = jumlahAhliWaris();
  $('#nav-mini').textContent = [n ? `${n} ahli waris` : 'Belum ada ahli waris', m ? `munāsakhah ${m.lapis.length + 1} lapis` : '', hb.bersih ? rp(hb.bersih) : ''].filter(Boolean).join(' · ');
  if (state.view === 'ba') renderBa();
  save();
}

function renderAll() {
  renderPewaris(); renderMoney(); renderBarangInput(); renderHeirs(); renderMahrum(); renderKhusus(); renderLapis();
  update(); goStep(state.step, { scroll: false }); setView(state.view, { scroll: false });
}

function muat(s) {
  state = rapikan(structuredClone(s));
  renderAll();
}

// ---------- berita acara (Lampiran E) ----------
function renderBa() {
  const { hb, hasil, m } = compute();
  $('#ba-isi').innerHTML = renderBeritaAcara(state, hasil, hb, m);
}
function setView(v, { scroll = true } = {}) {
  state.view = v === 'ba' ? 'ba' : 'form';
  const ba = state.view === 'ba';
  document.body.dataset.view = state.view;
  $('#ba-view').hidden = !ba;
  if (ba) renderBa();
  save();
  if (scroll) window.scrollTo({ top: 0, behavior: 'smooth' });
}
$('#btn-ba').addEventListener('click', () => {
  if (!jumlahAhliWaris()) { toast('Isi ahli waris dulu.'); return; }
  setView('ba');
});
$('#ba-kembali').addEventListener('click', () => setView('form'));
$('#ba-cetak').addEventListener('click', () => window.print());
// isian teks: simpan tanpa menggambar ulang supaya kursor tidak lompat
$('#ba-isi').addEventListener('input', e => {
  const path = e.target.dataset.ba; if (!path) return;
  setBa(state.ba, path, e.target.value); save();
});
// nama ahli waris dipakai juga di tabel lain: gambar ulang setelah selesai mengetik
$('#ba-isi').addEventListener('change', e => { if (e.target.dataset.ba?.startsWith('nama.') || e.target.dataset.ba?.startsWith('saksi.')) renderBa(); });

const dlgTtd = $('#dlg-ttd');
const pad = pasangPadTtd($('#ttd-canvas'));
let ttdKey = null;
$('#ba-isi').addEventListener('click', e => {
  const b = e.target.closest('[data-ttd]'); if (!b) return;
  ttdKey = b.dataset.ttd;
  $('#ttd-nama').textContent = `Tanda tangan: ${b.dataset.ttdNama}`;
  pad.bersihkan();
  dlgTtd.showModal();
});
$('#ttd-hapus').addEventListener('click', () => pad.bersihkan());
$('#ttd-tutup').addEventListener('click', () => dlgTtd.close());
$('#ttd-kosongkan').addEventListener('click', () => { delete state.ba.ttd[ttdKey]; dlgTtd.close(); renderBa(); save(); });
$('#ttd-simpan').addEventListener('click', () => {
  const img = pad.hasil();
  if (!img) { toast('Belum ada goresan tanda tangan.'); return; }
  state.ba.ttd[ttdKey] = img; dlgTtd.close(); renderBa(); save();
  toast('Tanda tangan disimpan di perangkat ini.');
});

// ---------- contoh kasus ----------
const presetSel = $('#preset');
presetSel.innerHTML = `<option value="">Muat contoh kasus…</option>`
  + PRESETS.map((p, i) => `<option value="${i}">${esc(p.nama)}</option>`).join('')
  + `<option value="kosong">Kosongkan formulir</option>`;
presetSel.addEventListener('change', () => {
  const v = presetSel.value;
  if (v === 'kosong') { muat(kosong()); toast('Formulir dikosongkan.'); }
  else if (v !== '') {
    const p = PRESETS[+v];
    muat({ ...kosong(), step: 4, nama: p.nama, pw: p.pw, heirs: p.heirs, harta: p.harta, mahrum: p.mahrum || [], barang: p.barang || [], lapis: p.lapis || [] });
  }
  presetSel.value = '';
});

// ---------- riwayat ----------
const dlg = $('#dlg-riwayat');
function renderRiwayat() {
  const list = store.daftarRiwayat();
  $('#riwayat-list').innerHTML = list.length ? list.map(r => `<div class="rw">
      <div><b>${esc(r.nama || 'Tanpa nama')}</b><small>${new Date(r.waktu).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</small></div>
      <button type="button" class="btn ghost" data-buka="${r.id}">Buka</button>
      <button type="button" class="icon-btn" data-hapus="${r.id}" aria-label="Hapus ${esc(r.nama)}">×</button></div>`).join('')
    : `<p class="empty">Belum ada kasus tersimpan. Tekan <b style="display:inline">Simpan</b> di halaman hasil.</p>`;
}
$('#btn-riwayat').addEventListener('click', () => { renderRiwayat(); dlg.showModal(); });
$('#riwayat-list').addEventListener('click', e => {
  const buka = e.target.closest('[data-buka]'), hapus = e.target.closest('[data-hapus]');
  if (buka) { const r = store.daftarRiwayat().find(x => x.id === buka.dataset.buka); if (r) { muat({ ...r.state, step: 4, view: 'form' }); dlg.close(); toast('Kasus dibuka.'); } }
  if (hapus) { store.hapusRiwayat(hapus.dataset.hapus); renderRiwayat(); }
});
$('#btn-simpan').addEventListener('click', () => {
  if (!jumlahAhliWaris()) { toast('Isi ahli waris dulu.'); return; }
  const nama = state.nama || `Kasus ${new Date().toLocaleDateString('id-ID')}`;
  toast(store.simpanRiwayat(nama, state) ? 'Tersimpan di riwayat perangkat ini.' : 'Gagal menyimpan: penyimpanan browser tidak tersedia.');
});

// ---------- bagikan & cetak ----------
const linkKasus = () => buatLink(state, location.origin + location.pathname);
$('#btn-bagikan').addEventListener('click', async () => {
  const { hb, hasil, m } = compute();
  if (!hasil) { toast('Isi ahli waris dulu.'); return; }
  const url = linkKasus();
  const text = teksRingkasan(state, hasil, hb, m) + `\n\nBuka perhitungan lengkapnya:\n${url}`;
  try {
    if (navigator.share) { await navigator.share({ title: 'Pembagian waris', text }); return; }
    await navigator.clipboard.writeText(text); toast('Ringkasan dan link disalin. Tinggal tempel di WhatsApp.');
  } catch (err) {
    if (err?.name !== 'AbortError') toast('Tidak bisa membagikan dari browser ini.');
  }
});
$('#btn-link').addEventListener('click', async () => {
  if (!jumlahAhliWaris()) { toast('Isi ahli waris dulu.'); return; }
  try { await navigator.clipboard.writeText(linkKasus()); toast('Link kasus disalin. Siapa pun yang membukanya melihat perhitungan yang sama.'); }
  catch { prompt('Salin link ini:', linkKasus()); }
});
$('#btn-cetak').addEventListener('click', () => window.print());
window.addEventListener('beforeprint', () => {
  const box = $('#langkah-box'); if (box) box.open = true;
  $('#print-meta').textContent = [state.nama, `Dicetak ${new Date().toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}`].filter(Boolean).join(' · ');
});

// ---------- tema ----------
$('#btn-tema').addEventListener('click', () => {
  const gelap = document.documentElement.dataset.theme === 'dark'
    || (!document.documentElement.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches);
  const baru = gelap ? 'light' : 'dark';
  document.documentElement.dataset.theme = baru;
  store.simpanTema(baru);
});

// ---------- toast ----------
let toastTimer;
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}

renderAll();
if (dariLink) toast('Kasus dari link dimuat.');
// link ditempel di tab yang sudah terbuka
window.addEventListener('hashchange', () => {
  const data = bacaLink();
  if (!data) return;
  muat({ ...data, step: 4 });
  history.replaceState(null, '', location.pathname + location.search);
  toast('Kasus dari link dimuat.');
});

// ---------- PWA ----------
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}
