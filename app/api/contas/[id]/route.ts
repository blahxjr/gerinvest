import { NextRequest } from 'next/server';
import { pool } from '../../../../lib/db';
import { requireAuth } from '@/lib/authGuard';
import { createAuditLog } from '@/lib/audit';
import { contaSchema, ContaInput } from '@/lib/schemas';
import { jsonResponse, errorResponse } from '@/lib/apiHelper';

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const auth = await requireAuth(req, ['ADMIN', 'ADVISOR', 'CLIENT']);
  if (!auth.authorized) return auth.response!;

  try {
    const result = await pool.query(
      `
      SELECT
        cc.id,
        cc.cliente_id,
        cc.instituicao_id,
        cc.numero_conta,
        cc.apelido,
        c.nome AS cliente_nome,
        i.nome AS instituicao_nome,
        cc.created_at
      FROM contas_corretora cc
      JOIN clientes c ON c.id = cc.cliente_id
      JOIN instituicoes i ON i.id = cc.instituicao_id
      WHERE cc.id = $1
    `,
      [id]
    );

    if (result.rowCount === 0) {
      return errorResponse('Conta não encontrada', 404);
    }

    return jsonResponse(result.rows[0], 200);
  } catch (error) {
    console.error('Erro ao buscar conta:', error);
    return errorResponse('Erro ao buscar conta', 500);
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const auth = await requireAuth(req, ['ADMIN', 'ADVISOR']);
  if (!auth.authorized) return auth.response!;

  try {
    const body = await req.json();
    const parsed = contaSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues.map((e) => e.message).join('; '), 400);
    }

    const data: ContaInput = parsed.data;

    const existing = await pool.query(`SELECT * FROM contas_corretora WHERE id = $1`, [id]);
    if (existing.rowCount === 0) {
      return errorResponse('Conta não encontrada', 404);
    }

    const beforeData = existing.rows[0];

    const exists = await pool.query(
      `SELECT id FROM contas_corretora WHERE cliente_id = $1 AND instituicao_id = $2 AND numero_conta = $3 AND id <> $4 LIMIT 1`,
      [data.clienteId, data.instituicaoId, data.numeroConta.trim(), id]
    );

    if ((exists.rowCount ?? 0) > 0) {
      return errorResponse('Conta já cadastrada para essa instituição e cliente.', 409);
    }

    const result = await pool.query(
      `UPDATE contas_corretora SET cliente_id = $1, instituicao_id = $2, numero_conta = $3, apelido = $4, updated_at = NOW() WHERE id = $5 RETURNING id, cliente_id, instituicao_id, numero_conta, apelido, created_at, updated_at`,
      [data.clienteId, data.instituicaoId, data.numeroConta.trim(), data.apelido?.trim() || null, id]
    );

    if (result.rowCount === 0) {
      return errorResponse('Conta não encontrada', 404);
    }

    const updated = result.rows[0];

    await createAuditLog({
      userId: auth.token?.sub as string | undefined,
      userRole: auth.token?.role as string | undefined,
      entity: 'contas_corretora',
      entityId: id,
      action: 'UPDATE',
      beforeData,
      afterData: updated,
      ipAddress: req.headers.get('x-forwarded-for') ?? req.headers.get('host') ?? null,
      userAgent: req.headers.get('user-agent') ?? null,
    });

    return jsonResponse(updated, 200);
  } catch (error) {
    console.error('Erro ao atualizar conta:', error);
    return errorResponse('Erro ao atualizar conta', 500);
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const auth = await requireAuth(req, ['ADMIN']);
  if (!auth.authorized) return auth.response!;

  try {
    const existing = await pool.query(`SELECT * FROM contas_corretora WHERE id = $1`, [id]);
    if (existing.rowCount === 0) {
      return errorResponse('Conta não encontrada', 404);
    }

    await pool.query(`DELETE FROM contas_corretora WHERE id = $1`, [id]);

    await createAuditLog({
      userId: auth.token?.sub as string | undefined,
      userRole: auth.token?.role as string | undefined,
      entity: 'contas_corretora',
      entityId: id,
      action: 'DELETE',
      beforeData: existing.rows[0],
      afterData: null,
      ipAddress: req.headers.get('x-forwarded-for') ?? req.headers.get('host') ?? null,
      userAgent: req.headers.get('user-agent') ?? null,
    });

    return jsonResponse({ message: 'Conta excluída' }, 204);
  } catch (error) {
    console.error('Erro ao excluir conta:', error);
    return errorResponse('Erro ao excluir conta', 500);
  }
}
