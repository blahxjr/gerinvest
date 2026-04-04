# 🔄 Google Sheets → PostgreSQL - Guia de Sincronização

## ✨ O que foi implementado

Você agora tem um novo fluxo de importação que **sincroniza suas posições do Google Sheets diretamente para o PostgreSQL**, sem necessidade de gerar CSVs intermediários.

### Arquitetura Implementada

```
Google Sheets (sua planilha)
         ↓
  getSheetsService() [Google API]
         ↓
  importPositionsFromGoogleSheetToPostgres()
         ↓
Criar/obter Carteira
         ↓
Criar/obter Ativos (por ticker)
         ↓
Criar Posições
         ↓
PostgreSQL ✅
```

### Componentes Criados

#### 1. **Função de Importação** (`src/infra/csv/googleSheetsImporter.ts`)
```typescript
export async function importPositionsFromGoogleSheetToPostgres(
  spreadsheetUrl: string,
  options: { carteiraNome?: string; instituicao?: string } = {}
)
```

- Lê abas da planilha via Google Sheets API
- Mapeia dados para `Position[]`
- Converte classes de ativo (Position → ClasseAtivo)
- Insere direto no PostgreSQL
- Cria carteira automaticamente se não existir
- Cria ativos se não existirem
- Trata UNIQUE constraints graciosamente

#### 2. **API Route** (`app/api/google-sheet-to-db/route.ts`)
```
POST /api/google-sheet-to-db
```

Body:
```json
{
  "spreadsheetUrl": "https://docs.google.com/spreadsheets/d/...",
  "carteiraNome": "Minha Carteira B3",
  "instituicao": "B3"
}
```

Response:
```json
{
  "sucesso": true,
  "carteira": { "id": "...", "nome": "Minha Carteira B3" },
  "ativosImportados": 5,
  "positionsImportadas": 28,
  "resumo": {
    "totalPositoes": 28,
    "processadas": 28,
    "errosDetectados": 0
  }
}
```

#### 3. **Componente UI** (`src/ui/components/upload/GoogleSheetsSync.tsx`)
- Formulário para colar link da planilha
- Campo para nome da carteira
- Select para instituição (B3, XP, Clear, Inter, Rico, NuInvest, etc.)
- Status em tempo real com emojis
- Detalhamento de sucesso/erros

#### 4. **Página Atualizada** (`app/upload/page.tsx`)
- Layout 2 colunas
- Lado esquerdo: **Google Sheets Sync** (novo)
- Lado direito: **B3 Upload** (existente)
- Instruções claras de quando usar cada um

---

## 🚀 Como Usar

### Pré-requisitos
1. **Variáveis de ambiente configuradas** (já estão):
   ```
   GOOGLE_SHEETS_CREDENTIALS_JSON=<base64>
   ```

2. **Sua planilha do Google Sheets** deve ter abas com nomes reconhecidos:
   - `Ações`, `Acao BR` → ACAO_BR
   - `BDR` → BDR
   - `ETF` → ETF_BR
   - `FII` → FII
   - `Fundo` → FUNDO
   - `Renda Fixa` → RENDA_FIXA
   - etc.

3. **Colunas esperadas** (mesmas que o sistema atual):
   - `ticker` (obrigatório)
   - `nome` ou `descricao`
   - `quantidade`
   - `precoMedio` ou `preco`
   - `valorAtualBruto` ou `grossValue`
   - `instituicao`
   - `moedaOriginal` (padrão: BRL)

### Passos para Sincronizar Sua Planilha

1. **Acesse**: http://localhost:3000/upload

2. **Lado esquerdo** - Fill o formulário **Google Sheets**:
   - Cole o link: `https://docs.google.com/spreadsheets/d/1CvkvSLcMSXix5E7zeDzkMqgVT8UFqqz2NQ1g-Z8Pgl0/edit?usp=sharing`
   - Nome da Carteira: `Minha Carteira B3` (ou outro)
   - Instituição: `B3`
   - Clique: **🔄 Sincronizar**

3. **Resultado**:
   - ✅ Carteira criada (se não existia)
   - ✅ Ativos criados (se não existiam)
   - ✅ Posições importadas direto para PostgreSQL

4. **Validar no Dashboard**:
   - Acesse: http://localhost:3000
   - Veja suas posições carregando em tempo real
   - KPIs e gráficos atualizando

---

## 📊 Mapeamento de Classes

O sistema converte automaticamente classes antigas para o novo esquema:

| Entrada (Position) | Saída (ClasseAtivo) |
|------------------|-----------------|
| ACAO_BR, ACOES | ACAO_BR |
| BDR | BDR |
| ETF_BR, ETF | ETF_BR |
| FII | FII |
| FUNDO, FUNDO_MULTIMERCADO | FUNDO |
| RENDA_FIXA | RENDA_FIXA |
| ACAO_EUA | ACAO_EUA |
| ETF_EUA | ETF_EUA |
| REIT | REIT |
| CRIPTO | CRIPTO |
| PREVIDENCIA | PREVIDENCIA |
| Outros | ALTERNATIVO |

---

## ⚙️ Fluxo Técnico Passo a Passo

### 1️⃣ Frontend
```
User passa URL + carteiraNome
         ↓
POST /api/google-sheet-to-db
         ↓
Aguarda resposta
         ↓
Mostra sucesso/erro com emojis
```

