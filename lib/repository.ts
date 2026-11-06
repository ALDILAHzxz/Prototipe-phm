// ---------------------------------------------------------------------------
// LAPISAN PENYIMPANAN DATA OPERASIONAL
//
// Semua penyimpanan lewat interface `OperationsRepository`. Implementasi saat ini
// menyimpan ke penyimpanan browser (localStorage) di perangkat pengguna —
// BUKAN server, BUKAN INDIGO, BUKAN BHEESA. Ketika backend/INDIGO tersedia,
// cukup buat implementasi baru (mis. `HttpOperationsRepository`) dengan kontrak
// yang sama; komponen UI tidak perlu diubah.
//
// Setiap operasi tulis:
//   1. membaca data terbaru dari penyimpanan,
//   2. menjalankan ulang validasi (sumber kebenaran, bukan hanya di form),
//   3. memberi ID, waktu input, sumber, dan status pemeriksaan,
//   4. mengecek client_ref agar tekan-simpan berulang tidak membuat data ganda.
// ---------------------------------------------------------------------------
import {
  Order,
  ProductionRecord,
  DeliveryRecord,
  VerificationStatus,
  RecordRevision,
} from '../types';
import { createSeedData } from '../data/mockData';
import {
  calculateSingleOrderProgress,
  validateOrderInput,
  validateProductionForm,
  validateDeliveryForm,
  MAX_QTY_PER_ENTRY,
} from '../utils/operations';
import { todayISODate } from './format';

export const STORAGE_KEY = 'phm-prototipe:data:v1';
const SCHEMA_VERSION = 1;

export interface OperationsSnapshot {
  schema_version: number;
  orders: Order[];
  productionRecords: ProductionRecord[];
  deliveryRecords: DeliveryRecord[];
  /** Waktu terakhir ada perubahan data (ISO). */
  updated_at: string;
  /** Tanggal data contoh dibuat. */
  seeded_on: string;
}

export type SaveResult<T> =
  | { ok: true; record: T; duplicate?: boolean; snapshot: OperationsSnapshot }
  | { ok: false; reason: 'validation'; errors: Record<string, string> }
  | { ok: false; reason: 'storage'; message: string };

export interface NewOrderInput {
  partner_id: string;
  po_number: string;
  product_id: string;
  quantity_ordered: number;
  order_date: string;
  due_date: string;
  pic_mitra?: string;
  notes?: string;
}

export interface NewProductionInput {
  order_id: string;
  quantity_completed: number;
  reject_qty: number;
  reported_at: string;
  notes?: string;
}

export interface NewDeliveryInput {
  order_id: string;
  quantity_shipped: number;
  shipped_at: string;
  delivery_note?: string;
  notes?: string;
}

export type RecordKind = 'produksi' | 'pengiriman';

export interface CorrectionInput {
  quantity: number;
  reject_qty?: number;
  delivery_note?: string;
  notes?: string;
  reason: string;
}

/** Jenis penyimpanan, ditampilkan apa adanya kepada pengguna. */
export type StorageKind = 'perangkat_ini' | 'sementara';

export interface OperationsRepository {
  readonly storageKind: StorageKind;
  load(): Promise<OperationsSnapshot>;
  createOrder(input: NewOrderInput, actor: string, clientRef: string): Promise<SaveResult<Order>>;
  createProduction(input: NewProductionInput, actor: string, clientRef: string): Promise<SaveResult<ProductionRecord>>;
  createDelivery(input: NewDeliveryInput, actor: string, clientRef: string): Promise<SaveResult<DeliveryRecord>>;
  setVerification(
    kind: RecordKind,
    id: string,
    status: VerificationStatus,
    note: string,
    actor: string
  ): Promise<SaveResult<ProductionRecord | DeliveryRecord>>;
  correctRecord(
    kind: RecordKind,
    id: string,
    input: CorrectionInput,
    actor: string
  ): Promise<SaveResult<ProductionRecord | DeliveryRecord>>;
  resetToSampleData(): Promise<OperationsSnapshot>;
}

// ---------------------------------------------------------------------------

function nextSequence(ids: string[], prefix: string): number {
  let max = 0;
  for (const id of ids) {
    const m = id.match(/(\d+)$/);
    if (m && id.startsWith(prefix)) max = Math.max(max, Number(m[1]));
  }
  return max + 1;
}

function createSnapshot(): OperationsSnapshot {
  const today = todayISODate();
  const seed = createSeedData(today);
  return {
    schema_version: SCHEMA_VERSION,
    ...seed,
    updated_at: new Date().toISOString(),
    seeded_on: today,
  };
}

