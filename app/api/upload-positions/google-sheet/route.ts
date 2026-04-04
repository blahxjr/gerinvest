import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/authGuard';
import { importPositionsFromGoogleSheet } from '@/infra/csv/googleSheetsImporter';
import { persistPositionsToPostgres } from '@/infra/repositories/postgresIngestionService';

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ['ADMIN', 'ADVISOR']);

    if (!auth.authorized) {
      return auth.response!;
    }

    const body = await request.json();
    const spreadsheetUrl = String(body.spreadsheetUrl ?? body.link ?? '');
    const previewOnly = body.previewOnly === true;

    if (!spreadsheetUrl) {
      return NextResponse.json({ success: false, error: 'URL da planilha do Google é obrigatória.' }, { status: 400 });
    }

    const result = await importPositionsFromGoogleSheet(spreadsheetUrl);

    if (previewOnly) {
      return NextResponse.json({
        success: true,
        preview: true,
        positions: result.positions,
        totals: result.totals,
        perAssetClass: result.perAssetClass,
      });
    }

    const persisted = await persistPositionsToPostgres(result.positions);

    return NextResponse.json({
      success: true,
      preview: false,
      ...result,
      persisted,
    });
  } catch (error) {
    console.error('[google-sheet] Erro:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