### 2️⃣ Backend - Início
```
extractSpreadsheetId(url)
         ↓
getSheetsService() → autentica com credenciais
         ↓
Lê todas as sheets do workbook
```

### 3️⃣ Backend - Por cada Sheet
```
Para cada aba reconhecida:
  ├─ Detectar classe (ACAO_BR, BDR, etc)
  ├─ Ler valores A1:Z9999
  ├─ Para cada linha válida:
  │  ├─ buildPositionFromRaw()
  │  ├─ validatePosition()
  │  └─ Agregar em positions[]
```

### 4️⃣ Backend - Inserir Carteira
```
SELECT * FROM carteiras WHERE nome = 'Minha Carteira B3'
         ↓
Se não existe: CREATE carteira
         ↓
Use carteira.id
```

### 5️⃣ Backend - Inserir Ativos
```
Para cada posição única (por ticker):
  ├─ SELECT * FROM ativos WHERE ticker = 'PETR4'
  ├─ Se existe: reuse ativos.id
  └─ Se não existe: CREATE ativo
```

### 6️⃣ Backend - Inserir Posições
```
Para cada posição:
  ├─ INSERT INTO posicoes (
  │    carteira_id, 
  │    ativo_id, 
  │    quantidade, 
  │    preco_medio,
  │    valor_atual_brl,
  │    instituicao,
  │    data_entrada
  │  )
  └─ ON UNIQUE CONSTRAINT: skip (já existe)
```

### 7️⃣ Resposta
```json
{
  "sucesso": true,
  "carteira": { "id": "uuid", "nome": "Minha Carteira B3" },
  "ativosImportados": 5,      // novos ativos criados
  "positionsImportadas": 28,  // posições inserted
  "erros": [],                // UNIQUE violations, etc
  "resumo": { ... }
}
```

---

## 🛡️ Tratamento de Erros

### Duplicatas (Posições já existentes)
```
Se INSERT gera UNIQUE constraint violation:
  → Log como "erro" mas não quebra fluxo
  → Próxima posição continua
  → Resultado marca como sucesso parcial
```

### Ativos sem ticker
```
Se position.ticker é vazio:
  → Usa position.nome como fallback
  → Se ambos vazios: pula posição
```

### Classes desconhecidas
```
Se aba não reconhecida:
  → Pula a aba (skip)
  
Se posição.classe inválida:
  → Mapeia para 'ALTERNATIVO'
```

---

## 📝 Exemplos de Resposta

### ✅ Sucesso Completo
```json
{
  "sucesso": true,
  "carteira": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "nome": "Minha Carteira B3"
  },
  "ativosImportados": 5,
  "positionsImportadas": 28,
  "resumo": {
    "totalPositoes": 28,
    "processadas": 28,
    "errosDetectados": 0
  }
}
```

### ⚠️ Sucesso Parcial (com duplicatas)
```json
{
  "sucesso": true,
  "carteira": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "nome": "Minha Carteira B3"
  },
  "ativosImportados": 3,
  "positionsImportadas": 25,
  "erros": [
    "Erro ao importar posição PETR4: duplicate key value violates unique constraint",
    "Erro ao importar posição VALE3: duplicate key value violates unique constraint"
  ],
  "resumo": {
    "totalPositoes": 28,
    "processadas": 25,
    "errosDetectados": 3
  }
}
```

### ❌ Erro Crítico
```json
{
  "sucesso": false,
  "erro": "Google Sheets API authentication failed",
  "detalhes": "Credenciais inválidas ou planilha não compartilhada"
}
```

---

## 🔧 Customizações Possíveis

### Mudar nome padrão da carteira
Edite `googleSheetsImporter.ts` linha ~170:
```typescript
const { carteiraNome = 'Minha Carteira B3', ... }
```

### Adicionar campos adicionais
No tipo `CreatePosicaoInput`, adicione:
```typescript
dataVencimento?: Date;
indexador?: string;
// etc
```

Depois mapeie no googleSheetsImporter:
```typescript
dataVencimento: position.dataVencimento ? new Date(...) : undefined,
```

### Forçar replaçar posições duplicadas
Troque o tratamento de erro:
```typescript
} catch (error) {
  if (String(error).includes('UNIQUE')) {
    // UPDATE em vez de INSERT
    await repo.updatePosicao(...);
  } else {
    throw error;
  }
}
```

---

## 📚 Diferenças: Google Sheets × B3 Upload

| Aspecto | Google Sheets | B3 Upload |
|---------|--------------|-----------|
| **Source** | Planilha ao vivo | CSV estático |
| **Sincronização** | Manual (clique botão) | Manual (upload arquivo) |
| **Ativos** | Cria automaticamente | Cria automaticamente |
| **Ideal para** | Portfólio consolidado | Atualizações rápidas |
| **Frequência** | Quinzenal/semanal | Diária |

**Recomendação**: Use Google Sheets para import inicial, B3 para atualizações incrementais.

---

## 🎯 Próximos Passos Opcionais

- [ ] Adicionar **sincronização automática** a cada X horas
- [ ] Criar **histórico de sincronizações** (auditoria)
- [ ] Permitir **mapeamento flexível** de colunas per planilha
- [ ] Integrar **alertas** se posição changed significantly
- [ ] Suportar **múltiplas planilhas** por carteira

---

**Status**: ✅ Totalmente funcional e pronto para uso!
