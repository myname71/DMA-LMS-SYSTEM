import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { 
  CheckCircle, AlertCircle, Award, Compass, Sparkles, Shield,
  BookOpen, Layers, Bot, Database, Calendar, Mail, Phone, MapPin, Loader2, ArrowRight,
  Smartphone, Download
} from 'lucide-react';
import { Course, User, Enrollment, Certificate, LearningPath, SiteNotice } from './types';
import { getAuthHeaders } from './lib/session';
import Navigation from './components/Navigation';
import LandingPage from './components/LandingPage';
// ── Route-level code splitting ────────────────────────────────────────────────
// Only the landing shell + navigation load up front; dashboards, the course
// player, the assessment/certificate modules and the CMS pages are fetched on
// demand. This cuts the initial JS payload and main-thread blocking time.
const StudentDashboard = lazy(() => import('./components/StudentDashboard'));
const InstructorDashboard = lazy(() => import('./components/InstructorDashboard'));
const AdminPanel = lazy(() => import('./components/AdminPanel'));
const DatabaseDocs = lazy(() => import('./components/DatabaseDocs'));
const AITutorBox = lazy(() => import('./components/AITutorBox'));
const LearningPathsView = lazy(() => import('./components/LearningPathsView'));
const CoursesView = lazy(() => import('./components/CoursesView'));
const EventsView = lazy(() => import('./components/EventsView'));
const SearchModal = lazy(() => import('./components/SearchModal'));
const AboutPage = lazy(() => import('./components/AboutPage'));
const WebinarPage = lazy(() => import('./components/WebinarPage'));
const CMSPageRenderer = lazy(() => import('./components/CMSPageRenderer'));
const AssessmentModule = lazy(() => import('./components/assessment/AssessmentModule'));
const CertificateModule = lazy(() => import('./components/certificates/CertificateModule'));
const PaymentCheckout = lazy(() => import('./components/PaymentCheckout'));
const CoursePlayer = lazy(() => import('./components/CoursePlayer'));
import SignInPage from './components/pages/SignInPage';
import RegisterPage from './components/pages/RegisterPage';
import ContactUsPage from './components/pages/ContactUsPage';
import AboutUsPage from './components/pages/AboutUsPage';
import TermsPage from './components/pages/TermsPage';
import PricingPage from './components/pages/PricingPage';
import { DEMO_USERS, GENERAL_FAQS } from './data/coursesData';

