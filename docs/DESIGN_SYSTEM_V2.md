# Panduan Sistem Desain v2.0 (Design System v2.0)
## BEESHA — Sistem Informasi Operasional PT Putra Hatim Mandiri (PHM Group)

- **Versi Sistem:** 2.0 (Enterprise Refinement)
- **Karakter Desain:** Profesional, Modern, Terpercaya, Industrial, Terstruktur, Aksesibel, Efisien untuk Manufaktur.

---

## 1. Fondasi Warna Korporat (Corporate Color Palette)

Sistem menggunakan palet korporat resmi PHM Group yang non-negotiable, diperkaya dengan token permukaan penunjang untuk menciptakan pelapisan visual (*surface layering*) yang elegan.

### 1.1 Palet Utama (Core Brand Palette)

| Peran Token | Nama Warna | Nilai HEX | Nilai Kanal RGB | Penerapan pada Sistem |
|---|---|---|---|---|
| **Primary** | Navy Blue | `#1B365D` | `27 54 93` | Header navigasi, judul utama, kartu fitur 3D, struktur tingkat tinggi. |
| **Secondary** | Bright Blue | `#0077C8` | `0 119 200` | Tombol aksi utama, tautan aktif, indikator progres produksi, fokus keyboard. |
| **Background** | Soft Silver | `#F2F4F7` | `242 244 247` | Kanvas latar belakang seluruh halaman aplikasi. |
| **Main Text** | Dark Charcoal | `#1E293B` | `30 41 59` | Teks utama bodi, isi formulir, label, dan data tabel (kontras 12.6:1). |

### 1.2 Token Permukaan & Batas Penunjang (Supporting Tokens)

| Peran Token | Nilai HEX | Nilai Kanal RGB | Penerapan pada Sistem |
|---|---|---|---|
| **Surface Primary** | `#FFFFFF` | `255 255 255` | Latar kartu utama, dialog modal, panel input formulir. |
| **Surface Secondary** | `#F8FAFC` | `248 250 252` | Latar belakang tabel, header seksi data, kotak informasi sekunder. |
| **Surface Blue Light** | `#EEF5FD` | `238 245 253` | Latar kartu pesanan terpilih, badge sorotan, callout info. |
| **Surface Blue Soft** | `#E5F1FB` | `229 241 251` | Latar panel petunjuk formulir, aksen hover elemen interaktif. |
| **Border Neutral** | `#D9E0E8` | `217 224 232` | Garis pemisah standar antar-elemen dan batas kartu default. |
| **Border Blue Soft** | `#BDD6ED` | `189 214 237` | Garis aksen kartu aktif, border hover kartu interaktif. |
| **Muted Text** | `#4A586A` | `74 88 106` | Keterangan sekunder, metadata tanggal, satuan unit (kontras ≥ 6:1). |

### 1.3 Warna Semantik Fungsional (Semantic Colors)

| Arti Semantik | Warna Utama (HEX) | Warna Latar Lembut (HEX) | Penerapan |
|---|---|---|---|
| **Success** | `#18794E` | `#E8F5EE` | Status pesanan selesai, terkirim, kartu terverifikasi supervisor. |
| **Warning** | `#B54708` | `#FEF4E6` | Peringatan over-production, catatan perlu pemeriksaan, tenggat dekat. |
| **Danger** | `#B42318` | `#FEF0EF` | Pesanan terlambat (*overdue*), penolakan over-delivery, tombol hapus. |
| **Info** | `#0B63A8` | `#EAF3FB` | Status proses berjalan, catatan petunjuk operasional. |

---

## 2. Skala Tipografi (Typography Scale)

Menggunakan keluarga huruf **Inter** (sans-serif modern) dengan line-height yang lapang (1.45–1.60) untuk menjamin keterbacaan tinggi bagi pengguna Generasi X.

| Peran Elemen | Ukuran Desktop | Ukuran Tablet | Ukuran Seluler | Ketebalan (Weight) | Karakteristik |
|---|---|---|---|---|---|
| **Judul Halaman Utama** | 32 px | 28 px | 26 px | 700 (Bold) | `tracking-tight`, warna `#1E293B` |
| **Judul Seksi Utama** | 22–24 px | 20–22 px | 20 px | 700 (Bold) | `leading-snug`, warna `#1B365D` |
| **Judul Kartu** | 20 px | 18 px | 18 px | 600–700 | Warna `#1E293B` |
| **Teks Angka KPI** | 36 px | 32 px | 28 px | 700 (Bold) | `tabular-nums`, angka tidak goyang |
| **Kuantitas Besar** | 28–30 px | 24 px | 22 px | 700 (Bold) | `tabular-nums` |
| **Teks Bodi Formulir** | 16–17 px | 16 px | 16 px | 400–500 | `leading-relaxed` |
| **Label Formulir** | 16 px | 16 px | 16 px | 600 (Semibold) | Terhubung atribut `htmlFor` |
| **Teks Tombol Aksi** | 15–16 px | 15–16 px | 15–16 px | 600 (Semibold) | Rata tengah, ikon pendukung |
| **Informasi Sekunder** | 14–15 px | 14–15 px | 14 px | 400 (Regular) | Warna `#4A586A` |
| **Status Badge** | 13–14 px | 13–14 px | 13 px | 600 (Semibold) | Padding `px-2.5 py-1`, rounded |

