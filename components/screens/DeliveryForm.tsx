import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Truck, MapPin, ChevronDown, ChevronUp, History } from 'lucide-react';
import { Order, Partner, Product, ProductionRecord, DeliveryRecord } from '../../types';
import { calculateSingleOrderProgress, getVerificationStatus, validateDeliveryForm } from '../../utils/operations';
import { formatDate, formatDateTime, nowLocalDateTime, sortableTime } from '../../lib/format';
import { newClientRef } from '../../lib/repository';
import { PageHeader, Card, Notice, EmptyState } from '../ui/Layout';
import { Field, QtyInput, ErrorSummary, inputClass } from '../ui/Field';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';
import { VerificationBadge, ORDER_STATUS_LABEL } from '../ui/StatusBadge';
import { OrderPicker } from '../OrderPicker';
import { SavedReceipt, StaffNotice, WriteContext, useBeforeUnload } from './shared';

interface DeliveryFormProps extends WriteContext {
  orders: Order[];
  partners: Partner[];
  products: Product[];
  productionRecords: ProductionRecord[];
  deliveryRecords: DeliveryRecord[];
  preSelectedOrderId?: string;
  onCancel: () => void;
  onViewOrderDetail: (orderId: string) => void;
}

const LABELS: Record<string, string> = {
  order_id: 'Pesanan',
  quantity_shipped: 'Jumlah dikirim',
  shipped_at: 'Waktu berangkat',
  delivery_note: 'Nomor surat jalan',
  actor: 'Petugas',
};

