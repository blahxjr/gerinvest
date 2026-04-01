import { NextRequest, NextResponse } from "next/server";
import { pool } from "../../../lib/db";
import { requireAuth } from "@/lib/authGuard";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req, ["ADMIN", "ADVISOR"]);
  if (!auth.authorized) return auth.response!;

  try {
    const result = await pool.query(
      `SELECT id, user_id, user_role, entity, entity_id, action, before_data, after_data, ip_address, user_agent, created_at
       FROM audit_logs
       ORDER BY created_at DESC
       LIMIT 500`
    );
    return NextResponse.json(result.rows, { status: 200 });
  } catch (error) {
    console.error("Erro ao listar audit logs:", error);
    return NextResponse.json({ message: "Erro ao listar audit logs" }, { status: 500 });
  }
}
