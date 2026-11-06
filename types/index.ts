// ---------------------------------------------------------------------------
// Model data operasional PHM (prototipe).
// Field baru bersifat opsional agar data lama tetap kompatibel (tidak destruktif).
// ---------------------------------------------------------------------------

export interface Partner {
  partner_id: string;
  partner_name: string;
  pic_name: string;
  phone: string;
  city: string;
}

export interface Product {
  product_id: string;
  product_name: string;
  product_code: string;
  unit: string;
  specification: string;
  standard_lead_time_days: number;
}

/** Asal data: diinput lewat form aplikasi, atau data contoh untuk demonstrasi. */
export type DataSource = 'form_aplikasi' | 'data_contoh';

/**
 * Status pemeriksaan catatan realisasi (produksi/pengiriman).
 * - menunggu_pemeriksaan: sudah tersimpan, belum dicek supervisor.
 * - terverifikasi: sudah dicek dan sesuai kondisi lapangan.
 * - perlu_diperbaiki: ditandai tidak sesuai, perlu dikoreksi pencatat.
 */
export type VerificationStatus = 'menunggu_pemeriksaan' | 'terverifikasi' | 'perlu_diperbaiki';

/** Jejak asal-usul data (audit trail sederhana). */
export interface RecordProvenance {
  /** Waktu data dimasukkan ke aplikasi (ISO 8601). Berbeda dengan waktu kejadian. */
  created_at?: string;
  source?: DataSource;
  /** Kunci unik dari sesi form, mencegah data ganda saat tombol simpan ditekan berulang. */
  client_ref?: string;
  /** Waktu terkirim ke sistem lain (INDIGO/BHEESA). null = belum pernah dikirim. */
  synced_at?: string | null;
  updated_at?: string;
  updated_by?: string;
  /** Riwayat koreksi: nilai lama tidak pernah dihapus diam-diam. */
  revisions?: RecordRevision[];
}

export interface RecordRevision {
  at: string;
  by: string;
  reason: string;
  changes: Record<string, { from: string | number | null; to: string | number | null }>;
}

export interface VerificationInfo {
  verification_status?: VerificationStatus;
  verified_by?: string;
  verified_at?: string;
  verification_note?: string;
}

/** Status pesanan selalu dihitung dari realisasi produksi & pengiriman. */
export type OrderStatus = 'baru' | 'dalam_produksi' | 'terkirim_sebagian' | 'selesai';

export interface Order extends RecordProvenance {
  order_id: string;
  partner_id: string;
  po_number: string;
  product_id: string;
  /** Rencana: jumlah yang dipesan mitra. */
  quantity_ordered: number;
  order_date: string; // YYYY-MM-DD (tanggal PO)
  due_date: string; // YYYY-MM-DD (target kirim)
  /** Nilai awal saat dibuat. Status aktual dihitung oleh calculateSingleOrderProgress. */
  order_status: OrderStatus;
  pic_mitra?: string;
  notes?: string;
  created_by: string;
}

export interface ProductionRecord extends RecordProvenance, VerificationInfo {
  production_id: string;
  order_id: string;
  /** Realisasi: jumlah barang baik (lolos pemeriksaan awal). */
  quantity_completed: number;
  /** Waktu kejadian produksi (YYYY-MM-DD atau YYYY-MM-DDTHH:mm). */
  reported_at: string;
  recorded_by: string;
  reject_qty?: number;
  notes?: string;
}

export interface DeliveryRecord extends RecordProvenance, VerificationInfo {
  delivery_id: string;
  order_id: string;
  quantity_shipped: number;
  /** Waktu kejadian pengiriman (YYYY-MM-DD atau YYYY-MM-DDTHH:mm). */
  shipped_at: string;
  delivery_note?: string; // Nomor Surat Jalan
  recorded_by: string;
  notes?: string;
}

export type ActivityType = 'pesanan' | 'produksi' | 'pengiriman' | 'pemeriksaan';

export interface ActivityRecord {
  activity_id: string;
  activity_type: ActivityType;
  related_order_id: string;
  timestamp: string;
  description: string;
  recorded_by: string;
  status?: string;
}

export type AlertSeverity = 'tindakan' | 'mendekati' | 'terlambat' | 'info';

export interface AlertItem {
  id: string;
  title: string;
  partner_name: string;
  order_id: string;
  po_number: string;
  severity: AlertSeverity;
  description: string;
  remaining_qty: number;
  due_date: string;
}

export type StaffRole = 'admin' | 'operator' | 'pengiriman' | 'supervisor';

/** Petugas yang sedang bertugas. Ini BUKAN login/otorisasi, hanya identitas pencatat. */
export interface Staff {
  staff_id: string;
  name: string;
  role: StaffRole;
  role_label: string;
}

export type ScreenType =
  | 'beranda'
  | 'daftar_pesanan'
  | 'form_pesanan'
  | 'form_produksi'
  | 'form_pengiriman'
  | 'detail_pesanan'
  | 'riwayat_aktivitas'
  | 'pemeriksaan_data'
  | 'pusat_peringatan'
  | 'inspeksi_3d';
