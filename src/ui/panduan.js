// Buku panduan penggunaan Kalkulator FAROID.
// Satu sumber untuk halaman "Panduan" di aplikasi dan versi PDF (npm run panduan:pdf).
// Gambar dibuat ulang otomatis dengan: npm run panduan:gambar

export const VERSI_PANDUAN = '1.1';
export const URL_APP = 'https://hfcjakarta7-afk.github.io/kalkulator-faroid/';

const g = (file, alt, cap, lebar = false) => `<figure class="pd-fig${lebar ? ' lebar' : ''}"><img src="./panduan/${file}.jpg" alt="${alt}" loading="lazy"><figcaption>${cap}</figcaption></figure>`;
const tip = (judul, isi) => `<div class="pd-tip"><b>${judul}</b>${isi}</div>`;

export const BAB = [
  {
    id: 'kenalan', judul: 'Mengenal Kalkulator FAROID',
    isi: `
      <p>Kalkulator FAROID membantu menghitung <b>pembagian waris menurut fiqih mazhab Syafiʿi</b>, lengkap sampai angka rupiah. Kalkulator ini pendamping ebook <i>Dari Bingung Jadi Paham Waris</i> karya Abu Kautsar. Setiap hasil diberi rujukan bab, jadi kamu bisa mencocokkannya dengan buku.</p>
      <h4>Yang bisa dilakukan</h4>
      <ul>
        <li>Menghitung bagian tiap ahli waris dalam <b>pecahan</b> dan <b>rupiah</b>, sekaligus siapa yang <b>terhalang</b> dan kenapa.</li>
        <li>Membersihkan harta dulu: harta bersama (gono-gini), biaya jenazah, utang, dan wasiat.</li>
        <li>Kasus khusus: <i>ʿaul</i>, <i>radd</i>, <i>taṣḥīḥ</i>, <i>al-Gharrāwain</i>, <i>al-Musyarrakah</i>, kakek bersama saudara, <i>al-Akdariyyah</i>, dan <i>munāsakhah</i> (ahli waris wafat sebelum harta dibagi).</li>
        <li>Membagi harta <b>berupa barang</b> (rumah, tanah, mobil, emas) dan menunjukkan siapa yang <b>kurang</b> dan siapa yang <b>lebih</b>, beserta uang penggantinya.</li>
        <li>Membuat <b>Berita Acara Pembagian Harta Warisan</b>, lengkap dengan tanda tangan di layar.</li>
        <li>Menyimpan kasus, membagikan lewat WhatsApp atau link, dan mencetak ke PDF.</li>
      </ul>
      <h4>Cara membuka</h4>
      <ol>
        <li>Buka <b>${URL_APP}</b> di browser HP atau laptop.</li>
        <li>Supaya bisa dibuka seperti aplikasi: di Chrome Android pilih menu <b>⋮ → Tambahkan ke layar utama</b>. Di iPhone (Safari) pilih <b>Bagikan → Tambah ke Layar Utama</b>.</li>
        <li>Setelah dibuka sekali, kalkulator <b>tetap bisa dipakai tanpa internet</b>.</li>
      </ol>
      ${tip('Data kamu tetap di perangkatmu.', 'Semua isian, riwayat, dan tanda tangan disimpan di browser perangkat ini saja, tidak dikirim ke server mana pun.')}
    `,
  },
  {
    id: 'cepat', judul: 'Mulai cepat: coba contoh kasus',
    isi: `
      <p>Cara paling mudah untuk mengenal kalkulator adalah membuka contoh dari ebook. Di bagian atas layar, pilih kotak <b>Muat contoh kasus…</b>, lalu pilih misalnya <b>Kasus Pak Umar (Bab 10.5)</b>. Kalkulator langsung menampilkan hasilnya.</p>
      <p>Ada 17 contoh: kasus-kasus Bab 14, <i>ʿaul</i>, <i>radd</i>, <i>al-Gharrāwain</i>, <i>al-Musyarrakah</i>, <i>al-Akdariyyah</i>, harta berupa barang, anak yang berbeda agama, dan <i>munāsakhah</i>. Semua angkanya sama dengan tabel di ebook, jadi cocok untuk latihan.</p>
      ${tip('Mau mulai dari awal?', 'Pilih <b>Kosongkan formulir</b> di daftar contoh kasus.')}
    `,
  },
  {
    id: 'langkah1', judul: 'Langkah 1: Data pewaris',
    isi: `
      <p>Kalkulator punya 4 langkah yang terlihat di bagian atas: <b>Pewaris → Harta → Ahli waris → Hasil</b>. Kamu bisa pindah langkah kapan saja dengan menekan angkanya, atau memakai tombol <b>Lanjut →</b> dan <b>← Kembali</b> di bawah.</p>
      ${g('01-pewaris', 'Langkah 1 data pewaris', 'Langkah 1: isi nama kasus (boleh dikosongkan) dan pilih jenis kelamin pewaris.')}
      <ul>
        <li><b>Nama atau keterangan kasus</b>: opsional. Dipakai sebagai judul di riwayat, cetakan, dan berita acara.</li>
        <li><b>Jenis kelamin pewaris</b>: menentukan pasangan yang ditinggalkan. Pewaris laki-laki meninggalkan <b>istri</b> (boleh lebih dari satu), pewaris perempuan meninggalkan <b>suami</b>.</li>
      </ul>
    `,
  },
  {
    id: 'langkah2', judul: 'Langkah 2: Harta dan kewajiban',
    isi: `
      <p>Isi nilai dalam rupiah, cukup angkanya saja (titik ribuan muncul sendiri). Kolom yang tidak ada boleh dikosongkan. Kalau hanya ingin melihat pecahan bagian, semua kolom harta boleh kosong.</p>
      ${g('02-harta', 'Langkah 2 harta', 'Langkah 2: di bawah isian muncul perhitungan harta bersih, urut seperti Bab 3.')}
      <ul>
        <li><b>Harta bersama (gono-gini)</b>: harta yang diperoleh selama menikah. Separuhnya otomatis dipisahkan untuk pasangan yang masih hidup (KHI Pasal 96).</li>
        <li><b>Harta pribadi pewaris</b>: harta bawaan, hibah, atau warisan yang ia terima.</li>
        <li><b>Biaya jenazah</b> dan <b>utang</b> dibayar lebih dulu.</li>
        <li><b>Wasiat</b>: dibatasi otomatis paling banyak 1/3 dari sisa setelah utang. Kalau melebihi, muncul peringatan.</li>
      </ul>
      <p>Hasil akhirnya adalah <b>Harta bersih yang dibagi</b>. Angka inilah yang dibagikan kepada ahli waris.</p>
      <h4>Harta berupa barang</h4>
      <p>Buka <b>Harta berupa barang</b>, tekan <b>+ Tambah barang</b>, lalu isi nama dan taksiran nilainya. Kalau semua harta berupa barang, tekan <b>Pakai total barang sebagai harta pribadi</b> supaya jumlahnya langsung dipakai. Siapa yang mengambil barang dipilih nanti di langkah 4.</p>
      ${g('07-barang-input', 'Daftar barang', 'Daftar barang beserta taksirannya.')}
    `,
  },
  {
    id: 'langkah3', judul: 'Langkah 3: Ahli waris',
    isi: `
      <p>Isi <b>jumlah</b> kerabat yang <b>masih hidup saat pewaris wafat</b> dengan tombol <b>−</b> dan <b>+</b>. Isi semua kerabat yang ada, termasuk yang mungkin terhalang (misalnya saudara padahal ada anak laki-laki). Kalkulator akan mencoret sendiri mana yang terhalang dan menjelaskan alasannya.</p>
      ${g('03-ahli-waris', 'Langkah 3 ahli waris', 'Langkah 3: baris yang sudah diisi tampil tebal berwarna hijau.')}
      <ul>
        <li><b>Kerabat lain</b> (keponakan, paman, sepupu) ada di bagian yang bisa dibuka di bawah daftar.</li>
        <li><b>Kerabat yang membunuh pewaris atau berbeda agama</b> <u>jangan</u> dimasukkan ke daftar utama. Catat di bagian <b>Ada kerabat yang membunuh pewaris atau berbeda agama?</b> Mereka tidak mewarisi dan tidak menghalangi siapa pun (Bab 2.5).</li>
        <li><b>Keadaan khusus</b> (anak dalam kandungan, orang hilang, <i>khuntsā</i>) belum dihitung otomatis. Centang jika ada, supaya hasilnya diberi peringatan.</li>
      </ul>
      ${tip('Gunakan pohon keluarga.', 'Salah memasukkan satu ahli waris, hasilnya pasti salah. Gambar dulu pohon keluarga seperti di Bab 2 sebelum mengisi.')}
    `,
  },
  {
    id: 'langkah4', judul: 'Langkah 4: Membaca hasil',
    isi: `
      ${g('04-hasil', 'Hasil pembagian', 'Hasil pembagian kasus Pak Umar.')}
      <ul>
        <li><b>Kotak ringkasan</b> di atas: <i>Asal masalah</i>, lalu <i>ʿAul</i>, <i>Radd</i>, atau <i>Taṣḥīḥ</i> bila terjadi, dan <i>Harta bersih</i>.</li>
        <li><b>Kartu tiap ahli waris</b>: pecahan besar (bagian <b>per orang</b>), rupiah per orang, alasan bagiannya, dan rujukan bab. Batang di bawahnya menunjukkan besar bagian kelompok itu dari seluruh harta.</li>
        <li><b>Jumlah dibagikan</b> dan <b>selisih pembulatan</b>: rupiah dibulatkan ke bawah per orang. Kalau ada selisih beberapa rupiah, angkanya ditampilkan supaya bisa dibagi sesuai kesepakatan keluarga (Bab 10.4).</li>
      </ul>
      ${g('05-terhalang-catatan', 'Terhalang dan catatan', 'Siapa yang tidak mendapat bagian dan oleh siapa ia terhalang, lalu catatan dan catatan KHI sebagai pembanding.')}
      <h4>Langkah perhitungan</h4>
      <p>Buka <b>Langkah perhitungan (cocokkan dengan Bab 10)</b> untuk melihat tujuh langkah hitung seperti di buku: membersihkan harta, mencoret yang terhalang, menentukan bagian, asal masalah dan saham, <i>taṣḥīḥ</i>, sampai rupiah. Pakai bagian ini untuk menjelaskan hasilnya kepada keluarga.</p>
      ${g('06-langkah', 'Langkah perhitungan', 'Tujuh langkah hitung, lengkap dengan tabel saham.')}
    `,
  },
  {
    id: 'barang', judul: 'Harta berupa barang: siapa kurang, siapa lebih',
    isi: `
      <p>Kalau harta dicatat sebagai barang (langkah 2), di halaman hasil muncul bagian <b>Pembagian barang dan kompensasi</b>. Pilih siapa yang mengambil tiap barang di kolom <b>Diambil oleh</b>. Kalkulator langsung membandingkan <b>hak</b> tiap orang dengan <b>nilai barang</b> yang ia ambil.</p>
      ${g('08-kurang-lebih', 'Kurang dan lebih', 'Contoh Bab 14 Kasus 7: Fajar dan Gita LEBIH, Hana KURANG, lalu siapa membayar ke siapa.')}
      <table class="pd-t"><thead><tr><th>Tanda</th><th>Artinya</th><th>Yang dilakukan</th></tr></thead><tbody>
        <tr><td><span class="kl-badge kurang">KURANG Rp …</span></td><td>Nilai barang yang diambil <b>di bawah</b> haknya.</td><td>Ia <b>menerima</b> uang pengganti sebesar angka itu.</td></tr>
        <tr><td><span class="kl-badge lebih">LEBIH Rp …</span></td><td>Nilai barang yang diambil <b>di atas</b> haknya.</td><td>Ia <b>membayar</b> uang pengganti sebesar angka itu.</td></tr>
        <tr><td><span class="kl-badge pas">PAS</span></td><td>Nilai barang sama dengan haknya.</td><td>Tidak ada pembayaran.</td></tr>
      </tbody></table>
      <ul>
        <li>Dua kotak di atas daftar menunjukkan <b>berapa orang</b> yang kurang dan lebih beserta <b>jumlah totalnya</b>.</li>
        <li>Batang tiap orang: warna penuh = barang yang diambil dibanding haknya. Bagian <b>bergaris</b> = kelebihannya.</li>
        <li><b>Siapa membayar ke siapa</b> menyusun pembayaran dengan jumlah transfer sesedikit mungkin. Kalau sebagian harta berupa uang tunai yang tidak dicatat sebagai barang, kekurangan diambil dari <b>sisa harta</b>.</li>
        <li>Kalau nama ahli waris sudah diisi di berita acara, nama itu ikut tampil di sini.</li>
      </ul>
      ${tip('Emas harus tunai.', 'Jika emas ditukar dengan uang dalam kompensasi, pembayarannya harus tunai saat itu juga (HR. Muslim no. 1587, Bab 10.6).')}
    `,
  },
  {
    id: 'munasakhah', judul: 'Ahli waris wafat sebelum harta dibagi (munāsakhah)',
    isi: `
      <p>Contoh: Pak Rahmat wafat, hartanya belum dibagi, lalu anaknya Ali ikut wafat. Hitungannya harus berlapis sesuai urutan wafat (Bab 13).</p>
      <ol>
        <li>Di langkah 3, isi ahli waris seperti keadaan <b>saat pewaris pertama wafat</b>. Ali tetap dihitung sebagai anak.</li>
        <li>Buka <b>Ada ahli waris yang wafat sebelum harta dibagi?</b> lalu tekan <b>+ Tambah ahli waris yang wafat</b>.</li>
        <li>Pilih siapa yang wafat (misalnya <b>Anak laki-laki 1</b>), lalu isi ahli waris orang itu <b>saat ia wafat</b>.</li>
        <li>Periksa bagian <b>Orang yang sama?</b> Ibu Ali adalah istri Pak Rahmat, jadi bagiannya dari dua lapis harus dijumlahkan. Kalkulator mengisi tautan ini otomatis untuk kasus umum. Ubah bila keluargamu berbeda, misalnya ibunya bukan istri yang sama.</li>
        <li>Kalau ada yang wafat lagi, tambahkan lapis berikutnya.</li>
      </ol>
      ${g('09-munasakhah-lapis', 'Lapis munāsakhah', 'Memilih yang wafat dan mengisi ahli warisnya.')}
      ${g('09b-tautan', 'Tautan orang yang sama', 'Menautkan orang yang sama di dua lapis.')}
      ${g('10-munasakhah-hasil', 'Hasil munāsakhah', 'Hasil akhir: al-jāmiʿah 480, sama dengan tabel Bab 13.3.')}
      <p>Rincian tiap lapis (S, A, FPB, pengali) bisa dibuka di bawah hasil akhir, untuk dicocokkan dengan cara di Bab 13.2.</p>
    `,
  },
  {
    id: 'simpan', judul: 'Menyimpan, membagikan, dan mencetak',
    isi: `
      ${g('12-tombol-hasil', 'Tombol di halaman hasil', 'Tombol di halaman hasil.')}
      <table class="pd-t"><thead><tr><th>Tombol</th><th>Fungsi</th></tr></thead><tbody>
        <tr><td><b>Simpan</b></td><td>Menyimpan kasus ke <b>Riwayat</b> di perangkat ini. Buka lagi lewat ikon jam di bagian atas.</td></tr>
        <tr><td><b>Bagikan</b></td><td>Mengirim ringkasan hasil (termasuk kurang/lebih barang) beserta link ke WhatsApp atau aplikasi lain.</td></tr>
        <tr><td><b>Salin link</b></td><td>Menyalin link berisi seluruh data kasus. Siapa pun yang membukanya melihat perhitungan yang sama. Nama dan tanda tangan di berita acara <b>tidak</b> ikut dibagikan.</td></tr>
        <tr><td><b>Cetak / PDF</b></td><td>Mencetak hasil beserta langkah perhitungan. Pilih <b>Simpan sebagai PDF</b> di jendela cetak untuk membuat file PDF.</td></tr>
        <tr><td><b>Berita acara</b></td><td>Membuka formulir berita acara (bab berikutnya).</td></tr>
      </tbody></table>
      ${tip('Draf tersimpan otomatis.', 'Isian yang sedang dikerjakan tersimpan sendiri. Kalau browser tertutup, buka lagi kalkulatornya dan isianmu masih ada.')}
    `,
  },
  {
    id: 'berita-acara', judul: 'Berita acara pembagian harta warisan',
    isi: `
      <p>Tombol <b>Berita acara</b> membuka formulir sesuai Lampiran E ebook. Isinya sudah terisi otomatis dari hasil hitung: daftar harta, kewajiban, ahli waris dan bagiannya, serta barang dan uang penggantinya.</p>
      ${g('11-berita-acara', 'Berita acara', 'Formulir berita acara yang sudah terisi (tampilan di laptop/tablet).', true)}
      <ol>
        <li>Lengkapi isian bergaris putus-putus: hari, tanggal, tempat, data pewaris, <b>nama lengkap tiap ahli waris</b>, bukti harta, dan cara pembayaran kompensasi.</li>
        <li>Tulis <b>kesepakatan lain</b> bila ada, misalnya ahli waris yang merelakan sebagian haknya.</li>
        <li>Tanda tangan: tekan <b>Tanda tangan di layar</b>, goreskan jari di kotak putih, lalu <b>Simpan</b>. Bisa juga dibiarkan kosong lalu ditandatangani di atas kertas setelah dicetak.</li>
        <li>Tekan <b>Cetak / PDF</b>.</li>
      </ol>
      ${tip('Musyawarah dulu.', 'Hitung dulu, baru bermusyawarah. Berita acara dibuat setelah setiap ahli waris mengetahui bagiannya (Bab 14.4).')}
    `,
  },
  {
    id: 'tanya', judul: 'Tanya jawab',
    isi: `
      <dl class="pd-qa">
        <dt>Kenapa jumlah rupiahnya kurang beberapa rupiah dari harta bersih?</dt>
        <dd>Rupiah tiap orang dibulatkan ke bawah supaya tidak ada yang menerima melebihi haknya. Selisihnya ditampilkan sebagai <b>selisih pembulatan</b> dan dibagi sesuai kesepakatan keluarga.</dd>
        <dt>Kenapa saudara tidak mendapat bagian?</dt>
        <dd>Karena terhalang (<i>maḥjūb</i>) oleh kerabat yang lebih dekat, misalnya anak laki-laki atau ayah. Siapa penghalangnya selalu ditulis di bagian <b>Tidak mendapat bagian</b> (Bab 9).</dd>
        <dt>Hasilnya berbeda dengan putusan Pengadilan Agama?</dt>
        <dd>Kalkulator mengikuti fiqih Syafiʿi. Pengadilan Agama memakai KHI, yang di beberapa hal berbeda, misalnya ahli waris pengganti (KHI Pasal 185). Perbedaan itu ditampilkan sebagai <b>Catatan KHI</b>.</dd>
        <dt>Kasus apa yang belum bisa dihitung otomatis?</dt>
        <dd>Anak dalam kandungan, orang hilang (<i>mafqūd</i>), <i>khuntsā</i>, <i>dzawil arḥām</i>, dan <i>muʿāddah</i> (kakek bersama saudara kandung dan seayah sekaligus, yang baru disederhanakan). Untuk kasus-kasus ini kalkulator memberi peringatan. Konsultasikan dengan ahli faraid.</dd>
        <dt>Apakah data saya dikirim ke internet?</dt>
        <dd>Tidak. Semua tersimpan di browser perangkatmu. Link bagikan menyimpan data di bagian <b>#</b> alamat, dan bagian itu tidak pernah dikirim ke server.</dd>
        <dt>Bagaimana mengganti tampilan terang/gelap?</dt>
        <dd>Tekan ikon bulan di pojok kanan atas.</dd>
      </dl>
    `,
  },
  {
    id: 'batasan', judul: 'Batasan penggunaan',
    isi: `
      <p>Hasil kalkulator untuk <b>edukasi</b> dan membantu musyawarah keluarga. Kalkulator hanya sebaik data yang dimasukkan. Periksa lagi data ahli waris dan harta, dan cocokkan hasilnya dengan cara manual di Bab 10 setidaknya sekali.</p>
      <p>Untuk kasus rumit, pembagian resmi, atau sengketa, konsultasikan dengan ustadz yang menguasai faraid atau dengan <b>Pengadilan Agama</b> (Bab 14.5).</p>
    `,
  },
];

export function renderPanduan() {
  return `<article class="pd-doc" id="pd-doc">
    <header class="pd-sampul">
      <p class="pd-kicker">Pendamping ebook <i>Dari Bingung Jadi Paham Waris</i></p>
      <h2 id="pd-judul">Buku Panduan<br><span>Kalkulator FAROID</span></h2>
      <p class="pd-sub">Cara menghitung pembagian waris sampai rupiah, membagi barang, dan membuat berita acara</p>
      <p class="pd-meta">Versi panduan ${VERSI_PANDUAN} · ${URL_APP}</p>
    </header>
    <nav class="pd-toc" aria-label="Daftar isi"><h3>Daftar isi</h3><ol>${BAB.map(b => `<li><a href="#pd-${b.id}" data-pd="${b.id}">${b.judul}</a></li>`).join('')}</ol></nav>
    ${BAB.map((b, i) => `<section class="pd-bab" id="pd-${b.id}"><h3><span>${i + 1}</span>${b.judul}</h3>${b.isi}</section>`).join('')}
  </article>`;
}
