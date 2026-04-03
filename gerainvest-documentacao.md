# GerInvest — Documentação Técnica Completa

> Plataforma web para gerenciamento de carteira de investimentos brasileira. Atualmente em prototipagem, focada em importação de planilhas Excel do Google Drive e geração de CSVs estruturados para dashboard com KPIs e gráficos.

---

## 1. Visão Geral do Sistema

### 1.1 Objetivo

O **GerInvest** é uma aplicação web em desenvolvimento para investidores brasileiros que desejam:
- Consolidar posições de investimento de múltiplas fontes
- Visualizar alocações por classe de ativo e instituição
- Editar posições manualmente
- Preparar dados para futuras integrações com APIs de mercado

### 1.2 Status Atual (Março 2026)

- ✅ **Protótipo Funcional**: Dashboard com KPIs básicos
- ✅ **Importação Excel**: Upload de planilhas e conversão para CSV
- ✅ **Gráficos Recharts**: Alocação por ativo e instituição
- ✅ **Edição Manual**: API para editar posições individuais
- ✅ **Cache Otimizado**: `unstable_cache` do Next.js
- 🔄 **Em Desenvolvimento**: Autenticação, PostgreSQL, integrações externas
- 📋 **Planejado**: Relatórios, notificações, app mobile

### 1.3 Público-Alvo

- Investidores individuais brasileiros
- Gestores de carteira pequenos
- Desenvolvedores interessados em finanças pessoais

---

## 1. Visão Geral

O **GerInvest** é uma aplicação web full-stack voltada para investidores brasileiros que desejam consolidar, monitorar e analisar seus portfólios de renda variável e renda fixa. A plataforma se conecta à B3 (Bolsa de Valores do Brasil) para obter dados em tempo real de ações, FIIs (Fundos de Investimento Imobiliário) e outros ativos, apresentando dashboards interativos, histórico de operações e relatórios de desempenho.

### Objetivos Principais

- Consolidar todos os ativos do investidor em um único painel
- Calcular automaticamente preço médio de compra, rentabilidade e evolução do patrimônio
- Integrar com a API da B3 para cotações e dados históricos em tempo real
- Gerar relatórios de performance mensal, anual e por ativo
- Oferecer uma experiência responsiva e de alta performance

---

## 2. Stack Tecnológica

| Camada | Tecnologia | Versão | Propósito |
|---|---|---|---|
| **Frontend** | Next.js | 16.2.1 | App Router, Server Components, API Routes |
| **Linguagem** | TypeScript | 5.x | Tipagem estática, desenvolvimento seguro |
| **Estilização** | TailwindCSS | 4.x | Utility-first CSS, design responsivo |
| **Gráficos** | Recharts | 3.8.1 | Visualização de dados interativa |
| **Parsing de Dados** | csv-parse | 6.2.1 | Leitura de CSVs |
| | xlsx | 0.18.5 | Processamento de planilhas Excel |
| **Banco de Dados** | PostgreSQL | - | Futuro: dados históricos e audit |
| **Autenticação** | NextAuth.js | 4.24.13 | Futuro: login com múltiplos providers |
| **Deploy** | Vercel | - | Hospedagem com Edge Network |
| **Controle de Versão** | Git | - | Versionamento e colaboração |

### 2.1 Dependências Principais (package.json)

```json
{
  "dependencies": {
    "next": "16.2.1",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "typescript": "^5",
    "tailwindcss": "^4",
    "recharts": "^3.8.1",
    "csv-parse": "^6.2.1",
    "xlsx": "^0.18.5",
    "zod": "^4.3.6",
    "next-auth": "^4.24.13",
    "pg": "^8.20.0"
  }
}
```

---

## 3. Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js)                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │Dashboard │  │Portfólio │  │Operações │  │Relatórios│ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
└──────────────────────────┬──────────────────────────────┘
                           │ Server Actions / API Routes
           ┌───────────────┴───────────────┐
           │                               │
   ┌───────▼──────┐               ┌────────▼───────┐
   │   Firebase    │               │   PostgreSQL    │
   │  Firestore   │               │  (Histórico /  │
   │  (Usuários / │               │   Relatórios)  │
   │   Portfólio  │               └────────────────┘
   │   em tempo   │
   │   real)      │
   └───────┬──────┘
           │
   ┌───────▼──────┐
   │  API B3 /   │
   │  Brapi.dev  │
   │  (Cotações) │
   └─────────────┘
