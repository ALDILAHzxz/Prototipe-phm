import React, { useMemo, useState } from 'react';
import { AlertTriangle, Clock, PackageCheck, CheckCircle2, ChevronRight, ChevronDown, X } from 'lucide-react';
import { AlertItem, AlertSeverity } from '../../types';
import { formatDate } from '../../lib/format';
import { PageHeader, Card, EmptyState } from '../ui/Layout';
import { Button } from '../ui/Button';

interface AlertCenterScreenProps {
  alerts: AlertItem[];
  onSelectOrder: (orderId: string) => void;
}

type Filter = AlertSeverity | 'semua';

export const SEVERITY: Record<AlertSeverity, { label: string; cls: string; icon: React.ReactNode; next: string }> = {
  terlambat: {
    label: 'Terlambat',
    cls: 'bg-danger-soft text-danger border-danger/40',
    icon: <AlertTriangle className="w-4 h-4" aria-hidden />,
    next: 'Hubungi mitra & atur ulang jadwal kirim.',
  },
  mendekati: {
    label: 'Tenggat dekat',
    cls: 'bg-warning-soft text-warning border-warning/40',
    icon: <Clock className="w-4 h-4" aria-hidden />,
    next: 'Pastikan produksi & pengiriman terjadwal.',
  },
  tindakan: {
    label: 'Siap dikirim',
    cls: 'bg-info-soft text-info border-info/40',
    icon: <PackageCheck className="w-4 h-4" aria-hidden />,
    next: 'Jadwalkan pengiriman barang yang sudah jadi.',
  },
  info: {
    label: 'Info',
    cls: 'bg-subtle text-ink border-line-field',
    icon: <CheckCircle2 className="w-4 h-4" aria-hidden />,
    next: '',
  },
};

