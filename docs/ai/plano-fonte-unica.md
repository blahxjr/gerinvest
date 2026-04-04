# Plano Fonte Unica PostgreSQL — Status e Execucao

## Status das Fases [Atualizar aqui]

| Fase | Status | Responsavel | Data |
|---|---|---|---|
| Fase 1 - Congelar leitura por CSV | Concluida | Copilot + Time | 2026-04-03 |
| Fase 2 - Repositories SQL para Dashboard | Concluida | Copilot + Time | 2026-04-03 |
| Fase 3 - Importadores DB-only | Concluida | Copilot | 2026-04-03 |
| Fase 4 - Unificacao APIs de posicao | Concluida | Copilot | 2026-04-03 |
| Fase 5 - Descomissionamento CSV | Em andamento | Copilot | 2026-04-03 |

## Execucao atual

- Dashboard principal migrado para fonte SQL (PostgresPortfolioRepository)
- API `/api/dashboard-data` migrada para fonte SQL
- Metodos SQL adicionados: `getAllPositions`, `getSummary`, filtros por classe/instituicao, `getLastImportDate`
- API `/api/analysis` migrada para fonte SQL (getPortfolioRepository)
- API `/api/positions/[id]` (PATCH/DELETE) migrada para fonte SQL
- Pagina `/posicoes` migrada para fonte SQL
- **Fase 3 concluida:**
  - `upload-b3/route.ts` reescrito: removida escrita legacy (`posicoes_diarias`) e CSV sync, agora usa `persistPositionsToPostgres` (schema 004)
  - `upload-positions/google-sheet/route.ts` migrado: adicionado `persistPositionsToPostgres` apos importacao, removidos console.log de debug, corrigido auth bypass
  - `upload-positions/route.ts` ja estava limpo (usa `persistPositionsToPostgres`)
- **Codigo morto removido:**
  - `src/app/api/dashboard-data/route.ts` (duplicata com CsvPortfolioRepository)
  - `src/app/api/upload-positions/route.ts` (duplicata sem persistencia)
  - Diretorio `src/app/` removido (vazio)
- **Todas as rotas agora usam PostgresPortfolioRepository como fonte unica**
- Proximo passo: Fase 3 (importadores gravando somente no banco) e Fase 5 (descomissionar CsvPortfolioRepository)
