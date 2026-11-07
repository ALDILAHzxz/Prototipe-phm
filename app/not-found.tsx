import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-canvas text-ink text-center">
      <div className="max-w-md w-full p-8 rounded-card bg-surface border border-line shadow-card space-y-4">
        <span className="w-12 h-12 rounded-xl bg-brand/10 text-brand flex items-center justify-center font-bold text-xl mx-auto">
          404
        </span>
        <h1 className="text-2xl font-bold">Halaman Tidak Ditemukan</h1>
        <p className="text-sm text-ink-muted">
          Halaman yang Anda tuju tidak tersedia atau telah dipindahkan.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center min-h-[46px] px-6 rounded-field bg-brand hover:bg-brand-strong text-white font-semibold text-sm transition-colors"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}

