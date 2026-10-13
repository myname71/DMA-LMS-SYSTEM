import React, { useState } from 'react';
import { AlertCircle, CheckCircle, ArrowLeft, Mail } from 'lucide-react';

interface ForgotPasswordPageProps {
  onNavigateSignIn: () => void;
  onNavigateHome: () => void;
  initialEmail?: string;
}

export default function ForgotPasswordPage({ onNavigateSignIn, onNavigateHome, initialEmail = '' }: ForgotPasswordPageProps) {
  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const resp = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await resp.json().catch(() => ({}));
      if (resp.ok && data.status === 'success') setSent(true);
      else setError(data.error || 'Something went wrong. Please try again.');
    } catch {
      setError('Connection error. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center px-4 py-16 relative">
      <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <button onClick={onNavigateHome} className="inline-flex items-center gap-2.5 mb-5 cursor-pointer group">
            <img src="/dma-logo.png" alt="DMA Academy" className="w-12 h-12 object-contain drop-shadow-[0_0_10px_rgba(37,99,235,0.7)]" />
            <span className="text-lg font-extrabold text-white group-hover:text-blue-300 transition-colors">DMA Academy</span>
          </button>
          <h1 className="text-2xl font-extrabold text-white mb-1.5">Forgot your password?</h1>
          <p className="text-slate-400 text-sm">Enter your account email and we'll send you a reset link.</p>
        </div>

        <div className="p-8 rounded-3xl bg-[#0d1526]/90 border border-slate-800/80 shadow-2xl backdrop-blur-sm space-y-5">
          {sent ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-teal-500/10 border border-teal-500/20 rounded-xl text-teal-300 text-xs">
                <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">Check your inbox</p>
                  <p className="text-teal-300/80 leading-relaxed">
                    If an account exists for <span className="font-mono">{email.trim()}</span>, a password reset link is on its way.
                    The link expires in 60 minutes. Don't forget to check your spam folder.
                  </p>
                </div>
              </div>
              <button onClick={onNavigateSignIn} className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm cursor-pointer transition-all">
                Back to Sign In
              </button>
            </div>
          ) : (
            <>
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">
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
                    autoComplete="email"
                    placeholder="your@email.com"
                    className="w-full text-sm p-3 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/60 transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-extrabold text-sm cursor-pointer transition-all shadow-lg shadow-blue-900/30 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Sending…</>
                  ) : (
                    <><Mail className="w-4 h-4" /> Send reset link</>
                  )}
                </button>
              </form>
              <div className="text-center border-t border-slate-800 pt-4">
                <button onClick={onNavigateSignIn} className="inline-flex items-center gap-1.5 text-xs text-[#00aaff] hover:text-[#00ddff] font-bold cursor-pointer transition-colors">
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
