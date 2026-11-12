/**
 * Safeguard for the standalone Eferos booking proxy. This does not establish
 * that an API is TEST: the upstream must still be verified independently.
 * In Railway preview, fail closed until an exact TEST origin is approved.
 */
const knownProductionHosts = new Set([
  'avanttai.com',
  'saas-web-production-b554.up.railway.app',
  'bot-learning-v2-staging-production.up.railway.app',
  'avanttai-health-invoicing-preview-production.up.railway.app',
]);

function productionHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/\.+$/, '');
  return knownProductionHosts.has(host) || host.endsWith('.avanttai.com');
}

function parseOrigin(raw: string): URL | null {
  try {
    const parsed = new URL(raw.trim());
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return null;
    if (parsed.username || parsed.password || parsed.search || parsed.hash) return null;
    if (parsed.pathname !== '/') return null;
    return parsed;
  } catch {
    return null;
  }
}

export function resolveBookingApiBase(params: {
  configuredUrl: string | undefined;
  railwayEnvironment: string | undefined;
  approvedTestOrigin: string | undefined;
}): string | null {
  const base = parseOrigin(params.configuredUrl ?? '');
  if (!base) return null;
  const preview = params.railwayEnvironment?.trim().toLowerCase() === 'preview';
  if (!preview) return base.origin;

  // Production services do not become TEST by being named `*-staging` or `*-preview`.
  if (base.protocol !== 'https:' || productionHost(base.hostname)) return null;
  const approved = parseOrigin(params.approvedTestOrigin ?? '');
  if (!approved || approved.protocol !== 'https:' || productionHost(approved.hostname)) return null;
  return base.origin === approved.origin ? base.origin : null;
}
