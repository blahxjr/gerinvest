import { NextRequest } from 'next/server';
import { pool } from '../../../../lib/db';
import { requireAuth } from '@/lib/authGuard';
import { createAuditLog } from '@/lib/audit';
import { clienteSchema, ClienteInput } from '@/lib/schemas';
import { jsonResponse, errorResponse } from '@/lib/apiHelper';

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const auth = await requireAuth(req, ['ADMIN', 'ADVISOR', 'CLIENT']);
  if (!auth.authorized) return auth.response!;

  try {
    const result = await pool.query(
      `SELECT id, nome, documento, email, created_at, updated_at FROM clientes WHERE id = $1`,
      [id]
    );

    if (result.rowCount === 0) {
      return errorResponse('Cliente não encontrado', 404);
    }

    return jsonResponse(result.rows[0], 200);
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    return errorResponse('Erro ao buscar cliente', 500);
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const auth = await requireAuth(req, ['ADMIN', 'ADVISOR']);
  if (!auth.authorized) return auth.response!;

  try {
    const body = await req.json();
    const parsed = clienteSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues.map((e) => e.message).join('; '), 400);
    }

    const data: ClienteInput = parsed.data;

    const existing = await pool.query(
      `SELECT * FROM clientes WHERE id = $1`,
      [id]
    );

    if (existing.rowCount === 0) {
      return errorResponse('Cliente não encontrado', 404);
    }

    const beforeData = existing.rows[0];

    const duplicated = await pool.query(
      `SELECT id FROM clientes WHERE (email = $1 OR documento = $2) AND id <> $3 LIMIT 1`,
      [data.email?.trim() || null, data.documento?.trim() || null, id]
    );

    if ((duplicated.rowCount ?? 0) > 0) {
      return errorResponse('Já existe cliente com mesmo email ou documento.', 409);
    }

    const result = await pool.query(
      `UPDATE clientes SET nome = $1, documento = $2, email = $3, updated_at = now() WHERE id = $4 RETURNING id, nome, documento, email, created_at, updated_at`,
      [data.nome.trim(), data.documento?.trim() || null, data.email?.trim() || null, id]
    );

    const updated = result.rows[0];

    await createAuditLog({
      userId: auth.token?.sub as string | undefined,
      userRole: auth.token?.role as string | undefined,
      entity: 'clientes',
      entityId: id,
      action: 'UPDATE',
      beforeData,
      afterData: updated,
      ipAddress: req.headers.get('x-forwarded-for') ?? req.headers.get('host') ?? null,
      userAgent: req.headers.get('user-agent') ?? null,
    });

    return jsonResponse(updated, 200);
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    return errorResponse('Erro ao atualizar cliente', 500);
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const auth = await requireAuth(req, ['ADMIN']);
  if (!auth.authorized) return auth.response!;

  try {
    const existing = await pool.query(`SELECT id, nome, documento, email FROM clientes WHERE id = $1`, [id]);
    if (existing.rowCount === 0) {
      return errorResponse('Cliente não encontrado', 404);
    }

    await pool.query(`DELETE FROM clientes WHERE id = $1`, [id]);

    await createAuditLog({
      userId: auth.token?.sub as string | undefined,
      userRole: auth.token?.role as string | undefined,
      entity: 'clientes',
      entityId: id,
      action: 'DELETE',
      beforeData: existing.rows[0],
      afterData: null,
      ipAddress: req.headers.get('x-forwarded-for') ?? req.headers.get('host') ?? null,
      userAgent: req.headers.get('user-agent') ?? null,
    });

    return jsonResponse({ message: 'Cliente excluído' }, 204);
  } catch (error) {
    console.error('Erro ao excluir cliente:', error);
    return errorResponse('Erro ao excluir cliente', 500);
  }
}