export const DeliveryForm: React.FC<DeliveryFormProps> = ({
  orders,
  partners,
  products,
  productionRecords,
  deliveryRecords,
  preSelectedOrderId,
  onCancel,
  onViewOrderDetail,
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
  const [shippedAt, setShippedAt] = useState(() => nowLocalDateTime());
  const [deliveryNote, setDeliveryNote] = useState('');
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [warnings, setWarnings] = useState<string[]>([]);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<{ record: DeliveryRecord; duplicate?: boolean } | null>(null);
  const [mobileHistoryOpen, setMobileHistoryOpen] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (preSelectedOrderId) setOrderId(preSelectedOrderId);
  }, [preSelectedOrderId]);

  const dirty = !saved && !!(qty || deliveryNote || notes);
  useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);
  useEffect(() => () => onDirtyChange(false), [onDirtyChange]);
  useBeforeUnload(dirty);

  const order = orders.find((o) => o.order_id === orderId);
  const partner = order ? partners.find((p) => p.partner_id === order.partner_id) : undefined;
  const product = order ? products.find((p) => p.product_id === order.product_id) : undefined;
  const progress = order ? calculateSingleOrderProgress(order, productionRecords, deliveryRecords) : undefined;
  const readyToShip = progress ? Math.max(0, progress.totalProduced - progress.totalShipped) : 0;
  const suggested = progress ? Math.min(readyToShip, progress.remainingDelivery) : 0;

  const liveOver = progress && qty !== '' && Number(qty) > progress.remainingDelivery;
  const liveOverStock = progress && qty !== '' && !liveOver && Number(qty) > readyToShip;

  const recent = useMemo(
    () =>
      [...deliveryRecords]
        .filter((r) => !orderId || r.order_id === orderId)
        .sort((a, b) => sortableTime(b.shipped_at) - sortableTime(a.shipped_at))
        .slice(0, 5),
    [deliveryRecords, orderId]
  );

  const clearError = (key: string) => setErrors((prev) => (prev[key] ? { ...prev, [key]: '' } : prev));

  const doSave = async () => {
    if (!repo || !actor) return;
    setSaving(true);
    setStorageError(null);
    try {
      const result = apply(
        await repo.createDelivery(
          { order_id: orderId, quantity_shipped: Number(qty), shipped_at: shippedAt, delivery_note: deliveryNote, notes },
          actor,
          clientRef
        )
      );
      if (result.ok) setSaved({ record: result.record, duplicate: result.duplicate });
      else if (result.reason === 'validation') setErrors(result.errors);
      else setStorageError(result.message);
    } catch {
      setStorageError('Data BELUM tersimpan karena terjadi gangguan. Isian Anda masih ada — silakan coba simpan lagi.');
    } finally {
      setSaving(false);
      setConfirmOpen(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = validateDeliveryForm(
      { order_id: orderId, quantity_shipped: qty, shipped_at: shippedAt, delivery_note: deliveryNote },
      progress,
      deliveryRecords
    );
    const errs = { ...v.errors };
    if (!actor) errs.actor = 'Pilih nama petugas di bagian bawah form.';
    setErrors(errs);
    setWarnings(v.warnings);
    if (Object.keys(errs).length) {
      requestAnimationFrame(() => summaryRef.current?.querySelector<HTMLElement>('[role=alert]')?.focus());
      return;
    }
    if (v.warnings.length || !deliveryNote.trim()) {
      setConfirmOpen(true);
      return;
    }
    void doSave();
  };

  const startAnother = () => {
    setClientRef(newClientRef());
    setQty('');
    setDeliveryNote('');
    setNotes('');
    setShippedAt(nowLocalDateTime());
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
        title="Data pengiriman berhasil disimpan"
        idLabel="Nomor catatan"
        idValue={r.delivery_id}
        duplicate={saved.duplicate}
        createdAt={r.created_at}
        storageKind={storageKind}
        needsVerification
        details={[
          { label: 'Pesanan', value: `${r.order_id} · ${partners.find((x) => x.partner_id === o?.partner_id)?.partner_name ?? ''}` },
          { label: 'Jumlah dikirim', value: `${r.quantity_shipped.toLocaleString('id-ID')} pcs` },
          { label: 'Nomor surat jalan', value: r.delivery_note ?? 'Belum diisi' },
          { label: 'Waktu berangkat', value: formatDateTime(r.shipped_at) },
          { label: 'Dicatat oleh', value: r.recorded_by },
          ...(p
            ? [
                {
                  label: 'Status pesanan sekarang',
                  value: `${ORDER_STATUS_LABEL[p.computedStatus]} — sisa ${p.remainingDelivery.toLocaleString('id-ID')} pcs`,
                },
              ]
            : []),
        ]}
        actions={
          <>
            <Button size="lg" onClick={() => onViewOrderDetail(r.order_id)} iconRight={<ArrowRight className="w-5 h-5" />}>
              Lihat detail pesanan
            </Button>
            <Button size="lg" variant="secondary" onClick={startAnother} icon={<Truck className="w-5 h-5" />}>
              Catat pengiriman lain
            </Button>
          </>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Catat Pengiriman"
        description="Pilih pesanan, lalu isi jumlah barang yang berangkat ke mitra. Pengiriman bertahap boleh."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <form onSubmit={handleSubmit} noValidate className="lg:col-span-8 space-y-6" aria-label="Form pengiriman">
          <div ref={summaryRef}>
            <ErrorSummary errors={errors} labels={LABELS} />
          </div>
          {storageError && (
            <Notice tone="danger" title="Pengiriman belum tersimpan" role="alert">
              {storageError}
            </Notice>
          )}

          <Card title="1. Pesanan mana yang dikirim?">
            <OrderPicker
              id="order_id"
              legend="Pilih pesanan"
              mode="pengiriman"
              orders={orders}
              partners={partners}
              products={products}
              productionRecords={productionRecords}
              deliveryRecords={deliveryRecords}
              value={orderId}
              onChange={(id) => {
                setOrderId(id);
                clearError('order_id');
                clearError('quantity_shipped');
              }}
              error={errors.order_id}
            />
          </Card>

          <Card title="2. Detail pengiriman">
            {order && progress && (
              <div className="mb-6 p-4 rounded-card bg-subtle border border-line space-y-3">
                <p className="flex items-start gap-2 text-base">
                  <MapPin className="w-5 h-5 text-navy dark:text-[#8CCBFF] shrink-0 mt-0.5" aria-hidden />
                  <span>
                    Tujuan: <strong>{partner?.partner_name}</strong>, {partner?.city}
                    <span className="block text-sm text-ink-muted">
                      PIC {order.pic_mitra || partner?.pic_name} · {product?.product_name}
                    </span>
                  </span>
                </p>
                <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <dt className="text-sm text-ink-muted">Dipesan</dt>
                    <dd className="text-lg font-bold tabular-nums">{progress.totalOrdered.toLocaleString('id-ID')}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-ink-muted">Sudah dikirim</dt>
                    <dd className="text-lg font-bold tabular-nums text-success">{progress.totalShipped.toLocaleString('id-ID')}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-ink-muted">Siap kirim</dt>
                    <dd className="text-lg font-bold tabular-nums text-info">{readyToShip.toLocaleString('id-ID')}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-ink-muted">Sisa belum dikirim</dt>
                    <dd className="text-lg font-bold tabular-nums text-warning">
                      {progress.remainingDelivery.toLocaleString('id-ID')}
                    </dd>
                  </div>
                </dl>
              </div>
            )}

            <div className="space-y-6">
              <Field
                id="quantity_shipped"
                label="Jumlah dikirim"
                required
                error={errors.quantity_shipped}
                hint={
                  order && suggested > 0 && Number(qty) !== suggested ? (
                    <button
                      type="button"
                      onClick={() => {
                        setQty(String(suggested));
                        clearError('quantity_shipped');
                      }}
                      className="min-h-[44px] font-semibold text-brand underline underline-offset-4 cursor-pointer"
                    >
                      Isi {suggested.toLocaleString('id-ID')} pcs (semua barang siap kirim)
                    </button>
                  ) : (
                    'Hitung barang yang naik ke kendaraan.'
                  )
                }
              >
                {(d) => (
                  <QtyInput
                    id="quantity_shipped"
                    aria-describedby={d}
                    aria-invalid={!!errors.quantity_shipped}
                    value={qty}
                    hasError={!!errors.quantity_shipped}
                    onValueChange={(v) => {
                      setQty(v);
                      clearError('quantity_shipped');
                    }}
                    placeholder="0"
                    className="text-xl md:max-w-sm"
                  />
                )}
              </Field>

              {liveOver && (
                <Notice tone="danger" title="Melebihi sisa pesanan">
                  Sisa yang belum dikirim hanya {progress!.remainingDelivery.toLocaleString('id-ID')} pcs. Kurangi jumlahnya.
                </Notice>
              )}
              {liveOverStock && (
                <Notice tone="warning" title="Lebih banyak dari barang siap kirim">
                  Tercatat baru {readyToShip.toLocaleString('id-ID')} pcs barang jadi yang belum dikirim. Pastikan hasil
                  produksi sudah dicatat. Boleh disimpan, tetapi akan ditandai untuk diperiksa.
                </Notice>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field
                  id="delivery_note"
                  label="Nomor surat jalan"
                  error={errors.delivery_note}
                  hint="Salin dari lembar surat jalan. Sangat dianjurkan diisi."
                >
                  {(d) => (
                    <input
                      id="delivery_note"
                      type="text"
                      autoComplete="off"
                      aria-describedby={d}
                      aria-invalid={!!errors.delivery_note}
                      value={deliveryNote}
                      onChange={(e) => {
                        setDeliveryNote(e.target.value);
                        clearError('delivery_note');
                      }}
                      placeholder="Contoh: SJ-0001"
                      className={inputClass(!!errors.delivery_note)}
                    />
                  )}
                </Field>
                <Field id="shipped_at" label="Waktu berangkat" required error={errors.shipped_at} hint="Terisi jam sekarang. Ubah bila perlu.">
                  {(d) => (
                    <input
                      id="shipped_at"
                      type="datetime-local"
                      aria-describedby={d}
                      aria-invalid={!!errors.shipped_at}
                      value={shippedAt}
                      max={nowLocalDateTime()}
                      onChange={(e) => {
                        setShippedAt(e.target.value);
                        clearError('shipped_at');
                      }}
                      className={inputClass(!!errors.shipped_at)}
                    />
                  )}
                </Field>
              </div>

              <Field id="notes" label="Catatan (kendaraan, sopir, kendala)">
                {(d) => (
                  <textarea
                    id="notes"
                    rows={2}
                    aria-describedby={d}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Mis. truk B 1234 XX, sopir Pak Udin"
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
                Akan disimpan: <strong>{Number(qty).toLocaleString('id-ID')} pcs</strong> dikirim ke{' '}
                <strong>{partner?.partner_name}</strong> (PO {order.po_number}).
              </p>
            )}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
              <Button variant="secondary" size="lg" onClick={onCancel} disabled={saving}>
                Batal
              </Button>
              <Button type="submit" size="lg" loading={saving} loadingText="Menyimpan…" className="sm:min-w-[240px]">
                Simpan Data Pengiriman
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
                <History className="w-5 h-5 text-success" />
                <span>Riwayat Pengiriman Terbaru ({recent.length})</span>
              </span>
              {mobileHistoryOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>

          <div className={`${mobileHistoryOpen ? 'block' : 'hidden'} lg:block transition-all duration-200`}>
            <Card title="Riwayat pengiriman" description={order ? `Untuk pesanan ${order.order_id}` : 'Semua pesanan'} as="div">
              {recent.length === 0 ? (
                <EmptyState title="Belum ada pengiriman" description="Pengiriman pesanan ini akan muncul di sini." />
              ) : (
                <ul className="divide-y divide-line -my-3 max-h-[440px] overflow-y-auto pr-1">
                  {recent.map((r) => (
                    <li key={r.delivery_id} className="py-3">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="text-[17px] font-bold tabular-nums text-success">{r.quantity_shipped.toLocaleString('id-ID')} pcs</span>
                        <span className="text-sm text-ink-muted">{formatDateTime(r.shipped_at)}</span>
                      </div>
                      <p className="text-sm text-ink-muted mt-0.5">
                        {r.order_id} · SJ <strong className="text-ink font-mono">{r.delivery_note ?? '—'}</strong>
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
        title="Periksa sebelum menyimpan"
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
          {!deliveryNote.trim() && (
            <Notice tone="warning" title="Nomor surat jalan kosong">
              Tanpa nomor surat jalan, pengiriman ini sulit dicocokkan dengan dokumen fisik.
            </Notice>
          )}
        </div>
      </Dialog>
    </div>
  );
};
