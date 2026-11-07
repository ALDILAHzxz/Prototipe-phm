# Catatan Perubahan Sistem (Changelog)
## Proyek: BEESHA — Sistem Informasi Operasional PT Putra Hatim Mandiri (PHM Group)

Seluruh perubahan penting pada proyek ini dicatat dalam dokumen ini berdasarkan prinsip Semantic Versioning dan metodologi Keep a Changelog.

---

## [2.1.0] - 2026-11-07

### Penambahan (Added)
- **4 Kartu KPI Mandiri di Dasbor Utama (`DashboardScreen.tsx`):**
  - Kartu *Pesanan Aktif* (dengan sub-teks pesanan dalam proses).
  - Kartu *Produksi Selesai* (dengan total pcs barang jadi terakumulasi).
  - Kartu *Total Terkirim* (dengan total pcs telah dikirim ke mitra).
  - Kartu *Perlu Perhatian* (dengan jumlah anomali atau tindakan tertunda).
- **Automated End-to-End Test Suite (`utils/functional_e2e.test.ts`):**
  - 10 skenario pengujian komprehensif menguji skenario TEST-01 hingga TEST-16 (Alur lengkap order → produksi → pengiriman → dashboard, penolakan over-delivery, pencegahan PO duplikat, verifikasi supervisor, dialog koreksi, audit trail, dsb.).
  - Total pengujian otomatis meningkat menjadi 21 / 21 test lulus (100% pass).
- **Banner Identitas & Transparansi Data:**
  - Banner di bagian atas beranda yang menjelaskan bahwa aplikasi memuat data simulasi operasional.
  - Kartu Status Integrasi Sistem di dasbor yang menjelaskan status koneksi sistem INDIGO ERP dan BHEESA AI.
- **Suite Dokumentasi Stakeholder Lengkap (`docs/`):**
  - `docs/VIDEO_UI_AUDIT.md`: Audit video referensi `REVISI WEB PHM BARU.mp4` dengan matriks timestamp mendalam.
  - `docs/BASELINE_AUDIT.md`: Klasifikasi status seluruh fitur proyek.
  - `docs/GAP_ANALYSIS.md`: Analisis kesenjangan kebutuhan bisnis vs implementasi.
  - `docs/IMPLEMENTATION_PLAN.md`: Rencana eksekusi rekayasa 9 fase.
  - `docs/QA_REPORT.md`: Laporan jaminan kualitas perangkat lunak komprehensif.
  - `docs/BEFORE_AFTER.md`: Perbandingan visual dan fungsional Sebelum vs Sesudah.
  - `docs/DEMO_SCRIPT.md`: Naskah panduan demonstrasi terstruktur untuk Pak Yusuf.

### Perbaikan & Penyesuaian UX/UI (Changed & Refined)
- **Standarisasi Ukuran Elemen Desain (Ergonomi Gen-X):**
  - Memperbesar tinggi input formulir menjadi `56px` (`min-h-[56px]`) di `components/ui/Field.tsx`.
  - Memperbesar tinggi input pencarian menjadi `52px` (`min-h-[52px]`).
  - Memastikan tinggi tombol aksi minimal `52px` dengan teks tebal 16–17 px.
  - Memperbesar header utama menjadi `h-16 md:h-[72px]` dengan kontainer maksimal `max-w-[1360px]`.
- **Penyesuaian Palet Warna Token CSS (`app/globals.css`):**
  - Menyelaraskan token `--c-warning` ke `181 71 8` (`#B54708`) untuk kontras optimal di atas latar putih.
  - Memastikan rasio kontras teks utama terhadap background mencapai 12.6:1 (WCAG AAA).
- **Perbaikan Keamanan Lingkungan Uji Repositori (`lib/repository.ts`):**
  - Menambahkan pengecekan lingkungan aman `typeof window === 'undefined'` agar `BrowserOperationsRepository` dapat dijalankan pada runner pengujian Node.js / CLI tanpa crash.
  - Mengekspor kelas `BrowserOperationsRepository` secara eksplisit.
- **Perbaikan Fallback Tanggal Dinamis (`data/mockData.ts`):**
  - Menambahkan parameter default `today = todayISODate()` pada fungsi `createSeedData` agar tidak menghasilkan error saat dipanggil tanpa argumen dalam lingkungan testing.

---

## [2.0.0] - 2026-11-06

### Penambahan Besar (Major Architecture Refactor)
- **Lapisan Penyimpanan Data Persisten (`lib/repository.ts`):**
  - Abstraksi interface `OperationsRepository` yang memisahkan logika UI dari penyimpanan data.
  - Implementasi penyimpanan berbasis `localStorage` dengan penanganan multi-tab synchronization.
  - Mekanisme idempotensi mutasi data menggunakan `client_ref`.
- **Sistem Navigasi Berbasis Hash URL (`app/page.tsx`):**
  - Mendukung tombol Back / Forward browser tanpa keluar dari aplikasi SPA.
  - Mendukung bookmark dan direct URL navigation (`#/pesanan`, `#/produksi`, `#/pengiriman`, `#/riwayat`, `#/pemeriksaan`).
- **Pelindung Kehilangan Data (Navigation Guard):**
  - Dialog peringatan otomatis jika pengguna berpindah layar atau menutup tab saat formulir sedang diisi.
- **Modul Pemeriksaan Data Supervisor (`VerificationScreen.tsx`):**
  - Alur persetujuan data produksi dan pengiriman oleh supervisor dengan status *Terverifikasi* dan *Perlu Diperbaiki*.
  - Riwayat audit revisi data jika terjadi koreksi data oleh operator.
- **Komponen Pemilih Petugas Aktif (`StaffPicker.tsx`):**
  - Pemilih operator lini (Joko Sutopo, Siti Rahma) dan supervisor (Hartono).
  - Setiap mutasi data merekam identitas petugas pembuat dan pemeriksa.

### Perubahan Alur Formulir Operasional
- **Formulir Pesanan Mitra (`OrderFormScreen.tsx`):**
  - Dikelompokkan menjadi 3 kartu logis: Dari Siapa, Apa yang Dipesan, Keterangan.
  - Validasi keunikan nomor PO per mitra.
  - Tombol pengisian otomatis estimasi tanggal kirim berdasarkan lead-time standar komponen.
- **Formulir Hasil Produksi (`ProductionFormScreen.tsx`):**
  - Pemilihan pesanan menggunakan kartu visual informatif berukuran besar.
  - Tampilan sisa target produksi, kuantitas barang baik, dan kuantitas barang reject.
  - Peringatan instan jika kuantitas melebihi target PO manufaktur.
- **Formulir Pengiriman Barang (`DeliveryFormScreen.tsx`):**
  - Input nomor Surat Jalan manual dari dokumen fisik (bukan acak).
  - Validasi penolakan jika kuantitas melebihi sisa pesanan aktif.
  - Tombol satu klik "Kirim semua barang siap kirim".

---

## [1.0.0] - 2026-11-05

### Rilis Awal (Initial Baseline Prototype)
- Inisialisasi proyek Next.js 15, Tailwind CSS, Lucide Icons, dan Three.js.
- Implementasi awal formulir pesanan, produksi, dan pengiriman dalam state memori lokal (`useState`).
- Layar dasbor awal dengan visualisasi 3D part di halaman utama.
- Layar riwayat aktivitas dan integrasi dasar API Gemini AI.

