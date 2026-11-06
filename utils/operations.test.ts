import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateSingleOrderProgress,
  calculateDashboardMetrics,
  validateOrderInput,
  validateProductionInput,
  validateDeliveryInput,
  deriveOperationalAlerts,
} from './operations';
import { Order, ProductionRecord, DeliveryRecord, Partner } from '../types';

test('calculateSingleOrderProgress calculates correct metrics for partial production and delivery', () => {
  const order: Order = {
    order_id: 'DEMO-ORD-001',
    partner_id: 'PT-01',
    po_number: 'PO-2026-001',
    product_id: 'PRD-01',
    quantity_ordered: 500,
    order_date: '2026-11-01',
    due_date: '2026-11-15',
    order_status: 'dalam_produksi',
    created_by: 'Admin',
  };

  const productionRecords: ProductionRecord[] = [
    {
      production_id: 'PRD-REC-01',
      order_id: 'DEMO-ORD-001',
      quantity_completed: 300,
      reported_at: '2026-11-02T10:00:00Z',
      recorded_by: 'Operator 1',
    },
  ];

  const deliveryRecords: DeliveryRecord[] = [
    {
      delivery_id: 'DEL-REC-01',
      order_id: 'DEMO-ORD-001',
      quantity_shipped: 180,
      shipped_at: '2026-11-03T14:00:00Z',
      recorded_by: 'Driver 1',
    },
  ];

  const metrics = calculateSingleOrderProgress(order, productionRecords, deliveryRecords);

  assert.equal(metrics.totalOrdered, 500);
  assert.equal(metrics.totalProduced, 300);
  assert.equal(metrics.totalShipped, 180);
  assert.equal(metrics.remainingProduction, 200);
  assert.equal(metrics.remainingDelivery, 320); // 500 - 180 = 320
  assert.equal(metrics.productionPercentage, 60); // 300 / 500 = 60%
  assert.equal(metrics.deliveryPercentage, 36); // 180 / 500 = 36%
  assert.equal(metrics.computedStatus, 'terkirim_sebagian');
});

test('calculateSingleOrderProgress marks order as selesai when all units shipped', () => {
  const order: Order = {
    order_id: 'DEMO-ORD-002',
    partner_id: 'PT-01',
    po_number: 'PO-2026-002',
    product_id: 'PRD-01',
    quantity_ordered: 100,
    order_date: '2026-11-01',
    due_date: '2026-11-05',
    order_status: 'selesai',
    created_by: 'Admin',
  };

  const productionRecords: ProductionRecord[] = [
    {
      production_id: 'PRD-REC-02',
      order_id: 'DEMO-ORD-002',
      quantity_completed: 100,
      reported_at: '2026-11-02T10:00:00Z',
      recorded_by: 'Operator 1',
    },
  ];

  const deliveryRecords: DeliveryRecord[] = [
    {
      delivery_id: 'DEL-REC-02',
      order_id: 'DEMO-ORD-002',
      quantity_shipped: 100,
      shipped_at: '2026-11-03T14:00:00Z',
      recorded_by: 'Driver 1',
    },
  ];

  const metrics = calculateSingleOrderProgress(order, productionRecords, deliveryRecords);
  assert.equal(metrics.remainingDelivery, 0);
  assert.equal(metrics.remainingProduction, 0);
  assert.equal(metrics.computedStatus, 'selesai');
  assert.equal(metrics.stage, 'selesai');
});

test('calculateDashboardMetrics computes active counts and aggregated numbers', () => {
  const orders: Order[] = [
    {
      order_id: 'ORD-1',
      partner_id: 'PT-01',
      po_number: 'PO-01',
      product_id: 'P-1',
      quantity_ordered: 500,
      order_date: '2026-11-01',
      due_date: '2026-11-10',
      order_status: 'dalam_produksi',
      created_by: 'Admin',
    },
    {
      order_id: 'ORD-2',
      partner_id: 'PT-02',
      po_number: 'PO-02',
      product_id: 'P-2',
      quantity_ordered: 200,
      order_date: '2026-11-01',
      due_date: '2026-11-05',
      order_status: 'selesai',
      created_by: 'Admin',
    },
  ];

  const production: ProductionRecord[] = [
    { production_id: 'p1', order_id: 'ORD-1', quantity_completed: 300, reported_at: '', recorded_by: '' },
    { production_id: 'p2', order_id: 'ORD-2', quantity_completed: 200, reported_at: '', recorded_by: '' },
  ];

  const delivery: DeliveryRecord[] = [
    { delivery_id: 'd1', order_id: 'ORD-1', quantity_shipped: 100, shipped_at: '', recorded_by: '' },
    { delivery_id: 'd2', order_id: 'ORD-2', quantity_shipped: 200, shipped_at: '', recorded_by: '' },
  ];

  const dashboard = calculateDashboardMetrics(orders, production, delivery, 1);
  assert.equal(dashboard.activeOrdersCount, 1);
  assert.equal(dashboard.totalProducedQty, 500);
  assert.equal(dashboard.totalShippedQty, 300);
  assert.equal(dashboard.totalOrderedQty, 700);
});

test('validateOrderInput validates required fields correctly', () => {
  const invalid = validateOrderInput({
    partner_id: '',
    po_number: '',
    product_id: '',
    quantity_ordered: 0,
    due_date: '',
  });

  assert.equal(invalid.isValid, false);
  assert.ok(invalid.errors.partner_id);
  assert.ok(invalid.errors.po_number);
  assert.ok(invalid.errors.product_id);
  assert.ok(invalid.errors.quantity_ordered);
  assert.ok(invalid.errors.due_date);

  const valid = validateOrderInput({
    partner_id: 'PT-01',
    po_number: 'PO-2026-99',
    product_id: 'PRD-01',
    quantity_ordered: 250,
    due_date: '2026-11-20',
  });

  assert.equal(valid.isValid, true);
  assert.equal(Object.keys(valid.errors).length, 0);
});

test('validateDeliveryInput rejects quantities exceeding remaining balance', () => {
  const order: Order = {
    order_id: 'ORD-1',
    partner_id: 'PT-01',
    po_number: 'PO-01',
    product_id: 'P-1',
    quantity_ordered: 100,
    order_date: '2026-11-01',
    due_date: '2026-11-10',
    order_status: 'dalam_produksi',
    created_by: 'Admin',
  };

  const progress = calculateSingleOrderProgress(order, [], []); // remainingDelivery = 100

  const overLimit = validateDeliveryInput('ORD-1', 150, progress);
  assert.equal(overLimit.isValid, false);
  assert.ok(overLimit.error?.includes('melebihi'));

  const validQty = validateDeliveryInput('ORD-1', 50, progress);
  assert.equal(validQty.isValid, true);
});
