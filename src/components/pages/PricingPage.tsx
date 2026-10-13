import React, { useState } from 'react';
import { Check, Zap, Star, Shield, ArrowRight, Users, BookOpen, Award } from 'lucide-react';

interface PricingPageProps {
  onRegister: () => void;
  onSignIn: () => void;
}

const plans = [
  {
    id: 'free',
    name: 'Free Learner',
    price: 0,
    period: '',
    badge: null,
    color: 'border-slate-700',
    highlight: false,
    icon: BookOpen,
    description: 'Get started with Course 101 and explore the DMA Academy platform at no cost.',
    features: [
      'Course 101 – Digital Manufacturing (full access)',
      'AI Tutor (demo mode)',
      'Community forum access',
      'Course progress tracking',
      'Digital certificate on completion',
    ],
    cta: 'Start Free',
    note: 'No card required',
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 49,
    period: '/month',
    badge: 'Most Popular',
    color: 'border-blue-500/60',
    highlight: true,
    icon: Zap,
    description: 'Full access to all courses, labs, and live webinars — built for working engineers.',
    features: [
      'All Free Learner features',
      'Unlimited course access (12+ courses)',
      'Live webinar recordings + replays',
      'Priority AI Tutor responses',
      'Industry 4.0 lab simulations',
      'Downloadable course materials',
      'BCU / AIUB co-certified badge',
      'Exam & quiz access (unlimited attempts)',
    ],
    cta: 'Get Professional',
    note: 'Billed monthly · Cancel anytime',
  },
  {
    id: 'enterprise',
    name: 'Enterprise / Cohort',
    price: 299,
    period: '/month',
    badge: 'Team Plan',
    color: 'border-indigo-500/50',
    highlight: false,
    icon: Users,
    description: 'For organisations, universities, and manufacturing cohorts requiring team management.',
    features: [
      'All Professional features',
      'Up to 25 team seats',
      'Admin dashboard with learner analytics',
      'Custom learning paths',
      'Dedicated instructor support',
      'British Council institutional recognition',
      'SLA support (48h response)',
      'Invoice billing available',
    ],
    cta: 'Contact Sales',
    note: 'Custom pricing for 25+ seats',
  },
];

const faqs = [
  { q: 'Can I switch plans?', a: 'Yes — upgrade or downgrade any time. Billing is prorated to the day.' },
  { q: 'Is there a student discount?', a: 'Active university students from AIUB or BCU receive a 50% discount. Contact us with your student ID.' },
  { q: 'Do certificates expire?', a: 'DMA certificates do not expire. They carry the BCU and AIUB co-certification mark permanently.' },
  { q: 'What payment methods are accepted?', a: 'Visa, Mastercard, and bank transfer. Enterprise clients may request annual invoicing.' },
];