function isSnapshot(value: unknown): value is OperationsSnapshot {
  const v = value as OperationsSnapshot;
  return (
    !!v &&
    v.schema_version === SCHEMA_VERSION &&
    Array.isArray(v.orders) &&
    Array.isArray(v.productionRecords) &&
    Array.isArray(v.deliveryRecords)
  );
}

class BrowserOperationsRepository implements OperationsRepository {
  storageKind: StorageKind = 'perangkat_ini';
  private memory: OperationsSnapshot | null = null;

  constructor() {
    try {
      const probe = '__phm_probe__';
      window.localStorage.setItem(probe, '1');
      window.localStorage.removeItem(probe);
    } catch {
      // Mode privat / penyimpanan diblokir: data hanya bertahan selama tab terbuka.
      this.storageKind = 'sementara';
    }
  }

  private read(): OperationsSnapshot {
    if (this.storageKind === 'sementara') {
      if (!this.memory) this.memory = createSnapshot();
      return this.memory;
    }
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (isSnapshot(parsed)) return parsed;
      } catch {
        // data rusak: jangan dihapus diam-diam, simpan cadangan lalu mulai ulang
        window.localStorage.setItem(`${STORAGE_KEY}:rusak:${Date.now()}`, raw);
      }
    }
    const fresh = createSnapshot();
    this.write(fresh);
    return fresh;
  }

  /** Melempar error jika gagal menulis; pemanggil mengubahnya menjadi pesan yang jelas. */
  private write(snapshot: OperationsSnapshot) {
    if (this.storageKind === 'sementara') {
      this.memory = snapshot;
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  }

  private commit<T>(snapshot: OperationsSnapshot, record: T): SaveResult<T> {
    const next = { ...snapshot, updated_at: new Date().toISOString() };
    try {
      this.write(next);
    } catch {
      return {
        ok: false,
        reason: 'storage',
        message:
          'Data BELUM tersimpan karena penyimpanan perangkat penuh atau diblokir. Isian Anda masih ada di layar — coba tekan simpan lagi, atau hubungi admin.',
      };
    }
    return { ok: true, record, snapshot: next };
  }

  async load() {
    return this.read();
  }

  async createOrder(input: NewOrderInput, actor: string, clientRef: string): Promise<SaveResult<Order>> {
    const snap = this.read();
    const existing = snap.orders.find((o) => o.client_ref === clientRef);
    if (existing) return { ok: true, record: existing, duplicate: true, snapshot: snap };

    const v = validateOrderInput(input, snap.orders);
    if (!v.isValid) return { ok: false, reason: 'validation', errors: v.errors };

    const seq = nextSequence(snap.orders.map((o) => o.order_id), 'ORD-');
    const order: Order = {
      order_id: `ORD-${String(seq).padStart(4, '0')}`,
      partner_id: input.partner_id,
      po_number: input.po_number.trim(),
      product_id: input.product_id,
      quantity_ordered: Number(input.quantity_ordered),
      order_date: input.order_date,
      due_date: input.due_date,
      order_status: 'baru',
      pic_mitra: input.pic_mitra?.trim() || undefined,
      notes: input.notes?.trim() || undefined,
      created_by: actor,
      created_at: new Date().toISOString(),
      source: 'form_aplikasi',
      client_ref: clientRef,
      synced_at: null,
    };
    return this.commit({ ...snap, orders: [order, ...snap.orders] }, order);
  }

  async createProduction(
    input: NewProductionInput,
    actor: string,
    clientRef: string
  ): Promise<SaveResult<ProductionRecord>> {
    const snap = this.read();
    const existing = snap.productionRecords.find((r) => r.client_ref === clientRef);
    if (existing) return { ok: true, record: existing, duplicate: true, snapshot: snap };

    const order = snap.orders.find((o) => o.order_id === input.order_id);
    const progress = order
      ? calculateSingleOrderProgress(order, snap.productionRecords, snap.deliveryRecords)
      : undefined;
    const v = validateProductionForm(
      {
        order_id: order ? input.order_id : '',
        quantity_completed: input.quantity_completed,
        reject_qty: input.reject_qty,
        reported_at: input.reported_at,
      },
      progress
    );
    if (Object.keys(v.errors).length) return { ok: false, reason: 'validation', errors: v.errors };

    const seq = nextSequence(snap.productionRecords.map((r) => r.production_id), 'PRD-REC-');
    const record: ProductionRecord = {
      production_id: `PRD-REC-${String(seq).padStart(3, '0')}`,
      order_id: input.order_id,
      quantity_completed: Number(input.quantity_completed),
      reject_qty: Number(input.reject_qty) > 0 ? Number(input.reject_qty) : undefined,
      reported_at: input.reported_at,
      recorded_by: actor,
      notes: input.notes?.trim() || undefined,
      created_at: new Date().toISOString(),
      source: 'form_aplikasi',
      client_ref: clientRef,
      synced_at: null,
      verification_status: 'menunggu_pemeriksaan',
    };
    return this.commit({ ...snap, productionRecords: [record, ...snap.productionRecords] }, record);
  }

  async createDelivery(
    input: NewDeliveryInput,
    actor: string,
    clientRef: string
  ): Promise<SaveResult<DeliveryRecord>> {
    const snap = this.read();
    const existing = snap.deliveryRecords.find((r) => r.client_ref === clientRef);
    if (existing) return { ok: true, record: existing, duplicate: true, snapshot: snap };

    const order = snap.orders.find((o) => o.order_id === input.order_id);
    const progress = order
      ? calculateSingleOrderProgress(order, snap.productionRecords, snap.deliveryRecords)
      : undefined;
    const v = validateDeliveryForm(
      {
        order_id: order ? input.order_id : '',
        quantity_shipped: input.quantity_shipped,
        shipped_at: input.shipped_at,
        delivery_note: input.delivery_note || '',
      },
      progress,
      snap.deliveryRecords
    );
    if (Object.keys(v.errors).length) return { ok: false, reason: 'validation', errors: v.errors };

    const seq = nextSequence(snap.deliveryRecords.map((r) => r.delivery_id), 'KRM-');
    const record: DeliveryRecord = {
      delivery_id: `KRM-${String(seq).padStart(4, '0')}`,
      order_id: input.order_id,
      quantity_shipped: Number(input.quantity_shipped),
      shipped_at: input.shipped_at,
      delivery_note: input.delivery_note?.trim() || undefined,
      recorded_by: actor,
      notes: input.notes?.trim() || undefined,
      created_at: new Date().toISOString(),
      source: 'form_aplikasi',
      client_ref: clientRef,
      synced_at: null,
      verification_status: 'menunggu_pemeriksaan',
    };
    return this.commit({ ...snap, deliveryRecords: [record, ...snap.deliveryRecords] }, record);
  }

  async setVerification(
    kind: RecordKind,
    id: string,
    status: VerificationStatus,
    note: string,
    actor: string
  ): Promise<SaveResult<ProductionRecord | DeliveryRecord>> {
    const snap = this.read();
    if (status === 'perlu_diperbaiki' && !note.trim()) {
      return {
        ok: false,
        reason: 'validation',
        errors: { verification_note: 'Tulis apa yang perlu diperbaiki agar pencatat tahu.' },
      };
    }
    const stamp = {
      verification_status: status,
      verified_by: actor,
      verified_at: new Date().toISOString(),
      verification_note: note.trim() || undefined,
    };
    if (kind === 'produksi') {
      const target = snap.productionRecords.find((r) => r.production_id === id);
      if (!target) return { ok: false, reason: 'validation', errors: { record: 'Catatan tidak ditemukan.' } };
      const updated = { ...target, ...stamp };
      return this.commit(
        { ...snap, productionRecords: snap.productionRecords.map((r) => (r.production_id === id ? updated : r)) },
        updated
      );
    }
    const target = snap.deliveryRecords.find((r) => r.delivery_id === id);
    if (!target) return { ok: false, reason: 'validation', errors: { record: 'Catatan tidak ditemukan.' } };
    const updated = { ...target, ...stamp };
    return this.commit(
      { ...snap, deliveryRecords: snap.deliveryRecords.map((r) => (r.delivery_id === id ? updated : r)) },
      updated
    );
  }

  async correctRecord(
    kind: RecordKind,
    id: string,
    input: CorrectionInput,
    actor: string
  ): Promise<SaveResult<ProductionRecord | DeliveryRecord>> {
    const snap = this.read();
    const errors: Record<string, string> = {};
    const qty = Number(input.quantity);
    if (!Number.isInteger(qty) || qty <= 0) errors.quantity = 'Jumlah harus angka bulat lebih dari 0.';
    else if (qty > MAX_QTY_PER_ENTRY) errors.quantity = 'Jumlah terlalu besar. Periksa jumlah angka nol.';
    if (!input.reason.trim()) errors.reason = 'Tulis alasan koreksi (mis. salah hitung di lapangan).';
    const now = new Date().toISOString();

    if (kind === 'produksi') {
      const target = snap.productionRecords.find((r) => r.production_id === id);
      if (!target) return { ok: false, reason: 'validation', errors: { record: 'Catatan tidak ditemukan.' } };
      const reject = Number(input.reject_qty ?? 0);
      if (!Number.isInteger(reject) || reject < 0) errors.reject_qty = 'Jumlah cacat harus angka bulat 0 atau lebih.';
      if (Object.keys(errors).length) return { ok: false, reason: 'validation', errors };

      const changes: RecordRevision['changes'] = {};
      if (target.quantity_completed !== qty) changes.quantity_completed = { from: target.quantity_completed, to: qty };
      if ((target.reject_qty ?? 0) !== reject) changes.reject_qty = { from: target.reject_qty ?? 0, to: reject };
      if ((target.notes ?? '') !== (input.notes ?? '').trim())
        changes.notes = { from: target.notes ?? null, to: (input.notes ?? '').trim() || null };
      const updated: ProductionRecord = {
        ...target,
        quantity_completed: qty,
        reject_qty: reject > 0 ? reject : undefined,
        notes: (input.notes ?? '').trim() || undefined,
        updated_at: now,
        updated_by: actor,
        revisions: [...(target.revisions ?? []), { at: now, by: actor, reason: input.reason.trim(), changes }],
        verification_status: 'menunggu_pemeriksaan',
      };
      return this.commit(
        { ...snap, productionRecords: snap.productionRecords.map((r) => (r.production_id === id ? updated : r)) },
        updated
      );
    }

    const target = snap.deliveryRecords.find((r) => r.delivery_id === id);
    if (!target) return { ok: false, reason: 'validation', errors: { record: 'Catatan tidak ditemukan.' } };
    const order = snap.orders.find((o) => o.order_id === target.order_id);
    if (order && !errors.quantity) {
      const otherShipped = snap.deliveryRecords
        .filter((r) => r.order_id === order.order_id && r.delivery_id !== id)
        .reduce((s, r) => s + r.quantity_shipped, 0);
      const allowed = order.quantity_ordered - otherShipped;
      if (qty > allowed) {
        errors.quantity = `Jumlah melebihi sisa pesanan yang boleh dikirim (${allowed.toLocaleString('id-ID')} pcs).`;
      }
    }
    const note = (input.delivery_note ?? '').trim();
    if (note) {
      const dup = snap.deliveryRecords.find(
        (r) => r.delivery_id !== id && (r.delivery_note || '').trim().toUpperCase() === note.toUpperCase()
      );
      if (dup) errors.delivery_note = `Nomor surat jalan sudah dipakai pada ${dup.delivery_id}.`;
    }
    if (Object.keys(errors).length) return { ok: false, reason: 'validation', errors };

    const changes: RecordRevision['changes'] = {};
    if (target.quantity_shipped !== qty) changes.quantity_shipped = { from: target.quantity_shipped, to: qty };
    if ((target.delivery_note ?? '') !== note) changes.delivery_note = { from: target.delivery_note ?? null, to: note || null };
    if ((target.notes ?? '') !== (input.notes ?? '').trim())
      changes.notes = { from: target.notes ?? null, to: (input.notes ?? '').trim() || null };
    const updated: DeliveryRecord = {
      ...target,
      quantity_shipped: qty,
      delivery_note: note || undefined,
      notes: (input.notes ?? '').trim() || undefined,
      updated_at: now,
      updated_by: actor,
      revisions: [...(target.revisions ?? []), { at: now, by: actor, reason: input.reason.trim(), changes }],
      verification_status: 'menunggu_pemeriksaan',
    };
    return this.commit(
      { ...snap, deliveryRecords: snap.deliveryRecords.map((r) => (r.delivery_id === id ? updated : r)) },
      updated
    );
  }

  async resetToSampleData() {
    const fresh = createSnapshot();
    this.write(fresh);
    return fresh;
  }
}

let instance: OperationsRepository | null = null;

/** Repository tunggal untuk aplikasi (hanya dipanggil di browser). */
export function getOperationsRepository(): OperationsRepository {
  if (!instance) instance = new BrowserOperationsRepository();
  return instance;
}

/** Kunci unik sesi form untuk mencegah penyimpanan ganda. */
export function newClientRef(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `ref-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
