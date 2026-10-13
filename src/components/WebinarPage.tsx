import React, { useState, useEffect } from 'react';
import {
  Megaphone, Plus, Trash2, Pin, Video, Bell, BookOpen,
  RefreshCw, Calendar, ExternalLink, X, Search,
  ChevronDown
} from 'lucide-react';
import { getAuthHeaders } from '../lib/session';

interface WebinarPost {
  id: string;
  title: string;
  content: string;
  type: 'webinar' | 'announcement' | 'update' | 'release';
  authorId: string;
  authorName: string;
  authorRole: string;
  scheduledAt?: string;
  meetLink?: string;
  tags: string[];
  createdAt: string;
  pinned: boolean;
  views: number;
}

interface WebinarPageProps {
  currentUser: any;
  triggerToast?: (msg: string, type?: 'success' | 'warn') => void;
}

const TYPE_CONFIG: Record<string, { label: string; color: string; emoji: string }> = {
  webinar:      { label: 'Live Webinar',      color: 'text-violet-400 bg-violet-500/10 border-violet-500/25', emoji: '🎥' },
  announcement: { label: 'Announcement',      color: 'text-blue-400 bg-blue-500/10 border-blue-500/25',     emoji: '📢' },
  update:       { label: 'Platform Update',   color: 'text-teal-400 bg-teal-500/10 border-teal-500/25',     emoji: '🔔' },
  release:      { label: 'Course Release',    color: 'text-amber-400 bg-amber-500/10 border-amber-500/25',  emoji: '📚' },
};

const ROLE_BADGE: Record<string, { label: string; color: string; icon: string }> = {
  super_admin: { label: 'Super Admin', color: 'text-amber-400 bg-amber-500/10 border-amber-500/25', icon: '👑' },
  admin:       { label: 'Admin',       color: 'text-blue-400 bg-blue-500/10 border-blue-500/25',   icon: '🛡️' },
  instructor:  { label: 'Instructor',  color: 'text-teal-400 bg-teal-500/10 border-teal-500/25',   icon: '👨‍🏫' },
  student:     { label: 'Student',     color: 'text-slate-400 bg-slate-500/10 border-slate-500/25',icon: '🎓' },
};

const EMPTY_FORM = { title: '', content: '', type: 'announcement', meetLink: '', scheduledAt: '', tags: '' };

