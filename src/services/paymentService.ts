import { getAuthHeaders } from '../lib/session';

export interface SubscriptionCheckout {
  planId: 'basic' | 'pro' | 'enterprise';
  userId: string;
  userEmail: string;
}

export interface PaymentResult {
  success: boolean;
  message: string;
  transactionId?: string;
}

export const PLAN_PRICES: Record<string, number> = {
  basic: 29,
  pro: 79,
  enterprise: 199,
};

export async function getCurrentSubscription(userId: string): Promise<string | null> {
  try {
    const res = await fetch('/api/subscription/status', { headers: getAuthHeaders() });
    if (!res.ok) return null;
    const data = await res.json();
    return data.plan || null;
  } catch {
    return null;
  }
}

export async function upgradeSubscription(checkout: SubscriptionCheckout): Promise<PaymentResult> {
  try {
    const res = await fetch('/api/subscription/upgrade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ planId: checkout.planId }),
    });
    if (!res.ok) {
      const err = await res.json();
      return { success: false, message: err.error || 'Upgrade failed' };
    }
    const data = await res.json();
    return { success: true, message: 'Subscription upgraded successfully', transactionId: data.transactionId };
  } catch {
    return { success: false, message: 'Network error. Please try again.' };
  }
}

export async function cancelSubscription(): Promise<PaymentResult> {
  try {
    const res = await fetch('/api/subscription/cancel', {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!res.ok) return { success: false, message: 'Cancellation failed' };
    return { success: true, message: 'Subscription cancelled' };
  } catch {
    return { success: false, message: 'Network error. Please try again.' };
  }
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
