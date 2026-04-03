# Instruções de Frontend – gerinvest

## Objetivo da UI

- Expor uma **experiência de dashboard de investimentos** clara e eficiente, com:
  - KPIs da carteira.
  - Gráficos de alocação.
  - Tabelas de posições.
  - Fluxo de upload e feedback de importação da planilha.

- O frontend **não deve** acessar CSVs nem Excel diretamente.  
  Sempre consuma dados via:
  - server actions
  - rotas de API em `app/api/**`
  - ou serviços que já retornem DTOs prontos.

## Stack e layout

- Framework: **Next.js 16 – App Router**.
- Linguagem: **TypeScript**.
- UI: React (componentes funcionais, hooks).
- Organização sugerida:

```txt
src/
  app/
    layout.tsx
    page.tsx              // Dashboard principal
    upload/
      page.tsx            // Tela de upload da planilha
  ui/
    components/
      dashboard/
        PortfolioOverview.tsx
        AllocationCharts.tsx
        PositionsTable.tsx
        RiskIndicators.tsx
      upload/
        UploadForm.tsx
        UploadResult.tsx
        UploadProgress.tsx
```

## Páginas principais

### `/` – Dashboard principal

Contém:

1. **Header**:
   - Nome do app.
   - Data/hora da última importação da planilha (fornecida pelo backend).
   - Botão para ir à página `/upload`.

2. **Cards de KPIs** (componentes em `ui/components/dashboard`):
   - Patrimônio total.
   - Número de ativos.
   - Número de contas/instituições.
   - Percentual de renda fixa vs renda variável.[file:1]

3. **Gráficos**:
   - Pizza ou donut: alocação por classe de ativo.
   - Barras horizontais: alocação por instituição.
   - (Opcional futuro) gráficos de linha/área para histórico.

4. **Tabela de posições**:
   - Colunas: ticker, descrição, instituição, conta, quantidade, preço, valor total, % da carteira.
   - Suporte a ordenação (por valor, ticker, instituição).
   - Filtro por classe de ativo.

Dados para essa página devem vir de uma função/endpoint consolidado, por exemplo:

```ts
getDashboardData(): Promise<{
  summary: PortfolioSummaryDTO;
  allocationByAssetClass: AllocationDTO[];
  allocationByInstitution: AllocationDTO[];
  topPositions: PositionRowDTO[];
}>
```

Frontend não deve recalcular métricas complexas; isso é responsabilidade do backend.

### `/upload` – Upload de planilha

Elementos-chave:

- Card com:
  - Título explicando que a planilha de posição será a **fonte de dados**.
  - Input de arquivo (`.xlsx`, `.xls`).
  - Botão para enviar.
- Fluxo de estados:
  - `Idle` → `Uploading` → `Processing` → `Done | Error`.
- Em `Done`, mostrar:
  - Quantidade de linhas importadas por aba.
  - Valor total da carteira resultante (se disponível no retorno).
  - Link ou botão para ir para o dashboard principal.

Chamada:

- Submeter via `fetch` para `POST /api/upload-positions`.
- Mostrar mensagens de erro claras quando o backend reportar falhas (arquivo inválido, formato inesperado, etc.).

### Compatibilidade com Google Sheets

- Adicionar opção secundária no UI de upload:
  - `input type="text"` para colar link de planilha ou ID de Spreadsheet Google (ex.: `https://docs.google.com/spreadsheets/d/ID/edit`).
  - botões:
    - `Importar arquivo` (Excel local) e `Usar Google Sheets`.
  - validação imediata do ID via regex:
    - `/spreadsheets\/d\/([a-zA-Z0-9-_]+)/`.
  - se o link for válido, chamar `POST /api/upload-positions/google-sheet` com `{ spreadsheetUrl }`.

- estado do formulário:
  - `idle`, `loading`, `success`, `error`.
  - exibir sempre resumo do resultado (`linhas importadas`, `valor total`, `erros`).

- UX:
  - indicar quando a planilha for “consumo remoto” (não local).
  - botão `Sincronizar agora` na visão de dashboard para recarregar do Google Sheets.

## Componentes e comportamento

### Regras gerais

- Use **componentes pequenos e reutilizáveis**.
- Mantenha **toda lógica de dados** em hooks/server components e **toda lógica visual** em componentes de apresentação:
  - Ex.: `useDashboardData()` para buscar dados do backend; `DashboardView` para renderizar.
- Sempre que usar gráficos, garanta:
  - Eixos e legendas claros.
  - Paleta consistente com o tema geral (seguir system design do projeto).

### Loading, erro e estados vazios

- Para qualquer fetch:
  - Mostrar **skeletons** em cards e tabelas enquanto carrega.
  - Exibir mensagem de erro amigável quando falhar.
- Tabela de posições vazia:
  - Mostrar empty state explicando que é preciso importar a planilha primeiro.

## Acessibilidade e UX

- Títulos bem estruturados:
  - Um `<h1>` por página (por exemplo, “Visão geral da carteira”).
  - Subtítulos com `<h2>`/`<h3>`.
- Navegação por teclado:
  - Foco visível em botões e links.
- Gráficos:
  - Fornecer textos alternativos ou descrições curtas das principais informações (por exemplo, “50% em renda fixa, 30% em ações…”).

## Comportamento esperado do Copilot no frontend

- Ao criar novos componentes:
  - Checar primeiro se já existe algo reutilizável em `ui/components`.
  - Extrair lógica de fetch para hooks ou server components (não duplicar chamadas em vários lugares).
- Ao consumir dados:
  - Confiar nos DTOs vindos de funções como `getDashboardData` em vez de reabrir arquivos CSV.
- Ao receber uma tarefa ambígua (ex.: “melhorar layout do dashboard”):
  - Propor um plano de 2–4 passos (ex.: reorganizar grid, melhorar responsividade, ajustar tipografia).
  - Só então gerar mudanças de código, focando em uma área por vez.

## Backlog de frontend (memória de longo prazo)

Copilot pode usar estes tópicos como “trilhas” para entender a intenção de mudanças:

1. **Clareza de informações financeiras**
   - Deixar KPIs claros e legíveis.
   - Evitar poluição visual e gráficos confusos.

2. **Responsividade e mobile**
   - Garantir que o dashboard funciona bem em telas pequenas.
   - Simplificar layout em mobile (stack de cards, gráficos em coluna única).

3. **Integração suave com backend**
   - Usar contratos de dados definidos em `core`/`services`.
   - Tratar erros de rede e de importação da planilha de forma gentil.

4. **Performance de renderização**
   - Evitar recomputações pesadas no client.
   - Preferir dados pré-agrupados vindos do backend para gráficos e tabelas.

Ao sugerir código, alinhe explicitamente qual desses tópicos está sendo atendido, quando fizer sentido (por exemplo, comentários rápidos ou nomes de commits).