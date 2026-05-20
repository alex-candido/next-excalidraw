import { Mastra } from '@mastra/core/mastra'
import { PinoLogger } from '@mastra/loggers'
import { PostgresStore } from '@mastra/pg'
import { multiOutlineCreatorAgent } from './agents/multi-outline-creator-agent'
import { singleOutlineCreatorAgent } from './agents/single-outline-creator-agent'
import { slideCreatorAgent } from './agents/slide-creator-agent'
import { outlineSemanticScorer } from './scorers/outline-semantic-scorer'
import { slideSemanticScorer } from './scorers/slide-semantic-scorer'
import { multiOutlineWorkflow } from './workflows/multi-outline-workflow'
import { singleOutlineWorkflow } from './workflows/single-outline-workflow'
import { slideWorkflow } from './workflows/slide-workflow'

export const mastra = new Mastra({
  agents: {
    multiOutlineCreatorAgent,
    singleOutlineCreatorAgent,
    slideCreatorAgent,
  },
  workflows: {
    multiOutlineWorkflow,
    singleOutlineWorkflow,
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
})
