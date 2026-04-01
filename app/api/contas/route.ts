import { NextResponse } from "next/server";
import { pool } from "../../../lib/db";

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        cc.id,
        cc.numero_conta,
        cc.apelido,
        c.nome AS cliente_nome,
        i.nome AS instituicao_nome,
        cc.created_at
      FROM contas_corretora cc
      JOIN clientes c ON c.id = cc.cliente_id
      JOIN instituicoes i ON i.id = cc.instituicao_id
      ORDER BY cc.created_at DESC
    `);

    return NextResponse.json(result.rows, { status: 200 });
  } catch (error) {
    console.error("Erro ao listar contas:", error);
    return NextResponse.json(
      { message: "Erro ao listar contas" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { clienteId, instituicaoId, numeroConta, apelido } = body;

    if (!clienteId || !instituicaoId || !numeroConta) {
      return NextResponse.json(
        { message: "Cliente, instituição e número da conta são obrigatórios." },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `INSERT INTO contas_corretora (cliente_id, instituicao_id, numero_conta, apelido)
       VALUES ($1, $2, $3, $4)
       RETURNING id, cliente_id, instituicao_id, numero_conta, apelido, created_at`,
      [clienteId, instituicaoId, numeroConta.trim(), apelido?.trim() || null]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("Erro ao criar conta:", error);
    return NextResponse.json(
      { message: "Erro ao criar conta" },
      { status: 500 }
    );
  }
}