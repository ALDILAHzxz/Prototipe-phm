# PERBANDINGAN SEBELUM DAN SESUDAH (BEFORE & AFTER V3.0)
## BEESHA PHM Group — UI/UX Refinement Revision

Dokumen ini memetakan perubahan konkret antarmuka berdasarkan 4 tangkapan layar permasalahan yang diberikan oleh stakeholder.

---

## 1. Tangkapan Layar 1 — Dashboard & Footer Dark Mode

### Kondisi Sebelumnya (Before)
- Teks brand `<strong className="text-navy">BEESHA</strong>` di Footer berwarna `#0F172A` (hitam pekat) di atas kartu footer gelap `#141C2C`, sehingga teks nyaris tidak terlihat.
- Tombol aksi di Footer (*Viewer 3D Part* dan *Buku Panduan & Tur Sistem*) memiliki teks redup dan ikon yang sulit dibedakan.
- Batas kartu pada Dashboard dan Footer menyatu dengan warna latar canvas, sehingga kartu kehilangan definisi batas visualnya.

### Kondisi Sesudah (After V3.0)
- Teks brand `BEESHA` di Footer menggunakan warna aksen biru bercahaya `#8CCBFF` dengan kontras 10.4:1 yang sangat tajam dan terbaca jelas.
- Tombol sekunder Footer menggunakan teks `#F2F7FF` dengan border tegas `#4A719A`, ikon terang `#8CCBFF`, dan efek interaktif hover yang jelas.
- Seluruh kartu di Dashboard memiliki garis batas tegas `#4A719A` yang membedakan kartu dari background halaman secara konsisten.

---

## 2. Tangkapan Layar 2 — Navigation Drawer Dark Mode

### Kondisi Sebelumnya (Before)
- Container ikon menu menggunakan kelas `bg-canvas text-navy`. Dalam mode gelap, ini menghasilkan kontainer hitam pekat dengan ikon hitam di dalamnya (ikon nyaris tidak tampak).
- Ikon fungsional di bagian bawah (*Tanya Beesha, Inspeksi 3D, Buku Panduan, Kembalikan Data, dan HardDrive*) menggunakan `text-navy` yang gelap gulita.
- Teks nama petugas dan label menu aktif tidak memiliki pendaran kontras yang cukup.

### Kondisi Sesudah (After V3.0)
- Container ikon menu menggunakan kontainer beraksen navy lembut `#263D5A` dengan border pembatas 1px dan ikon berwarna cerah `#8CCBFF`.
- Seluruh ikon fungsional dan ikon status menggunakan warna aksen `#8CCBFF`.
- Menu navigasi yang sedang aktif ditandai dengan latar belakang Bright Blue `#0077C8`, teks putih tegas, dan indikator yang jelas.

---

## 3. Tangkapan Layar 3 — Filter Pemeriksaan Data (Desktop)

### Kondisi Sebelumnya (Before)
- 4 tombol status pemeriksaan (*Menunggu pemeriksaan, Perlu diperbaiki, Terverifikasi, Semua*) hanya tersusun menggunakan `flex flex-wrap gap-2` di sebelah kiri kartu, meninggalkan lebih dari 60% lebar kartu kosong tidak terpakai.
- 3 tombol jenis catatan di baris kedua juga berada di sebelah kiri tanpa simetri atau perataan tengah, membuat tata letak filter tampak tidak rapi dan tidak seimbang.

### Kondisi Sesudah (After V3.0)
- **Baris Pertama:** Menggunakan grid 4-kolom penuh (`grid grid-cols-4 gap-3 w-full`). Keempat tombol status memiliki lebar yang sama persis (*equal-width*), tinggi tombol nyaman 52px, dan angka hitungan (*badge count*) yang rapi di sisi kanan tombol.
- **Baris Kedua:** Menggunakan grid 3-kolom terpusat di tengah (`grid grid-cols-3 max-w-2xl mx-auto gap-3 w-full mt-4`), menciptakan hierarki visual yang simetris, teratur, dan profesional.
- Jarak vertikal teratur 16–20px memisahkan kedua kategori filter dengan garis pemisah tipis yang rapi.

---

## 4. Tangkapan Layar 4 — Filter Pemeriksaan Data (Mobile)

### Kondisi Sebelumnya (Before)
- Tujuh (7) tombol filter tergelar sekaligus di layar smartphone kecil, menyebabkan tombol membungkus (*wrap*) menjadi 4 sampai 5 baris yang berjejal.
- Antarmuka menjadi sangat padat, memakan separuh tinggi layar ponsel sebelum pengguna dapat melihat catatan fisik yang perlu diperiksa.
- Pengguna lanjut usia (Gen-X) kesulitan membedakan mana filter status dan mana filter jenis catatan karena semua tombol tampak serupa.

### Kondisi Sesudah (After V3.0)
- **Dua Selektor Primer Berdampingan:** Pada layar ponsel (`< 768px`), 7 tombol yang ramai diringkas menjadi dua tombol selektor yang elegan:
  1. `[ Status: Menunggu (3) ▾ ]`
  2. `[ Jenis: Semua Jenis ▾ ]`
- **Bottom-Sheet Modal:** Mengetuk salah satu selektor akan membuka jendela bawah (*bottom-sheet*) yang nyaman dioperasikan satu tangan, menampilkan pilihan lengkap beserta tombol centang dan angka hitungannya.
- **Ringkasan Bersih:** Di bawah kedua selektor, terdapat teks ringkasan *"Menampilkan X catatan"* dan tautan cepat *"Reset Filter"* jika pengguna ingin kembali ke tampilan semua data.
- **Tidak Ada Kehilangan Fitur:** Seluruh kombinasi penyaringan data (misalnya: *Status = Menunggu* dan *Jenis = Pengiriman*) tetap bekerja 100% akurat.

