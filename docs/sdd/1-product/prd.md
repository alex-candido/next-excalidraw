# Product Requirements

## Descrição

Plataforma SaaS que transforma prompts de texto em apresentações visuais completas no estilo Excalidraw, geradas por IA. O usuário descreve o que quer apresentar e recebe slides prontos — com estrutura, layout e elementos visuais criados automaticamente.

## Objetivo

Eliminar a fricção entre ter uma ideia e comunicá-la visualmente. Hoje, criar uma apresentação com qualidade exige tempo, habilidade de design e ferramentas complexas. Nosso objetivo é reduzir esse processo a um único prompt.

## Público-alvo

| Segmento | Perfil | Dor principal |
|---|---|---|
| Educadores | Professores, instrutores, criadores de conteúdo | Tempo para criar material didático visual |
| Profissionais técnicos | Engenheiros, arquitetos de software, PMs | Documentar e comunicar sistemas rapidamente |
| Gestores | Líderes de equipe, executivos | Apresentações executivas sem depender de design |

## Modalidades

| Modalidade | Descrição | Input |
|---|---|---|
| **Multi** | Apresentação completa: prompt → outline → N slides | Texto |
| **Single** | Diagrama único: prompt → 1 slide/diagrama | Texto, imagem de referência ou foto com anotações |

**Multi** é o fluxo atual e principal. **Single** cobre casos de uso pontuais: explicar um conceito em documento, vídeo ou post, digitalizar um esboço de quadro branco, gerar um diagrama isolado.

### Subtipos de Single

| Subtipo | Input | Resultado |
|---|---|---|
| Diagrama por prompt | Texto livre | Representação Excalidraw do tipo escolhido (flowchart, mindmap, etc.) |
| Imagem como referência | Upload de imagem | Excalidraw gerado com base no conteúdo visual da imagem |
| Foto com anotações | Foto de quadro branco / esboço | Ilustração Excalidraw fiel à imagem — digitalização via vision model |

## Funcionalidades principais esperadas

**Geração AI**
- Geração de apresentação completa a partir de um prompt (Multi)
- Geração de diagrama único a partir de texto (Single)
- Upload de imagem → geração de ilustração Excalidraw (Single — vision model)
- Digitalização de esboços / quadros brancos com anotações (Single — vision model)
- Estrutura inteligente: outline com tipos de slide (cover, agenda, content, summary, closing)
- Representações visuais automáticas: flowchart, mindmap, timeline, architecture, etc.
- Regeneração individual de outline sem reprocessar toda a apresentação

**Editor**
- Editor Excalidraw integrado para ajustes pós-geração
- Templates de slides pré-montados para criar slides sem passar pelo outline
- Controle de densidade de elementos por slide (light / medium / rich)
- Modo apresentação fullscreen

**Chat de Edição (Agent)**
- Chat interativo para sugestões e edições de conteúdo (Multi e Single)
- Agent com tools estruturadas: editar propriedades, regenerar slide, criar/remover slide, aplicar tema
- Sugestões contextuais baseadas no conteúdo da apresentação

**Colaboração**
- Grupos de trabalho entre usuários para co-editar apresentações em tempo real
- Compartilhamento com link (visualização pública ou por convite)
- Controle de permissões por grupo/membro

**Personalização**
- Sistema de temas com paletas de cores semânticas
- Escolha de tipografia (heading + body)
- Customização de background por apresentação ou por slide

**Exportação e Infraestrutura (roadmap)**
- Exportação PDF / PPT
- Thumbnails automáticos por slide
- Apresentações públicas com link compartilhável
- Billing por uso de geração AI

## Stacks trabalhadas

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router) |
| AI Pipeline | Mastra + Google Gemini |
| Canvas | Excalidraw (ExcalidrawElementSkeleton API) |
| Banco de dados | PostgreSQL + Drizzle ORM |
| Auth | Better Auth |
| Email | Brevo |
| UI | shadcn/ui + Tailwind CSS |

## Contexto de mercado

Ferramentas atuais de apresentação (Slides, PowerPoint, Gamma, Beautiful.ai) exigem que o usuário saiba design ou aceite templates genéricos. Ferramentas de diagramação (Excalidraw, Miro, Figma) têm curva de aprendizado e são manuais.

O diferencial está na combinação: **geração AI + canvas Excalidraw**. O estilo handdrawn é reconhecível, menos formal e mais adequado para comunicação técnica e educacional do que slides corporativos tradicionais.

## Resultados esperados

- **MVP**: usuário consegue gerar uma apresentação de 5–9 slides a partir de um prompt em menos de 60 segundos
- **Médio prazo**: plataforma com apresentações salvas, editáveis e compartilháveis
- **Longo prazo**: hub de apresentações públicas, monetização por uso de geração AI
