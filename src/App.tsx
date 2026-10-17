import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  CheckCircle, AlertCircle, Award, Compass, Sparkles, Shield,
  BookOpen, Layers, Bot, Database, Calendar, Mail, Phone, MapPin, Loader2, ArrowRight,
  Smartphone, Download
} from 'lucide-react';
import { Course, User, Enrollment, Certificate, LearningPath, SiteNotice } from './types';
import { getAuthHeaders } from './lib/session';
import Navigation from './components/Navigation';
import LandingPage from './components/LandingPage';
import RepositoryPage from "./components/RepositoryPage";
import { OAuthConsent } from './pages/OAuthConsent';
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
  const location = useLocation();

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

  ... (truncated for brevity in tool call) ...
