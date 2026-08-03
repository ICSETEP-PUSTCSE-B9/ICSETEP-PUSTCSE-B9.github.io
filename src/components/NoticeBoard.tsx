import { Pin, BellOff, Clock } from 'lucide-react';
import type { Notice } from '@/lib/types';
import { priorityStyles, relativeTime, formatDate } from '@/lib/utils';

interface Props {
  notices: Notice[];
}

export default function NoticeBoard({ notices }: Props) {
  const active = notices.filter((n) => n.is_active);

  return (
    <section id="notices" className="scroll-mt-20 bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand-600">
              Notice Board
            </span>
            <h2 className="mt-1 font-display text-3xl font-bold text-ink-900 sm:text-4xl">
              Latest Notices
            </h2>
            <p className="mt-2 max-w-xl text-ink-500">
              Official announcements and updates from the project team.
            </p>
          </div>
          <span className="hidden shrink-0 rounded-full bg-ink-100 px-3 py-1 text-sm font-medium text-ink-600 sm:block">
            {active.length} active
          </span>
        </div>

        {active.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink-200 bg-ink-50/50 py-16 text-center">
            <BellOff className="mx-auto h-8 w-8 text-ink-300" />
            <p className="mt-3 font-medium text-ink-500">No active notices right now.</p>
            <p className="text-sm text-ink-400">Check back soon for updates.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {active.map((n, i) => {
              const ps = priorityStyles[n.priority];
              return (
                <article
                  key={n.id}
                  className="reveal group relative flex flex-col rounded-2xl border border-ink-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md"
                  style={{ transitionDelay: `${i * 50}ms` }}
                >
                  {n.is_pinned && (
                    <span className="absolute right-4 top-4 flex items-center gap-1 text-xs font-semibold text-amber-600">
                      <Pin className="h-3.5 w-3.5" />
                      Pinned
                    </span>
                  )}
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${ps.dot}`} />
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${ps.badge}`}>
                      {ps.label}
                    </span>
                  </div>
                  <h3 className="mt-3 pr-16 font-display text-lg font-bold text-ink-900">
                    {n.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-600">{n.body}</p>
                  <div className="mt-4 flex items-center gap-1.5 text-xs text-ink-400">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{formatDate(n.created_at)}</span>
                    <span className="text-ink-300">·</span>
                    <span>{relativeTime(n.created_at)}</span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
