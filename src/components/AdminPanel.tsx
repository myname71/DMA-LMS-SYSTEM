import React, { useState } from 'react';
import { 
  Users, BookOpen, Shield, Award, Trash2, 
  Check, XSquare, Lock, Image, UserCog
} from 'lucide-react';
import { Course, User } from '../types';
import SiteCMSDashboard from './SiteCMSDashboard';
import UserManagementTab from './admin/UserManagementTab';
import RoleManagementTab from './admin/RoleManagementTab';
import MediaLibraryTab from './admin/MediaLibraryTab';
import ThemeEditorTab from './admin/ThemeEditorTab';
import SiteNoticeTab from './admin/SiteNoticeTab';
import AdminCourseManager from './admin/AdminCourseManager';

export const isAdminUser = (user: User | null): boolean =>
  user?.role === 'admin' || user?.role === 'super_admin';

interface AdminPanelProps {
  currentUser: User;
  courses: Course[];
  users: User[];
  logs: any[];
  onApproveInstructor: (instructorId: string) => void;
  onDeleteCourse: (courseId: string) => void;
  onClearLogs: () => void;
  onApproveCourse?: (courseId: string) => void;
  onRejectCourse?: (courseId: string, reason: string) => void;
  onRefreshData?: () => void;
  onNoticeChange?: (notice: any | null) => void;
  onCmsChange?: (content: any) => void;
  triggerToast?: (msg: string, type?: 'success' | 'warn') => void;
}

type TabKey = 'users' | 'approvals' | 'course_approvals' | 'course_manager' | 'moderation' | 'activity_logs' | 'site_cms' | 'bulletin' | 'roles' | 'media' | 'theme';

