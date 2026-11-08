import React, { useState, useEffect } from 'react';
import {
  UserRound,
  Shield,
  KeyRound,
  Fingerprint,
  LogOut,
  CheckCircle2,
  Mail,
  Phone,
  MapPin,
  Building2,
  Clock,
  Sparkles,
  Info,
  SunMoon,
} from 'lucide-react';
import { Staff } from '../types';
import { Dialog } from './ui/Dialog';
import { Button } from './ui/Button';

interface UserProfileModalProps {
  open: boolean;
  onClose: () => void;
  activeStaff: Staff | null;
  allStaff: Staff[];
  onSelectStaff: (s: Staff | null) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  open,
  onClose,
  activeStaff,
  allStaff,
  onSelectStaff,
}) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [activeTab, setActiveTab] = useState<'profil' | 'petugas' | 'keamanan'>('profil');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [securityMessage, setSecurityMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const isDark =
      document.documentElement.classList.contains('dark') ||
      localStorage.getItem('beesha_theme') === 'dark';
    setTheme(isDark ? 'dark' : 'light');
  }, [open]);

  const toggleTheme = () => {
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
  };

  if (!open) return null;

  const initials = activeStaff
    ? activeStaff.name
        .split(' ')
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'PHM';

  const employeeCode = activeStaff ? `NIK-PHM-${activeStaff.staff_id.replace('STF-', '2026-')}` : 'NIK-BELUM-DIPILIH';
  const departmentName = activeStaff?.role === 'admin'
    ? 'Departemen Administrasi & Pesanan Mitra'
    : activeStaff?.role === 'operator'
    ? 'Divisi Manufaktur & Perakitan Komponen'
    : activeStaff?.role === 'pengiriman'
    ? 'Divisi Logistik, Gudang & Pengiriman'
    : 'Pengawasan Mutu & Supervisi Lapangan';

  const workShift = activeStaff?.role === 'operator'
    ? 'Shift 1 — Lini Produksi (07:00 – 15:30 WIB)'
    : 'Shift Normal — Kantor Operasional (08:00 – 17:00 WIB)';

  const email = activeStaff
    ? `${activeStaff.name.toLowerCase().replace(/\s+/g, '.')}@phmgroup.co.id`
    : 'operasional@phmgroup.co.id';

  const phone = activeStaff ? `+62 812-7000-${activeStaff.staff_id.slice(-2)}99` : '+62 21-8983-0000';

  const handleSecurityAction = (feature: string) => {
    setSecurityMessage(
      `Fitur keamanan "${feature}" memerlukan integrasi autentikasi SSO / WebAuthn korporat PHM Group. Pada prototipe ini, pengaturan disajikan sebagai tinjauan rancangan UI.`
    );
  };

  const handleLogout = () => {
    onSelectStaff(null);
    setShowLogoutConfirm(false);
    onClose();
  };

  return (
    <>
      <Dialog
        open={open && !showLogoutConfirm}
        title="Profil Pengguna & Akun Operasional"
        description="Informasi identitas petugas kerja, preferensi aplikasi, dan simulasi keamanan akun."
        onClose={onClose}
        size="lg"
      >
        <div className="space-y-6">
          {/* Navigasi Tab Profil */}
          <div className="flex border-b border-line gap-2 pb-1">
            {[
              { id: 'profil' as const, label: 'Data Diri & Kontak' },
              { id: 'petugas' as const, label: 'Ganti Petugas (Demo)' },
              { id: 'keamanan' as const, label: 'Keamanan Akun' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setSecurityMessage(null);
                }}
                className={`min-h-[44px] px-4 py-2 rounded-t-lg text-[14px] sm:text-[15px] font-semibold border-b-2 transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-brand text-brand dark:text-[#8CCBFF] font-bold bg-brand-soft/50'
                    : 'border-transparent text-ink-muted hover:text-ink hover:bg-subtle'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: DATA DIRI & KONTAK */}
          {activeTab === 'profil' && (
            <div className="space-y-5">
              {/* Card Ringkasan Identitas Utama */}
              <div className="p-4 sm:p-5 rounded-card bg-subtle border border-line flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-brand text-white flex items-center justify-center font-bold text-2xl shadow-md shrink-0">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl font-bold text-ink truncate">
                      {activeStaff ? activeStaff.name : 'Belum Memilih Petugas'}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-success-soft text-success border border-success/30">
                      Sesi Lokal Aktif
                    </span>
                  </div>
                  <p className="text-[14px] font-semibold text-navy dark:text-[#8CCBFF] mt-0.5">
                    {activeStaff ? activeStaff.role_label : 'Silakan pilih petugas operasional'}
                  </p>
                  <p className="text-xs text-ink-muted mt-1 font-mono">{employeeCode}</p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setActiveTab('petugas')}
                  className="shrink-0"
                >
                  Ganti Petugas
                </Button>
              </div>

              {/* Detail Identitas & Jadwal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[14px]">
                <div className="p-3.5 rounded-xl bg-surface border border-line flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-brand dark:text-[#8CCBFF] shrink-0 mt-0.5" aria-hidden />
                  <div>
                    <span className="block text-xs font-bold uppercase tracking-wider text-ink-muted">Departemen</span>
                    <span className="block font-semibold text-ink mt-0.5">{departmentName}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-surface border border-line flex items-start gap-3">
                  <Clock className="w-5 h-5 text-brand dark:text-[#8CCBFF] shrink-0 mt-0.5" aria-hidden />
                  <div>
                    <span className="block text-xs font-bold uppercase tracking-wider text-ink-muted">Jadwal Shift</span>
                    <span className="block font-semibold text-ink mt-0.5">{workShift}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-surface border border-line flex items-start gap-3">
                  <Mail className="w-5 h-5 text-brand dark:text-[#8CCBFF] shrink-0 mt-0.5" aria-hidden />
                  <div>
                    <span className="block text-xs font-bold uppercase tracking-wider text-ink-muted">Email Perusahaan</span>
                    <span className="block font-semibold text-ink mt-0.5 break-all">{email}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-surface border border-line flex items-start gap-3">
                  <Phone className="w-5 h-5 text-brand dark:text-[#8CCBFF] shrink-0 mt-0.5" aria-hidden />
                  <div>
                    <span className="block text-xs font-bold uppercase tracking-wider text-ink-muted">Kontak Telepon</span>
                    <span className="block font-semibold text-ink mt-0.5">{phone}</span>
                  </div>
                </div>

                <div className="sm:col-span-2 p-3.5 rounded-xl bg-surface border border-line flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-brand dark:text-[#8CCBFF] shrink-0 mt-0.5" aria-hidden />
                  <div>
                    <span className="block text-xs font-bold uppercase tracking-wider text-ink-muted">Lokasi Penugasan</span>
                    <span className="block font-semibold text-ink mt-0.5">
                      PT Putra Hatim Mandiri — Plant Cikarang, Kawasan Industri Jababeka, Jawa Barat
                    </span>
                  </div>
                </div>
              </div>

              {/* Preferensi Tampilan Cepat */}
              <div className="p-4 rounded-xl bg-subtle border border-line flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <SunMoon className="w-5 h-5 text-brand dark:text-[#8CCBFF]" aria-hidden />
                  <div>
                    <span className="block text-sm font-bold text-ink">Mode Tampilan Aplikasi</span>
                    <span className="block text-xs text-ink-muted">
                      Saat ini: {theme === 'dark' ? 'Mode Gelap (Malam)' : 'Mode Terang (Siang)'}
                    </span>
                  </div>
                </div>
                <Button variant="secondary" size="sm" onClick={toggleTheme}>
                  Ganti ke {theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
                </Button>
              </div>
            </div>
          )}

          {/* TAB 2: GANTI PETUGAS OPERASIONAL */}
          {activeTab === 'petugas' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-brand-soft border border-brand/30 text-xs sm:text-sm text-ink-muted flex items-start gap-2.5">
                <Info className="w-5 h-5 text-brand dark:text-[#8CCBFF] shrink-0 mt-0.5" aria-hidden />
                <span>
                  Memilih petugas akan menetapkan nama Anda pada setiap formulir pesanan, laporan produksi, dan surat jalan
                  pengiriman yang dicatat di perangkat ini. Data lama tetap aman dan tidak berubah.
                </span>
              </div>

              <ul className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {allStaff.map((s) => {
                  const selected = activeStaff?.staff_id === s.staff_id;
                  return (
                    <li key={s.staff_id}>
                      <button
                        type="button"
                        onClick={() => {
                          onSelectStaff(s);
                          setActiveTab('profil');
                        }}
                        className={`w-full min-h-[56px] px-4 py-3 rounded-field border-2 flex items-center justify-between gap-3 text-left cursor-pointer transition-all ${
                          selected
                            ? 'border-brand bg-brand-soft shadow-xs'
                            : 'border-line bg-surface hover:bg-subtle hover:border-brand/40'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${
                              selected ? 'bg-brand text-white' : 'bg-subtle text-ink-muted border border-line'
                            }`}
                          >
                            {s.name
                              .split(' ')
                              .map((w) => w[0])
                              .slice(0, 2)
                              .join('')}
                          </span>
                          <div className="min-w-0">
                            <span className="block text-[15px] font-bold text-ink truncate">{s.name}</span>
                            <span className="block text-xs text-ink-muted truncate">{s.role_label}</span>
                          </div>
                        </div>
                        {selected ? (
                          <span className="flex items-center gap-1.5 text-xs font-bold text-brand dark:text-[#8CCBFF] shrink-0">
                            <CheckCircle2 className="w-5 h-5" aria-hidden /> Aktif
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-ink-muted group-hover:text-ink shrink-0">
                            Pilih
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* TAB 3: KEAMANAN AKUN */}
          {activeTab === 'keamanan' && (
            <div className="space-y-4">
              {/* Pengumuman Batasan Otentikasi Jujur */}
              <div className="p-4 rounded-xl bg-subtle border border-line space-y-2">
                <div className="flex items-center gap-2 text-warning font-bold text-sm">
                  <Shield className="w-5 h-5" aria-hidden />
                  <span>Fitur Keamanan Akun Memerlukan Integrasi Autentikasi</span>
                </div>
                <p className="text-xs sm:text-[13px] text-ink-muted leading-relaxed">
                  Sistem autentikasi produksi memerlukan server SSO / LDAP korporat PHM Group dan protokol WebAuthn /
                  FIDO2 untuk pemulihan dengan biometrik perangkat keras. Pada prototipe ini, alur keamanan disajikan
                  secara visual tanpa kredensial aktif atau biometrik palsu.
                </p>
              </div>

              {securityMessage && (
                <div className="p-3.5 rounded-xl bg-brand-soft border border-brand/40 text-xs sm:text-[13px] text-ink flex items-start gap-2.5">
                  <Sparkles className="w-5 h-5 text-brand dark:text-[#8CCBFF] shrink-0 mt-0.5" aria-hidden />
                  <span>{securityMessage}</span>
                </div>
              )}

              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => handleSecurityAction('Ubah Kata Sandi')}
                  className="w-full min-h-[54px] p-3.5 rounded-field border border-line bg-surface hover:bg-subtle flex items-center justify-between text-left cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <KeyRound className="w-5 h-5 text-brand dark:text-[#8CCBFF]" aria-hidden />
                    <div>
                      <span className="block text-[15px] font-bold text-ink">Ubah Kata Sandi</span>
                      <span className="block text-xs text-ink-muted">Perbarui kata sandi akun operasional Anda</span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-brand dark:text-[#8CCBFF]">Tinjau Alur</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSecurityAction('Pemulihan Biometrik & Passkey')}
                  className="w-full min-h-[54px] p-3.5 rounded-field border border-line bg-surface hover:bg-subtle flex items-center justify-between text-left cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Fingerprint className="w-5 h-5 text-brand dark:text-[#8CCBFF]" aria-hidden />
                    <div>
                      <span className="block text-[15px] font-bold text-ink">Lupa Kata Sandi (Passkey / Biometrik)</span>
                      <span className="block text-xs text-ink-muted">Pemulihan akun via WebAuthn sidik jari / PIN perangkat</span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-brand dark:text-[#8CCBFF]">Tinjau Alur</span>
                </button>
              </div>
            </div>
          )}

          {/* Footer Aksi Modal */}
          <div className="pt-4 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-3">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setShowLogoutConfirm(true)}
              className="text-danger hover:text-danger w-full sm:w-auto"
              icon={<LogOut className="w-4 h-4 text-danger" />}
            >
              Akhiri Sesi Demo
            </Button>
            <Button size="md" onClick={onClose} className="w-full sm:w-auto">
              Tutup Profil
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Dialog Konfirmasi Keluar / Akhiri Sesi Demo */}
      <Dialog
        open={showLogoutConfirm}
        title="Akhiri Sesi Petugas Saat Ini?"
        description="Identitas petugas aktif akan direset. Seluruh catatan pesanan, produksi, dan pengiriman yang telah dibuat tetap tersimpan dengan aman di perangkat ini."
        onClose={() => setShowLogoutConfirm(false)}
        footer={
          <>
            <Button variant="secondary" size="lg" onClick={() => setShowLogoutConfirm(false)}>
              Batal
            </Button>
            <Button variant="danger" size="lg" onClick={handleLogout}>
              Ya, Akhiri Sesi
            </Button>
          </>
        }
      />
    </>
  );
};
