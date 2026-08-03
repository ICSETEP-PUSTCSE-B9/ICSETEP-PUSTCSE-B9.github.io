import { useState } from 'react';
import { FileText, ExternalLink, Copy, Check, Sparkles, Award, BookOpen, Inbox } from 'lucide-react';

export interface Publication {
  id: string;
  title: string;
  authors: string;
  venue: string;
  year: string;
  type: 'journal' | 'conference' | 'patent';
  badge: string;
  doi?: string;
  abstract: string;
  bibtex: string;
}

// Currently empty - items will be added as publications are finalized
const publications: Publication[] = [];

export default function Publications() {
  const [filter, setFilter] = useState<'all' | 'journal' | 'conference' | 'patent'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = filter === 'all' ? publications : publications.filter((p) => p.type === filter);

  const copyBibtex = (p: Publication) => {
    navigator.clipboard.writeText(p.bibtex);
    setCopiedId(p.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <section id="publications" className="scroll-mt-20 bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 ring-1 ring-inset ring-brand-200">
            <Sparkles className="h-3.5 w-3.5" />
            Research Dissemination & IP
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold text-ink-900 sm:text-4xl">
            Publications, Patents & Preprints
          </h2>
          <p className="mt-2 text-base text-ink-600">
            Research papers, Q1 journal articles, and patent filings under ICSETEP (RDG B9) will be showcased here.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {(
            [
              { key: 'all', label: 'All Research Outputs' },
              { key: 'journal', label: 'Q1 Journal Articles' },
              { key: 'conference', label: 'Conferences' },
              { key: 'patent', label: 'Patents & IP' },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`rounded-full px-4 py-2 text-xs font-bold transition-colors ${
                filter === t.key
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-ink-100 text-ink-700 hover:bg-ink-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* List of Publications or Empty State */}
        {filtered.length > 0 ? (
          <div className="mt-10 space-y-6">
            {filtered.map((pub) => (
              <div
                key={pub.id}
                className="group rounded-2xl border border-ink-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-brand-300 hover:shadow-md"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-bold text-brand-700 ring-1 ring-inset ring-brand-200">
                        {pub.type === 'journal' ? <BookOpen className="h-3 w-3" /> : <Award className="h-3 w-3" />}
                        {pub.badge}
                      </span>
                      <span className="text-xs font-medium text-ink-400">• {pub.year}</span>
                    </div>

                    <h3 className="mt-3 font-display text-lg font-bold text-ink-900 group-hover:text-brand-600 transition-colors">
                      {pub.title}
                    </h3>

                    <p className="mt-1 text-sm font-semibold text-ink-700">{pub.authors}</p>
                    <p className="mt-0.5 text-xs italic text-brand-700">{pub.venue}</p>

                    <p className="mt-3 text-sm leading-relaxed text-ink-600">{pub.abstract}</p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-end">
                    {pub.doi && (
                      <a
                        href={pub.doi}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-brand-700 transition-colors"
                      >
                        <FileText className="h-3.5 w-3.5" /> DOI / View Paper
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    <button
                      onClick={() => copyBibtex(pub)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs font-medium text-ink-700 hover:bg-ink-50 transition-colors"
                      title="Copy BibTeX Citation"
                    >
                      {copiedId === pub.id ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-600" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" /> BibTeX
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink-200 bg-ink-50/50 p-10 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-ink-400 shadow-sm border border-ink-200">
              <Inbox className="h-6 w-6" />
            </span>
            <h3 className="mt-4 font-display text-base font-bold text-ink-900">
              Publications Under Preparation
            </h3>
            <p className="mt-1 max-w-md text-sm text-ink-500">
              Scientific papers, journal publications, and patent filings will be published here as research milestones progress under ICSETEP (RDG B9).
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
