import { NextRequest } from "next/server";
import { pool } from "../../../lib/db";
import { requireAuth } from "@/lib/authGuard";
import { createAuditLog } from "@/lib/audit";
import { clienteSchema, ClienteInput } from "@/lib/schemas";
import { jsonResponse, errorResponse } from "@/lib/apiHelper";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req, ["ADMIN", "ADVISOR", "CLIENT"]);
  if (!auth.authorized) return auth.response!;
  try {
    const result = await pool.query(
      `SELECT id, nome, documento, email, created_at, updated_at
       FROM clientes
       ORDER BY nome ASC`
    );

    return jsonResponse(result.rows, 200);
  } catch (error) {
    console.error("Erro ao listar clientes:", error);
    return errorResponse("Erro ao listar clientes", 500);
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req, ["ADMIN", "ADVISOR"]);
  if (!auth.authorized) return auth.response!;

  try {
    const body = await req.json();
    const parsed = clienteSchema.safeParse(body);
    if (!parsed.success) {
      const message = parsed.error.issues.map((e) => e.message).join("; ");
      return errorResponse(message, 400);
    }

    const data: ClienteInput = parsed.data;

    const duplicated = await pool.query(
      `SELECT id FROM clientes WHERE email = $1 OR documento = $2 LIMIT 1`,
      [data.email?.trim() || null, data.documento?.trim() || null]
    );

    if ((duplicated.rowCount ?? 0) > 0) {
      return errorResponse("Já existe cliente com mesmo email ou documento.", 409);
    }

    const result = await pool.query(
      `INSERT INTO clientes (nome, documento, email)
       VALUES ($1, $2, $3)
       RETURNING id, nome, documento, email, created_at, updated_at`,
      [data.nome.trim(), data.documento?.trim() || null, data.email?.trim() || null]
    );

    const created = result.rows[0];

    await createAuditLog({
      userId: auth.token?.sub as string | undefined,
      userRole: auth.token?.role as string | undefined,
      entity: "clientes",
      entityId: created.id,
      action: "CREATE",
      afterData: created,
      ipAddress: req.headers.get("x-forwarded-for") ?? req.headers.get("host") ?? null,
      userAgent: req.headers.get("user-agent") ?? null,
    });

    return jsonResponse(created, 201);
  } catch (error) {
    console.error("Erro ao criar cliente:", error);
    return errorResponse("Erro ao criar cliente", 500);
  }
}
