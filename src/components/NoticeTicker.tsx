import { Megaphone } from 'lucide-react';
import type { Notice } from '@/lib/types';
import { priorityStyles } from '@/lib/utils';

interface Props {
  notices: Notice[];
}

const defaultNotices: Notice[] = [
  {
    id: 'default-1',
    title: 'ICSETEP RDG B9 Research Sub-Project',
    body: 'Smart, Affordable, and Sustainable Agro-Tech Transformation in Bangladesh (ADB & UGC Funded)',
    priority: 'high',
    is_pinned: true,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'default-2',
    title: 'Research & Development Grant Awarded',
    body: 'BDT 2.35 Crore Grant awarded for Explainable AI & Hyperspectral Imaging Agro-Tech Transformation',
    priority: 'normal',
    is_pinned: true,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export default function NoticeTicker({ notices }: Props) {
  const pinnedNotices = notices.filter((n) => n.is_active && n.is_pinned);
  const activeNotices = pinnedNotices.length > 0 ? pinnedNotices : defaultNotices;

  // Multiply 10 times to ensure full width coverage on all screen sizes (1080p, 4K, etc.)
  const items = [
    ...activeNotices,
    ...activeNotices,
    ...activeNotices,
    ...activeNotices,
    ...activeNotices,
    ...activeNotices,
    ...activeNotices,
    ...activeNotices,
    ...activeNotices,
    ...activeNotices,
  ];

  return (
    <div className="relative z-40 flex w-full items-stretch border-b border-ink-200 bg-ink-950 text-white overflow-hidden">
      <div className="flex shrink-0 items-center gap-2 bg-brand-600 px-3 py-2 sm:px-4">
        <Megaphone className="h-4 w-4 shrink-0 text-white" />
        <span className="text-xs font-bold uppercase tracking-wider text-white">Notice</span>
      </div>
      <div className="relative flex-1 overflow-hidden py-2.5">
        <div className="ticker-track flex w-max items-center gap-8 whitespace-nowrap pl-4">
          {items.map((n, i) => {
            const ps = priorityStyles[n.priority] ?? priorityStyles.normal;
            return (
              <span key={`${n.id}-${i}`} className="flex items-center gap-2 text-sm">
                <span className={`h-2 w-2 shrink-0 rounded-full ${ps.dot}`} />
                <span className="font-bold text-white">{n.title}</span>
                <span className="text-white/80">— {n.body}</span>
                <span className="text-white/30 ml-4">•</span>
              </span>
            );
          })}
        </div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-ink-950 to-transparent" />
      </div>
    </div>
  );
}