---

## 3. Sistem Spasi & Dimensi Komponen (4-Point Spacing System)

Skala spasi baku: `4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64 px`.

| Komponen | Target Dimensi | Karakteristik Ergonomis |
|---|---|---|
| **Header Aplikasi (Desktop)** | `h-[72px]` | Sticky, kontainer tengah `max-w-[1360px]`, z-index 40. |
| **Header Aplikasi (Mobile)** | `h-[64px]` | Sticky, tombol menu hamburger 48 px. |
| **Input Formulir** | `min-h-[56px]` | Tinggi 56 px memudahkan seleksi sentuh, border 1.5 px. |
| **Input Pencarian** | `min-h-[52px]` | Dilengkapi ikon pencarian di sisi kiri dengan padding dalam. |
| **Tombol Utama (Large)** | `min-h-[52px]` | Padding `px-6`, teks 16–17 px bold. |
| **Tombol Sedang (Medium)** | `min-h-[46px]` | Padding `px-4`, teks 15–16 px semibold. |
| **Tombol Kompak (Small)** | `min-h-[40px]` | Padding `px-3.5`, teks 14–15 px semibold untuk aksi tabel/footer. |
| **Radius Kartu (Border Radius)** | `12–14 px` | `rounded-card`, memberi kesan modern dan ramah. |
| **Radius Kolom Input** | `10 px` | `rounded-field`, tegas dan rapi. |

---

## 4. Hierarki Komponen Tombol (Button Hierarchy)

```
┌───────────────────────────────┐
│ TOMBOL UTAMA (Primary)        │  Warna Brand Blue (#0077C8), teks putih, bayangan halus.
├───────────────────────────────┤
│ TOMBOL SEKUNDER (Secondary)   │  Warna Putih (#FFFFFF), border netral, teks Navy (#1B365D).
├───────────────────────────────┤
│ TOMBOL KOMPAK (Small)         │  Tinggi 40 px, border halus, teks jelas (contoh: "Ganti Petugas").
├───────────────────────────────┤
│ TOMBOL HENING (Quiet)         │  Latar transparan, teks Brand Blue, hover latar biru muda.
├───────────────────────────────┤
│ TOMBOL BAHAYA (Danger)        │  Latar Danger (#B42318), teks putih, konfirmasi dialog.
└───────────────────────────────┘
```

Setiap tombol memiliki mikro-interaksi:
- **Hover:** Peningkatan bayangan halus dan translasi vertikal `-1.5px`.
- **Active / Press:** Skala `0.985` memberikan umpan balik mekanis yang tegas.
- **Focus:** Outline 3 px berwarna `#0077C8` dengan offset 2 px.

---

## 5. Sistem Mikro-Animasi & Interaksi Kartu (Micro-Interactions)

### 5.1 Kartu Interaktif (`.interactive-card`)
Diterapkan pada kartu yang memiliki aksi klik (Aksi Utama Dasbor, Kartu KPI, Kartu Pilihan Pesanan, Kartu Peringatan):
```css
.interactive-card {
  transition: transform 200ms cubic-bezier(0.2, 0.8, 0.2, 1),
              box-shadow 200ms ease,
              border-color 180ms ease,
              background-color 180ms ease;
}

@media (hover: hover) and (pointer: fine) {
  .interactive-card:hover {
    transform: translateY(-3px) scale(1.006);
    border-color: #BDD6ED;
    box-shadow: 0 12px 28px -6px rgba(27, 54, 93, 0.12);
  }
}

.interactive-card:active {
  transform: scale(0.99);
}
```

### 5.2 Keamanan Gerak (`prefers-reduced-motion`)
Bagi pengguna yang mengaktifkan preferensi pengurangan gerak pada sistem operasi mereka, seluruh translasi dan skala otomatis dinonaktifkan (`transform: none !important`), memastikan kepatuhan aksesibilitas penuh.

---

## 6. Panel Samping Sticky pada Formulir Operasional (Sticky Sidebars)

Pada layar desktop (≥1024 px), panel panduan dan riwayat samping menerapkan posisi sticky terstandarisasi:
```css
.form-sticky-panel {
  position: sticky;
  top: calc(var(--navbar-height, 72px) + var(--sidebar-sticky-gap, 24px));
  align-self: start;
}
```
Pada layar seluler (<1024 px), posisi sticky dinonaktifkan dan panel berubah menjadi tombol akordeon yang dapat dibuka/tutup secara ringkas agar tidak mendominasi panjang halaman.

---

## 7. Standar Aksesibilitas WCAG 2.1 AA / AAA

- **Rasio Kontras:** Teks utama `#1E293B` di atas putih `#FFFFFF` mencapai **12.6:1** (standar AAA 7:1).
- **Target Sentuh:** Seluruh target interaktif utama berukuran minimal 48–56 px.
- **Dukungan Keyboard:** Navigasi penuh melalui tombol `Tab`, `Enter`, `Space`, dan `Escape` untuk menutup drawer/modal.
- **Pelindung Kehilangan Data:** Form guard aktif mencegah navigasi tidak sengaja yang membuang isian.

