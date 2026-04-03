# 📖 GUIA PRÁTICO — GerInvest MVP

## 🎯 Propósito
Este guia fornece instruções passo a passo para **cadastrar dados reais** e visualizar análises e gráficos no sistema.

---

## 🚀 INÍCIO RÁPIDO

### 1️⃣ Acessar o Sistema
```
URL: http://localhost:3000
Sem autenticação necessária (MVP aberta)
```

### 2️⃣ Fluxo de Cadastro
```
Página: /cadastro
Abas: 
  1. Nova Carteira
  2. Novo Ativo
  3. Nova Posição
```

---

## 📋 PASSO 1: CRIAR CARTEIRA

### O que é uma Carteira?
Um "guarda-chuva" para agrupar tus investimentos. Ex: "Investimentos Pessoais", "Reserva de Emergência"

### Como Criar

1. **Acesse** `/cadastro` → Aba **"Nova Carteira"**

2. **Preencha os campos:**

| Campo | Exemplo | Obrigatório |
|-------|---------|------------|
| **Nome** | "Investimentos Pessoais" | ✅ Sim |
| **Descrição** | "Meus investimentos 2024-2025" | ❌ Não |
| **Perfil** | Moderado | ✅ Sim |
| **Moeda Base** | BRL | ✅ Sim |

**Opções de Perfil:**
- 🟢 **Conservador** — Renda fixa, baixo risco
- 🟡 **Moderado** — Mix de renda fixa + ações (RECOMENDADO para testar tudo)
- 🔴 **Arrojado** — Muitas ações, renda variável, cripto

**Opções de Moeda:**
- **BRL** — Reais (para investimentos nacionais)
- **USD** — Dólares (para investimentos no exterior)
- **EUR** — Euros (menos comum)

3. **Clique** "Salvar Carteira"

4. **Sucesso!** ✅ Verá mensagem verde
   - A carteira aparece na aba "Novo Ativo" automaticamente

### Exemplo Prático
```
Nome:        Investimentos Pessoais
Descrição:   Minha carteira diversificada 2024
Perfil:      Moderado
Moeda Base:  BRL
```

---

## 🏷️ PASSO 2: CRIAR ATIVOS

### O que é um Ativo?
Um "produto de investimento" que você possui. Ex: PETR4 (ação), ITUB11 (ação), VFIIC (ETF)

### Classificação de Ativos (13 tipos)

| Classe | Descrição | Exemplos |
|--------|-----------|----------|
| **ACAO_BR** | Ações brasileiras | PETR4, VALE3, ITUB4 |
| **ACAO_EUA** | Ações americanas (diretas) | AAPL, MSFT, TSLA |
| **BDR** | Brazilian Depositary Receipt | VIAISIG, PBZ, POSI, VALE32 |
| **ETF_BR** | Fundos de índice brasileiros | VFIIC, XBOV, SMAL11 |
| **ETF_EUA** | Fundos de índice internacionais | VOO, VTI, BND |
| **FII** | Fundos de Investimento Imobiliário | KNHC11, MXRF11, HGLG11 |
| **REIT** | Real Estate Investment Trust (exterior) | XLRE, VNQ |
| **FUNDO** | Fundos de investimentos | Nuvem, Kinea, Monetus |
| **RENDA_FIXA** | CDB, LCI, LCA, Tesouro | Direto, Nubank, Inter |
| **POUPANCA** | Poupança (baixo retorno) | Caixa, Itaú, Bradesco |
| **PREVIDENCIA** | Planos de previdência privada | PGBL, VGBL |
| **CRIPTO** | Criptomoedas | BTC, ETH, USDC |
| **ALTERNATIVO** | Outros (ouro, forex, hedge funds) | Ouro, Imóvel, Private Equity |

### Como Criar

1. **Acesse** `/cadastro` → Aba **"Novo Ativo"**

2. **Preencha os campos:**

| Campo | Exemplo | Obrigatório | Notas |
|-------|---------|------------|-------|
| **Ticker** | PETR4 | ✅ Sim | Letras + números (ex: PETR4, VALE3, VFIIC) |
| **Nome** | Petróleo Brasileiro | ✅ Sim | Nome do ativo |
| **Classe** | ACAO_BR | ✅ Sim | Escolha na dropdown (13 opções) |
| **Subclasse** | BLUE_CHIPS | ❌ Não | Dinâmica por classe (ex: blue chips, second line) |
| **Moeda** | BRL | ✅ Sim | BRL, USD, EUR |
| **Setor** | Energia | ❓ Condicional | Obrigatório se classe = ACAO_BR, ACAO_EUA, BDR |
| **País** | Brasil | ❌ Não | Brasil, EUA, etc (preenche auto se classe = ACAO_BR) |
| **Indexador** | — | ❓ Condicional | Obrigatório se classe = CRIPTO (ex: BTC, ETH) |

