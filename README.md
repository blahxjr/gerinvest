# GerInvest 📈

![Next.js](https://img.shields.io/badge/Next.js-16.2.1-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-cyan?style=flat-square&logo=tailwind-css)
![Recharts](https://img.shields.io/badge/Recharts-3.8.1-red?style=flat-square&logo=recharts)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?style=flat-square&logo=postgresql)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=flat-square&logo=vercel)

> Plataforma web para gerenciamento e visualização de carteira de investimentos brasileira, com suporte a importação manual de CSVs gerados a partir de planilhas do Google Drive.

<!-- Screenshot: Dashboard principal -->
<!-- ![Dashboard](screenshots/dashboard.png) -->

<!-- Screenshot: Tabela de posições -->
<!-- ![Positions Table](screenshots/positions-table.png) -->

## 🚀 Funcionalidades

- **Dashboard com KPIs**: Visualização de patrimônio total, número de posições, tickers únicos, contas e instituições
- **Gráficos Interativos**: Alocação por classe de ativo e instituição usando Recharts
- **Tabela de Posições**: Listagem paginada com filtros, ordenação e botão para edição manual
- **Importação de Dados**: Upload de planilhas Excel do Google Drive, conversão para CSVs estruturados
- **Edição Manual**: API para editar posições individuais via modal
- **Cache Otimizado**: Uso de `unstable_cache` do Next.js para performance

## 🛠️ Stack Tecnológica

| Camada | Tecnologia | Versão |
|---|---|---|
| **Frontend** | Next.js | 16.2.1 (App Router) |
| **Linguagem** | TypeScript | 5.x |
| **Estilização** | TailwindCSS | 4.x |
| **Gráficos** | Recharts | 3.8.1 |
| **Parsing CSV/Excel** | csv-parse, xlsx | 6.2.1, 0.18.5 |
| **Banco de Dados** | PostgreSQL | (futuro: histórico/audit) |
| **Autenticação** | NextAuth.js | 4.24.13 (futuro) |
| **Deploy** | Vercel | (planejado) |

## 📋 Pré-requisitos

- Node.js 18+ (recomendado 20+)
- npm ou yarn
- PostgreSQL (opcional, para futuras funcionalidades)

## 🚀 Instalação e Execução Local

1. **Clone o repositório**:
   ```bash
   git clone <url-do-repositorio>
   cd gerinvest
   ```

2. **Instale as dependências**:
   ```bash
   npm install
   ```

3. **Configure variáveis de ambiente** (opcional):
   - Copie `.env.example` para `.env.local` (se existir)
   - Configure `DATABASE_URL` para PostgreSQL (futuro)

4. **Execute o projeto**:
   ```bash
   npm run dev
   ```
   - Abra http://localhost:3000

5. **Build de produção**:
   ```bash
   npm run build
   npm start
   ```

## ⚙️ Scripts Disponíveis

- `npm run dev` — Executa em modo desenvolvimento
- `npm run build` — Build de produção
- `npm run start` — Executa build de produção
- `npm run lint` — Executa ESLint
- `npm run db:migrate` — Executa migrações do banco (futuro)

## 🏗️ Arquitetura

```mermaid
graph TD
    A[Usuário] -->|Upload Excel| B[Next.js App]
    B -->|Parse Excel| C[excelImporter.ts]
    C -->|Gera CSVs| D[public/data/*.csv]
    B -->|Lê Dados| E[CsvPortfolioRepository]
    E -->|Calcula KPIs| F[portfolioService.ts]
    F -->|Renderiza| G[Dashboard Components]
    B -->|Edita Posição| H[PATCH /api/positions/[id]]
    H -->|Atualiza CSV| I[csv-writer.ts]
    B -->|Cache| J[unstable_cache]
```

### Fluxo de Dados
1. Usuário faz upload de planilha Excel do Google Drive
2. `excelImporter` processa e gera CSVs estruturados
3. `CsvPortfolioRepository` lê os CSVs
4. `portfolioService` calcula métricas e alocações
5. Componentes React renderizam dashboard com Recharts
6. Edições manuais atualizam CSVs via API Routes

## 🔌 APIs e Integrações

### Upload de Planilhas
- **Fonte**: Planilhas Excel salvas no Google Drive
- **Processamento**: Conversão para CSVs estruturados via `excelImporter.ts`
- **Armazenamento**: Arquivos CSV em `public/data/`

### Futuras Integrações
- API da B3 via Brapi (cotações em tempo real)
- Firebase Firestore (armazenamento NoSQL)
- PostgreSQL (dados históricos e relatórios)

## 🔐 Segurança

- Middleware Next.js para proteção de rotas
- Validação de dados com Zod
- Sanitização de inputs
- Futuro: Autenticação com NextAuth.js

## 🚢 Deploy

### Vercel (Recomendado)
1. Conecte o repositório no Vercel
2. Configure variáveis de ambiente
3. Deploy automático em cada push

### Outras Opções
- Docker (futuro)
- Railway, Render ou similar

## 🗺️ Roadmap

- [ ] Autenticação completa (NextAuth.js)
- [ ] Integração real com API B3
- [ ] Relatórios mensais/anuais
- [ ] Notificações de dividendos
- [ ] App mobile (React Native)

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para detalhes.

---

*GerInvest — Simplificando o gerenciamento de investimentos brasileiros.*
