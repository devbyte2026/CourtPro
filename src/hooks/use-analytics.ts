"use client";

import { useEffect } from "react";
import { trackEvent, trackPageView } from "@/components/analytics/analytics-provider";

export function useAnalytics() {
  useEffect(() => {
    const handleRouteChange = () => {
      trackPageView(window.location.href);
    };

    window.addEventListener("popstate", handleRouteChange);
    const originalPushState = window.history.pushState;
    window.history.pushState = function (...args) {
      originalPushState.apply(window.history, args);
      handleRouteChange();
    };

    return () => {
      window.removeEventListener("popstate", handleRouteChange);
      window.history.pushState = originalPushState;
    };
  }, []);
}

export function useBookingAnalytics() {
  const trackBookingStarted = (tenantId: string, courtId: string) => {
    trackEvent("booking_started", { tenant_id: tenantId, court_id: courtId });
  };

  const trackBookingCompleted = (
    tenantId: string,
    courtId: string,
    bookingId: string,
    amount: number
  ) => {
    trackEvent("booking_completed", {
      tenant_id: tenantId,
      court_id: courtId,
      booking_id: bookingId,
      amount,
    });
  };

  const trackBookingCancelled = (tenantId: string, bookingId: string, reason?: string) => {
    trackEvent("booking_cancelled", {
      tenant_id: tenantId,
      booking_id: bookingId,
      reason,
    });
  };

  const trackPaymentFailed = (tenantId: string, error: string) => {
    trackEvent("payment_failed", { tenant_id: tenantId, error });
  };

  return {
    trackBookingStarted,
    trackBookingCompleted,
    trackBookingCancelled,
    trackPaymentFailed,
  };
}

export function useTenantAnalytics() {
  const trackTenantCreated = (tenantId: string, plan: string) => {
    trackEvent("tenant_created", { tenant_id: tenantId, plan });
  };

  const trackPlanUpgraded = (tenantId: string, fromPlan: string, toPlan: string) => {
    trackEvent("plan_upgraded", {
      tenant_id: tenantId,
      from_plan: fromPlan,
      to_plan: toPlan,
    });
  };

  const trackPlanDowngraded = (tenantId: string, fromPlan: string, toPlan: string) => {
    trackEvent("plan_downgraded", {
      tenant_id: tenantId,
      from_plan: fromPlan,
      to_plan: toPlan,
    });
  };

  return {
    trackTenantCreated,
    trackPlanUpgraded,
    trackPlanDowngraded,
  };
}