export default function AdminPanel({
  currentUser,
  courses,
  users,
  logs,
  onApproveInstructor,
  onDeleteCourse,
  onClearLogs,
  onApproveCourse,
  onRejectCourse,
  onRefreshData = () => {},
  onNoticeChange = () => {},
  onCmsChange = () => {},
  triggerToast = () => {},
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('users');
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});

  if (!isAdminUser(currentUser)) {
    return (
      <div className="pt-40 pb-20 flex flex-col items-center justify-center gap-4 text-center px-4">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-2">
          <Lock className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-xl font-extrabold text-white">Access Restricted</h2>
        <p className="text-slate-400 text-sm max-w-md">
          The admin panel is only accessible to administrators and super administrators.
        </p>
      </div>
    );
  }

  const pendingInstructors = users.filter(u => u.role === 'instructor' && !u.isApproved);

  const stats = [
    { label: 'Registered Users', count: users.length, icon: Users, color: 'text-[#00aaff]' },
    { label: 'Syllabus Outlines', count: courses.length, icon: BookOpen, color: 'text-[#00ddff]' },
    { label: 'Pending Approvals', count: pendingInstructors.length, icon: Shield, color: 'text-amber-500' },
    { label: 'System Logs', count: logs.length, icon: Award, color: 'text-[#10b981]' },
  ];

  const TABS: { key: TabKey; label: string }[] = [
    { key: 'users', label: '👤 Users' },
    { key: 'roles', label: '🔐 Roles' },
    { key: 'media', label: '🖼️ Media' },
    { key: 'approvals', label: 'Instructors' },
    { key: 'course_approvals', label: 'Course Approvals' },
    { key: 'course_manager', label: 'Course Manager' },
    { key: 'moderation', label: 'Moderation' },
    { key: 'activity_logs', label: 'Activity Logs' },
    { key: 'site_cms', label: '🌐 Site CMS' },
    { key: 'bulletin', label: '📢 Site Bulletin' },
    { key: 'theme', label: '🎨 Theme' },
  ];

  return (
    <div className="relative text-white min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" id="admin-board">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.06),transparent_50%)] z-0 pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-6 mb-8 text-left">
        <div>
          <div className="text-xs font-bold text-amber-500 uppercase mb-1">
            {currentUser.role === 'super_admin' ? 'Super Admin Control Board' : 'Platform Moderator Board'}
          </div>
          <h2 className="text-2xl font-extrabold text-slate-100 flex items-center gap-1.5 font-sans">
            <Shield className="w-6 h-6 text-amber-500 animate-pulse" />
            <span>Digital Manufacturing Academy Control Panel</span>
          </h2>
          <p className="text-xs text-slate-400">Supervise user registrations, approve expert instructors, moderate core courses, and review security logs.</p>
        </div>

        {/* Tab selector */}
        <div className="flex flex-wrap gap-2">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === key
                  ? 'bg-amber-500/25 text-amber-400 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 text-left">
        {stats.map((st, idx) => (
          <div key={idx} className="p-5 rounded-2xl glass-card">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] uppercase font-bold text-slate-500 font-sans">{st.label}</span>
              <st.icon className={`w-4 h-4 ${st.color}`} />
            </div>
            <div className="text-2xl font-extrabold font-mono tracking-tight">{st.count}</div>
          </div>
        ))}
      </div>

      {/* Tab content */}
      <div className="relative z-10 glass-dialog border border-white/10 p-6 rounded-2xl text-left shadow-xl">

        {/* ── User Management ── */}
        {activeTab === 'users' && (
          <UserManagementTab
            users={users}
            currentUser={currentUser}
            onRefresh={onRefreshData}
            triggerToast={triggerToast}
          />
        )}

        {/* ── Role Management ── */}
        {activeTab === 'roles' && (
          <RoleManagementTab triggerToast={triggerToast} />
        )}

        {/* ── Media Library ── */}
        {activeTab === 'media' && (
          <MediaLibraryTab triggerToast={triggerToast} />
        )}

        {/* ── Instructor Approvals ── */}
        {activeTab === 'approvals' && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold uppercase text-slate-300">Pending Academic Instructors Queue</h3>
            {pendingInstructors.length === 0 ? (
              <div className="p-8 text-center rounded-xl glass-card text-slate-500 font-medium italic">
                ✓ No pending instructor applications. All registered users verified successfully.
              </div>
            ) : (
              <div className="space-y-4">
                {pendingInstructors.map(instructor => (
                  <div key={instructor.id} className="p-4 rounded-xl glass-card flex items-center justify-between gap-4 hover:border-white/20 transition duration-300">
                    <div className="flex items-center gap-3">
                      <img src={instructor.avatar} alt="" className="w-10 h-10 rounded-full object-cover border border-white/10" />
                      <div>
                        <div className="text-sm font-extrabold text-white">{instructor.name}</div>
                        <div className="text-xs text-slate-400 font-mono">{instructor.email} • Registered {instructor.joinedAt}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => onApproveInstructor(instructor.id)}
                      className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-lg hover:bg-emerald-500/30 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Course Approvals ── */}
        {activeTab === 'course_approvals' && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold uppercase text-slate-300">Pending Course Approval Queue</h3>
            {(() => {
              const pending = courses.filter((c: any) => c.approvalStatus === 'pending' || (!c.isPublished && !c.approvalStatus));
              if (pending.length === 0) return (
                <div className="p-8 text-center rounded-xl glass-card text-slate-500 font-medium italic">
                  ✓ No courses awaiting review. All submitted courses have been processed.
                </div>
              );
              return (
                <div className="space-y-4">
                  {pending.map((course: any) => (
                    <div key={course.id} className="p-5 rounded-xl glass-card space-y-4">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                          <span className="text-[9px] font-mono font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded uppercase border border-amber-500/20 mr-2">{course.category}</span>
                          <h4 className="text-sm font-extrabold text-white mt-1">{course.title}</h4>
                          <p className="text-xs text-slate-400 mt-1">By {course.instructorName} • {course.lessons?.length || 0} lessons • ${course.price}</p>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{course.description}</p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => onApproveCourse && onApproveCourse(course.id)}
                            className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-lg hover:bg-emerald-500/30 flex items-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" /> Approve & Publish
                          </button>
                          <button
                            onClick={() => onRejectCourse && onRejectCourse(course.id, rejectReason[course.id] || 'Content does not meet quality standards.')}
                            className="px-4 py-2 bg-rose-500/15 border border-rose-500/20 text-rose-400 text-xs font-bold rounded-lg hover:bg-rose-500/25 flex items-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <XSquare className="w-3.5 h-3.5" /> Reject
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Rejection Reason (optional)</label>
                        <input
                          value={rejectReason[course.id] || ''}
                          onChange={e => setRejectReason(prev => ({ ...prev, [course.id]: e.target.value }))}
                          placeholder="e.g. Missing learning objectives, incomplete lessons..."
                          className="w-full text-xs p-2.5 rounded-lg glass-input text-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {/* ── Course Manager ── */}
        {activeTab === 'course_manager' && (
          <AdminCourseManager
            currentUser={currentUser}
            courses={courses}
            users={users}
            onRefresh={onRefreshData}
            triggerToast={triggerToast}
          />
        )}

        {/* ── Moderation ── */}
        {activeTab === 'moderation' && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold uppercase text-slate-300">Published Course Moderation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courses.map(course => (
                <div key={course.id} className="p-4 rounded-xl glass-card flex justify-between items-center gap-4 hover:border-white/20 transition-all duration-300">
                  <div className="text-left">
                    <span className="text-[9px] font-mono font-bold text-amber-500 bg-amber-500/5 mr-2 px-1.5 rounded uppercase border border-amber-500/10">
                      {course.category}
                    </span>
                    <h4 className="text-xs font-bold leading-snug text-slate-200 mt-1">{course.title}</h4>
                    <p className="text-[10px] text-slate-500">Instructor: {course.instructorName} • ${course.price}</p>
                  </div>
                  <button
                    onClick={() => onDeleteCourse(course.id)}
                    className="p-2 border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500 hover:text-white rounded text-rose-400 cursor-pointer"
                    title="Delete Course"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Activity Logs ── */}
        {activeTab === 'activity_logs' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase text-slate-300 font-sans">Live Activity Audit Trails</h3>
              <button
                onClick={onClearLogs}
                className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-[10px] font-bold text-slate-350 cursor-pointer transition-colors"
              >
                Clear Audit Trail
              </button>
            </div>
            <div className="p-4 border border-white/10 bg-white/[0.01] rounded-xl space-y-2.5 max-h-[350px] overflow-y-auto font-mono text-left">
              {logs.map((log, idx) => (
                <div key={idx} className="p-3 bg-white/[0.02] rounded-lg border border-white/5 flex items-start gap-4 justify-between hover:bg-white/[0.04] text-xs transition-colors text-left font-sans">
                  <div className="flex gap-2">
                    <span className="text-blue-400 font-mono font-bold shrink-0">[INFO]</span>
                    <span className="text-slate-300 leading-relaxed text-left">{log.text}</span>
                  </div>
                  <span className="text-slate-500 text-[10px] shrink-0">{log.time?.replace('T', ' ').substring(0, 19)} UTC</span>
                </div>
              ))}
              {logs.length === 0 && (
                <div className="p-4 text-center text-slate-600 italic text-xs">No audit logs recorded yet.</div>
              )}
            </div>
          </div>
        )}

        {/* ── Site CMS ── */}
        {activeTab === 'site_cms' && (
          <SiteCMSDashboard currentUser={currentUser} triggerToast={triggerToast} onContentChange={onCmsChange} />
        )}

        {/* ── Site Bulletin ── */}
        {activeTab === 'bulletin' && (
          <SiteNoticeTab
            currentUser={currentUser}
            triggerToast={triggerToast}
            onNoticeChange={onNoticeChange}
          />
        )}

        {/* ── Theme Editor ── */}
        {activeTab === 'theme' && (
          <ThemeEditorTab triggerToast={triggerToast} />
        )}

      </div>
    </div>
  );
}
