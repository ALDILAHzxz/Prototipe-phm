"use client";

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('beesha_theme');
    const isDark =
      saved === 'dark' ||
      (!saved && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    if (isDark) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, []);

  const toggleTheme = () => {
    setIsAnimating(true);
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);

    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('beesha_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('beesha_theme', 'light');
    }

    setTimeout(() => {
      setIsAnimating(false);
    }, 600);
  };

  const isDark = mounted ? theme === 'dark' : false;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Ganti ke mode terang (matahari)' : 'Ganti ke mode malam (bulan)'}
      title={isDark ? 'Mode Malam aktif — Klik untuk beralih ke Mode Terang' : 'Mode Terang aktif — Klik untuk beralih ke Mode Malam'}
      className={`relative min-h-[48px] min-w-[48px] px-2.5 sm:px-3 flex items-center justify-center gap-2 rounded-field border border-white/25 hover:bg-white/10 dark:hover:bg-white/10 text-white cursor-pointer transition-all duration-200 active:scale-90 group focus-visible:outline-2 focus-visible:outline-white ${className}`}
    >
      {/* Container ikon dengan transisi rotasi dan pergeseran matahari / bulan */}
      <div className="relative w-6 h-6 flex items-center justify-center">
        {/* Ikon Matahari (Sun) */}
        <span
          className={`absolute inset-0 flex items-center justify-center transition-all duration-500 transform ${
            isDark
              ? 'rotate-90 scale-0 opacity-0 -translate-y-2'
              : 'rotate-0 scale-100 opacity-100 translate-y-0 text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]'
          } ${isAnimating && !isDark ? 'animate-spin' : ''}`}
        >
          <Sun className="w-5 h-5 fill-amber-300/30 stroke-[2.2]" aria-hidden />
        </span>

        {/* Ikon Bulan (Moon) */}
        <span
          className={`absolute inset-0 flex items-center justify-center transition-all duration-500 transform ${
            isDark
              ? 'rotate-0 scale-100 opacity-100 translate-y-0 text-sky-200 drop-shadow-[0_0_8px_rgba(186,230,253,0.6)]'
              : '-rotate-90 scale-0 opacity-0 translate-y-2'
          } ${isAnimating && isDark ? 'animate-pulse' : ''}`}
        >
          <Moon className="w-5 h-5 fill-sky-200/30 stroke-[2.2]" aria-hidden />
        </span>
      </div>

      {/* Label teks responsif di layar medium ke atas */}
      <span className="hidden xl:inline-block text-[13px] font-semibold text-white/90 whitespace-nowrap">
        {isDark ? 'Mode Malam' : 'Mode Terang'}
      </span>
    </button>
  );
};

