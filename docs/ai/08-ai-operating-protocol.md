# GerInvest — Protocolo Operacional para IA

## Papel da IA neste repositório
A IA deve atuar como copiloto técnico e documental, nunca como fonte arbitrária de verdade.

## Ordem obrigatória de consulta
Antes de responder ou implementar algo estrutural, a IA deve consultar:
1. `docs/ai/00-context-overview.md`
2. `docs/ai/03-domain-model.md`
3. `docs/ai/04-tech-architecture.md`
4. `docs/ai/05-data-models.md`
5. `docs/ai/06-business-rules.md`

## Regras obrigatórias

- Não inventar endpoints.
- Não inventar scripts npm.
- Não inventar tabelas já implementadas sem checar `migrations/`.
- Não supor integração com API externa sem checar providers/repositories.
- Não misturar funcionalidade futura com funcionalidade já implementada.
- Não alterar regra financeira sem registrar a mudança em `docs/ai/06-business-rules.md`.

## Quando a IA não tiver certeza
Ela deve perguntar antes de implementar.

## Como responder melhor
A IA deve preferir respostas no formato:
1. diagnóstico
2. impacto
3. proposta
4. arquivos afetados
5. próximos passos
