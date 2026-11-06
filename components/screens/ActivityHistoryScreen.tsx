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

const ICON: Record<ActivityType, React.ReactNode> = {
  pesanan: <ClipboardList className="w-5 h-5" aria-hidden />,
  produksi: <Factory className="w-5 h-5" aria-hidden />,
  pengiriman: <Truck className="w-5 h-5" aria-hidden />,
  pemeriksaan: <ShieldCheck className="w-5 h-5" aria-hidden />,
};

const TYPE_LABEL: Record<ActivityType, string> = {
  pesanan: 'Pesanan',
  produksi: 'Produksi',
  pengiriman: 'Pengiriman',
  pemeriksaan: 'Pemeriksaan',
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
              <h2 className="text-lg font-bold text-ink mb-3">{day}</h2>
              <ul className="bg-surface border border-line rounded-card shadow-card divide-y divide-line">
                {items.map((a) => (
                  <li key={a.activity_id} className="p-4 md:p-5 flex gap-4">
                    <span className="w-10 h-10 rounded-lg bg-canvas text-navy flex items-center justify-center shrink-0">
                      {ICON[a.activity_type]}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-ink-muted">
                        {TYPE_LABEL[a.activity_type]} · {formatDateTime(a.timestamp)}
                      </p>
                      <p className="text-base md:text-[17px] text-ink font-medium mt-0.5">{a.description}</p>
                      <p className="mt-1 text-[15px] text-ink-muted">
                        Oleh {a.recorded_by}
                        {a.input_at && a.activity_type !== 'pesanan' && <> · diinput {formatDateTime(a.input_at)}</>}
                        {a.source === 'data_contoh' && <> · data contoh</>}
                      </p>
                    </div>
                    <div className="shrink-0 self-center">
                      <Button variant="quiet" onClick={() => onSelectOrder(a.related_order_id)}>
                        <span className="font-mono">{a.related_order_id}</span>
                      </Button>
                    </div>
                  </li>
                ))}
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
