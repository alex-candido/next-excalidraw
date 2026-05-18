# Commands

## Dev

```bash
bun dev              # servidor de desenvolvimento Next.js
bun build            # build de produção
bun start            # servidor de produção
bun lint             # ESLint
```

## Testes

```bash
bun test             # roda todos os testes
bun test:watch       # modo watch
```

## Banco de dados (Drizzle)

```bash
bun db:generate      # gera migration a partir do schema
bun db:migrate       # aplica migrations pendentes
bun db:push          # aplica schema direto sem migration (só dev)
bun db:studio        # abre Drizzle Studio (UI do banco)
bun db:seed          # seed de desenvolvimento
bun db:seed:prod     # seed de produção
```

Comandos diretos do drizzle-kit:

```bash
bunx drizzle-kit generate     # gera arquivos de migration
bunx drizzle-kit migrate      # aplica migrations
bunx drizzle-kit push         # push direto do schema
bunx drizzle-kit studio       # UI visual do banco
bunx drizzle-kit check        # verifica consistência do schema
bunx drizzle-kit drop         # remove migration
bunx drizzle-kit introspect   # gera schema a partir do banco existente
```

## Mastra

```bash
bunx mastra dev               # inicia servidor Mastra (porta 4111)
bunx mastra build             # build do projeto Mastra
bunx mastra start             # inicia aplicação Mastra buildada
bunx mastra lint              # lint do projeto Mastra
bunx mastra migrate --dir src/lib/mastra --root .   # migrations do storage do Mastra
bunx mastra studio            # abre Mastra Studio (UI de agentes/workflows)
bunx mastra scorers           # gerencia scorers de avaliação de outputs
```

## Pipeline AI

Acionado via API — não tem CLI própria:

```
POST /api/v1/app/presentations/generate
{ userPrompt, language, slideCount, keywords }
```
