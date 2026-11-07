# Rencana Implementasi & Eksekusi Rekayasa (Implementation Plan)
## Proyek: BEESHA — Sistem Informasi Operasional PT Putra Hatim Mandiri (PHM Group)

- **Versi Rencana:** 2.0 (Eksekusi Komprehensif)
- **Target Penyelesaian:** Tahap Refactor UX/UI, Integrasi Alur Manufaktur, dan Pengujian End-to-End
- **Penanggung Jawab:** Principal Full-Stack Engineer, Senior Frontend Architect, QA Lead

---

## 1. Tujuan Strategis Rencana Eksekusi

Rencana implementasi ini dirancang untuk mewujudkan arsitektur prototipe operasional manufaktur yang tangguh, ramah pengguna generasi X, aman secara batas data (*secure data boundaries*), dan siap dipresentasikan kepada pimpinan PHM Group (Pak Yusuf).

### Sasaran Utama:
1. Menghubungkan alur operasional 4 pilar: **Pemesanan Mitra → Hasil Produksi → Pengiriman → Dashboard Beesha**.
2. Mengimplementasikan antarmuka modern berkontras tinggi dengan standar aksesibilitas WCAG AAA untuk pekerja operasional senior.
3. Memastikan integritas data dan persistensi lokal yang tahan terhadap refresh dan penutupan browser.
4. Menyediakan sistem pemeriksaan mutu data berbasis peran supervisor (*verification workflow*).
5. Membangun rangkaian pengujian otomatis (*automated test suite*) mencakup seluruh skenario fungsional kritis (TEST-01 hingga TEST-16).

---

## 2. Struktur Tahapan Eksekusi (Phase Breakdown)

