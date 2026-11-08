import React, { useMemo, useState } from 'react';
import { ShieldCheck, AlertTriangle, Pencil, Factory, Truck, Flag, ChevronDown, Check, X } from 'lucide-react';
import {
  Order,
  Partner,
  Product,
  ProductionRecord,
  DeliveryRecord,
  VerificationStatus,
  Staff,
} from '../../types';
import { getDeliveryFlags, getProductionFlags, getVerificationStatus } from '../../utils/operations';
import { formatDateTime, sortableTime } from '../../lib/format';
import { RecordKind } from '../../lib/repository';
import { PageHeader, Card, EmptyState, FilterChips, Notice } from '../ui/Layout';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';
import { Field, QtyInput, inputClass } from '../ui/Field';
import { VerificationBadge } from '../ui/StatusBadge';
import { WriteContext } from './shared';

interface VerificationScreenProps extends Omit<WriteContext, 'onDirtyChange' | 'storageKind'> {
  orders: Order[];
  partners: Partner[];
  products: Product[];
  productionRecords: ProductionRecord[];
  deliveryRecords: DeliveryRecord[];
  activeStaff: Staff | null;
  onSelectOrder: (orderId: string) => void;
}

interface Row {
  kind: RecordKind;
  id: string;
  record: ProductionRecord | DeliveryRecord;
  order?: Order;
  qty: number;
  when: string;
  status: VerificationStatus;
  flags: string[];
}

type StatusFilter = VerificationStatus | 'semua';
type KindFilter = RecordKind | 'semua';

const STATUS_OPTIONS: { id: StatusFilter; label: string }[] = [
  { id: 'menunggu_pemeriksaan', label: 'Menunggu pemeriksaan' },
  { id: 'perlu_diperbaiki', label: 'Perlu diperbaiki' },
  { id: 'terverifikasi', label: 'Terverifikasi' },
  { id: 'semua', label: 'Semua' },
];

const KIND_OPTIONS: { id: KindFilter; label: string }[] = [
  { id: 'semua', label: 'Produksi & pengiriman' },
  { id: 'produksi', label: 'Produksi saja' },
  { id: 'pengiriman', label: 'Pengiriman saja' },
];

function shortStatusLabel(status: StatusFilter, counts: Record<string, number>) {
  if (status === 'menunggu_pemeriksaan') return `Menunggu (${counts.menunggu_pemeriksaan})`;
  if (status === 'perlu_diperbaiki') return `Perlu Perbaikan (${counts.perlu_diperbaiki})`;
  if (status === 'terverifikasi') return `Terverifikasi (${counts.terverifikasi})`;
  return `Semua (${counts.semua})`;
}

function shortKindLabel(kind: KindFilter) {
  if (kind === 'produksi') return 'Produksi Saja';
  if (kind === 'pengiriman') return 'Pengiriman Saja';
  return 'Semua Jenis';
}

