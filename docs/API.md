# Referência da API — GerInvest

> Documentação completa dos endpoints da API, incluindo request/response e exemplos de uso.

## 📋 Visão Geral

A API do GerInvest é construída com **Next.js API Routes** e segue princípios REST. Todos os endpoints retornam JSON e usam códigos HTTP padrão.

**Base URL:** `http://localhost:3000/api` (desenvolvimento)

## 🔄 Endpoints Implementados

### POST `/api/upload-positions`

**Descrição:** Faz upload e processa uma planilha Excel, convertendo para CSVs estruturados.

**Request:**
```typescript
POST /api/upload-positions
Content-Type: multipart/form-data

FormData:
- file: File (Excel .xlsx)
- importMode?: 'replace' | 'merge' (default: 'replace')
```

**Response (Sucesso - 200):**
```json
{
  "success": true,
  "positions": [
    {
      "id": "uuid-1",
      "ticker": "VALE3",
      "assetClass": "ACOES",
      "quantity": 100,
      "price": 45.50,
      "grossValue": 4550.00,
      "institution": "XP Investimentos"
    }
  ],
  "errors": [],
  "summary": {
    "totalImported": 25,
    "duplicatesSkipped": 0,
    "processingTime": 150
  }
}
```

**Response (Erro - 400):**
```json
{
  "success": false,
  "positions": [],
  "errors": [
    {
      "row": 3,
      "field": "ticker",
      "message": "Ticker obrigatório não informado"
    },
    {
      "row": 5,
      "field": "assetClass",
      "message": "Classe de ativo inválida: deve ser uma de ACOES, ETF, FII..."
    }
  ],
  "summary": {
    "totalImported": 0,
    "duplicatesSkipped": 0,
    "processingTime": 120
  }
}
```

**Exemplo de uso (JavaScript):**
```javascript
const formData = new FormData();
formData.append('file', excelFile);
formData.append('importMode', 'merge');

const response = await fetch('/api/upload-positions', {
  method: 'POST',
  body: formData
});

const result = await response.json();
if (result.success) {
  console.log(`${result.summary.totalImported} posições importadas`);
} else {
  console.log('Erros encontrados:', result.errors);
}
```

**Exemplo de uso (cURL):**
```bash
curl -X POST http://localhost:3000/api/upload-positions \
  -F "file=@planilha.xlsx" \
  -F "importMode=replace"
```

---

### PATCH `/api/positions/[id]`

**Descrição:** Atualiza uma posição específica no CSV.

**Parâmetros de URL:**
- `id`: UUID da posição (string)

**Request:**
```typescript
PATCH /api/positions/uuid-123
Content-Type: application/json

{
  "ticker": "VALE3",
  "assetClass": "ACOES",
  "quantity": 150,
  "price": 46.00,
  "grossValue": 6900.00,
  "institution": "XP Investimentos",
  "description": "Vale S.A. - Atualizado"
}
```

**Response (Sucesso - 200):**
```json
{
  "id": "uuid-123",
  "ticker": "VALE3",
  "assetClass": "ACOES",
  "quantity": 150,
  "price": 46.00,
  "grossValue": 6900.00,
  "institution": "XP Investimentos",
  "description": "Vale S.A. - Atualizado",
  "updatedAt": "2026-03-31T10:30:00Z"
}
```

**Response (Erro - 404):**
```json
{
  "error": "Posição não encontrada: uuid-123"
}
```

**Response (Erro - 400):**
```json
{
  "error": "Dados inválidos",
  "details": [
    "quantity deve ser um número positivo",
    "assetClass deve ser uma classe válida"
  ]
}
```

**Exemplo de uso:**
```javascript
const updatedData = {
  quantity: 150,
  price: 46.00,
  grossValue: 6900.00
};

const response = await fetch(`/api/positions/${positionId}`, {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(updatedData)
});

if (response.ok) {
  const updatedPosition = await response.json();
  // Recarregar dashboard
  window.location.reload();
}
```

---

### DELETE `/api/positions/[id]`

**Descrição:** Remove uma posição do CSV.

**Parâmetros de URL:**
- `id`: UUID da posição (string)

**Request:**
```typescript
DELETE /api/positions/uuid-123
```

