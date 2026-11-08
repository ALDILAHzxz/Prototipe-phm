import React, { useMemo, useState } from 'react';
import { Search, ClipboardList, Factory, Truck, ShieldCheck, History } from 'lucide-react';
import { ActivityType } from '../../types';
import { DerivedActivity } from '../../lib/activity';
import { formatDate, formatDateTime } from '../../lib/format';
import { PageHeader, Card, EmptyState, FilterChips } from '../ui/Layout';
import { Button } from '../ui/Button';
import { inputClass } from '../ui/Field';

interface ActivityHistoryScreenProps {
  activities: DerivedActivity[];
  onSelectOrder: (orderId: string) => void;
}

type Filter = ActivityType | 'semua';

const ICON_CONFIG: Record<ActivityType, { icon: React.ReactNode; bg: string }> = {
  pesanan: {
    icon: <ClipboardList className="w-5 h-5" aria-hidden />,
    bg: 'bg-brand-soft text-brand border-brand/30',
  },
  produksi: {
    icon: <Factory className="w-5 h-5" aria-hidden />,
    bg: 'bg-brand-soft dark:bg-[#263D5A] text-navy dark:text-[#8CCBFF] border-line/40',
  },
  pengiriman: {
    icon: <Truck className="w-5 h-5" aria-hidden />,
    bg: 'bg-success-soft text-success border-success/30',
  },
  pemeriksaan: {
    icon: <ShieldCheck className="w-5 h-5" aria-hidden />,
    bg: 'bg-warning-soft text-warning border-warning/30',
  },
};

const TYPE_LABEL: Record<ActivityType, string> = {
  pesanan: 'Pesanan Mitra',
  produksi: 'Hasil Produksi',
  pengiriman: 'Pengiriman Logistik',
  pemeriksaan: 'Pemeriksaan Supervisor',
};

export const ActivityHistoryScreen: React.FC<ActivityHistoryScreenProps> = ({ activities, onSelectOrder }) => {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('semua');
  const [limit, setLimit] = useState(30);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return activities.filter(
      (a) =>
        (filter === 'semua' || a.activity_type === filter) &&
        (!q || [a.description, a.related_order_id, a.recorded_by].some((s) => s.toLowerCase().includes(q)))
    );
  }, [activities, filter, query]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { semua: activities.length };
    activities.forEach((a) => (c[a.activity_type] = (c[a.activity_type] ?? 0) + 1));
    return c;
  }, [activities]);

  // kelompokkan per tanggal kejadian
  const groups = useMemo(() => {
    const map = new Map<string, DerivedActivity[]>();
    filtered.slice(0, limit).forEach((a) => {
      const key = formatDate(a.timestamp);
      map.set(key, [...(map.get(key) ?? []), a]);
    });
    return Array.from(map.entries());
  }, [filtered, limit]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Riwayat"
        description="Semua catatan pesanan, produksi, pengiriman, dan pemeriksaan. Terbaru di atas, disusun dari data asli."
      />

      <Card as="div">
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-5 h-5 text-ink-muted absolute left-4 top-1/2 -translate-y-1/2" aria-hidden />
            <label htmlFor="cari-riwayat" className="sr-only">
              Cari riwayat
            </label>
            <input
              id="cari-riwayat"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari nomor pesanan, nama petugas, atau kata kunci"
              className={inputClass(false, 'pl-12')}
            />
          </div>
          <FilterChips<Filter>
            label="Saring jenis catatan"
            value={filter}
            onChange={setFilter}
            options={[
              { id: 'semua', label: 'Semua', count: counts.semua ?? 0 },
              { id: 'pesanan', label: 'Pesanan', count: counts.pesanan ?? 0 },
              { id: 'produksi', label: 'Produksi', count: counts.produksi ?? 0 },
              { id: 'pengiriman', label: 'Pengiriman', count: counts.pengiriman ?? 0 },
              { id: 'pemeriksaan', label: 'Pemeriksaan', count: counts.pemeriksaan ?? 0 },
            ]}
          />
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card as="div">
          <EmptyState
            icon={<History className="w-10 h-10" />}
            title="Tidak ada catatan yang cocok"
            description="Ubah kata pencarian atau pilih jenis catatan lain."
          />
        </Card>
      ) : (
        <div className="space-y-6">
          {groups.map(([day, items]) => (
            <section key={day} aria-label={`Catatan ${day}`}>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2.5 h-2.5 rounded-full bg-brand" aria-hidden />
                <h2 className="text-lg font-bold text-navy dark:text-[#8CCBFF]">{day}</h2>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-subtle border border-line text-ink-muted">
                  {items.length} aktivitas
                </span>
              </div>
              <ul className="bg-surface border border-line rounded-card shadow-card divide-y divide-line overflow-hidden">
                {items.map((a) => {
                  const cfg = ICON_CONFIG[a.activity_type];
                  return (
                    <li
                      key={a.activity_id}
                      className="p-4 md:p-5 flex items-start gap-4 hover:bg-subtle/60 transition-colors group"
                    >
                      <span className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 shadow-xs ${cfg.bg}`}>
                        {cfg.icon}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                            {TYPE_LABEL[a.activity_type]}
                          </span>
                          <span className="text-xs text-ink-muted">·</span>
                          <span className="text-xs text-ink-muted font-medium">
                            {formatDateTime(a.timestamp)}
                          </span>
                        </div>
                        <p className="text-base md:text-[17px] text-ink font-semibold mt-1 leading-snug group-hover:text-brand transition-colors">
                          {a.description}
                        </p>
                        <p className="mt-1.5 text-sm text-ink-muted flex items-center gap-2 flex-wrap">
                          <span>
                            Oleh: <strong className="text-ink font-medium">{a.recorded_by}</strong>
                          </span>
                          {a.input_at && a.activity_type !== 'pesanan' && (
                            <>
                              <span>·</span>
                              <span>Diinput: {formatDateTime(a.input_at)}</span>
                            </>
                          )}
                          {a.source === 'data_contoh' && (
                            <span className="px-1.5 py-0.5 rounded bg-subtle text-xs text-ink-muted border border-line">
                              Data contoh
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="shrink-0 self-center">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => onSelectOrder(a.related_order_id)}
                        >
                          <span className="font-mono text-sm">{a.related_order_id}</span>
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
          {filtered.length > limit && (
            <div className="flex justify-center">
              <Button variant="secondary" size="lg" onClick={() => setLimit((l) => l + 30)}>
                Tampilkan lebih banyak ({filtered.length - limit} lagi)
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
