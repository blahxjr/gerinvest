# Instruções de Backend – gerinvest

## Objetivo do backend

- Fornecer uma **API e serviços internos** para:
  - Importar uma planilha Excel de posição de investimentos.
  - Converter essa planilha em **arquivos CSV** limpos.
  - Expor dados de carteira e analytics em formas prontas para o frontend (DTOs para tabelas, gráficos, KPIs).
- **Não existe banco de dados externo** neste projeto. O “banco” é o conjunto de CSVs.

## Arquitetura de backend

Use esta organização ao criar/alterar código:

- `src/core/domain`
  - Tipos de domínio (`Position`, `PortfolioSummary`, `Allocation`, etc.).
  - Funções puras de negócio (sem IO de arquivos, sem dependência de Next.js).
- `src/core/services`
  - **Serviços de aplicação** que consomem repositórios e funções de domínio.
  - Ex.: `PortfolioService`, `ImportService`.
- `src/infra/csv`
  - Utilitários de leitura/escrita de CSV.
  - Importador de Excel → CSV (`excelImporter`).
  - Funções que lidam com filesystem (fs).
- `src/infra/repositories`
  - Repositórios que implementam interfaces de acesso a dados usando CSV.
  - Ex.: `CsvPortfolioRepository` com métodos `getAllPositions`, `getSummary` etc.
- `src/app/api/**`
  - Rotas HTTP (App Router) que adaptam requisições HTTP para chamadas em `core/services`+`infra/repositories`.

Sempre que possível:

- Coloque **tipos e lógica pura** em `core`.
- Coloque **IO (CSV, Excel, fs)** em `infra`.
- Mantenha as rotas HTTP finas: apenas parse de requisição + chamada a serviço + retorno de resposta.

## Modelo de domínio principal

### Position

```ts
type AssetClass =
  | 'ACOES'
  | 'BDR'
  | 'ETF'
  | 'FII'
  | 'FIAGRO'
  | 'RENDA_FIXA'
  | 'TESOURO_DIRETO';

type Position = {
  id: string;
  assetClass: AssetClass;
  ticker: string;
  description: string;
  institution: string;
  account: string;
  quantity: number;
  price: number;
  grossValue: number;
  currency: 'BRL';
  indexer?: string;
  maturityDate?: string;
  issuer?: string;
};
```

- `Position` é o modelo consolidado derivado das abas da planilha:
  - `Acoes`, `BDR`, `ETF`, `Fundo de Investimento`, `Renda Fixa`, `Tesouro Direto`.[file:1]

### CSVs gerados

- Local padrão sugerido: `public/data` (ou `data/raw` se preferir não público).
- Arquivos:
  - `acoes.csv`
  - `bdr.csv`
  - `etf.csv`
  - `fundos.csv`
  - `renda-fixa.csv`
  - `tesouro-direto.csv`
  - `portfolio-positions.csv` (consolidado, já no schema de `Position`).[file:1]

Backend deve sempre ler via repositório, nunca diretamente do Excel.

## Fluxo de upload e importação

### Rota: `POST /api/upload-positions`

Responsabilidades:

1. Receber `FormData` com o arquivo Excel (`file`).
2. Validar:
   - Tipo (`.xlsx` / `.xls`).
   - Tamanho razoável.
3. Passar o `File`/`Buffer` para o importador:

   ```ts
   const result = await excelImporter.importPositionsFromExcel(file);
   ```

4. `excelImporter.importPositionsFromExcel` deve:
   - Ler o workbook com `xlsx`.
   - Percorrer cada aba relevante da planilha.
   - Mapear as colunas para objetos brutos (por aba).
   - Converter esses objetos para `Position[]` com tipos corretos.
   - Escrever os CSVs individuais + o CSV consolidado.
   - Retornar um `ImportResult` com:
     - `positions: Position[]`
     - métricas por asset class (contagem, valor total, erros por linha).[file:1][web:16][web:120]

5. A rota deve retornar JSON contendo um resumo amigável do resultado.

### Regras de parsing da planilha

Para cada sheet:

- `Acoes` → `assetClass = 'ACOES'`.
- `BDR` → `assetClass = 'BDR'`.
- `ETF` → `assetClass = 'ETF'`.
- `Fundo de Investimento` → `assetClass`:
  - Se houver informação de tipo indicando FIAGRO, marque `'FIAGRO'`.
  - Caso contrário, `'FII'` por padrão, ajustando quando houver dados mais específicos.[file:1]
- `Renda Fixa` → `assetClass = 'RENDA_FIXA'`, usando colunas de emissor, indexador e vencimento.
- `Tesouro Direto` → `assetClass = 'TESOURO_DIRETO'`.[file:1]

## Integração com Google Sheets (novo)

### Motivação

- Permitir usar uma Google Spreadsheet como fonte de dados dinâmica.
- Injetar options de URL/link compartilhado no frontend.
- Manter o parser de `Position` e a camada de repositório independente de origem de dados.

### Requisitos de credenciais

