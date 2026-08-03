import type { Priority } from './types';

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function getAssetUrl(path: string): string {
  if (!path) return '';
  let cleanPath = path.trim();
  if (cleanPath.startsWith('./')) cleanPath = cleanPath.slice(2);
  if (cleanPath.startsWith('/')) cleanPath = cleanPath.slice(1);
  const baseUrl = import.meta.env.BASE_URL || '/';
  const prefix = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return `${prefix}${cleanPath}`;
}

export function relativeTime(iso: string): string {
  const d = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.round((now - d) / 1000);
  const units: [number, string][] = [
    [60, 'second'],
    [60, 'minute'],
    [24, 'hour'],
    [7, 'day'],
    [4.345, 'week'],
    [12, 'month'],
    [Number.POSITIVE_INFINITY, 'year'],
  ];
  let value = diff;
  let unit = 'second';
  for (const [span, name] of units) {
    if (Math.abs(value) < span) {
      unit = name;
      break;
    }
    value = Math.round(value / span);
    unit = name;
  }
  if (value === 0) return 'just now';
  const plural = Math.abs(value) === 1 ? '' : 's';
  return `${value} ${unit}${plural} ago`;
}

export const priorityStyles: Record<Priority, { label: string; badge: string; dot: string }> = {
  high: {
    label: 'High Priority',
    badge: 'bg-red-50 text-red-700 ring-red-200',
    dot: 'bg-red-500',
  },
  normal: {
    label: 'Notice',
    badge: 'bg-brand-50 text-brand-700 ring-brand-200',
    dot: 'bg-brand-500',
  },
  low: {
    label: 'Info',
    badge: 'bg-ink-100 text-ink-600 ring-ink-200',
    dot: 'bg-ink-400',
  },
};

export const statusColorMap: Record<string, { dot: string; text: string; bg: string; ring: string }> = {
  amber: { dot: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50', ring: 'ring-amber-200' },
  green: { dot: 'bg-brand-500', text: 'text-brand-700', bg: 'bg-brand-50', ring: 'ring-brand-200' },
  blue: { dot: 'bg-blue-500', text: 'text-blue-700', bg: 'bg-blue-50', ring: 'ring-blue-200' },
  red: { dot: 'bg-red-500', text: 'text-red-700', bg: 'bg-red-50', ring: 'ring-red-200' },
  slate: { dot: 'bg-ink-500', text: 'text-ink-700', bg: 'bg-ink-100', ring: 'ring-ink-200' },
};

export function getStatusColor(key: string) {
  return statusColorMap[key] ?? statusColorMap.slate;
}
