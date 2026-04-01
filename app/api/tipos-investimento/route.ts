import { NextResponse } from "next/server";
import { pool } from "../../../lib/db";

export async function GET() {
  try {
    const result = await pool.query(
      `SELECT id, nome FROM tipos_investimento ORDER BY nome ASC`
    );
    return NextResponse.json(result.rows, { status: 200 });
  } catch (error) {
    console.error("Erro ao listar tipos de investimento:", error);
    return NextResponse.json(
      { message: "Erro ao listar tipos de investimento" },
      { status: 500 }
    );
  }
}