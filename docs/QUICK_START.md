# ⚡ QUICK START — Teste o MVP em 10 Minutos

## 🚀 Passo 0: Pré-requisitos

Seu servidor deve estar rodando:
```bash
npm run dev
```

Acesse: **http://localhost:3000**

---

## 📝 PASSO 1: Criar Carteira (1 min)

1. Vá para `http://localhost:3000/cadastro`
2. Clique na **aba 1 "Nova Carteira"**
3. Preencha:
   - **Nome**: `Meu Portfólio 2024`
   - **Descrição**: `Teste MVP`
   - **Perfil**: `Moderado`
   - **Moeda Base**: `BRL`
4. Clique **"Salvar Carteira"**
5. ✅ Verá mensagem verde de sucesso

---

## 🏷️ PASSO 2: Adicionar Ativos (3 min)

### Ativo 1: PETR4

1. Vá para **aba 2 "Novo Ativo"**
2. Preencha:
   - **Ticker**: `PETR4`
   - **Nome**: `Petróleo Brasileiro`
   - **Classe**: `ACAO_BR`
   - **Subclasse**: `BLUE_CHIPS`
   - **Moeda**: `BRL`
   - **Setor**: `Energia`
3. Salve
4. ✅ Sucesso

### Ativo 2: VFIIC

1. **aba 2** novamente
2. Preencha:
   - **Ticker**: `VFIIC`
   - **Nome**: `Vanguard MSCI Brazil`
   - **Classe**: `ETF_BR`
   - **Moeda**: `BRL`
3. Salve
4. ✅ Sucesso

### Ativo 3: KNHC11

1. **aba 2** novamente
2. Preencha:
   - **Ticker**: `KNHC11`
   - **Nome**: `Kinaxis Recebíveis Imobiliário`
   - **Classe**: `FII`
   - **Moeda**: `BRL`
3. Salve
4. ✅ Sucesso

---

## 💰 PASSO 3: Adicionar Posições (4 min)

### Posição 1: 100 PETR4

1. Vá para **aba 3 "Nova Posição"**
2. Preencha:
   - **Carteira**: `Meu Portfólio 2024` (dropdown)
   - **Ativo**: `PETR4` (dropdown)
   - **Quantidade**: `100`
   - **Preço Médio**: `25.50`
   - **Valor Atual BRL**: `2550.00` (auto-calcula)
   - **Moeda Original**: `BRL`
   - **Data Entrada**: `2024-01-15`
   - **Instituição**: `XP Investimentos`
3. Salve
4. ✅ Sucesso

### Posição 2: 50 VFIIC

1. **aba 3** novamente
2. Preencha:
   - **Carteira**: `Meu Portfólio 2024`
   - **Ativo**: `VFIIC`
   - **Quantidade**: `50`
   - **Preço Médio**: `100.00`
   - **Valor Atual BRL**: `5000.00` (auto)
   - **Moeda Original**: `BRL`
   - **Data Entrada**: `2024-02-01`
   - **Instituição**: `Clear`
3. Salve
4. ✅ Sucesso

### Posição 3: 10 KNHC11

1. **aba 3** novamente
2. Preencha:
   - **Carteira**: `Meu Portfólio 2024`
   - **Ativo**: `KNHC11`
   - **Quantidade**: `10`
   - **Preço Médio**: `100.00`
   - **Valor Atual BRL**: `1000.00` (auto)
   - **Moeda Original**: `BRL`
   - **Data Entrada**: `2024-03-10`
   - **Instituição**: `Rico`
3. Salve
4. ✅ Sucesso

---

## 📊 PASSO 4: Ver Dashboard (1 min)

1. Vá para **`http://localhost:3000`** (raiz)
2. Você verá:
   - **KPIs** no topo (patrimônio = R$ 8.550)
   - **Gráfico pizza** mostrando alocação:
     - 🔵 ACAO_BR: ~30% (PETR4)
     - 🟢 ETF_BR: ~58% (VFIIC)
     - 🟠 FII: ~12% (KNHC11)
   - **Tabela** listando suas 3 posições

---

## 🔍 PASSO 5: Testar Análises (2 min)

1. Procure o botão roxo **"📊 Analisar"** no header
2. Clique para abrir modal
3. Clique **"Executar Análises"**
4. Aguarde carregar (2-3 seg)
5. Você verá **5 abas**:

### 🟢 Diversificação
- **Score**: ~67% (bom para 3 ativos)
- **Top 1 Concentration**: 58% (VFIIC)
- ⚠️ Aviso: "Posição única concentra 58%"

### 🟠 FIIs
- **Total FIIs**: 1
- **Maior**: KNHC11 (R$ 1.000)
- 💡 Recomendação: Diversifique com mais FIIs

### 🟡 Criptomoedas
- **Total**: 0
- "Nenhuma posição em criptomoedas"

### 💙 Renda Fixa
- **Total**: 0
- "Nenhuma posição em renda fixa"

### 🩷 Fundos
- **Total**: 0
- "Nenhum fundo encontrado"

---

## ✅ RESULTADO ESPERADO

```
Dashboard Principal:
├─ KPI Topo: Patrimônio Total = R$ 8.550,00
├─ Gráfico Alocação:
│  ├─ ACAO_BR (PETR4): 29.8%
│  ├─ ETF_BR (VFIIC):  58.4%
│  └─ FII (KNHC11):   11.7%
├─ Tabela com 3 posições:
│  ├─ PETR4    | 100 | R$ 25.50 | R$ 2.550,00
│  ├─ VFIIC    | 50  | R$ 100.00| R$ 5.000,00
│  └─ KNHC11   | 10  | R$ 100.00| R$ 1.000,00
└─ Modal Análises:
   └─ 5 abas com scores e recomendações
```

---

## 🐛 Se Algo der Errado

| Problema | Solução |
|----------|---------|
| Formulário não salva | Verifica se todos campos obrigatórios estão preenchidos |
| Dashboard não atualiza | Refresh a página (F5) |
| Gráfico vazio | Precisa ter pelo menos 1 posição |
| Análises vazias | Espera 2-3 segundos para carregar |
| Erro de tipo/select | Tenta selecionar outra opção no dropdown |

---

## 🎯 Validação Completa

Se viu tudo isso, **MVP ESTÁ FUNCIONANDO** ✅:

- [x] Formulários web funcionando
- [x] Cadastro de dados salvando
- [x] Dashboard com KPIs
- [x] Gráficos renderizando
- [x] Análises executando

**Parabéns! Você tem um sistema pronto! 🎉**

---

## 🚀 Próximo Passo

Consigo?
1. **Leia** `docs/RECOMENDACAO_ESTRATEGICA.md` (5 min)
2. **Decida**: Revisão completa OU Tarefa F?
3. **Comunique** sua escolha

Estou pronto para:
- ✅ Fazer revisão completa de E
- ✅ Começar Tarefa F (F1, F2, F3...)
- ✅ O que você preferir!

