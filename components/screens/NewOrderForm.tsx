import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, ClipboardPlus, Factory, ChevronDown, ChevronUp, HelpCircle, Info } from 'lucide-react';
import { Partner, Product, Order } from '../../types';
import { validateOrderInput } from '../../utils/operations';
import { addDays, formatDate, todayISODate } from '../../lib/format';
import { newClientRef } from '../../lib/repository';
import { PageHeader, Card, Notice } from '../ui/Layout';
import { Field, QtyInput, ErrorSummary, inputClass } from '../ui/Field';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';
import { SavedReceipt, StaffNotice, WriteContext, useBeforeUnload } from './shared';

interface NewOrderFormProps extends WriteContext {
  partners: Partner[];
  products: Product[];
  orders: Order[];
  onCancel: () => void;
  onViewOrderDetail: (orderId: string) => void;
  onRecordProduction: (orderId: string) => void;
}

const LABELS: Record<string, string> = {
  partner_id: 'Nama mitra',
  po_number: 'Nomor PO',
  order_date: 'Tanggal pesanan',
  product_id: 'Barang yang dipesan',
  quantity_ordered: 'Jumlah dipesan',
  due_date: 'Target kirim',
  actor: 'Petugas',
};

export const NewOrderForm: React.FC<NewOrderFormProps> = ({
  partners,
  products,
  orders,
  onCancel,
  onViewOrderDetail,
  onRecordProduction,
  repo,
  apply,
  actor,
  onRequireStaff,
  onDirtyChange,
  storageKind,
}) => {
  const today = useMemo(() => todayISODate(), []);
  const [clientRef, setClientRef] = useState(newClientRef);
  const [partnerId, setPartnerId] = useState('');
  const [poNumber, setPoNumber] = useState('');
  const [orderDate, setOrderDate] = useState(today);
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [picMitra, setPicMitra] = useState('');
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [storageError, setStorageError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<{ order: Order; duplicate?: boolean } | null>(null);
  const [mobileGuideOpen, setMobileGuideOpen] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);

  const dirty = !saved && !!(partnerId || poNumber || productId || quantity || dueDate || notes);
  useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);
  useEffect(() => () => onDirtyChange(false), [onDirtyChange]);
  useBeforeUnload(dirty);

  const partner = partners.find((p) => p.partner_id === partnerId);
  const product = products.find((p) => p.product_id === productId);
  const suggestedDue = product ? addDays(orderDate || today, product.standard_lead_time_days) : '';

  const clearError = (key: string) => setErrors((prev) => (prev[key] ? { ...prev, [key]: '' } : prev));

  const input = () => ({
    partner_id: partnerId,
    po_number: poNumber,
    product_id: productId,
    quantity_ordered: Number(quantity),
    order_date: orderDate,
    due_date: dueDate,
    pic_mitra: picMitra,
    notes,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStorageError(null);
    const v = validateOrderInput(input(), orders);
    const errs = { ...v.errors };
    if (!actor) errs.actor = 'Pilih nama petugas di bagian atas form.';
    setErrors(errs);
    if (Object.keys(errs).length) {
      requestAnimationFrame(() => summaryRef.current?.querySelector<HTMLElement>('[role=alert]')?.focus());
      return;
    }
    setConfirmOpen(true);
  };

  const handleSave = async () => {
    if (!repo || !actor) return;
    setSaving(true);
    try {
      const result = apply(await repo.createOrder(input(), actor, clientRef));
      if (result.ok) {
        setSaved({ order: result.record, duplicate: result.duplicate });
        setConfirmOpen(false);
      } else if (result.reason === 'validation') {
        setErrors(result.errors);
        setConfirmOpen(false);
      } else {
        setStorageError(result.message);
        setConfirmOpen(false);
      }
    } catch {
      setStorageError('Data BELUM tersimpan karena terjadi gangguan. Isian Anda masih ada — silakan coba simpan lagi.');
      setConfirmOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setClientRef(newClientRef());
    setPartnerId('');
    setPoNumber('');
    setOrderDate(today);
    setProductId('');
    setQuantity('');
    setDueDate('');
    setPicMitra('');
    setNotes('');
    setErrors({});
    setSaved(null);
  };

  if (saved) {
    const o = saved.order;
    return (
      <SavedReceipt
        title="Pesanan berhasil disimpan"
        idLabel="Nomor pesanan"
        idValue={o.order_id}
        duplicate={saved.duplicate}
        createdAt={o.created_at}
        storageKind={storageKind}
        details={[
          { label: 'Mitra', value: partners.find((p) => p.partner_id === o.partner_id)?.partner_name },
          { label: 'Nomor PO', value: o.po_number },
          { label: 'Barang', value: products.find((p) => p.product_id === o.product_id)?.product_name },
          { label: 'Jumlah dipesan (rencana)', value: `${o.quantity_ordered.toLocaleString('id-ID')} pcs` },
          { label: 'Tanggal pesanan', value: formatDate(o.order_date) },
          { label: 'Target kirim', value: formatDate(o.due_date) },
          { label: 'Dicatat oleh', value: o.created_by },
        ]}
        actions={
          <>
            <Button size="lg" onClick={() => onViewOrderDetail(o.order_id)} iconRight={<ArrowRight className="w-5 h-5" />}>
              Lihat detail pesanan
            </Button>
            <Button size="lg" variant="secondary" onClick={() => onRecordProduction(o.order_id)} icon={<Factory className="w-5 h-5" />}>
              Catat produksi
            </Button>
            <Button size="lg" variant="quiet" onClick={resetForm} icon={<ClipboardPlus className="w-5 h-5" />}>
              Catat pesanan lain
            </Button>
          </>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Catat Pesanan Baru"
        description="Salin data dari dokumen PO mitra. Nomor pesanan dibuat otomatis setelah disimpan."
        onBack={onCancel}
        backLabel="Kembali ke daftar pesanan"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <form onSubmit={handleSubmit} noValidate className="lg:col-span-8 space-y-6" aria-label="Form pesanan baru">
          <div ref={summaryRef}>
            <ErrorSummary errors={errors} labels={LABELS} />
          </div>
          {storageError && (
            <Notice tone="danger" title="Pesanan belum tersimpan" role="alert">
              {storageError}
            </Notice>
          )}

          <Card title="1. Dari siapa pesanannya?">
            <div className="space-y-6">
              <Field id="partner_id" label="Nama mitra" required error={errors.partner_id}>
                {(d) => (
                  <select
                    id="partner_id"
                    aria-describedby={d}
                    aria-invalid={!!errors.partner_id}
                    value={partnerId}
                    onChange={(e) => {
                      setPartnerId(e.target.value);
                      clearError('partner_id');
                      clearError('po_number');
                      const p = partners.find((x) => x.partner_id === e.target.value);
                      setPicMitra(p?.pic_name ?? '');
                    }}
                    className={inputClass(!!errors.partner_id, 'cursor-pointer')}
                  >
                    <option value="">Pilih mitra…</option>
                    {partners.map((p) => (
                      <option key={p.partner_id} value={p.partner_id}>
                        {p.partner_name} — {p.city}
                      </option>
                    ))}
                  </select>
                )}
              </Field>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field
                  id="po_number"
                  label="Nomor PO"
                  required
                  error={errors.po_number}
                  hint="Tulis persis seperti di dokumen PO."
                >
                  {(d) => (
                    <input
                      id="po_number"
                      type="text"
                      autoComplete="off"
                      aria-describedby={d}
                      aria-invalid={!!errors.po_number}
                      value={poNumber}
                      onChange={(e) => {
                        setPoNumber(e.target.value);
                        clearError('po_number');
                      }}
                      placeholder="Contoh: PO-2026-001"
                      className={inputClass(!!errors.po_number)}
                    />
                  )}
                </Field>
                <Field id="order_date" label="Tanggal pesanan" required error={errors.order_date} hint="Tanggal yang tertera di PO.">
                  {(d) => (
                    <input
                      id="order_date"
                      type="date"
                      max={today}
                      aria-describedby={d}
                      aria-invalid={!!errors.order_date}
                      value={orderDate}
                      onChange={(e) => {
                        setOrderDate(e.target.value);
                        clearError('order_date');
                      }}
                      className={inputClass(!!errors.order_date)}
                    />
                  )}
                </Field>
              </div>
            </div>
          </Card>

          <Card title="2. Apa yang dipesan?">
            <div className="space-y-6">
              <Field id="product_id" label="Barang yang dipesan" required error={errors.product_id}>
                {(d) => (
                  <select
                    id="product_id"
                    aria-describedby={d}
                    aria-invalid={!!errors.product_id}
                    value={productId}
                    onChange={(e) => {
                      setProductId(e.target.value);
                      clearError('product_id');
                    }}
                    className={inputClass(!!errors.product_id, 'cursor-pointer')}
                  >
                    <option value="">Pilih barang…</option>
                    {products.map((p) => (
                      <option key={p.product_id} value={p.product_id}>
                        {p.product_name} ({p.product_code})
                      </option>
                    ))}
                  </select>
                )}
              </Field>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field id="quantity_ordered" label="Jumlah dipesan" required error={errors.quantity_ordered} hint="Angka bulat, satuan pcs.">
                  {(d) => (
                    <QtyInput
                      id="quantity_ordered"
                      aria-describedby={d}
                      aria-invalid={!!errors.quantity_ordered}
                      value={quantity}
                      hasError={!!errors.quantity_ordered}
                      onValueChange={(v) => {
                        setQuantity(v);
                        clearError('quantity_ordered');
                      }}
                      placeholder="0"
                    />
                  )}
                </Field>
                <Field
                  id="due_date"
                  label="Target kirim ke mitra"
                  required
                  error={errors.due_date}
                  hint={
                    product ? (
                      <>
                        Waktu produksi standar {product.product_name}: {product.standard_lead_time_days} hari.{' '}
                        {dueDate !== suggestedDue && (
                          <button
                            type="button"
                            onClick={() => {
                              setDueDate(suggestedDue);
                              clearError('due_date');
                            }}
                            className="font-semibold text-brand underline underline-offset-4 cursor-pointer"
                          >
                            Pakai {formatDate(suggestedDue)}
                          </button>
                        )}
                      </>
                    ) : undefined
                  }
                >
                  {(d) => (
                    <input
                      id="due_date"
                      type="date"
                      min={orderDate || undefined}
                      aria-describedby={d}
                      aria-invalid={!!errors.due_date}
                      value={dueDate}
                      onChange={(e) => {
                        setDueDate(e.target.value);
                        clearError('due_date');
                      }}
                      className={inputClass(!!errors.due_date)}
                    />
                  )}
                </Field>
              </div>
            </div>
          </Card>

          <Card title="3. Keterangan tambahan" description="Boleh dikosongkan.">
            <div className="space-y-6">
              <Field id="pic_mitra" label="Nama PIC di pihak mitra" hint={partner ? 'Terisi otomatis dari data mitra. Ubah bila berbeda.' : undefined}>
                {(d) => (
                  <input
                    id="pic_mitra"
                    type="text"
                    aria-describedby={d}
                    value={picMitra}
                    onChange={(e) => setPicMitra(e.target.value)}
                    className={inputClass(false)}
                  />
                )}
              </Field>
              <Field id="notes" label="Catatan pesanan">
                {(d) => (
                  <textarea
                    id="notes"
                    rows={3}
                    aria-describedby={d}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Mis. dikirim dua tahap, minta packing kayu"
                    className={inputClass(false, 'py-3 resize-y')}
                  />
                )}
              </Field>
            </div>
          </Card>

          <div className="bg-surface border border-line rounded-card p-5 md:p-6 space-y-4">
            <StaffNotice actor={actor} onRequireStaff={onRequireStaff} />
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
              <Button variant="secondary" size="lg" onClick={onCancel}>
                Batal
              </Button>
              <Button type="submit" size="lg" className="sm:min-w-[220px]">
                Periksa &amp; Simpan Pesanan
              </Button>
            </div>
          </div>
        </form>

        {/* Sidebar Petunjuk Pengisian: Sticky on Desktop, Collapsible on Mobile */}
        <aside className="lg:col-span-4 space-y-4 lg:sticky lg:top-[calc(var(--navbar-height,72px)+24px)]">
          {/* Mobile Toggle Button */}
          <div className="lg:hidden">
            <button
              type="button"
              onClick={() => setMobileGuideOpen((prev) => !prev)}
              className="w-full flex items-center justify-between p-3.5 rounded-card bg-brand-soft border border-brand/20 text-brand font-semibold text-[15px] cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-brand" />
                <span>Petunjuk Pengisian Dokumen PO</span>
              </span>
              {mobileGuideOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>

          {/* Guidance Cards: always visible on desktop, conditionally on mobile */}
          <div className={`${mobileGuideOpen ? 'block' : 'hidden'} lg:block space-y-4 transition-all duration-200`}>
            <div className="bg-surface border border-brand/30 rounded-card shadow-card p-5 md:p-6 bg-gradient-to-b from-brand-soft/40 to-surface">
              <h2 className="text-lg font-bold text-navy dark:text-[#8CCBFF] flex items-center gap-2">
                <Info className="w-5 h-5 text-brand dark:text-[#8CCBFF]" /> Yang perlu disiapkan
              </h2>
              <ul className="mt-3 space-y-2 text-base text-ink list-disc pl-5 leading-relaxed">
                <li>Dokumen fisik PO dari mitra</li>
                <li>Nama barang manufaktur &amp; jumlah (pcs)</li>
                <li>Target tanggal kirim yang diminta mitra</li>
              </ul>
              <div className="mt-4 pt-3 border-t border-line/60 text-[14px] text-ink-muted">
                Setelah disimpan, pesanan langsung otomatis aktif dan dapat dipilih di form Produksi dan Pengiriman.
              </div>
            </div>

            {product && (
              <div className="bg-surface border border-line rounded-card shadow-card p-5">
                <h3 className="text-sm font-bold uppercase tracking-wider text-ink-muted">Spesifikasi Komponen</h3>
                <p className="mt-2 text-base font-bold text-navy dark:text-[#8CCBFF]">
                  {product.product_name} <span className="font-mono text-sm text-ink-muted">({product.product_code})</span>
                </p>
                <p className="mt-1 text-[15px] text-ink leading-relaxed">{product.specification}</p>
                <p className="mt-2 text-xs font-semibold text-brand">
                  Waktu produksi standar: {product.standard_lead_time_days} hari kerja
                </p>
              </div>
            )}
          </div>
        </aside>
      </div>

      <Dialog
        open={confirmOpen}
        title="Periksa sekali lagi"
        description="Cocokkan dengan dokumen PO sebelum disimpan."
        onClose={() => !saving && setConfirmOpen(false)}
        dismissible={!saving}
        footer={
          <>
            <Button variant="secondary" size="lg" onClick={() => setConfirmOpen(false)} disabled={saving}>
              Ubah lagi
            </Button>
            <Button size="lg" onClick={handleSave} loading={saving} loadingText="Menyimpan…" data-autofocus>
              Ya, Simpan Pesanan
            </Button>
          </>
        }
      >
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
          {[
            ['Mitra', partner?.partner_name],
            ['Nomor PO', poNumber.trim()],
            ['Tanggal pesanan', formatDate(orderDate)],
            ['Barang', product?.product_name],
            ['Jumlah dipesan', `${Number(quantity || 0).toLocaleString('id-ID')} pcs`],
            ['Target kirim', formatDate(dueDate)],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-sm text-ink-muted">{k}</dt>
              <dd className="text-[17px] font-semibold text-ink">{v}</dd>
            </div>
          ))}
        </dl>
      </Dialog>
    </div>
  );
};
