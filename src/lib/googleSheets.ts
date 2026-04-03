import { google } from 'googleapis';

export type GoogleSheetsCredentials = {
  client_email: string;
  private_key: string;
};

function repairServiceAccountJson(jsonStr: string): string {
  // Corrige casos em que o private_key foi codificado com quebras de linha literais.
  // Ex: "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
  const match = jsonStr.match(/"private_key"\s*:\s*"-----BEGIN PRIVATE KEY-----([\s\S]*?)-----END PRIVATE KEY-----"/);
  if (!match) return jsonStr;

  const rawKeyBody = match[1];
  const escapedKeyBody = rawKeyBody
    .replace(/\\/g, '\\\\')
    .replace(/\r\n|\n|\r/g, '\\n');

  return jsonStr.replace(match[0], `"private_key":"-----BEGIN PRIVATE KEY-----${escapedKeyBody}-----END PRIVATE KEY-----"`);
}

function getCredentialFromEnv(): GoogleSheetsCredentials {
  // Tenta primeiro: GOOGLE_SHEETS_CREDENTIALS_JSON (JSON em base64)
  const credentialsB64 = process.env.GOOGLE_SHEETS_CREDENTIALS_JSON;
  console.log('[googleSheets] GOOGLE_SHEETS_CREDENTIALS_JSON:', credentialsB64 ? 'presente' : 'não encontrada');
  
  if (credentialsB64) {
    try {
      const jsonStr = Buffer.from(credentialsB64, 'base64').toString('utf-8');
      let creds: any = JSON.parse(jsonStr);
      console.log('[googleSheets] Credenciais decodificadas com sucesso');
      return {
        client_email: creds.client_email,
        private_key: creds.private_key,
      };
    } catch (e) {
      console.warn('[googleSheets] GOOGLE_SHEETS_CREDENTIALS_JSON inválido, tentando reparar:', e);
      try {
        const jsonStr = Buffer.from(credentialsB64, 'base64').toString('utf-8');
        const repaired = repairServiceAccountJson(jsonStr);
        const creds: any = JSON.parse(repaired);
        console.log('[googleSheets] Credenciais reparadas e decodificadas com sucesso');
        return {
          client_email: creds.client_email,
          private_key: creds.private_key,
        };
      } catch (e2) {
        console.warn('[googleSheets] Falha ao reparar GOOGLE_SHEETS_CREDENTIALS_JSON', e2);
      }
    }
  }

  // Fallback: variáveis individuais
  const rawClientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  const rawPrivateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY;

  if (!rawClientEmail || !rawPrivateKey) {
    throw new Error('Variáveis GOOGLE_SHEETS_CLIENT_EMAIL e GOOGLE_SHEETS_PRIVATE_KEY são obrigatórias, ou GOOGLE_SHEETS_CREDENTIALS_JSON.');
  }

  let privateKey = rawPrivateKey;
  // Processa se houver escape literal \\n
  if (privateKey.includes('\\n')) {
    privateKey = privateKey.replace(/\\n/g, '\n');
  }

  return {
    client_email: rawClientEmail,
    private_key: privateKey,
  };
}

export function getSheetsService() {
  const credentials = getCredentialFromEnv();

  const auth = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return google.sheets({ version: 'v4', auth });
}

export function extractSpreadsheetId(spreadsheetUrl: string): string {
  const match = spreadsheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (!match || !match[1]) {
    throw new Error('URL do Google Sheets inválida.');
  }
  return match[1];
}
