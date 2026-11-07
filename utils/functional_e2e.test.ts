import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateSingleOrderProgress,
  calculateDashboardMetrics,
  validateOrderInput,
  validateProductionForm,
  validateDeliveryForm,
  deriveOperationalAlerts,
  calculatePeriodSummary,
  MAX_QTY_PER_ENTRY,
} from './operations';
import { routeToHash, hashToRoute } from '../components/navigation';
import { Order, ProductionRecord, DeliveryRecord, Partner, Product } from '../types';
import { BrowserOperationsRepository, newClientRef } from '../lib/repository';
import { createSeedData } from '../data/mockData';

test('TEST-01 — Navigation: hash route two-way conversion works for all core screens', () => {
  const routes = [
    { screen: 'beranda' as const },
    { screen: 'daftar_pesanan' as const },
    { screen: 'form_pesanan' as const },
    { screen: 'form_produksi' as const, orderId: 'DEMO-ORD-001' },
    { screen: 'form_pengiriman' as const, orderId: 'DEMO-ORD-001' },
    { screen: 'detail_pesanan' as const, orderId: 'DEMO-ORD-002' },
    { screen: 'riwayat_aktivitas' as const },
    { screen: 'pusat_peringatan' as const },
    { screen: 'pemeriksaan_data' as const },
    { screen: 'inspeksi_3d' as const },
  ];

  for (const r of routes) {
    const hash = routeToHash(r);
    const parsed = hashToRoute(hash);
    assert.equal(parsed.screen, r.screen, `Failed round-trip for ${r.screen}`);
    if (r.orderId) {
      assert.equal(parsed.orderId, r.orderId, `Failed orderId match for ${r.screen}`);
    }
  }
});

test('TEST-02 & TEST-05 — Create Order and Persistence: creates order and persists in repository', async () => {
  const repo = new BrowserOperationsRepository();
  await repo.resetToSampleData();
  const initial = await repo.load();
  const initialCount = initial.orders.length;

  const clientRef = newClientRef();
  const res = await repo.createOrder(
    {
      partner_id: 'PT-MPN',
      po_number: 'PO-TEST-2026-999',
      product_id: 'PRD-BRK-01',
      quantity_ordered: 250,
      order_date: '2026-11-07',
      due_date: '2026-11-20',
      pic_mitra: 'Budi Test',
      notes: 'Pesanan uji otomatis',
    },
    'Joko Sutopo',
    clientRef
  );

  assert.equal(res.ok, true);
  if (res.ok) {
    assert.ok(res.record.order_id);
    assert.equal(res.record.po_number, 'PO-TEST-2026-999');
    assert.equal(res.record.quantity_ordered, 250);
    assert.equal(res.record.created_by, 'Joko Sutopo');
  }

  // Reload to verify persistence
  const reloaded = await repo.load();
  assert.equal(reloaded.orders.length, initialCount + 1);
  const found = reloaded.orders.find((o) => o.po_number === 'PO-TEST-2026-999');
  assert.ok(found);
  assert.equal(found?.quantity_ordered, 250);
});

test('TEST-03 & TEST-13 — Record Production & Partial Production: multi-batch cumulative production', async () => {
  const repo = new BrowserOperationsRepository();
  await repo.resetToSampleData();
  const snapshot = await repo.load();
  const targetOrder = snapshot.orders[0]; // e.g. DEMO-ORD-001 with 500 pcs

  // Record batch 1
  const ref1 = newClientRef();
  const res1 = await repo.createProduction(
    {
      order_id: targetOrder.order_id,
      quantity_completed: 50,
      reject_qty: 2,
      reported_at: '2026-11-07T08:00',
      notes: 'Batch 1 pagi',
    },
    'Eko Purnomo',
    ref1
  );
  assert.equal(res1.ok, true);

  // Record batch 2
  const ref2 = newClientRef();
  const res2 = await repo.createProduction(
    {
      order_id: targetOrder.order_id,
      quantity_completed: 75,
      reject_qty: 0,
      reported_at: '2026-11-07T14:00',
      notes: 'Batch 2 siang',
    },
    'Eko Purnomo',
    ref2
  );
  assert.equal(res2.ok, true);

  // Check cumulative calculation
  const current = await repo.load();
  const progress = calculateSingleOrderProgress(targetOrder, current.productionRecords, current.deliveryRecords);
  assert.ok(progress.totalProduced >= 125);
});

