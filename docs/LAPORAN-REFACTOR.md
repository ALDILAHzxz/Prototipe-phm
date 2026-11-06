# Laporan Audit & Refactor UX/UI — Prototipe PHM (BEESHA)

## A. Audit awal

**Stack aktual:** Next.js 15 (App Router, satu halaman `app/page.tsx` + satu API route `/api/gemini`), React 19,
TypeScript strict, Tailwind 3, lucide-react, three.js, `@google/genai`. Tidak ada database, ORM, autentikasi,
state library, atau konfigurasi ESLint. Deploy: Vercel (berdasarkan URL; tidak ada konfigurasi khusus di repo).

**Kondisi awal:**
- Semua data adalah mock di `useState` → **hilang saat refresh**; tidak ada penyimpanan sama sekali.
- Navigasi berbasis state: tombol Kembali browser keluar dari aplikasi, refresh selalu kembali ke beranda.
- Fitur berfungsi (dalam memori): input pesanan/produksi/pengiriman, perhitungan progres, peringatan tenggat, riwayat, chat Gemini, viewer 3D.

**Masalah yang ditemukan:**
| Area | Temuan |
|---|---|
| Keterlacakan | Waktu input (`'2026-11-06 09:30'`), petugas (`'Joko Sutopo'`, `'Siti Rahma'`), dan "Terakhir diperbarui 08:30 WIB" di-hardcode. Riwayat aktivitas disimpan terpisah dengan waktu "Baru saja" sehingga bisa tidak sesuai data. |
| Integritas data | Nomor surat jalan **diisi angka acak** otomatis. Tidak ada cek PO ganda. ID pesanan dari `orders.length + 1`. ID aktivitas dari 4 digit terakhir `Date.now()` (bisa bentrok). Tanggal "hari ini" di-hardcode ke 2026-11-06. |
| Status | Tidak ada status pemeriksaan/approval. Field `order_status` tersimpan tapi tidak dipakai (konteks AI memakai nilai basi). |
| Kejujuran integrasi | Panel AI selalu menulis "Terhubung ke Gemini AI · Online" walau kunci kosong dan jawaban berasal dari fallback lokal. API route meneruskan pesan error mentah dan tidak membatasi ukuran prompt. |
| UX/UI | Banyak teks 10–12 px; label opsional tidak terhubung ke input; modal tanpa `role="dialog"`/Esc/fokus; kelas `animate-in` tidak aktif (plugin tidak terpasang); dropdown pesanan berisi kalimat panjang; menu "Detail Pesanan" tanpa konteks; hanya hamburger di semua ukuran layar; tidak ada peringatan saat meninggalkan form; peringatan produksi berlebih menyebut "persetujuan lembur" (aturan bisnis karangan). |
| Teknis | `utils/operations.test.ts` tidak punya runner. `next lint` belum dikonfigurasi. |

**Batasan:** URL deployment (`phmprototype.vercel.app`) diblokir network policy sesi kerja, sehingga perbandingan visual
memakai build lokal. Palet warna proyek ditemukan di `app/globals.css` & `DesignSystemReference.tsx`
(navy `#1B365D`, biru `#0077C8`, silver `#F2F4F7`, charcoal `#1E293B`) dan dipertahankan. PRD/Playbook tidak ada di repo.

Catatan nama: aplikasi ini bernama **BEESHA**, sementara brief menyebut **BHEESA** sebagai aplikasi chat AI terpisah.
Nama tidak diubah; perlu konfirmasi tim.

## B. Perubahan yang dilakukan

