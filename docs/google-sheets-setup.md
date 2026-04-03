# Integração Google Sheets - ProjInvest

Este guia explica como configurar o Google Sheets para usar como fonte de dados no ProjInvest.

## 1. Criar projeto no Google Cloud

1. Acesse console.cloud.google.com.
2. Selecione ou crie um projeto novo.
3. No menu lateral, vá em “APIs e serviços” → “Biblioteca”.
4. Pesquise por "Google Sheets API" e ative.

## 2. Criar credenciais de serviço (Service Account)

1. Em "APIs e serviços" → "Credenciais" → "Criar credenciais" → "Conta de serviço".
2. Preencha nome, descrição.
3. Próximo:
   - Papel (Role): `Viewer` ou `Editor` conforme a necessidade.
   - Opcional (não obrigatório): permissões adicionais.
4. Criar chave:
   - Selecione formato JSON.
   - Baixe o arquivo JSON.

## 3. Permitir acesso à planilha

1. Abra a planilha Google Sheets desejada.
2. Clique em "Compartilhar".
3. Adicione o e-mail da service account (ex.: `xxx@yyy.iam.gserviceaccount.com`) como "Editor".
4. (Opcional para leitura pública) Ative "Qualquer pessoa com o link" -> "Visualizador".

## 4. Preparar variáveis de ambiente

No arquivo `.env` do projeto, adicione:

```env
GOOGLE_SHEETS_CLIENT_EMAIL=xxx@yyy.iam.gserviceaccount.com
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_SPREADSHEET_ID=<ID-da-planilha>
NEXTAUTH_SECRET=<secret>
```

Se o private key contiver `\n`, use `replace(/\\n/g, '\n')` no código (já implementado em `src/lib/googleSheets.ts`).

## 5. Identificar `spreadsheetId`

Formato do link: `https://docs.google.com/spreadsheets/d/<SPREADSHEET_ID>/edit`

Extraia o valor `<SPREADSHEET_ID>` para uso em configuração ou para colar no seu frontend.

## 6. Rotas API disponíveis

- `POST /api/upload-positions/google-sheet`:
  - body: `{ spreadsheetUrl: string }`
  - função: importa do Google Sheets, valida, grava CSV e retorna status.

- `POST /api/upload-positions`:
  - upload Excel local (legacy)

## 7. Uso na UI

Na interface de importação (página `/upload`):
- opção 1: upload de arquivo `.xlsx`/`.xls`
- opção 2: colar link do Google Sheets para importação direta.

## 8. Teste de clique

1. Execute `npm run dev -- --hostname 0.0.0.0`.
2. Acesse `http://localhost:3000/upload`.
3. Cole o link do Sheet e clique em "Importar do Google Sheets".
4. Confira se dados aparecem no dashboard (`/`).

## 9. Observações de segurança

- Nunca comitar `GOOGLE_SHEETS_PRIVATE_KEY` no git.
- Guarde credenciais em vault ou serviço seguro em produção.
- Revalide permissões de sheet e role de conta de serviço.

## 10. Solução de problemas

- Erro 403 / `insufficientPermissions`: verifique o compartilhamento da planilha para a service account.
- Erro de chave inválida: verifique o JSON e o escape de newlines.
- Erro de URL: verifique se está no formato `https://docs.google.com/spreadsheets/d/<ID>/...`.
