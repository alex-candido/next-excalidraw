import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { PostgresStore } from '@mastra/pg';
import { outlineCreatorAgent } from './agents/outline-creator-agent';
import { slideCreatorAgent } from './agents/slide-creator-agent';
import { outlineSemanticScorer } from './scorers/outline-semantic-scorer';
import { slideSemanticScorer } from './scorers/slide-semantic-scorer';
import { outlineWorkflow } from './workflows/outline-workflow';
import { slideWorkflow } from './workflows/slide-workflow';

export const mastra = new Mastra({
  agents: {
    outlineCreatorAgent,
    slideCreatorAgent,
  },
  workflows: {
    outlineWorkflow,
    slideWorkflow,
  },
  scorers: {
    outlineSemanticScorer,
    slideSemanticScorer,
  },
  storage: new PostgresStore({
    id: 'postgres',
    connectionString: process.env.DATABASE_URL!,
  }),
  logger: new PinoLogger({
    name: 'mastra',
    level: 'debug',
    prettyPrint: true,
  }),
});
