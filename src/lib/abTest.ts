// Lightweight A/B testing — deterministic bucketing per-user, localStorage
// persisted. Emits a GA4 event the first time a user is assigned to a variant.
//
// Usage:
//   const variant = useExperiment('hero-cta-v1', ['control', 'treatment']);
//   return variant === 'treatment' ? <NewCTA /> : <OldCTA />;
//
// Track conversion:
//   trackExperiment('hero-cta-v1', 'signup_click');

import { useEffect, useState } from 'react';
import { trackEvent } from './analytics';

const STORAGE_KEY = '2mc_experiments';
const USER_KEY = '2mc_user_id';

function getUserId(): string {
  try {
    let id = localStorage.getItem(USER_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(USER_KEY, id);
    }
    return id;
  } catch {
    return 'anon';
  }
}

function readAssignments(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function writeAssignments(a: Record<string, string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(a));
  } catch {}
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 0xffffffff;
}

export function assignVariant<V extends string>(experimentId: string, variants: V[]): V {
  const existing = readAssignments();
  if (existing[experimentId] && variants.includes(existing[experimentId] as V)) {
    return existing[experimentId] as V;
  }
  const userId = getUserId();
  const bucket = hash(`${experimentId}:${userId}`);
  const index = Math.floor(bucket * variants.length);
  const chosen = variants[Math.min(index, variants.length - 1)];
  existing[experimentId] = chosen;
  writeAssignments(existing);
  trackEvent('experiment_assigned', { experiment_id: experimentId, variant: chosen });
  return chosen;
}

export function useExperiment<V extends string>(experimentId: string, variants: V[]): V {
  const [variant, setVariant] = useState<V>(() => variants[0]);
  useEffect(() => {
    setVariant(assignVariant(experimentId, variants));
  }, [experimentId, variants.join('|')]); // eslint-disable-line react-hooks/exhaustive-deps
  return variant;
}

export function trackExperiment(experimentId: string, goal: string, meta?: Record<string, unknown>) {
  const assignments = readAssignments();
  const variant = assignments[experimentId];
  if (!variant) return;
  trackEvent('experiment_conversion', {
    experiment_id: experimentId,
    variant,
    goal,
    ...meta,
  });
}
