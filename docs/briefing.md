# Briefing

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

## Funcionalidades principais esperadas

- Geração de apresentação completa a partir de um prompt
- Estrutura inteligente: outline com tipos de slide (cover, agenda, content, summary, closing)
- Representações visuais automáticas: flowchart, mindmap, timeline, architecture, etc.
- Editor Excalidraw integrado para ajustes pós-geração
- Modo apresentação fullscreen
- Colaboração em tempo real (roadmap)
- Exportação PDF / PPT (roadmap)
- Apresentações públicas com link compartilhável (roadmap)

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
