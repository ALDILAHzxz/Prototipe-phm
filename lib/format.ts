// Utilitas format tanggal & angka dalam bahasa Indonesia.

const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/** Tanggal lokal hari ini dalam format YYYY-MM-DD. */
export function todayISODate(now: Date = new Date()): string {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** Waktu lokal saat ini dalam format YYYY-MM-DDTHH:mm (untuk input datetime-local). */
export function nowLocalDateTime(now: Date = new Date()): string {
  return `${todayISODate(now)}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

/** Tambah/kurangi hari dari tanggal YYYY-MM-DD. */
export function addDays(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.slice(0, 10).split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  return todayISODate(dt);
}

/**
 * Parse berbagai format tanggal yang dipakai di data:
 * "YYYY-MM-DD", "YYYY-MM-DD HH:mm", "YYYY-MM-DDTHH:mm", atau ISO penuh.
 */
export function parseDateLike(value: string | undefined | null): Date | null {
  if (!value) return null;
  const v = value.trim();
  const m = v.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?$/);
  if (m) {
    const [, y, mo, d, h, mi] = m;
    return new Date(Number(y), Number(mo) - 1, Number(d), h ? Number(h) : 0, mi ? Number(mi) : 0);
  }
  const dt = new Date(v);
  return isNaN(dt.getTime()) ? null : dt;
}

/** "12 Nov 2026" */
export function formatDate(value: string | undefined | null): string {
  const d = parseDateLike(value);
  if (!d) return '-';
  return `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
}

/** "12 Nov 2026, 14:30" — jam hanya ditampilkan jika data memilikinya. */
export function formatDateTime(value: string | undefined | null): string {
  if (!value) return '-';
  const d = parseDateLike(value);
  if (!d) return '-';
  const hasTime = /[ T]\d{2}:\d{2}/.test(value);
  const base = `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
  return hasTime ? `${base}, ${pad(d.getHours())}:${pad(d.getMinutes())}` : base;
}

/** Selisih hari kalender antara dua tanggal (b - a). */
export function diffCalendarDays(a: string, b: string): number {
  const da = parseDateLike(a.slice(0, 10));
  const db = parseDateLike(b.slice(0, 10));
  if (!da || !db) return 0;
  return Math.round((db.getTime() - da.getTime()) / 86_400_000);
}

export function formatQty(n: number, unit = 'pcs'): string {
  return `${(Number(n) || 0).toLocaleString('id-ID')} ${unit}`;
}

/** Nilai yang bisa diurutkan dari string tanggal apa pun (ms). */
export function sortableTime(value: string | undefined | null): number {
  return parseDateLike(value)?.getTime() ?? 0;
}
