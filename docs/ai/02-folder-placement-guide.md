# GerInvest — Onde colocar cada arquivo no projeto

## Estrutura recomendada

Crie exatamente esta estrutura dentro da raiz do repositório:

```txt
gerinvest/
├── .vscode/
│   ├── ai-context.md
│   └── settings.json                # opcional
├── docs/
│   └── ai/
│       ├── 00-context-overview.md
│       ├── 01-project-analysis.md
│       ├── 02-folder-placement-guide.md
│       ├── 03-domain-model.md
│       ├── 04-tech-architecture.md
│       ├── 05-data-models.md
│       ├── 06-business-rules.md
│       ├── 07-diversification-strategy.md
│       ├── 08-ai-operating-protocol.md
│       ├── 09-copilot-task-system.md
│       └── 10-prompts-library.md
```

## Local de cada arquivo

### `.vscode/ai-context.md`
Use este arquivo como contexto compacto para colar no início das sessões com IA dentro do VS Code.

### `docs/ai/00-context-overview.md`
Resumo executivo do projeto. É o primeiro arquivo a ser lido por qualquer IA.

### `docs/ai/01-project-analysis.md`
Diagnóstico macro do estado atual do projeto e da direção evolutiva.

### `docs/ai/02-folder-placement-guide.md`
Guia de posicionamento e responsabilidade de cada documento.

### `docs/ai/03-domain-model.md`
Modelo conceitual de domínio: carteira, classe, subclasse, posição, custódia, liquidez, moeda, benchmark.

### `docs/ai/04-tech-architecture.md`
Arquitetura técnica: Next.js, services, repositórios, integrações, cache, migrações e separação de camadas.

### `docs/ai/05-data-models.md`
Modelos TypeScript e schema SQL base para evolução multiativo.

### `docs/ai/06-business-rules.md`
Regras canônicas de negócio e cálculo.

### `docs/ai/07-diversification-strategy.md`
Critérios de diversificação por classe de ativo.

### `docs/ai/08-ai-operating-protocol.md`
Regras obrigatórias para qualquer IA usada no repositório.

### `docs/ai/09-copilot-task-system.md`
Sistema de tarefas e subtarefas para orientar o Copilot de forma granular.

### `docs/ai/10-prompts-library.md`
Biblioteca de prompts prontos para refatoração, documentação, modelagem e implementação.
