import { apiFetch } from "@/actions/api-client"
import type { Metrics } from "@/schemas/app/metrics-schema"

const BASE = "/api/v1/app/metrics"

export function metricsActions() {
  async function get() {
    return apiFetch<Metrics>(BASE)
  }

  return { get }
}
