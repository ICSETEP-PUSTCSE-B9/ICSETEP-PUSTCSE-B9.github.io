import { Pin, BellOff, Clock, FileText, FileSpreadsheet, Image as ImageIcon, File, Download, ExternalLink } from 'lucide-react';
import type { Notice } from '@/lib/types';
import { priorityStyles, relativeTime, formatDate, attachmentMeta, parseNoticeAttachment, handleDownload } from '@/lib/utils';

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
              Latest Notices & Documents
            </h2>
            <p className="mt-2 max-w-xl text-ink-500">
              Official announcements, research updates, notices, and downloadable documents.
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
          <div className="grid gap-6 md:grid-cols-2">
            {active.map((n, i) => {
              const ps = priorityStyles[n.priority] ?? priorityStyles.normal;
              const { cleanBody, attachmentUrl, attachmentName, attachmentType } = parseNoticeAttachment(n);
              const hasAttachment = Boolean(attachmentUrl);
              const meta = attachmentMeta[attachmentType] || attachmentMeta.other;

              let FileIcon = File;
              if (attachmentType === 'pdf') FileIcon = FileText;
              else if (attachmentType === 'word') FileIcon = FileText;
              else if (attachmentType === 'excel') FileIcon = FileSpreadsheet;
              else if (attachmentType === 'image') FileIcon = ImageIcon;

              return (
                <article
                  key={n.id}
                  id={`notice-card-${n.id}`}
                  className="reveal group relative flex flex-col rounded-2xl border border-ink-200 bg-white p-5 sm:p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md"
                  style={{ transitionDelay: `${i * 50}ms` }}
                >
                  {n.is_pinned && (
                    <span className="absolute right-4 top-4 sm:right-5 sm:top-5 flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-amber-600 bg-amber-50 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full ring-1 ring-inset ring-amber-200">
                      <Pin className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      Pinned
                    </span>
                  )}

                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${ps.dot}`} />
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] sm:text-xs font-semibold ring-1 ring-inset ${ps.badge}`}>
                      {ps.label}
                    </span>
                  </div>

                  <h3 className="mt-3 pr-16 sm:pr-20 font-display text-base sm:text-lg font-bold text-ink-900">
                    {n.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-600 whitespace-pre-line break-words max-w-full overflow-hidden">{cleanBody}</p>

                  {/* Attachment Section */}
                  {hasAttachment && attachmentUrl && (
                    <div className="mt-4">
                      {attachmentType === 'image' ? (
                        <div className="overflow-hidden rounded-xl border border-ink-200 bg-ink-50">
                          <a
                            href={attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group/img relative block overflow-hidden"
                          >
                            <img
                              src={attachmentUrl}
                              alt={attachmentName || n.title}
                              className="max-h-64 w-full object-cover transition-transform duration-300 group-hover/img:scale-105"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-ink-950/40 opacity-0 transition-opacity group-hover/img:opacity-100">
                              <span className="flex items-center gap-1.5 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-ink-900 shadow-md backdrop-blur-sm">
                                <ExternalLink className="h-3.5 w-3.5" /> View Full Image
                              </span>
                            </div>
                          </a>
                          {attachmentName && (
                            <div className="flex items-center justify-between border-t border-ink-100 bg-white px-3 py-2 text-xs text-ink-600">
                              <span className="truncate font-medium max-w-[200px] sm:max-w-[280px]">{attachmentName}</span>
                              <button
                                type="button"
                                onClick={() => handleDownload(attachmentUrl, attachmentName)}
                                className="flex items-center gap-1 font-semibold text-brand-600 hover:text-brand-700 cursor-pointer"
                              >
                                <Download className="h-3.5 w-3.5" /> Download
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-between rounded-xl border border-ink-200 bg-ink-50/70 p-3.5 transition-colors hover:bg-ink-100/80">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${meta.iconBg}`}>
                              <FileIcon className="h-5 w-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-ink-900">
                                {attachmentName || 'Attached File'}
                              </p>
                              <span className={`inline-block mt-0.5 rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${meta.badge}`}>
                                {meta.label}
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDownload(attachmentUrl, attachmentName)}
                            className="ml-3 flex shrink-0 items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-ink-700 shadow-sm ring-1 ring-inset ring-ink-200 hover:bg-brand-50 hover:text-brand-700 hover:ring-brand-300 transition-all cursor-pointer"
                          >
                            <Download className="h-3.5 w-3.5" />
                            <span>Download</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-4 flex items-center gap-1.5 text-xs text-ink-400 border-t border-ink-100 pt-3">
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
