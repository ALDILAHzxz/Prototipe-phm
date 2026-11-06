import React from 'react';
import { X, Palette, Type, Layout, CheckCircle, Sliders, ShieldCheck } from 'lucide-react';

interface DesignSystemReferenceProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DesignSystemReference: React.FC<DesignSystemReferenceProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div role="dialog" aria-modal="true" aria-label="Panduan tampilan" className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-[#D9E0E8] max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#D9E0E8]">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#0077C8]" />
              <h2 className="text-2xl font-bold text-[#1E293B]">
                BEESHA Design System & HCI Guide
              </h2>
            </div>
            <p className="text-sm text-[#526174] mt-1">
              Panduan token desain, warna korporat, tipografi, dan prinsip HCI ramah pekerja operasional (Gen X Friendly).
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[48px] px-3 rounded-lg hover:bg-slate-100 flex items-center gap-2 text-base font-semibold text-[#526174] cursor-pointer"
          >
            <X className="w-5 h-5" aria-hidden />
            Tutup
          </button>
        </div>

        {/* 1. Core Brand Color Swatches */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-[#1E293B] flex items-center gap-2">
            <Palette className="w-5 h-5 text-[#0077C8]" />
            <span>1. Palet Warna Wajib (Mandatory Brand Palette)</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-3.5 rounded-xl border border-[#D9E0E8] bg-white space-y-2">
              <div className="w-full h-14 rounded-lg bg-[#1B365D] flex items-center justify-center text-white text-xs font-mono font-bold">
                #1B365D
              </div>
              <p className="text-xs font-bold text-[#1E293B]">Primary Navy Blue</p>
              <p className="text-sm text-[#526174]">Navbar, Heading, Kepercayaan</p>
            </div>

            <div className="p-3.5 rounded-xl border border-[#D9E0E8] bg-white space-y-2">
              <div className="w-full h-14 rounded-lg bg-[#0077C8] flex items-center justify-center text-white text-xs font-mono font-bold">
                #0077C8
              </div>
              <p className="text-xs font-bold text-[#1E293B]">Secondary Bright Blue</p>
              <p className="text-sm text-[#526174]">Tombol Utama, Fokus, Aksi</p>
            </div>

            <div className="p-3.5 rounded-xl border border-[#D9E0E8] bg-white space-y-2">
              <div className="w-full h-14 rounded-lg bg-[#F2F4F7] border border-[#D9E0E8] flex items-center justify-center text-[#1E293B] text-xs font-mono font-bold">
                #F2F4F7
              </div>
              <p className="text-xs font-bold text-[#1E293B]">Background Soft Silver</p>
              <p className="text-sm text-[#526174]">Latar Belakang Bersih & Tenang</p>
            </div>

            <div className="p-3.5 rounded-xl border border-[#D9E0E8] bg-white space-y-2">
              <div className="w-full h-14 rounded-lg bg-[#1E293B] flex items-center justify-center text-white text-xs font-mono font-bold">
                #1E293B
              </div>
              <p className="text-xs font-bold text-[#1E293B]">Dark Charcoal Text</p>
              <p className="text-sm text-[#526174]">Kontras Tinggi WCAG 4.5:1</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
              <p className="text-xs font-bold text-[#18794E]">Success: #18794E</p>
              <p className="text-sm text-emerald-800 mt-0.5">Produksi selesai & terkirim tuntas</p>
            </div>
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
              <p className="text-xs font-bold text-[#B54708]">Warning: #B54708</p>
              <p className="text-sm text-amber-800 mt-0.5">Mendekati tenggat tempo</p>
            </div>
            <div className="p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-xs font-bold text-[#B42318]">Danger: #B42318</p>
              <p className="text-sm text-red-800 mt-0.5">Terlambat / validasi gagal</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
              <p className="text-xs font-bold text-[#0B63A8]">Informational: #0B63A8</p>
              <p className="text-sm text-blue-800 mt-0.5">Status pesanan baru & petunjuk</p>
            </div>
          </div>
        </div>

        {/* 2. Typography & Scale */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-[#1E293B] flex items-center gap-2">
            <Type className="w-5 h-5 text-[#0077C8]" />
            <span>2. Skala Tipografi (Typography Scale)</span>
          </h3>

          <div className="border border-[#D9E0E8] rounded-xl overflow-hidden divide-y divide-[#D9E0E8] text-sm">
            <div className="p-3.5 bg-[#F8FAFC] flex justify-between font-bold text-xs text-[#526174]">
              <span>Elemen Desain</span>
              <span>Ukuran Desktop / Mobile</span>
              <span>Berat (Weight)</span>
            </div>
            <div className="p-3.5 flex justify-between items-center">
              <span className="font-bold text-xl text-[#1E293B]">Judul Halaman Utama</span>
              <span className="font-mono text-xs">30px / 26px</span>
              <span className="font-semibold text-xs">700 Bold</span>
            </div>
            <div className="p-3.5 flex justify-between items-center">
              <span className="font-bold text-lg text-[#1E293B]">Section Heading</span>
              <span className="font-mono text-xs">22px / 20px</span>
              <span className="font-semibold text-xs">700 Bold</span>
            </div>
            <div className="p-3.5 flex justify-between items-center">
              <span className="font-semibold text-base text-[#1E293B]">Form Label & Button</span>
              <span className="font-mono text-xs">16px / 16px</span>
              <span className="font-semibold text-xs">600 SemiBold</span>
            </div>
            <div className="p-3.5 flex justify-between items-center">
              <span className="font-bold text-2xl text-[#1B365D] tabular-nums">KPI Angka Operasional</span>
              <span className="font-mono text-xs">36px / 30px</span>
              <span className="font-semibold text-xs">700 Tabular Figures</span>
            </div>
          </div>
        </div>

        {/* 3. Spacing & Dimensions Rules */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-[#1E293B] flex items-center gap-2">
            <Layout className="w-5 h-5 text-[#0077C8]" />
            <span>3. Dimensi Komponen & Spasi (Touch & Gen-X Accessibility)</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#D9E0E8]">
              <span className="text-xs text-[#526174]">Tinggi Navbar</span>
              <p className="font-bold text-base text-[#1E293B] mt-0.5">72px / 64px</p>
            </div>
            <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#D9E0E8]">
              <span className="text-xs text-[#526174]">Tinggi Tombol Utama</span>
              <p className="font-bold text-base text-[#1E293B] mt-0.5">52px (Besar & Mudah Ditekan)</p>
            </div>
            <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#D9E0E8]">
              <span className="text-xs text-[#526174]">Tinggi Input Field</span>
              <p className="font-bold text-base text-[#1E293B] mt-0.5">56px (Font 17px)</p>
            </div>
            <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#D9E0E8]">
              <span className="text-xs text-[#526174]">Radius Kartu & Tombol</span>
              <p className="font-bold text-base text-[#1E293B] mt-0.5">Card 12px · Btn 10px</p>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div className="pt-4 border-t border-[#D9E0E8] flex justify-end">
          <button
            onClick={onClose}
            className="h-11 px-6 bg-[#1B365D] hover:bg-[#152a48] text-white font-semibold text-sm rounded-lg transition-colors cursor-pointer"
          >
            Tutup Panduan
          </button>
        </div>
      </div>
    </div>
  );
};
