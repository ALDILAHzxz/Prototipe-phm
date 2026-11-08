import React from 'react';
import { MessageCircleQuestion, Sparkles } from 'lucide-react';

interface BeeshaFloatingFABProps {
  onOpen: () => void;
  isOpen: boolean;
}

/**
 * Persistent Floating Beesha AI Button (FAB) di Mobile (V4.0).
 * Muncul di pojok kanan bawah di seluruh rute aplikasi tanpa menghalangi aksi penting.
 */
export const BeeshaFloatingFAB: React.FC<BeeshaFloatingFABProps> = ({ onOpen, isOpen }) => {
  // Sembunyikan FAB jika drawer chat AI sedang terbuka
  if (isOpen) return null;

  return (
    <div
      className="sm:hidden fixed bottom-6 right-5 z-30"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <button
        type="button"
        onClick={onOpen}
        aria-label="Buka Asisten AI Beesha"
        className="interactive-button min-h-[52px] h-[52px] px-4 rounded-full bg-brand hover:bg-brand-strong text-white shadow-xl shadow-brand/30 border border-white/25 flex items-center gap-2.5 cursor-pointer active:scale-95 transition-all group focus-visible:ring-2 focus-visible:ring-white"
      >
        <span className="relative flex items-center justify-center">
          <MessageCircleQuestion className="w-5 h-5 group-hover:rotate-12 transition-transform" aria-hidden />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-warning animate-ping opacity-75" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-warning" />
        </span>
        <span className="font-bold text-[14px] tracking-tight">Tanya Beesha</span>
      </button>
    </div>
  );
};

