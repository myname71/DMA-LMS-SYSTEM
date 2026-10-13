import React, { useState, useEffect } from 'react';

// ─── Intro Video Configuration ───────────────────────────────────────────────
// Set to a YouTube, Vimeo, or Google Drive preview URL to display the intro video.
// Leave empty ("") to show the "Coming Soon" fallback.
// YouTube embed format:  https://www.youtube.com/embed/VIDEO_ID?autoplay=1&mute=1&loop=1&playlist=VIDEO_ID
// Vimeo embed format:    https://player.vimeo.com/video/VIDEO_ID?autoplay=1&muted=1&loop=1
// Google Drive format:   https://drive.google.com/file/d/FILE_ID/preview
const INTRO_VIDEO_URL = "https://drive.google.com/file/d/1NYKGfU5RebkRKQv57zeC3hjnTio_kAM5/view?usp=drive_link"
  .replace("/view?usp=drive_link", "/preview");
// ─────────────────────────────────────────────────────────────────────────────

import { 
  ArrowRight, Award, Brain, Calendar, ShieldCheck, 
  Handshake, Users, ChevronRight, HelpCircle, 
  Play, Check, Sparkles, AlertCircle, MessageSquare,
  Linkedin, Mail, Twitter
} from 'lucide-react';

import javaidButt from '../assets/images/team/javaid-butt.webp';
import abdurRahman from '../assets/images/team/abdur-rahman.webp';
import ashikKhan from '../assets/images/team/ashik-khan.webp';
import adnan from '../assets/images/team/adnan.webp';
import chowdhuryAkram from '../assets/images/team/chowdhury-akram.webp';
import mahmudulHasan from '../assets/images/team/mahmudul-hasan.webp';
import saniatZishan from '../assets/images/team/saniat-zishan.webp';
import { Course, SubscriptionPlan } from '../types';
import { SUBSCRIPTION_PLANS, GENERAL_FAQS } from '../data/coursesData';
import ProjectJourney from './ProjectJourney';
import PlexusCanvas from './PlexusCanvas';

const RESUME_KEY = 'dma_last_free_course';

interface LandingPageProps {
  courses: Course[];
  onEnroll: (courseId: string) => void;
  onLaunchPlayer?: (course: Course) => void;
  onExploreCategories: () => void;
  onExploreCourses: () => void;
  setRegisterOpen: (open: boolean) => void;
  setLoginOpen: (open: boolean) => void;
  onSelectCourse: (course: Course) => void;
  onResumeCourse?: (courseId: string) => void;
  cmsContent?: any;
}

