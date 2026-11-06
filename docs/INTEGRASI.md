# Kesiapan Integrasi INDIGO & BHEESA

## Kondisi aktual (hasil audit kode)

| Sistem | Status di repository |
|---|---|
| INDIGO / ERP | **Tidak ada** endpoint, SDK, skema, atau konfigurasi. Belum terhubung. |
| BHEESA (chat AI pimpinan) | **Tidak ada** integrasi. Panel "Tanya Beesha" di aplikasi ini memanggil Google Gemini langsung lewat `app/api/gemini/route.ts` (opsional, butuh `GEMINI_API_KEY`). Ini **bukan** BHEESA. |
| Database / server data | **Tidak ada.** Data disimpan di `localStorage` browser (`lib/repository.ts`, kunci `phm-prototipe:data:v1`). |
| Data di laptop pengembang | Tidak ditemukan bukti di repo bahwa data aplikasi ini bergantung pada laptop tertentu. Data hanya hidup di browser masing-masing pengguna — artinya **data antar-perangkat tidak sama**. Kondisi BHEESA sendiri tidak dapat diverifikasi dari repo ini. |

Tidak ada tombol "Sinkronkan" di aplikasi. Setiap catatan menampilkan **"Belum dikirim ke INDIGO"** (`synced_at: null`).

## Titik sambung

Semua baca/tulis data melewati interface `OperationsRepository` (`lib/repository.ts`). Untuk menyambung ke backend
INDIGO cukup membuat implementasi baru (mis. `HttpOperationsRepository`) dengan kontrak yang sama:

```ts
load(): Promise<OperationsSnapshot>
createOrder(input, actor, clientRef): Promise<SaveResult<Order>>
createProduction(input, actor, clientRef): Promise<SaveResult<ProductionRecord>>
createDelivery(input, actor, clientRef): Promise<SaveResult<DeliveryRecord>>
setVerification(kind, id, status, note, actor)
correctRecord(kind, id, { quantity, reject_qty?, delivery_note?, notes?, reason }, actor)
```

`SaveResult` membedakan: berhasil, **gagal validasi** (pesan per field), dan **gagal penyimpanan** (isian pengguna
tetap di layar). Server INDIGO wajib menjalankan validasi yang sama (lihat `utils/operations.ts`) — validasi di browser
hanya membantu pengguna.

**Idempotensi:** setiap sesi form membuat `client_ref` (UUID). Bila permintaan yang sama terkirim dua kali (retry,
klik ganda), server harus mengembalikan catatan yang sudah ada, bukan membuat baru. Implementasi lokal sudah melakukan ini.

## Kontrak data & pemetaan field

Tiga jenis waktu **tidak boleh dicampur**:
- **waktu kejadian** (`order_date`, `reported_at`, `shipped_at`) — kapan hal itu terjadi di lapangan;
- **waktu input** (`created_at`, `updated_at`) — kapan dicatat di aplikasi;
- **waktu sinkron** (`synced_at`) — kapan diterima INDIGO.

**Rencana vs realisasi:** `Order.quantity_ordered` = rencana (dari PO). Realisasi = jumlah `ProductionRecord.quantity_completed`
dan `DeliveryRecord.quantity_shipped`. Status pesanan **selalu dihitung** dari realisasi, tidak disimpan manual.

### Pesanan (`Order`)
| Field aplikasi | Arti | Field INDIGO (perlu dikonfirmasi) |
|---|---|---|
| `order_id` | ID stabil aplikasi (`ORD-0001`) | ? |
| `partner_id` | ID mitra (master data) | kode customer? |
| `po_number` | Nomor PO mitra (unik per mitra) | ? |
| `product_id` | ID barang (master data) | kode item? |
| `quantity_ordered` | Rencana, pcs | ? |
| `order_date` / `due_date` | Tanggal PO / target kirim (YYYY-MM-DD) | ? |
| `pic_mitra`, `notes` | Opsional | ? |
| `created_by`, `created_at`, `source`, `client_ref` | Jejak asal data | ? |

### Produksi (`ProductionRecord`)
| Field | Arti |
|---|---|
| `production_id`, `order_id` | ID catatan & referensi pesanan |
| `quantity_completed` | Barang **baik** (lolos pemeriksaan awal), pcs |
| `reject_qty` | Barang cacat, pcs |
| `reported_at` | Waktu kejadian produksi |
| `recorded_by`, `created_at`, `source`, `client_ref` | Jejak |
| `verification_status`, `verified_by`, `verified_at`, `verification_note` | Pemeriksaan supervisor |
| `updated_at`, `updated_by`, `revisions[]` | Riwayat koreksi (nilai lama disimpan) |
| `synced_at` | Waktu terkirim ke INDIGO (`null` = belum) |

### Pengiriman (`DeliveryRecord`)
Sama dengan produksi, dengan `quantity_shipped`, `shipped_at`, `delivery_note` (nomor surat jalan, unik).

### Status pemeriksaan
| Nilai | Label | Arti |
|---|---|---|
| `menunggu_pemeriksaan` | Menunggu pemeriksaan | Baru disimpan / baru dikoreksi |
| `terverifikasi` | Terverifikasi | Supervisor menyatakan sesuai lapangan |
| `perlu_diperbaiki` | Perlu diperbaiki | Ada alasan tertulis; pencatat memperbaiki → kembali menunggu |

## Untuk BHEESA

Data untuk AI sebaiknya diambil dari INDIGO (sumber kebenaran), bukan dari browser. Minimal yang dibutuhkan:
ringkasan per pesanan (rencana, realisasi, sisa, tenggat, status), dengan **waktu data** dan **porsi yang sudah terverifikasi**
agar jawaban AI dapat dipertanggungjawabkan.

⚠️ Panel Gemini saat ini mengirim ringkasan pesanan ke layanan Google bila `GEMINI_API_KEY` dipasang. Dengan data
perusahaan sungguhan, ini **perlu persetujuan perusahaan** terlebih dahulu.

## Perlu dikonfirmasi dengan Pak Yusuf / perusahaan
1. Apakah INDIGO punya API? Format, autentikasi, dan field mapping di atas.
2. Sumber kebenaran untuk master mitra & barang (saat ini daftar statis di `data/mockData.ts`).
3. Siapa yang berhak memverifikasi produksi/pengiriman, dan apakah pesanan juga perlu approval.
4. Aturan bisnis: bolehkah produksi melebihi PO? Bolehkah kirim sebelum produksi tercatat? (saat ini: diizinkan dengan tanda "perlu dicek").
5. Apakah nomor surat jalan wajib, dan format penomorannya.
6. Apakah ada status pengiriman setelah berangkat (diterima mitra, retur).
7. Persetujuan pengiriman data operasional ke layanan AI eksternal.
