# Integration: Brevo

Envio de emails transacionais via SDK `@getbrevo/brevo`.

---

## Configuração

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `BREVO_API_KEY` | Não (opcional em dev) | Chave de API do Brevo — obtida em app.brevo.com → API Keys |

> `BREVO_API_KEY` é `optional()` no schema de validação (`src/config/env-config.ts`). Em desenvolvimento local, emails podem ser omitidos; em produção, a ausência da chave fará `emailClient().send()` falhar silenciosamente via SDK.

---

## SDK

```ts
import { BrevoClient } from "@getbrevo/brevo"
```

Cliente instanciado em `src/lib/brevo/index.ts`. Expõe `emailClient()` com método `send({ to, subject, react })` — renderiza o template React para HTML antes de enviar.

Sender fixo: `{ name: "Next Excalidraw", email: "noreply@nextexcalidraw.com" }`.

---

## Emails implementados

Funções em `src/lib/brevo/senders/email-senders.ts` via `emailSenders()`:

| Função | Assunto | Template | Disparado por |
|--------|---------|----------|---------------|
| `sendResetPassword(to, url)` | "Redefina sua senha" | `ResetPasswordEmailTemplate` | Better Auth — fluxo de reset de senha |
| `sendVerification(to, url)` | "Verifique seu e-mail" | `VerifyEmailTemplate` | Better Auth — signup e reenvio de verificação |

Templates em `src/components/emails/` — renderizados com `@react-email/render`.

---

## Integração com Better Auth

O Better Auth chama as funções de envio via callbacks configurados em `src/lib/better-auth/`. Os emails são disparados automaticamente nos seguintes eventos:

- `onSignUp` → `sendVerification`
- `onResetPassword` → `sendResetPassword`

---

## Pontos de atenção

- Templates são server-side apenas — nunca importar em componentes client-side
- URL passada nos emails deve usar `NEXT_PUBLIC_APP_URL` — nunca hardcoded
- Sem suporte a templates Brevo nativos — toda customização é via React Email
