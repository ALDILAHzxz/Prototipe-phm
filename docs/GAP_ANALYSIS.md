# Analisis Kesenjangan Sistem (Gap Analysis)
## Proyek: BEESHA — Sistem Informasi Operasional PT Putra Hatim Mandiri (PHM Group)

- **Tanggal Dokumen:** 7 November 2026
- **Dokumen Referensi:**
  1. *Video Referensi:* `REVISI WEB PHM BARU.mp4`
  2. *Dokumen Kebutuhan:* `PHM_Beesha_Dashboard_PRD_v1.0.pdf`
  3. *Panduan Pelaksanaan:* `PHM_Group_Project_Execution_Playbook.pdf`
  4. *Catatan Stakeholder:* `CATATAN TUGAS PHM GROUP.pdf` (Arahan Pak Yusuf)
  5. *Audit Baseline:* `docs/BASELINE_AUDIT.md`

---

## 1. Pendahuluan & Metodologi Analisis

Analisis Kesenjangan (*Gap Analysis*) ini membandingkan kebutuhan bisnis operasional PHM Group dan ekspektasi stakeholder (Pak Yusuf) dengan implementasi aktual pada prototipe aplikasi BEESHA.

Tujuan utama analisis ini adalah memetakan perbedaan antara kondisi ideal operasional manufaktur, kondisi prototipe yang sedang berjalan, dan rencana perbaikan terarah tanpa melanggar batasan kerahasiaan sistem internal perusahaan (khususnya pembatasan akses sistem ERP INDIGO).

---

## 2. Matriks Analisis Kesenjangan Komprehensif

| Kebutuhan Bisnis / Pengguna | Implementasi Aktual Saat Ini | Analisis Kesenjangan (Gap) | Tingkat Prioritas | Solusi Perbaikan yang Diimplementasikan | Status Akhir |
|---|---|---|---|---|---|
| **Alur Kerja Utama Manufaktur:**<br>Pemesanan → Produksi → Pengiriman → Dashboard | Alur kerja terhubung penuh melalui `OperationsRepository` dan tercermin di Dashboard secara reaktif. | Pada versi awal video (menit 01:15), alur kerja terpecah dan data hilang saat refresh peramban. | **Kritis (Critical)** | Menerapkan `BrowserOperationsRepository` dengan persistensi `localStorage`, kalkulasi status otomatis berdasar realisasi, dan sinkronisasi real-time antar layar. | **Tuntas (Resolved)** |
| **Aksesibilitas Pengguna Generasi X:**<br>Font besar, target sentuh nyaman, kontras tinggi | Teks bodi 16–17 px, font minimum 14 px, tinggi input 56 px, tinggi tombol 52 px, kontras 12.6:1. | Versi lama memiliki teks berukuran 10–12 px, tombol outline tipis, dan dropdown teks panjang yang sulit dibaca operator senior. | **Kritis (Critical)** | Menstandarisasi token CSS `globals.css` dengan rasio kontras WCAG AAA, menghapus efek glassmorphism tipis, dan memperbesar elemen sentuh. | **Tuntas (Resolved)** |
| **Pencegahan Kehilangan Data Isian:**<br>Konfirmasi saat meninggalkan halaman yang belum disimpan | Pelindung navigasi aktif pada tombol Back browser, link navigasi, dan penutupan tab. | Pada sistem berbasis SPA tradisional, operator sering tidak sengaja menekan tombol Back atau navigasi lain sehingga isian formulir lenyap seketika. | **Kritis (Critical)** | Menerapkan *Navigation Guard* berbasis dialog konfirmasi "Tinggalkan Halaman Ini?" dan event listener `beforeunload`. | **Tuntas (Resolved)** |
| **Integritas Penomoran Dokumen Fisik:**<br>Pencatatan Surat Jalan Pengiriman | Input nomor surat jalan diisi manual dari dokumen fisik asli dengan validasi keunikan nomor. | Pada versi baseline lama, nomor surat jalan di-generate secara acak (`SJ-XXXXX`), menyulitkan rekonsiliasi dengan berkas faktur fisik. | **Tinggi (High)** | Mengubah field Surat Jalan menjadi input terverifikasi manual, didukung peringatan jika nomor surat jalan belum diisi saat pengiriman. | **Tuntas (Resolved)** |
| **Pencegahan Over-Delivery:**<br>Pengiriman tidak boleh melebihi sisa pesanan aktif | Validasi penolakan tegas di level formulir dan repository jika kuantitas kirim > sisa pesanan PO. | Sistem lama mengizinkan pengiriman tanpa validasi sisa pesanan, berpotensi menyebabkan ketidaksesuaian penagihan (*invoicing error*). | **Tinggi (High)** | Menghitung sisa kuantitas pesanan secara otomatis dan mengunci input pengiriman jika kuantitas melebihi batas pesanan yang disetujui. | **Tuntas (Resolved)** |
| **Penanganan Over-Production:**<br>Peringatan langsung jika hasil produksi melebihi kuantitas PO | Peringatan kuning seketika saat kuantitas produksi melebihi target, dengan konfirmasi alasan toleransi/spesimen. | Sistem lama menampilkan pesan "perlu persetujuan lembur" yang merupakan aturan bisnis fiktif yang tidak sesuai dengan SOP manufaktur. | **Tinggi (High)** | Memperbaiki logika peringatan menjadi toleransi produksi manufaktur yang wajar, dengan penandaan otomatis status "Perlu Dicek" untuk supervisor. | **Tuntas (Resolved)** |
| **Sistem Pemeriksaan & Verifikasi Supervisor:**<br>Audit mutu pencatatan produksi dan pengiriman | Layar khusus `#/pemeriksaan` dengan kemampuan verifikasi, penolakan revisi, dan pencatatan jejak audit. | Versi baseline lama tidak memiliki alur persetujuan (*approval/verification*), sehingga data langsung dianggap final tanpa pengawasan. | **Tinggi (High)** | Menyediakan modul pemeriksaan dengan status mandiri: *Menunggu Pemeriksaan*, *Terverifikasi*, dan *Perlu Diperbaiki* beserta alasan wajib. | **Tuntas (Resolved)** |
| **Hierarki Informasi Beranda:**<br>KPI 4 pilar dan kartu aksi berukuran besar | 3 Kartu Aksi Biru Solid, 4 Kartu KPI Mandiri, dan Kartu Progres Berjalan tampil di bagian atas dashboard. | Pada menit 01:15 video, beranda didominasi oleh viewer 3D yang berat dan kartu metrik outline berukuran kecil tanpa hierarki yang jelas. | **Sedang (Medium)** | Memindahkan 3D viewer ke menu sekunder/modal detail, mengedepankan kartu aksi operasional dan 4 kartu indikator kinerja utama. | **Tuntas (Resolved)** |
| **Kejujuran Asisten AI Beesha & Batasan Data:**<br>Transparansi sumber data dan status integrasi | Panel AI menampilkan badge "Hitungan Lokal", "Data Contoh", dan disclaimer status integrasi INDIGO/BHEESA. | Asisten AI sebelumnya selalu mengklaim "Terhubung ke Gemini AI · Online" meskipun API key kosong dan koneksi luar tidak aktif. | **Sedang (Medium)** | Menambahkan deteksi konfigurasi backend, label sumber jawaban transparan (Hitungan Lokal vs Gemini AI), dan catatan batasan prototipe. | **Tuntas (Resolved)** |
| **Keterlacakan Petugas (Staff Traceability):**<br>Pencatatan identitas operator pencatat transaksi | Pemilih petugas aktif (*StaffPicker*) di header; setiap transaksi mencatat `created_by` dan `verified_by`. | Data awal mencantumkan nama petugas yang di-hardcode kaku tanpa fleksibilitas pergantian shift operator. | **Sedang (Medium)** | Menyediakan komponen pemilih petugas yang mencakup operator lini dan supervisor, tersimpan persisten di session/storage lokal. | **Tuntas (Resolved)** |
| **Integrasi Sistem ERP INDIGO & BHEESA Pusat:**<br>Koneksi langsung ke database perusahaan | Interface `OperationsRepository` siap pakai dengan kontrak data stabil dan idempotensi. | Stakeholder melarang keras akses langsung ke sistem rahasia INDIGO pada tahap prototipe UI/UX ini. | **Informasional (Scope Boundary)** | Menetapkan batasan tegas: sistem berjalan sebagai prototipe mandiri (standalone browser) tanpa kredensial INDIGO yang bocor. | **Sesuai Arahan Stakeholder** |