```
┌─────────────────────────────────────────────────────────────┐
│ FASE 1: Audit Mendalam & Analisis Video UI/UX               │
├─────────────────────────────────────────────────────────────┤
│ FASE 2: Standarisasi Design System & Aksesibilitas Gen-X    │
├─────────────────────────────────────────────────────────────┤
│ FASE 3: Penguatan Arsitektur Data & Repositori Persistensi  │
├─────────────────────────────────────────────────────────────┤
│ FASE 4: Refactor Alur Formulir Operasional (3 Modul Utama)   │
├─────────────────────────────────────────────────────────────┤
│ FASE 5: Implementasi Alur Verifikasi Supervisor & Audit     │
├─────────────────────────────────────────────────────────────┤
│ FASE 6: Restrukturisasi Dasbor Utama & Metrik Realisasi     │
├─────────────────────────────────────────────────────────────┤
│ FASE 7: Transparansi Panel AI & Batasan Integrasi INDIGO    │
├─────────────────────────────────────────────────────────────┤
│ FASE 8: Pengujian Kualitas Menyeluruh (Automated & Manual)  │
├─────────────────────────────────────────────────────────────┤
│ FASE 9: Dokumentasi Lengkap & Kesiapan Demonstrasi Bisnis   │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Rincian Eksekusi per Fase

### FASE 1 — Audit Mendalam & Analisis Video UI/UX
- **Tujuan:** Memahami secara visual dan fungsional kesenjangan antara versi awal dan versi revisi pada video `REVISI WEB PHM BARU.mp4`.
- **Berkas Terkait:** `references/REVISI WEB PHM BARU.mp4`, `docs/VIDEO_UI_AUDIT.md`, `docs/BASELINE_AUDIT.md`.
- **Tugas Spesifik:**
  1. Mengekstrak frame kunci video menggunakan script OpenCV Python.
  2. Memetakan 15 dimensi UI/UX dan timestamp per kejadian di video.
  3. Mengidentifikasi bug visual lama (teks 10–12 px, nomor surat jalan acak, tombol tipis).
- **Kriteria Verifikasi:** Terbitnya dokumen `docs/VIDEO_UI_AUDIT.md` dan `docs/BASELINE_AUDIT.md` dengan analisis lengkap.
- **Risiko & Mitigasi:** Resiko salah tafsir fitur visual; dimitigasi dengan pengujian langsung di kode sumber.

### FASE 2 — Standarisasi Design System & Aksesibilitas Gen-X
- **Tujuan:** Menetapkan fondasi desain visual kontras tinggi yang ramah bagi mata pekerja lapangan.
- **Berkas Terkait:** `app/globals.css`, `tailwind.config.ts`, `components/ui/*`.
- **Tugas Spesifik:**
  1. Menetapkan variabel CSS untuk warna wajib: Navy (`#1B365D`), Brand Blue (`#0077C8`), Canvas (`#F2F4F7`), Ink (`#1E293B`), Border (`#D9E0E8`), Warning (`#B54708`), Success (`#18794E`), Danger (`#B42318`).
  2. Mengonfigurasi tinggi tombol minimal 52 px dan input formulir 56 px.
  3. Mengonfigurasi font size minimum 14–16 px untuk teks keterangan dan 16–17 px untuk teks bodi.
  4. Menetapkan focus ring 3 px berkontras tinggi untuk aksesibilitas keyboard.
- **Kriteria Verifikasi:** Lolos pengujian rasio kontras warna WCAG AA/AAA (rasio 12.6:1 pada teks utama).

### FASE 3 — Penguatan Arsitektur Data & Repositori Persistensi
- **Tujuan:** Memastikan data operasional tersimpan dengan andal dan tidak hilang saat halaman di-refresh.
- **Berkas Terkait:** `lib/repository.ts`, `data/mockData.ts`, `types/index.ts`.
- **Tugas Spesifik:**
  1. Membangun abstraksi `OperationsRepository` dengan metode operasi async.
  2. Mengimplementasikan `BrowserOperationsRepository` yang aman terhadap lingkungan SSR/Node.js testing.
  3. Mengintegrasikan mekanisme idempotensi `client_ref` untuk mencegah duplikasi simpan.
  4. Menyediakan skema auto-backup jika terjadi kegagalan pembacaan data di `localStorage`.
- **Kriteria Verifikasi:** Data formulir baru tetap bertahan setelah browser direfresh berkali-kali.

### FASE 4 — Refactor Alur Formulir Operasional (3 Modul Utama)
- **Tujuan:** Mempermudah pencatatan data harian tanpa kebingungan input.
- **Berkas Terkait:** `components/screens/OrderFormScreen.tsx`, `ProductionFormScreen.tsx`, `DeliveryFormScreen.tsx`, `components/OrderPicker.tsx`.
- **Tugas Spesifik:**
  1. **Pesanan:** Membagi input menjadi 3 kartu bertahap, auto-fill PIC mitra, auto-calculate target kirim, validasi PO unik.
  2. **Produksi:** Pemilihan pesanan menggunakan kartu visual besar, input barang baik dan reject, peringatan over-production.
  3. **Pengiriman:** Menghitung sisa pesanan aktif, tombol cepat kirim semua barang siap, input nomor surat jalan manual dari dokumen fisik, penolakan tegas over-delivery.
- **Kriteria Verifikasi:** Operator dapat menyelesaikan pencatatan dalam waktu di bawah 60 detik per transaksi.

### FASE 5 — Implementasi Alur Verifikasi Supervisor & Audit Trail
- **Tujuan:** Menyediakan kontrol mutu pencatatan data operasional pabrik.
- **Berkas Terkait:** `components/screens/VerificationScreen.tsx`, `types/index.ts`, `lib/activity.ts`.
- **Tugas Spesifik:**
  1. Menambahkan status pemeriksaan: `menunggu_pemeriksaan`, `terverifikasi`, `perlu_diperbaiki`.
  2. Membangun form konfirmasi supervisor dengan catatan alasan penolakan/perbaikan wajib.
  3. Membangun modal koreksi data dengan pencatatan riwayat perubahan (*audit revision history*).
- **Kriteria Verifikasi:** Status pesanan dan status pemeriksaan terpisah secara independen; catatan revisi tersimpan rapi.

### FASE 6 — Restrukturisasi Dasbor Utama & Metrik Realisasi
- **Tujuan:** Memberikan pandangan helikopter (*helicopter view*) operasional bagi manajemen dan operator.
- **Berkas Terkait:** `components/screens/DashboardScreen.tsx`, `components/Navbar.tsx`.
- **Tugas Spesifik:**
  1. Mengedepankan 3 Kartu Aksi Utama berwarna biru brand solid dengan tombol "Mulai Input".
  2. Menyematkan 4 Kartu KPI Mandiri: Pesanan Aktif, Produksi Selesai, Total Terkirim, Perlu Perhatian.
  3. Menyediakan Kartu Progres Berjalan Rencana vs Realisasi dan Kartu Realisasi Periode (Hari ini, 7 hari, Bulan ini).
  4. Menyematkan kartu pengingat tindak lanjut supervisor.
- **Kriteria Verifikasi:** Dasbor merespons secara instan terhadap setiap transaksi baru tanpa perlu refresh manual.

### FASE 7 — Transparansi Panel AI & Batasan Integrasi INDIGO
- **Tujuan:** Menyajikan asisten AI yang jujur, tidak halusinasi, dan aman secara kepatuhan privasi data.
- **Berkas Terkait:** `components/BeeshaAIAssistant.tsx`, `app/api/gemini/route.ts`, `docs/INTEGRASI.md`.
- **Tugas Spesifik:**
  1. Menampilkan status koneksi jujur di panel AI (Hitungan Otomatis Lokal vs Gemini AI).
  2. Menolak pembocoran kredensial rahasia atau klaim koneksi langsung ke INDIGO ERP.
  3. Menyediakan tombol pintas pertanyaan cepat (*Quick Prompts*).
- **Kriteria Verifikasi:** Jika Gemini API key tidak terpasang, sistem memberikan jawaban analitik lokal yang akurat dan transparan.

### FASE 8 — Pengujian Kualitas Menyeluruh (Automated & Manual)
- **Tujuan:** Memvalidasi seluruh skenario pengujian bisnis (TEST-01 hingga TEST-16).
- **Berkas Terkait:** `utils/functional_e2e.test.ts`, `utils/operations.test.ts`, `utils/validation.test.ts`.
- **Tugas Spesifik:**
  1. Menulis automated test suite untuk 16 skenario pengujian fungsional kritis.
  2. Memverifikasi 0 kesalahan kompilasi tipe TypeScript (`npm run typecheck`).
  3. Memverifikasi keberhasilan build produksi Next.js 15 (`npm run build`).
- **Kriteria Verifikasi:** Seluruh unit & integration test lulus 100% (21/21 passed).

### FASE 9 — Dokumentasi Lengkap & Kesiapan Demonstrasi Bisnis
- **Tujuan:** Menyajikan laporan profesional bagi stakeholder dan panduan demonstrasi terarah.
- **Berkas Terkait:** Seluruh berkas di direktori `docs/` dan `README.md`.
- **Tugas Spesifik:**
  1. Menyusun dokumen perbandingan Sebelum-Sesudah (`docs/BEFORE_AFTER.md`).
  2. Menyusun skenario demo untuk Pak Yusuf (`docs/DEMO_SCRIPT.md`).
  3. Menyusun laporan pengujian kualitas (`docs/QA_REPORT.md`).
  4. Menyusun catatan perubahan sistem (`docs/CHANGELOG.md`).
- **Kriteria Verifikasi:** Semua dokumen tersusun rapi dalam bahasa Indonesia formal dan mudah dipahami manajemen.

---

## 4. Matriks Risiko & Rencana Kontinjensi

| Potensi Risiko | Dampak | Probabilitas | Rencana Mitigasi |
|---|---|---|---|
| Browser pengguna membersihkan cache/localStorage | Data prototipe kembali ke data default | Rendah | Sediakan tombol "Kembalikan Data Contoh" dan banner penjelasan bahwa data saat ini disimpan lokal di peramban. |
| Pengguna Generasi X kesulitan menggunakan navigasi | Kebingungan berpindah modul | Sedang | Sediakan tombol aksi besar langsung di beranda, header sticky dengan tombol "Menu" berlabel jelas, dan dialog konfirmasi keluar. |
| Kerusakan bundle kompilasi di server Vercel | Deployment gagal | Rendah | Build lokal diverifikasi dengan `npm run build` sebelum push; hindari dependensi native yang tidak portabel. |

---

## 5. Kesimpulan Eksekusi

Rencana eksekusi telah dijalankan secara berurutan dan disiplin. Seluruh sasaran teknis, aksesibilitas, dan integritas data manufaktur telah tercapai dengan hasil optimal.