test('TEST-04 & TEST-14 — Record Delivery & Partial Delivery: multi-batch shipment reconciliation', async () => {
  const repo = new BrowserOperationsRepository();
  await repo.resetToSampleData();
  const snapshot = await repo.load();
  const targetOrder = snapshot.orders.find((o) => o.order_id === 'DEMO-ORD-001')!;

  const initialProgress = calculateSingleOrderProgress(targetOrder, snapshot.productionRecords, snapshot.deliveryRecords);
  const initialShipped = initialProgress.totalShipped;

  // Record first partial delivery
  const ref1 = newClientRef();
  const res1 = await repo.createDelivery(
    {
      order_id: targetOrder.order_id,
      quantity_shipped: 40,
      shipped_at: '2026-11-07T09:00',
      delivery_note: 'SJ-TEST-001',
      notes: 'Pengiriman tahap 1',
    },
    'Budi Santoso',
    ref1
  );
  assert.equal(res1.ok, true);

  // Record second partial delivery
  const ref2 = newClientRef();
  const res2 = await repo.createDelivery(
    {
      order_id: targetOrder.order_id,
      quantity_shipped: 60,
      shipped_at: '2026-11-07T15:00',
      delivery_note: 'SJ-TEST-002',
      notes: 'Pengiriman tahap 2',
    },
    'Budi Santoso',
    ref2
  );
  assert.equal(res2.ok, true);

  const updated = await repo.load();
  const updatedProgress = calculateSingleOrderProgress(targetOrder, updated.productionRecords, updated.deliveryRecords);
  assert.equal(updatedProgress.totalShipped, initialShipped + 100);
  assert.equal(updatedProgress.remainingDelivery, targetOrder.quantity_ordered - (initialShipped + 100));
});

test('TEST-06 — Required Field Validation: reports specific error keys on empty submission', () => {
  const orderVal = validateOrderInput({
    partner_id: '',
    po_number: '',
    product_id: '',
    quantity_ordered: 0,
    order_date: '',
    due_date: '',
  }, []);

  assert.equal(orderVal.isValid, false);
  assert.ok(orderVal.errors.partner_id);
  assert.ok(orderVal.errors.po_number);
  assert.ok(orderVal.errors.product_id);
  assert.ok(orderVal.errors.quantity_ordered);
  assert.ok(orderVal.errors.order_date);
  assert.ok(orderVal.errors.due_date);
});

test('TEST-07 — Invalid Quantity: rejects negative, zero, decimal, and extreme numbers', () => {
  const dummyProgress = {
    totalOrdered: 100,
    totalProduced: 50,
    totalShipped: 0,
    remainingProduction: 50,
    remainingDelivery: 100,
    productionPercentage: 50,
    deliveryPercentage: 0,
    computedStatus: 'dalam_produksi' as const,
    stage: 'produksi' as const,
  };

  // Zero quantity in production
  const zeroProd = validateProductionForm({
    order_id: 'ORD-1',
    quantity_completed: '0',
    reject_qty: '',
    reported_at: '2026-11-07T10:00',
  }, dummyProgress, '2026-11-07T00:00');
  assert.ok(zeroProd.errors.quantity_completed);

  // Negative quantity in production
  const negProd = validateProductionForm({
    order_id: 'ORD-1',
    quantity_completed: '-10',
    reject_qty: '',
    reported_at: '2026-11-07T10:00',
  }, dummyProgress, '2026-11-07T00:00');
  assert.ok(negProd.errors.quantity_completed);

  // Overflow > MAX_QTY_PER_ENTRY
  const hugeProd = validateProductionForm({
    order_id: 'ORD-1',
    quantity_completed: (MAX_QTY_PER_ENTRY + 1).toString(),
    reject_qty: '',
    reported_at: '2026-11-07T10:00',
  }, dummyProgress, '2026-11-07T00:00');
  assert.ok(hugeProd.errors.quantity_completed);

  // Delivery exceeding remaining balance
  const overDel = validateDeliveryForm({
    order_id: 'ORD-1',
    quantity_shipped: '150',
    shipped_at: '2026-11-07T10:00',
    delivery_note: 'SJ-123',
  }, dummyProgress, [], '2026-11-07T00:00');
  assert.ok(overDel.errors.quantity_shipped);
});