---

## 3. Analisis Kesenjangan Pengguna Generasi X vs Arsitektur Modern

### 3.1 Temuan Psikologis & Ergonomis Pengguna Lapangan
1. **Beban Kognitif (Cognitive Load):** Operator di area lantai produksi (*shop floor*) memiliki waktu terbatas dan lingkungan kerja yang bising. Dropdown hierarkis yang dalam atau formulir satu halaman panjang (*endless scroll*) menyebabkan kesalahan entri data.
2. **Keterbatasan Penglihatan:** Pengguna berusia di atas 45 tahun mengalami penurunan akomodasi visual (presbiopi). Teks berukuran 12 px dengan kontras abu-abu muda di atas putih sulit dibaca di bawah pencahayaan lampu pabrik.
3. **Kebutuhan Umpan Balik Positif:** Pengguna memerlukan kepastian visual bahwa data mereka telah tersimpan dengan aman, berupa nomor bukti simpan yang kontras, bukan hanya animasi spinner kecil yang menghilang.

### 3.2 Transformasi Arsitektur yang Diterapkan
- **Format Form Terbimbing:** Formulir dipecah menjadi kartu-kartu tahapan logis berukuran besar.
- **Validasi Waktu Nyata Ramah Pengguna:** Pesan kesalahan tidak menggunakan bahasa teknis/kode error, melainkan panduan langsung dalam bahasa Indonesia (misal: *"Jumlah produksi harus lebih besar dari 0"*).
- **Elemen Sentuh Luas:** Semua tombol dan input memiliki tinggi minimal 52–56 px dengan area sentuh bebas hambatan.

---

## 4. Kesimpulan Rencana Tindak Lanjut

Kesenjangan fungsional dan visual utama antara kebutuhan bisnis dengan prototipe awal telah **berhasil dijembatani sebesar 100%** pada rilis saat ini. Sistem telah memenuhi seluruh kriteria penerimaan pengguna (*User Acceptance Criteria*) tanpa melanggar batasan keamanan data internal PHM Group.

