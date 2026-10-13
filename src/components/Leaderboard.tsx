import React, { useState, useEffect, useCallback } from 'react';
import { Trophy, Medal, RefreshCw, TrendingUp, BookOpen, Target, Zap, ChevronUp } from 'lucide-react';
import { Course } from '../types';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatar: string;
  avgProgress: number;
  avgQuiz: number;
  composite: number;
  completedCourses: number;
  quizAttempts: number;
  badges: string[];
}

interface LeaderboardProps {
  currentUserId?: string;
  courses?: Course[];
  viewerRole?: 'student' | 'instructor' | 'admin' | 'super_admin';
}

const RANK_STYLES: Record<number, { ring: string; badge: string; icon: React.ReactNode; label: string }> = {
  1: {
    ring: 'ring-2 ring-yellow-400/70',
    badge: 'bg-yellow-400 text-yellow-900',
    icon: <Trophy className="w-3.5 h-3.5" />,
    label: 'Gold',
  },
  2: {
    ring: 'ring-2 ring-slate-300/60',
    badge: 'bg-slate-300 text-slate-800',
    icon: <Medal className="w-3.5 h-3.5" />,
    label: 'Silver',
  },
  3: {
    ring: 'ring-2 ring-orange-400/60',
    badge: 'bg-orange-400 text-orange-900',
    icon: <Medal className="w-3.5 h-3.5" />,
    label: 'Bronze',
  },
};

function ScoreBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ${color}`}
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  );
}

function Avatar({ name, src, ring }: { name: string; src?: string; ring?: string }) {
  const initials = name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`w-10 h-10 rounded-full object-cover flex-shrink-0 ${ring || ''}`}
        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
      />
    );
  }
  return (
    <div className={`w-10 h-10 rounded-full bg-blue-700/50 flex items-center justify-center flex-shrink-0 text-xs font-extrabold text-blue-200 border border-blue-500/30 ${ring || ''}`}>
      {initials}
    </div>
  );
}

export default function Leaderboard({ currentUserId, courses = [], viewerRole }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const url = selectedCourse !== 'all'
        ? `/api/leaderboard?courseId=${selectedCourse}`
        : '/api/leaderboard';
      const res = await fetch(url);
      if (!res.ok) return;
      const data = await res.json();
      setEntries(data.leaderboard || []);
      setLastUpdated(data.updatedAt || null);
    } catch {
      // silently ignore
    } finally {
      setLoading(false);
    }
  }, [selectedCourse]);

  useEffect(() => {
    setLoading(true);
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchLeaderboard, 30000);
    return () => clearInterval(interval);
  }, [fetchLeaderboard, autoRefresh]);

  const myEntry = entries.find(e => e.userId === currentUserId);
  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <div className="space-y-6 text-left animate-fade-in">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <h3 className="text-lg font-extrabold text-white">Student Leaderboard</h3>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
              Live
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Ranked by composite score: 60% quiz performance + 40% module progress
            {lastUpdated && (
              <span className="ml-2 text-slate-500">
                · Updated {new Date(lastUpdated).toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Course filter */}
          {courses.length > 0 && (
            <select
              value={selectedCourse}
              onChange={e => setSelectedCourse(e.target.value)}
              className="text-xs bg-slate-800 border border-white/10 text-slate-300 rounded-lg px-3 py-1.5 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500/50"
            >
              <option value="all">All Courses</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          )}

          <button
            onClick={() => { setAutoRefresh(p => !p); fetchLeaderboard(); }}
            title={autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
            className={`p-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
              autoRefresh
                ? 'bg-blue-600/20 border-blue-500/30 text-blue-400'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin-slow' : ''}`} style={autoRefresh ? { animationDuration: '4s' } : {}} />
          </button>
        </div>
      </div>

      {/* Your rank callout (students only) */}
      {myEntry && viewerRole === 'student' && (
        <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600/30 flex items-center justify-center">
              <ChevronUp className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-semibold">Your Current Rank</div>
              <div className="text-xl font-extrabold text-white">
                #{myEntry.rank}
                <span className="text-slate-400 text-sm font-normal ml-1">of {entries.length}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-6 flex-wrap">
            <div className="text-center">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Score</div>
              <div className="text-lg font-extrabold text-yellow-400">{myEntry.composite}</div>
            </div>
            <div className="text-center">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Quiz Avg</div>
              <div className="text-lg font-extrabold text-emerald-400">{myEntry.avgQuiz}%</div>
            </div>
            <div className="text-center">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Progress</div>
              <div className="text-lg font-extrabold text-sky-400">{myEntry.avgProgress}%</div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20 gap-3 text-slate-400">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span className="text-sm font-semibold">Loading leaderboard...</span>
        </div>
      ) : entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <Trophy className="w-10 h-10 text-slate-600" />
          <p className="text-slate-400 text-sm font-semibold">No data yet</p>
          <p className="text-slate-500 text-xs max-w-xs">
            Students will appear here once they enroll and complete quiz modules.
          </p>
        </div>
      ) : (
        <>
          {/* Podium — top 3 */}
          {top3.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {top3.map(entry => {
                const rs = RANK_STYLES[entry.rank];
                const isMe = entry.userId === currentUserId;
                return (
                  <div
                    key={entry.userId}
                    className={`relative p-5 rounded-2xl border transition-all ${
                      isMe
                        ? 'border-blue-500/40 bg-blue-600/10'
                        : entry.rank === 1
                          ? 'border-yellow-400/30 bg-yellow-400/5'
                          : entry.rank === 2
                            ? 'border-slate-300/20 bg-slate-300/5'
                            : 'border-orange-400/20 bg-orange-400/5'
                    }`}
                  >
                    {/* Rank badge */}
                    <div className={`absolute -top-2.5 -right-2.5 w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-extrabold shadow-lg ${rs.badge}`}>
                      {rs.icon}
                    </div>

                    <div className="flex items-center gap-3 mb-4">
                      <Avatar name={entry.name} src={entry.avatar} ring={rs.ring} />
                      <div className="min-w-0">
                        <div className="text-sm font-extrabold text-white truncate">{entry.name}</div>
                        <div className="text-[10px] text-slate-400 font-semibold">{rs.label} • Rank #{entry.rank}</div>
                      </div>
                    </div>

                    {/* Score display */}
                    <div className="text-center mb-4">
                      <div className="text-3xl font-extrabold font-mono tracking-tight text-white">{entry.composite}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Composite Score</div>
                    </div>

                    {/* Mini stats */}
                    <div className="space-y-2.5">
                      <div>
                        <div className="flex justify-between text-[10px] font-semibold mb-1">
                          <span className="text-slate-400 flex items-center gap-1"><Target className="w-2.5 h-2.5" /> Quiz Avg</span>
                          <span className="text-emerald-400">{entry.avgQuiz}%</span>
                        </div>
                        <ScoreBar value={entry.avgQuiz} color="bg-emerald-500" />
                      </div>
                      <div>
                        <div className="flex justify-between text-[10px] font-semibold mb-1">
                          <span className="text-slate-400 flex items-center gap-1"><TrendingUp className="w-2.5 h-2.5" /> Progress</span>
                          <span className="text-sky-400">{entry.avgProgress}%</span>
                        </div>
                        <ScoreBar value={entry.avgProgress} color="bg-sky-500" />
                      </div>
                    </div>

                    {/* Footer micro-stats */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10 text-[10px] text-slate-500 font-semibold">
                      <span className="flex items-center gap-1"><BookOpen className="w-2.5 h-2.5" /> {entry.completedCourses} completed</span>
                      <span className="flex items-center gap-1"><Zap className="w-2.5 h-2.5" /> {entry.quizAttempts} quizzes</span>
                    </div>

                    {isMe && (
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-blue-600/30 text-blue-400 text-[9px] font-extrabold uppercase tracking-widest border border-blue-500/30">
                        You
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Table for ranks 4+ */}
          {rest.length > 0 && (
            <div className="rounded-2xl border border-white/10 overflow-hidden">
              <div className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-white/5 border-b border-white/10 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <div className="col-span-1">#</div>
                <div className="col-span-4">Student</div>
                <div className="col-span-2 text-center">Score</div>
                <div className="col-span-2 text-center hidden sm:block">Quiz Avg</div>
                <div className="col-span-3 hidden sm:block">Progress</div>
              </div>

              {rest.map((entry, idx) => {
                const isMe = entry.userId === currentUserId;
                return (
                  <div
                    key={entry.userId}
                    className={`grid grid-cols-12 gap-2 px-4 py-3 items-center border-b border-white/5 last:border-0 transition-colors ${
                      isMe ? 'bg-blue-600/10 border-l-2 border-l-blue-500' : idx % 2 === 0 ? 'bg-white/[0.015]' : ''
                    }`}
                  >
                    <div className="col-span-1 text-sm font-extrabold text-slate-400">
                      {entry.rank}
                    </div>
                    <div className="col-span-4 flex items-center gap-2.5 min-w-0">
                      <Avatar name={entry.name} src={entry.avatar} />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">{entry.name}</div>
                        <div className="text-[10px] text-slate-500">{entry.completedCourses} course{entry.completedCourses !== 1 ? 's' : ''} done</div>
                      </div>
                      {isMe && (
                        <span className="px-1.5 py-0.5 rounded-full bg-blue-600/30 text-blue-400 text-[8px] font-extrabold uppercase tracking-widest border border-blue-500/30 flex-shrink-0">
                          You
                        </span>
                      )}
                    </div>
                    <div className="col-span-2 text-center">
                      <span className="text-sm font-extrabold font-mono text-white">{entry.composite}</span>
                    </div>
                    <div className="col-span-2 text-center hidden sm:block">
                      <span className="text-xs font-bold text-emerald-400">{entry.avgQuiz}%</span>
                    </div>
                    <div className="col-span-3 hidden sm:block">
                      <div className="flex items-center gap-2">
                        <ScoreBar value={entry.avgProgress} color="bg-sky-500" />
                        <span className="text-[10px] text-slate-400 font-semibold w-8 text-right">{entry.avgProgress}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-[10px] text-slate-500 font-semibold pt-1">
            <span className="flex items-center gap-1.5"><Target className="w-3 h-3 text-emerald-500" /> Quiz Avg — average score across all passed quizzes (60% weight)</span>
            <span className="flex items-center gap-1.5"><TrendingUp className="w-3 h-3 text-sky-500" /> Progress — average lesson completion across enrolled courses (40% weight)</span>
          </div>
        </>
      )}
    </div>
  );
}
