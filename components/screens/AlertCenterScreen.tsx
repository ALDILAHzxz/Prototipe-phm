import React, { useState } from 'react';
import { AlertTriangle, Clock, PackageCheck, CheckCircle2, ChevronRight } from 'lucide-react';
import { AlertItem, AlertSeverity } from '../../types';
import { formatDate } from '../../lib/format';
import { PageHeader, Card, EmptyState, FilterChips } from '../ui/Layout';
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
  const order: AlertSeverity[] = ['terlambat', 'mendekati', 'tindakan', 'info'];
  const visible = alerts
    .filter((a) => filter === 'semua' || a.severity === filter)
    .sort((a, b) => order.indexOf(a.severity) - order.indexOf(b.severity) || a.due_date.localeCompare(b.due_date));
  const count = (s: AlertSeverity) => alerts.filter((a) => a.severity === s).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Peringatan"
        description="Pesanan yang terlambat, mendekati tenggat (3 hari atau kurang), atau barangnya sudah siap dikirim. Dihitung dari tanggal hari ini."
      />

      <Card as="div">
        <FilterChips<Filter>
          label="Saring jenis peringatan"
          value={filter}
          onChange={setFilter}
          options={[
            { id: 'semua', label: 'Semua', count: alerts.length },
            { id: 'terlambat', label: 'Terlambat', count: count('terlambat') },
            { id: 'mendekati', label: 'Tenggat dekat', count: count('mendekati') },
            { id: 'tindakan', label: 'Siap dikirim', count: count('tindakan') },
          ]}
        />
      </Card>

      {visible.length === 0 ? (
        <Card as="div">
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
                className={`interactive-card bg-surface border border-line rounded-card shadow-card p-5 md:p-6 flex flex-col justify-between hover:border-line-blue hover:shadow-card-hover transition-all ${borderAccent}`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <SeverityBadge severity={a.severity} />
                    <span className="font-mono text-sm font-bold text-navy px-2 py-0.5 rounded bg-subtle border border-line">
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
                      <strong className="text-navy font-semibold">Tindakan disarankan:</strong>{' '}
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
