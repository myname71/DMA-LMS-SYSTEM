import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, Check, ChevronDown, Plus, Save, Trash2, Upload, X } from 'lucide-react';
import { Course, User } from '../../types';

interface AdminCourseManagerProps {
  currentUser: User;
  courses: Course[];
  users: User[];
  onRefresh: () => Promise<void> | void;
  triggerToast: (msg: string, type?: 'success' | 'warn') => void;
}

const emptyCreateForm = {
  title: '',
  headline: '',
  description: '',
  category: 'Digital Twin',
  level: 'Beginner',
  duration: '12 Hours',
  price: '0',
  instructorId: '',
  isPublished: true,
};

function copyCourse(course: any) {
  return {
    ...course,
    lessons: (course.lessons || []).map((lesson: any) => ({ ...lesson })),
    quizzes: (course.quizzes || []).map((quiz: any) => ({
      ...quiz,
      questions: (quiz.questions || []).map((question: any) => ({
        ...question,
        options: [...(question.options || [])],
      })),
    })),
  };
}

function parseImportedQuestions(raw: string): any[] {
  const text = raw.trim();
  if (!text) return [];
  if (text.startsWith('[')) {
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed)) throw new Error('JSON must contain an array');
    return parsed.map((q: any, index: number) => ({
      id: q.id || `q_${Date.now()}_${index}`,
      question: String(q.question || '').trim(),
      options: Array.isArray(q.options) ? q.options.map(String).filter(Boolean) : [],
      correctAnswer: Number(q.correctAnswer ?? q.correct ?? 0),
    }));
  }

  return text.split(/\r?\n/).filter(Boolean).map((line, index) => {
    const columns = line.split(/\t|,/).map(value => value.trim());
    const [question, ...rest] = columns;
    const correctAnswer = Number(rest.pop() || 0);
    return {
      id: `q_${Date.now()}_${index}`,
      question,
      options: rest.filter(Boolean),
      correctAnswer: Number.isFinite(correctAnswer) ? correctAnswer : 0,
    };
  });
}

