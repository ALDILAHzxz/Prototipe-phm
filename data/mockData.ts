// ---------------------------------------------------------------------------
// DATA CONTOH (SINTETIS) untuk demonstrasi prototipe.
// Bukan data perusahaan sungguhan. Semua catatan diberi source: 'data_contoh'.
// Tanggal dibuat relatif terhadap hari pertama aplikasi dibuka, agar demo
// tetap masuk akal kapan pun dijalankan.
// ---------------------------------------------------------------------------
import {
  Partner,
  Product,
  Order,
  ProductionRecord,
  DeliveryRecord,
  Staff,
} from '../types';
import { addDays, todayISODate } from '../lib/format';

export const INITIAL_PARTNERS: Partner[] = [
  {
    partner_id: 'PT-01',
    partner_name: 'PT Mitra Presisi Nusantara',
    pic_name: 'Ir. Hendra Gunawan',
    phone: '021-0000-0101',
    city: 'Cikarang, Jawa Barat',
  },
  {
    partner_id: 'PT-02',
    partner_name: 'PT Otomotif Jaya Mandiri',
    pic_name: 'Bambang Sutrisno',
    phone: '021-0000-0202',
    city: 'Karawang, Jawa Barat',
  },
  {
    partner_id: 'PT-03',
    partner_name: 'PT Multi Rekayasa Baja',
    pic_name: 'Dewi Lestari',
    phone: '022-0000-0303',
    city: 'Bandung Barat',
  },
  {
    partner_id: 'PT-04',
    partner_name: 'PT Sarana Industri Utama',
    pic_name: 'Agus Salim',
    phone: '031-0000-0404',
    city: 'Gresik, Jawa Timur',
  },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    product_id: 'PRD-01',
    product_name: 'Bracket Komponen A',
    product_code: 'BRK-01A',
    unit: 'pcs',
    specification: 'High-tensile SPCC Cold Rolled Steel 2.3mm, CNC Stamped & Chamfered',
    standard_lead_time_days: 7,
  },
  {
    product_id: 'PRD-02',
    product_name: 'Flange Adapter Presisi',
    product_code: 'FLG-09B',
    unit: 'pcs',
    specification: 'Aluminum 6061-T6 CNC Turning, Anodized Finish, H7 Bore Tolerance',
    standard_lead_time_days: 5,
  },
  {
    product_id: 'PRD-03',
    product_name: 'Mounting Base Sasis',
    product_code: 'MBS-204',
    unit: 'pcs',
    specification: 'Structural Carbon Steel S45C, Tig Welded Reinforcements',
    standard_lead_time_days: 10,
  },
  {
    product_id: 'PRD-04',
    product_name: 'Bushing Arm Suspensi',
    product_code: 'BAS-11C',
    unit: 'pcs',
    specification: 'Chromoly 4130 Seamless Tube, Precision Lathe Finished',
    standard_lead_time_days: 6,
  },
];

/** Daftar petugas contoh. Pemilihan petugas BUKAN login; hanya identitas pencatat. */
export const DEMO_STAFF: Staff[] = [
  { staff_id: 'STF-01', name: 'Siti Rahma', role: 'admin', role_label: 'Admin Pesanan' },
  { staff_id: 'STF-02', name: 'Ahmad Fauzi', role: 'admin', role_label: 'Admin Pesanan' },
  { staff_id: 'STF-03', name: 'Joko Sutopo', role: 'operator', role_label: 'Operator Lini 1' },
  { staff_id: 'STF-04', name: 'Eko Purnomo', role: 'operator', role_label: 'Operator Lini 2' },
  { staff_id: 'STF-05', name: 'Budi Santoso', role: 'pengiriman', role_label: 'Petugas Pengiriman' },
  { staff_id: 'STF-06', name: 'Hartono', role: 'supervisor', role_label: 'Supervisor Produksi' },
];

export function staffDisplayName(s: Staff): string {
  return `${s.name} (${s.role_label})`;
}

export interface SeedData {
  orders: Order[];
  productionRecords: ProductionRecord[];
  deliveryRecords: DeliveryRecord[];
}

