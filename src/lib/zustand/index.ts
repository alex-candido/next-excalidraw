import { create } from "zustand"
import { devtools } from "zustand/middleware"
import type { StateCreator } from "zustand"

// Wrapper fino em volta do create() do zustand — toda store nova do projeto
// passa por aqui (não por zustand direto), pra ganhar Redux DevTools em dev
// de graça, sem configurar isso store por store. Integração real com a lib
// (mesmo papel de lib/drizzle, lib/better-auth etc.) — a store de domínio em
// si (o que guarda/faz) fica em src/store/, não aqui.
export function createAppStore<T>(name: string, initializer: StateCreator<T, [], []>) {
  return create<T>()(devtools(initializer, { name, enabled: process.env.NODE_ENV === "development" }))
}
