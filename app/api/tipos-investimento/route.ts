import { pool } from "../../../lib/db";
import { requireAuth } from "@/lib/authGuard";
import { createAuditLog } from "@/lib/audit";
import { tipoInvestimentoSchema, TipoInvestimentoInput } from "@/lib/schemas";
import { jsonResponse, errorResponse } from "@/lib/apiHelper";

export async function GET() {
  // GET de tipos de investimento deve funcionar para o frontend sem exigir token,
  // permitindo preenchimento de formulários mesmo em sessões em que não há autenticação pronta.
  try {
    const result = await pool.query(
      `SELECT id, nome, descricao, created_at, updated_at FROM tipos_investimento ORDER BY nome ASC`
    );
    return jsonResponse(result.rows, 200);
  } catch (error) {
    console.error("Erro ao listar tipos de investimento:", error);
    return errorResponse("Erro ao listar tipos de investimento", 500);
  }
}

export async function POST(req: Request) {
  const auth = await requireAuth(req, ["ADMIN", "ADVISOR"]);
  if (!auth.authorized) return auth.response!;

  try {
    const body = await req.json();
    const parsed = tipoInvestimentoSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.errors.map((e) => e.message).join('; '), 400);
    }

    const data: TipoInvestimentoInput = parsed.data;

    const exists = await pool.query(
      `SELECT id FROM tipos_investimento WHERE nome ILIKE $1 LIMIT 1`,
      [data.nome.trim()]
    );

    if (exists.rowCount > 0) {
      return errorResponse("Tipo de investimento já existe", 409);
    }

    const result = await pool.query(
      `INSERT INTO tipos_investimento (nome, descricao)
       VALUES ($1, $2)
       RETURNING id, nome, descricao, created_at, updated_at`,
      [data.nome.trim(), data.descricao?.trim() || null]
    );

    const created = result.rows[0];

    await createAuditLog({
      userId: auth.token?.sub as string | undefined,
      userRole: auth.token?.role as string | undefined,
      entity: "tipos_investimento",
      entityId: created.id,
      action: "CREATE",
      afterData: created,
      ipAddress: req.headers.get("x-forwarded-for") ?? req.headers.get("host") ?? null,
      userAgent: req.headers.get("user-agent") ?? null,
    });

    return jsonResponse(created, 201);
  } catch (error) {
    console.error("Erro ao criar tipo de investimento:", error);
    return errorResponse("Erro ao criar tipo de investimento", 500);
  }
}