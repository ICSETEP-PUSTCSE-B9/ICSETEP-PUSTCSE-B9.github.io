import { History, Dot } from 'lucide-react';
import type { ProjectUpdate } from '@/lib/types';
import { formatDate } from '@/lib/utils';

interface Props {
  updates: ProjectUpdate[];
}

export default function UpdatesTimeline({ updates }: Props) {
  return (
    <section id="updates" className="scroll-mt-20 bg-ink-50/60 py-16 sm:py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-600">
            Project Updates
          </span>
          <h2 className="mt-1 font-display text-3xl font-bold text-ink-900 sm:text-4xl">
            Progress Timeline
          </h2>
          <p className="mt-2 max-w-xl text-ink-500">
            A running record of milestones and developments across the project lifecycle.
          </p>
        </div>

        {updates.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink-200 bg-white py-16 text-center">
            <History className="mx-auto h-8 w-8 text-ink-300" />
            <p className="mt-3 font-medium text-ink-500">No updates posted yet.</p>
          </div>
        ) : (
          <div className="relative">
            {/* vertical line */}
            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-ink-200 sm:left-[9px]" />
            <ul className="space-y-8">
              {updates.map((u, i) => (
                <li
                  key={u.id}
                  className="reveal relative pl-8 sm:pl-12"
                  style={{ transitionDelay: `${i * 60}ms` }}
                >
                  <span className="absolute left-0 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 ring-4 ring-ink-50 sm:h-5 sm:w-5">
                    <Dot className="h-4 w-4 text-white" />
                  </span>
                  <div className="rounded-2xl border border-ink-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
                    <span className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                      {formatDate(u.created_at)}
                    </span>
                    <h3 className="mt-1.5 font-display text-lg font-bold text-ink-900">
                      {u.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-600">{u.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
