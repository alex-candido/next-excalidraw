# next-excalidraw

Plataforma SaaS para geração de apresentações Excalidraw via IA.

> Documentação completa em `docs/`. Manifesto do produto em `docs/briefing.md`.

---

## Requisitos

| Dependência | Versão mínima |
|---|---|
| Node.js | 20+ |
| Bun | 1.2+ |
| Docker | qualquer |

---

## Setup

**1. Banco de dados**

```bash
docker run -d \
  --name next-excalidraw-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=nextexcalidraw_db \
  -p 5438:5432 \
  postgres:16
```

**2. Variáveis de ambiente**

Copiar `.env.example` para `.env.local` e preencher:

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5438/nextexcalidraw_db` |
| `BETTER_AUTH_SECRET` | string aleatória, mínimo 32 chars |
| `BETTER_AUTH_URL` | ex: `http://localhost:3000` |
| `NEXT_PUBLIC_APP_URL` | URL pública da aplicação |
| `GOOGLE_GENERATIVE_AI_API_KEY` | chave da API Google Gemini |
| `GOOGLE_GENERATIVE_AI_MODEL` | ex: `gemini-2.0-flash` |
| `BREVO_API_KEY` | chave da API Brevo |

**3. Instalar e rodar**

```bash
bun install
bun db:migrate
bun db:seed
bun dev
```

---

## Comandos

```bash
bun dev              # desenvolvimento
bun build            # build de produção
bun test             # testes
bun db:migrate       # aplica migrations
bun db:studio        # UI do banco (Drizzle Studio)
bun db:seed          # seed de desenvolvimento
```
