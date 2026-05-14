import type { SlideComposition, SlideNode, SlideEdge, SlideCompositionParams, SlideStyle } from "@/schemas/excalidraw/slide-composition-schema"
import { generateRectangle } from "@/lib/excalidraw/generators/rectangle-generator"
import { generateEllipse } from "@/lib/excalidraw/generators/ellipse-generator"
import { generateDiamond } from "@/lib/excalidraw/generators/diamond-generator"
import { generateArrow } from "@/lib/excalidraw/generators/arrow-generator"
import { generateText } from "@/lib/excalidraw/generators/text-generator"
import { COLORS } from "@/schemas/excalidraw/elements/base-shape-schema"

const NODE_W = 160
const NODE_H = 70
const DEFAULT_H_GAP = 240
const DEFAULT_V_GAP = 140
const DEFAULT_START_X = 80
const DEFAULT_START_Y = 120
const TITLE_Y = 40
const BULLET_START_Y = 120
const BULLET_GAP = 80
const COLUMN_LEFT_X = 80
const COLUMN_RIGHT_X = 480

type Point = { x: number; y: number }

function layoutAsGrid(count: number, params: SlideCompositionParams): Point[] {
  const cols = params.columns ?? Math.ceil(Math.sqrt(count))
  const hGap = params.hGap ?? DEFAULT_H_GAP
  const vGap = params.vGap ?? DEFAULT_V_GAP
  const ox = params.startX ?? DEFAULT_START_X
  const oy = params.startY ?? DEFAULT_START_Y

  return Array.from({ length: count }, (_, i) => ({
    x: ox + (i % cols) * hGap,
    y: oy + Math.floor(i / cols) * vGap,
  }))
}

function layoutAsRadial(count: number, params: SlideCompositionParams): Point[] {
  const cx = params.startX ?? 400
  const cy = params.startY ?? 300
  const r = params.radius ?? 220

  return Array.from({ length: count }, (_, i) => {
    const angle = (2 * Math.PI * i) / count - Math.PI / 2
    return {
      x: Math.round(cx + r * Math.cos(angle) - NODE_W / 2),
      y: Math.round(cy + r * Math.sin(angle) - NODE_H / 2),
    }
  })
}

function layoutAsTree(nodes: SlideNode[], edges: SlideEdge[], params: SlideCompositionParams): Point[] {
  const ox = params.startX ?? DEFAULT_START_X
  const oy = params.startY ?? DEFAULT_START_Y
  const hGap = params.hGap ?? DEFAULT_H_GAP
  const vGap = params.vGap ?? DEFAULT_V_GAP

  const childrenOf = new Map<string, string[]>()
  const hasParent = new Set<string>()

  for (const edge of edges) {
    if (!childrenOf.has(edge.from)) childrenOf.set(edge.from, [])
    childrenOf.get(edge.from)!.push(edge.to)
    hasParent.add(edge.to)
  }

  const roots = nodes.filter((n) => !hasParent.has(n.id)).map((n) => n.id)
  const positions = new Map<string, Point>()

  function placeNode(id: string, level: number, siblingIndex: number, siblingCount: number) {
    const x = ox + (400 - (siblingCount * hGap) / 2) + siblingIndex * hGap
    const y = oy + level * vGap
    positions.set(id, { x, y })
    const children = childrenOf.get(id) ?? []
    children.forEach((childId, idx) => placeNode(childId, level + 1, idx, children.length))
  }

  roots.forEach((id, idx) => placeNode(id, 0, idx, roots.length))

  return nodes.map((n) => positions.get(n.id) ?? { x: ox, y: oy })
}

function resolvePositions(composition: Extract<SlideComposition, { kind: "title_content" }>): Point[] {
  const { representation, nodes, edges, params } = composition
  if (representation === "mindmap") return layoutAsRadial(nodes.length, params)
  if (representation === "tree" || representation === "orgchart") return layoutAsTree(nodes, edges, params)
  return layoutAsGrid(nodes.length, params)
}

function composeNode(node: SlideNode, pos: Point, style: SlideStyle | undefined, boundArrowIds: string[]) {
  const shared = {
    id: node.id,
    x: pos.x,
    y: pos.y,
    width: NODE_W,
    height: NODE_H,
    label: { text: node.label },
    strokeColor: style?.nodeStroke ?? COLORS.processStroke,
    backgroundColor: style?.nodeFill ?? COLORS.processFill,
    boundElements: boundArrowIds.map((id) => ({ id, type: "arrow" as const })),
  }

  if (node.type === "ellipse") return generateEllipse(shared)
  if (node.type === "diamond") return generateDiamond({ ...shared, width: NODE_W + 30, height: NODE_H + 20 })
  return generateRectangle({ ...shared, rounded: true })
}

function composeTitleOnly(composition: Extract<SlideComposition, { kind: "title_only" }>): ExcalidrawElementSkeleton[] {
  const { title, subtitle, style } = composition
  const elements: ExcalidrawElementSkeleton[] = [
    generateText({ id: "title", x: DEFAULT_START_X, y: 160, text: title, fontSize: 40, strokeColor: style?.titleColor ?? COLORS.textTitle }),
  ]
  if (subtitle) {
    elements.push(generateText({ id: "subtitle", x: DEFAULT_START_X, y: 230, text: subtitle, fontSize: 22, strokeColor: COLORS.textDescription }))
  }
  return elements
}

