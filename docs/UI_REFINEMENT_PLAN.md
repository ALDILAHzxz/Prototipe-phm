# Rencana Penyempurnaan Antarmuka v2.0 (UI Refinement Plan v2.0)
## Proyek: BEESHA — Sistem Informasi Operasional PT Putra Hatim Mandiri (PHM Group)

- **Target Rilis:** Rilis Penyempurnaan Visual & Interaksi Tingkat Enterprise
- **Penanggung Jawab:** Principal Frontend Architect & Senior UI/UX Designer
- **Dasar Perencanaan:** Analisis 13 Tangkapan Layar & Arahan Stakeholder Pak Yusuf

---

## 1. Sasaran Utama Rencana Penyempurnaan

1. **Peningkatan Kualitas Visual Tanpa Menjadi Berlebihan:** Menghadirkan kesan perangkat lunak manufaktur enterprise modern yang rapi, percaya diri, dan bersih melalui hierarki warna, kedalaman bayangan, dan pelapisan permukaan (*surface layering*).
2. **Sistem Mikro-Animasi Profesional:** Menambahkan efek hover kursor halus (translasi 3–4 px, scale 1.006, bayangan halus, dan pergeseran ikon arah) tanpa gerakan berlebihan yang mengalihkan perhatian kerja operasional.
3. **Kartu Interaktif Penuh (Full-Card Clickability):** Memastikan seluruh kartu informasi penting dapat diklik di seluruh area permukaannya, menggantikan ketergantungan pada tautan teks kecil.
4. **Penghapusan Tautan Teks Bergaris Bawah pada Kontrol Aksi:** Mengganti aksi seperti "Ganti", "Periksa data", "Lihat catatan", "Inspeksi 3D", dan "Panduan tampilan" menjadi komponen tombol nyata (`Button sm/md`).
5. **Eliminasi Struktural Ruang Kosong di Dasbor:** Menyeimbangkan tata letak dasbor bawah sehingga kolom kiri dan kanan berimbang secara visual dan proporsional.
6. **Standarisasi Panel Samping Sticky pada Formulir Operasional:** Menerapkan perilaku sticky pada desktop (`top-[calc(var(--navbar-height)+24px)]`) dan akordeon ringkas pada ponsel di ketiga formulir (Pesanan, Produksi, Pengiriman).
7. **Perluasan Ruang Baca Drawer Beesha AI:** Menyediakan fitur ciut/bentang (*collapsible*) pada rekomendasi pertanyaan cepat agar area membaca jawaban menjadi maksimal.
8. **Pengalaman Seluler yang Terencana:** Menata ulang komposisi kartu dan tombol di layar ponsel agar tidak menjadi satu kolom vertikal raksasa yang membosankan.

---

## 2. Rencana Tindakan Terperinci per Halaman & Komponen

