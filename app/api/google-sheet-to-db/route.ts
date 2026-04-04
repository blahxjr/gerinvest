/**
 * API Route: POST /api/google-sheet-to-db
 * 
 * Importa posições do Google Sheets DIRETAMENTE para PostgreSQL
 * Sem passar por CSVs intermediários
 * 
 * Body:
 * {
 *   "spreadsheetUrl": "https://docs.google.com/spreadsheets/d/...",
 *   "carteiraNome": "Minha Carteira B3" (opcional),
 *   "instituicao": "B3" (opcional)
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { importPositionsFromGoogleSheetToPostgres } from '@/infra/csv/googleSheetsImporter';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { spreadsheetUrl, carteiraNome, instituicao } = body;

    if (!spreadsheetUrl || typeof spreadsheetUrl !== 'string') {
      return NextResponse.json(
        {
          sucesso: false,
          erro: 'spreadsheetUrl é obrigatória',
        },
        { status: 400 }
      );
    }

    console.log('[google-sheet-to-db] Importando de:', spreadsheetUrl);

    const result = await importPositionsFromGoogleSheetToPostgres(spreadsheetUrl, {
      carteiraNome: carteiraNome || 'Minha Carteira B3',
      instituicao: instituicao || 'B3',
    });

    console.log('[google-sheet-to-db] Sucesso:', result.resumo);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('[google-sheet-to-db] Erro:', error);
    return NextResponse.json(
      {
        sucesso: false,
        erro: String(error),
        detalhes: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}
