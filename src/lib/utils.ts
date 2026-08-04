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

export function detectAttachmentType(filename: string, mimeType?: string): 'pdf' | 'word' | 'excel' | 'image' | 'other' {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  if (['pdf'].includes(ext) || mimeType?.includes('pdf')) return 'pdf';
  if (['doc', 'docx'].includes(ext) || mimeType?.includes('word')) return 'word';
  if (['xls', 'xlsx', 'csv'].includes(ext) || mimeType?.includes('sheet') || mimeType?.includes('excel') || mimeType?.includes('csv')) return 'excel';
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext) || mimeType?.startsWith('image/')) return 'image';
  return 'other';
}

export const attachmentMeta = {
  pdf: {
    label: 'PDF Document',
    badge: 'bg-red-50 text-red-700 ring-red-200',
    iconBg: 'bg-red-100 text-red-600',
  },
  word: {
    label: 'Word Document',
    badge: 'bg-blue-50 text-blue-700 ring-blue-200',
    iconBg: 'bg-blue-100 text-blue-600',
  },
  excel: {
    label: 'Excel Spreadsheet',
    badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    iconBg: 'bg-emerald-100 text-emerald-600',
  },
  image: {
    label: 'Image',
    badge: 'bg-purple-50 text-purple-700 ring-purple-200',
    iconBg: 'bg-purple-100 text-purple-600',
  },
  other: {
    label: 'Attachment',
    badge: 'bg-ink-100 text-ink-700 ring-ink-200',
    iconBg: 'bg-ink-100 text-ink-600',
  },
};

