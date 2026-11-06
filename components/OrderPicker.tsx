import React, { useMemo, useState } from 'react';
import { Search, CheckCircle2 } from 'lucide-react';
import { Order, Partner, Product, ProductionRecord, DeliveryRecord } from '../types';
import { calculateSingleOrderProgress } from '../utils/operations';
import { formatDate } from '../lib/format';
import { inputClass } from './ui/Field';

interface OrderPickerProps {
  id: string;
  legend: string;
  orders: Order[];
  partners: Partner[];
  products: Product[];
  productionRecords: ProductionRecord[];
  deliveryRecords: DeliveryRecord[];
  value: string;
  onChange: (orderId: string) => void;
  /** Mode menentukan angka "sisa" yang ditampilkan dan pesanan mana yang relevan. */
  mode: 'produksi' | 'pengiriman';
  error?: string;
}

/**
 * Pemilih pesanan berbentuk kartu besar (bukan dropdown panjang),
 * sehingga operator cukup mengetuk pesanan yang sedang dikerjakan.
 */
export function OrderPicker({
  id,
  legend,
  orders,
  partners,
  products,
  productionRecords,
  deliveryRecords,
  value,
  onChange,
  mode,
  error,
}: OrderPickerProps) {
  const [query, setQuery] = useState('');
  const [showAll, setShowAll] = useState(false);

  const rows = useMemo(() => {
    return orders
      .map((o) => {
        const progress = calculateSingleOrderProgress(o, productionRecords, deliveryRecords);
        const partner = partners.find((p) => p.partner_id === o.partner_id);
        const product = products.find((p) => p.product_id === o.product_id);
        const remaining = mode === 'produksi' ? progress.remainingProduction : progress.remainingDelivery;
        return { o, progress, partner, product, remaining };
      })
      .filter((r) => showAll || r.remaining > 0 || r.o.order_id === value)
      .filter((r) => {
        const q = query.trim().toLowerCase();
        if (!q) return true;
        return [r.o.order_id, r.o.po_number, r.partner?.partner_name, r.product?.product_name, r.product?.product_code]
          .filter(Boolean)
          .some((s) => s!.toLowerCase().includes(q));
      })
      .sort((a, b) => a.o.due_date.localeCompare(b.o.due_date));
  }, [orders, partners, products, productionRecords, deliveryRecords, mode, query, showAll, value]);

  const hiddenCount = orders.length - rows.length;

  return (
    <fieldset aria-describedby={error ? `${id}-error` : undefined}>
      <legend className="flex items-baseline gap-2 text-base font-semibold text-ink mb-2">
        <span>{legend}</span>
        <span className="text-sm font-semibold text-danger">wajib</span>
      </legend>

      {orders.length > 4 && (
        <div className="relative mb-3">
          <Search className="w-5 h-5 text-ink-muted absolute left-4 top-1/2 -translate-y-1/2" aria-hidden />
          <label htmlFor={`${id}-cari`} className="sr-only">
            Cari pesanan
          </label>
          <input
            id={`${id}-cari`}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari mitra, nomor PO, atau barang"
            className={inputClass(false, 'pl-12')}
          />
        </div>
      )}

      {error && (
        <p id={`${id}-error`} className="mb-2 text-[15px] text-danger font-medium" role="alert">
          {error}
        </p>
      )}

      <div id={id} tabIndex={-1} className="space-y-2.5 outline-none">
        {rows.length === 0 && (
          <p className="p-4 rounded-card border border-dashed border-line-field text-base text-ink-muted">
            {query
              ? 'Tidak ada pesanan yang cocok dengan pencarian.'
              : mode === 'produksi'
              ? 'Semua pesanan sudah memenuhi target produksi.'
              : 'Tidak ada pesanan yang masih perlu dikirim.'}
          </p>
        )}
        {rows.map(({ o, partner, product, remaining, progress }) => {
          const checked = o.order_id === value;
          return (
            <label
              key={o.order_id}
              className={`flex gap-3 p-4 rounded-card border-2 cursor-pointer transition-colors ${
                checked ? 'border-brand bg-brand-soft' : 'border-line hover:border-line-field bg-surface'
              }`}
            >
              <input
                type="radio"
                name={id}
                value={o.order_id}
                checked={checked}
                onChange={() => onChange(o.order_id)}
                className="mt-1 w-5 h-5 accent-[rgb(var(--c-brand))] shrink-0"
              />
              <span className="flex-1 min-w-0">
                <span className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <span className="text-[17px] font-bold text-ink">{partner?.partner_name ?? 'Mitra tidak dikenal'}</span>
                  <span className="text-sm text-ink-muted">Tenggat {formatDate(o.due_date)}</span>
                </span>
                <span className="block text-base text-ink mt-0.5">
                  {product?.product_name ?? 'Barang'}{' '}
                  <span className="text-ink-muted">· PO {o.po_number}</span>
                </span>
                <span className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[15px]">
                  <span>
                    Dipesan <strong className="tabular-nums">{o.quantity_ordered.toLocaleString('id-ID')}</strong>
                  </span>
                  <span>
                    {mode === 'produksi' ? 'Sudah dibuat' : 'Sudah dikirim'}{' '}
                    <strong className="tabular-nums">
                      {(mode === 'produksi' ? progress.totalProduced : progress.totalShipped).toLocaleString('id-ID')}
                    </strong>
                  </span>
                  <span className={remaining > 0 ? 'text-warning font-semibold' : 'text-success font-semibold'}>
                    {remaining > 0 ? (
                      <>
                        Sisa <strong className="tabular-nums">{remaining.toLocaleString('id-ID')}</strong> pcs
                      </>
                    ) : (
                      'Target terpenuhi'
                    )}
                  </span>
                </span>
              </span>
              {checked && <CheckCircle2 className="w-6 h-6 text-brand shrink-0" aria-hidden />}
            </label>
          );
        })}
      </div>

      {(hiddenCount > 0 || showAll) && !query && (
        <button
          type="button"
          onClick={() => setShowAll((s) => !s)}
          className="mt-3 min-h-[44px] px-2 -ml-2 text-[15px] font-semibold text-brand underline underline-offset-4 cursor-pointer"
        >
          {showAll ? 'Sembunyikan pesanan yang sudah terpenuhi' : `Tampilkan juga ${hiddenCount} pesanan yang sudah terpenuhi`}
        </button>
      )}
    </fieldset>
  );
}
