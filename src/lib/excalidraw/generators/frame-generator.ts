import type { FrameInput } from "@/schemas/excalidraw/frame-schema"

export function generateFrame(input: FrameInput) {
  const { id, children, name } = input
  return {
    type: "frame" as const,
    id,
    children,
    ...(name !== undefined && { name }),
  }
}
