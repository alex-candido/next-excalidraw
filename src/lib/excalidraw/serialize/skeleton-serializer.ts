import { convertToExcalidrawElements } from "@excalidraw/excalidraw"
import type { ExcalidrawElementSkeleton } from "@excalidraw/excalidraw/data/transform"
import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types"
import { bindingRepairer } from "@/lib/excalidraw/normalize/binding-repairer"

// `slide.elements` só é skeleton bruto (saída da IA, nunca editado) até o
// primeiro Save — a partir daí `onSave` persiste elements JÁ CONVERTIDOS
// (ExcalidrawElement real, com versionNonce/seed/points resolvidos — não tem
// como salvar skeleton depois que o usuário edita no editor real). A doc
// oficial do Excalidraw é explícita: convertToExcalidrawElements só pode
// rodar 1 vez, ANTES do elemento existir no editor — chamar de novo em cima
// de um elemento já convertido mede texto/resolve binding como se fosse
// skeleton cru e deforma posição (era a causa do deslocamento progressivo:
// cada Save resalva o real, cada hidratação seguinte convertia de novo).
// `versionNonce` só existe depois da 1ª conversão — sinal barato e confiável
// pra distinguir os dois formatos sem precisar de coluna nova no schema.
function isAlreadyConverted(skeletons: ExcalidrawElementSkeleton[]): boolean {
  const first = skeletons[0] as Record<string, unknown> | undefined
  return typeof first?.versionNonce === "number"
}

export function skeletonSerializer() {
  function serialize(skeletons: ExcalidrawElementSkeleton[]) {
    const repaired = bindingRepairer().repair(skeletons)

    const elements = isAlreadyConverted(repaired)
      ? (repaired as unknown as ExcalidrawElement[])
      : convertToExcalidrawElements(repaired, { regenerateIds: false })

    return {
      type: "excalidraw",
      version: 2,
      source: "https://excalidraw.com",
      elements,
      appState: { viewBackgroundColor: "#ffffff", gridSize: 20 },
      files: {},
    }
  }

  return { serialize }
}