```

### Fluxo de Dados Principal

1. O usuário autentica via **Firebase Authentication** (email/senha ou Google)
2. Os ativos do portfólio são armazenados no **Firestore** (operações de compra/venda)
3. O frontend busca cotações em tempo real via **API da B3 / Brapi**
4. Cálculos de preço médio e rentabilidade são processados no lado do servidor (Server Actions)
5. Dados históricos e relatórios são persistidos no **PostgreSQL**
6. O dashboard é renderizado com dados consolidados das duas fontes

---

## 4. Estrutura de Pastas

```
gerainvest/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Rotas de autenticação
│   │   ├── login/
│   │   └── registro/
│   ├── (dashboard)/            # Rotas protegidas (requer login)
│   │   ├── layout.tsx          # Layout com sidebar
│   │   ├── page.tsx            # Página inicial do dashboard
│   │   ├── portfolio/          # Visão do portfólio
│   │   ├── operacoes/          # Histórico de compras/vendas
│   │   ├── relatorios/         # Relatórios de performance
│   │   └── configuracoes/      # Configurações do usuário
│   ├── api/                    # API Routes (Next.js)
│   │   ├── cotacoes/           # Proxy para API da B3
│   │   └── relatorios/         # Geração de relatórios
│   ├── layout.tsx              # Layout raiz
│   └── globals.css
│
├── components/                 # Componentes reutilizáveis
│   ├── ui/                     # Componentes base (Button, Card, Input...)
│   ├── charts/                 # Gráficos (Recharts / Chart.js)
│   ├── portfolio/              # Componentes específicos do portfólio
│   └── layout/                 # Header, Sidebar, Footer
│
├── lib/                        # Utilitários e configurações
│   ├── firebase/               # Inicialização e helpers do Firebase
│   │   ├── config.ts
│   │   ├── firestore.ts
│   │   └── auth.ts
│   ├── db/                     # Conexão e queries PostgreSQL
│   │   └── index.ts
│   ├── api/                    # Clientes de APIs externas
│   │   ├── brapi.ts            # Cliente da API Brapi (B3)
│   │   └── b3.ts
│   └── utils/                  # Funções utilitárias
│       ├── calculos.ts         # Preço médio, rentabilidade
│       └── formatadores.ts     # BRL, percentuais, datas
│
├── hooks/                      # React Hooks customizados
│   ├── usePortfolio.ts
│   ├── useCotacoes.ts
│   └── useAuth.ts
│
├── types/                      # Tipagens TypeScript
│   ├── ativo.ts
│   ├── operacao.ts
│   └── relatorio.ts
│
├── constants/                  # Constantes da aplicação
│
├── public/                     # Assets estáticos
│
├── .env.local                  # Variáveis de ambiente (não commitado)
├── .env.example                # Exemplo de variáveis
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 5. Modelos de Dados

### 5.1 Entidade Position (src/core/domain/position.ts)

```typescript
export interface Position {
  id: string;                    // UUID único
  ticker: string;                // Código do ativo (VALE3, PETR4)
  assetClass: AssetClass;        // Classe do ativo
  quantity: number;              // Quantidade
  price: number;                 // Preço unitário
  grossValue: number;            // Valor bruto (quantity × price)
  institution?: string;          // Instituição (XP, Rico, etc.)
  account?: string;              // Conta específica
  description?: string;          // Descrição opcional
  indexer?: string;              // Indexador (CDI, IPCA para renda fixa)
  maturityDate?: string;         // Data de vencimento (YYYY-MM-DD)
  issuer?: string;               // Emissor
}
```

### 5.2 Enum AssetClass (src/core/domain/types.ts)

