"use client";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            gcTime: 1000 * 60 * 60 * 24,
            staleTime: 1000 * 60 * 5,
          },
        },
      })
  );

  const [persister] = useState(() =>
    createAsyncStoragePersister({
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
    })
  );

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        // Muda quando o FORMATO da resposta de alguma query cacheada quebra
        // (não a cada mudança de conteúdo, só quando o shape muda) — busta o
        // cache de localStorage de qualquer client antigo automaticamente,
        // em vez de crashar tentando ler campo que não existe mais no cache
        // persistido. Bump aqui: metrics passou de generations{completed,failed}
        // para generation{aiGenerated,total} (client antigo não tinha `generation`).
        buster: "metrics-generation-2026-07-17",
      }}
    >
      {children}
      {process.env.NODE_ENV === "development" && <ReactQueryDevtools />}
    </PersistQueryClientProvider>
  );
}
