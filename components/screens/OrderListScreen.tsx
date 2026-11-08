import React, { useMemo, useState } from 'react';
import { Search, Plus, ChevronRight, ClipboardList } from 'lucide-react';
import { Order, Partner, Product, ProductionRecord, DeliveryRecord, OrderStatus } from '../../types';
import { calculateSingleOrderProgress } from '../../utils/operations';
import { diffCalendarDays, formatDate, todayISODate } from '../../lib/format';
import { PageHeader, Card, EmptyState, FilterChips } from '../ui/Layout';
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
      <span className="block font-semibold text-ink">{formatDate(due)}</span>
      {note && <span className={`block text-sm ${cls}`}>{note}</span>}
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
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('aktif');

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

      <Card as="div">
        <div className="space-y-4">
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
          <FilterChips<Filter>
            label="Saring berdasarkan status"
            value={filter}
            onChange={setFilter}
            options={[
              { id: 'aktif', label: 'Masih berjalan', count: counts.aktif },
              { id: 'baru', label: 'Belum diproduksi', count: counts.baru },
              { id: 'dalam_produksi', label: 'Sedang diproduksi', count: counts.dalam_produksi },
              { id: 'terkirim_sebagian', label: 'Terkirim sebagian', count: counts.terkirim_sebagian },
              { id: 'selesai', label: 'Selesai', count: counts.selesai },
              { id: 'semua', label: 'Semua', count: counts.semua },
            ]}
          />
          <p className="text-[15px] text-ink-muted" aria-live="polite">
            Menampilkan <strong className="text-ink">{filtered.length}</strong> pesanan
          </p>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card as="div">
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
          {/* Tabel untuk layar lebar */}
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

          {/* Daftar kartu untuk tablet & ponsel */}
          <ul className="lg:hidden space-y-3">
            {filtered.map(({ o, progress, partner, product }) => (
              <li key={o.order_id}>
                <button
                  type="button"
                  onClick={() => onSelectOrder(o.order_id)}
                  className="interactive-card w-full text-left bg-surface border border-line rounded-card shadow-card p-4.5 hover:border-line-blue cursor-pointer group"
                >
                  <span className="flex items-start justify-between gap-3">
                    <span className="min-w-0">
                      <span className="block text-[17px] font-bold text-ink group-hover:text-brand transition-colors">{partner?.partner_name}</span>
                      <span className="block text-[15px] text-ink-muted">
                        {product?.product_name} · <span className="font-mono text-navy dark:text-[#8CCBFF] font-semibold">{o.order_id}</span>
                      </span>
                    </span>
                    <span className="w-8 h-8 rounded-lg bg-subtle text-ink-muted group-hover:bg-brand-soft group-hover:text-brand flex items-center justify-center shrink-0 transition-colors">
                      <ChevronRight className="w-5 h-5" aria-hidden />
                    </span>
                  </span>
                  <span className="mt-3 flex flex-wrap gap-2">
                    <OrderStatusBadge status={progress.computedStatus} />
                    <SourceBadge source={o.source} />
                  </span>
                  <span className="mt-3 grid grid-cols-3 gap-2 text-[15px] p-2.5 rounded-lg bg-subtle border border-line/60">
                    <span>
                      <span className="block text-xs text-ink-muted">Dipesan</span>
                      <strong className="tabular-nums text-navy dark:text-[#8CCBFF]">{progress.totalOrdered.toLocaleString('id-ID')}</strong>
                    </span>
                    <span>
                      <span className="block text-xs text-ink-muted">Dikirim</span>
                      <strong className="tabular-nums text-success">{progress.totalShipped.toLocaleString('id-ID')}</strong>
                    </span>
                    <span>
                      <span className="block text-xs text-ink-muted">Tenggat</span>
                      <DueLabel due={o.due_date} done={progress.computedStatus === 'selesai'} />
                    </span>
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