export default function AdminCourseManager({
  currentUser,
  courses,
  users,
  onRefresh,
  triggerToast,
}: AdminCourseManagerProps) {
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [draft, setDraft] = useState<any | null>(null);
  const [createForm, setCreateForm] = useState(emptyCreateForm);
  const [saving, setSaving] = useState(false);
  const [newQuestion, setNewQuestion] = useState({ question: '', options: ['', '', '', ''], correctAnswer: 0 });
  const [bulkQuizId, setBulkQuizId] = useState<string | null>(null);
  const [bulkText, setBulkText] = useState('');

  const instructors = useMemo(
    () => users.filter(user => user.role === 'instructor' || user.role === 'admin' || user.role === 'super_admin'),
    [users],
  );

  useEffect(() => {
    if (!selectedCourseId && courses[0]) {
      setSelectedCourseId(courses[0].id);
      setDraft(copyCourse(courses[0]));
    }
  }, [courses, selectedCourseId]);

  const selectCourse = (courseId: string) => {
    const course = courses.find(item => item.id === courseId);
    setSelectedCourseId(courseId);
    setDraft(course ? copyCourse(course) : null);
    setBulkQuizId(null);
  };

  const updateDraft = (updates: Record<string, any>) => {
    setDraft((current: any) => current ? { ...current, ...updates } : current);
  };

  const updateLesson = (lessonId: string, updates: Record<string, any>) => {
    setDraft((current: any) => current ? {
      ...current,
      lessons: current.lessons.map((lesson: any) => lesson.id === lessonId ? { ...lesson, ...updates } : lesson),
    } : current);
  };

  const addLesson = () => {
    const lesson = {
      id: `module_${Date.now()}`,
      title: 'New Module',
      type: 'video',
      duration: '15 mins',
      contentUrl: '',
      isRequired: true,
    };
    setDraft((current: any) => current ? { ...current, lessons: [...(current.lessons || []), lesson] } : current);
  };

  const removeLesson = (lessonId: string) => {
    setDraft((current: any) => current ? {
      ...current,
      lessons: current.lessons.filter((lesson: any) => lesson.id !== lessonId),
      quizzes: current.quizzes.map((quiz: any) => quiz.moduleId === lessonId ? { ...quiz, moduleId: null, moduleTitle: 'Course assessment' } : quiz),
    } : current);
  };

  const addQuiz = (moduleId: string | null, isFinal = false) => {
    const lesson = draft?.lessons?.find((item: any) => item.id === moduleId);
    const quiz = {
      id: `quiz_${Date.now()}`,
      title: isFinal ? `${draft.title} Final Exam` : `${lesson?.title || 'Module'} Test`,
      moduleId,
      moduleTitle: isFinal ? 'Final course exam' : lesson?.title || 'Module assessment',
      isFinal,
      isPublished: true,
      passingScore: 70,
      questions: [],
    };
    setDraft((current: any) => current ? { ...current, quizzes: [...(current.quizzes || []), quiz] } : current);
  };

  const updateQuiz = (quizId: string, updates: Record<string, any>) => {
    setDraft((current: any) => current ? {
      ...current,
      quizzes: current.quizzes.map((quiz: any) => quiz.id === quizId ? { ...quiz, ...updates } : quiz),
    } : current);
  };

  const removeQuiz = (quizId: string) => {
    setDraft((current: any) => current ? { ...current, quizzes: current.quizzes.filter((quiz: any) => quiz.id !== quizId) } : current);
  };

  const addQuestion = (quizId: string) => {
    const question = {
      id: `question_${Date.now()}`,
      question: newQuestion.question.trim(),
      options: newQuestion.options.map(option => option.trim()).filter(Boolean),
      correctAnswer: newQuestion.correctAnswer,
    };
    if (!question.question || question.options.length < 2 || question.correctAnswer >= question.options.length) {
      triggerToast('Add a question, at least two options, and a valid correct answer.', 'warn');
      return;
    }
    setDraft((current: any) => current ? {
      ...current,
      quizzes: current.quizzes.map((quiz: any) => quiz.id === quizId
        ? { ...quiz, questions: [...(quiz.questions || []), question] }
        : quiz),
    } : current);
    setNewQuestion({ question: '', options: ['', '', '', ''], correctAnswer: 0 });
  };

  const removeQuestion = (quizId: string, questionId: string) => {
    setDraft((current: any) => current ? {
      ...current,
      quizzes: current.quizzes.map((quiz: any) => quiz.id === quizId
        ? { ...quiz, questions: quiz.questions.filter((question: any) => question.id !== questionId) }
        : quiz),
    } : current);
  };

  const importQuestions = (quizId: string) => {
    try {
      const imported = parseImportedQuestions(bulkText).filter(question =>
        question.question && question.options.length >= 2 && question.correctAnswer >= 0 && question.correctAnswer < question.options.length,
      );
      if (!imported.length) throw new Error('No valid questions found');
      setDraft((current: any) => current ? {
        ...current,
        quizzes: current.quizzes.map((quiz: any) => quiz.id === quizId
          ? { ...quiz, questions: [...(quiz.questions || []), ...imported] }
          : quiz),
      } : current);
      setBulkText('');
      setBulkQuizId(null);
      triggerToast(`${imported.length} MCQ question${imported.length === 1 ? '' : 's'} added.`);
    } catch (error: any) {
      triggerToast(error.message || 'Could not import questions.', 'warn');
    }
  };

  const saveCourse = async (publish?: boolean) => {
    if (!draft) return;
    setSaving(true);
    try {
      const updates = {
        title: draft.title,
        headline: draft.headline,
        description: draft.description,
        category: draft.category,
        level: draft.level,
        duration: draft.duration,
        price: Number(draft.price || 0),
        image: draft.image || '',
        lessons: draft.lessons || [],
        quizzes: draft.quizzes || [],
        isPublished: publish === undefined ? draft.isPublished !== false : publish,
        approvalStatus: publish === false ? 'draft' : 'approved',
      };
      const response = await fetch('/api/courses/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: draft.id, updates }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Course update failed');
      await onRefresh();
      setDraft(copyCourse(data.course));
      triggerToast(publish === false ? 'Course saved as a draft.' : 'Course overwritten and published.');
    } catch (error: any) {
      triggerToast(error.message || 'Course update failed.', 'warn');
    } finally {
      setSaving(false);
    }
  };

  const createCourse = async () => {
    if (!createForm.title.trim() || !createForm.description.trim()) {
      triggerToast('Course title and description are required.', 'warn');
      return;
    }
    setSaving(true);
    try {
      const assignedUser = instructors.find(user => user.id === createForm.instructorId);
      const response = await fetch('/api/courses/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...createForm,
          price: Number(createForm.price || 0),
          instructorName: assignedUser?.name,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Course creation failed');
      await onRefresh();
      setCreateForm({ ...emptyCreateForm });
      setSelectedCourseId(data.course.id);
      setDraft(copyCourse(data.course));
      triggerToast('Course created. Add modules and assessments below.');
    } catch (error: any) {
      triggerToast(error.message || 'Course creation failed.', 'warn');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h3 className="text-sm font-bold uppercase text-slate-300">Course Manager & Assessment Builder</h3>
          <p className="text-xs text-slate-500 mt-1">Admins can overwrite instructor courses, create new courses, and publish module or final MCQ tests.</p>
        </div>
        <span className="text-[10px] font-mono text-amber-400 border border-amber-500/20 bg-amber-500/10 rounded px-2 py-1">
          {currentUser.role === 'super_admin' ? 'SUPER ADMIN WRITE ACCESS' : 'ADMIN WRITE ACCESS'}
        </span>
      </div>

      <div className="p-5 rounded-2xl border border-blue-500/20 bg-blue-500/5 space-y-4">
        <div className="flex items-center gap-2">
          <Plus className="w-4 h-4 text-blue-400" />
          <h4 className="text-xs font-bold uppercase text-blue-300">Create Course</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input value={createForm.title} onChange={e => setCreateForm({ ...createForm, title: e.target.value })} placeholder="Course title" className="glass-input p-2.5 rounded-lg text-xs text-white" />
          <input value={createForm.headline} onChange={e => setCreateForm({ ...createForm, headline: e.target.value })} placeholder="Short headline" className="glass-input p-2.5 rounded-lg text-xs text-white" />
          <textarea value={createForm.description} onChange={e => setCreateForm({ ...createForm, description: e.target.value })} placeholder="Course description" rows={3} className="glass-input p-2.5 rounded-lg text-xs text-white md:col-span-2" />
          <select value={createForm.category} onChange={e => setCreateForm({ ...createForm, category: e.target.value })} className="glass-input p-2.5 rounded-lg text-xs text-white">
            <option>Digital Twin</option><option>Industrial Robotics</option><option>Smart Factory & IoT</option><option>Additive Manufacturing</option><option>Sustainability</option>
          </select>
          <select value={createForm.instructorId} onChange={e => setCreateForm({ ...createForm, instructorId: e.target.value })} className="glass-input p-2.5 rounded-lg text-xs text-white">
            <option value="">Assign to me</option>
            {instructors.map(user => <option key={user.id} value={user.id}>{user.name} · {user.role}</option>)}
          </select>
          <input value={createForm.duration} onChange={e => setCreateForm({ ...createForm, duration: e.target.value })} placeholder="Duration" className="glass-input p-2.5 rounded-lg text-xs text-white" />
          <input type="number" value={createForm.price} onChange={e => setCreateForm({ ...createForm, price: e.target.value })} placeholder="Price" className="glass-input p-2.5 rounded-lg text-xs text-white" />
        </div>
        <button onClick={createCourse} disabled={saving} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold cursor-pointer">
          Create Course
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-5">
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Existing courses</p>
          {courses.map(course => (
            <button key={course.id} onClick={() => selectCourse(course.id)} className={`w-full text-left p-3 rounded-xl border transition-colors cursor-pointer ${selectedCourseId === course.id ? 'border-amber-500/40 bg-amber-500/10' : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.06]'}`}>
              <div className="text-xs font-bold text-white truncate">{course.title}</div>
              <div className="text-[10px] text-slate-500 mt-1">{course.instructorName} · {course.lessons?.length || 0} modules</div>
            </button>
          ))}
          {courses.length === 0 && <p className="text-xs text-slate-500">No courses yet.</p>}
        </div>

        {draft && (
          <div className="space-y-5">
            <div className="p-5 rounded-2xl glass-card space-y-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2"><BookOpen className="w-4 h-4 text-amber-400" /><h4 className="text-sm font-bold text-white">Overwrite Course</h4></div>
                <span className="text-[10px] text-slate-500 font-mono">{draft.instructorName}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input value={draft.title || ''} onChange={e => updateDraft({ title: e.target.value })} className="glass-input p-2.5 rounded-lg text-xs text-white" placeholder="Course title" />
                <input value={draft.headline || ''} onChange={e => updateDraft({ headline: e.target.value })} className="glass-input p-2.5 rounded-lg text-xs text-white" placeholder="Headline" />
                <textarea value={draft.description || ''} onChange={e => updateDraft({ description: e.target.value })} rows={3} className="glass-input p-2.5 rounded-lg text-xs text-white md:col-span-2" placeholder="Description" />
                <input value={draft.image || ''} onChange={e => updateDraft({ image: e.target.value })} className="glass-input p-2.5 rounded-lg text-xs text-white md:col-span-2" placeholder="Course image URL" />
              </div>
            </div>

            <div className="p-5 rounded-2xl glass-card space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h4 className="text-xs font-bold uppercase text-slate-300">Modules</h4>
                <button onClick={addLesson} className="text-xs text-blue-400 hover:text-blue-300 font-bold cursor-pointer"><Plus className="w-3.5 h-3.5 inline" /> Add module</button>
              </div>
              {(draft.lessons || []).map((lesson: any, index: number) => (
                <div key={lesson.id} className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 w-5">{index + 1}</span>
                  <input value={lesson.title || ''} onChange={e => updateLesson(lesson.id, { title: e.target.value })} className="glass-input p-2 rounded-lg text-xs text-white flex-1" />
                  <button onClick={() => addQuiz(lesson.id)} className="px-2.5 py-2 rounded-lg border border-blue-500/20 text-blue-400 text-[10px] font-bold cursor-pointer">+ Module MCQ</button>
                  <button onClick={() => removeLesson(lesson.id)} className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ))}
              <button onClick={() => addQuiz(null, true)} className="px-3 py-2 rounded-lg border border-purple-500/30 text-purple-300 text-xs font-bold cursor-pointer">+ Add Final Course Exam</button>
            </div>

            <div className="space-y-4">
              {(draft.quizzes || []).map((quiz: any) => (
                <div key={quiz.id} className="p-5 rounded-2xl border border-white/10 bg-slate-950/40 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-[1fr_140px] gap-2">
                      <input value={quiz.title || ''} onChange={e => updateQuiz(quiz.id, { title: e.target.value })} className="glass-input p-2.5 rounded-lg text-xs text-white" />
                      <input type="number" min="0" max="100" value={quiz.passingScore ?? 70} onChange={e => updateQuiz(quiz.id, { passingScore: Number(e.target.value) })} className="glass-input p-2.5 rounded-lg text-xs text-white" placeholder="Pass %" />
                    </div>
                    <button onClick={() => removeQuiz(quiz.id)} className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500">
                    <span className={`px-2 py-1 rounded border ${quiz.isFinal ? 'border-purple-500/30 text-purple-300' : 'border-blue-500/20 text-blue-300'}`}>{quiz.isFinal ? 'FINAL COURSE EXAM' : quiz.moduleTitle || 'MODULE TEST'}</span>
                    <span>{quiz.questions?.length || 0} MCQs</span>
                  </div>
                  {(quiz.questions || []).map((question: any, index: number) => (
                    <div key={question.id || index} className="flex items-start gap-2 p-3 rounded-lg bg-white/[0.03]">
                      <span className="text-[10px] text-slate-500">{index + 1}.</span>
                      <div className="flex-1 text-xs text-slate-300"><p>{question.question}</p><p className="text-[10px] text-slate-500 mt-1">{question.options?.length || 0} options · correct answer {Number(question.correctAnswer) + 1}</p></div>
                      <button onClick={() => removeQuestion(quiz.id, question.id)} className="text-rose-400 cursor-pointer"><X className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                  <div className="p-3 rounded-xl border border-white/10 space-y-2">
                    <input value={newQuestion.question} onChange={e => setNewQuestion({ ...newQuestion, question: e.target.value })} placeholder="MCQ question" className="glass-input p-2 rounded-lg text-xs text-white w-full" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {newQuestion.options.map((option, index) => (
                        <input key={index} value={option} onChange={e => { const options = [...newQuestion.options]; options[index] = e.target.value; setNewQuestion({ ...newQuestion, options }); }} placeholder={`Option ${index + 1}`} className="glass-input p-2 rounded-lg text-xs text-white" />
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <select value={newQuestion.correctAnswer} onChange={e => setNewQuestion({ ...newQuestion, correctAnswer: Number(e.target.value) })} className="glass-input p-2 rounded-lg text-xs text-white">
                        {newQuestion.options.map((_, index) => <option key={index} value={index}>Correct: option {index + 1}</option>)}
                      </select>
                      <button onClick={() => addQuestion(quiz.id)} className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold cursor-pointer"><Plus className="w-3 h-3 inline" /> Add MCQ</button>
                      <button onClick={() => setBulkQuizId(bulkQuizId === quiz.id ? null : quiz.id)} className="px-3 py-2 rounded-lg border border-white/10 text-slate-300 text-[10px] font-bold cursor-pointer"><Upload className="w-3 h-3 inline" /> Import</button>
                    </div>
                    {bulkQuizId === quiz.id && (
                      <div className="space-y-2 pt-2 border-t border-white/10">
                        <textarea value={bulkText} onChange={e => setBulkText(e.target.value)} rows={4} placeholder={'JSON array or one CSV/TSV row per question: question, option 1, option 2, option 3, option 4, correct option index'} className="glass-input p-2 rounded-lg text-[10px] text-white w-full" />
                        <button onClick={() => importQuestions(quiz.id)} className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold cursor-pointer"><Check className="w-3 h-3 inline" /> Add Imported MCQs</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 sticky bottom-3">
              <button onClick={() => saveCourse(false)} disabled={saving} className="px-4 py-2.5 rounded-lg border border-white/10 bg-slate-900 text-slate-300 text-xs font-bold cursor-pointer disabled:opacity-50"><Save className="w-3.5 h-3.5 inline mr-1" /> Save Draft</button>
              <button onClick={() => saveCourse(true)} disabled={saving} className="px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer disabled:opacity-50"><Check className="w-3.5 h-3.5 inline mr-1" /> Save & Publish</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}