/**
 * API Route: GET and POST /api/posicoes
 * Integra com PostgresPortfolioRepository (Tarefa E)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPortfolioRepository } from '@/infra/repositories/postgresPortfolioRepository';
import { CreatePosicaoInput } from '@/core/domain/entities';
import { pool } from '@/lib/db';

type ResolvedRelations = {
  clienteId?: string;
  instituicaoId?: string;
  contaId?: string;
};

async function resolvePositionRelations(params: {
  carteiraId: string;
  clienteId?: string;
  instituicaoId?: string;
  contaId?: string;
  instituicao?: string;
  conta?: string;
}): Promise<ResolvedRelations> {
  const resolved: ResolvedRelations = {
    clienteId: params.clienteId,
    instituicaoId: params.instituicaoId,
    contaId: params.contaId,
  };

  if (resolved.contaId) {
    const byContaId = await pool.query(
      `SELECT id, cliente_id, instituicao_id FROM contas_corretora WHERE id = $1 LIMIT 1`,
      [resolved.contaId]
    );
    const conta = byContaId.rows[0] as { id: string; cliente_id?: string; instituicao_id?: string } | undefined;
    if (conta) {
      resolved.clienteId = resolved.clienteId ?? conta.cliente_id;
      resolved.instituicaoId = resolved.instituicaoId ?? conta.instituicao_id;
      return resolved;
    }
  }

  if (params.conta && params.instituicao) {
    const byText = await pool.query(
      `SELECT cc.id, cc.cliente_id, cc.instituicao_id
       FROM contas_corretora cc
       JOIN instituicoes i ON i.id = cc.instituicao_id
       WHERE lower(trim(cc.numero_conta)) = lower(trim($1))
         AND lower(trim(i.nome)) = lower(trim($2))
       LIMIT 1`,
      [params.conta, params.instituicao]
    );
    const conta = byText.rows[0] as { id: string; cliente_id?: string; instituicao_id?: string } | undefined;
    if (conta) {
      resolved.contaId = conta.id;
      resolved.clienteId = resolved.clienteId ?? conta.cliente_id;
      resolved.instituicaoId = resolved.instituicaoId ?? conta.instituicao_id;
      return resolved;
    }
  }

  if (!resolved.instituicaoId && params.instituicao) {
    const inst = await pool.query(
      `SELECT id FROM instituicoes WHERE lower(trim(nome)) = lower(trim($1)) LIMIT 1`,
      [params.instituicao]
    );
    resolved.instituicaoId = (inst.rows[0] as { id: string } | undefined)?.id;
  }

  const carteira = await pool.query(
    `SELECT cliente_id, conta_referencia_id FROM carteiras WHERE id = $1 LIMIT 1`,
    [params.carteiraId]
  );
  const carteiraRow = carteira.rows[0] as { cliente_id?: string; conta_referencia_id?: string } | undefined;

  if (!resolved.clienteId) {
    resolved.clienteId = carteiraRow?.cliente_id;
  }

  if (!resolved.contaId && carteiraRow?.conta_referencia_id) {
    resolved.contaId = carteiraRow.conta_referencia_id;
    const contaRef = await pool.query(
      `SELECT cliente_id, instituicao_id FROM contas_corretora WHERE id = $1 LIMIT 1`,
      [resolved.contaId]
    );
    const contaRefRow = contaRef.rows[0] as { cliente_id?: string; instituicao_id?: string } | undefined;
    resolved.clienteId = resolved.clienteId ?? contaRefRow?.cliente_id;
    resolved.instituicaoId = resolved.instituicaoId ?? contaRefRow?.instituicao_id;
  }

  return resolved;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const carteiraId = searchParams.get('carteiraId');

    if (!carteiraId) {
      return NextResponse.json(
        { error: 'Parâmetro carteiraId é obrigatório' },
        { status: 400 }
      );
    }

    const repo = getPortfolioRepository();
    const posicoes = await repo.getPosicoesByCarteira(carteiraId);
    return NextResponse.json(posicoes, { status: 200 });
  } catch (error) {
    console.error('GET /api/posicoes error:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar posições' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const relations = await resolvePositionRelations({
      carteiraId: body.carteiraId,
      clienteId: body.clienteId,
      instituicaoId: body.instituicaoId,
      contaId: body.contaId,
      instituicao: body.instituicao,
      conta: body.conta,
    });

    const input: CreatePosicaoInput = {
      carteiraId: body.carteiraId,
      ativoId: body.ativoId,
      clienteId: relations.clienteId,
      instituicaoId: relations.instituicaoId,
      contaId: relations.contaId,
      quantidade: body.quantidade,
      precoMedio: body.precoMedio,
      valorAtualBruto: body.valorAtualBruto,
      valorAtualBrl: body.valorAtualBrl,
      moedaOriginal: body.moedaOriginal || 'BRL',
      instituicao: body.instituicao,
      conta: body.conta,
      custodia: body.custodia,
      dataEntrada: body.dataEntrada,
      dataVencimento: body.dataVencimento,
      origemDado: body.origemDado || 'MANUAL',
      importadoEm: body.importadoEm,
    };

    if (!input.carteiraId || !input.ativoId || input.valorAtualBrl === undefined) {
      return NextResponse.json(
        { error: 'Campos "carteiraId", "ativoId" e "valorAtualBrl" são obrigatórios' },
        { status: 400 }
      );
    }

    const repo = getPortfolioRepository();
    const posicao = await repo.createPosicao(input);
    return NextResponse.json(posicao, { status: 201 });
  } catch (error) {
    console.error('POST /api/posicoes error:', error);
    return NextResponse.json(
      { error: 'Erro ao criar posição' },
      { status: 500 }
    );
  }
}
