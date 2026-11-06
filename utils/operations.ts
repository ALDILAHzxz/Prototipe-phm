import {
  Order,
  ProductionRecord,
  DeliveryRecord,
  OrderStatus,
  AlertItem,
  Partner,
  Product,
  VerificationStatus,
} from '../types';
import { diffCalendarDays, parseDateLike, todayISODate } from '../lib/format';

/** Batas atas jumlah per catatan untuk mencegah salah ketik (mis. kelebihan angka 0). */
export const MAX_QTY_PER_ENTRY = 1_000_000;

export interface OrderProgressMetrics {
  totalOrdered: number;
  totalProduced: number;
  totalShipped: number;
  remainingProduction: number;
  remainingDelivery: number;
  productionPercentage: number;
  deliveryPercentage: number;
  computedStatus: OrderStatus;
  stage: 'diterima' | 'produksi' | 'pengiriman' | 'selesai';
}

/** Status verifikasi efektif. Data lama tanpa status dianggap belum diperiksa. */
export function getVerificationStatus(record: { verification_status?: VerificationStatus }): VerificationStatus {
  return record.verification_status ?? 'menunggu_pemeriksaan';
}

/**
 * Menghitung progres satu pesanan dari catatan produksi & pengiriman.
 * Rencana = quantity_ordered. Realisasi = jumlah seluruh catatan (termasuk yang belum diperiksa).
 */
export function calculateSingleOrderProgress(
  order: Order,
  productionRecords: ProductionRecord[],
  deliveryRecords: DeliveryRecord[]
): OrderProgressMetrics {
  const totalOrdered = Math.max(0, order.quantity_ordered || 0);

  const totalProduced = productionRecords
    .filter((r) => r.order_id === order.order_id)
    .reduce((sum, r) => sum + (Number(r.quantity_completed) || 0), 0);

  const totalShipped = deliveryRecords
    .filter((r) => r.order_id === order.order_id)
    .reduce((sum, r) => sum + (Number(r.quantity_shipped) || 0), 0);

  const remainingProduction = Math.max(0, totalOrdered - totalProduced);
  const remainingDelivery = Math.max(0, totalOrdered - totalShipped);

  const productionPercentage =
    totalOrdered > 0 ? Math.min(100, Math.round((totalProduced / totalOrdered) * 100)) : 0;
  const deliveryPercentage =
    totalOrdered > 0 ? Math.min(100, Math.round((totalShipped / totalOrdered) * 100)) : 0;

  let computedStatus: OrderStatus = 'baru';
  let stage: 'diterima' | 'produksi' | 'pengiriman' | 'selesai' = 'diterima';

  if (totalShipped >= totalOrdered && totalOrdered > 0) {
    computedStatus = 'selesai';
    stage = 'selesai';
  } else if (totalShipped > 0) {
    computedStatus = 'terkirim_sebagian';
    stage = 'pengiriman';
  } else if (totalProduced > 0) {
    computedStatus = 'dalam_produksi';
    stage = 'produksi';
  }

  return {
    totalOrdered,
    totalProduced,
    totalShipped,
    remainingProduction,
    remainingDelivery,
    productionPercentage,
    deliveryPercentage,
    computedStatus,
    stage,
  };
}

export interface DashboardMetrics {
  activeOrdersCount: number;
  totalProducedQty: number;
  totalShippedQty: number;
  attentionCount: number;
  totalOrderedQty: number;
  overallDeliveryRate: number;
}

/** Metrik ringkas lintas seluruh pesanan. */
export function calculateDashboardMetrics(
  orders: Order[],
  productionRecords: ProductionRecord[],
  deliveryRecords: DeliveryRecord[],
  attentionItemsCount: number = 0
): DashboardMetrics {
  let activeOrdersCount = 0;
  let totalOrderedQty = 0;

  for (const ord of orders) {
    const progress = calculateSingleOrderProgress(ord, productionRecords, deliveryRecords);
    totalOrderedQty += ord.quantity_ordered;
    if (progress.computedStatus !== 'selesai') {
      activeOrdersCount++;
    }
  }

  const totalProducedQty = productionRecords.reduce(
    (sum, r) => sum + (Number(r.quantity_completed) || 0),
    0
  );

  const totalShippedQty = deliveryRecords.reduce(
    (sum, r) => sum + (Number(r.quantity_shipped) || 0),
    0
  );

  const overallDeliveryRate =
    totalOrderedQty > 0
      ? Math.min(100, Math.round((totalShippedQty / totalOrderedQty) * 100))
      : 0;

  return {
    activeOrdersCount,
    totalProducedQty,
    totalShippedQty,
    attentionCount: attentionItemsCount,
    totalOrderedQty,
    overallDeliveryRate,
  };
}

