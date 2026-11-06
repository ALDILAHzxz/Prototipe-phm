import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Truck,
  Factory,
  ClipboardPlus,
  Box,
  FileText,
  Calendar,
  Building2,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Order, Partner, Product, ProductionRecord, DeliveryRecord, ScreenType } from '../../types';
import { calculateSingleOrderProgress } from '../../utils/operations';
import { ThreePartViewer } from '../ThreePartViewer';

interface OrderDetailScreenProps {
  orderId: string;
  orders: Order[];
  partners: Partner[];
  products: Product[];
  productionRecords: ProductionRecord[];
  deliveryRecords: DeliveryRecord[];
  onBack: () => void;
  onNavigateToProduction: (orderId: string) => void;
  onNavigateToDelivery: (orderId: string) => void;
}

export const OrderDetailScreen: React.FC<OrderDetailScreenProps> = ({
  orderId,
  orders,
  partners,
  products,
  productionRecords,
  deliveryRecords,
  onBack,
  onNavigateToProduction,
  onNavigateToDelivery,
}) => {
  const [show3DViewer, setShow3DViewer] = useState(false);

  const order = orders.find((o) => o.order_id === orderId) || orders[0];
  if (!order) return null;

  const partner = partners.find((p) => p.partner_id === order.partner_id);
  const product = products.find((p) => p.product_id === order.product_id);

  const progress = calculateSingleOrderProgress(order, productionRecords, deliveryRecords);

  const relatedProductions = productionRecords.filter((r) => r.order_id === order.order_id);
  const relatedDeliveries = deliveryRecords.filter((r) => r.order_id === order.order_id);

  return (
    <div className="space-y-7 animate-in fade-in duration-200">
      {/* Top Navigation & Title Bar */}
      <div className="bg-white border border-[#D9E0E8] rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-lg text-[#526174] transition-colors cursor-pointer"
            title="Kembali ke Daftar Pesanan"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl md:text-3xl font-bold text-[#1E293B] font-mono">
                {order.order_id}
              </h1>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-[#0077C8] border border-blue-200">
                {order.po_number}
              </span>
            </div>
            <p className="text-sm md:text-base text-[#526174] mt-0.5">
              Mitra: <strong className="text-[#1E293B]">{partner?.partner_name}</strong> ({partner?.city})
            </p>
          </div>
        </div>

        {/* Primary Action Buttons for this Order (Section 12.3) */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShow3DViewer(!show3DViewer)}
            className="h-11 px-4 bg-[#F8FAFC] hover:bg-blue-50 text-[#1B365D] border border-[#D9E0E8] rounded-lg font-semibold text-xs md:text-sm flex items-center gap-2 cursor-pointer transition-colors shadow-2xs"
          >
            <Box className="w-4 h-4 text-[#0077C8]" />
            <span>{show3DViewer ? 'Tutup 3D Part' : 'Inspeksi 3D Part'}</span>
          </button>

          <button
            onClick={() => onNavigateToProduction(order.order_id)}
            className="h-11 px-4 bg-[#0077C8] hover:bg-[#0069b2] text-white rounded-lg font-semibold text-xs md:text-sm flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs focus-beesha"
          >
            <Factory className="w-4 h-4" />
            <span>Catat Produksi</span>
          </button>

          <button
            onClick={() => onNavigateToDelivery(order.order_id)}
            className="h-11 px-4 bg-[#1B365D] hover:bg-[#152a48] text-white rounded-lg font-semibold text-xs md:text-sm flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs focus-beesha"
          >
            <Truck className="w-4 h-4" />
            <span>Catat Pengiriman</span>
          </button>
        </div>
      </div>

      {/* Interactive 3D Model Inspection Panel (Integrated Three.js Viewer) */}
      {show3DViewer && (
        <div className="animate-in fade-in zoom-in-98 duration-200">
          <ThreePartViewer
            partName={product?.product_name}
            partCode={product?.product_code}
            orderId={order.order_id}
            onClose={() => setShow3DViewer(false)}
          />
        </div>
      )}

      {/* Section B: Perkembangan Pesanan (Three-Stage Progress Visualization) */}
      <div className="bg-white border border-[#D9E0E8] rounded-xl p-6 md:p-8 shadow-xs space-y-6">
        <div>
          <h2 className="text-xl font-bold text-[#1E293B]">Perkembangan Pesanan</h2>
          <p className="text-sm text-[#526174] mt-0.5">
            Tahapan realisasi pesanan mitra dari penerimaan hingga pengiriman tuntas.
          </p>
        </div>

        {/* 3-Stage Progress Indicator */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
          {/* Stage 1: Pesanan Diterima */}
          <div className="p-4 rounded-xl border border-[#D9E0E8] bg-blue-50/40 relative">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#18794E] text-white flex items-center justify-center font-bold text-sm shrink-0">
                ✓
              </div>
              <div>
                <p className="text-xs text-[#526174] font-medium">Tahap 1</p>
                <h4 className="text-base font-bold text-[#1E293B]">Pesanan Diterima</h4>
              </div>
            </div>
            <p className="text-xs text-[#526174] mt-2.5">
              Dokumen PO diverifikasi pada {order.order_date}.
            </p>
          </div>

          {/* Stage 2: Produksi Berjalan */}
          <div
            className={`p-4 rounded-xl border relative ${
              progress.totalProduced > 0
                ? 'border-blue-300 bg-blue-50/50'
                : 'border-[#D9E0E8] bg-[#F8FAFC]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                  progress.remainingProduction === 0 && progress.totalProduced > 0
                    ? 'bg-[#18794E] text-white'
                    : progress.totalProduced > 0
                    ? 'bg-[#0077C8] text-white'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {progress.remainingProduction === 0 && progress.totalProduced > 0 ? '✓' : '2'}
              </div>
              <div>
                <p className="text-xs text-[#526174] font-medium">Tahap 2</p>
                <h4 className="text-base font-bold text-[#1E293B]">Produksi Berjalan</h4>
              </div>
            </div>
            <p className="text-xs text-[#526174] mt-2.5">
              {progress.totalProduced} dari {progress.totalOrdered} pcs (
              {progress.productionPercentage}%) selesai dibuat.
            </p>
          </div>

          {/* Stage 3: Pengiriman */}
          <div
            className={`p-4 rounded-xl border relative ${
              progress.totalShipped >= progress.totalOrdered
                ? 'border-emerald-300 bg-emerald-50/40'
                : progress.totalShipped > 0
                ? 'border-purple-200 bg-purple-50/40'
                : 'border-[#D9E0E8] bg-[#F8FAFC]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                  progress.totalShipped >= progress.totalOrdered && progress.totalOrdered > 0
                    ? 'bg-[#18794E] text-white'
                    : progress.totalShipped > 0
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {progress.totalShipped >= progress.totalOrdered && progress.totalOrdered > 0 ? '✓' : '3'}
              </div>
              <div>
                <p className="text-xs text-[#526174] font-medium">Tahap 3</p>
                <h4 className="text-base font-bold text-[#1E293B]">Pengiriman Mitra</h4>
              </div>
            </div>
            <p className="text-xs text-[#526174] mt-2.5">
              {progress.totalShipped} dari {progress.totalOrdered} pcs (
              {progress.deliveryPercentage}%) telah terkirim.
            </p>
          </div>
        </div>

        {/* Cumulative Quantities Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-[#D9E0E8]">
          <div className="p-4 bg-[#F8FAFC] border border-[#D9E0E8] rounded-xl">
            <span className="text-xs font-semibold text-[#526174]">Total Dipesan:</span>
            <p className="text-2xl font-bold text-[#1B365D] tabular-nums mt-1">
              {progress.totalOrdered.toLocaleString('id-ID')} <span className="text-xs font-normal text-[#526174]">pcs</span>
            </p>
          </div>
          <div className="p-4 bg-[#F8FAFC] border border-[#D9E0E8] rounded-xl">
            <span className="text-xs font-semibold text-[#526174]">Total Selesai Diproduksi:</span>
            <p className="text-2xl font-bold text-[#0077C8] tabular-nums mt-1">
              {progress.totalProduced.toLocaleString('id-ID')} <span className="text-xs font-normal text-[#526174]">pcs</span>
            </p>
          </div>
          <div className="p-4 bg-[#F8FAFC] border border-[#D9E0E8] rounded-xl">
            <span className="text-xs font-semibold text-[#526174]">Total Sudah Dikirim:</span>
            <p className="text-2xl font-bold text-[#18794E] tabular-nums mt-1">
              {progress.totalShipped.toLocaleString('id-ID')} <span className="text-xs font-normal text-[#526174]">pcs</span>
            </p>
          </div>
          <div className="p-4 bg-[#F8FAFC] border border-[#D9E0E8] rounded-xl">
            <span className="text-xs font-semibold text-[#526174]">Sisa Belum Dikirim:</span>
            <p className="text-2xl font-bold text-[#B54708] tabular-nums mt-1">
              {progress.remainingDelivery.toLocaleString('id-ID')} <span className="text-xs font-normal text-[#526174]">pcs</span>
            </p>
          </div>
        </div>
      </div>

      {/* Two Columns: Section A (Identitas Pesanan) & Section C (Timeline Riwayat Aktivitas) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        {/* Section A: Identitas Pesanan (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-[#D9E0E8] rounded-xl p-6 shadow-xs space-y-4">
          <h3 className="text-lg font-bold text-[#1E293B] pb-3 border-b border-[#D9E0E8]">
            Identitas & Spesifikasi Pesanan
          </h3>

          <div className="space-y-3.5 text-sm">
            <div>
              <span className="text-xs text-[#526174]">Nama Mitra Perusahaan:</span>
              <p className="font-semibold text-base text-[#1E293B]">{partner?.partner_name}</p>
              <p className="text-xs text-[#526174] mt-0.5">PIC: {order.pic_mitra || partner?.pic_name} · Telp: {partner?.phone}</p>
            </div>

            <div>
              <span className="text-xs text-[#526174]">Barang / Part Manufaktur:</span>
              <p className="font-semibold text-base text-[#1E293B]">{product?.product_name}</p>
              <p className="text-xs text-[#526174] font-mono mt-0.5">Kode: {product?.product_code}</p>
            </div>

            <div>
              <span className="text-xs text-[#526174]">Spesifikasi Teknis:</span>
              <p className="text-xs text-[#1E293B] bg-[#F8FAFC] p-2.5 rounded-lg border border-[#D9E0E8] mt-1 leading-relaxed">
                {product?.specification}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <span className="text-xs text-[#526174]">Tanggal Pesanan:</span>
                <p className="font-semibold text-[#1E293B] mt-0.5">{order.order_date}</p>
              </div>
              <div>
                <span className="text-xs text-[#526174]">Target Pengiriman:</span>
                <p className="font-semibold text-[#B54708] mt-0.5">{order.due_date}</p>
              </div>
            </div>

            {order.notes && (
              <div className="pt-2">
                <span className="text-xs text-[#526174]">Catatan Pesanan:</span>
                <p className="text-xs text-[#1E293B] italic mt-0.5">{order.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Section C: Riwayat Transaksi Pesanan Ini (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-[#D9E0E8] rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#D9E0E8]">
            <h3 className="text-lg font-bold text-[#1E293B]">Riwayat Aktivitas Pesanan</h3>
            <span className="text-xs font-semibold text-[#526174]">
              {relatedProductions.length + relatedDeliveries.length + 1} Catatan
            </span>
          </div>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#D9E0E8]">
            {/* Initial Order Event */}
            <div className="relative">
              <span className="absolute -left-[27px] top-1 w-4 h-4 rounded-full bg-[#1B365D] border-2 border-white ring-2 ring-[#D9E0E8]" />
              <div className="text-sm">
                <span className="text-xs text-[#526174] font-medium">{order.order_date}</span>
                <p className="font-semibold text-[#1E293B] mt-0.5">
                  Pesanan Baru {order.order_id} ({order.po_number}) dicatat oleh {order.created_by}.
                </p>
                <p className="text-xs text-[#526174]">Target pesanan: {order.quantity_ordered} pcs.</p>
              </div>
            </div>

            {/* Production Records for this order */}
            {relatedProductions.map((p) => (
              <div key={p.production_id} className="relative">
                <span className="absolute -left-[27px] top-1 w-4 h-4 rounded-full bg-[#0077C8] border-2 border-white ring-2 ring-[#D9E0E8]" />
                <div className="text-sm">
                  <span className="text-xs text-[#526174] font-medium">{p.reported_at}</span>
                  <p className="font-semibold text-[#1E293B] mt-0.5">
                    Hasil produksi +{p.quantity_completed} pcs dicatat oleh {p.recorded_by}.
                  </p>
                  {p.reject_qty ? (
                    <p className="text-xs text-[#B54708]">Reject: {p.reject_qty} pcs</p>
                  ) : null}
                  {p.notes && <p className="text-xs text-[#526174] italic">{p.notes}</p>}
                </div>
              </div>
            ))}

            {/* Delivery Records for this order */}
            {relatedDeliveries.map((d) => (
              <div key={d.delivery_id} className="relative">
                <span className="absolute -left-[27px] top-1 w-4 h-4 rounded-full bg-[#18794E] border-2 border-white ring-2 ring-[#D9E0E8]" />
                <div className="text-sm">
                  <span className="text-xs text-[#526174] font-medium">{d.shipped_at}</span>
                  <p className="font-semibold text-[#1E293B] mt-0.5">
                    Pengiriman {d.quantity_shipped} pcs diberangkatkan via {d.delivery_note}.
                  </p>
                  <p className="text-xs text-[#526174]">Petugas: {d.recorded_by}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
