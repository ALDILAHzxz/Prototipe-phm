// Riwayat aktivitas DITURUNKAN dari data pesanan/produksi/pengiriman,
// sehingga riwayat tidak mungkin berbeda dengan data aslinya.
import { ActivityRecord, Order, ProductionRecord, DeliveryRecord, Partner, Product } from '../types';
import { sortableTime } from './format';

export interface DerivedActivity extends ActivityRecord {
  /** Waktu kejadian untuk pengurutan. */
  sort_key: number;
  /** Waktu data dimasukkan ke aplikasi (bisa berbeda dengan waktu kejadian). */
  input_at?: string;
  source?: string;
}

export function deriveActivities(
  orders: Order[],
  production: ProductionRecord[],
  delivery: DeliveryRecord[],
  partners: Partner[],
  products: Product[]
): DerivedActivity[] {
  const list: DerivedActivity[] = [];
  const partnerName = (id: string) => partners.find((p) => p.partner_id === id)?.partner_name ?? 'Mitra';
  const productName = (id: string) => products.find((p) => p.product_id === id)?.product_name ?? 'Barang';
  const orderById = new Map(orders.map((o) => [o.order_id, o]));

  for (const o of orders) {
    const when = o.created_at ?? o.order_date;
    list.push({
      activity_id: `act-ord-${o.order_id}`,
      activity_type: 'pesanan',
      related_order_id: o.order_id,
      timestamp: when,
      sort_key: sortableTime(when),
      description: `Pesanan ${o.po_number} dicatat: ${o.quantity_ordered.toLocaleString('id-ID')} pcs ${productName(o.product_id)} untuk ${partnerName(o.partner_id)}.`,
      recorded_by: o.created_by,
      status: 'Pesanan dicatat',
      input_at: o.created_at,
      source: o.source,
    });
  }

  for (const r of production) {
    const o = orderById.get(r.order_id);
    list.push({
      activity_id: `act-prd-${r.production_id}`,
      activity_type: 'produksi',
      related_order_id: r.order_id,
      timestamp: r.reported_at,
      sort_key: sortableTime(r.reported_at),
      description: `Hasil produksi ${r.quantity_completed.toLocaleString('id-ID')} pcs${
        r.reject_qty ? ` (cacat ${r.reject_qty} pcs)` : ''
      } dicatat${o ? ` untuk ${productName(o.product_id)}` : ''}.`,
      recorded_by: r.recorded_by,
      status: 'Produksi dicatat',
      input_at: r.created_at,
      source: r.source,
    });
  }

  for (const d of delivery) {
    const o = orderById.get(d.order_id);
    list.push({
      activity_id: `act-krm-${d.delivery_id}`,
      activity_type: 'pengiriman',
      related_order_id: d.order_id,
      timestamp: d.shipped_at,
      sort_key: sortableTime(d.shipped_at),
      description: `Pengiriman ${d.quantity_shipped.toLocaleString('id-ID')} pcs${
        o ? ` ke ${partnerName(o.partner_id)}` : ''
      }${d.delivery_note ? ` (surat jalan ${d.delivery_note})` : ''} dicatat.`,
      recorded_by: d.recorded_by,
      status: 'Pengiriman dicatat',
      input_at: d.created_at,
      source: d.source,
    });
  }

  const verifs: { id: string; order: string; at?: string; by?: string; status?: string; label: string }[] = [
    ...production.map((r) => ({
      id: r.production_id,
      order: r.order_id,
      at: r.verified_at,
      by: r.verified_by,
      status: r.verification_status,
      label: `produksi ${r.quantity_completed.toLocaleString('id-ID')} pcs`,
    })),
    ...delivery.map((d) => ({
      id: d.delivery_id,
      order: d.order_id,
      at: d.verified_at,
      by: d.verified_by,
      status: d.verification_status,
      label: `pengiriman ${d.quantity_shipped.toLocaleString('id-ID')} pcs`,
    })),
  ];
  for (const v of verifs) {
    if (!v.at || !v.by || v.status === 'menunggu_pemeriksaan') continue;
    list.push({
      activity_id: `act-ver-${v.id}-${v.at}`,
      activity_type: 'pemeriksaan',
      related_order_id: v.order,
      timestamp: v.at,
      sort_key: sortableTime(v.at),
      description:
        v.status === 'terverifikasi'
          ? `Catatan ${v.label} (${v.id}) diperiksa dan dinyatakan sesuai.`
          : `Catatan ${v.label} (${v.id}) ditandai perlu diperbaiki.`,
      recorded_by: v.by,
      status: v.status === 'terverifikasi' ? 'Terverifikasi' : 'Perlu diperbaiki',
    });
  }

  return list.sort((a, b) => b.sort_key - a.sort_key);
}
