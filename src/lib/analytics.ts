/**
 * GA4 event tracking utilities.
 * Wraps window.gtag() with typed helpers and SSR safety.
 */

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
  }
}

type EventParams = Record<string, string | number | boolean | undefined>;

function trackEvent(eventName: string, params?: EventParams): void {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", eventName, params);
  }
}

/** Set GA4 user properties (call after login/signup) */
export function setUserProperties(props: {
  user_type?: "company" | "candidate";
  subscription_tier?: string | null;
}): void {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("set", "user_properties", props);
  }
}

// --- Signup Funnel ---
export function trackSignupStep(step: "role" | "credentials" | "details" | "complete", role: string): void {
  trackEvent("signup_step", { step, role });
}

export function trackSignupComplete(role: string): void {
  trackEvent("sign_up", { method: "credentials", role });
}

// --- Dashboard ---
export function trackSearch(query: string): void {
  trackEvent("search", { search_term: query });
}

export function trackFilter(filterType: string, value: string): void {
  trackEvent("filter_applied", { filter_type: filterType, filter_value: value });
}

export function trackAIMatchOpen(): void {
  trackEvent("ai_match_open");
}

export function trackAIMatchComplete(matchCount: number): void {
  trackEvent("ai_match_complete", { match_count: matchCount });
}

// --- Profile & Unlock Funnel ---
export function trackProfileView(candidateId: number, vertical: string): void {
  trackEvent("view_item", { item_id: String(candidateId), item_category: vertical });
}

export function trackUnlockModalOpen(candidateId: number): void {
  trackEvent("unlock_modal_open", { candidate_id: candidateId });
}

export function trackUnlockAttempt(candidateId: number): void {
  trackEvent("unlock_attempt", { candidate_id: candidateId });
}

export function trackUnlockSuccess(candidateId: number, deductedFrom: string): void {
  trackEvent("unlock_success", { candidate_id: candidateId, deducted_from: deductedFrom });
}

export function trackUnlockFail(candidateId: number, reason: string): void {
  trackEvent("unlock_fail", { candidate_id: candidateId, reason });
}

// --- Purchase Funnel ---
export function trackCheckoutInitiate(packId: string, value: number): void {
  trackEvent("begin_checkout", { currency: "USD", value, items: packId });
}

export function trackPurchaseComplete(type: "credit_pack" | "subscription", value?: number): void {
  trackEvent("purchase", { transaction_type: type, value });
}

// --- CTA Clicks ---
export function trackCTAClick(ctaName: string, location: string): void {
  trackEvent("cta_click", { cta_name: ctaName, cta_location: location });
}
