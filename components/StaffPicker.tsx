import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Staff } from '../types';
import { Dialog } from './ui/Dialog';

interface StaffPickerProps {
  open: boolean;
  staff: Staff[];
  active: Staff | null;
  onSelect: (s: Staff) => void;
  onClose: () => void;
}

/** Memilih nama petugas pencatat. Bukan login — hanya agar setiap catatan punya nama pencatat. */
export function StaffPicker({ open, staff, active, onSelect, onClose }: StaffPickerProps) {
  return (
    <Dialog
      open={open}
      title="Siapa yang sedang mencatat?"
      description="Nama Anda disimpan pada setiap catatan agar bisa ditelusuri. Ini bukan login."
      onClose={onClose}
    >
      <ul className="space-y-2">
        {staff.map((s) => {
          const selected = active?.staff_id === s.staff_id;
          return (
            <li key={s.staff_id}>
              <button
                type="button"
                data-autofocus={selected || undefined}
                onClick={() => {
                  onSelect(s);
                  onClose();
                }}
                aria-pressed={selected}
                className={`w-full min-h-[60px] px-4 py-2 rounded-field border-2 flex items-center justify-between gap-3 text-left cursor-pointer ${
                  selected ? 'border-brand bg-brand-soft' : 'border-line hover:border-line-field'
                }`}
              >
                <span>
                  <span className="block text-[17px] font-bold text-ink">{s.name}</span>
                  <span className="block text-[15px] text-ink-muted">{s.role_label}</span>
                </span>
                {selected && <CheckCircle2 className="w-6 h-6 text-brand" aria-hidden />}
              </button>
            </li>
          );
        })}
      </ul>
      <p className="mt-4 text-sm text-ink-muted">Daftar ini adalah petugas contoh untuk prototipe.</p>
    </Dialog>
  );
}
