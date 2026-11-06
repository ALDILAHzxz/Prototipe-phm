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
} from 'lucide-react';
import { Order, Partner, Product, ProductionRecord, DeliveryRecord, AlertItem, ScreenType, Staff } from '../../types';
import { calculatePeriodSummary, calculateSingleOrderProgress, getVerificationStatus } from '../../utils/operations';
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
  const usesSample = orders.some((o) => o.source === 'data_contoh');

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-[28px] md:text-[32px] font-bold text-ink leading-tight">
            {activeStaff ? `Halo, ${activeStaff.name}` : 'Beranda'}
          </h1>
          <p className="mt-1 text-base md:text-lg text-ink-muted">Apa yang ingin Anda catat sekarang?</p>
        </div>
        <p className="flex items-center gap-2 text-[15px] text-ink-muted">
          <Clock className="w-5 h-5" aria-hidden />
          Data terakhir berubah: <strong className="text-ink">{updatedAt ? formatDateTime(updatedAt) : '-'}</strong>
        </p>
      </header>

      {usesSample && (
        <Notice tone="info" title="Berisi data contoh">
          Angka di aplikasi ini berasal dari data contoh dan catatan yang Anda input di perangkat ini — bukan data perusahaan
          sebenarnya, dan belum terhubung ke INDIGO.
        </Notice>
      )}

      {/* Aksi utama */}
      <section aria-label="Catat data" className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Catat Pesanan', desc: 'Pesanan baru dari mitra', icon: ClipboardPlus, screen: 'form_pesanan' as ScreenType },
          { label: 'Catat Produksi', desc: 'Barang yang selesai dibuat', icon: Factory, screen: 'form_produksi' as ScreenType },
          { label: 'Catat Pengiriman', desc: 'Barang yang berangkat ke mitra', icon: Truck, screen: 'form_pengiriman' as ScreenType },
        ].map((a) => (
          <button
            key={a.label}
            type="button"
            onClick={() => onNavigate(a.screen)}
            className="min-h-[88px] flex items-center gap-4 p-5 rounded-card bg-brand text-white text-left hover:bg-brand-strong shadow-card cursor-pointer"
          >
            <a.icon className="w-8 h-8 shrink-0" aria-hidden />
            <span className="flex-1">
              <span className="block text-xl font-bold">{a.label}</span>
              <span className="block text-[15px] text-white/90">{a.desc}</span>
            </span>
            <ChevronRight className="w-6 h-6 shrink-0" aria-hidden />
          </button>
        ))}
      </section>

      {/* Hal yang perlu ditindaklanjuti */}
      <section aria-label="Perlu ditindaklanjuti" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            n: pendingVerification,
            label: 'catatan menunggu pemeriksaan',
            cta: 'Periksa data',
            screen: 'pemeriksaan_data' as ScreenType,
            icon: ShieldCheck,
            tone: pendingVerification ? 'text-warning' : 'text-success',
          },
          {
            n: needsFix,
            label: 'catatan perlu diperbaiki',
            cta: 'Lihat catatan',
            screen: 'pemeriksaan_data' as ScreenType,
            icon: AlertTriangle,
            tone: needsFix ? 'text-danger' : 'text-success',
          },
          {
            n: late,
            label: 'pesanan lewat tenggat',
            cta: 'Lihat peringatan',
            screen: 'pusat_peringatan' as ScreenType,
            icon: Clock,
            tone: late ? 'text-danger' : 'text-success',
          },
        ].map((x) => (
          <div key={x.label} className="bg-surface border border-line rounded-card shadow-card p-5 flex flex-col">
            <p className="flex items-baseline gap-2">
              <x.icon className={`w-6 h-6 self-center ${x.tone}`} aria-hidden />
              <span className={`text-3xl font-bold tabular-nums ${x.tone}`}>{x.n}</span>
              <span className="text-base text-ink">{x.label}</span>
            </p>
            <button
              type="button"
              onClick={() => onNavigate(x.screen)}
              className="mt-3 self-start min-h-[44px] inline-flex items-center gap-1 text-base font-semibold text-brand underline underline-offset-4 cursor-pointer"
            >
              {x.cta}
              <ChevronRight className="w-5 h-5" aria-hidden />
            </button>
          </div>
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
          <div className="p-4 rounded-card bg-subtle border border-line">
            <dt className="text-base font-semibold text-ink">Pesanan masuk</dt>
            <dd className="mt-1 text-[32px] font-bold tabular-nums text-navy leading-none">{summary.ordersInPeriod}</dd>
            <dd className="mt-2 text-[15px] text-ink-muted">Jumlah PO dengan tanggal pesanan di periode ini.</dd>
          </div>
          <div className="p-4 rounded-card bg-subtle border border-line">
            <dt className="text-base font-semibold text-ink">Produksi aktual</dt>
            <dd className="mt-1 text-[32px] font-bold tabular-nums text-info leading-none">
              {summary.producedInPeriod.toLocaleString('id-ID')} <span className="text-lg">pcs</span>
            </dd>
            <dd className="mt-2 text-[15px] text-ink-muted">
              Barang baik tercatat. Sudah diperiksa: <strong className="text-ink">{summary.producedVerifiedInPeriod.toLocaleString('id-ID')} pcs</strong>
            </dd>
          </div>
          <div className="p-4 rounded-card bg-subtle border border-line">
            <dt className="text-base font-semibold text-ink">Pengiriman aktual</dt>
            <dd className="mt-1 text-[32px] font-bold tabular-nums text-success leading-none">
              {summary.shippedInPeriod.toLocaleString('id-ID')} <span className="text-lg">pcs</span>
            </dd>
            <dd className="mt-2 text-[15px] text-ink-muted">
              Barang berangkat. Sudah diperiksa: <strong className="text-ink">{summary.shippedVerifiedInPeriod.toLocaleString('id-ID')} pcs</strong>
            </dd>
          </div>
        </dl>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        <Card
          className="xl:col-span-2"
          title={`Pesanan berjalan (${active.length})`}
          description="Rencana = jumlah dipesan. Batang menunjukkan realisasi produksi dan pengiriman. Tenggat terdekat di atas."
          actions={
            <Button variant="quiet" onClick={() => onNavigate('daftar_pesanan')} iconRight={<ChevronRight className="w-5 h-5" />}>
              Semua pesanan
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
            <ul className="divide-y divide-line -my-4">
              {active.slice(0, 6).map(({ o, p, partner, product }) => (
                <li key={o.order_id} className="py-4">
                  <button
                    type="button"
                    onClick={() => onSelectOrderForDetail(o.order_id)}
                    className="w-full text-left rounded-field cursor-pointer group"
                  >
                    <span className="flex flex-wrap items-start justify-between gap-2">
                      <span className="min-w-0">
                        <span className="block text-[17px] font-bold text-ink group-hover:text-brand group-hover:underline">
                          {partner?.partner_name}
                        </span>
                        <span className="block text-[15px] text-ink-muted">
                          {product?.product_name} · <span className="font-mono">{o.order_id}</span> · tenggat {formatDate(o.due_date)}
                        </span>
                      </span>
                      <OrderStatusBadge status={p.computedStatus} />
                    </span>
                    <span className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <span>
                        <span className="flex justify-between text-[15px] mb-1">
                          <span>Diproduksi</span>
                          <span className="tabular-nums font-semibold">
                            {p.totalProduced.toLocaleString('id-ID')} / {p.totalOrdered.toLocaleString('id-ID')}
                          </span>
                        </span>
                        <ProgressBar value={p.productionPercentage} label={`Produksi ${o.order_id}`} />
                      </span>
                      <span>
                        <span className="flex justify-between text-[15px] mb-1">
                          <span>Dikirim</span>
                          <span className="tabular-nums font-semibold">
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

        <div className="space-y-6">
          <Card
            title="Peringatan"
            actions={
              alerts.length > 0 && (
                <Button variant="quiet" onClick={() => onNavigate('pusat_peringatan')}>
                  Semua ({alerts.length})
                </Button>
              )
            }
          >
            {alerts.length === 0 ? (
              <p className="text-base text-ink-muted">Tidak ada pesanan yang terlambat atau mendekati tenggat.</p>
            ) : (
              <ul className="space-y-3">
                {alerts.slice(0, 4).map((a) => (
                  <li key={a.id}>
                    <button
                      type="button"
                      onClick={() => onSelectOrderForDetail(a.order_id)}
                      className="w-full text-left p-3 rounded-field border border-line hover:bg-subtle cursor-pointer"
                    >
                      <SeverityBadge severity={a.severity} />
                      <span className="block mt-2 text-base font-semibold text-ink">{a.partner_name}</span>
                      <span className="block text-[15px] text-ink-muted">{a.description}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card
            title="Catatan terbaru"
            actions={
              <Button variant="quiet" onClick={() => onNavigate('riwayat_aktivitas')}>
                Riwayat
              </Button>
            }
          >
            <ul className="space-y-4">
              {activities.slice(0, 5).map((a) => (
                <li key={a.activity_id} className="text-[15px]">
                  <p className="text-sm text-ink-muted">{formatDateTime(a.timestamp)}</p>
                  <p className="text-ink">{a.description}</p>
                  <p className="text-sm text-ink-muted">Oleh {a.recorded_by}</p>
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Status integrasi">
            <ul className="space-y-3 text-[15px]">
              {['INDIGO (ERP)', 'BHEESA (AI pimpinan)'].map((n) => (
                <li key={n} className="flex items-start gap-3">
                  <Link2Off className="w-5 h-5 text-ink-muted shrink-0 mt-0.5" aria-hidden />
                  <span>
                    <strong>{n}:</strong> belum terhubung. Data belum dikirim ke sistem ini.
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm text-ink-muted">
              Data disimpan di browser perangkat ini. Kontrak data untuk integrasi ada di dokumen docs/INTEGRASI.md.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};
