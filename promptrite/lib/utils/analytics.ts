/**
 * Lightweight analytics wrapper that tries multiple providers
 * Falls back gracefully if none are available
 */
export function track(event: string, props?: Record<string, unknown>) {
  // Try Vercel Analytics first
  if (typeof window !== "undefined" && (window as any).va?.track) {
    (window as any).va.track(event, props);
    return;
  }

  // Try Plausible Analytics
  if (typeof window !== "undefined" && (window as any).plausible) {
    (window as any).plausible(event, { props });
    return;
  }

  // No-op if no analytics providers are available
  // This ensures the app works without analytics configured
}