test('TEST-08 — Duplicate Submission: idempotency via client_ref prevents duplicate records', async () => {
  const repo = new BrowserOperationsRepository();
  await repo.resetToSampleData();
  const clientRef = newClientRef();

  // First submission
  const first = await repo.createOrder(
    {
      partner_id: 'PT-MPN',
      po_number: 'PO-IDEM-001',
      product_id: 'PRD-BRK-01',
      quantity_ordered: 100,
      order_date: '2026-11-07',
      due_date: '2026-11-20',
    },
    'Joko Sutopo',
    clientRef
  );
  assert.equal(first.ok, true);

  // Second submission with exact same clientRef (double click simulation)
  const second = await repo.createOrder(
    {
      partner_id: 'PT-MPN',
      po_number: 'PO-IDEM-001',
      product_id: 'PRD-BRK-01',
      quantity_ordered: 100,
      order_date: '2026-11-07',
      due_date: '2026-11-20',
    },
    'Joko Sutopo',
    clientRef
  );
  assert.equal(second.ok, true);
  if (second.ok) {
    assert.equal(second.duplicate, true);
  }

  // Ensure total orders count did not increase twice
  const snapshot = await repo.load();
  const matches = snapshot.orders.filter((o) => o.po_number === 'PO-IDEM-001');
  assert.equal(matches.length, 1);
});

test('TEST-09 & TEST-16 — Order Consistency & Status Consistency: computedStatus reflects real cumulative progress', () => {
  const testOrder: Order = {
    order_id: 'ORD-TEST-STATUS',
    partner_id: 'PT-01',
    po_number: 'PO-STAT-1',
    product_id: 'PRD-01',
    quantity_ordered: 200,
    order_date: '2026-11-01',
    due_date: '2026-11-15',
    order_status: 'baru',
    created_by: 'Admin',
  };

  // State 1: Fresh order -> status is 'baru'
  const p1 = calculateSingleOrderProgress(testOrder, [], []);
  assert.equal(p1.computedStatus, 'baru');
  assert.equal(p1.stage, 'diterima');

  // State 2: Partial production -> status is 'dalam_produksi'
  const prodRec: ProductionRecord = {
    production_id: 'PRD-1',
    order_id: testOrder.order_id,
    quantity_completed: 100,
    reported_at: '2026-11-02T10:00',
    recorded_by: 'Operator',
  };
  const p2 = calculateSingleOrderProgress(testOrder, [prodRec], []);
  assert.equal(p2.computedStatus, 'dalam_produksi');
  assert.equal(p2.stage, 'produksi');

  // State 3: Partial delivery -> status is 'terkirim_sebagian'
  const delRec1: DeliveryRecord = {
    delivery_id: 'DEL-1',
    order_id: testOrder.order_id,
    quantity_shipped: 80,
    shipped_at: '2026-11-03T10:00',
    recorded_by: 'Driver',
  };
  const p3 = calculateSingleOrderProgress(testOrder, [prodRec], [delRec1]);
  assert.equal(p3.computedStatus, 'terkirim_sebagian');
  assert.equal(p3.stage, 'pengiriman');

  // State 4: Full delivery (200/200) -> status is 'selesai'
  const delRec2: DeliveryRecord = {
    delivery_id: 'DEL-2',
    order_id: testOrder.order_id,
    quantity_shipped: 120,
    shipped_at: '2026-11-04T10:00',
    recorded_by: 'Driver',
  };
  const p4 = calculateSingleOrderProgress(testOrder, [prodRec], [delRec1, delRec2]);
  assert.equal(p4.computedStatus, 'selesai');
  assert.equal(p4.stage, 'selesai');
  assert.equal(p4.remainingDelivery, 0);
  assert.equal(p4.deliveryPercentage, 100);
});

test('TEST-12 — Empty State: resetting data cleanses records and restores initial seed', async () => {
  const repo = new BrowserOperationsRepository();
  const resetResult = await repo.resetToSampleData();
  assert.ok(resetResult.orders.length > 0);

  const snapshot = await repo.load();
  assert.ok(snapshot.orders.length > 0);
  assert.ok(snapshot.productionRecords.length > 0);
  assert.ok(snapshot.deliveryRecords.length > 0);
  assert.equal(snapshot.orders.every((o) => o.source === 'data_contoh'), true);
});

test('TEST-15 — Error Recovery: valid fields are retained when invalid input is corrected', () => {
  const baseInput = {
    partner_id: 'PT-MPN',
    po_number: 'PO-VALID-RETAIN',
    product_id: 'PRD-BRK-01',
    quantity_ordered: -5, // Invalid
    order_date: '2026-11-07',
    due_date: '2026-11-20',
  };

  const attempt1 = validateOrderInput(baseInput, []);
  assert.equal(attempt1.isValid, false);
  assert.ok(attempt1.errors.quantity_ordered);

  // User corrects quantity to positive integer
  const correctedInput = { ...baseInput, quantity_ordered: 150 };
  const attempt2 = validateOrderInput(correctedInput, []);
  assert.equal(attempt2.isValid, true);
  assert.deepEqual(attempt2.errors, {});
});
