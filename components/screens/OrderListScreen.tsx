import React, { useMemo, useState } from 'react';
import { Search, Plus, ChevronRight, ClipboardList, ChevronDown, CheckCircle2, X } from 'lucide-react';
import { Order, Partner, Product, ProductionRecord, DeliveryRecord, OrderStatus } from '../../types';
import { calculateSingleOrderProgress } from '../../utils/operations';
import { diffCalendarDays, formatDate, todayISODate } from '../../lib/format';
import { PageHeader, Card, EmptyState } from '../ui/Layout';
import { Button } from '../ui/Button';
import { OrderStatusBadge, SourceBadge } from '../ui/StatusBadge';
import { inputClass } from '../ui/Field';

interface OrderListScreenProps {
  orders: Order[];
  partners: Partner[];
  products: Product[];
  productionRecords: ProductionRecord[];
  deliveryRecords: DeliveryRecord[];
  onAddNewOrder: () => void;
  onSelectOrder: (orderId: string) => void;
}

type Filter = 'aktif' | OrderStatus | 'semua';

function DueLabel({ due, done }: { due: string; done: boolean }) {
  const days = diffCalendarDays(todayISODate(), due);
  let note = '';
  let cls = 'text-ink-muted';
  if (!done) {
    if (days < 0) {
      note = `lewat ${Math.abs(days)} hari`;
      cls = 'text-danger font-semibold';
    } else if (days === 0) {
      note = 'hari ini';
      cls = 'text-warning font-semibold';
    } else if (days <= 3) {
      note = `${days} hari lagi`;
      cls = 'text-warning font-semibold';
    }
  }
  return (
    <span>
      <span className="block font-medium tabular-nums">{formatDate(due)}</span>
      {note && <span className={`block text-xs ${cls}`}>{note}</span>}
    </span>
  );
}