function composeBullets(composition: Extract<SlideComposition, { kind: "bullets" }>): ExcalidrawElementSkeleton[] {
  const { title, items, style } = composition
  return [
    generateText({ id: "title", x: DEFAULT_START_X, y: TITLE_Y, text: title, fontSize: 28, strokeColor: style?.titleColor ?? COLORS.textTitle }),
    ...items.map((item, i) =>
      generateRectangle({
        id: `bullet-${i}`,
        x: DEFAULT_START_X,
        y: BULLET_START_Y + i * BULLET_GAP,
        width: 640,
        height: 56,
        label: { text: item },
        rounded: true,
        backgroundColor: style?.nodeFill ?? COLORS.processFill,
        strokeColor: style?.nodeStroke ?? COLORS.processStroke,
      })
    ),
  ]
}

function composeTitleContent(composition: Extract<SlideComposition, { kind: "title_content" }>): ExcalidrawElementSkeleton[] {
  const { title, edges, style } = composition
  const { nodes } = composition

  const boundArrowsByNode = new Map<string, string[]>()
  for (const node of nodes) boundArrowsByNode.set(node.id, [])
  for (const edge of edges) {
    const arrowId = `arrow-${edge.from}-${edge.to}`
    boundArrowsByNode.get(edge.from)?.push(arrowId)
    boundArrowsByNode.get(edge.to)?.push(arrowId)
  }

  const positions = resolvePositions(composition)

  const titleEl = generateText({
    id: "title",
    x: DEFAULT_START_X,
    y: TITLE_Y,
    text: title,
    fontSize: 28,
    strokeColor: style?.titleColor ?? COLORS.textTitle,
  })

  const nodeEls = nodes.map((node, i) =>
    composeNode(node, positions[i], style, boundArrowsByNode.get(node.id) ?? [])
  )

  const arrowEls = edges.map((edge) =>
    generateArrow({
      id: `arrow-${edge.from}-${edge.to}`,
      x: 0,
      y: 0,
      width: 100,
      height: 0,
      strokeColor: style?.edgeStroke ?? COLORS.defaultStroke,
      strokeStyle: edge.style ?? "solid",
      start: { id: edge.from },
      end: { id: edge.to },
      ...(edge.label ? { label: { text: edge.label } } : {}),
    })
  )

  return [titleEl, ...nodeEls, ...arrowEls]
}

function composeTwoColumn(composition: Extract<SlideComposition, { kind: "two_column" }>): ExcalidrawElementSkeleton[] {
  const { title, left, right, style } = composition
  const elements: ExcalidrawElementSkeleton[] = [
    generateText({ id: "title", x: DEFAULT_START_X, y: TITLE_Y, text: title, fontSize: 28, strokeColor: style?.titleColor ?? COLORS.textTitle }),
  ]

  if (left.title) {
    elements.push(generateText({ id: "left-title", x: COLUMN_LEFT_X, y: 100, text: left.title, fontSize: 18, strokeColor: COLORS.textLabel }))
  }
  if (right.title) {
    elements.push(generateText({ id: "right-title", x: COLUMN_RIGHT_X, y: 100, text: right.title, fontSize: 18, strokeColor: COLORS.textLabel }))
  }

  left.items.forEach((item, i) =>
    elements.push(generateRectangle({
      id: `left-${i}`,
      x: COLUMN_LEFT_X,
      y: BULLET_START_Y + i * BULLET_GAP,
      width: 300,
      height: 56,
      label: { text: item },
      rounded: true,
      backgroundColor: style?.nodeFill ?? COLORS.processFill,
      strokeColor: style?.nodeStroke ?? COLORS.processStroke,
    }))
  )

  right.items.forEach((item, i) =>
    elements.push(generateRectangle({
      id: `right-${i}`,
      x: COLUMN_RIGHT_X,
      y: BULLET_START_Y + i * BULLET_GAP,
      width: 300,
      height: 56,
      label: { text: item },
      rounded: true,
      backgroundColor: style?.nodeFill ?? COLORS.processFill,
      strokeColor: style?.nodeStroke ?? COLORS.processStroke,
    }))
  )

  return elements
}

function composeImageText(composition: Extract<SlideComposition, { kind: "image_text" }>): ExcalidrawElementSkeleton[] {
  const { title, body, style } = composition
  return [
    generateText({ id: "title", x: DEFAULT_START_X, y: TITLE_Y, text: title, fontSize: 28, strokeColor: style?.titleColor ?? COLORS.textTitle }),
    generateText({ id: "body", x: 420, y: DEFAULT_START_Y, text: body, fontSize: 16, strokeColor: COLORS.textDescription }),
    generateRectangle({ id: "image-placeholder", x: DEFAULT_START_X, y: DEFAULT_START_Y, width: 300, height: 260, label: { text: "[ image ]" }, backgroundColor: COLORS.neutralFill, strokeColor: COLORS.neutralStroke }),
  ]
}

function composeFullImage(composition: Extract<SlideComposition, { kind: "full_image" }>): ExcalidrawElementSkeleton[] {
  return [
    generateRectangle({ id: "image-placeholder", x: 0, y: 0, width: 800, height: 450, label: { text: "[ image ]" }, backgroundColor: COLORS.neutralFill, strokeColor: COLORS.neutralStroke }),
  ]
}

function composeBlank(_composition: Extract<SlideComposition, { kind: "blank" }>): ExcalidrawElementSkeleton[] {
  return []
}

export function composeLayout(composition: SlideComposition): ExcalidrawElementSkeleton[] {
  switch (composition.kind) {
    case "title_only":    return composeTitleOnly(composition)
    case "bullets":       return composeBullets(composition)
    case "title_content": return composeTitleContent(composition)
    case "two_column":    return composeTwoColumn(composition)
    case "image_text":    return composeImageText(composition)
    case "full_image":    return composeFullImage(composition)
    case "blank":         return composeBlank(composition)
  }
}
