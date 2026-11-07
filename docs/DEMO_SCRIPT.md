# Naskah Panduan Demonstrasi Stakeholder (Demo Script)
## Presentasi Prototipe BEESHA — Sistem Informasi Operasional PT Putra Hatim Mandiri (PHM Group)
### Khusus untuk Sesi Tinjauan Manajemen Bersama Pak Yusuf

- **Durasi Sesi:** 15 – 20 Menit
- **Tujuan Demonstrasi:** Membuktikan kemudahan operasional alur manufaktur (*Pemesanan → Produksi → Pengiriman → Dashboard*), membuktikan kenyamanan antarmuka bagi pengguna Generasi X, dan menegaskan kepatuhan terhadap batasan keamanan data perusahaan.
- **Presenter:** Tim Pengembang Mahasiswa / Lead Software Engineer
- **Audiens Utama:** Pak Yusuf & Tim Manajemen PHM Group

---

## 1. Persiapan Sebelum Demonstrasi (Checklist)

1. Pastikan aplikasi berjalan di peramban (Chrome / Edge / Firefox) pada alamat:
   - **Lokal:** `http://localhost:3000/#/`
   - **Deployment Online:** `https://phmprototype.vercel.app/#/`
2. Atur resolusi layar proyektor/monitor pada 1080p (skala 100%).
3. Bersihkan data pengujian lama dengan mengklik menu **"Lainnya" → "Kembalikan Data Contoh"** agar data awal berada dalam kondisi bersih dan konsisten.
4. Buka tab baru di samping untuk memperlihatkan respon reaktif dasbor secara bersamaan.

---

## 2. Naskah Demonstrasi Langkah demi Langkah (9 Tahap)

---

### Tahap 1: Pembukaan & Penegasan Ruang Lingkup Proyek (Menit 00:00 – 02:00)
- **Aksi Presenter:** Buka halaman Beranda (`#/`). Arahkan kursor ke header dan banner atas.
- **Poin Ucapan:**
  > *"Selamat pagi/siang Pak Yusuf dan Bapak/Ibu Manajemen PHM Group. Terima kasih atas kesempatan yang diberikan kepada kami.*
  >
  > *Menindaklanjuti arahan strategis dari Pak Yusuf pada sesi sebelumnya, fokus utama kami pada iterasi ini adalah **penyempurnaan antarmuka dan pengalaman pengguna (UI/UX) yang ramah bagi pengguna Generasi X**, menyederhanakan alur kerja operasional manufaktur, dan menyediakan prototipe interaktif yang dapat dicoba langsung sebelum melangkah ke integrasi data teknis yang lebih dalam.*
  >
  > *Kami juga menegaskan bahwa sesuai batasan keamanan yang disepakati, prototipe ini berjalan mandiri di peramban web tanpa mengakses, mengubah, ataupun menyentuh database rahasia sistem ERP INDIGO perusahaan. Seluruh data yang kita lihat adalah data simulasi operasional yang aman."*

---

### Tahap 2: Tinjauan Dasbor Operasional Baru (Menit 02:00 – 04:00)
- **Aksi Presenter:** Scroll perlahan di Beranda. Tunjukkan Header sticky, pemilih petugas "Joko Sutopo", 3 Kartu Aksi Utama berwarna biru penuh, 4 Kartu KPI Mandiri, dan Kartu Pengingat Supervisor.
- **Poin Ucapan:**
  > *"Mari kita lihat beranda baru BEESHA. Pada versi sebelumnya, tampilan didominasi oleh teks kecil berukuran 10–12 pixel dan kartu bergaris tipis yang sulit dibaca oleh rekan-rekan di lantai produksi.*
  >
  > *Kini, kami merancang antarmuka dengan standar ergonomis tinggi: teks bodi besar 16–17 pixel, kontras warna tinggi 12.6 banding 1, serta **3 Kartu Aksi Utama berwarna biru solid**: Catat Pesanan, Catat Produksi, dan Catat Pengiriman. Pekerja lapangan tidak perlu lagi bingung mencari menu; cukup klik kartu besar ini.*
  >
  > *Di bawah kartu aksi, kami sediakan 4 indikator kinerja utama (KPI): Pesanan Aktif, Produksi Selesai, Total Terkirim, dan item yang Perlu Perhatian, lengkap dengan pengingat dokumen yang menunggu pemeriksaan supervisor."*

