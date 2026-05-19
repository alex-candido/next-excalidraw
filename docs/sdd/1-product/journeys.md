# Journeys

Jornadas de uso por persona. Cada jornada descreve o contexto, o caminho percorrido no produto e o resultado esperado.

---

## Jornada 1 — Ana cria material didático para uma aula

**Persona:** Ana, a Educadora  
**Modalidade:** Multi  
**Gatilho:** Precisa preparar slides para a aula de "Padrões de Arquitetura" de amanhã

```
1. Acessa /presentations/new
   → Digita: "Padrões de arquitetura de software: MVC, Clean Architecture e Hexagonal"
   → Seleciona idioma: Português, slideCount: 8, aspectRatio: 16:9

2. Sistema gera outline em ~15s
   → Ana revisa os 8 slides propostos
   → Ajusta a representação do slide 4 de "flowchart" para "architecture"
   → Confirma

3. Sistema gera os 8 slides em ~2min
   → Redireciona para o editor

4. Ana revisa os slides no editor
   → Slide 3 ficou confuso — usa o chat: "Simplifica o diagrama do MVC, está poluído demais"
   → Agent regera o slide com menos elementos

5. Exporta como PDF e sobe no Moodle
```

**Resultado:** Material pronto em ~10 minutos, sem abrir PowerPoint ou Miro.

---

## Jornada 2 — Ana digitaliza um esboço de quadro branco

**Persona:** Ana, a Educadora  
**Modalidade:** Single — foto com anotações  
**Gatilho:** Após uma aula, fotografou o quadro branco com um diagrama de estados que quer usar no material

```
1. Acessa /single/new
   → Seleciona subtipo: "Foto com anotações"
   → Faz upload da foto do quadro branco
   → Idioma: Português

2. Sistema processa a imagem via vision model (~20s)
   → Gera ilustração Excalidraw fiel ao diagrama do quadro

3. Ana revisa no editor
   → Ajusta algumas posições manualmente no canvas
   → Salva

4. Copia o link do diagrama e insere no documento da aula no Notion
```

**Resultado:** Diagrama digital limpo em 2 minutos, sem precisar redesenhar do zero.

---

## Jornada 3 — Rafael documenta uma decisão de arquitetura

**Persona:** Rafael, o Engenheiro de Software  
**Modalidade:** Single — diagrama por prompt  
**Gatilho:** Acabou de definir a arquitetura de um novo serviço de notificações e precisa documentar

```
1. Acessa /single/new
   → Seleciona subtipo: "Diagrama por prompt"
   → Representação: "architecture"
   → Digita: "Serviço de notificações: API Gateway → Notification Service → 
      fila SQS → workers (email/push/sms) → providers externos"

2. Sistema gera o diagrama em ~15s
   → Rafael revisa no editor
   → Adiciona uma label manualmente para o provider de SMS

3. Compartilha o link com o time no Slack para revisão
   → Time deixa comentários → Rafael ajusta via chat de edição

4. Insere o diagrama no ADR no Notion
```

**Resultado:** Diagrama de arquitetura documentado e compartilhado em menos de 5 minutos.

---

## Jornada 4 — Rafael apresenta um RFC para o time

**Persona:** Rafael, o Engenheiro de Software  
**Modalidade:** Multi  
**Gatilho:** Precisa apresentar uma proposta de migração de monolito para microsserviços

```
1. Acessa /presentations/new
   → Digita: "Proposta de migração gradual do monolito para microsserviços: 
      contexto, problemas atuais, estratégia strangler fig, fases e riscos"
   → slideCount: 7, idioma: Inglês

2. Sistema gera outline
   → Rafael ajusta: muda representação do slide de estratégia para "timeline"

3. Sistema gera os slides
   → Abre no editor, revisa

4. Apresenta no modo present para o time
   → Após feedback, usa o chat: "Adiciona um slide de Q&A no final"

5. Compartilha o link da apresentação com o time
```

**Resultado:** RFC apresentado visualmente sem perder tempo com ferramentas de slide.

---

## Jornada 5 — Carla prepara o quarterly review

**Persona:** Carla, a Gestora  
**Modalidade:** Multi  
**Gatilho:** Quarterly review com o C-level em 2 dias

```
1. Acessa /presentations/new
   → Digita: "Q3 Product Review: métricas de crescimento, principais entregas, 
      obstáculos e roadmap Q4"
   → slideCount: 10, idioma: Português

2. Sistema gera outline
   → Carla reorganiza a ordem de dois slides
   → Confirma

3. Sistema gera os 10 slides
   → Abre no editor

4. Aplica o tema da empresa via seletor de temas
   → Ajusta cores para a paleta da marca

5. Usa o chat para refinar narrativa:
   "O slide de métricas está muito técnico. Reescreve focando no impacto no negócio"

6. Compartilha com o CPO via link para revisão antes da reunião

7. Apresenta no modo present no dia da reunião
```

**Resultado:** Quarterly review pronto em 30 minutos, sem designer, com visual consistente.

---

## Jornada 6 — Carla colabora com o time em um roadmap

**Persona:** Carla, a Gestora  
**Modalidade:** Multi + Colaboração  
**Gatilho:** Quer construir o roadmap Q4 junto com os tech leads

```
1. Cria a apresentação base do roadmap

2. Convida os 3 tech leads como editores via grupo de trabalho

3. Cada tech lead edita os slides da sua área no editor
   → Mudanças aparecem em tempo real para todos

4. Carla revisa o resultado final
   → Usa o chat para ajustar o tom executivo dos slides

5. Publica com link público para toda a empresa
```

**Resultado:** Roadmap construído colaborativamente sem vai-e-vem de arquivos por email.
