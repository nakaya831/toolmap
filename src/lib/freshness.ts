import { FRESHNESS_STALE_DAYS, FRESHNESS_WARN_DAYS } from '@/config';

export type FreshnessStatus = 'fresh' | 'warn' | 'stale';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** ビルド日を基準にした経過日数（負にはならない） */
export function daysSince(date: Date, now: Date = new Date()): number {
  return Math.max(0, Math.floor((now.getTime() - date.getTime()) / MS_PER_DAY));
}

export function freshnessStatus(date: Date, now: Date = new Date()): FreshnessStatus {
  const d = daysSince(date, now);
  if (d > FRESHNESS_STALE_DAYS) return 'stale';
  if (d > FRESHNESS_WARN_DAYS) return 'warn';
  return 'fresh';
}

/** 複数の検証日のうち最も古いものを返す（ページ上部の注意判定に使う） */
export function oldest(dates: Date[]): Date | undefined {
  if (dates.length === 0) return undefined;
  return dates.reduce((a, b) => (a < b ? a : b));
}

export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
