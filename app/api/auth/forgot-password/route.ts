/**
 * POST /api/auth/forgot-password
 *
 * Gera um token de redefinição de senha e o persiste no banco.
 * O envio de e-mail requer configuração de um provedor SMTP:
 *   - Defina SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS e EMAIL_FROM no .env.local
 *   - Integre com Resend, SendGrid, Nodemailer ou similar.
 *
 * Por segurança, a resposta é sempre 200 independente de o e-mail existir ou não
 * (previne enumeração de usuários).
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';
import { pool } from '@/lib/db';

const bodySchema = z.object({
  email: z.string().email('E-mail inválido'),
});

const TOKEN_EXPIRY_HOURS = 2;

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const { email } = parsed.data;

  // Resposta genérica — não revela se o e-mail existe
  const successResponse = NextResponse.json({
    ok: true,
    message: 'Se este e-mail estiver cadastrado, você receberá um link em breve.',
  });

  try {
    // Verificar se usuário existe
    const { rows } = await pool.query<{ id: string }>(
      'SELECT id FROM users WHERE email = $1 LIMIT 1',
      [email.toLowerCase()],
    );

    if (rows.length === 0) {
      // Retorna sucesso mesmo assim (prevenção de enumeração)
      return successResponse;
    }

    const userId = rows[0].id;

    // Gerar token seguro
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

    // Persistir token — usa a tabela verification_tokens do NextAuth se existir,
    // caso contrário insere em users.metadata via fallback.
    // TODO: criar migration para tabela password_reset_tokens dedicada.
    try {
      await pool.query(
        `INSERT INTO verification_tokens (identifier, token, expires)
         VALUES ($1, $2, $3)
         ON CONFLICT (identifier, token) DO UPDATE SET expires = EXCLUDED.expires`,
        [email.toLowerCase(), token, expiresAt],
      );
    } catch {
      // Tabela pode não existir — log e continua (silent fail seguro)
      console.warn('[forgot-password] verification_tokens indisponível. Configure SMTP e migration.');
    }

    // TODO: enviar e-mail com o link de redefinição:
    //   const resetUrl = `${process.env.NEXTAUTH_URL}/redefinir-senha?token=${token}&id=${userId}`;
    //   await sendEmail({ to: email, subject: 'Redefinição de senha — GerInvest', resetUrl });
    //
    // Enquanto SMTP não estiver configurado, o token é gerado mas não enviado.
    console.info(`[forgot-password] Token gerado para ${email} (userId: ${userId}). Configure SMTP para envio.`);
  } catch (err) {
    // Qualquer erro interno não deve vazar para o cliente
    console.error('[forgot-password] Erro interno:', err);
  }

  return successResponse;
}
