export type ExcalidrawThemePalette = {
  canvas:    string
  stroke:    string
  text:      string
  primary:   string
  secondary: string
  accent:    string
}

export type ExcalidrawThemeMeta = {
  name:        string
  description: string
  mode:        "light" | "dark"
  font:        string
  palette:     ExcalidrawThemePalette
}

// Papéis semânticos (significado, ex: "isso é um alerta") — ortogonal à
// paleta decorativa do tema (identidade visual) e ao fillStyle (peso/textura,
// ver theme-applicator.ts). Compartilhado por todos os temas do mesmo `mode`
// — verde=sucesso, âmbar=aviso etc. devem significar a mesma coisa
// independente do tema decorativo escolhido, só ajustado pro contraste do
// canvas claro/escuro.
export type SemanticRole = "success" | "warning" | "danger" | "external" | "process" | "trigger" | "neutral"

export type SemanticPair = { fill: string; stroke: string }

const SEMANTIC_LIGHT: Record<SemanticRole, SemanticPair> = {
  success:  { fill: "#dcfce7", stroke: "#166534" },
  warning:  { fill: "#fef9c3", stroke: "#854d0e" },
  danger:   { fill: "#fee2e2", stroke: "#991b1b" },
  external: { fill: "#f3e8ff", stroke: "#6b21a8" },
  process:  { fill: "#e0f2fe", stroke: "#0369a1" },
  trigger:  { fill: "#fed7aa", stroke: "#c2410c" },
  neutral:  { fill: "#f1f5f9", stroke: "#475569" },
}

const SEMANTIC_DARK: Record<SemanticRole, SemanticPair> = {
  success:  { fill: "#14532d", stroke: "#4ade80" },
  warning:  { fill: "#78350f", stroke: "#fbbf24" },
  danger:   { fill: "#7f1d1d", stroke: "#f87171" },
  external: { fill: "#581c87", stroke: "#c084fc" },
  process:  { fill: "#0c4a6e", stroke: "#38bdf8" },
  trigger:  { fill: "#7c2d12", stroke: "#fb923c" },
  neutral:  { fill: "#1e293b", stroke: "#94a3b8" },
}

const SEMANTIC_ROLE_HINTS: Record<SemanticRole, string> = {
  success:  "sucesso, dado, estado concluído",
  warning:  "aviso, decisão, atenção",
  danger:   "erro, crítico, bloqueio",
  external: "externo, IA, terceiros",
  process:  "processo, etapa padrão",
  trigger:  "gatilho, início, entrada",
  neutral:  "neutro, container, zona",
}

export function presentationThemes() {
  const themes: Record<string, ExcalidrawThemeMeta> = {
    daktilo: {
      name:        "Daktilo",
      description: "Moderno e limpo",
      mode:        "light",
      font:        "Inter",
      palette: {
        canvas:    "#FFFFFF",
        stroke:    "#1F2937",
        text:      "#1F2937",
        primary:   "#3B82F6",
        secondary: "#60A5FA",
        accent:    "#F3F4F6",
      },
    },

    noir: {
      name:        "Noir",
      description: "Minimalista escuro",
      mode:        "dark",
      font:        "Inter",
      palette: {
        canvas:    "#111827",
        stroke:    "#E5E7EB",
        text:      "#E5E7EB",
        primary:   "#60A5FA",
        secondary: "#1F2937",
        accent:    "#374151",
      },
    },

    cornflower: {
      name:        "Cornflower",
      description: "Corporativo profissional",
      mode:        "light",
      font:        "Poppins",
      palette: {
        canvas:    "#F8FAFC",
        stroke:    "#334155",
        text:      "#334155",
        primary:   "#4F46E5",
        secondary: "#818CF8",
        accent:    "#FFFFFF",
      },
    },

    indigo: {
      name:        "Indigo",
      description: "Profissional escuro",
      mode:        "dark",
      font:        "Poppins",
      palette: {
        canvas:    "#1E1B4B",
        stroke:    "#E2E8F0",
        text:      "#E2E8F0",
        primary:   "#818CF8",
        secondary: "#312E81",
        accent:    "#4338CA",
      },
    },

    orbit: {
      name:        "Orbit",
      description: "Futurista e dinâmico",
      mode:        "light",
      font:        "Space Grotesk",
      palette: {
        canvas:    "#FFFFFF",
        stroke:    "#1F2937",
        text:      "#1F2937",
        primary:   "#312E81",
        secondary: "#3B82F6",
        accent:    "#F3F4F6",
      },
    },

    cosmos: {
      name:        "Cosmos",
      description: "Espaço profundo",
      mode:        "dark",
      font:        "Space Grotesk",
      palette: {
        canvas:    "#030712",
        stroke:    "#E5E7EB",
        text:      "#E5E7EB",
        primary:   "#818CF8",
        secondary: "#111827",
        accent:    "#60A5FA",
      },
    },

    sunset: {
      name:        "Sunset",
      description: "Quente e acolhedor",
      mode:        "light",
      font:        "DM Serif Display",
      palette: {
        canvas:    "#FFFBEB",
        stroke:    "#292524",
        text:      "#292524",
        primary:   "#EA580C",
        secondary: "#FB923C",
        accent:    "#FFFFFF",
      },
    },

    forest: {
      name:        "Forest",
      description: "Natural e orgânico",
      mode:        "light",
      font:        "Bitter",
      palette: {
        canvas:    "#F0FDF4",
        stroke:    "#1F2937",
        text:      "#1F2937",
        primary:   "#059669",
        secondary: "#34D399",
        accent:    "#FFFFFF",
      },
    },

    piano: {
      name:        "Piano",
      description: "Clássico editorial",
      mode:        "light",
      font:        "Playfair Display",
      palette: {
        canvas:    "#F3F4F6",
        stroke:    "#1F2937",
        text:      "#374151",
        primary:   "#1F2937",
        secondary: "#4B5563",
        accent:    "#FFFFFF",
      },
    },

    ebony: {
      name:        "Ebony",
      description: "Elegante escuro",
      mode:        "dark",
      font:        "Playfair Display",
      palette: {
        canvas:    "#111827",
        stroke:    "#E5E7EB",
        text:      "#E5E7EB",
        primary:   "#E5E7EB",
        secondary: "#1F2937",
        accent:    "#374151",
      },
    },
  }

  function getByKey(key: string): ExcalidrawThemeMeta {
    return themes[key] ?? themes.daktilo
  }

  function getSemanticRoles(key: string): Record<SemanticRole, SemanticPair> {
    const { mode } = getByKey(key)
    return mode === "dark" ? SEMANTIC_DARK : SEMANTIC_LIGHT
  }

  // Nomeia os papéis pra IA (sem hex — a cor real é resolvida em código por
  // theme-applicator.ts, a partir do tema já persistido na Presentation).
  function buildSemanticRolesPrompt(): string {
    const roles = Object.keys(SEMANTIC_ROLE_HINTS) as SemanticRole[]
    return [
      `## Papéis Semânticos`,
      ``,
      `Defina \`role\` no elemento (não hex) — a cor é resolvida automaticamente a partir do tema da apresentação.`,
      ``,
      `| role | Uso |`,
      `|------|-----|`,
      ...roles.map(role => `| \`${role}\` | ${SEMANTIC_ROLE_HINTS[role]} |`),
      ``,
      `Sem \`role\` definido, o elemento cai no papel \`neutral\`.`,
    ].join("\n")
  }

  return { themes, getByKey, getSemanticRoles, buildSemanticRolesPrompt }
}
