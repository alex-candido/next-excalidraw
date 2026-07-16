import { inngest } from "@/lib/inngest/client"
import { cacheRepository } from "@/server/repositories/cache-repository"
import { presentationService } from "@/server/services/app/presentation-service"

// Um único cron + um único step pra todas as tasks periódicas de manutenção
// (cache, métricas etc.) — cada task nova entra aqui dentro, não como
// step.run() nem function separados, pra não multiplicar execuções cobradas
// pelo Inngest. Só faz sentido enquanto as tasks forem idempotentes: uma
// falha no meio reexecuta todas de novo no retry (sem memoização por task) —
// purgeTrashed() é seguro porque re-consulta a lixeira a cada tentativa, então
// itens já removidos numa tentativa anterior simplesmente não aparecem de novo.
export const scheduledMaintenance = inngest.createFunction(
  { id: "scheduled-maintenance", triggers: { cron: "0 * * * *" } },
  async ({ step }) => {
    await step.run("maintenance-tasks", async () => {
      await cacheRepository().deleteExpired()
      await presentationService().purgeTrashed()
    })
  },
)
