import { CheckCircle, Clock, Calendar, Sparkles } from 'lucide-react';
import { getAssetUrl } from '@/lib/utils';

interface Phase {
  number: number;
  title: string;
  duration: string;
  status: 'completed' | 'in-progress' | 'upcoming';
  description: string;
  deliverables: string[];
}

const phases: Phase[] = [
  {
    number: 1,
    title: 'Project Inception',
    duration: 'Months 1 – 4',
    status: 'completed',
    description: 'Grant agreement signing, project inception program, laboratory infrastructure establishment, and ethics approvals.',
    deliverables: ['Inception Ceremony & Orientation', 'Lab Setup at Dept. of CSE, PUST', 'Initial Optical Hardware Planning'],
  },
  {
    number: 2,
    title: 'Hyperspectral Hardware Assembly & Calibration',
    duration: 'Months 5 – 9',
    status: 'in-progress',
    description: 'Custom imaging system assembly, spectral calibration across target bands, and agricultural sample database creation.',
    deliverables: ['Custom HSI Hardware Rig', 'Calibrated Optical Sensors', 'Baseline Agricultural Image Dataset'],
  },
  {
    number: 3,
    title: 'Deep Learning & XAI Model Development',
    duration: 'Months 10 – 15',
    status: 'in-progress',
    description: 'Designing neural network architectures for spectral image reconstruction and Explainable AI (XAI) feature maps.',
    deliverables: ['Image Reconstruction Algorithm', 'XAI Explainability Engine', 'Q1 Journal Research Paper Drafts'],
  },
  {
    number: 4,
    title: 'Consumer Software & Mobile App Integration',
    duration: 'Months 16 – 20',
    status: 'upcoming',
    description: 'Developing user-friendly web and mobile applications for real-time agricultural product assessment in the field.',
    deliverables: ['Mobile Inspection App', 'Cloud Assessment API', 'User Field Testing Workshops'],
  },
  {
    number: 5,
    title: 'Field Testing, Validation & Technology Transfer',
    duration: 'Months 21 – 24',
    status: 'upcoming',
    description: 'Field validation with local farmers, final performance evaluation, stakeholder dissemination, and patent filing.',
    deliverables: ['Field Performance Report', 'Stakeholder Dissemination Workshop', 'Patent & Software Copyright Filing'],
  },
];

export default function ProjectRoadmap() {
  return (
    <section id="roadmap" className="scroll-mt-20 bg-ink-50/60 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 ring-1 ring-inset ring-brand-200">
            <Sparkles className="h-3.5 w-3.5" />
            Strategic Implementation Roadmap
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold text-ink-900 sm:text-4xl">
            5-Phase Project Milestones (2026–2027)
          </h2>
          <p className="mt-2 text-base text-ink-600">
            Comprehensive timeline mapping the journey from project inception to AI model validation and farmer field deployment.
          </p>
        </div>

        <div className="mt-12 space-y-6">
          {phases.map((phase) => {
            const isCompleted = phase.status === 'completed';
            const isInProgress = phase.status === 'in-progress';

            return (
              <div
                key={phase.number}
                className={`relative flex flex-col sm:flex-row items-start gap-4 sm:gap-6 rounded-2xl border bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md ${
                  isInProgress
                    ? 'border-brand-300 ring-2 ring-brand-100'
                    : isCompleted
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : 'border-ink-200 opacity-90'
                }`}
              >
                {/* Phase Number Badge */}
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl font-display text-lg font-bold shadow-sm ${
                    isCompleted
                      ? 'bg-emerald-600 text-white'
                      : isInProgress
                      ? 'bg-brand-600 text-white'
                      : 'bg-ink-100 text-ink-600'
                  }`}
                >
                  {isCompleted ? <CheckCircle className="h-6 w-6" /> : `P${phase.number}`}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <h3 className="font-display text-lg font-bold text-ink-900">
                        Phase {phase.number}: {phase.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-ink-500 bg-ink-100 px-2.5 py-1 rounded-full">
                        <Calendar className="h-3 w-3" />
                        {phase.duration}
                      </span>
                      {isCompleted && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">
                          Completed
                        </span>
                      )}
                      {isInProgress && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-2.5 py-1 text-xs font-bold text-brand-800 animate-pulse-soft">
                          <Clock className="h-3 w-3" /> Active Phase
                        </span>
                      )}
                      {phase.status === 'upcoming' && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-ink-100 px-2.5 py-1 text-xs font-bold text-ink-600">
                          Upcoming
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="mt-2 text-sm leading-relaxed text-ink-600">
                    {phase.description}
                  </p>

                  {/* Static Inception Images for Phase 1 */}
                  {phase.number === 1 && (
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="overflow-hidden rounded-xl border border-ink-200 bg-ink-100 shadow-sm group">
                        <img
                          src={getAssetUrl('team/projectinception1.jpg')}
                          alt="Project Inception Program"
                          className="h-64 sm:h-72 md:h-80 w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="bg-white p-2.5 text-center text-xs font-semibold text-ink-800 border-t border-ink-100">
                          Project Inception Program
                        </div>
                      </div>
                      <div className="overflow-hidden rounded-xl border border-ink-200 bg-ink-100 shadow-sm group">
                        <img
                          src={getAssetUrl('team/projectinception2.jpg')}
                          alt="Inception Discussion & Planning"
                          className="h-64 sm:h-72 md:h-80 w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="bg-white p-2.5 text-center text-xs font-semibold text-ink-800 border-t border-ink-100">
                          Inception Orientation & Planning
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-ink-400">Key Deliverables:</span>
                    {phase.deliverables.map((deliv, idx) => (
                      <span
                        key={idx}
                        className="rounded-lg bg-ink-50 border border-ink-200/80 px-2.5 py-1 text-xs font-medium text-ink-700"
                      >
                        ✓ {deliv}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
