# AUDIT UI/UX V3.0 — BEESHA PHM GROUP
## Root-Cause Analysis, Visual Mapping & Sitewide Contrast Audit

**Tanggal:** 8 November 2026  
**Status:** Selesai (Fully Resolved)  
**Dokumen:** UI/UX Technical Revision V3.0  

---

## 1. Analisis Akar Masalah (Root-Cause Investigation)

Berdasarkan audit komprehensif terhadap 4 tangkapan layar permasalahan visual dan kode sumber:

### 1.1 Masalah 1: Teks Mode Gelap (Dark Mode) Gelap / Nyaris Tidak Terbaca
- **Akar Masalah:**
  Sebelumnya, token Tailwind `text-navy` didefinisikan melalui `--c-navy: 15 23 42;` (#0F172A) dalam mode gelap. Hal ini menyebabkan teks, judul, dan angka KPI yang diberi kelas `text-navy` berubah menjadi warna hitam/abu-abu pekat di atas kartu atau latar gelap (`#172131`), menghasilkan rasio kontras sangat rendah (< 1.5:1) yang melanggar standar WCAG 2.1 AA.
- **Dampak Komponen:**
  - Kartu KPI Dashboard (angka pesanan aktif, total dipesan, dll).
  - Teks brand `<strong className="text-navy">BEESHA</strong>` pada Footer.
  - Teks tombol sekunder `<Button variant="secondary">` di seluruh aplikasi.
  - Teks identitas ID pesanan pada tabel dan daftar catatan.
  - Status integrasi sistem dan keterangan asal data.

### 1.2 Masalah 2: Ikon Navigasi & Container Menjadi Hitam / Sukar Dikenali
- **Akar Masalah:**
  Pada `NavigationDrawer.tsx`, container ikon menggunakan `bg-canvas text-navy`. Dalam mode gelap, `bg-canvas` adalah `#0B111B` dan `text-navy` adalah `#0F172A`, menghasilkan ikon hitam di atas kotak hitam. Selain itu, ikon di bagian menu bawah (*Tanya Beesha, Inspeksi 3D, Panduan, Penyimpanan*) secara eksplisit menggunakan `text-navy`.
- **Dampak Komponen:**
  - Ikon menu Drawer tidak terlihat.
  - Ikon `HardDrive` pada footer drawer tidak terlihat.
  - Ikon timeline aktivitas pada dashboard menjadi gelap di atas kotak `bg-subtle`.

### 1.3 Masalah 3: Batas Kartu (Card Borders) Menyatu dengan Background
- **Akar Masalah:**
  Dalam Light Mode, batas kartu menggunakan token `--c-line` bernilai `#D9E0E8` yang terlalu tipis dan pucat di atas latar belakang Soft Silver (`#F2F4F7`). Dalam Dark Mode, `--c-line` bernilai `#26344C` yang terlalu gelap di atas latar `#0B111B` dan permukaan kartu `#172131`, sehingga kartu kehilangan batas visual (*card outline separation*).
- **Dampak Komponen:**
  - Seluruh kartu form, KPI, ringkasan progres, dan riwayat aktivitas tampak melayang tanpa batas tegas.

### 1.4 Masalah 4: Filter Pemeriksaan Data (Desktop Kurang Proporsional & Mobile Terlalu Padat)
- **Akar Masalah:**
  Komponen `FilterChips` sebelumnya hanya menggunakan `flex flex-wrap gap-2`.
  - **Di Desktop:** 4 tombol status hanya menempati sebagian kecil sisi kiri baris pertama, meninggalkan 60% ruang kartu kosong. Tiga tombol jenis catatan di baris kedua juga rata kiri tanpa keseimbangan visual.
  - **Di Mobile:** 7 tombol bertumpuk tidak beraturan hingga 4-5 baris, menyita banyak ruang vertikal dan membingungkan pengguna layar sentuh sebelum mereka dapat melihat data catatan fisik.

---

## 2. Pemetaan Revisi Berdasarkan 4 Tangkapan Layar

| No | Lokasi Tangkapan Layar | Masalah Teramati | Tindakan Koreksi V3.0 | Status |
|---|---|---|---|---|
| 1 | **Dashboard & Footer Dark Mode** | Teks `BEESHA`, tombol footer, dan ikon sulit dibaca | Diberikan override warna teks cerah adaptif `#8CCBFF`, tombol sekunder dengan kontras tinggi, dan badge PHM berbingkai jelas | ✅ Selesai |
| 2 | **Navigation Drawer Dark Mode** | Ikon navigasi hitam di atas kontainer hitam | Menggunakan kontainer `#263D5A` dengan ikon bercahaya `#8CCBFF`, teks aktif bercahaya, dan divider yang tegas | ✅ Selesai |
| 3 | **Filter Pemeriksaan (Desktop)** | Baris status tidak memenuhi kartu, baris kedua tidak di tengah | Baris 1: Grid 4 kolom proporsional penuh (*equal-width*). Baris 2: Grid 3 kolom terpusat di tengah (*centered*) dengan jarak 16–20px | ✅ Selesai |
| 4 | **Filter Pemeriksaan (Mobile)** | 7 tombol filter menumpuk padat dan membingungkan | Mengganti 7 tombol dengan 2 selektor primer berdampingan (*Status Pemeriksaan* & *Jenis Catatan*) dengan *bottom-sheet dialog* | ✅ Selesai |

---

## 3. Kesimpulan Audit
Seluruh akar permasalahan telah diidentifikasi dan ditangani pada lapisan fondasi desain token serta arsitektur komponen, tanpa mengubah logika bisnis, aturan validasi, atau alur kerja operasional manufaktur yang sudah berjalan.
