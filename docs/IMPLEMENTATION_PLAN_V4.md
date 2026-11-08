# RENCANA PELAKSANAAN TEKNIS V4.0 (IMPLEMENTATION PLAN)
## BEESHA — Sistem Informasi Operasional PT Putra Hatim Mandiri (PHM Group)
**Dokumen:** `docs/IMPLEMENTATION_PLAN_V4.md`  
**Target Rilis:** V4.0 Produksi  

---

## 1. Fase Pelaksanaan

```mermaid
flowchart TD
    P1["Fase 1: Audit & Dokumentasi Awal\n(Audit V4 & Rencana Kerja)"] --> P2["Fase 2: Redesain Navbar Mobile & Desktop\n(Dynamic Title, Profile Button, Sticky)"]
    P2 --> P3["Fase 3: Profil Pengguna Terpadu\n(UserProfileModal, Identitas, Keamanan, Ganti Petugas)"]
    P3 --> P4["Fase 4: Persistent Mobile Beesha AI FAB\n(FAB mengambang persisten di semua rute)"]
    P4 --> P5["Fase 5: Penyelarasan Filter Pemeriksaan\n(Heading STATUS PEMERIKSAAN terpusat)"]
    P5 --> P6["Fase 6: Penataan Filter Pesanan Mitra\n(Selektor kompak mobile + Grid seimbang desktop)"]
    P6 --> P7["Fase 7: Heading Mobile Dashboard & Penghapusan Badge\n(Heading Beesha di mobile + Hapus badge simulasi)"]
    P7 --> P8["Fase 8: Standarisasi Padding Kartu & Mikro-Animasi\n(Padding minimum 18-20px mobile, efek hover/active)"]
    P8 --> P9["Fase 9: Pengujian Otomatis & Regresi\n(Perluasan unit test, 33+ test cases pass, build)"]
    P9 --> P10["Fase 10: Sinkronisasi Git & Deploy Vercel\n(Git commit/push, deploy live, verifikasi URL)"]
```

---

## 2. Rincian Modifikasi Berkas

1. **`components/Navbar.tsx`**:
   - Tampilan Desktop: Pertahankan tombol Menu + Logo B + BEESHA + Subtitle + Nav items + Theme toggle + Profil button + Tanya Beesha.
   - Tampilan Mobile: Sederhanakan! Kiri: Hamburger icon (tanpa teks "Menu"). Tengah: Judul halaman aktif dinamis (`getScreenTitle`). Kanan: Theme icon + Profile icon.
2. **`components/UserProfileModal.tsx`**:
   - Komponen baru untuk Profil Pengguna Terpadu: Foto/Inisial, Identitas, NIK, Departemen, Shift, Info Kontak, Pengaturan Tema/Bahasa, Keamanan Akun (dengan batasan arsitektur jujur), Pergantian Petugas Operasional, dan Tombol Akhiri Sesi.
3. **`components/BeeshaFloatingFAB.tsx`**:
   - Komponen baru untuk tombol mengambang asisten AI di mobile, muncul di kanan bawah viewport di seluruh rute.
4. **`components/screens/VerificationScreen.tsx`**:
   - Tengahkan heading "STATUS PEMERIKSAAN" (`text-center uppercase tracking-wider`).
5. **`components/screens/OrderListScreen.tsx`**:
   - Buat selektor filter status kompak untuk mobile dengan modal/sheet terstruktur.
   - Buat grid filter seimbang untuk desktop.
   - Perbaiki padding kartu pesanan (`p-4.5 sm:p-5`) dan pastikan teks tidak menabrak batas kartu.
6. **`components/screens/DashboardScreen.tsx`**:
   - Heading responsif: Tampilkan `Beesha` pada mobile dan `Ringkasan Operasional` pada desktop.
   - Hapus badge "Data Simulasi" yang menonjol di sebelah heading.
   - Terapkan kelas `interactive-card` dan perbaiki padding kartu tugas & KPI.
7. **`components/screens/ProductionForm.tsx`, `DeliveryForm.tsx`, `NewOrderForm.tsx`, `AlertCenterScreen.tsx`, `ActivityHistoryScreen.tsx`**:
   - Pastikan padding kartu mobile konsisten (16–20px) dan teks nama mitra serta nomor dokumen tidak meluap.
8. **`app/page.tsx`**:
   - Pasang `BeeshaFloatingFAB`, integrasikan `UserProfileModal`, dan hubungkan state pembukaan profil dari navbar dan drawer.
9. **`utils/ui_interactions.test.ts`**:
   - Tambahkan skenario pengujian untuk V4: NAV-01 s/d NAV-05, PROF-01 s/d PROF-05, AI-01 s/d AI-05, DASH-01 s/d DASH-03, EXAM-01 s/d EXAM-04, ORDER-01 s/d ORDER-03, CARD-01 s/d CARD-05.
