import {
  Order,
  ProductionRecord,
  DeliveryRecord,
  OrderStatus,
  AlertItem,
  Partner,
  Product,
} from '../types';

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

/**
 * Calculates accurate metrics for an individual order based on production and delivery records.
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
  } else {
    computedStatus = 'baru';
    stage = 'diterima';
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

/**
 * Computes top-level KPI metrics for the Beesha Dashboard.
 */
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

/**
 * Evaluates simulated orders to detect operational alerts requiring human attention.
 */
export function deriveOperationalAlerts(
  orders: Order[],
  productionRecords: ProductionRecord[],
  deliveryRecords: DeliveryRecord[],
  partners: Partner[],
  currentDateStr: string = '2026-11-06'
): AlertItem[] {
  const alerts: AlertItem[] = [];
  const now = new Date(currentDateStr).getTime();

  for (const order of orders) {
    const metrics = calculateSingleOrderProgress(order, productionRecords, deliveryRecords);
    if (metrics.computedStatus === 'selesai') continue;

    const partner = partners.find((p) => p.partner_id === order.partner_id);
    const partnerName = partner ? partner.partner_name : 'Mitra Tidak Dikenal';

    const dueTime = new Date(order.due_date).getTime();
    const diffDays = Math.ceil((dueTime - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      alerts.push({
        id: `alert-overdue-${order.order_id}`,
        title: 'Pesanan Melewati Tenggat Pengiriman',
        partner_name: partnerName,
        order_id: order.order_id,
        po_number: order.po_number,
        severity: 'terlambat',
        description: `Tenggat pengiriman terlampaui ${Math.abs(diffDays)} hari. Sisa pengiriman ${metrics.remainingDelivery} pcs.`,
        remaining_qty: metrics.remainingDelivery,
        due_date: order.due_date,
      });
    } else if (diffDays <= 3) {
      alerts.push({
        id: `alert-approaching-${order.order_id}`,
        title: 'Mendekati Tenggat Waktu Pengiriman',
        partner_name: partnerName,
        order_id: order.order_id,
        po_number: order.po_number,
        severity: 'mendekati',
        description: `Jatuh tempo dalam ${diffDays} hari. Sisa ${metrics.remainingDelivery} pcs belum terkirim.`,
        remaining_qty: metrics.remainingDelivery,
        due_date: order.due_date,
      });
    } else if (metrics.totalProduced > metrics.totalShipped) {
      // Ready to ship notice
      const readyToShip = metrics.totalProduced - metrics.totalShipped;
      alerts.push({
        id: `alert-ready-${order.order_id}`,
        title: 'Barang Jadi Siap Dikirim ke Mitra',
        partner_name: partnerName,
        order_id: order.order_id,
        po_number: order.po_number,
        severity: 'tindakan',
        description: `${readyToShip} pcs barang selesai dibuat dan siap dijadwalkan pengiriman.`,
        remaining_qty: readyToShip,
        due_date: order.due_date,
      });
    }
  }

  return alerts;
}

/**
 * Validates Order input form fields
 */
export function validateOrderInput(data: {
  partner_id: string;
  po_number: string;
  product_id: string;
  quantity_ordered: number;
  due_date: string;
}): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (!data.partner_id || data.partner_id.trim() === '') {
    errors.partner_id = 'Pilih nama mitra terlebih dahulu.';
  }
  if (!data.po_number || data.po_number.trim() === '') {
    errors.po_number = 'Nomor PO mitra wajib diisi.';
  }
  if (!data.product_id || data.product_id.trim() === '') {
    errors.product_id = 'Pilih barang atau part yang dipesan.';
  }
  if (!data.quantity_ordered || Number(data.quantity_ordered) <= 0) {
    errors.quantity_ordered = 'Jumlah pesanan harus lebih dari 0 pcs.';
  }
  if (!data.due_date || data.due_date.trim() === '') {
    errors.due_date = 'Target tanggal pengiriman wajib ditentukan.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates Production input form fields
 */
export function validateProductionInput(
  orderId: string,
  quantityCompleted: number,
  orderProgress?: OrderProgressMetrics
): { isValid: boolean; error?: string; warning?: string } {
  if (!orderId || orderId.trim() === '') {
    return { isValid: false, error: 'Pilih nomor pesanan yang akan dicatat hasil produksinya.' };
  }

  const qty = Number(quantityCompleted);
  if (isNaN(qty) || qty <= 0) {
    return { isValid: false, error: 'Jumlah produksi harus lebih dari 0 pcs.' };
  }

  if (!Number.isInteger(qty)) {
    return { isValid: false, error: 'Jumlah produksi harus berupa angka bulat.' };
  }

  let warning: string | undefined;
  if (orderProgress && qty > orderProgress.remainingProduction) {
    warning = `Jumlah yang dimasukkan (${qty} pcs) melebihi sisa target produksi (${orderProgress.remainingProduction} pcs). Pastikan ada persetujuan lembur/ekstra.`;
  }

  return { isValid: true, warning };
}

/**
 * Validates Delivery input form fields
 */
export function validateDeliveryInput(
  orderId: string,
  quantityShipped: number,
  orderProgress?: OrderProgressMetrics
): { isValid: boolean; error?: string; warning?: string } {
  if (!orderId || orderId.trim() === '') {
    return { isValid: false, error: 'Pilih nomor pesanan yang akan dikirim.' };
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
        error: `Jumlah kirim (${qty} pcs) melebihi sisa pesanan yang belum dikirim (${orderProgress.remainingDelivery} pcs).`,
      };
    }

    const availableProduced = orderProgress.totalProduced - orderProgress.totalShipped;
    if (qty > availableProduced) {
      return {
        isValid: true,
        warning: `Jumlah kirim (${qty} pcs) melebihi stok barang jadi tercatat (${Math.max(0, availableProduced)} pcs). Mohon pastikan unit fisik sudah diverifikasi di gudang.`,
      };
    }
  }

  return { isValid: true };
}

