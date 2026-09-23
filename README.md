# Kalkulator FAROID

Kalkulator waris Islam (faraid) menurut fiqih mazhab Syafi'i, dengan catatan KHI sebagai pembanding.
Pendamping ebook **Dari Bingung Jadi Paham Waris** karya Abu Kautsar.

## Menjalankan

```bash
npm install
npm run dev       # http://localhost:5173
npm test          # semua test harus lulus
npm run build     # hasil di dist/, siap diunggah ke hosting statis
npm run preview   # mencoba hasil build (termasuk mode offline)
```

## Fitur

- Alur 4 langkah seperti Bab 14.3: pewaris → harta → ahli waris → hasil.
- Bagian tiap ahli waris dalam pecahan eksak dan rupiah, siapa yang terhalang (ḥajb) dan kenapa.
- ʿAul, radd, taṣḥīḥ, al-Gharrāwain, al-Musyarrakah, kakek bersama saudara, al-Akdariyyah.
- Penjelasan tujuh langkah hitung (Bab 10) dengan rujukan bab ebook.
- Kerabat maḥrūm (pembunuh, beda agama) dan peringatan keadaan khusus yang belum dihitung otomatis.
- Pembagian barang dan uang kompensasi (Bab 10.6).
- Bagikan ringkasan (WhatsApp), cetak/PDF, riwayat kasus di perangkat, mode gelap.
- PWA: bisa dipasang di HP dan dipakai tanpa internet.

## Struktur

```
src/engine/   mesin hitung (tanpa DOM, bisa dipakai di Node)
src/ui/       tampilan
test/         Vitest
public/       manifest, service worker, ikon
purwarupa/    arsip versi purwarupa (dipakai test kesetaraan)
```

Hasil kalkulator untuk edukasi. Untuk pembagian resmi atau sengketa, rujuk ahli faraid atau Pengadilan Agama.
