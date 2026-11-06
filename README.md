# BEESHA — Prototipe Sistem Operasional PHM

Aplikasi web (prototipe) untuk mencatat **pesanan mitra, hasil produksi, dan pengiriman**, memeriksa (verifikasi)
catatan tersebut, dan melihat ringkasannya di beranda.

> **Status data:** prototipe ini memakai **data contoh** dan menyimpan catatan di **browser perangkat pengguna**
> (`localStorage`). Belum ada server/database, belum ada login, dan **belum terhubung ke INDIGO maupun BHEESA**.
> Lihat [`docs/INTEGRASI.md`](docs/INTEGRASI.md).

## Teknologi

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS 3 · lucide-react · three.js (viewer 3D) ·
`@google/genai` (opsional, untuk panel "Tanya Beesha").

## Menjalankan

```bash
npm install
npm run dev        # http://localhost:3000
```

Perintah lain:

```bash
npm run build      # build produksi
npm run typecheck  # pemeriksaan tipe TypeScript
npm test           # unit test aturan bisnis (utils/*.test.ts)
```

Variabel lingkungan (opsional): `GEMINI_API_KEY` — bila diisi di server, panel "Tanya Beesha" memakai Gemini AI.
Bila kosong, jawaban dihitung otomatis dari data aplikasi dan diberi label sumbernya.
Jangan pernah menaruh kunci di source code.

## Struktur

| Lokasi | Isi |
|---|---|
| `app/page.tsx` | Kerangka aplikasi: navigasi (alamat `#/...`), peringatan isian belum disimpan, dialog global |
| `components/screens/` | Layar: Beranda, Pesanan Mitra, form Pesanan/Produksi/Pengiriman, Detail, Riwayat, Pemeriksaan Data, Peringatan |
| `components/ui/` | Komponen dasar: Button, Field, Dialog, StatusBadge, Card, Notice, dll. |
| `lib/repository.ts` | **Lapisan penyimpanan** (validasi ulang, ID, jejak data, anti-duplikat). Ganti di sini saat backend tersedia |
| `lib/activity.ts` | Riwayat yang diturunkan dari data asli |
| `utils/operations.ts` | Aturan bisnis: progres pesanan, validasi, peringatan |
| `data/mockData.ts` | Data contoh sintetis |
| `docs/` | Laporan audit/refactor & kontrak integrasi |

Alamat halaman: `#/` beranda, `#/pesanan`, `#/pesanan/baru`, `#/pesanan/detail/<id>`, `#/produksi[/<id>]`,
`#/pengiriman[/<id>]`, `#/riwayat`, `#/pemeriksaan`, `#/peringatan`, `#/inspeksi-3d`.
