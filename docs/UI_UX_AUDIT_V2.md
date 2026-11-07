# Laporan Audit UI/UX v2.0 (UI/UX Audit v2.0)
## Proyek: BEESHA — Sistem Informasi Operasional PT Putra Hatim Mandiri (PHM Group)

- **Tanggal Audit:** 8 November 2026
- **Tim Auditor:** Principal Frontend Engineer, Senior UI/UX Product Designer, HCI Expert, Accessibility Lead
- **Lingkup Audit:** Evaluasi visual mendalam dan interaksi antarmuka berbasis 13 tangkapan layar (screenshots) dan referensi fitur Inspeksi 3D Part.

---

## 1. Ringkasan Eksekutif Hasil Audit v2.0

Audit visual dan interaksi tahap kedua dilakukan untuk mengidentifikasi area antarmuka yang masih tampak terlalu datar (*plain*), target interaksi kecil yang masih berbentuk tautan teks (*bare text links*), ketidakseimbangan tata letak (*layout imbalance* dan ruang kosong berlebih di dasbor), serta pengalaman seluler yang perlu disusun secara proporsional.

Secara fungsional, aplikasi BEESHA telah memiliki alur operasional 4 pilar yang andal (*Pemesanan Mitra → Hasil Produksi → Pengiriman → Dasbor Beesha*). Namun, penyempurnaan pada level detail desain, mikro-animasi, keterbacaan tipografi, dan fleksibilitas drawer asisten AI diperlukan agar antarmuka mencapai standar perangkat lunak enterprise kelas industri.

---

## 2. Matriks Temuan Audit Berdasarkan 13 Tangkapan Layar

