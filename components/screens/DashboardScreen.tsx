import React from 'react';
import {
  ClipboardPlus,
  Factory,
  Truck,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Box,
  Eye,
  Info,
} from 'lucide-react';
import {
  Order,
  ProductionRecord,
  DeliveryRecord,
  ActivityRecord,
  AlertItem,
  ScreenType,
} from '../../types';
import { calculateDashboardMetrics, calculateSingleOrderProgress } from '../../utils/operations';

interface DashboardScreenProps {
  orders: Order[];
  productionRecords: ProductionRecord[];
  deliveryRecords: DeliveryRecord[];
  activities: ActivityRecord[];
  alerts: AlertItem[];
  onNavigate: (screen: ScreenType) => void;
  onSelectOrderForDetail: (orderId: string) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  orders,
  productionRecords,
  deliveryRecords,
  activities,
  alerts,
  onNavigate,
  onSelectOrderForDetail,
}) => {
  const metrics = calculateDashboardMetrics(orders, productionRecords, deliveryRecords, alerts.length);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 1. Header Content */}
      <div className="bg-white border border-[#D9E0E8] rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl md:text-3xl font-bold text-[#1E293B]">Ringkasan Operasional</h1>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              Data Simulasi
            </span>
          </div>
          <p className="text-sm md:text-base text-[#526174] mt-1">
            Pantau pesanan, produksi, dan pengiriman dalam satu tempat secara terpadu.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs md:text-sm text-[#526174] bg-[#F8FAFC] border border-[#D9E0E8] px-3.5 py-2 rounded-lg self-start md:self-auto">
          <Clock className="w-4 h-4 text-[#0077C8]" />
          <span>
            Terakhir diperbarui: <strong className="text-[#1E293B]">06 Nov 2026, 08:30 WIB</strong>
          </span>
        </div>
      </div>

      {/* 2. Three Primary Task Shortcuts (Catat Pesanan, Catat Produksi, Catat Pengiriman) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Shortcut 1: Catat Pesanan */}
        <div className="bg-white border border-[#D9E0E8] hover:border-[#0077C8] rounded-xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
          <div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0077C8] flex items-center justify-center mb-4 group-hover:bg-[#0077C8] group-hover:text-white transition-colors">
              <ClipboardPlus className="w-6 h-6" />
            </div>
            <h2 className="text-lg md:text-xl font-bold text-[#1E293B]">Catat Pesanan</h2>
            <p className="text-sm text-[#526174] mt-1.5 leading-relaxed">
              Masukkan pesanan baru yang diterima dari mitra perusahaan.
            </p>
          </div>
          <button
            onClick={() => onNavigate('form_pesanan')}
            className="mt-6 w-full h-[52px] bg-[#0077C8] hover:bg-[#0069b2] active:bg-[#005a99] text-white font-semibold text-base rounded-[10px] flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-2xs focus-beesha"
          >
            <span>Mulai Input Pesanan</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Shortcut 2: Catat Produksi */}
        <div className="bg-white border border-[#D9E0E8] hover:border-[#0077C8] rounded-xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
          <div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0077C8] flex items-center justify-center mb-4 group-hover:bg-[#0077C8] group-hover:text-white transition-colors">
              <Factory className="w-6 h-6" />
            </div>
            <h2 className="text-lg md:text-xl font-bold text-[#1E293B]">Catat Produksi</h2>
            <p className="text-sm text-[#526174] mt-1.5 leading-relaxed">
              Catat jumlah barang yang selesai dibuat pada lini produksi pabrik.
            </p>
          </div>
          <button
            onClick={() => onNavigate('form_produksi')}
            className="mt-6 w-full h-[52px] bg-[#0077C8] hover:bg-[#0069b2] active:bg-[#005a99] text-white font-semibold text-base rounded-[10px] flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-2xs focus-beesha"
          >
            <span>Mulai Input Produksi</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Shortcut 3: Catat Pengiriman */}
        <div className="bg-white border border-[#D9E0E8] hover:border-[#0077C8] rounded-xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
          <div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0077C8] flex items-center justify-center mb-4 group-hover:bg-[#0077C8] group-hover:text-white transition-colors">
              <Truck className="w-6 h-6" />
            </div>
            <h2 className="text-lg md:text-xl font-bold text-[#1E293B]">Catat Pengiriman</h2>
            <p className="text-sm text-[#526174] mt-1.5 leading-relaxed">
              Catat barang yang sudah diberangkatkan dan diserahkan kepada mitra.
            </p>
          </div>
          <button
            onClick={() => onNavigate('form_pengiriman')}
            className="mt-6 w-full h-[52px] bg-[#0077C8] hover:bg-[#0069b2] active:bg-[#005a99] text-white font-semibold text-base rounded-[10px] flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-2xs focus-beesha"
          >
            <span>Mulai Input Pengiriman</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. Four Equal-Width KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1: Pesanan Aktif */}
        <div className="bg-white border border-[#D9E0E8] rounded-xl p-6 min-h-[136px] flex flex-col justify-between shadow-xs">
          <p className="text-sm font-semibold text-[#526174]">Pesanan Aktif</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl lg:text-4xl font-bold text-[#1B365D] tabular-nums">
              {metrics.activeOrdersCount}
            </span>
            <span className="text-sm font-medium text-[#526174]">pesanan</span>
          </div>
          <p className="text-xs text-[#526174] mt-1">Pesanan yang belum selesai penuh</p>
        </div>

        {/* KPI 2: Unit Selesai Diproduksi */}
        <div className="bg-white border border-[#D9E0E8] rounded-xl p-6 min-h-[136px] flex flex-col justify-between shadow-xs">
          <p className="text-sm font-semibold text-[#526174]">Produksi Selesai</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl lg:text-4xl font-bold text-[#0077C8] tabular-nums">
              {metrics.totalProducedQty.toLocaleString('id-ID')}
            </span>
            <span className="text-sm font-medium text-[#526174]">pcs</span>
          </div>
          <p className="text-xs text-[#526174] mt-1">Akumulasi hasil produksi tercatat</p>
        </div>

        {/* KPI 3: Unit Terkirim */}
        <div className="bg-white border border-[#D9E0E8] rounded-xl p-6 min-h-[136px] flex flex-col justify-between shadow-xs">
          <p className="text-sm font-semibold text-[#526174]">Total Terkirim</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl lg:text-4xl font-bold text-[#18794E] tabular-nums">
              {metrics.totalShippedQty.toLocaleString('id-ID')}
            </span>
            <span className="text-sm font-medium text-[#526174]">pcs</span>
          </div>
          <p className="text-xs text-[#526174] mt-1">Diserahkan ke mitra via ekspedisi</p>
        </div>

        {/* KPI 4: Perlu Perhatian */}
        <div className="bg-white border border-[#D9E0E8] rounded-xl p-6 min-h-[136px] flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-[#526174]">Perlu Perhatian</p>
            {metrics.attentionCount > 0 && (
              <span className="w-2.5 h-2.5 rounded-full bg-[#B54708]" />
            )}
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl lg:text-4xl font-bold text-[#B54708] tabular-nums">
              {metrics.attentionCount}
            </span>
            <span className="text-sm font-medium text-[#526174]">tugas</span>
          </div>
          <button
            onClick={() => onNavigate('pusat_peringatan')}
            className="text-xs font-semibold text-[#0077C8] hover:underline text-left mt-1 cursor-pointer"
          >
            Tinjau di Pusat Peringatan →
          </button>
        </div>
      </div>

      {/* 4. Main Two-Column Layout (8 col left, 4 col right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Perkembangan Operasional & Aktivitas Terbaru (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Operational Progress Card */}
          <div className="bg-white border border-[#D9E0E8] rounded-xl p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#D9E0E8]">
              <div>
                <h3 className="text-lg md:text-xl font-bold text-[#1E293B]">Perkembangan Operasional</h3>
                <p className="text-xs md:text-sm text-[#526174]">
                  Berikut perbandingan jumlah barang yang dipesan, selesai diproduksi, dan sudah dikirim.
                </p>
              </div>
              <button
                onClick={() => onNavigate('daftar_pesanan')}
                className="text-xs md:text-sm font-semibold text-[#0077C8] hover:underline cursor-pointer self-start sm:self-auto"
              >
                Lihat Semua Pesanan →
              </button>
            </div>

            {/* Visual Progress Comparison Bars */}
            <div className="mt-6 space-y-5">
              {/* 1. Dipesan */}
              <div>
                <div className="flex justify-between items-center text-sm font-medium mb-1.5">
                  <span className="text-[#1E293B] font-semibold">Total Target Dipesan Mitra</span>
                  <span className="tabular-nums font-bold text-[#1B365D]">
                    {metrics.totalOrderedQty.toLocaleString('id-ID')} pcs
                  </span>
                </div>
                <div className="w-full h-4 bg-[#E5EAF0] rounded-full overflow-hidden">
                  <div className="h-full bg-[#1B365D] rounded-full w-full" />
                </div>
              </div>

              {/* 2. Selesai Diproduksi */}
              <div>
                <div className="flex justify-between items-center text-sm font-medium mb-1.5">
                  <span className="text-[#1E293B] font-semibold">Selesai Diproduksi di Pabrik</span>
                  <span className="tabular-nums font-bold text-[#0077C8]">
                    {metrics.totalProducedQty.toLocaleString('id-ID')} pcs (
                    {metrics.totalOrderedQty > 0
                      ? Math.round((metrics.totalProducedQty / metrics.totalOrderedQty) * 100)
                      : 0}
                    %)
                  </span>
                </div>
                <div className="w-full h-4 bg-[#E5EAF0] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#0077C8] rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        100,
                        metrics.totalOrderedQty > 0
                          ? (metrics.totalProducedQty / metrics.totalOrderedQty) * 100
                          : 0
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {/* 3. Sudah Dikirim */}
              <div>
                <div className="flex justify-between items-center text-sm font-medium mb-1.5">
                  <span className="text-[#1E293B] font-semibold">Sudah Diserahkan ke Ekspedisi</span>
                  <span className="tabular-nums font-bold text-[#18794E]">
                    {metrics.totalShippedQty.toLocaleString('id-ID')} pcs (
                    {metrics.overallDeliveryRate}%)
                  </span>
                </div>
                <div className="w-full h-4 bg-[#E5EAF0] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#18794E] rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, metrics.overallDeliveryRate)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Explanatory Note */}
            <div className="mt-6 p-4 rounded-lg bg-[#F8FAFC] border border-[#D9E0E8] flex items-start gap-3">
              <Info className="w-5 h-5 text-[#0077C8] shrink-0 mt-0.5" />
              <p className="text-xs md:text-sm text-[#526174] leading-relaxed">
                Tingkat pemenuhan saat ini mencapai <strong>{metrics.overallDeliveryRate}%</strong> dari total pesanan.
                Sisa pesanan yang belum terkirim adalah{' '}
                <strong className="text-[#1E293B]">
                  {Math.max(0, metrics.totalOrderedQty - metrics.totalShippedQty).toLocaleString('id-ID')} pcs
                </strong>
                .
              </p>
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className="bg-white border border-[#D9E0E8] rounded-xl p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-[#D9E0E8]">
              <div>
                <h3 className="text-lg md:text-xl font-bold text-[#1E293B]">Aktivitas Terbaru</h3>
                <p className="text-xs md:text-sm text-[#526174]">
                  Catatan transaksi operasional paling mutakhir.
                </p>
              </div>
              <button
                onClick={() => onNavigate('riwayat_aktivitas')}
                className="text-xs md:text-sm font-semibold text-[#0077C8] hover:underline cursor-pointer"
              >
                Lihat Semua Riwayat →
              </button>
            </div>

            {activities.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-base font-semibold text-[#1E293B]">Belum ada aktivitas yang tercatat.</p>
                <p className="text-sm text-[#526174] mt-1">Mulai dengan mencatat pesanan pertama.</p>
                <button
                  onClick={() => onNavigate('form_pesanan')}
                  className="mt-4 px-4 py-2 bg-[#0077C8] text-white rounded-lg text-sm font-semibold"
                >
                  Catat Pesanan
                </button>
              </div>
            ) : (
              <div className="mt-4 divide-y divide-[#D9E0E8]">
                {activities.slice(0, 5).map((act) => (
                  <div key={act.activity_id} className="py-3.5 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-[#F2F4F7] flex items-center justify-center shrink-0 mt-0.5 text-[#1B365D]">
                        {act.activity_type === 'pesanan' && <ClipboardPlus className="w-4 h-4" />}
                        {act.activity_type === 'produksi' && <Factory className="w-4 h-4" />}
                        {act.activity_type === 'pengiriman' && <Truck className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#1E293B] leading-tight">
                          {act.description}
                        </p>
                        <p className="text-xs text-[#526174] mt-1">
                          Ref: <strong className="font-mono text-[#0077C8]">{act.related_order_id}</strong> · Dicatat oleh: {act.recorded_by}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-[#526174] whitespace-nowrap shrink-0 font-medium">
                      {act.timestamp}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Perlu Ditindaklanjuti & 3D Inspection Widget (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Attention Panel */}
          <div className="bg-white border border-[#D9E0E8] rounded-xl p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#D9E0E8]">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#B54708]" />
                <h3 className="text-lg font-bold text-[#1E293B]">Perlu Ditindaklanjuti</h3>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-[#B54708]">
                {alerts.length}
              </span>
            </div>

            {alerts.length === 0 ? (
              <div className="py-8 text-center">
                <CheckCircle2 className="w-8 h-8 text-[#18794E] mx-auto mb-2" />
                <p className="text-sm font-semibold text-[#1E293B]">Tidak ada peringatan saat ini.</p>
                <p className="text-xs text-[#526174] mt-1">Semua pesanan berada dalam jadwal normal.</p>
              </div>
            ) : (
              <div className="mt-4 space-y-3.5">
                {alerts.slice(0, 4).map((alt) => (
                  <div
                    key={alt.id}
                    className="p-3.5 rounded-lg border border-[#D9E0E8] bg-[#F8FAFC] hover:bg-white hover:border-[#0077C8] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                          alt.severity === 'terlambat'
                            ? 'bg-red-50 text-[#B42318] border border-red-200'
                            : alt.severity === 'mendekati'
                            ? 'bg-amber-50 text-[#B54708] border border-amber-200'
                            : 'bg-blue-50 text-[#0B63A8] border border-blue-200'
                        }`}
                      >
                        {alt.severity.toUpperCase()}
                      </span>
                      <span className="text-xs text-[#526174] font-medium font-mono">
                        {alt.order_id}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-[#1E293B] mt-2 leading-tight">
                      {alt.title}
                    </h4>
                    <p className="text-xs text-[#526174] mt-1 leading-snug">{alt.description}</p>
                    <p className="text-[11px] text-[#526174] mt-1">Mitra: {alt.partner_name}</p>

                    <button
                      onClick={() => onSelectOrderForDetail(alt.order_id)}
                      className="mt-3 w-full py-1.5 px-3 bg-white hover:bg-blue-50 text-[#0077C8] border border-[#D9E0E8] hover:border-[#0077C8] rounded-md text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>Lihat Detail</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3D Part Inspection Banner Card */}
          <div className="bg-[#1B365D] text-white rounded-xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2 text-blue-200 text-xs font-semibold uppercase tracking-wider">
                <Box className="w-4 h-4 text-[#0077C8]" />
                <span>Teknologi 3D Digital Twin</span>
              </div>
              <h3 className="text-lg font-bold text-white leading-tight">
                Inspeksi 3D Part & Perakitan
              </h3>
              <p className="text-xs text-blue-100/80 mt-2 leading-relaxed">
                Tinjau spesifikasi geometri, exploded view, dan toleransi part manufaktur pesanan secara interaktif dalam 3D Three.js.
              </p>
            </div>

            <button
              onClick={() => onNavigate('inspeksi_3d')}
              className="mt-5 w-full py-2.5 px-4 bg-[#0077C8] hover:bg-[#0069b2] text-white text-xs md:text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs focus-beesha"
            >
              <Eye className="w-4 h-4" />
              <span>Buka Viewer 3D Part</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
