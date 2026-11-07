import React, { useEffect, useRef } from 'react';
import { CheckCircle2, HardDrive, Clock, CloudOff, UserRound } from 'lucide-react';
import { OperationsState } from '../../lib/useOperations';
import { Notice } from '../ui/Layout';
import { Button } from '../ui/Button';
import { StorageKind } from '../../lib/repository';
import { formatDateTime } from '../../lib/format';

/** Hal yang dibutuhkan setiap form untuk menyimpan data. */
export interface WriteContext {
  repo: OperationsState['repo'];
  apply: OperationsState['apply'];
  /** Nama petugas aktif, mis. "Joko Sutopo (Operator Lini 1)". null bila belum dipilih. */
  actor: string | null;
  onRequireStaff: () => void;
  onDirtyChange: (dirty: boolean) => void;
  storageKind: StorageKind | null;
}

/** Peringatan bila petugas belum dipilih — tanpa nama, catatan tidak bisa ditelusuri. */
export function StaffNotice({ actor, onRequireStaff }: { actor: string | null; onRequireStaff: () => void }) {
  if (actor) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-card bg-subtle border border-line">
        <p className="flex items-center gap-2.5 text-base text-ink">
          <span className="w-8 h-8 rounded-full bg-brand-soft text-brand flex items-center justify-center shrink-0">
            <UserRound className="w-4 h-4" aria-hidden />
          </span>
          <span>
            Dicatat atas nama: <strong className="text-navy font-bold">{actor}</strong>
          </span>
        </p>
        <Button
          variant="secondary"
          size="sm"
          onClick={onRequireStaff}
          icon={<UserRound className="w-4 h-4" />}
        >
          Ganti Petugas
        </Button>
      </div>
    );
  }
  return (
    <Notice tone="warning" title="Pilih nama Anda dulu">
      <p>Setiap catatan menyimpan nama pencatat agar bisa ditelusuri.</p>
      <Button variant="secondary" className="mt-3" onClick={onRequireStaff} icon={<UserRound className="w-5 h-5" />}>
        Pilih nama petugas
      </Button>
    </Notice>
  );
}

/** Bukti simpan: hanya ditampilkan setelah penyimpanan benar-benar berhasil. */
export function SavedReceipt({
  title,
  idLabel,
  idValue,
  details,
  createdAt,
  storageKind,
  needsVerification,
  duplicate,
  actions,
}: {
  title: string;
  idLabel: string;
  idValue: string;
  details: { label: string; value: React.ReactNode }[];
  createdAt?: string;
  storageKind: StorageKind | null;
  needsVerification?: boolean;
  duplicate?: boolean;
  actions: React.ReactNode;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    headingRef.current?.focus();
    window.scrollTo({ top: 0 });
  }, []);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-surface border-2 border-success rounded-card p-6 md:p-8 shadow-card" role="status">
        <div className="flex items-start gap-4">
          <CheckCircle2 className="w-10 h-10 text-success shrink-0" aria-hidden />
          <div>
            <h1 ref={headingRef} tabIndex={-1} className="text-2xl md:text-[28px] font-bold text-ink leading-tight outline-none">
              {title}
            </h1>
            <p className="mt-2 text-lg text-ink">
              {idLabel}: <strong className="font-mono text-navy">{idValue}</strong>
            </p>
            {duplicate && (
              <p className="mt-1 text-[15px] text-ink-muted">
                Data ini sudah tersimpan sebelumnya — tidak dibuat dua kali.
              </p>
            )}
          </div>
        </div>

        <dl className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 p-5 rounded-card bg-subtle border border-line">
          {details.map((d) => (
            <div key={d.label}>
              <dt className="text-sm text-ink-muted">{d.label}</dt>
              <dd className="text-base font-semibold text-ink">{d.value}</dd>
            </div>
          ))}
        </dl>

        <ul className="mt-5 space-y-2 text-[15px] text-ink">
          <li className="flex gap-2">
            <HardDrive className="w-5 h-5 text-success shrink-0" aria-hidden />
            {storageKind === 'sementara'
              ? 'Tersimpan sementara (hilang bila halaman ditutup — penyimpanan perangkat diblokir).'
              : `Tersimpan di perangkat ini${createdAt ? ` pada ${formatDateTime(createdAt)}` : ''}.`}
          </li>
          {needsVerification && (
            <li className="flex gap-2">
              <Clock className="w-5 h-5 text-warning shrink-0" aria-hidden />
              Menunggu pemeriksaan supervisor sebelum dianggap terverifikasi.
            </li>
          )}
          <li className="flex gap-2">
            <CloudOff className="w-5 h-5 text-ink-muted shrink-0" aria-hidden />
            Belum dikirim ke INDIGO/BHEESA (integrasi belum tersedia).
          </li>
        </ul>

        <div className="mt-7 flex flex-col sm:flex-row gap-3">{actions}</div>
      </div>
    </div>
  );
}

/** Cegah kehilangan isian saat menutup tab browser. */
export function useBeforeUnload(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [active]);
}
