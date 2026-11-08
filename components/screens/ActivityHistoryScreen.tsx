import React, { useMemo, useState } from 'react';
import { Search, ClipboardList, Factory, Truck, ShieldCheck, History, ChevronDown, CheckCircle2, X } from 'lucide-react';
import { ActivityType } from '../../types';
import { DerivedActivity } from '../../lib/activity';
import { formatDate, formatDateTime } from '../../lib/format';
import { PageHeader, Card, EmptyState } from '../ui/Layout';
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
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

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

  const filterOptions: { id: Filter; label: string; count: number }[] = useMemo(
    () => [
      { id: 'semua', label: 'Semua', count: counts.semua ?? 0 },
      { id: 'pesanan', label: 'Pesanan', count: counts.pesanan ?? 0 },
      { id: 'produksi', label: 'Produksi', count: counts.produksi ?? 0 },
      { id: 'pengiriman', label: 'Pengiriman', count: counts.pengiriman ?? 0 },
      { id: 'pemeriksaan', label: 'Pemeriksaan', count: counts.pemeriksaan ?? 0 },
    ],
    [counts]
  );

  const activeFilterOption = filterOptions.find((o) => o.id === filter) ?? filterOptions[0];

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

      <Card as="div" className="p-4 sm:p-5 md:p-6">
        <div className="space-y-4">
          {/* Kolom Pencarian Full-Width */}
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

          {/* Filter Jenis: Selektor Kompak di Mobile (<md) Sesuai Desain Gambar 4 */}
          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(true)}
              className="w-full min-h-[52px] px-4 py-2.5 rounded-field bg-subtle border border-line hover:border-brand/60 flex items-center justify-between text-left cursor-pointer transition-colors active:scale-[0.985]"
              aria-label={`Jenis Catatan: ${activeFilterOption.label} (${activeFilterOption.count})`}
            >
              <div className="min-w-0 pr-2">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                  Jenis Catatan
                </span>
                <span className="block text-[14px] font-bold text-ink truncate mt-0.5">
                  {activeFilterOption.label} ({activeFilterOption.count})
                </span>
              </div>
              <ChevronDown className="w-5 h-5 text-brand dark:text-[#8CCBFF] shrink-0" aria-hidden />
            </button>
          </div>

          {/* Filter Jenis: Grid Seimbang di Desktop (≥md) */}
          <div className="hidden md:grid grid-cols-5 gap-2.5 w-full" role="group" aria-label="Saring jenis catatan">
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
              Menampilkan <strong className="text-ink">{filtered.length}</strong> catatan
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
        <div className="md:hidden fixed inset-0 z-50 flex items-end sm:items-center justify-center" role="dialog" aria-modal="true" aria-label="Pilih Jenis Catatan">
          <div className="fixed inset-0 bg-ink/60 backdrop-blur-xs transition-opacity" onClick={() => setIsMobileFilterOpen(false)} aria-hidden />
          <div className="relative w-full max-w-lg bg-surface border-t sm:border border-line rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl max-h-[85vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <div>
                <h3 className="font-bold text-lg text-ink">Pilih Jenis Catatan</h3>
                <p className="text-xs text-ink-muted">Saring daftar riwayat aktivitas operasional</p>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-subtle text-ink-muted hover:text-ink cursor-pointer"
                aria-label="Tutup pemilih jenis catatan"
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
