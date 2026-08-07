import { useState } from 'react';
import { Award, GraduationCap, ChevronDown, ChevronUp, MapPin, User } from 'lucide-react';
import { getAssetUrl } from '@/lib/utils';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  designation: string;
  institution: string;
  photo: string;
  initials: string;
  bio: string;
}

const team: TeamMember[] = [
  {
    id: 'pi',
    name: 'Dr. Md. Toukir Ahmed',
    role: 'Principal Investigator (PI)',
    designation: 'Associate Professor',
    institution: 'Pabna University of Science and Technology (PUST)',
    photo: 'team/pi.jpeg',
    initials: 'TA',
    bio: 'Dr. Md. Toukir Ahmed is an Associate Professor in the Department of Computer Science and Engineering at Pabna University of Science and Technology (PUST), Bangladesh. He earned his Ph.D. in Data Science and Engineering from the Department of Agricultural and Biological Engineering at the University of Illinois Urbana-Champaign, USA, where he also served as a Graduate Research Assistant at the IOSNEL Laboratory. His research focuses on machine learning, computer vision, hyperspectral imaging, spectroscopy, image reconstruction, explainable artificial intelligence (XAI), remote sensing, and bioinformatics. Dr. Ahmed has published numerous articles in leading international journals and conferences and serves as a reviewer for several high-impact Q1 journals. He currently teaches Artificial Intelligence, Database Management Systems, Object-Oriented Programming, and Structured Programming at PUST.',
  },
  {
    id: 'co-pi-1',
    name: 'S. M. Hasan Sazzad Iqbal',
    role: 'Co-Principal Investigator (Co-PI)',
    designation: 'Associate Professor',
    institution: 'Pabna University of Science and Technology (PUST)',
    photo: 'team/co-pi-1.jpeg',
    initials: 'SI',
    bio: 'S. M. Hasan Sazzad Iqbal is an Associate Professor in the Department of Computer Science and Engineering at Pabna University of Science and Technology (PUST), Bangladesh. He received both his B.Sc. (Hons.) and M.Sc. degrees in Information and Communication Engineering from the University of Rajshahi, Bangladesh. His research interests include machine learning, artificial intelligence, computer vision, image processing, wireless networks, and biomedical data analysis. He has authored numerous research articles published in national and international journals and conferences, with contributions spanning medical image analysis, disease prediction, deep learning, and intelligent computing. In addition to his research activities, he is actively involved in undergraduate teaching and academic supervision, contributing to the advancement of computer science education and applied artificial intelligence research at PUST.',
  },
  {
    id: 'co-pi-2',
    name: 'Dr. Md. Wadud Ahmed',
    role: 'Co-Principal Investigator (Co-PI)',
    designation: 'Associate Professor & Chairman',
    institution: 'Sher-e-Bangla Agricultural University (SAU)',
    photo: 'team/co-pi-2.jpeg',
    initials: 'WA',
    bio: "Dr. Md. Wadud Ahmed is an Associate Professor and Chairman of the Department of Agricultural Engineering at Sher-e-Bangla Agricultural University (SAU), Dhaka, Bangladesh. He earned his Ph.D. in Agricultural and Biological Engineering from the University of Illinois Urbana-Champaign (UIUC), USA, in 2025, where he also worked as a Graduate Research Assistant. He previously completed an Erasmus Mundus Master's degree in Food Science and Technology at KU Leuven, Belgium, and a Postgraduate Diploma from Wageningen University & Research, the Netherlands. His research focuses on hyperspectral imaging, near-infrared (NIR) spectroscopy, machine learning, explainable artificial intelligence (XAI), food engineering, food safety, and non-destructive quality assessment of agricultural products. Dr. Ahmed has authored numerous publications in high-impact international journals and actively contributes to interdisciplinary research in precision agriculture, optical sensing, and intelligent food quality evaluation. He currently leads teaching, research, and academic activities in the Department of Agricultural Engineering at Sher-e-Bangla Agricultural University.",
  },
];

export default function PITeam() {
  const [expandedMember, setExpandedMember] = useState<Record<string, boolean>>({});
  const [imageError, setImageError] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedMember((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleImgError = (id: string) => {
    setImageError((prev) => ({
      ...prev,
      [id]: true,
    }));
  };

  return (
    <section id="pi-team" className="scroll-mt-20 mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-12">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 ring-1 ring-inset ring-brand-200">
          <Award className="h-3.5 w-3.5" />
          Project Leadership
        </span>
        <h2 className="mt-3 font-display text-3xl font-bold text-ink-900 sm:text-4xl">
          PI & Co-PI Team
        </h2>
        <p className="mt-2 text-ink-600">
          Meet the distinguished investigators driving the research and academic direction of this project.
        </p>
      </div>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 items-start">
        {team.map((m) => {
          const isExpanded = !!expandedMember[m.id];
          const hasError = !!imageError[m.id];

          return (
            <div
              key={m.id}
              className="reveal flex flex-col justify-between rounded-2xl border border-ink-200 bg-white p-5 sm:p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-brand-200"
            >
              <div>
                <div className="relative mx-auto h-32 w-32 overflow-hidden rounded-full ring-4 ring-brand-100 shadow-md bg-brand-50 flex items-center justify-center">
                  {!hasError ? (
                    <img
                      src={getAssetUrl(m.photo)}
                      alt={m.name}
                      onError={() => handleImgError(m.id)}
                      className="h-full w-full object-cover object-center"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-brand-700 font-bold">
                      <User className="h-10 w-10 text-brand-600 mb-1" />
                      <span className="text-sm">{m.initials}</span>
                    </div>
                  )}
                </div>

                <div className="mt-5 text-center">
                  <span className="inline-block rounded-md bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-700">
                    {m.role}
                  </span>
                  <h3 className="mt-2 font-display text-xl font-bold text-ink-900">
                    {m.name}
                  </h3>
                  <p className="mt-1 text-xs font-semibold text-ink-600 flex items-center justify-center gap-1">
                    <GraduationCap className="h-3.5 w-3.5 text-brand-600" />
                    {m.designation}
                  </p>
                  <p className="mt-1 text-xs text-ink-500 flex items-center justify-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-ink-400 shrink-0" />
                    <span className="truncate">{m.institution}</span>
                  </p>
                </div>

                {/* Biography Text Block */}
                <div className="mt-4 border-t border-ink-100 pt-4">
                  <p
                    className={`text-sm leading-relaxed text-ink-600 text-left transition-all ${
                      isExpanded ? '' : 'line-clamp-4'
                    }`}
                  >
                    {m.bio}
                  </p>
                </div>
              </div>

              {/* Read Full Bio Toggle Button */}
              <button
                onClick={() => toggleExpand(m.id)}
                className="mt-4 flex w-full items-center justify-center gap-1 rounded-xl bg-ink-50 py-2 text-xs font-bold text-brand-600 transition-colors hover:bg-brand-50 hover:text-brand-700"
              >
                {isExpanded ? (
                  <>
                    Show Less <ChevronUp className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    Read Full Biography <ChevronDown className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}