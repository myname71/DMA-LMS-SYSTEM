import React, { useState, useEffect, useRef } from 'react';
import {
  ClipboardList, BookOpen, GraduationCap, ChevronRight, ChevronLeft,
  CheckCircle, XCircle, Clock, BarChart2, Upload, Star, AlertCircle,
  Play, RotateCcw, FileText, Calendar, Lock, TrendingUp, Award
} from 'lucide-react';

interface AssessmentModuleProps {
  currentUser: any;
  courses: any[];
  enrollments: any[];
}

type TabType = 'quizzes' | 'assignments' | 'exams';
type QuizView = 'list' | 'attempt' | 'results' | 'analytics';
type AssignmentView = 'list' | 'details' | 'submit' | 'review' | 'feedback';
type ExamView = 'schedule' | 'attempt' | 'results';

const API = (url: string, opts?: RequestInit) =>
  fetch(url, { credentials: 'include', headers: { 'Content-Type': 'application/json' }, ...opts });

export default function AssessmentModule({ currentUser, courses, enrollments }: AssessmentModuleProps) {
  const [tab, setTab] = useState<TabType>('quizzes');

  // ── QUIZ STATE ──────────────────────────────────────────────────────────────
  const [quizView, setQuizView] = useState<QuizView>('list');
  const [quizAttempts, setQuizAttempts] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [currentAnswers, setCurrentAnswers] = useState<number[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [quizTimer, setQuizTimer] = useState(0);
  const [lastAttempt, setLastAttempt] = useState<any>(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const timerRef = useRef<any>(null);

  // ── ASSIGNMENT STATE ────────────────────────────────────────────────────────
  const [assignView, setAssignView] = useState<AssignmentView>('list');
  const [mySubmissions, setMySubmissions] = useState<any[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [selectedAssignCourse, setSelectedAssignCourse] = useState<any>(null);
  const [submitContent, setSubmitContent] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);

  // ── EXAM STATE ──────────────────────────────────────────────────────────────
  const [examView, setExamView] = useState<ExamView>('schedule');
  const [exams, setExams] = useState<any[]>([]);
  const [examResults, setExamResults] = useState<any[]>([]);
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [examAnswers, setExamAnswers] = useState<number[]>([]);
  const [examCurrentQ, setExamCurrentQ] = useState(0);
  const [examTimer, setExamTimer] = useState(0);
  const [examTimerActive, setExamTimerActive] = useState(false);
  const [lastExamAttempt, setLastExamAttempt] = useState<any>(null);
  const [examLoading, setExamLoading] = useState(false);
  const examTimerRef = useRef<any>(null);

  // Enrolled courses
  const enrolledCourses = courses.filter(c =>
    enrollments.some(e => e.courseId === c.id && e.userId === currentUser?.id)
  );

  // All quizzes across enrolled courses
  const allQuizzes = enrolledCourses.flatMap(c =>
    (c.quizzes || []).map((q: any) => ({ ...q, courseId: c.id, courseTitle: c.title, course: c }))
  );

  // All assignments across enrolled courses
  const allAssignments = enrolledCourses.flatMap(c =>
    (c.assignments || []).map((a: any) => ({ ...a, courseId: c.id, courseTitle: c.title, course: c }))
  );

  useEffect(() => {
    if (currentUser) {
      loadQuizAttempts();
      loadMySubmissions();
      loadExams();
      loadExamResults();
    }
  }, [currentUser]);

  useEffect(() => {
    if (quizView === 'analytics' && (currentUser?.role === 'admin' || currentUser?.role === 'super_admin')) {
      loadAnalytics();
    }
  }, [quizView]);

  async function loadQuizAttempts() {
    try {
      const r = await API(`/api/quiz/attempts/${currentUser.id}`);
      const d = await r.json();
      setQuizAttempts(d.attempts || []);
    } catch {}
  }

  async function loadAnalytics() {
    try {
      const r = await API('/api/quiz/analytics');
      const d = await r.json();
      setAnalytics(d);
    } catch {}
  }

  async function loadMySubmissions() {
    try {
      const r = await API(`/api/assignments/student/${currentUser.id}`);
      const d = await r.json();
      setMySubmissions(d.submissions || []);
    } catch {}
  }

  async function loadExams() {
    try {
      const r = await API('/api/exams');
      const d = await r.json();
      setExams(d.exams || []);
    } catch {}
  }

  async function loadExamResults() {
    try {
      const r = await API(`/api/exams/results/${currentUser.id}`);
      const d = await r.json();
      setExamResults(d.results || []);
    } catch {}
  }

  // ── QUIZ LOGIC ──────────────────────────────────────────────────────────────
  function startQuiz(quiz: any, course: any) {
    setSelectedQuiz(quiz);
    setSelectedCourse(course);
    setCurrentAnswers(new Array(quiz.questions.length).fill(-1));
    setCurrentQ(0);
    setQuizTimer(0);
    setQuizView('attempt');
    timerRef.current = setInterval(() => setQuizTimer(t => t + 1), 1000);
  }

  async function submitQuiz() {
    clearInterval(timerRef.current);
    setQuizLoading(true);
    try {
      const r = await API(`/api/quiz/attempt`, {
        method: 'POST',
        body: JSON.stringify({ courseId: selectedCourse.id, quizId: selectedQuiz.id, answers: currentAnswers, timeTaken: quizTimer }),
      });
      const d = await r.json();
      setLastAttempt(d.attempt);
      setQuizAttempts(prev => [d.attempt, ...prev]);
      setQuizView('results');
    } catch {}
    setQuizLoading(false);
  }

  function formatTime(s: number) {
    const m = Math.floor(s / 60);
    return `${m}:${String(s % 60).padStart(2, '0')}`;
  }

  // ── ASSIGNMENT LOGIC ────────────────────────────────────────────────────────
  async function submitAssignment() {
    if (!submitContent.trim()) return;
    setSubmitLoading(true);
    try {
      const r = await API('/api/assignments/submit', {
        method: 'POST',
        body: JSON.stringify({ courseId: selectedAssignCourse.id, assignmentId: selectedAssignment.id, content: submitContent }),
      });
      const d = await r.json();
      setMySubmissions(prev => [d.submission, ...prev]);
      setSubmitContent('');
      setAssignView('list');
    } catch {}
    setSubmitLoading(false);
  }

  // ── EXAM LOGIC ──────────────────────────────────────────────────────────────
  function startExam(exam: any) {
    setSelectedExam(exam);
    setExamAnswers(new Array(exam.questions.length).fill(-1));
    setExamCurrentQ(0);
    setExamTimer((exam.durationMinutes || 60) * 60);
    setExamTimerActive(true);
    setExamView('attempt');
    examTimerRef.current = setInterval(() => {
      setExamTimer(t => {
        if (t <= 1) { clearInterval(examTimerRef.current); submitExam(exam, []); return 0; }
        return t - 1;
      });
    }, 1000);
  }

  async function submitExam(exam: any, answers: number[]) {
    clearInterval(examTimerRef.current);
    setExamTimerActive(false);
    setExamLoading(true);
    try {
      const r = await API(`/api/exams/${exam.id}/attempt`, {
        method: 'POST',
        body: JSON.stringify({ answers, timeTaken: (exam.durationMinutes || 60) * 60 - examTimer }),
      });
      const d = await r.json();
      setLastExamAttempt(d.attempt);
      setExamResults(prev => [d.attempt, ...prev]);
      setExamView('results');
    } catch {}
    setExamLoading(false);
  }

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super_admin';
  const isInstructor = currentUser?.role === 'instructor' || isAdmin;

  const TAB_CLASSES = (active: boolean) =>
    `px-4 py-2 text-xs font-bold rounded-lg cursor-pointer transition-colors ${active ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`;

  return (
    <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-blue-400" />
          </div>
          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest font-mono">Assessment Centre</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">Assessments</h1>
        <p className="text-slate-400 text-sm">Quizzes, assignments, and scheduled exams for your enrolled courses.</p>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-2 mb-8 p-1.5 bg-slate-900/50 border border-slate-800 rounded-xl w-fit">
        {([['quizzes', 'Quizzes', BookOpen], ['assignments', 'Assignments', FileText], ['exams', 'Exams', GraduationCap]] as const).map(([key, label, Icon]) => (
          <button key={key} onClick={() => setTab(key as TabType)} className={TAB_CLASSES(tab === key)}>
            <span className="flex items-center gap-1.5">
              <Icon className="w-3.5 h-3.5" />
              {label}
            </span>
          </button>
        ))}
      </div>

      {/* ────────────── QUIZ MODULE ────────────── */}
      {tab === 'quizzes' && (
        <div>
          {/* Sub-nav */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {([['list', 'Quiz List'], ['results', 'My Results'], ...(isAdmin ? [['analytics', 'Analytics']] : [])] as const).map(([key, label]) => (
              <button key={key} onClick={() => setQuizView(key as QuizView)}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg cursor-pointer transition-colors ${quizView === key ? 'text-blue-400 border border-blue-500/40 bg-blue-600/10' : 'text-slate-500 border border-slate-800 hover:text-slate-300'}`}>
                {label}
              </button>
            ))}
          </div>

          {/* Quiz List */}
          {quizView === 'list' && (
            <div className="space-y-4">
              {allQuizzes.length === 0 ? (
                <EmptyState icon={BookOpen} title="No quizzes available" desc="Enrol in a course to access its quizzes." />
              ) : allQuizzes.map((quiz, i) => {
                const attempted = quizAttempts.filter(a => a.quizId === quiz.id);
                const best = attempted.length > 0 ? Math.max(...attempted.map(a => a.score)) : null;
                return (
                  <div key={i} className="p-5 rounded-2xl border border-slate-800 bg-[#111827] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] text-blue-400 font-mono font-bold uppercase">{quiz.courseTitle}</p>
                      <h4 className="text-sm font-extrabold text-white">{quiz.title}</h4>
                      <p className="text-xs text-slate-400">
                        {quiz.moduleTitle || 'Course assessment'} · {quiz.questions?.length || 0} questions · Pass: {quiz.passingScore || 80}%
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {best !== null && (
                        <div className={`px-3 py-1 rounded-full text-[10px] font-bold ${best >= (quiz.passingScore || 80) ? 'bg-teal-500/10 text-teal-400 border border-teal-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}>
                          Best: {best}%
                        </div>
                      )}
                      <button onClick={() => startQuiz(quiz, quiz.course)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors">
                        <Play className="w-3 h-3" /> {attempted.length > 0 ? 'Retry' : 'Start'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Quiz Attempt */}
          {quizView === 'attempt' && selectedQuiz && (
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[10px] text-blue-400 font-mono font-bold uppercase mb-1">{selectedCourse?.title}</p>
                  <h3 className="text-base font-extrabold text-white">{selectedQuiz.title}</h3>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
                  <Clock className="w-3.5 h-3.5" /> {formatTime(quizTimer)}
                </div>
              </div>

              {/* Progress */}
              <div className="flex gap-1 mb-6">
                {selectedQuiz.questions.map((_: any, i: number) => (
                  <div key={i} onClick={() => setCurrentQ(i)} className={`h-1.5 flex-1 rounded-full cursor-pointer transition-colors ${i === currentQ ? 'bg-blue-500' : currentAnswers[i] >= 0 ? 'bg-teal-500' : 'bg-slate-700'}`} />
                ))}
              </div>

              {/* Question */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-[#111827] mb-4">
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-3">Question {currentQ + 1} of {selectedQuiz.questions.length}</p>
                <p className="text-sm font-semibold text-white mb-5">{selectedQuiz.questions[currentQ]?.question}</p>
                <div className="space-y-2">
                  {selectedQuiz.questions[currentQ]?.options.map((opt: string, oi: number) => (
                    <button key={oi} onClick={() => {
                      const a = [...currentAnswers];
                      a[currentQ] = oi;
                      setCurrentAnswers(a);
                    }}
                      className={`w-full text-left px-4 py-3 rounded-xl border text-xs font-medium cursor-pointer transition-all ${currentAnswers[currentQ] === oi ? 'border-blue-500 bg-blue-600/15 text-blue-300' : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-600'}`}>
                      <span className="font-bold text-slate-500 mr-2">{String.fromCharCode(65 + oi)}.</span>{opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <button onClick={() => setCurrentQ(q => Math.max(0, q - 1))} disabled={currentQ === 0}
                  className="flex items-center gap-1 px-4 py-2 rounded-lg border border-slate-700 text-slate-400 text-xs cursor-pointer disabled:opacity-30">
                  <ChevronLeft className="w-3.5 h-3.5" /> Prev
                </button>
                {currentQ < selectedQuiz.questions.length - 1 ? (
                  <button onClick={() => setCurrentQ(q => q + 1)}
                    className="flex items-center gap-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs cursor-pointer">
                    Next <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button onClick={submitQuiz} disabled={quizLoading}
                    className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold cursor-pointer disabled:opacity-50">
                    <CheckCircle className="w-3.5 h-3.5" /> {quizLoading ? 'Submitting…' : 'Submit Quiz'}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Quiz Results */}
          {quizView === 'results' && (
            <div className="space-y-4">
              {lastAttempt && (
                <ResultCard attempt={lastAttempt} onRetry={() => { if (selectedQuiz && selectedCourse) startQuiz(selectedQuiz, selectedCourse); }} />
              )}
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-4">All Quiz Attempts</h4>
              {quizAttempts.length === 0 ? (
                <EmptyState icon={BarChart2} title="No attempts yet" desc="Take a quiz to see your results here." />
              ) : quizAttempts.map(a => (
                <div key={a.id} className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold text-white">{a.quizTitle}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{new Date(a.attemptedAt).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${a.passed ? 'bg-teal-500/10 text-teal-400' : 'bg-red-500/10 text-red-400'}`}>{a.score}%</span>
                    <span className={`text-[10px] font-bold ${a.passed ? 'text-teal-400' : 'text-red-400'}`}>{a.passed ? 'PASS' : 'FAIL'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quiz Analytics (Admin) */}
          {quizView === 'analytics' && isAdmin && (
            <div className="space-y-6">
              {!analytics ? (
                <div className="text-center py-12 text-slate-500 text-xs">Loading analytics…</div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { label: 'Total Attempts', value: analytics.totalAttempts, color: 'text-blue-400' },
                      { label: 'Passed', value: analytics.passed, color: 'text-teal-400' },
                      { label: 'Failed', value: analytics.failed, color: 'text-red-400' },
                      { label: 'Avg Score', value: `${analytics.avgScore}%`, color: 'text-amber-400' },
                    ].map(s => (
                      <div key={s.label} className="p-5 rounded-2xl border border-slate-800 bg-[#111827] text-center">
                        <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
                        <p className="text-[10px] text-slate-500 uppercase mt-1 font-mono">{s.label}</p>
                      </div>
                    ))}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Per-Quiz Breakdown</h4>
                    <div className="space-y-3">
                      {analytics.quizStats.map((q: any, i: number) => (
                        <div key={i} className="p-4 rounded-xl border border-slate-800 bg-slate-900/50">
                          <div className="flex justify-between items-center mb-2">
                            <p className="text-xs font-bold text-white">{q.title || 'Quiz'}</p>
                            <span className="text-[10px] text-slate-500">{q.attempts} attempts</span>
                          </div>
                          <div className="flex gap-4 text-[10px] text-slate-400">
                            <span className="text-teal-400">Passed: {q.passed}</span>
                            <span className="text-red-400">Failed: {q.attempts - q.passed}</span>
                            <span className="text-amber-400">Avg: {q.avgScore}%</span>
                          </div>
                          <div className="mt-2 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-teal-500 rounded-full" style={{ width: `${q.attempts > 0 ? (q.passed / q.attempts) * 100 : 0}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* ────────────── ASSIGNMENT MODULE ────────────── */}
      {tab === 'assignments' && (
        <div>
          <div className="flex gap-2 mb-6 flex-wrap">
            {([['list', 'Assignment List'], ['review', 'My Submissions'], ['feedback', 'Feedback']] as const).map(([key, label]) => (
              <button key={key} onClick={() => setAssignView(key as AssignmentView)}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg cursor-pointer transition-colors ${assignView === key ? 'text-blue-400 border border-blue-500/40 bg-blue-600/10' : 'text-slate-500 border border-slate-800 hover:text-slate-300'}`}>
                {label}
              </button>
            ))}
          </div>

          {/* Assignment List */}
          {assignView === 'list' && (
            <div className="space-y-4">
              {allAssignments.length === 0 ? (
                <EmptyState icon={FileText} title="No assignments available" desc="Assignments from your enrolled courses appear here." />
              ) : allAssignments.map((a, i) => {
                const sub = mySubmissions.find(s => s.assignmentId === a.id);
                return (
                  <div key={i} className="p-5 rounded-2xl border border-slate-800 bg-[#111827]">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-1.5">
                        <p className="text-[10px] text-blue-400 font-mono font-bold uppercase">{a.courseTitle}</p>
                        <h4 className="text-sm font-extrabold text-white">{a.title}</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">{a.description}</p>
                        <p className="text-[10px] text-slate-500 font-mono">Due: {a.dueDate || 'No deadline set'}</p>
                      </div>
                      <div className="shrink-0 flex flex-col items-end gap-2">
                        {sub ? (
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${sub.grade ? 'bg-teal-500/10 text-teal-400 border-teal-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'}`}>
                            {sub.grade ? `Graded: ${sub.grade}` : 'Submitted'}
                          </span>
                        ) : (
                          <button onClick={() => { setSelectedAssignment(a); setSelectedAssignCourse(a.course); setAssignView('submit'); }}
                            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors">
                            <Upload className="w-3 h-3" /> Submit
                          </button>
                        )}
                        {sub && (
                          <button onClick={() => { setSelectedSubmission(sub); setAssignView('review'); }}
                            className="text-[10px] text-blue-400 hover:underline cursor-pointer">View submission</button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Submit Assignment */}
          {assignView === 'submit' && selectedAssignment && (
            <div className="max-w-2xl mx-auto">
              <button onClick={() => setAssignView('list')} className="flex items-center gap-1 text-slate-400 hover:text-white text-xs mb-5 cursor-pointer">
                <ChevronLeft className="w-3.5 h-3.5" /> Back to list
              </button>
              <div className="p-6 rounded-2xl border border-slate-800 bg-[#111827] space-y-4">
                <div>
                  <p className="text-[10px] text-blue-400 font-mono font-bold uppercase">{selectedAssignCourse?.title}</p>
                  <h3 className="text-base font-extrabold text-white mt-1">{selectedAssignment.title}</h3>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{selectedAssignment.description}</p>
                </div>
                <div className="pt-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Your Submission</label>
                  <textarea
                    value={submitContent}
                    onChange={e => setSubmitContent(e.target.value)}
                    rows={8}
                    placeholder="Write your answer, paste your work, or describe your submission here..."
                    className="w-full text-xs p-3 rounded-lg bg-slate-900 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 resize-none"
                  />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setAssignView('list')} className="flex-1 py-2.5 rounded-lg border border-slate-700 text-slate-400 text-xs cursor-pointer hover:bg-slate-800">Cancel</button>
                  <button onClick={submitAssignment} disabled={submitLoading || !submitContent.trim()}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg cursor-pointer disabled:opacity-50">
                    <Upload className="w-3.5 h-3.5" /> {submitLoading ? 'Submitting…' : 'Submit Assignment'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Submission Review */}
          {assignView === 'review' && selectedSubmission && (
            <div className="max-w-2xl mx-auto">
              <button onClick={() => setAssignView('list')} className="flex items-center gap-1 text-slate-400 hover:text-white text-xs mb-5 cursor-pointer">
                <ChevronLeft className="w-3.5 h-3.5" /> Back
              </button>
              <div className="p-6 rounded-2xl border border-slate-800 bg-[#111827] space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-white">Submission Review</h3>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${selectedSubmission.grade ? 'bg-teal-500/10 text-teal-400 border-teal-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'}`}>
                    {selectedSubmission.grade ? `Grade: ${selectedSubmission.grade}` : 'Awaiting Review'}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase mb-1.5">Your Submission</p>
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{selectedSubmission.content}</div>
                </div>
                <p className="text-[10px] text-slate-500">Submitted: {new Date(selectedSubmission.submittedAt).toLocaleString()}</p>
              </div>
            </div>
          )}

          {/* Feedback Page */}
          {assignView === 'feedback' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Graded Submissions with Feedback</h4>
              {mySubmissions.filter(s => s.grade).length === 0 ? (
                <EmptyState icon={Star} title="No feedback yet" desc="Submit assignments to receive instructor feedback." />
              ) : mySubmissions.filter(s => s.grade).map(sub => (
                <div key={sub.id} className="p-5 rounded-2xl border border-slate-800 bg-[#111827] space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-white">Assignment #{sub.assignmentId?.slice(-6)}</p>
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-teal-500/10 text-teal-400 border border-teal-500/30">{sub.grade}</span>
                  </div>
                  {sub.feedback && (
                    <div className="p-4 rounded-xl bg-blue-600/5 border border-blue-500/20">
                      <p className="text-[10px] font-bold text-blue-400 uppercase mb-1.5">Instructor Feedback</p>
                      <p className="text-xs text-slate-300 leading-relaxed">{sub.feedback}</p>
                    </div>
                  )}
                  <p className="text-[10px] text-slate-500">Graded: {sub.gradedAt ? new Date(sub.gradedAt).toLocaleString() : 'N/A'}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ────────────── EXAM MODULE ────────────── */}
      {tab === 'exams' && (
        <div>
          <div className="flex gap-2 mb-6 flex-wrap">
            {([['schedule', 'Exam Schedule'], ['results', 'My Results']] as const).map(([key, label]) => (
              <button key={key} onClick={() => setExamView(key as ExamView)}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg cursor-pointer transition-colors ${examView === key ? 'text-blue-400 border border-blue-500/40 bg-blue-600/10' : 'text-slate-500 border border-slate-800 hover:text-slate-300'}`}>
                {label}
              </button>
            ))}
          </div>

          {/* Exam Schedule */}
          {examView === 'schedule' && (
            <div className="space-y-4">
              {exams.length === 0 ? (
                <EmptyState icon={Calendar} title="No exams scheduled" desc={isInstructor ? "Admins and instructors can create exams from the admin panel." : "No exams are currently scheduled."} />
              ) : exams.map(exam => {
                const attempted = examResults.filter(r => r.examId === exam.id);
                const best = attempted.length > 0 ? Math.max(...attempted.map(r => r.score)) : null;
                const isPast = exam.scheduledAt ? new Date(exam.scheduledAt) < new Date() : false;
                return (
                  <div key={exam.id} className="p-5 rounded-2xl border border-slate-800 bg-[#111827]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-extrabold text-white">{exam.title}</h4>
                          {!exam.isPublished && <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded px-1.5 py-0.5">Draft</span>}
                        </div>
                        {exam.description && <p className="text-xs text-slate-400">{exam.description}</p>}
                        <div className="flex flex-wrap gap-3 text-[10px] text-slate-500 font-mono">
                          {exam.scheduledAt && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(exam.scheduledAt).toLocaleString()}</span>}
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {exam.durationMinutes} min</span>
                          <span>{exam.questions?.length || 0} questions</span>
                          <span>Pass: {exam.passingScore}%</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {best !== null && (
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${best >= exam.passingScore ? 'bg-teal-500/10 text-teal-400 border-teal-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}`}>
                            Best: {best}%
                          </span>
                        )}
                        {exam.isPublished && (!exam.scheduledAt || !isPast || attempted.length > 0) ? (
                          <button onClick={() => startExam(exam)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors">
                            <Play className="w-3 h-3" /> {attempted.length > 0 ? 'Retake' : 'Start Exam'}
                          </button>
                        ) : (
                          <div className="flex items-center gap-1.5 px-4 py-2 border border-slate-700 text-slate-500 text-xs rounded-lg">
                            <Lock className="w-3 h-3" /> {exam.isPublished ? 'Upcoming' : 'Draft'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Exam Attempt */}
          {examView === 'attempt' && selectedExam && (
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-extrabold text-white">{selectedExam.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{examCurrentQ + 1} / {selectedExam.questions.length} questions</p>
                </div>
                <div className={`flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1.5 rounded-lg border ${examTimer < 300 ? 'text-red-400 border-red-500/30 bg-red-500/10' : 'text-amber-400 border-amber-500/30 bg-amber-500/10'}`}>
                  <Clock className="w-3.5 h-3.5" /> {formatTime(examTimer)}
                </div>
              </div>

              <div className="flex gap-1 mb-6">
                {selectedExam.questions.map((_: any, i: number) => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i === examCurrentQ ? 'bg-blue-500' : examAnswers[i] >= 0 ? 'bg-teal-500' : 'bg-slate-700'}`} />
                ))}
              </div>

              <div className="p-6 rounded-2xl border border-slate-800 bg-[#111827] mb-4">
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-3">Question {examCurrentQ + 1}</p>
                <p className="text-sm font-semibold text-white mb-5">{selectedExam.questions[examCurrentQ]?.question}</p>
                <div className="space-y-2">
                  {(selectedExam.questions[examCurrentQ]?.options || []).map((opt: string, oi: number) => (
                    <button key={oi} onClick={() => {
                      const a = [...examAnswers];
                      a[examCurrentQ] = oi;
                      setExamAnswers(a);
                    }}
                      className={`w-full text-left px-4 py-3 rounded-xl border text-xs font-medium cursor-pointer transition-all ${examAnswers[examCurrentQ] === oi ? 'border-blue-500 bg-blue-600/15 text-blue-300' : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-600'}`}>
                      <span className="font-bold text-slate-500 mr-2">{String.fromCharCode(65 + oi)}.</span>{opt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button onClick={() => setExamCurrentQ(q => Math.max(0, q - 1))} disabled={examCurrentQ === 0}
                  className="flex items-center gap-1 px-4 py-2 rounded-lg border border-slate-700 text-slate-400 text-xs cursor-pointer disabled:opacity-30">
                  <ChevronLeft className="w-3.5 h-3.5" /> Prev
                </button>
                {examCurrentQ < selectedExam.questions.length - 1 ? (
                  <button onClick={() => setExamCurrentQ(q => q + 1)}
                    className="flex items-center gap-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs cursor-pointer">
                    Next <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button onClick={() => submitExam(selectedExam, examAnswers)} disabled={examLoading}
                    className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold cursor-pointer disabled:opacity-50">
                    <CheckCircle className="w-3.5 h-3.5" /> {examLoading ? 'Submitting…' : 'Submit Exam'}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Exam Results */}
          {examView === 'results' && (
            <div className="space-y-4">
              {lastExamAttempt && (
                <ResultCard attempt={lastExamAttempt} onRetry={() => { if (selectedExam) startExam(selectedExam); }} label="Exam" />
              )}
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-4">Exam History</h4>
              {examResults.length === 0 ? (
                <EmptyState icon={TrendingUp} title="No exam results yet" desc="Complete an exam to see your results." />
              ) : examResults.map(r => (
                <div key={r.id} className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold text-white">{r.examTitle}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{new Date(r.attemptedAt).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${r.passed ? 'bg-teal-500/10 text-teal-400' : 'bg-red-500/10 text-red-400'}`}>{r.score}%</span>
                    <span className={`text-[10px] font-bold ${r.passed ? 'text-teal-400' : 'text-red-400'}`}>{r.passed ? 'PASS' : 'FAIL'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EmptyState({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="py-16 flex flex-col items-center text-center gap-3">
      <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center">
        <Icon className="w-5 h-5 text-slate-600" />
      </div>
      <p className="text-sm font-bold text-slate-400">{title}</p>
      <p className="text-xs text-slate-600 max-w-xs">{desc}</p>
    </div>
  );
}

function ResultCard({ attempt, onRetry, label = 'Quiz' }: { attempt: any; onRetry: () => void; label?: string }) {
  return (
    <div className={`p-6 rounded-2xl border ${attempt.passed ? 'border-teal-500/30 bg-teal-600/5' : 'border-red-500/30 bg-red-600/5'}`}>
      <div className="flex items-center gap-3 mb-4">
        {attempt.passed ? <CheckCircle className="w-6 h-6 text-teal-400" /> : <XCircle className="w-6 h-6 text-red-400" />}
        <div>
          <h4 className="text-sm font-extrabold text-white">{attempt.passed ? `${label} Passed!` : `${label} Failed`}</h4>
          <p className="text-xs text-slate-400">{attempt.quizTitle || attempt.examTitle}</p>
        </div>
        <div className="ml-auto text-right">
          <p className={`text-2xl font-extrabold ${attempt.passed ? 'text-teal-400' : 'text-red-400'}`}>{attempt.score}%</p>
          <p className="text-[10px] text-slate-500">{attempt.correct}/{attempt.total} correct</p>
        </div>
      </div>
      {attempt.breakdown && (
        <div className="space-y-1 mb-4">
          {attempt.breakdown.map((b: any, i: number) => (
            <div key={i} className="flex items-center gap-2 text-[10px]">
              {b.isCorrect ? <CheckCircle className="w-3 h-3 text-teal-400 shrink-0" /> : <XCircle className="w-3 h-3 text-red-400 shrink-0" />}
              <span className={b.isCorrect ? 'text-teal-300' : 'text-red-300'}>Q{i + 1}: {b.isCorrect ? 'Correct' : 'Incorrect'}</span>
            </div>
          ))}
        </div>
      )}
      <button onClick={onRetry} className="flex items-center gap-1.5 text-xs text-blue-400 hover:underline cursor-pointer">
        <RotateCcw className="w-3 h-3" /> Retake {label}
      </button>
    </div>
  );
}
