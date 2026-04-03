# GerInvest — Sistema de Tarefas para GitHub Copilot

Este arquivo organiza tarefas e subtarefas para o Copilot executar sem perder contexto.

## Regra de execução
O Copilot deve sempre trabalhar em tarefas pequenas, com escopo delimitado e critérios de aceite objetivos.

---

## Tarefa 1 — Consolidar Contexto do Projeto

### Objetivo
Garantir que o repositório tenha uma base documental estável para orientar IA e desenvolvimento.

### Subtarefas
- Criar a pasta `docs/ai/`
- Inserir todos os arquivos de contexto
- Criar `.vscode/ai-context.md`
- Validar links e referências internas

### Critérios de aceite
- Todos os arquivos existem
- O conteúdo não contradiz o README
- Os documentos distinguem claramente presente e futuro

---

## Tarefa 2 — Formalizar Taxonomia Multiativo

### Objetivo
Criar uma taxonomia única de ativos e subclasses.

### Subtarefas
- Definir enum `ClasseAtivo`
- Definir subclasses por classe
- Padronizar nomes entre front, back e docs
- Atualizar docs/ai/03-domain-model.md e docs/ai/05-data-models.md

### Critérios de aceite
- Nenhuma classe duplicada ou ambígua
- Todas as subclasses relevantes documentadas
- O código usa a mesma nomenclatura da documentação

---

## Tarefa 3 — Preparar Modelo de Dados Multiativo

### Objetivo
Criar a base de dados para suportar todos os tipos de ativo.

### Subtarefas
- Revisar `migrations/`
- Propor migration inicial para `carteiras`, `ativos`, `posicoes`
- Validar compatibilidade com importação existente
- Mapear campos obrigatórios por classe de ativo

### Critérios de aceite
- Migration clara e reversível
- Modelo comporta BR, EUA, cripto, fundos, RF, previdência
- Não quebra leitura de dados atual

---

## Tarefa 4 — Preparar Camada de Serviços de Diagnóstico

### Objetivo
Separar serviços de análise da camada de UI.

### Subtarefas
- Criar `diversificationService`
- Criar `fiiAnalysisService`
- Criar `cryptoAnalysisService`
- Criar `fixedIncomeService`
- Criar `fundAnalysisService`

### Critérios de aceite
- Services independentes de componentes React
- Entrada e saída tipadas
- Sem dependência direta de renderização

---

## Tarefa 5 — Evoluir a UX para Cadastro Multiativo

### Objetivo
Permitir cadastro e edição de ativos diversos.

### Subtarefas
- Projetar formulário base
- Criar campos dinâmicos por classe
- Adicionar validação por tipo de ativo
- Definir estratégia de persistência

### Critérios de aceite
- Usuário consegue cadastrar ativos sem ticker B3
- Formulário muda conforme a classe do ativo
- Validação impede cadastros inconsistentes

---

## Tarefa 6 — Criar Diagnóstico de Diversificação

### Objetivo
Transformar o sistema em analista de composição de carteira.

### Subtarefas
- Consolidar alocação por classe
- Consolidar alocação por subclasse
- Calcular score de diversificação
- Gerar alertas de concentração
- Exibir exposição cambial

### Critérios de aceite
- O usuário enxerga distribuição macro e micro
- O sistema aponta concentração por ativo e por classe
- O diagnóstico é coerente com as regras do domínio
