"use client";

import React, { useState, useMemo } from 'react';
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
import { ThreePartViewer } from '@/components/ThreePartViewer';
import { BeeshaAIAssistant } from '@/components/BeeshaAIAssistant';
import { DesignSystemReference } from '@/components/DesignSystemReference';
import {
  INITIAL_PARTNERS,
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_PRODUCTION_RECORDS,
  INITIAL_DELIVERY_RECORDS,
  INITIAL_ACTIVITIES,
} from '@/data/mockData';
import {
  Order,
  ProductionRecord,
  DeliveryRecord,
  ActivityRecord,
  ScreenType,
} from '@/types';
import { deriveOperationalAlerts } from '@/utils/operations';
import { BookOpen, Box, CheckCircle } from 'lucide-react';

export default function Home() {
  // Shared Simulated Operational Data Model
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [productionRecords, setProductionRecords] = useState<ProductionRecord[]>(
    INITIAL_PRODUCTION_RECORDS
  );
  const [deliveryRecords, setDeliveryRecords] = useState<DeliveryRecord[]>(
    INITIAL_DELIVERY_RECORDS
  );
  const [activities, setActivities] = useState<ActivityRecord[]>(INITIAL_ACTIVITIES);

  // Navigation State
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('beranda');
  const [selectedOrderId, setSelectedOrderId] = useState<string>('DEMO-ORD-001');
  const [formTargetOrderId, setFormTargetOrderId] = useState<string>('');

  // Modals & Panels State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isDesignSystemOpen, setIsDesignSystemOpen] = useState(false);

  // Derived Operational Alerts (Live evaluated across the shared data model)
  const alerts = useMemo(() => {
    return deriveOperationalAlerts(
      orders,
      productionRecords,
      deliveryRecords,
      INITIAL_PARTNERS,
      '2026-11-06'
    );
  }, [orders, productionRecords, deliveryRecords]);

  // Handlers for adding new transactions into the unified data model
  const handleSaveOrder = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);

    // Record activity
    const partner = INITIAL_PARTNERS.find((p) => p.partner_id === newOrder.partner_id);
    const product = INITIAL_PRODUCTS.find((p) => p.product_id === newOrder.product_id);

    const newActivity: ActivityRecord = {
      activity_id: `ACT-${Date.now().toString().slice(-4)}`,
      activity_type: 'pesanan',
      related_order_id: newOrder.order_id,
      timestamp: 'Baru saja',
      description: `Pesanan baru ${newOrder.po_number} (${newOrder.quantity_ordered} pcs ${product?.product_name || 'Barang'}) dari ${partner?.partner_name || 'Mitra'} berhasil dicatat.`,
      recorded_by: newOrder.created_by,
      status: 'Pesanan Baru',
    };

    setActivities((prev) => [newActivity, ...prev]);
    setSelectedOrderId(newOrder.order_id);
  };

  const handleSaveProduction = (record: ProductionRecord) => {
    setProductionRecords((prev) => [record, ...prev]);

    const order = orders.find((o) => o.order_id === record.order_id);
    const newActivity: ActivityRecord = {
      activity_id: `ACT-${Date.now().toString().slice(-4)}`,
      activity_type: 'produksi',
      related_order_id: record.order_id,
      timestamp: 'Baru saja',
      description: `Hasil produksi +${record.quantity_completed} pcs dicatat untuk pesanan ${record.order_id}.`,
      recorded_by: record.recorded_by,
      status: 'Hasil Produksi',
    };

    setActivities((prev) => [newActivity, ...prev]);
  };

  const handleSaveDelivery = (record: DeliveryRecord) => {
    setDeliveryRecords((prev) => [record, ...prev]);

    const newActivity: ActivityRecord = {
      activity_id: `ACT-${Date.now().toString().slice(-4)}`,
      activity_type: 'pengiriman',
      related_order_id: record.order_id,
      timestamp: 'Baru saja',
      description: `Pengiriman ${record.quantity_shipped} pcs (Surat Jalan: ${record.delivery_note || record.delivery_id}) diberangkatkan.`,
      recorded_by: record.recorded_by,
      status: 'Pengiriman Berhasil',
    };

    setActivities((prev) => [newActivity, ...prev]);
  };

  // Quick navigation helpers
  const handleSelectOrderForDetail = (orderId: string) => {
    setSelectedOrderId(orderId);
    setCurrentScreen('detail_pesanan');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNavigateToProductionForOrder = (orderId: string) => {
    setFormTargetOrderId(orderId);
    setCurrentScreen('form_produksi');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNavigateToDeliveryForOrder = (orderId: string) => {
    setFormTargetOrderId(orderId);
    setCurrentScreen('form_pengiriman');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F4F7] text-[#1E293B] flex flex-col font-sans selection:bg-[#0077C8] selection:text-white">
      {/* Sticky Top Navbar */}
      <Navbar
        onOpenDrawer={() => setIsDrawerOpen(true)}
        onOpenAssistant={() => setIsAssistantOpen(true)}
        onNavigateHome={() => setCurrentScreen('beranda')}
        currentScreen={currentScreen}
      />

      {/* Navigation Drawer Overlay */}
      <NavigationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        currentScreen={currentScreen}
        onNavigate={(screen) => {
          setCurrentScreen(screen);
          setFormTargetOrderId('');
          if (typeof window !== 'undefined') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
        alertsCount={alerts.length}
      />

      {/* Main Page Container (Centered, max-width 1360px) */}
      <main className="flex-1 w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Screen 01: Beranda / Ringkasan Operasional */}
        {currentScreen === 'beranda' && (
          <DashboardScreen
            orders={orders}
            productionRecords={productionRecords}
            deliveryRecords={deliveryRecords}
            activities={activities}
            alerts={alerts}
            onNavigate={(screen) => {
              setCurrentScreen(screen);
              setFormTargetOrderId('');
              if (typeof window !== 'undefined') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            onSelectOrderForDetail={handleSelectOrderForDetail}
          />
        )}

        {/* Screen 03: Daftar Pemesanan Mitra */}
        {currentScreen === 'daftar_pesanan' && (
          <OrderListScreen
            orders={orders}
            partners={INITIAL_PARTNERS}
            products={INITIAL_PRODUCTS}
            productionRecords={productionRecords}
            deliveryRecords={deliveryRecords}
            onAddNewOrder={() => {
              setCurrentScreen('form_pesanan');
              if (typeof window !== 'undefined') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            onSelectOrder={handleSelectOrderForDetail}
          />
        )}

        {/* Screen 04: Form Input Pemesanan Baru */}
        {currentScreen === 'form_pesanan' && (
          <NewOrderForm
            partners={INITIAL_PARTNERS}
            products={INITIAL_PRODUCTS}
            nextOrderNumber={orders.length + 1}
            onSaveOrder={handleSaveOrder}
            onCancel={() => setCurrentScreen('daftar_pesanan')}
            onViewOrderDetail={handleSelectOrderForDetail}
          />
        )}

        {/* Screen 05: Form Input Hasil Produksi */}
        {currentScreen === 'form_produksi' && (
          <ProductionForm
            orders={orders}
            partners={INITIAL_PARTNERS}
            products={INITIAL_PRODUCTS}
            productionRecords={productionRecords}
            deliveryRecords={deliveryRecords}
            preSelectedOrderId={formTargetOrderId}
            onSaveProduction={handleSaveProduction}
            onCancel={() => setCurrentScreen('beranda')}
            onViewOrderDetail={handleSelectOrderForDetail}
          />
        )}

        {/* Screen 06: Form Input Pengiriman */}
        {currentScreen === 'form_pengiriman' && (
          <DeliveryForm
            orders={orders}
            partners={INITIAL_PARTNERS}
            products={INITIAL_PRODUCTS}
            productionRecords={productionRecords}
            deliveryRecords={deliveryRecords}
            preSelectedOrderId={formTargetOrderId}
            onSaveDelivery={handleSaveDelivery}
            onCancel={() => setCurrentScreen('beranda')}
            onViewOrderDetail={handleSelectOrderForDetail}
          />
        )}

        {/* Screen 07: Detail Pesanan & Progress */}
        {currentScreen === 'detail_pesanan' && (
          <OrderDetailScreen
            orderId={selectedOrderId}
            orders={orders}
            partners={INITIAL_PARTNERS}
            products={INITIAL_PRODUCTS}
            productionRecords={productionRecords}
            deliveryRecords={deliveryRecords}
            onBack={() => setCurrentScreen('daftar_pesanan')}
            onNavigateToProduction={handleNavigateToProductionForOrder}
            onNavigateToDelivery={handleNavigateToDeliveryForOrder}
          />
        )}

        {/* Screen 08: Riwayat Aktivitas */}
        {currentScreen === 'riwayat_aktivitas' && (
          <ActivityHistoryScreen
            activities={activities}
            orders={orders}
            partners={INITIAL_PARTNERS}
            onSelectOrder={handleSelectOrderForDetail}
          />
        )}

        {/* Screen 09: Pusat Peringatan */}
        {currentScreen === 'pusat_peringatan' && (
          <AlertCenterScreen
            alerts={alerts}
            onSelectOrder={handleSelectOrderForDetail}
          />
        )}

        {/* Screen 10: Three.js 3D Interactive Part Inspection */}
        {currentScreen === 'inspeksi_3d' && (
          <div className="space-y-6">
            <div className="bg-white border border-[#D9E0E8] rounded-xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Box className="w-6 h-6 text-[#0077C8]" />
                  <h1 className="text-2xl md:text-3xl font-bold text-[#1E293B]">
                    Inspeksi 3D Part Manufaktur
                  </h1>
                </div>
                <p className="text-sm md:text-base text-[#526174] mt-1">
                  Model 3D interaktif Three.js berbasis PBR procedural assembly untuk verifikasi visual part PHM Group.
                </p>
              </div>

              <button
                onClick={() => setCurrentScreen('beranda')}
                className="px-4 py-2 bg-[#F8FAFC] hover:bg-slate-100 text-[#1B365D] border border-[#D9E0E8] rounded-lg text-xs md:text-sm font-semibold transition-colors self-start sm:self-auto cursor-pointer"
              >
                Kembali ke Beranda
              </button>
            </div>

            <ThreePartViewer
              partName="Bracket Komponen A (Perakitan Sasis)"
              partCode="BRK-01A"
              orderId={selectedOrderId || 'DEMO-ORD-001'}
            />
          </div>
        )}
      </main>

      {/* Enterprise Footer */}
      <footer className="w-full bg-white border-t border-[#D9E0E8] py-6 px-4 sm:px-6 lg:px-8 mt-12">
        <div className="max-w-[1360px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs md:text-sm text-[#526174]">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#1B365D]">BEESHA</span>
            <span>· Sistem Informasi Operasional PT Putra Hatim Mandiri (PHM Group)</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsDesignSystemOpen(true)}
              className="font-semibold text-[#0077C8] hover:underline flex items-center gap-1.5 cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>Panduan Design System & HCI</span>
            </button>
            <span className="text-slate-300">|</span>
            <span className="text-xs">Data Simulasi Interaktif</span>
          </div>
        </div>
      </footer>

      {/* Beesha AI Assistant Drawer */}
      <BeeshaAIAssistant
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        orders={orders}
        productionRecords={productionRecords}
        deliveryRecords={deliveryRecords}
        partners={INITIAL_PARTNERS}
        products={INITIAL_PRODUCTS}
      />

      {/* Design System & HCI Reference Modal */}
      <DesignSystemReference
        isOpen={isDesignSystemOpen}
        onClose={() => setIsDesignSystemOpen(false)}
      />
    </div>
  );
}
