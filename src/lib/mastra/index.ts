import { Mastra } from '@mastra/core/mastra';
import { PostgresStore } from '@mastra/pg';
import { PinoLogger } from '@mastra/loggers';
import { outlineCreatorAgent } from './agents/outline-creator-agent';
import { outlineSemanticScorer } from './scorers/outline-semantic-scorer';
import { outlineWorkflow } from './workflows/outline-workflow';

export const mastra = new Mastra({
  agents: {
    outlineCreatorAgent,
  },
  workflows: {
    outlineWorkflow,
  },
  scorers: {
    outlineSemanticScorer,
  },
  storage: new PostgresStore({
    connectionString: process.env.DATABASE_URL!,
  }),
  logger: new PinoLogger({
    name: 'mastra',
    level: 'debug',
    prettyPrint: true,
  }),
});
