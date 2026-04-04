/**
 * API Route: POST /api/upload-b3
 * Importa carteira de investimentos do extrato B3 Investidor
 * Segue o mesmo padrão de /api/upload-positions
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPortfolioRepository } from '@/infra/repositories/postgresPortfolioRepository';
import { importPositionsFromB3CSV } from '@/infra/csv/b3Parser';
import { CreateCarteiraInput } from '@/core/domain/entities';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { csvContent, carteiraId, carteiraNome, instituicao = 'B3' } = body;

    if (!csvContent || typeof csvContent !== 'string') {
      return NextResponse.json(
        { 
          sucesso: false,
          erro: 'csvContent é obrigatório e deve ser uma string' 
        },
        { status: 400 }
      );
    }

    const repo = getPortfolioRepository();

    // Se carteiraId não fornecido, criar nova carteira
    let finalCarteiraId = carteiraId;
    if (!finalCarteiraId) {
      if (!carteiraNome) {
        return NextResponse.json(
          { 
            sucesso: false,
            erro: 'Forneça carteiraId ou carteiraNome' 
          },
          { status: 400 }
        );
      }

      const novaCarteira = await repo.createCarteira({
        nome: carteiraNome,
        moedaBase: 'BRL',
      } as CreateCarteiraInput);

      finalCarteiraId = novaCarteira.id;
    }

    // Parse B3 CSV usando o mesmo padrão do googleSheetsImporter
    const importResult = await importPositionsFromB3CSV(csvContent, {
      instituicao,
      carteiraNome,
    });

    if (!importResult.positions || importResult.positions.length === 0) {
      return NextResponse.json(
        {
          sucesso: false,
          erro: 'Nenhuma posição foi encontrada no arquivo',
          erros: importResult.perAssetClass
            .flatMap((ac: any) => ac.errors?.map((e: any) => `Linha ${e.row}: ${e.message}`) || [])
            .slice(0, 5),
        },
        { status: 400 }
      );
    }

    let ativosImportados = 0;
    let positionsImportadas = 0;
    const errosImportacao: string[] = [];

    // Map para rastrear ativos criados
    const ativoIdMap = new Map<string, string>();

    // Importar ativos (deduplica por ticker)
    const tickersCriados = new Set<string>();
    for (const position of importResult.positions) {
      const ticker = position.ticker || position.nome;
      if (!ticker || tickersCriados.has(ticker)) continue;
      tickersCriados.add(ticker);

      try {
        // Verificar se existe
        const existente = ticker ? await repo.getAtivoByTicker(ticker) : null;
        
        if (existente) {
          ativoIdMap.set(ticker, existente.id);
        } else {
          // Criar novo ativo
          const novoAtivo = await repo.createAtivo({
            ticker,
            nome: position.nome || ticker,
            classe: position.classe,
            moeda: position.moedaOriginal || 'BRL',
          });
          ativoIdMap.set(ticker, novoAtivo.id);
          ativosImportados++;
        }
      } catch (error) {
        errosImportacao.push(
          `Erro ao importar ativo ${ticker}: ${String(error)}`
        );
      }
    }

    // Importar posições
    for (const position of importResult.positions) {
      try {
        const ticker = position.ticker || position.nome;
        const ativoId = ativoIdMap.get(ticker);

        if (!ativoId) {
          errosImportacao.push(`Ativo ${ticker} não foi importado`);
          continue;
        }

        await repo.createPosicao({
          carteiraId: finalCarteiraId,
          ativoId,
          quantidade: position.quantity || position.quantidade,
          precoMedio: position.price || position.precoMedio,
          valorAtualBrl: position.valorAtualBrl || position.grossValue || 0,
          moedaOriginal: position.moedaOriginal || position.currency || 'BRL',
          instituicao: position.institution || position.instituicao || instituicao,
          dataEntrada: position.dataEntrada ? new Date(position.dataEntrada) : undefined,
        });
        positionsImportadas++;
      } catch (error) {
        errosImportacao.push(`Erro ao importar posição: ${String(error)}`);
      }
    }

    // Buscar carteira finalizada
    const carteiraFinal = await repo.getCarteiraById(finalCarteiraId);

    return NextResponse.json(
      {
        sucesso: true,
        carteira: carteiraFinal
          ? { id: carteiraFinal.id, nome: carteiraFinal.nome }
          : null,
        ativosImportados,
        positionsImportadas,
        erros: errosImportacao.length > 0 ? errosImportacao : undefined,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro em upload-b3:', error);
    return NextResponse.json(
      { 
        sucesso: false,
        erro: `Erro ao processar upload: ${String(error)}` 
      },
      { status: 500 }
    );
  }
}