/** Membuat data contoh dengan tanggal relatif terhadap `today` (YYYY-MM-DD). */
export function createSeedData(today: string = todayISODate()): SeedData {
  const d = (offset: number) => addDays(today, offset);
  const dt = (offset: number, time: string) => `${d(offset)}T${time}`;
  const seedMeta = (offset: number, time: string) => ({
    created_at: new Date(`${d(offset)}T${time}:00`).toISOString(),
    source: 'data_contoh' as const,
    synced_at: null,
  });
  const verified = (offset: number) => ({
    verification_status: 'terverifikasi' as const,
    verified_by: 'Hartono (Supervisor Produksi)',
    verified_at: new Date(`${d(offset)}T17:30:00`).toISOString(),
  });

  const orders: Order[] = [
    {
      order_id: 'DEMO-ORD-001',
      partner_id: 'PT-01',
      po_number: 'PO-MPN-2026-088',
      product_id: 'PRD-01',
      quantity_ordered: 500,
      order_date: d(-5),
      due_date: d(6),
      order_status: 'baru',
      pic_mitra: 'Ir. Hendra Gunawan',
      notes: 'Prioritas batch 1 untuk lini perakitan sasis',
      created_by: 'Siti Rahma (Admin Pesanan)',
      ...seedMeta(-5, '08:15'),
    },
    {
      order_id: 'DEMO-ORD-002',
      partner_id: 'PT-02',
      po_number: 'PO-OJM-XI-042',
      product_id: 'PRD-02',
      quantity_ordered: 350,
      order_date: d(-4),
      due_date: d(2),
      order_status: 'baru',
      pic_mitra: 'Bambang Sutrisno',
      notes: 'Toleransi lubang H7 sesuai gambar teknik rev 3',
      created_by: 'Siti Rahma (Admin Pesanan)',
      ...seedMeta(-4, '09:00'),
    },
    {
      order_id: 'DEMO-ORD-003',
      partner_id: 'PT-03',
      po_number: 'PO-MRB-9912',
      product_id: 'PRD-03',
      quantity_ordered: 800,
      order_date: d(-12),
      due_date: d(-2),
      order_status: 'baru',
      pic_mitra: 'Dewi Lestari',
      notes: 'Dikirim penuh dalam satu batch',
      created_by: 'Ahmad Fauzi (Admin Pesanan)',
      ...seedMeta(-12, '10:30'),
    },
    {
      order_id: 'DEMO-ORD-004',
      partner_id: 'PT-04',
      po_number: 'PO-SIU-2026-301',
      product_id: 'PRD-04',
      quantity_ordered: 250,
      order_date: d(-2),
      due_date: d(10),
      order_status: 'baru',
      pic_mitra: 'Agus Salim',
      notes: 'Sampel 5 pcs sudah lolos uji kekerasan',
      created_by: 'Siti Rahma (Admin Pesanan)',
      ...seedMeta(-2, '08:45'),
    },
    {
      order_id: 'DEMO-ORD-005',
      partner_id: 'PT-01',
      po_number: 'PO-MPN-2026-095',
      product_id: 'PRD-01',
      quantity_ordered: 600,
      order_date: d(-1),
      due_date: d(13),
      order_status: 'baru',
      pic_mitra: 'Ir. Hendra Gunawan',
      notes: 'Stok cadangan akhir tahun',
      created_by: 'Ahmad Fauzi (Admin Pesanan)',
      ...seedMeta(-1, '09:10'),
    },
  ];

  const productionRecords: ProductionRecord[] = [
    {
      production_id: 'PRD-REC-101',
      order_id: 'DEMO-ORD-001',
      quantity_completed: 180,
      reported_at: dt(-4, '11:30'),
      recorded_by: 'Joko Sutopo (Operator Lini 1)',
      reject_qty: 2,
      notes: 'Shift pagi mesin CNC-1 lancar',
      ...seedMeta(-4, '11:35'),
      ...verified(-4),
    },
    {
      production_id: 'PRD-REC-102',
      order_id: 'DEMO-ORD-001',
      quantity_completed: 120,
      reported_at: dt(-3, '16:45'),
      recorded_by: 'Joko Sutopo (Operator Lini 1)',
      reject_qty: 1,
      ...seedMeta(-3, '16:50'),
      ...verified(-3),
    },
    {
      production_id: 'PRD-REC-103',
      order_id: 'DEMO-ORD-002',
      quantity_completed: 200,
      reported_at: dt(-2, '14:15'),
      recorded_by: 'Eko Purnomo (Operator Lini 2)',
      reject_qty: 3,
      notes: 'Proses deburring selesai',
      ...seedMeta(-2, '14:20'),
      verification_status: 'menunggu_pemeriksaan',
    },
    {
      production_id: 'PRD-REC-104',
      order_id: 'DEMO-ORD-003',
      quantity_completed: 800,
      reported_at: dt(-5, '17:00'),
      recorded_by: 'Eko Purnomo (Operator Lini 2)',
      reject_qty: 0,
      ...seedMeta(-5, '17:05'),
      ...verified(-5),
    },
    {
      production_id: 'PRD-REC-105',
      order_id: 'DEMO-ORD-004',
      quantity_completed: 50,
      reported_at: dt(-1, '10:20'),
      recorded_by: 'Joko Sutopo (Operator Lini 1)',
      reject_qty: 0,
      notes: 'Tahap awal pemotongan pipa',
      ...seedMeta(-1, '10:25'),
      verification_status: 'menunggu_pemeriksaan',
    },
  ];

  const deliveryRecords: DeliveryRecord[] = [
    {
      delivery_id: 'KRM-0001',
      order_id: 'DEMO-ORD-003',
      quantity_shipped: 800,
      shipped_at: dt(-4, '09:15'),
      delivery_note: 'SJ-DEMO-0039',
      recorded_by: 'Budi Santoso (Petugas Pengiriman)',
      notes: 'Dikirim penuh, berita acara serah terima lengkap',
      ...seedMeta(-4, '09:30'),
      ...verified(-4),
    },
    {
      delivery_id: 'KRM-0002',
      order_id: 'DEMO-ORD-001',
      quantity_shipped: 180,
      shipped_at: dt(-3, '14:30'),
      delivery_note: 'SJ-DEMO-0041',
      recorded_by: 'Budi Santoso (Petugas Pengiriman)',
      ...seedMeta(-3, '14:40'),
      ...verified(-3),
    },
    {
      delivery_id: 'KRM-0003',
      order_id: 'DEMO-ORD-002',
      quantity_shipped: 50,
      shipped_at: dt(-2, '16:00'),
      delivery_note: 'SJ-DEMO-0042',
      recorded_by: 'Budi Santoso (Petugas Pengiriman)',
      notes: 'Batch awal 50 pcs',
      ...seedMeta(-2, '16:10'),
      verification_status: 'menunggu_pemeriksaan',
    },
  ];

  return { orders, productionRecords, deliveryRecords };
}
