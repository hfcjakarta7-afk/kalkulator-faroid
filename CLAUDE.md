# Kalkulator FAROID

Aplikasi kalkulator waris Islam (faraid), pendamping ebook **"Dari Bingung Jadi Paham Waris"** karya **Abu Kautsar**.
Pemilik project: Kang Nardi (programmer). Bahasa diskusi: Indonesia santai; istilah teknis tetap bahasa Inggris.

## Aturan fiqih (JANGAN diubah tanpa izin)
- Rujukan utama: **fiqih mazhab Syafi'i**. **KHI** (Kompilasi Hukum Islam, Inpres 1/1991) hanya sebagai **catatan pembanding**, bukan dasar hitungan.
- Radd: pasangan (suami/istri) **tidak** ikut radd (Syafi'i). KHI Ps. 193 hanya ditampilkan sebagai catatan.
- Kakek + saudara: pendapat Zaid bin Tsabit (pilih yang terbaik bagi kakek: muqasamah / 1/3 / 1/6 sesuai keadaan).
- Kasus khusus yang sudah ditangani: 'aul, radd, tashih, gharrawain ('umariyyatain), musyarakah, akdariyyah, munasakhah berlapis (Bab 13: S, A, FPB, al-jami'ah; orang yang sama antar lapis ditautkan, dengan saran otomatis yang bisa diubah pengguna).
- Belum otomatis (tampilkan peringatan, jangan menebak): mu'addah (baru disederhanakan), dzawil arham, anak dalam kandungan, mafqud, khuntsa.
- Urutan sebelum dibagi: pisahkan separuh harta bersama untuk pasangan yang hidup (KHI Ps. 96), lalu biaya jenazah → utang → wasiat (maks 1/3, bukan untuk ahli waris) → sisa dibagi waris.
- Semua angka memakai **pecahan eksak** (tanpa floating point untuk bagian). Rupiah dibulatkan hanya di tampilan, dan selisih pembulatan harus dilaporkan.

## Sumber kebenaran
- Engine: `src/engine/` (modul ES). Urutan: `hajb.js` → `furudh.js` → `asabah.js` → `kasus-khusus.js`, diatur `hitung.js` (juga ʿaul/radd/asal masalah/taṣḥīḥ). `harta.js` = harta bersih, rupiah (BigInt), kompensasi barang. `langkah.js` = penjelasan tujuh langkah Bab 10. `pecahan.js` = pecahan eksak.
- Test (`npm test`, Vitest) — **wajib selalu lulus semua**:
  - `test/ebook.test.js`: 53 kasus ebook Bab 5–14 (port dari `purwarupa/test.js`).
  - `test/rupiah-bab14.test.js`: angka rupiah Kasus 1–9 Bab 14 persis seperti tabel ebook.
  - `test/setara-purwarupa.test.js`: 5000 kasus acak harus sama persis dengan engine purwarupa. Jika aturan fiqih sengaja diubah (dengan izin), test ini boleh disesuaikan.
  - `test/harta.test.js`: harta bersih, pembulatan, kompensasi, maḥrūm, penjelasan langkah.
  - Setiap bug fix harus disertai test case baru.
- Naskah ebook (untuk rujukan aturan & contoh soal): `..\ebook\_tools\src\*.md`. Terutama Bab 4–13 dan 14 (kasus K1–K9, latihan L1–L5). Folder `..\ebook` **hanya dibaca**, jangan diubah dari sini.
- UI: `index.html` + `src/ui/` (vanilla JS + Vite). PWA: `public/manifest.webmanifest`, `public/sw.js` (naikkan `VERSI` tiap rilis). Ikon: `npm run ikon`.
- Arsip purwarupa (jangan dihapus, dipakai test kesetaraan): `purwarupa/`.

## Status versi produksi
1. ✅ Repo dirapikan: `src/engine/`, `src/ui/`, `test/` (Vitest), `purwarupa/`.
2. ✅ UI vanilla JS + Vite; mobile-first; tema hijau-emas; mode gelap. Alur 4 langkah sesuai Bab 14.3 (pewaris → harta → ahli waris → hasil).
3. ✅ PWA offline (sudah diuji offline). ⏳ Deploy ke GitHub Pages: workflow siap di `.github/workflows/deploy.yml`, tinggal repo + push.
4. ⏳ Android: bungkus PWA dengan TWA (Bubblewrap) atau Capacitor — belakangan.
5. ✅ Fitur: penjelasan tujuh langkah (merujuk bab ebook), pembagian barang + kompensasi, maḥrūm (Bab 2.5), peringatan keadaan khusus, bagikan (Web Share/salin), cetak/PDF, riwayat lokal, draf otomatis.
6. ✅ Munāsakhah berlapis (`src/engine/munasakhah.js`, test `test/munasakhah.test.js`: Pak Rahmat Bab 13.3 & Bab 14 Kasus 10).
7. ✅ Link kasus (`src/ui/tautan.js`): data di hash `#k=` (tidak terkirim ke server); isian berita acara & tanda tangan TIDAK ikut link.
8. ✅ Berita acara Lampiran E (`src/ui/berita-acara.js`): terisi otomatis, nama ahli waris, tanda tangan di layar (canvas → PNG di `state.ba.ttd`), cetak/PDF.

## Konvensi
- Windows, PowerShell. Node 24, npm 11, Git 2.55.
- Commit kecil dan jelas (bahasa Indonesia boleh). Jangan push ke remote tanpa diminta.
- Label UI & pesan untuk orang awam: bahasa Indonesia sederhana, istilah Arab ditulis dengan artinya, contoh: *'aṣabah* (penerima sisa).
- Disclaimer tetap tampil: hasil untuk edukasi; untuk sengketa rujuk ahli faraid / Pengadilan Agama.
