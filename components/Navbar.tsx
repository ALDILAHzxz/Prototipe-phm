import React from 'react';
import { Menu, MessageCircleQuestion, UserRound } from 'lucide-react';
import { ScreenType, Staff } from '../types';
import { NAV_ITEMS, isNavActive, routeToHash } from './navigation';

interface NavbarProps {
  onOpenDrawer: () => void;
  onOpenAssistant: () => void;
  onOpenStaffPicker: () => void;
  onNavigate: (screen: ScreenType) => void;
  currentScreen: ScreenType;
  activeStaff: Staff | null;
  badges: Partial<Record<ScreenType, number>>;
}

/**
 * Header tetap (sticky). Di layar lebar menu tampil langsung;
 * di layar lebih kecil menu dipindah ke tombol "Menu".
 */
export const Navbar: React.FC<NavbarProps> = ({
  onOpenDrawer,
  onOpenAssistant,
  onOpenStaffPicker,
  onNavigate,
  currentScreen,
  activeStaff,
  badges,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-navy text-white shadow-md">
      <div className="max-w-[1536px] mx-auto h-16 px-3 sm:px-6 flex items-center gap-2 sm:gap-4">
        <button
          type="button"
          onClick={onOpenDrawer}
          aria-label="Buka menu"
          className="2xl:hidden min-h-[48px] min-w-[48px] px-2 sm:px-3 flex items-center justify-center gap-2 rounded-field hover:bg-navy-strong cursor-pointer"
        >
          <Menu className="w-6 h-6" aria-hidden />
          <span className="text-base font-semibold hidden sm:inline">Menu</span>
        </button>

        <a
          href="#/"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('beranda');
          }}
          className="flex items-center gap-2.5 rounded-field min-h-[48px] pr-2 shrink-0"
        >
          <span className="w-9 h-9 rounded-lg bg-brand flex items-center justify-center font-bold text-lg" aria-hidden>
            B
          </span>
          <span className="leading-tight">
            <span className="block font-bold text-lg tracking-tight">BEESHA</span>
            <span className="hidden sm:block text-[13px] text-white/80">Operasional PHM</span>
          </span>
        </a>

        <nav aria-label="Menu utama" className="hidden 2xl:flex items-center gap-1 ml-2 flex-1 min-w-0">
          {NAV_ITEMS.map((item) => {
            const active = isNavActive(item, currentScreen);
            const badge = badges[item.id];
            return (
              <a
                key={item.id}
                href={routeToHash({ screen: item.id })}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(item.id);
                }}
                aria-current={active ? 'page' : undefined}
                className={`min-h-[44px] px-3 inline-flex items-center gap-2 rounded-field text-[15px] font-semibold whitespace-nowrap transition-colors ${
                  active ? 'bg-white text-navy' : 'text-white/90 hover:bg-navy-strong hover:text-white'
                }`}
              >
                {item.shortLabel ?? item.label}
                {!!badge && (
                  <span
                    className={`min-w-[24px] h-6 px-1.5 rounded-full text-[13px] font-bold inline-flex items-center justify-center ${
                      active ? 'bg-navy text-white' : 'bg-white text-navy'
                    }`}
                  >
                    {badge}
                    <span className="sr-only"> perlu ditindaklanjuti</span>
                  </span>
                )}
              </a>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenStaffPicker}
            className="min-h-[48px] px-2 sm:px-3 flex items-center gap-2 rounded-field border border-white/25 hover:bg-navy-strong cursor-pointer text-left"
            aria-label={activeStaff ? `Petugas: ${activeStaff.name}. Ganti petugas` : 'Pilih nama petugas'}
          >
            <UserRound className="w-5 h-5 shrink-0" aria-hidden />
            <span className="hidden md:block leading-tight max-w-[160px]">
              <span className="block text-[13px] text-white/75">Petugas</span>
              <span className="block text-[15px] font-semibold truncate">
                {activeStaff ? activeStaff.name : 'Pilih nama'}
              </span>
            </span>
          </button>

          <button
            type="button"
            onClick={onOpenAssistant}
            className="hidden sm:flex min-h-[48px] px-3 items-center gap-2 rounded-field bg-brand hover:bg-brand-strong text-[15px] font-semibold cursor-pointer"
          >
            <MessageCircleQuestion className="w-5 h-5" aria-hidden />
            <span>Tanya Beesha</span>
          </button>
        </div>
      </div>
    </header>
  );
};