3. **Clique** "Salvar Ativo"

4. **Sucesso!** ✅ Ativo aparece na aba "Nova Posição"

### Exemplos de Cadastro

#### Exemplo 1: Ação Brasileira (PETR4)
```
Ticker:      PETR4
Nome:        Petróleo Brasileiro S.A.
Classe:      ACAO_BR
Subclasse:   BLUE_CHIPS
Moeda:       BRL
Setor:       Energia
País:        Brasil
```

#### Exemplo 2: ETF Brasileiro (VFIIC)
```
Ticker:      VFIIC
Nome:        Vanguard MSCI Brazil
Classe:      ETF_BR
Subclasse:   RENDA_VARIAVEL (ou deixar em branco)
Moeda:       BRL
País:        Brasil
```

#### Exemplo 3: FII (KNHC11)
```
Ticker:      KNHC11
Nome:        Kinaxis Recebíveis
Classe:      FII
Subclasse:   FUNDO_RECEBIVEL
Moeda:       BRL
País:        Brasil
```

#### Exemplo 4: Cripto (Bitcoin)
```
Ticker:      BTC
Nome:        Bitcoin
Classe:      CRIPTO
Indexador:   BTC
Moeda:       USD (geralmente)
```

#### Exemplo 5: Ação Americana via BDR
```
Ticker:      VIAISIG
Nome:        Viáis Morgan Stanley ISIN
Classe:      BDR
Setor:       Tecnologia
Moeda:       BRL
País:        EUA (origem)
```

---

## 💰 PASSO 3: CADASTRAR POSIÇÕES

### O que é uma Posição?
Um "registro de propriedade" de um ativo em uma carteira. Ex: "Tenho 100 ações de PETR4 na minha Carteira Pessoal"

### Como Criar

1. **Acesse** `/cadastro` → Aba **"Nova Posição"**

2. **Preencha os campos:**

| Campo | Exemplo | Obrigatório | Descrição |
|-------|---------|------------|-----------|
| **Carteira** | Investimentos Pessoais | ✅ Sim | Dropdown (escolha uma criada antes) |
| **Ativo** | PETR4 | ✅ Sim | Dropdown (filtra por carteira) |
| **Quantidade** | 100 | ✅ Sim | Número de ações/cotas |
| **Preço Médio** | 25.50 | ✅ Sim | R$ por ação/cota (usa . como decimal) |
| **Valor Atual BRL** | 2550.00 | ✅ Sim | **Auto-calculado** (qtd × preço) |
| **Moeda Original** | BRL | ✅ Sim | Moeda em que você investiu |
| **Data Entrada** | 2024-01-15 | ✅ Sim | Quando você comprou |
| **Instituição** | XP Investimentos | ❌ Não | Corretora/banco |
| **Conta** | Conta Principal | ❌ Não | Número da conta |
| **Custódia** | ITAÚ | ❌ Não | Se diferente de instituição |
| **Data Vencimento** | 2025-12-31 | ❌ Não | Apenas para renda fixa |

3. **Clique** "Salvar Posição"

4. **Sucesso!** ✅ Posição aparece no Dashboard e nos gráficos

### Exemplos de Cadastro

#### Exemplo 1: 100 ações PETR4 @ R$ 25,50
```
Carteira:           Investimentos Pessoais
Ativo:              PETR4
Quantidade:         100
Preço Médio:        25.50
Valor Atual BRL:    2550.00 (auto)
Moeda Original:     BRL
Data Entrada:       2024-01-15
Instituição:        XP Investimentos
Conta:              123456789
```

#### Exemplo 2: 50 cotas de VFIIC @ R$ 100
```
Carteira:           Investimentos Pessoais
Ativo:              VFIIC
Quantidade:         50
Preço Médio:        100.00
Valor Atual BRL:    5000.00 (auto)
Moeda Original:     BRL
Data Entrada:       2024-02-01
Instituição:        Clear Corretora
```