export function SeverityBadge({ severity }: { severity: AlertSeverity }) {
  const s = SEVERITY[severity];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-sm font-semibold ${s.cls}`}>
      {s.icon}
      {s.label}
    </span>
  );
}

export const AlertCenterScreen: React.FC<AlertCenterScreenProps> = ({ alerts, onSelectOrder }) => {
  const [filter, setFilter] = useState<Filter>('semua');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const order: AlertSeverity[] = ['terlambat', 'mendekati', 'tindakan', 'info'];

  const visible = useMemo(
    () =>
      alerts
        .filter((a) => filter === 'semua' || a.severity === filter)
        .sort((a, b) => order.indexOf(a.severity) - order.indexOf(b.severity) || a.due_date.localeCompare(b.due_date)),
    [alerts, filter]
  );

  const count = (s: AlertSeverity) => alerts.filter((a) => a.severity === s).length;

  const filterOptions: { id: Filter; label: string; count: number }[] = useMemo(
    () => [
      { id: 'semua', label: 'Semua', count: alerts.length },
      { id: 'terlambat', label: 'Terlambat', count: count('terlambat') },
      { id: 'mendekati', label: 'Tenggat dekat', count: count('mendekati') },
      { id: 'tindakan', label: 'Siap dikirim', count: count('tindakan') },
    ],
    [alerts]
  );

  const activeFilterOption = filterOptions.find((o) => o.id === filter) ?? filterOptions[0];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Peringatan"
        description="Pesanan yang terlambat, mendekati tenggat (3 hari atau kurang), atau barangnya sudah siap dikirim. Dihitung dari tanggal hari ini."
      />

      <Card as="div" className="p-4 sm:p-5 md:p-6">
        <div className="space-y-3">
          {/* Filter Status: Selektor Kompak di Mobile (<md) Sesuai Desain Gambar 4 */}
          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(true)}
              className="w-full min-h-[52px] px-4 py-2.5 rounded-field bg-subtle border border-line hover:border-brand/60 flex items-center justify-between text-left cursor-pointer transition-colors active:scale-[0.985]"
              aria-label={`Status Peringatan: ${activeFilterOption.label} (${activeFilterOption.count})`}
            >
              <div className="min-w-0 pr-2">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                  Status Peringatan
                </span>
                <span className="block text-[14px] font-bold text-ink truncate mt-0.5">
                  {activeFilterOption.label} ({activeFilterOption.count})
                </span>
              </div>
              <ChevronDown className="w-5 h-5 text-brand dark:text-[#8CCBFF] shrink-0" aria-hidden />
            </button>
          </div>

          {/* Filter Status: Grid Seimbang di Desktop (≥md) */}
          <div className="hidden md:grid grid-cols-4 gap-2.5 w-full" role="group" aria-label="Saring jenis peringatan">
            {filterOptions.map((opt) => {
              const active = filter === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setFilter(opt.id)}
                  aria-pressed={active}
                  className={`min-h-[48px] px-3 py-2 rounded-field border text-[14px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all duration-150 active:scale-[0.985] shadow-xs ${
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

          {/* Ringkasan Hasil Filter */}
          <div className="flex items-center justify-between text-[14px] text-ink-muted pt-1">
            <p aria-live="polite">
              Menampilkan <strong className="text-ink">{visible.length}</strong> peringatan
            </p>
            {filter !== 'semua' && (
              <button
                type="button"
                onClick={() => setFilter('semua')}
                className="text-brand dark:text-[#8CCBFF] font-semibold hover:underline cursor-pointer text-xs sm:text-sm"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Bottom Sheet Modal untuk Filter Peringatan Mobile */}
      {isMobileFilterOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex items-end sm:items-center justify-center" role="dialog" aria-modal="true" aria-label="Pilih Status Peringatan">
          <div className="fixed inset-0 bg-ink/60 backdrop-blur-xs transition-opacity" onClick={() => setIsMobileFilterOpen(false)} aria-hidden />
          <div className="relative w-full max-w-lg bg-surface border-t sm:border border-line rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl max-h-[85vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <div>
                <h3 className="font-bold text-lg text-ink">Pilih Status Peringatan</h3>
                <p className="text-xs text-ink-muted">Saring daftar peringatan operasional berdasarkan tingkat urgensi</p>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-subtle text-ink-muted hover:text-ink cursor-pointer"
                aria-label="Tutup pemilih status peringatan"
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

      {visible.length === 0 ? (
        <Card as="div" className="p-6">
          <EmptyState
            icon={<CheckCircle2 className="w-10 h-10 text-success" />}
            title="Tidak ada peringatan"
            description="Semua pesanan berjalan sesuai jadwal untuk kategori ini."
          />
        </Card>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {visible.map((a) => {
            const borderAccent =
              a.severity === 'terlambat'
                ? 'border-l-4 border-l-danger'
                : a.severity === 'mendekati'
                ? 'border-l-4 border-l-warning'
                : a.severity === 'tindakan'
                ? 'border-l-4 border-l-info'
                : 'border-l-4 border-l-line-field';

            return (
              <li
                key={a.id}
                className={`interactive-card bg-surface border border-line rounded-card shadow-card p-5 md:p-6 flex flex-col justify-between hover:border-brand/60 hover:shadow-card-hover transition-all ${borderAccent}`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <SeverityBadge severity={a.severity} />
                    <span className="font-mono text-sm font-bold text-navy dark:text-[#8CCBFF] px-2 py-0.5 rounded bg-subtle border border-line">
                      {a.order_id}
                    </span>
                  </div>
                  <h2 className="mt-3 text-lg md:text-xl font-bold text-ink leading-snug">{a.title}</h2>
                  <p className="mt-1 text-base font-medium text-ink-muted">
                    {a.partner_name} · <span className="font-mono text-ink">PO {a.po_number}</span>
                  </p>
                  <p className="mt-3 text-base text-ink leading-relaxed">{a.description}</p>
                  <p className="mt-2 text-sm text-ink-muted">
                    Target tenggat kirim: <strong className="text-ink font-semibold">{formatDate(a.due_date)}</strong>
                  </p>
                  {SEVERITY[a.severity].next && (
                    <div className="mt-4 p-3 rounded-field bg-subtle border border-line text-[14px]">
                      <strong className="text-navy dark:text-[#8CCBFF] font-semibold">Tindakan disarankan:</strong>{' '}
                      <span className="text-ink">{SEVERITY[a.severity].next}</span>
                    </div>
                  )}
                </div>
                <div className="mt-5 pt-4 border-t border-line/60">
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => onSelectOrder(a.order_id)}
                    iconRight={<ChevronRight className="w-5 h-5" />}
                    fullWidth
                  >
                    Buka Detail Pesanan
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
