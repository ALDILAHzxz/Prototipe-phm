"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { NavigationDrawer } from '@/components/NavigationDrawer';
import { DashboardScreen } from '@/components/screens/DashboardScreen';
import { OrderListScreen } from '@/components/screens/OrderListScreen';
import { NewOrderForm } from '@/components/screens/NewOrderForm';
import { ProductionForm } from '@/components/screens/ProductionForm';
import { DeliveryForm } from '@/components/screens/DeliveryForm';
import { OrderDetailScreen } from '@/components/screens/OrderDetailScreen';
import { ActivityHistoryScreen } from '@/components/screens/ActivityHistoryScreen';
import { AlertCenterScreen } from '@/components/screens/AlertCenterScreen';
import { VerificationScreen } from '@/components/screens/VerificationScreen';
import { ThreePartViewer } from '@/components/ThreePartViewer';
import { BeeshaAIAssistant } from '@/components/BeeshaAIAssistant';
import { DesignSystemReference } from '@/components/DesignSystemReference';
import { StaffPicker } from '@/components/StaffPicker';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Notice, PageHeader } from '@/components/ui/Layout';
import { WriteContext } from '@/components/screens/shared';
import { Route, hashToRoute, routeToHash } from '@/components/navigation';
import { INITIAL_PARTNERS, INITIAL_PRODUCTS, DEMO_STAFF, staffDisplayName } from '@/data/mockData';
import { ScreenType } from '@/types';
import { deriveOperationalAlerts, getVerificationStatus } from '@/utils/operations';
import { deriveActivities } from '@/lib/activity';
import { useOperations } from '@/lib/useOperations';

const partners = INITIAL_PARTNERS;
const products = INITIAL_PRODUCTS;

function sameRoute(a: Route, b: Route) {
  return a.screen === b.screen && (a.orderId ?? '') === (b.orderId ?? '');
}

