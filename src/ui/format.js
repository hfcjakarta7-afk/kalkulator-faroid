export const rp = v => 'Rp ' + Math.round(+v || 0).toLocaleString('id-ID');
export const parseRp = s => +String(s || '').replace(/[^\d]/g, '') || 0;
export const fmtAngka = v => (v ? (+v).toLocaleString('id-ID') : '');

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = s => String(s ?? '').replace(/[&<>"']/g, ch => ESC[ch]);

export const babLink = b => `<span class="babref">Bab ${esc(b)}</span>`;
