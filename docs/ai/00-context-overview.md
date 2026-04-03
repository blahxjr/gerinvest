# GerInvest — Contexto Geral do Projeto

O GerInvest é uma plataforma web para consolidação e análise de carteiras de investimento de pessoas físicas brasileiras.

## Objetivo central

Permitir que o usuário concentre em um único sistema todos os seus ativos financeiros, incluindo:
- Ativos listados na B3
- Bolsa americana
- Fundos de investimento não listados na B3
- Criptomoedas
- Renda fixa
- Poupança
- Previdência privada

## Estado atual observado

Com base na estrutura visível do repositório, o projeto já possui uma base organizada com:
- Next.js com App Router
- Estrutura `app/`, incluindo `(auth)`, `(dashboard)` e `api`
- Pastas `components/`, `docs/`, `migrations/`, `public/`, `scripts/` e `src/`
- Arquivos de configuração como `package.json`, `next.config.ts`, `tsconfig.json` e `.gitignore`

## Direção estratégica

O sistema deve evoluir de um painel de posições para uma plataforma de diagnóstico patrimonial. Isso significa sair de uma visão de “ativos cadastrados” para uma visão de:
- composição da carteira
- concentração de risco
- distribuição por classe
- exposição geográfica e cambial
- diagnóstico de diversificação
- recomendação de rebalanceamento

## Princípios do produto

1. O sistema deve aceitar cadastro manual e importação.
2. A análise deve funcionar mesmo sem integração automática com todas as APIs.
3. O modelo de dados precisa ser multiativo desde a base.
4. O diagnóstico deve considerar a estratégia dentro de cada classe de ativo.
5. A IA usada no projeto nunca deve inventar estrutura, regra ou integração sem validação no código e na documentação.
