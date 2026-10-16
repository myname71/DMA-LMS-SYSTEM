import React, { useState } from 'react';
import { 
  Menu, X, Shield, User as UserIcon, BookOpen, 
  Database, LogIn, UserPlus, GraduationCap, ChevronDown, CheckCircle, Grid, Sparkles, MapPin, Mail, MessageSquare, Search,
  Home, BookMarked, CalendarDays, LayoutDashboard, UserCircle2, Megaphone, FileText
} from 'lucide-react';
import { SiteNotice, User } from '../types';
import { DEMO_USERS } from '../data/coursesData';

interface NavigationProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  setLoginOpen: (open: boolean) => void;
  setRegisterOpen: (open: boolean) => void;
  selectedCategoryFilter: string;
  setSelectedCategoryFilter: (category: string) => void;
  onSearchOpen: () => void;
  siteNotice?: SiteNotice | null;
  cmsPages?: Array<{ id: string; label: string; slug: string }>;
}

export default function Navigation({
  currentPage,
  setCurrentPage,
  currentUser,
  setCurrentUser,
  setLoginOpen,
  setRegisterOpen,
  selectedCategoryFilter,
  setSelectedCategoryFilter,
  onSearchOpen,
  siteNotice,
  cmsPages = [],
}: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);

  // Filter-friendly modules inside our Mega Menu
  const megaMenuCategories = [
    {
      title: 'Digital Twin Technology',
      desc: 'Virtual CAD telemetries under Prof Butt',
      icon: '💻',
      dbCategory: 'Digital Twin'
    },
    {
      title: 'Robotics & PLC Programing',
      desc: 'Siemens relay ladders and robot controllers',
      icon: '🤖',
      dbCategory: 'Robotics'
    },
    {
      title: 'Smart Factory & Cyber-Physical',
      desc: 'MQTT network brokers and sensory casing telemetry',
      icon: '🏭',
      dbCategory: 'Smart Factory'
    },
    {
      title: 'Additive Manufacturing',
      desc: 'FDM and digital UV SLA resin configuration',
      icon: '🖨️',
      dbCategory: 'Additive Manufacturing'
    },
    {
      title: 'Technology & Logistical Analytics',
      desc: 'Predictive fail-safe indexing and carbon circular modeling',
      icon: '📊',
      dbCategory: 'Analytics'
    }
  ];

  // Map user requested core menu
  const navItems = [
  { id: "home", label: "Home" },
  { id: "categories", label: "Categories", isMega: true },
  { id: "courses", label: "Courses" },
  { id: "events", label: "Events" },
  { id: "webinar", label: "Webinar" },
  { id: "repository", label: "Repository" },
  { id: "certificates", label: "Certification" },
];
  const customPages = cmsPages.filter(page => !['home', 'about', 'contact'].includes(page.id));

  const handleRoleSwitch = (roleKey: string) => {
    const selectedUser = DEMO_USERS[roleKey];
    setCurrentUser(selectedUser);
    setShowRoleDropdown(false);
    
    // Auto-navigate securely
    if (selectedUser.role === 'student') {
      setCurrentPage('student_dashboard');
    } else if (selectedUser.role === 'instructor') {
      setCurrentPage('instructor_dashboard');
    } else if (selectedUser.role === 'admin' || selectedUser.role === 'super_admin') {
      setCurrentPage('admin_dashboard');
    } else {
      setCurrentPage('home');
    }
  };

  const handleMegaCategoryClick = (category: string) => {
    setSelectedCategoryFilter(category);
    setCurrentPage('courses');
    setMegaMenuOpen(false);
    window.scrollTo(0, 0);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-nav shadow-lg border-b border-white/5" id="primary-navigation-bar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Logo Brand */}
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => { 
              setCurrentPage('home'); 
              setSelectedCategoryFilter('All');
              setMegaMenuOpen(false); 
              window.scrollTo(0, 0); 
            }}
            id="nav-logo"
          >
            <img
              src="/dma-logo.png"
              alt="DMA Academy Logo"
              className="w-[54px] h-[54px] sm:w-[60px] sm:h-[60px] p-1 object-contain drop-shadow-[0_0_8px_rgba(37,99,235,0.6)]"
            />
            <div className="flex flex-col text-left leading-none">
              <span className="font-sans font-extrabold text-sm tracking-tight text-white">DMA Academy</span>
            </div>
          </div>

          {/* Desktop Navigation Link Station */}
          <div className="hidden md:flex items-center gap-5">
            {navItems.map(item => {
              if (item.isMega) {
                return (
                  <div 
                    key={item.id} 
                    className="relative py-2"
                    onMouseEnter={() => setMegaMenuOpen(true)}
                    onMouseLeave={() => setMegaMenuOpen(false)}
                  >
                    <button
                      id={`nav-link-${item.id}`}
                      className={`text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1 cursor-pointer py-1 ${
                        currentPage === 'courses' && selectedCategoryFilter !== 'All'
                          ? 'text-[#00ddff]'
                          : megaMenuOpen ? 'text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>{item.label}</span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${megaMenuOpen ? 'rotate-180 text-blue-400' : 'text-slate-500'}`} />
                    </button>

                    {/* Mega Dropdown Panel */}
                    {megaMenuOpen && (
                      <div className="absolute left-1/2 -translate-x-1/2 mt-3.5 w-[580px] rounded-2xl border border-white/5 bg-slate-950/95 backdrop-blur-xl p-5 shadow-2xl z-50 grid grid-cols-2 gap-4 text-left animate-fade-in">
                        <div className="col-span-2 border-b border-white/5 pb-2.5 flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">Select Laboratory Specialization</span>
                          <button 
                            onClick={() => handleMegaCategoryClick('All')}
                            className="text-[10px] text-[#00ddff] font-bold hover:underline"
                          >
                            Browse All Classes
                          </button>
                        </div>

                        {megaMenuCategories.map((m) => (
                          <div 
                            key={m.dbCategory}
                            onClick={() => handleMegaCategoryClick(m.dbCategory)}
                            className="p-3 rounded-xl border border-transparent hover:border-[#00aaff]/25 hover:bg-slate-900/40 cursor-pointer transition-all space-y-1 block group"
                          >
                            <span className="text-xl group-hover:scale-110 transition-transform inline-block mb-1">{m.icon}</span>
                            <h4 className="text-xs font-bold text-slate-100 group-hover:text-[#00ddff] transition-colors">{m.title}</h4>
                            <p className="text-[10px] text-slate-450 leading-relaxed font-sans">{m.desc}</p>
                          </div>
                        ))}

                        <div className="col-span-2 bg-[#1d2d44]/15 border border-[#00aaff]/10 p-3 rounded-xl text-[10px] text-slate-400 flex items-center justify-between font-mono">
                          <span className="flex items-center gap-1 text-[#00ddff] font-bold">
                            <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Free Open Access System Scheme
                          </span>
                          <span>Funded by the British Council</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => { 
                    setMegaMenuOpen(false); 
                    if (item.id === 'courses') {
                      setSelectedCategoryFilter('All');
                    }
                    setCurrentPage(item.id); 
                    window.scrollTo(0, 0); 
                  }}
                  className={`text-xs font-bold uppercase tracking-wider transition-colors relative py-1 cursor-pointer hover:text-blue-400 ${
                    currentPage === item.id ? 'text-blue-400 font-bold' : 'text-slate-450'
                  }`}
                >
                  {item.label}
                  {currentPage === item.id && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />
                  )}
                </button>
              );
            })}
            {customPages.map(page => (
              <button
                key={page.id}
                onClick={() => { setMegaMenuOpen(false); setCurrentPage(`cms:${page.id}`); window.scrollTo(0, 0); }}
                className={`text-xs font-bold uppercase tracking-wider transition-colors relative py-1 cursor-pointer hover:text-blue-400 ${
                  currentPage === `cms:${page.id}` ? 'text-blue-400' : 'text-slate-450'
                }`}
              >
                {page.label}
                {currentPage === `cms:${page.id}` && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />}
              </button>
            ))}
          </div>

          {/* Practical Simulation Controls & User Section */}
          <div className="hidden md:flex items-center gap-3">

            {/* Global Search Button */}
            <button
              onClick={() => { setMegaMenuOpen(false); onSearchOpen(); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/5 bg-white/5 text-slate-400 text-[10px] font-bold font-mono hover:bg-white/10 hover:text-white transition-all cursor-pointer uppercase tracking-wider"
              id="search-open-btn"
              title="Search courses, events & paths"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Search</span>
              <kbd className="hidden lg:inline text-[8px] text-slate-600 border border-white/10 rounded px-1 py-0.5 font-mono">⌘K</kbd>
            </button>

            {/* Quick Demo Simulation switcher — admin/super_admin only */}
            {(currentUser?.role === 'admin' || currentUser?.role === 'super_admin') && (
            <div className="relative">
              <button
                onClick={() => { setMegaMenuOpen(false); setShowRoleDropdown(!showRoleDropdown); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/5 bg-white/5 text-slate-350 text-[10px] font-bold font-mono hover:bg-white/10 transition-all cursor-pointer uppercase tracking-wider"
                id="role-switcher-btn"
              >
                <Shield className="w-3.5 h-3.5 text-blue-450" />
                <span>Simulate Role</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {showRoleDropdown && (
                <div className="absolute right-0 mt-2.5 w-60 rounded-xl bg-slate-950 border border-white/5 shadow-2xl p-2 z-50 text-left animate-fade-in">
                  <div className="text-[9px] uppercase font-bold tracking-widest text-slate-500 px-3 py-1.5 border-b border-white/5 mb-1.5 font-mono">
                    Simulation Role switcher:
                  </div>
                  {(Object.keys(DEMO_USERS) as Array<keyof typeof DEMO_USERS>).map(roleKey => {
                    const u = DEMO_USERS[roleKey];
                    const isActive = currentUser?.role === u.role;
                    return (
                      <button
                        key={u.role}
                        onClick={() => handleRoleSwitch(roleKey as string)}
                        className={`w-full flex items-center justify-between text-left px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                          isActive ? 'bg-blue-600/10 text-white font-bold border border-blue-500/15' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2 font-sans">
                          <span className="text-sm">
                            {u.role === 'student' ? '🎓' : u.role === 'instructor' ? '👨‍🏫' : u.role === 'admin' ? '🛡️' : '👑'}
                          </span>
                          <div>
                            <div className="text-xs font-bold leading-tight">{u.name.split(' ')[0]}</div>
                            <div className="text-[10px] text-slate-500 lowercase leading-tight">{u.role.replace('_', ' ')}</div>
                          </div>
                        </div>
                        {isActive && <CheckCircle className="w-3.5 h-3.5 text-blue-400" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            )}

            {/* Profile Entry points or Login/Register state */}
            {currentUser ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setMegaMenuOpen(false);
                    if (currentUser.role === 'student') setCurrentPage('student_dashboard');
                    else if (currentUser.role === 'instructor') setCurrentPage('instructor_dashboard');
                    else setCurrentPage('admin_dashboard');
                    window.scrollTo(0, 0);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold uppercase tracking-wider font-sans transition-all cursor-pointer shadow-lg flex items-center gap-1.5"
                  id="dashboard-entry-btn"
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Dashboard</span>
                </button>

                <div 
                  onClick={() => {
                    setMegaMenuOpen(false);
                    if (currentUser.role === 'student') setCurrentPage('student_dashboard');
                    else if (currentUser.role === 'instructor') setCurrentPage('instructor_dashboard');
                    else setCurrentPage('admin_dashboard');
                  }}
                  className="flex items-center gap-2 bg-white/5 pl-2 pr-3 py-1 rounded-full border border-white/10 cursor-pointer hover:border-blue-500/50 transition-colors"
                >
                  <img 
                    src={currentUser.avatar} 
                    alt={currentUser.name} 
                    className="w-6 h-6 rounded-full object-cover border border-blue-500" 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100';
                    }}
                  />
                  <span className="text-[10px] font-extrabold text-[#00ddff] capitalize max-w-[70px] truncate">{currentUser.name.split(' ')[0]}</span>
                </div>

                <button
                  onClick={async () => {
                    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {});
                    localStorage.removeItem('dma_auth_session');
                    sessionStorage.removeItem('dma_auth_session');
                    setCurrentUser(null);
                    setCurrentPage('home');
                    setMegaMenuOpen(false);
                  }}
                  className="p-1 px-2 text-[10px] text-slate-500 hover:text-red-400 font-bold uppercase tracking-wider rounded border border-white/5 bg-white/5 cursor-pointer hover:bg-red-500/10 transition-colors font-mono"
                  id="logout-btn"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setMegaMenuOpen(false); setCurrentPage('signin'); window.scrollTo(0, 0); }}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-350 hover:text-white transition-all bg-none border-0 cursor-pointer"
                  id="login-trigger-btn"
                >
                  <LogIn className="w-3.5 h-3.5 text-blue-450" />
                  <span>Sign In</span>
                </button>
                <button
                  onClick={() => { setMegaMenuOpen(false); setCurrentPage('register'); window.scrollTo(0, 0); }}
                  className="flex items-center gap-1 px-3.5 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-semibold transition-colors cursor-pointer shadow-[0_4px_15px_rgba(37,99,235,0.25)]"
                  id="register-trigger-btn"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Top Bar — clean: logo + hamburger only */}
          <div className="md:hidden flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="relative p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
              id="mobile-hamburger"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
              {currentUser && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full border border-slate-900" />
              )}
            </button>
          </div>
        </div>
      </div>

      {siteNotice?.enabled && (
        <div className="absolute top-full left-0 right-0 z-40 border-b border-amber-400/20 bg-gradient-to-r from-amber-500/15 via-slate-950/95 to-blue-500/15 backdrop-blur-xl">
          <div className="dma-bulletin-viewport">
            <div className="dma-bulletin-track">
              {[0, 1].map((copy) => (
                <div key={copy} className="dma-bulletin-group" aria-hidden={copy === 1}>
                  <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
                    <div className="flex items-center gap-2.5 text-left whitespace-nowrap">
                      <Megaphone className="w-4 h-4 shrink-0 text-amber-300" />
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-300 shrink-0">
                        {siteNotice.title || 'Site Notice'}
                      </span>
                      <span className="h-3 w-px bg-white/15 shrink-0" />
                      <p className="text-xs text-slate-200 shrink-0">{siteNotice.message}</p>
                      {siteNotice.linkUrl && (
                        <a
                          href={siteNotice.linkUrl}
                          target="_blank"
                          rel="noreferrer"
                          tabIndex={copy === 1 ? -1 : 0}
                          className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 hover:text-white shrink-0"
                        >
                          {siteNotice.linkLabel || 'Learn more'} →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile Side Drawer Menu ── */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="md:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Drawer panel */}
          <div className="md:hidden fixed top-0 right-0 bottom-0 w-[280px] max-w-[80vw] z-50 bg-slate-950 border-l border-white/10 shadow-2xl flex flex-col animate-slide-in-right">
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500 font-mono">Menu</span>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer nav items */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
              {navItems.map(item => {
                const isActive = currentPage === item.id || (item.id === 'categories' && currentPage === 'courses');
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      if (item.id === 'categories') {
                        setSelectedCategoryFilter('All');
                        setCurrentPage('courses');
                      } else {
                        if (item.id === 'courses') setSelectedCategoryFilter('All');
                        setCurrentPage(item.id);
                      }
                      window.scrollTo(0, 0);
                    }}
                    className={`w-full text-left flex items-center gap-3 py-3 px-3.5 rounded-xl transition-colors text-sm font-bold uppercase tracking-wider cursor-pointer ${
                      isActive 
                        ? 'bg-blue-600/10 text-blue-400 border border-blue-500/15' 
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {item.id === 'home' && <Home className="w-4 h-4" />}
                    {item.id === 'categories' && <Grid className="w-4 h-4" />}
                    {item.id === 'courses' && <BookMarked className="w-4 h-4" />}
                    {item.id === 'events' && <CalendarDays className="w-4 h-4" />}
                    {item.id === 'webinar' && <Megaphone className="w-4 h-4" />}
                    {item.id === 'about' && <UserCircle2 className="w-4 h-4" />}
                    {item.id === 'contact' && <Mail className="w-4 h-4" />}
                    <span>{item.label}</span>
                  </button>
                );
              })}
              {customPages.map(page => (
                <button
                  key={page.id}
                  onClick={() => { setCurrentPage(`cms:${page.id}`); setMobileMenuOpen(false); window.scrollTo(0, 0); }}
                  className={`w-full text-left flex items-center gap-3 py-3 px-3.5 rounded-xl text-sm font-bold uppercase tracking-wider cursor-pointer ${
                    currentPage === `cms:${page.id}` ? 'bg-blue-600/10 text-blue-400 border border-blue-500/15' : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>{page.label}</span>
                </button>
              ))}

              {/* Search button */}
              <button
                onClick={() => { onSearchOpen(); setMobileMenuOpen(false); }}
                className="w-full text-left flex items-center gap-3 py-3 px-3.5 rounded-xl text-sm font-bold uppercase tracking-wider text-slate-300 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>Search</span>
              </button>

              {/* Divider */}
              <div className="my-2 border-t border-white/10" />

              {/* Role Switcher — admin/super_admin only */}
              {(currentUser?.role === 'admin' || currentUser?.role === 'super_admin') && (<>
              <button
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className="w-full text-left flex items-center gap-3 py-3 px-3.5 rounded-xl text-sm font-bold uppercase tracking-wider text-[#00ddff] hover:bg-white/5 transition-colors cursor-pointer"
              >
                <Shield className="w-4 h-4" />
                <span>Simulate Role</span>
                <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${showRoleDropdown ? 'rotate-180' : ''}`} />
              </button>
              {showRoleDropdown && (
                <div className="ml-4 space-y-1">
                  {(Object.keys(DEMO_USERS) as Array<keyof typeof DEMO_USERS>).map(roleKey => {
                    const u = DEMO_USERS[roleKey];
                    const isActive = currentUser?.role === u.role;
                    return (
                      <button
                        key={u.role}
                        onClick={() => {
                          handleRoleSwitch(roleKey as string);
                          setShowRoleDropdown(false);
                        }}
                        className={`w-full flex items-center gap-2.5 text-left px-3 py-2.5 rounded-lg text-xs cursor-pointer font-sans ${
                          isActive ? 'bg-blue-600/10 text-white font-bold border border-blue-500/15' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <span>{u.role === 'student' ? '🎓' : u.role === 'instructor' ? '👨‍🏫' : '🛡️'}</span>
                        <div>
                          <div className="font-bold leading-tight">{u.name.split(' ')[0]}</div>
                          <div className="text-[10px] text-slate-500 capitalize leading-tight">{u.role}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
              </>)}

              {/* Divider */}
              <div className="my-2 border-t border-white/10" />

              {/* Auth section */}
              {!currentUser ? (
                <div className="space-y-2">
                  <button
                    onClick={() => { setCurrentPage('signin'); setMobileMenuOpen(false); window.scrollTo(0, 0); }}
                    className="w-full text-left flex items-center gap-3 py-3 px-3.5 rounded-xl text-sm font-bold uppercase tracking-wider text-slate-300 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Sign In</span>
                  </button>
                  <button
                    onClick={() => { setCurrentPage('register'); setMobileMenuOpen(false); window.scrollTo(0, 0); }}
                    className="w-full text-left flex items-center gap-3 py-3 px-3.5 rounded-xl text-sm font-bold uppercase tracking-wider text-[#00ddff] hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Register</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      if (currentUser.role === 'student') setCurrentPage('student_dashboard');
                      else if (currentUser.role === 'instructor') setCurrentPage('instructor_dashboard');
                      else setCurrentPage('admin_dashboard');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left flex items-center gap-3 py-3 px-3.5 rounded-xl text-sm font-bold uppercase tracking-wider text-blue-400 hover:bg-blue-600/10 transition-colors cursor-pointer"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Dashboard</span>
                  </button>
                  <button
                    onClick={async () => {
                      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {});
                      localStorage.removeItem('dma_auth_session');
                      sessionStorage.removeItem('dma_auth_session');
                      setCurrentUser(null);
                      setCurrentPage('home');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left flex items-center gap-3 py-3 px-3.5 rounded-xl text-sm font-bold uppercase tracking-wider text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                  >
                    <LogIn className="w-4 h-4 rotate-180" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Mobile Bottom Tab Bar ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-xl border-t border-white/8 flex items-stretch h-16 shadow-[0_-4px_30px_rgba(0,0,0,0.5)]">
        {/* Home */}
        <button
          onClick={() => { setCurrentPage('home'); setSelectedCategoryFilter('All'); setMobileMenuOpen(false); window.scrollTo(0,0); }}
          className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer relative ${currentPage === 'home' ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
        >
          {currentPage === 'home' && <span className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-blue-500 rounded-full" />}
          <Home className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase tracking-wider">Home</span>
        </button>

        {/* Courses */}
        <button
          onClick={() => { setCurrentPage('courses'); setSelectedCategoryFilter('All'); setMobileMenuOpen(false); window.scrollTo(0,0); }}
          className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer relative ${currentPage === 'courses' ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
        >
          {currentPage === 'courses' && <span className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-blue-500 rounded-full" />}
          <BookMarked className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase tracking-wider">Courses</span>
        </button>

        {/* Events */}
        <button
          onClick={() => { setCurrentPage('events'); setMobileMenuOpen(false); window.scrollTo(0,0); }}
          className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer relative ${currentPage === 'events' ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
        >
          {currentPage === 'events' && <span className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-blue-500 rounded-full" />}
          <CalendarDays className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase tracking-wider">Events</span>
        </button>

        {/* Dashboard or Sign In */}
        {currentUser ? (
          <button
            onClick={() => {
              if (currentUser.role === 'student') setCurrentPage('student_dashboard');
              else if (currentUser.role === 'instructor') setCurrentPage('instructor_dashboard');
              else setCurrentPage('admin_dashboard');
              setMobileMenuOpen(false);
              window.scrollTo(0,0);
            }}
            className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer relative ${
              ['student_dashboard','instructor_dashboard','admin_dashboard'].includes(currentPage) ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {['student_dashboard','instructor_dashboard','admin_dashboard'].includes(currentPage) && <span className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-blue-500 rounded-full" />}
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-5 h-5 rounded-full object-cover border border-blue-500"
              onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'; }}
            />
            <span className="text-[9px] font-bold uppercase tracking-wider truncate max-w-[56px]">{currentUser.name.split(' ')[0]}</span>
          </button>
        ) : (
          <button
            onClick={() => { setCurrentPage('signin'); setMobileMenuOpen(false); window.scrollTo(0, 0); }}
            className="flex-1 flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-blue-400 transition-all cursor-pointer"
          >
            <UserCircle2 className="w-5 h-5" />
            <span className="text-[9px] font-bold uppercase tracking-wider">Sign In</span>
          </button>
        )}
      </div>
    </nav>
  );
}
