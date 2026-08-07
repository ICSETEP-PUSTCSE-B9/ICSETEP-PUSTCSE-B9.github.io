import { ArrowUpRight, CalendarDays, Users, Wallet, Layers } from 'lucide-react';
import type { ProjectInfo } from '@/lib/types';
import { getStatusColor } from '@/lib/utils';
import ImageSlider from '@/components/ImageSlider';

interface Props {
  info: ProjectInfo | null;
}

const metricIcons = [Layers, Wallet, CalendarDays, Users];

const defaultProjectInfo: ProjectInfo = {
  id: 1,
  title: 'ICSETEP-PUSTCSE-B9',
  tagline: 'Smart, Affordable, and Sustainable Agro-Tech Transformation in Bangladesh is a flagship research initiative under the Improving Computer and Software Engineering Tertiary Education Project',
  description: 'Advancing intelligent agricultural technologies by integrating Explainable Artificial Intelligence (XAI), Deep Learning, and Hyperspectral Imaging for non-destructive agricultural product assessment.',
  status: 'In Progress',
  status_color: 'green',
  metric1_label: 'Research Grant',
  metric1_value: 'BDT 2.35 Crore',
  metric2_label: 'Grant Sub-Project',
  metric2_value: 'RDG B9 (ICSETEP)',
  metric3_label: 'Funding Partner',
  metric3_value: 'ADB & UGC',
  metric4_label: 'Core Technology',
  metric4_value: 'XAI & Agro-Tech',
  updated_at: new Date().toISOString(),
};

export default function ProjectOverview({ info }: Props) {
  const activeInfo = info ?? defaultProjectInfo;
  const displayTitle = activeInfo.title && activeInfo.title !== 'Demo Project Title' ? activeInfo.title : 'ICSETEP-PUSTCSE-B9';
  const displayTagline = (!activeInfo.tagline || activeInfo.tagline.trim() === 'Smart, Affordable, and Sustainable Agro-Tech Transformation in Bangladesh' || activeInfo.tagline === 'HSI-Reconst-Quality assessment')
    ? 'Smart, Affordable, and Sustainable Agro-Tech Transformation in Bangladesh is a flagship research initiative under the Improving Computer and Software Engineering Tertiary Education Project'
    : activeInfo.tagline;

  const sc = getStatusColor(activeInfo.status_color);

  // User requested: Remove Budget, keep Phase -> Team -> Timeline (3 cards)
  const customMetrics = [
    {
      label: 'PHASE',
      value: activeInfo.metric1_value && activeInfo.metric1_value !== '0' ? activeInfo.metric1_value : 'Phase 1 of 5',
      icon: Layers,
    },
    {
      label: 'TEAM',
      value: '3 Investigators',
      icon: Users,
    },
    {
      label: 'TIMELINE',
      value: activeInfo.metric3_value && activeInfo.metric3_value !== '0' ? activeInfo.metric3_value : '2026–2027',
      icon: CalendarDays,
    },
  ];

  return (
    <section id="overview" className="relative scroll-mt-20 overflow-hidden">
      {/* background */}
      <div className="absolute inset-0 bg-gradient-to-b from-ink-50 to-white" />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, #1f242e 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />
      <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-brand-200/40 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 pt-10 pb-12 sm:px-6 sm:pt-20 sm:pb-16">
        <div className="w-full">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] sm:text-xs font-semibold ring-1 ring-inset ${sc.bg} ${sc.text} ${sc.ring}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${sc.dot} animate-pulse-soft`} />
              {activeInfo.status}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-[11px] sm:text-xs font-bold text-brand-700 ring-1 ring-inset ring-brand-200 leading-normal">
              ICSETEP RDG B9 | Flagship Research Sub-Project Grant
            </span>
          </div>

          <h1 className="mt-3 font-display text-2xl font-bold leading-tight text-ink-900 sm:text-4xl lg:text-5xl">
            {displayTitle}
          </h1>
          <p className="mt-2.5 text-base font-bold text-brand-600 sm:text-xl leading-snug">
            {displayTagline}
          </p>
          <p className="mt-3 max-w-4xl text-sm sm:text-base leading-relaxed text-ink-500">
            {activeInfo.description}
          </p>
        </div>

        {/* Full-Width Featured Hero Image Carousel */}
        <ImageSlider />

        {/* 3 Metric Cards: Phase -> Team -> Timeline (Budget removed) */}
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {customMetrics.map((m, i) => {
            const Icon = m.icon;
            return (
              <div
                key={m.label}
                className="reveal group rounded-2xl border border-ink-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md"
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-100">
                    <Icon className="h-5 w-5" />
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-ink-300 transition-colors group-hover:text-brand-500" />
                </div>
                <p className="mt-3 font-display text-2xl font-bold text-ink-900">
                  {m.value}
                </p>
                <p className="text-xs font-bold uppercase tracking-wider text-ink-400">
                  {m.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
