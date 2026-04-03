import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { requireAuth } from "@/lib/authGuard";
import { createAuditLog } from "@/lib/audit";
import { instituicaoSchema, InstituicaoInput } from "@/lib/schemas";
import { jsonResponse, errorResponse } from "@/lib/apiHelper";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req, ["ADMIN", "ADVISOR", "CLIENT"]);
  if (!auth.authorized) return auth.response!;

  try {
    const result = await pool.query(
      `SELECT id, nome, cnpj, tipo, created_at, updated_at FROM instituicoes ORDER BY nome ASC`
    );
    return jsonResponse(result.rows, 200);
  } catch (error) {
    console.error("Erro ao listar instituições:", error);
    return errorResponse("Erro ao listar instituições", 500);
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req, ["ADMIN", "ADVISOR"]);
  if (!auth.authorized) return auth.response!;

  try {
    const body = await req.json();
    const parsed = instituicaoSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues.map((e) => e.message).join('; '), 400);
    }

    const data: InstituicaoInput = parsed.data;

    const exists = await pool.query(
      `SELECT id FROM instituicoes WHERE cnpj = $1 LIMIT 1`,
      [data.cnpj.trim()]
    );

    if ((exists.rowCount ?? 0) > 0) {
      return errorResponse("Instituição já existe", 409);
    }

    const result = await pool.query(
      `INSERT INTO instituicoes (nome, cnpj, tipo)
       VALUES ($1, $2, $3)
       RETURNING id, nome, cnpj, tipo, created_at, updated_at`,
      [data.nome.trim(), data.cnpj.trim(), data.tipo?.trim() || null]
    );

    const created = result.rows[0];

    await createAuditLog({
      userId: auth.token?.sub as string | undefined,
      userRole: auth.token?.role as string | undefined,
      entity: "instituicoes",
      entityId: created.id,
      action: "CREATE",
      afterData: created,
      ipAddress: req.headers.get("x-forwarded-for") ?? req.headers.get("host") ?? null,
      userAgent: req.headers.get("user-agent") ?? null,
    });

    return jsonResponse(created, 201);
  } catch (error) {
    console.error("Erro ao criar instituição:", error);
    return errorResponse("Erro ao criar instituição", 500);
  }
}