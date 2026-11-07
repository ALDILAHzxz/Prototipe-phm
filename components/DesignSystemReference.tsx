"use client";

import React, { useState } from 'react';
import {
  X,
  BookOpen,
  ClipboardPlus,
  Factory,
  Truck,
  LayoutDashboard,
  MessageCircleQuestion,
  Box,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  ArrowRight,
  Layers,
  ShieldCheck,
  Smartphone,
  Eye,
  Sun,
  Moon,
} from 'lucide-react';
import { ScreenType } from '../types';

interface DesignSystemReferenceProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (screen: ScreenType) => void;
}

type GuideTab = 'ikhtisar' | 'pesanan' | 'produksi' | 'pengiriman' | 'dashboard' | 'fitur' | 'faq';

export const DesignSystemReference: React.FC<DesignSystemReferenceProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<GuideTab>('ikhtisar');

  if (!isOpen) return null;

  const handleAction = (screen: ScreenType) => {
    onClose();
    if (onNavigate) {
      onNavigate(screen);
    }
  };

  const tabs: { id: GuideTab; label: string; icon: React.ElementType }[] = [
    { id: 'ikhtisar', label: '1. Ikhtisar Sistem', icon: BookOpen },
    { id: 'pesanan', label: '2. Catat Pesanan', icon: ClipboardPlus },
    { id: 'produksi', label: '3. Hasil Produksi', icon: Factory },
    { id: 'pengiriman', label: '4. Pengiriman & SJ', icon: Truck },
    { id: 'dashboard', label: '5. Dashboard & KPI', icon: LayoutDashboard },
    { id: 'fitur', label: '6. AI & 3D Viewer', icon: Sparkles },
    { id: 'faq', label: '7. Tanya Jawab (FAQ)', icon: HelpCircle },
  ];

  const currentIdx = tabs.findIndex((t) => t.id === activeTab);
  const prevTab = currentIdx > 0 ? tabs[currentIdx - 1].id : null;
  const nextTab = currentIdx < tabs.length - 1 ? tabs[currentIdx + 1].id : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Buku Panduan & Tur Sistem BEESHA"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6"
    >
      <div className="bg-surface rounded-2xl border border-line max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in duration-200">
        {/* Modal Header */}
        <div className="px-5 py-4 md:px-7 md:py-5 bg-navy text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center text-white shrink-0 shadow-xs">
              <BookOpen className="w-5 h-5" aria-hidden />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl md:text-2xl font-bold tracking-tight">
                  Buku Panduan &amp; Tur Sistem BEESHA
                </h2>
                <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white">
                  PT Putra Hatim Mandiri
                </span>
              </div>
              <p className="text-xs sm:text-sm text-white/80 mt-0.5">
                Panduan praktis cara pengoperasian dan alur kerja manufaktur (Pemesanan → Produksi → Pengiriman).
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] px-2.5 rounded-field hover:bg-white/15 flex items-center justify-center gap-1.5 text-sm font-semibold text-white cursor-pointer transition-colors"
            aria-label="Tutup buku panduan"
          >
            <X className="w-5 h-5" aria-hidden />
            <span className="hidden sm:inline">Tutup</span>
          </button>
        </div>

        {/* Tab Navigasi Horizontal */}
        <div className="border-b border-line bg-subtle px-3 sm:px-6 py-2 overflow-x-auto shrink-0 flex items-center gap-1.5 scrollbar-thin">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`min-h-[42px] px-3.5 py-1.5 rounded-field text-[14px] font-semibold flex items-center gap-2 whitespace-nowrap cursor-pointer transition-all ${
                  isActive
                    ? 'bg-brand text-white shadow-xs'
                    : 'text-ink-muted hover:text-ink hover:bg-canvas'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-brand'}`} aria-hidden />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Konten Tab Aktif */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 text-ink">
          {/* TAB 1: IKHTISAR SISTEM */}
          {activeTab === 'ikhtisar' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="p-5 rounded-card bg-brand-soft border border-brand/20">
                <h3 className="text-xl font-bold text-ink flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-brand text-white flex items-center justify-center text-sm font-bold">
                    1
                  </span>
                  Selamat Datang di Sistem Operasional BEESHA
                </h3>
                <p className="mt-2 text-base text-ink leading-relaxed">
                  Aplikasi ini dirancang khusus untuk mempermudah pencatatan, pemantauan, dan pelaporan operasional 
                  manufaktur di <strong>PT Putra Hatim Mandiri (PHM Group)</strong>. Alur operasional saling terhubung tanpa perantara rumit:
                </p>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 bg-surface rounded-lg border border-line">
                    <span className="block text-xs font-bold text-brand uppercase">Langkah 1</span>
                    <strong className="block text-sm font-bold text-ink mt-0.5">Pemesanan Mitra</strong>
                    <span className="text-xs text-ink-muted">Input PO resmi &amp; tenggat</span>
                  </div>
                  <div className="p-3 bg-surface rounded-lg border border-line">
                    <span className="block text-xs font-bold text-brand uppercase">Langkah 2</span>
                    <strong className="block text-sm font-bold text-ink mt-0.5">Hasil Produksi</strong>
                    <span className="text-xs text-ink-muted">Pencatatan part OK &amp; reject</span>
                  </div>
                  <div className="p-3 bg-surface rounded-lg border border-line">
                    <span className="block text-xs font-bold text-brand uppercase">Langkah 3</span>
                    <strong className="block text-sm font-bold text-ink mt-0.5">Pengiriman</strong>
                    <span className="text-xs text-ink-muted">Surat Jalan &amp; Verifikasi</span>
                  </div>
                  <div className="p-3 bg-surface rounded-lg border border-line">
                    <span className="block text-xs font-bold text-brand uppercase">Langkah 4</span>
                    <strong className="block text-sm font-bold text-ink mt-0.5">Dashboard Beesha</strong>
                    <span className="text-xs text-ink-muted">Pantau KPI &amp; Asisten AI</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-bold text-ink flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-success" />
                  Prinsip Desain Ramah Pekerja (Gen-X Friendly):
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div className="p-4 rounded-xl bg-subtle border border-line space-y-1">
                    <strong className="text-[15px] text-ink block">🔍 Huruf &amp; Angka Terbaca Jelas</strong>
                    <p className="text-sm text-ink-muted">
                      Ukuran font teks minimal 16px, angka kuantitas tebal (*tabular nums*), dan kontras warna tinggi sesuai standar WCAG 2.1 AA.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-subtle border border-line space-y-1">
                    <strong className="text-[15px] text-ink block">👆 Tombol Besar &amp; Mudah Disentuh</strong>
                    <p className="text-sm text-ink-muted">
                      Target klik minimal 48–56px sehingga mudah digunakan di layar sentuh ponsel, tablet bengkel, maupun mouse kantor.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-subtle border border-line space-y-1">
                    <strong className="text-[15px] text-ink block">💾 Tersimpan Otomatis &amp; Aman</strong>
                    <p className="text-sm text-ink-muted">
                      Semua catatan tersimpan di memori perangkat (*localStorage*) secara langsung saat tombol Simpan ditekan.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-subtle border border-line space-y-1">
                    <strong className="text-[15px] text-ink block">🌓 Dukungan Mode Terang &amp; Gelap</strong>
                    <p className="text-sm text-ink-muted">
                      Dapat beralih antara Mode Siang dan Mode Malam melalui tombol matahari/bulan di sudut kanan atas header.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CATAT PESANAN */}
          {activeTab === 'pesanan' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl bg-brand-soft border border-brand/20">
                <div>
                  <h3 className="text-xl font-bold text-ink flex items-center gap-2">
                    <ClipboardPlus className="w-6 h-6 text-brand" />
                    Alur 1: Mencatat Pesanan Baru dari Mitra (PO)
                  </h3>
                  <p className="text-sm text-ink-muted mt-1">
                    Digunakan setiap kali ada pesanan resmi (Purchase Order) baru yang masuk dari mitra manufaktur.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleAction('form_pesanan')}
                  className="px-4 py-2.5 rounded-field bg-brand hover:bg-brand-strong text-white text-sm font-semibold flex items-center gap-2 cursor-pointer shadow-xs shrink-0"
                >
                  Buka Form Pesanan <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <h4 className="text-base font-bold text-ink">Langkah-langkah pengisian form pesanan:</h4>
                <ol className="space-y-3 text-sm text-ink">
                  <li className="flex items-start gap-3 p-3 rounded-lg bg-surface border border-line">
                    <span className="w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      <strong>Pilih Mitra:</strong> Pilih nama perusahaan mitra pemesan (contoh: PT Astra Honda Motor, PT Yamaha Motor, dll).
                    </div>
                  </li>
                  <li className="flex items-start gap-3 p-3 rounded-lg bg-surface border border-line">
                    <span className="w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      <strong>Masukkan Nomor PO:</strong> Masukkan nomor pesanan sesuai lembar PO resmi mitra (contoh: <code>PO-AHM-2026-004</code>). Sistem otomatis memeriksa agar nomor PO tidak ganda.
                    </div>
                  </li>
                  <li className="flex items-start gap-3 p-3 rounded-lg bg-surface border border-line">
                    <span className="w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      3
                    </span>
                    <div>
                      <strong>Pilih Part &amp; Kuantitas:</strong> Tentukan jenis komponen logam presisi yang dipesan beserta jumlah target part (pcs) dan batas toleransi part jika ada.
                    </div>
                  </li>
                  <li className="flex items-start gap-3 p-3 rounded-lg bg-surface border border-line">
                    <span className="w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      4
                    </span>
                    <div>
                      <strong>Target Tanggal Kirim:</strong> Tentukan tenggat waktu kapan part harus selesai dan dikirim ke mitra.
                    </div>
                  </li>
                  <li className="flex items-start gap-3 p-3 rounded-lg bg-surface border border-line">
                    <span className="w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      5
                    </span>
                    <div>
                      <strong>Klik &quot;Simpan Pesanan&quot;:</strong> Data otomatis muncul di Daftar Pesanan dan antrean lini Produksi.
                    </div>
                  </li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 3: HASIL PRODUKSI */}
          {activeTab === 'produksi' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl bg-brand-soft border border-brand/20">
                <div>
                  <h3 className="text-xl font-bold text-ink flex items-center gap-2">
                    <Factory className="w-6 h-6 text-brand" />
                    Alur 2: Mencatat Hasil Pengerjaan Produksi
                  </h3>
                  <p className="text-sm text-ink-muted mt-1">
                    Digunakan operator lini bubut, stamping, frais, atau perakitan untuk mencatat jumlah part yang selesai dibuat.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleAction('form_produksi')}
                  className="px-4 py-2.5 rounded-field bg-brand hover:bg-brand-strong text-white text-sm font-semibold flex items-center gap-2 cursor-pointer shadow-xs shrink-0"
                >
                  Buka Form Produksi <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <h4 className="text-base font-bold text-ink">Fitur Utama Pencatatan Produksi:</h4>
                <ul className="space-y-2.5 text-sm text-ink">
                  <li className="flex items-start gap-2.5 p-3 rounded-lg bg-surface border border-line">
                    <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
                    <div>
                      <strong>Akumulasi Otomatis:</strong> Setiap pengerjaan bertahap (batch) otomatis dihitung dan dijumlahkan ke progress PO terkait. Anda tidak perlu menjumlahkan manual.
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5 p-3 rounded-lg bg-surface border border-line">
                    <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
                    <div>
                      <strong>Pencatatan Part OK &amp; Cacat (NG):</strong> Masukkan kuantitas barang yang lolos inspeksi (OK), serta part reject/cacat untuk evaluasi efisiensi bengkel.
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5 p-3 rounded-lg bg-surface border border-line">
                    <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
                    <div>
                      <strong>Transisi Status Otomatis:</strong> Ketika total part bagus sudah memenuhi kuantitas PO, status pesanan otomatis berganti menjadi <em>&quot;Siap Kirim&quot;</em>.
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 4: PENGIRIMAN */}
          {activeTab === 'pengiriman' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl bg-brand-soft border border-brand/20">
                <div>
                  <h3 className="text-xl font-bold text-ink flex items-center gap-2">
                    <Truck className="w-6 h-6 text-brand" />
                    Alur 3: Mencatat Pengiriman &amp; Surat Jalan
                  </h3>
                  <p className="text-sm text-ink-muted mt-1">
                    Digunakan staf gudang dan logistik saat part yang selesai siap dimuat ke armada dan dikirim ke mitra.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleAction('form_pengiriman')}
                  className="px-4 py-2.5 rounded-field bg-brand hover:bg-brand-strong text-white text-sm font-semibold flex items-center gap-2 cursor-pointer shadow-xs shrink-0"
                >
                  Buka Form Pengiriman <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <h4 className="text-base font-bold text-ink">Ketentuan Pengiriman Barang:</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-4 rounded-xl bg-subtle border border-line">
                    <strong className="text-sm font-bold block text-ink">1. Pilih Pesanan Siap Kirim</strong>
                    <p className="text-xs text-ink-muted mt-1">
                      Sistem hanya menampilkan nomor PO yang sudah memiliki stok part selesai dari hasil produksi.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-subtle border border-line">
                    <strong className="text-sm font-bold block text-ink">2. Validasi Toleransi Kuantitas</strong>
                    <p className="text-xs text-ink-muted mt-1">
                      Kuantitas kirim tidak boleh melebihi stok yang ada untuk menghindari kesalahan catatan fisik.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-subtle border border-line">
                    <strong className="text-sm font-bold block text-ink">3. Surat Jalan &amp; Verifikasi</strong>
                    <p className="text-xs text-ink-muted mt-1">
                      Dilengkapi nomor surat jalan resmi, nama sopir/armada, dan barcode kode verifikasi pengiriman.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl bg-brand-soft border border-brand/20">
                <div>
                  <h3 className="text-xl font-bold text-ink flex items-center gap-2">
                    <LayoutDashboard className="w-6 h-6 text-brand" />
                    Alur 4: Pemantauan Dashboard Operasional Beesha
                  </h3>
                  <p className="text-sm text-ink-muted mt-1">
                    Pusat komando dan kendali untuk memantau ritme kerja harian, performa target, dan peringatan operasional.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleAction('beranda')}
                  className="px-4 py-2.5 rounded-field bg-brand hover:bg-brand-strong text-white text-sm font-semibold flex items-center gap-2 cursor-pointer shadow-xs shrink-0"
                >
                  Buka Dashboard <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-4 rounded-xl bg-surface border border-line space-y-1">
                  <strong className="text-base font-bold text-brand block">4 Kartu KPI Interaktif</strong>
                  <p className="text-sm text-ink-muted">
                    Menampilkan total <em>Pesanan Aktif</em>, akumulasi <em>Part Dibuat</em>, jumlah <em>Part Terkirim</em>, serta indikator <em>Perlu Tindakan</em>. Setiap kartu dapat diklik langsung untuk menuju detailnya.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-surface border border-line space-y-1">
                  <strong className="text-base font-bold text-warning block">Peringatan Tenggat Waktu</strong>
                  <p className="text-sm text-ink-muted">
                    Sistem mendeteksi otomatis pesanan yang mendekati deadline (&le; 2 hari) atau sudah melewati batas waktu agar dapat diprioritaskan.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-surface border border-line space-y-1">
                  <strong className="text-base font-bold text-navy block">Riwayat Aktivitas Terkini</strong>
                  <p className="text-sm text-ink-muted">
                    Garis waktu kronologis mencatat semua input pesanan, pengerjaan produksi, pengiriman, dan verifikasi oleh petugas.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-surface border border-line space-y-1">
                  <strong className="text-base font-bold text-success block">Filter Periode Waktu</strong>
                  <p className="text-sm text-ink-muted">
                    Bisa memilih rentang ringkasan untuk Hari Ini, 7 Hari Terakhir, atau Bulan Ini dengan kalkulasi otomatis.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: FITUR AI & 3D */}
          {activeTab === 'fitur' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <h3 className="text-xl font-bold text-ink flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-brand" />
                Fitur Cerdas Pendukung (AI &amp; Inspeksi 3D)
              </h3>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-surface border border-line space-y-2">
                  <div className="flex items-center gap-2 text-brand font-bold text-base">
                    <MessageCircleQuestion className="w-5 h-5" />
                    <span>Asisten AI Beesha (Tanya Beesha)</span>
                  </div>
                  <p className="text-sm text-ink-muted leading-relaxed">
                    Klik tombol <strong>&quot;Tanya Beesha&quot;</strong> di pojok kanan atas untuk bertanya langsung tentang status pesanan, stok part, maupun jadwal kirim. Menu <em>Pertanyaan Cepat</em> dapat diciutkan (*minimize*) dengan satu klik agar area percakapan bertambah luas hingga 85%.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-surface border border-line space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-navy font-bold text-base">
                      <Box className="w-5 h-5 text-brand" />
                      <span>Viewer &amp; Inspeksi 3D Part Manufaktur</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAction('inspeksi_3d')}
                      className="px-3 py-1.5 rounded-lg bg-surface border border-line text-xs font-semibold text-brand hover:bg-subtle cursor-pointer"
                    >
                      Buka 3D Viewer
                    </button>
                  </div>
                  <p className="text-sm text-ink-muted leading-relaxed">
                    Melihat bentuk fisik komponen 3D (Gear Pinion, Flange Bushing, Shaft Spindle, dll) langsung di browser. Anda bisa memutar sudut pandang (*rotate*), memperbesar detail part (*zoom*), dan memeriksa toleransi teknisnya.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-surface border border-line space-y-2">
                  <div className="flex items-center gap-2 text-amber-500 font-bold text-base">
                    <Sun className="w-5 h-5" />
                    <span>Mode Tampilan Terang &amp; Malam (Dark Mode)</span>
                  </div>
                  <p className="text-sm text-ink-muted leading-relaxed">
                    Gunakan tombol matahari/bulan di samping profil petugas untuk menyesuaikan kontras layar saat bekerja di siang hari atau saat shift malam di lingkungan pabrik.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: FAQ */}
          {activeTab === 'faq' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <h3 className="text-xl font-bold text-ink flex items-center gap-2">
                <HelpCircle className="w-6 h-6 text-brand" />
                Pertanyaan yang Sering Diajukan (FAQ)
              </h3>

              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-surface border border-line">
                  <strong className="text-base text-ink block font-bold">
                    T: Apakah data saya akan hilang jika saya menutup browser?
                  </strong>
                  <p className="text-sm text-ink-muted mt-1 leading-relaxed">
                    <strong>J: Tidak.</strong> Seluruh data disimpan secara otomatis di penyimpanan internal browser (*localStorage* perangkat). Data akan tetap ada saat Anda membuka kembali website ini.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-surface border border-line">
                  <strong className="text-base text-ink block font-bold">
                    T: Bagaimana jika ada salah ketik jumlah atau nomor pesanan?
                  </strong>
                  <p className="text-sm text-ink-muted mt-1 leading-relaxed">
                    <strong>J:</strong> Anda dapat membuka menu <em>Pemeriksaan Data</em> untuk menandai atau merevisi catatan yang perlu perbaikan, atau menginput catatan penyesuaian produksi/pengiriman berikutnya.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-surface border border-line">
                  <strong className="text-base text-ink block font-bold">
                    T: Bagaimana cara mengembalikan data ke contoh semula?
                  </strong>
                  <p className="text-sm text-ink-muted mt-1 leading-relaxed">
                    <strong>J:</strong> Buka tombol <strong>Menu</strong> di kiri atas, lalu pilih opsi <em>&quot;Kembalikan data contoh&quot;</em> di bagian bawah. Semua data simulasi akan di-reset ke kondisi awal.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer / Stepper Controls */}
        <div className="px-5 py-4 sm:px-7 border-t border-line bg-subtle flex items-center justify-between shrink-0">
          <div>
            {prevTab ? (
              <button
                type="button"
                onClick={() => setActiveTab(prevTab)}
                className="px-3.5 py-2 rounded-field border border-line bg-surface hover:bg-canvas text-sm font-semibold text-ink flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Langkah Sebelumnya</span>
              </button>
            ) : (
              <div />
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm text-ink-muted font-medium">
              Bagian {currentIdx + 1} dari {tabs.length}
            </span>
          </div>

          <div>
            {nextTab ? (
              <button
                type="button"
                onClick={() => setActiveTab(nextTab)}
                className="px-4 py-2 rounded-field bg-brand hover:bg-brand-strong text-white text-sm font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <span>Lanjut</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-field bg-navy hover:bg-navy-strong text-white text-sm font-semibold cursor-pointer transition-colors"
              >
                Selesai Membaca
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
