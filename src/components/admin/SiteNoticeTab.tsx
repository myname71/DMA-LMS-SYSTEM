import React, { useEffect, useState } from 'react';
import { Megaphone, RefreshCw, Save, Trash2 } from 'lucide-react';
import { getAuthHeaders } from '../../lib/session';

interface SiteNoticeTabProps {
  currentUser: any;
  triggerToast: (msg: string, type?: 'success' | 'warn') => void;
  onNoticeChange: (notice: any | null) => void;
}

const EMPTY_NOTICE = {
  title: 'Site Notice',
  message: '',
  linkLabel: '',
  linkUrl: '',
  enabled: true,
};

export default function SiteNoticeTab({ currentUser, triggerToast, onNoticeChange }: SiteNoticeTabProps) {
  const [notice, setNotice] = useState<any>(EMPTY_NOTICE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadNotice = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/site-notice');
      const data = await response.json();
      setNotice(data ? { ...EMPTY_NOTICE, ...data } : EMPTY_NOTICE);
    } catch {
      triggerToast('Failed to load the site bulletin.', 'warn');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadNotice(); }, []);

  const saveNotice = async () => {
    if (notice.enabled && !notice.message.trim()) {
      triggerToast('Add a bulletin message before publishing.', 'warn');
      return;
    }
    setSaving(true);
    try {
      const response = await fetch('/api/site-notice', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(notice),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Save failed');
      setNotice(data.notice);
      onNoticeChange(data.notice);
      triggerToast('Site bulletin published.', 'success');
    } catch (error: any) {
      triggerToast(error.message || 'Could not publish the bulletin.', 'warn');
    } finally {
      setSaving(false);
    }
  };

  const clearNotice = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/site-notice', {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Clear failed');
      setNotice(EMPTY_NOTICE);
      onNoticeChange(null);
      triggerToast('Site bulletin cleared.', 'success');
    } catch {
      triggerToast('Could not clear the bulletin.', 'warn');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-16 flex items-center justify-center text-slate-400 text-sm"><RefreshCw className="w-4 h-4 animate-spin mr-2" /> Loading bulletin...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-amber-400" /> Site Bulletin
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Publish one important notice beneath the top navigation for all visitors. Admins and super admins can update or clear it.
          </p>
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${notice.enabled && notice.message ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-slate-500 bg-white/5 border-white/10'}`}>
          {notice.enabled && notice.message ? 'Live on site' : 'Not published'}
        </span>
      </div>

      <div className="p-4 rounded-xl border border-amber-500/15 bg-amber-500/[0.04] space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="space-y-1">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bulletin label</span>
            <input value={notice.title || ''} onChange={e => setNotice({ ...notice, title: e.target.value })} placeholder="Site Notice" className="w-full text-xs p-2.5 rounded-lg glass-input text-white" />
          </label>
          <label className="flex items-center gap-2 self-end pb-2 text-xs text-slate-300 cursor-pointer">
            <input type="checkbox" checked={notice.enabled !== false} onChange={e => setNotice({ ...notice, enabled: e.target.checked })} className="accent-amber-500" />
            Show this bulletin on the public site
          </label>
        </div>

        <label className="block space-y-1">
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Notice message</span>
          <textarea value={notice.message || ''} onChange={e => setNotice({ ...notice, message: e.target.value })} rows={3} maxLength={500} placeholder="Example: Applications for the next Digital Twin cohort close on 30 September." className="w-full text-xs p-2.5 rounded-lg glass-input text-white resize-none" />
          <span className="block text-right text-[10px] text-slate-600">{(notice.message || '').length}/500</span>
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="space-y-1">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Optional link label</span>
            <input value={notice.linkLabel || ''} onChange={e => setNotice({ ...notice, linkLabel: e.target.value })} placeholder="View details" className="w-full text-xs p-2.5 rounded-lg glass-input text-white" />
          </label>
          <label className="space-y-1">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Optional link URL</span>
            <input value={notice.linkUrl || ''} onChange={e => setNotice({ ...notice, linkUrl: e.target.value })} placeholder="https://..." className="w-full text-xs p-2.5 rounded-lg glass-input text-white" />
          </label>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-[10px] text-slate-500">Last edited by {notice.updatedByName || currentUser?.name || 'you'}.</p>
        <div className="flex gap-2">
          <button onClick={clearNotice} disabled={saving} className="px-3 py-2 rounded-lg border border-rose-500/20 bg-rose-500/10 text-rose-400 text-xs font-bold hover:bg-rose-500/20 disabled:opacity-40 cursor-pointer flex items-center gap-1.5">
            <Trash2 className="w-3.5 h-3.5" /> Clear
          </button>
          <button onClick={saveNotice} disabled={saving} className="px-4 py-2 rounded-lg border border-amber-500/30 bg-amber-500/20 text-amber-300 text-xs font-bold hover:bg-amber-500/30 disabled:opacity-40 cursor-pointer flex items-center gap-1.5">
            {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {saving ? 'Publishing...' : 'Publish Bulletin'}
          </button>
        </div>
      </div>
    </div>
  );
}