import { Agent } from "@mastra/core/agent";
import { readFileSync } from "fs";
import { join } from "path";
import { outlineTool } from "@/lib/mastra/tools/outline-tool";

const instructions = readFileSync(
  join(process.cwd(), "src/lib/mastra/prompts/outline-promp.md"),
  "utf-8"
);

export const outlineAgent = new Agent({
  name: "outline-agent",
  instructions,
  model: {
    id: "google/gemini-2.5-flash",
    apiKey: process.env.GEMINI_API_KEY!,
  },
  tools: { outlineTool },
});
