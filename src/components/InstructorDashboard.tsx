import React, { useState } from 'react';
import { 
  BarChart, Users, BookOpen, Layers, Plus, 
  Trash2, Send, CheckCircle, RefreshCw, Sparkles, HelpCircle,
  ArrowUp, ArrowDown, Type, Bold, List, Code, Video, Globe, FileText, Check
} from 'lucide-react';
import { Course, User, Lesson, Quiz, LearningPath, Enrollment } from '../types';
import GoogleDriveIntegration from './GoogleDriveIntegration';
import LearningPathsView from './LearningPathsView';
import InstructorCMS from './InstructorCMS';
import InstructorGrading from './InstructorGrading';
import InstructorMessaging from './InstructorMessaging';
import InstructorAnalytics from './InstructorAnalytics';
import InstructorRevenue from './InstructorRevenue';
import Leaderboard from './Leaderboard';

interface InstructorDashboardProps {
  currentUser: User;
  courses: Course[];
  enrollments: Enrollment[];
  logs: any[];
  onCourseCreate: (coursePayload: any) => void;
  learningPaths?: LearningPath[];
  onPathCreate?: (pathPayload: any) => void;
  onRefresh?: () => void;
  triggerToast?: (msg: string, type?: 'success' | 'warn') => void;
}