---

### Tahap 3: Alur 1 — Pencatatan Pesanan Mitra Baru (Menit 04:00 – 07:00)
- **Aksi Presenter:** Klik kartu **"Catat Pesanan"** (atau navigasi `#/pesanan`).
- **Poin Ucapan:**
  > *"Sekarang kita masuk ke alur pertama: **Pencatatan Pesanan Mitra**.*
  >
  > *Formulir kami rancang terbagi dalam 3 kartu bertahap agar tidak membebani operator:*
  > 1. *Kartu 'Dari Siapa': Begitu kita memilih mitra, misalnya **PT Astra Honda Motor**, nama PIC dan kontak telepon otomatis terisi tanpa perlu mengetik ulang.*
  > 2. *Nomor PO kita isi, misalnya **PO-AHM-2026-X99**. Sistem kami memiliki proteksi pintar: jika kita mencoba memasukkan nomor PO yang sudah pernah terdaftar pada mitra ini, sistem akan menolak duplikasi secara langsung.*
  > 3. *Kartu 'Apa yang Dipesan': Kita pilih komponen, misalnya **Bracket Engine Mounting**, sebanyak **200 pcs**.*
  > 4. *Kartu 'Keterangan': Kita bisa mengklik tombol cepat **'Pakai tanggal sesuai waktu produksi standar'**, sehingga sistem langsung menghitung estimasi tanggal kirim realistis.*
  >
  > *Saat menekan tombol Simpan, sistem menampilkan ringkasan verifikasi. Setelah disimpan, muncul **Nomor Bukti Simpan** yang jelas, memberi kepastian visual bagi operator bahwa data telah tersimpan aman."*

---

### Tahap 4: Pemeriksaan Detail Pesanan Terpadu (Menit 07:00 – 09:00)
- **Aksi Presenter:** Buka detail pesanan yang baru dibuat (atau klik salah satu pesanan aktif di beranda, misal `DEMO-ORD-001`).
- **Poin Ucapan:**
  > *"Inilah halaman **Detail Pesanan Terpadu**. Di sini kita melihat perbandingan **Rencana vs Realisasi** yang sangat jelas:*
  > - *Berapa target yang dipesan (Rencana)*
  > - *Berapa unit yang sudah selesai diproduksi (dengan pembagian porsi yang sudah diverifikasi vs menunggu pemeriksaan)*
  > - *Berapa unit yang sudah berhasil dikirim ke mitra pemesan.*
  >
  > *Di bagian bawah, tercatat linimasa lengkap: siapa yang mencatat, jam berapa dimasukkan, dan riwayat dokumen surat jalannya. Semua transparan dan terlacak."*

---

### Tahap 5: Alur 2 — Pencatatan Hasil Produksi (Menit 09:00 – 11:30)
- **Aksi Presenter:** Klik kartu aksi **"Catat Produksi"** (atau `#/produksi`).
- **Poin Ucapan:**
  > *"Kita melangkah ke alur kedua: **Pencatatan Hasil Produksi di Lantai Pabrik**.*
  >
  > *Perhatikan cara operator memilih pesanan: tidak lagi menggunakan dropdown teks kecil yang rumit, melainkan **Kartu Visual Berukuran Besar**. Operator dapat melihat langsung gambar part, nama mitra, dan sisa unit yang belum selesai diproduksi.*
  >
  > *Mari kita catat hasil produksi hari ini: **100 pcs barang baik** dan **2 pcs barang reject/cacat**.*
  >
  > *Apabila operator tidak sengaja mengetik kuantitas melebihi target pesanan, sistem secara cerdas menampilkan **Peringatan Toleransi Manufaktur Berwarna Kuning**. Sistem tidak memblokir secara buta, melainkan meminta konfirmasi apakah ini kelebihan produksi toleransi mesin, dan secara otomatis menandai catatan ini agar diperiksa oleh supervisor."*

---