export interface PeriodSummary {
  /** Jumlah pesanan dengan tanggal PO dalam periode. */
  ordersInPeriod: number;
  /** Realisasi produksi (pcs) dengan tanggal produksi dalam periode. */
  producedInPeriod: number;
  producedVerifiedInPeriod: number;
  /** Realisasi pengiriman (pcs) dengan tanggal kirim dalam periode. */
  shippedInPeriod: number;
  shippedVerifiedInPeriod: number;
}

/** Ringkasan realisasi berdasarkan tanggal kejadian dalam rentang [from, to] (inklusif). */
export function calculatePeriodSummary(
  orders: Order[],
  productionRecords: ProductionRecord[],
  deliveryRecords: DeliveryRecord[],
  from: string,
  to: string
): PeriodSummary {
  const inRange = (value: string) => {
    const d = (value || '').slice(0, 10);
    return d >= from && d <= to;
  };
  const prod = productionRecords.filter((r) => inRange(r.reported_at));
  const del = deliveryRecords.filter((r) => inRange(r.shipped_at));
  const sum = <T,>(list: T[], pick: (t: T) => number) => list.reduce((s, t) => s + (Number(pick(t)) || 0), 0);
  return {
    ordersInPeriod: orders.filter((o) => inRange(o.order_date)).length,
    producedInPeriod: sum(prod, (r) => r.quantity_completed),
    producedVerifiedInPeriod: sum(
      prod.filter((r) => getVerificationStatus(r) === 'terverifikasi'),
      (r) => r.quantity_completed
    ),
    shippedInPeriod: sum(del, (r) => r.quantity_shipped),
    shippedVerifiedInPeriod: sum(
      del.filter((r) => getVerificationStatus(r) === 'terverifikasi'),
      (r) => r.quantity_shipped
    ),
  };
}

/**
 * Mendeteksi pesanan yang perlu perhatian (terlambat, mendekati tenggat, siap kirim).
 * `currentDateStr` default = tanggal hari ini di perangkat.
 */
export function deriveOperationalAlerts(
  orders: Order[],
  productionRecords: ProductionRecord[],
  deliveryRecords: DeliveryRecord[],
  partners: Partner[],
  currentDateStr: string = todayISODate()
): AlertItem[] {
  const alerts: AlertItem[] = [];

  for (const order of orders) {
    const metrics = calculateSingleOrderProgress(order, productionRecords, deliveryRecords);
    if (metrics.computedStatus === 'selesai') continue;

    const partner = partners.find((p) => p.partner_id === order.partner_id);
    const partnerName = partner ? partner.partner_name : 'Mitra Tidak Dikenal';

    const diffDays = diffCalendarDays(currentDateStr, order.due_date);

    if (diffDays < 0) {
      alerts.push({
        id: `alert-overdue-${order.order_id}`,
        title: 'Lewat tenggat pengiriman',
        partner_name: partnerName,
        order_id: order.order_id,
        po_number: order.po_number,
        severity: 'terlambat',
        description: `Tenggat terlewat ${Math.abs(diffDays)} hari. Masih ${metrics.remainingDelivery.toLocaleString('id-ID')} pcs belum dikirim.`,
        remaining_qty: metrics.remainingDelivery,
        due_date: order.due_date,
      });
    } else if (diffDays <= 3) {
      alerts.push({
        id: `alert-approaching-${order.order_id}`,
        title: 'Tenggat pengiriman sudah dekat',
        partner_name: partnerName,
        order_id: order.order_id,
        po_number: order.po_number,
        severity: 'mendekati',
        description:
          diffDays === 0
            ? `Tenggat hari ini. Masih ${metrics.remainingDelivery.toLocaleString('id-ID')} pcs belum dikirim.`
            : `Tenggat ${diffDays} hari lagi. Masih ${metrics.remainingDelivery.toLocaleString('id-ID')} pcs belum dikirim.`,
        remaining_qty: metrics.remainingDelivery,
        due_date: order.due_date,
      });
    } else if (metrics.totalProduced > metrics.totalShipped) {
      const readyToShip = metrics.totalProduced - metrics.totalShipped;
      alerts.push({
        id: `alert-ready-${order.order_id}`,
        title: 'Barang jadi siap dikirim',
        partner_name: partnerName,
        order_id: order.order_id,
        po_number: order.po_number,
        severity: 'tindakan',
        description: `${readyToShip.toLocaleString('id-ID')} pcs sudah selesai dibuat dan belum dikirim.`,
        remaining_qty: readyToShip,
        due_date: order.due_date,
      });
    }
  }

  return alerts;
}

