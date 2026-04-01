import { NextRequest } from "next/server";
import { pool } from "../../../../lib/db";
import { requireAuth } from "@/lib/authGuard";
import { createAuditLog } from "@/lib/audit";
import { ativoSchema, AtivoInput } from "@/lib/schemas";
import { jsonResponse, errorResponse } from "@/lib/apiHelper";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const auth = await requireAuth(req, ["ADMIN", "ADVISOR", "CLIENT"]);
  if (!auth.authorized) return auth.response!;

  try {
    const result = await pool.query(
      `SELECT id, codigo_negociacao, nome_produto, tipo_papel, emissor, tipo_investimento_id, created_at, updated_at FROM ativos WHERE id = $1`,
      [id]
    );

    if (result.rowCount === 0) {
      return errorResponse("Ativo não encontrado", 404);
    }

    return jsonResponse(result.rows[0], 200);
  } catch (error) {
    console.error("Erro ao buscar ativo:", error);
    return errorResponse("Erro ao buscar ativo", 500);
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const auth = await requireAuth(req, ["ADMIN", "ADVISOR"]);
  if (!auth.authorized) return auth.response!;

  try {
    const body = await req.json();
    const parsed = ativoSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues.map((e) => e.message).join('; '), 400);
    }

    const data: AtivoInput = parsed.data;

    const existing = await pool.query(`SELECT * FROM ativos WHERE id = $1`, [id]);
    if (existing.rowCount === 0) {
      return errorResponse("Ativo não encontrado", 404);
    }

    const before = existing.rows[0];

    const duplicate = await pool.query(
      `SELECT id FROM ativos WHERE codigo_negociacao = $1 AND id <> $2 LIMIT 1`,
      [data.codigoNegociacao.trim(), id]
    );

    if ((duplicate.rowCount ?? 0) > 0) {
      return errorResponse("Já existe ativo com esse código de negociação", 409);
    }

    const result = await pool.query(
      `UPDATE ativos SET codigo_negociacao = $1, nome_produto = $2, tipo_papel = $3, emissor = $4, tipo_investimento_id = $5, updated_at = NOW() WHERE id = $6 RETURNING id, codigo_negociacao, nome_produto, tipo_papel, emissor, tipo_investimento_id, created_at, updated_at`,
      [
        data.codigoNegociacao.trim(),
        data.nomeProduto.trim(),
        data.tipoPapel?.trim() || null,
        data.emissor?.trim() || null,
        data.tipoInvestimentoId ?? null,
        id,
      ]
    );

    const updated = result.rows[0];

    await createAuditLog({
      userId: auth.token?.sub as string | undefined,
      userRole: auth.token?.role as string | undefined,
      entity: "ativos",
      entityId: id,
      action: "UPDATE",
      beforeData: before,
      afterData: updated,
      ipAddress: req.headers.get("x-forwarded-for") ?? req.headers.get("host") ?? null,
      userAgent: req.headers.get("user-agent") ?? null,
    });

    return jsonResponse(updated, 200);
  } catch (error) {
    console.error("Erro ao atualizar ativo:", error);
    return errorResponse("Erro ao atualizar ativo", 500);
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const auth = await requireAuth(req, ["ADMIN"]);
  if (!auth.authorized) return auth.response!;

  try {
    const existing = await pool.query(`SELECT * FROM ativos WHERE id = $1`, [id]);
    if (existing.rowCount === 0) {
      return errorResponse("Ativo não encontrado", 404);
    }

    await pool.query(`DELETE FROM ativos WHERE id = $1`, [id]);

    await createAuditLog({
      userId: auth.token?.sub as string | undefined,
      userRole: auth.token?.role as string | undefined,
      entity: "ativos",
      entityId: id,
      action: "DELETE",
      beforeData: existing.rows[0],
      afterData: null,
      ipAddress: req.headers.get("x-forwarded-for") ?? req.headers.get("host") ?? null,
      userAgent: req.headers.get("user-agent") ?? null,
    });

    return jsonResponse({ message: "Ativo excluído" }, 204);
  } catch (error) {
    console.error("Erro ao excluir ativo:", error);
    return errorResponse("Erro ao excluir ativo", 500);
  }
}