**Workflow**
- *Pesanan:* 3 kelompok (Dari siapa / Apa yang dipesan / Keterangan), tanggal pesanan default hari ini, PIC terisi dari data mitra, tombol "Pakai tanggal sesuai waktu produksi standar", cek PO ganda per mitra, ringkasan sebelum simpan, bukti simpan dengan nomor + langkah berikutnya.
- *Produksi:* pesanan dipilih dari **kartu besar** (bukan dropdown), tampil rencana/sudah tercatat/sisa, input barang baik + cacat (field yang sudah ada), waktu produksi bisa diubah untuk mencatat dari buku, kalimat "Akan disimpan: …" sebelum tombol, peringatan langsung bila melebihi target (boleh disimpan, ditandai), catatan terakhir di samping.
- *Pengiriman:* tujuan diambil dari data mitra, tampil dipesan/sudah dikirim/siap kirim/sisa, tombol isi otomatis "semua barang siap kirim", **ditolak** bila melebihi sisa pesanan, peringatan bila melebihi barang jadi tercatat, surat jalan diketik dari dokumen (tidak lagi acak) dan dicek unik, pengiriman bertahap didukung, riwayat pengiriman di samping.
- *Pemeriksaan Data (baru):* supervisor menandai catatan **Terverifikasi** atau **Perlu diperbaiki** (alasan wajib); pencatat memperbaiki lewat dialog koreksi (alasan wajib, nilai lama disimpan di riwayat koreksi) → kembali menunggu pemeriksaan. Tanda otomatis "Perlu dicek" (produksi > PO, kirim > produksi, surat jalan kosong).
- *Riwayat:* diturunkan dari data asli (tidak bisa berbeda), dikelompokkan per tanggal, menampilkan waktu kejadian **dan** waktu input.
- *Detail pesanan:* rencana vs realisasi + porsi terverifikasi, asal data (pencatat, waktu input, sumber), status sinkron jujur, catatan produksi/pengiriman dengan status & riwayat koreksi.
- *Beranda:* 3 tombol aksi besar, 3 hal yang perlu ditindaklanjuti, realisasi per periode (hari ini / 7 hari / bulan ini, dengan definisi), pesanan berjalan dengan batang rencana vs realisasi, waktu data terakhir berubah (bukan "real-time"), status integrasi "belum terhubung".
- *Petugas:* pemilih nama petugas (bukan login) agar setiap catatan menyimpan pencatat.
- *Navigasi:* alamat `#/...` (Back browser & refresh berfungsi), header sticky, menu langsung di layar ≥1536 px dan tombol "Menu" berlabel di layar lebih kecil, peringatan "Tinggalkan halaman ini?" bila isian belum disimpan (termasuk tombol Back & menutup tab).

**Design system:** token warna terpusat sebagai CSS variable (`app/globals.css`) + alias Tailwind (`navy`, `brand`, `ink`, `line`, `success`, …); garis input dipertegas ke kontras ≥3:1; teks minimal 14 px, isi 16–17 px, input & tombol 52 px; komponen `Button`, `Field` (label + wajib/opsional + hint + error terhubung `aria-describedby`), `QtyInput` (satuan terlihat, hanya angka), `ErrorSummary`, `Dialog` (fokus terkunci, Esc, kembali fokus), `StatusBadge` (ikon + teks), `Card`, `Notice`, `EmptyState`, `FilterChips`, `ProgressBar`; fokus keyboard 3 px; `prefers-reduced-motion` dihormati; glassmorphism/blur dihapus.

**Validasi & status:** validasi per field dengan pesan yang menyebut cara memperbaiki; validasi **diulang di lapisan penyimpanan** sebelum menulis; status pesanan selalu dihitung dari realisasi (pesanan baru "Selesai" hanya bila seluruh jumlah sudah dikirim); status pemeriksaan terpisah dari status pesanan.

**Teknis:** `lib/repository.ts` (interface `OperationsRepository`, implementasi `localStorage` dengan fallback memori, ID berurutan stabil, `client_ref` idempoten, data rusak dicadangkan bukan dihapus, pesan jujur bila penyimpanan gagal); sinkron antar-tab; API Gemini: `GET` status konfigurasi, batas panjang input, error tidak dibocorkan, 503 bila tidak dikonfigurasi; panel AI memberi label sumber tiap jawaban; viewer 3D dipertahankan (menu "Lainnya" & detail pesanan).

## C. File yang berubah

| File | Tujuan |
|---|---|
| `types/index.ts` | Tambah field jejak data, status pemeriksaan, revisi, `Staff` (semua opsional → kompatibel) |
| `utils/operations.ts` | Validasi lengkap per field, ringkasan periode, tanda otomatis, tanggal hari ini dinamis, teks jawaban lokal yang jujur |
| `lib/repository.ts` | Lapisan penyimpanan + validasi ulang + idempotensi |
| `lib/useOperations.ts` | Hook memuat data & petugas aktif |
| `lib/activity.ts` | Riwayat diturunkan dari data |
| `lib/format.ts` | Format tanggal/angka Indonesia |
| `data/mockData.ts` | Data contoh relatif terhadap tanggal hari pertama, nomor telepon/surat jalan sintetis, daftar petugas contoh |
| `app/page.tsx` | Routing hash, guard isian, dialog global, footer jujur |
| `app/globals.css`, `tailwind.config.ts` | Token desain |
| `app/api/gemini/route.ts` | Pengamanan & status konfigurasi |
| `components/ui/*` | Komponen dasar |
| `components/navigation.ts`, `Navbar.tsx`, `NavigationDrawer.tsx`, `StaffPicker.tsx`, `OrderPicker.tsx` | Navigasi & pemilih |
| `components/screens/*` | Semua layar dirombak; `VerificationScreen.tsx` & `shared.tsx` baru |
| `components/BeeshaAIAssistant.tsx` | Label sumber jawaban, konteks memakai status terhitung |
| `components/DesignSystemReference.tsx`, `ThreePartViewer.tsx` | Ukuran teks minimum & tombol tutup berlabel |
| `utils/validation.test.ts`, `package.json` | Test baru, skrip `test` & `typecheck` (devDependency `tsx`) |
| `README.md`, `docs/*` | Dokumentasi |