export default function InstructorDashboard({
  currentUser,
  courses,
  enrollments = [],
  logs,
  onCourseCreate,
  learningPaths,
  onPathCreate,
  onRefresh,
  triggerToast = () => {},
}: InstructorDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'create_course' | 'cms' | 'grading' | 'messages' | 'analytics' | 'revenue' | 'curriculums' | 'curate_path' | 'leaderboard'>('overview');

  // Course Wizard Form State
  const [wizardStep, setWizardStep] = useState(1);
  const [title, setTitle] = useState("");
  const [headline, setHeadline] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Digital Twin");
  const [level, setLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [duration, setDuration] = useState("12 Hours");
  const [price, setPrice] = useState("49");

  // Lessons within wizard
  const [lessons, setLessons] = useState<Lesson[]>([
    { id: 'lw_1', title: 'Course Overview & Scope', type: 'video', duration: '10 mins', contentUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', isRequired: true, videoSource: 'file' }
  ]);
  const [tempLessonTitle, setTempLessonTitle] = useState("");
  const [tempLessonType, setTempLessonType] = useState<'video' | 'pdf' | 'assignment'>('video');
  const [tempLessonDuration, setTempLessonDuration] = useState("15 mins");

  // Rich builder parameters & interactive embeds
  const [tempVideoSource, setTempVideoSource] = useState<'file' | 'youtube' | 'vimeo'>('file');
  const [tempVideoUrl, setTempVideoUrl] = useState("");
  const [tempRichText, setTempRichText] = useState("");
  const [tempDriveFileId, setTempDriveFileId] = useState("");
  const [tempDriveFileName, setTempDriveFileName] = useState("");
  const [tempDriveFileLink, setTempDriveFileLink] = useState("");

  // Quizzes within wizard
  const [quizQuestions, setQuizQuestions] = useState<any[]>([
    { question: 'What is the standard baud rate for telemetry?', options: ['1200 bps', '9600 bps', '115200 bps', 'All of the above based on port specifications'], correctAnswer: 3 }
  ]);
  const [tempQuestion, setTempQuestion] = useState("");
  const [tempOption1, setTempOption1] = useState("");
  const [tempOption2, setTempOption2] = useState("");
  const [tempOption3, setTempOption3] = useState("");
  const [tempOption4, setTempOption4] = useState("");
  const [tempCorrectIdx, setTempCorrectIdx] = useState(0);

  // Filter courses owned by this instructor
  const myCourses = courses.filter(c => c.instructorId === currentUser.id);
  const totalEnrolled = myCourses.reduce((acc, c) => acc + c.enrollmentCount, 0);
  const totalRevenue = myCourses.reduce((acc, c) => acc + (c.enrollmentCount * c.price), 0);

  const addLessonToWizard = () => {
    if (!tempLessonTitle.trim()) return;
    const newId = `lw_${Date.now()}`;
    
    // Choose appropriate content url (either custom input embed URL or dummy files fallback)
    let finalUrl = "";
    if (tempLessonType === 'video') {
      if (tempVideoUrl.trim()) {
        finalUrl = tempVideoUrl.trim();
      } else {
        finalUrl = tempVideoSource === 'youtube' 
          ? 'https://www.youtube.com/embed/5FpY9C8HIn8' 
          : tempVideoSource === 'vimeo' 
            ? 'https://player.vimeo.com/video/224392349' 
            : 'https://www.w3schools.com/html/mov_bbb.mp4';
      }
    } else {
      finalUrl = tempDriveFileLink ? tempDriveFileLink : 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
    }

    const newLesson: Lesson = {
      id: newId,
      title: tempLessonTitle,
      type: tempLessonType,
      duration: tempLessonDuration,
      contentUrl: finalUrl,
      isRequired: true,
      videoSource: tempVideoSource,
      richTextContent: tempRichText || undefined,
      driveFileId: tempDriveFileId || undefined
    };

    setLessons([...lessons, newLesson]);
    
    // Reset temp attributes
    setTempLessonTitle("");
    setTempRichText("");
    setTempVideoUrl("");
    setTempDriveFileId("");
    setTempDriveFileName("");
    setTempDriveFileLink("");
  };

  const moveLessonInWizard = (index: number, direction: 'up' | 'down') => {
    const updated = [...lessons];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= updated.length) return;
    
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setLessons(updated);
  };

  const [draggedLessonIndex, setDraggedLessonIndex] = useState<number | null>(null);

  const handleLessonDragStart = (idx: number) => {
    setDraggedLessonIndex(idx);
  };

  const handleLessonDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
  };

  const handleLessonDrop = (idx: number) => {
    if (draggedLessonIndex === null || draggedLessonIndex === idx) return;
    const reordered = [...lessons];
    const draggedItem = reordered[draggedLessonIndex];
    reordered.splice(draggedLessonIndex, 1);
    reordered.splice(idx, 0, draggedItem);
    setLessons(reordered);
    setDraggedLessonIndex(null);
  };

  const addQuizQuestionToWizard = () => {
    if (!tempQuestion.trim() || !tempOption1.trim() || !tempOption2.trim()) {
      alert("Please provide the question body and at least two options.");
      return;
    }
    const newQ = {
      question: tempQuestion,
      options: [tempOption1, tempOption2, tempOption3, tempOption4].filter(opt => opt.trim() !== ""),
      correctAnswer: Number(tempCorrectIdx),
    };
    setQuizQuestions([...quizQuestions, newQ]);
    setTempQuestion("");
    setTempOption1("");
    setTempOption2("");
    setTempOption3("");
    setTempOption4("");
    setTempCorrectIdx(0);
  };

  const removeLessonFromWizard = (id: string) => {
    setLessons(lessons.filter(l => l.id !== id));
  };

  const triggerPublishCourse = () => {
    if (!title.trim() || !description.trim()) {
      alert("Please supply your Course Outline Title and descriptive Synopsis.");
      return;
    }

    const quizPayload: Quiz = {
      id: `qw_${Date.now()}`,
      title: `${title} Academic Assessment`,
      passingScore: 75,
      questions: quizQuestions.map((q, idx) => ({ id: `qqw_${idx}_${Date.now()}`, ...q }))
    };

    onCourseCreate({
      title,
      headline: headline || "Certified Specialist competency modules",
      description,
      category,
      level,
      duration,
      price: Number(price),
      instructorId: currentUser.id,
      instructorName: currentUser.name.replace(' (Instructor)', ''),
      lessons,
      quizzes: [quizPayload],
    });

    alert("Academy Course draft initialized successfully! It is live and public to all simulation users.");
    
    // Reset inputs
    setTitle("");
    setHeadline("");
    setDescription("");
    setWizardStep(1);
    setLessons([{ id: 'lw_1', title: 'Course Overview & Scope', type: 'video', duration: '10 mins', contentUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', isRequired: true }]);
    setQuizQuestions([{ question: 'What is the standard speed limit for a G00 linear search G-Code parameter?', options: ['Fast positional search speed', 'Incremental slow milling feed'], correctAnswer: 0 }]);
    setActiveTab('overview');
  };

  return (
    <div className="relative text-white min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" id="instructor-board">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(37,99,235,0.06),transparent_50%)] z-0 pointer-events-none" />

      {/* Primary tab workspace headers */}
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-6 mb-8 text-left">
        <div>
          <div className="text-xs font-bold text-blue-400 uppercase mb-1">
            Instructor hub • BCU-AIUB Academy Certified Investigator
          </div>
          <h2 className="text-2xl font-extrabold text-slate-100">
            {currentUser.name}
          </h2>
          <p className="text-xs text-slate-400">Deploy digital manufacturing courses and monitor platform performance.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'create_course', label: 'Create Course' },
            { key: 'cms', label: 'CMS' },
            { key: 'grading', label: 'Grading' },
            { key: 'messages', label: 'Messages' },
            { key: 'analytics', label: 'Analytics' },
            { key: 'revenue', label: 'Revenue' },
            { key: 'curate_path', label: 'Curate Path' },
            { key: 'leaderboard', label: 'Leaderboard' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === key 
                  ? 'bg-blue-600/25 text-blue-400 border border-blue-500/30' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Actual Workspaces */}
      <div className="relative z-10">
        {activeTab === 'overview' && (
          <div className="space-y-8 text-left">
            {/* Cards dynamic row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl glass-card">
                <div className="flex items-center justify-between mb-3 text-slate-400">
                  <span className="text-xs font-bold uppercase">My Active Students</span>
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-3xl font-extrabold font-mono tracking-tight text-white">
                  {totalEnrolled}
                </div>
                <p className="text-[10px] text-emerald-400 font-bold mt-1">✓ Across {myCourses.length} published syllabus</p>
              </div>

              <div className="p-6 rounded-2xl glass-card">
                <div className="flex items-center justify-between mb-3 text-slate-400">
                  <span className="text-xs font-bold uppercase">Estimated Gross Earnings</span>
                  <BarChart className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="text-3xl font-extrabold font-mono tracking-tight text-emerald-400">
                  ${totalRevenue.toLocaleString()}
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Simulated 70% direct researcher share</p>
              </div>

              <div className="p-6 rounded-2xl glass-card-heavy border border-blue-500/20">
                <div className="flex items-center justify-between mb-3 text-slate-400">
                  <span className="text-xs font-bold uppercase">Global Rating Average</span>
                  <BookOpen className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-3xl font-extrabold font-mono tracking-tight text-blue-400">
                  4.85 ★
                </div>
                <p className="text-[10px] text-blue-400 font-bold mt-1">✓ Top tier pedagogical standing</p>
              </div>
            </div>

            {/* Performance charts rendering using pure CSS/SVG vectors */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Analytics graph SVG */}
              <div className="p-6 rounded-3xl glass-card space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-xs font-extrabold uppercase tracking-wide text-slate-400">Enrollment Growth & Forecast Analytics</h4>
                  <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded font-bold font-mono">Simulated</span>
                </div>
                
                {/* Visual Graph Vectors */}
                <div className="relative h-48 w-full border-b border-l border-white/10 flex items-end px-4 pt-4 text-slate-500">
                  <svg className="absolute inset-0 w-full h-full p-4 overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path d="M 0 100 Q 25 80, 50 50 T 100 15" fill="none" stroke="#2563eb" strokeWidth="2.5" />
                    {/* Data points dots */}
                    <circle cx="0" cy="100" r="2" fill="#1e40af" />
                    <circle cx="25" cy="85" r="2" fill="#2563eb" />
                    <circle cx="50" cy="60" r="2" fill="#3b82f6" />
                    <circle cx="100" cy="15" r="2.5" fill="#10b981" />
                  </svg>
                  
                  {/* labels on grid */}
                  <div className="absolute left-1 bottom-4 text-[9px] text-slate-500 font-mono">Q1</div>
                  <div className="absolute left-[33%] bottom-4 text-[9px] text-slate-500 font-mono">Q2</div>
                  <div className="absolute left-[66%] bottom-4 text-[9px] text-slate-500 font-mono">Q3</div>
                  <div className="absolute right-1 bottom-4 text-[9px] text-slate-500 font-mono">Q4</div>
                </div>
                <p className="text-[10px] text-slate-500">Weekly progression mapping representing AIUB and regional manufacturing registrations.</p>
              </div>

              {/* Roster lists or recent activity audits */}
              <div className="p-6 rounded-3xl glass-card space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-sans">Recent Log Activities</h4>
                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {logs.slice(0, 6).map((log, idx) => (
                    <div key={idx} className="p-3 bg-white/[0.02]/80 rounded border border-white/5 flex justify-between text-[11px] font-mono">
                      <span className="text-slate-300">{log.text}</span>
                      <span className="text-slate-500 text-[9px]">{log.time?.split('T')[1]?.substring(0, 5)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Panel layout */}
        {activeTab === 'create_course' && (
          <div className="p-8 rounded-3xl glass-dialog max-w-3xl mx-auto space-y-8 text-left shadow-2xl">
            {/* Steps indicator row */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5 font-sans">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span>Create New Certification Syllabus</span>
              </h3>
              <div className="flex items-center gap-1 font-mono text-[10px]">
                {[1, 2, 3].map(step => (
                  <span 
                    key={step} 
                    className={`p-1 px-2.5 rounded-full font-bold ${
                      wizardStep === step 
                        ? 'bg-blue-400 text-slate-950' 
                        : wizardStep > step ? 'bg-teal-700 text-white' : 'bg-white/10 text-slate-500'
                    }`}
                  >
                    {step}
                  </span>
                ))}
              </div>
            </div>

            {/* Step 1: Course synopses */}
            {wizardStep === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Academy Course Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Advanced Siemens S7-1200 Network Programming"
                    className="w-full text-xs p-3 rounded-lg glass-input focus:border-blue-500 text-white animate-fade-in"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Headline Summary *</label>
                  <input
                    type="text"
                    value={headline}
                    onChange={e => setHeadline(e.target.value)}
                    placeholder="e.g. Program complex programmable logical controllers with precision ladder logic."
                    className="w-full text-xs p-3 rounded-lg glass-input focus:border-blue-500 text-white"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Lab Category *</label>
                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      className="w-full text-xs p-3 rounded-lg glass-input text-slate-200"
                    >
                      <option value="Digital Twin">Digital Twin Technology</option>
                      <option value="Industrial Robotics">Industrial Robotics & Automation</option>
                      <option value="Smart Factory & IoT">Smart Factory & IoT</option>
                      <option value="Additive Manufacturing">Additive Manufacturing & 3D Printing</option>
                      <option value="Sustainability">Sustainable Manufacturing</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Engineering Level *</label>
                    <div className="flex gap-2.5">
                      {(['Beginner', 'Intermediate', 'Advanced'] as const).map(lev => (
                        <button
                          key={lev}
                          type="button"
                          onClick={() => setLevel(lev)}
                          className={`flex-1 p-2.5 text-xs rounded-lg border font-bold transition-all cursor-pointer ${
                            level === lev 
                              ? 'border-blue-500 bg-blue-600/20 text-white' 
                              : 'border-white/5 bg-white/[0.02] text-slate-400 hover:bg-white/10'
                          }`}
                        >
                          {lev}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Course Duration *</label>
                    <input
                      type="text"
                      value={duration}
                      onChange={e => setDuration(e.target.value)}
                      placeholder="e.g. 15 Hours"
                      className="w-full text-xs p-3 rounded-lg glass-input text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Tuition Cost (USD $) *</label>
                    <input
                      type="number"
                      value={price}
                      onChange={e => setPrice(e.target.value)}
                      placeholder="e.g. 49"
                      className="w-full text-xs p-3 rounded-lg glass-input text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Extended Syllabus Synopsis *</label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Provide a deep explanation of topics, hardware models in play, safety limits, G-Code syntax models, and specific certificate requirements..."
                    rows={5}
                    className="w-full text-xs p-3 rounded-lg glass-input text-white focus:outline-none"
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => setWizardStep(2)}
                    disabled={!title.trim() || !description.trim()}
                    className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Next: Add Modules
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Lessons configuration */}
            {wizardStep === 2 && (
              <div className="space-y-6">
                {/* Temporary module adding widget */}
                <div className="p-6 rounded-2xl border border-white/10 bg-slate-950/60 space-y-6">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <h4 className="text-xs font-extrabold uppercase text-[#00ddff] font-mono flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Assemble Core Lesson / Lab Node</span>
                    </h4>
                    <span className="text-[10px] bg-blue-500/10 text-blue-400 font-mono font-bold px-1.5 py-0.5 rounded">Active Wizard Node</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Lesson Topic Title *</label>
                      <input
                        type="text"
                        value={tempLessonTitle}
                        onChange={e => setTempLessonTitle(e.target.value)}
                        placeholder="e.g. Setting up CNC Spindle Speeds & Feedrates"
                        className="w-full text-xs p-2.5 rounded-lg glass-input text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Pedagogical Medium *</label>
                      <select
                        value={tempLessonType}
                        onChange={e => {
                          setTempLessonType(e.target.value as any);
                          // Reset video platform if switching away
                          if (e.target.value !== 'video') {
                            setTempVideoSource('file');
                          }
                        }}
                        className="w-full text-xs p-2.5 rounded-lg glass-input text-slate-300"
                      >
                        <option value="video">Lecture Video Video Stream</option>
                        <option value="pdf">Document PDF Manual / Blueprint</option>
                        <option value="assignment">Practical Lab Homework / Challenge</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Estimated Worktime *</label>
                      <input
                        type="text"
                        value={tempLessonDuration}
                        onChange={e => setTempLessonDuration(e.target.value)}
                        placeholder="e.g. 20 mins"
                        className="w-full text-xs p-2.5 rounded-lg glass-input text-white"
                      />
                    </div>
                  </div>

                  {/* Video Extra Embed Settings */}
                  {tempLessonType === 'video' && (
                    <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-3.5 animate-fade-in text-left">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 flex items-center gap-1">
                          <Video className="w-3.5 h-3.5 text-blue-400" />
                          <span>Video Platform Host</span>
                        </label>
                        <div className="flex gap-2">
                          {(['file', 'youtube', 'vimeo'] as const).map(src => (
                            <button
                              key={src}
                              type="button"
                              onClick={() => setTempVideoSource(src)}
                              className={`flex-1 py-1.5 rounded text-[10px] font-mono font-bold uppercase border transition-all ${
                                tempVideoSource === src 
                                  ? 'bg-blue-600/15 border-blue-500/45 text-blue-400' 
                                  : 'bg-white/[0.01] border-white/5 text-slate-400 hover:text-white'
                              }`}
                            >
                              {src}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Paste Stream & Embed link *</label>
                        <input
                          type="text"
                          value={tempVideoUrl}
                          onChange={e => setTempVideoUrl(e.target.value)}
                          placeholder={
                            tempVideoSource === 'youtube' 
                              ? 'e.g. https://www.youtube.com/embed/5FpY9C8HIn8' 
                              : tempVideoSource === 'vimeo'
                                ? 'e.g. https://player.vimeo.com/video/224392349'
                                : 'e.g. https://www.w3schools.com/html/mov_bbb.mp4'
                          }
                          className="w-full text-xs p-2 rounded bg-slate-950 border border-white/5 text-slate-300 font-mono"
                        />
                        <p className="text-[9px] text-slate-500 mt-1">
                          Our system detects YouTube or Vimeo identifiers automatically to establish zero-latency sandboxed player iframes.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* PDF or assignments: integrate Google Drive Selector */}
                  {tempLessonType !== 'video' && (
                    <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5 space-y-3 animate-fade-in">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wide">Secure Content Attachment</span>
                        <span className="text-[9px] text-blue-400 font-mono font-bold uppercase">Google Workspace</span>
                      </div>
                      
                      <GoogleDriveIntegration
                        compact={true}
                        selectedFileId={tempDriveFileId}
                        onSelectFile={(f) => {
                          setTempDriveFileId(f.id);
                          setTempDriveFileName(f.name);
                          setTempDriveFileLink(f.webViewLink);
                        }}
                      />

                      {tempDriveFileName && (
                        <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center justify-between font-mono animate-fade-in">
                          <span>✓ Attached file: <b>{tempDriveFileName}</b></span>
                          <button
                            type="button"
                            onClick={() => {
                              setTempDriveFileId('');
                              setTempDriveFileName('');
                              setTempDriveFileLink('');
                            }}
                            className="text-[9px] text-red-400 underline font-semibold uppercase hover:text-red-300"
                          >
                            Clear
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Rich Text Editor Block */}
                  <div className="space-y-2 text-left">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase">Lesson Guide Rich Text Content (With formatting helpers)</label>
                    
                    {/* Toolbar */}
                    <div className="p-1.5 rounded-t-lg bg-slate-900 border-x border-t border-white/15 flex flex-wrap gap-1 items-center">
                      <button
                        type="button"
                        onClick={() => setTempRichText(prev => prev + "\n### ")}
                        className="p-1 px-2.5 rounded text-[10px] bg-white/5 text-slate-350 hover:bg-white/10 font-bold flex items-center gap-1"
                        title="Add Header"
                      >
                        <Type className="w-3 h-3 text-blue-400" />
                        <span>H3</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setTempRichText(prev => prev + " **Bold Text**")}
                        className="p-1 px-2.5 rounded text-[10px] bg-white/5 text-slate-350 hover:bg-white/10 font-bold flex items-center gap-1"
                        title="Bold Text"
                      >
                        <Bold className="w-3 h-3 text-[#00ddff]" />
                        <span>B</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setTempRichText(prev => prev + "\n- Bullet item\n- Another item")}
                        className="p-1 px-2.5 rounded text-[10px] bg-white/5 text-slate-350 hover:bg-white/10 font-bold flex items-center gap-1"
                        title="Add Bulleted List"
                      >
                        <List className="w-3 h-3 text-cyan-400" />
                        <span>List</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setTempRichText(prev => prev + "\n```gcode\nG21 ; Metric units\nG90 ; Absolute coordinates\nG00 X0 Y0 Z5 ; Fast transit\nG01 Z-2 F120 ; Cut depth\n```\n")}
                        className="p-1 px-2 bg-blue-900/20 border border-blue-500/20 rounded text-[9px] font-mono text-blue-400 font-bold hover:bg-blue-950/25 transition-all"
                        title="Insert G-Code snippet"
                      >
                        ⚙️ CNC G-Code Block
                      </button>

                      <button
                        type="button"
                        onClick={() => setTempRichText(prev => prev + "\n```plc\n[ I0.0 ]-----------------( Q0.0 )\n; Pressing start switch (I0.0) closes spindle interlock relay coil (Q0.0)\n```\n")}
                        className="p-1 px-2 bg-[#10b981]/15 border border-emerald-500/20 rounded text-[9px] font-mono text-emerald-400 font-bold hover:bg-emerald-950/25 transition-all"
                        title="Insert Relay Diagram"
                      >
                        ⚡ PLC Ladder Logic
                      </button>
                    </div>

                    <textarea
                      value={tempRichText}
                      onChange={e => setTempRichText(e.target.value)}
                      placeholder="Insert safety protocols, instructions, CNC parameters or copy coordinates here..."
                      rows={5}
                      className="w-full text-xs p-3 rounded-b-lg glass-input text-white font-mono focus:outline-none focus:border-blue-500 border-t-0"
                    />

                    {/* Live formatting simple preview */}
                    {tempRichText.trim() && (
                      <div className="p-3.5 rounded-lg bg-black/40 border border-white/5 text-left text-slate-300 space-y-2">
                        <span className="text-[8px] font-bold text-[#00ddff] uppercase font-mono block tracking-wider">Live Rich Preview pane:</span>
                        <div className="whitespace-pre-wrap font-mono text-[10px] text-slate-400 leading-relaxed max-h-36 overflow-y-auto">
                          {tempRichText}
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={addLessonToWizard}
                    disabled={!tempLessonTitle.trim()}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-xs font-bold text-white rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Compile Node into Chapter list</span>
                  </button>
                </div>

                {/* Added lessons list / Drag-and-Drop / Rearrange */}
                <div className="space-y-3.5 text-left">
                  <div className="flex justify-between items-center">
                    <h5 className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">Current Syllabus Chapters Timeline</h5>
                    <span className="text-[10px] text-slate-500 font-mono font-bold">({lessons.length} Modules)</span>
                  </div>

                  {lessons.length === 0 ? (
                    <p className="text-xs italic text-slate-500 pl-2">No chapters written yet.</p>
                  ) : (
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {lessons.map((lesson, idx) => (
                        <div 
                          key={lesson.id} 
                          draggable
                          onDragStart={() => handleLessonDragStart(idx)}
                          onDragOver={(e) => handleLessonDragOver(e, idx)}
                          onDrop={() => handleLessonDrop(idx)}
                          className="p-4 bg-slate-900/60 rounded-xl border border-white/5 flex items-center justify-between gap-4 group hover:border-[#00aaff]/40 transition-all duration-300 cursor-grab active:cursor-grabbing hover:bg-slate-900/90"
                          title="Drag to rearrange sequence list"
                        >
                          <div className="text-left flex items-center gap-3 truncate">
                            {/* Sequence number */}
                            <span className="text-[10px] font-mono font-bold bg-[#111c30] border border-blue-500/20 text-blue-400 w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            
                            <div className="truncate">
                              <span className="text-[9px] bg-white/5 border border-white/10 text-blue-400 mr-2 px-1 rounded uppercase font-bold font-mono">
                                {lesson.type} {lesson.videoSource !== 'file' && lesson.videoSource ? `(${lesson.videoSource})` : ''}
                              </span>
                              <div className="text-xs font-bold text-slate-200 mt-0.5 truncate">{lesson.title}</div>
                              {lesson.driveFileId && (
                                <div className="text-[9px] text-[#00ddff] font-mono mt-0.5 flex items-center gap-1">
                                  <span>📎 Secure G-Drive linked:</span>
                                  <span className="underline truncate opacity-85">ID={lesson.driveFileId.substring(0,8)}...</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* REORDERING AND TRASH CONTROLLERS */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            {/* Move Up */}
                            <button
                              type="button"
                              onClick={() => moveLessonInWizard(idx, 'up')}
                              disabled={idx === 0}
                              className="p-1 rounded bg-slate-950 border border-white/5 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                              title="Move Up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>

                            {/* Move Down */}
                            <button
                              type="button"
                              onClick={() => moveLessonInWizard(idx, 'down')}
                              disabled={idx === lessons.length - 1}
                              className="p-1 rounded bg-slate-950 border border-white/5 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                              title="Move Down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>

                            {/* Trash */}
                            <button 
                              onClick={() => removeLessonFromWizard(lesson.id)} 
                              className="p-1.5 text-slate-400 hover:text-red-400 cursor-pointer rounded hover:bg-red-500/10"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-between pt-4 border-t border-white/10">
                  <button onClick={() => setWizardStep(1)} className="px-5 py-2.5 rounded-lg border border-white/10 bg-white/5 text-slate-400 text-xs font-bold hover:bg-white/10 cursor-pointer">
                    Back
                  </button>
                  <button 
                    onClick={() => setWizardStep(3)} 
                    disabled={lessons.length === 0}
                    className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold disabled:opacity-40 cursor-pointer"
                  >
                    Next: Setup Quizzes & Publish
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Quizzes and publishes */}
            {wizardStep === 3 && (
              <div className="space-y-6">
                {/* Addition form */}
                <div className="p-4 rounded-xl glass-card space-y-4">
                  <h4 className="text-xs font-bold uppercase text-slate-300">Set Multi-Choice Question (MCQ)</h4>
                  
                  <textarea
                    value={tempQuestion}
                    onChange={e => setTempQuestion(e.target.value)}
                    placeholder="e.g. Which logic gate is activated on PLC power interlocks?"
                    rows={2}
                    className="w-full text-xs p-2.5 rounded-lg glass-input text-white"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs font-mono">
                    <input type="text" value={tempOption1} onChange={e => setTempOption1(e.target.value)} placeholder="Option 1 (index 0) *" className="p-2.5 rounded-lg glass-input text-white" />
                    <input type="text" value={tempOption2} onChange={e => setTempOption2(e.target.value)} placeholder="Option 2 (index 1) *" className="p-2.5 rounded-lg glass-input text-white" />
                    <input type="text" value={tempOption3} onChange={e => setTempOption3(e.target.value)} placeholder="Option 3 (index 2)" className="p-2.5 rounded-lg glass-input text-white" />
                    <input type="text" value={tempOption4} onChange={e => setTempOption4(e.target.value)} placeholder="Option 4 (index 3)" className="p-2.5 rounded-lg glass-input text-white" />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Index of correct choice (0 to 3):</label>
                    <input 
                      type="number" 
                      min={0} 
                      max={3} 
                      value={tempCorrectIdx} 
                      onChange={e => setTempCorrectIdx(Number(e.target.value))} 
                      className="w-16 text-xs p-2 rounded-lg glass-input text-center font-bold text-blue-400" 
                    />
                  </div>

                  <button
                    onClick={addQuizQuestionToWizard}
                    className="w-full py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-blue-400" />
                    <span>Append Assessment Question</span>
                  </button>
                </div>

                {/* Added questions show */}
                <div className="space-y-2 text-left">
                  <h5 className="text-xs font-bold uppercase text-slate-500">Exam Question Deck</h5>
                  {quizQuestions.length === 0 ? (
                    <p className="text-xs italic text-slate-500 pl-2">No written questions yet.</p>
                  ) : (
                    quizQuestions.map((qObj, idx) => (
                      <div key={idx} className="p-3 bg-white/[0.01] rounded-lg border border-white/5 text-xs text-left">
                        <div className="font-bold text-slate-300">Q{idx + 1}: {qObj.question}</div>
                        <div className="text-[10px] text-slate-500 mt-1 pl-3.5 font-mono">
                          Choices: {qObj.options.join(" | ")} • Correct choice index: {qObj.correctAnswer}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex justify-between pt-4 border-t border-white/10">
                  <button onClick={() => setWizardStep(2)} className="px-5 py-2.5 rounded-lg border border-white/10 bg-white/5 text-slate-400 text-xs font-bold hover:bg-white/10 cursor-pointer">
                    Back
                  </button>
                  <button 
                    onClick={triggerPublishCourse} 
                    className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-teal-500 to-[#10b981] hover:opacity-95 text-slate-950 font-extrabold text-xs tracking-wider flex items-center gap-1 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Publish Academy Syllabus</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Course management lists */}
        {activeTab === 'curriculums' && (
          <div className="space-y-6 text-left">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 animate-fade-in">My Course Outlines Catalog</h3>
            {myCourses.length === 0 ? (
              <p className="text-xs font-medium text-slate-500 italic">No courses has been published under this instructor account yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-1 animate-fade-in">
                {myCourses.map(course => (
                  <div key={course.id} className="p-5 rounded-2xl glass-card space-y-4 hover:border-white/20 transition-all duration-350">
                    <div>
                      <span className="text-[9px] font-mono font-bold text-blue-400 bg-blue-500/10 mr-2 px-1.5 py-0.5 rounded uppercase border border-blue-500/10">
                        {course.category}
                      </span>
                      <h4 className="text-sm font-bold mt-2 text-slate-100">{course.title}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed mt-1 line-clamp-2">{course.headline}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 border-y border-white/5 py-3 text-center font-mono text-[10px] text-slate-400">
                      <div>
                        <div className="font-bold text-white text-xs">{course.enrollmentCount}</div>
                        <span>Students</span>
                      </div>
                      <div>
                        <div className="font-bold text-blue-400 text-xs">{course.lessons.length}</div>
                        <span>Modules</span>
                      </div>
                      <div>
                        <div className="font-bold text-emerald-400 text-xs">${(course.enrollmentCount * course.price).toLocaleString()}</div>
                        <span>Gross Revenue</span>
                      </div>
                    </div>

                    <div className="flex gap-2.5">
                      <button 
                        onClick={() => alert("Syllabus modifying panel is pre-locked in current view.")}
                        className="flex-1 text-center py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-350 hover:bg-white/10 font-bold text-[10px] tracking-wide cursor-pointer transition-colors"
                      >
                        Edit Modules
                      </button>
                      <button 
                        onClick={() => alert("Instructor capability verification validated.")}
                        className="flex-1 text-center py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold text-[10px] cursor-pointer"
                      >
                        Active published
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CMS Tab */}
        {activeTab === 'cms' && (
          <InstructorCMS
            currentUser={currentUser}
            courses={courses}
            onRefresh={onRefresh || (() => {})}
            triggerToast={triggerToast}
          />
        )}

        {/* Grading Tab */}
        {activeTab === 'grading' && (
          <InstructorGrading
            currentUser={currentUser}
            triggerToast={triggerToast}
          />
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <InstructorMessaging
            currentUser={currentUser}
            triggerToast={triggerToast}
          />
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <InstructorAnalytics
            currentUser={currentUser}
            courses={courses}
            enrollments={enrollments}
          />
        )}

        {/* Revenue Tab */}
        {activeTab === 'revenue' && (
          <InstructorRevenue
            currentUser={currentUser}
            courses={courses}
            triggerToast={triggerToast}
          />
        )}

        {/* Curated Specialization Learning Paths */}
        {activeTab === 'curate_path' && (
          <div className="space-y-6 text-left animate-fade-in">
            <LearningPathsView
              currentUser={currentUser}
              courses={courses}
              learningPaths={learningPaths || []}
              enrollments={[]}
              onEnrollPath={async (pId) => {}}
              onCuratePath={async (payload) => {
                if (onPathCreate) {
                  onPathCreate(payload);
                  setActiveTab('overview');
                }
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
