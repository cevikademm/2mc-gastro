import { trackEvent } from './analytics';

const STORAGE_KEY = '2mc_lead_captured';

export type LeadSource = 'bom_pdf' | 'design_save' | 'calculator' | 'newsletter' | 'catalog' | 'lead_magnet' | 'comparison';

export function hasCapturedLead(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export function markLeadCaptured() {
  try {
    localStorage.setItem(STORAGE_KEY, '1');
  } catch {}
}

export async function submitLead(email: string, source: LeadSource, meta?: Record<string, unknown>) {
  trackEvent('lead_capture', { source, ...meta });

  try {
    const { supabase } = await import('./supabase');
    await supabase.from('leads').insert({
      email,
      source,
      meta: meta || {},
      captured_at: new Date().toISOString(),
    });
  } catch (e) {
    console.warn('[lead] supabase insert failed, lead tracked in analytics only', e);
  }

  try {
    const { sendEmail } = await import('./email');
    await sendEmail({ template: 'lead-followup', to: email, data: { source } });
  } catch (e) {
    console.warn('[lead] followup email failed', e);
  }

  markLeadCaptured();
}