## D. Hasil pengujian

| Pemeriksaan | Hasil |
|---|---|
| `npm run build` | Berhasil |
| `npm run typecheck` | Berhasil, 0 error |
| `npm test` | 11/11 lulus (5 test lama + 6 test baru) |
| Lint | **Tidak dijalankan** — repo belum punya konfigurasi ESLint (`next lint` meminta setup interaktif) |
| Manual QA (Playwright, data contoh) | Lulus semua skenario di bawah; 0 error/warning di console |

Skenario yang diuji otomatis di browser: membuat pesanan valid; simpan tanpa field wajib (ringkasan kesalahan per field);
PO ganda ditolak; peringatan meninggalkan form; produksi kosong ditolak; produksi melebihi target → peringatan & konfirmasi;
pengiriman melebihi sisa ditolak; pengiriman sebagian tersimpan; detail menampilkan catatan; tombol Back browser; verifikasi;
"perlu diperbaiki" wajib alasan; koreksi data + riwayat koreksi; data bertahan setelah refresh; **simulasi penyimpanan gagal**
(pesan "belum tersimpan", isian tetap, simpan ulang berhasil); panel AI menampilkan sumber "hitungan otomatis" saat Gemini
tidak dikonfigurasi; tanpa overflow horizontal di 390 px & 820 px untuk 9 halaman; menu hamburger buka/tutup (Esc); header sticky.

Belum diuji: kegagalan **jaringan** sungguhan (tidak ada server data — yang disimulasikan adalah kegagalan penyimpanan),
jawaban Gemini sungguhan (tidak ada kunci di lingkungan uji), tampilan deployment Vercel (diblokir), pembaca layar nyata.

## E. Integrasi
Lihat [`INTEGRASI.md`](INTEGRASI.md). Ringkasnya: tidak ada integrasi INDIGO/BHEESA yang tersedia; Gemini opsional;
batas integrasi (`OperationsRepository`), kontrak data, field mapping, aturan waktu, dan idempotensi sudah disiapkan.

## F. Risiko & rekomendasi
1. **Data hanya di satu browser.** Tiap perangkat punya data sendiri; menghapus data browser = data hilang. Ini prototipe, bukan sistem produksi. Langkah berikut: backend + database (atau API INDIGO) sebagai implementasi `OperationsRepository`.
2. **Tanpa login.** Pemilih petugas hanya identitas pencatat; pembatasan supervisor hanya tampilan. Perlu autentikasi & otorisasi di server.
3. Aturan bisnis yang diasumsikan dan perlu konfirmasi: produksi boleh melebihi PO (ditandai), kirim boleh melebihi produksi tercatat (ditandai), surat jalan opsional tapi dianjurkan, verifikasi hanya untuk produksi & pengiriman (bukan pesanan).
4. Master data mitra/barang masih statis.
5. Pengiriman data ke Gemini butuh persetujuan perusahaan sebelum dipakai dengan data asli.
6. Tambahkan konfigurasi ESLint & CI (build + typecheck + test).
7. Font Inter tidak dimuat dari jaringan (memakai font sistem bila Inter tidak terpasang) agar build tidak bergantung koneksi.
8. Lanjutan (P2): mode offline/antrian sinkron, ekspor data, modul DPR/MPR setelah ruang lingkup dikonfirmasi.

## G. Panduan review sebelum presentasi
1. Buka `#/` → pilih nama petugas (tombol "Petugas" di header).
2. `Catat Pesanan` → coba simpan kosong → isi lengkap → simpan → catat nomor ORD.
3. Ganti petugas ke operator → `Catat Produksi` untuk pesanan tadi; coba jumlah melebihi target.
4. `Catat Pengiriman` → coba jumlah melebihi sisa, lalu kirim sebagian dengan nomor surat jalan.
5. Buka detail pesanan → cek rencana vs realisasi, asal data, status "Belum dikirim ke INDIGO".
6. Ganti petugas ke **Hartono (Supervisor)** → `Pemeriksaan` → verifikasi satu catatan, tandai satu "perlu diperbaiki" → perbaiki.
7. `Riwayat` dan `Beranda` → angka & catatan ikut berubah; refresh halaman → data tetap ada.
8. Ulangi di ponsel (menu "Menu") dan tablet.
9. Menu → "Kembalikan Data Contoh" untuk mengulang demo.
