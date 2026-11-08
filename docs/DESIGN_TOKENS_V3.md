# SISTEM TOKEN DESAIN V3.0 — BEESHA PHM GROUP
## Palet Warna Semantik, Rasio Kontras & Panduan Aksesibilitas

**Standar Acuan:** WCAG 2.1 / 2.2 Level AA Compliance  
**Palet Resmi Perusahaan:** PT Putra Hatim Mandiri (PHM Group)  

---

## 1. Palet Warna Wajib & Token Semantik

Sistem token warna BEESHA menggunakan variabel CSS kanal RGB yang terintegrasi secara modular dengan Tailwind CSS.

### 1.1 Tabel Token Mode Terang (Light Mode)

| Peran Token | Variabel CSS | Nilai HEX / RGB | Kegunaan Utama | Rasio Kontras |
|---|---|---|---|---|
| **Latar Halaman** | `--c-canvas` | `#F2F4F7` (242 244 247) | Latar belakang utama aplikasi | Dasar |
| **Permukaan Kartu** | `--c-surface` | `#FFFFFF` (255 255 255) | Permukaan kartu informasi & form | 1.15:1 thd canvas |
| **Permukaan Sekunder**| `--c-subtle` | `#F8FAFC` (248 250 252) | Baris tabel genap, input disabled | Pembatas lembut |
| **Teks Utama** | `--c-ink` | `#1E293B` (30 41 59) | Judul, label, angka KPI, isi teks | **12.6:1** (WCAG AAA) |
| **Teks Sekunder** | `--c-muted` | `#526174` (82 97 116) | Deskripsi, petunjuk, metadata | **5.4:1** (WCAG AA) |
| **Aksen Primer** | `--c-navy` | `#1B365D` (27 54 93) | Navbar, tombol seleksi aktif | Kontras tinggi |
| **Aksen Interaktif** | `--c-brand` | `#0077C8` (0 119 200) | Tombol utama, tautan, fokus keyboard | **4.6:1** (WCAG AA) |
| **Kontainer Ikon** | `--c-brand-soft` | `#E8F2FA` (232 242 250) | Wadah ikon lembut (40–48px) | Lembut & bersih |
| **Batas Kartu** | `--c-line` | `#B9C6D6` (185 198 214) | Garis outline kartu bernuansa Navy | Jelas & terpisah |
| **Batas Input** | `--c-field` | `#94A3B8` (148 163 184) | Outline field formulir | **3.2:1** |

---

### 1.2 Tabel Token Mode Gelap (Dark Mode V3.0)

Dalam mode gelap, token disesuaikan secara khusus agar teks dan ikon tidak redup atau beradu gelap dengan permukaan:

| Peran Token | Variabel CSS | Nilai HEX / RGB | Penyesuaian V3.0 | Rasio Kontras |
|---|---|---|---|---|
| **Latar Halaman** | `--c-canvas` | `#0B111B` (11 17 27) | Night Deep Slate (ramah mata shift malam) | Dasar |
| **Permukaan Kartu** | `--c-surface` | `#172131` (23 33 49) | Permukaan kartu gelap elegan | 2.1:1 thd canvas |
| **Permukaan Sekunder**| `--c-subtle` | `#1D2940` (29 41 64) | Wadah metadata, kotak catatan | Kontras bertingkat |
| **Teks Utama** | `--c-ink` | `#F2F7FF` (242 247 255) | Teks putih-kebiruan terang | **15.2:1** (WCAG AAA) |
| **Teks Sekunder** | `--c-muted` | `#BDCCE0` (189 204 224) | Teks abu-abu kebiruan terang | **8.1:1** (WCAG AAA) |
| **Aksen Teks & Ikon** | `.text-navy` | `#8CCBFF` (140 203 255) | **Override adaptif cerah** untuk semua teks navy | **10.4:1** (WCAG AAA) |
| **Aksen Interaktif** | `--c-brand` | `#83C7FF` (131 199 255) | Tombol utama, fokus, hover link | **9.8:1** (WCAG AAA) |
| **Kontainer Ikon** | `--c-brand-soft` | `#263D5A` (38 61 90) | Wadah ikon kontras tinggi | Tegas & elegan |
| **Batas Kartu** | `--c-line` | `#4A719A` (74 113 154) | **Garis outline kartu biru-navy tegas** | Terlihat jelas |
| **Hover Kartu** | `--c-border-blue`| `#83C7FF` (131 199 255) | Pendar border interaktif saat hover | Responsif |

---

## 2. Standar Batas Kartu (Card Boundary Rules)

- **Light Mode:** Setiap kartu memiliki border 1px `rgb(185 198 214)` (#B9C6D6) yang merupakan turunan warna Navy resmi. Kartu tidak lagi menyatu dengan latar belakang `#F2F4F7`.
- **Dark Mode:** Setiap kartu memiliki border 1px `rgb(74 113 154)` (#4A719A). Memberikan pembatasan geometris yang tegas dan elegan di atas latar gelap.
- **Efek Hover:** Kartu interaktif mengalami translasi halus `translateY(-3px)`, bayangan elevasi `0 12px 28px -6px rgba(...)`, dan aksen warna border beralih ke Bright Blue.

---

## 3. Standar Ikon & Kontainer

- Semua ikon fungsional SVG berukuran 20–24px berada di dalam kontainer berukuran 40–44px (atau 48px untuk aksi utama).
- Menggunakan `currentColor` sehingga secara otomatis mewarisi warna semantik dari token teks terkait.
- Dilarang keras menempatkan ikon hitam di atas latar belakang gelap.
