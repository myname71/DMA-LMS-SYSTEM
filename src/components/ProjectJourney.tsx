import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const milestones = [
  {
    year: 'Jan 2025',
    label: 'Partnership Developed',
    icon: '🤝',
    color: 'bg-blue-500',
    ringColor: 'ring-blue-500/40',
    textColor: 'text-blue-400',
    borderColor: 'border-blue-500/30',
    desc: 'BCU and AIUB co-developed the certification, establishing a transnational academic framework under the British Council Going Global Partnerships Grant.',
  },
  {
    year: 'May 2025',
    label: 'Industry Input Received',
    icon: '🏭',
    color: 'bg-indigo-500',
    ringColor: 'ring-indigo-500/40',
    textColor: 'text-indigo-400',
    borderColor: 'border-indigo-500/30',
    desc: 'UK companies provided best-practice insight aligned with Bangladeshi industry needs, ensuring the curriculum reflects real-world digital manufacturing challenges.',
  },
  {
    year: 'Aug 2025',
    label: 'Webinars Delivered',
    icon: '🎥',
    color: 'bg-violet-500',
    ringColor: 'ring-violet-500/40',
    textColor: 'text-violet-400',
    borderColor: 'border-violet-500/30',
    desc: 'UK academics delivered online capacity-building sessions to support knowledge exchange across both institutions, covering Digital Twins, robotics, and smart factory systems.',
  },
  {
    year: 'Oct 2025',
    label: 'Delegation Visits Completed',
    icon: '✈️',
    color: 'bg-cyan-500',
    ringColor: 'ring-cyan-500/40',
    textColor: 'text-cyan-400',
    borderColor: 'border-cyan-500/30',
    desc: 'Bangladeshi delegates visited Birmingham City University, and BCU delegates visited Bangladesh — strengthening the transnational partnership with on-the-ground collaboration.',
  },
  {
    year: 'Dec 2025',
    label: 'First Cohort Graduated',
    icon: '🎓',
    color: 'bg-emerald-500',
    ringColor: 'ring-emerald-500/40',
    textColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/30',
    desc: 'The course was delivered in person and the first cohort successfully completed the certification, marking a milestone for transnational digital manufacturing education.',
  },
  {
    year: 'May 2026',
    label: 'Future Collaboration Planned',
    icon: '🚀',
    color: 'bg-amber-500',
    ringColor: 'ring-amber-500/40',
    textColor: 'text-amber-400',
    borderColor: 'border-amber-500/30',
    desc: 'The partnership will continue to support future cohorts, collaborative research, and industry engagement — building long-term digital manufacturing capability across both nations.',
  },
];

export default function ProjectJourney() {
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const toggle = (i: number) => setActiveIndex(prev => (prev === i ? -1 : i));

  return (
    <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-20 z-10" id="project-journey">
      {/* Header */}
      <div className="text-center mb-14">
        <span className="text-blue-400 font-bold text-xs uppercase tracking-widest">Timeline</span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3">Project Journey</h2>
        <p className="text-slate-400 text-sm mt-3 max-w-xl mx-auto">From Partnership to Impact</p>
      </div>

      {/* ── Desktop horizontal timeline ── */}
      <div className="hidden md:block">
        {/* Step nodes + connector line */}
        <div className="relative flex items-start">
          {/* Background connector */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-white/8 z-0" />

          {milestones.map((m, i) => {
            const isActive = activeIndex === i;
            return (
              <div key={i} className="flex-1 flex flex-col items-center relative z-10">
                {/* Progress fill up to active */}
                {i < activeIndex && (
                  <div className="absolute top-5 left-1/2 right-0 h-0.5 bg-blue-600/60 z-0" style={{ left: '-50%', right: '50%' }} />
                )}

                {/* Circle node */}
                <button
                  onClick={() => toggle(i)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-lg ring-4 transition-all duration-300 cursor-pointer ${m.color} ${isActive ? `${m.ringColor} scale-110` : 'ring-transparent opacity-70 hover:opacity-100 hover:scale-105'}`}
                >
                  {m.icon}
                </button>

                {/* Year badge */}
                {m.year && (
                  <span className={`mt-2 text-[10px] font-extrabold font-mono px-2 py-0.5 rounded-full border ${m.textColor} ${m.borderColor} bg-slate-900`}>
                    {m.year}
                  </span>
                )}
                {!m.year && <div className="mt-2 h-5" />}

                {/* Label */}
                <p className={`mt-2 text-center text-[11px] font-bold leading-tight px-2 transition-colors ${isActive ? 'text-white' : 'text-slate-400'}`}>
                  {m.label}
                </p>
              </div>
            );
          })}
        </div>

        {/* Accordion detail panel */}
        {activeIndex >= 0 && (
          <div className={`mt-8 mx-auto max-w-2xl rounded-2xl border p-6 bg-gradient-to-b from-slate-900/80 to-slate-950/80 backdrop-blur-sm transition-all duration-300 ${milestones[activeIndex].borderColor}`}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{milestones[activeIndex].icon}</span>
              <div>
                {milestones[activeIndex].year && (
                  <span className={`text-[10px] font-extrabold font-mono uppercase tracking-widest ${milestones[activeIndex].textColor}`}>
                    {milestones[activeIndex].year}
                  </span>
                )}
                <h3 className="text-base font-extrabold text-white leading-tight">{milestones[activeIndex].label}</h3>
              </div>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">{milestones[activeIndex].desc}</p>
          </div>
        )}
      </div>

      {/* ── Mobile vertical accordion ── */}
      <div className="md:hidden space-y-3">
        {milestones.map((m, i) => {
          const isActive = activeIndex === i;
          return (
            <div
              key={i}
              className={`rounded-xl border transition-all duration-300 overflow-hidden ${isActive ? m.borderColor : 'border-white/8'}`}
            >
              <button
                onClick={() => toggle(i)}
                className="w-full flex items-center gap-3 p-4 text-left cursor-pointer"
              >
                <span className={`w-9 h-9 rounded-full flex items-center justify-center text-base shrink-0 shadow-md ring-2 ${m.color} ${isActive ? m.ringColor : 'ring-transparent'}`}>
                  {m.icon}
                </span>
                <div className="flex-1 min-w-0">
                  {m.year && (
                    <span className={`text-[9px] font-extrabold font-mono uppercase tracking-widest ${m.textColor}`}>{m.year}</span>
                  )}
                  <p className={`text-xs font-bold leading-snug ${isActive ? 'text-white' : 'text-slate-300'}`}>{m.label}</p>
                </div>
                {isActive
                  ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                  : <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                }
              </button>

              {isActive && (
                <div className="px-4 pb-4 pt-0">
                  <div className="h-px bg-white/5 mb-3" />
                  <p className="text-xs text-slate-300 leading-relaxed">{m.desc}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
