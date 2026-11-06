import React from 'react';
import {
  CircleDot,
  Factory,
  Truck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShieldCheck,
  CloudOff,
} from 'lucide-react';
import { OrderStatus, VerificationStatus } from '../../types';

const base =
  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-sm font-semibold leading-none whitespace-nowrap';

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  baru: 'Belum diproduksi',
  dalam_produksi: 'Sedang diproduksi',
  terkirim_sebagian: 'Terkirim sebagian',
  selesai: 'Selesai dikirim',
};

/** Status pesanan: selalu teks + ikon, tidak hanya warna. */
export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const map: Record<OrderStatus, { cls: string; icon: React.ReactNode }> = {
    baru: { cls: 'bg-subtle text-ink border-line-field', icon: <CircleDot className="w-4 h-4" aria-hidden /> },
    dalam_produksi: { cls: 'bg-info-soft text-info border-info/40', icon: <Factory className="w-4 h-4" aria-hidden /> },
    terkirim_sebagian: {
      cls: 'bg-warning-soft text-warning border-warning/40',
      icon: <Truck className="w-4 h-4" aria-hidden />,
    },
    selesai: {
      cls: 'bg-success-soft text-success border-success/40',
      icon: <CheckCircle2 className="w-4 h-4" aria-hidden />,
    },
  };
  const m = map[status];
  return (
    <span className={`${base} ${m.cls}`}>
      {m.icon}
      {ORDER_STATUS_LABEL[status]}
    </span>
  );
}

export const VERIFICATION_LABEL: Record<VerificationStatus, string> = {
  menunggu_pemeriksaan: 'Menunggu pemeriksaan',
  terverifikasi: 'Terverifikasi',
  perlu_diperbaiki: 'Perlu diperbaiki',
};

export function VerificationBadge({ status }: { status: VerificationStatus }) {
  const map: Record<VerificationStatus, { cls: string; icon: React.ReactNode }> = {
    menunggu_pemeriksaan: {
      cls: 'bg-warning-soft text-warning border-warning/40',
      icon: <Clock className="w-4 h-4" aria-hidden />,
    },
    terverifikasi: {
      cls: 'bg-success-soft text-success border-success/40',
      icon: <ShieldCheck className="w-4 h-4" aria-hidden />,
    },
    perlu_diperbaiki: {
      cls: 'bg-danger-soft text-danger border-danger/40',
      icon: <AlertTriangle className="w-4 h-4" aria-hidden />,
    },
  };
  const m = map[status];
  return (
    <span className={`${base} ${m.cls}`}>
      {m.icon}
      {VERIFICATION_LABEL[status]}
    </span>
  );
}

/** Label jujur: data belum dikirim ke INDIGO/BHEESA karena integrasi belum tersedia. */
export function SyncBadge({ syncedAt }: { syncedAt?: string | null }) {
  if (syncedAt) {
    return (
      <span className={`${base} bg-success-soft text-success border-success/40`}>
        <CheckCircle2 className="w-4 h-4" aria-hidden />
        Terkirim ke INDIGO
      </span>
    );
  }
  return (
    <span className={`${base} bg-subtle text-ink-muted border-line-field`} title="Integrasi INDIGO/BHEESA belum tersedia">
      <CloudOff className="w-4 h-4" aria-hidden />
      Belum dikirim ke INDIGO
    </span>
  );
}

export function SourceBadge({ source }: { source?: string }) {
  if (source === 'data_contoh') {
    return (
      <span className={`${base} bg-subtle text-ink-muted border-dashed border-line-field font-medium`}>Data contoh</span>
    );
  }
  return null;
}
