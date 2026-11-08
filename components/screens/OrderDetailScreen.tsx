import React, { useState } from 'react';
import { Factory, Truck, Box, History } from 'lucide-react';
import { Order, Partner, Product, ProductionRecord, DeliveryRecord } from '../../types';
import { calculateSingleOrderProgress, getVerificationStatus } from '../../utils/operations';
import { formatDate, formatDateTime, sortableTime } from '../../lib/format';
import { PageHeader, Card, KeyValue, ProgressBar, EmptyState, Notice } from '../ui/Layout';
import { Button } from '../ui/Button';
import { OrderStatusBadge, VerificationBadge, SyncBadge, SourceBadge } from '../ui/StatusBadge';
import { ThreePartViewer } from '../ThreePartViewer';

interface OrderDetailScreenProps {
  orderId: string;
  orders: Order[];
  partners: Partner[];
  products: Product[];
  productionRecords: ProductionRecord[];
  deliveryRecords: DeliveryRecord[];
  onBack: () => void;
  onNavigateToProduction: (orderId: string) => void;
  onNavigateToDelivery: (orderId: string) => void;
}

function sourceLabel(s?: string) {
  return s === 'data_contoh' ? 'Data contoh (demo)' : s === 'form_aplikasi' ? 'Form aplikasi' : 'Tidak diketahui';
}