```
┌─────────────────────────────────────────────────────────────┐
│ 1. SISTEM DESAIN & TOKEN CSS                                │
│    - Tambah token permukaan: Surface Blue Light & Soft      │
│    - Kelas utilitas .interactive-card & .interactive-button │
│    - Standarisasi ukuran Button sm (40px), md (46px), lg(52)│
├─────────────────────────────────────────────────────────────┤
│ 2. DASBOR OPERASIONAL (HERO, KPI, PROGRES, STATUS)          │
│    - 3 Kartu Aksi Biru Solid: ikon wadah, chevron gerak     │
│    - 4 Kartu KPI: tombol interaktif dengan navigasi rute    │
│    - 3 Kartu Tindak Lanjut: full-card click, badge status   │
│    - Eliminasi Ruang Kosong: Grid 12 kolom + Kartu 3D Part  │
│    - Linimasa Catatan Aktivitas Terbaru selebar halaman     │
├─────────────────────────────────────────────────────────────┤
│ 3. MODUL FORMULIR OPERASIONAL (PESANAN, PRODUKSI, KIRIM)    │
│    - NewOrderForm: Sticky petunjuk + akordeon seluler       │
│    - ProductionForm: Sticky riwayat + OrderPicker interaktif│
│    - DeliveryForm: Sticky riwayat kirim + cek stok siap     │
│    - StaffNotice: Tombol sekunder "Ganti Petugas" + ikon    │
├─────────────────────────────────────────────────────────────┤
│ 4. MODUL PEMERIKSAAN & PERINGATAN                           │
│    - VerificationScreen: Kuantitas 28-32px tebal, grid data │
│    - AlertCenterScreen: Garis aksen semantik kiri border-l-4│
├─────────────────────────────────────────────────────────────┤
│ 5. DRAWER ASISTEN BEESHA AI                                 │
│    - Pertanyaan Cepat dengan tombol Sembunyikan/Tampilkan   │
│    - Otomatis menciut saat pertanyaan dikirim               │
│    - Balon obrolan teks 16px, line-height 1.55, lebar 480px │
├─────────────────────────────────────────────────────────────┤
│ 6. FOOTER & FITUR 3D PART                                   │
│    - Kartu Fitur Inspeksi 3D Part Dark Navy di Dasbor       │
│    - Footer 3-zona rapi dengan tombol nyata                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Matriks Komponen & Berkas yang Disempurnakan

| Modul / Komponen | Berkas Sumber | Perubahan Utama yang Dilakukan |
|---|---|---|
| **Token & Animasi Global** | `app/globals.css`, `tailwind.config.ts` | Variabel CSS permukaan biru muda, utilitas `.interactive-card`, `.interactive-button`, variabel sticky layout, dukungan prefers-reduced-motion. |
| **Komponen Tombol Atomik** | `components/ui/Button.tsx` | Penambahan varian ukuran `sm` (40 px), mikro-transisi hover/active scale 0.985, penyempurnaan bayangan. |
| **Komponen Tata Letak** | `components/ui/Layout.tsx` | Penyempurnaan `PageHeader` (tombol kembali berbasis tombol nyata), `ProgressBar` (tinggi 14 px, rounded-full, transisi animasi halus), `FilterChips` (umpan balik sentuh). |
| **Dasbor Utama** | `components/screens/DashboardScreen.tsx` | Refactor kartu aksi utama, KPI interaktif, restrukturisasi grid bawah (mengeliminasi ruang kosong), kartu fitur 3D part navy, dan seksi linimasa aktivitas penuh. |
| **Formulir Pesanan Baru** | `components/screens/NewOrderForm.tsx` | Panel panduan sticky di desktop, akordeon panduan di ponsel, integrasi tombol "Ganti Petugas". |
| **Formulir Hasil Produksi** | `components/screens/ProductionForm.tsx` | Panel riwayat produksi sticky di desktop, akordeon di ponsel, kartu seleksi pesanan interaktif. |
| **Formulir Pengiriman** | `components/screens/DeliveryForm.tsx` | Panel riwayat surat jalan sticky di desktop, akordeon di ponsel, seleksi pesanan siap kirim. |
| **Komponen Pemilih Pesanan** | `components/OrderPicker.tsx` | Mikro-interaksi pada kartu pilihan pesanan, tombol sekunder "Tampilkan semua pesanan". |
| **Identitas Petugas Form** | `components/screens/shared.tsx` | Mengganti tautan teks "Ganti" menjadi tombol sekunder nyata "Ganti Petugas" berikon pengguna. |
| **Daftar Pesanan Mitra** | `components/screens/OrderListScreen.tsx` | Penyorotan baris hover tabel, tombol `Detail` sekunder, penataan kartu seluler 3 kolom data. |
| **Riwayat Aktivitas** | `components/screens/ActivityHistoryScreen.tsx` | Wadah ikon 44 px beraksen warna semantik per jenis kejadian, header tanggal jelas dengan badge hitungan. |
| **Pusat Peringatan** | `components/screens/AlertCenterScreen.tsx` | Garis aksen semantik kiri (`border-l-4`), kotak langkah disarankan, tombol "Buka Detail Pesanan" penuh. |
| **Pemeriksaan Supervisor** | `components/screens/VerificationScreen.tsx` | Tipografi angka kuantitas 28–32 px tabular-nums, penataan grid metadata terstruktur 3 kolom. |
| **Drawer Asisten AI** | `components/BeeshaAIAssistant.tsx` | Rekomendasi pertanyaan cepat yang dapat diciutkan/dibentangkan, auto-collapse saat kirim pesan, tipografi 16 px, drawer 480 px. |
| **Kaki Halaman (Footer)** | `app/page.tsx` | Struktur 3 zona rapi dengan tombol kontrol nyata untuk Viewer 3D dan Panduan Desain. |

---

## 4. Kriteria Verifikasi Mutu (Quality Acceptance Criteria)

- Seluruh 27 unit test fungsional dan UI interaction lulus 100% (`npm test`).
- Pemeriksaan tipe ketat TypeScript 0 error (`npm run typecheck`).
- Build produksi Next.js 15 berhasil tanpa kegagalan prerendering (`npm run build`).
- Tidak ada teks yang terpotong atau overflow horizontal pada resolusi 360 px, 390 px, 820 px, dan 1440 px.