export default function Home() {
  const ops = useOperations();
  const { snapshot } = ops;

  const [route, setRoute] = useState<Route>({ screen: 'beranda' });
  const routeRef = useRef(route);
  routeRef.current = route;

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isStaffPickerOpen, setIsStaffPickerOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [pendingRoute, setPendingRoute] = useState<Route | null>(null);

  // Penanda form yang belum disimpan (untuk peringatan saat pindah halaman).
  const dirtyRef = useRef(false);
  const onDirtyChange = useCallback((d: boolean) => {
    dirtyRef.current = d;
  }, []);

  const go = useCallback((next: Route, push = true) => {
    setRoute(next);
    const h = routeToHash(next);
    if (push && window.location.hash !== h) window.history.pushState(null, '', h);
    window.scrollTo({ top: 0 });
  }, []);

  const navigateTo = useCallback(
    (next: Route) => {
      if (sameRoute(next, routeRef.current)) {
        window.scrollTo({ top: 0 });
        return;
      }
      if (dirtyRef.current) {
        setPendingRoute(next);
        return;
      }
      go(next);
    },
    [go]
  );

  const navigate = useCallback((screen: ScreenType, orderId?: string) => navigateTo({ screen, orderId }), [navigateTo]);

  // Sinkron dengan alamat (#/...) agar tombol Kembali browser dan refresh berfungsi.
  useEffect(() => {
    setRoute(hashToRoute(window.location.hash));
    const onPop = () => {
      const next = hashToRoute(window.location.hash);
      if (dirtyRef.current && !sameRoute(next, routeRef.current)) {
        // Kembalikan alamat, lalu tanyakan dulu.
        window.history.pushState(null, '', routeToHash(routeRef.current));
        setPendingRoute(next);
        return;
      }
      setRoute(next);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const orders = useMemo(() => snapshot?.orders ?? [], [snapshot]);
  const productionRecords = useMemo(() => snapshot?.productionRecords ?? [], [snapshot]);
  const deliveryRecords = useMemo(() => snapshot?.deliveryRecords ?? [], [snapshot]);

  const alerts = useMemo(
    () => deriveOperationalAlerts(orders, productionRecords, deliveryRecords, partners),
    [orders, productionRecords, deliveryRecords]
  );
  const activities = useMemo(
    () => deriveActivities(orders, productionRecords, deliveryRecords, partners, products),
    [orders, productionRecords, deliveryRecords]
  );
  const verificationQueue = useMemo(
    () => [...productionRecords, ...deliveryRecords].filter((r) => getVerificationStatus(r) !== 'terverifikasi').length,
    [productionRecords, deliveryRecords]
  );
  const badges: Partial<Record<ScreenType, number>> = {
    pemeriksaan_data: verificationQueue,
    pusat_peringatan: alerts.filter((a) => a.severity !== 'tindakan').length,
  };

  const write: WriteContext = {
    repo: ops.repo,
    apply: ops.apply,
    actor: ops.activeStaff ? staffDisplayName(ops.activeStaff) : null,
    onRequireStaff: () => setIsStaffPickerOpen(true),
    onDirtyChange,
    storageKind: ops.storageKind,
  };

  const openOrder = (orderId: string) => navigate('detail_pesanan', orderId);

  const renderScreen = () => {
    if (ops.loadError) {
      return (
        <Notice tone="danger" title="Data tidak dapat dimuat" role="alert">
          {ops.loadError} Coba muat ulang halaman. Bila masih gagal, hubungi admin.
        </Notice>
      );
    }
    if (!snapshot) {
      return (
        <p className="flex items-center gap-3 text-lg text-ink-muted py-16 justify-center" role="status">
          <Loader2 className="w-6 h-6 animate-spin" aria-hidden /> Memuat data…
        </p>
      );
    }

    switch (route.screen) {
      case 'daftar_pesanan':
        return (
          <OrderListScreen
            orders={orders}
            partners={partners}
            products={products}
            productionRecords={productionRecords}
            deliveryRecords={deliveryRecords}
            onAddNewOrder={() => navigate('form_pesanan')}
            onSelectOrder={openOrder}
          />
        );
      case 'form_pesanan':
        return (
          <NewOrderForm
            {...write}
            partners={partners}
            products={products}
            orders={orders}
            onCancel={() => navigate('daftar_pesanan')}
            onViewOrderDetail={openOrder}
            onRecordProduction={(id) => navigate('form_produksi', id)}
          />
        );
      case 'form_produksi':
        return (
          <ProductionForm
            key={`prd-${route.orderId ?? ''}`}
            {...write}
            orders={orders}
            partners={partners}
            products={products}
            productionRecords={productionRecords}
            deliveryRecords={deliveryRecords}
            preSelectedOrderId={route.orderId}
            onCancel={() => navigate('beranda')}
            onViewOrderDetail={openOrder}
            onRecordDelivery={(id) => navigate('form_pengiriman', id)}
          />
        );
      case 'form_pengiriman':
        return (
          <DeliveryForm
            key={`krm-${route.orderId ?? ''}`}
            {...write}
            orders={orders}
            partners={partners}
            products={products}
            productionRecords={productionRecords}
            deliveryRecords={deliveryRecords}
            preSelectedOrderId={route.orderId}
            onCancel={() => navigate('beranda')}
            onViewOrderDetail={openOrder}
          />
        );
      case 'detail_pesanan':
        return (
          <OrderDetailScreen
            orderId={route.orderId ?? ''}
            orders={orders}
            partners={partners}
            products={products}
            productionRecords={productionRecords}
            deliveryRecords={deliveryRecords}
            onBack={() => navigate('daftar_pesanan')}
            onNavigateToProduction={(id) => navigate('form_produksi', id)}
            onNavigateToDelivery={(id) => navigate('form_pengiriman', id)}
          />
        );
      case 'riwayat_aktivitas':
        return <ActivityHistoryScreen activities={activities} onSelectOrder={openOrder} />;
      case 'pemeriksaan_data':
        return (
          <VerificationScreen
            repo={write.repo}
            apply={write.apply}
            actor={write.actor}
            onRequireStaff={write.onRequireStaff}
            activeStaff={ops.activeStaff}
            orders={orders}
            partners={partners}
            products={products}
            productionRecords={productionRecords}
            deliveryRecords={deliveryRecords}
            onSelectOrder={openOrder}
          />
        );
      case 'pusat_peringatan':
        return <AlertCenterScreen alerts={alerts} onSelectOrder={openOrder} />;
      case 'inspeksi_3d':
        return (
          <div className="space-y-6">
            <PageHeader
              title="Inspeksi 3D Part"
              description="Model 3D ilustratif untuk membantu mengenali bentuk part. Bukan gambar teknik resmi."
              onBack={() => navigate('beranda')}
              backLabel="Kembali ke beranda"
            />
            <ThreePartViewer partName="Bracket Komponen A" partCode="BRK-01A" orderId={route.orderId} />
          </div>
        );
      case 'beranda':
      default:
        return (
          <DashboardScreen
            orders={orders}
            partners={partners}
            products={products}
            productionRecords={productionRecords}
            deliveryRecords={deliveryRecords}
            activities={activities}
            alerts={alerts}
            updatedAt={snapshot.updated_at}
            activeStaff={ops.activeStaff}
            onNavigate={(s) => navigate(s)}
            onSelectOrderForDetail={openOrder}
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <a
        href="#konten-utama"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[70] focus:bg-surface focus:text-ink focus:px-4 focus:py-3 focus:rounded-field focus:shadow-lg"
      >
        Langsung ke konten
      </a>

      <Navbar
        onOpenDrawer={() => setIsDrawerOpen(true)}
        onOpenAssistant={() => setIsAssistantOpen(true)}
        onOpenStaffPicker={() => setIsStaffPickerOpen(true)}
        onNavigate={(s) => navigate(s)}
        currentScreen={route.screen}
        activeStaff={ops.activeStaff}
        badges={badges}
      />

      <NavigationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        currentScreen={route.screen}
        onNavigate={(s) => navigate(s)}
        badges={badges}
        activeStaff={ops.activeStaff}
        onOpenStaffPicker={() => setIsStaffPickerOpen(true)}
        onOpenAssistant={() => setIsAssistantOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onResetData={() => setIsResetOpen(true)}
        storageKind={ops.storageKind}
      />

      <main id="konten-utama" className="flex-1 w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {renderScreen()}
      </main>

      <footer className="w-full bg-surface border-t border-line py-5 px-4 sm:px-6 lg:px-8 mt-12">
        <div className="max-w-[1360px] mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-[15px] text-ink-muted">
          <p>
            <strong className="text-navy">BEESHA</strong> · Prototipe sistem operasional PT Putra Hatim Mandiri (PHM Group)
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span>Data contoh · tersimpan di perangkat ini · belum terhubung INDIGO</span>
            <button
              type="button"
              onClick={() => navigate('inspeksi_3d')}
              className="min-h-[44px] font-semibold text-brand underline underline-offset-4 cursor-pointer"
            >
              Inspeksi 3D
            </button>
            <button
              type="button"
              onClick={() => setIsGuideOpen(true)}
              className="min-h-[44px] font-semibold text-brand underline underline-offset-4 cursor-pointer"
            >
              Panduan tampilan
            </button>
          </div>
        </div>
      </footer>

      <BeeshaAIAssistant
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        orders={orders}
        productionRecords={productionRecords}
        deliveryRecords={deliveryRecords}
        partners={partners}
        products={products}
      />

      <DesignSystemReference isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

      <StaffPicker
        open={isStaffPickerOpen}
        staff={DEMO_STAFF}
        active={ops.activeStaff}
        onSelect={ops.setActiveStaff}
        onClose={() => setIsStaffPickerOpen(false)}
      />

      <Dialog
        open={!!pendingRoute}
        title="Tinggalkan halaman ini?"
        description="Isian form belum disimpan dan akan hilang."
        onClose={() => setPendingRoute(null)}
        footer={
          <>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => {
                const next = pendingRoute;
                setPendingRoute(null);
                dirtyRef.current = false;
                if (next) go(next);
              }}
            >
              Ya, buang isian
            </Button>
            <Button size="lg" onClick={() => setPendingRoute(null)} data-autofocus>
              Tetap di sini
            </Button>
          </>
        }
      />

      <Dialog
        open={isResetOpen}
        title="Kembalikan data contoh?"
        description="Semua catatan yang dibuat di perangkat ini akan dihapus dan diganti data contoh awal. Tindakan ini tidak bisa dibatalkan."
        onClose={() => setIsResetOpen(false)}
        footer={
          <>
            <Button variant="secondary" size="lg" onClick={() => setIsResetOpen(false)} data-autofocus>
              Batal
            </Button>
            <Button
              variant="danger"
              size="lg"
              onClick={async () => {
                await ops.reset();
                setIsResetOpen(false);
                dirtyRef.current = false;
                go({ screen: 'beranda' });
              }}
            >
              Ya, hapus &amp; kembalikan
            </Button>
          </>
        }
      />
    </div>
  );
}
