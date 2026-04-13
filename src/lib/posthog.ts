// PostHog — GDPR-compliant analytics
// ==================================
// Gated by cookie consent. No events fire until the user explicitly accepts
// analytics cookies via the CookieBanner. `initPostHog()` is a no-op until
// then; `grantAnalyticsConsent()` loads the script; `revokeAnalyticsConsent()`
// opts out and disables future tracking.

import posthog from "posthog-js";

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
const POSTHOG_HOST = (import.meta.env.VITE_POSTHOG_HOST as string | undefined) || "https://eu.posthog.com";

let initialized = false;

export function initPostHog() {
  if (initialized || !POSTHOG_KEY) return;
  if (typeof window === "undefined") return;

  const consent = localStorage.getItem("2mc:analytics-consent");
  if (consent !== "granted") return;

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    person_profiles: "identified_only",
    capture_pageview: true,
    capture_pageleave: true,
    autocapture: false,
    disable_session_recording: true,
    respect_dnt: true,
    opt_out_capturing_by_default: false,
    loaded: (ph) => {
      if (import.meta.env.DEV) ph.debug();
    },
  });
  initialized = true;
}

export function grantAnalyticsConsent() {
  localStorage.setItem("2mc:analytics-consent", "granted");
  initPostHog();
}

export function revokeAnalyticsConsent() {
  localStorage.setItem("2mc:analytics-consent", "revoked");
  if (initialized) {
    posthog.opt_out_capturing();
    posthog.reset();
  }
}

export function hasAnalyticsConsent(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("2mc:analytics-consent") === "granted";
}

export function trackEvent(event: string, properties?: Record<string, unknown>) {
  if (!initialized) return;
  posthog.capture(event, properties);
}

export function identifyUser(userId: string, traits?: Record<string, unknown>) {
  if (!initialized) return;
  posthog.identify(userId, traits);
}

export function resetUser() {
  if (!initialized) return;
  posthog.reset();
}

export { posthog };
