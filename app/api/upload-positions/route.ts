import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/authGuard';
import { importPositionsFromExcel } from '@/infra/csv/excelImporter';
import { persistPositionsToPostgres } from '@/infra/repositories/postgresIngestionService';

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request, ['ADMIN', 'ADVISOR']);
  if (!auth.authorized) {
    return auth.response!;
  }
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const previewOnly = String(formData.get('previewOnly') ?? 'false') === 'true';

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'Campo file não encontrado' }, { status: 400 });
    }

    const fileName = file.name || '';
    if (!/\.xlsx?$/.test(fileName.toLowerCase())) {
      return NextResponse.json({ error: 'Arquivo deve ser .xlsx ou .xls' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const result = await importPositionsFromExcel(Buffer.from(arrayBuffer));

    const previewRows = result.positions.slice(0, 20).map((p) => ({
      id: p.id,
      ticker: p.ticker ?? '-',
      nome: p.nome,
      classe: p.assetClass ?? p.classe,
      instituicao: p.institution ?? p.instituicao ?? '-',
      conta: p.account ?? p.conta ?? '-',
      quantidade: p.quantity ?? p.quantidade ?? 0,
      preco: p.price ?? p.precoMedio ?? 0,
      valor: p.grossValue ?? p.valorAtualBruto ?? 0,
    }));

    if (previewOnly) {
      return NextResponse.json({
        success: true,
        preview: true,
        fileName,
        totalCount: result.totals.totalCount,
        totalValue: result.totals.totalValue,
        perAssetClass: result.perAssetClass,
        previewRows,
      });
    }

    const persisted = await persistPositionsToPostgres(result.positions);

    return NextResponse.json({
      success: true,
      preview: false,
      fileName,
      totalCount: result.totals.totalCount,
      totalValue: result.totals.totalValue,
      perAssetClass: result.perAssetClass,
      persisted,
    });
  } catch (error) {
    console.error('upload positions failed', error);
    return NextResponse.json({ error: 'Falha na importação da planilha', details: (error as Error).message }, { status: 500 });
  }
}