**Response (Sucesso - 200):**
```json
{
  "success": true,
  "message": "Posição removida com sucesso"
}
```

**Response (Erro - 404):**
```json
{
  "error": "Posição não encontrada: uuid-123"
}
```

---

## 🔧 Endpoints Planejados

### GET `/api/positions`

**Status:** Planejado

**Descrição:** Lista todas as posições com filtros e paginação.

**Query Parameters:**
- `page`: número da página (default: 1)
- `limit`: itens por página (default: 25)
- `assetClass`: filtro por classe
- `institution`: filtro por instituição
- `search`: busca por ticker ou descrição

**Response:**
```json
{
  "positions": [...],
  "pagination": {
    "page": 1,
    "limit": 25,
    "total": 150,
    "totalPages": 6
  },
  "filters": {
    "assetClass": "ACOES",
    "search": "VALE"
  }
}
```

---

### GET `/api/portfolio/summary`

**Status:** Planejado

**Descrição:** Retorna resumo consolidado do portfólio.

**Response:**
```json
{
  "totalInvested": 150000.00,
  "totalPositions": 25,
  "uniqueTickers": 20,
  "uniqueAccounts": 3,
  "uniqueInstitutions": 2,
  "allocations": {
    "byAssetClass": {
      "ACOES": 0.6,
      "FII": 0.3,
      "RENDA_FIXA": 0.1
    },
    "byInstitution": {
      "XP": 0.7,
      "Rico": 0.3
    }
  },
  "lastUpdated": "2026-03-31T10:30:00Z"
}
```

---

## 📊 Schemas de Dados

### Position

```typescript
interface Position {
  id: string;                    // UUID v4
  ticker: string;                // Ex: "VALE3", "PETR4"
  assetClass: AssetClass;        // Enum definido
  quantity: number;              // Quantidade (positivo)
  price: number;                 // Preço unitário
  grossValue: number;            // quantity × price
  institution?: string;          // Opcional
  account?: string;              // Opcional
  description?: string;          // Opcional
  indexer?: string;              // Para renda fixa
  maturityDate?: string;         // YYYY-MM-DD
  issuer?: string;               // Emissor
}
```

### AssetClass

```typescript
type AssetClass =
  | 'ACOES' | 'BDR' | 'ETF' | 'FII' | 'FIAGRO'
  | 'RENDA_FIXA' | 'TESOURO_DIRETO' | 'FUNDOS_MULTIMERCADO'
  | 'PREVIDENCIA' | 'CRYPTO' | 'OUTRO';
```

---

## ⚠️ Tratamento de Erros

Todos os endpoints seguem o padrão de resposta de erro:

```json
{
  "error": "Mensagem descritiva do erro",
  "details": ["Detalhes adicionais (opcional)"]
}
```

**Códigos HTTP:**
- `200`: Sucesso
- `400`: Dados inválidos
- `404`: Recurso não encontrado
- `500`: Erro interno do servidor

---

## 🔒 Autenticação

**Status Atual:** Não implementada (protótipo)

**Planejado:** NextAuth.js com JWT tokens

**Headers Futuros:**
```
Authorization: Bearer <token>
```

---

## 📈 Limites e Rate Limiting

**Status Atual:** Sem limites (desenvolvimento)

**Planejado:**
- 100 requests/min por IP
- 10 uploads/min por usuário
- 1MB máximo por arquivo

---

## 🧪 Testes da API

### Teste de Upload

```bash
# Criar arquivo de teste
echo "ticker,assetClass,quantity,price,grossValue
VALE3,ACOES,100,45.50,4550
PETR4,ACOES,50,28.00,1400" > test.csv

# Fazer upload
curl -X POST http://localhost:3000/api/upload-positions \
  -F "file=@test.csv"
```

### Teste de Edição

```bash
# Editar posição
curl -X PATCH http://localhost:3000/api/positions/uuid-123 \
  -H "Content-Type: application/json" \
  -d '{"quantity": 150, "grossValue": 6900}'
```

---

## 🔄 Versionamento

**Versão Atual:** v1 (implícita)

**Planejado:** Header `Accept-Version: v1`

---

*API Reference v1.0 — Março 2026*