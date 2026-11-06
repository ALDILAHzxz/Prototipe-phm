import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateOrderInput,
  validateProductionForm,
  validateDeliveryForm,
  calculatePeriodSummary,
  calculateSingleOrderProgress,
  getVerificationStatus,
  deriveOperationalAlerts,
} from './operations';
import { Order, DeliveryRecord, ProductionRecord } from '../types';

const order: Order = {
  order_id: 'ORD-0001',
  partner_id: 'PT-01',
  po_number: 'PO-A-1',
  product_id: 'PRD-01',
  quantity_ordered: 100,
  order_date: '2026-11-01',
  due_date: '2026-11-10',
  order_status: 'baru',
  created_by: 'Admin',
};

test('pesanan: PO yang sama untuk mitra yang sama ditolak (tanpa beda huruf besar/kecil)', () => {
  const r = validateOrderInput(
    { partner_id: 'PT-01', po_number: 'po-a-1', product_id: 'PRD-01', quantity_ordered: 5, due_date: '2026-11-20', order_date: '2026-11-01' },
    [order]
  );
  assert.equal(r.isValid, false);
  assert.match(r.errors.po_number, /sudah tercatat/);
  const other = validateOrderInput(
    { partner_id: 'PT-02', po_number: 'PO-A-1', product_id: 'PRD-01', quantity_ordered: 5, due_date: '2026-11-20', order_date: '2026-11-01' },
    [order]
  );
  assert.equal(other.isValid, true);
});

test('pesanan: target kirim sebelum tanggal pesanan & jumlah desimal ditolak', () => {
  const r = validateOrderInput(
    { partner_id: 'PT-01', po_number: 'X', product_id: 'PRD-01', quantity_ordered: 2.5, due_date: '2026-10-01', order_date: '2026-11-01' },
    []
  );
  assert.ok(r.errors.due_date);
  assert.ok(r.errors.quantity_ordered);
});

test('produksi: melebihi target hanya peringatan; cacat negatif & waktu masa depan ditolak', () => {
  const progress = calculateSingleOrderProgress(order, [], []);
  const over = validateProductionForm(
    { order_id: 'ORD-0001', quantity_completed: '150', reject_qty: '', reported_at: '2026-11-05T10:00' },
    progress,
    '2026-11-06T00:00:00Z'
  );
  assert.deepEqual(over.errors, {});
  assert.equal(over.warnings.length, 1);
  const bad = validateProductionForm(
    { order_id: 'ORD-0001', quantity_completed: '10', reject_qty: '-1', reported_at: '2030-01-01T10:00' },
    progress,
    '2026-11-06T00:00:00Z'
  );
  assert.ok(bad.errors.reject_qty);
  assert.ok(bad.errors.reported_at);
});

test('pengiriman: nomor surat jalan ganda ditolak', () => {
  const existing: DeliveryRecord[] = [
    { delivery_id: 'KRM-0001', order_id: 'ORD-0001', quantity_shipped: 10, shipped_at: '2026-11-02', delivery_note: 'SJ-1', recorded_by: 'x' },
  ];
  const progress = calculateSingleOrderProgress(order, [], existing);
  const r = validateDeliveryForm(
    { order_id: 'ORD-0001', quantity_shipped: '5', shipped_at: '2026-11-05T10:00', delivery_note: 'sj-1' },
    progress,
    existing,
    '2026-11-06T00:00:00Z'
  );
  assert.ok(r.errors.delivery_note);
});

test('ringkasan periode memisahkan angka tercatat dan terverifikasi', () => {
  const prod: ProductionRecord[] = [
    { production_id: 'a', order_id: 'ORD-0001', quantity_completed: 30, reported_at: '2026-11-03T08:00', recorded_by: 'x', verification_status: 'terverifikasi' },
    { production_id: 'b', order_id: 'ORD-0001', quantity_completed: 20, reported_at: '2026-11-04T08:00', recorded_by: 'x' },
    { production_id: 'c', order_id: 'ORD-0001', quantity_completed: 99, reported_at: '2026-10-01T08:00', recorded_by: 'x' },
  ];
  const s = calculatePeriodSummary([order], prod, [], '2026-11-01', '2026-11-06');
  assert.equal(s.producedInPeriod, 50);
  assert.equal(s.producedVerifiedInPeriod, 30);
  assert.equal(s.ordersInPeriod, 1);
  assert.equal(getVerificationStatus(prod[1]), 'menunggu_pemeriksaan');
});

test('peringatan memakai tanggal yang diberikan', () => {
  const alerts = deriveOperationalAlerts([order], [], [], [], '2026-11-12');
  assert.equal(alerts[0].severity, 'terlambat');
  const soon = deriveOperationalAlerts([order], [], [], [], '2026-11-08');
  assert.equal(soon[0].severity, 'mendekati');
});
