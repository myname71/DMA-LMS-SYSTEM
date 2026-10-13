import React, { useState, useEffect, useRef } from 'react';
import { X, Search, BookOpen, Calendar, Layers, ArrowRight, Clock, Users } from 'lucide-react';
import { Course, LearningPath } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
  events: any[];
  learningPaths: LearningPath[];
  onNavigate: (page: string, categoryFilter?: string) => void;
}

type ResultType = 'course' | 'event' | 'learning_path';

interface SearchResult {
  id: string;
  type: ResultType;
  title: string;
  subtitle: string;
  meta?: string;
  tag?: string;
  tagColor?: string;
}

export default function SearchModal({ isOpen, onClose, courses, events, learningPaths, onNavigate }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const q = query.toLowerCase().trim();

  const courseResults: SearchResult[] = q
    ? courses
        .filter(c =>
          c.title.toLowerCase().includes(q) ||
          c.headline?.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q) ||
          c.category?.toLowerCase().includes(q) ||
          c.instructorName?.toLowerCase().includes(q)
        )
        .slice(0, 5)
        .map(c => ({
          id: c.id,
          type: 'course',
          title: c.title,
          subtitle: c.instructorName,
          meta: `${c.duration} · ${c.level}`,
          tag: c.category,
          tagColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
        }))
    : [];

  const eventResults: SearchResult[] = q
    ? events
        .filter(e =>
          e.title?.toLowerCase().includes(q) ||
          e.desc?.toLowerCase().includes(q) ||
          e.host?.toLowerCase().includes(q) ||
          e.category?.toLowerCase().includes(q) ||
          e.type?.toLowerCase().includes(q)
        )
        .slice(0, 4)
        .map(e => ({
          id: e.id,
          type: 'event',
          title: e.title,
          subtitle: e.host,
          meta: `${e.date} · ${e.time}`,
          tag: e.type,
          tagColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        }))
    : [];

  const pathResults: SearchResult[] = q
    ? learningPaths
        .filter(lp =>
          lp.title?.toLowerCase().includes(q) ||
          lp.description?.toLowerCase().includes(q) ||
          lp.category?.toLowerCase().includes(q) ||
          lp.instructorName?.toLowerCase().includes(q)
        )
        .slice(0, 3)
        .map(lp => ({
          id: lp.id,
          type: 'learning_path',
          title: lp.title,
          subtitle: lp.instructorName,
          meta: `${lp.courses?.length ?? 0} courses`,
          tag: lp.category,
          tagColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
        }))
    : [];

  const totalResults = courseResults.length + eventResults.length + pathResults.length;

  const handleResultClick = (result: SearchResult) => {
    if (result.type === 'course') {
      onNavigate('courses');
    } else if (result.type === 'event') {
      onNavigate('events');
    } else {
      onNavigate('learning_paths');
    }
    onClose();
  };

  const typeIcon = (type: ResultType) => {
    if (type === 'course') return <BookOpen className="w-3.5 h-3.5 text-blue-400" />;
    if (type === 'event') return <Calendar className="w-3.5 h-3.5 text-emerald-400" />;
    return <Layers className="w-3.5 h-3.5 text-purple-400" />;
  };

  const typeLabel = (type: ResultType) => {
    if (type === 'course') return 'Course';
    if (type === 'event') return 'Event';
    return 'Learning Path';
  };

  const renderSection = (label: string, icon: React.ReactNode, results: SearchResult[]) => {
    if (!results.length) return null;
    return (
      <div className="mb-4">
        <div className="flex items-center gap-2 px-4 py-1.5 mb-1">
          {icon}
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono">{label}</span>
          <span className="ml-auto text-[10px] text-slate-600 font-mono">{results.length} found</span>
        </div>
        <div className="space-y-0.5 px-2">
          {results.map(r => (
            <button
              key={r.id}
              onClick={() => handleResultClick(r)}
              className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800/70 transition-colors group cursor-pointer"
            >
              <div className="shrink-0 w-7 h-7 rounded-lg bg-slate-800 border border-white/5 flex items-center justify-center">
                {typeIcon(r.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-slate-100 group-hover:text-white truncate leading-tight">{r.title}</div>
                <div className="text-[10px] text-slate-500 truncate mt-0.5">{r.subtitle} {r.meta ? `· ${r.meta}` : ''}</div>
              </div>
              {r.tag && (
                <span className={`shrink-0 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${r.tagColor}`}>
                  {r.tag}
                </span>
              )}
              <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition-colors shrink-0" />
            </button>
          ))}
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" />

      {/* Modal Panel */}
      <div className="relative w-full max-w-2xl bg-[#0a0f1e] border border-white/8 rounded-2xl shadow-[0_25px_80px_rgba(0,0,0,0.7)] overflow-hidden animate-fade-in">

        {/* Search Input Row */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/5">
          <Search className="w-4.5 h-4.5 text-slate-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search courses, events, learning paths..."
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-600 outline-none font-sans"
            autoComplete="off"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-500 hover:text-slate-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-[10px] font-mono text-slate-600 border border-white/8 rounded px-1.5 py-0.5 hover:text-slate-400 transition-colors"
          >
            ESC
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto py-3">
          {!q && (
            <div className="px-5 py-8 text-center">
              <Search className="w-8 h-8 text-slate-700 mx-auto mb-3" />
              <p className="text-sm text-slate-500 font-sans">Type to search across all academy content</p>
              <div className="mt-4 flex items-center justify-center gap-6 text-[10px] text-slate-600 font-mono uppercase tracking-wider">
                <span className="flex items-center gap-1"><BookOpen className="w-3 h-3 text-blue-500" /> Courses</span>
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-emerald-500" /> Events</span>
                <span className="flex items-center gap-1"><Layers className="w-3 h-3 text-purple-500" /> Learning Paths</span>
              </div>
            </div>
          )}

          {q && totalResults === 0 && (
            <div className="px-5 py-10 text-center">
              <p className="text-sm text-slate-500">No results found for <span className="text-white font-semibold">"{query}"</span></p>
              <p className="text-[11px] text-slate-600 mt-1">Try a different keyword or browse the categories</p>
            </div>
          )}

          {q && totalResults > 0 && (
            <>
              {renderSection('Courses', <BookOpen className="w-3.5 h-3.5 text-blue-400" />, courseResults)}
              {renderSection('Events', <Calendar className="w-3.5 h-3.5 text-emerald-400" />, eventResults)}
              {renderSection('Learning Paths', <Layers className="w-3.5 h-3.5 text-purple-400" />, pathResults)}
            </>
          )}
        </div>

        {/* Footer */}
        {q && totalResults > 0 && (
          <div className="border-t border-white/5 px-4 py-2.5 flex items-center justify-between">
            <span className="text-[10px] text-slate-600 font-mono">{totalResults} result{totalResults !== 1 ? 's' : ''}</span>
            <div className="flex items-center gap-3 text-[10px] text-slate-600 font-mono">
              <span>↑↓ navigate</span>
              <span>↵ open</span>
              <span>ESC close</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
