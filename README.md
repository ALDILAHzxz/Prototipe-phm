# BEESHA — Sistem Informasi Operasional PT Putra Hatim Mandiri (PHM Group)
## Prototipe Sistem Operasional Manufaktur & Dasbor Eksekutif

[![Next.js 15](https://img.shields.io/badge/Next.js-15.1.0-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.0.0-blue?style=flat&logo=react)](https://react.dev/)
[![TypeScript Strict](https://img.shields.io/badge/TypeScript-5.7%20Strict-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS 3](https://img.shields.io/badge/Tailwind%20CSS-3.4.1-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Tests Passing](https://img.shields.io/badge/Tests-21%2F21%20Passed-18794E?style=flat)](utils/functional_e2e.test.ts)
[![Accessibility](https://img.shields.io/badge/WCAG-AAA%20Compliant-1B365D?style=flat)](#aksesibilitas--desain-generasi-x)

Aplikasi web prototipe interaktif untuk merampingkan dan mengintegrasikan 4 pilar operasional manufaktur PT Putra Hatim Mandiri:
**Pemesanan Mitra → Hasil Produksi → Pengiriman Logistik → Dasbor Eksekutif Beesha**.

Sistem ini dirancang khusus dengan ergonomi antarmuka yang ramah bagi pengguna Generasi X (pekerja operasional, supervisor, dan manajer pabrik) dengan mengutamakan keterbacaan tinggi, pencegahan kesalahan entri, dan transparansi data.

---

> ### ⚠️ Batasan Ruang Lingkup & Kepatuhan Keamanan Data
> - **Status Data:** Prototipe ini menggunakan data operasional sintetis yang tersimpan secara lokal dan persisten di peramban pengguna (`localStorage`).
> - **Kerahasiaan Sistem Perusahaan:** Aplikasi ini **TIDAK MENGAKSES, TIDAK MENGUBAH, dan BELUM TERHUBUNG** ke sistem database rahasia ERP INDIGO maupun server live AI BHEESA pusat. Batasan ini sesuai dengan arahan langsung manajemen (Pak Yusuf) untuk memprioritaskan validasi UX/UI terlebih dahulu sebelum melangkah ke integrasi data teknis.
> - **Panduan Integrasi:** Spesifikasi kontrak data dan kesiapan integrasi masa depan tercatat di [`docs/INTEGRASI.md`](docs/INTEGRASI.md).

---

## 🌟 Fitur Utama Sistem

1. **Dasbor Ringkasan Operasional Terpadu (`#/`)**
   - 3 Kartu Aksi Utama berwarna biru brand solid (`#0077C8`) dengan tombol eksplisit "Mulai Input".
   - 4 Kartu KPI Mandiri: Pesanan Aktif, Produksi Selesai, Total Terkirim, dan Perlu Perhatian.
   - Kartu Realisasi Periode (Hari ini, 7 hari, Bulan ini) dan Progres Pesanan Berjalan.
   - Kartu Tindak Lanjut & Pengingat Supervisor.
2. **Pencatatan Pesanan Mitra Baru (`#/pesanan`)**
   - Formulir terstruktur dalam 3 kartu bertahap (Dari Siapa, Apa yang Dipesan, Keterangan).
   - Pengisian otomatis kontak PIC dari data mitra aktif.
   - Tombol perhitungan tanggal kirim otomatis sesuai lead-time manufaktur komponen.
   - Validasi ketat pencegahan duplikasi nomor PO mitra.
3. **Pencatatan Hasil Produksi Pabrik (`#/produksi`)**
   - Pemilihan pesanan aktif berbasis kartu visual besar (bukan dropdown kecil).
   - Input kuantitas barang baik dan cacat (*reject*).
   - Peringatan instan atas kuantitas melebihi target PO (*over-production tolerance warning*).
4. **Pencatatan Pengiriman & Surat Jalan (`#/pengiriman`)**
   - Alamat tujuan otomatis terisi dari data pesanan mitra.
   - Input nomor Surat Jalan wajib diketik manual dari dokumen fisik asli.
   - Tombol satu klik "Kirim semua barang siap".
   - Penolakan tegas jika pengiriman melebihi sisa pesanan aktif (*strict over-delivery prevention*).
   - Mendukung pencatatan pengiriman bertahap (*partial shipments*).
5. **Modul Pemeriksaan Data Supervisor (`#/pemeriksaan`)**
   - Alur persetujuan mutu catatan produksi dan pengiriman oleh supervisor.
   - Status pemeriksaan mandiri: *Menunggu Pemeriksaan*, *Terverifikasi*, dan *Perlu Diperbaiki*.
   - Kewajiban mengisi catatan alasan perbaikan untuk setiap penolakan data.
   - Dialog koreksi data dengan pencatatan riwayat revisi (*audit trail*).
6. **Riwayat Aktivitas Kronologis (`#/riwayat`)**
   - Riwayat data murni diturunkan (*derived*) dari mutasi transaksi asli.
   - Dikelompokkan per tanggal kejadian dengan filter multi-kategori dan pencarian teks waktu nyata.
7. **Pusat Deteksi Peringatan Operasional (`#/peringatan`)**
   - Deteksi dini pesanan mendekati/melewati tenggat, produksi melebihi kuantitas PO, dan ketiadaan surat jalan.
8. **Asisten AI Interaktif "Tanya Beesha"**
   - Analitik data lokal yang transparan dan akurat.
   - Dukungan opsional integrasi Gemini API dengan label sumber data yang jujur.
9. **Viewer Model 3D Komponen Manufaktur (`#/inspeksi-3d`)**
   - Visualisasi interaktif 3D part (orbit, zoom, wireframe) berbasis Three.js.

---

## 🎨 Aksesibilitas & Desain Generasi X

Aplikasi ini dibangun dengan mematuhi standar **WCAG 2.1 Level AA & AAA**:
- **Ukuran Teks:** Minimum 14–16 px untuk keterangan, 16–17 px untuk teks bodi formulir.
- **Elemen Sentuh:** Tinggi tombol minimal **52 px**, tinggi input formulir minimal **56 px**.
- **Kontras Warna:** Teks utama (`#1E293B`) di atas latar putih (`#FFFFFF`) menghasilkan rasio kontras **12.6:1** (melebihi standar WCAG AAA 7:1).
- **Pelindung Kehilangan Data (*Navigation Guard*):** Dialog konfirmasi mencegah operator kehilangan data isian secara tidak sengaja saat menekan tombol navigasi atau Back browser.
- **Navigasi Keyboard Penuh:** Ring fokus 3 px jelas pada setiap elemen interaktif; dukungan penuh tombol `Tab`, `Enter`, dan `Escape`.

---

## 🚀 Panduan Instalasi & Menjalankan Aplikasi

### Kebutuhan Sistem:
- Node.js versi 18.18.0 atau lebih baru (direkomendasikan v20+)
- Peramban web modern (Google Chrome, Microsoft Edge, Mozilla Firefox, Safari)

### 1. Kloning Repositori & Instalasi Dependensi
```bash
git clone https://github.com/ALDILAHzxz/Prototipe-phm.git
cd Prototipe-phm
npm install
```

### 2. Menjalankan Server Pengembangan Lokal
```bash
npm run dev
```
Buka peramban pada alamat: [http://localhost:3000](http://localhost:3000)

### 3. Pemeriksaan Tipe & Uji Otomatis
```bash
# Menjalankan seluruh test suite unit & end-to-end (21 tests)
npm test

# Menjalankan pemeriksaan tipe ketat TypeScript (0 errors)
npm run typecheck
```

### 4. Membangun Bundle Produksi
```bash
npm run build
npm run start
```

### 5. Konfigurasi Lingkungan (Opsional)
Buat berkas `.env.local` pada direktori root jika ingin mengaktifkan layanan cloud Gemini AI:
```env
# Opsional - jika tidak diisi, asisten AI menggunakan analisis data lokal yang jujur
GEMINI_API_KEY=your_gemini_api_key_here
```
> *Catatan Keamanan: Jangan pernah mengunggah atau melakukan commit file `.env.local` yang berisi kunci rahasia ke repositori Git publik.*

---

## 📁 Struktur Direktori Proyek

```
Prototipe-phm/
├── app/
│   ├── api/gemini/route.ts       # Endpoint proxy Gemini API dengan sanitasi & fallback
│   ├── globals.css               # Token CSS (Navy, Brand Blue, Ink, Canvas, Focus Ring)
│   ├── layout.tsx                # Root layout Next.js
│   └── page.tsx                  # Controller utama aplikasi (Hash router & modal manager)
├── components/
│   ├── screens/                  # Layar aplikasi operasional
│   │   ├── ActivityScreen.tsx
│   │   ├── AlertsScreen.tsx
│   │   ├── DashboardScreen.tsx
│   │   ├── DeliveryFormScreen.tsx
│   │   ├── OrderDetailScreen.tsx
│   │   ├── OrderFormScreen.tsx
│   │   ├── ProductionFormScreen.tsx
│   │   ├── VerificationScreen.tsx
│   │   └── shared.tsx
│   ├── ui/                       # Komponen antarmuka atomik berstandar WCAG
│   ├── BeeshaAIAssistant.tsx     # Panel drawer asisten AI Beesha
│   ├── Navbar.tsx                # Header sticky 72px / 64px
│   ├── NavigationDrawer.tsx      # Drawer navigasi samping terkelompok
│   ├── OrderPicker.tsx           # Pemilih pesanan berbasis kartu visual
│   ├── StaffPicker.tsx           # Pemilih petugas aktif (Operator vs Supervisor)
│   └── ThreePartViewer.tsx       # Viewer interaktif komponen 3D
├── data/
│   └── mockData.ts               # Data awal sintetis realistis
├── docs/                         # Repositori dokumentasi teknis & stakeholder
│   ├── BASELINE_AUDIT.md         # Audit baseline fungsionalitas & status fitur
│   ├── BEFORE_AFTER.md           # Analisis komparatif Sebelum vs Sesudah refactor
│   ├── CHANGELOG.md              # Riwayat perubahan sistem per rilis
│   ├── DEMO_SCRIPT.md            # Naskah panduan demonstrasi untuk Pak Yusuf
│   ├── GAP_ANALYSIS.md           # Analisis kesenjangan bisnis vs implementasi
│   ├── IMPLEMENTATION_PLAN.md    # Rencana eksekusi rekayasa 9 fase
│   ├── INTEGRASI.md              # Kontrak data & batas integrasi sistem INDIGO
│   ├── LAPORAN-REFACTOR.md       # Laporan teknis refactor UX/UI
│   ├── QA_REPORT.md              # Laporan jaminan kualitas & matriks TEST-01 s/d TEST-16
│   └── VIDEO_UI_AUDIT.md         # Audit visual frame-by-frame dari rekaman video
├── lib/
│   ├── activity.ts               # Generator riwayat aktivitas terverifikasi
│   ├── format.ts                 # Pemformat tanggal & angka mata uang/unit Indonesia
│   ├── repository.ts             # Lapisan penyimpanan OperationsRepository (localStorage)
│   └── useOperations.ts          # Custom hook manajemen data terpadu
├── types/
│   └── index.ts                  # Kontrak tipe TypeScript (Order, Production, Delivery, Staff)
└── utils/
    ├── functional_e2e.test.ts    # Test suite komprehensif alur TEST-01 hingga TEST-16
    ├── operations.test.ts        # Unit test kalkulasi bisnis operasional
    ├── operations.ts             # Fungsi logika kalkulasi status & validasi
    └── validation.test.ts        # Unit test validasi formulir & penolakan kesalahan
```

---

## 🔗 Peta Rute Navigasi Aplikasi

Navigasi menggunakan URL Hash yang ramah terhadap peramban dan tidak memerlukan konfigurasi server khusus:
- `#/` : Dasbor Ringkasan Operasional & KPI
- `#/pesanan` : Daftar & Ringkasan Seluruh Pesanan Mitra
- `#/pesanan/baru` : Formulir Input Pesanan Mitra Baru
- `#/pesanan/detail/:id` : Detail Terpadu Pesanan, Rencana vs Realisasi & Linimasa
- `#/produksi` atau `#/produksi/:id` : Formulir Pencatatan Hasil Produksi
- `#/pengiriman` atau `#/pengiriman/:id` : Formulir Pencatatan Pengiriman & Surat Jalan
- `#/riwayat` : Riwayat Aktivitas Kronologis Transaksi
- `#/pemeriksaan` : Modul Pemeriksaan Data Supervisor & Koreksi
- `#/peringatan` : Pusat Deteksi Peringatan & Anomali Operasional
- `#/inspeksi-3d` : Viewer Visualisasi Model 3D Komponen

---

## 🧪 Hasil Verifikasi Kualitas

- **Unit & Integration Test:** 21 / 21 Passed (100%)
- **TypeScript Typecheck:** 0 Errors
- **Next.js Production Build:** 100% Berhasil
- **Deployment Produksi:** [https://phmprototype.vercel.app](https://phmprototype.vercel.app)

---

## 👥 Tim Pengembang & Hak Cipta

Dikembangkan oleh **Tim Rekayasa Perangkat Lunak Mahasiswa** untuk **PT Putra Hatim Mandiri (PHM Group)** dalam rangka modernisasi sistem informasi operasional manufaktur terpadu BEESHA.
