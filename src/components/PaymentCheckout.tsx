import React, { useEffect, useState } from 'react';
import { CreditCard, Building2, CheckCircle2, AlertCircle, Loader2, Landmark } from 'lucide-react';
import { getAuthHeaders } from '../lib/session';

/**
 * Payment checkout: bKash (PGW sandbox / mock) and Bangladeshi bank transfer.
 * Talks to /api/payments/* — see the "Payments" section of README.md.
 */
export default function PaymentCheckout() {
  const [config, setConfig] = useState<any>(null);
  const [planId, setPlanId] = useState('pro');
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [bankInfo, setBankInfo] = useState<{ payment: any; bank: any; instructions: string[] } | null>(null);
  const [payments, setPayments] = useState<any[]>([]);

  const load = async () => {
    try { const r = await fetch('/api/payments/config'); if (r.ok) setConfig(await r.json()); } catch { /* offline */ }
    try {
      const r = await fetch('/api/payments/mine', { headers: getAuthHeaders() });
      if (r.ok) { const d = await r.json(); setPayments(d.payments || []); }
    } catch { /* not signed in */ }
  };

  useEffect(() => {
    load();
    const status = new URLSearchParams(window.location.search).get('payment');
    if (status) {
      setMessage(status === 'success'
        ? { kind: 'ok', text: 'Payment confirmed — your plan is now active.' }
        : { kind: 'err', text: 'The payment was not completed. You can try again.' });
    }
  }, []);

  const post = async (path: string, body: any) => {
    const r = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(body),
    });
    return { ok: r.ok, data: await r.json().catch(() => ({})) };
  };

  const payWithBkash = async () => {
    setBusy('bkash'); setMessage(null); setBankInfo(null);
    try {
      const { ok, data } = await post('/api/payments/bkash/create', { planId });
      if (!ok || !data.bkashURL) throw new Error(data.error || 'Could not start the bKash payment');
      window.location.href = data.bkashURL;   // bKash page (or the local mock page)
    } catch (err: any) {
      setMessage({ kind: 'err', text: err.message });
      setBusy(null);
    }
  };

  const payByBank = async () => {
    setBusy('bank'); setMessage(null);
    try {
      const { ok, data } = await post('/api/payments/bank/request', { planId });
      if (!ok) throw new Error(data.error || 'Could not create the transfer request');
      setBankInfo(data);
      setMessage({ kind: 'ok', text: 'Transfer request created — send the amount using the reference below.' });
      load();
    } catch (err: any) {
      setMessage({ kind: 'err', text: err.message });
    } finally { setBusy(null); }
  };

  const plans: Record<string, any> = config?.plans || {};
  const currency = config?.currency || 'BDT';

  return (
    <section className="p-6 rounded-2xl glass-card space-y-5 text-left">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-sm font-extrabold text-white">Buy a plan</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Pay with bKash{config?.mock ? ' (sandbox mock)' : ''} or a Bangladeshi bank transfer.
          </p>
        </div>
        <span className="text-[10px] font-mono uppercase px-2 py-1 rounded border border-white/10 bg-white/5 text-slate-400">
          {currency} · {config?.bkashConfigured ? 'bKash live' : 'bKash sandbox'}
        </span>
      </div>

      {message && (
        <div className={`flex items-center gap-2 p-3 rounded-xl text-xs border ${message.kind === 'ok'
          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
          : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
          {message.kind === 'ok' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {!config && <p className="text-xs text-slate-500"><Loader2 className="w-3.5 h-3.5 inline animate-spin" /> Loading payment options…</p>}

      {config && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {Object.entries(plans).map(([id, plan]: any) => (
              <button
                key={id} type="button" onClick={() => setPlanId(id)}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${planId === id
                  ? 'border-blue-500/60 bg-blue-600/15' : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05]'}`}
              >
                <p className="text-xs font-extrabold text-white">{plan.name}</p>
                <p className="text-lg font-mono font-extrabold text-blue-400 mt-1">{currency} {plan.amount}</p>
                <p className="text-[10px] text-slate-500">{plan.days} days</p>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={payWithBkash} disabled={busy !== null}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#e2136e] hover:bg-[#c91162] text-white text-xs font-extrabold cursor-pointer disabled:opacity-50 transition-colors">
              {busy === 'bkash' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
              Pay with bKash
            </button>
            <button type="button" onClick={payByBank} disabled={busy !== null}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 text-xs font-extrabold cursor-pointer disabled:opacity-50 transition-colors">
              {busy === 'bank' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Landmark className="w-4 h-4" />}
              Bank transfer
            </button>
          </div>

          {bankInfo && (
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
              <p className="text-[10px] uppercase font-bold text-blue-400 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> Transfer instructions
              </p>
              <div className="text-[11px] text-slate-300 font-mono space-y-0.5">
                <p>Bank: {bankInfo.bank.bankName}</p>
                <p>Account: {bankInfo.bank.accountName} {bankInfo.bank.accountNumber && `· A/C ${bankInfo.bank.accountNumber}`}</p>
                {bankInfo.bank.branch && <p>Branch: {bankInfo.bank.branch} {bankInfo.bank.routingNumber && `· Routing ${bankInfo.bank.routingNumber}`}</p>}
                <p>Amount: {currency} {bankInfo.payment.amount}</p>
                <p className="text-blue-300">Reference: {bankInfo.payment.reference}</p>
              </div>
              <ul className="text-[11px] text-slate-400 list-disc pl-4 space-y-0.5">
                {(bankInfo.instructions || []).map((line: string, i: number) => <li key={i}>{line}</li>)}
              </ul>
            </div>
          )}

          {payments.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] uppercase font-bold text-slate-500">My payments</p>
              {payments.map(p => (
                <div key={p.id} className="flex items-center justify-between text-[11px] font-mono px-3 py-2 rounded-lg bg-white/[0.02] border border-white/5">
                  <span className="text-slate-300">{p.method} · {p.plan} · {currency} {p.amount}</span>
                  <span className={p.status === 'paid' ? 'text-emerald-400' : p.status === 'pending' ? 'text-amber-400' : 'text-rose-400'}>
                    {p.status}{p.reference ? ` · ${p.reference}` : ''}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