/**
 * Generates an accurate, simulated answer from Beesha AI based on the current live state
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
      .filter((o) => {
        const prog = calculateSingleOrderProgress(o, productionRecords, deliveryRecords);
        return prog.computedStatus !== 'selesai';
      })
      .map((o) => {
        const p = partners.find((pt) => pt.partner_id === o.partner_id)?.partner_name || 'Mitra';
        return `• ${o.order_id} (${p}): Target ${o.quantity_ordered} pcs, jatuh tempo ${o.due_date}`;
      })
      .slice(0, 4)
      .join('\n');

    return `Saat ini terdapat **${metrics.activeOrdersCount} pesanan aktif** yang sedang berjalan dalam sistem operasional BEESHA:\n\n${activeList}\n\n*Catatan: Seluruh data di atas berasal dari model data simulasi PHM Group.*`;
  }

  if (q.includes('kirim') || q.includes('sudah dikirim')) {
    return `Total akumulasi barang yang telah dikirim ke seluruh mitra tercatat sebanyak **${metrics.totalShippedQty.toLocaleString('id-ID')} pcs** dari total ${metrics.totalOrderedQty.toLocaleString('id-ID')} pcs dipesan (tingkat pemenuhan: ${metrics.overallDeliveryRate}%).\n\nAnda dapat meninjau rincian Surat Jalan pada menu **Pengiriman** atau **Riwayat Aktivitas**.`;
  }

  if (q.includes('belum selesai') || q.includes('sisa') || q.includes('produksi')) {
    const pendingOrders = orders
      .map((o) => ({
        order: o,
        prog: calculateSingleOrderProgress(o, productionRecords, deliveryRecords),
      }))
      .filter((item) => item.prog.remainingProduction > 0 || item.prog.remainingDelivery > 0);

    if (pendingOrders.length === 0) {
      return `Semua pesanan yang tercatat saat ini telah selesai diproduksi dan dikirim.`;
    }

    const details = pendingOrders
      .slice(0, 3)
      .map((item) => {
        const p = partners.find((pt) => pt.partner_id === item.order.partner_id)?.partner_name;
        const pr = products.find((prod) => prod.product_id === item.order.product_id)?.product_name;
        return `• **${item.order.order_id}** (${p} - ${pr}): Sisa produksi ${item.prog.remainingProduction} pcs, sisa kirim ${item.prog.remainingDelivery} pcs.`;
      })
      .join('\n');

    return `Terdapat **${pendingOrders.length} pesanan** dengan target yang masih perlu diselesaikan:\n\n${details}\n\nSilakan gunakan menu **Catat Produksi** atau **Catat Pengiriman** untuk memperbarui status.`;
  }

  if (q.includes('peringatan') || q.includes('perhatian') || q.includes('terlambat')) {
    const alerts = deriveOperationalAlerts(orders, productionRecords, deliveryRecords, partners);
    if (alerts.length === 0) {
      return `Saat ini tidak ada peringatan operasional yang memerlukan tindak lanjut darurat. Seluruh jadwal berjalan sesuai rencana.`;
    }
    const alertSummary = alerts
      .slice(0, 3)
      .map((a) => `• [${a.severity.toUpperCase()}] **${a.title}** (${a.partner_name} - ${a.order_id}): ${a.description}`)
      .join('\n');

    return `Ditemukan **${alerts.length} item operasional** yang perlu diperhatikan:\n\n${alertSummary}\n\nBuka menu **Pusat Peringatan** untuk detail selengkapnya.`;
  }

  return `Halo! Saya **Beesha Assistant**, siap membantu Anda memantau operasional PHM Group. Saat ini terdapat **${metrics.activeOrdersCount} pesanan aktif**, **${metrics.totalProducedQty} pcs** selesai diproduksi, dan **${metrics.totalShippedQty} pcs** telah dikirim.\n\nAnda dapat bertanya mengenai pesanan aktif, sisa produksi, pengiriman barang, atau peringatan tenggat waktu.`;
}
