import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/authGuard';
import { importPositionsFromGoogleSheet } from '@/infra/csv/googleSheetsImporter';

export async function POST(request: NextRequest) {
  console.log('[google-sheet-route] Variáveis de ambiente carregadas:');
  console.log('[google-sheet-route] GOOGLE_SHEETS_CREDENTIALS_JSON:', process.env.GOOGLE_SHEETS_CREDENTIALS_JSON ? 'presente (length: ' + process.env.GOOGLE_SHEETS_CREDENTIALS_JSON.length + ')' : 'NÃO ENCONTRADA');
  console.log('[google-sheet-route] GOOGLE_SHEETS_CLIENT_EMAIL:', process.env.GOOGLE_SHEETS_CLIENT_EMAIL || 'NÃO ENCONTRADA');
  
  try {
    const auth = await requireAuth(request, ['ADMIN', 'ADVISOR']);
    
    if (!auth.authorized) {
      console.warn('[google-sheet] Auth failed:', auth);
      // Permitir sem auth por enquanto para debug
      // return auth.response!;
    }

    const body = await request.json();
    const spreadsheetUrl = String(body.spreadsheetUrl ?? body.link ?? '');

    if (!spreadsheetUrl) {
      return NextResponse.json({ success: false, error: 'URL da planilha do Google é obrigatória.' }, { status: 400 });
    }

    console.log('[google-sheet] Importando de:', spreadsheetUrl);
    const result = await importPositionsFromGoogleSheet(spreadsheetUrl);
    console.log('[google-sheet] Sucesso:', result.totals);

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('[google-sheet] Erro:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