export const OrderListScreen: React.FC<OrderListScreenProps> = ({
  orders,
  partners,
  products,
  productionRecords,
  deliveryRecords,
  onAddNewOrder,
  onSelectOrder,
}) => {
  const [filter, setFilter] = useState<Filter>('aktif');
  const [query, setQuery] = useState('');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const rows = useMemo(
    () =>
      orders.map((o) => ({
        o,
        progress: calculateSingleOrderProgress(o, productionRecords, deliveryRecords),
        partner: partners.find((p) => p.partner_id === o.partner_id),
        product: products.find((p) => p.product_id === o.product_id),
      })),
    [orders, partners, products, productionRecords, deliveryRecords]
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = { semua: rows.length, aktif: 0, baru: 0, dalam_produksi: 0, terkirim_sebagian: 0, selesai: 0 };
    rows.forEach((r) => {
      c[r.progress.computedStatus]++;
      if (r.progress.computedStatus !== 'selesai') c.aktif++;
    });
    return c;
  }, [rows]);

  const filterOptions: { id: Filter; label: string; count: number }[] = useMemo(
    () => [
      { id: 'aktif', label: 'Masih berjalan', count: counts.aktif },
      { id: 'baru', label: 'Belum diproduksi', count: counts.baru },
      { id: 'dalam_produksi', label: 'Sedang diproduksi', count: counts.dalam_produksi },
      { id: 'terkirim_sebagian', label: 'Terkirim sebagian', count: counts.terkirim_sebagian },
      { id: 'selesai', label: 'Selesai', count: counts.selesai },
      { id: 'semua', label: 'Semua', count: counts.semua },
    ],
    [counts]
  );

  const activeFilterOption = filterOptions.find((o) => o.id === filter) ?? filterOptions[0];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows
      .filter((r) => {
        if (filter === 'semua') return true;
        if (filter === 'aktif') return r.progress.computedStatus !== 'selesai';
        return r.progress.computedStatus === filter;
      })
      .filter(
        (r) =>
          !q ||
          [r.o.order_id, r.o.po_number, r.partner?.partner_name, r.product?.product_name]
            .filter(Boolean)
            .some((s) => s!.toLowerCase().includes(q))
      )
      .sort((a, b) => a.o.due_date.localeCompare(b.o.due_date));
  }, [rows, filter, query]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pesanan Mitra"
        description="Semua pesanan dari mitra. Pesanan dengan tenggat terdekat ada di atas."
        actions={
          <Button size="lg" onClick={onAddNewOrder} icon={<Plus className="w-5 h-5" />}>
            Catat Pesanan Baru
          </Button>
        }
      />

      <Card as="div" className="p-4 sm:p-5 md:p-6">
        <div className="space-y-4">
          {/* Kolom Pencarian Full-Width */}
          <div className="relative">
            <Search className="w-5 h-5 text-ink-muted absolute left-4 top-1/2 -translate-y-1/2" aria-hidden />
            <label htmlFor="cari-pesanan" className="sr-only">
              Cari pesanan
            </label>
            <input
              id="cari-pesanan"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari nomor pesanan, nomor PO, mitra, atau barang"
              className={inputClass(false, 'pl-12')}
            />
          </div>

          {/* Filter Status: Selektor Kompak di Mobile (<md) */}
          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(true)}
              className="w-full min-h-[52px] px-4 py-2.5 rounded-field bg-subtle border border-line hover:border-brand/60 flex items-center justify-between text-left cursor-pointer transition-colors active:scale-[0.985]"
              aria-label={`Status Pesanan: ${activeFilterOption.label} (${activeFilterOption.count})`}
            >
              <div className="min-w-0 pr-2">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                  Status Pesanan
                </span>
                <span className="block text-[14px] font-bold text-ink truncate mt-0.5">
                  {activeFilterOption.label} ({activeFilterOption.count})
                </span>
              </div>
              <ChevronDown className="w-5 h-5 text-brand dark:text-[#8CCBFF] shrink-0" aria-hidden />
            </button>
          </div>

          {/* Filter Status: Grid Seimbang di Desktop (≥md) */}
          <div className="hidden md:grid grid-cols-3 lg:grid-cols-6 gap-2.5 w-full" role="group" aria-label="Saring status pesanan">
            {filterOptions.map((opt) => {
              const active = filter === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setFilter(opt.id)}
                  aria-pressed={active}
                  className={`min-h-[48px] px-2.5 py-2 rounded-field border text-[13.5px] lg:text-[14px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all duration-150 active:scale-[0.985] shadow-xs ${
                    active
                      ? 'bg-navy dark:bg-brand text-white dark:text-[#0B111B] border-navy dark:border-brand font-bold shadow-sm'
                      : 'bg-surface text-ink border-line hover:bg-subtle hover:border-brand/40'
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  <span
                    className={`text-xs font-bold px-1.5 py-0.5 rounded shrink-0 ${
                      active
                        ? 'bg-white/20 text-white dark:bg-black/20 dark:text-[#0B111B]'
                        : 'bg-subtle text-ink-muted'
                    }`}
                  >
                    ({opt.count})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Ringkasan Hasil Pencarian & Filter */}
          <div className="flex items-center justify-between text-[14px] text-ink-muted pt-1">
            <p aria-live="polite">
              Menampilkan <strong className="text-ink">{filtered.length}</strong> pesanan
            </p>
            {(filter !== 'semua' || query) && (
              <button
                type="button"
                onClick={() => {
                  setFilter('semua');
                  setQuery('');
                }}
                className="text-brand dark:text-[#8CCBFF] font-semibold hover:underline cursor-pointer text-xs sm:text-sm"
              >
                Reset Filter &amp; Pencarian
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Bottom Sheet Modal untuk Filter Mobile */}
      {isMobileFilterOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex items-end sm:items-center justify-center" role="dialog" aria-modal="true" aria-label="Pilih Status Pesanan">
          <div className="fixed inset-0 bg-ink/60 backdrop-blur-xs transition-opacity" onClick={() => setIsMobileFilterOpen(false)} aria-hidden />
          <div className="relative w-full max-w-lg bg-surface border-t sm:border border-line rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl max-h-[85vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <div>
                <h3 className="font-bold text-lg text-ink">Pilih Status Pesanan</h3>
                <p className="text-xs text-ink-muted">Saring daftar pesanan mitra berdasarkan progres</p>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-subtle text-ink-muted hover:text-ink cursor-pointer"
                aria-label="Tutup pemilih status"
              >
                <X className="w-5 h-5" aria-hidden />
              </button>
            </div>

            <ul className="space-y-2">
              {filterOptions.map((opt) => {
                const active = filter === opt.id;
                return (
                  <li key={opt.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setFilter(opt.id);
                        setIsMobileFilterOpen(false);
                      }}
                      className={`w-full min-h-[52px] px-4 py-3 rounded-field border flex items-center justify-between text-left cursor-pointer transition-colors ${
                        active
                          ? 'border-brand bg-brand-soft font-bold'
                          : 'border-line bg-surface hover:bg-subtle'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`text-[15px] ${active ? 'text-brand dark:text-[#8CCBFF]' : 'text-ink'}`}>
                          {opt.label}
                        </span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-subtle text-ink-muted">
                          {opt.count}
                        </span>
                      </div>
                      {active && <CheckCircle2 className="w-5 h-5 text-brand dark:text-[#8CCBFF]" aria-hidden />}
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="pt-2">
              <Button size="lg" className="w-full" onClick={() => setIsMobileFilterOpen(false)}>
                Selesai
              </Button>
            </div>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <Card as="div" className="p-6">
          <EmptyState
            icon={<ClipboardList className="w-10 h-10" />}
            title={orders.length === 0 ? 'Belum ada pesanan' : 'Tidak ada pesanan yang cocok'}
            description={
              orders.length === 0
                ? 'Mulai dengan mencatat pesanan pertama dari dokumen PO mitra.'
                : 'Coba ubah kata pencarian atau pilih "Semua".'
            }
            action={
              orders.length === 0 ? (
                <Button onClick={onAddNewOrder} icon={<Plus className="w-5 h-5" />}>
                  Catat Pesanan Baru
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setQuery('');
                    setFilter('semua');
                  }}
                >
                  Tampilkan semua pesanan
                </Button>
              )
            }
          />
        </Card>
      ) : (
        <>
          {/* Tabel untuk layar lebar (Desktop ≥lg) */}
          <div className="hidden lg:block bg-surface border border-line rounded-card shadow-card overflow-hidden">
            <table className="w-full text-left">
              <caption className="sr-only">Daftar pesanan mitra</caption>
              <thead className="bg-subtle border-b border-line">
                <tr className="text-[15px] text-ink-muted">
                  <th scope="col" className="px-5 py-3 font-semibold">Pesanan</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Mitra &amp; barang</th>
                  <th scope="col" className="px-5 py-3 font-semibold text-right">Dipesan</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Realisasi</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Tenggat</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Status</th>
                  <th scope="col" className="px-5 py-3"><span className="sr-only">Aksi</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filtered.map(({ o, progress, partner, product }) => (
                  <tr key={o.order_id} className="hover:bg-brand-soft/30 transition-colors align-top group">
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => onSelectOrder(o.order_id)}
                        className="text-left font-mono font-bold text-navy dark:text-[#8CCBFF] group-hover:text-brand transition-colors cursor-pointer block"
                      >
                        {o.order_id}
                      </button>
                      <span className="block text-sm text-ink-muted">PO {o.po_number}</span>
                      <span className="mt-1 block"><SourceBadge source={o.source} /></span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="block font-semibold text-ink group-hover:text-brand transition-colors">{partner?.partner_name}</span>
                      <span className="block text-[15px] text-ink-muted">{product?.product_name}</span>
                    </td>
                    <td className="px-5 py-4 text-right font-bold tabular-nums text-navy dark:text-[#8CCBFF]">{progress.totalOrdered.toLocaleString('id-ID')}</td>
                    <td className="px-5 py-4 text-[15px] tabular-nums">
                      <span className="block">
                        Dibuat <strong className="text-brand">{progress.totalProduced.toLocaleString('id-ID')}</strong>
                      </span>
                      <span className="block">
                        Dikirim <strong className="text-success">{progress.totalShipped.toLocaleString('id-ID')}</strong>
                      </span>
                    </td>
                    <td className="px-5 py-4 text-[15px]">
                      <DueLabel due={o.due_date} done={progress.computedStatus === 'selesai'} />
                    </td>
                    <td className="px-5 py-4">
                      <OrderStatusBadge status={progress.computedStatus} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Button variant="secondary" size="sm" onClick={() => onSelectOrder(o.order_id)} iconRight={<ChevronRight className="w-4 h-4" />}>
                        Detail<span className="sr-only"> pesanan {o.order_id}</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Daftar kartu untuk tablet & ponsel (V4.0: Padding Luas & Spasi Proporsional) */}
          <ul className="lg:hidden space-y-3.5">
            {filtered.map(({ o, progress, partner, product }) => (
              <li key={o.order_id}>
                <button
                  type="button"
                  onClick={() => onSelectOrder(o.order_id)}
                  className="interactive-card w-full text-left bg-surface border border-line rounded-card shadow-card p-5 sm:p-6 hover:border-brand/60 cursor-pointer group"
                >
                  <span className="flex items-start justify-between gap-3">
                    <span className="min-w-0 flex-1">
                      <span className="block text-[17px] sm:text-[18px] font-bold text-ink group-hover:text-brand transition-colors break-words leading-snug">
                        {partner?.partner_name}
                      </span>
                      <span className="block text-[14px] sm:text-[15px] text-ink-muted mt-1 break-words">
                        {product?.product_name} · <span className="font-mono text-navy dark:text-[#8CCBFF] font-bold">{o.order_id}</span>
                      </span>
                    </span>
                    <span className="w-9 h-9 rounded-xl bg-subtle text-ink-muted group-hover:bg-brand-soft group-hover:text-brand flex items-center justify-center shrink-0 transition-colors shadow-xs">
                      <ChevronRight className="w-5 h-5" aria-hidden />
                    </span>
                  </span>

                  <span className="mt-3.5 flex flex-wrap gap-2">
                    <OrderStatusBadge status={progress.computedStatus} />
                    <SourceBadge source={o.source} />
                  </span>

                  {/* Panel Metrik Bawah Berjarak Nyaman */}
                  <span className="mt-3.5 grid grid-cols-3 gap-2 text-[14px] sm:text-[15px] p-3 sm:p-3.5 rounded-xl bg-subtle border border-line/60">
                    <div>
                      <span className="block text-xs font-semibold text-ink-muted">Dipesan</span>
                      <strong className="tabular-nums text-navy dark:text-[#8CCBFF] text-[15px] sm:text-base">
                        {progress.totalOrdered.toLocaleString('id-ID')}
                      </strong>
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-ink-muted">Dikirim</span>
                      <strong className="tabular-nums text-success text-[15px] sm:text-base">
                        {progress.totalShipped.toLocaleString('id-ID')}
                      </strong>
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-ink-muted">Tenggat</span>
                      <DueLabel due={o.due_date} done={progress.computedStatus === 'selesai'} />
                    </div>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};
