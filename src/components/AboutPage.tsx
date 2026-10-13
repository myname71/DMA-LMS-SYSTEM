import React from 'react';
import { Globe, Award, BookOpen, Users, Lightbulb, ArrowRight, ExternalLink } from 'lucide-react';
import ProjectJourney from './ProjectJourney';

const outcomes = [
  {
    icon: <Award className="w-5 h-5" />,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    title: 'Globally Recognised Certification',
    desc: 'Co-designed professional certificates aligned with UK higher education frameworks, addressing critical skills gaps in South and South-East Asian manufacturing.',
  },
  {
    icon: <Globe className="w-5 h-5" />,
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
    title: 'Transnational Education Synergy',
    desc: 'Shared digital simulators, lab modules, and joint investigator grading rubrics unify the learning experience across two continents.',
  },
  {
    icon: <BookOpen className="w-5 h-5" />,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
    title: 'Open-Access Learning',
    desc: 'Dynamic interactive systems facilitate persistent open-access learning paradigms, ensuring any engineering professional can upskill regardless of geography.',
  },
  {
    icon: <Lightbulb className="w-5 h-5" />,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    title: 'Industry-Informed Curriculum',
    desc: 'UK industry partners contributed real-world best-practice insights, ensuring the curriculum reflects live digital manufacturing challenges facing Bangladeshi factories.',
  },
  {
    icon: <Users className="w-5 h-5" />,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    title: 'People-Centred Capacity Building',
    desc: 'Delegation exchanges, online webinars, and in-person delivery have built lasting human connections between UK and Bangladeshi academic and industry communities.',
  },
  {
    icon: <ArrowRight className="w-5 h-5" />,
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
    title: 'Sustained Future Engagement',
    desc: 'The partnership is structured for longevity — supporting future cohorts, collaborative research publications, and ongoing industry engagement beyond the initial grant period.',
  },
];

interface AboutPageProps {
  cmsContent?: any;
}

