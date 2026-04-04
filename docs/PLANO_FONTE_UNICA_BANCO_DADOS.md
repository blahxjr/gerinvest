# Plano de Fonte Unica no Banco de Dados

## Objetivo

Garantir que toda informacao exibida no sistema (dashboard, KPIs, tabelas, analises) venha exclusivamente do banco de dados PostgreSQL.

A importacao por Google Sheets deve ser apenas um mecanismo de entrada de dados para o banco, sem alimentar CSVs locais como fonte de leitura do produto.

---

## Diagnostico Atual

Hoje existem duas fontes de dados em paralelo:

1. CSV local (principal no dashboard)
- Arquivo principal: `public/data/portfolio-positions.csv`
- Leitura principal do dashboard via `CsvPortfolioRepository`
- `app/page.tsx` e `app/api/dashboard-data/route.ts` dependem desta fonte

2. Banco PostgreSQL (parcial)
- Usado por rotas como `app/api/posicoes/route.ts` e importacao B3 (`app/api/upload-b3/route.ts`)
- Entidades de cadastro (clientes, contas, ativos, carteiras) ja possuem estrutura em migrations/repositories
- Nao e a fonte oficial do dashboard hoje

### Consequencias tecnicas

- Inconsistencia: um dado pode estar no Postgres e nao aparecer no dashboard
- Duplicidade de logica: transformacao/calculo em caminhos diferentes (CSV vs DB)
- Risco de divergencia operacional e auditoria
- Maior custo de manutencao

---

## Decisao de Arquitetura (Fonte Unica)

A partir da migracao, a arquitetura alvo sera:

- Fonte unica: PostgreSQL
- CSVs: apenas artefatos temporarios de importacao (opcional), nunca fonte de leitura da UI
- Dashboard e APIs de analise: leitura apenas por repositories SQL
- Google Sheets / B3: pipelines de ingestao para o banco

Fluxo alvo:

Google Sheets / B3 / cadastro manual -> API de ingestao -> validacao -> UPSERT no Postgres -> consultas consolidadas SQL -> dashboard

---

## Escopo Funcional

1. Dashboard
- `app/page.tsx` e `app/api/dashboard-data/route.ts` passam a consultar repository Postgres
- KPIs, alocacao, concentracao e top posicoes calculados sobre dados SQL

2. Importacoes
- Google Sheets: somente ingestao para banco
- Upload B3: somente ingestao para banco
- Excel/CSV: opcional para entrada, sempre persistindo no banco

3. Edicao manual
- `PATCH/DELETE /api/positions/[id]` passam a operar em repository Postgres
- `router.refresh()` recarrega dados vindos do banco

4. Analises
- `app/api/analysis/route.ts` consome posicoes do banco
- Servicos de dominio continuam puros e reutilizados

---

## Plano de Execucao

## Fase 1 - Congelar leitura por CSV (curto prazo)

Objetivo: impedir novas dependencias de CSV na camada de leitura.

Acoes:
- Marcar `CsvPortfolioRepository` como legado (somente fallback temporario)
- Proibir novas features lendo `public/data/*.csv`
- Definir criterio de pronto: dashboard principal lendo do Postgres em ambiente dev

Entregas:
- Documento de decisao tecnica (este plano)
- Checklist de arquivos afetados

---

## Fase 2 - Repositories SQL para dashboard (semana 1)

Objetivo: trocar a fonte do dashboard para Postgres.

Acoes:
- Criar/ajustar metodos no `PostgresPortfolioRepository`:
  - `getAllPositions()`
  - `getSummary()`
  - filtros por classe/instituicao
- Adaptar `app/page.tsx` para usar repository SQL
- Adaptar `app/api/dashboard-data/route.ts` para repository SQL
- Manter `portfolioService` como camada de calculo

Criterio de pronto:
- Dashboard renderiza somente com dados SQL
- Sem leitura de `public/data/portfolio-positions.csv` no caminho principal

---

## Fase 3 - Importadores como ingestao DB-only (semana 1-2)

Objetivo: importacao deixa de ser fonte paralela.

Acoes:
- `googleSheetsImporter`: persistir direto em tabelas `ativos` e `posicoes`
- `upload-b3`: remover sincronizacao para CSV local
- `upload-positions`: persistir no banco (ou converter para pipeline SQL)
- Implementar estrategia idempotente (hash/chave natural) para evitar duplicidades

Criterio de pronto:
- Toda importacao grava apenas no Postgres
- Reprocessar o mesmo arquivo nao duplica posicoes

---

## Fase 4 - Unificacao das APIs de posicao (semana 2)

Objetivo: CRUD de posicoes 100% SQL.

Acoes:
- Migrar `app/api/positions/[id]/route.ts` para repository Postgres
- Garantir update/delete por `id` de posicao no banco
- Revisar validacoes de dominio e normalizacao de tipos/valores

Criterio de pronto:
- Editar/excluir posicao reflete imediatamente no dashboard (fonte SQL)

---

## Fase 5 - Descomissionamento de CSV na leitura (semana 3)

Objetivo: remover dependencia funcional de CSV.

Acoes:
- Remover uso de `CsvPortfolioRepository` do fluxo de producao
- Manter CSV apenas como opcional de exportacao/debug
- Remover fallback em `docs/csvs` e `public/data` para leitura de dashboard

Criterio de pronto:
- Busca textual no repo sem referencias ativas de leitura CSV no dashboard/apis principais

---

## Modelo de Dados e Regras

Regras obrigatorias:
- Valor consolidado sempre em BRL
- Manter moeda original
- Classes e subclasses somente as oficiais
- Alertas de concentracao com thresholds canonicos

Tecnicas recomendadas:
- UPSERT por chaves de negocio
- Timestamps de importacao e origem do dado
- Auditoria minima (created_at, updated_at, origem, hash_linha)

---

## Riscos e Mitigacoes

1. Divergencia entre schema legado e multiativo
- Mitigacao: script de migracao e mapeamento explicito de colunas

2. Queda de performance em consultas do dashboard
- Mitigacao: indices por `carteira_id`, `classe`, `ativo_id`, `atualizado_em`; cache de 30-60s

3. Duplicidade em importacoes
- Mitigacao: idempotencia por hash/chave composta + constraints unicas

4. Mudanca de comportamento em telas existentes
- Mitigacao: rollout por feature flag (dev -> staging -> prod)

---

## Checklist de Implementacao

- [ ] Dashboard lendo somente Postgres
- [ ] `/api/dashboard-data` lendo somente Postgres
- [ ] `/api/analysis` lendo somente Postgres
- [ ] `/api/positions/[id]` operando em Postgres
- [ ] Importacao Google Sheets gravando somente Postgres
- [ ] Importacao B3 gravando somente Postgres
- [ ] Removido fallback CSV no caminho principal
- [ ] Testes de regressao de KPI/alocacao/concentracao aprovados

---

## Definicao de Pronto (DoD)

Consideraremos a migracao concluida quando:

1. O dashboard funcionar com os mesmos (ou melhores) resultados usando apenas SQL.
2. Nenhuma funcionalidade critica depender de leitura de CSV local.
3. Importacoes (Google Sheets, B3 e upload) forem pipelines de ingestao para o banco.
4. CRUD manual de posicoes refletir diretamente no dashboard sem sincronizacao CSV.
