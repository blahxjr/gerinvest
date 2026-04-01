import { NextRequest } from "next/server";
import { pool } from "../../../lib/db";
import { requireAuth } from "@/lib/authGuard";
import { createAuditLog } from "@/lib/audit";
import { ativoSchema, AtivoInput } from "@/lib/schemas";
import { jsonResponse, errorResponse } from "@/lib/apiHelper";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req, ["ADMIN", "ADVISOR", "CLIENT"]);
  if (!auth.authorized) return auth.response!;

  try {
    const result = await pool.query(
      `SELECT id, codigo_negociacao, nome_produto, tipo_papel, emissor, tipo_investimento_id, created_at, updated_at FROM ativos ORDER BY nome_produto ASC`
    );
    return jsonResponse(result.rows, 200);
  } catch (error) {
    console.error("Erro ao listar ativos:", error);
    return errorResponse("Erro ao listar ativos", 500);
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req, ["ADMIN", "ADVISOR"]);
  if (!auth.authorized) return auth.response!;
  try {
    const body = await req.json();
    const parsed = ativoSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues.map((e) => e.message).join('; '), 400);
    }

    const data: AtivoInput = parsed.data;

    const existing = await pool.query(
      `SELECT id FROM ativos WHERE codigo_negociacao = $1 LIMIT 1`,
      [data.codigoNegociacao.trim()]
    );

    if ((existing.rowCount ?? 0) > 0) {
      return errorResponse("Ativo já cadastrado", 409);
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
       RETURNING id, codigo_negociacao, nome_produto, tipo_papel, emissor, tipo_investimento_id, created_at, updated_at`,
      [
        data.codigoNegociacao.trim(),
        data.nomeProduto.trim(),
        data.tipoPapel?.trim() || null,
        data.emissor?.trim() || null,
        data.tipoInvestimentoId ?? null,
      ]
    );

    const created = result.rows[0];

    await createAuditLog({
      userId: auth.token?.sub as string | undefined,
      userRole: auth.token?.role as string | undefined,
      entity: "ativos",
      entityId: created.id,
      action: "CREATE",
      afterData: created,
      ipAddress: req.headers.get("x-forwarded-for") ?? req.headers.get("host") ?? null,
      userAgent: req.headers.get("user-agent") ?? null,
    });

    return jsonResponse(created, 201);
  } catch (error) {
    console.error("Erro ao criar ativo:", error);
    return errorResponse("Erro ao criar ativo", 500);
  }
}