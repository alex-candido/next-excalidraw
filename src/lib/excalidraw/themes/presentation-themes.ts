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

  function buildPalettePrompt(key: string): string {
    const { name, palette } = getByKey(key)
    return [
      `## Paleta de Cores — Tema ${name}`,
      ``,
      `| Papel        | Hex       | Usar em                                       |`,
      `|--------------|-----------|-----------------------------------------------|`,
      `| canvas       | ${palette.canvas}  | viewBackgroundColor do appState               |`,
      `| stroke       | ${palette.stroke}  | strokeColor padrão de shapes                  |`,
      `| text         | ${palette.text}  | strokeColor de elementos text                 |`,
      `| primary      | ${palette.primary}  | backgroundColor do elemento principal         |`,
      `| secondary    | ${palette.secondary}  | backgroundColor de elementos de suporte       |`,
      `| accent       | ${palette.accent}  | backgroundColor de containers/zonas           |`,
    ].join("\n")
  }

  return { themes, getByKey, buildPalettePrompt }
}
