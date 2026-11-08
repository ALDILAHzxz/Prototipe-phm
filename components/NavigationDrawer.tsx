import React, { useEffect, useRef } from 'react';
import { X, Box, MessageCircleQuestion, BookOpen, RotateCcw, HardDrive } from 'lucide-react';
import { ScreenType, Staff } from '../types';
import { NAV_ITEMS, isNavActive, NavItem } from './navigation';
import { StorageKind } from '../lib/repository';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  badges: Partial<Record<ScreenType, number>>;
  activeStaff: Staff | null;
  onOpenStaffPicker: () => void;
  onOpenAssistant: () => void;
  onOpenGuide: () => void;
  onResetData: () => void;
  storageKind: StorageKind | null;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isOpen,
  onClose,
  currentScreen,
  onNavigate,
  badges,
  activeStaff,
  onOpenStaffPicker,
  onOpenAssistant,
  onOpenGuide,
  onResetData,
  storageKind,
}) => {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      prev?.focus?.();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const go = (screen: ScreenType) => {
    onClose();
    onNavigate(screen);
  };

  const renderItem = (item: NavItem) => {
    const Icon = item.icon;
    const active = isNavActive(item, currentScreen);
    const badge = badges[item.id];
    return (
      <li key={item.id}>
        <button
          type="button"
          onClick={() => go(item.id)}
          aria-current={active ? 'page' : undefined}
          className={`w-full min-h-[60px] px-3 py-2 rounded-field flex items-center gap-3 text-left cursor-pointer border ${
            active ? 'bg-brand-soft border-brand/40' : 'border-transparent hover:bg-subtle'
          }`}
        >
          <span
            className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${
              active
                ? 'bg-brand text-white border-brand shadow-xs'
                : 'bg-brand-soft text-brand dark:bg-[#263D5A] dark:text-[#8CCBFF] border-line/40'
            }`}
          >
            <Icon className="w-5 h-5" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span
              className={`block text-[17px] leading-tight ${
                active ? 'font-bold text-brand dark:text-[#8CCBFF]' : 'font-semibold text-ink'
              }`}
            >
              {item.label}
            </span>
            <span className="block text-sm text-ink-muted mt-0.5">{item.description}</span>
          </span>
          {!!badge && (
            <span className="min-w-[28px] h-7 px-2 rounded-full bg-danger text-white text-sm font-bold flex items-center justify-center">
              {badge}
              <span className="sr-only"> perlu ditindaklanjuti</span>
            </span>
          )}
        </button>
      </li>
    );
  };

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Menu utama">
      <div className="absolute inset-0 bg-ink/60" onClick={onClose} aria-hidden />

      <div className="absolute inset-y-0 left-0 w-[340px] max-w-[90vw] bg-surface shadow-2xl flex flex-col">
        <div className="h-16 bg-navy text-white px-4 flex items-center justify-between shrink-0">
          <span className="font-bold text-lg">Menu</span>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="min-h-[48px] px-3 flex items-center gap-2 rounded-field hover:bg-navy-strong text-base font-semibold cursor-pointer"
          >
            <X className="w-5 h-5" aria-hidden />
            Tutup
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            onClose();
            onOpenStaffPicker();
          }}
          className="px-4 py-3 bg-subtle border-b border-line text-left hover:bg-canvas cursor-pointer"
        >
          <span className="block text-sm text-ink-muted">Petugas yang mencatat</span>
          <span className="block text-base font-semibold text-ink">
            {activeStaff ? `${activeStaff.name} — ${activeStaff.role_label}` : 'Belum dipilih'}
          </span>
          <span className="block text-sm font-semibold text-brand mt-0.5">Ganti petugas</span>
        </button>

        <nav aria-label="Menu utama" className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          <div>
            <p className="px-2 mb-2 text-sm font-bold text-ink-muted">Pekerjaan harian</p>
            <ul className="space-y-1">{NAV_ITEMS.filter((i) => i.group === 'kerja').map(renderItem)}</ul>
          </div>
          <div>
            <p className="px-2 mb-2 text-sm font-bold text-ink-muted">Pemantauan</p>
            <ul className="space-y-1">{NAV_ITEMS.filter((i) => i.group === 'pantau').map(renderItem)}</ul>
          </div>
          <div>
            <p className="px-2 mb-2 text-sm font-bold text-ink-muted">Lainnya</p>
            <ul className="space-y-1">
              {[
                {
                  label: 'Tanya Beesha',
                  icon: MessageCircleQuestion,
                  onClick: () => {
                    onClose();
                    onOpenAssistant();
                  },
                },
                { label: 'Inspeksi 3D Part', icon: Box, onClick: () => go('inspeksi_3d') },
                {
                  label: 'Buku Panduan & Tur Sistem',
                  icon: BookOpen,
                  onClick: () => {
                    onClose();
                    onOpenGuide();
                  },
                },
                {
                  label: 'Kembalikan Data Contoh',
                  icon: RotateCcw,
                  onClick: () => {
                    onClose();
                    onResetData();
                  },
                },
              ].map((x) => (
                <li key={x.label}>
                  <button
                    type="button"
                    onClick={x.onClick}
                    className="w-full min-h-[52px] px-3 rounded-field flex items-center gap-3 text-left text-base font-semibold text-ink hover:bg-subtle cursor-pointer transition-colors"
                  >
                    <x.icon className="w-5 h-5 text-brand dark:text-[#8CCBFF] shrink-0" aria-hidden />
                    {x.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="p-4 border-t border-line bg-subtle text-sm text-ink-muted flex gap-2">
          <HardDrive className="w-5 h-5 shrink-0 text-brand dark:text-[#8CCBFF]" aria-hidden />
          <span>
            {storageKind === 'sementara'
              ? 'Penyimpanan perangkat tidak tersedia. Data hanya bertahan selama halaman ini terbuka.'
              : 'Prototipe: data tersimpan di browser perangkat ini saja, belum ke server atau INDIGO.'}
          </span>
        </div>
      </div>
    </div>
  );
};
