# LAPORAN DISTRIBUSI & DEPLOYMENT PRODUKSI V4.0
## BEESHA — Sistem Informasi Operasional PT Putra Hatim Mandiri (PHM Group)
**Dokumen:** `docs/DEPLOYMENT_REPORT_V4.md`  
**Tanggal:** 8 November 2026  
**Status Rilis:** Production Verified & Live  

---

## 1. Identitas Repositori & Cabang Git

- **URL Repositori GitHub:** `https://github.com/ALDILAHzxz/Prototipe-phm.git`
- **Cabang Aktif:** `main`
- **Pesan Komit:** `feat(v4): refine mobile navbar, unified profile, persistent AI FAB, and balanced filters`
- **Integritas Cabang:** Bebas konflik, branch `main` sinkron dengan remote origin.

---

## 2. Parameter Deployment Vercel

- **URL Produksi Resmi:** `https://phmprototype.vercel.app/`
- **Domain Alias:** `phmprototype.vercel.app`
- **Framework Preset:** Next.js (App Router v15.5.29)
- **Target Deployment:** Production
- **Status Kesiapan:** `READY` (HTTP 200 OK)
- **Cakupan Pengujian:** Static generation 5/5 halaman selesai tanpa kegagalan (`✓ Generating static pages (5/5)`).

---

## 3. Hasil Verifikasi Smoke-Test (Live Testing)

1. **Aksesibilitas Domain (HTTP Status):**
   - Menjalankan uji `curl.exe -I https://phmprototype.vercel.app`:
     - Respon: `HTTP/1.1 200 OK`
     - Server: `Vercel`
     - Content-Type: `text/html; charset=utf-8`
     - Status: Live & melayani pengguna secara global.
2. **Pengujian Fungsionalitas Inti:**
   - **Navbar Responsif:** Di desktop menampilkan logo BEESHA dan nama profil; di mobile menampilkan judul kontekstual dinamis dan hamburger tanpa teks "Menu".
   - **Profil Terpadu:** Membuka modal profil lengkap dengan 3 tab (Data Diri, Ganti Petugas, Keamanan Akun).
   - **FAB Beesha AI:** Melayang persisten di kanan bawah ponsel pada semua rute dan membuka drawer percakapan AI tanpa merusak konteks layar.
   - **Filter Pemeriksaan Data:** Heading "STATUS PEMERIKSAAN" kini terpusat simetris dengan "JENIS CATATAN".
   - **Filter Pesanan Mitra:** Filter 6 status tertata rapi dalam grid seimbang di desktop dan tombol selektor modal di mobile.
   - **Padding Kartu:** Tidak ada teks nama mitra atau status yang menabrak batas kartu pada layar beresolusi 320px–430px.
   - **Mode Gelap / Terang:** Beralih mulus dengan animasi ikon matahari/bulan dan kontras tinggi.

---

## 4. Batasan Teknis & Keamanan (Known Limitations)

1. **Batasan Sistem INDIGO (Perintah Stakeholder Pak Yusuf):**
   - Aplikasi adalah prototipe operasional interaktif.
   - Data transaksi tersimpan secara lokal di peramban (`localStorage`).
   - Tidak ada koneksi tanpa izin ke basis data rahasia ERP INDIGO.
2. **Batasan Keamanan Akun:**
   - Fitur pemulihan dengan biometrik passkey disajikan sebagai alur antarmuka kerja dan secara jujur menyatakan kebutuhan backend autentikasi WebAuthn / SSO korporat. Tidak menggunakan validasi biometrik palsu.
