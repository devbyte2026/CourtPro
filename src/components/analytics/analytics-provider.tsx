"use client";

import { useEffect } from "react";

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // PostHog disabled - no valid API key configured
  }, []);

  return <>{children}</>;
}

export function trackEvent(event: string, properties?: Record<string, unknown>) {
  // PostHog disabled
}

export function trackPageView(url: string, properties?: Record<string, unknown>) {
  // PostHog disabled
}
