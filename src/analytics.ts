// Google Analytics 4 events (no-op until the tag is configured).
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function track(event: string, params: Record<string, string | number | boolean> = {}) {
  try {
    window.gtag?.("event", event, params);
  } catch {
    /* ignore */
  }
}