export default function App() {
  // Global States loaded asynchronously from Express Server API
  const [courses, setCourses] = useState<Course[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [learningPaths, setLearningPaths] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Dynamic state for loaded events list and categories filter
  const [events, setEvents] = useState<any[]>([]);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const [cmsContent, setCmsContent] = useState<any>(null);
  const [siteNotice, setSiteNotice] = useState<SiteNotice | null>(null);

  // Router Location State
  const [currentPage, setCurrentPage] = useState<string>('home');

  // Active Session context — restored from storage or null on fresh start
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // PWA install prompt
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [appInstalled, setAppInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: any) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setAppInstalled(true));
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallApp = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') { setAppInstalled(true); setInstallPrompt(null); }
    } else {
      window.open('https://www.pwabuilder.com/', '_blank');
    }
  };

  // Authentication dialog controls
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regRole, setRegRole] = useState<'student' | 'instructor'>('student');
  const [regSuccess, setRegSuccess] = useState(false);

  // Global Dynamic Alert Notification feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'warn'>('success');

  // Contact form state
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMsg, setContactMsg] = useState("");
  const [contactDone, setContactDone] = useState(false);

  // Global search modal state
  const [searchOpen, setSearchOpen] = useState(false);

  // Course Player overlay
  const [playerCourse, setPlayerCourse] = useState<import('./types').Course | null>(null);

  // ─── Session Persistence Helpers ───
  const SESSION_KEY = 'dma_auth_session';

  const saveSession = (userId: string, token: string, remember: boolean) => {
    const payload = JSON.stringify({ userId, token });
    if (remember) {
      localStorage.setItem(SESSION_KEY, payload);
      sessionStorage.removeItem(SESSION_KEY);
    } else {
      sessionStorage.setItem(SESSION_KEY, payload);
      localStorage.removeItem(SESSION_KEY);
    }
  };

  const clearSession = () => {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  };

  // Route user to the correct dashboard after login
  const routeByRole = (role: string) => {
    if (role === 'student') setCurrentPage('student_dashboard');
    else if (role === 'instructor') setCurrentPage('instructor_dashboard');
    else setCurrentPage('admin_dashboard');
  };

  const restoreSession = async (loadedUsers: User[]) => {
    // JWT is stored in HttpOnly cookie — /api/auth/me validates it server-side
    // Also check legacy Bearer token in localStorage for backwards compat
    try {
      // Try cookie-based session first (no extra headers needed — browser sends cookie automatically)
      const resp = await fetch('/api/auth/me');
      if (resp.ok) {
        const data = await resp.json();
        if (data?.user) {
          const localUser = loadedUsers.find((u: User) => u.id === data.user.id || u.email === data.user.email);
          const merged = localUser ? { ...data.user, ...localUser } : data.user;
          setCurrentUser(merged);
          routeByRole(merged.role);
          return;
        }
      }
    } catch { /* fall through */ }

    // Legacy: Bearer token in localStorage/sessionStorage
    try {
      const raw = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
      if (!raw) return;
      const { userId, token } = JSON.parse(raw);
      if (!token) { clearSession(); return; }
      const resp = await fetch('/api/auth/me', { headers: { 'Authorization': `Bearer ${token}` } });
      if (!resp.ok) { clearSession(); return; }
      const user = loadedUsers.find((u: User) => u.id === userId);
      if (user) { setCurrentUser(user); routeByRole(user.role); }
      else clearSession();
    } catch { clearSession(); }
  };

  // Load backend state on mount
  const fetchDbState = async () => {
    try {
      const response = await fetch("/api/db-state", { headers: getAuthHeaders() });
      const data = await response.json();
      const loadedUsers: User[] = data.users || [];
      setCourses(data.courses || []);
      setUsers(loadedUsers);
      setEnrollments(data.enrollments || []);
      setCertificates(data.certificates || []);
      setLearningPaths(data.learningPaths || []);
      setEvents(data.events || []);
      setLogs(data.logs || []);
      return loadedUsers;
    } catch (err) {
      console.error("Express DB state load failure", err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchCmsContent = async () => {
    try {
      const r = await fetch('/api/cms');
      const d = await r.json();
      setCmsContent(d);
    } catch { /* CMS fetch failed silently */ }
  };

  const fetchSiteNotice = async () => {
    try {
      const r = await fetch('/api/site-notice');
      if (!r.ok) return;
      setSiteNotice(await r.json());
    } catch { /* bulletin fetch failed silently */ }
  };

  const fetchAndApplyTheme = async () => {
    try {
      const r = await fetch('/api/theme');
      if (!r.ok) return;
      const t = await r.json();
      if (!t || !t.accentColor) return;
      const root = document.documentElement;
      root.style.setProperty('--dma-accent', t.accentColor);
      root.style.setProperty('--dma-accent-hover', t.accentHover || t.accentColor);
      root.style.setProperty('--dma-accent-light', t.accentLight || t.accentColor);
      root.style.setProperty('--dma-bg', t.bgColor);
      root.style.setProperty('--dma-bg-mid', t.bgMid || t.bgColor);
      root.style.setProperty('--dma-radius-card', t.cardRadius || '1rem');
      root.style.setProperty('--dma-font-heading', `"${t.fontHeading || 'Space Grotesk'}", sans-serif`);
      document.body.style.backgroundColor = t.bgColor;
    } catch { /* Theme fetch failed silently */ }
  };

  useEffect(() => {
    (async () => {
      const loadedUsers = await fetchDbState();
      restoreSession(loadedUsers);
      fetchCmsContent();
      fetchSiteNotice();
      fetchAndApplyTheme();

      // If the URL has ?reset=TOKEN, navigate to the signin page which will pick it up
      const params = new URLSearchParams(window.location.search);
      if (params.get('reset')) {
        setCurrentPage('signin');
      }
    })();
  }, []);

  // Cmd+K / Ctrl+K keyboard shortcut to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const triggerToast = (msg: string, type: 'success' | 'warn' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // ─── API Interactions ───

  // Single Course purchase or enrollment
  const handleEnrollUser = async (courseId: string) => {
    /* Free courses: launch player directly — no login required */
    const targetCourse = courses.find(c => c.id === courseId);
    if (targetCourse?.isFree && !currentUser) {
      setPlayerCourse(targetCourse);
      return;
    }

    if (!currentUser) {
      setLoginOpen(true);
      triggerToast("Please sign in to access this course.", "warn");
      return;
    }

    try {
      const resp = await fetch("/api/courses/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id, courseId })
      });
      const resData = await resp.json();

      if (resData.status === "success" || resData.status === "already_enrolled") {
        await fetchDbState();
        triggerToast("Course registered successfully! Opening Student dashboard...");
        setCurrentPage('student_dashboard');
      }
    } catch (err) {
      console.error("Enrollment POST fault", err);
    }
  };

  // Sync Video/Progress state
  const handleSyncProgress = async (payload: { userId: string, courseId: string, lessonId?: string, quizId?: string, score?: number, passed?: boolean }) => {
    try {
      const resp = await fetch("/api/courses/sync-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await resp.json();
      if (data.status === "success") {
        await fetchDbState();
        if (payload.lessonId) {
          triggerToast("Lesson completion recorded.");
        }
        if (payload.quizId) {
          if (payload.passed) {
            triggerToast("Exam Passed! Academical credentials triggered!");
          } else {
            triggerToast("Score logged. Retrial recommended to pass.", "warn");
          }
        }
      }
    } catch (err) {
      console.error("Progress telemetry sync fault", err);
    }
  };

  // Course wizard publish
  const handleCourseCreate = async (coursePayload: any) => {
    try {
      const resp = await fetch("/api/courses/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(coursePayload)
      });
      const data = await resp.json();
      if (data.status === "success") {
        await fetchDbState();
        triggerToast("Academy course published successfully!");
      }
    } catch (err) {
      console.error("Course creation fault", err);
    }
  };

  // Event dynamic scheduling publish
  const handleEventCreate = async (eventPayload: any) => {
    try {
      const resp = await fetch("/api/events/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventPayload)
      });
      const data = await resp.json();
      if (data.status === "success") {
        await fetchDbState();
        return true;
      }
    } catch (err) {
      console.error("Event scheduling fault", err);
    }
    return false;
  };

  // Learning Paths Create Action
  const handleLearningPathCreate = async (pathPayload: any) => {
    try {
      const resp = await fetch("/api/learning-paths/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pathPayload)
      });
      const data = await resp.json();
      if (data.status === "success") {
        await fetchDbState();
        triggerToast("Custom Learning Path curated successfully!");
      }
    } catch (err) {
      console.error("Learning path creation fault", err);
    }
  };

  // Learning Paths Enroll Action
  const handleEnrollInPath = async (pathId: string) => {
    if (!currentUser) {
      setLoginOpen(true);
      triggerToast("Authentication required before path entry.", "warn");
      return;
    }
    try {
      const resp = await fetch("/api/learning-paths/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id, pathId })
      });
      const data = await resp.json();
      if (data.status === "success") {
        await fetchDbState();
        triggerToast("Successfully enrolled dynamically in the Learning Path!");
        setCurrentPage('student_dashboard');
      }
    } catch (err) {
      console.error("Path enrollment error", err);
    }
  };

  // Admin approves instructor
  const handleApproveInstructor = async (instructorId: string) => {
    try {
      const resp = await fetch("/api/admin/approve-instructor", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ instructorId })
      });
      const data = await resp.json();
      if (data.status === "success") {
        await fetchDbState();
        triggerToast("Instructor credentials successfully approved.");
      }
    } catch (err) {
      console.error("Instructor approval error", err);
    }
  };

  // Admin deletes course
  const handleApproveCourse = async (courseId: string) => {
    try {
      await fetch('/api/admin/approve-course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ courseId }),
      });
      fetchDbState();
      triggerToast('Course approved and published!', 'success');
    } catch { triggerToast('Failed to approve course', 'warn'); }
  };

  const handleRejectCourse = async (courseId: string, reason: string) => {
    try {
      await fetch('/api/admin/reject-course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ courseId, reason }),
      });
      fetchDbState();
      triggerToast('Course rejected.', 'warn');
    } catch { triggerToast('Failed to reject course', 'warn'); }
  };

  const handleDeleteCourse = async (courseId: string) => {
    try {
      const resp = await fetch(`/api/admin/courses/${courseId}`, {
        method: "DELETE",
        headers: { ...getAuthHeaders() }
      });
      const data = await resp.json();
      if (data.status === "success") {
        await fetchDbState();
        triggerToast("Course moderated and archived.", "warn");
      }
    } catch (err) {
      console.error("Course deletion fault", err);
    }
  };

  // Admin clears activity logs
  const handleClearLogs = async () => {
    try {
      const resp = await fetch("/api/admin/clear-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() }
      });
      const data = await resp.json();
      if (data.status === "success") {
        await fetchDbState();
        triggerToast("Audit log cleared.");
      }
    } catch (err) {
      console.error("Logs clear fault", err);
    }
  };

  // Authentication — JWT cookie issued by bcryptjs auth controller
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginErr("");
    try {
      const resp = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await resp.json();
      if (data.status === "success" && data.user) {
        setCurrentUser(data.user);
        // Also persist token in localStorage for Bearer fallback
        saveSession(data.user.id, data.token || "", rememberMe);
        setLoginOpen(false);
        setLoginEmail("");
        setLoginPassword("");
        triggerToast(`Welcome back, ${data.user.name}!`);
        routeByRole(data.user.role);
      } else {
        setLoginErr(data.error || "Invalid credentials.");
      }
    } catch {
      setLoginErr("Connection error during login.");
    }
  };

  // ── Page-level auth: returns result for dedicated Sign In page ──────────────
  const performLogin = async (email: string, password: string, remember: boolean): Promise<{ success: boolean; error?: string }> => {
    try {
      const resp = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password })
      });
      const data = await resp.json();
      if (data.status === "success" && data.user) {
        setCurrentUser(data.user);
        saveSession(data.user.id, data.token || "", remember);
        await fetchDbState();
        triggerToast(`Welcome back, ${data.user.name}!`);
        routeByRole(data.user.role);
        return { success: true };
      }
      return { success: false, error: data.error || "Invalid credentials." };
    } catch {
      return { success: false, error: "Connection error. Please try again." };
    }
  };

  const handleRegisterSuccess = (user: any, token: string) => {
    setCurrentUser(user);
    saveSession(user.id, token, false);
    fetchDbState();
    /* After registration, auto-resume any saved free course */
    try {
      const raw = localStorage.getItem('dma_last_free_course');
      if (raw) {
        const { courseId } = JSON.parse(raw);
        const saved = courses.find((c: Course) => c.id === courseId);
        if (saved) {
          setTimeout(() => setPlayerCourse(saved), 1200);
        }
      }
    } catch { /* ignore */ }
    triggerToast(`Welcome to DMA Academy, ${user.name}!`);
    routeByRole(user.role);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegSuccess(false);
    try {
      const resp = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: regName, email: regEmail, role: regRole, password: regPassword })
      });
      const data = await resp.json();
      if (data.status === "success") {
        setRegSuccess(true);
        setRegName("");
        setRegEmail("");
        setRegPassword("");
        triggerToast("Account created! Signing you in...");
        setTimeout(() => {
          setRegisterOpen(false);
          setRegSuccess(false);
          setCurrentUser(data.user);
          saveSession(data.user.id, data.token || "", false);
          routeByRole(data.user.role);
        }, 1500);
      } else {
        alert(data.error || "Registration error.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Render secondary static views
  const renderRoutedView = () => {
    if (currentPage.startsWith('cms:')) {
      const pageId = currentPage.slice(4);
      const customPage = cmsContent?.pages?.find((page: any) => page.id === pageId);
      if (customPage) return <CMSPageRenderer page={customPage} />;
    }

    switch (currentPage) {
      case 'home':
        return (
          <LandingPage 
            courses={courses} 
            onEnroll={handleEnrollUser}
            onLaunchPlayer={(course) => setPlayerCourse(course)}
            onExploreCategories={() => setCurrentPage('categories')}
            onExploreCourses={() => setCurrentPage('courses')}
            setRegisterOpen={setRegisterOpen}
            setLoginOpen={setLoginOpen}
            cmsContent={cmsContent}
            onSelectCourse={(c) => {
              triggerToast(`Selected: ${c.title}. Review modules below!`);
              setCurrentPage('courses');
            }}
            onResumeCourse={(courseId) => {
              const found = courses.find(c => c.id === courseId);
              if (found) setPlayerCourse(found);
            }}
          />
        );

      case 'about':
      case 'story':
        return <AboutPage cmsContent={cmsContent} />;

      case 'categories':
        return (
          <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-left" id="categories-view">
            <div className="space-y-4 mb-12">
              <span className="text-xs font-bold text-[#00aaff] uppercase font-mono tracking-widest block">Syllabus Index</span>
              <h2 className="text-3xl font-extrabold text-[#fff]">Comprehensive Laboratory Categories</h2>
              <p className="text-slate-400 text-xs max-w-xl">Each sub-category incorporates deep physical models, PLC logic paths, and expert video guides certified by British Council research leads.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: 'Digital Twin technology', desc: 'Construct highly synced visual CAD assets receiving instantaneous broker telemetry protocols.', icon: '💻', count: '5 modules' },
                { title: 'Robotics & PLC logics', desc: G_CODE => 'Design ladder schemas, program SIEMENS S7 relays, and compile efficient 6-axis G-Code operations.', icon: '🤖', count: '4 modules' },
                { title: 'Smart factory & Casing IoT', desc: 'Deploy mesh MQTT networks, manage packet sizes, and implement sensory power mitigations.', icon: '🏭', count: '6 modules' },
                { title: '3D Additive Fabrication', desc: 'Master metal FDM, UV resin SLA structures, and thermal layer configurations for advanced polymers.', icon: '🖨️', count: '5 modules' },
                { title: 'Applied Industrial Analytics', desc: 'Predict motor wear-and-tear thresholds, compute failure indices, and design diagnostic dashboards.', icon: '📊', count: '4 modules' },
                { title: 'Green factory circular economy', desc: 'Formulate energy reduction matrices and manage lifecycle emission limits inside carbon-audited plants.', icon: '♻️', count: '3 modules' }
              ].map((c, idx) => (
                <div key={idx} className="p-6 rounded-2xl border border-slate-800 bg-[#111827] shadow hover:border-[#00aaff]/25 transition-all text-left space-y-4 group">
                  <div className="text-3xl group-hover:scale-110 transition-transform duration-500">{c.icon}</div>
                  <h4 className="text-xs uppercase font-extrabold text-[#00ddff] font-mono leading-tight">{c.count}</h4>
                  <h3 className="text-sm font-extrabold text-white">{c.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{String(c.desc)}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'courses':
        return (
          <CoursesView 
            courses={courses} 
            onEnroll={handleEnrollUser}
            onLaunchPlayer={(course) => {
              if (!course.isFree && !currentUser) {
                triggerToast("Please register or sign in to access paid courses.", "warn");
                setCurrentPage('register');
                return;
              }
              setPlayerCourse(course);
            }}
            selectedCategoryFilter={selectedCategoryFilter}
            setSelectedCategoryFilter={setSelectedCategoryFilter}
          />
        );

      case 'events':
        return (
          <EventsView 
            currentUser={currentUser} 
            events={events} 
            onEventCreate={handleEventCreate} 
            triggerToast={triggerToast} 
          />
        );

      case 'contact':
        return (
          <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-left" id="contact-view">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Contact Info */}
              <div className="lg:col-span-5 space-y-6">
                <div>
                  <span className="text-xs font-bold text-[#00aaff] uppercase block mb-1">Get in Touch</span>
                  <h2 className="text-3xl font-extrabold text-white">Academic Offices</h2>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">Direct queries to our partner researchers for administrative verification or credit transfers.</p>
                
                <div className="space-y-4 text-xs text-slate-300 font-mono">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-[#00ddff] mt-0.5 shrink-0" />
                    <p>AIUB Campus, Bashundhara, Dhaka 1229, Bangladesh</p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-[#00ddff] shrink-0" />
                    <p>info@digitalmanufacturing.academy</p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-[#00ddff] shrink-0" />
                    <p>+880 2-9884455</p>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="lg:col-span-7 p-6 rounded-2xl border border-slate-800 bg-[#111827]">
                {contactDone ? (
                  <div className="p-8 text-center space-y-4 font-sans">
                    <CheckCircle className="w-10 h-10 text-teal-400 mx-auto" />
                    <h4 className="text-sm font-extrabold text-white">Query Transmitted</h4>
                    <p className="text-xs text-slate-400">Our AIUB-BCU team will email a validated response within 24 hours.</p>
                    <button onClick={() => setContactDone(false)} className="text-xs text-[#00ddff] underline">Submit another ticket</button>
                  </div>
                ) : (
                  <form onSubmit={(e) => { e.preventDefault(); setContactDone(true); }} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Full Name</label>
                      <input type="text" value={contactName} onChange={e => setContactName(e.target.value)} required placeholder="Alex Rivera" className="w-full text-xs p-3 rounded-lg bg-slate-900 border border-slate-800 text-white" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Email Address</label>
                      <input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} required placeholder="alex@gmail.com" className="w-full text-xs p-3 rounded-lg bg-slate-900 border border-slate-800 text-white" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Instructions or Query Topic</label>
                      <textarea value={contactMsg} onChange={e => setContactMsg(e.target.value)} required placeholder="Ask about academic credits, specific classes, or joint grants..." rows={4} className="w-full text-xs p-3 rounded-lg bg-slate-900 border border-slate-800 text-white" />
                    </div>
                    <button type="submit" className="w-full py-2.5 rounded bg-gradient-to-r from-[#0066ff] to-[#00aaff] text-white text-xs font-bold font-sans cursor-pointer">
                      Send Core Query
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        );

      case 'learning_paths':
        return (
          <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in z-10 w-full">
            <LearningPathsView
              currentUser={currentUser}
              courses={courses}
              learningPaths={learningPaths}
              enrollments={enrollments}
              onEnrollPath={handleEnrollInPath}
              onCuratePath={handleLearningPathCreate}
              setLoginOpen={setLoginOpen}
            />
          </div>
        );

      case 'student_dashboard':
        return currentUser ? (
          <StudentDashboard 
            currentUser={currentUser} 
            courses={courses} 
            enrollments={enrollments} 
            certificates={certificates}
            onSyncProgress={handleSyncProgress}
            onExploreCourses={() => setCurrentPage('courses')}
            learningPaths={learningPaths}
            onEnrollInPath={handleEnrollInPath}
            onLaunchPlayer={(course) => setPlayerCourse(course)}
            onProfileUpdated={(user) => setCurrentUser(user)}
          />
        ) : null;

      case 'instructor_dashboard':
        return currentUser ? (
          <InstructorDashboard 
            currentUser={currentUser} 
            courses={courses}
            enrollments={enrollments}
            logs={logs}
            onCourseCreate={handleCourseCreate}
            learningPaths={learningPaths}
            onPathCreate={handleLearningPathCreate}
            onRefresh={fetchDbState}
            triggerToast={triggerToast}
          />
        ) : null;

      case 'admin_dashboard':
        if (!currentUser) return null;
        if (currentUser.role !== 'admin' && currentUser.role !== 'super_admin') {
          return (
            <div className="pt-40 pb-20 flex flex-col items-center justify-center gap-4 text-center px-4">
              <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-2">
                <Shield className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="text-xl font-extrabold text-white">Access Denied</h2>
              <p className="text-slate-400 text-sm max-w-md">You do not have permission to access the Admin Panel. This area is restricted to administrators only.</p>
              <button
                onClick={() => setCurrentPage('home')}
                className="mt-4 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
              >
                Return to Home
              </button>
            </div>
          );
        }
        return (
          <AdminPanel 
            currentUser={currentUser} 
            courses={courses} 
            users={users} 
            logs={logs}
            onApproveInstructor={handleApproveInstructor}
            onDeleteCourse={handleDeleteCourse}
            onClearLogs={handleClearLogs}
            onApproveCourse={handleApproveCourse}
            onRejectCourse={handleRejectCourse}
            onRefreshData={fetchDbState}
            onNoticeChange={setSiteNotice}
            onCmsChange={setCmsContent}
            triggerToast={triggerToast}
          />
        );

      case 'dbDocs':
        return <DatabaseDocs />;

      case 'webinar':
        return (
          <WebinarPage
            currentUser={currentUser}
            triggerToast={triggerToast}
          />
        );

      case 'signin':
        return (
          <SignInPage
            onLogin={performLogin}
            onNavigateRegister={() => { setCurrentPage('register'); window.scrollTo(0, 0); }}
            onNavigateHome={() => { setCurrentPage('home'); window.scrollTo(0, 0); }}
          />
        );

      case 'register':
        return (
          <RegisterPage
            onSuccess={handleRegisterSuccess}
            onNavigateLogin={() => { setCurrentPage('signin'); window.scrollTo(0, 0); }}
            onNavigateHome={() => { setCurrentPage('home'); window.scrollTo(0, 0); }}
            triggerToast={triggerToast}
          />
        );

      case 'contact_us':
        return <ContactUsPage cmsContent={cmsContent} />;

      case 'about_us':
        return <AboutUsPage />;

      case 'terms':
        return <TermsPage />;

      case 'assessment':
        return (
          <AssessmentModule
            currentUser={currentUser}
            courses={courses}
            enrollments={enrollments}
          />
        );

      case 'certificates':
        return (
          <CertificateModule
            currentUser={currentUser}
            courses={courses}
            enrollments={enrollments}
          />
        );

      case 'pricing':
        return (
          <div className="space-y-10">
            <PricingPage onRegister={() => { setCurrentPage('register'); window.scrollTo(0,0); }} onSignIn={() => { setCurrentPage('signin'); window.scrollTo(0,0); }} />
            <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-16 -mt-6">
              <PaymentCheckout />
            </div>
          </div>
        );

      default:
        return <LandingPage courses={courses} onEnroll={handleEnrollUser} onLaunchPlayer={(course) => setPlayerCourse(course)} onExploreCategories={() => setCurrentPage('categories')} onExploreCourses={() => setCurrentPage('courses')} setRegisterOpen={setRegisterOpen} setLoginOpen={setLoginOpen} cmsContent={cmsContent} onSelectCourse={(c) => setCurrentPage('courses')} onResumeCourse={(courseId) => { const found = courses.find(c => c.id === courseId); if (found) setPlayerCourse(found); }} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col justify-between font-sans relative antialiased overflow-x-hidden">
      {/* Background Mesh Gradients */}
      <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[10%] right-[-5%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="absolute top-[20%] right-[10%] w-[300px] h-[300px] bg-sky-500/10 rounded-full blur-[100px] pointer-events-none z-0" />

      {/* Global Toast Alert */}
      {toastMessage && (
        <div className="fixed top-22 inset-x-4 flex justify-center z-50 animate-bounce pointer-events-none">
          <div className={`p-3.5 rounded-xl text-white font-semibold text-xs tracking-wide flex items-center gap-2.5 max-w-sm shadow-[0_5px_25px_rgba(0,0,0,0.5)] border ${
            toastType === 'success' 
              ? 'bg-[#10b981] border-teal-400' 
              : 'bg-amber-500 border-amber-400'
          }`}>
            <CheckCircle className="w-4 h-4 shrink-0 text-white" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Header bar */}
      <Navigation 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        currentUser={currentUser} 
        setCurrentUser={setCurrentUser}
        setLoginOpen={setLoginOpen}
        setRegisterOpen={setRegisterOpen}
        selectedCategoryFilter={selectedCategoryFilter}
        setSelectedCategoryFilter={setSelectedCategoryFilter}
        onSearchOpen={() => setSearchOpen(true)}
        siteNotice={siteNotice}
        cmsPages={cmsContent?.pages || []}
      />

      {/* Global Search Modal */}
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        courses={courses}
        events={events}
        learningPaths={learningPaths}
        onNavigate={(page, categoryFilter) => {
          setCurrentPage(page);
          if (categoryFilter) setSelectedCategoryFilter(categoryFilter);
          window.scrollTo(0, 0);
        }}
      />

      {/* Routed Screens container */}
      <main className="flex-1 w-full pb-20 md:pb-14">
        {loading ? (
          <div className="pt-40 pb-40 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-10 h-10 text-[#00aaff] animate-spin" />
            <p className="text-xs text-slate-500 font-mono uppercase tracking-wider animate-pulse">Establishing smart manufacturing link...</p>
          </div>
        ) : (
          <Suspense fallback={
            <div className="pt-40 pb-40 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-10 h-10 text-[#00aaff] animate-spin" />
              <p className="text-xs text-slate-500 font-mono uppercase tracking-wider animate-pulse">Loading module…</p>
            </div>
          }>
            {renderRoutedView()}
          </Suspense>
        )}
      </main>

      {/* Course Player overlay — full screen */}
      {/* Free courses open for guests; paid courses require login */}
      {playerCourse && (playerCourse.isFree || currentUser) && (
        <Suspense fallback={null}>
          <CoursePlayer
            course={playerCourse}
            currentUser={currentUser}
            enrollment={currentUser ? enrollments.find(e => e.userId === currentUser.id && e.courseId === playerCourse.id) : undefined}
            onClose={() => setPlayerCourse(null)}
            onRequireAuth={() => setCurrentPage('register')}
          />
        </Suspense>
      )}

      {/* Global AI Study Assistant overlay */}
      <AITutorBox 
        currentCourseName={currentPage === 'student_dashboard' ? "Enrolled Workspace" : "Academic Catalog Info"}
        userContextName={currentUser?.name || "Visitor Student"}
      />

      {/* Download Our App Banner */}
      <section className="relative z-10 bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 border-y border-blue-900/40 px-4 sm:px-6 lg:px-8 py-14 text-center">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-5">
            <div className="relative shrink-0">
              <div className="absolute inset-0 bg-blue-500/30 blur-xl rounded-full" />
              <img src="/dma-logo.png" alt="DMA Academy" className="relative w-16 h-16 object-contain drop-shadow-[0_0_12px_rgba(59,130,246,0.7)]" />
            </div>
            <div className="text-left">
              <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest font-mono mb-1">Available on Android</div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">Get the DMA Academy App</h2>
              <p className="text-xs text-slate-400 mt-1 max-w-sm leading-relaxed">
                Install the portal directly on your Android device — access courses, modules, and the DMA Assistant offline-ready.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            {appInstalled ? (
              <div className="flex items-center gap-2 px-6 py-3 rounded-xl bg-green-900/50 border border-green-700/50 text-green-400 text-sm font-bold">
                <CheckCircle className="w-4 h-4" />
                App Installed!
              </div>
            ) : (
              <button
                onClick={handleInstallApp}
                className="flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 transition-all text-white font-extrabold text-sm shadow-lg shadow-blue-900/50 cursor-pointer"
              >
                <Smartphone className="w-4 h-4" />
                Install App
              </button>
            )}
            <a
              href="https://www.pwabuilder.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-700 hover:border-blue-600/60 text-slate-300 hover:text-white text-xs font-bold transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Generate APK
            </a>
          </div>
        </div>

        <div className="max-w-5xl mx-auto mt-8 pt-6 border-t border-slate-800/60">
          <p className="text-[10px] text-slate-500 font-mono text-center leading-relaxed">
            <span className="text-blue-500 font-bold">How to get the APK:</span> After deploying to Hostinger, visit{' '}
            <a href="https://www.pwabuilder.com/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">pwabuilder.com</a>
            {' '}→ enter your Hostinger URL → click <strong>Android</strong> → download the signed APK to share or sideload.
          </p>
        </div>
      </section>

      {/* Footer widgets */}
      <footer className="bg-slate-950/90 border-t border-slate-900 py-12 px-4 sm:px-6 lg:px-8 relative z-10 text-left">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <svg className="w-7 h-7" viewBox="0 0 36 36" fill="none">
                <path d="M18 3L3 10v16l15 7 15-7V10L18 3z" stroke="#00aaff" strokeWidth="2" fill="none" />
                <path d="M13 19l4 4 6-8" stroke="#00ddff" strokeWidth="2" fill="none" strokeLinecap="round" />
              </svg>
              <span className="font-sans font-extrabold text-white text-base tracking-wide">DMA ACADEMY</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              British Council co-developed transnational certifying program mapping Industry 4.0 paradigms directly to professional career positions.
            </p>
          </div>

          <div>
            <h5 className="text-xs font-extrabold uppercase text-slate-200 tracking-wider mb-4">Quick Navigation</h5>
            <ul className="space-y-2 text-xs">
              {[
                { id: 'home',         label: 'Home' },
                { id: 'story',        label: 'Our Story' },
                { id: 'pricing',      label: 'Pricing' },
                { id: 'certificates', label: 'Certification' },
              ].map(it => (
                <li key={it.id}>
                  <button
                    onClick={() => { setCurrentPage(it.id); window.scrollTo(0, 0); }}
                    className="text-slate-400 hover:text-[#00ddff] transition-colors uppercase font-mono text-[9px] cursor-pointer"
                  >
                    {it.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-extrabold uppercase text-slate-200 tracking-wider mb-4">Engineering Focus</h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>Digital Twin Diagnostics</li>
              <li>Automation &amp; PLC Ladders</li>
              <li>Robotic Controllers G-Code</li>
              <li>Sensory IoT Networks</li>
              <li>3D Additive Fabrication</li>
              <li>Green Factory Economics</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h5 className="text-xs font-extrabold uppercase text-slate-200 tracking-wider mb-4 font-sans">Company</h5>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => { setCurrentPage('about_us'); window.scrollTo(0, 0); }} className="text-slate-400 hover:text-[#00ddff] transition-colors cursor-pointer">About Us</button></li>
              <li><button onClick={() => { setCurrentPage('contact_us'); window.scrollTo(0, 0); }} className="text-slate-400 hover:text-[#00ddff] transition-colors cursor-pointer">Contact Us</button></li>
              <li><button onClick={() => { setCurrentPage('terms'); window.scrollTo(0, 0); }} className="text-slate-400 hover:text-[#00ddff] transition-colors cursor-pointer">Terms &amp; Conditions</button></li>
              <li><button onClick={() => { setCurrentPage('register'); window.scrollTo(0, 0); }} className="text-slate-400 hover:text-[#00ddff] transition-colors cursor-pointer">Register Free</button></li>
              <li><button onClick={() => { setCurrentPage('signin'); window.scrollTo(0, 0); }} className="text-slate-400 hover:text-[#00ddff] transition-colors cursor-pointer">Sign In</button></li>
            </ul>
            <div className="pt-2 flex flex-col gap-1.5 text-[10px] text-slate-500 font-mono">
              <p>📍 AIUB Campus, Dhaka, Bangladesh</p>
              <p>📍 Birmingham City University, UK</p>
              <p>📧 info@digitalmanufacturing.academy</p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500 font-mono">
          <p>© 2026 Digital Manufacturing Academy. Funded in co-operation with the British Council. All rights reserved.</p>
          <div className="flex flex-wrap gap-4 text-[10px]">
            <button onClick={() => { setCurrentPage('about_us'); window.scrollTo(0, 0); }} className="hover:text-slate-300 cursor-pointer transition-colors">About Us</button>
            <button onClick={() => { setCurrentPage('contact_us'); window.scrollTo(0, 0); }} className="hover:text-slate-300 cursor-pointer transition-colors">Contact Us</button>
            <button onClick={() => { setCurrentPage('terms'); window.scrollTo(0, 0); }} className="hover:text-slate-300 cursor-pointer transition-colors">Terms &amp; Conditions</button>
            <span className="text-slate-600">Privacy Charter</span>
            <span className="text-slate-600">Security Audits</span>
          </div>
        </div>
      </footer>

      {/* Authentication Login Dialog Modal */}
      {loginOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="p-8 sm:p-10 rounded-3xl glass-dialog max-w-sm w-full space-y-6 text-left relative">
            <button onClick={() => setLoginOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white font-extrabold text-sm p-1.5 cursor-pointer">×</button>
            
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest font-mono">Simulated Auth Gateway</span>
              <h3 className="text-lg font-extrabold text-white">Academy Login</h3>
              <p className="text-slate-400 text-xs">Enter your registered demo email below to load credentials.</p>
            </div>

            {loginErr && (
              <div className="p-3 bg-red-600/10 border border-red-500/20 rounded-lg text-red-400 text-xs flex gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginErr}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 font-sans">Email Address *</label>
                <input 
                  type="email" 
                  value={loginEmail} 
                  onChange={e => setLoginEmail(e.target.value)} 
                  required 
                  placeholder="e.g. student@digitalmanufacturing.academy" 
                  className="w-full glass-input"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 font-sans">Password *</label>
                <input 
                  type="password"
                  value={loginPassword} 
                  onChange={e => setLoginPassword(e.target.value)} 
                  required 
                  placeholder="Enter your password"
                  className="w-full glass-input"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer select-none group">
                  <div
                    onClick={() => setRememberMe(r => !r)}
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors cursor-pointer ${
                      rememberMe ? 'bg-blue-600 border-blue-500' : 'border-slate-600 bg-white/5 hover:border-slate-400'
                    }`}
                  >
                    {rememberMe && <CheckCircle className="w-3 h-3 text-white" />}
                  </div>
                  <span className="text-[11px] text-slate-400 group-hover:text-slate-300 transition-colors">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => { setLoginOpen(false); setCurrentPage('signin'); window.scrollTo(0, 0); }}
                  className="text-[11px] text-[#00aaff] hover:text-[#00ddff] font-bold cursor-pointer transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              <button type="submit" className="w-full py-2.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs uppercase tracking-wide cursor-pointer transition-colors shadow-lg shadow-blue-650/20">
                Sign In to Academy
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Authentication Register Dialog Modal */}
      {registerOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="p-8 sm:p-10 rounded-3xl glass-dialog max-w-sm w-full space-y-6 text-left relative">
            <button onClick={() => setRegisterOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white font-extrabold text-sm p-1.5 cursor-pointer">×</button>
            
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-[#00aaff] uppercase tracking-widest font-mono">Transnational SaaS Registration</span>
              <h3 className="text-lg font-extrabold text-white">Join Academy</h3>
              <p className="text-slate-400 text-xs">Register your name to access joint British Council certification outlines.</p>
            </div>

            {regSuccess ? (
              <div className="p-4 bg-teal-500/10 border border-teal-500/20 rounded-xl text-teal-405 text-xs space-y-1 shadow">
                <div className="font-bold flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-teal-400" />
                  <span>Success! Account Built</span>
                </div>
                <p>Generating session token. Auto signing you in...</p>
              </div>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Full Name *</label>
                  <input type="text" value={regName} onChange={e => setRegName(e.target.value)} required placeholder="Alex Rivera" className="w-full glass-input" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Email Address *</label>
                  <input type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} required placeholder="alex@gmail.com" className="w-full glass-input" />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Password *</label>
                  <input type="password" value={regPassword} onChange={e => setRegPassword(e.target.value)} required minLength={6} placeholder="At least 6 characters" className="w-full glass-input" />
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">My Academy Role *</label>
                  <div className="flex gap-2.5">
                    {(['student', 'instructor'] as const).map(role => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setRegRole(role)}
                        className={`flex-1 p-2.5 text-xs rounded-lg border font-extrabold capitalize transition-all ${
                          regRole === role 
                            ? 'border-blue-500 bg-blue-600/20 text-white' 
                            : 'border-white/10 bg-white/5 text-slate-450'
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>

                <p className="text-[10px] text-slate-500 leading-normal">Note: Instructors require administrative verification before course publishing capability activates.</p>

                <button type="submit" className="w-full py-2.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs uppercase cursor-pointer transition-colors shadow-lg shadow-blue-650/20">
                  Generate Academic Token
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
