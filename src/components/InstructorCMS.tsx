import React, { useState } from 'react';
import { Edit3, Save, X, Plus, Trash2, ChevronDown, ChevronUp, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Course, User } from '../types';

interface InstructorCMSProps {
  currentUser: User;
  courses: Course[];
  onRefresh: () => void;
  triggerToast: (msg: string, type?: 'success' | 'warn') => void;
}

export default function InstructorCMS({ currentUser, courses, onRefresh, triggerToast }: InstructorCMSProps) {
  const myCourses = courses.filter(c => c.instructorId === currentUser.id);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [saving, setSaving] = useState(false);
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);

  const [editTitle, setEditTitle] = useState('');
  const [editHeadline, setEditHeadline] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editDuration, setEditDuration] = useState('');
  const [editLevel, setEditLevel] = useState('');
  const [editLessons, setEditLessons] = useState<any[]>([]);

  const openEdit = (course: Course) => {
    setEditingCourse(course);
    setEditTitle(course.title);
    setEditHeadline(course.headline);
    setEditDescription(course.description);
    setEditPrice(String(course.price));
    setEditDuration(course.duration);
    setEditLevel(course.level);
    setEditLessons(course.lessons.map(l => ({ ...l })));
  };

  const closeEdit = () => {
    setEditingCourse(null);
    setExpandedLesson(null);
  };

  const updateLesson = (id: string, field: string, value: string) => {
    setEditLessons(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const removeLesson = (id: string) => {
    setEditLessons(prev => prev.filter(l => l.id !== id));
  };

  const addLesson = () => {
    const newLesson = {
      id: `l_edit_${Date.now()}`,
      title: 'New Lesson',
      type: 'video',
      duration: '15 mins',
      contentUrl: '',
      isRequired: true,
    };
    setEditLessons(prev => [...prev, newLesson]);
    setExpandedLesson(newLesson.id);
  };

  const handleSave = async () => {
    if (!editingCourse) return;
    setSaving(true);
    try {
      const resp = await fetch('/api/courses/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: editingCourse.id,
          title: editTitle,
          headline: editHeadline,
          description: editDescription,
          price: Number(editPrice),
          duration: editDuration,
          level: editLevel,
          lessons: editLessons,
        }),
      });
      const data = await resp.json();
      if (data.status === 'success') {
        triggerToast('Course updated successfully!');
        await onRefresh();
        closeEdit();
      } else {
        triggerToast(data.error || 'Update failed', 'warn');
      }
    } catch {
      triggerToast('Connection error during save', 'warn');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitForReview = async (courseId: string) => {
    try {
      const resp = await fetch('/api/courses/submit-for-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId }),
      });
      const data = await resp.json();
      if (data.status === 'success') {
        triggerToast('Course submitted for admin review!');
        await onRefresh();
      }
    } catch {
      triggerToast('Submission error', 'warn');
    }
  };

  const statusBadge = (course: any) => {
    const status = course.approvalStatus || (course.isPublished ? 'approved' : 'pending');
    const map: Record<string, string> = {
      approved: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
      pending: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
      rejected: 'bg-rose-500/15 text-rose-400 border-rose-500/20',
      draft: 'bg-slate-500/15 text-slate-400 border-slate-500/20',
    };
    return (
      <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${map[status] || map.draft}`}>
        {status === 'approved' ? '✓ Live' : status === 'pending' ? '⏳ Under Review' : status === 'rejected' ? '✗ Rejected' : '● Draft'}
      </span>
    );
  };

  if (editingCourse) {
    return (
      <div className="space-y-6 text-left animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-white">Editing: {editingCourse.title}</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Changes are saved server-side and reflected live.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={closeEdit} className="px-3 py-1.5 rounded-lg border border-white/10 text-slate-400 text-xs hover:bg-white/5 cursor-pointer transition-colors flex items-center gap-1">
              <X className="w-3.5 h-3.5" /> Cancel
            </button>
            <button onClick={handleSave} disabled={saving} className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold cursor-pointer transition-colors flex items-center gap-1">
              <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        <div className="p-6 rounded-2xl glass-card space-y-5">
          <h4 className="text-xs font-bold uppercase text-blue-400 tracking-wider">Course Metadata</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Course Title *</label>
              <input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="w-full text-xs p-2.5 rounded-lg glass-input text-white" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Headline</label>
              <input value={editHeadline} onChange={e => setEditHeadline(e.target.value)} className="w-full text-xs p-2.5 rounded-lg glass-input text-white" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Price (USD)</label>
              <input type="number" value={editPrice} onChange={e => setEditPrice(e.target.value)} className="w-full text-xs p-2.5 rounded-lg glass-input text-white" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Duration</label>
              <input value={editDuration} onChange={e => setEditDuration(e.target.value)} className="w-full text-xs p-2.5 rounded-lg glass-input text-white" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Level</label>
              <select value={editLevel} onChange={e => setEditLevel(e.target.value)} className="w-full text-xs p-2.5 rounded-lg glass-input text-slate-300">
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Description *</label>
              <textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} rows={4} className="w-full text-xs p-2.5 rounded-lg glass-input text-white resize-none" />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl glass-card space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase text-blue-400 tracking-wider">Lessons ({editLessons.length})</h4>
            <button onClick={addLesson} className="px-3 py-1.5 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 text-xs font-bold cursor-pointer hover:bg-blue-600/30 transition-colors flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" /> Add Lesson
            </button>
          </div>
          <div className="space-y-2">
            {editLessons.map((lesson, idx) => (
              <div key={lesson.id} className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
                <div className="flex items-center gap-3 p-3 cursor-pointer hover:bg-white/[0.03]" onClick={() => setExpandedLesson(expandedLesson === lesson.id ? null : lesson.id)}>
                  <span className="text-[10px] font-mono text-slate-500 w-5 shrink-0">{idx + 1}</span>
                  <span className="text-xs text-slate-200 flex-1 truncate">{lesson.title}</span>
                  <span className="text-[9px] font-mono text-slate-500 uppercase">{lesson.type}</span>
                  <span className="text-[9px] text-slate-500">{lesson.duration}</span>
                  {expandedLesson === lesson.id ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
                  <button onClick={e => { e.stopPropagation(); removeLesson(lesson.id); }} className="p-1 rounded text-rose-400 hover:bg-rose-500/10 cursor-pointer transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                {expandedLesson === lesson.id && (
                  <div className="p-4 border-t border-white/5 space-y-3 bg-black/10">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Title</label>
                        <input value={lesson.title} onChange={e => updateLesson(lesson.id, 'title', e.target.value)} className="w-full text-xs p-2 rounded glass-input text-white" />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Type</label>
                        <select value={lesson.type} onChange={e => updateLesson(lesson.id, 'type', e.target.value)} className="w-full text-xs p-2 rounded glass-input text-slate-300">
                          <option value="video">Video</option>
                          <option value="pdf">PDF</option>
                          <option value="assignment">Assignment</option>
                          <option value="pptx">Presentation</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Duration</label>
                        <input value={lesson.duration} onChange={e => updateLesson(lesson.id, 'duration', e.target.value)} className="w-full text-xs p-2 rounded glass-input text-white" />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Content URL</label>
                        <input value={lesson.contentUrl} onChange={e => updateLesson(lesson.id, 'contentUrl', e.target.value)} className="w-full text-xs p-2 rounded glass-input text-white" placeholder="https://..." />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left animate-fade-in">
      <div>
        <h3 className="text-sm font-extrabold text-white">Content Management System</h3>
        <p className="text-[10px] text-slate-500 mt-0.5">Edit your courses, manage lessons, and control publishing status.</p>
      </div>

      {myCourses.length === 0 ? (
        <div className="p-12 rounded-2xl glass-card text-center text-slate-500 italic text-sm">
          No courses found. Create your first course using the "Create Course" tab.
        </div>
      ) : (
        <div className="space-y-4">
          {myCourses.map(course => {
            const approvalStatus = (course as any).approvalStatus || (course.isPublished ? 'approved' : 'pending');
            return (
              <div key={course.id} className="p-5 rounded-2xl glass-card hover:border-white/20 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      {statusBadge(course)}
                      <span className="text-[9px] font-mono text-slate-500 uppercase bg-white/5 px-2 py-0.5 rounded border border-white/5">{course.category}</span>
                    </div>
                    <h4 className="text-sm font-extrabold text-white leading-snug">{course.title}</h4>
                    <p className="text-[10px] text-slate-500">{course.lessons.length} lessons • {course.duration} • ${course.price} • {course.enrollmentCount} enrolled</p>
                  </div>
                  <div className="flex gap-2 shrink-0 flex-wrap">
                    {approvalStatus === 'draft' && (
                      <button
                        onClick={() => handleSubmitForReview(course.id)}
                        className="px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold cursor-pointer hover:bg-amber-500/30 transition-colors flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> Submit for Review
                      </button>
                    )}
                    {approvalStatus === 'rejected' && (
                      <button
                        onClick={() => handleSubmitForReview(course.id)}
                        className="px-3 py-1.5 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-bold cursor-pointer hover:bg-rose-500/30 transition-colors"
                      >
                        Resubmit
                      </button>
                    )}
                    <button
                      onClick={() => openEdit(course)}
                      className="px-3 py-1.5 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 text-xs font-bold cursor-pointer hover:bg-blue-600/30 transition-colors flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit Course
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