export const VerificationScreen: React.FC<VerificationScreenProps> = ({
  orders,
  partners,
  products,
  productionRecords,
  deliveryRecords,
  activeStaff,
  onSelectOrder,
  repo,
  apply,
  actor,
  onRequireStaff,
}) => {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('menunggu_pemeriksaan');
  const [kindFilter, setKindFilter] = useState<KindFilter>('semua');
  const [mobileSheet, setMobileSheet] = useState<'status' | 'kind' | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ tone: 'success' | 'danger'; text: string } | null>(null);

  // dialog "perlu diperbaiki"
  const [rejectRow, setRejectRow] = useState<Row | null>(null);
  const [rejectNote, setRejectNote] = useState('');
  const [rejectError, setRejectError] = useState('');

  // dialog koreksi
  const [fixRow, setFixRow] = useState<Row | null>(null);
  const [fixQty, setFixQty] = useState('');
  const [fixReject, setFixReject] = useState('');
  const [fixNote, setFixNote] = useState('');
  const [fixSj, setFixSj] = useState('');
  const [fixReason, setFixReason] = useState('');
  const [fixErrors, setFixErrors] = useState<Record<string, string>>({});

  const isSupervisor = activeStaff?.role === 'supervisor';

  const rows: Row[] = useMemo(() => {
    const byId = new Map(orders.map((o) => [o.order_id, o]));
    const p: Row[] = productionRecords.map((r) => ({
      kind: 'produksi',
      id: r.production_id,
      record: r,
      order: byId.get(r.order_id),
      qty: r.quantity_completed,
      when: r.reported_at,
      status: getVerificationStatus(r),
      flags: getProductionFlags(r, byId.get(r.order_id), productionRecords),
    }));
    const d: Row[] = deliveryRecords.map((r) => ({
      kind: 'pengiriman',
      id: r.delivery_id,
      record: r,
      order: byId.get(r.order_id),
      qty: r.quantity_shipped,
      when: r.shipped_at,
      status: getVerificationStatus(r),
      flags: getDeliveryFlags(r, byId.get(r.order_id), productionRecords, deliveryRecords),
    }));
    return [...p, ...d].sort((a, b) => sortableTime(a.when) - sortableTime(b.when));
  }, [orders, productionRecords, deliveryRecords]);

  const counts = useMemo(() => {
    const c = { menunggu_pemeriksaan: 0, perlu_diperbaiki: 0, terverifikasi: 0, semua: rows.length };
    rows.forEach((r) => c[r.status]++);
    return c;
  }, [rows]);

  const visible = rows.filter(
    (r) => (statusFilter === 'semua' || r.status === statusFilter) && (kindFilter === 'semua' || r.kind === kindFilter)
  );

  const setStatus = async (row: Row, status: VerificationStatus, note = '') => {
    if (!repo || !actor) {
      onRequireStaff();
      return false;
    }
    setBusyId(row.id);
    setMessage(null);
    try {
      const res = apply(await repo.setVerification(row.kind, row.id, status, note, actor));
      if (res.ok) {
        setMessage({
          tone: 'success',
          text:
            status === 'terverifikasi'
              ? `Catatan ${row.id} ditandai terverifikasi.`
              : `Catatan ${row.id} ditandai perlu diperbaiki. Pencatat dapat melihat alasannya di sini.`,
        });
        return true;
      }
      if (res.reason === 'validation') setRejectError(Object.values(res.errors)[0] ?? 'Periksa isian.');
      else setMessage({ tone: 'danger', text: res.message });
      return false;
    } finally {
      setBusyId(null);
    }
  };

  const openFix = (row: Row) => {
    setFixRow(row);
    setFixQty(String(row.qty));
    setFixNote(row.record.notes ?? '');
    setFixReject(row.kind === 'produksi' ? String((row.record as ProductionRecord).reject_qty ?? 0) : '');
    setFixSj(row.kind === 'pengiriman' ? (row.record as DeliveryRecord).delivery_note ?? '' : '');
    setFixReason('');
    setFixErrors({});
  };

  const saveFix = async () => {
    if (!fixRow) return;
    if (!repo || !actor) {
      onRequireStaff();
      return;
    }
    setBusyId(fixRow.id);
    try {
      const res = apply(
        await repo.correctRecord(
          fixRow.kind,
          fixRow.id,
          {
            quantity: Number(fixQty),
            reject_qty: fixRow.kind === 'produksi' ? Number(fixReject || 0) : undefined,
            delivery_note: fixRow.kind === 'pengiriman' ? fixSj : undefined,
            notes: fixNote,
            reason: fixReason,
          },
          actor
        )
      );
      if (res.ok) {
        setMessage({ tone: 'success', text: `Koreksi ${fixRow.id} tersimpan. Status kembali "Menunggu pemeriksaan".` });
        setFixRow(null);
      } else if (res.reason === 'validation') setFixErrors(res.errors);
      else setFixErrors({ reason: res.message });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pemeriksaan Data"
        description="Cocokkan catatan produksi dan pengiriman dengan kondisi lapangan sebelum dianggap terverifikasi."
      />

      {!actor ? (
        <Notice tone="warning" title="Pilih nama Anda dulu">
          <p>Pemeriksaan selalu mencatat siapa yang memeriksa.</p>
          <Button variant="secondary" className="mt-3" onClick={onRequireStaff}>
            Pilih nama petugas
          </Button>
        </Notice>
      ) : !isSupervisor ? (
        <Notice tone="info" title={`Anda tercatat sebagai ${activeStaff?.role_label}`}>
          Tombol &quot;Sesuai&quot; dan &quot;Perlu diperbaiki&quot; hanya untuk supervisor. Anda tetap bisa melihat daftar dan
          memperbaiki catatan yang ditandai perlu diperbaiki. (Prototipe ini belum memiliki login; pembatasan ini hanya
          bantuan tampilan, bukan pengamanan.)
        </Notice>
      ) : null}

      {message && (
        <Notice tone={message.tone} role="status">
          {message.text}
        </Notice>
      )}

      <Card as="div" className="p-4 sm:p-5 md:p-6">
        {/* Mobile View: 2 Primary Selectors Side-by-Side (Screenshot 4 Refinement) */}
        <div className="md:hidden space-y-3">
          <div className="grid grid-cols-2 gap-2.5">
            {/* Selector 1: Status */}
            <button
              type="button"
              onClick={() => setMobileSheet('status')}
              className="min-h-[52px] p-2.5 rounded-field bg-subtle border border-line hover:border-brand/60 flex flex-col justify-center text-left cursor-pointer transition-colors active:scale-[0.985]"
              aria-label={`Saring Status: ${shortStatusLabel(statusFilter, counts)}`}
            >
              <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">Status</span>
              <span className="flex items-center justify-between gap-1 text-[13px] sm:text-[14px] font-bold text-ink mt-0.5 truncate">
                <span className="truncate">{shortStatusLabel(statusFilter, counts)}</span>
                <ChevronDown className="w-4 h-4 text-brand dark:text-[#8CCBFF] shrink-0" aria-hidden />
              </span>
            </button>

            {/* Selector 2: Jenis */}
            <button
              type="button"
              onClick={() => setMobileSheet('kind')}
              className="min-h-[52px] p-2.5 rounded-field bg-subtle border border-line hover:border-brand/60 flex flex-col justify-center text-left cursor-pointer transition-colors active:scale-[0.985]"
              aria-label={`Saring Jenis: ${shortKindLabel(kindFilter)}`}
            >
              <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">Jenis Catatan</span>
              <span className="flex items-center justify-between gap-1 text-[13px] sm:text-[14px] font-bold text-ink mt-0.5 truncate">
                <span className="truncate">{shortKindLabel(kindFilter)}</span>
                <ChevronDown className="w-4 h-4 text-brand dark:text-[#8CCBFF] shrink-0" aria-hidden />
              </span>
            </button>
          </div>

          {/* Result summary below */}
          <div className="flex items-center justify-between text-xs text-ink-muted px-1">
            <span>
              Menampilkan <strong className="text-ink">{visible.length}</strong> catatan
            </span>
            {(statusFilter !== 'semua' || kindFilter !== 'semua') && (
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('semua');
                  setKindFilter('semua');
                }}
                className="text-brand dark:text-[#8CCBFF] font-semibold hover:underline cursor-pointer"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>

        {/* Desktop View: Full-Width 4-Col Row + Centered 3-Col Row (Centered Headings) */}
        <div className="hidden md:block space-y-4">
          <div>
            <span className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-2.5 text-center">
              Status Pemeriksaan
            </span>
            <div className="grid grid-cols-4 gap-3 w-full">
              {STATUS_OPTIONS.map((opt) => {
                const active = statusFilter === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setStatusFilter(opt.id)}
                    className={`min-h-[52px] px-3.5 py-2.5 rounded-field border text-[15px] font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all duration-150 active:scale-[0.985] ${
                      active
                        ? 'bg-navy dark:bg-brand text-white dark:text-[#0B111B] border-navy dark:border-brand shadow-sm font-bold'
                        : 'bg-surface text-ink border-line hover:bg-subtle hover:border-brand/50'
                    }`}
                  >
                    <span>{opt.label}</span>
                    <span
                      className={`tabular-nums font-bold px-2 py-0.5 rounded text-xs ${
                        active
                          ? 'bg-white/20 text-white dark:bg-black/20 dark:text-[#0B111B]'
                          : 'bg-subtle text-ink-muted'
                      }`}
                    >
                      {counts[opt.id]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-line/60">
            <span className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-2.5 text-center">
              Jenis Catatan
            </span>
            <div className="grid grid-cols-3 max-w-2xl mx-auto gap-3 w-full">
              {KIND_OPTIONS.map((opt) => {
                const active = kindFilter === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setKindFilter(opt.id)}
                    className={`min-h-[48px] px-3.5 py-2 rounded-field border text-[14px] font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all duration-150 active:scale-[0.985] ${
                      active
                        ? 'bg-navy dark:bg-brand text-white dark:text-[#0B111B] border-navy dark:border-brand shadow-sm font-bold'
                        : 'bg-surface text-ink border-line hover:bg-subtle hover:border-brand/50'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <p className="text-right text-xs text-ink-muted pt-1">
            Menampilkan <strong className="text-ink">{visible.length}</strong> dari {rows.length} catatan
          </p>
        </div>
      </Card>

      {/* Mobile Bottom-Sheet Filter Dialog */}
      {mobileSheet && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={mobileSheet === 'status' ? 'Saring Status Pemeriksaan' : 'Saring Jenis Catatan'}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div
            className="fixed inset-0"
            onClick={() => setMobileSheet(null)}
            aria-hidden
          />
          <div className="relative w-full sm:max-w-md bg-surface rounded-t-2xl sm:rounded-2xl border border-line p-5 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto z-10 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <h3 className="text-lg font-bold text-ink">
                {mobileSheet === 'status' ? 'Saring Status Pemeriksaan' : 'Saring Jenis Catatan'}
              </h3>
              <button
                type="button"
                onClick={() => setMobileSheet(null)}
                className="w-9 h-9 rounded-field flex items-center justify-center text-ink-muted hover:bg-subtle cursor-pointer"
                aria-label="Tutup saringan"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              {mobileSheet === 'status'
                ? STATUS_OPTIONS.map((opt) => {
                    const active = statusFilter === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setStatusFilter(opt.id);
                          setMobileSheet(null);
                        }}
                        className={`w-full min-h-[52px] px-4 py-3 rounded-field border flex items-center justify-between text-left cursor-pointer transition-colors ${
                          active
                            ? 'bg-brand/10 border-brand text-brand dark:text-[#8CCBFF] font-bold'
                            : 'bg-surface border-line text-ink hover:bg-subtle'
                        }`}
                      >
                        <span className="text-[15px]">{opt.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="tabular-nums text-xs px-2 py-0.5 rounded-full bg-subtle text-ink-muted font-bold">
                            {counts[opt.id]}
                          </span>
                          {active && <Check className="w-5 h-5 text-brand dark:text-[#8CCBFF]" />}
                        </div>
                      </button>
                    );
                  })
                : KIND_OPTIONS.map((opt) => {
                    const active = kindFilter === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setKindFilter(opt.id);
                          setMobileSheet(null);
                        }}
                        className={`w-full min-h-[52px] px-4 py-3 rounded-field border flex items-center justify-between text-left cursor-pointer transition-colors ${
                          active
                            ? 'bg-brand/10 border-brand text-brand dark:text-[#8CCBFF] font-bold'
                            : 'bg-surface border-line text-ink hover:bg-subtle'
                        }`}
                      >
                        <span className="text-[15px]">{opt.label}</span>
                        {active && <Check className="w-5 h-5 text-brand dark:text-[#8CCBFF]" />}
                      </button>
                    );
                  })}
            </div>
          </div>
        </div>
      )}

      {visible.length === 0 ? (
        <Card as="div">
          <EmptyState
            icon={<ShieldCheck className="w-10 h-10" />}
            title={statusFilter === 'menunggu_pemeriksaan' ? 'Tidak ada catatan yang menunggu' : 'Tidak ada catatan'}
            description="Catatan baru dari form produksi dan pengiriman akan muncul di sini."
          />
        </Card>
      ) : (
        <ul className="space-y-4">
          {visible.map((row) => {
            const partner = partners.find((p) => p.partner_id === row.order?.partner_id);
            const product = products.find((p) => p.product_id === row.order?.product_id);
            const r = row.record;
            const Icon = row.kind === 'produksi' ? Factory : Truck;
            return (
              <li
                key={`${row.kind}-${row.id}`}
                className="interactive-card bg-surface border border-line rounded-card shadow-card p-5 md:p-6 hover:border-line-blue hover:shadow-card-hover transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink-muted">
                      <span className="w-6 h-6 rounded-md bg-subtle flex items-center justify-center text-navy dark:text-[#8CCBFF] shrink-0">
                        <Icon className="w-3.5 h-3.5" aria-hidden />
                      </span>
                      <span>{row.kind === 'produksi' ? 'Pencatatan Produksi' : 'Pencatatan Pengiriman'}</span>
                      <span>·</span>
                      <span className="font-mono text-ink">ID #{row.id}</span>
                    </div>

                    <p className="mt-2 text-2xl md:text-3xl font-bold text-navy dark:text-[#8CCBFF] tabular-nums">
                      {row.qty.toLocaleString('id-ID')} <span className="text-base font-semibold text-ink-muted">pcs</span>
                      {row.kind === 'produksi' && !!(r as ProductionRecord).reject_qty && (
                        <span className="text-base font-semibold text-warning ml-2">
                          (cacat: {(r as ProductionRecord).reject_qty} pcs)
                        </span>
                      )}
                    </p>

                    <div className="mt-1.5 flex items-center gap-2 flex-wrap text-base text-ink">
                      <span className="font-bold text-ink">{partner?.partner_name ?? 'Mitra'}</span>
                      <span className="text-ink-muted">·</span>
                      <span className="text-ink-muted">{product?.product_name ?? 'Barang'}</span>
                      <button
                        type="button"
                        onClick={() => onSelectOrder(r.order_id)}
                        className="inline-flex items-center gap-1 font-mono text-xs font-bold text-brand bg-brand-soft border border-brand/30 px-2 py-0.5 rounded-md hover:bg-brand hover:text-white transition-colors cursor-pointer"
                      >
                        PO: {r.order_id}
                      </button>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <VerificationBadge status={row.status} />
                  </div>
                </div>

                <dl className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-[15px] p-4 rounded-field bg-subtle border border-line/70">
                  <div>
                    <dt className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Waktu kejadian</dt>
                    <dd className="font-semibold text-ink mt-0.5">{formatDateTime(row.when)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Dicatat oleh</dt>
                    <dd className="font-semibold text-ink mt-0.5">{r.recorded_by}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Waktu input</dt>
                    <dd className="font-semibold text-ink mt-0.5">
                      {r.created_at ? formatDateTime(r.created_at) : '-'}
                      {r.source === 'data_contoh' && <span className="font-normal text-xs text-ink-muted"> (simulasi)</span>}
                    </dd>
                  </div>
                  {row.kind === 'pengiriman' && (
                    <div>
                      <dt className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Surat jalan</dt>
                      <dd className="font-mono font-bold text-navy dark:text-[#8CCBFF] mt-0.5">{(r as DeliveryRecord).delivery_note ?? 'Belum diisi'}</dd>
                    </div>
                  )}
                  {r.notes && (
                    <div className="sm:col-span-2">
                      <dt className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Catatan operator</dt>
                      <dd className="text-ink mt-0.5">{r.notes}</dd>
                    </div>
                  )}
                </dl>

                {row.flags.length > 0 && row.status !== 'terverifikasi' && (
                  <div className="mt-4 p-3 rounded-field bg-warning-soft border border-warning/40">
                    <p className="flex items-center gap-2 font-bold text-warning text-[15px]">
                      <Flag className="w-4 h-4" aria-hidden /> Perlu dicek
                    </p>
                    <ul className="mt-1 list-disc pl-6 text-[15px] text-ink">
                      {row.flags.map((f) => (
                        <li key={f}>{f}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {row.status === 'perlu_diperbaiki' && r.verification_note && (
                  <p className="mt-4 p-3 rounded-field bg-danger-soft border border-danger/40 text-[15px]">
                    <strong className="text-danger">Alasan dari {r.verified_by}:</strong> {r.verification_note}
                  </p>
                )}
                {row.status === 'terverifikasi' && r.verified_by && (
                  <p className="mt-3 text-[15px] text-ink-muted">
                    Diperiksa {r.verified_by}
                    {r.verified_at && ` · ${formatDateTime(r.verified_at)}`}
                  </p>
                )}

                <div className="mt-5 flex flex-col sm:flex-row flex-wrap gap-3">
                  {isSupervisor && row.status !== 'terverifikasi' && (
                    <Button
                      variant="success"
                      onClick={() => setStatus(row, 'terverifikasi')}
                      loading={busyId === row.id}
                      loadingText="Menyimpan…"
                      icon={<ShieldCheck className="w-5 h-5" />}
                    >
                      Sesuai lapangan
                    </Button>
                  )}
                  {isSupervisor && row.status === 'menunggu_pemeriksaan' && (
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setRejectRow(row);
                        setRejectNote('');
                        setRejectError('');
                      }}
                      disabled={busyId === row.id}
                      icon={<AlertTriangle className="w-5 h-5 text-danger" />}
                    >
                      Perlu diperbaiki
                    </Button>
                  )}
                  {row.status === 'perlu_diperbaiki' && (
                    <Button variant="secondary" onClick={() => openFix(row)} icon={<Pencil className="w-5 h-5" />}>
                      Perbaiki data
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Dialog
        open={!!rejectRow}
        title="Tandai perlu diperbaiki"
        description={rejectRow ? `Catatan ${rejectRow.id} — ${rejectRow.qty.toLocaleString('id-ID')} pcs` : undefined}
        onClose={() => setRejectRow(null)}
        footer={
          <>
            <Button variant="secondary" size="lg" onClick={() => setRejectRow(null)}>
              Batal
            </Button>
            <Button
              variant="danger"
              size="lg"
              loading={!!rejectRow && busyId === rejectRow.id}
              loadingText="Menyimpan…"
              onClick={async () => {
                if (!rejectRow) return;
                if (!rejectNote.trim()) {
                  setRejectError('Tulis apa yang perlu diperbaiki agar pencatat tahu.');
                  return;
                }
                const ok = await setStatus(rejectRow, 'perlu_diperbaiki', rejectNote);
                if (ok) setRejectRow(null);
              }}
            >
              Simpan tanda
            </Button>
          </>
        }
      >
        <Field id="verification_note" label="Apa yang tidak sesuai?" required error={rejectError}>
          {(d) => (
            <textarea
              id="verification_note"
              rows={3}
              data-autofocus
              aria-describedby={d}
              value={rejectNote}
              onChange={(e) => {
                setRejectNote(e.target.value);
                setRejectError('');
              }}
              placeholder="Mis. di lapangan hanya ada 150 pcs, bukan 200"
              className={inputClass(!!rejectError, 'py-3')}
            />
          )}
        </Field>
      </Dialog>

      <Dialog
        open={!!fixRow}
        title={`Perbaiki catatan ${fixRow?.id ?? ''}`}
        description="Nilai lama tetap disimpan di riwayat koreksi. Setelah diperbaiki, catatan kembali menunggu pemeriksaan."
        onClose={() => setFixRow(null)}
        size="lg"
        footer={
          <>
            <Button variant="secondary" size="lg" onClick={() => setFixRow(null)}>
              Batal
            </Button>
            <Button size="lg" onClick={saveFix} loading={!!fixRow && busyId === fixRow.id} loadingText="Menyimpan…">
              Simpan Perbaikan
            </Button>
          </>
        }
      >
        {fixRow && (
          <div className="space-y-5">
            {fixRow.record.verification_note && (
              <Notice tone="danger" title="Alasan dari pemeriksa">
                {fixRow.record.verification_note}
              </Notice>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field
                id="fix-qty"
                label={fixRow.kind === 'produksi' ? 'Jumlah barang baik' : 'Jumlah dikirim'}
                required
                error={fixErrors.quantity}
              >
                {(d) => (
                  <QtyInput
                    id="fix-qty"
                    data-autofocus
                    aria-describedby={d}
                    value={fixQty}
                    hasError={!!fixErrors.quantity}
                    onValueChange={setFixQty}
                  />
                )}
              </Field>
              {fixRow.kind === 'produksi' ? (
                <Field id="fix-reject" label="Jumlah cacat" error={fixErrors.reject_qty}>
                  {(d) => <QtyInput id="fix-reject" aria-describedby={d} value={fixReject} onValueChange={setFixReject} />}
                </Field>
              ) : (
                <Field id="fix-sj" label="Nomor surat jalan" error={fixErrors.delivery_note}>
                  {(d) => (
                    <input
                      id="fix-sj"
                      aria-describedby={d}
                      value={fixSj}
                      onChange={(e) => setFixSj(e.target.value)}
                      className={inputClass(!!fixErrors.delivery_note)}
                    />
                  )}
                </Field>
              )}
            </div>
            <Field id="fix-notes" label="Catatan">
              {(d) => (
                <textarea
                  id="fix-notes"
                  rows={2}
                  aria-describedby={d}
                  value={fixNote}
                  onChange={(e) => setFixNote(e.target.value)}
                  className={inputClass(false, 'py-3')}
                />
              )}
            </Field>
            <Field id="fix-reason" label="Alasan koreksi" required error={fixErrors.reason}>
              {(d) => (
                <input
                  id="fix-reason"
                  aria-describedby={d}
                  value={fixReason}
                  onChange={(e) => setFixReason(e.target.value)}
                  placeholder="Mis. salah hitung, sudah dicek ulang di gudang"
                  className={inputClass(!!fixErrors.reason)}
                />
              )}
            </Field>
          </div>
        )}
      </Dialog>
    </div>
  );
};
