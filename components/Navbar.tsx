import React from 'react';
import { Menu, MessageCircleQuestion, UserRound } from 'lucide-react';
import { ScreenType, Staff } from '../types';
import { NAV_ITEMS, isNavActive, routeToHash, getScreenTitle } from './navigation';
import { ThemeToggle } from './ThemeToggle';

interface NavbarProps {
  onOpenDrawer: () => void;
  onOpenAssistant: () => void;
  onOpenProfile: () => void;
  onNavigate: (screen: ScreenType) => void;
  currentScreen: ScreenType;
  activeStaff: Staff | null;
  badges: Partial<Record<ScreenType, number>>;
}

/**
 * Header tetap (sticky) V4.0.
 * Desktop: Navigasi lengkap, Logo BEESHA, Tombol Profil, dan Tanya Beesha.
 * Mobile: Sederhana & lapang. Kiri: Hamburger (tanpa teks). Tengah: Judul halaman aktif. Kanan: Tema & Profil.
 */
export const Navbar: React.FC<NavbarProps> = ({
  onOpenDrawer,
  onOpenAssistant,
  onOpenProfile,
  onNavigate,
  currentScreen,
  activeStaff,
  badges,
}) => {
  const screenTitle = getScreenTitle(currentScreen);

  return (
    <header className="sticky top-0 z-40 w-full bg-navy text-white shadow-md">
      <div className="max-w-[1360px] mx-auto h-16 md:h-[72px] px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-1.5 sm:gap-4">
        {/* SISI KIRI: Tombol Hamburger & Branding Desktop */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenDrawer}
            aria-label="Buka menu navigasi"
            className="2xl:hidden min-h-[44px] min-w-[44px] sm:min-h-[48px] sm:min-w-[48px] px-2 sm:px-3 flex items-center justify-center gap-2 rounded-field hover:bg-navy-strong cursor-pointer active:scale-95 transition-all"
          >
            <Menu className="w-6 h-6" aria-hidden />
            <span className="text-base font-semibold hidden sm:inline">Menu</span>
          </button>

          {/* Branding BEESHA - Hanya tampil di desktop/tablet (sm ke atas) */}
          <a
            href="#/"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('beranda');
            }}
            className="hidden sm:flex items-center gap-2.5 rounded-field min-h-[48px] pr-2 shrink-0 group"
          >
            <span className="w-9 h-9 rounded-lg bg-brand flex items-center justify-center font-bold text-lg shadow-xs group-hover:scale-105 transition-transform" aria-hidden>
              B
            </span>
            <span className="leading-tight">
              <span className="block font-bold text-lg tracking-tight">BEESHA</span>
              <span className="hidden md:block text-[13px] text-white/80">Operasional PHM</span>
            </span>
          </a>
        </div>

        {/* TENGAH MOBILE: Judul Halaman Kontekstual Dinamis (V4.0) */}
        <div className="sm:hidden flex-1 min-w-0 px-2 text-center">
          <h2 className="text-[16px] font-bold text-white tracking-tight truncate leading-tight">
            {screenTitle.full}
          </h2>
        </div>

        {/* TENGAH DESKTOP: Navigasi Layar Lebar */}
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
                  active ? 'bg-white text-[#1B365D] font-bold shadow-xs' : 'text-white/90 hover:bg-white/10 hover:text-white'
                }`}
              >
                {item.shortLabel ?? item.label}
                {!!badge && (
                  <span
                    className={`min-w-[24px] h-6 px-1.5 rounded-full text-[13px] font-bold inline-flex items-center justify-center ${
                      active ? 'bg-[#1B365D] text-white' : 'bg-white text-[#1B365D]'
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

        {/* SISI KANAN: Tema, Profil Terpadu & Tanya Beesha */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <ThemeToggle />

          {/* Tombol Profil Pengguna Terpadu (Mobile: Ikon, Desktop: Ikon + Label) */}
          <button
            type="button"
            onClick={onOpenProfile}
            className="min-h-[44px] min-w-[44px] sm:min-h-[48px] px-2.5 sm:px-3 flex items-center justify-center sm:justify-start gap-2 rounded-field border border-white/25 hover:bg-white/10 cursor-pointer text-left transition-colors active:scale-95"
            aria-label={activeStaff ? `Profil: ${activeStaff.name}. Buka pengaturan profil` : 'Buka profil pengguna'}
          >
            <UserRound className="w-5 h-5 shrink-0 text-white" aria-hidden />
            <span className="hidden md:block leading-tight max-w-[150px]">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-white/75">Profil</span>
              <span className="block text-[14px] font-bold truncate">
                {activeStaff ? activeStaff.name : 'Pilih Profil'}
              </span>
            </span>
          </button>

          {/* Tombol Tanya Beesha Desktop (Pada Mobile menggunakan FAB Persisten) */}
          <button
            type="button"
            onClick={onOpenAssistant}
            className="hidden sm:flex min-h-[48px] px-3.5 items-center gap-2 rounded-field bg-brand hover:bg-brand-strong text-white dark:text-[#0F172A] text-[15px] font-bold cursor-pointer transition-colors shadow-xs active:scale-95"
          >
            <MessageCircleQuestion className="w-5 h-5" aria-hidden />
            <span>Tanya Beesha</span>
          </button>
        </div>
      </div>
    </header>
  );
};