export default function WebinarPage({ currentUser, triggerToast }: WebinarPageProps) {
  const [posts, setPosts]         = useState<WebinarPost[]>([]);
  const [filterType, setFilterType] = useState('all');
  const [searchQ, setSearchQ]     = useState('');
  const [showForm, setShowForm]   = useState(false);
  const [loading, setLoading]     = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm]           = useState(EMPTY_FORM);

  const canPost     = currentUser && ['admin', 'super_admin', 'instructor'].includes(currentUser.role);
  const canModerate = currentUser && ['admin', 'super_admin'].includes(currentUser.role);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/webinars');
      if (r.ok) { const d = await r.json(); setPosts(d.posts || []); }
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;
    setSubmitting(true);
    try {
      const r = await fetch('/api/webinars/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        credentials: 'include',
        body: JSON.stringify({ ...form, tags: form.tags.split(',').map((t: string) => t.trim()).filter(Boolean) }),
      });
      const d = await r.json();
      if (d.status === 'success') {
        await fetchPosts();
        setForm(EMPTY_FORM);
        setShowForm(false);
        triggerToast?.('Post published!');
      } else { triggerToast?.(d.error || 'Failed to post', 'warn'); }
    } catch { triggerToast?.('Connection error', 'warn'); }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Remove this post?')) return;
    try {
      const r = await fetch(`/api/webinars/${id}`, { method: 'DELETE', headers: getAuthHeaders(), credentials: 'include' });
      if ((await r.json()).status === 'success') { await fetchPosts(); triggerToast?.('Post removed.', 'warn'); }
    } catch {}
  };

  const handlePin = async (id: string) => {
    try {
      await fetch(`/api/webinars/${id}/pin`, { method: 'POST', headers: getAuthHeaders(), credentials: 'include' });
      await fetchPosts();
    } catch {}
  };

  const formatDate = (d: string) => {
    const date = new Date(d), now = new Date();
    const hours = Math.floor((now.getTime() - date.getTime()) / 3600000);
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (hours < 168) return `${Math.floor(hours / 24)}d ago`;
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const filtered = posts
    .filter(p => filterType === 'all' || p.type === filterType)
    .filter(p => !searchQ || p.title.toLowerCase().includes(searchQ.toLowerCase()) || p.content.toLowerCase().includes(searchQ.toLowerCase()));
  const sorted = [...filtered.filter(p => p.pinned), ...filtered.filter(p => !p.pinned)];

  return (
    <div className="pt-24 pb-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">

      {/* ── Hero Header ── */}
      <div className="mb-10 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-5">
        <div>
          <span className="text-[10px] font-bold text-[#00aaff] uppercase font-mono tracking-widest block mb-1">Platform Board</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-2">Webinars &amp; Updates</h1>
          <p className="text-slate-400 text-sm max-w-lg leading-relaxed">
            Live sessions, announcements, and course releases from our instructors and academy team.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={fetchPosts} title="Refresh" className="p-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:border-slate-600 transition-all cursor-pointer">
            <RefreshCw className="w-4 h-4" />
          </button>
          {canPost && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold cursor-pointer transition-all shadow-lg shadow-blue-900/30"
            >
              <Plus className="w-4 h-4" />
              New Post
            </button>
          )}
        </div>
      </div>

      {/* ── Create Post Form ── */}
      {showForm && canPost && (
        <div className="mb-8 p-6 rounded-2xl border border-blue-500/25 bg-blue-500/5 backdrop-blur-sm space-y-4 animate-fade-in">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-extrabold text-white">Create Post</h3>
            <button onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }} className="text-slate-500 hover:text-white cursor-pointer transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Post Type</label>
                <select
                  value={form.type}
                  onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white cursor-pointer"
                >
                  <option value="announcement">📢 Announcement</option>
                  <option value="webinar">🎥 Live Webinar</option>
                  <option value="update">🔔 Platform Update</option>
                  <option value="release">📚 Course Release</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Tags <span className="normal-case text-slate-500">(comma-separated)</span></label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                  placeholder="Industry 4.0, Digital Twin, PLC…"
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/60"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                required
                placeholder="e.g. Live Webinar: Introduction to Digital Twins"
                className="w-full text-sm p-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/60"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Content *</label>
              <textarea
                value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                required
                rows={4}
                placeholder="Share session details, updates, or important announcements for the community…"
                className="w-full text-sm p-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-600 resize-none focus:outline-none focus:border-blue-500/60"
              />
            </div>

            {form.type === 'webinar' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Scheduled Date &amp; Time</label>
                  <input
                    type="datetime-local"
                    value={form.scheduledAt}
                    onChange={e => setForm(f => ({ ...f, scheduledAt: e.target.value }))}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Meeting Link</label>
                  <input
                    type="url"
                    value={form.meetLink}
                    onChange={e => setForm(f => ({ ...f, meetLink: e.target.value }))}
                    placeholder="https://meet.google.com/…"
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/60"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-1">
              <button type="button" onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }} className="px-4 py-2 text-xs font-bold text-slate-400 border border-slate-700 rounded-xl hover:text-white hover:border-slate-600 cursor-pointer transition-all">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold rounded-xl cursor-pointer transition-all disabled:opacity-50 shadow-lg shadow-blue-900/30">
                {submitting ? 'Publishing…' : 'Publish Post'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Filter + Search Bar ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-7">
        <div className="flex gap-2 overflow-x-auto pb-1 flex-1">
          {[
            { id: 'all',          label: 'All Posts' },
            { id: 'webinar',      label: '🎥 Webinars' },
            { id: 'announcement', label: '📢 Announcements' },
            { id: 'update',       label: '🔔 Updates' },
            { id: 'release',      label: '📚 Releases' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition-all border ${
                filterType === f.id
                  ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-900/30'
                  : 'text-slate-400 border-slate-800 hover:border-slate-600 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative sm:w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
            placeholder="Search posts…"
            className="w-full text-xs pl-8 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50"
          />
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Total Posts', value: posts.length, color: 'text-blue-400' },
          { label: 'Webinars', value: posts.filter(p => p.type === 'webinar').length, color: 'text-violet-400' },
          { label: 'Announcements', value: posts.filter(p => p.type === 'announcement').length, color: 'text-amber-400' },
          { label: 'Updates', value: posts.filter(p => p.type === 'update' || p.type === 'release').length, color: 'text-teal-400' },
        ].map(stat => (
          <div key={stat.label} className="p-4 rounded-xl border border-slate-800 bg-[#0d1526] text-center">
            <p className={`text-2xl font-extrabold ${stat.color}`}>{stat.value}</p>
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* ── Posts Feed ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-xs font-mono uppercase tracking-wider">Loading posts…</p>
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-4">
            <Megaphone className="w-8 h-8 text-slate-700" />
          </div>
          <h3 className="text-white font-extrabold text-base mb-1">No posts yet</h3>
          <p className="text-slate-500 text-sm">
            {canPost ? 'Be the first to post an update for the community.' : 'Check back soon for announcements and webinar sessions.'}
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {sorted.map(post => {
            const tc = TYPE_CONFIG[post.type] || TYPE_CONFIG.announcement;
            const rc = ROLE_BADGE[post.authorRole] || ROLE_BADGE.student;
            const initials = post.authorName?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || '?';

            return (
              <article
                key={post.id}
                className={`p-6 rounded-2xl border bg-[#0d1526] transition-all group ${
                  post.pinned ? 'border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.06)]' : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-extrabold text-sm shrink-0 border border-white/10">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-extrabold text-white truncate">{post.authorName}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${rc.color}`}>
                          {rc.icon} {rc.label}
                        </span>
                        {post.pinned && (
                          <span className="text-[10px] font-bold text-blue-400 flex items-center gap-0.5">
                            <Pin className="w-2.5 h-2.5" /> Pinned
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">{formatDate(post.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border whitespace-nowrap ${tc.color}`}>
                      {tc.emoji} {tc.label}
                    </span>
                    {canModerate && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handlePin(post.id)}
                          title={post.pinned ? 'Unpin' : 'Pin post'}
                          className="p-1.5 rounded-lg border border-slate-800 hover:border-blue-500/50 text-slate-600 hover:text-blue-400 transition-all cursor-pointer"
                        >
                          <Pin className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(post.id)}
                          title="Delete post"
                          className="p-1.5 rounded-lg border border-slate-800 hover:border-red-500/50 text-slate-600 hover:text-red-400 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Content */}
                <h2 className="text-base font-extrabold text-white mb-2 leading-snug">{post.title}</h2>
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{post.content}</p>

                {/* Webinar details card */}
                {post.type === 'webinar' && (post.scheduledAt || post.meetLink) && (
                  <div className="mt-4 p-3.5 rounded-xl bg-violet-500/5 border border-violet-500/15 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    {post.scheduledAt && (
                      <div className="flex items-center gap-1.5 text-xs text-violet-300 font-mono">
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        {new Date(post.scheduledAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
                      </div>
                    )}
                    {post.meetLink && (
                      <a
                        href={post.meetLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 font-extrabold transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Join Session →
                      </a>
                    )}
                  </div>
                )}

                {/* Tags */}
                {post.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {post.tags.map((tag: string, i: number) => (
                      <span key={i} className="text-[10px] font-mono text-slate-500 bg-slate-800/60 border border-slate-700/50 px-2 py-0.5 rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {/* ── Sign-up CTA for guests ── */}
      {!currentUser && (
        <div className="mt-12 p-6 rounded-2xl border border-[#00aaff]/20 bg-[#00aaff]/5 text-center">
          <p className="text-white font-extrabold text-base mb-1">Join the community</p>
          <p className="text-slate-400 text-sm mb-4">Register an account to receive webinar notifications and interact with the academy team.</p>
          <div className="flex items-center justify-center gap-3">
            <button className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold cursor-pointer transition-all">
              Register Free
            </button>
            <button className="px-5 py-2 rounded-xl border border-slate-700 hover:border-slate-500 text-slate-300 text-xs font-bold cursor-pointer transition-all">
              Sign In
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
