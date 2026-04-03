# GerInvest — Arquitetura Técnica Recomendada

## Arquitetura em camadas

O projeto deve manter separação clara entre:

1. Interface
2. Aplicação
3. Domínio
4. Infraestrutura

## Distribuição sugerida

### `app/`
Contém páginas, layouts, rotas e handlers HTTP do Next.js.
Não deve concentrar regra complexa de cálculo financeiro.

### `components/`
Contém componentes visuais e blocos reutilizáveis de UI.
Não deve conter regra de domínio pesada.

### `src/`
Deve concentrar a lógica principal da aplicação.
Sugestão de organização:

```txt
src/
├── domain/
│   ├── entities/
│   ├── enums/
│   └── rules/
├── application/
│   ├── services/
│   └── use-cases/
├── infrastructure/
│   ├── db/
│   ├── repositories/
│   └── providers/
└── shared/
    ├── types/
    ├── utils/
    └── constants/
```

## Serviços recomendados

- portfolioService
- diversificationService
- fiiAnalysisService
- cryptoAnalysisService
- usExposureService
- fixedIncomeService
- fundAnalysisService
- retirementService

## Regras arquiteturais

1. Components não calculam carteira.
2. Pages não calculam score de diversificação.
3. Services recebem dados já normalizados.
4. Integrações externas ficam isoladas em providers.
5. Cálculo financeiro deve ser testável sem UI.
