import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Factory, Truck, ChevronDown, ChevronUp, History } from 'lucide-react';
import { Order, Partner, Product, ProductionRecord, DeliveryRecord } from '../../types';
import { calculateSingleOrderProgress, getVerificationStatus, validateProductionForm } from '../../utils/operations';
import { formatDate, formatDateTime, nowLocalDateTime, sortableTime } from '../../lib/format';
import { newClientRef } from '../../lib/repository';
import { PageHeader, Card, Notice, EmptyState } from '../ui/Layout';
import { Field, QtyInput, ErrorSummary, inputClass } from '../ui/Field';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';
import { VerificationBadge } from '../ui/StatusBadge';
import { OrderPicker } from '../OrderPicker';
import { SavedReceipt, StaffNotice, WriteContext, useBeforeUnload } from './shared';

interface ProductionFormProps extends WriteContext {
  orders: Order[];
  partners: Partner[];
  products: Product[];
  productionRecords: ProductionRecord[];
  deliveryRecords: DeliveryRecord[];
  preSelectedOrderId?: string;
  onCancel: () => void;
  onViewOrderDetail: (orderId: string) => void;
  onRecordDelivery: (orderId: string) => void;
}

const LABELS: Record<string, string> = {
  order_id: 'Pesanan',
  quantity_completed: 'Jumlah barang baik',
  reject_qty: 'Jumlah cacat',
  reported_at: 'Waktu produksi',
  actor: 'Petugas',
};

