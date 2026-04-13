// Lightweight Core Web Vitals reporter — no external dependency.
// Captures LCP, CLS, INP/FID, TTFB, FCP using PerformanceObserver and
// reports via the analytics trackEvent helper (GA4).

import { trackEvent } from './analytics';

type Metric = { name: string; value: number; rating: 'good' | 'ni' | 'poor' };

const THRESHOLDS: Record<string, [number, number]> = {
  LCP: [2500, 4000],
  CLS: [0.1, 0.25],
  INP: [200, 500],
  FID: [100, 300],
  FCP: [1800, 3000],
  TTFB: [800, 1800],
};

function rate(name: string, value: number): Metric['rating'] {
  const t = THRESHOLDS[name];
  if (!t) return 'good';
  return value <= t[0] ? 'good' : value <= t[1] ? 'ni' : 'poor';
}

function send(m: Metric) {
  trackEvent('web_vitals', {
    metric_name: m.name,
    metric_value: Math.round(m.name === 'CLS' ? m.value * 1000 : m.value),
    metric_rating: m.rating,
  });
}

let cls = 0;
let lcp = 0;
let started = false;

export function initWebVitals() {
  if (started || typeof window === 'undefined' || !('PerformanceObserver' in window)) return;
  started = true;

  try {
    const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    if (navEntry) {
      const ttfb = navEntry.responseStart;
      send({ name: 'TTFB', value: ttfb, rating: rate('TTFB', ttfb) });
    }
  } catch {}

  try {
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        if ((e as any).name === 'first-contentful-paint') {
          send({ name: 'FCP', value: e.startTime, rating: rate('FCP', e.startTime) });
        }
      }
    }).observe({ type: 'paint', buffered: true });
  } catch {}

  try {
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const last = entries[entries.length - 1] as any;
      if (last) lcp = last.renderTime || last.loadTime || last.startTime;
    }).observe({ type: 'largest-contentful-paint', buffered: true });
  } catch {}

  try {
    new PerformanceObserver((list) => {
      for (const e of list.getEntries() as any[]) {
        if (!e.hadRecentInput) cls += e.value;
      }
    }).observe({ type: 'layout-shift', buffered: true });
  } catch {}

  try {
    new PerformanceObserver((list) => {
      for (const e of list.getEntries() as any[]) {
        const v = e.processingStart - e.startTime;
        send({ name: 'FID', value: v, rating: rate('FID', v) });
      }
    }).observe({ type: 'first-input', buffered: true });
  } catch {}

  try {
    new PerformanceObserver((list) => {
      for (const e of list.getEntries() as any[]) {
        send({ name: 'INP', value: e.duration, rating: rate('INP', e.duration) });
      }
    }).observe({ type: 'event', buffered: true, durationThreshold: 16 } as any);
  } catch {}

  const flush = () => {
    if (lcp) send({ name: 'LCP', value: lcp, rating: rate('LCP', lcp) });
    send({ name: 'CLS', value: cls, rating: rate('CLS', cls) });
  };

  addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush();
  });
  addEventListener('pagehide', flush);
}
