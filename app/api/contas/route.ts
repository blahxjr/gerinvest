import { NextRequest } from "next/server";
import { pool } from "../../../lib/db";
import { requireAuth } from "@/lib/authGuard";
import { createAuditLog } from "@/lib/audit";
import { contaSchema, ContaInput } from "@/lib/schemas";
import { jsonResponse, errorResponse } from "@/lib/apiHelper";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req, ["ADMIN", "ADVISOR", "CLIENT"]);
  if (!auth.authorized) return auth.response!;
  try {
    const result = await pool.query(`
      SELECT
        cc.id,
        cc.numero_conta,
        cc.apelido,
        c.nome AS cliente_nome,
        i.nome AS instituicao_nome,
        cc.created_at,
        cc.updated_at
      FROM contas_corretora cc
      JOIN clientes c ON c.id = cc.cliente_id
      JOIN instituicoes i ON i.id = cc.instituicao_id
      ORDER BY cc.created_at DESC
    `);

    return jsonResponse(result.rows, 200);
  } catch (error) {
    console.error("Erro ao listar contas:", error);
    return errorResponse("Erro ao listar contas", 500);
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req, ["ADMIN", "ADVISOR"]);
  if (!auth.authorized) return auth.response!;

  try {
    const body = await req.json();
    const parsed = contaSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues.map((e) => e.message).join('; '), 400);
    }

    const data: ContaInput = parsed.data;

    const exists = await pool.query(
      `SELECT id FROM contas_corretora WHERE cliente_id = $1 AND instituicao_id = $2 AND numero_conta = $3 LIMIT 1`,
      [data.clienteId, data.instituicaoId, data.numeroConta.trim()]
    );

    if ((exists.rowCount ?? 0) > 0) {
      return errorResponse("Conta já cadastrada para essa instituição e cliente.", 409);
    }

    const result = await pool.query(
      `INSERT INTO contas_corretora (cliente_id, instituicao_id, numero_conta, apelido)
       VALUES ($1, $2, $3, $4)
       RETURNING id, cliente_id, instituicao_id, numero_conta, apelido, created_at, updated_at`,
      [data.clienteId, data.instituicaoId, data.numeroConta.trim(), data.apelido?.trim() || null]
    );

    const created = result.rows[0];

    await createAuditLog({
      userId: auth.token?.sub as string | undefined,
      userRole: auth.token?.role as string | undefined,
      entity: "contas_corretora",
      entityId: created.id,
      action: "CREATE",
      afterData: created,
      ipAddress: req.headers.get("x-forwarded-for") ?? req.headers.get("host") ?? null,
      userAgent: req.headers.get("user-agent") ?? null,
    });

    return jsonResponse(created, 201);
  } catch (error) {
    console.error("Erro ao criar conta:", error);
    return errorResponse("Erro ao criar conta", 500);
  }
}