import React, { useState } from 'react';
import { AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';

interface LoginFormProps {
  onLogin: (email: string, password: string, remember: boolean) => Promise<string | null>;
  onSwitchToRegister: () => void;
  onForgotPassword?: () => void;
  onClose: () => void;
  demoUsers?: { label: string; email: string }[];
}

export default function LoginForm({ onLogin, onSwitchToRegister, onForgotPassword, onClose, demoUsers = [] }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState<string>('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError('Email is required'); return; }
    setError('');
    setLoading(true);
    const err = await onLogin(email.trim(), password, remember);
    setLoading(false);
    if (err) setError(err);
  };

  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('');
    setError('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {demoUsers.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Quick Demo Access</p>
          <div className="flex flex-wrap gap-1.5">
            {demoUsers.map(d => (
              <button
                key={d.email}
                type="button"
                onClick={() => fillDemo(d.email)}
                className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] font-semibold text-slate-300 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer"
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-1">
        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Email</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="w-full px-3 py-2.5 rounded-lg glass-input text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
          autoComplete="email"
        />
      </div>

      <div className="space-y-1">
        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Password</label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-3 py-2.5 pr-10 rounded-lg glass-input text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
          >
            {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          id="remember-me"
          type="checkbox"
          checked={remember}
          onChange={e => setRemember(e.target.checked)}
          className="w-3.5 h-3.5 rounded border-white/20 bg-white/5 text-blue-500 cursor-pointer"
        />
        <label htmlFor="remember-me" className="text-xs text-slate-400 cursor-pointer select-none">
          Keep me signed in
        </label>
        {onForgotPassword && (
          <button type="button" onClick={onForgotPassword} className="ml-auto text-xs text-blue-400 hover:underline cursor-pointer font-medium">
            Forgot your password?
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20">
          <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
      >
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</> : 'Sign In'}
      </button>

      <p className="text-center text-xs text-slate-500">
        Don't have an account?{' '}
        <button type="button" onClick={onSwitchToRegister} className="text-blue-400 hover:underline cursor-pointer font-medium">
          Register
        </button>
      </p>
    </form>
  );
}
