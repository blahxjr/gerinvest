# E5: Plano de Testes - ProjInvest Tarefa E

## 1. BUILD VALIDATION ✅
- [x] `npm run build` passa sem erros TypeScript
- [x] 30+ routes geradas corretamente
- [x] Sem warnings críticos (apenas middleware deprecation)

## 2. API ROUTES - CARTEIRAS

### GET /api/carteiras
- [ ] Retorna array de carteiras
- [ ] Carteiras vazias: retorna `[]`
- [ ] Headers corretos: `Content-Type: application/json`

### POST /api/carteiras
**Valid payload:**
```json
{
  "nome": "Carteira Principal",
  "descricao": "Investimentos de longo prazo",
  "perfil": "moderado",
  "moedaBase": "BRL"
}
```
- [ ] Cria carteira com sucesso (status 201)
- [ ] Retorna objeto com `id`, `nome`, timestamps
- [ ] Nome obrigatório: enviar sem nome → erro 400
- [ ] Perfil válido: "conservador" | "moderado" | "arrojado"

### GET /api/carteiras/[id]
- [ ] ID válido: retorna carteira (status 200)
- [ ] ID inválido: retorna 404
- [ ] ID não UUID: retorna 400

### PATCH /api/carteiras/[id]
**Valid payload:**
```json
{ "nome": "Novo Nome", "perfil": "arrojado" }
```
- [ ] Atualiza carteira (status 200)
- [ ] Atualização parcial funciona
- [ ] ID inválido: retorna 404

### DELETE /api/carteiras/[id]
- [ ] Deleta carteira (status 200)
- [ ] ID inválido: retorna 404
- [ ] Após delete: GET retorna 404

## 3. API ROUTES - ATIVOS

### GET /api/ativos
- [ ] Retorna array de ativos
- [ ] Query param `classe` filtra por classe
  - [ ] `GET /api/ativos?classe=ACAO_BR` retorna apenas ações
  - [ ] `GET /api/ativos?classe=CRIPTO` retorna apenas criptos

### POST /api/ativos
**Valid payload:**
```json
{
  "ticker": "PETR4",
  "nome": "Petrobras SA",
  "classe": "ACAO_BR",
  "moeda": "BRL",
  "setor": "Energia"
}
```
- [ ] Cria ativo com sucesso (status 201)
- [ ] Ticker obrigatório
- [ ] Classe obrigatória (13 valores)
- [ ] Moeda obrigatória (BRL/USD/EUR)
- [ ] Subclasse opcional funciona

### PATCH /api/ativos/[id]
- [ ] Atualiza ativo (status 200)
- [ ] Não permite mudar classe sem validação

### DELETE /api/ativos/[id]
- [ ] Deleta ativo (status 200)

## 4. API ROUTES - POSIÇÕES

### GET /api/posicoes
**Query: `?carteiraId=<uuid>`**
- [ ] Com carteiraId válido: retorna posições da carteira
- [ ] Sem carteiraId: retorna erro 400
- [ ] Carteira sem posições: retorna `[]`

### POST /api/posicoes
**Valid payload:**
```json
{
  "carteiraId": "<uuid>",
  "ativoId": "<uuid>",
  "quantidade": 100,
  "precoMedio": 25.50,
  "valorAtualBrl": 2550,
  "moedaOriginal": "BRL",
  "dataEntrada": "2026-01-01T00:00:00Z"
}
```
- [ ] Cria posição com sucesso (status 201)
- [ ] Campos obrigatórios: carteiraId, ativoId, valorAtualBrl, dataEntrada
- [ ] Quantidade > 0
- [ ] PreçoMédio > 0
- [ ] ValorAtualBrl > 0

### PATCH /api/posicoes/[id]
- [ ] Atualiza quantidade (status 200)
- [ ] Atualiza preço médio
- [ ] Recalcula valorAtualBrl se necessário

### DELETE /api/posicoes/[id]
- [ ] Deleta posição (status 200)

## 5. API ROUTES - ANALYSIS

### POST /api/analysis
**Payload:**
```json
{ "analysisType": "all" }
```
- [ ] Sin posições: retorna erro 400 ("Nenhuma posição encontrada")
- [ ] Com posições: retorna objeto com 5 análises
  - [ ] `diversification`: DiversificationResult
  - [ ] `fiis`: FiiAnalysisResult
  - [ ] `crypto`: CryptoAnalysisResult
  - [ ] `fixedIncome`: FixedIncomeAnalysisResult
  - [ ] `funds`: FundAnalysisResult

**Query types:**
- [ ] `analysisType: "diversification"` retorna apenas diversification
- [ ] `analysisType: "fiis"` retorna apenas FII analysis
- [ ] `analysisType: "crypto"` retorna apenas crypto analysis

## 6. UI FORMS

### CarteiraForm
- [ ] Validação: field `nome` obrigatório
- [ ] Validação: `nome` máx 100 caracteres
- [ ] Submit: POST /api/carteiras
- [ ] Sucesso: mensagem verde, limpar form
- [ ] Erro: mensagem vermelha com detalhes
- [ ] Loading state: botão desabilitado, spinner