export const ProductionForm: React.FC<ProductionFormProps> = ({
  orders,
  partners,
  products,
  productionRecords,
  deliveryRecords,
  preSelectedOrderId,
  onCancel,
  onViewOrderDetail,
  onRecordDelivery,
  repo,
  apply,
  actor,
  onRequireStaff,
  onDirtyChange,
  storageKind,
}) => {
  const [clientRef, setClientRef] = useState(newClientRef);
  const [orderId, setOrderId] = useState(preSelectedOrderId || '');
  const [qty, setQty] = useState('');
  const [reject, setReject] = useState('');
  const [reportedAt, setReportedAt] = useState(() => nowLocalDateTime());
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [warnings, setWarnings] = useState<string[]>([]);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<{ record: ProductionRecord; duplicate?: boolean } | null>(null);
  const [mobileHistoryOpen, setMobileHistoryOpen] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (preSelectedOrderId) setOrderId(preSelectedOrderId);
  }, [preSelectedOrderId]);

  const dirty = !saved && !!(qty || reject || notes);
  useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);
  useEffect(() => () => onDirtyChange(false), [onDirtyChange]);
  useBeforeUnload(dirty);

  const order = orders.find((o) => o.order_id === orderId);
  const partner = order ? partners.find((p) => p.partner_id === order.partner_id) : undefined;
  const product = order ? products.find((p) => p.product_id === order.product_id) : undefined;
  const progress = order ? calculateSingleOrderProgress(order, productionRecords, deliveryRecords) : undefined;

  const liveOverTarget = progress && qty !== '' && Number(qty) > progress.remainingProduction;

  const recent = useMemo(
    () =>
      [...productionRecords]
        .filter((r) => !orderId || r.order_id === orderId)
        .sort((a, b) => sortableTime(b.reported_at) - sortableTime(a.reported_at))
        .slice(0, 5),
    [productionRecords, orderId]
  );

  const clearError = (key: string) => setErrors((prev) => (prev[key] ? { ...prev, [key]: '' } : prev));

  const doSave = async () => {
    if (!repo || !actor) return;
    setSaving(true);
    setStorageError(null);
    try {
      const result = apply(
        await repo.createProduction(
          {
            order_id: orderId,
            quantity_completed: Number(qty),
            reject_qty: Number(reject || 0),
            reported_at: reportedAt,
            notes,
          },
          actor,
          clientRef
        )
      );
      if (result.ok) {
        setSaved({ record: result.record, duplicate: result.duplicate });
      } else if (result.reason === 'validation') {
        setErrors(result.errors);
      } else {
        setStorageError(result.message);
      }
    } catch {
      setStorageError('Data BELUM tersimpan karena terjadi gangguan. Isian Anda masih ada — silakan coba simpan lagi.');
    } finally {
      setSaving(false);
      setConfirmOpen(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = validateProductionForm(
      { order_id: orderId, quantity_completed: qty, reject_qty: reject, reported_at: reportedAt },
      progress
    );
    const errs = { ...v.errors };
    if (!actor) errs.actor = 'Pilih nama petugas di bagian bawah form.';
    setErrors(errs);
    setWarnings(v.warnings);
    if (Object.keys(errs).length) {
      requestAnimationFrame(() => summaryRef.current?.querySelector<HTMLElement>('[role=alert]')?.focus());
      return;
    }
    if (v.warnings.length) {
      setConfirmOpen(true);
      return;
    }
    void doSave();
  };

  const startAnother = () => {
    setClientRef(newClientRef());
    setQty('');
    setReject('');
    setNotes('');
    setReportedAt(nowLocalDateTime());
    setErrors({});
    setWarnings([]);
    setSaved(null);
  };

  if (saved) {
    const r = saved.record;
    const o = orders.find((x) => x.order_id === r.order_id);
    const p = o ? calculateSingleOrderProgress(o, productionRecords, deliveryRecords) : undefined;
    return (
      <SavedReceipt
        title="Hasil produksi berhasil disimpan"
        idLabel="Nomor catatan"
        idValue={r.production_id}
        duplicate={saved.duplicate}
        createdAt={r.created_at}
        storageKind={storageKind}
        needsVerification
        details={[
          { label: 'Pesanan', value: `${r.order_id} · ${partners.find((x) => x.partner_id === o?.partner_id)?.partner_name ?? ''}` },
          { label: 'Barang', value: products.find((x) => x.product_id === o?.product_id)?.product_name },
          { label: 'Barang baik dicatat', value: `${r.quantity_completed.toLocaleString('id-ID')} pcs` },
          { label: 'Barang cacat', value: `${(r.reject_qty ?? 0).toLocaleString('id-ID')} pcs` },
          { label: 'Waktu produksi', value: formatDateTime(r.reported_at) },
          { label: 'Dicatat oleh', value: r.recorded_by },
          ...(p
            ? [
                {
                  label: 'Total produksi sekarang',
                  value: `${p.totalProduced.toLocaleString('id-ID')} dari ${p.totalOrdered.toLocaleString('id-ID')} pcs`,
                },
              ]
            : []),
        ]}
        actions={
          <>
            <Button size="lg" onClick={startAnother} icon={<Factory className="w-5 h-5" />}>
              Catat produksi lagi
            </Button>
            <Button size="lg" variant="secondary" onClick={() => onRecordDelivery(r.order_id)} icon={<Truck className="w-5 h-5" />}>
              Catat pengiriman
            </Button>
            <Button size="lg" variant="quiet" onClick={() => onViewOrderDetail(r.order_id)} iconRight={<ArrowRight className="w-5 h-5" />}>
              Detail pesanan
            </Button>
          </>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Catat Hasil Produksi"
        description="Pilih pesanan yang dikerjakan, lalu isi jumlah barang yang selesai dibuat."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <form onSubmit={handleSubmit} noValidate className="lg:col-span-8 space-y-6" aria-label="Form hasil produksi">
          <div ref={summaryRef}>
            <ErrorSummary errors={errors} labels={LABELS} />
          </div>
          {storageError && (
            <Notice tone="danger" title="Hasil produksi belum tersimpan" role="alert">
              {storageError}
            </Notice>
          )}

          <Card title="1. Pesanan mana yang dikerjakan?">
            <OrderPicker
              id="order_id"
              legend="Pilih pesanan"
              mode="produksi"
              orders={orders}
              partners={partners}
              products={products}
              productionRecords={productionRecords}
              deliveryRecords={deliveryRecords}
              value={orderId}
              onChange={(id) => {
                setOrderId(id);
                clearError('order_id');
              }}
              error={errors.order_id}
            />
          </Card>

          <Card title="2. Berapa yang selesai dibuat?">
            {order && progress && (
              <dl className="grid grid-cols-3 gap-3 mb-6 p-4 rounded-card bg-subtle border border-line">
                <div>
                  <dt className="text-sm text-ink-muted">Rencana (dipesan)</dt>
                  <dd className="text-lg font-bold tabular-nums">{progress.totalOrdered.toLocaleString('id-ID')}</dd>
                </div>
                <div>
                  <dt className="text-sm text-ink-muted">Sudah tercatat</dt>
                  <dd className="text-lg font-bold tabular-nums text-info">{progress.totalProduced.toLocaleString('id-ID')}</dd>
                </div>
                <div>
                  <dt className="text-sm text-ink-muted">Sisa target</dt>
                  <dd className="text-lg font-bold tabular-nums text-warning">
                    {progress.remainingProduction.toLocaleString('id-ID')}
                  </dd>
                </div>
              </dl>
            )}

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field
                  id="quantity_completed"
                  label="Jumlah barang baik"
                  required
                  error={errors.quantity_completed}
                  hint="Hanya barang yang lolos pemeriksaan awal."
                >
                  {(d) => (
                    <QtyInput
                      id="quantity_completed"
                      aria-describedby={d}
                      aria-invalid={!!errors.quantity_completed}
                      value={qty}
                      hasError={!!errors.quantity_completed}
                      onValueChange={(v) => {
                        setQty(v);
                        clearError('quantity_completed');
                      }}
                      placeholder="0"
                      className="text-xl"
                    />
                  )}
                </Field>
                <Field id="reject_qty" label="Jumlah cacat / reject" error={errors.reject_qty} hint="Kosongkan bila tidak ada.">
                  {(d) => (
                    <QtyInput
                      id="reject_qty"
                      aria-describedby={d}
                      aria-invalid={!!errors.reject_qty}
                      value={reject}
                      hasError={!!errors.reject_qty}
                      onValueChange={(v) => {
                        setReject(v);
                        clearError('reject_qty');
                      }}
                      placeholder="0"
                    />
                  )}
                </Field>
              </div>

              {liveOverTarget && (
                <Notice tone="warning" title="Melebihi sisa target">
                  Jumlah ini lebih besar dari sisa target ({progress!.remainingProduction.toLocaleString('id-ID')} pcs). Boleh
                  disimpan, tetapi akan ditandai untuk diperiksa supervisor.
                </Notice>
              )}

              <Field
                id="reported_at"
                label="Waktu produksi"
                required
                error={errors.reported_at}
                hint="Terisi jam sekarang. Ubah bila mencatat produksi yang sudah lewat (mis. dari buku catatan)."
              >
                {(d) => (
                  <input
                    id="reported_at"
                    type="datetime-local"
                    aria-describedby={d}
                    aria-invalid={!!errors.reported_at}
                    value={reportedAt}
                    max={nowLocalDateTime()}
                    onChange={(e) => {
                      setReportedAt(e.target.value);
                      clearError('reported_at');
                    }}
                    className={inputClass(!!errors.reported_at, 'md:max-w-sm')}
                  />
                )}
              </Field>

              <Field id="notes" label="Catatan kendala">
                {(d) => (
                  <textarea
                    id="notes"
                    rows={2}
                    aria-describedby={d}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Mis. mesin berhenti 30 menit, ganti mata potong"
                    className={inputClass(false, 'py-3 resize-y')}
                  />
                )}
              </Field>
            </div>
          </Card>

          <div className="bg-surface border border-line rounded-card p-5 md:p-6 space-y-4">
            <StaffNotice actor={actor} onRequireStaff={onRequireStaff} />
            {order && qty && Number(qty) > 0 && (
              <p className="text-base text-ink">
                Akan disimpan: <strong>{Number(qty).toLocaleString('id-ID')} pcs</strong> {product?.product_name} untuk{' '}
                <strong>{partner?.partner_name}</strong> (PO {order.po_number}).
              </p>
            )}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
              <Button variant="secondary" size="lg" onClick={onCancel} disabled={saving}>
                Batal
              </Button>
              <Button type="submit" size="lg" loading={saving} loadingText="Menyimpan…" className="sm:min-w-[240px]">
                Simpan Hasil Produksi
              </Button>
            </div>
          </div>
        </form>

        <aside className="lg:col-span-4 space-y-4 lg:sticky lg:top-[calc(var(--navbar-height,72px)+24px)]">
          {/* Mobile Toggle Button */}
          <div className="lg:hidden">
            <button
              type="button"
              onClick={() => setMobileHistoryOpen((prev) => !prev)}
              className="w-full flex items-center justify-between p-3.5 rounded-card bg-subtle border border-line text-ink font-semibold text-[15px] cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <History className="w-5 h-5 text-brand" />
                <span>Catatan Produksi Terakhir ({recent.length})</span>
              </span>
              {mobileHistoryOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>

          <div className={`${mobileHistoryOpen ? 'block' : 'hidden'} lg:block transition-all duration-200`}>
            <Card
              title="Catatan produksi terakhir"
              description={order ? `Untuk pesanan ${order.order_id}` : 'Semua pesanan'}
              as="div"
            >
              {recent.length === 0 ? (
                <EmptyState title="Belum ada catatan" description="Catatan produksi pesanan ini akan muncul di sini." />
              ) : (
                <ul className="divide-y divide-line -my-3 max-h-[440px] overflow-y-auto pr-1">
                  {recent.map((r) => (
                    <li key={r.production_id} className="py-3">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="text-[17px] font-bold tabular-nums text-navy">{r.quantity_completed.toLocaleString('id-ID')} pcs</span>
                        <span className="text-sm text-ink-muted">{formatDateTime(r.reported_at)}</span>
                      </div>
                      <p className="text-sm text-ink-muted mt-0.5">
                        {r.order_id} · Oleh {r.recorded_by}
                      </p>
                      <div className="mt-1.5">
                        <VerificationBadge status={getVerificationStatus(r)} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {order && (
                <p className="mt-4 pt-3 border-t border-line text-sm text-ink-muted flex items-center justify-between">
                  <span>Tenggat pesanan:</span>
                  <strong className="text-ink font-semibold">{formatDate(order.due_date)}</strong>
                </p>
              )}
            </Card>
          </div>
        </aside>
      </div>

      <Dialog
        open={confirmOpen}
        title="Yakin jumlahnya sudah benar?"
        onClose={() => !saving && setConfirmOpen(false)}
        dismissible={!saving}
        footer={
          <>
            <Button variant="secondary" size="lg" onClick={() => setConfirmOpen(false)} disabled={saving} data-autofocus>
              Periksa lagi
            </Button>
            <Button size="lg" onClick={doSave} loading={saving} loadingText="Menyimpan…">
              Ya, tetap simpan
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          {warnings.map((w) => (
            <Notice key={w} tone="warning">
              {w}
            </Notice>
          ))}
        </div>
      </Dialog>
    </div>
  );
};
