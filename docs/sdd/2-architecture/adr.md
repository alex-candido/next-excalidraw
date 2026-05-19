# Architecture Decision Records

---

## ADR-001 — ExcalidrawElementSkeleton como formato de dados dos slides

**Data:** 2026-05  
**Status:** Aceito

**Contexto:** Precisávamos de um formato para representar slides gerados por AI que pudesse ser armazenado no banco, transmitido pela API e convertido para o canvas Excalidraw.

**Decisão:** Usar `ExcalidrawElementSkeleton[]` como formato canônico. Skeletons são armazenados brutos no banco (jsonb) e convertidos para `ExcalidrawElement[]` apenas no cliente via `convertToExcalidrawElements`.

**Alternativas consideradas:**
- XML estruturado (abordagem do `presentation-ai` com Plate.js) — rejeitado por ser menos tipado e incompatível com a API nativa do Excalidraw
- JSON livre/schema próprio — rejeitado por duplicar o schema já definido pelo `@excalidraw/excalidraw`

**Consequências:** `lib/excalidraw/serialize/` é client-side only. O banco armazena skeletons brutos, nunca `ExcalidrawElement[]` completos.

---

## ADR-002 — Mastra como framework de AI pipeline

**Data:** 2026-05  
**Status:** Aceito

**Contexto:** Precisávamos de um framework para orquestrar agentes LLM com tool calls, steps tipados, scorers e metadata de execução.

**Decisão:** Usar Mastra com Google Gemini como provider principal. Workflows (`outlineWorkflow`, `slideWorkflow`) são compostos por steps tipados com schemas Zod.

**Alternativas consideradas:**
- LangChain/LangGraph — mais verboso, requer mais boilerplate para typing; `presentation-ai` usa essa stack
- Gemini SDK nativo — sem abstração de workflow; avaliado como opção de migração futura se o Mastra trouxer overhead desnecessário

**Consequências:** tools são definidas via `createTool` do Mastra. Se migrarmos para Gemini SDK nativo, os prompts e schemas Zod são reaproveitáveis — só a orquestração muda.

---

## ADR-003 — Tool call estruturada como mecanismo de output do LLM

**Data:** 2026-05  
**Status:** Aceito

**Contexto:** O LLM precisava retornar `ExcalidrawElementSkeleton[]` de forma confiável e estruturada.

**Decisão:** Usar tool call (function calling) como único mecanismo de output. O agente é instruído a sempre chamar a tool (`outlineStructureTool`, `slideStructureTool`) — nunca responder em texto livre.

**Alternativas consideradas:**
- Parsing de texto livre com `parseSkeletons` — mantido como fallback mas não como caminho principal; LLMs frequentemente falham em JSON puro sem function calling

**Consequências:** `validateSkeletons` é o caminho principal; `parseSkeletons` é fallback. Retry automático em falha de tool call é uma tarefa pendente (P2).

---

## ADR-004 — Slides separados por entidade (não frames do Excalidraw)

**Data:** 2026-05  
**Status:** Pendente de decisão

**Contexto:** O editor precisa navegar entre slides. Duas abordagens possíveis: (1) um canvas único com N frames do Excalidraw, cada frame = um slide; (2) um array de `ExcalidrawElementSkeleton[]` por slide no banco, canvas recarregado ao navegar.

**Decisão:** Ainda não definida. Decidir antes de implementar o editor.

**Trade-offs:**
- Frames: navegação fluida no canvas, mais próximo do Excalidraw nativo; mas drag entre slides é mais complexo e o payload cresce com o número de slides
- Slides separados: isolamento total, payload menor por requisição, mais simples para persistência; mas requer reload do canvas ao trocar de slide

**Referência:** `inscribed/Canvas.tsx` usa frames. Nossa estrutura de banco (`slide.elements` por registro) favorece slides separados.

---

## ADR-005 — Modalidades Multi e Single como fluxos distintos

**Data:** 2026-05  
**Status:** Aceito (conceitual — implementação Ciclo 5)

**Contexto:** O produto atende dois casos de uso diferentes: apresentação completa (Multi) e diagrama único (Single).

**Decisão:** Tratar Multi e Single como modalidades separadas com workflows independentes. Single não passa por outline — vai direto para geração de elementos. Single também suporta vision model (imagem → Excalidraw).

**Consequências:** O `slideWorkflow` atual pode ser reutilizado no Single com parâmetros simplificados (tipo e representação fornecidos diretamente pelo usuário). Um step dedicado para vision (image → skeleton) precisará ser criado para o subtipo de digitalização de imagem.
