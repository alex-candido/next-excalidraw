import { convertToExcalidrawElements } from "@excalidraw/excalidraw"
import type { ExcalidrawElementSkeleton } from "@excalidraw/excalidraw/data/transform"

export function serializeSkeleton(skeletons: ExcalidrawElementSkeleton[]) {
  return {
    type: "excalidraw",
    version: 2,
    source: "https://excalidraw.com",
    elements: convertToExcalidrawElements(skeletons, { regenerateIds: false }),
    appState: { viewBackgroundColor: "#ffffff", gridSize: 20 },
    files: {},
  }
}