```typescript
export type AssetClass =
  | 'ACOES'          // Ações ordinárias/preferenciais
  | 'BDR'            // Brazilian Depositary Receipts
  | 'ETF'            // Exchange Traded Funds
  | 'FII'            // Fundos de Investimento Imobiliário
  | 'FIAGRO'         // Fundos de Investimento no Agronegócio
  | 'RENDA_FIXA'     // CDB, LCI, LCA, etc.
  | 'TESOURO_DIRETO' // Títulos públicos
  | 'FUNDOS_MULTIMERCADO' // Fundos multimercado
  | 'PREVIDENCIA'    // Previdência privada
  | 'CRYPTO'         // Criptoativos
  | 'OUTRO';         // Outros investimentos

export const ASSET_CLASS_LABELS: Record<AssetClass, string> = {
  ACOES: 'Ações',
  BDR: 'BDR',
  ETF: 'ETF',
  FII: 'FII',
  FIAGRO: 'Fiagro',
  RENDA_FIXA: 'Renda Fixa',
  TESOURO_DIRETO: 'Tesouro Direto',
  FUNDOS_MULTIMERCADO: 'Fundos Multimercado',
  PREVIDENCIA: 'Previdência',
  CRYPTO: 'Criptoativos',
  OUTRO: 'Outros',
};

export const ASSET_CLASS_COLORS: Record<AssetClass, string> = {
  ACOES: '#3b82f6',        // blue-500
  BDR: '#8b5cf6',          // violet-500
  ETF: '#06b6d4',          // cyan-500
  FII: '#10b981',          // emerald-500
  FIAGRO: '#84cc16',       // lime-500
  RENDA_FIXA: '#f59e0b',   // amber-500
  TESOURO_DIRETO: '#f97316', // orange-500
  FUNDOS_MULTIMERCADO: '#ec4899', // pink-500
  PREVIDENCIA: '#6366f1',  // indigo-500
  CRYPTO: '#14b8a6',       // teal-500
  OUTRO: '#94a3b8',        // slate-400
};
```

### 5.3 Estrutura do CSV (public/data/portfolio-positions.csv)

| Coluna | Tipo | Obrigatório | Descrição | Exemplo |
|--------|------|-------------|-----------|---------|
| id | string | Sim | UUID único | `550e8400-e29b-41d4-a716-446655440000` |
| ticker | string | Sim | Código do ativo | `VALE3` |
| assetClass | AssetClass | Sim | Classe do ativo | `ACOES` |
| quantity | number | Sim | Quantidade | `100` |
| price | number | Sim | Preço unitário | `45.50` |
| grossValue | number | Sim | Valor total | `4550.00` |
| institution | string | Não | Corretora | `XP Investimentos` |
| account | string | Não | Conta específica | `Conta Corrente` |
| description | string | Não | Descrição | `Vale S.A.` |
| indexer | string | Não | Indexador | `CDI` |
| maturityDate | string | Não | Vencimento | `2025-12-31` |
| issuer | string | Não | Emissor | `Banco do Brasil` |

### 5.4 Outros CSVs Gerados

- `acoes.csv` — Posições de ações
- `fii.csv` — Fundos imobiliários
- `renda_fixa.csv` — Renda fixa
- `outros.csv` — Outros ativos

### 5.5 PostgreSQL — Tabelas Planejadas (Futuro)

```sql
-- Usuários (NextAuth.js)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'CLIENT',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Histórico de importações
CREATE TABLE import_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  filename VARCHAR(255),
  imported_at TIMESTAMP DEFAULT NOW(),
  positions_count INTEGER
);
```
        moeda: "BRL",
        fusoHorario: "America/Sao_Paulo"
      }
```

### 5.2 Firestore — Coleção `operacoes`

```
operacoes/{operacaoId}
  ├── userId: string          (referência ao usuário)
  ├── ticker: string          (ex: "PETR4", "MXRF11")
  ├── tipo: "COMPRA" | "VENDA"
  ├── quantidade: number
  ├── precoUnitario: number   (em BRL)
  ├── taxas: number           (corretagem + emolumentos)
  ├── data: Timestamp
  └── corretora: string
```

### 5.3 Firestore — Coleção `ativos`

```
ativos/{ticker}
  ├── nome: string
  ├── tipo: "ACAO" | "FII" | "ETF" | "RENDA_FIXA"
  ├── setor: string
  └── ultimaAtualizacao: Timestamp
