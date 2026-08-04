import { Megaphone, Paperclip } from 'lucide-react';
import type { Notice } from '@/lib/types';
import { priorityStyles, parseNoticeAttachment } from '@/lib/utils';

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
    priority: 'high',
    is_pinned: true,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'default-3',
    title: 'Department of CSE, PUST Research Lab',
    body: 'State-of-the-art optical hardware setup & machine learning model development at Pabna University of Science & Technology',
    priority: 'normal',
    is_pinned: true,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export default function NoticeTicker({ notices }: Props) {
  // Filter out any dummy / test notices and get active notices
  const realActive = notices.filter(
    (n) => n.is_active && !n.title.toLowerCase().includes('dummy') && !n.body.toLowerCase().includes('demo')
  );

  const baseNotices = realActive.length > 0 ? [...realActive] : defaultNotices;

  // Sort: Pinned notices first, then High Priority notices, then latest created
  baseNotices.sort((a, b) => {
    if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
    const pMap: Record<string, number> = { high: 0, normal: 1, low: 2 };
    const pA = pMap[a.priority] ?? 1;
    const pB = pMap[b.priority] ?? 1;
    if (pA !== pB) return pA - pB;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // Multiply 16 times to guarantee 100% full screen width coverage on all monitor sizes (1080p, 1440p, 4K)
  const items = [
    ...baseNotices, ...baseNotices, ...baseNotices, ...baseNotices,
    ...baseNotices, ...baseNotices, ...baseNotices, ...baseNotices,
    ...baseNotices, ...baseNotices, ...baseNotices, ...baseNotices,
    ...baseNotices, ...baseNotices, ...baseNotices, ...baseNotices,
  ];

  const handleScrollToNotices = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById('notices');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.hash = '#notices';
    }
  };

  return (
    <div
      onClick={handleScrollToNotices}
      title="Click to view all notices on Notice Board"
      className="relative z-40 flex w-full items-stretch border-b border-ink-200 bg-ink-950 text-white overflow-hidden cursor-pointer group/ticker select-none"
    >
      <div className="flex shrink-0 items-center gap-2 bg-brand-600 px-3 py-2 sm:px-4 group-hover/ticker:bg-brand-500 transition-colors">
        <Megaphone className="h-4 w-4 shrink-0 text-white" />
        <span className="text-xs font-bold uppercase tracking-wider text-white">Notice ({baseNotices.length})</span>
      </div>

      <div className="relative flex-1 overflow-hidden py-2.5">
        <div className="ticker-track flex w-max min-w-full items-center gap-8 whitespace-nowrap pl-4">
          {items.map((n, i) => {
            const ps = priorityStyles[n.priority] ?? priorityStyles.normal;
            const { cleanBody, attachmentUrl, attachmentName } = parseNoticeAttachment(n);

            return (
              <a
                key={`${n.id}-${i}`}
                href="#notices"
                onClick={handleScrollToNotices}
                className="flex items-center gap-2 text-sm transition-opacity hover:opacity-90 group/item"
              >
                <span className={`h-2 w-2 shrink-0 rounded-full ${ps.dot}`} />
                <span className="font-bold text-white group-hover/item:underline">{n.title}</span>
                <span className="text-white/80">— {cleanBody}</span>
                {attachmentUrl && (
                  <span className="flex items-center gap-1 rounded bg-brand-600/60 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                    <Paperclip className="h-3 w-3" />
                    {attachmentName || 'Attachment'}
                  </span>
                )}
                <span className="text-white/30 ml-4">•</span>
              </a>
            );
          })}
        </div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-ink-950 to-transparent" />
      </div>

      <div className="hidden sm:flex shrink-0 items-center gap-1 bg-ink-900/80 px-3 py-2 text-xs font-semibold text-brand-300 group-hover/ticker:text-white transition-colors border-l border-ink-800">
        <span>View Board ↓</span>
      </div>
    </div>
  );
}
