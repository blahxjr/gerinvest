import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/authGuard';
import { importPositionsFromExcel } from '@/infra/csv/excelImporter';

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request, ['ADMIN', 'ADVISOR']);
  if (!auth.authorized) {
    return auth.response!;
  }
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'Campo file não encontrado' }, { status: 400 });
    }

    const fileName = file.name || '';
    if (!/\.xlsx?$/.test(fileName.toLowerCase())) {
      return NextResponse.json({ error: 'Arquivo deve ser .xlsx ou .xls' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const result = await importPositionsFromExcel(Buffer.from(arrayBuffer));

    return NextResponse.json({
      success: true,
      fileName,
      totalCount: result.totals.totalCount,
      totalValue: result.totals.totalValue,
      perAssetClass: result.perAssetClass,
      data: result.positions,
    });
  } catch (error) {
    console.error('upload positions failed', error);
    return NextResponse.json({ error: 'Falha na importação da planilha', details: (error as Error).message }, { status: 500 });
  }
}
