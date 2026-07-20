import { NextRequest } from "next/server"
import { mkdir, writeFile, readdir, unlink } from "fs/promises"
import path from "path"

// Só existe em dev — ferramenta pra inspecionar visualmente o render de uma
// presentation inteira (1 PNG por slide, via exportToCanvas no client) sem
// depender de screenshot manual do usuário. Nunca deve existir em produção:
// escreve direto no filesystem do processo, sem autenticação/rate-limit —
// não é uma feature de produto (ver app-presentations-studio-header.tsx,
// botão "Exportar (debug)").
const PRESENTATION_ID_PATTERN = /^[0-9a-f-]{36}$/i
const FILENAME_PATTERN = /^[0-9a-zA-Z_.-]+$/

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return Response.json({ error: "Not available" }, { status: 404 })
  }

  const formData = await req.formData()
  const files = formData.getAll("files")
  const presentationId = formData.get("presentationId")

  if (files.length === 0 || typeof presentationId !== "string") {
    return Response.json({ error: "Missing fields" }, { status: 400 })
  }

  if (!PRESENTATION_ID_PATTERN.test(presentationId)) {
    return Response.json({ error: "Invalid presentationId" }, { status: 400 })
  }

  const dir = path.join(process.cwd(), "debug", "exports", presentationId)
  await mkdir(dir, { recursive: true })

  // Limpa exports anteriores dessa presentation antes de escrever os novos —
  // senão um slide removido/reordenado deixaria um PNG órfão de nome antigo
  // junto dos novos, confundindo a inspeção.
  const existing = await readdir(dir)
  await Promise.all(existing.map((name) => unlink(path.join(dir, name))))

  const written: string[] = []
  for (const file of files) {
    if (!(file instanceof File) || !FILENAME_PATTERN.test(file.name)) continue
    const filePath = path.join(dir, file.name)
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(filePath, buffer)
    written.push(filePath)
  }

  return Response.json({ paths: written }, { status: 200 })
}
