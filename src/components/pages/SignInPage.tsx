import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Eye, EyeOff, ArrowRight, Mail, ArrowLeft } from 'lucide-react';

interface SignInPageProps {
  onLogin: (email: string, password: string, remember: boolean) => Promise<{ success: boolean; error?: string }>;
  onNavigateRegister: () => void;
  onNavigateHome: () => void;
}

type View = 'signin' | 'forgot' | 'forgot_sent' | 'reset' | 'reset_done';

export default function SignInPage({ onLogin, onNavigateRegister, onNavigateHome }: SignInPageProps) {
  const [view, setView]             = useState<View>('signin');
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [remember, setRemember]     = useState(false);
  const [showPw, setShowPw]         = useState(false);
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  // Reset password state
  const [resetToken, setResetToken]   = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPw, setConfirmPw]     = useState('');
  const [showNewPw, setShowNewPw]     = useState(false);
  const [resetError, setResetError]   = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  // On mount: detect ?reset=TOKEN in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('reset');
    if (token) {
      setResetToken(token);
      setView('reset');
      // Clean URL without reloading
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await onLogin(email, password, remember);
    if (!result.success) setError(result.error || 'Login failed. Please check your credentials.');
    setLoading(false);
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotLoading(true);
    try {
      const resp = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await resp.json();
      if (data.status === 'success') {
        setView('forgot_sent');
      } else {
        setForgotError(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setForgotError('Connection error. Please try again.');
    }
    setForgotLoading(false);
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPw) { setResetError("Passwords don't match"); return; }
    if (newPassword.length < 6) { setResetError("Password must be at least 6 characters"); return; }
    setResetError('');
    setResetLoading(true);
    try {
      const resp = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, password: newPassword }),
      });
      const data = await resp.json();
      if (data.status === 'success') {
        setView('reset_done');
      } else {
        setResetError(data.error || 'Reset failed. The link may have expired.');
      }
    } catch {
      setResetError('Connection error. Please try again.');
    }
    setResetLoading(false);
  };

  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center px-4 py-16 relative">
      {/* Ambient glows */}
      <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">

        {/* Logo + heading */}
        <div className="text-center mb-8">
          <button onClick={onNavigateHome} className="inline-flex items-center gap-2.5 mb-5 cursor-pointer group">
            <img
              src="/dma-logo.png"
              alt="DMA Academy"
              className="w-12 h-12 object-contain drop-shadow-[0_0_10px_rgba(37,99,235,0.7)] group-hover:drop-shadow-[0_0_16px_rgba(37,99,235,0.9)] transition-all"
            />
            <span className="text-lg font-extrabold text-white group-hover:text-blue-300 transition-colors">DMA Academy</span>
          </button>
          <h1 className="text-2xl font-extrabold text-white mb-1.5">
            {view === 'signin' ? 'Welcome Back'
              : view === 'forgot' ? 'Reset Password'
              : view === 'forgot_sent' ? 'Check Your Email'
              : view === 'reset' ? 'Choose New Password'
              : 'Password Updated'}
          </h1>
          <p className="text-slate-400 text-sm">
            {view === 'signin' ? 'Sign in to continue your learning journey'
              : view === 'forgot' ? "Enter your email and we'll send a reset link"
              : view === 'forgot_sent' ? 'A password reset link is on its way'
              : view === 'reset' ? 'Enter a new password for your account'
              : 'You can now sign in with your new password'}
          </p>
        </div>

        {/* Card */}
        <div className="p-8 rounded-3xl bg-[#0d1526]/90 border border-slate-800/80 shadow-2xl backdrop-blur-sm space-y-5">

          {/* ── Sign In view ── */}
          {view === 'signin' && (
            <>
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs animate-fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoFocus
                    placeholder="your@email.com"
                    className="w-full text-sm p-3 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/60 transition-colors"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Password</label>
                    <button
                      type="button"
                      onClick={() => { setForgotEmail(email); setView('forgot'); }}
                      className="text-[10px] text-[#00aaff] hover:text-[#00ddff] font-bold transition-colors cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      placeholder="Enter your password"
                      className="w-full text-sm p-3 pr-10 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/60 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer transition-colors"
                    >
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember me */}
                <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => setRemember(r => !r)}>
                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${remember ? 'bg-blue-600 border-blue-500' : 'border-slate-600 bg-white/5 hover:border-slate-400'}`}>
                    {remember && <CheckCircle className="w-3 h-3 text-white" />}
                  </div>
                  <span className="text-xs text-slate-400 hover:text-slate-300 transition-colors">Remember me for 30 days</span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-extrabold text-sm cursor-pointer transition-all shadow-lg shadow-blue-900/30 disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Signing in…</>
                  ) : (
                    <>Sign In <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </form>

              {/* Register link */}
              <div className="text-center border-t border-slate-800 pt-4">
                <p className="text-xs text-slate-500">
                  Don't have an account?{' '}
                  <button onClick={onNavigateRegister} className="text-[#00aaff] hover:text-[#00ddff] font-extrabold cursor-pointer transition-colors">
                    Create one free →
                  </button>
                </p>
              </div>
            </>
          )}

          {/* ── Forgot Password view ── */}
          {view === 'forgot' && (
            <>
              {forgotError && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{forgotError}</span>
                </div>
              )}

              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">Your Email Address</label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    required
                    autoFocus
                    placeholder="your@email.com"
                    className="w-full text-sm p-3 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/60 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-extrabold text-sm cursor-pointer transition-all shadow-lg shadow-blue-900/30 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {forgotLoading ? (
                    <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Sending…</>
                  ) : (
                    <><Mail className="w-4 h-4" /> Send Reset Link</>
                  )}
                </button>
              </form>

              <div className="text-center border-t border-slate-800 pt-4">
                <button onClick={() => setView('signin')} className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer">
                  <ArrowLeft className="w-3 h-3" /> Back to Sign In
                </button>
              </div>
            </>
          )}

          {/* ── Reset Password view ── */}
          {view === 'reset' && (
            <>
              {resetError && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{resetError}</span>
                </div>
              )}

              <form onSubmit={handleResetSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPw ? 'text' : 'password'}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                      autoFocus
                      placeholder="At least 6 characters"
                      className="w-full text-sm p-3 pr-10 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/60 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                    >
                      {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPw}
                    onChange={e => setConfirmPw(e.target.value)}
                    required
                    placeholder="Repeat password"
                    className="w-full text-sm p-3 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/60 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-extrabold text-sm cursor-pointer transition-all shadow-lg shadow-blue-900/30 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {resetLoading ? (
                    <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Updating…</>
                  ) : (
                    <>Set New Password <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </form>
            </>
          )}

          {/* ── Reset Done confirmation ── */}
          {view === 'reset_done' && (
            <>
              <div className="flex flex-col items-center gap-4 py-4 text-center">
                <div className="w-14 h-14 rounded-full bg-green-600/15 border border-green-500/30 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-white font-extrabold text-sm">Password updated!</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">Your password has been changed. You can now sign in with your new credentials.</p>
                </div>
              </div>

              <button
                onClick={() => setView('signin')}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-extrabold text-sm cursor-pointer transition-all flex items-center justify-center gap-2"
              >
                Sign In Now <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}

          {/* ── Forgot Sent confirmation ── */}
          {view === 'forgot_sent' && (
            <>
              <div className="flex flex-col items-center gap-4 py-4 text-center">
                <div className="w-14 h-14 rounded-full bg-blue-600/15 border border-blue-500/30 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-blue-400" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-white font-extrabold text-sm">Reset link sent!</h3>
                  <p className="text-slate-400 text-xs leading-relaxed max-w-xs">
                    If <span className="text-white font-bold">{forgotEmail}</span> is registered, you'll receive a password reset email within a few minutes. Check your spam folder too.
                  </p>
                  <p className="text-slate-500 text-[10px]">The link expires in 1 hour.</p>
                </div>
              </div>

              <div className="text-center border-t border-slate-800 pt-4">
                <button onClick={() => setView('signin')} className="inline-flex items-center gap-1 text-xs text-[#00aaff] hover:text-[#00ddff] font-bold transition-colors cursor-pointer">
                  <ArrowLeft className="w-3 h-3" /> Back to Sign In
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
