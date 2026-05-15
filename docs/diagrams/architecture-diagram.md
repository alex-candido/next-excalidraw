# Diagrama de Arquitetura

```mermaid
graph TD
    Client["Browser (Next.js Client)"]
    Server["Next.js Server (App Router)"]
    DB["PostgreSQL"]
    Mastra["Mastra (AI Pipeline)"]
    Gemini["Google Gemini API"]
    Brevo["Brevo (Email)"]
    Excalidraw["@excalidraw/excalidraw"]

    Client -->|"API routes /api/v1/"| Server
    Client -->|"renderiza canvas"| Excalidraw
    Server -->|"ORM Drizzle"| DB
    Server -->|"orquestra workflows"| Mastra
    Server -->|"envia emails"| Brevo
    Mastra -->|"tool calls / streaming"| Gemini
    Mastra -->|"storage"| DB
```

## Integrações

| Serviço | Papel | Config |
|---|---|---|
| PostgreSQL | Banco de dados principal | `DATABASE_URL` |
| Google Gemini | LLM para geração de outline e slides | `GOOGLE_GENERATIVE_AI_API_KEY` |
| Brevo | Email transacional (verificação, reset de senha) | `BREVO_API_KEY` |
| Excalidraw | Canvas de renderização no frontend | `@excalidraw/excalidraw` |

## Futuro

| Serviço | Papel |
|---|---|
| Stripe | Billing e planos |
| S3 / R2 | Storage de thumbnails e exports |
| Redis | Cache de sessões e rate limiting |
