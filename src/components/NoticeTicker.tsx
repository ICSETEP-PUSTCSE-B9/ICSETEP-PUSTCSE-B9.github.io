import { Megaphone, Paperclip } from 'lucide-react';
import type { Notice } from '@/lib/types';
import { priorityStyles, parseNoticeAttachment } from '@/lib/utils';

interface Props {
  notices: Notice[];
}

const defaultPlaceholderNotice: Notice = {
  id: 'welcome-notice',
  title: 'ICSETEP RDG B9 Research Portal',
  body: 'Official notices, guidelines, and announcements will appear here when posted by Admin.',
  priority: 'normal',
  is_pinned: false,
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export default function NoticeTicker({ notices }: Props) {
  // Filter out any dummy / test notices and get active notices
  const realActive = notices.filter((n) => n.is_active);

  // Filter pinned notices
  const pinnedActive = realActive.filter((n) => n.is_pinned);

  let baseNotices: Notice[];
  let isPinnedMode = false;

  if (pinnedActive.length > 0) {
    baseNotices = [...pinnedActive];
    isPinnedMode = true;
  } else if (realActive.length > 0) {
    baseNotices = [...realActive];
  } else {
    baseNotices = [defaultPlaceholderNotice];
  }

  // Sort by priority and created date
  baseNotices.sort((a, b) => {
    const pMap: Record<string, number> = { high: 0, normal: 1, low: 2 };
    const pA = pMap[a.priority] ?? 1;
    const pB = pMap[b.priority] ?? 1;
    if (pA !== pB) return pA - pB;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // Multiply moderately to guarantee continuous scrolling marquee coverage without rushing speed
  const repeatCount = Math.max(2, Math.ceil(8 / (baseNotices.length || 1)));
  const items: Notice[] = [];
  for (let i = 0; i < repeatCount; i++) {
    items.push(...baseNotices);
  }

  const handleScrollToNotice = (e: React.MouseEvent, noticeId: string) => {
    e.preventDefault();
    e.stopPropagation();

    const targetEl = document.getElementById(`notice-card-${noticeId}`);
    if (targetEl) {
      targetEl.classList.add('is-visible');
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Temporary highlight pulse effect on target notice card
      targetEl.classList.add('ring-4', 'ring-brand-500', 'scale-[1.02]');
      setTimeout(() => {
        targetEl.classList.remove('ring-4', 'ring-brand-500', 'scale-[1.02]');
      }, 3000);
    } else {
      const boardEl = document.getElementById('notices');
      if (boardEl) boardEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div
      onClick={(e) => {
        if (baseNotices.length > 0) {
          handleScrollToNotice(e, baseNotices[0].id);
        }
      }}
      title="Click notice to jump to Notice Board and download/read attachments"
      className="relative z-40 flex w-full items-stretch border-b border-ink-200 bg-ink-950 text-white overflow-hidden cursor-pointer group/ticker select-none"
    >
      <div className="flex shrink-0 items-center gap-2 bg-brand-600 px-3 py-2 sm:px-4 group-hover/ticker:bg-brand-500 transition-colors">
        <Megaphone className="h-4 w-4 shrink-0 text-white" />
        <span className="text-xs font-bold uppercase tracking-wider text-white">
          {isPinnedMode ? 'Pinned Notice' : 'Notice'}
        </span>
      </div>

      <div className="relative flex-1 overflow-hidden py-2.5">
        <div className="ticker-track flex w-max min-w-full items-center gap-8 whitespace-nowrap pl-4">
          {items.map((n, i) => {
            const ps = priorityStyles[n.priority] ?? priorityStyles.normal;
            const { cleanBody, attachmentUrl, attachmentName } = parseNoticeAttachment(n);

            return (
              <a
                key={`${n.id}-${i}`}
                href={`#notice-card-${n.id}`}
                onClick={(e) => handleScrollToNotice(e, n.id)}
                className="flex items-center gap-2 text-sm transition-opacity hover:opacity-90 group/item cursor-pointer"
              >
                {n.is_pinned && (
                  <span className="rounded-full bg-amber-500/30 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-400/40 uppercase tracking-wide">
                    📌 Pinned
                  </span>
                )}
                <span className={`h-2 w-2 shrink-0 rounded-full ${ps.dot}`} />
                <span className="font-bold text-white group-hover/item:underline">{n.title}</span>
                <span className="text-white/80">— {cleanBody}</span>
                {attachmentUrl && (
                  <span className="flex items-center gap-1 rounded bg-brand-600/80 px-1.5 py-0.5 text-[10px] font-semibold text-white">
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
