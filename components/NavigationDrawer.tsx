import React, { useEffect } from 'react';
import {
  X,
  Home,
  ClipboardList,
  Factory,
  Truck,
  FileText,
  History,
  AlertTriangle,
  Box,
  Bot,
  Info,
  ChevronRight,
} from 'lucide-react';
import { ScreenType } from '../types';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  alertsCount: number;
}

interface MenuItem {
  id: ScreenType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  badge?: number;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isOpen,
  onClose,
  currentScreen,
  onNavigate,
  alertsCount,
}) => {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const menuItems: MenuItem[] = [
    {
      id: 'beranda',
      label: 'Beranda',
      icon: Home,
      description: 'Ringkasan operasional dan KPI',
    },
    {
      id: 'daftar_pesanan',
      label: 'Pemesanan Mitra',
      icon: ClipboardList,
      description: 'Daftar dan pencatatan pesanan mitra',
    },
    {
      id: 'form_produksi',
      label: 'Hasil Produksi',
      icon: Factory,
      description: 'Input unit produk selesai dibuat',
    },
    {
      id: 'form_pengiriman',
      label: 'Pengiriman',
      icon: Truck,
      description: 'Catat ekspedisi dan surat jalan',
    },
    {
      id: 'detail_pesanan',
      label: 'Detail Pesanan',
      icon: FileText,
      description: 'Pelacakan 3-tahap progres pesanan',
    },
    {
      id: 'riwayat_aktivitas',
      label: 'Riwayat Aktivitas',
      icon: History,
      description: 'Log transaksi operasional terpadu',
    },
    {
      id: 'pusat_peringatan',
      label: 'Pusat Peringatan',
      icon: AlertTriangle,
      description: 'Pekerjaan yang butuh perhatian',
      badge: alertsCount,
    },
    {
      id: 'inspeksi_3d',
      label: 'Inspeksi 3D Part',
      icon: Box,
      description: 'Model 3D interaktif part & perakitan',
    },
  ];

  const handleSelect = (screen: ScreenType) => {
    onNavigate(screen);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
        aria-hidden="true"
      />

      {/* Drawer Surface */}
      <div className="fixed inset-y-0 left-0 w-[320px] max-w-[88vw] bg-white shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
        {/* Drawer Header */}
        <div className="h-[72px] bg-[#1B365D] text-white px-5 flex items-center justify-between border-b border-[#24426f]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#0077C8] flex items-center justify-center text-white font-bold text-base">
              B
            </div>
            <div>
              <div className="font-bold text-lg text-white leading-tight">BEESHA</div>
              <div className="text-xs text-blue-200">PT Putra Hatim Mandiri</div>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup menu navigasi"
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-[#24426f] text-white transition-colors cursor-pointer focus-beesha"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Identity / Role Banner */}
        <div className="px-5 py-3.5 bg-[#F8FAFC] border-b border-[#D9E0E8] flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#1E293B]">Admin Operasional (AO)</p>
            <p className="text-[11px] text-[#526174]">Mode Demonstrasi Interaktif</p>
          </div>
          <span className="text-[10px] font-semibold text-[#0077C8] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
            Aktif
          </span>
        </div>

        {/* Menu Items List */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 focus:outline-none">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full min-h-[56px] px-3.5 py-2.5 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer group focus-beesha ${
                  isActive
                    ? 'bg-[#EBF5FB] border border-[#BDE0FE] text-[#0077C8] font-semibold shadow-2xs'
                    : 'text-[#1E293B] hover:bg-[#F2F4F7] border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      isActive
                        ? 'bg-[#0077C8] text-white'
                        : 'bg-[#E5EAF0] text-[#1B365D] group-hover:bg-[#d5dfea]'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p
                      className={`text-base leading-tight truncate ${
                        isActive ? 'font-bold text-[#0077C8]' : 'font-medium text-[#1E293B]'
                      }`}
                    >
                      {item.label}
                    </p>
                    <p className="text-xs text-[#526174] truncate mt-0.5">{item.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  {typeof item.badge === 'number' && item.badge > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#B42318] text-white">
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight
                    className={`w-4 h-4 ${
                      isActive ? 'text-[#0077C8]' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </nav>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-[#D9E0E8] bg-[#F8FAFC] space-y-2">
          <div className="flex items-center gap-2 text-xs text-[#526174]">
            <Info className="w-4 h-4 text-[#0077C8] shrink-0" />
            <span>Semua data demo tersinkronisasi otomatis di seluruh layar.</span>
          </div>
          <p className="text-[11px] text-slate-400 text-center pt-1">
            BEESHA v2.4 · PT Putra Hatim Mandiri
          </p>
        </div>
      </div>
    </div>
  );
};
