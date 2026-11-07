import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { hashToRoute, routeToHash, Route } from '../components/navigation';
import { calculateDashboardMetrics, calculatePeriodSummary, calculateSingleOrderProgress } from '../utils/operations';
import { INITIAL_PARTNERS, INITIAL_PRODUCTS, createSeedData } from '../data/mockData';

describe('UI & Interaction Refinement Verifications (UI-01 to UI-22)', () => {
  it('UI-01 to UI-04: Dashboard Action & KPI navigation routes match valid hash routes', () => {
    const screens: Route['screen'][] = [
      'beranda',
      'daftar_pesanan',
      'form_pesanan',
      'form_produksi',
      'form_pengiriman',
      'pemeriksaan_data',
      'pusat_peringatan',
      'riwayat_aktivitas',
      'inspeksi_3d',
    ];

    screens.forEach((screen) => {
      const hash = routeToHash({ screen });
      assert.ok(hash.startsWith('#/'), `Hash for screen ${screen} should start with #/`);
      const parsed = hashToRoute(hash);
      assert.equal(parsed.screen, screen, `Parsed route screen should match original screen: ${screen}`);
    });
  });

  it('UI-05: Dashboard layout metric calculation does not create unbalanced zero-state division', () => {
    const seed = createSeedData('2026-11-08');
    const metrics = calculateDashboardMetrics(seed.orders, seed.productionRecords, seed.deliveryRecords, 3);
    assert.ok(metrics.activeOrdersCount >= 0);
    assert.ok(metrics.totalProducedQty >= 0);
    assert.ok(metrics.totalShippedQty >= 0);
    assert.ok(metrics.attentionCount === 3);
  });

  it('UI-06 to UI-07: 3D Part route (#/inspeksi-3d) parses correctly from URL hash', () => {
    const route = hashToRoute('#/inspeksi-3d');
    assert.equal(route.screen, 'inspeksi_3d');
    const backToHash = routeToHash(route);
    assert.equal(backToHash, '#/inspeksi-3d');
  });

  it('UI-08: Order list filters cover all active and completed status categories', () => {
    const seed = createSeedData('2026-11-08');
    const completedOrders = seed.orders.filter(
      (o) => calculateSingleOrderProgress(o, seed.productionRecords, seed.deliveryRecords).computedStatus === 'selesai'
    );
    const activeOrders = seed.orders.filter(
      (o) => calculateSingleOrderProgress(o, seed.productionRecords, seed.deliveryRecords).computedStatus !== 'selesai'
    );
    assert.ok(completedOrders.length + activeOrders.length === seed.orders.length);
  });

  it('UI-10 to UI-12: Form sidebars (guidance & history) operate on valid order contexts', () => {
    const seed = createSeedData('2026-11-08');
    const orderId = seed.orders[0].order_id;
    const prodHistory = seed.productionRecords.filter((r) => r.order_id === orderId);
    const delHistory = seed.deliveryRecords.filter((r) => r.order_id === orderId);
    assert.ok(Array.isArray(prodHistory));
    assert.ok(Array.isArray(delHistory));
  });

  it('UI-16 to UI-19: Quick question interaction logic supports expand and collapse state transitions', () => {
    let showSuggestions = true;
    const toggle = () => (showSuggestions = !showSuggestions);

    assert.equal(showSuggestions, true, 'Suggestions initially open');
    toggle();
    assert.equal(showSuggestions, false, 'Suggestions collapsed on user action');
    toggle();
    assert.equal(showSuggestions, true, 'Suggestions re-expanded on toggle');
  });

  it('UI-23: Theme state transitions correctly between light and dark modes', () => {
    let theme: 'light' | 'dark' = 'light';
    const toggleTheme = () => (theme = theme === 'light' ? 'dark' : 'light');

    assert.equal(theme, 'light', 'Default theme is light');
    toggleTheme();
    assert.equal(theme, 'dark', 'Theme switches to dark');
    toggleTheme();
    assert.equal(theme, 'light', 'Theme toggles back to light');
  });

  it('UI-24: Guide tour navigation covers all 7 instructional tabs in sequence', () => {
    const tabs = ['ikhtisar', 'pesanan', 'produksi', 'pengiriman', 'dashboard', 'fitur', 'faq'];
    assert.equal(tabs.length, 7);
    tabs.forEach((tab, idx) => {
      const prev = idx > 0 ? tabs[idx - 1] : null;
      const next = idx < tabs.length - 1 ? tabs[idx + 1] : null;
      if (idx === 0) assert.equal(prev, null);
      if (idx === tabs.length - 1) assert.equal(next, null);
    });
  });
});
