# Feature: Auth

Fluxo de autenticação usando Better Auth com email/senha e OAuth.

## Visão geral

```
/auth/sign-up     → cadastro com email + senha
/auth/sign-in     → login com email + senha
/auth/sign-in     → login com OAuth (Google)
/auth/forgot-password → solicitar reset de senha
/auth/reset-password  → definir nova senha via token
```

Todas as rotas de auth são gerenciadas pelo Better Auth via `/api/auth/[...all]/route.ts`.

---

## Sign-up

### Entrada

```ts
{ name: string; email: string; password: string }
```

### Etapas

```
1. Better Auth valida email único + força da senha
2. Cria User no banco
3. Envia email de verificação via Brevo
4. Redirect → /auth/sign-in (aguardando verificação)
```

---

## Sign-in (email/senha)

### Etapas

```
1. Better Auth valida credenciais
2. Cria Session { token, expiresAt, ipAddress, userAgent }
3. Seta cookie de sessão
4. Redirect → /app/dashboard
```

---

## Sign-in (OAuth — Google)

### Etapas

```
1. Redirect para Google OAuth
2. Callback → Better Auth cria/atualiza Account vinculado ao User
3. Cria Session
4. Redirect → /app/dashboard
```

---

## Forgot Password

### Etapas

```
1. Usuário informa email
2. Better Auth cria Verification { identifier: email, value: token, expiresAt }
3. Envia email com link de reset via Brevo
```

---

## Reset Password

### Etapas

```
1. Usuário acessa link com token
2. Better Auth valida Verification (token + expiresAt)
3. Atualiza senha no Account
4. Invalida Verification usada
5. Redirect → /auth/sign-in
```

---

## Proteção de rotas

Definida em `src/middleware/auth-route-middleware.ts`:

```
Rotas protegidas: /app/**, /api/v1/app/**
  → sem sessão válida → redirect /auth/sign-in

Rotas admin: /admin/**, /api/v1/admin/**
  → requer role admin → sem permissão → redirect /app/dashboard

Rotas públicas: /auth/**, /landing/**, /api/auth/**
  → sempre acessíveis
```

---

## Pontos de atenção

- `userId` nas API routes vem da sessão Better Auth — nunca do body da request
- Verificação de email é obrigatória antes do primeiro login
- Sessões expiram conforme `expiresAt` — Better Auth gerencia renovação automática
- OAuth cria Account vinculado ao User — mesmo email pode ter múltiplos providers
