import React, { useState, useEffect } from 'react';
import { DollarSign, Plus, Building2, CreditCard, CheckCircle, Clock, AlertCircle, ArrowDownToLine, Banknote } from 'lucide-react';
import { Course, User } from '../types';
import { getAuthHeaders } from '../lib/session';

interface InstructorRevenueProps {
  currentUser: User;
  courses: Course[];
  triggerToast: (msg: string, type?: 'success' | 'warn') => void;
}

export default function InstructorRevenue({ currentUser, courses, triggerToast }: InstructorRevenueProps) {
  const [revenueData, setRevenueData] = useState<any>({ bankAccounts: [], withdrawalRequests: [] });
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'overview' | 'add_bank' | 'withdraw'>('overview');
  const [submitting, setSubmitting] = useState(false);

  const [bankMethod, setBankMethod] = useState<'bank' | 'bkash' | 'nagad'>('bank');
  const [bankHolder, setBankHolder] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAccount, setWithdrawAccount] = useState('');

  const myCourses = courses.filter(c => c.instructorId === currentUser.id);
  const totalRevenue = myCourses.reduce((a, c) => a + c.enrollmentCount * c.price, 0);
  const instructorShare = Math.floor(totalRevenue * 0.7);

  const fetchRevenue = async () => {
    try {
      const resp = await fetch(`/api/revenue/${currentUser.id}`, { headers: getAuthHeaders() });
      const data = await resp.json();
      setRevenueData(data);
    } catch {
      triggerToast('Failed to load revenue data', 'warn');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenue();
  }, []);

  const totalWithdrawn = (revenueData.withdrawalRequests || [])
    .filter((w: any) => w.status === 'processed')
    .reduce((a: number, w: any) => a + w.amount, 0);
  const pendingWithdrawal = (revenueData.withdrawalRequests || [])
    .filter((w: any) => w.status === 'pending')
    .reduce((a: number, w: any) => a + w.amount, 0);
  const availableBalance = instructorShare - totalWithdrawn - pendingWithdrawal;

  const handleAddBank = async () => {
    if (bankMethod === 'bank' && (!bankHolder || !bankName || !accountNumber)) {
      triggerToast('Please fill all required bank fields.', 'warn');
      return;
    }
    if ((bankMethod === 'bkash' || bankMethod === 'nagad') && !phoneNumber) {
      triggerToast('Phone number is required for mobile payments.', 'warn');
      return;
    }
    setSubmitting(true);
    try {
      const resp = await fetch('/api/revenue/add-bank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          instructorId: currentUser.id,
          method: bankMethod,
          accountHolder: bankHolder || currentUser.name,
          bankName,
          accountNumber,
          routingNumber,
          phoneNumber,
        }),
      });
      const data = await resp.json();
      if (data.status === 'success') {
        triggerToast('Payment account added successfully!');
        setBankHolder(''); setBankName(''); setAccountNumber(''); setRoutingNumber(''); setPhoneNumber('');
        setActiveSection('overview');
        await fetchRevenue();
      }
    } catch {
      triggerToast('Failed to add account', 'warn');
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (!withdrawAmount || isNaN(amount) || amount <= 0) {
      triggerToast('Enter a valid withdrawal amount.', 'warn');
      return;
    }
    if (amount > availableBalance) {
      triggerToast(`Amount exceeds available balance ($${availableBalance.toFixed(2)}).`, 'warn');
      return;
    }
    if (!withdrawAccount) {
      triggerToast('Please select a payment account.', 'warn');
      return;
    }
    setSubmitting(true);
    try {
      const resp = await fetch('/api/revenue/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          instructorId: currentUser.id,
          amount,
          bankAccountId: withdrawAccount,
        }),
      });
      const data = await resp.json();
      if (data.status === 'success') {
        triggerToast(`Withdrawal of $${amount} requested successfully!`);
        setWithdrawAmount('');
        setWithdrawAccount('');
        setActiveSection('overview');
        await fetchRevenue();
      }
    } catch {
      triggerToast('Withdrawal request failed', 'warn');
    } finally {
      setSubmitting(false);
    }
  };

  const statusIcon = (status: string) => {
    if (status === 'processed') return <CheckCircle className="w-4 h-4 text-emerald-400" />;
    if (status === 'rejected') return <AlertCircle className="w-4 h-4 text-rose-400" />;
    return <Clock className="w-4 h-4 text-amber-400" />;
  };

  const statusColor = (status: string) => {
    if (status === 'processed') return 'text-emerald-400';
    if (status === 'rejected') return 'text-rose-400';
    return 'text-amber-400';
  };

  if (loading) return <div className="p-12 text-center text-slate-500 text-sm">Loading revenue data...</div>;

  return (
    <div className="space-y-6 text-left animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-sm font-extrabold text-white">Revenue & Withdrawals</h3>
          <p className="text-[10px] text-slate-500 mt-0.5">Manage earnings and payment accounts.</p>
        </div>
        <div className="flex gap-2">
          {(['overview', 'add_bank', 'withdraw'] as const).map(s => (
            <button
              key={s}
              onClick={() => setActiveSection(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase cursor-pointer transition-all border ${
                activeSection === s
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-white/5'
              }`}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Gross Earnings', value: `$${totalRevenue.toLocaleString()}`, sub: 'Platform total', color: 'text-slate-300' },
          { label: 'Your Share (70%)', value: `$${instructorShare.toLocaleString()}`, sub: 'After platform fee', color: 'text-blue-400' },
          { label: 'Available', value: `$${availableBalance.toFixed(2)}`, sub: 'Ready to withdraw', color: 'text-emerald-400' },
          { label: 'Pending', value: `$${pendingWithdrawal.toFixed(2)}`, sub: 'Awaiting processing', color: 'text-amber-400' },
        ].map((item, idx) => (
          <div key={idx} className="p-5 rounded-2xl glass-card space-y-1">
            <p className="text-[10px] uppercase font-bold text-slate-500">{item.label}</p>
            <p className={`text-2xl font-extrabold font-mono ${item.color}`}>{item.value}</p>
            <p className="text-[9px] text-slate-600">{item.sub}</p>
          </div>
        ))}
      </div>

      {activeSection === 'overview' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl glass-card space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase text-slate-400">Payment Accounts</h4>
              <button onClick={() => setActiveSection('add_bank')} className="text-xs text-blue-400 hover:underline cursor-pointer flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> Add Account
              </button>
            </div>
            {(revenueData.bankAccounts || []).length === 0 ? (
              <div className="p-8 rounded-xl border border-dashed border-white/10 text-center text-slate-600 text-xs italic">
                No payment accounts added yet. Add a bank account or mobile payment to enable withdrawals.
              </div>
            ) : (
              <div className="space-y-3">
                {revenueData.bankAccounts.map((account: any) => (
                  <div key={account.id} className="flex items-center gap-3 p-4 rounded-xl border border-white/10 bg-white/[0.02]">
                    {account.method === 'bank' ? <Building2 className="w-5 h-5 text-blue-400 shrink-0" /> : <Banknote className="w-5 h-5 text-emerald-400 shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-200">{account.method === 'bank' ? account.bankName : `${account.method.charAt(0).toUpperCase() + account.method.slice(1)}`}</p>
                      <p className="text-[10px] text-slate-500">
                        {account.method === 'bank' ? `****${account.accountNumber?.slice(-4)} • ${account.accountHolder}` : account.phoneNumber}
                      </p>
                    </div>
                    <span className="text-[9px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {account.method}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-6 rounded-2xl glass-card space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase text-slate-400">Withdrawal History</h4>
              {availableBalance > 0 && (
                <button onClick={() => setActiveSection('withdraw')} className="px-3 py-1.5 rounded-lg bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold cursor-pointer hover:bg-emerald-600/30 transition-colors flex items-center gap-1.5">
                  <ArrowDownToLine className="w-3.5 h-3.5" /> Withdraw
                </button>
              )}
            </div>
            {(revenueData.withdrawalRequests || []).length === 0 ? (
              <div className="p-8 rounded-xl border border-dashed border-white/10 text-center text-slate-600 text-xs italic">
                No withdrawal requests yet.
              </div>
            ) : (
              <div className="space-y-2">
                {revenueData.withdrawalRequests.map((req: any) => (
                  <div key={req.id} className="flex items-center gap-3 p-3.5 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors">
                    {statusIcon(req.status)}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-200">${req.amount.toFixed(2)}</p>
                      <p className="text-[9px] text-slate-500">{new Date(req.requestedAt).toLocaleDateString()} • {req.status === 'processed' ? `Processed ${new Date(req.processedAt).toLocaleDateString()}` : req.status}</p>
                    </div>
                    <span className={`text-[10px] font-bold capitalize font-mono ${statusColor(req.status)}`}>{req.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeSection === 'add_bank' && (
        <div className="p-6 rounded-2xl glass-card space-y-5">
          <h4 className="text-xs font-bold uppercase text-blue-400">Add Payment Account</h4>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Payment Method</label>
            <div className="flex gap-3">
              {([
                { value: 'bank', label: '🏦 Bank Transfer', icon: Building2 },
                { value: 'bkash', label: '📱 bKash', icon: Banknote },
                { value: 'nagad', label: '📱 Nagad', icon: Banknote },
              ] as const).map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setBankMethod(opt.value)}
                  className={`flex-1 py-3 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                    bankMethod === opt.value
                      ? 'border-blue-500 bg-blue-600/20 text-white'
                      : 'border-white/10 bg-white/[0.02] text-slate-400 hover:bg-white/[0.05]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {bankMethod === 'bank' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Account Holder Name *</label>
                <input value={bankHolder} onChange={e => setBankHolder(e.target.value)} placeholder="Full name as on bank account" className="w-full text-xs p-2.5 rounded-lg glass-input text-white" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Bank Name *</label>
                <input value={bankName} onChange={e => setBankName(e.target.value)} placeholder="e.g. Dutch Bangla Bank, HSBC" className="w-full text-xs p-2.5 rounded-lg glass-input text-white" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Account Number *</label>
                <input value={accountNumber} onChange={e => setAccountNumber(e.target.value)} placeholder="Account number" className="w-full text-xs p-2.5 rounded-lg glass-input text-white" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Routing / SWIFT (optional)</label>
                <input value={routingNumber} onChange={e => setRoutingNumber(e.target.value)} placeholder="Routing or SWIFT code" className="w-full text-xs p-2.5 rounded-lg glass-input text-white" />
              </div>
            </div>
          )}

          {(bankMethod === 'bkash' || bankMethod === 'nagad') && (
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Mobile Number *</label>
              <input value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="+880 01X XXXX XXXX" className="w-full text-xs p-2.5 rounded-lg glass-input text-white" />
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button onClick={handleAddBank} disabled={submitting} className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" /> {submitting ? 'Adding...' : 'Add Account'}
            </button>
            <button onClick={() => setActiveSection('overview')} className="px-4 py-2 rounded-lg border border-white/10 text-slate-400 text-xs cursor-pointer hover:bg-white/5 transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {activeSection === 'withdraw' && (
        <div className="p-6 rounded-2xl glass-card space-y-5">
          <h4 className="text-xs font-bold uppercase text-emerald-400">Request Withdrawal</h4>
          <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
            <p className="text-[10px] text-emerald-400 uppercase font-bold">Available Balance</p>
            <p className="text-3xl font-extrabold font-mono text-emerald-400">${availableBalance.toFixed(2)}</p>
          </div>

          {(revenueData.bankAccounts || []).length === 0 ? (
            <div className="p-6 rounded-xl border border-dashed border-white/10 text-center space-y-2">
              <p className="text-xs text-slate-500">You need to add a payment account first.</p>
              <button onClick={() => setActiveSection('add_bank')} className="text-xs text-blue-400 hover:underline cursor-pointer">Add Account →</button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Withdrawal Amount (USD) *</label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={e => setWithdrawAmount(e.target.value)}
                  max={availableBalance}
                  placeholder={`Max $${availableBalance.toFixed(2)}`}
                  className="w-full text-xs p-2.5 rounded-lg glass-input text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Payment Account *</label>
                <select value={withdrawAccount} onChange={e => setWithdrawAccount(e.target.value)} className="w-full text-xs p-2.5 rounded-lg glass-input text-slate-200">
                  <option value="">-- Select account --</option>
                  {revenueData.bankAccounts.map((acc: any) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.method === 'bank' ? `${acc.bankName} ****${acc.accountNumber?.slice(-4)}` : `${acc.method} - ${acc.phoneNumber}`}
                    </option>
                  ))}
                </select>
              </div>
              <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 text-[10px] text-amber-400">
                ⚠️ Withdrawals are typically processed within 3–5 business days. A 2% platform transfer fee may apply.
              </div>
              <div className="flex gap-2">
                <button onClick={handleWithdraw} disabled={submitting || availableBalance <= 0} className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5">
                  <ArrowDownToLine className="w-3.5 h-3.5" /> {submitting ? 'Requesting...' : 'Request Withdrawal'}
                </button>
                <button onClick={() => setActiveSection('overview')} className="px-4 py-2 rounded-lg border border-white/10 text-slate-400 text-xs cursor-pointer hover:bg-white/5 transition-colors">Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
