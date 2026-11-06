import {
  Home,
  ClipboardList,
  Factory,
  Truck,
  History,
  ShieldCheck,
  AlertTriangle,
  type LucideIcon,
} from 'lucide-react';
import { ScreenType } from '../types';

export interface NavItem {
  id: ScreenType;
  label: string;
  /** Label pendek untuk header layar lebar. */
  shortLabel?: string;
  description: string;
  icon: LucideIcon;
  group: 'kerja' | 'pantau';
  /** Layar lain yang dianggap bagian dari menu ini (untuk penanda aktif). */
  also?: ScreenType[];
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'beranda', label: 'Beranda', description: 'Ringkasan hari ini', icon: Home, group: 'kerja' },
  {
    id: 'daftar_pesanan',
    label: 'Pesanan Mitra',
    description: 'Daftar & catat pesanan baru',
    icon: ClipboardList,
    group: 'kerja',
    also: ['form_pesanan', 'detail_pesanan'],
  },
  { id: 'form_produksi', label: 'Produksi', description: 'Catat hasil produksi', icon: Factory, group: 'kerja' },
  { id: 'form_pengiriman', label: 'Pengiriman', description: 'Catat barang yang dikirim', icon: Truck, group: 'kerja' },
  { id: 'riwayat_aktivitas', label: 'Riwayat', description: 'Semua catatan, terbaru di atas', icon: History, group: 'pantau' },
  {
    id: 'pemeriksaan_data',
    label: 'Pemeriksaan Data',
    shortLabel: 'Pemeriksaan',
    description: 'Cek catatan sebelum dipercaya',
    icon: ShieldCheck,
    group: 'pantau',
  },
  {
    id: 'pusat_peringatan',
    label: 'Peringatan',
    description: 'Pesanan terlambat / dekat tenggat',
    icon: AlertTriangle,
    group: 'pantau',
  },
];

export function isNavActive(item: NavItem, current: ScreenType): boolean {
  return item.id === current || !!item.also?.includes(current);
}

// --- Alamat halaman (hash) agar tombol Kembali browser & refresh berfungsi ---

const SCREEN_TO_PATH: Record<ScreenType, string> = {
  beranda: '',
  daftar_pesanan: 'pesanan',
  form_pesanan: 'pesanan/baru',
  detail_pesanan: 'pesanan/detail',
  form_produksi: 'produksi',
  form_pengiriman: 'pengiriman',
  riwayat_aktivitas: 'riwayat',
  pemeriksaan_data: 'pemeriksaan',
  pusat_peringatan: 'peringatan',
  inspeksi_3d: 'inspeksi-3d',
};

export interface Route {
  screen: ScreenType;
  orderId?: string;
}

export function routeToHash(route: Route): string {
  const base = SCREEN_TO_PATH[route.screen];
  if (route.orderId && ['detail_pesanan', 'form_produksi', 'form_pengiriman', 'inspeksi_3d'].includes(route.screen)) {
    return `#/${base}/${encodeURIComponent(route.orderId)}`;
  }
  return `#/${base}`;
}

export function hashToRoute(hash: string): Route {
  const path = hash.replace(/^#\/?/, '');
  if (path === 'pesanan/baru') return { screen: 'form_pesanan' };
  const entries = Object.entries(SCREEN_TO_PATH).filter(([, p]) => p !== '') as [ScreenType, string][];
  // cocokkan jalur terpanjang dulu (mis. "pesanan/detail" sebelum "pesanan")
  entries.sort((a, b) => b[1].length - a[1].length);
  for (const [screen, p] of entries) {
    if (path === p) return { screen };
    if (path.startsWith(`${p}/`)) return { screen, orderId: decodeURIComponent(path.slice(p.length + 1)) };
  }
  return { screen: 'beranda' };
}
