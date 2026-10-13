import React from 'react';
import { BookOpen, Clock, Star, Users, ChevronRight, Lock } from 'lucide-react';
import { Course } from '../../types';

interface CourseCardProps {
  course: Course;
  isEnrolled?: boolean;
  progress?: number;
  onSelect: (course: Course) => void;
  onEnroll?: (courseId: string) => void;
  compact?: boolean;
}

const LEVEL_COLORS: Record<string, string> = {
  Beginner: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  Intermediate: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  Advanced: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
};

export default function CourseCard({ course, isEnrolled = false, progress = 0, onSelect, onEnroll, compact = false }: CourseCardProps) {
  return (
    <div
      className="glass-card rounded-2xl overflow-hidden hover:border-white/20 hover:shadow-[0_0_25px_rgba(37,99,235,0.1)] transition-all duration-300 flex flex-col cursor-pointer group"
      onClick={() => onSelect(course)}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-slate-800/50">
        {course.image ? (
          <img
            src={course.image}
            alt={course.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900/40 to-indigo-900/40">
            <BookOpen className="w-10 h-10 text-blue-400/50" />
          </div>
        )}

        {/* Level badge */}
        <span className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${LEVEL_COLORS[course.level] || 'text-slate-400 bg-slate-500/10 border-slate-500/20'}`}>
          {course.level}
        </span>

        {/* Price badge */}
        <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-bold">
          {course.price === 0 ? 'Free' : `$${course.price}`}
        </span>

        {/* Progress bar for enrolled */}
        {isEnrolled && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
            <div
              className="h-full bg-blue-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <span className="text-[9px] font-mono font-bold text-blue-400 uppercase tracking-wider">{course.category}</span>
        <h3 className="text-sm font-extrabold text-white leading-snug line-clamp-2 group-hover:text-blue-200 transition-colors">
          {course.title}
        </h3>

        {!compact && (
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{course.description}</p>
        )}

        {/* Meta row */}
        <div className="flex items-center gap-3 mt-auto pt-2 text-[10px] text-slate-500 font-mono">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />{course.duration}
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="w-3 h-3" />{course.lessons?.length || 0} lessons
          </span>
          {course.ratingAverage > 0 && (
            <span className="flex items-center gap-1 text-amber-400">
              <Star className="w-3 h-3 fill-amber-400" />{course.ratingAverage.toFixed(1)}
            </span>
          )}
        </div>

        {isEnrolled ? (
          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-slate-400">{progress}% complete</span>
            <button
              onClick={e => { e.stopPropagation(); onSelect(course); }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 text-[10px] font-bold hover:bg-blue-600/30 transition-colors cursor-pointer"
            >
              Continue <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        ) : (
          onEnroll && (
            <button
              onClick={e => { e.stopPropagation(); onEnroll(course.id); }}
              className="w-full mt-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all cursor-pointer"
            >
              Enroll {course.price === 0 ? 'Free' : `— $${course.price}`}
            </button>
          )
        )}
      </div>
    </div>
  );
}