```

### 5.4 PostgreSQL — Tabela `historico_cotacoes`

```sql
CREATE TABLE historico_cotacoes (
  id          SERIAL PRIMARY KEY,
  ticker      VARCHAR(10) NOT NULL,
  data        DATE NOT NULL,
  abertura    DECIMAL(10,2),
  fechamento  DECIMAL(10,2),
  maxima      DECIMAL(10,2),
  minima      DECIMAL(10,2),
  volume      BIGINT,
  created_at  TIMESTAMP DEFAULT NOW(),
  UNIQUE(ticker, data)
);

CREATE INDEX idx_historico_ticker_data ON historico_cotacoes(ticker, data DESC);
```

### 5.5 PostgreSQL — Tabela `relatorios_mensais`

```sql
CREATE TABLE relatorios_mensais (
  id              SERIAL PRIMARY KEY,
  user_id         VARCHAR(128) NOT NULL,
  mes             INTEGER NOT NULL,       -- 1-12
  ano             INTEGER NOT NULL,
  patrimonio_ini  DECIMAL(15,2),
  patrimonio_fim  DECIMAL(15,2),
  rentabilidade   DECIMAL(8,4),           -- percentual
  dividendos      DECIMAL(15,2),
  aporte          DECIMAL(15,2),
  criado_em       TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, mes, ano)
);
```

---

## 6. Funcionalidades Implementadas

### 6.1 Dashboard Principal (`app/page.tsx`)

- **KPIs Calculados**:
  - Total investido (soma de grossValue)
  - Número de posições ativas
  - Tickers únicos
  - Contas distintas
  - Instituições distintas
- **Gráficos Recharts**:
  - PieChart: Alocação por classe de ativo (% do portfólio)
  - BarChart: Alocação por instituição (valor absoluto)
  - Cores por classe de ativo definidas em `ASSET_CLASS_COLORS`
- **Tabela de Posições**:
  - Listagem paginada (25 itens por página)
  - Filtros: assetClass, institution
  - Busca: ticker ou description
  - Ordenação: todas as colunas
  - Botão "Editar" para modificação manual

### 6.2 Importação de Dados (`app/importacao/page.tsx`)

- **Upload de Excel**: Planilhas do Google Drive com múltiplas sheets
- **Processamento**: `excelImporter.ts` converte para CSVs estruturados
- **Validação**: Colunas obrigatórias (ticker, assetClass, grossValue)
- **Feedback**: Lista de erros por linha, resumo de importação

### 6.3 Edição Manual de Posições

- **Modal EditPositionModal**: Formulário com todos os campos
- **API Route**: `PATCH /api/positions/[id]` atualiza CSV
- **Validação**: Zod schemas para entrada
- **Recarregamento**: `router.refresh()` após edição

### 6.4 Serviços de Cálculo (`src/core/services/portfolioService.ts`)

- `getAllocationByAssetClass()`: Agrupa por classe, calcula percentuais
- `getAllocationByInstitution()`: Agrupa por instituição
- `getTopPositions()`: Top 10 por valor
- `getConcentrationMetrics()`: Verifica concentração alta (>20%)
- `getFixedVsVariableRatio()`: Proporção renda fixa vs variável

### 6.5 Cache e Performance

- **unstable_cache**: Cache de 60s para posições e resumo
- **Server Components**: Fetching no servidor, HTML otimizado
- **Revalidação**: Tags para invalidação automática

### 6.6 Funcionalidades Planejadas (Não Implementadas)

- Autenticação (NextAuth.js)
- Integração API B3/Brapi
- Relatórios mensais
- Histórico de operações
- PostgreSQL para persistência
- Notificações de dividendos

## 7. Integrações Externas

### 7.1 Google Drive (Fonte de Dados)

- **Uso Atual**: Planilhas Excel salvas manualmente no Google Drive
- **Estrutura Esperada**: Sheets nomeadas por classe de ativo (Ações, FII, Renda Fixa, etc.)
- **Processamento**: Download manual → Upload via interface → Parsing com `xlsx`

### 7.2 Integrações Planejadas

#### API Brapi (Cotações B3)
- **Base URL**: `https://brapi.dev/api`
- **Endpoints Planejados**:
  - `GET /quote/{ticker}` — Cotação atual
  - `GET /quote/{ticker}?range=1mo&interval=1d` — Histórico mensal
