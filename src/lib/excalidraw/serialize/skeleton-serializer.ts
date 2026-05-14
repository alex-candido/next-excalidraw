import { convertToExcalidrawElements } from "@excalidraw/excalidraw"

export function serializeSkeleton(skeletons: ExcalidrawElementSkeleton[]): ExcalidrawFile {
  return {
    type: "excalidraw",
    version: 2,
    source: "https://excalidraw.com",
    elements: convertToExcalidrawElements(skeletons, { regenerateIds: false }),
    appState: { viewBackgroundColor: "#ffffff", gridSize: 20 },
    files: {},
  }
}
