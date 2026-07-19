import { NextRequest } from "next/server"
import { mkdir, writeFile } from "fs/promises"
import path from "path"

// Só existe em dev — ferramenta pra inspecionar visualmente o render de uma
// presentation inteira (um PDF, uma página por slide, via exportToCanvas +
// jsPDF no client) sem depender de screenshot manual do usuário. Nunca deve
// existir em produção: escreve direto no filesystem do processo, sem
// autenticação/rate-limit — não é uma feature de produto (ver
// app-presentations-studio-actions.tsx, botão "Exportar (debug)"). Ver docs/adr.md.
const PRESENTATION_ID_PATTERN = /^[0-9a-f-]{36}$/i

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return Response.json({ error: "Not available" }, { status: 404 })
  }

  const formData = await req.formData()
  const file = formData.get("file")
  const presentationId = formData.get("presentationId")

  if (!(file instanceof File) || typeof presentationId !== "string") {
    return Response.json({ error: "Missing fields" }, { status: 400 })
  }

  if (!PRESENTATION_ID_PATTERN.test(presentationId)) {
    return Response.json({ error: "Invalid presentationId" }, { status: 400 })
  }

  const dir = path.join(process.cwd(), "debug", "exports")
  await mkdir(dir, { recursive: true })

  const filePath = path.join(dir, `${presentationId}.pdf`)
  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(filePath, buffer)

  return Response.json({ path: filePath }, { status: 200 })
}
