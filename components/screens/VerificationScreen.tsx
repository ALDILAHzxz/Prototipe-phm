import React, { useMemo, useState } from 'react';
import { ShieldCheck, AlertTriangle, Pencil, Factory, Truck, Flag } from 'lucide-react';
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

      <Card as="div">
        <div className="space-y-4">
          <FilterChips<StatusFilter>
            label="Saring berdasarkan status pemeriksaan"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { id: 'menunggu_pemeriksaan', label: 'Menunggu pemeriksaan', count: counts.menunggu_pemeriksaan },
              { id: 'perlu_diperbaiki', label: 'Perlu diperbaiki', count: counts.perlu_diperbaiki },
              { id: 'terverifikasi', label: 'Terverifikasi', count: counts.terverifikasi },
              { id: 'semua', label: 'Semua', count: counts.semua },
            ]}
          />
          <FilterChips<KindFilter>
            label="Saring berdasarkan jenis catatan"
            value={kindFilter}
            onChange={setKindFilter}
            options={[
              { id: 'semua', label: 'Produksi & pengiriman' },
              { id: 'produksi', label: 'Produksi saja' },
              { id: 'pengiriman', label: 'Pengiriman saja' },
            ]}
          />
        </div>
      </Card>

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
              <li key={`${row.kind}-${row.id}`} className="bg-surface border border-line rounded-card shadow-card p-5">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 text-sm font-semibold text-ink-muted">
                      <Icon className="w-5 h-5 text-navy" aria-hidden />
                      {row.kind === 'produksi' ? 'Produksi' : 'Pengiriman'} · No. {row.id}
                    </p>
                    <p className="mt-1 text-xl font-bold tabular-nums">
                      {row.qty.toLocaleString('id-ID')} pcs
                      {row.kind === 'produksi' && !!(r as ProductionRecord).reject_qty && (
                        <span className="text-base font-semibold text-warning">
                          {' '}
                          · cacat {(r as ProductionRecord).reject_qty} pcs
                        </span>
                      )}
                    </p>
                    <p className="text-base text-ink">
                      {partner?.partner_name ?? 'Mitra?'} · {product?.product_name ?? 'Barang?'}{' '}
                      <button
                        type="button"
                        onClick={() => onSelectOrder(r.order_id)}
                        className="font-mono font-semibold text-brand underline underline-offset-4 cursor-pointer"
                      >
                        {r.order_id}
                      </button>
                    </p>
                  </div>
                  <VerificationBadge status={row.status} />
                </div>

                <dl className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-[15px]">
                  <div>
                    <dt className="text-sm text-ink-muted">Waktu kejadian</dt>
                    <dd className="font-semibold">{formatDateTime(row.when)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-ink-muted">Dicatat oleh</dt>
                    <dd className="font-semibold">{r.recorded_by}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-ink-muted">Waktu input</dt>
                    <dd className="font-semibold">
                      {r.created_at ? formatDateTime(r.created_at) : '-'}
                      {r.source === 'data_contoh' && <span className="font-normal text-ink-muted"> (data contoh)</span>}
                    </dd>
                  </div>
                  {row.kind === 'pengiriman' && (
                    <div>
                      <dt className="text-sm text-ink-muted">Surat jalan</dt>
                      <dd className="font-semibold">{(r as DeliveryRecord).delivery_note ?? 'Belum diisi'}</dd>
                    </div>
                  )}
                  {r.notes && (
                    <div className="sm:col-span-2">
                      <dt className="text-sm text-ink-muted">Catatan pencatat</dt>
                      <dd>{r.notes}</dd>
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
