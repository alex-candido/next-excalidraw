@AGENTS.md

## Documentação

### tasks.md
- Ao iniciar uma tarefa → mover de Backlog para Active
- Ao concluir uma tarefa → mover de Active para Done
- Ao identificar trabalho novo → adicionar no Backlog

### adr.md
- Ao tomar uma decisão arquitetural relevante → adicionar uma entrada em `docs/adr.md`
- Não registrar: bugs, refatorações menores, ajustes de prompt

### logical-diagram.md
- Ao alterar qualquer tabela, campo ou enum no schema do banco (`src/lib/drizzle/schema/`) → atualizar `docs/diagrams/logical-diagram.md`

### architecture-diagram.md
- Ao adicionar ou remover uma integração externa (serviço, plataforma, API de terceiro) → atualizar `docs/diagrams/architecture-diagram.md`
