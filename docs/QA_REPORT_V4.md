# LAPORAN PENJAMINAN MUTU PERANGKAT LUNAK (QA REPORT V4.0)
## BEESHA — Sistem Informasi Operasional PT Putra Hatim Mandiri (PHM Group)
**Dokumen:** `docs/QA_REPORT_V4.md`  
**Tanggal:** 8 November 2026  
**Total Pengujian:** 37 Uji Otomatis (37 Pass, 0 Fail, 0 Skip)  

---

## 1. Hasil Pengujian Matriks Utama (Test Matrix V4.0)

| ID Pengujian | Skenario Pengujian | Hasil yang Diharapkan | Hasil Pengujian Aktual | Status |
|---|---|---|---|---|
| **NAV-01** | Buka website di layar desktop (≥1024px) | Struktur navbar desktop asli dipertahankan (Menu, Logo B, BEESHA, Profil, Tanya Beesha). | Struktur desktop utuh dan sticky saat digulir. | **PASS** |
| **NAV-02** | Buka homepage di ponsel (<768px) | Navbar ringkas kontekstual muncul (Hamburger, Judul rute, Tema, Profil). | Navbar lapang, tidak ada penumpukan teks Menu & Logo B. | **PASS** |
| **NAV-03** | Pindah rute di ponsel (Pesanan, Produksi, dll) | Judul pada navbar mobile otomatis berubah sesuai rute aktif. | `getScreenTitle` memperbarui teks judul seketika. | **PASS** |
| **NAV-04** | Buka menu hamburger | Drawer navigasi samping terbuka mulus dengan fokus otomatis. | Drawer terbuka, fokus pada tombol tutup, Esc menutup drawer. | **PASS** |
| **NAV-05** | Gulir halaman panjang | Navbar tetap sticky di atas tanpa layout shift atau menutupi form. | Sticky top-0 z-40 berjalan sempurna. | **PASS** |
| **PROF-01** | Buka tombol profil di navbar/drawer | Modal profil pengguna terpadu terbuka (`UserProfileModal`). | Modal terbuka dengan tab Data Diri, Ganti Petugas, Keamanan. | **PASS** |
| **PROF-02** | Pilih petugas kerja operasional | Petugas aktif diperbarui dan tersimpan di `localStorage`. | State petugas aktif sinkron seketika ke form & receipt. | **PASS** |
| **PROF-03** | Lihat data identitas pegawai | Inisial, NIK, Departemen, Shift, dan Kontak operasional tampil rapi. | Data tersaji terstruktur tanpa fabrikasi kredensial privat. | **PASS** |
| **PROF-04** | Buka pengaturan keamanan & biometrik | Informasi jujur bahwa integrasi autentikasi SSO/WebAuthn diperlukan. | Tampil banner jujur tanpa biometrik palsu. | **PASS** |
| **PROF-05** | Klik "Akhiri Sesi Demo" | Konfirmasi dialog muncul, mereset sesi tanpa menghapus data catatan. | Sesi ter-reset, catatan operasional tetap aman. | **PASS** |
| **AI-01** | Buka halaman apa pun di ponsel | Floating Action Button (FAB) Tanya Beesha terlihat di pojok kanan bawah. | FAB mengambang di `bottom-6 right-5` dengan ikon chat bercahaya. | **PASS** |
| **AI-02** | Gulir layar pada ponsel | FAB Beesha tetap melayang (*fixed*) di viewport peramban. | FAB persisten dan stabil selama scrolling. | **PASS** |
| **AI-03** | Pindah ke halaman form / riwayat | FAB tetap ada di seluruh rute aplikasi tanpa duplikasi instance. | FAB terpasang pada shared application layout. | **PASS** |
| **AI-04** | Ketuk tombol FAB Beesha | Drawer asisten cerdas Beesha AI terbuka; FAB otomatis tersembunyi. | Drawer AI terbuka normal, riwayat percakapan utuh. | **PASS** |
| **AI-05** | Isi form input pada ponsel | FAB tidak menutupi tombol simpan atau kontrol penting form. | Margin safe area dan z-index terkontrol dengan baik. | **PASS** |
| **DASH-01** | Buka dashboard di desktop | Heading tetap "Ringkasan Operasional". | Heading desktop tampil: "Ringkasan Operasional". | **PASS** |
| **DASH-02** | Buka dashboard di ponsel | Heading utama menjadi "Beesha" agar tidak redundant dengan navbar. | Heading mobile tampil: "Beesha". | **PASS** |
| **DASH-03** | Periksa heading dashboard | Badge menonjol "Data Simulasi" telah dihapus dari sebelah heading. | Heading bersih, transparansi demo dipusatkan di footer & profil. | **PASS** |
| **EXAM-01** | Buka Pemeriksaan Data di desktop | Heading "STATUS PEMERIKSAAN" berada di tengah (centered). | `text-center uppercase tracking-wider` simetris dengan Jenis Catatan. | **PASS** |
| **EXAM-02** | Periksa baris 1 filter pemeriksaan | 4 tombol status tersusun penuh seimbang dalam grid 4 kolom. | `grid grid-cols-4 gap-3 w-full` terpasang rapi. | **PASS** |
| **EXAM-03** | Periksa baris 2 filter pemeriksaan | 3 tombol jenis catatan terpusat di tengah dengan batasan lebar. | `grid grid-cols-3 max-w-2xl mx-auto gap-3` terpasang rapi. | **PASS** |
| **EXAM-04** | Buka Pemeriksaan Data di ponsel | 2 pemilih utama berdampingan membuka modal bottom sheet sentuh-ramah. | Selektor Status dan Jenis berfungsi sempurna. | **PASS** |
| **ORDER-01** | Buka Pesanan Mitra di desktop | Filter 6 status tersusun dalam grid seimbang (bukan wrap acak). | `grid-cols-3 lg:grid-cols-6 gap-2.5` berderet rapi. | **PASS** |
| **ORDER-02** | Buka Pesanan Mitra di ponsel | Selektor filter status kompak `Status Pesanan: [Pilihan Aktif] ▾`. | Selektor rapi dengan modal sheet pilihan lengkap. | **PASS** |
| **ORDER-03** | Cari pesanan dan saring status bersamaan | Hasil menyaring berdasarkan kata kunci dan status secara akurat. | Pesanan terfilter tepat, ringkasan menampilkan jumlah valid. | **PASS** |
| **CARD-01** | Periksa kartu pesanan mobile | Padding dalam kartu luas (`p-5 sm:p-6`), teks tidak menabrak border. | Jarak batas kartu nyaman dan tidak ada teks menabrak. | **PASS** |
| **CARD-02** | Pesanan dengan nama mitra panjang | Teks nama mitra dan kode barang membungkus alami (*break-words*). | Tidak ada teks terpotong atau overflow horizontal. | **PASS** |
| **CARD-03** | Arahkan kursor ke kartu interaktif (hover) | Kartu terangkat halus (`translate-y-[-2px]`), border brand menegaskan. | Mikro-interaksi smooth dengan transisi 180ms. | **PASS** |
| **CARD-04** | Tekan/klik kartu interaktif | Kartu memberikan respon skala aktif (`scale-[0.99]`). | Respon sentuh instan terasa taktil dan hidup. | **PASS** |
| **CARD-05** | Navigasi kartu via tombol Tab keyboard | Outline fokus kontras tinggi muncul mengelilingi kartu. | Focus ring 3px brand color terlihat jelas. | **PASS** |
| **THEME-01** | Uji Mode Terang (Light Mode) | Latar belakang soft silver `#F2F4F7`, kartu putih `#FFFFFF`, teks `#1E293B`. | Keterbacaan jernih dan kontras tinggi. | **PASS** |
| **THEME-02** | Uji Mode Gelap (Dark Mode) | Latar belakang kanvas `#0B111B`, kartu `#172131`, teks-navy `#8CCBFF`. | Kontras teks-navy mencapai 8.1:1, tidak ada teks gelap di latar gelap. | **PASS** |
| **REG-01** | Buat pesanan baru (Input Order) | Alur input pesanan tersimpan di `localStorage` dan terbukti di receipt. | Alur pesanan 100% berfungsi normal. | **PASS** |
| **REG-02** | Catat hasil produksi multi-batch | Akumulasi produksi bertambah, status pesanan terhitung otomatis. | Perhitungan kuantitas dan validasi sisa berjalan presisi. | **PASS** |
| **REG-03** | Catat surat jalan pengiriman | Akumulasi pengiriman terekonsiliasi dengan target pesanan. | Validasi kelebihan kirim dan status 'selesai' akurat. | **PASS** |
| **REG-04** | Verifikasi catatan operasional | Supervisor dapat menandai sesuai atau minta perbaikan. | Status verifikasi tersimpan dan tercatat pada audit trail. | **PASS** |
| **REG-05** | Buka penampil 3D part | Model 3D interaktif part Bracket Komponen A dapat diputar dan diinspeksi. | Model 3D Three.js canvas berfungsi lancar. | **PASS** |

---

## 2. Ringkasan Eksekusi Test Runner Node.js (`npm test`)
```text
✔ 37 tests completed in 382ms
✔ 0 tests failed
✔ 0 tests skipped
✔ 100% passing rate
```