#### Exemplo 3: 2 cotas de KNHC11 @ R$ 90,50
```
Carteira:           Investimentos Pessoais
Ativo:              KNHC11
Quantidade:         2
Preço Médio:        90.50
Valor Atual BRL:    181.00 (auto)
Moeda Original:     BRL
Data Entrada:       2024-03-10
Instituição:        Rico Investimentos
```

#### Exemplo 4: 0.5 BTC @ USD 50,000 (cripto)
```
Carteira:           Investimentos Pessoais
Ativo:              BTC
Quantidade:         0.5
Preço Médio:        50000.00
Valor Atual BRL:    250000.00 (aprox, em USD converteria)
Moeda Original:     USD
Data Entrada:       2024-01-20
Instituição:        Coinbase / Kraken
```

---

## 📊 PASSO 4: VISUALIZAR DASHBOARD E ANÁLISES

### Acessar Dashboard

1. **Acesse** `http://localhost:3000` (raiz do site)

2. **Você verá:**
   - **KPIs** no topo (patrimônio total, número de posições, etc)
   - **Gráficos** (alocação por classe, por instituição)
   - **Tabela** de todas as posições

### Botão "📊 Analisar"

1. **Procure** o botão roxo **"📊 Analisar"** no header

2. **Clique** para abrir modal

3. **Escolha uma das 5 análises:**

#### 🟢 Diversificação
- **Score 0-100%** → Quão bem diversificada está sua carteira
- **Concentração Top 1, 3, 5** → % do portfólio nas maiores posições
- **Alertas** → Avisos se muito concentrado em poucos ativos
- ✅ Fica melhor com: 5+ ativos de classes diferentes

#### 🟠 FIIs (Fundos Imobiliários)
- **Total de FIIs** cadastrados
- **Maior posição** e seu tamanho
- **Recomendações** para diversificar alocação
- ✅ Fica melhor com: 3+ FIIs diferentes

#### 🟡 Criptomoedas
- **Total de cryptos** cadastradas
- **Concentração BTC/ETH** em %
- **Recomendações** de diversificação cripto
- ✅ Fica melhor com: BTC, ETH + altcoins

#### 💙 Renda Fixa
- **Distribuição de vencimentos** (≤1yr, 1-3yr, 3-5yr, >5yr)
- **FGC Coverage** — quanto está protegido por FGC
- **Recomendações** de escada de vencimentos
- ✅ Fica melhor com: CDBs, Tesouro, LCIs com datas diferentes

#### 🩷 Fundos
- **Total de fundos** cadastrados
- **Perfil de liquidez** (diária, semanal, mensal)
- **Concentração de gestor** — quantos fundos do mesmo gestor
- **Recomendações** de diversificação
- ✅ Fica melhor com: 3+ fundos com gestores diferentes

---

## 🎯 CENÁRIOS DE TESTE RECOMENDADOS

### Cenário 1: Iniciante (Teste Rápido - 5 min)
```
Carteira 1: Meu Primeiro Investimento (Perfil: Conservador)
  ├─ Ativo 1: ITUB4 (ACAO_BR) — 50 @35.00 = R$ 1.750
  ├─ Ativo 2: VFIIC (ETF_BR) — 100 @100.00 = R$ 10.000
  └─ Ativo 3: CDB Nubank (RENDA_FIXA) — 1 @5000.00 = R$ 5.000
  
Total: R$ 16.750
Resultado: Carteira diversificada conservadora com bom score
```

### Cenário 2: Intermediário (Teste Completo - 15 min)
```
Carteira 1: Ações e ETFs (Perfil: Moderado)
  ├─ PETR4 — 100 @25.50 = R$ 2.550
  ├─ VALE3 — 50 @55.00 = R$ 2.750
  ├─ VFIIC — 50 @100.00 = R$ 5.000
  └─ SMAL11 — 30 @20.00 = R$ 600

Carteira 2: Renda Fixa (Perfil: Conservador)
  ├─ CDB 1 — 1 @10000.00 = R$ 10.000
  └─ Tesouro Direto — 1 @8000.00 = R$ 8.000

Total: R$ 28.900
Resultado: Teste de múltiplas carteiras, classes diferentes, análises ricas
```