export default function LandingPage({
  courses,
  onEnroll,
  onLaunchPlayer,
  onExploreCategories,
  onExploreCourses,
  setRegisterOpen,
  setLoginOpen,
  onSelectCourse,
  onResumeCourse,
  cmsContent,
}: LandingPageProps) {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [activePlan, setActivePlan] = useState<'basic' | 'pro' | 'enterprise'>('pro');

  /* ── "Continue where you left off" resume banner ── */
  const [resumeData, setResumeData] = useState<{ courseId: string; courseTitle: string; courseLevel: string } | null>(null);
  const [resumeDismissed, setResumeDismissed] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(RESUME_KEY);
      if (raw) setResumeData(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  // Swipe-cycling headline words
  const swipeWords = ['Academy', 'learning hub'];
  const [swipeIndex, setSwipeIndex] = useState(0);
  const [swipeOut, setSwipeOut] = useState(false);
  useEffect(() => {
    const interval = setInterval(() => {
      setSwipeOut(true);
      setTimeout(() => {
        setSwipeIndex(i => (i + 1) % swipeWords.length);
        setSwipeOut(false);
      }, 380);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const categories = [
    { icon: '🤖', name: 'Industrial Robotics & Automation', count: 8 },
    { icon: '🏭', name: 'Smart Factory & IoT', count: 6 },
    { icon: '🖨️', name: 'Additive Manufacturing & 3D Printing', count: 10 },
    { icon: '💻', name: 'Digital Twin Technology', count: 12 },
    { icon: '🧠', name: 'AI & Machine Learning', count: 7 },
    { icon: '📐', name: 'Physics-Based Simulation', count: 6 },
  ];

  const stats = [
    { num: '5,200+', label: 'Registered Students', icon: Users },
    { num: '12+', label: 'Industry 4.0 Courses', icon: Handshake },
    { num: '50+', label: 'Expert Instructors', icon: Brain },
    { num: '3.4K+', label: 'Global Certifications', icon: Award }
  ];

  // CMS overrides for each section
  const homePage = cmsContent?.pages?.find((p: any) => p.id === 'home');
  const cmsSection = (id: string) => homePage?.sections?.find((s: any) => s.id === id);
  const cmsHero = cmsSection('hero')?.content;
  const cmsStats = cmsSection('stats')?.content;
  const cmsCats = cmsSection('categories')?.content;
  const cmsFaq = cmsSection('faq')?.content;

  const displayStats = cmsStats?.items?.length
    ? cmsStats.items.map((item: any, idx: number) => ({ ...stats[idx], num: item.num, label: item.label }))
    : stats;
  const displayCategories = cmsCats?.items?.length ? cmsCats.items : categories;
  const displayFaqs = cmsFaq?.items?.length
    ? cmsFaq.items.map((f: any) => ({ question: f.q, answer: f.a }))
    : GENERAL_FAQS;

  const bcuTeam = [
    {
      name: 'Prof Javaid Butt',
      role: 'Lead Investigator',
      title: 'Professor of Manufacturing & Product Design, BCU',
      img: javaidButt,
      isLead: true,
      social: { linkedin: 'https://www.linkedin.com/in/javaid-butt-phd-fhea-43029514/', email: 'j.butt@bcu.ac.uk', twitter: '#' },
    },
    {
      name: 'Dr. Ashikul Alam Khan',
      role: 'Co-Investigator',
      title: 'Program Director, MSc Management Suite',
      img: ashikKhan,
      isLead: false,
      social: { linkedin: '#', email: 'ashikul.khan@bcu.ac.uk', twitter: '#' },
    },
    {
      name: 'Dr. Muhammad Adnan',
      role: 'Co-Investigator',
      title: 'Lecturer in Project Management, BCU',
      img: adnan,
      isLead: false,
      social: { linkedin: '#', email: 'm.adnan@bcu.ac.uk', twitter: '#' },
    },
  ];

  const aiubTeam = [
    {
      name: 'Prof. Dr. Abdur Rahman',
      role: 'Lead Investigator',
      title: 'Pro Vice Chancellor, AIUB',
      img: abdurRahman,
      isLead: true,
      social: { linkedin: 'https://www.linkedin.com/in/abdur-rahman-aiub/', email: 'abdur.rahman@aiub.edu', twitter: '#' },
    },
    {
      name: 'Prof. Saniat Rahman Zisan',
      role: 'Co-Investigator',
      title: 'Head, Department of Computer Engineering (CoE), AIUB',
      img: saniatZishan,
      isLead: false,
      social: { linkedin: '#', email: 'saniat@aiub.edu', twitter: '#' },
    },
    {
      name: 'Dr. Chowdhury Akram Hossain',
      role: 'Co-Investigator',
      title: 'Head of the Department of Computer Engineering, AIUB',
      img: chowdhuryAkram,
      isLead: false,
      social: { linkedin: '#', email: 'akram@aiub.edu', twitter: '#' },
    },
    {
      name: 'Mahmudul Hasan',
      role: 'Co-Investigator',
      title: 'Assistant Professor, Dept. of Industrial & Publications, AIUB',
      img: mahmudulHasan,
      isLead: false,
      social: { linkedin: '#', email: 'mahmudul@aiub.edu', twitter: '#' },
    },
  ];

  const testimonials = [
    {
      name: 'Nadim Chowdhury',
      role: 'Factory Automation Expert, Beximco',
      img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop',
      text: 'The Digital Twin simulation curriculum allowed us to implement predictive G-Code diagnostics in our textile loom layouts, reducing tooling downtime by 24%. Unmatched academic-industry depth!',
      rating: 5
    },
    {
      name: 'Dr. Jane Edwards',
      role: 'Additive Manufacturing Director, JHG Corp',
      img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&h=120&fit=crop',
      text: 'The MQTT sensor nodes deployment guide co-designed by BCU is the finest pedagogical reference for smart instrumentation. Real code, realistic physics-based simulations, stellar structure.',
      rating: 5
    }
  ];

  return (
    <div className="relative w-full text-white overflow-x-hidden pt-18" id="landing-page">
      {/* Visual background pattern */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-[#090d1f] to-[#020617] z-0" />
      <div className="absolute top-0 left-0 right-0 h-[600px] bg-[radial-gradient(ellipse_at_top,rgba(37,99,235,0.15),transparent_55%)] z-0 pointer-events-none" />

      {/* Plexus animated background — hero zone only */}
      <div className="absolute top-0 left-0 right-0 h-[700px] z-0 pointer-events-none" style={{ opacity: 0.5 }}>
        <PlexusCanvas className="absolute inset-0" />
      </div>

      {/* Hero Section */}
      <section className="relative w-full px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-7xl mx-auto pt-12 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Hero Left Content */}
          <div className="text-left space-y-5">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <img src="/partners-logo.png" alt="Partners" className="h-20 sm:h-24 md:h-28 w-auto object-contain" />
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>{cmsHero?.badge || 'British Council Funded • BCU & AIUB Partnership Program'}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-5xl font-extrabold tracking-tight leading-tight" id="hero-title">
              <span className="block">{cmsHero?.headline || 'Digital Manufacturing'}</span>
              {cmsHero?.headlineHighlight ? (
                <span className="block bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  {cmsHero.headlineHighlight}
                </span>
              ) : (
                <span className="block overflow-hidden" style={{ height: '1.2em' }}>
                  <span
                    className="block bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent"
                    style={{
                      transition: 'transform 0.38s cubic-bezier(0.4,0,0.2,1), opacity 0.38s ease',
                      transform: swipeOut ? 'translateY(-110%)' : 'translateY(0)',
                      opacity: swipeOut ? 0 : 1,
                    }}
                  >
                    {swipeWords[swipeIndex]}
                  </span>
                </span>
              )}
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed border-l-2 border-blue-500/80 pl-4 py-1" id="hero-certification-desc">
              {cmsHero?.subheadline ? cmsHero.subheadline : (
                <strong className="text-white font-semibold">A British Council-funded BCU-AIUB program helping learners build capability in digital twins, AI, robotics, simulation, additive manufacturing and sustainable smart factory systems — shaped by industry input from the UK &amp; Bangladesh.</strong>
              )}
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <button 
                onClick={onExploreCourses}
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm tracking-wide shadow-lg shadow-blue-500/20 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
                id="hero-start-learning-btn"
              >
                {cmsHero?.primaryCTA || 'Start Free Learning'}
              </button>
              <button 
                onClick={() => setRegisterOpen(true)}
                className="px-6 py-3 rounded-xl border border-white/10 bg-white/5 text-slate-200 font-extrabold text-sm tracking-wide hover:bg-white/10 transition-all cursor-pointer"
                id="hero-instructor-btn"
              >
                {cmsHero?.secondaryCTA || 'Become Instructor'}
              </button>
            </div>

            {/* Micro infographics statistics row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
              {displayStats.map((s, idx) => (
                <div key={idx} className="p-3 rounded-xl glass-card hover:border-white/20 transition-all duration-300">
                  <div className="flex items-center gap-1.5 text-blue-400 mb-0.5">
                    <s.icon className="w-3.5 h-3.5 text-blue-400" />
                    <span className="font-extrabold text-sm text-blue-400 font-mono leading-none">{s.num}</span>
                  </div>
                  <div className="text-[9px] text-slate-400 font-medium uppercase tracking-wider">{s.label}</div>
                </div>
              ))}
            </div>
            {cmsStats?.imageUrl && (
              <img src={cmsStats.imageUrl} alt="Statistics section" className="w-full h-20 object-cover rounded-xl border border-white/10 mt-3" />
            )}
          </div>

          {/* Hero Right Interactive Illustration: GG TNE Industry 4.0 Transformation */}
          <div className="relative group flex items-center justify-center">
            {/* Ambient neon circles */}
            <div className="absolute top-[10%] left-[10%] w-72 h-72 bg-blue-650 opacity-15 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[10%] right-[10%] w-72 h-72 bg-indigo-650 opacity-10 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative w-full max-w-md p-6 rounded-3xl glass-card-heavy shadow-2xl space-y-6" id="hero-course-101-card">
              {/* Featured Course Badge */}
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded bg-[#00aaff]/10 border border-[#00aaff]/30 text-[#00ddff] text-[10px] font-bold uppercase tracking-wider font-mono">
                  ACADEMY FLAGSHIP
                </span>
                <span className="flex items-center gap-1 text-[11px] text-amber-400 font-bold font-mono">
                  ★ 4.9 <span className="text-slate-400">(150)</span>
                </span>
              </div>

              {/* Course Title & Cover Media with Live Simulator Overlay */}
              <div 
                onClick={() => {
                  const course101 = courses.find(c => c.id === 'c_101');
                  if (course101) onSelectCourse(course101);
                }}
                className="relative rounded-2xl overflow-hidden aspect-video border border-white/10 shadow-inner group-hover:border-blue-550 transition-colors cursor-pointer group/cover"
              >
                {/* Cover Image */}
                <img 
                  src={cmsHero?.imageUrl || "/course-cover.webp"} 
                  alt="Digital Manufacturing Academy Course 101" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover/cover:scale-105"
                  referrerPolicy="no-referrer"
                />

                {/* Simulated live video overlay */}
                <div className="absolute inset-0 bg-[#000]/50 z-10 flex flex-col justify-between p-4">
                  <div className="flex justify-between items-start">
                    <span className="px-2 py-0.5 rounded bg-blue-600/95 text-white text-[9px] font-extrabold tracking-widest uppercase animate-pulse">
                      TNE CERTIFIED
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-black/60 text-slate-300 text-[8px] font-semibold">
                      36 Hours
                    </span>
                  </div>
                  
                  <div className="text-left flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-lg">
                      <Play className="w-4 h-4 fill-white ml-0.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-white">Course 101 Video Syllabus</h4>
                      <p className="text-[10px] text-slate-300">Click to preview active lab modules</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Course details information */}
              <div className="text-left space-y-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 font-mono">
                  Smart Factory • Advanced Certification
                </span>
                <h3 className="text-lg font-extrabold text-white leading-snug">
                  Digital Manufacturing Academy Course 101
                </h3>
                <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed font-sans">
                  An expert-designed British Council co-certified curriculum covering the complete Industrial Evolution from Industry 4.0 to Industry 5.0/6.0, Digital Twins (ISO 23247), additive workflows, Cobots, and cybersecurity protocols.
                </p>
              </div>

              {/* Course metadata tag indicators */}
              <div className="grid grid-cols-3 gap-2 py-2 border-y border-white/5 text-center text-[10px] font-mono text-slate-300">
                <div className="flex flex-col">
                  <span className="text-blue-400 font-bold uppercase text-[9px]">Instructor</span>
                  <span className="text-slate-200 truncate mt-0.5 font-sans font-medium">Prof Javaid Butt</span>
                </div>
                <div className="flex flex-col border-x border-white/5">
                  <span className="text-blue-400 font-bold uppercase text-[9px]">Syllabus</span>
                  <span className="text-slate-200 mt-0.5 font-sans font-medium">6 Modules</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-blue-400 font-bold uppercase text-[9px]">Rating</span>
                  <span className="text-slate-200 mt-0.5 font-sans font-medium font-mono">4.9 ★</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-1">
                <button 
                  onClick={() => {
                    const course101 = courses.find(c => c.id === 'c_101');
                    if (course101) {
                      onSelectCourse(course101);
                    } else {
                      onExploreCourses();
                    }
                  }}
                  className="flex-1 text-center py-2.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-bold tracking-wide text-slate-100 transition-all cursor-pointer"
                >
                  Curriculum Details
                </button>
                <button 
                  onClick={() => {
                    const course101 = courses.find(c => c.id === 'c_101');
                    if (course101 && onLaunchPlayer) { onLaunchPlayer(course101); }
                    else { onEnroll('c_101'); }
                  }}
                  className="flex-1 text-center py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 hover:shadow-[0_0_15px_rgba(37,99,235,0.4)] text-xs font-extrabold text-white transition-all cursor-pointer"
                >
                  Enroll Free
                </button>
              </div>
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* ── "Continue where you left off" resume banner ── */}
      {resumeData && !resumeDismissed && onResumeCourse && (
        <div className="relative z-20 w-full px-4 sm:px-6 lg:px-8 -mt-4 mb-2">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 py-4 rounded-2xl bg-gradient-to-r from-[#0d1f47] via-[#0f2250] to-[#0d1f47] border border-blue-500/30 shadow-lg shadow-blue-900/30">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center shrink-0 text-base">▶</div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-0.5">Continue where you left off</p>
                  <p className="text-sm font-extrabold text-white truncate">{resumeData.courseTitle}</p>
                  {resumeData.courseLevel && (
                    <p className="text-[10px] text-slate-400 mt-0.5">{resumeData.courseLevel}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                <button
                  onClick={() => onResumeCourse(resumeData.courseId)}
                  className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold cursor-pointer transition-all shadow-lg shadow-blue-900/30 hover:-translate-y-0.5"
                >
                  Resume Course →
                </button>
                <button
                  onClick={() => { setResumeDismissed(true); localStorage.removeItem(RESUME_KEY); }}
                  className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/5 cursor-pointer transition-all"
                  aria-label="Dismiss"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Intro Video Section */}
      <section className="relative w-full px-4 sm:px-6 lg:px-8 z-10 py-16" id="intro-video">
        <div className="max-w-4xl mx-auto text-center">
          {/* Header text */}
          <span className="text-blue-400 font-bold text-xs uppercase tracking-widest">Welcome to the Academy</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3 mb-3 leading-tight">
            See What You'll <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Achieve</span>
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-8 max-w-2xl mx-auto">
            Get a glimpse of our world-class curriculum, expert instructors, and the real-world industry skills you'll gain through this British Council-funded programme.
          </p>

          {/* Video container — 16:9 responsive */}
          <div className="relative w-full rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(37,99,235,0.18)] border border-white/10"
            style={{ paddingTop: '56.25%' /* 16:9 */ }}>
            {INTRO_VIDEO_URL ? (
              <iframe
                src={INTRO_VIDEO_URL}
                className="absolute inset-0 w-full h-full"
                title="Academy Introduction Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              /* Fallback: Coming Soon */
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#0d1630] to-[#0a0f1e]">
                <div className="w-16 h-16 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center mb-4 shadow-[0_0_24px_rgba(37,99,235,0.25)]">
                  <Play className="w-7 h-7 text-blue-400 fill-blue-400 ml-1" />
                </div>
                <p className="text-white font-extrabold text-lg tracking-wide">Coming Soon</p>
                <p className="text-slate-400 text-sm mt-1">Our intro video is on its way. Stay tuned!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Why This Programme Matters */}
      <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-20 z-10" id="why-matters">
        <div className="max-w-3xl mb-12">
          <span className="text-blue-400 font-bold text-xs uppercase tracking-widest">Why This Programme Matters</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3 mb-5 leading-tight">
            A Certification for Practical<br className="hidden sm:block" /> Digital Manufacturing Skills
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-4">
            This certification was developed to address a clear need: structured, practical, and industry-relevant learning in digital manufacturing. Through a British Council-funded UK–Bangladesh partnership, BCU and AIUB worked with academic and industry stakeholders to create a program that supports learners, educators, and professionals in moving from digital awareness to practical capability.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            {
              icon: '🏭',
              title: 'Industry-Informed',
              desc: 'Developed with input from industry stakeholders in the UK and Bangladesh to reflect practical digital transformation needs, not just theoretical concepts.',
              accent: 'border-blue-500/30 hover:border-blue-400/50',
              glow: 'hover:shadow-[0_0_25px_rgba(37,99,235,0.12)]',
              tag: 'Industry Stakeholders',
              tagColor: 'font-bold text-blue-400 bg-blue-500/10 border-blue-500/20',
            },
            {
              icon: '🌐',
              title: 'Internationally Developed',
              desc: 'Created through a British Council-funded partnership between Birmingham City University and American International University–Bangladesh, combining UK academic expertise with Bangladesh\'s local priorities.',
              accent: 'border-indigo-500/30 hover:border-indigo-400/50',
              glow: 'hover:shadow-[0_0_25px_rgba(99,102,241,0.12)]',
              tag: 'British Council Funded',
              tagColor: 'font-bold text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
            },
            {
              icon: '⚙️',
              title: 'UK-Bangladesh partnership',
              desc: 'Designed to help learners understand how digital twins, AI, robotics, simulation, additive manufacturing and smart factory systems can be applied to improve productivity, quality, sustainability and competitiveness.',
              accent: 'border-orange-500/30 hover:border-orange-400/50',
              glow: 'hover:shadow-[0_0_25px_rgba(249,115,22,0.12)]',
              tag: 'Global Partnership',
              tagColor: 'font-normal text-[#046dff] bg-orange-500/10 border-orange-500/20',
            },
          ].map(card => (
            <div
              key={card.title}
              className={`rounded-2xl border bg-gradient-to-b from-slate-900/70 to-slate-950/70 p-6 transition-all duration-300 ${card.accent} ${card.glow}`}
            >
              <div className="text-3xl mb-4">{card.icon}</div>
              <span className={`text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full border ${card.tagColor} mb-3 inline-block`}>
                {card.tag}
              </span>
              <h3 className="text-base font-extrabold text-white mb-2 leading-snug">{card.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Project Journey Timeline */}
      <ProjectJourney />

      {/* Team Members Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-20 z-10" id="team">
        <div className="text-center space-y-3 mb-14">
          <span className="text-blue-400 font-bold text-xs uppercase tracking-widest">The Researchers Behind DMA</span>
          <h2 className="text-3xl font-extrabold text-white">Meet the Academic Team</h2>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto">
            A joint BCU–AIUB faculty assembled under the British Council Going Global Partnerships Grant to design and deliver the Digital Manufacturing Academy curriculum.
          </p>
        </div>

        {/* Team BCU */}
        <div className="mb-14">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-3 h-3 rounded-full bg-blue-500 shrink-0" />
            <h3 className="text-lg font-extrabold text-blue-400 uppercase tracking-widest text-sm">Team BCU — Birmingham City University</h3>
            <div className="flex-1 h-px bg-blue-500/20" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {bcuTeam.map(m => (
              <div key={m.name} className={`rounded-2xl border bg-gradient-to-b from-slate-900/80 to-slate-950/80 backdrop-blur-sm overflow-hidden group hover:border-blue-500/40 transition-all duration-300 hover:shadow-[0_0_30px_rgba(37,99,235,0.1)] ${m.isLead ? 'border-blue-500/30' : 'border-white/8'}`}>
                <div className={`relative overflow-hidden ${m.isLead ? 'h-72' : 'h-56'}`}>
                  <img src={m.img} alt={m.name} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  {m.isLead && (
                    <span className="absolute top-3 left-3 text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full border bg-blue-600/20 border-blue-500/30 text-blue-400 backdrop-blur-sm">
                      Lead Investigator
                    </span>
                  )}
                </div>
                <div className="p-5 text-left">
                  <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1 font-mono">{m.role}</div>
                  <h3 className={`font-extrabold text-white leading-tight ${m.isLead ? 'text-base' : 'text-sm'}`}>{m.name}</h3>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{m.title}</p>
                  <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/5">
                    <a href={m.social.linkedin} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-blue-400 transition-colors" title="LinkedIn">
                      <Linkedin className="w-3.5 h-3.5" />
                    </a>
                    <a href={`mailto:${m.social.email}`} className="text-slate-500 hover:text-blue-400 transition-colors" title="Email">
                      <Mail className="w-3.5 h-3.5" />
                    </a>
                    <a href={m.social.twitter} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-blue-400 transition-colors" title="Twitter / X">
                      <Twitter className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team AIUB */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <span className="w-3 h-3 rounded-full bg-orange-500 shrink-0" />
            <h3 className="text-lg font-extrabold text-orange-400 uppercase tracking-widest text-sm">Team AIUB — American International University–Bangladesh</h3>
            <div className="flex-1 h-px bg-orange-500/20" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {aiubTeam.map(m => (
              <div key={m.name} className={`rounded-2xl border bg-gradient-to-b from-slate-900/80 to-slate-950/80 backdrop-blur-sm overflow-hidden group hover:border-orange-500/40 transition-all duration-300 hover:shadow-[0_0_30px_rgba(249,115,22,0.1)] ${m.isLead ? 'border-orange-500/30' : 'border-white/8'}`}>
                <div className={`relative overflow-hidden ${m.isLead ? 'h-72' : 'h-56'}`}>
                  <img src={m.img} alt={m.name} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  {m.isLead && (
                    <span className="absolute top-3 left-3 text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full border bg-orange-600/20 border-orange-500/30 text-orange-400 backdrop-blur-sm">
                      Lead Investigator
                    </span>
                  )}
                </div>
                <div className="p-5 text-left">
                  <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1 font-mono">{m.role}</div>
                  <h3 className={`font-extrabold text-white leading-tight ${m.isLead ? 'text-base' : 'text-sm'}`}>{m.name}</h3>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{m.title}</p>
                  <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/5">
                    <a href={m.social.linkedin} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-orange-400 transition-colors" title="LinkedIn">
                      <Linkedin className="w-3.5 h-3.5" />
                    </a>
                    <a href={`mailto:${m.social.email}`} className="text-slate-500 hover:text-orange-400 transition-colors" title="Email">
                      <Mail className="w-3.5 h-3.5" />
                    </a>
                    <a href={m.social.twitter} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-orange-400 transition-colors" title="Twitter / X">
                      <Twitter className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What You Will Learn */}
      <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-20 z-10" id="what-you-learn">
        <div className="text-center mb-12">
          <span className="text-blue-400 font-bold text-xs uppercase tracking-widest">Course 101 Curriculum</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3">What You Will Learn</h2>
          <p className="text-slate-400 text-sm mt-3 max-w-xl mx-auto">Six focused modules building from foundational concepts to advanced industrial deployment.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              num: '01',
              icon: '🗺️',
              title: 'Course Roadmap & Industry Evolution',
              intro: 'Industry 4.0 → 5.0 → 6.0 progression. BCU-AIUB collaboration structure, learning objectives, and self-assessment baseline.',
              color: 'text-blue-400',
              border: 'border-blue-500/20 hover:border-blue-400/40',
            },
            {
              num: '02',
              icon: '🖨️',
              title: 'Advanced Design & Additive Manufacturing',
              intro: 'Parametric and generative CAD, topology optimisation, DfX frameworks, AR/VR prototyping, and FDM/SLA additive workflows.',
              color: 'text-violet-400',
              border: 'border-violet-500/20 hover:border-violet-400/40',
            },
            {
              num: '03',
              icon: '💻',
              title: 'Physics-Based Simulations & Digital Twins',
              intro: 'FEA, CFD, DEM analysis. ISO 23247 five-layer Digital Twin architecture and bidirectional synchronisation principles.',
              color: 'text-cyan-400',
              border: 'border-cyan-500/20 hover:border-cyan-400/40',
            },
            {
              num: '04',
              icon: '📊',
              title: 'Big Data, Edge AI & Cybersecurity',
              intro: 'Industrial data platforms, edge computing, ML-driven predictive analytics, and OT cybersecurity risk registers for smart factories.',
              color: 'text-emerald-400',
              border: 'border-emerald-500/20 hover:border-emerald-400/40',
            },
            {
              num: '05',
              icon: '🤖',
              title: 'Collaborative Robotics & Smart Factory',
              intro: 'Cobot integration, 6-axis arm programming, PLC ladder logic, Siemens S7-1200, G-code optimisation, and MQTT sensor networks.',
              color: 'text-orange-400',
              border: 'border-orange-500/20 hover:border-orange-400/40',
            },
            {
              num: '06',
              icon: '🏆',
              title: 'Digital Maturity & Certification Pathway',
              intro: 'Digital maturity readiness roadmaps, sustainability metrics, circular economy design, and BCU-AIUB TNE certification assessment.',
              color: 'text-amber-400',
              border: 'border-amber-500/20 hover:border-amber-400/40',
            },
          ].map(mod => (
            <div
              key={mod.num}
              className={`rounded-xl border bg-slate-900/50 p-5 transition-all duration-200 hover:bg-slate-900/80 ${mod.border}`}
            >
              <div className="flex items-start gap-3 mb-3">
                <span className={`text-[10px] font-extrabold font-mono ${mod.color} bg-slate-800 border border-white/5 rounded-md px-2 py-1 shrink-0 leading-none`}>
                  {mod.num}
                </span>
                <span className="text-lg leading-none mt-0.5">{mod.icon}</span>
              </div>
              <h3 className="text-sm font-extrabold text-white mb-2 leading-snug">{mod.title}</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">{mod.intro}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={onExploreCourses}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold tracking-wide shadow-lg shadow-blue-500/20 transition-all cursor-pointer hover:-translate-y-0.5"
          >
            <span>Explore Full Curriculum</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Partnerships Logo section */}
      <section className="relative border-y border-white/5 bg-white/[0.01] backdrop-blur-sm py-14 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-10">
          <p className="text-slate-400 uppercase font-bold text-xs tracking-widest">
            CO-DEVELOPERS & ACADEMIC CERTIFIERS
          </p>
          <div className="flex flex-wrap items-center justify-center gap-10 sm:gap-16 lg:gap-24 grayscale opacity-75 hover:grayscale-0 hover:opacity-100 transition-all">
            <div className="flex flex-col items-center gap-3">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-2xl sm:text-3xl shadow-lg">BC</div>
              <span className="text-slate-300 font-extrabold text-base sm:text-lg font-sans tracking-wide">British Council</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-blue-400 text-2xl sm:text-3xl shadow-lg">BCU</div>
              <span className="text-slate-300 font-extrabold text-base sm:text-lg font-sans">Birmingham City Univ.</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-emerald-600/30 flex items-center justify-center font-bold text-emerald-400 text-2xl sm:text-3xl shadow-lg">AIUB</div>
              <span className="text-slate-300 font-extrabold text-base sm:text-lg font-sans">AIUB Bangladesh</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-20 z-10 text-center" id="features">
        <div className="max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-blue-400 font-bold text-xs uppercase tracking-widest">PEDAGOGICAL INNOVATIONS</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Our learning{' '}
            <span
              className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent"
              style={{ filter: 'drop-shadow(0 0 12px rgba(59,130,246,0.75))' }}
            >
              Omnichannel
            </span>{' '}
            has made the learning pathway a proper structure
          </h2>
          <p className="text-slate-400 text-sm">
            Designed as a high-fidelity SaaS education experience mirroring real factory setups. Every feature is optimized to build professional capability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: Award, title: 'Smart Certifications', desc: 'Secure, cryptographic certificates instantly generated when students clear 100% video modules and pass all active quizzes.', badge: 'Automatic' },
            { icon: Brain, title: 'Automated Power', desc: 'In our course modules, students can get through it and learn seamlessly with slides made with our mentors — guided by DMA Automation 1.1 in real time.', badge: 'DMA Automation 1.1' },
            { icon: Handshake, title: 'Real-world Skill Development', desc: 'Hands-on ladder logic diagrams, realistic CAD Twin models, and PLC simulation sandbox resources.', badge: 'Simulation' },
            { icon: Users, title: 'Global Multi-Role System', desc: 'Pre-configured workspace states for Students, instructors, Administrators, and Super-Admins to try.', badge: '4 Dashboards' },
            { icon: Calendar, title: 'Dynamic Academic Calendar', desc: 'Stay updated on coming industrial webinars, BCU partner workshops, and direct research symposiums.', badge: 'Syllabus' },
            { icon: ShieldCheck, title: 'Highly Secured API Gateway', desc: 'Full sanctum authentication mimic, encrypted uploads tracker, role-based database middleware safeguards.', badge: 'Enterprise' }
          ].map((f, idx) => (
            <div key={idx} className="p-8 rounded-2xl glass-card hover:border-white/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-blue-500/5 text-left space-y-4 shadow-lg group">
              <div className="flex justify-between items-center">
                <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 group-hover:text-blue-300 transition-colors">
                  <f.icon className="w-6 h-6 text-blue-500" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-350">{f.badge}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-100">{f.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Learning Categories Grid */}
      <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-16 z-10 text-center" id="categories-deck">
        <div className="p-8 sm:p-12 rounded-3xl glass-card space-y-12">
          <div className="max-w-xl mx-auto space-y-4">
            <span className="text-blue-400 font-bold text-xs uppercase tracking-widest">CURRICULUM SPECIALTIES</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Manufacturing Disciplines & Labs</h2>
            {cmsCats?.imageUrl && <img src={cmsCats.imageUrl} alt="Learning categories" className="w-full h-28 object-cover rounded-2xl border border-white/10 mt-5" />}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            {displayCategories.map((cat, idx) => (
              <div 
                key={idx} 
                onClick={onExploreCategories}
                className="p-5 rounded-2xl glass-card cursor-pointer text-center space-y-3 shadow-sm group transition-all duration-300 hover:scale-[1.02] hover:border-white/20 hover:bg-white/[0.06]"
              >
                <div className="text-3xl group-hover:animate-bounce duration-500">{cat.icon}</div>
                <div className="text-xs font-extrabold leading-snug">{cat.name}</div>
                <div className="text-[10px] font-mono text-slate-450">{typeof cat.count === 'number' ? `${cat.count} syllabus nodes` : cat.count}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Courses Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-24 z-10" id="courses">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12 text-left">
          <div className="space-y-3">
            <span className="text-blue-400 font-bold text-xs uppercase tracking-widest">GLOBAL CATALOG</span>
            <h2 className="text-3xl font-extrabold tracking-tight">Popular Certification Offerings</h2>
            <p className="text-slate-400 text-sm">Enroll instantly in high-impact modules verified by world-leading manufacturing agencies.</p>
          </div>
          <button 
            onClick={onExploreCourses}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg border border-white/10 bg-white/5 text-xs font-bold hover:bg-white/10 hover:text-white transition-colors cursor-pointer text-slate-300"
            id="view-all-courses-btn"
          >
            <span>Browse Full Catalog</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.slice(0, 3).map(course => (
            <div 
              key={course.id} 
              className="group flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden hover:border-white/20 hover:shadow-[0_10px_30px_rgba(37,99,235,0.1)] transition-all duration-300"
            >
              {/* Course Image */}
              <div className="relative aspect-video overflow-hidden">
                <img 
                  src={course.image} 
                  alt={course.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 p-1 px-3.5 rounded-full bg-slate-950/80 backdrop-blur-md text-[10px] font-mono font-bold text-blue-400 border border-white/10 uppercase">
                  {course.category}
                </div>
              </div>

              {/* Course Detail */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4 text-left">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">Verified • BCU-AIUB Academy</span>
                  <h3 className="text-base font-extrabold text-slate-100 group-hover:text-white transition-colors line-clamp-2 md:min-h-[3rem] leading-snug">
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {course.headline}
                  </p>
                </div>

                {/* Rating & meta row */}
                <div className="flex items-center justify-between text-xs text-slate-450 border-t border-white/5 pt-3.5 font-mono">
                  <span>⏱ {course.duration}</span>
                  <span>🎓 {course.lessons.length} Modules</span>
                  <span className="text-blue-400 font-bold">{course.level}</span>
                </div>

                {/* Dynamic CTAs */}
                <div className="flex items-center justify-between gap-2.5 pt-1">
                  <button 
                    onClick={() => onSelectCourse(course)}
                    className="flex-1 text-center py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold tracking-wide text-slate-200 transition-colors cursor-pointer"
                  >
                    Curriculum Details
                  </button>
                  <button 
                    onClick={() => {
                      if (course.isFree && onLaunchPlayer) { onLaunchPlayer(course); }
                      else { onEnroll(course.id); }
                    }}
                    className="flex-1 text-center py-2 rounded-lg bg-blue-600 hover:bg-blue-500 hover:shadow-[0_0_15px_rgba(37,99,235,0.2)] text-xs font-extrabold text-white transition-all cursor-pointer"
                  >
                    {course.isFree ? 'Enroll Free' : 'Enroll Now'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Subscription SaaS Pricing Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-20 z-10 text-center" id="pricing">
        <div className="max-w-2xl mx-auto space-y-4 mb-16 text-center">
          <span className="text-blue-400 font-bold text-xs uppercase tracking-widest">LENS SUBSCRIPTION</span>
          <h2 className="text-3xl font-extrabold tracking-tight">Flexible Educational Plans</h2>
          <p className="text-slate-400 text-sm">Scale corporate capabilities or master skills at your own comfort level.</p>
          
          {/* Monthly plan switch buttons */}
          <div className="inline-flex p-1 rounded-xl bg-white/5 border border-white/10 mt-4">
            {[
              { id: 'basic', label: 'Basic' },
              { id: 'pro', label: 'Advanced' },
              { id: 'enterprise', label: 'Professional' },
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setActivePlan(id as any)}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all tracking-wider cursor-pointer ${
                  activePlan === id ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SUBSCRIPTION_PLANS.map(plan => {
            const isFeatured = plan.id === 'pro';
            return (
              <div 
                key={plan.id}
                className={`p-8 rounded-2xl border text-left flex flex-col justify-between space-y-8 transition-all duration-300 ${
                  isFeatured 
                    ? 'border-blue-500 bg-blue-600/10 shadow-[0_4px_30px_rgba(37,99,235,0.15)] scale-[1.02]' 
                    : 'border-white/10 bg-white/[0.03]'
                }`}
              >
                <div className="space-y-4">
                  {isFeatured && (
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/35 text-blue-400 text-[9px] font-extrabold uppercase font-mono">
                      Academically Recommended
                    </span>
                  )}
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <div className="flex items-baseline gap-2.5">
                    <span className="text-4xl font-extrabold font-mono tracking-tight text-white">{plan.price}</span>
                    <span className="text-slate-550 text-xs capitalize">/ {plan.billing}</span>
                  </div>
                  <div className="h-px bg-white/10" />
                  
                  {/* Features checklist */}
                  <ul className="space-y-3.5 pt-2">
                    {plan.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2 text-xs text-slate-300">
                        <Check className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button 
                  onClick={() => setRegisterOpen(true)}
                  className={`w-full py-3 rounded-xl text-center text-xs font-extrabold transition-all cursor-pointer ${
                    isFeatured 
                      ? 'bg-blue-600 hover:bg-blue-500 text-white hover:shadow-[0_0_20px_rgba(37,99,235,0.3)] shadow-lg shadow-blue-500/10' 
                      : 'border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300'
                  }`}
                >
                  Activate {plan.name}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Student Testimonials Carousel / Grid */}
      <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-16 z-10">
        <div className="p-8 sm:p-12 rounded-3xl glass-card z-10">
          <div className="text-center space-y-3 mb-12">
            <span className="text-blue-400 font-bold text-xs uppercase tracking-widest">SUCCESS TRACKS</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Hear From Our Industry Innovators</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((t, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 text-left space-y-4">
                <p className="text-xs sm:text-sm text-slate-300 italic leading-relaxed">
                  "{t.text}"
                </p>
                <div className="flex items-center gap-3 border-t border-white/5 pt-4">
                  <img src={t.img} alt={t.name} className="w-10 h-10 rounded-full object-cover border border-blue-500/60" />
                  <div className="text-left">
                    <h4 className="text-xs font-bold text-white">{t.name}</h4>
                    <span className="text-[10px] text-slate-550">{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Collapsible FAQs with Animated Accordion effect */}
      <section className="relative px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto py-20 z-10 text-left" id="faq">
        <div className="text-center space-y-3 mb-12">
          <span className="text-blue-400 font-bold text-xs uppercase tracking-widest">HAVE QUESTIONS?</span>
          <h2 className="text-3xl font-extrabold">Frequently Asked Questions</h2>
          {cmsFaq?.imageUrl && <img src={cmsFaq.imageUrl} alt="Frequently asked questions" className="w-full h-24 object-cover rounded-2xl border border-white/10 mt-5" />}
        </div>

        <div className="space-y-4">
          {displayFaqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div 
                key={idx}
                className="rounded-xl glass-card overflow-hidden transition-all duration-350 hover:border-white/15"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left font-bold text-slate-200 hover:text-white transition-colors cursor-pointer text-xs sm:text-sm"
                >
                  <span>{faq.question}</span>
                  <ChevronRight className={`w-4 h-4 text-blue-400 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                </button>
                
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-slate-400 leading-relaxed border-t border-white/5">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
