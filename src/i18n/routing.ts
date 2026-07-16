import { defineRouting } from "next-intl/routing";

// en-US/es removidos (rota + dicionários apagados) pra economizar token durante o
// desenvolvimento — mantê-los sincronizados com pt-BR mudando o tempo todo não vale
// a pena agora. No final do projeto, recriar as duas locales a partir do pt-BR.
export const routing = defineRouting({
  locales: ["pt-BR"],
  defaultLocale: "pt-BR",
});