### Cenário 3: Avançado (Teste Completo - 30 min)
```
Carteira Única: Portfólio Profissional (Perfil: Arrojado)

AÇÕES:
  ├─ PETR4 — 100 @25.00 = R$ 2.500
  ├─ VALE3 — 50 @55.00 = R$ 2.750
  ├─ ITUB4 — 200 @35.00 = R$ 7.000
  ├─ VIAISIG (BDR) — 20 @45.00 = R$ 900

ETFs:
  ├─ VFIIC — 100 @100.00 = R$ 10.000
  ├─ SMAL11 — 50 @20.00 = R$ 1.000

FIIs:
  ├─ KNHC11 — 10 @90.00 = R$ 900
  ├─ MXRF11 — 5 @13.00 = R$ 65 (requer criação)

RENDA FIXA:
  ├─ CDB — 1 @10000.00 = R$ 10.000
  ├─ Tesouro IPCA — 1 @8000.00 = R$ 8.000

CRIPTO:
  ├─ BTC — 0.05 @50000.00 = R$ 2.500
  ├─ ETH — 0.5 @2500.00 = R$ 1.250

OUTROS:
  └─ POUPANCA — 1 @5000.00 = R$ 5.000

Total: ~R$ 51.765
Resultado: Todas as 13 classes de ativos, análises super ricas, testes de performance
```

---

## 🔍 VALIDAÇÃO — COMO SABER QUE FUNCIONOU

### ✅ Checklist de Sucesso

Depois de cadastrar dados, procure por:

- [ ] Dashboard atualizada com novo patrimônio total
- [ ] Gráfico pizza mostrando alocação corretamente
- [ ] Gráfico barra com instâncias/corretoras
- [ ] Tabela de posições listando tudo que cadastrou
- [ ] Botão "📊 Analisar" clicável
- [ ] Modal abrindo com 5 abas disponíveis
- [ ] Análises mostrando números (não vazias)
- [ ] Scores de diversificação mudando conforme adiciony ativos

### 🐛 Se Algo Não Funcionar

| Problema | Solução |
|----------|---------|
| Formulários não salvam | Verificar console (F12) → Network → POST requests |
| Dashboard não atualiza | Refresh página (F5) |
| Gráficos vazios | Precisa de mínimo 1 posição |
| Análises vazias | Precisa de posições da classe específica (ex: mínimo 1 FII) |
| Erro ao salvar | Verificar se todos campos obrigatórios foram preenchidos |

---

## 📋 CHECKLIST DE CADASTRO RECOMENDADO

```
Para um MVP funcional, recomendo seguir este ordem:

[ ] 1. Criar 1 Carteira (perfil moderado ou arrojado)
[ ] 2. Criar 3-5 Ativos de classes diferentes:
      [ ] 1 Ação brasileira (PETR4, VALE3, ITUB4)
      [ ] 1 ETF brasileiro (VFIIC, SMAL11)
      [ ] 1 FII (KNHC11, MXRF11)
      [ ] 1 Renda Fixa (CDB, Tesouro)
      [ ] (Opcional) 1 Cripto (BTC, ETH)
[ ] 3. Criar 5-10 Posições espalhando pelos ativos
[ ] 4. Acessar Dashboard e verificar KPIs
[ ] 5. Clicar "Analisar" e explorar 5 abas
[ ] 6. Validar que gráficos mostram dados
```

---

## 🎓 PRINCIPAIS INSIGHTS PARA VALIDAR

Depois de cadastrar dados, navegue pela análise e procure por:

1. **Diversificação**
   - Se tem só 2 ativos → Score baixo (aviso)
   - Se tem 8+ ativos diferentes → Score alto (verde)

2. **Concentração**
   - Se uma posição = 50% portfolio → Alerta vermelho
   - Se distribuído → Tudo verde

3. **FIIs, Cripto, Renda Fixa**
   - Só aparecem se tiver posições daquela classe
   - Se não tem nada → "Nenhuma posição encontrada"

4. **Taxa de Ocupação**
   - Patrimônio Total deve somar tudo que cadastrou
   - Ex: 100 PETR4 @25 + 50 VFIIC @100 = 2.500 + 5.000 = R$ 7.500

---

## 🚀 PRÓXIMAS FUNCIONALIDADES (Tarefa F)

Depois de validar que tudo funciona com seus dados reais, a próxima tarefa pode incluir:

- [ ] **Importação B3** — Parser automático de extratos B3
- [ ] **Gráficos Avançados** — Evolução histórica, comparativos
- [ ] **Alertas** — Notificações por email/SMS
- [ ] **Simuladores** — "E se eu aplicasse mais R$ 10mil?"
- [ ] **Relatórios** — PDF com análise completa
- [ ] **Mobile App** — Acesso via smartphone

---

**Status: MVP PRONTO PARA VALIDAÇÃO COM DADOS REAIS ✅**

*Siga este guia e você terá um sistema funcional em 30 minutos!*
