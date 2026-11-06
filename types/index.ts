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

export type OrderStatus = 'baru' | 'dalam_produksi' | 'terkirim_sebagian' | 'selesai';

export interface Order {
  order_id: string;
  partner_id: string;
  po_number: string;
  product_id: string;
  quantity_ordered: number;
  order_date: string; // YYYY-MM-DD
  due_date: string; // YYYY-MM-DD
  order_status: OrderStatus;
  pic_mitra?: string;
  notes?: string;
  created_by: string;
}

export interface ProductionRecord {
  production_id: string;
  order_id: string;
  quantity_completed: number;
  reported_at: string; // ISO string or human date
  recorded_by: string;
  reject_qty?: number;
  notes?: string;
}

export interface DeliveryRecord {
  delivery_id: string;
  order_id: string;
  quantity_shipped: number;
  shipped_at: string;
  delivery_note?: string; // Nomor Surat Jalan
  recorded_by: string;
  notes?: string;
}

export type ActivityType = 'pesanan' | 'produksi' | 'pengiriman';

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

export type ScreenType =
  | 'beranda'
  | 'daftar_pesanan'
  | 'form_pesanan'
  | 'form_produksi'
  | 'form_pengiriman'
  | 'detail_pesanan'
  | 'riwayat_aktivitas'
  | 'pusat_peringatan'
  | 'inspeksi_3d';
