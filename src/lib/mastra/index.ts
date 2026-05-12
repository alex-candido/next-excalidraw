import { Mastra } from '@mastra/core/mastra';
import { outlineAgent } from './agents/outline-agent';
import { outlineQualityScorer } from './scorers/outline-scorer';
import { outlineWorkflow } from './workflows/outline-workflow';


export const mastra = new Mastra({
  agents: {
    outlineAgent,
  },
  workflows: {
    outlineWorkflow,
  },
  scorers: {
    outlineQualityScorer,
  },
  // storage: new LibSQLStore({
  // }),
  // logger: new PinoLogger({
  // }),
});