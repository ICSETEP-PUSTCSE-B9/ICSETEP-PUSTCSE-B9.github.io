import { useState } from 'react';
import { Target, Eye, BookOpen, CheckCircle2, ChevronDown, ChevronUp, Sparkles, Landmark } from 'lucide-react';

export default function MissionVision() {
  const [introExpanded, setIntroExpanded] = useState(false);
  const [missionExpanded, setMissionExpanded] = useState(false);
  const [visionExpanded, setVisionExpanded] = useState(false);
  const [objExpanded, setObjExpanded] = useState(false);
  const [icsetepExpanded, setIcsetepExpanded] = useState(false);

  const objectives = [
    'Develop affordable hyperspectral imaging systems for agricultural applications.',
    'Design state-of-the-art deep learning models for hyperspectral image reconstruction.',
    'Integrate Explainable Artificial Intelligence (XAI) for transparent and trustworthy decision-making.',
    'Develop consumer-oriented software for agricultural product assessment.',
    'Improve quality grading and disease detection of agricultural products.',
    'Support precision agriculture through intelligent imaging technologies.',
    'Build research capacity in Artificial Intelligence, Computer Vision, and Agricultural Informatics.',
    'Promote collaboration among universities, industries, and agricultural stakeholders.',
    'Produce high-quality scientific publications and innovative software technologies.',
  ];

  return (
    <section id="mission-vision" className="scroll-mt-20 bg-ink-50/50 py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 ring-1 ring-inset ring-brand-200">
            <Sparkles className="h-3.5 w-3.5" />
            Project Overview & Fundamentals
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold text-ink-900 sm:text-4xl">
            Introduction, Mission, Vision & Objectives
          </h2>
          <p className="mt-2 text-ink-600">
            Explore the core research initiative, strategic goals, and funding framework under ICSETEP (RDG B9).
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* 1. INTRODUCTION CARD */}
          <div
            className={`group rounded-2xl border bg-white p-6 sm:p-8 shadow-sm transition-all duration-300 hover:shadow-md md:col-span-2 ${
              introExpanded ? 'border-brand-300 ring-2 ring-brand-100' : 'border-ink-200'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 text-brand-600 transition-transform group-hover:scale-110 shrink-0">
                  <BookOpen className="h-6 w-6" />
                </span>
                <div>
                  <h3 className="font-display text-xl font-bold text-ink-900">Introduction</h3>
                  <p className="text-xs font-medium uppercase tracking-wider text-brand-600">
                    Flagship Research Initiative
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIntroExpanded(!introExpanded)}
                className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-3.5 py-2 rounded-xl transition-colors shrink-0"
                aria-expanded={introExpanded}
              >
                {introExpanded ? (
                  <>
                    Collapse <ChevronUp className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    Expand <ChevronDown className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>

            <div className="mt-4">
              {!introExpanded ? (
                <p className="text-sm leading-relaxed text-ink-700 font-medium">
                  <strong>Smart, Affordable, and Sustainable Agro-Tech Transformation in Bangladesh</strong> is a flagship research initiative under the Improving Computer and Software Engineering Tertiary Education Project (ICSETEP).
                </p>
              ) : (
                <div className="text-sm leading-relaxed text-ink-600 space-y-4">
                  <p className="font-medium text-ink-800">
                    <strong>Smart, Affordable, and Sustainable Agro-Tech Transformation in Bangladesh</strong> is a flagship research initiative under the Improving Computer and Software Engineering Tertiary Education Project (ICSETEP).
                  </p>
                  <p>
                    The project aims to advance intelligent agricultural technologies by integrating Explainable Artificial Intelligence (XAI), Deep Learning, and Hyperspectral Imaging for non-destructive agricultural product assessment. Through the development of affordable imaging systems and consumer-oriented software solutions, the project seeks to improve food quality evaluation, disease detection, and decision-making while promoting sustainable agricultural practices in Bangladesh.
                  </p>
                  <div className="rounded-xl bg-brand-50/80 p-4 border border-brand-200/60 text-brand-900 text-xs sm:text-sm font-medium flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <span className="font-bold text-brand-700 block sm:inline">Research Grant Award:</span> Worth BDT 2.35 crore (approx. USD 200,000) under RDG B9
                    </div>
                    <span className="shrink-0 rounded-full bg-brand-600 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
                      ADB & UGC Funded
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 2. OUR MISSION CARD */}
          <div
            className={`group rounded-2xl border bg-white p-6 sm:p-8 shadow-sm transition-all duration-300 hover:shadow-md ${
              missionExpanded ? 'border-brand-300 ring-2 ring-brand-100' : 'border-ink-200'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 text-brand-600 transition-transform group-hover:scale-110 shrink-0">
                  <Target className="h-6 w-6" />
                </span>
                <div>
                  <h3 className="font-display text-xl font-bold text-ink-900">Our Mission</h3>
                  <p className="text-xs font-medium uppercase tracking-wider text-brand-600">
                    Core Purpose
                  </p>
                </div>
              </div>
              <button
                onClick={() => setMissionExpanded(!missionExpanded)}
                className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-3.5 py-2 rounded-xl transition-colors shrink-0"
                aria-expanded={missionExpanded}
              >
                {missionExpanded ? (
                  <>
                    Collapse <ChevronUp className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    Expand <ChevronDown className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>

            <div className="mt-4">
              {!missionExpanded ? (
                <p className="text-sm leading-relaxed text-ink-700 font-medium line-clamp-2">
                  To develop intelligent, affordable, and explainable AI-powered technologies that enable accurate, non-destructive agricultural product assessment...
                </p>
              ) : (
                <p className="text-sm leading-relaxed text-ink-700 font-medium">
                  To develop intelligent, affordable, and explainable AI-powered technologies that enable accurate, non-destructive agricultural product assessment through hyperspectral imaging, while strengthening research capacity, promoting innovation, and fostering academia–industry collaboration for sustainable agricultural development.
                </p>
              )}
            </div>
          </div>

          {/* 3. OUR VISION CARD */}
          <div
            className={`group rounded-2xl border bg-white p-6 sm:p-8 shadow-sm transition-all duration-300 hover:shadow-md ${
              visionExpanded ? 'border-brand-300 ring-2 ring-brand-100' : 'border-ink-200'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 text-brand-600 transition-transform group-hover:scale-110 shrink-0">
                  <Eye className="h-6 w-6" />
                </span>
                <div>
                  <h3 className="font-display text-xl font-bold text-ink-900">Our Vision</h3>
                  <p className="text-xs font-medium uppercase tracking-wider text-brand-600">
                    Future Aspiration
                  </p>
                </div>
              </div>
              <button
                onClick={() => setVisionExpanded(!visionExpanded)}
                className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-3.5 py-2 rounded-xl transition-colors shrink-0"
                aria-expanded={visionExpanded}
              >
                {visionExpanded ? (
                  <>
                    Collapse <ChevronUp className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    Expand <ChevronDown className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>

            <div className="mt-4">
              {!visionExpanded ? (
                <p className="text-sm leading-relaxed text-ink-700 font-medium line-clamp-2">
                  To become a leading research initiative in AI-enabled precision agriculture by developing next-generation intelligent imaging systems...
                </p>
              ) : (
                <p className="text-sm leading-relaxed text-ink-700 font-medium">
                  To become a leading research initiative in AI-enabled precision agriculture by developing next-generation intelligent imaging systems and software solutions that enhance food quality, safety, productivity, and sustainability in Bangladesh and beyond.
                </p>
              )}
            </div>
          </div>

          {/* 4. OBJECTIVES CARD */}
          <div
            className={`group rounded-2xl border bg-white p-6 sm:p-8 shadow-sm transition-all duration-300 hover:shadow-md md:col-span-2 ${
              objExpanded ? 'border-brand-300 ring-2 ring-brand-100' : 'border-ink-200'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 text-brand-600 transition-transform group-hover:scale-110 shrink-0">
                  <CheckCircle2 className="h-6 w-6" />
                </span>
                <div>
                  <h3 className="font-display text-xl font-bold text-ink-900">Project Objectives</h3>
                  <p className="text-xs font-medium uppercase tracking-wider text-brand-600">
                    9 Key Deliverables & Targets
                  </p>
                </div>
              </div>
              <button
                onClick={() => setObjExpanded(!objExpanded)}
                className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-3.5 py-2 rounded-xl transition-colors shrink-0"
                aria-expanded={objExpanded}
              >
                {objExpanded ? (
                  <>
                    Collapse <ChevronUp className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    Expand <ChevronDown className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>

            <div className="mt-4">
              <p className="text-sm leading-relaxed text-ink-700 font-medium">
                The project aims to achieve comprehensive technical, research, and capacity-building milestones across 9 key areas.
              </p>

              {objExpanded && (
                <div className="mt-4 border-t border-ink-100 pt-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {objectives.map((obj, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2.5 rounded-xl bg-ink-50/70 p-3 text-sm leading-relaxed text-ink-700 border border-ink-100"
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-600 text-[11px] font-bold text-white mt-0.5">
                          {i + 1}
                        </span>
                        <span>{obj}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 5. ABOUT ICSETEP CARD */}
          <div
            className={`group rounded-2xl border bg-white p-6 sm:p-8 shadow-sm transition-all duration-300 hover:shadow-md md:col-span-2 ${
              icsetepExpanded ? 'border-brand-300 ring-2 ring-brand-100' : 'border-ink-200'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 text-brand-600 transition-transform group-hover:scale-110 shrink-0">
                  <Landmark className="h-6 w-6" />
                </span>
                <div>
                  <h3 className="font-display text-xl font-bold text-ink-900">About ICSETEP</h3>
                  <p className="text-xs font-medium uppercase tracking-wider text-brand-600">
                    National Tertiary Education Project (ADB & UGC)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIcsetepExpanded(!icsetepExpanded)}
                className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-3.5 py-2 rounded-xl transition-colors shrink-0"
                aria-expanded={icsetepExpanded}
              >
                {icsetepExpanded ? (
                  <>
                    Collapse <ChevronUp className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    Expand <ChevronDown className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>

            <div className="mt-4">
              {!icsetepExpanded ? (
                <p className="text-sm leading-relaxed text-ink-700 font-medium line-clamp-2">
                  The Improving Computer and Software Engineering Tertiary Education Project (ICSETEP) is a national initiative of the Government of Bangladesh funded by ADB and UGC to strengthen computer science tertiary education.
                </p>
              ) : (
                <div className="text-sm leading-relaxed text-ink-600 space-y-3">
                  <p className="font-medium text-ink-700">
                    The Improving Computer and Software Engineering Tertiary Education Project (ICSETEP) is a national initiative of the Government of Bangladesh designed to strengthen computer science and software engineering education, research, innovation, and industry collaboration across public universities. The project is funded by the Asian Development Bank (ADB) and implemented by the University Grants Commission (UGC) of Bangladesh.
                  </p>
                  <p>
                    ICSETEP supports curriculum modernization, advanced laboratories, faculty development, international collaboration, entrepreneurship, and competitive research grants to develop a highly skilled workforce capable of addressing the challenges of the Fourth Industrial Revolution (4IR).
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
