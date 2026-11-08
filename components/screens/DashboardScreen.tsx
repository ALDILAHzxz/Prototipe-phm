import React, { useMemo, useState } from 'react';
import {
  ClipboardPlus,
  Factory,
  Truck,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
  Link2Off,
  Clock,
  Box,
  CheckCircle2,
  Package,
  Calendar,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { Order, Partner, Product, ProductionRecord, DeliveryRecord, AlertItem, ScreenType, Staff } from '../../types';
import { calculateDashboardMetrics, calculatePeriodSummary, calculateSingleOrderProgress, getVerificationStatus } from '../../utils/operations';
import { addDays, formatDate, formatDateTime, todayISODate } from '../../lib/format';
import { DerivedActivity } from '../../lib/activity';
import { Card, EmptyState, FilterChips, ProgressBar, Notice } from '../ui/Layout';
import { Button } from '../ui/Button';
import { OrderStatusBadge } from '../ui/StatusBadge';
import { SeverityBadge } from './AlertCenterScreen';

interface DashboardScreenProps {
  orders: Order[];
  partners: Partner[];
  products: Product[];
  productionRecords: ProductionRecord[];
  deliveryRecords: DeliveryRecord[];
  activities: DerivedActivity[];
  alerts: AlertItem[];
  updatedAt?: string;
  activeStaff: Staff | null;
  onNavigate: (screen: ScreenType) => void;
  onSelectOrderForDetail: (orderId: string) => void;
}

type Period = 'hari_ini' | '7_hari' | 'bulan_ini';

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  orders,
  partners,
  products,
  productionRecords,
  deliveryRecords,
  activities,
  alerts,
  updatedAt,
  activeStaff,
  onNavigate,
  onSelectOrderForDetail,
}) => {
  const [period, setPeriod] = useState<Period>('7_hari');
  const today = todayISODate();
  const range = useMemo(() => {
    if (period === 'hari_ini') return { from: today, to: today, label: `hari ini (${formatDate(today)})` };
    if (period === '7_hari')
      return { from: addDays(today, -6), to: today, label: `${formatDate(addDays(today, -6))} – ${formatDate(today)}` };
    const from = `${today.slice(0, 8)}01`;
    return { from, to: today, label: `${formatDate(from)} – ${formatDate(today)}` };
  }, [period, today]);

  const summary = useMemo(
    () => calculatePeriodSummary(orders, productionRecords, deliveryRecords, range.from, range.to),
    [orders, productionRecords, deliveryRecords, range]
  );

  const active = useMemo(
    () =>
      orders
        .map((o) => ({
          o,
          p: calculateSingleOrderProgress(o, productionRecords, deliveryRecords),
          partner: partners.find((x) => x.partner_id === o.partner_id),
          product: products.find((x) => x.product_id === o.product_id),
        }))
        .filter((r) => r.p.computedStatus !== 'selesai')
        .sort((a, b) => a.o.due_date.localeCompare(b.o.due_date)),
    [orders, partners, products, productionRecords, deliveryRecords]
  );

  const pendingVerification = [...productionRecords, ...deliveryRecords].filter(
    (r) => getVerificationStatus(r) === 'menunggu_pemeriksaan'
  ).length;
  const needsFix = [...productionRecords, ...deliveryRecords].filter(
    (r) => getVerificationStatus(r) === 'perlu_diperbaiki'
  ).length;
  const late = alerts.filter((a) => a.severity === 'terlambat').length;

  const metrics = useMemo(
    () => calculateDashboardMetrics(orders, productionRecords, deliveryRecords, pendingVerification + needsFix + late),
    [orders, productionRecords, deliveryRecords, pendingVerification, needsFix, late]
  );
  const remainingToShip = Math.max(0, metrics.totalOrderedQty - metrics.totalShippedQty);
  const overallProdRate =
    metrics.totalOrderedQty > 0 ? Math.min(100, Math.round((metrics.totalProducedQty / metrics.totalOrderedQty) * 100)) : 0;

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div>
            <h1 className="text-[28px] md:text-[32px] font-bold text-ink leading-tight">
              <span className="md:hidden">Beesha</span>
              <span className="hidden md:inline">Ringkasan Operasional</span>
            </h1>
          </div>
          <p className="mt-1 text-base md:text-lg text-ink-muted">
            Pantau pesanan, produksi, dan pengiriman dalam satu tempat.{activeStaff ? ` Halo, ${activeStaff.name}.` : ''}
          </p>
        </div>
        <p className="flex items-center gap-2 text-[15px] text-ink-muted">
          <Clock className="w-5 h-5 shrink-0" aria-hidden />
          Data terakhir berubah: <strong className="text-ink">{updatedAt ? formatDateTime(updatedAt) : '-'}</strong>
        </p>
      </header>

      {/* Aksi utama */}
      <section aria-label="Catat data" className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            label: 'Catat Pesanan',
            desc: 'Masukkan pesanan baru dari mitra.',
            icon: ClipboardPlus,
            screen: 'form_pesanan' as ScreenType,
            accent: 'from-brand to-[#0062A6]',
          },
          {
            label: 'Catat Produksi',
            desc: 'Catat jumlah barang yang selesai dibuat.',
            icon: Factory,
            screen: 'form_produksi' as ScreenType,
            accent: 'from-brand to-[#0062A6]',
          },
          {
            label: 'Catat Pengiriman',
            desc: 'Catat barang yang sudah dikirim.',
            icon: Truck,
            screen: 'form_pengiriman' as ScreenType,
            accent: 'from-brand to-[#0062A6]',
          },
        ].map((a) => (
          <button
            key={a.label}
            type="button"
            onClick={() => onNavigate(a.screen)}
            className="interactive-card min-h-[148px] flex flex-col justify-between p-6 rounded-card bg-brand bg-gradient-to-br from-brand to-[#005FA3] text-white text-left shadow-card hover:shadow-card-hover transition-all cursor-pointer group border border-brand-strong/30"
          >
            <div className="flex items-center justify-between w-full">
              <span className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center shrink-0 text-white backdrop-blur-xs group-hover:bg-white group-hover:text-brand transition-all">
                <a.icon className="w-6 h-6" aria-hidden />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-3 py-1.5 rounded-lg text-white group-hover:bg-white group-hover:text-brand transition-colors flex items-center gap-1.5 shadow-xs">
                Mulai Input <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" aria-hidden />
              </span>
            </div>
            <div className="mt-4">
              <span className="block text-xl md:text-[22px] font-bold tracking-tight">{a.label}</span>
              <span className="block text-[15px] text-white/90 mt-1">{a.desc}</span>
            </div>
          </button>
        ))}
      </section>

      {/* 4 KPI Cards - fully clickable to relevant sections */}
      <section aria-label="Indikator Kinerja Utama" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => onNavigate('daftar_pesanan')}
          className="interactive-card bg-surface border border-line rounded-card shadow-card p-5 text-left cursor-pointer group hover:border-line-blue"
        >
          <div className="flex items-center justify-between">
            <span className="text-base font-semibold text-ink-muted">Pesanan Aktif</span>
            <span className="w-9 h-9 rounded-lg bg-subtle text-navy dark:text-[#8CCBFF] flex items-center justify-center group-hover:bg-brand-soft group-hover:text-brand transition-colors">
              <ClipboardPlus className="w-5 h-5" aria-hidden />
            </span>
          </div>
          <p className="mt-3 text-3xl md:text-[36px] font-bold text-navy dark:text-[#8CCBFF] tabular-nums leading-none">
            {metrics.activeOrdersCount} <span className="text-base font-semibold text-ink-muted">pesanan</span>
          </p>
          <p className="mt-2 text-[14px] text-ink-muted flex items-center justify-between">
            <span>Dalam proses pengerjaan</span>
            <ArrowUpRight className="w-4 h-4 text-ink-muted opacity-0 group-hover:opacity-100 group-hover:text-brand transition-opacity" />
          </p>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('riwayat_aktivitas')}
          className="interactive-card bg-surface border border-line rounded-card shadow-card p-5 text-left cursor-pointer group hover:border-line-blue"
        >
          <div className="flex items-center justify-between">
            <span className="text-base font-semibold text-ink-muted">Produksi Selesai</span>
            <span className="w-9 h-9 rounded-lg bg-subtle text-brand flex items-center justify-center group-hover:bg-brand-soft group-hover:text-brand transition-colors">
              <Factory className="w-5 h-5" aria-hidden />
            </span>
          </div>
          <p className="mt-3 text-3xl md:text-[36px] font-bold text-brand tabular-nums leading-none">
            {metrics.totalProducedQty.toLocaleString('id-ID')} <span className="text-base font-semibold text-ink-muted">pcs</span>
          </p>
          <p className="mt-2 text-[14px] text-ink-muted flex items-center justify-between">
            <span>Tercatat dari target</span>
            <ArrowUpRight className="w-4 h-4 text-ink-muted opacity-0 group-hover:opacity-100 group-hover:text-brand transition-opacity" />
          </p>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('riwayat_aktivitas')}
          className="interactive-card bg-surface border border-line rounded-card shadow-card p-5 text-left cursor-pointer group hover:border-line-blue"
        >
          <div className="flex items-center justify-between">
            <span className="text-base font-semibold text-ink-muted">Total Terkirim</span>
            <span className="w-9 h-9 rounded-lg bg-subtle text-success flex items-center justify-center group-hover:bg-success-soft group-hover:text-success transition-colors">
              <Truck className="w-5 h-5" aria-hidden />
            </span>
          </div>
          <p className="mt-3 text-3xl md:text-[36px] font-bold text-success tabular-nums leading-none">
            {metrics.totalShippedQty.toLocaleString('id-ID')} <span className="text-base font-semibold text-ink-muted">pcs</span>
          </p>
          <p className="mt-2 text-[14px] text-ink-muted flex items-center justify-between">
            <span>{metrics.overallDeliveryRate}% dari total pesanan</span>
            <ArrowUpRight className="w-4 h-4 text-ink-muted opacity-0 group-hover:opacity-100 group-hover:text-success transition-opacity" />
          </p>
        </button>

        <button
          type="button"
          onClick={() => onNavigate(pendingVerification + needsFix > 0 ? 'pemeriksaan_data' : 'pusat_peringatan')}
          className="interactive-card bg-surface border border-line rounded-card shadow-card p-5 text-left cursor-pointer group hover:border-line-blue"
        >
          <div className="flex items-center justify-between">
            <span className="text-base font-semibold text-ink-muted">Perlu Perhatian</span>
            <span
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                metrics.attentionCount > 0 ? 'bg-warning-soft text-warning' : 'bg-success-soft text-success'
              }`}
            >
              <AlertTriangle className="w-5 h-5" aria-hidden />
            </span>
          </div>
          <p
            className={`mt-3 text-3xl md:text-[36px] font-bold tabular-nums leading-none ${
              metrics.attentionCount > 0 ? 'text-warning' : 'text-success'
            }`}
          >
            {metrics.attentionCount} <span className="text-base font-semibold text-ink-muted">catatan</span>
          </p>
          <p className="mt-2 text-[14px] text-ink-muted flex items-center justify-between">
            <span>Pemeriksaan &amp; peringatan</span>
            <ArrowUpRight className="w-4 h-4 text-ink-muted opacity-0 group-hover:opacity-100 group-hover:text-warning transition-opacity" />
          </p>
        </button>
      </section>

      {/* Ringkasan Progres Operasional */}
      <Card
        title="Progres Operasional Menyeluruh"
        description="Akumulasi seluruh pesanan aktif dan selesai yang tercatat pada sistem prototipe."
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="p-4 rounded-card bg-subtle border border-line">
            <p className="text-sm font-semibold text-ink-muted flex items-center gap-1.5">
              <Package className="w-4 h-4 text-navy dark:text-[#8CCBFF]" /> Dipesan
            </p>
            <p className="mt-2 text-2xl font-bold tabular-nums text-navy dark:text-[#8CCBFF]">
              {metrics.totalOrderedQty.toLocaleString('id-ID')} <span className="text-sm font-semibold">pcs</span>
            </p>
            <p className="text-xs text-ink-muted mt-1">Total PO tercatat</p>
          </div>
          <div className="p-4 rounded-card bg-subtle border border-line">
            <p className="text-sm font-semibold text-ink-muted flex items-center gap-1.5">
              <Factory className="w-4 h-4 text-brand" /> Selesai Diproduksi
            </p>
            <p className="mt-2 text-2xl font-bold tabular-nums text-brand">
              {metrics.totalProducedQty.toLocaleString('id-ID')} <span className="text-sm font-semibold">pcs</span>
            </p>
            <p className="text-xs text-ink-muted mt-1">{overallProdRate}% dari rencana</p>
          </div>
          <div className="p-4 rounded-card bg-subtle border border-line">
            <p className="text-sm font-semibold text-ink-muted flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-success" /> Terkirim
            </p>
            <p className="mt-2 text-2xl font-bold tabular-nums text-success">
              {metrics.totalShippedQty.toLocaleString('id-ID')} <span className="text-sm font-semibold">pcs</span>
            </p>
            <p className="text-xs text-ink-muted mt-1">{metrics.overallDeliveryRate}% dari rencana</p>
          </div>
          <div className="p-4 rounded-card bg-subtle border border-line">
            <p className="text-sm font-semibold text-ink-muted flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-warning" /> Sisa Belum Dikirim
            </p>
            <p className="mt-2 text-2xl font-bold tabular-nums text-warning">
              {remainingToShip.toLocaleString('id-ID')} <span className="text-sm font-semibold">pcs</span>
            </p>
            <p className="text-xs text-ink-muted mt-1">Belum diberangkatkan</p>
          </div>
        </div>
        <div className="space-y-4 pt-2">
          <div>
            <div className="flex justify-between text-sm mb-1 font-semibold">
              <span className="text-ink">Progres Produksi Menyeluruh</span>
              <span className="tabular-nums font-bold text-brand">{overallProdRate}%</span>
            </div>
            <ProgressBar value={overallProdRate} label="Progres Produksi Menyeluruh" tone="brand" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1 font-semibold">
              <span className="text-ink">Progres Pengiriman Menyeluruh</span>
              <span className="tabular-nums font-bold text-success">{metrics.overallDeliveryRate}%</span>
            </div>
            <ProgressBar value={metrics.overallDeliveryRate} label="Progres Pengiriman Menyeluruh" tone="success" />
          </div>
        </div>
      </Card>

      {/* Hal yang perlu ditindaklanjuti - fully clickable cards with clear buttons */}
      <section aria-label="Perlu ditindaklanjuti" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            n: pendingVerification,
            label: 'catatan menunggu pemeriksaan',
            cta: 'Periksa Data',
            screen: 'pemeriksaan_data' as ScreenType,
            icon: ShieldCheck,
            tone: pendingVerification ? 'text-warning' : 'text-success',
            iconBg: pendingVerification ? 'bg-warning-soft text-warning' : 'bg-success-soft text-success',
          },
          {
            n: needsFix,
            label: 'catatan perlu diperbaiki',
            cta: 'Lihat Catatan',
            screen: 'pemeriksaan_data' as ScreenType,
            icon: AlertTriangle,
            tone: needsFix ? 'text-danger' : 'text-success',
            iconBg: needsFix ? 'bg-danger-soft text-danger' : 'bg-success-soft text-success',
          },
          {
            n: late,
            label: 'pesanan lewat tenggat',
            cta: 'Lihat Peringatan',
            screen: 'pusat_peringatan' as ScreenType,
            icon: Clock,
            tone: late ? 'text-danger' : 'text-success',
            iconBg: late ? 'bg-danger-soft text-danger' : 'bg-success-soft text-success',
          },
        ].map((x) => (
          <button
            key={x.label}
            type="button"
            onClick={() => onNavigate(x.screen)}
            className="interactive-card bg-surface border border-line rounded-card shadow-card p-5 flex flex-col justify-between text-left cursor-pointer group hover:border-line-blue"
          >
            <div>
              <div className="flex items-center gap-3">
                <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${x.iconBg}`}>
                  <x.icon className="w-5 h-5" aria-hidden />
                </span>
                <span className={`text-3xl font-bold tabular-nums ${x.tone}`}>{x.n}</span>
              </div>
              <p className="mt-3 text-base font-medium text-ink">{x.label}</p>
            </div>
            <div className="mt-4 pt-3 border-t border-line/60 flex items-center justify-between w-full">
              <span className="text-[15px] font-semibold text-brand group-hover:text-brand-strong flex items-center gap-1.5">
                {x.cta} <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden />
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-subtle text-ink-muted border border-line">
                Buka
              </span>
            </div>
          </button>
        ))}
      </section>

      {/* Realisasi per periode */}
      <Card
        title="Realisasi"
        description={`Periode ${range.label}. Dihitung dari tanggal kejadian pada catatan.`}
        actions={
          <FilterChips<Period>
            label="Pilih periode"
            value={period}
            onChange={setPeriod}
            options={[
              { id: 'hari_ini', label: 'Hari ini' },
              { id: '7_hari', label: '7 hari' },
              { id: 'bulan_ini', label: 'Bulan ini' },
            ]}
          />
        }
      >
        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-card bg-subtle border border-line">
            <dt className="text-base font-semibold text-ink flex items-center gap-2">
              <ClipboardPlus className="w-4 h-4 text-navy dark:text-[#8CCBFF]" /> Pesanan masuk
            </dt>
            <dd className="mt-2 text-[32px] font-bold tabular-nums text-navy dark:text-[#8CCBFF] leading-none">{summary.ordersInPeriod}</dd>
            <dd className="mt-2 text-[15px] text-ink-muted">Jumlah PO dengan tanggal pesanan di periode ini.</dd>
          </div>
          <div className="p-5 rounded-card bg-subtle border border-line">
            <dt className="text-base font-semibold text-ink flex items-center gap-2">
              <Factory className="w-4 h-4 text-info" /> Produksi aktual
            </dt>
            <dd className="mt-2 text-[32px] font-bold tabular-nums text-info leading-none">
              {summary.producedInPeriod.toLocaleString('id-ID')} <span className="text-lg">pcs</span>
            </dd>
            <dd className="mt-2 text-[15px] text-ink-muted">
              Barang baik tercatat. Sudah diperiksa: <strong className="text-ink">{summary.producedVerifiedInPeriod.toLocaleString('id-ID')} pcs</strong>
            </dd>
          </div>
          <div className="p-5 rounded-card bg-subtle border border-line">
            <dt className="text-base font-semibold text-ink flex items-center gap-2">
              <Truck className="w-4 h-4 text-success" /> Pengiriman aktual
            </dt>
            <dd className="mt-2 text-[32px] font-bold tabular-nums text-success leading-none">
              {summary.shippedInPeriod.toLocaleString('id-ID')} <span className="text-lg">pcs</span>
            </dd>
            <dd className="mt-2 text-[15px] text-ink-muted">
              Barang berangkat. Sudah diperiksa: <strong className="text-ink">{summary.shippedVerifiedInPeriod.toLocaleString('id-ID')} pcs</strong>
            </dd>
          </div>
        </dl>
      </Card>

      {/* RESTRUCTURED LOWER DASHBOARD: Balanced 2-column section (NO LARGE EMPTY VOID) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Pesanan berjalan */}
        <div className="lg:col-span-7 xl:col-span-8">
          <Card
            title={`Pesanan berjalan (${active.length})`}
            description="Rencana = jumlah dipesan. Batang menunjukkan realisasi produksi dan pengiriman. Tenggat terdekat di atas."
            actions={
              <Button variant="secondary" size="sm" onClick={() => onNavigate('daftar_pesanan')} iconRight={<ChevronRight className="w-4 h-4" />}>
                Lihat Semua ({active.length})
              </Button>
            }
          >
            {active.length === 0 ? (
              <EmptyState
                title="Tidak ada pesanan berjalan"
                description="Semua pesanan sudah selesai dikirim."
                action={<Button onClick={() => onNavigate('form_pesanan')}>Catat Pesanan Baru</Button>}
              />
            ) : (
              <ul className="space-y-3">
                {active.slice(0, 5).map(({ o, p, partner, product }) => (
                  <li key={o.order_id}>
                    <button
                      type="button"
                      onClick={() => onSelectOrderForDetail(o.order_id)}
                      className="interactive-card w-full text-left rounded-xl cursor-pointer group p-3.5 sm:p-4 bg-surface hover:bg-subtle border border-line/60 transition-all block"
                    >
                      <span className="flex flex-wrap items-start justify-between gap-2">
                        <span className="min-w-0 flex-1">
                          <span className="block text-[16px] sm:text-[17px] font-bold text-ink group-hover:text-brand transition-colors break-words">
                            {partner?.partner_name}
                          </span>
                          <span className="block text-[13.5px] sm:text-[14.5px] text-ink-muted mt-0.5 break-words">
                            {product?.product_name} · <span className="font-mono text-navy dark:text-[#8CCBFF] font-bold">{o.order_id}</span> · tenggat {formatDate(o.due_date)}
                          </span>
                        </span>
                        <OrderStatusBadge status={p.computedStatus} />
                      </span>
                      <span className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <span>
                          <span className="flex justify-between text-xs sm:text-[13px] mb-1">
                            <span className="text-ink-muted">Diproduksi</span>
                            <span className="tabular-nums font-semibold text-brand">
                              {p.totalProduced.toLocaleString('id-ID')} / {p.totalOrdered.toLocaleString('id-ID')}
                            </span>
                          </span>
                          <ProgressBar value={p.productionPercentage} label={`Produksi ${o.order_id}`} />
                        </span>
                        <span>
                          <span className="flex justify-between text-xs sm:text-[13px] mb-1">
                            <span className="text-ink-muted">Dikirim</span>
                            <span className="tabular-nums font-semibold text-success">
                              {p.totalShipped.toLocaleString('id-ID')} / {p.totalOrdered.toLocaleString('id-ID')}
                            </span>
                          </span>
                          <ProgressBar value={p.deliveryPercentage} label={`Pengiriman ${o.order_id}`} tone="success" />
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        {/* Right Column: Peringatan & Status Integrasi (Balanced height) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          <Card
            title="Peringatan Operasional"
            actions={
              alerts.length > 0 && (
                <Button variant="secondary" size="sm" onClick={() => onNavigate('pusat_peringatan')}>
                  Semua ({alerts.length})
                </Button>
              )
            }
          >
            {alerts.length === 0 ? (
              <p className="text-base text-ink-muted">Tidak ada pesanan yang terlambat atau mendekati tenggat.</p>
            ) : (
              <ul className="space-y-3">
                {alerts.slice(0, 3).map((a) => (
                  <li key={a.id}>
                    <button
                      type="button"
                      onClick={() => onSelectOrderForDetail(a.order_id)}
                      className="w-full text-left p-3.5 rounded-field border border-line hover:bg-subtle hover:border-line-blue transition-colors cursor-pointer group"
                    >
                      <SeverityBadge severity={a.severity} />
                      <span className="block mt-2 text-base font-semibold text-ink group-hover:text-brand transition-colors">{a.partner_name}</span>
                      <span className="block text-[14px] text-ink-muted">{a.description}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Status Integrasi Sistem">
            <ul className="space-y-3 text-[15px]">
              {['INDIGO (ERP)', 'BHEESA (AI pimpinan)'].map((n) => (
                <li key={n} className="flex items-start gap-3 p-2.5 rounded-field bg-subtle border border-line">
                  <Link2Off className="w-5 h-5 text-ink-muted shrink-0 mt-0.5" aria-hidden />
                  <span>
                    <strong className="text-navy dark:text-[#8CCBFF]">{n}:</strong> belum terhubung. Data belum dikirim ke server pusat.
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm text-ink-muted">
              Data disimpan di peramban perangkat ini. Kontrak integrasi lengkap tercatat di <span className="font-mono text-navy dark:text-[#8CCBFF]">docs/INTEGRASI.md</span>.
            </p>
          </Card>
        </div>
      </div>

      {/* FEATURE CARD: Inspeksi 3D Part & Perakitan (Screenshot 4 & Final Reference) */}
      <section
        aria-label="Inspeksi 3D Part & Perakitan"
        className="interactive-card rounded-card bg-navy text-white p-6 md:p-8 shadow-card flex flex-col md:flex-row md:items-center md:justify-between gap-6 border border-navy-strong"
      >
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 text-brand-soft shadow-inner">
            <Box className="w-8 h-8 text-white" aria-hidden />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl md:text-2xl font-bold tracking-tight">Inspeksi 3D Part &amp; Perakitan</h2>
              <span className="px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider rounded-full bg-brand/40 text-white border border-brand/50">
                Three.js Interactive
              </span>
            </div>
            <p className="mt-1.5 text-base text-white/85 max-w-2xl leading-relaxed">
              Tinjau model dan detail komponen manufaktur presisi secara interaktif (rotasi 360°, zoom, kontrol wireframe, dan dimensi komponen).
            </p>
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-3">
          <Button
            variant="primary"
            size="lg"
            onClick={() => onNavigate('inspeksi_3d')}
            icon={<Box className="w-5 h-5" />}
            className="bg-brand hover:bg-brand-strong text-white font-bold shadow-md min-w-[220px]"
          >
            Buka Viewer 3D Part
          </Button>
        </div>
      </section>

      {/* FULL-WIDTH SECTION: Catatan Aktivitas Terbaru */}
      <Card
        title="Catatan Aktivitas Terbaru"
        description="Linimasa mutasi transaksi operasional terkini yang tercatat pada sistem."
        actions={
          <Button variant="secondary" size="sm" onClick={() => onNavigate('riwayat_aktivitas')} iconRight={<ChevronRight className="w-4 h-4" />}>
            Buka Semua Riwayat ({activities.length})
          </Button>
        }
      >
        <div className="divide-y divide-line -my-4">
          {activities.slice(0, 5).map((a) => (
            <div key={a.activity_id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-lg bg-subtle text-navy dark:text-[#8CCBFF] flex items-center justify-center shrink-0 mt-0.5 border border-line/40">
                  {a.activity_type === 'pesanan' && <ClipboardPlus className="w-4 h-4 text-brand dark:text-[#8CCBFF]" />}
                  {a.activity_type === 'produksi' && <Factory className="w-4 h-4 text-navy dark:text-[#8CCBFF]" />}
                  {a.activity_type === 'pengiriman' && <Truck className="w-4 h-4 text-success" />}
                  {a.activity_type === 'pemeriksaan' && <ShieldCheck className="w-4 h-4 text-warning" />}
                </span>
                <div>
                  <p className="text-base font-semibold text-ink">{a.description}</p>
                  <p className="text-sm text-ink-muted">
                    {formatDateTime(a.timestamp)} · Oleh <strong className="text-ink">{a.recorded_by}</strong>
                  </p>
                </div>
              </div>
              <div className="self-start sm:self-center shrink-0">
                <Button variant="quiet" size="sm" onClick={() => onSelectOrderForDetail(a.related_order_id)}>
                  <span className="font-mono text-sm">{a.related_order_id}</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
