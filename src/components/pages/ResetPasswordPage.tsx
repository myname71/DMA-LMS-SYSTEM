import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';

interface ResetPasswordPageProps {
  token: string;
  onNavigateSignIn: () => void;
  onNavigateForgot: () => void;
  onNavigateHome: () => void;
}

export default function ResetPasswordPage({ token, onNavigateSignIn, onNavigateForgot, onNavigateHome }: ResetPasswordPageProps) {
  const [status, setStatus] = useState<'checking' | 'valid' | 'invalid' | 'done'>('checking');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch(`/api/auth/reset-password/validate?token=${encodeURIComponent(token)}`);
        const d = await r.json();
        if (!cancelled) setStatus(d.valid ? 'valid' : 'invalid');
      } catch {
        if (!cancelled) setStatus('invalid');
      }
    })();
    return () => { cancelled = true; };
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      const resp = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await resp.json().catch(() => ({}));
      if (resp.ok && data.status === 'success') {
        setStatus('done');
      } else {
        setError(data.error || 'Could not reset password.');
        if (resp.status === 400 && /expired|invalid/i.test(data.error || '')) setStatus('invalid');
      }
    } catch {
      setError('Connection error. Please try again.');
    }
    setLoading(false);
  };

  const inputCls = 'w-full text-sm p-3 pr-10 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/60 transition-colors';

  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center px-4 py-16 relative">
      <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <button onClick={onNavigateHome} className="inline-flex items-center gap-2.5 mb-5 cursor-pointer group">
            <img src="/dma-logo.png" alt="DMA Academy" className="w-12 h-12 object-contain drop-shadow-[0_0_10px_rgba(37,99,235,0.7)]" />
            <span className="text-lg font-extrabold text-white group-hover:text-blue-300 transition-colors">DMA Academy</span>
          </button>
          <h1 className="text-2xl font-extrabold text-white mb-1.5">Choose a new password</h1>
        </div>

        <div className="p-8 rounded-3xl bg-[#0d1526]/90 border border-slate-800/80 shadow-2xl backdrop-blur-sm space-y-5">
          {status === 'checking' && (
            <div className="flex justify-center py-6"><div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /></div>
          )}

          {status === 'invalid' && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="leading-relaxed">This reset link is invalid or has expired. Reset links can only be used once and expire after 60 minutes.</p>
              </div>
              <button onClick={onNavigateForgot} className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm cursor-pointer transition-all">
                Request a new link
              </button>
            </div>
          )}

          {status === 'done' && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-teal-500/10 border border-teal-500/20 rounded-xl text-teal-300 text-xs">
                <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="leading-relaxed">Your password has been updated. You can now sign in with your new password.</p>
              </div>
              <button onClick={onNavigateSignIn} className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm cursor-pointer transition-all">
                Go to Sign In
              </button>
            </div>
          )}

          {status === 'valid' && (
            <>
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">New Password</label>
                  <div className="relative">
                    <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                      required minLength={8} autoFocus autoComplete="new-password" placeholder="At least 8 characters" className={inputCls} />
                    <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">Confirm Password</label>
                  <input type={showPw ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)}
                    required minLength={8} autoComplete="new-password" placeholder="Repeat your new password" className={inputCls} />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-extrabold text-sm cursor-pointer transition-all shadow-lg shadow-blue-900/30 disabled:opacity-60 flex items-center justify-center gap-2">
                  {loading ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Saving…</> : 'Update password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
