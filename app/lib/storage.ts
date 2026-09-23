/**
 * Safe storage utility - minimizes sensitive data in browser storage
 * For demo: allows some data, but in production should be more restrictive
 */

export interface CheckoutSession {
  orderId: string;
  timestamp: number;
}

// Session Storage - cleared when tab closes
export const sessionStorage = {
  setCheckoutSession(orderId: string) {
    if (typeof window === 'undefined') return;
    try {
      window.sessionStorage.setItem('checkout_session', JSON.stringify({
        orderId,
        timestamp: Date.now()
      }));
    } catch (e) {
      console.warn('Failed to save session:', e);
    }
  },
  
  getCheckoutSession(): CheckoutSession | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = window.sessionStorage.getItem('checkout_session');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  
  clearCheckoutSession() {
    if (typeof window === 'undefined') return;
    window.sessionStorage.removeItem('checkout_session');
    window.sessionStorage.removeItem('verify_data'); // cleanup old data
  }
};

// Local Storage
export const localStorage = {
  clearCheckoutData() {
    if (typeof window === 'undefined') return;
    // Clear sensitive checkout data on logout/completion
    window.localStorage.removeItem('checkout_customer');
    window.localStorage.removeItem('checkout_address');
    window.localStorage.removeItem('checkout_shipping');
  }
};
