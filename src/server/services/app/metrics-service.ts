import { presentationEntryRepository } from "@/server/repositories/app/presentation-entry-repository"
import { PresentationType } from "@/lib/drizzle/schema/presentation"
import { PresentationEntryOrigin } from "@/lib/drizzle/schema/presentation-entry"
import type { Metrics } from "@/schemas/app/metrics-schema"

// Calculado ao vivo por request — sem cache/pré-computação por enquanto.
// Quando o volume justificar, isso vira uma automação diária que pré-computa
// e guarda os números (ver docs/sdd/1-product/pm/decisions.md), e essa função
// passa a ler o snapshot em vez de agregar na hora.
export function metricsService() {
  async function get(userId: string): Promise<Metrics> {
    const entries = await presentationEntryRepository().findTypeAndOriginByUser(userId)

    const total = entries.length
    const multi = entries.filter((e) => e.type === PresentationType.multi).length
    const single = entries.filter((e) => e.type === PresentationType.single).length
    const aiGenerated = entries.filter((e) => e.origin === PresentationEntryOrigin.prompt).length

    return {
      presentations: { total, multi, single },
      generation: { aiGenerated, total },
    }
  }

  return { get }
}
