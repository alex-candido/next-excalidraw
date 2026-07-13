# Integration: Resend

Envio de emails transacionais via SDK `resend`.

---

## Configuração

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `RESEND_API_KEY` | Não (opcional em dev) | Chave de API — obtida em resend.com → API Keys |
| `EMAIL_FROM_ADDRESS` | Não — default `onboarding@resend.dev` | E-mail remetente. `onboarding@resend.dev` é o domínio de teste do próprio Resend, funciona sem verificação; um domínio próprio precisa ser verificado (DNS) em resend.com → Domains antes de usar como remetente |
| `EMAIL_FROM_NAME` | Não — default `"Next Excalidraw"` | Nome exibido como remetente |

> Todas opcionais em `src/config/env-config.ts`. Em desenvolvimento local, credenciais podem ser omitidas (o envio falha silenciosamente do ponto de vista do usuário, capturado pelo Better Auth como falha de "background task" — não quebra o fluxo principal de sign-up/reset); em produção, `RESEND_API_KEY` e um `EMAIL_FROM_ADDRESS` de domínio verificado devem estar configurados.

---

## Por que Resend (histórico)

Anteriormente usávamos Brevo (API REST via `@getbrevo/brevo`, depois SMTP relay via `nodemailer`) — ambos os transportes exigiam ativação manual de conta para envio transacional, mesmo com credenciais válidas (`403`/`502 SMTP account is not yet activated`). Testamos com duas contas Brevo diferentes e os dois transportes, sempre com o mesmo bloqueio. Resend não tem esse gate — funciona assim que a conta é criada e a API key é gerada, com um domínio de teste (`onboarding@resend.dev`) liberado por padrão.

---

## Client

```ts
import { Resend } from "resend"
```

Instanciado em `src/lib/resend/index.ts`. Expõe `emailClient()` com método `send({ to, subject, react })`.

Diferença notável em relação ao Brevo: o Resend aceita o componente React (`react: ReactElement`) diretamente em `resend.emails.send()` — não precisamos mais chamar `@react-email/render` manualmente, o próprio SDK renderiza internamente.

Sender configurável via `EMAIL_FROM_NAME`/`EMAIL_FROM_ADDRESS` (`src/config/env-config.ts`) — nunca hardcoded no código.

---

## Emails implementados

Funções em `src/lib/resend/senders/email-senders.ts` via `emailSenders()`:

| Função | Assunto | Template | Disparado por |
|--------|---------|----------|---------------|
| `sendResetPassword(to, url)` | "Redefina sua senha" | `ResetPasswordEmailTemplate` | Better Auth — fluxo de reset de senha |
| `sendVerification(to, url)` | "Verifique seu e-mail" | `VerifyEmailTemplate` | Better Auth — signup e reenvio de verificação |

Templates em `src/components/emails/` — componentes React (`@react-email/components`), sem `render()` manual (ver seção Client acima).

---

## Integração com Better Auth

O Better Auth chama as funções de envio via callbacks configurados em `src/lib/better-auth/`. Os emails são disparados automaticamente nos seguintes eventos:

- `onSignUp` → `sendVerification`
- `onResetPassword` → `sendResetPassword`

---

## Pontos de atenção

- Templates são server-side apenas — nunca importar em componentes client-side
- URL passada nos emails deve usar `NEXT_PUBLIC_APP_URL` — nunca hardcoded
- `EMAIL_FROM_ADDRESS` com domínio próprio precisa estar verificado em resend.com → Domains — enviar de um domínio não verificado falha
- `onboarding@resend.dev` é só para teste/dev — trocar por domínio próprio verificado antes de produção
