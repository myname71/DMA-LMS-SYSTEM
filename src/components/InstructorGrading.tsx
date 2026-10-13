import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, User as UserIcon, BookOpen, MessageSquare, Star, ChevronRight } from 'lucide-react';
import { User } from '../types';

interface InstructorGradingProps {
  currentUser: User;
  triggerToast: (msg: string, type?: 'success' | 'warn') => void;
}

export default function InstructorGrading({ currentUser, triggerToast }: InstructorGradingProps) {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any | null>(null);
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'graded'>('all');

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`/api/assignments/instructor/${currentUser.id}`);
      const data = await resp.json();
      setSubmissions(data.submissions || []);
    } catch {
      triggerToast('Failed to load submissions', 'warn');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleGrade = async () => {
    if (!selected || !grade.trim()) {
      triggerToast('Please enter a grade before submitting.', 'warn');
      return;
    }
    setSubmitting(true);
    try {
      const resp = await fetch('/api/assignments/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: selected.id,
          grade,
          feedback,
        }),
      });
      const data = await resp.json();
      if (data.status === 'success') {
        triggerToast(`Assignment graded: ${grade}`);
        setSelected(null);
        setGrade('');
        setFeedback('');
        await fetchSubmissions();
      }
    } catch {
      triggerToast('Failed to submit grade', 'warn');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = submissions.filter(s => filterStatus === 'all' ? true : s.status === filterStatus);
  const pendingCount = submissions.filter(s => s.status === 'pending').length;

  if (selected) {
    return (
      <div className="space-y-6 text-left animate-fade-in">
        <div className="flex items-center justify-between">
          <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200 cursor-pointer transition-colors">
            ← Back to submissions
          </button>
          <span className={`text-[9px] font-mono font-bold uppercase px-2 py-1 rounded border ${
            selected.status === 'graded' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/15 text-amber-400 border-amber-500/20'
          }`}>
            {selected.status}
          </span>
        </div>

        <div className="p-6 rounded-2xl glass-card space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-600/20 border border-blue-500/20 flex items-center justify-center">
              <UserIcon className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">{selected.studentName}</div>
              <div className="text-[10px] text-slate-500">{selected.courseName} • {selected.assignmentTitle}</div>
              <div className="text-[10px] text-slate-600 mt-0.5">Submitted {new Date(selected.submittedAt).toLocaleDateString()}</div>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <p className="text-xs font-bold text-slate-400 uppercase mb-2">Student's Submission</p>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{selected.text}</p>
          </div>
          {selected.fileUrl && (
            <a href={selected.fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs text-blue-400 hover:underline">
              <BookOpen className="w-3.5 h-3.5" /> View attached file
            </a>
          )}
        </div>

        {selected.status === 'graded' ? (
          <div className="p-6 rounded-2xl glass-card space-y-3">
            <p className="text-xs font-bold text-emerald-400 uppercase flex items-center gap-1.5"><CheckCircle className="w-4 h-4" /> Already Graded</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-slate-500 uppercase mb-1">Grade</p>
                <p className="text-2xl font-extrabold font-mono text-emerald-400">{selected.grade}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase mb-1">Feedback</p>
                <p className="text-sm text-slate-300">{selected.feedback || 'No feedback provided.'}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-2xl glass-card space-y-4">
            <h4 className="text-xs font-bold text-blue-400 uppercase">Submit Grade & Feedback</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Grade *</label>
                <input
                  value={grade}
                  onChange={e => setGrade(e.target.value)}
                  placeholder="e.g. A, 85/100, Pass"
                  className="w-full text-xs p-2.5 rounded-lg glass-input text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Feedback (optional)</label>
                <textarea
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                  rows={3}
                  placeholder="Instructor comments and suggestions..."
                  className="w-full text-xs p-2.5 rounded-lg glass-input text-white resize-none"
                />
              </div>
            </div>
            <button
              onClick={handleGrade}
              disabled={submitting || !grade.trim()}
              className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              {submitting ? 'Submitting...' : 'Submit Grade'}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-sm font-extrabold text-white">Assignment Grading</h3>
          <p className="text-[10px] text-slate-500 mt-0.5">
            {pendingCount > 0 ? `${pendingCount} submission${pendingCount > 1 ? 's' : ''} awaiting your review` : 'All submissions graded — great work!'}
          </p>
        </div>
        <div className="flex gap-2">
          {(['all', 'pending', 'graded'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilterStatus(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase cursor-pointer transition-all border ${
                filterStatus === f
                  ? 'bg-blue-600/25 text-blue-400 border-blue-500/30'
                  : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-white/5'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500 text-sm">Loading submissions...</div>
      ) : filtered.length === 0 ? (
        <div className="p-12 rounded-2xl glass-card text-center space-y-2">
          <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto opacity-40" />
          <p className="text-sm text-slate-500 italic">No {filterStatus === 'all' ? '' : filterStatus} submissions found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(sub => (
            <div
              key={sub.id}
              onClick={() => setSelected(sub)}
              className="p-4 rounded-2xl glass-card hover:border-white/20 cursor-pointer transition-all flex items-center gap-4 group"
            >
              <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${sub.status === 'graded' ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-bold text-slate-200 truncate">{sub.studentName}</span>
                  <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border shrink-0 ${
                    sub.status === 'graded' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>{sub.status}</span>
                </div>
                <p className="text-[10px] text-slate-500 truncate">{sub.courseName} • {sub.assignmentTitle}</p>
                <p className="text-[9px] text-slate-600">{new Date(sub.submittedAt).toLocaleDateString()}</p>
              </div>
              {sub.status === 'graded' && (
                <span className="text-sm font-extrabold font-mono text-emerald-400 shrink-0">{sub.grade}</span>
              )}
              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300 transition-colors shrink-0" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
