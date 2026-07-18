"use client";

import { useQuery } from "@tanstack/react-query";

import { metricsActions } from "@/actions/app/metrics-actions";

export const appMetricsKeys = {
  all: ["metrics"] as const,
};

export function useAppMetrics() {
  function useOverview() {
    return useQuery({
      queryKey: appMetricsKeys.all,
      queryFn: () => metricsActions().get(),
    });
  }

  return { useOverview };
}