### Tahap 6: Alur 3 — Pencatatan Pengiriman & Surat Jalan (Menit 11:30 – 14:00)
- **Aksi Presenter:** Klik kartu aksi **"Catat Pengiriman"** (atau `#/pengiriman`).
- **Poin Ucapan:**
  > *"Alur ketiga adalah **Pengiriman Logistik**.*
  >
  > *Alamat tujuan otomatis terambil dari data mitra pemesan. Sistem menghitung secara otomatis berapa stok barang jadi yang siap dikirim di gudang.*
  >
  > *Di sini terdapat tombol bantuan cepat: **'Kirim semua barang siap'** yang akan mengisi kuantitas otomatis dengan satu klik.*
  >
  > *Terkait **Nomor Surat Jalan**: pada versi lama nomor dibuat acak oleh komputer. Kini, kami mewajibkan nomor surat jalan diketik manual dari lembar fisik resmi yang dibawa pengemudi (misal **SJ-PHM-2026-8801**). Sistem juga menerapkan aturan ketat: **pengiriman tidak boleh melebihi sisa pesanan**, sehingga mencegah kesalahan penagihan invoice di bagian akuntansi."*

---

### Tahap 7: Kontrol Mutu — Verifikasi Supervisor & Koreksi Data (Menit 14:00 – 16:30)
- **Aksi Presenter:** Ubah petugas di header menjadi **"Hartono (Supervisor)"**, lalu buka menu **"Pemeriksaan Data"** (`#/pemeriksaan`).
- **Poin Ucapan:**
  > *"Salah satu nilai tambah terpenting yang kami bangun adalah **Modul Pemeriksaan Data Supervisor**.*
  >
  > *Ketika Pak Hartono selaku supervisor membuka layar ini, beliau melihat seluruh catatan produksi dan pengiriman yang berstatus 'Menunggu Pemeriksaan'.*
  >
  > *Supervisor dapat meninjau kuantitas barang baik dan reject. Jika data sudah benar, cukup klik **'Tandai Terverifikasi'**.*
  >
  > *Namun, jika operator salah mencatat (misalnya salah ketik kuantitas), supervisor dapat memilih **'Minta Perbaikan'** dengan kewajiban menuliskan alasannya. Operator kemudian dapat membuka dialog koreksi untuk memperbarui data, dan sistem secara otomatis menyimpan nilai lama dalam **Riwayat Revisi (Audit Trail)**, sehingga tidak ada data yang dimanipulasi tanpa jejak."*

---

### Tahap 8: Transparansi Panel Asisten AI Beesha (Menit 16:30 – 18:30)
- **Aksi Presenter:** Klik tombol **"Tanya Beesha"** di kanan atas header. Klik salah satu tombol pertanyaan cepat: *"Berapa pesanan yang jatuh tempo minggu ini?"*.
- **Poin Ucapan:**
  > *"Kami juga menyempurnakan fitur asisten interaktif **Tanya Beesha**.*
  >
  > *Sesuai prinsip transparansi, panel ini secara jujur memberi tahu pengguna bahwa data diolah dari data aplikasi saat ini dan **belum terhubung langsung ke sistem server pusat BHEESA**. Apabila kunci AI belum terpasang, asisten menggunakan kalkulasi analitik lokal yang cepat, akurat, dan dapat diandalkan tanpa risiko berhalusinasi.*
  >
  > *Pimpinan dapat menanyakan ringkasan pesanan berjalan, status pengiriman, atau peringatan tenggat kapan saja secara instan."*

---

### Tahap 9: Penutup & Rekomendasi Tahap Lanjutan (Menit 18:30 – 20:00)
- **Aksi Presenter:** Kembali ke Beranda (`#/`). Tampilkan angka metrik dasbor yang telah terbarui secara dinamis.
- **Poin Ucapan:**
  > *"Sebagai penutup, seluruh data yang kita masukkan tadi—dari pesanan, produksi, pengiriman, hingga verifikasi supervisor—langsung terakumulasi secara waktu nyata pada Dasbor Utama ini, dan data tetap aman tidak hilang meskipun peramban di-refresh.*
  >
  > *Kami siap mendiskusikan lebih lanjut tanggapan Pak Yusuf dan tim mengenai kenyamanan antarmuka ini. Setelah arah desain dan alur kerja ini disepakati, kita dapat melangkah bersama ke tahap standarisasi data dan perencanaan integrasi backend resmi.*
  >
  > *Waktu dan tempat kami kembalikan kepada Pak Yusuf untuk sesi diskusi dan tanya jawab. Terima kasih."*

