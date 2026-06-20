# Feature: Landing & Onboarding Flow

Cobre o fluxo completo desde a chegada do usuário na landing até a criação da primeira apresentação.

## Visão geral

```
/landing/home  (marketing)
       │
       ▼ CTA
/auth/sign-up  ou  /auth/sign-in
       │
       ▼ autenticado
/app  (dashboard)
       │
       ▼ "Nova Apresentação"
/presentations/new/[type]
       │
       └─ continua em presentation-creation.feature.md
```

---

## Etapa 1 — Landing Home (`/landing/home`)

Primeira impressão do produto. Objetivo: converter visitante em usuário cadastrado.

### Proposta de valor

- **Headline:** comunicar a transformação — prompt → slides Excalidraw prontos
- **Sub-headline:** eliminar a fricção entre ter uma ideia e comunicá-la visualmente
- **Diferencial:** estilo handdrawn reconhecível, voltado para comunicação técnica e educacional

### Seções esperadas

| Seção | Objetivo |
|-------|----------|
| Hero | Headline + sub-headline + CTA primário |
| Demo / preview | Exemplo visual do resultado (prompt → slide gerado) |
| Casos de uso | Educadores, engenheiros, gestores — dores e como o produto resolve |
| Modalidades | Multi (apresentação completa) vs Single (diagrama único) |
| CTA final | Reforço para cadastro |

### CTAs

- **Primário:** "Começar grátis" → `/auth/sign-up`
- **Secundário:** "Entrar" → `/auth/sign-in`

### Rotas relacionadas

```
/landing/home                                    → página principal
/landing/product/multi                           → detalhe da modalidade Multi
/landing/product/single                          → detalhe da modalidade Single
/landing/institutional/about                     → sobre o produto e o time
/landing/resources/blog                          → listagem de posts
/landing/resources/blog/[slug]                   → detalhe do post
/landing/resources/contact                       → contato e suporte
/landing/transparency/legal/privacy-policy       → política de privacidade
/landing/transparency/legal/terms                → termos de uso
```

---

## Etapa 2 — Auth (`/auth/sign-up` e `/auth/sign-in`)

Detalhado em `auth.feature.md`. Resumo do fluxo:

```
Sign-up
  → cadastro (nome, email, senha)
  → email de verificação (Brevo)
  → redirect → /auth/sign-in

Sign-in
  → credenciais válidas
  → sessão criada (Better Auth)
  → redirect → /app
```

---

## Etapa 3 — Dashboard (`/app`)

Primeira tela do usuário autenticado. Ponto de entrada para todas as apresentações.

### Estados

**Empty state** — usuário sem apresentações:
- Mensagem de boas-vindas
- CTA destacado: "Criar primeira apresentação" → `/presentations/new/1`

**Estado padrão** — usuário com apresentações:
- Lista/grid de presentation cards
- Cada card: título, tipo (Multi/Single), data, status, thumbnail (quando disponível)
- Ações por card: abrir editor, abrir outline, excluir
- Botão fixo: "Nova Apresentação" → modal ou redirect para `/presentations/new/[type]`

### Seleção de tipo

Ao clicar em "Nova Apresentação", o usuário escolhe entre:

| Tipo | Valor | Descrição |
|------|-------|-----------|
| Multi | `1` | Apresentação completa — prompt → outline → N slides |
| Single | `0` | Diagrama único — prompt → 1 slide (Ciclo 5) |

> **Ciclo atual:** apenas Multi está implementado. Single pode aparecer como desabilitado/em breve.

Redirect após seleção: `/presentations/new/[type]`

---

## Etapa 4 — Form de Criação (`/presentations/new/[type]`)

Entrada do fluxo de criação. Detalhado em `presentation-creation.feature.md`. Resumo:

```
Campos do form:
  userPrompt   → textarea (obrigatório)
  language     → select (default: en)
  aspectRatio  → select (default: 16:9)
  slideCount   → number (default: 0 = automático)
  amount       → select (default: auto)
  audience     → select (default: general)
  scenario     → select (default: auto)
  theme        → select (default: daktilo)
  keywords     → tags input (opcional)

Submit:
  → POST /api/v1/app/presentations
  → POST /api/v1/app/presentations/[id]/outlines/generate   (loading state)
  → redirect → /presentations/[id]/outline
```

---

## Pontos de atenção

- Usuário autenticado acessando `/landing/home` → redirect para `/app`
- Usuário não autenticado acessando `/app/**` → redirect para `/auth/sign-in`
- `type` na URL de `/presentations/new/[type]` deve ser validado — valor inválido → redirect para `/presentations/new/1`
- Dashboard só exibe presentations do `userId` da sessão — sem exposição entre usuários
- Empty state deve orientar claramente o próximo passo — sem tela em branco
