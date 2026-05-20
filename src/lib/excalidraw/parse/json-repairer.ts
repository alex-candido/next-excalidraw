export function jsonRepairer() {
  function stripCodeFences(text: string): string {
    return text
      .replace(/```(?:json|js|javascript)?\n?([\s\S]*?)```/g, "$1")
      .trim();
  }

  function repairAndParseArray(text: string): unknown[] | null {
    const start = text.indexOf("[");
    if (start === -1) return null;

    let depth = 0;
    let inString = false;
    let escape = false;
    let end = -1;

    for (let i = start; i < text.length; i++) {
      const ch = text[i];
      if (escape) {
        escape = false;
        continue;
      }
      if (ch === "\\" && inString) {
        escape = true;
        continue;
      }
      if (ch === '"') {
        inString = !inString;
        continue;
      }
      if (inString) continue;
      if (ch === "[" || ch === "{") depth++;
      else if (ch === "]" || ch === "}") {
        depth--;
        if (depth === 0) {
          end = i + 1;
          break;
        }
      }
    }

    const slice =
      end > start ? text.slice(start, end) : text.slice(start) + "]";

    try {
      return JSON.parse(slice.replace(/,\s*([}\]])/g, "$1")) as unknown[];
    } catch {
      return null;
    }
  }

  function extractObjects(text: string): unknown[] {
    const results: unknown[] = [];
    let i = 0;

    while (i < text.length) {
      const start = text.indexOf("{", i);
      if (start === -1) break;

      let depth = 0;
      let inString = false;
      let escape = false;
      let end = -1;

      for (let j = start; j < text.length; j++) {
        const ch = text[j];
        if (escape) {
          escape = false;
          continue;
        }
        if (ch === "\\" && inString) {
          escape = true;
          continue;
        }
        if (ch === '"') {
          inString = !inString;
          continue;
        }
        if (inString) continue;
        if (ch === "{") depth++;
        else if (ch === "}") {
          depth--;
          if (depth === 0) {
            end = j + 1;
            break;
          }
        }
      }

      if (end > start) {
        try {
          results.push(
            JSON.parse(text.slice(start, end).replace(/,\s*([}\]])/g, "$1")),
          );
        } catch {
          /* skip malformed object */
        }
        i = end;
      } else {
        break;
      }
    }

    return results;
  }

  return { stripCodeFences, repairAndParseArray, extractObjects };
}
