import React, { useState, useRef } from 'react';
import {
  CheckCircle, AlertCircle, Upload, FileText, X,
  ArrowRight, ArrowLeft, Shield, Zap, Star, Crown
} from 'lucide-react';

interface RegisterPageProps {
  onSuccess: (user: any, token: string) => void;
  onNavigateLogin: () => void;
  onNavigateHome: () => void;
  triggerToast?: (msg: string, type?: 'success' | 'warn') => void;
}

const PLANS = [
  {
    id: 'free',
    name: 'Free Learner',
    price: 0,
    period: 'forever',
    badge: 'Open Access',
    badgeStyle: 'bg-slate-700/80 text-slate-300',
    icon: <Zap className="w-4 h-4" />,
    accent: 'border-slate-700 hover:border-slate-600',
    activeAccent: 'border-slate-500 bg-slate-500/10',
    features: ['Course 101 – Digital Manufacturing', 'AI Tutor (demo mode)', 'Community access', 'Digital certificate'],
  },
  {
    id: 'basic',
    name: 'Academy Basic',
    price: 29,
    period: '/month',
    badge: 'Popular',
    badgeStyle: 'bg-blue-600/20 text-blue-400 border border-blue-500/30',
    icon: <Star className="w-4 h-4" />,
    accent: 'border-blue-800/60 hover:border-blue-700/60',
    activeAccent: 'border-blue-500 bg-blue-500/10',
    features: ['All published courses', 'Full AI Tutor access', 'Progress tracking', 'All certificates', 'Email support'],
  },
  {
    id: 'pro',
    name: 'Academy Pro',
    price: 79,
    period: '/month',
    badge: 'Best Value',
    badgeStyle: 'bg-teal-600/20 text-teal-400 border border-teal-500/30',
    icon: <Shield className="w-4 h-4" />,
    accent: 'border-teal-800/60 hover:border-teal-700/60',
    activeAccent: 'border-teal-500 bg-teal-500/10',
    features: ['Everything in Basic', 'Live webinar access', 'Priority support', 'Learning paths', 'Industry projects', 'API access'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 199,
    period: '/month',
    badge: 'Teams',
    badgeStyle: 'bg-amber-600/20 text-amber-400 border border-amber-500/30',
    icon: <Crown className="w-4 h-4" />,
    accent: 'border-amber-800/60 hover:border-amber-700/60',
    activeAccent: 'border-amber-500 bg-amber-500/10',
    features: ['Everything in Pro', 'Team management', 'Custom course catalog', 'Dedicated advisor', '99.9% SLA', 'White-label portal'],
  },
];

const SPECIALIZATIONS = [
  'Digital Twin Technology',
  'Robotics & PLC Programming',
  'Smart Factory & IoT',
  'Additive Manufacturing',
  'Industrial Analytics',
  'Circular Economy',
  'Cyber-Physical Systems',
  'Other',
];

const STEP_LABELS = ['Role', 'Details', 'Plan / Docs'];

export default function RegisterPage({ onSuccess, onNavigateLogin, onNavigateHome, triggerToast }: RegisterPageProps) {
  const [step, setStep]                   = useState(1);
  const [role, setRole]                   = useState<'student' | 'instructor'>('student');
  const [name, setName]                   = useState('');
  const [email, setEmail]                 = useState('');
  const [password, setPassword]           = useState('');
  const [confirmPw, setConfirmPw]         = useState('');
  const [selectedPlan, setSelectedPlan]   = useState('free');
  const [qualDoc, setQualDoc]             = useState<{ name: string; dataUrl: string; size: number } | null>(null);
  const [bio, setBio]                     = useState('');
  const [specialization, setSpecialization] = useState('');
  const [inviteToken, setInviteToken]     = useState('');
  const [error, setError]                 = useState('');
  const [loading, setLoading]             = useState(false);
  const [done, setDone]                   = useState(false);
  const fileRef                           = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ['application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg', 'image/png'];
    if (!allowed.includes(file.type)) { setError('Only PDF, DOC, DOCX, JPG or PNG files are accepted.'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('File must be under 5 MB.'); return; }
    const reader = new FileReader();
    reader.onload = ev => {
      setQualDoc({ name: file.name, dataUrl: ev.target?.result as string, size: file.size });
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirmPw)  { setError('Passwords do not match.'); return; }
    setError('');
    setStep(3);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const payload: any = {
        name, email, password, role,
        inviteToken: inviteToken || undefined,
        subscriptionPlan: role === 'student' ? selectedPlan : 'free',
        bio: bio || undefined,
        specialization: specialization || undefined,
        qualificationDoc: role === 'instructor' ? qualDoc : undefined,
      };
      const r = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const data = await r.json();
      if (data.status === 'success') {
        setDone(true);
        triggerToast?.(`Welcome to DMA Academy, ${data.user?.name || name}!`);
        setTimeout(() => onSuccess(data.user, data.token || ''), 2000);
      } else {
        setError(data.error || 'Registration failed. Please try again.');
      }
    } catch {
      setError('Connection error. Please try again.');
    }
    setLoading(false);
  };

  const fmtSize = (bytes: number) => bytes < 1048576 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1048576).toFixed(1)} MB`;

  if (done) {
    return (
      <div className="min-h-[calc(100vh-72px)] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full p-10 rounded-3xl bg-[#0d1526]/90 border border-slate-800/80 text-center space-y-5 shadow-2xl">
          <div className="w-20 h-20 rounded-full bg-teal-500/15 border-2 border-teal-500/40 flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-teal-400" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Account Created!</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            {role === 'instructor'
              ? "Your instructor account is active. You can create and publish free courses right away — signing you in now…"
              : "Your account is ready. Signing you in now…"}
          </p>
          <div className="flex items-center justify-center gap-2 text-blue-400 text-xs font-mono">
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center px-4 py-16 relative">
      {/* Ambient glows */}
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-teal-600/8 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-blue-600/8 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-2xl">

        {/* Logo + heading */}
        <div className="text-center mb-6">
          <button onClick={onNavigateHome} className="inline-flex items-center gap-2 mb-4 cursor-pointer group">
            <img src="/dma-logo.png" alt="DMA" className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(37,99,235,0.7)] group-hover:drop-shadow-[0_0_14px_rgba(37,99,235,0.9)] transition-all" />
            <span className="text-base font-extrabold text-white group-hover:text-blue-300 transition-colors">DMA Academy</span>
          </button>
          <h1 className="text-2xl font-extrabold text-white mb-1">Create Your Account</h1>
          <p className="text-slate-400 text-sm">British Council-funded digital manufacturing programme</p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {STEP_LABELS.map((label, i) => {
            const s = i + 1;
            const done = s < step, active = s === step;
            return (
              <React.Fragment key={s}>
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold border-2 transition-all ${
                    done   ? 'bg-blue-600 border-blue-500 text-white' :
                    active ? 'bg-blue-600/20 border-blue-500 text-blue-400' :
                             'bg-slate-900 border-slate-700 text-slate-600'
                  }`}>
                    {done ? <CheckCircle className="w-4 h-4" /> : s}
                  </div>
                  <span className={`text-[9px] font-bold uppercase tracking-wider hidden sm:block ${active ? 'text-blue-400' : 'text-slate-600'}`}>{label}</span>
                </div>
                {s < 3 && <div className={`h-px w-10 sm:w-16 transition-all ${s < step ? 'bg-blue-500' : 'bg-slate-800'}`} />}
              </React.Fragment>
            );
          })}
        </div>

        {/* Card */}
        <div className="p-7 sm:p-8 rounded-3xl bg-[#0d1526]/90 border border-slate-800/80 shadow-2xl backdrop-blur-sm">

          {error && (
            <div className="flex items-start gap-2 p-3 mb-5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* ─── Step 1: Role selection ─── */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-extrabold text-white mb-1">Choose Your Role</h2>
                <p className="text-slate-400 text-xs">How will you participate in the academy?</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(['student', 'instructor'] as const).map(r => (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    className={`p-6 rounded-2xl border-2 text-left transition-all cursor-pointer group ${
                      role === r
                        ? r === 'student' ? 'border-blue-500 bg-blue-500/10' : 'border-teal-500 bg-teal-500/10'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-3xl block mb-3">{r === 'student' ? '🎓' : '👨‍🏫'}</span>
                    <h3 className="text-sm font-extrabold text-white mb-2 capitalize">{r}</h3>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {r === 'student'
                        ? 'Access courses, track progress, and earn industry-recognised certificates.'
                        : 'Teach on the academy. Publish free courses instantly — paid courses go to admin review.'}
                    </p>
                    {role === r && (
                      <div className={`mt-3 flex items-center gap-1 text-xs font-bold ${r === 'student' ? 'text-blue-400' : 'text-teal-400'}`}>
                        <CheckCircle className="w-3.5 h-3.5" /> Selected
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 font-mono">Invite Code <span className="normal-case font-normal">(optional)</span></label>
                <input
                  type="text"
                  value={inviteToken}
                  onChange={e => setInviteToken(e.target.value)}
                  placeholder="Paste invite token if you have one…"
                  className="w-full text-xs p-3 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/60"
                />
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm cursor-pointer transition-all shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ─── Step 2: Account details ─── */}
          {step === 2 && (
            <form onSubmit={handleStep2} className="space-y-4">
              <div>
                <h2 className="text-lg font-extrabold text-white mb-1">Account Details</h2>
                <p className="text-slate-400 text-xs">Set up your {role === 'instructor' ? 'instructor' : 'student'} credentials</p>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">Full Name *</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required
                  placeholder="Dr. Alex Rivera"
                  className="w-full text-sm p-3 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/60 transition-colors" />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">Email Address *</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  placeholder="your@email.com"
                  className="w-full text-sm p-3 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/60 transition-colors" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">Password *</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                    placeholder="Min 6 characters"
                    className="w-full text-sm p-3 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/60 transition-colors" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">Confirm Password *</label>
                  <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} required
                    placeholder="Repeat password"
                    className="w-full text-sm p-3 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/60 transition-colors" />
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => { setStep(1); setError(''); }}
                  className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white text-sm font-bold cursor-pointer transition-all flex items-center gap-1.5">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm cursor-pointer transition-all flex items-center justify-center gap-2">
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* ─── Step 3: Plan (student) or Qualification (instructor) ─── */}
          {step === 3 && (
            <div className="space-y-5">
              {role === 'student' ? (
                <>
                  <div>
                    <h2 className="text-lg font-extrabold text-white mb-1">Choose Your Plan</h2>
                    <p className="text-slate-400 text-xs">Select the subscription that fits your goals. You can upgrade anytime from your dashboard.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {PLANS.map(plan => (
                      <button
                        key={plan.id}
                        onClick={() => setSelectedPlan(plan.id)}
                        className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                          selectedPlan === plan.id ? plan.activeAccent : plan.accent + ' bg-[#0a1020]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2.5">
                          <span className="text-xs font-extrabold text-white">{plan.name}</span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${plan.badgeStyle}`}>{plan.badge}</span>
                        </div>
                        <div className="mb-3">
                          <span className="text-xl font-extrabold text-white">{plan.price === 0 ? 'Free' : `$${plan.price}`}</span>
                          {plan.price > 0 && <span className="text-xs text-slate-400 ml-1">{plan.period}</span>}
                        </div>
                        <ul className="space-y-1">
                          {plan.features.map((f, i) => (
                            <li key={i} className="text-[10px] text-slate-400 flex items-start gap-1.5">
                              <CheckCircle className="w-3 h-3 text-teal-500 shrink-0 mt-0.5" />
                              {f}
                            </li>
                          ))}
                        </ul>
                        {selectedPlan === plan.id && (
                          <div className="mt-2.5 flex items-center gap-1 text-xs font-bold text-blue-400">
                            <CheckCircle className="w-3 h-3" /> Selected
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  {selectedPlan !== 'free' && (
                    <p className="text-[10px] text-slate-500 text-center">
                      💳 Billing is configured by admin after account creation. Your plan preference is saved.
                    </p>
                  )}
                </>
              ) : (
                <>
                  <div>
                    <h2 className="text-lg font-extrabold text-white mb-1">Instructor Profile</h2>
                    <p className="text-slate-400 text-xs">Add your qualifications (optional). Your account is active immediately.</p>
                  </div>

                  {/* Info banner */}
                  <div className="flex gap-2 p-3.5 bg-teal-500/8 border border-teal-500/20 rounded-xl text-teal-400 text-xs">
                    <Shield className="w-4 h-4 shrink-0 mt-0.5" />
                    <p>Instructor accounts are active immediately. You can create &amp; publish FREE courses right away; paid courses are reviewed by an admin.</p>
                  </div>

                  {/* File upload */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">
                      Qualification Document <span className="normal-case font-normal text-slate-500 ml-1">(optional)</span>
                      <span className="normal-case font-normal text-slate-600 ml-1">(PDF, DOC, DOCX, JPG, PNG — max 5 MB)</span>
                    </label>
                    <input type="file" ref={fileRef} onChange={handleFileUpload} accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" className="hidden" />
                    {qualDoc ? (
                      <div className="flex items-center gap-3 p-3.5 rounded-xl bg-teal-500/8 border border-teal-500/20">
                        <FileText className="w-5 h-5 text-teal-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-extrabold text-white truncate">{qualDoc.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{fmtSize(qualDoc.size)}</p>
                        </div>
                        <button
                          onClick={() => { setQualDoc(null); if (fileRef.current) fileRef.current.value = ''; }}
                          className="text-slate-500 hover:text-red-400 cursor-pointer transition-colors p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="w-full p-7 rounded-xl border-2 border-dashed border-slate-700 hover:border-blue-500/60 hover:bg-blue-500/5 text-slate-400 hover:text-white transition-all cursor-pointer flex flex-col items-center gap-2.5"
                      >
                        <Upload className="w-7 h-7" />
                        <div className="text-center">
                          <p className="text-xs font-extrabold">Click to upload qualification document</p>
                          <p className="text-[10px] text-slate-500 mt-1">Degree certificate, academic CV, or professional credentials</p>
                        </div>
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">Area of Specialization</label>
                    <select
                      value={specialization}
                      onChange={e => setSpecialization(e.target.value)}
                      className="w-full text-sm p-3 rounded-xl bg-slate-900/80 border border-slate-700 text-white cursor-pointer focus:outline-none focus:border-blue-500/60"
                    >
                      <option value="">Select your specialization…</option>
                      {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">Professional Bio</label>
                    <textarea
                      value={bio}
                      onChange={e => setBio(e.target.value)}
                      rows={3}
                      placeholder="Briefly describe your industry experience, academic background, and why you want to teach at DMA Academy…"
                      className="w-full text-sm p-3 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-600 resize-none focus:outline-none focus:border-blue-500/60 transition-colors"
                    />
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-1">
                <button onClick={() => { setStep(2); setError(''); }}
                  className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white text-sm font-bold cursor-pointer transition-all flex items-center gap-1.5">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-extrabold text-sm cursor-pointer transition-all flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg shadow-blue-900/30"
                >
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Creating Account…</>
                  ) : role === 'instructor' ? (
                    <>Create Account <ArrowRight className="w-4 h-4" /></>
                  ) : (
                    <>Register with {PLANS.find(p => p.id === selectedPlan)?.name} <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Footer link */}
          <div className="text-center border-t border-slate-800 pt-4 mt-4">
            <p className="text-xs text-slate-500">
              Already have an account?{' '}
              <button onClick={onNavigateLogin} className="text-[#00aaff] hover:text-[#00ddff] font-extrabold cursor-pointer transition-colors">Sign in here</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
