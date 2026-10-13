import React from 'react';
import { Users, Target, Award, Globe, Lightbulb, BookOpen, Handshake, ChevronRight } from 'lucide-react';

const MILESTONES = [
  { year: '2022', title: 'Project Inception', desc: 'British Council Going Global Partnerships grant awarded to AIUB and Birmingham City University.' },
  { year: '2023', title: 'Curriculum Development', desc: 'Joint research teams drafted the Industry 4.0 syllabus covering Digital Twins, PLC, IoT and Smart Factory modules.' },
  { year: '2024', title: 'Platform Launch', desc: 'DMA Academy platform goes live with the first cohort of enrolled learners from Bangladesh and the UK.' },
  { year: '2025', title: 'Certification Rollout', desc: 'Verified digital certificates issued to graduates, recognised by both AIUB and Birmingham City University.' },
  { year: '2026', title: 'Global Expansion', desc: 'Open enrolment extended to international learners; AI-assisted tutoring and webinar infrastructure deployed.' },
];

const VALUES = [
  { icon: Target, label: 'Mission-Driven', desc: 'Bridging the skills gap between academic research and industrial practice in advanced manufacturing.' },
  { icon: Lightbulb, label: 'Innovation First', desc: 'Every course module reflects cutting-edge Industry 4.0 research from two world-class universities.' },
  { icon: Handshake, label: 'Partnership Model', desc: 'Built on a transnational collaboration funded and quality-assured by the British Council.' },
  { icon: Globe, label: 'Global Reach', desc: 'Designed for learners in Bangladesh, the UK, and beyond — accessible from any device, anywhere.' },
  { icon: Award, label: 'Certified Excellence', desc: 'Completion certificates carry the academic weight of both AIUB and BCU credentials.' },
  { icon: BookOpen, label: 'Open Learning', desc: 'Structured pathways for students, researchers, professionals, and industry instructors alike.' },
];

export default function AboutUsPage() {
  return (
    <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-14 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-400" />
          </div>
          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest font-mono">Our Story</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
          About Digital Manufacturing Academy
        </h1>
        <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">
          A transnational learning initiative co-developed by American International University Bangladesh (AIUB) and Birmingham City University (BCU), funded by the British Council Going Global Partnerships programme.
        </p>
      </div>

      {/* Mission Banner */}
      <div className="mb-14 p-8 rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-600/10 to-indigo-600/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest font-mono block mb-3">Our Mission</span>
        <p className="text-white text-base sm:text-lg font-semibold leading-relaxed max-w-3xl">
          To empower the next generation of manufacturing engineers and researchers with world-class digital skills — blending PLC automation, Digital Twin technology, Industrial IoT, and AI-driven analytics into a single certified learning pathway.
        </p>
      </div>

      {/* Values Grid */}
      <div className="mb-16">
        <div className="mb-8">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest font-mono block mb-2">Core Values</span>
          <h2 className="text-2xl font-extrabold text-white">What We Stand For</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {VALUES.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="p-5 rounded-2xl border border-slate-800 bg-[#111827] hover:border-blue-500/30 transition-colors group">
              <div className="w-9 h-9 rounded-xl bg-blue-600/15 border border-blue-500/20 flex items-center justify-center mb-4 group-hover:bg-blue-600/25 transition-colors">
                <Icon className="w-4 h-4 text-blue-400" />
              </div>
              <h4 className="text-sm font-extrabold text-white mb-1.5">{label}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="mb-16">
        <div className="mb-8">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest font-mono block mb-2">Journey</span>
          <h2 className="text-2xl font-extrabold text-white">Programme Milestones</h2>
        </div>
        <div className="relative pl-6 border-l border-slate-800 space-y-8">
          {MILESTONES.map((m, i) => (
            <div key={i} className="relative">
              <div className="absolute -left-[29px] top-1 w-4 h-4 rounded-full bg-blue-600 border-2 border-[#020617] flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-5">
                <span className="text-[10px] font-extrabold text-blue-400 font-mono tracking-widest shrink-0 pt-0.5">{m.year}</span>
                <div>
                  <h4 className="text-sm font-extrabold text-white mb-1">{m.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{m.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Partner Institutions */}
      <div className="mb-10">
        <div className="mb-8">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest font-mono block mb-2">Partners</span>
          <h2 className="text-2xl font-extrabold text-white">Institutional Collaborators</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { name: 'American International University Bangladesh', short: 'AIUB', location: 'Dhaka, Bangladesh', role: 'Lead Institution' },
            { name: 'Birmingham City University', short: 'BCU', location: 'Birmingham, United Kingdom', role: 'Co-Developer' },
            { name: 'British Council', short: 'BC', location: 'Going Global Partnerships', role: 'Funding Body' },
          ].map(inst => (
            <div key={inst.short} className="p-5 rounded-2xl border border-slate-800 bg-[#111827] space-y-2">
              <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                <span className="text-xs font-extrabold text-blue-400 font-mono">{inst.short}</span>
              </div>
              <div>
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider font-mono">{inst.role}</p>
                <h4 className="text-sm font-extrabold text-white leading-snug mt-0.5">{inst.name}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{inst.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-[#111827] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-extrabold text-white mb-1">Ready to start your journey?</h4>
          <p className="text-xs text-slate-400">Join thousands of learners advancing their Industry 4.0 skills.</p>
        </div>
        <a href="#" className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white text-xs font-bold whitespace-nowrap shrink-0">
          Explore Courses <ChevronRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
