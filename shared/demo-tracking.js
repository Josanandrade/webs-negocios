(() => {
  'use strict';

  const SUPABASE_URL = 'https://rreagxqpptjikpcktsyo.supabase.co';
  const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_7uaelDEpw4qr2mSP8jT16w_HY21gIB3';
  const ENDPOINT = `${SUPABASE_URL}/rest/v1/lead_demo_events`;
  const ALLOWED_SOURCES = new Set(['instagram', 'email', 'facebook', 'direct', 'test']);

  const params = new URLSearchParams(window.location.search);
  const content = params.get('utm_content') || '';
  const match = /^lead_(\d+)$/.exec(content);
  if (!match) return;

  const leadId = Number(match[1]);
  if (!Number.isSafeInteger(leadId) || leadId <= 0) return;

  let source = (params.get('utm_source') || 'direct').toLowerCase();
  if (!ALLOWED_SOURCES.has(source)) source = 'direct';

  const campaign = (params.get('utm_campaign') || '').slice(0, 80) || null;
  const sessionKey = 'wn_demo_tracking_session';
  let sessionId = sessionStorage.getItem(sessionKey);
  if (!sessionId) {
    sessionId = (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`);
    sessionStorage.setItem(sessionKey, sessionId);
  }

  const sent = new Set();
  let maxScroll = 0;
  let hadInteraction = false;
  let engagedTimer = null;

  const payloadBase = {
    lead_id: leadId,
    source,
    campaign,
    session_id: sessionId,
    path: `${location.pathname}${location.search}`.slice(0, 500),
    referrer: (document.referrer || '').slice(0, 500),
  };

  function send(eventType, metadata = {}) {
    if (sent.has(eventType) && eventType !== 'cta_click') return;
    if (navigator.webdriver) return;

    if (eventType !== 'cta_click') sent.add(eventType);

    fetch(ENDPOINT, {
      method: 'POST',
      mode: 'cors',
      keepalive: true,
      headers: {
        apikey: SUPABASE_PUBLISHABLE_KEY,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        ...payloadBase,
        event_type: eventType,
        metadata,
      }),
    }).catch(() => {
      if (eventType !== 'cta_click') sent.delete(eventType);
    });
  }

  function getScrollDepth() {
    const doc = document.documentElement;
    const scrollable = Math.max(1, doc.scrollHeight - window.innerHeight);
    return Math.min(1, Math.max(0, window.scrollY / scrollable));
  }

  function noteInteraction() {
    hadInteraction = true;
  }

  function maybeEngaged() {
    if (sent.has('demo_engaged')) return;
    if (document.visibilityState !== 'visible') return;
    if (!hadInteraction) return;
    if (maxScroll >= 0.25) {
      send('demo_engaged', { scroll_depth: Number(maxScroll.toFixed(2)) });
    }
  }

  function onScroll() {
    hadInteraction = true;
    maxScroll = Math.max(maxScroll, getScrollDepth());

    if (maxScroll >= 0.6 && !sent.has('deep_scroll')) {
      send('deep_scroll', { scroll_depth: Number(maxScroll.toFixed(2)) });
    }
  }

  function isTrackableCta(el) {
    if (!el) return false;
    if (el.matches('[data-track-cta]')) return true;
    if (!el.matches('a')) return false;
    const href = (el.getAttribute('href') || '').toLowerCase();
    return href.startsWith('mailto:') ||
      href.startsWith('tel:') ||
      href.includes('wa.me') ||
      href.includes('whatsapp') ||
      el.matches('.cta, .btn, .button, [class*="cta"], [class*="button"]');
  }

  document.addEventListener('pointerdown', noteInteraction, { passive: true });
  document.addEventListener('touchstart', noteInteraction, { passive: true });
  document.addEventListener('keydown', noteInteraction, { passive: true });
  window.addEventListener('scroll', onScroll, { passive: true });

  document.addEventListener('click', (event) => {
    const target = event.target.closest('a, button, [data-track-cta]');
    if (!target || !isTrackableCta(target)) return;

    hadInteraction = true;
    const label = (
      target.getAttribute('data-track-cta') ||
      target.getAttribute('aria-label') ||
      target.textContent ||
      'cta'
    ).trim().replace(/\s+/g, ' ').slice(0, 120);

    send('cta_click', {
      label,
      href: target.matches('a') ? (target.getAttribute('href') || '').slice(0, 300) : null,
    });
  });

  function start() {
    if (document.visibilityState !== 'visible') return;
    maxScroll = getScrollDepth();

    window.setTimeout(() => {
      if (document.visibilityState === 'visible') {
        send('demo_view', { initial_scroll_depth: Number(maxScroll.toFixed(2)) });
      }
    }, 1200);

    engagedTimer = window.setInterval(maybeEngaged, 2500);
    window.setTimeout(() => {
      if (engagedTimer) window.clearInterval(engagedTimer);
    }, 120000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