- **Autenticação**: Bearer token via `BRAPI_TOKEN`
- **Rate Limit**: Respeitar limites do plano

#### Google Sheets API
- **Propósito**: Integração automática com planilhas do Google
- **Autenticação**: Service Account ou OAuth
- **Benefício**: Eliminar upload manual de arquivos

#### Firebase (Futuro)
- **Firestore**: Armazenamento de portfólio por usuário
- **Authentication**: Login com email/senha + Google OAuth
- **Hosting**: Deploy alternativo ao Vercel

```typescript
// lib/api/brapi.ts
export async function getCotacao(ticker: string) {
  const res = await fetch(
    `https://brapi.dev/api/quote/${ticker}?token=${process.env.BRAPI_TOKEN}`,
    { next: { revalidate: 30 } } // Cache de 30s
  );
  if (!res.ok) throw new Error(`Erro ao buscar cotação: ${ticker}`);
  return res.json();
}
```

---

## 8. Cálculos Financeiros

### 8.1 Preço Médio Ponderado

Para cada ativo, o preço médio é recalculado a cada nova compra:

```
PM_novo = (PM_anterior × Qtd_anterior + Preço_novo × Qtd_nova) / (Qtd_anterior + Qtd_nova)
```

### 8.2 Rentabilidade

```
Rentabilidade (%) = ((Cotação_atual - PM) / PM) × 100
Lucro/Prejuízo (R$) = (Cotação_atual - PM) × Quantidade
```

### 8.3 Rentabilidade do Portfólio

```
Rent_portfólio = Σ (Valor_atual_ativo / Valor_total_portfólio × Rent_ativo)
```

---

## 8. Desenvolvimento

### 8.1 Configuração do Ambiente

1. **Clone e instalação**:
   ```bash
   git clone <repo-url>
   cd gerinvest
   npm install
   ```

2. **Variáveis de ambiente**:
   ```bash
   cp .env.example .env.local
   # Edite .env.local com suas configurações
   ```

3. **Executar localmente**:
   ```bash
   npm run dev
   # Acesse http://localhost:3000
   ```

### 8.2 Scripts Disponíveis

- `npm run dev` — Desenvolvimento com hot reload
- `npm run build` — Build de produção
- `npm run start` — Servidor de produção
- `npm run lint` — Verificação de código
- `npm run db:migrate` — Migrações PostgreSQL (futuro)

### 8.3 Estrutura de Commits

```
feat: nova funcionalidade
fix: correção de bug
docs: atualização de documentação
style: formatação, linting
refactor: refatoração de código
test: testes
chore: manutenção
```

---

## 9. Deployment

### 9.1 Vercel (Recomendado)

1. **Conectar repositório** no painel Vercel
2. **Configurar variáveis** de ambiente
3. **Deploy automático** em cada push para main

### 9.2 Build Settings

- **Framework**: Next.js
- **Node Version**: 20.x
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

### 9.3 Variáveis de Ambiente em Produção

- `NODE_ENV=production`
- `DATABASE_URL` (futuro)
- `NEXTAUTH_SECRET` (futuro)
- `BRAPI_TOKEN` (futuro)

---

## 10. Testes

### 10.1 Estratégia de Testes

- **Unitários**: Funções puras em `src/core/`
- **Integração**: API Routes e repositórios
- **E2E**: Fluxos completos (futuro com Playwright)

### 10.2 Executar Testes

```bash
# Unitários
npm run test:unit

# Integração
npm run test:integration

# Cobertura
npm run test:coverage
```

### 10.3 Testes Críticos

- `normalizeCurrency`: Parsing de valores brasileiros
- `portfolioService`: Cálculos de alocação
- `csv-reader`: Validação de CSVs
- `excelImporter`: Parsing de planilhas

---

## 11. Segurança

### 11.1 Middleware Next.js

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  // Proteção de rotas
  // Rate limiting
  // Headers de segurança
}
```

### 11.2 Validação de Dados

- **Zod schemas** para todas as entradas
- **Sanitização** de inputs
- **Type safety** com TypeScript

### 11.3 Boas Práticas

- Nunca committar `.env.local`
- Usar HTTPS em produção
- Validar origens de upload
- Logs de auditoria (futuro)

---

## 12. Monitoramento e Logs