1. Criar projeto no Google Cloud Console.
2. Ativar API Google Sheets (`sheets.googleapis.com`).
3. Criar `Service Account` e baixar JSON de credenciais.
4. Compartilhar a planilha (ID) com o e-mail da service account (`editor` ou `viewer`).
5. Em `.env`, prover:
   - `GOOGLE_SHEETS_CLIENT_EMAIL`
   - `GOOGLE_SHEETS_PRIVATE_KEY` (base64 ou raw com \n)
   - `GOOGLE_SHEETS_SPREADSHEET_ID` (opcional, se padrão)

### Nova estrutura de repositório

- `src/infra/repositories/spreadsheetPortfolioRepository.ts`:
  - implementa `PortfolioRepository` (getAllPositions + getSummary + updatePosition + deletePosition).
  - usa `src/lib/googleSheets.ts` para acessar a API.
- `src/lib/googleSheets.ts`:
  - encapsula chamada a `@googleapis/sheets`.
  - fornece `readSheetRows(spreadsheetId, range)` e `writeSheetRows(spreadsheetId, range, values)`.

### API de controle de link

- `app/api/google-sheet-config/route.ts`:
  - `GET` retorna o link/id armazenado (em arquivo JSON em `data/settings.json` ou DB futuro).
  - `POST` salva link/id no servidor.

### API de sincronização

- `app/api/sync-positions/route.ts`:
  - `POST` dispara recarga de planilha e grava em CSV local (para fallback offline).
  - `GET` opcional para ficar atual em memória.

### Preferência: fallback CSV

- `CsvPortfolioRepository` deve detectar se `GOOGLE_SHEETS_SPREADSHEET_ID` configurado.
- Se estiver, delega para `SpreadsheetPortfolioRepository`.
- Se não, mantém leitura CSV local (legacy).

### Observações de segurança

- O backend (server) deve assinar requisições com credenciais e não expor `SERVICE_ACCOUNT` no frontend.
- O frontend só envia link de planilha via string; backend valida ID com regex e scope de permissões.

### Transformação do fluxo atual

- continua `POST /api/upload-positions` como ingestão manual local.
- adicionar `POST /api/upload-positions/google-sheet` para registrar link e sincronizar.
- manter `app/api/dashboard-data` consumindo `PortfolioRepository` abstrato.

Normalização de campos:

- Converter números com `Number()` após trocar vírgulas por ponto, se necessário.
- Tratar campos vazios como `undefined` ou zero, conforme contexto.
- Manter descrição e instituição com acentuação original.

Validação:

- Use **Zod** (ou similar) para:
  - Validar cada linha transformada em `Position`.
  - Registrar erros por linha (sem interromper todo o processo por uma linha ruim).

## Repositórios baseados em CSV

Crie um repositório principal para a carteira, por exemplo:

```ts
interface PortfolioRepository {
  getAllPositions(): Promise<Position[]>;
  getPositionsByAssetClass(assetClass: AssetClass): Promise<Position[]>;
  getSummary(): Promise<PortfolioSummary>;
}
```

Implemente com `CsvPortfolioRepository`:

- Utiliza utilitário genérico `readCsv<T>` em `infra/csv/csv-reader.ts`.
- Pode manter cache em memória por request (não global) se necessário.

`readCsv<T>`:

- Lê o arquivo via `fs.promises.readFile`.
- Usa biblioteca de CSV (fast-csv ou csv-parse) para parsear.[web:16][web:107]
- Recebe um `mapper(row) => T` para produzir tipos fortes.

## Serviços de analytics (PortfolioService)

`PortfolioService` deve oferecer funções puras em cima de `Position[]`:

- `getPortfolioSummary(positions)`:
  - Total investido.
  - Quantidade de ativos.
  - Quantidade de contas / instituições.
- `getAllocationByAssetClass(positions)`:
  - `[ { assetClass, value, percentage } ]`.
- `getAllocationByInstitution(positions)`:
  - Agrupamento por instituição.
- `getTopPositions(positions, limit)`:
  - Top N posições por valor.
- `getConcentrationMetrics(positions)`:
  - maior posição (%), top 3, etc.
- Outras métricas simples (ex.: % renda fixa vs renda variável).[file:1][web:99]

Essas funções não devem acessar CSV nem filesystem — apenas consumir arrays de `Position`.

## Comportamento esperado do Copilot no backend

- Sempre que for adicionar regra de negócio:
  - Coloque em **services/core/domain**.
  - Deixe funções puras, testáveis e independentes de IO.
- Ao lidar com upload/Excel:
  - Centralize parsing em `excelImporter` (não duplique lógica em várias rotas).
- Ao criar novas rotas API:
  - Construa handlers mínimos que **delegam** para serviços e repositórios.
- Quando o usuário pedir “dashboard” ou “analytics”:
  - Pense primeiro em que funções em `PortfolioService` são necessárias.
  - Só depois altere rotas ou componentes.

Se uma tarefa parecer ambígua (ex.: “otimizar backend”):

1. Liste rapidamente os pontos a revisar (importador, repositório, serviços).
2. Sugira uma ordem de ataque em passos pequenos.
3. Só então gere código.

Isso evita alterações desnecessárias e economiza tokens em tentativas mal direcionadas.