### AtivoForm
- [ ] Validação: `ticker` obrigatório, `^[A-Z0-9]+$`
- [ ] Validação: `nome` obrigatório
- [ ] Validação: `classe` obrigatória (dropdown com 13 opções)
- [ ] Dinâmica: setor obrigatório para ACAO_BR, ACAO_EUA, BDR
- [ ] Dinâmica: indexador obrigatório para CRIPTO
- [ ] Subclasse opcional: funciona com cada classe
- [ ] Submit: POST /api/ativos
- [ ] Sucesso: mensagem verde, navega para PosicaoForm

### PosicaoForm
- [ ] Cascata: dropdown Carteira → filtra Ativo
- [ ] Auto-calc: valorAtualBrl = quantidade × precoMedio
- [ ] Validação: quantidade > 0
- [ ] Validação: precoMedio > 0
- [ ] Data: dataEntrada obrigatória, dataVencimento opcional
- [ ] Submit: POST /api/posicoes
- [ ] Sucesso: mensagem verde

### Page Cadastro
- [ ] Tabs: "Nova Carteira", "Novo Ativo", "Nova Posição"
- [ ] Tab 1: CarteiraForm integrada
- [ ] Tab 2: AtivoForm integrada
- [ ] Tab 3: PosicaoForm integrada
- [ ] Loading na abertura: spinner até carregar dados
- [ ] Aviso: se sem carteiras, aviso em Tab 3
- [ ] Aviso: se sem ativos, aviso em Tab 3

## 7. DASHBOARD

### DashboardClient
- [ ] Botão "📊 Analisar" visível no header
- [ ] Clique abre AnalysisPanel modal
- [ ] Modal: header com "Análise da Carteira"
- [ ] Modal: botão X para fecha

### AnalysisPanel
- [ ] Sem resultados: exibe botão "Executar Análises"
- [ ] Clique: POST /api/analysis com `analysisType: "all"`
- [ ] Loading: spinner + "Analisando..."
- [ ] Sucesso: exibe abas (Diversificação, FIIs, Cripto, Renda Fixa, Fundos)
- [ ] Erro: mensagem vermelha com detalhes

### AnalysisPanel - Diversificação
- [ ] Score de Diversificação 0-100%
- [ ] Concentration: Top 1%, Top 3%, Top 5%
- [ ] Alertas com badges (info/warning/critical)
- [ ] Cores corretas por severity

### AnalysisPanel - FIIs
- [ ] Se sem FIIs: "Nenhuma posição em FII encontrada"
- [ ] Se com FIIs: número de FIIs, total alocado
- [ ] Maior posição: nome + percentual
- [ ] Recomendações com cor blue

### AnalysisPanel - Cripto
- [ ] Se sem cryptos: aviso
- [ ] Se com cryptos: número, total alocado
- [ ] BTC/ETH concentration percentuais
- [ ] Recomendações com cor teal

### AnalysisPanel - Renda Fixa
- [ ] Se sem RF: aviso
- [ ] Se com RF: número, total alocado
- [ ] Vencimentos: percentuais por faixa
- [ ] FGC coverage: coberto vs não coberto
- [ ] Recomendações com cor amber

### AnalysisPanel - Fundos
- [ ] Se sem fundos: aviso
- [ ] Se com fundos: número, total alocado
- [ ] Liquidez: diária, semanal, mensal
- [ ] Recomendações com cor pink

## 8. END-TO-END FLOW

### Fluxo Completo
1. [ ] Criar nova carteira via formulário
2. [ ] Criar novo ativo via formulário
3. [ ] Criar nova posição via formulário
4. [ ] Dashboard carrega com nova posição
5. [ ] Clica "Analisar"
6. [ ] Modal abre e executa análises
7. [ ] Análises exibem corretamente

### Cenários de Erro
- [ ] Submeter form com campos inválidos
- [ ] Submeter form com valores fora do range
- [ ] Desconecta durante submissão
- [ ] Backend retorna erro 5xx

## 9. PERFORMANCE

- [ ] Dashboard carrega em < 2s com 10+ posições
- [ ] Modal de análises responde em < 1s com <= 100 posições
- [ ] Não há memory leaks (abrir/fechar modal 10x)
- [ ] SPA: navegação suave entre tabs

## 10. ACESSIBILIDADE

- [ ] Todos botões com `aria-label`
- [ ] Modais: Escape fecha, click fora não funciona
- [ ] Formulários: labels associados aos inputs
- [ ] Cores: não é único indicador (texto + ícone)
- [ ] Recomendações de severidade visíveis sem cores

---

## RASTREAMENTO

- [x] BUILD: Pass
- [ ] API ROUTES: 15/15 testes
- [ ] UI FORMS: 15/15 testes
- [ ] DASHBOARD: 20/20 testes
- [ ] E2E: 4/4 fluxos
- [ ] ERRORS: 4/4 cenários
- [ ] PERF: 4/4 métricas
- [ ] A11Y: 5/5 critérios

**Status**: ⏳ EM PROGRESSO