### 12.1 Logs de Aplicação

- **Importações**: Sucesso/falha, número de registros
- **Edições**: Quem, quando, o que mudou
- **Erros**: Stack traces, contexto

### 12.2 Métricas

- Tempo de resposta das APIs
- Taxa de erro de importação
- Uso de cache (hit/miss ratio)

### 12.3 Ferramentas Planejadas

- **Vercel Analytics**: Métricas de uso
- **Sentry**: Error tracking
- **LogRocket**: Session replay

---

## 13. Roadmap

### Fase 2: Autenticação e Multi-usuário
- [ ] NextAuth.js integration
- [ ] Firebase Authentication
- [ ] Perfis de usuário
- [ ] Portfólios múltiplos por usuário

### Fase 3: Integrações Externas
- [ ] API Brapi para cotações
- [ ] Google Sheets API
- [ ] Webhooks para atualizações automáticas

### Fase 4: Analytics Avançados
- [ ] Relatórios mensais
- [ ] Gráficos de evolução histórica
- [ ] Comparação com benchmarks
- [ ] Alertas de rebalanceamento

### Fase 5: Mobile e PWA
- [ ] App React Native
- [ ] PWA para acesso mobile
- [ ] Notificações push

---

*Documentação atualizada em: Março 2026*
*Status: Protótipo funcional com dashboard e importação CSV*
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
FIREBASE_ADMIN_PRIVATE_KEY=
FIREBASE_ADMIN_CLIENT_EMAIL=

# PostgreSQL
DATABASE_URL=postgresql://user:password@localhost:5432/gerainvest

# APIs de Mercado
BRAPI_TOKEN=
```

> **Atenção:** Nunca commite o arquivo `.env.local`. Ele já deve estar no `.gitignore`.

---

## 10. Instalação e Execução Local

### Pré-requisitos

- Node.js 20+
- npm / yarn / pnpm
- PostgreSQL 15+
- Conta Firebase com projeto configurado
- Token da API Brapi

### Passos

```bash
# 1. Clonar o repositório
git clone https://github.com/juniorferreiradev-bit/gerainvest.git
cd gerainvest

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env.local
# Editar .env.local com suas credenciais

# 4. Criar banco de dados e tabelas
npm run db:migrate

# 5. Iniciar servidor de desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`.

---

## 11. Deploy (Vercel)

1. Importe o repositório no painel da Vercel
2. Configure todas as variáveis de ambiente do `.env.example` nas configurações do projeto
3. O deploy é automático a cada push na branch `main`
4. Para o banco PostgreSQL em produção, utilize **Vercel Postgres**, **Supabase** ou **Railway**

---

## 12. Segurança

- **Firebase Security Rules:** Usuários só leem/escrevem seus próprios documentos
- **Server Actions:** Validação de autenticação em toda action server-side
- **Rate Limiting:** Implementar em `/api/cotacoes` para evitar abuso
- **Sanitização:** Inputs validados com Zod antes de qualquer operação no banco
- **Secrets:** Nunca expor tokens de API no frontend (usar variáveis sem `NEXT_PUBLIC_`)

---

## 13. Roadmap

| Fase | Funcionalidade | Status |
|---|---|---|
| v1.0 | Autenticação + CRUD de operações | ✅ Concluído |
| v1.0 | Dashboard com KPIs básicos | ✅ Concluído |
| v1.1 | Integração Brapi (cotações em tempo real) | 🚧 Em progresso |
| v1.1 | Cálculo automático de preço médio | 🚧 Em progresso |
| v1.2 | Gráficos de evolução patrimonial | 📋 Planejado |
| v1.2 | Relatório mensal de performance | 📋 Planejado |
| v1.3 | Extrato de dividendos | 📋 Planejado |
| v1.3 | Exportação CSV / PDF | 📋 Planejado |
| v2.0 | Integração direta com CEI/B3 (importação automática) | 🔮 Futuro |

---

## 14. Contribuição

Este projeto é privado e desenvolvido por **Junior Ferreira**. Para contribuir ou reportar issues, abra uma issue no repositório ou entre em contato diretamente.

---

## 15. Licença

Projeto privado — todos os direitos reservados © 2025-2026 Junior Ferreira.
