# Instruções gerais para GitHub Copilot – gerinvest

## Visão geral do repositório

- Este repositório é o **gerinvest**, um aplicativo web de **carteira de investimentos**.
- O objetivo é **substituir totalmente o banco de dados Postgres** por uma camada de dados baseada em **arquivos CSV** gerados a partir de uma **planilha Excel de posição de investimentos** (por exemplo `posicao-YYYY-MM-DD.xlsx`).
- O app fornece:
  - **Upload** de planilha de posição.
  - **Pipeline de importação**: Excel → normalização → CSVs por classe de ativo + um CSV consolidado de posições.
  - **Dashboard de investimentos**: visão consolidada, alocação, concentração, risco básico e gráficos.

## Stack e princípios

- Framework principal: **Next.js 16 com App Router**, usando **TypeScript**.
- O repositório deve seguir:
  - **TypeScript estrito** (evitar `any`).
  - Arquitetura em camadas:
    - `core/domain`: tipos e lógica de domínio (ex.: `Position`, `PortfolioSummary`).
    - `core/services`: serviços de aplicação e analytics (operam apenas sobre tipos de domínio).
    - `infra/csv`: leitura/escrita de CSV, parsing de Excel, acesso a filesystem.
    - `infra/repositories`: repositórios que usam CSV como “fonte de dados”.
    - `ui` ou `app`/`components`: camada de apresentação (React).
- **Não** introduzir novas dependências de banco externo (Postgres, Supabase etc.) neste projeto. Toda persistência é via arquivos CSV.

## Como o Copilot deve usar estas instruções

- Considere este arquivo como **fonte primária de verdade** sobre o repositório.
- Antes de propor grandes mudanças, procure:
  - **Respeitar a arquitetura em camadas** descrita acima.
  - Usar os módulos existentes em `core`, `infra` e `ui` sempre que possível, em vez de reinventar soluções.
- **Não repita** longas explicações sobre o projeto em cada resposta. Use referências a arquivos e funções já existentes para economizar tokens.
- Quando um pedido do usuário estiver ambíguo:
  - Sugira **pequenas perguntas objetivas** (2–4 itens) para clarificar antes de gerar muito código.
- Prefira:
  - **Alterar arquivos já existentes** em vez de criar novos módulos redundantes.
  - Splits de mudanças em **passos pequenos e coesos** (um conjunto de responsabilidades por PR ou por commit).

## Organização das instruções específicas

- Instruções detalhadas de backend: `.github/instructions/backend.instructions.md`.
- Instruções detalhadas de frontend: `.github/instructions/frontend.instructions.md`.
- Quando o usuário pedir algo de backend, **leia primeiro** `backend.instructions.md`.
- Quando o usuário pedir algo de UI/dashboard, **leia primeiro** `frontend.instructions.md`.

## Convenções de código e fluxo de trabalho

- Comandos típicos (podem variar conforme `package.json`):
  - `npm install` – instalar dependências.
  - `npm run dev` – rodar o app em desenvolvimento.
  - `npm run build` – build de produção.
  - `npm run lint` / `npm run test` – qualidade (se existirem scripts).
- Estilo:
  - Use **componentes funcionais** com React e hooks.
  - Prefira **funções puras** em `core`/`services`.
  - Mantenha **nomes de arquivos coesos** com os exports principais.
- Fluxo recomendado para alterações:
  1. Entender qual camada será impactada (domínio, infraestrutura CSV, repositório, serviço, UI).
  2. Especificar rapidamente (em texto) a mudança: entrada, saída, efeitos colaterais.
  3. Só então propor código, focando em **uma responsabilidade por vez**.

## Regras importantes para este projeto

1. **Fonte de dados = CSVs** gerados a partir de uma planilha Excel de posição:
   - Não criar tabelas SQL, ORMs ou integrações externas de banco.
   - Não depender de serviços externos para persistência neste repositório.
2. **Separação clara de camadas**:
   - Código de domínio e analytics **não** devem acessar arquivos diretamente.
   - Infraestrutura (CSV/Excel) **não** deve conhecer componentes de UI.
3. **Evitar devaneios**:
   - Não inventar APIs REST inexistentes.
   - Não criar microserviços ou filas assíncronas complexas, a menos que o usuário peça explicitamente.
   - Não reescrever o projeto inteiro se o usuário pedir uma melhoria incremental.
4. **Documentar rapidamente o que for não óbvio**:
   - Quando criar novo módulo ou contrato público, inclua comentário sucinto com objetivo e uso esperado.

## Backlog macro (mapa mental de longo prazo)

Copilot deve considerar estas frentes de trabalho como “épicos” recorrentes:

1. **Importação & normalização de dados**
   - Parsing robusto da planilha Excel.
   - Geração consistente de CSVs por classe + CSV consolidado de posições.
   - Tratamento de erros e feedback claro na UI.

2. **Analytics da carteira**
   - Cálculo de métricas de alocação, concentração e risco básico.
   - Preparação de dados para gráficos (agrupamentos, percentuais, ordenações).

3. **Dashboard de investimentos**
   - KPIs principais.
   - Gráficos de alocação.
   - Tabelas de posições com filtros.

4. **Qualidade de código e DX**
   - Melhorar tipagem, garantir coesão de módulos.
   - Manter instruções e arquitetura sempre alinhadas.

Ao trabalhar em qualquer tarefa, alinhe com um desses épicos sempre que possível, para manter a memória do projeto coesa.