// ---------------------------------------------------------------------------
// VALIDASI
// Dipakai di form (membantu pengguna) DAN diulang di lapisan penyimpanan
// (lib/repository.ts) sebagai sumber kebenaran sebelum data disimpan.
// ---------------------------------------------------------------------------

function isWholePositive(value: unknown): boolean {
  const n = Number(value);
  return Number.isFinite(n) && Number.isInteger(n) && n > 0;
}

/** Validasi data pesanan. Field opsional (order_date, existingOrders) memperketat pemeriksaan. */
export function validateOrderInput(
  data: {
    partner_id: string;
    po_number: string;
    product_id: string;
    quantity_ordered: number;
    due_date: string;
    order_date?: string;
  },
  existingOrders: Order[] = []
): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  const qty = Number(data.quantity_ordered);

  if (!data.partner_id || data.partner_id.trim() === '') {
    errors.partner_id = 'Pilih nama mitra dari daftar.';
  }
  if (!data.po_number || data.po_number.trim() === '') {
    errors.po_number = 'Isi nomor PO sesuai dokumen dari mitra.';
  } else if (data.partner_id) {
    const normalized = data.po_number.trim().toUpperCase();
    const dup = existingOrders.find(
      (o) => o.partner_id === data.partner_id && o.po_number.trim().toUpperCase() === normalized
    );
    if (dup) {
      errors.po_number = `Nomor PO ini sudah tercatat untuk mitra yang sama (pesanan ${dup.order_id}). Periksa apakah pesanan ini sudah pernah diinput.`;
    }
  }
  if (!data.product_id || data.product_id.trim() === '') {
    errors.product_id = 'Pilih barang yang dipesan.';
  }
  if (!data.quantity_ordered || !Number.isFinite(qty) || qty <= 0) {
    errors.quantity_ordered = 'Isi jumlah pesanan, minimal 1 pcs.';
  } else if (!Number.isInteger(qty)) {
    errors.quantity_ordered = 'Jumlah harus angka bulat, tanpa koma.';
  } else if (qty > MAX_QTY_PER_ENTRY) {
    errors.quantity_ordered = `Jumlah terlalu besar (maksimal ${MAX_QTY_PER_ENTRY.toLocaleString('id-ID')} pcs). Periksa jumlah angka nol.`;
  }
  if (data.order_date !== undefined && (!data.order_date || !parseDateLike(data.order_date))) {
    errors.order_date = 'Isi tanggal pesanan (tanggal pada dokumen PO).';
  }
  if (!data.due_date || data.due_date.trim() === '') {
    errors.due_date = 'Isi target tanggal kirim ke mitra.';
  } else if (data.order_date && data.due_date < data.order_date) {
    errors.due_date = 'Target kirim tidak boleh lebih awal dari tanggal pesanan.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validasi ringkas produksi (dipertahankan untuk kompatibilitas).
 * Lebih kelebihan target TIDAK diblokir, hanya diberi peringatan agar diperiksa.
 */
export function validateProductionInput(
  orderId: string,
  quantityCompleted: number,
  orderProgress?: OrderProgressMetrics
): { isValid: boolean; error?: string; warning?: string } {
  if (!orderId || orderId.trim() === '') {
    return { isValid: false, error: 'Pilih pesanan yang hasil produksinya akan dicatat.' };
  }

  const qty = Number(quantityCompleted);
  if (isNaN(qty) || qty <= 0) {
    return { isValid: false, error: 'Jumlah produksi harus lebih dari 0 pcs.' };
  }

  if (!Number.isInteger(qty)) {
    return { isValid: false, error: 'Jumlah produksi harus berupa angka bulat.' };
  }

  if (qty > MAX_QTY_PER_ENTRY) {
    return { isValid: false, error: 'Jumlah produksi terlalu besar. Periksa jumlah angka nol.' };
  }

  let warning: string | undefined;
  if (orderProgress && qty > orderProgress.remainingProduction) {
    warning = `Jumlah ini (${qty.toLocaleString('id-ID')} pcs) melebihi sisa target produksi (${orderProgress.remainingProduction.toLocaleString('id-ID')} pcs). Data tetap bisa disimpan dan akan ditandai untuk diperiksa supervisor.`;
  }

  return { isValid: true, warning };
}

/** Validasi lengkap form produksi, dengan pesan per field. */
export function validateProductionForm(
  data: { order_id: string; quantity_completed: string | number; reject_qty: string | number; reported_at: string },
  orderProgress: OrderProgressMetrics | undefined,
  now: string = new Date().toISOString()
): { errors: Record<string, string>; warnings: string[] } {
  const errors: Record<string, string> = {};
  const warnings: string[] = [];
  const base = validateProductionInput(data.order_id, Number(data.quantity_completed), orderProgress);

  if (!data.order_id) errors.order_id = 'Pilih pesanan yang sedang dikerjakan.';
  else if (!base.isValid && base.error) errors.quantity_completed = base.error;
  if (data.quantity_completed === '' || data.quantity_completed === null) {
    errors.quantity_completed = 'Isi jumlah barang baik yang selesai dibuat.';
  }
  if (base.warning) warnings.push(base.warning);

  const reject = data.reject_qty === '' ? 0 : Number(data.reject_qty);
  if (!Number.isFinite(reject) || reject < 0 || !Number.isInteger(reject)) {
    errors.reject_qty = 'Jumlah cacat harus angka bulat 0 atau lebih.';
  } else if (reject > MAX_QTY_PER_ENTRY) {
    errors.reject_qty = 'Jumlah cacat terlalu besar. Periksa jumlah angka nol.';
  }

  const eventTime = parseDateLike(data.reported_at);
  if (!eventTime) {
    errors.reported_at = 'Isi tanggal dan jam produksi.';
  } else if (eventTime.getTime() > new Date(now).getTime() + 5 * 60_000) {
    errors.reported_at = 'Waktu produksi tidak boleh di masa depan.';
  }

  return { errors, warnings };
}

/** Validasi ringkas pengiriman (dipertahankan untuk kompatibilitas). */
export function validateDeliveryInput(
  orderId: string,
  quantityShipped: number,
  orderProgress?: OrderProgressMetrics
): { isValid: boolean; error?: string; warning?: string } {
  if (!orderId || orderId.trim() === '') {
    return { isValid: false, error: 'Pilih pesanan yang akan dikirim.' };
  }

  const qty = Number(quantityShipped);
  if (isNaN(qty) || qty <= 0) {
    return { isValid: false, error: 'Jumlah pengiriman harus lebih dari 0 pcs.' };
  }

  if (!Number.isInteger(qty)) {
    return { isValid: false, error: 'Jumlah pengiriman harus berupa angka bulat.' };
  }

  if (orderProgress) {
    if (qty > orderProgress.remainingDelivery) {
      return {
        isValid: false,
        error: `Jumlah kirim (${qty.toLocaleString('id-ID')} pcs) melebihi sisa pesanan yang belum dikirim (${orderProgress.remainingDelivery.toLocaleString('id-ID')} pcs).`,
      };
    }

    const availableProduced = orderProgress.totalProduced - orderProgress.totalShipped;
    if (qty > availableProduced) {
      return {
        isValid: true,
        warning: `Jumlah kirim (${qty.toLocaleString('id-ID')} pcs) lebih banyak dari barang jadi yang tercatat belum dikirim (${Math.max(0, availableProduced).toLocaleString('id-ID')} pcs). Pastikan barang fisik memang ada. Data akan ditandai untuk diperiksa.`,
      };
    }
  }

  return { isValid: true };
}

/** Validasi lengkap form pengiriman, dengan pesan per field. */
export function validateDeliveryForm(
  data: { order_id: string; quantity_shipped: string | number; shipped_at: string; delivery_note: string },
  orderProgress: OrderProgressMetrics | undefined,
  existingDeliveries: DeliveryRecord[],
  now: string = new Date().toISOString()
): { errors: Record<string, string>; warnings: string[] } {
  const errors: Record<string, string> = {};
  const warnings: string[] = [];

  if (!data.order_id) {
    errors.order_id = 'Pilih pesanan yang dikirim.';
  } else if (data.quantity_shipped === '' || data.quantity_shipped === null) {
    errors.quantity_shipped = 'Isi jumlah barang yang dikirim.';
  } else {
    const base = validateDeliveryInput(data.order_id, Number(data.quantity_shipped), orderProgress);
    if (!base.isValid && base.error) errors.quantity_shipped = base.error;
    if (base.warning) warnings.push(base.warning);
  }

  const eventTime = parseDateLike(data.shipped_at);
  if (!eventTime) {
    errors.shipped_at = 'Isi tanggal dan jam barang berangkat.';
  } else if (eventTime.getTime() > new Date(now).getTime() + 5 * 60_000) {
    errors.shipped_at = 'Waktu kirim tidak boleh di masa depan.';
  }

  const note = data.delivery_note.trim().toUpperCase();
  if (note) {
    const dup = existingDeliveries.find((d) => (d.delivery_note || '').trim().toUpperCase() === note);
    if (dup) {
      errors.delivery_note = `Nomor surat jalan ini sudah dipakai pada pengiriman ${dup.delivery_id}. Periksa kembali nomornya.`;
    }
  }

  return { errors, warnings };
}

/**
 * Tanda otomatis untuk membantu supervisor: catatan yang angkanya janggal
 * dibanding rencana. Dihitung ulang setiap saat dari data, bukan disimpan.
 */
export function getProductionFlags(
  record: ProductionRecord,
  order: Order | undefined,
  allProduction: ProductionRecord[]
): string[] {
  const flags: string[] = [];
  if (!order) return ['Pesanan terkait tidak ditemukan.'];
  const total = allProduction
    .filter((r) => r.order_id === order.order_id)
    .reduce((s, r) => s + (Number(r.quantity_completed) || 0), 0);
  if (total > order.quantity_ordered) {
    flags.push(
      `Total produksi pesanan ini (${total.toLocaleString('id-ID')} pcs) melebihi jumlah dipesan (${order.quantity_ordered.toLocaleString('id-ID')} pcs).`
    );
  }
  if ((record.reject_qty || 0) > 0 && (record.reject_qty || 0) >= record.quantity_completed) {
    flags.push('Jumlah cacat sama atau lebih banyak dari jumlah barang baik.');
  }
  return flags;
}

export function getDeliveryFlags(
  record: DeliveryRecord,
  order: Order | undefined,
  allProduction: ProductionRecord[],
  allDelivery: DeliveryRecord[]
): string[] {
  const flags: string[] = [];
  if (!order) return ['Pesanan terkait tidak ditemukan.'];
  const produced = allProduction
    .filter((r) => r.order_id === order.order_id)
    .reduce((s, r) => s + (Number(r.quantity_completed) || 0), 0);
  const shipped = allDelivery
    .filter((r) => r.order_id === order.order_id)
    .reduce((s, r) => s + (Number(r.quantity_shipped) || 0), 0);
  if (shipped > produced) {
    flags.push(
      `Total dikirim (${shipped.toLocaleString('id-ID')} pcs) lebih banyak dari total produksi tercatat (${produced.toLocaleString('id-ID')} pcs).`
    );
  }
  if (!record.delivery_note) {
    flags.push('Nomor surat jalan belum diisi.');
  }
  return flags;
}

/**
 * Jawaban otomatis dari kalkulasi data aplikasi (dipakai bila Gemini AI tidak tersedia).
 * Bukan jawaban AI — label sumbernya ditampilkan di UI.
 */
export function generateBeeshaAIResponse(
  query: string,
  orders: Order[],
  productionRecords: ProductionRecord[],
  deliveryRecords: DeliveryRecord[],
  partners: Partner[],
  products: Product[]
): string {
  const q = query.toLowerCase().trim();
  const metrics = calculateDashboardMetrics(orders, productionRecords, deliveryRecords);

  if (q.includes('aktif') || q.includes('berapa pesanan')) {
    const activeList = orders
      .filter((o) => calculateSingleOrderProgress(o, productionRecords, deliveryRecords).computedStatus !== 'selesai')
      .map((o) => {
        const p = partners.find((pt) => pt.partner_id === o.partner_id)?.partner_name || 'Mitra';
        return `• ${o.order_id} (${p}): dipesan ${o.quantity_ordered.toLocaleString('id-ID')} pcs, target kirim ${o.due_date}`;
      })
      .slice(0, 4)
      .join('\n');

    return `Saat ini ada ${metrics.activeOrdersCount} pesanan yang belum selesai dikirim:\n\n${activeList}`;
  }

  if (q.includes('kirim') || q.includes('sudah dikirim')) {
    return `Total barang yang tercatat sudah dikirim: ${metrics.totalShippedQty.toLocaleString('id-ID')} pcs dari ${metrics.totalOrderedQty.toLocaleString('id-ID')} pcs yang dipesan (${metrics.overallDeliveryRate}%).\n\nAngka ini termasuk catatan yang belum diperiksa supervisor.`;
  }

  if (q.includes('belum selesai') || q.includes('sisa') || q.includes('produksi')) {
    const pendingOrders = orders
      .map((o) => ({ order: o, prog: calculateSingleOrderProgress(o, productionRecords, deliveryRecords) }))
      .filter((item) => item.prog.remainingProduction > 0 || item.prog.remainingDelivery > 0);

    if (pendingOrders.length === 0) {
      return 'Semua pesanan yang tercatat sudah selesai diproduksi dan dikirim.';
    }

    const details = pendingOrders
      .slice(0, 3)
      .map((item) => {
        const p = partners.find((pt) => pt.partner_id === item.order.partner_id)?.partner_name;
        const pr = products.find((prod) => prod.product_id === item.order.product_id)?.product_name;
        return `• ${item.order.order_id} (${p} – ${pr}): sisa produksi ${item.prog.remainingProduction.toLocaleString('id-ID')} pcs, sisa kirim ${item.prog.remainingDelivery.toLocaleString('id-ID')} pcs.`;
      })
      .join('\n');

    return `Ada ${pendingOrders.length} pesanan yang masih berjalan:\n\n${details}`;
  }

  if (q.includes('peringatan') || q.includes('perhatian') || q.includes('terlambat')) {
    const alerts = deriveOperationalAlerts(orders, productionRecords, deliveryRecords, partners);
    if (alerts.length === 0) {
      return 'Saat ini tidak ada pesanan yang terlambat atau mendekati tenggat.';
    }
    const alertSummary = alerts
      .slice(0, 3)
      .map((a) => `• ${a.title} — ${a.partner_name} (${a.order_id}): ${a.description}`)
      .join('\n');

    return `Ada ${alerts.length} pesanan yang perlu diperhatikan:\n\n${alertSummary}`;
  }

  return `Ringkasan saat ini: ${metrics.activeOrdersCount} pesanan berjalan, ${metrics.totalProducedQty.toLocaleString('id-ID')} pcs tercatat diproduksi, dan ${metrics.totalShippedQty.toLocaleString('id-ID')} pcs tercatat dikirim.\n\nAnda bisa bertanya tentang pesanan aktif, sisa produksi, pengiriman, atau pesanan yang terlambat.`;
}
