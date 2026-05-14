declare type ExcalidrawElementSkeleton = NonNullable<
  Parameters<typeof import("@excalidraw/excalidraw")["convertToExcalidrawElements"]>[0]
>[number]

declare interface ExcalidrawFile {
  type: "excalidraw"
  version: 2
  source: "https://excalidraw.com"
  elements: unknown[]
  appState: {
    viewBackgroundColor: string
    gridSize: number
  }
  files: Record<string, unknown>
}
