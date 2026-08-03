import { Cpu, Camera, BrainCircuit, Smartphone, Sparkles } from 'lucide-react';

const technologies = [
  {
    id: 'hsi',
    title: 'Hyperspectral Imaging (HSI)',
    category: 'Hardware & Optics',
    icon: Camera,
    color: 'from-blue-500 to-indigo-600',
    badge: 'Hardware System',
    description:
      'Custom affordable imaging hardware capturing spectral signatures across wavelength bands for non-destructive agricultural inspection.',
    features: ['Multi-band spectrum analysis', 'Affordable optical setup', 'Non-destructive quality testing'],
  },
  {
    id: 'dl',
    title: 'Deep Learning Reconstruction',
    category: 'Artificial Intelligence',
    icon: Cpu,
    color: 'from-purple-500 to-pink-600',
    badge: 'AI Engine',
    description:
      'State-of-the-art neural network architectures for fast, accurate spectral image reconstruction and disease spatial mapping.',
    features: ['High-fidelity reconstruction', 'Real-time spectral synthesis', 'Sub-pixel accuracy'],
  },
  {
    id: 'xai',
    title: 'Explainable AI (XAI)',
    category: 'Trust & Transparency',
    icon: BrainCircuit,
    color: 'from-amber-500 to-orange-600',
    badge: 'Trust Framework',
    description:
      'Interpretable models providing visual saliency maps and feature explanations so farmers and inspectors trust AI evaluations.',
    features: ['Saliency map visualization', 'Transparent feature weights', 'Actionable diagnostic reports'],
  },
  {
    id: 'app',
    title: 'Consumer Agro-Tech Portal',
    category: 'Software & Cloud',
    icon: Smartphone,
    color: 'from-emerald-500 to-teal-600',
    badge: 'Mobile & Web',
    description:
      'User-friendly web and mobile application enabling farmers, buyers, and agricultural officers to scan and grade food quality effortlessly.',
    features: ['Instant quality grading', 'Disease diagnostic alerts', 'Cloud analytics dashboard'],
  },
];

export default function CoreTechnologies() {
  return (
    <section id="technologies" className="scroll-mt-20 bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 ring-1 ring-inset ring-brand-200">
            <Sparkles className="h-3.5 w-3.5" />
            Core Technological Pillars
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold text-ink-900 sm:text-4xl">
            Intelligent Imaging & Explainable AI Stack
          </h2>
          <p className="mt-2 text-base text-ink-600">
            Integrating cutting-edge spectral hardware, deep learning algorithms, and explainable models tailored for Bangladesh's agricultural ecosystem.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {technologies.map((tech) => {
            const Icon = tech.icon;
            return (
              <div
                key={tech.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-ink-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${tech.color} text-white shadow-md transition-transform group-hover:scale-110`}
                    >
                      <Icon className="h-6 w-6" />
                    </span>
                    <span className="rounded-full bg-ink-100 px-2.5 py-0.5 text-[11px] font-semibold text-ink-700">
                      {tech.badge}
                    </span>
                  </div>

                  <h3 className="mt-5 font-display text-lg font-bold text-ink-900 group-hover:text-brand-600 transition-colors">
                    {tech.title}
                  </h3>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-ink-400">
                    {tech.category}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-ink-600">
                    {tech.description}
                  </p>
                </div>

                <div className="mt-6 border-t border-ink-100 pt-4">
                  <ul className="space-y-1.5">
                    {tech.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-xs font-medium text-ink-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
