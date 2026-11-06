import React from 'react';
import { Menu, Bot, Sparkles, Building2 } from 'lucide-react';
import { ScreenType } from '../types';

interface NavbarProps {
  onOpenDrawer: () => void;
  onOpenAssistant: () => void;
  onNavigateHome: () => void;
  currentScreen: ScreenType;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenDrawer,
  onOpenAssistant,
  onNavigateHome,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full h-[64px] md:h-[72px] bg-[#1B365D] text-white shadow-md border-b border-[#24426f] px-4 md:px-8 flex items-center justify-between transition-all">
      {/* LEFT ZONE: Hamburger + Brand Lockup */}
      <div className="flex items-center gap-3 md:gap-4">
        <button
          onClick={onOpenDrawer}
          aria-label="Buka menu utama"
          className="w-12 h-12 flex items-center justify-center rounded-lg hover:bg-[#24426f] active:bg-[#2b4c7d] text-white transition-colors cursor-pointer focus-beesha"
        >
          <Menu className="w-6 h-6" />
        </button>

        <button
          onClick={onNavigateHome}
          className="flex items-center gap-2.5 text-left group cursor-pointer focus-beesha rounded-md"
        >
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-[#0077C8] flex items-center justify-center text-white font-bold text-lg shadow-xs group-hover:scale-105 transition-transform">
            B
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg md:text-xl tracking-tight text-white leading-none">
                BEESHA
              </span>
              <span className="text-[10px] font-medium bg-[#0077C8]/40 border border-[#0077C8]/60 px-1.5 py-0.2 rounded text-blue-100 hidden sm:inline-block">
                PHM Group
              </span>
            </div>
            <p className="text-xs text-blue-200/90 font-normal leading-tight mt-0.5 hidden xs:block">
              Sistem Informasi Operasional
            </p>
          </div>
        </button>
      </div>

      {/* RIGHT ZONE: Mode Demo + AI Help + User Initials */}
      <div className="flex items-center gap-2.5 md:gap-3.5">
        {/* Mode Demo Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#152a48] border border-[#2d4d7a] text-xs text-blue-200">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span>Mode Demo (Simulasi)</span>
        </div>

        {/* Bantuan Beesha AI Button */}
        <button
          onClick={onOpenAssistant}
          className="h-10 px-3 md:px-3.5 rounded-lg bg-[#0077C8] hover:bg-[#0069b2] active:bg-[#005a99] text-white text-xs md:text-sm font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer focus-beesha"
        >
          <Bot className="w-4 h-4 text-blue-100" />
          <span className="hidden sm:inline">Bantuan Beesha</span>
          <span className="sm:hidden">Tanya AI</span>
        </button>

        {/* User Initials Avatar */}
        <div
          title="Operator Aktif: Admin Operasional PHM"
          className="w-10 h-10 rounded-full bg-[#24426f] border border-[#3b5d8f] flex items-center justify-center text-white font-semibold text-xs md:text-sm shadow-xs select-none"
        >
          AO
        </div>
      </div>
    </header>
  );
};