export const OrderDetailScreen: React.FC<OrderDetailScreenProps> = ({
  orderId,
  orders,
  partners,
  products,
  productionRecords,
  deliveryRecords,
  onBack,
  onNavigateToProduction,
  onNavigateToDelivery,
}) => {
  const [show3D, setShow3D] = useState(false);
  const order = orders.find((o) => o.order_id === orderId);

  if (!order) {
    return (
      <div className="space-y-6">
        <PageHeader title="Pesanan tidak ditemukan" onBack={onBack} backLabel="Kembali ke daftar pesanan" />
        <Card as="div">
          <EmptyState
            title={`Pesanan "${orderId || '-'}" tidak ada`}
            description="Mungkin nomornya salah, atau data contoh baru saja dikembalikan ke awal."
            action={<Button onClick={onBack}>Buka daftar pesanan</Button>}
          />
        </Card>
      </div>
    );
  }

  const partner = partners.find((p) => p.partner_id === order.partner_id);
  const product = products.find((p) => p.product_id === order.product_id);
  const progress = calculateSingleOrderProgress(order, productionRecords, deliveryRecords);
  const prod = productionRecords
    .filter((r) => r.order_id === order.order_id)
    .sort((a, b) => sortableTime(b.reported_at) - sortableTime(a.reported_at));
  const del = deliveryRecords
    .filter((r) => r.order_id === order.order_id)
    .sort((a, b) => sortableTime(b.shipped_at) - sortableTime(a.shipped_at));

  const producedVerified = prod
    .filter((r) => getVerificationStatus(r) === 'terverifikasi')
    .reduce((s, r) => s + r.quantity_completed, 0);
  const shippedVerified = del
    .filter((r) => getVerificationStatus(r) === 'terverifikasi')
    .reduce((s, r) => s + r.quantity_shipped, 0);
  const pendingCount = [...prod, ...del].filter((r) => getVerificationStatus(r) !== 'terverifikasi').length;
  const pct = (n: number) => (progress.totalOrdered > 0 ? Math.round((n / progress.totalOrdered) * 100) : 0);
  const done = progress.computedStatus === 'selesai';

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${partner?.partner_name ?? 'Mitra'} — ${product?.product_name ?? 'Barang'}`}
        description={
          <>
            Pesanan <span className="font-mono font-semibold text-ink">{order.order_id}</span> · PO {order.po_number}
          </>
        }
        onBack={onBack}
        backLabel="Kembali ke daftar pesanan"
        meta={
          <>
            <OrderStatusBadge status={progress.computedStatus} />
            <SyncBadge syncedAt={order.synced_at} />
            <SourceBadge source={order.source} />
          </>
        }
        actions={
          !done && (
            <>
              <Button size="lg" onClick={() => onNavigateToProduction(order.order_id)} icon={<Factory className="w-5 h-5" />}>
                Catat Produksi
              </Button>
              <Button
                size="lg"
                variant="secondary"
                onClick={() => onNavigateToDelivery(order.order_id)}
                icon={<Truck className="w-5 h-5" />}
              >
                Catat Pengiriman
              </Button>
            </>
          )
        }
      />

      {pendingCount > 0 && (
        <Notice tone="warning" title={`${pendingCount} catatan belum diperiksa supervisor`}>
          Angka realisasi di bawah sudah termasuk catatan yang belum diperiksa. Bagian &quot;sudah diperiksa&quot; menunjukkan
          angka yang sudah dicek.
        </Notice>
      )}

      <Card title="Rencana dan realisasi" description="Rencana = jumlah di PO. Realisasi = jumlah dari catatan produksi & pengiriman.">
        <div className="space-y-6">
          <div>
            <div className="flex items-baseline justify-between gap-3 mb-2">
              <span className="text-base font-semibold">Rencana (dipesan)</span>
              <span className="text-lg font-bold tabular-nums">{progress.totalOrdered.toLocaleString('id-ID')} pcs</span>
            </div>
            <ProgressBar value={100} label="Rencana" tone="navy" />
          </div>
          <div>
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 mb-2">
              <span className="text-base font-semibold">Sudah diproduksi</span>
              <span className="text-lg font-bold tabular-nums">
                {progress.totalProduced.toLocaleString('id-ID')} pcs ({progress.productionPercentage}%)
              </span>
            </div>
            <ProgressBar value={progress.productionPercentage} label="Persentase produksi" />
            <p className="mt-1.5 text-[15px] text-ink-muted">
              Sudah diperiksa: {producedVerified.toLocaleString('id-ID')} pcs ({pct(producedVerified)}%) · Sisa target:{' '}
              {progress.remainingProduction.toLocaleString('id-ID')} pcs
            </p>
          </div>
          <div>
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 mb-2">
              <span className="text-base font-semibold">Sudah dikirim</span>
              <span className="text-lg font-bold tabular-nums">
                {progress.totalShipped.toLocaleString('id-ID')} pcs ({progress.deliveryPercentage}%)
              </span>
            </div>
            <ProgressBar value={progress.deliveryPercentage} label="Persentase pengiriman" tone="success" />
            <p className="mt-1.5 text-[15px] text-ink-muted">
              Sudah diperiksa: {shippedVerified.toLocaleString('id-ID')} pcs ({pct(shippedVerified)}%) · Belum dikirim:{' '}
              {progress.remainingDelivery.toLocaleString('id-ID')} pcs
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <Card title="Data pesanan" className="lg:col-span-1">
          <dl className="space-y-4">
            <KeyValue label="Mitra" value={`${partner?.partner_name ?? '-'} (${partner?.city ?? '-'})`} />
            <KeyValue label="PIC mitra" value={`${order.pic_mitra || partner?.pic_name || '-'} · ${partner?.phone ?? ''}`} />
            <KeyValue label="Barang" value={`${product?.product_name ?? '-'} (${product?.product_code ?? '-'})`} />
            <KeyValue label="Tanggal pesanan" value={formatDate(order.order_date)} />
            <KeyValue label="Target kirim" value={formatDate(order.due_date)} />
            {order.notes && <KeyValue label="Catatan" value={order.notes} />}
          </dl>
          <div className="mt-5 pt-4 border-t border-line">
            <h3 className="text-base font-bold flex items-center gap-2">
              <History className="w-5 h-5 text-navy dark:text-[#8CCBFF]" aria-hidden /> Asal data
            </h3>
            <dl className="mt-3 space-y-3">
              <KeyValue label="Dicatat oleh" value={order.created_by} />
              <KeyValue label="Waktu input" value={order.created_at ? formatDateTime(order.created_at) : 'Tidak tercatat'} />
              <KeyValue label="Sumber" value={sourceLabel(order.source)} />
            </dl>
          </div>
          {product && (
            <div className="mt-6 pt-4 border-t border-line">
              <Button
                variant={show3D ? 'secondary' : 'primary'}
                size="md"
                fullWidth
                onClick={() => setShow3D((s) => !s)}
                icon={<Box className="w-5 h-5" />}
              >
                {show3D ? 'Tutup Model 3D' : 'Lihat Model 3D Komponen'}
              </Button>
            </div>
          )}
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <Card title="Catatan produksi" description={`${prod.length} catatan`}>
            {prod.length === 0 ? (
              <EmptyState
                title="Belum ada catatan produksi"
                action={
                  !done && (
                    <Button onClick={() => onNavigateToProduction(order.order_id)} icon={<Factory className="w-5 h-5" />}>
                      Catat Produksi
                    </Button>
                  )
                }
              />
            ) : (
              <ul className="divide-y divide-line -my-3">
                {prod.map((r) => (
                  <li key={r.production_id} className="py-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-[17px] font-bold tabular-nums">
                          {r.quantity_completed.toLocaleString('id-ID')} pcs baik
                          {!!r.reject_qty && <span className="font-semibold text-warning"> · {r.reject_qty} pcs cacat</span>}
                        </p>
                        <p className="text-[15px] text-ink-muted">
                          {formatDateTime(r.reported_at)} · {r.recorded_by}
                        </p>
                      </div>
                      <VerificationBadge status={getVerificationStatus(r)} />
                    </div>
                    {r.notes && <p className="mt-1 text-[15px]">{r.notes}</p>}
                    <RecordTrail record={r} id={r.production_id} />
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Riwayat pengiriman" description={`${del.length} pengiriman`}>
            {del.length === 0 ? (
              <EmptyState
                title="Belum ada pengiriman"
                action={
                  !done && (
                    <Button onClick={() => onNavigateToDelivery(order.order_id)} icon={<Truck className="w-5 h-5" />}>
                      Catat Pengiriman
                    </Button>
                  )
                }
              />
            ) : (
              <ul className="divide-y divide-line -my-3">
                {del.map((r) => (
                  <li key={r.delivery_id} className="py-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-[17px] font-bold tabular-nums">{r.quantity_shipped.toLocaleString('id-ID')} pcs dikirim</p>
                        <p className="text-[15px] text-ink-muted">
                          {formatDateTime(r.shipped_at)} · Surat jalan {r.delivery_note ?? 'belum diisi'} · {r.recorded_by}
                        </p>
                      </div>
                      <VerificationBadge status={getVerificationStatus(r)} />
                    </div>
                    {r.notes && <p className="mt-1 text-[15px]">{r.notes}</p>}
                    <RecordTrail record={r} id={r.delivery_id} />
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      {show3D && product && (
        <ThreePartViewer partName={product.product_name} partCode={product.product_code} orderId={order.order_id} />
      )}
    </div>
  );
};

const FIELD_LABEL: Record<string, string> = {
  quantity_completed: 'jumlah baik',
  quantity_shipped: 'jumlah dikirim',
  reject_qty: 'jumlah cacat',
  delivery_note: 'surat jalan',
  notes: 'catatan',
};

/** Jejak ringkas: nomor catatan, waktu input, pemeriksa, catatan perbaikan, dan riwayat koreksi. */
function RecordTrail({ record, id }: { record: ProductionRecord | DeliveryRecord; id: string }) {
  return (
    <div className="mt-2 text-sm text-ink-muted space-y-1">
      <p>
        No. {id}
        {record.created_at && <> · diinput {formatDateTime(record.created_at)}</>}
        {record.source === 'data_contoh' && <> · data contoh</>}
      </p>
      {record.verified_by && record.verification_status !== 'menunggu_pemeriksaan' && (
        <p>
          Diperiksa {record.verified_by}
          {record.verified_at && <> · {formatDateTime(record.verified_at)}</>}
        </p>
      )}
      {record.verification_status === 'perlu_diperbaiki' && record.verification_note && (
        <p className="text-danger font-medium">Perlu diperbaiki: {record.verification_note}</p>
      )}
      {record.revisions && record.revisions.length > 0 && (
        <details className="mt-1">
          <summary className="cursor-pointer font-semibold text-brand min-h-[32px]">
            Dikoreksi {record.revisions.length} kali — lihat riwayat
          </summary>
          <ul className="mt-1 space-y-1 pl-4 list-disc">
            {record.revisions.map((rv) => (
              <li key={rv.at}>
                {formatDateTime(rv.at)} oleh {rv.by}: {rv.reason}.{' '}
                {Object.entries(rv.changes)
                  .map(([k, c]) => `${FIELD_LABEL[k] ?? k}: ${c.from ?? '-'} → ${c.to ?? '-'}`)
                  .join('; ')}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
