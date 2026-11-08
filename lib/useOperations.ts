'use client';

import { useCallback, useEffect, useState } from 'react';
import { Staff } from '../types';
import { DEMO_STAFF } from '../data/mockData';
import {
  getOperationsRepository,
  OperationsRepository,
  OperationsSnapshot,
  SaveResult,
  STORAGE_KEY,
  StorageKind,
} from './repository';

const STAFF_KEY = 'phm-prototipe:petugas';

export interface OperationsState {
  snapshot: OperationsSnapshot | null;
  loadError: string | null;
  storageKind: StorageKind | null;
  repo: OperationsRepository | null;
  /** Panggil setelah operasi tulis berhasil agar seluruh layar memakai data terbaru. */
  apply: <T>(result: SaveResult<T>) => SaveResult<T>;
  reset: () => Promise<void>;
  activeStaff: Staff | null;
  setActiveStaff: (s: Staff | null) => void;
}

/** Memuat data dari repository dan menyediakannya ke seluruh layar. */
export function useOperations(): OperationsState {
  const [repo, setRepo] = useState<OperationsRepository | null>(null);
  const [snapshot, setSnapshot] = useState<OperationsSnapshot | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeStaff, setActiveStaffState] = useState<Staff | null>(null);

  useEffect(() => {
    const r = getOperationsRepository();
    setRepo(r);
    r.load()
      .then(setSnapshot)
      .catch(() => setLoadError('Data tidak dapat dimuat dari penyimpanan perangkat.'));

    try {
      const saved = window.localStorage.getItem(STAFF_KEY);
      const found = DEMO_STAFF.find((s) => s.staff_id === saved);
      if (found) setActiveStaffState(found);
    } catch {
      /* penyimpanan tidak tersedia: petugas dipilih ulang setiap kali */
    }

    // Sinkron antar-tab di perangkat yang sama.
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) r.load().then(setSnapshot).catch(() => undefined);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const apply = useCallback(<T,>(result: SaveResult<T>) => {
    if (result.ok) setSnapshot(result.snapshot);
    return result;
  }, []);

  const reset = useCallback(async () => {
    if (!repo) return;
    setSnapshot(await repo.resetToSampleData());
  }, [repo]);

  const setActiveStaff = useCallback((s: Staff | null) => {
    setActiveStaffState(s);
    try {
      if (s) {
        window.localStorage.setItem(STAFF_KEY, s.staff_id);
      } else {
        window.localStorage.removeItem(STAFF_KEY);
      }
    } catch {
      /* abaikan */
    }
  }, []);

  return {
    snapshot,
    loadError,
    storageKind: repo?.storageKind ?? null,
    repo,
    apply,
    reset,
    activeStaff,
    setActiveStaff,
  };
}