export default function AboutPage({ cmsContent }: AboutPageProps = {}) {
  const aboutPage = cmsContent?.pages?.find((p: any) => p.id === 'about');
  const cmsSection = (id: string) => aboutPage?.sections?.find((s: any) => s.id === id)?.content;
  const cmsHero = cmsSection('about_hero');
  const cmsOutcomes = cmsSection('about_outcomes');
  return (
    <div className="min-h-screen bg-[#0b111e] text-white">

      {/* ── Hero Banner ── */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-blue-600/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <span className="inline-block px-3 py-1 bg-blue-500/10 border border-blue-500/25 rounded-full text-xs font-bold text-blue-400 uppercase tracking-widest font-mono mb-5">
            {cmsHero?.badge || 'British Council Going Global Partnerships Grant'}
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight mb-6">
            {cmsHero?.title ? (
              <>
                {cmsHero.title.split('\n')[0]}<br />
                <span className="text-blue-400">{cmsHero.title.split('\n')[1] || 'Manufacturing Academy'}</span>
              </>
            ) : (
              <>About the Digital<br /><span className="text-blue-400">Manufacturing Academy</span></>
            )}
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            {cmsHero?.description || 'A transnational educational initiative co-developed by Birmingham City University and the American International University-Bangladesh, funded by the British Council to build digital manufacturing capability across UK and Bangladeshi industry.'}
          </p>
          {cmsHero?.imageUrl && <img src={cmsHero.imageUrl} alt="About the academy" className="w-full max-h-72 object-cover rounded-2xl border border-white/10 mt-7" />}
        </div>
      </section>

      {/* ── Grant Context ── */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto pb-16">
        <div className="rounded-2xl border border-blue-500/15 bg-gradient-to-br from-slate-900/60 to-blue-950/20 p-8 sm:p-10">
          <div className="flex items-start gap-4">
            <div className="shrink-0 w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
              <Globe className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white mb-3">British Council Going Global Partnerships</h2>
              <p className="text-slate-300 text-sm leading-relaxed mb-4">
                The <strong className="text-white">Going Global Partnerships</strong> programme is a British Council initiative
                supporting international higher education collaborations between UK institutions and partners worldwide.
                This exploratory grant enabled BCU and AIUB to co-design a certification that directly addresses the
                skills gaps identified by both UK and Bangladeshi manufacturing sectors as they transition to Industry 4.0 and beyond.
              </p>
              <p className="text-slate-400 text-sm leading-relaxed">
                The programme encompasses digital twins, robotics, additive manufacturing, edge AI, and sustainable smart
                factory systems — content shaped by input from UK industry partners to reflect real-world deployment challenges.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Institution Profiles ── */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto pb-16">
        <div className="text-center mb-10">
          <span className="text-blue-400 font-bold text-xs uppercase tracking-widest">Our Partner Institutions</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold mt-2">Two Universities, One Vision</h2>
          <p className="text-slate-400 text-sm mt-2 max-w-xl mx-auto">
            Combining BCU's UK engineering expertise with AIUB's deep local industry connections.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* BCU */}
          <div className="rounded-2xl border border-white/8 bg-slate-900/40 p-8 flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-xl">🏛️</div>
              <div>
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest font-mono">United Kingdom</p>
                <h3 className="text-base font-extrabold text-white leading-tight">Birmingham City University</h3>
              </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              BCU's Faculty of Computing, Engineering and the Built Environment brings deep expertise in additive
              manufacturing, digital twin physics modelling, G-Code validation, PLC systems, and UK higher education
              quality frameworks — ensuring globally compliant, academically rigorous certification.
            </p>
            <ul className="space-y-2 text-sm">
              {['Industry 4.0 & 5.0 Research', 'Digital Twin & Simulation Labs', 'UK-Accredited Engineering Programmes', 'International TNE Experience'].map(item => (
                <li key={item} className="flex items-center gap-2 text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <a
              href="https://www.bcu.ac.uk"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-bold transition-colors mt-auto"
            >
              Visit BCU <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* AIUB */}
          <div className="rounded-2xl border border-white/8 bg-slate-900/40 p-8 flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-xl">🎓</div>
              <div>
                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest font-mono">Bangladesh</p>
                <h3 className="text-base font-extrabold text-white leading-tight">American International University-Bangladesh</h3>
              </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              AIUB commands deep expertise in industrial IoT, software architecture, robotic controller laboratories,
              and extensive local manufacturing industry partnerships — providing the on-the-ground infrastructure and
              relationships to deliver this programme directly to Bangladeshi engineers.
            </p>
            <ul className="space-y-2 text-sm">
              {['Industrial IoT & Robotics Labs', 'Strong Industry–Academia Links', 'Engineering Faculty Research Groups', 'Local Manufacturing Partnerships'].map(item => (
                <li key={item} className="flex items-center gap-2 text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <a
              href="https://www.aiub.edu"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-bold transition-colors mt-auto"
            >
              Visit AIUB <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </section>

      {/* ── Project Journey ── */}
      <section className="border-t border-white/5 bg-white/[0.01]">
        <ProjectJourney />
      </section>

      {/* ── Strategic Outcomes ── */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto py-16 border-t border-white/5">
        <div className="text-center mb-10">
          <span className="text-blue-400 font-bold text-xs uppercase tracking-widest">What We're Achieving</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold mt-2">{cmsOutcomes?.title || 'Strategic Partnership Outcomes'}</h2>
          <p className="text-slate-400 text-sm mt-2 max-w-xl mx-auto">
            Six pillars of impact driving sustainable digital manufacturing capability in both nations.
          </p>
          {cmsOutcomes?.imageUrl && <img src={cmsOutcomes.imageUrl} alt="Partnership outcomes" className="w-full h-28 object-cover rounded-2xl border border-white/10 mt-5" />}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(cmsOutcomes?.items?.length ? cmsOutcomes.items : outcomes).map((o: any, i: number) => {
            const style = outcomes[i] || outcomes[0];
            return (
              <div key={i} className={`rounded-2xl border ${style.border} ${style.bg} p-6 flex flex-col gap-3`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${style.bg} border ${style.border} ${style.color}`}>
                  {style.icon}
                </div>
                <h3 className="text-sm font-extrabold text-white leading-snug">{o.title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{o.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-3xl mx-auto rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-950/30 to-slate-900/60 p-10 text-center">
          <h2 className="text-2xl font-extrabold text-white mb-3">Ready to Join the Academy?</h2>
          <p className="text-slate-400 text-sm mb-6 max-w-lg mx-auto">
            Explore our Industry 4.0 curriculum, meet the academic team, and start building the digital manufacturing skills that matter.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a
              href="#courses"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold tracking-wide shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5 cursor-pointer"
            >
              Explore Courses <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#team"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:border-white/25 text-sm font-bold transition-all hover:-translate-y-0.5 cursor-pointer"
            >
              Meet the Team
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
