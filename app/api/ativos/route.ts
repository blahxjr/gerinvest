import { NextResponse } from "next/server";
import { pool } from "../../../lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      codigoNegociacao,
      nomeProduto,
      tipoPapel,
      emissor,
      tipoInvestimentoId,
    } = body;

    if (!nomeProduto || !codigoNegociacao) {
      return NextResponse.json(
        { message: "Nome do produto e código de negociação são obrigatórios." },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `INSERT INTO ativos (
         codigo_negociacao,
         nome_produto,
         tipo_papel,
         emissor,
         tipo_investimento_id
       )
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, codigo_negociacao, nome_produto, tipo_papel, emissor, tipo_investimento_id`,
      [
        codigoNegociacao.trim(),
        nomeProduto.trim(),
        tipoPapel?.trim() || null,
        emissor?.trim() || null,
        tipoInvestimentoId ? Number(tipoInvestimentoId) : null,
      ]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("Erro ao criar ativo:", error);
    return NextResponse.json(
      { message: "Erro ao criar ativo" },
      { status: 500 }
    );
  }
}