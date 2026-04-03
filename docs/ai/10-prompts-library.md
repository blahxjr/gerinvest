# GerInvest — Biblioteca de Prompts

## Prompt 1 — Ler contexto antes de agir

```text
Leia primeiro os arquivos em `docs/ai/` e só depois proponha alterações. Não invente endpoints, scripts npm ou integrações não confirmadas no código. Distinga claramente entre funcionalidade existente e roadmap.
```

## Prompt 2 — Criar migration multiativo

```text
Com base em `docs/ai/03-domain-model.md`, `docs/ai/05-data-models.md` e na pasta `migrations/`, proponha a próxima migration para suportar cadastro multiativo. Antes de escrever, liste as tabelas existentes e explique como evitar quebrar a estrutura atual.
```

## Prompt 3 — Criar service de diversificação

```text
Use `docs/ai/06-business-rules.md` e `docs/ai/07-diversification-strategy.md` para implementar um `diversificationService`. O service deve receber posições já normalizadas e devolver alocação por classe, por subclasse, score de diversificação e alertas de concentração.
```

## Prompt 4 — Revisar README sem inventar

```text
Revise o README com base apenas no que estiver confirmado no código. Não adicione versões exatas, scripts não existentes ou integrações futuras como se já estivessem prontas.
```

## Prompt 5 — Criar formulário de cadastro multiativo

```text
Analise a estrutura atual do projeto e proponha um formulário de cadastro multiativo. Use campos dinâmicos por classe de ativo e valide cada grupo com regras específicas. Antes de codar, apresente a estrutura de tipos, componentes e fluxo de persistência.
```
