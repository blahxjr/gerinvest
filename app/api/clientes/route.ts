import { NextResponse } from "next/server";
import { pool } from "../../../lib/db";

export async function GET() {
  try {
    // Simples, só o que precisamos para selects e listagens
    const result = await pool.query(
      `SELECT id, nome, documento, email
       FROM clientes
       ORDER BY nome ASC`
    );

    return NextResponse.json(result.rows, { status: 200 });
  } catch (error) {
    console.error("Erro ao listar clientes:", error);
    return NextResponse.json(
      { message: "Erro ao listar clientes" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nome, documento, email } = body;

    if (!nome || typeof nome !== "string") {
      return NextResponse.json(
        { message: "Nome é obrigatório" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `INSERT INTO clientes (nome, documento, email)
       VALUES ($1, $2, $3)
       RETURNING id, nome, documento, email`,
      [nome.trim(), documento?.trim() || null, email?.trim() || null]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("Erro ao criar cliente:", error);
    return NextResponse.json(
      { message: "Erro ao criar cliente" },
      { status: 500 }
    );
  }
}