| No. Layar / Screenshot | Komponen / Area Terkait | Masalah Visual & Interaksi yang Ditemukan | Dampak Ergonomi & Pengguna | Rekomendasi Solusi Teknis |
|---|---|---|---|---|
| **Screenshot 1** | Hero Beranda & 3 Kartu Aksi Utama | Kartu aksi utama tampak sebagai persegi biru datar tanpa kedalaman visual; interaksi kursor belum memiliki animasi mikro yang halus; teks indikator aksi kurang dinamis. | Pengguna Generasi X dan operator lapangan kurang merasakan umpan balik taktil saat berinteraksi dengan elemen sentuh. | Menerapkan `.interactive-card` dengan translasi hover 3–4 px, scale 1.006, bayangan halus, wadah ikon tersendiri (`bg-white/15`), dan pergeseran ikon panah saat di-hover. |
| **Screenshot 2** | Progres Operasional Menyeluruh & Kartu Tindak Lanjut | Tindak lanjut pemeriksaan dan peringatan menggunakan tombol tautan teks bergaris bawah (`underline`), bukan kartu yang dapat diklik sepenuhnya (*full-card clickable*). | Operator harus mengarahkan kursor secara presisi ke tautan teks kecil; target sentuh di layar ponsel sulit dijangkau. | Mengubah seluruh kartu status menjadi tombol interaktif penuh, dengan pembatas garis tipis dan tombol aksi sekunder berlabel jelas. |
| **Screenshot 3** | Tata Letak Bawah Dasbor (Ruang Kosong Ekstrem) | Kolom kiri (Pesanan Berjalan) berakhir jauh lebih cepat dibandingkan kolom kanan (Peringatan, Catatan Terbaru, dan Status Integrasi yang ditumpuk secara vertikal), menyisakan ruang kosong putih raksasa yang mengganggu keseimbangan visual. | Dasbor terkesan tidak lengkap, terpotong secara visual, dan memaksa pengguna menggulir ke bawah tanpa konten di sisi kiri. | Restrukturisasi tata letak: 1) Pesanan Berjalan dipasangkan dengan Peringatan & Status Integrasi dalam grid 12 kolom berimbang, 2) Menambahkan Kartu Fitur Inspeksi 3D Part secara horizontal, 3) Menjadikan Catatan Aktivitas Terbaru sebagai seksi penuh (*full-width section*) di bawahnya. |
| **Screenshot 4** | Status Integrasi, Akses 3D & Footer | Tautan menuju "Inspeksi 3D" dan "Panduan tampilan" di footer disajikan sebagai teks biasa bergaris bawah; status data simulasi belum tertata dengan hierarki visual yang jelas. | Fitur inspeksi 3D part yang canggih tersembunyi sebagai tautan teks kecil di kaki halaman; footer tampak kurang rapi. | Merancang ulang footer dengan 3 zona berimbang (Brand, Badge Status Simulasi, dan Tombol Kontrol Nyata menggunakan komponen `Button sm`). |
| **Screenshot 5** | Daftar Pesanan Mitra (`#/pesanan`) | Tabel desktop belum memiliki penyorotan baris hover yang nyaman; kartu pesanan seluler masih berupa tumpukan teks tanpa hierarki grid yang ringkas. | Sulit membedakan batas antar-baris pada tabel yang padat; tampilan ponsel memanjang secara berlebihan. | Menambahkan efek sorot hover lembut (`hover:bg-brand-soft/30`), tombol `Detail` sekunder yang jelas, dan penataan grid 3 kolom pada kartu seluler. |
| **Screenshot 6** | Formulir Pesanan & Panel Samping | Panel panduan "Yang perlu disiapkan" belum memiliki aksen pembeda permukaan; di layar ponsel, panel memanjang dan mendorong formulir utama ke bawah. | Operator terbebani membaca teks panduan panjang sebelum mencapai kolom isian formulir pada perangkat ponsel. | Menjadikan panel samping `sticky` di desktop (`top-[calc(var(--navbar-height)+24px)]`), dan menyediakan tombol akordeon (*collapsible toggle*) "Petunjuk Pengisian Dokumen PO" di layar seluler. |
| **Screenshot 7** | Area Aksi Bawah Formulir | Aksi penggantian identitas petugas pencatat ("Ganti") berbentuk tautan teks kecil bergaris bawah tanpa tombol batas tegas. | Rentan tidak sengaja tertekan atau terlewat oleh operator yang ingin mengganti shift pencatatan. | Mengubah "Ganti" menjadi komponen tombol sekunder kompak (`Button sm`) berlabel **"Ganti Petugas"** lengkap dengan ikon pengguna. |
| **Screenshot 8** | Formulir Produksi & Riwayat Samping | Panel samping "Catatan produksi terakhir" tidak memiliki perilaku sticky pada desktop; kartu pemilihan pesanan belum memiliki mikro-interaksi saat di-hover. | Saat mengisi formulir produksi yang panjang ke bawah, operator kehilangan visibilitas terhadap riwayat produksi sebelumnya. | Menerapkan perilaku sticky desktop yang konsisten, menambahkan tombol akordeon riwayat di ponsel, dan menambahkan mikro-animasi pada kartu pilihan pesanan. |
| **Screenshot 9** | Formulir Pengiriman & Riwayat Samping | Panel samping "Riwayat pengiriman" tidak sticky; kartu pilihan pesanan siap kirim belum memiliki indikator status stok yang kontras. | Operator logistik kesulitan membandingkan nomor surat jalan yang sedang diketik dengan riwayat pengiriman sebelumnya. | Menstandarisasi sticky panel desktop dan akordeon seluler yang identik dengan modul produksi. |
| **Screenshot 10** | Riwayat Aktivitas Kronologis | Wadah ikon aktivitas menggunakan latar abu-abu datar yang seragam untuk semua jenis transaksi; pemisahan tanggal kurang menonjol. | Sulit membedakan sekilas antara transaksi pesanan, produksi, pengiriman, dan verifikasi supervisor saat pemindaian cepat. | Menggunakan wadah ikon 44 px beraksen warna semantik (Biru untuk Pesanan, Navy untuk Produksi, Hijau untuk Pengiriman, Kuning untuk Pemeriksaan) dengan badge tanggal tebal. |
| **Screenshot 11** | Layar Pemeriksaan Data Supervisor | Informasi kuantitas dan konteks mitra/barang bercampur dalam paragraf teks biasa dengan ukuran font yang seragam. | Supervisor membutuhkan waktu lebih lama untuk memeriksa anomali data di lapangan. | Meningkatkan tipografi kuantitas menjadi 28–32 px tebal tabular-nums, menata metadata dalam grid terstruktur 3 kolom, dan menambahkan penanda visual anomali. |
| **Screenshot 12** | Pusat Peringatan Operasional | Kartu peringatan belum memiliki penanda tingkat urgensi yang langsung tertangkap mata; langkah tindakan berikutnya belum terisolasi secara visual. | Pekerja pabrik sulit membedakan peringatan kritis (terlambat) dengan info biasa dalam sekejap mata. | Menambahkan aksen garis tepi kiri berwarna semantik (`border-l-4`), kotak sorotan tindakan disarankan, dan tombol aksi penuh "Buka Detail Pesanan". |
| **Screenshot 13** | Panel Drawer Asisten Beesha AI | Bagian "Pertanyaan Cepat" bersifat statis dan memakan sepertiga ruang vertikal drawer; area jawaban AI menjadi sempit dan terpotong. | Jawaban analitik yang panjang sulit dibaca; pengguna harus banyak menggulir (*scrolling*) di dalam ruang sempit. | Menjadikan seksi "Pertanyaan Cepat" dapat diciutkan (*collapsible*) dengan tombol **"Sembunyikan" / "Tampilkan"** dan chevron, serta otomatis menciut saat pertanyaan diajukan. |

---

## 3. Kesimpulan Audit v2.0

Antarmuka telah diidentifikasi secara menyeluruh. Tidak ditemukan masalah logika bisnis yang rusak; seluruh temuan bersifat optimasi visual, penataan tata letak struktural, penyempurnaan target interaksi sentuh, dan fleksibilitas drawer AI.

