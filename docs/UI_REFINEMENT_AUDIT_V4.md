# AUDIT PENYEMPURNAAN UI/UX & KONSISTENSI RESPONSIF V4.0
## BEESHA — Sistem Informasi Operasional PT Putra Hatim Mandiri (PHM Group)
**Dokumen:** `docs/UI_REFINEMENT_AUDIT_V4.md`  
**Tanggal:** 8 November 2026  
**Status:** Baseline Audit Selesai — Memulai Tahap Implementasi  

---

## 1. Pemetaan Masalah Awal Berdasarkan Screenshot & Masukan Pengguna

| Referensi | Layar / Komponen | Masalah Teramati di V3.0 | Akar Masalah Teknis | Solusi Rekayasa V4.0 |
|---|---|---|---|---|
| **Screenshot 1** | **Pemeriksaan Data** (`VerificationScreen.tsx`) | Heading "STATUS PEMERIKSAAN" rata kiri, tidak simetris dengan "JENIS CATATAN" yang terpusat. | Kelas CSS heading status menggunakan rata kiri bawaan (`text-left`), sedangkan heading jenis catatan menggunakan `text-center`. | Samakan tata letak kedua heading menjadi terpusat (`text-center uppercase tracking-wider`), pertahankan grid 4 tombol seimbang di desktop dan 2 pemilih modal di mobile. |
| **Screenshot 2** | **Mobile Pemesanan Mitra** (`OrderListScreen.tsx`) | Filter chip status pesanan membungkus secara tidak beraturan (*ragged flex-wrap*), memakan ruang vertikal dan tidak teratur. | Menggunakan `flex flex-wrap gap-2` langsung di mobile tanpa batasan grid atau selektor adaptif. | Buat pemilih status kompak di mobile: Tombol selektor tunggal `Status Pesanan: [Pilihan Aktif (Jml)] ▾` dengan *bottom-sheet modal* pemilihan status sentuh-ramah (≥48px); di desktop gunakan grid seimbang. |
| **Screenshot 3** | **Mobile Order Cards** (`OrderListScreen.tsx`) | Padding tepi kartu pada ponsel terlalu tipis, nama mitra, label barang, dan metrik pesanan terlalu mepet dengan garis tepi kartu. | Padding kartu mobile `p-3.5` atau `p-4` dengan elemen anak tanpa `min-w-0` dan grid metrik terlalu padat. | Tingkatkan padding kartu mobile menjadi `p-4.5 sm:p-5`, pastikan `min-width: 0`, bungkus teks alami (*natural word-break*), dan susun panel metrik bawah dengan margin dalam yang cukup (`p-3`). |
| **Screenshot 4** | **Mobile Dashboard & Navbar** (`Navbar.tsx`, `DashboardScreen.tsx`) | Navbar mobile terlalu padat (teks "Menu", logo B, teks BEESHA, subtitle PHM bertumpuk); judul halaman "Ringkasan Operasional" berulang di navbar dan konten; badge "Data Simulasi" terlalu menonjol. | Struktur navbar desktop dipaksakan ke mobile; judul halaman mobile tidak dinamis mengikuti rute; badge simulasi diletakkan di samping `h1`. | Sederhanakan navbar mobile: Hamburger (tanpa teks "Menu") di kiri, Judul halaman rute aktif di tengah (`Ringkasan Operasional`), Tombol Tema & Profil di kanan. Ubah heading mobile dashboard menjadi **Beesha**. Hapus badge "Data Simulasi" dari heading dan letakkan transparansi demo di footer/profil. |
| **Screenshot 5** | **Desktop Dashboard & Interaksi** (`DashboardScreen.tsx`) | Kartu dan tombol aksi perlu mikro-interaksi yang lebih hidup (hover, active, focus state) tanpa mengubah identitas korporat PHM. | Efek hover kartu masih sederhana; fokus keyboard perlu dipertegas; konsolidasi petugas perlu digabung ke Profil terpadu. | Tambahkan translasi elevasi halus (`translate-y-[-2px]`), pembesaran proporsional (`scale-[1.008]`), penegasan border brand, dan kilau ikon lembut. Satukan pergantian petugas ke drawer Profil Pengguna. |

---

## 2. Analisis Arsitektur Profil Pengguna & Keamanan
1. **Pemisahan Identitas Demo vs Otentikasi Sejati:**
   - Aplikasi saat ini adalah prototipe operasional lokal (*client-side prototype*).
   - Tombol "Pilih nama petugas" lama hanya menentukan string `recorded_by` pada data baru di `localStorage`.
   - **Solusi V4.0:** Buat komponen `UserProfileModal` terpadu yang menggabungkan:
     - **Seksi Identitas:** Foto/Inisial, Nama Lengkap, NIK/Kode Petugas, Departemen, Jabatan, Shift Kerja, Status Sesi.
     - **Seksi Kontak:** Email perusahaan, No. Telepon, Lokasi Pabrik.
     - **Seksi Preferensi:** Mode Terang/Gelap, Bahasa (ID), Kontras Tinggi.
     - **Seksi Keamanan Akun:** Opsi Ubah Kata Sandi, Lupa Kata Sandi, dan Biometrik/Passkey dengan transparansi penuh: *"Fitur keamanan akun memerlukan integrasi autentikasi SSO/LDAP perusahaan."* (Tidak membuat validasi biometrik palsu/bodong).
     - **Seksi Pergantian Petugas:** Fitur ganti petugas dipindahkan ke dalam profil dengan daftar petugas yang jelas.
     - **Seksi Sesi:** Tombol "Akhiri Sesi Demo" dengan konfirmasi dialog untuk mereset petugas aktif tanpa menghapus catatan yang sudah dibuat.

---

## 3. Persistent Beesha AI Floating Action Button (FAB) di Mobile
1. Pada desktop, tombol **Tanya Beesha** tetap berada di navbar atas.
2. Pada mobile, tombol teks panjang di navbar dihilangkan untuk memberi ruang bagi judul halaman dan tombol profil.
3. Sebagai gantinya, dihadirkan **Floating Action Button (FAB)** mengambang di pojok kanan bawah (`bottom-6 right-6`), konsisten di seluruh rute (Beranda, Pesanan, Produksi, Pengiriman, Pemeriksaan, Riwayat, Peringatan, Detail).
4. FAB membuka drawer AI yang sudah ada tanpa menduplikasi logika kecerdasan buatan.

---

## 4. Kepatuhan Aksesibilitas WCAG 2.2 AA & Batasan Responsif
- Target sentuh minimal: 44–48 px pada seluruh tombol kontrol mobile.
- Kontras warna teks: minimal 4.5:1 untuk teks normal, 3:1 untuk teks besar dan komponen grafis.
- Mendukung `prefers-reduced-motion: reduce` untuk menonaktifkan translasi/animasi bagi pengguna yang sensitif terhadap gerakan.

