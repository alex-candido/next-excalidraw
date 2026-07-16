# SDD — Specification-Driven Development

Este diretório é a fonte de verdade do projeto. Toda decisão de design, contrato de API e especificação de feature vive aqui. O código implementa o que está documentado — não o contrário.

---

## Estrutura

```
docs/sdd/
  1-product/          produto, personas e gestão
  2-architecture/     decisões arquiteturais, convenções e diagramas
  3-specs/
    features/         fluxo de cada feature (camada service/API)
    pipeline/         internos dos workflows de IA
    integrations/     integrações com serviços externos
  4-contracts/        contratos formais de cada endpoint HTTP
  5-references/       análises de repositórios de referência
```

---

## Regras por tipo de arquivo

### `*.feature.md` — camada service/API

Documenta **o que a aplicação faz**: como a rota chama o service, como o service orquestra repository e workflow, tratamento de erros e redirects.

**Inclui:**
- Entrada da rota (path params, body de alto nível)
- Fluxo de chamadas: route → service → repository → `workflow.start()`
- Tratamento de erros por camada
- Redirect após conclusão

**Não inclui:**
- Internos do workflow (isso vai no pipeline)
- Tipos detalhados de request/response (isso vai no contract)
- Regras de representação por tipo de slide (isso vai no pipeline)

---

### `*.pipeline.md` — internos do workflow de IA

Documenta **o que acontece dentro de `workflow.start()`**: steps do Mastra, agents, tool calls, scorers e o shape do output retornado pelo workflow.

**Inclui:**
- Steps internos do workflow (ex: `generateOutlineStep`)
- Agent, modelo, prompt strategy
- Tool call e validação do output
- Scorer semântico (score, uso, comportamento)
- Regras de representação por tipo de slide
- Shape completo do objeto retornado pelo workflow

**Não inclui:**
- Entrada da rota (isso está no feature)
- Persistência no banco (o workflow não acessa o banco — retorna resultado, o service persiste)
- Redirect (isso está no feature)

> **Regra crítica:** o workflow nunca acessa o banco. Persistência é sempre responsabilidade do service, documentada no feature.

---

### `*.contract.md` — contrato formal HTTP

Define **o contrato público de cada endpoint**: method + path, tipos exatos de request e response, status codes e condições de erro.

**Inclui:**
- Method + path completo
- Path params tipados
- Request body com tipos TypeScript
- Response de sucesso com tipos e HTTP status
- Tabela de erros (status + condição)

**Não inclui:**
- Fluxo de execução (isso está no feature)
- Internos de workflow (isso está no pipeline)

---

### `*.integration.md` — integrações externas

Documenta integrações com serviços de terceiros (Brevo, Stripe, S3/R2, etc.).

**Inclui:**
- Credenciais/configuração necessária
- Endpoints ou SDKs usados
- Casos de uso no projeto

---

### `*.diagram.md` — diagramas

Diagramas Mermaid de arquitetura, ERD e fluxo conceitual. Atualizados quando o schema ou integrações mudam (ver CLAUDE.md).

---

### `*.reference.md` — referências externas

Análises de repositórios de referência clonados em `temp/`. Registra o que pode ser aproveitado, adaptado ou descartado.

---

## Como trabalhar com a documentação

### Ao criar uma nova feature

1. Crie `3-specs/features/<nome>.feature.md` com o fluxo service/API
2. Se a feature tem workflow de IA → crie `3-specs/pipeline/<nome>.pipeline.md` com os internos
3. Crie `4-contracts/<recurso>.contract.md` com os contratos HTTP
4. Se a feature usa serviço externo novo → crie `3-specs/integrations/<serviço>.integration.md`

### Ao alterar o schema do banco

Atualize `2-architecture/diagrams/logical.diagram.md`.

### Ao adicionar integração externa

Atualize `2-architecture/diagrams/architecture.diagram.md`.

### Ao tomar uma decisão arquitetural relevante

Adicione entrada em `2-architecture/adr.md`.

---

## O que NÃO documentar aqui

- Bugs e fixes pontuais (ficam no commit message)
- Refatorações sem impacto de design
- Estado temporário de implementação (ficam em tasks no `1-product/pm.md` e `1-product/pm/`)
- Código — a documentação descreve design, não implementação linha a linha