export default function PricingPage({ onRegister, onSignIn }: PricingPageProps) {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');
  const discount = 0.2;

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-left">

      {/* Ambient */}
      <div className="absolute top-40 left-1/3 w-96 h-96 bg-blue-600/8 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-80 right-1/4 w-80 h-80 bg-indigo-600/8 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="text-center mb-14 relative z-10">
        <span className="text-[11px] font-bold text-[#00aaff] uppercase font-mono tracking-widest block mb-3">Subscription Plans</span>
        <h1 className="text-4xl font-extrabold text-white mb-4 leading-tight">
          Invest in Industry-Ready Skills
        </h1>
        <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
          British Council co-funded curriculum. BCU & AIUB certified. Choose the plan that fits your pace — or start completely free.
        </p>

        {/* Billing toggle */}
        <div className="inline-flex items-center gap-3 mt-8 p-1.5 bg-slate-900/80 border border-slate-800 rounded-xl">
          <button
            onClick={() => setBilling('monthly')}
            className={`px-5 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${billing === 'monthly' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30' : 'text-slate-400 hover:text-white'}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling('annual')}
            className={`px-5 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${billing === 'annual' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30' : 'text-slate-400 hover:text-white'}`}
          >
            Annual
            <span className="text-[9px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded font-mono">-20%</span>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        {plans.map(plan => {
          const Icon = plan.icon;
          const displayPrice = plan.price === 0 ? 0 : billing === 'annual' ? Math.round(plan.price * (1 - discount)) : plan.price;
          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl border ${plan.color} ${plan.highlight ? 'bg-gradient-to-b from-blue-950/60 to-[#0d1526]/90 shadow-xl shadow-blue-900/20' : 'bg-[#0d1526]/80'} p-6 flex flex-col gap-5 transition-all hover:border-opacity-80`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className={`text-[9px] font-extrabold uppercase font-mono px-3 py-1 rounded-full ${plan.highlight ? 'bg-blue-600 text-white' : 'bg-indigo-600/80 text-white'}`}>
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-xl ${plan.highlight ? 'bg-blue-600/20' : 'bg-slate-800/60'}`}>
                  <Icon className={`w-5 h-5 ${plan.highlight ? 'text-blue-400' : 'text-slate-400'}`} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white">{plan.name}</h3>
                  <p className="text-[10px] text-slate-500 leading-snug mt-0.5">{plan.description}</p>
                </div>
              </div>

              <div>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-extrabold text-white">
                    {plan.price === 0 ? 'Free' : `$${displayPrice}`}
                  </span>
                  {plan.price > 0 && <span className="text-slate-500 text-xs mb-1.5">{plan.period}</span>}
                </div>
                {billing === 'annual' && plan.price > 0 && (
                  <p className="text-[10px] text-green-400 font-mono mt-0.5">
                    Save ${Math.round(plan.price * discount * 12)}/yr vs monthly
                  </p>
                )}
                {plan.note && <p className="text-[10px] text-slate-600 font-mono mt-1">{plan.note}</p>}
              </div>

              <ul className="space-y-2 flex-1">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-[11px] text-slate-300">
                    <Check className="w-3.5 h-3.5 text-green-400 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={plan.id === 'enterprise' ? () => window.location.href = 'mailto:info@digitalmanufacturing.academy?subject=Enterprise Plan Inquiry' : onRegister}
                className={`w-full py-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  plan.highlight
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-900/30'
                    : 'bg-white/6 hover:bg-white/10 text-slate-200 border border-white/8'
                }`}
              >
                {plan.cta} <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Trust strip */}
      <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        {[
          { icon: Shield, label: 'BCU & AIUB Certified', desc: 'Credentials carry UK and Bangladesh institutional recognition.' },
          { icon: Star,   label: 'British Council Funded', desc: 'Curriculum developed under the British Council TNE framework.' },
          { icon: Award,  label: 'Industry 4.0 Aligned', desc: 'Mapped to Smart Factory, Digital Twin, IoT, and Robotics job roles.' },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className="flex items-start gap-3 p-5 rounded-xl border border-slate-800/60 bg-white/2">
              <Icon className="w-5 h-5 text-[#00aaff] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-extrabold text-white">{item.label}</p>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{item.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* FAQ */}
      <div className="mt-16 relative z-10">
        <h2 className="text-lg font-extrabold text-white mb-6">Frequently Asked Questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {faqs.map((faq, i) => (
            <div key={i} className="p-5 rounded-xl border border-slate-800/60 bg-[#0d1526]/60 space-y-1.5">
              <p className="text-xs font-extrabold text-white">{faq.q}</p>
              <p className="text-[11px] text-slate-400 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA banner */}
      <div className="mt-14 p-8 rounded-2xl border border-blue-500/20 bg-gradient-to-r from-blue-950/40 to-indigo-950/30 text-center relative z-10">
        <h3 className="text-xl font-extrabold text-white mb-2">Already have an account?</h3>
        <p className="text-slate-400 text-xs mb-5">Sign in to manage your subscription or upgrade your plan.</p>
        <button
          onClick={onSignIn}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/8 hover:bg-white/12 border border-white/10 text-white text-xs font-extrabold cursor-pointer transition-all"
        >
          Sign In to My Account <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
