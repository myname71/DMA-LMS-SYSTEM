import React, { useState } from 'react';
import { 
  Award, Layers, CheckCircle, ChevronRight, BookOpen, User, ArrowRight, Plus, Calendar, Trash2, Send, Sparkles, LogIn, AlertCircle, BookmarkCheck
} from 'lucide-react';
import { Course, User as UserType, LearningPath, Enrollment } from '../types';

interface LearningPathsViewProps {
  currentUser: UserType | null;
  courses: Course[];
  learningPaths: LearningPath[];
  enrollments: Enrollment[];
  onEnrollPath: (pathId: string) => Promise<void>;
  onCuratePath?: (payload: any) => Promise<void>;
  setLoginOpen?: (open: boolean) => void;
}

export default function LearningPathsView({
  currentUser,
  courses,
  learningPaths,
  enrollments,
  onEnrollPath,
  onCuratePath,
  setLoginOpen
}: LearningPathsViewProps) {
  const [curating, setCurating] = useState(false);
  
  // Creation States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [badge, setBadge] = useState('');
  const [category, setCategory] = useState('Smart Factory & IoT');
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [curateError, setCurateError] = useState('');

  // Toggle course in creation list
  const toggleCourseSelect = (courseId: string) => {
    if (selectedCourses.includes(courseId)) {
      setSelectedCourses(selectedCourses.filter(id => id !== courseId));
    } else {
      setSelectedCourses([...selectedCourses, courseId]);
    }
  };

  const handleCurateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCurateError('');
    if (!title.trim() || !description.trim() || !badge.trim()) {
      setCurateError('Please supply all title, synopsis, and target career badges.');
      return;
    }
    if (selectedCourses.length < 2) {
      setCurateError('Please sequence at least 2 courses into the curated learning path.');
      return;
    }

    if (onCuratePath) {
      const payload = {
        title,
        description,
        badge,
        category,
        courses: selectedCourses,
        instructorId: currentUser?.id || 'u_instructor',
        instructorName: currentUser?.name || 'Academic Board'
      };
      await onCuratePath(payload);
      
      // Reset State
      setTitle('');
      setDescription('');
      setBadge('');
      setSelectedCourses([]);
      setCurating(false);
    }
  };

  // Compute stats for a Learning Path
  const getPathStats = (path: LearningPath) => {
    const totalCourses = path.courses.length;
    let completedCoursesCount = 0;
    
    // Detailed list of progress per course
    const coursesProgress = path.courses.map(cId => {
      const course = courses.find(c => c.id === cId);
      const enrollment = enrollments.find(e => e.userId === currentUser?.id && e.courseId === cId);
      const prog = enrollment ? enrollment.progress : 0;
      const completed = prog >= 100;
      if (completed) completedCoursesCount++;
      
      return {
        id: cId,
        title: course?.title || 'Unknown Syllabus',
        progress: prog,
        completed
      };
    });

    const percentCompleted = totalCourses > 0 
      ? Math.floor((completedCoursesCount / totalCourses) * 100) 
      : 0;

    const isEnrolled = path.enrolledStudents?.includes(currentUser?.id || '') || 
      enrollments.some(e => e.userId === currentUser?.id && path.courses.includes(e.courseId));

    return {
      totalCourses,
      completedCoursesCount,
      percentCompleted,
      coursesProgress,
      isEnrolled,
      allCompleted: completedCoursesCount === totalCourses && totalCourses > 0
    };
  };

  return (
    <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12 text-left" id="learning-paths-container">
      
      {/* Intro Hero Section */}
      <div className="relative overflow-hidden p-8 sm:p-12 rounded-3xl border border-white/10 bg-slate-950/40 backdrop-blur-md flex flex-col md:flex-row justify-between items-start md:items-center gap-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="space-y-4 max-w-xl">
          <span className="inline-block px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-bold text-blue-400 uppercase font-mono tracking-wider animate-pulse">
            Transnational Career Specializations
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-none">
            Curated Learning Paths
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
            Curated chronologics led by joint <b>British Council</b> investigators focusing on British Higher Education standards. Complete course sequences sequentially to secure career badges.
          </p>
        </div>

        {currentUser?.role === 'instructor' && (
          <button
            onClick={() => setCurating(!curating)}
            className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 font-extrabold text-xs uppercase text-white tracking-wide flex items-center gap-1.5 cursor-pointer shadow-lg shadow-blue-500/20 border border-blue-400/20 active:scale-98 transition-all"
          >
            {curating ? 'View Main Catalog' : 'Curate Learning Path'}
            {curating ? null : <Plus className="w-4 h-4" />}
          </button>
        )}
      </div>

      {curating ? (
        /* Curator Editor Panel */
        <form onSubmit={handleCurateSubmit} className="p-8 sm:p-10 rounded-3xl glass-dialog max-w-3xl mx-auto space-y-6">
          <div className="border-b border-white/10 pb-4 flex justify-between items-center">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-400" />
              <span>Curator Stepper: Forge career paths</span>
            </h3>
            <span className="text-[10px] bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono font-bold px-2 py-0.5 rounded uppercase">Instructor Mode</span>
          </div>

          {curateError && (
            <div className="p-3 bg-red-600/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{curateError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5 font-sans">Syllabus Path Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Industry 5.0 Robotics and Diagnostic Twin Specialist"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full text-xs p-3 rounded-lg glass-input text-white focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Target Career Specialization Badge *</label>
                <input
                  type="text"
                  placeholder="e.g. Certified Industrial IoT & Automation Architect"
                  value={badge}
                  onChange={e => setBadge(e.target.value)}
                  className="w-full text-xs p-3 rounded-lg glass-input text-white focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Pedagogical Category *</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full text-xs p-3 rounded-lg glass-input text-slate-300"
                >
                  <option value="Smart Factory & IoT">Smart Factory & IoT</option>
                  <option value="Industrial Robotics">Industrial Robotics & PLCs</option>
                  <option value="Additive Manufacturing">Additive Manufacturing</option>
                  <option value="Digital Twin">Digital Twin diagnostics</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase text-slate-400 font-sans">Sequence Syllabus Courses (Select 2 or more) *</label>
              <div className="space-y-2 max-h-56 overflow-y-auto border border-white/5 p-3 rounded-xl bg-slate-950/40">
                {courses.map(course => {
                  const isChecked = selectedCourses.includes(course.id);
                  return (
                    <div 
                      key={course.id}
                      onClick={() => toggleCourseSelect(course.id)}
                      className={`p-2.5 rounded-lg border text-xs font-medium cursor-pointer flex justify-between items-center transition-all ${
                        isChecked 
                          ? 'bg-blue-600/10 border-blue-500/40 text-white' 
                          : 'bg-white/[0.01] border-white/5 text-slate-400 hover:border-white/10 hover:bg-white/[0.02]/50'
                      }`}
                    >
                      <span className="truncate">{course.title}</span>
                      <span className={`w-4 h-4 rounded flex items-center justify-center border ${isChecked ? 'bg-blue-500 border-blue-400 text-slate-950 font-bold text-[10px]' : 'border-white/20'}`}>
                        {isChecked ? '✓' : ''}
                      </span>
                    </div>
                  );
                })}
              </div>
              <p className="text-[10px] text-slate-500 leading-normal pl-1">
                Courses will be locked sequentially for students. The student will have to complete them in the selection order!
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Extended Specialization Synopsis *</label>
            <textarea
              placeholder="Explain the career specialisation path, G-code credentials matching, and regional manufacturing laboratory setups..."
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full text-xs p-3 rounded-lg glass-input text-white focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setCurating(false)}
              className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all"
            >
              Curate and Publish Path
            </button>
          </div>
        </form>
      ) : (
        /* Catalog display list */
        <div className="space-y-12 animate-fade-in">
          {learningPaths.length === 0 ? (
            <div className="py-16 text-center rounded-2xl glass-card text-slate-500 font-medium italic">
              No learning paths are configured yet in this simulated dataset.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {learningPaths.map(path => {
                const stats = getPathStats(path);
                return (
                  <div 
                    key={path.id} 
                    className={`rounded-3xl border p-6 flex flex-col justify-between gap-6 transition-all duration-300 relative overflow-hidden group ${
                      stats.isEnrolled 
                        ? 'border-blue-500/20 bg-slate-950/60 shadow-[0_4px_30px_rgba(0,170,255,0.05)]' 
                        : 'border-white/5 bg-white/[0.01] hover:border-white/15'
                    }`}
                  >
                    {/* Glowing highlight indicator */}
                    {stats.allCompleted && (
                      <div className="absolute top-0 right-0 p-1 px-4 text-[9px] bg-gradient-to-r from-amber-500 to-amber-600 font-mono font-bold text-slate-950 rounded-bl-xl uppercase tracking-wider animate-pulse flex items-center gap-1">
                        <Award className="w-3 h-3 text-slate-950" />
                        <span>Specialist Certified</span>
                      </div>
                    )}

                    <div className="space-y-4">
                      {/* Badge / Metadata */}
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/10">
                          {path.category}
                        </span>
                        <div className="text-[10px] text-slate-500 font-mono">
                          Sequence: <b>{stats.totalCourses} courses</b>
                        </div>
                      </div>

                      {/* Title & description */}
                      <div className="space-y-2 text-left">
                        <h3 className="text-lg font-extrabold text-white leading-snug group-hover:text-blue-300 transition-colors">
                          {path.title}
                        </h3>
                        <p className="text-slate-400 text-xs leading-relaxed line-clamp-3">
                          {path.description}
                        </p>
                      </div>

                      {/* Course list timeline layout */}
                      <div className="p-4 bg-slate-900/40 rounded-2xl border border-white/5 text-left space-y-3">
                        <span className="text-[9px] font-bold text-slate-500 font-mono uppercase tracking-wider block">
                          Syllabus Modules Timeline:
                        </span>
                        
                        <div className="space-y-2.5">
                          {stats.coursesProgress.map((cp, idx) => {
                            const isPastCompleted = idx === 0 || stats.coursesProgress[idx - 1].completed;
                            const isLocked = !stats.isEnrolled ? false : !cp.completed && !isPastCompleted;
                            
                            return (
                              <div key={cp.id} className="flex items-center justify-between text-xs font-medium">
                                <div className="flex items-center gap-2.5 truncate">
                                  <div className={`w-5 h-5 rounded-full flex items-center justify-center font-mono font-bold text-[10px] shrink-0 border ${
                                    cp.completed 
                                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400' 
                                      : isLocked 
                                        ? 'bg-slate-900/30 border-white/5 text-slate-600'
                                        : 'bg-blue-600/10 border-blue-500/20 text-blue-400'
                                  }`}>
                                    {cp.completed ? '✓' : idx + 1}
                                  </div>
                                  <span className={`truncate ${isLocked ? 'text-slate-600' : cp.completed ? 'text-slate-400 line-through' : 'text-slate-200'}`}>
                                    {cp.title}
                                  </span>
                                </div>

                                <div className="shrink-0 text-[10px] font-mono">
                                  {cp.completed ? (
                                    <span className="text-emerald-405 font-bold">100%</span>
                                  ) : isLocked ? (
                                    <span className="text-slate-600">Locked</span>
                                  ) : cp.progress > 0 ? (
                                    <span className="text-blue-400 font-bold">{cp.progress}% completed</span>
                                  ) : (
                                    <span className="text-slate-450">Active</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Career specialization badge preview */}
                      <div className="p-3 bg-[#1d2d44]/20 border border-[#00aaff]/15 rounded-xl flex items-center gap-2.5">
                        <Award className="w-5 h-5 text-amber-400 shrink-0" />
                        <div className="text-left">
                          <span className="text-[8px] uppercase tracking-wider font-bold text-slate-500 block">Unlocks Career Specialization Badge:</span>
                          <span className="text-[10px] font-mono font-bold text-amber-300 capitalize">{path.badge}</span>
                        </div>
                      </div>

                    </div>

                    {/* Progress tracking / Enrollment action row */}
                    <div className="border-t border-white/5 pt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                      {stats.isEnrolled ? (
                        /* Enrolled stats */
                        <div className="w-full space-y-2">
                          <div className="flex justify-between text-[11px] font-mono">
                            <span className="text-slate-405 font-bold flex items-center gap-1">
                              <BookmarkCheck className="w-3.5 h-3.5" />
                              <span>Syllabus Sequence Board Enrolled</span>
                            </span>
                            <span className="text-blue-400 font-bold">{stats.percentCompleted}% Completed</span>
                          </div>

                          <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-white/5">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500" 
                              style={{ width: `${stats.percentCompleted}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        /* Non-enrolled CTA */
                        <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-4">
                          <div className="text-slate-500 text-[10px] font-mono pl-1">
                            Curated by Expert Investigator: <b>{path.instructorName}</b>
                          </div>
                          
                          {currentUser ? (
                            <button
                              onClick={() => onEnrollPath(path.id)}
                              className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-lg text-xs flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95 shadow-md shadow-blue-500/10"
                            >
                              <span>Enroll Career Path</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => setLoginOpen && setLoginOpen(true)}
                              className="w-full sm:w-auto px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 font-extrabold rounded-lg border border-white/10 text-xs flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <LogIn className="w-3.5 h-3.5 text-[#00aaff]" />
                              <span>Login to Enroll</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Highly Polished Specialization Certificate Frame */}
                    {stats.allCompleted && currentUser && (
                      <div className="mt-4 p-5 rounded-2xl bg-slate-900/80 border border-amber-500/30 text-center space-y-4 animate-fade-in relative z-10 shadow-[0_0_20px_rgba(245,158,11,0.08)] bg-gradient-to-b from-slate-950/80 to-[#101b30]/80">
                        {/* Gold Medallion and Filigree border style */}
                        <div className="flex justify-center">
                          <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/40 flex items-center justify-center animate-spin-slow">
                            <Award className="w-6 h-6 text-amber-400" />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <h4 className="text-xs font-extrabold text-white font-serif uppercase tracking-widest leading-none">Specialization Credentials Awarded</h4>
                          <p className="text-[9px] text-[#00ddff] font-mono leading-relaxed">British Council Transnational Industry 4.0 certification approved and validated.</p>
                        </div>

                        <div className="p-3 border border-[#00aaff]/10 rounded bg-[#10192a] text-left text-[10px] text-slate-400 space-y-1.5 font-mono">
                          <div>📜 Awardee: <b>{currentUser.name}</b></div>
                          <div>🔗 Badge License: ID-{path.id}-{currentUser.id.substring(0,6)}</div>
                          <div>🎖️ Level reached: Joint BCU-AIUB Academy Board Senior Specialist</div>
                        </div>

                        <button 
                          onClick={() => alert(`Specialization badge credential transmitted! Check your portfolio at verified email: ${currentUser.email}`)}
                          className="w-full py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-extrabold text-[10px] rounded hover:opacity-90 transition-all uppercase cursor-pointer"
                        >
                          Download Career Badge
                        </button>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
