# ARSITEKTUR KEAMANAN & RANCANGAN PROFIL PENGGUNA V4.0
## BEESHA — Sistem Informasi Operasional PT Putra Hatim Mandiri (PHM Group)
**Dokumen:** `docs/PROFILE_SECURITY_DESIGN.md`  
**Status:** Spesifikasi Arsitektur Keamanan & Implementasi Antarmuka  

---

## 1. Latar Belakang & Prinsip Keamanan Non-Kompromistis
Aplikasi BEESHA saat ini beroperasi sebagai prototipe operasional front-end yang menyimpan catatan transaksi di `localStorage` peramban. Dalam lingkungan ini, belum terdapat backend server otentikasi nyata (seperti OAuth 2.0 / OIDC, Kerberos, atau direktori LDAP/Active Directory milik PHM Group).

### Prinsip Utama Rekayasa Keamanan:
1. **Tidak Ada Otentikasi Bodong / Palsu:**
   Sistem tidak boleh menampilkan validasi biometrik palsu (*fake fingerprint animation*) yang seolah-olah memverifikasi identitas pengguna jika tidak ada otentikasi kriptografis nyata.
2. **Keterbatasan JavaScript Peramban:**
   Kode JavaScript murni tidak dapat mengakses pemindai sidik jari perangkat keras secara langsung. Akses biometrik pada platform web wajib melalui standar **W3C WebAuthn / FIDO2 Passkeys** dengan tantangan kriptografis (*cryptographic challenge*) yang diverifikasi oleh server otentikasi terpercaya.
3. **Pemisahan Lapisan Identitas:**
   - **Lapisan Presentasi Profil:** Menampilkan informasi profil akun dan peran kerja.
   - **Lapisan Identitas Demo:** Mengelola pemilihan nama petugas operasional (`recorded_by`) untuk mencatat siapa yang melakukan input transaksi pada perangkat demo.
   - **Lapisan Otentikasi Terintegrasi (Masa Depan):** Menghubungkan sesi pengguna ke direktori korporat PHM Group dan protokol WebAuthn.

---

## 2. Struktur Profil Pengguna Terpadu (`UserProfileModal`)

### Seksi A — Identitas Pegawai
- **Avatar & Inisial:** Lingkaran avatar berukuran 64px dengan inisial nama petugas aktif (misal: "SR" untuk Siti Rahma).
- **Nama Lengkap:** Nama petugas operasional yang sedang aktif.
- **Nomor Induk Karyawan (NIK):** Kode identitas resmi (misal: `PHM-OPS-042`).
- **Departemen:** Bagian kerja di bawah PHM Group (misal: *Departemen Operasional & PPIC*).
- **Peran / Jabatan:** Peran operasional (Admin Pesanan, Operator Produksi, Petugas Pengiriman, atau Supervisor).
- **Shift Kerja:** Jadwal kerja aktif (Shift 1 Pagi: 07:00 – 15:30 WIB).
- **Status Akun:** Indikator badge `Sesi Lokal Aktif` dengan penanda demo transparan.

### Seksi B — Informasi Kontak
- **Email:** Alamat email kedinasan internal (misal: `siti.rahma@phmgroup.co.id`).
- **Nomor Telepon:** Kontak operasional lapangan (misal: `+62 812-0000-0101`).
- **Lokasi Penugasan:** Plant / Pabrik PHM (misal: *Plant 1 Cikarang — Gedung Utama*).

### Seksi C — Pengaturan & Preferensi
- **Tema Visual:** Opsi beralih antara Mode Terang dan Mode Gelap langsung dari dalam profil.
- **Bahasa Antarmuka:** Bahasa Indonesia (Standar operasional PHM).
- **Aksesibilitas:** Mode kontras tinggi WCAG 2.2 AA.

### Seksi D — Keamanan Akun & Transparansi Biometrik
Bagian ini menampilkan opsi keamanan yang akan berlaku saat sistem terhubung ke backend otentikasi resmi:
- **Ubah Kata Sandi:** Tombol untuk pembaruan kredensial akun.
- **Lupa Kata Sandi (Pemulihan dengan Passkey / Sidik Jari):**
  - Alur Standar WebAuthn:
    1. Pengguna memicu pemulihan kata sandi.
    2. Server otentikasi menerbitkan tantangan kriptografis unik (*challenge nonce*).
    3. Peramban memanggil API `navigator.credentials.get({ publicKey: ... })`.
    4. Perangkat memverifikasi biometrik pengguna (sidik jari / wajah / PIN perangkat) secara lokal pada modul keamanan perangkat keras (TPM / Secure Enclave).
    5. Perangkat mengirimkan tanda tangan digital ke server.
    6. Server memvalidasi tanda tangan dan mengizinkan pengaturan kata sandi baru.
  - **Pemberitahuan Kejujuran Sistem (Disclosed Notice):**
    > ⚠️ **Catatan Keamanan Prototipe:**
    > *"Fitur pemulihan kata sandi dengan biometrik dan passkey memerlukan integrasi server otentikasi WebAuthn / SSO PHM Group. Pada prototipe ini, pengaturan keamanan disajikan sebagai rancangan alur kerja antarmuka dan belum terhubung ke direktori kredensial perusahaan."*

### Seksi E — Pergantian Petugas Operasional
Fitur pemilihan petugas lama kini dipindahkan dan diintegrasikan secara terpadu di dalam modal Profil:
- Menampilkan daftar petugas demo lengkap (Siti Rahma, Ahmad Fauzi, Joko Sutopo, Eko Purnomo, Budi Santoso, Hartono).
- Pemilihan petugas langsung memperbarui state petugas aktif dan menyimpannya di `localStorage`.
- Menjelaskan bahwa pergantian petugas hanya menentukan nama pencatat pada transaksi berikutnya dan tidak mengubah arsip data terdahulu.

### Seksi F — Sesi Kerja
- **Tombol "Akhiri Sesi Demo" / "Keluar":**
  - Dilengkapi dialog konfirmasi untuk mencegah ketidaksengajaan.
  - Saat dikonfirmasi, identitas petugas aktif dihapus dari `localStorage`, mengembalikan antarmuka ke keadaan "Belum memilih petugas".
  - **Data Catatan Tetap Aman:** Catatan pesanan, produksi, dan pengiriman yang telah dibuat sebelumnya TIDAK dihapus, menjaga keutuhan riwayat kerja.
