import React, { useState } from 'react';
import { AlertCircle, Eye, EyeOff, ShieldAlert } from 'lucide-react';

interface Props {
  user: { name: string; email: string };
  getAuthHeaders: () => Record<string, string>;
  onDone: () => void | Promise<void>;
  onSignOut: () => void | Promise<void>;
}

/** Full-screen gate shown to accounts flagged mustChangePassword. */
export default function ForceChangePassword({ user, getAuthHeaders, onDone, onSignOut }: Props) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (next.length < 8) { setError('New password must be at least 8 characters.'); return; }
    if (next === current) { setError('New password must be different from the current one.'); return; }
    if (next !== confirm) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      const r = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        credentials: 'include',
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      const d = await r.json().catch(() => ({}));
      if (r.ok && d.status === 'success') { await onDone(); return; }
      setError(d.error || 'Could not change password.');
    } catch {
      setError('Connection error. Please try again.');
    }
    setLoading(false);
  };

  const cls = 'w-full text-sm p-3 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/60 transition-colors';
  const lbl = 'block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono';

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md p-8 rounded-3xl bg-[#0d1526]/90 border border-slate-800/80 shadow-2xl space-y-5">
        <div className="space-y-2 text-center">
          <ShieldAlert className="w-9 h-9 text-amber-400 mx-auto" />
          <h1 className="text-xl font-extrabold text-white">Set a new password</h1>
          <p className="text-slate-400 text-xs leading-relaxed">
            Hi {user.name}, your account ({user.email}) is using a temporary password.
            Choose a new one to continue.
          </p>
        </div>
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" /><span>{error}</span>
          </div>
        )}
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className={lbl}>Current (temporary) password</label>
            <input type={show ? 'text' : 'password'} value={current} onChange={e => setCurrent(e.target.value)} required autoFocus autoComplete="current-password" className={cls} />
          </div>
          <div>
            <label className={lbl}>New password</label>
            <input type={show ? 'text' : 'password'} value={next} onChange={e => setNext(e.target.value)} required minLength={8} autoComplete="new-password" placeholder="At least 8 characters" className={cls} />
          </div>
          <div>
            <label className={lbl}>Confirm new password</label>
            <input type={show ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)} required minLength={8} autoComplete="new-password" className={cls} />
          </div>
          <button type="button" onClick={() => setShow(v => !v)} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 cursor-pointer">
            {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />} {show ? 'Hide' : 'Show'} passwords
          </button>
          <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-extrabold text-sm cursor-pointer transition-all">
            {loading ? 'Saving…' : 'Update password & continue'}
          </button>
        </form>
        <button onClick={() => onSignOut()} className="w-full text-xs text-slate-500 hover:text-slate-300 cursor-pointer">Sign out</button>
      </div>
    </div>
  );
}
